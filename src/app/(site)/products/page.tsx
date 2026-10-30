import type { Metadata } from "next";
import { ProductBrowser } from "@/features/catalog/components/product-browser";
import { getProducts } from "@/features/catalog/server/product-repository";
import { getCatalogPage } from "@/features/catalog/server/catalog-page";
import { getClientProducts } from "@/features/catalog/server/client-products";
export const metadata: Metadata = { title: "ผลิตภัณฑ์ทั้งหมด" };
export default async function ProductsPage() {
  const products = await getProducts();
  const catalog = await getCatalogPage("/products", products);
  const productIds = new Set((catalog?.products ?? products).map((product) => product.id));
  const clientProducts = (await getClientProducts()).filter((product) =>
    productIds.has(product.id),
  );
  return (
    <main id="main-content">
      <ProductBrowser products={clientProducts} scope={catalog?.scope} />
    </main>
  );
}
