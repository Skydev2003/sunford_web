import { Suspense, type ReactNode } from "react";
import { SiteHeader } from "./site-header";
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

export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <CatalogRouteFrame
      className={styles.surface}
      header={<SiteHeader />}
      footer={<Footer />}
      overlays={
        <Suspense fallback={null}>
          <Overlays />
        </Suspense>
      }
    >
      {children}
    </CatalogRouteFrame>
  );
}
