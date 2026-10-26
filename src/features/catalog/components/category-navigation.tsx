"use client";
import { Monitor, Plug, Scale, ScanLine } from "lucide-react";
import { useCatalogStore } from "@/stores/catalog-store";
import { sunford } from "@/features/home/data/brand";

export function CategoryNavigation() {
  const setCategory = useCatalogStore((state) => state.setCategory);
  return (
    <nav className="category-navigation container" aria-label="กลุ่มผลิตภัณฑ์ Sunford">
      <div className="category-intro">
        <span>OUR PRODUCTS</span>
        <strong>ครบทุกงานชั่ง</strong>
      </div>
      <a href="#products" onClick={() => setCategory("all")}>
        <Scale size={27} strokeWidth={1.3} />
        <div>
          <strong>เครื่องชั่งดิจิทัล</strong>
          <span>Digital scale</span>
        </div>
      </a>
      <a href="#products" onClick={() => setCategory("smart")}>
        <ScanLine size={27} strokeWidth={1.3} />
        <div>
          <strong>เครื่องชั่งอัจฉริยะ</strong>
          <span>Smart scale</span>
        </div>
      </a>
      <a href={sunford.accessories}>
        <Plug size={27} strokeWidth={1.3} />
        <div>
          <strong>อุปกรณ์เสริม</strong>
          <span>Accessories</span>
        </div>
      </a>
      <a href={sunford.software}>
        <Monitor size={27} strokeWidth={1.3} />
        <div>
          <strong>แอปพลิเคชันและซอฟต์แวร์</strong>
          <span>Applications & software</span>
        </div>
      </a>
    </nav>
  );
}
