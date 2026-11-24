"use client";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import { isContactSection } from "@/features/content/data/contact-route";
import { isCatalogOverviewPath } from "@/features/site/data/catalog-overview-path";
import { subscribeReturnOrigin } from "@/features/site/history/return-state";

export function ContactBannerVisibility({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const contactSelected = useSyncExternalStore(
    subscribeReturnOrigin,
    () => isContactSection(window.location),
    () => false,
  );
  return pathname === "/" ||
    contactSelected ||
    pathname === "/about-us" ||
    isCatalogOverviewPath(pathname)
    ? null
    : children;
}
