"use client";
import { useCategories } from "@/features/cms/components/categories-provider";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { type CatalogProduct } from "../types";
import { useCatalogStore } from "@/stores/catalog-store";
import { ProductCard } from "./product-card";
import { useState } from "react";
import { catalogDefaults } from "@/features/cms/data/settings";

export function ProductCatalog({
  products,
  full = false,
  heading,
  scoped = false,
  headingLevel,
  categoryLabel,
  copy = catalogDefaults,
}: {
  products: CatalogProduct[];
  full?: boolean;
  heading?: string;
  scoped?: boolean;
  headingLevel?: "h1" | "h2";
  categoryLabel?: string;
  copy?: typeof catalogDefaults;
}) {
  const categories = useCategories();
  const category = useCatalogStore((s) => s.category);
  const catalogueQuery = useCatalogStore((s) => s.query);
  const setCategory = useCatalogStore((s) => s.setCategory);
  const setCatalogueQuery = useCatalogStore((s) => s.setQuery);
  const [scopedQuery, setScopedQuery] = useState("");
  const query = scoped ? scopedQuery : catalogueQuery;
  const setQuery = scoped ? setScopedQuery : setCatalogueQuery;
  const filtered = products.filter(
    (p) =>
      (scoped || category === "all" || p.category === category) &&
      `${p.warehouseSku ?? ""} ${p.name} ${p.subtitle} ${p.description}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  const matching =
    !full && category === "all" && !query
      ? filtered.filter((p) => p.featured).slice(0, 3)
      : filtered;
  const filterKey = `${category}:${query}`;
  const [pagination, setPagination] = useState({ key: filterKey, limit: 24 });
  const limit = pagination.key === filterKey ? pagination.limit : 24;
  const visible = matching.slice(0, limit);
  const Heading = headingLevel ?? (full && !scoped ? "h1" : "h2");
  return (
    <section id="products" className={`catalog-section container ${full ? "full-catalog" : ""}`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <Heading>
            {full ? (
              (heading ?? "ผลิตภัณฑ์ทั้งหมด")
            ) : (
              <>
                {copy.title}
                <span className="muted">{copy.accent}</span>
              </>
            )}
          </Heading>
        </div>
        {!full && (
          <Link href={copy.href} className="text-link">
            {copy.linkLabel} <ArrowRight size={17} />
          </Link>
        )}
      </div>
      <div className="catalog-toolbar">
        {!scoped && (
          <div className="category-tabs" aria-label="กรองหมวดหมู่สินค้า">
            {categories.map((c) => (
              <button
                key={c.id}
                className={category === c.id ? "active" : ""}
                onClick={() => setCategory(c.id)}
                aria-pressed={category === c.id}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
        {full ? (
          <label className="catalog-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหารุ่นสินค้า"
              aria-label="ค้นหารุ่นสินค้า"
            />
          </label>
        ) : null}
      </div>
      {full && (
        <p className="catalog-result-count" aria-live="polite">
          {filtered.length} ผลิตภัณฑ์
        </p>
      )}
      <div className="product-grid" aria-live="polite">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} categoryLabel={categoryLabel} />
        ))}
      </div>
      {matching.length > visible.length && (
        <div className="catalog-load-more">
          <button
            className="button button-outline"
            onClick={() => setPagination({ key: filterKey, limit: limit + 24 })}
          >
            ดูเพิ่มเติม ({visible.length} / {matching.length})
          </button>
        </div>
      )}
      {!visible.length && (
        <div className="empty-state">
          <Search size={30} />
          <h3>ยังไม่พบสินค้าที่คุณค้นหา</h3>
          <p>ลองค้นหาชื่อรุ่นอื่น หรือเลือกดูสินค้าทั้งหมด</p>
          <button
            className="button button-red"
            onClick={() => {
              setCategory("all");
              setQuery("");
            }}
          >
            ดูสินค้าทั้งหมด
          </button>
        </div>
      )}
      <p className="catalog-note">
        {copy.note} <span>{copy.noteDetail}</span>
      </p>
    </section>
  );
}
