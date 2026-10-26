import type { Metadata } from "next";
import { ProductCatalog } from "@/features/catalog/components/product-catalog";
import { getProducts } from "@/features/catalog/server/product-repository";
export const metadata: Metadata = { title: "ผลิตภัณฑ์ทั้งหมด" };
export default async function ProductsPage() {
  return (
    <main id="main-content">
      <ProductCatalog products={await getProducts()} full />
    </main>
  );
}
