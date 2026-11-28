"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { useReturnState } from "@/features/site/history/return-state";
import { quoteModelKey, type QuoteProduct } from "@/features/catalog/data/quotation";
import { QuoteSelectionLink } from "@/features/catalog/components/quote-selection-link";
import styles from "./weighing-builder.module.css";

const pageSize = 24;

export function ScaleSpecBuilder({ products }: { products: QuoteProduct[] }) {
  const [category, setCategory] = useState("scales");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(pageSize);
  const [selection, setSelection] = useReturnState<string[]>("scale-spec-builder.selection", []);
  const selected = products.filter(({ id }) => selection.includes(id));
  const selectedNames = new Set(selected.map(({ name }) => quoteModelKey(name)));
  const search = quoteModelKey(query);
  const matches = products.filter(
    ({ categoryId, id, name }) =>
      categoryId === category && quoteModelKey(`${name} ${id}`).includes(search),
  );

  function setSelected(id: string, enabled: boolean) {
    setSelection((current) => {
      if (!enabled) return current.filter((item) => item !== id);
      return current.includes(id) ? current : [...current, id];
    });
  }

  return (
    <div className={styles.layout}>
      <aside
        id="scale-quote-selection"
        aria-labelledby="scale-quote-selection-title"
        tabIndex={-1}
        className={styles.sidebar}
      >
        <h2 id="scale-quote-selection-title">สินค้าที่เลือก</h2>
        <p aria-live="polite">{selected.length} รายการ</p>
        <ul className={styles.steps}>
          {selected.map(({ id, name }) => (
            <li key={id} className={styles.slot}>
              <button
                type="button"
                className={styles.category}
                onClick={() => setSelected(id, false)}
                aria-label={`นำ ${id} ออกจากรายการ`}
              >
                {name} ×
              </button>
            </li>
          ))}
        </ul>
        <div className={styles.selection}>
          {selected.length ? (
            <QuoteSelectionLink models={selected.map(({ id }) => id)} className={styles.quoteLink}>
              ไปที่ใบเสนอราคา
            </QuoteSelectionLink>
          ) : (
            <button type="button" className={styles.quoteLink} disabled>
              ไปที่ใบเสนอราคา
            </button>
          )}
        </div>
      </aside>
      <section aria-labelledby="scale-quote-list-title">
        <div className={styles.toolbar}>
          <h2 id="scale-quote-list-title">เลือกรุ่นสินค้า</h2>
          <div className={styles.fields}>
            <label className={styles.search}>
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                aria-label="ค้นหาชื่อรุ่นหรือ SKU"
                placeholder="ค้นหาชื่อรุ่นหรือ SKU"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setLimit(pageSize);
                }}
              />
            </label>
            <select
              aria-label="ประเภทสินค้า"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setQuery("");
                setLimit(pageSize);
              }}
            >
              <option value="scales">เครื่องชั่ง</option>
              <option value="accessories">อุปกรณ์เสริม</option>
            </select>
          </div>
          {selected.length > 0 && (
            <a href="#scale-quote-selection" className={styles.guideLink}>
              ดูรายการที่เลือก
            </a>
          )}
        </div>
        <p className={styles.count} aria-live="polite">
          {matches.length} รุ่น
        </p>
        {matches.length === 0 && <p>ไม่พบสินค้าที่ตรงกับการค้นหา</p>}
        <div className={styles.cards}>
          {matches.slice(0, limit).map(({ id, name, image, fallbackImage }) => {
            const active = selection.includes(id);
            return (
              <article key={id}>
                <div className={styles.photo}>
                  <ProductImage
                    src={image}
                    fallbackSrc={fallbackImage}
                    placeholder="product"
                    alt=""
                    fill
                    sizes="(max-width: 600px) 90vw, 220px"
                  />
                </div>
                <div className={styles.copy}>
                  <h3>{name}</h3>
                  <p>{id}</p>
                </div>
                <button
                  type="button"
                  aria-label={`เลือก ${id}`}
                  aria-pressed={active}
                  disabled={!active && selectedNames.has(quoteModelKey(name))}
                  onClick={() => setSelected(id, !active)}
                >
                  {active ? "เลือกแล้ว" : "เลือกสินค้า"}
                </button>
              </article>
            );
          })}
        </div>
        {matches.length > limit && (
          <button
            type="button"
            className="button button-outline"
            onClick={() => setLimit((current) => current + pageSize)}
          >
            ดูรุ่นเพิ่มเติม
          </button>
        )}
      </section>
    </div>
  );
}
