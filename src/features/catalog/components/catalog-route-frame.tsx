"use client";

import { createContext, Fragment, useContext, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useStaggerBounce } from "@/components/ui/use-stagger-bounce";
import styles from "./products-overview.module.css";

const OverlayHostContext = createContext<(host: HTMLDivElement | null) => void>(() => {});
export const useCatalogOverlayHost = () => useContext(OverlayHostContext);

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
  useStaggerBounce(root, pathname);
  const productsPage =
    pathname === "/products" ||
    pathname === "/products/category/scales" ||
    pathname === "/products/category/indicators" ||
    pathname === "/products/category/platforms" ||
    pathname === "/products/category/pos" ||
    pathname === "/products/category/accessories";
  const [overlayHost, setOverlayHost] = useState<HTMLDivElement | null>(null);
  return (
    <OverlayHostContext.Provider value={setOverlayHost}>
      <div
        ref={root}
        className={productsPage ? styles.routeSurface : className}
        data-home-route={pathname === "/" || undefined}
        data-page-surface={pathname === "/service" ? "paper" : undefined}
      >
        <a href="#main-content" className="skip-link">
          ข้ามไปยังเนื้อหา
        </a>
        {!productsPage && header}
        {children}
        {!productsPage && <Fragment key={pathname}>{footer}</Fragment>}
        {productsPage && overlayHost ? createPortal(overlays, overlayHost) : overlays}
      </div>
    </OverlayHostContext.Provider>
  );
}
