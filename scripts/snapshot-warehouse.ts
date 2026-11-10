import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import {
  parseWarehouseProducts,
  isPublicWarehouseSku,
} from "../src/features/catalog/data/warehouse-products";

const root = process.cwd();
const target = path.join(root, "data/warehouse/products.json");
const imageDir = path.join(root, "public/images/warehouse-cache");
const formats: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const hash = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

async function capture() {
  loadEnvConfig(root, true);
  const endpoint = new URL("/api/store/products", process.env.WAREHOUSE_API_URL);
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(20000), redirect: "error" });
  if (!response.ok) throw Error("Cannot read Warehouse catalog");
  const feed = parseWarehouseProducts(await response.json());
  if (!feed.items.length) throw Error("Empty feed: snapshot left intact");
  await mkdir(imageDir, { recursive: true });
  await mkdir(path.dirname(target), { recursive: true });
  const images: Record<string, string> = Object.create(null);
  const files = new Set(await readdir(imageDir));
  const queue = feed.items.filter((item) => item.image_url && isPublicWarehouseSku(item.sku));
  async function worker() {
    for (let item = queue.shift(); item; item = queue.shift()) {
      const url = new URL(item.image_url!, endpoint);
      if (
        url.origin !== endpoint.origin ||
        url.pathname !== "/api/store/products/image" ||
        url.username ||
        url.password
      )
        throw Error("Unexpected image source for SKU " + item.sku);
      const image = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(30000) });
      const ext = formats[image.headers.get("content-type")?.split(";")[0].toLowerCase() ?? ""];
      if (!image.ok || !ext) throw Error("Cannot save Warehouse image for " + item.sku);
      const bytes = Buffer.from(await image.arrayBuffer());
      if (!bytes.length || bytes.length > 10 * 1024 * 1024)
        throw Error("Invalid image size for " + item.sku);
      const filename = hash(bytes) + "." + ext;
      if (!files.has(filename)) {
        files.add(filename);
        await writeFile(path.join(imageDir, filename), bytes);
      }
      images[item.sku] = "/images/warehouse-cache/" + filename;
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  const data = {
    capturedAt: new Date().toISOString(),
    total_count: feed.total_count,
    items: feed.items.map((item) => ({
      ...item,
      image_url: item.image_url
        ? new URL(item.image_url, endpoint).pathname + new URL(item.image_url, endpoint).search
        : null,
      localImage: images[item.sku] ?? null,
    })),
  };
  const temp = target + "." + randomUUID() + ".tmp";
  await writeFile(temp, JSON.stringify(data, null, 2) + "\n");
  JSON.parse(await readFile(temp, "utf8"));
  await rename(temp, target);
  console.log(
    "Saved",
    feed.total_count,
    "SKUs and",
    Object.keys(images).length,
    "image references",
  );
}
capture().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
