import { isPublicWarehouseSku } from "@/features/catalog/data/warehouse-products";
import { getOfficialProducts, savedWarehouseImage } from "@/features/services/warehouse-product.server";

const maxImageBytes = 10 * 1024 * 1024;

export async function GET(_request: Request, { params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  if (!isPublicWarehouseSku(sku)) return new Response(null, { status: 404 });
  try {
    const item = (await getOfficialProducts()).items.find((item) => item.sku === sku);
    if (!item?.image_url) return new Response(null, { status: 404 });
    const localImage = savedWarehouseImage(item);
    if (localImage) return new Response(null, { status: 307, headers: { Location: localImage } });
    const origin = new URL(process.env.WAREHOUSE_API_URL!);
    const source = new URL(item.image_url, origin);
    const loopback = new Set(["localhost", "127.0.0.1", "[::1]"]);
    const sameLoopbackService =
      loopback.has(source.hostname) &&
      loopback.has(origin.hostname) &&
      source.protocol === origin.protocol &&
      source.port === origin.port;
    if (
      (source.origin !== origin.origin && !sameLoopbackService) ||
      source.pathname !== "/api/store/products/image" ||
      source.username ||
      source.password
    )
      return new Response(null, { status: 502 });
    const upstream = await fetch(new URL(source.pathname + source.search, origin), {
      redirect: "error",
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 60 },
    });
    const contentType = upstream.headers.get("content-type") ?? "";
    if (!upstream.ok || !/^image\/(png|jpeg|webp|gif|avif)(;|$)/i.test(contentType))
      return new Response(null, { status: 502 });
    if (Number(upstream.headers.get("content-length")) > maxImageBytes)
      return new Response(null, { status: 502 });
    const reader = upstream.body?.getReader();
    if (!reader) return new Response(null, { status: 502 });
    const chunks: Uint8Array[] = [];
    let length = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxImageBytes) {
        await reader.cancel();
        return new Response(null, { status: 502 });
      }
      chunks.push(value);
    }
    const image = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      image.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new Response(image, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
