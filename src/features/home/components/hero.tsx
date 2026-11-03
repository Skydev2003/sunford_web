"use client";

import { useCallback, useState } from "react";
import { ChevronRight } from "lucide-react";
import type { HeroSettings, SiteSettings } from "@/features/cms/types";
import { BrandOpening } from "./brand-opening";
import { HeroScene } from "./hero-scene";

export function HeroAnnouncement({ settings }: { settings: Omit<HeroSettings, "slides"> }) {
  return (
    <div className="announcement">
      <span>{settings.announcement}</span>
      <a href={settings.announcementHref}>
        {settings.announcementLabel} <ChevronRight size={14} />
      </a>
    </div>
  );
}

export function Hero({
  description,
  settings,
  brand,
  showAnnouncement = true,
}: {
  description?: string;
  settings: Omit<HeroSettings, "slides">;
  brand: Pick<SiteSettings, "logo" | "name">;
  showAnnouncement?: boolean;
}) {
  const [opening, setOpening] = useState(true);
  const revealOpening = useCallback(() => setOpening(false), []);
  return (
    <>
      <BrandOpening logo={brand.logo} name={brand.name} onReveal={revealOpening} />
      {showAnnouncement && <HeroAnnouncement settings={settings} />}
      <HeroScene description={description} opening={opening} showAnnouncement={showAnnouncement} />
    </>
  );
}
