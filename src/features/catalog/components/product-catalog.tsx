"use client";
import Link from "next/link";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { categories, type Product } from "../types";
import { useCatalogStore } from "@/stores/catalog-store";
import { ProductCard } from "./product-card";

export function ProductCatalog({
  products,
  full = false,
}: {
  products: Product[];
  full?: boolean;
}) {
  const category = useCatalogStore((s) => s.category);
  const query = useCatalogStore((s) => s.query);
  const setCategory = useCatalogStore((s) => s.setCategory);
  const setQuery = useCatalogStore((s) => s.setQuery);
  const filtered = products.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      `${p.name} ${p.subtitle} ${p.description}`.toLowerCase().includes(query.toLowerCase().trim()),
  );
  const visible =
    !full && category === "all" && !query
      ? filtered.filter((p) => p.featured).slice(0, 3)
      : filtered;
  return (
    <section id="products" className={`catalog-section container ${full ? "full-catalog" : ""}`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">FIND YOUR NEXT STANDARD</p>
          <h2>
            {full ? (
              "ผลิตภัณฑ์ทั้งหมด"
            ) : (
              <>
                ออกแบบมาเพื่อ<span className="muted">ทุกความเป็นไปได้</span>
              </>
            )}
          </h2>
        </div>
        {!full && (
          <Link href="/products" className="text-link">
            สำรวจผลิตภัณฑ์ทั้งหมด <ArrowRight size={17} />
          </Link>
        )}
      </div>
      <div className="catalog-toolbar">
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
        ) : (
          <SlidersHorizontal className="filter-icon" size={18} />
        )}
      </div>
      <div className="product-grid" aria-live="polite">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
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
        เลือกสิ่งที่ใช่ได้ง่ายขึ้น <span>กด + บนสินค้าเพื่อเปรียบเทียบได้สูงสุด 3 รุ่น</span>
      </p>
    </section>
  );
}
