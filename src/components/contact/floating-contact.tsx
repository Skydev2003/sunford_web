"use client";
import { useState } from "react";
import type { SiteSettings } from "@/features/cms/types";
import { SunfordMascot } from "./sunford-mascot";
export function FloatingContact(props: {
  site: SiteSettings;
  expertLabel: string;
  expertHref: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  return dismissed ? null : <SunfordMascot {...props} onDismiss={() => setDismissed(true)} />;
}
