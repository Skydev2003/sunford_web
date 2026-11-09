"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
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
      <div className={productsPage ? styles.routeSurface : className}>
        <a href="#main-content" className="skip-link">
          ข้ามไปยังเนื้อหา
        </a>
        {!productsPage && header}
        {children}
        {!productsPage && footer}
        {productsPage && overlayHost ? createPortal(overlays, overlayHost) : overlays}
      </div>
    </OverlayHostContext.Provider>
  );
}
