"use client";

import {
  createContext,
  Fragment,
  Suspense,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useStaggerBounce } from "@/components/ui/use-stagger-bounce";
import { isCatalogOverviewPath } from "@/features/site/data/catalog-overview-path";
import { useHistoryRestoration } from "@/features/site/history/return-state";

const OverlayHostContext = createContext<(host: HTMLDivElement | null) => void>(() => {});
export const useCatalogOverlayHost = () => useContext(OverlayHostContext);

const subcategoryPath =
  /^(\/products\/category\/(?:scales|indicators|platforms|pos|accessories)\/)(?!applications\/?$)[^/]+\/?$/;

export function CatalogRouteFrame({
  className,
  header,
  footer,
  overlays,
  children,
}: {
  className: string;
  header: ReactNode;
  footer: ReactNode;
  overlays: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  useHistoryRestoration(root);
  // Sibling listings are filter changes within the same opening animation.
  const listingFamily = pathname.match(subcategoryPath)?.[1];
  useStaggerBounce(root, listingFamily ?? pathname);
  const homePage = pathname === "/";
  const servicePage = pathname === "/service";
  const streamSiteChrome = homePage || servicePage;
  const productsPage = isCatalogOverviewPath(pathname);
  const [overlayHost, setOverlayHost] = useState<HTMLDivElement | null>(null);
  return (
    <OverlayHostContext.Provider value={setOverlayHost}>
      <div
        ref={root}
        className={className}
        data-home-route={homePage || undefined}
        data-page-surface={servicePage ? "paper" : undefined}
      >
        <a href="#main-content" className="skip-link">
          ข้ามไปยังเนื้อหา
        </a>
        {streamSiteChrome ? (
          <Suspense
            fallback={
              homePage ? null : (
                <div aria-hidden="true" style={{ height: "var(--site-header-height)" }} />
              )
            }
          >
            {header}
          </Suspense>
        ) : (
          header
        )}
        {children}
        <Fragment key={listingFamily ?? pathname}>
          {streamSiteChrome ? <Suspense fallback={null}>{footer}</Suspense> : footer}
        </Fragment>
        {productsPage && overlayHost ? createPortal(overlays, overlayHost) : overlays}
      </div>
    </OverlayHostContext.Provider>
  );
}
