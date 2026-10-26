import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CatalogOverlays } from "@/features/catalog/components/catalog-overlays";
import { getProducts } from "@/features/catalog/server/product-repository";
async function Overlays() {
  return <CatalogOverlays products={await getProducts()} />;
}
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        ข้ามไปยังเนื้อหา
      </a>
      <Header />
      {children}
      <Footer />
      <Suspense fallback={null}>
        <Overlays />
      </Suspense>
    </>
  );
}
