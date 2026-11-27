import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { HeroSettings } from "@/features/site/types";
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
  showAnnouncement = true,
}: {
  description?: ReactNode;
  settings: Omit<HeroSettings, "slides">;
  showAnnouncement?: boolean;
}) {
  return (
    <>
      {showAnnouncement && <HeroAnnouncement settings={settings} />}
      <HeroScene description={description} showAnnouncement={showAnnouncement} />
    </>
  );
}
