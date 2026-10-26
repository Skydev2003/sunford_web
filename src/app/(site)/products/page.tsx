import type { Metadata } from "next";
import { ProductStorefront } from "@/features/catalog/components/product-storefront";
import { getProducts } from "@/features/catalog/server/product-repository";
import { getContentPage } from "@/features/content/server/content-repository";
export const metadata: Metadata = { title: "ผลิตภัณฑ์ทั้งหมด" };
export default async function ProductsPage() {
  return (
    <ProductStorefront
      products={await getProducts()}
      contactImage={(await getContentPage("/contact-us"))?.images[0]}
      softwareImage={(await getContentPage("/applications-and-softwares"))?.images[1]}
    />
  );
}
