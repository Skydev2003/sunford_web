import { createHash, createHmac } from "node:crypto";

const sha = (value: string) => createHash("sha256").update(value).digest("hex");
const hmac = (key: string | Buffer, value: string) =>
  createHmac("sha256", key).update(value).digest();
const encode = (value: string) =>
  encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
  );
const types = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const limit = 10 * 1024 * 1024;

export async function readWarehouseStorageImage(objectKey: string) {
  const {
    WAREHOUSE_S3_ENDPOINT: endpoint,
    WAREHOUSE_S3_BUCKET: bucket,
    WAREHOUSE_S3_REGION: region,
    WAREHOUSE_S3_KEY: accessKey,
    WAREHOUSE_S3_SECRET: secret,
  } = process.env;
  if (!endpoint || !bucket || !region || !accessKey || !secret)
    throw new Error("Configure Warehouse image storage");
  if (
    !objectKey.startsWith("master-item-images/") ||
    objectKey.split("/").some((p) => !p || p === "." || p === "..")
  )
    throw new Error("Invalid Warehouse image key");
  const url = new URL(endpoint);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash)
    throw new Error("Invalid Warehouse storage endpoint");
  const parts = url.pathname.split("/").filter(Boolean);
  if (!url.hostname.startsWith(bucket + ".") && parts[0] !== bucket) parts.push(bucket);
  const uri = "/" + [...parts, ...objectKey.split("/")].map(encode).join("/");
  url.pathname = uri;
  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const day = timestamp.slice(0, 8);
  const scope = `${day}/${region}/s3/aws4_request`;
  const payload = sha("");
  const canonicalHeaders = `host:${url.host}\nx-amz-content-sha256:${payload}\nx-amz-date:${timestamp}\n`;
  const signed = "host;x-amz-content-sha256;x-amz-date";
  const request = ["GET", uri, "", canonicalHeaders, signed, payload].join("\n");
  const signingKey = hmac(hmac(hmac(hmac("AWS4" + secret, day), region), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey)
    .update(["AWS4-HMAC-SHA256", timestamp, scope, sha(request)].join("\n"))
    .digest("hex");
  const response = await fetch(url, {
    method: "GET",
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
    headers: {
      host: url.host,
      "x-amz-content-sha256": payload,
      "x-amz-date": timestamp,
      authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signed}, Signature=${signature}`,
    },
  });
  const mime = response.headers.get("content-type")?.split(";")[0].toLowerCase() ?? "";
  if (
    !response.ok ||
    !types.has(mime) ||
    Number(response.headers.get("content-length")) > limit ||
    !response.body
  ) {
    await response.body?.cancel();
    throw new Error("Cannot read Warehouse image");
  }
  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new Error("Warehouse image exceeds size limit");
      chunks.push(Buffer.from(value));
    }
  } finally {
    await reader.cancel();
  }
  if (!size) throw new Error("Empty Warehouse image");
  return { bytes: Buffer.concat(chunks), mime };
}
