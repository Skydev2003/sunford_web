import { Suspense } from "react";
import { SiteHeader } from "@/features/site/components/site-header";
import { SiteLoading } from "@/features/site/components/site-loading";
import { Footer } from "@/components/layout/footer";
import styles from "@/components/layout/site-background.module.css";
import { CatalogOverlays } from "@/features/catalog/components/catalog-overlays";
import { getClientProducts } from "@/features/catalog/server/client-products";
import { getPageSearchIndex } from "@/features/content/server/content-repository";
import { CatalogRouteFrame } from "@/features/catalog/components/catalog-route-frame";
async function Overlays() {
  const [products, pages] = await Promise.all([getClientProducts(), getPageSearchIndex()]);
  return <CatalogOverlays products={products} pages={pages} />;
}
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const header = <SiteHeader />;
  const footer = <Footer />;
  const overlays = (
    <Suspense fallback={null}>
      <Overlays />
    </Suspense>
  );
  return (
    <Suspense fallback={<SiteLoading />}>
      <CatalogRouteFrame
        className={styles.surface}
        header={header}
        footer={footer}
        overlays={overlays}
      >
        {children}
      </CatalogRouteFrame>
    </Suspense>
  );
}
