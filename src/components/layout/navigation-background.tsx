"use client";

import type { HTMLAttributes } from "react";
import { useCatalogStore } from "@/stores/catalog-store";

export function NavigationBackground({
  as: Tag,
  ...props
}: HTMLAttributes<HTMLElement> & { as: "main" | "footer" }) {
  const navigationOpen = useCatalogStore((state) => state.navigationOpen);
  return <Tag {...props} data-navigation-background inert={navigationOpen || props.inert} />;
}
