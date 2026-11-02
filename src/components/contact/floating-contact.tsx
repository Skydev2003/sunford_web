"use client";
import type { SiteSettings } from "@/features/cms/types";
import { SunfordMascot } from "./sunford-mascot";
export function FloatingContact(props: {
  site: SiteSettings;
  expertLabel: string;
  expertHref: string;
}) {
  return <SunfordMascot {...props} />;
}
