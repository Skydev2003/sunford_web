"use client";
import { Tooltip } from "@/components/ui/tooltip";
import { useCategories } from "@/features/cms/components/categories-provider";
import { useState } from "react";
import { ProductImage } from "@/components/ui/product-image";
import Link from "next/link";
import { ArrowRight, GitCompareArrows, Search, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useCatalogStore } from "@/stores/catalog-store";
import { type OverlayProduct } from "../types";
import type { SearchPage } from "@/features/content/types";

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
  const found = products.filter((p) =>
    `${p.name} ${p.subtitle} ${p.description} ${categories.find((c) => c.id === p.category)?.label}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const selected = products.filter((p) => ids.includes(p.id));
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
              <ProductImage src={p.image} alt={p.name} width={65} height={65} />
              <div>
                <strong>{p.name}</strong>
                <span>{p.subtitle}</span>
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
        title="เปรียบเทียบสิ่งที่ใช่"
        wide
      >
        {selected.length ? (
          <>
            <p className="compare-hint">
              เปรียบเทียบรายละเอียดเบื้องต้น · กรุณายืนยันสเปกล่าสุดกับทีม Sunford ก่อนสั่งซื้อ
            </p>
            <div className="comparison-scroll">
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
                        <ProductImage src={p.image} alt={p.name} width={145} height={130} />
                        <Link href={`/products/${p.slug}`} onClick={() => setCompareOpen(false)}>
                          {p.name} <ArrowRight size={13} />
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      { label: "การใช้งาน", key: "subtitle" },
                      { label: "พิกัดน้ำหนัก", key: "capacity" },
                      { label: "ความละเอียด", key: "readability" },
                      { label: "การเชื่อมต่อ", key: "connection" },
                    ] as const
                  ).map((row) => (
                    <tr key={row.key}>
                      <th scope="row">{row.label}</th>
                      {selected.map((p) => (
                        <td key={p.id}>{p[row.key]}</td>
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
