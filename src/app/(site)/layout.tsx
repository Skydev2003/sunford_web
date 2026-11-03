import { Suspense } from "react";
import { SiteHeader } from "@/features/cms/components/site-header";
import { Footer } from "@/components/layout/footer";
import styles from "@/components/layout/site-background.module.css";
import { CatalogOverlays } from "@/features/catalog/components/catalog-overlays";
import { getClientProducts } from "@/features/catalog/server/client-products";
import { getPageSearchIndex } from "@/features/content/server/content-repository";
async function Overlays() {
  const [products, pages] = await Promise.all([getClientProducts(), getPageSearchIndex()]);
  return <CatalogOverlays products={products} pages={pages} />;
}
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.surface}>
      <a href="#main-content" className="skip-link">
        ข้ามไปยังเนื้อหา
      </a>
      <SiteHeader />
      {children}
      <Footer />
      <Suspense fallback={null}>
        <Overlays />
      </Suspense>
    </div>
  );
}
