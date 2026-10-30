import type { Metadata } from "next";
import { ProductStorefront } from "@/features/catalog/components/product-storefront";
import { getClientProducts } from "@/features/catalog/server/client-products";
import { getContentPage } from "@/features/content/server/content-repository";
export const metadata: Metadata = { title: "ผลิตภัณฑ์ทั้งหมด" };
export default async function ProductsPage() {
  return (
    <ProductStorefront
      products={await getClientProducts()}
      contactImage={(await getContentPage("/contact-us"))?.images[0]}
      softwareImage={(await getContentPage("/applications-and-softwares"))?.images[1]}
    />
  );
}
