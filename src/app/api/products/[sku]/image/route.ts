import { isPublicWarehouseSku } from "@/features/catalog/data/warehouse-products";
import { savedWarehouseImage } from "@/features/services/warehouse-product.server";
import { readWarehouseImage, warehouseImageUrl } from "@/features/services/warehouse-postgres";
import { readWarehouseStorageImage } from "@/features/services/warehouse-storage";

export async function GET(_request: Request, { params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  if (!isPublicWarehouseSku(sku) || sku.length > 200) return new Response(null, { status: 404 });
  try {
    const item = await readWarehouseImage(sku);
    if (!item) return new Response(null, { status: 404 });
    const image = savedWarehouseImage({ sku, image_url: warehouseImageUrl(item) });
    if (image && !new URL(_request.url).searchParams.has("v"))
      return new Response(null, { status: 307, headers: { Location: image } });
    const { bytes, mime } = await readWarehouseStorageImage(item.image_object_key!);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
