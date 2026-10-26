import { Suspense } from "react";
import { SiteHeader } from "@/features/cms/components/site-header";
import { Footer } from "@/components/layout/footer";
import { CatalogOverlays } from "@/features/catalog/components/catalog-overlays";
import { getProducts } from "@/features/catalog/server/product-repository";
import { getPageSearchIndex } from "@/features/content/server/content-repository";
async function Overlays() {
  return <CatalogOverlays products={await getProducts()} pages={await getPageSearchIndex()} />;
}
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        ข้ามไปยังเนื้อหา
      </a>
      <SiteHeader />
      {children}
      <Footer />
      <Suspense fallback={null}>
        <Overlays />
      </Suspense>
    </>
  );
}
