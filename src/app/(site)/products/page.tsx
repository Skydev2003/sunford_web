import type { Metadata } from "next";
import { ProductBrowser } from "@/features/catalog/components/product-browser";
import { getProducts } from "@/features/catalog/server/product-repository";
import { getCatalogPage } from "@/features/catalog/server/catalog-page";
export const metadata: Metadata = { title: "ผลิตภัณฑ์ทั้งหมด" };
export default async function ProductsPage() {
  const products = await getProducts();
  const catalog = await getCatalogPage("/products", products);
  return (
    <main id="main-content">
      <ProductBrowser products={catalog?.products ?? products} scope={catalog?.scope} />
    </main>
  );
}
