import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { parsePublishedScales, selectScaleShowcase } from "@/features/catalog/data/scale-showcase";
import { readPublishedScaleShelf } from "@/features/services/warehouse-postgres";
import selection from "@/features/catalog/data/warehouse-storefront-selection.json";
import { getProductCategories } from "@/features/catalog/server/product-categories";
import { featuredScalesTag } from "@/features/catalog/server/featured-scale-shelf";

function checkRequest(request: Request) {
  const secret = process.env.FEATURED_SCALES_REVALIDATE_SECRET;
  if (process.env.FEATURED_SCALES_ENABLED !== "1" || !secret)
    return new Response(null, { status: 503 });
  const digest = (s: string) => createHash("sha256").update(s).digest();
  if (
    !timingSafeEqual(
      digest(request.headers.get("authorization") ?? ""),
      digest("Bearer " + secret),
    ) ||
    request.headers.get("x-warehouse-company") !== process.env.WAREHOUSE_COMPANY_ID
  )
    return new Response(null, { status: 403 });
}

export async function POST(request: Request) {
  const denied = checkRequest(request);
  if (denied) return denied;
  try {
    parsePublishedScales(await readPublishedScaleShelf());
  } catch {
    return new Response(null, { status: 503 });
  }
  revalidateTag(featuredScalesTag, "max");
  return new Response(null, { status: 204 });
}

// The admin receives the website's selected art, labels and colors. Drafts stay in Warehouse.
export async function GET(request: Request) {
  const denied = checkRequest(request);
  if (denied) return denied;
  try {
    const { products, categories } = await getProductCategories();
    const members = new Set(categories.find((c) => c.id === "scales")?.productIds);
    const modelNames = new Map(
      selection.companyId === process.env.WAREHOUSE_COMPANY_ID
        ? selection.items.map((row) => [row.sku, row.name] as const)
        : [],
    );
    const cards = selectScaleShowcase(products.filter((p) => members.has(p.id))).map((item) => ({
      sku: item.product.warehouseSku,
      name: item.product.name,
      group: item.label,
      photo: item.photo,
      model: modelNames.get(item.product.warehouseSku!) ?? item.product.name,
      name_width: item.lettering?.nameWidthEm,
      image_mode: item.imageMode,
      background: item.background.match(/#[a-f0-9]{6}/i)?.[0],
      surface: item.surface?.match(/#[a-f0-9]{6}/i)?.[0] ?? null,
      surface_height: Number(item.surface?.match(/(\d+)%/)?.[1] ?? 0),
      ink: item.lettering?.ink ?? "#202125",
    }));
    return Response.json(cards, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "โหลดตัวอย่างสินค้าไม่ได้" }, { status: 503 });
  }
}
