"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import type { CategoryFeatureEntry } from "../data/category-feature-items";
import { CategoryFeatureIcon, type CategoryFeatureCategory } from "./category-feature-icons";

export type CategoryFeatureItem = {
  id: CategoryFeatureCategory;
  title: string;
  description: string;
  image: string;
  companionImage?: string;
  entries: CategoryFeatureEntry[];
};

export function CategoryFeaturePanels({ items }: { items: CategoryFeatureItem[] }) {
  const [active, setActive] = useState(0);
  const selected = items[active] ?? items[0];
  if (!selected) return null;
  // Fill a wide belt even for a small category, using its own real entries.
  const beltItems = selected.entries.length
    ? Array.from(
        { length: Math.max(1, Math.ceil(20 / selected.entries.length)) },
        () => selected.entries,
      ).flat()
    : [];

  return (
    <section
      id="product-experience"
      className="category-feature"
      aria-labelledby="category-feature-title"
    >
      <div className="category-feature-inner">
        <h2 id="category-feature-title">
          เลือก <span>หมวดหมู่สินค้า</span>
        </h2>
        <div className="category-feature-layout">
          <div
            id="category-feature-media"
            className="category-feature-media"
            data-category={selected.id}
            role="region"
            aria-label={selected.title}
          >
            {selected.companionImage ? (
              <div className="category-feature-accessories" key={selected.id}>
                <div className="category-feature-pole">
                  <ProductImage
                    src={selected.companionImage}
                    alt="ไฟสัญญาณสามสี SUNFORD RYG-POLE"
                    fill
                    sizes="(min-width: 992px) 18vw, 32vw"
                  />
                </div>
                <div className="category-feature-printer">
                  <ProductImage
                    src={selected.image}
                    alt={selected.title}
                    fill
                    sizes="(min-width: 992px) 32vw, 56vw"
                  />
                </div>
              </div>
            ) : (
              <ProductImage
                key={selected.id}
                src={selected.image}
                alt={selected.title}
                fill
                sizes="(min-width: 1600px) 900px, (min-width: 992px) 55vw, 100vw"
              />
            )}
          </div>
          <div className="category-feature-choices">
            <p className="category-feature-intro">
              เลือกผลิตภัณฑ์และโซลูชัน SUNFORD ที่เหมาะกับการใช้งานของคุณ
            </p>
            <div className="category-feature-grid" aria-label="หมวดหมู่สินค้า SUNFORD">
              {items.map((item, index) => (
                <article
                  key={item.id}
                  className={`category-feature-panel ${active === index ? "is-active" : ""}`}
                >
                  <button
                    type="button"
                    className="category-feature-trigger"
                    aria-label={`สำรวจ ${item.title}`}
                    aria-pressed={active === index}
                    aria-controls="category-feature-media"
                    onClick={() => setActive(index)}
                  >
                    <span className="category-feature-card-heading">
                      <span className="category-feature-icon" aria-hidden="true">
                        <CategoryFeatureIcon category={item.id} />
                      </span>
                      <span>{item.title}</span>
                    </span>
                    <span className="category-feature-description">{item.description}</span>
                  </button>
                </article>
              ))}
            </div>
          </div>
        </div>
        {beltItems.length > 0 && (
          <div className="category-feature-products">
            <p className="category-feature-belt-label" id="category-feature-belt-label">
              <span>สินค้าและโซลูชัน</span> ในหมวดนี้
            </p>
            <div className="category-feature-belt" aria-labelledby="category-feature-belt-label">
              <div
                className="category-feature-track"
                style={{ animationDuration: `${beltItems.length * 2}s` }}
              >
                {[0, 1, 2].flatMap((copy) =>
                  beltItems.map((entry, index) => {
                    const duplicate = copy > 0 || index >= selected.entries.length;
                    return (
                      <Link
                        key={`${copy}-${index}-${entry.id}`}
                        className={`category-feature-product${duplicate ? " is-duplicate" : ""}`}
                        href={entry.href}
                        prefetch={false}
                        aria-label={duplicate ? undefined : entry.title}
                        aria-hidden={duplicate || undefined}
                        tabIndex={duplicate ? -1 : undefined}
                        title={entry.title}
                        data-product-id={entry.id}
                      >
                        <ProductImage
                          src={entry.image}
                          alt=""
                          width={70}
                          height={70}
                          sizes="70px"
                        />
                      </Link>
                    );
                  }),
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
