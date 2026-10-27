"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus, X } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";

export type CategoryFeatureItem = {
  id: string;
  label: string;
  title: string;
  description: string;
  image: string;
  href?: string;
};

export function CategoryFeaturePanels({
  overviewImage,
  items,
  linkLabel,
}: {
  overviewImage: string;
  items: CategoryFeatureItem[];
  linkLabel: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  return (
    <section
      id="product-experience"
      className="category-feature"
      aria-label="สำรวจผลิตภัณฑ์และโซลูชัน Sunford"
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch" && !event.currentTarget.querySelector(":focus-visible"))
          setActive(null);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActive(null);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setActive(null);
      }}
    >
      <div className="category-feature-backdrops" aria-hidden="true">
        <div className="category-feature-image is-base">
          <ProductImage src={overviewImage} alt="" fill sizes="100vw" />
        </div>
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`category-feature-image ${active === index ? "is-active" : ""}`}
          >
            <ProductImage src={item.image} alt="" fill sizes="100vw" />
          </div>
        ))}
      </div>
      <div className="category-feature-grid">
        {items.map((item, index) => {
          const expanded = active === index;
          return (
            <article
              key={item.id}
              className={`category-feature-panel ${expanded ? "is-active" : ""}`}
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch") setActive(index);
              }}
              onFocusCapture={(event) => {
                if (event.target instanceof HTMLElement && event.target.matches(":focus-visible"))
                  setActive(index);
              }}
            >
              <h2 className="category-feature-heading">
                <button
                  type="button"
                  className="category-feature-trigger"
                  aria-label={`สำรวจ ${item.title}`}
                  aria-expanded={expanded}
                  aria-controls={`category-detail-${item.id}`}
                  onClick={() => setActive(index)}
                >
                  <span>{item.label}</span>
                  <Plus size={20} strokeWidth={1.4} aria-hidden="true" />
                </button>
              </h2>
              <div
                id={`category-detail-${item.id}`}
                className="category-feature-content"
                aria-hidden={!expanded}
                inert={!expanded}
              >
                <button
                  type="button"
                  className="category-feature-close"
                  onClick={() => setActive(null)}
                  aria-label={`ปิดรายละเอียด ${item.title}`}
                >
                  <X size={17} />
                </button>
                <p className="category-feature-eyebrow">SUNFORD</p>
                <h3>{item.title}</h3>
                <p className="category-feature-description">{item.description}</p>
                {item.href && (
                  <Link className="category-feature-link" href={item.href}>
                    {linkLabel} <ArrowUpRight size={16} />
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
