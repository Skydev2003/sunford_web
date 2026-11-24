"use client";

import type { HTMLAttributes } from "react";
import { usePathname } from "next/navigation";
import { isCatalogOverviewPath } from "@/features/site/data/catalog-overview-path";
import { useCatalogStore } from "@/stores/catalog-store";

export function NavigationBackground({
  as: Tag,
  ...props
}: HTMLAttributes<HTMLElement> & { as: "main" | "footer" | "section" }) {
  const navigationOpen = useCatalogStore((state) => state.navigationOpen);
  const pathname = usePathname();
  return (
    <Tag
      {...props}
      data-navigation-background
      data-products-footer={Tag === "footer" && isCatalogOverviewPath(pathname) ? "" : undefined}
      inert={navigationOpen || props.inert}
    />
  );
}
