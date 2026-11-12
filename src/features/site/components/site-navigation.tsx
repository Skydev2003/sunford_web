"use client";

import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { Header } from "@/components/layout/header";
import { PrimaryNavigation } from "@/components/layout/primary-navigation";
import type { NavigationItem, SiteSettings } from "../types";

export function SiteNavigation({
  navigation,
  site,
  extras,
}: {
  navigation: NavigationItem[];
  site: SiteSettings;
  extras: ComponentProps<typeof Header>["extras"];
}) {
  const pathname = usePathname();
  return pathname === "/" ? (
    <Header items={navigation} site={site} extras={extras} />
  ) : (
    <PrimaryNavigation navigation={navigation} site={site} />
  );
}
