"use client";
import { ArrowUpRight, CookingPot, Factory, Monitor, ScanLine, Store } from "lucide-react";
import { categories } from "../types";
import { useCatalogStore } from "@/stores/catalog-store";
const icons = [Store, Factory, CookingPot, ScanLine, Monitor];

export function CategoryNavigation() {
  const setCategory = useCatalogStore((s) => s.setCategory);
  return (
    <div className="category-navigation container">
      <div className="category-intro">
        <span>FIND YOUR FIT</span>
        <strong>แม่นยำ ในแบบคุณ</strong>
      </div>
      {categories.slice(1).map((category, index) => {
        const Icon = icons[index];
        return (
          <a key={category.id} href="#products" onClick={() => setCategory(category.id)}>
            <Icon size={27} strokeWidth={1.2} />
            <div>
              <strong>{category.label}</strong>
              <span>{category.english}</span>
            </div>
            <ArrowUpRight className="category-arrow" size={14} />
          </a>
        );
      })}
    </div>
  );
}
