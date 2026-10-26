import { getProducts } from "@/features/catalog/server/product-repository";
export async function GET() {
  try {
    return Response.json({ products: await getProducts() });
  } catch {
    return Response.json({ error: "ไม่สามารถโหลดสินค้าได้ในขณะนี้" }, { status: 503 });
  }
}
