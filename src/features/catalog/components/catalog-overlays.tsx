"use client";
import { Tooltip } from "@/components/ui/tooltip";
import { useCategories } from "@/features/site/components/categories-provider";
import { useEffect, useRef, useState } from "react";
import { ProductImage } from "@/components/ui/product-image";
import Link from "next/link";
import { ArrowRight, GitCompareArrows, Search, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useCatalogStore } from "@/stores/catalog-store";
import { type OverlayProduct } from "../types";
import type { SearchPage } from "@/features/content/types";
import { getCatalogComparisonRows } from "../data/catalog-decision-facts";
import styles from "./catalog-overlays.module.css";

export function CatalogOverlays({
  products,
  pages = [],
}: {
  products: OverlayProduct[];
  pages?: SearchPage[];
}) {
  const categories = useCategories();
  const searchOpen = useCatalogStore((s) => s.searchOpen);
  const compareOpen = useCatalogStore((s) => s.compareOpen);
  const compareMode = useCatalogStore((s) => s.compareMode);
  const ids = useCatalogStore((s) => s.compareIds);
  const setSearchOpen = useCatalogStore((s) => s.setSearchOpen);
  const setCompareOpen = useCatalogStore((s) => s.setCompareOpen);
  const clearCompare = useCatalogStore((s) => s.clearCompare);
  const toggleCompare = useCatalogStore((s) => s.toggleCompare);
  const [search, setSearch] = useState("");
  const comparisonTable = useRef<HTMLDivElement>(null);
  const finderSearch = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (compareOpen) {
      const finder = comparisonTable.current
        ?.closest("dialog")
        ?.parentElement?.closest("dialog[open]");
      finderSearch.current = finder?.querySelector<HTMLInputElement>("#catalog-search") ?? null;
    } else {
      finderSearch.current?.focus({ preventScroll: true });
      finderSearch.current = null;
    }
  }, [compareOpen]);
  const found = products.filter((p) =>
    `${p.warehouseSku ?? ""} ${p.name} ${p.warehouseName ?? ""} ${p.subtitle} ${p.description} ${categories.find((c) => c.id === p.category)?.label}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const selected = products.filter((p) => ids.includes(p.id));
  const comparisonRows = getCatalogComparisonRows(selected);
  const pageResults = search.trim()
    ? pages
        .filter((page) =>
          `${page.title} ${page.path}`.toLowerCase().includes(search.toLowerCase().trim()),
        )
        .slice(0, 20)
    : [];
  return (
    <>
      <Modal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="ค้นพบสิ่งที่ใช่สำหรับคุณ"
      >
        <label className="search-field">
          <Search size={22} />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อรุ่น หรือประเภทการใช้งาน"
            aria-label="ค้นหาสินค้า Sunford"
          />
          {search && (
            <Tooltip>
              <button
                aria-label="ล้างการค้นหา"
                className="icon-button"
                onClick={() => setSearch("")}
              >
                <X size={16} />
              </button>
            </Tooltip>
          )}
        </label>
        <p className="search-caption">
          {search ? `พบ ${found.length} ผลิตภัณฑ์` : "ผลิตภัณฑ์ของ Sunford"}
        </p>
        <div className="search-results">
          {found.slice(0, 40).map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} onClick={() => setSearchOpen(false)}>
              <ProductImage
                src={p.image}
                fallbackSrc={p.fallbackImage}
                alt={p.name}
                width={65}
                height={65}
              />
              <div>
                <strong>{p.name}</strong>
                <span>{p.subtitle}</span>
                {p.warehouseSku && p.price === null && <span>สอบถามราคา</span>}
              </div>
              <ArrowRight size={18} />
            </Link>
          ))}
          {pageResults.map((page) => (
            <Link key={page.path} href={page.path} onClick={() => setSearchOpen(false)}>
              <div>
                <strong>{page.title}</strong>
                <span>ข้อมูลและบริการ Sunford</span>
              </div>
              <ArrowRight size={18} />
            </Link>
          ))}
          {!found.length && !pageResults.length && (
            <p className="empty-state">ไม่พบสินค้า ลองค้นหา WPS, FEH หรือเครื่องชั่ง</p>
          )}
        </div>
      </Modal>
      {compareMode && (
        <div className="compare-bar">
          <div>
            <GitCompareArrows size={20} />
            <span>
              เปรียบเทียบสินค้า <strong aria-live="polite">{selected.length}/3</strong>
            </span>
          </div>
          <button
            onClick={() => setCompareOpen(true)}
            className="button button-red"
            disabled={!selected.length}
          >
            ดูการเปรียบเทียบ <ArrowRight size={15} />
          </button>
          <Tooltip>
            <button
              className="icon-button"
              aria-label={selected.length ? "ล้างรายการเปรียบเทียบ" : "ยกเลิกการเปรียบเทียบ"}
              onClick={clearCompare}
            >
              <X size={18} />
            </button>
          </Tooltip>
        </div>
      )}
      <Modal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        title="เปรียบเทียบสินค้า"
        wide
      >
        {selected.length ? (
          <>
            <p className={styles.selectionSummary}>
              เลือกไว้ {selected.length} รุ่น
              {selected.length > 1 && (
                <span className={styles.scrollHint}>เลื่อนตารางไปด้านข้างเพื่อดูรุ่นอื่น</span>
              )}
            </p>
            <p className="compare-hint">
              แถวที่ระบุ “ข้อมูลต่างกัน” ช่วยให้เห็นจุดต่างของข้อมูลที่มีครบทุกรุ่น ส่วน —
              หมายถึงยังไม่มีข้อมูลในแคตตาล็อก
              <br />
              กรุณายืนยันสเปกล่าสุดกับทีม Sunford ก่อนสั่งซื้อ
            </p>
            <div className="comparison-scroll" ref={comparisonTable}>
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th scope="col">รายละเอียด</th>
                    {selected.map((p) => (
                      <th key={p.id} scope="col">
                        <Tooltip>
                          <button
                            className="remove-compare icon-button"
                            aria-label={`นำ ${p.name} ออกจากการเปรียบเทียบ`}
                            onClick={() => toggleCompare(p.id)}
                          >
                            <X size={15} />
                          </button>
                        </Tooltip>
                        <ProductImage
                          src={p.image}
                          fallbackSrc={p.fallbackImage}
                          alt={p.name}
                          width={145}
                          height={130}
                        />
                        <Link href={`/products/${p.slug}`} onClick={() => setCompareOpen(false)}>
                          {p.name} <ArrowRight size={13} />
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr
                      key={row.key}
                      className={row.different ? styles.different : undefined}
                      data-comparison-key={row.key}
                      data-different={row.different || undefined}
                    >
                      <th scope="row">
                        {row.label}
                        {row.different && <span className={styles.difference}>ข้อมูลต่างกัน</span>}
                      </th>
                      {selected.map((p, index) => (
                        <td key={p.id}>{row.values[index] ?? "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <a href="tel:034276999" className="button button-red">
              ให้ผู้เชี่ยวชาญช่วยเลือก <ArrowRight size={16} />
            </a>
          </>
        ) : (
          <p className="empty-state">
            ยังไม่มีสินค้าเปรียบเทียบ เลือก + บนการ์ดสินค้าเพื่อเริ่มต้น
          </p>
        )}
      </Modal>
    </>
  );
}
