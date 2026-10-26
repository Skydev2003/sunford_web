"use client";
import { Monitor, Plug, Scale, ScanLine } from "lucide-react";
import { useCatalogStore } from "@/stores/catalog-store";
import { catalogDefaults } from "@/features/cms/data/settings";

export function CategoryNavigation({ copy = catalogDefaults }: { copy?: typeof catalogDefaults }) {
  const setCategory = useCatalogStore((state) => state.setCategory);
  return (
    <nav className="category-navigation container" aria-label="กลุ่มผลิตภัณฑ์ Sunford">
      <div className="category-intro">
        <span>{copy.navEyebrow}</span>
        <strong>{copy.navTitle}</strong>
      </div>
      <a href="#products" onClick={() => setCategory("all")}>
        <Scale size={27} strokeWidth={1.3} />
        <div>
          <strong>{copy.navDigital}</strong>
          <span>{copy.navDigitalEnglish}</span>
        </div>
      </a>
      <a href="#products" onClick={() => setCategory("smart")}>
        <ScanLine size={27} strokeWidth={1.3} />
        <div>
          <strong>{copy.navSmart}</strong>
          <span>{copy.navSmartEnglish}</span>
        </div>
      </a>
      <a href={copy.accessoriesHref}>
        <Plug size={27} strokeWidth={1.3} />
        <div>
          <strong>{copy.navAccessories}</strong>
          <span>{copy.navAccessoriesEnglish}</span>
        </div>
      </a>
      <a href={copy.softwareHref}>
        <Monitor size={27} strokeWidth={1.3} />
        <div>
          <strong>{copy.navSoftware}</strong>
          <span>{copy.navSoftwareEnglish}</span>
        </div>
      </a>
    </nav>
  );
}
