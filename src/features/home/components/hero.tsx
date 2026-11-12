import { ChevronRight } from "lucide-react";
import type { HeroSettings, SiteSettings } from "@/features/site/types";
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
  return (
    <>
      {showAnnouncement && <HeroAnnouncement settings={settings} />}
      <HeroScene
        description={description}
        showAnnouncement={showAnnouncement}
        logo={<BrandOpening logo={brand.logo} name={brand.name} />}
      />
    </>
  );
}
