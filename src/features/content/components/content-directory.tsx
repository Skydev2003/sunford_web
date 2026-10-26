"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import type { SourcePage } from "../types";

export type DirectoryEntry = Pick<SourcePage, "path" | "title" | "kind"> & { image?: string };

function group(page: DirectoryEntry) {
  if (page.kind === "collection" || /^\/(product|indicator)/i.test(page.path)) return "ผลิตภัณฑ์";
  if (/software/i.test(page.path)) return "ซอฟต์แวร์";
  if (/support|warranty|manual|service|policy/i.test(page.path)) return "บริการและการสนับสนุน";
  if (/blogs|news|business/i.test(page.path)) return "เรื่องราวและข่าวสาร";
  return "รู้จัก Sunford";
}

export function ContentDirectory({
  pages,
  initialGroup = "ทั้งหมด",
}: {
  pages: DirectoryEntry[];
  initialGroup?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialGroup);
  const [expanded, setExpanded] = useState(false);
  const groups = ["ทั้งหมด", ...new Set(pages.map(group))];
  const matching = pages.filter(
    (page) =>
      (category === "ทั้งหมด" || group(page) === category) &&
      `${page.title} ${page.path}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const visible = expanded ? matching : matching.slice(0, 24);
  return (
    <div className="content-directory">
      <div className="directory-controls">
        <label className="directory-search">
          <Search size={19} />
          <input
            aria-label="ค้นหาข้อมูล Sunford"
            placeholder="ค้นหาหมวดสินค้า ซอฟต์แวร์ หรือบริการ"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setExpanded(false);
            }}
          />
        </label>
        <div className="category-tabs" aria-label="ประเภทข้อมูล">
          {groups.map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              aria-pressed={category === item}
              onClick={() => {
                setCategory(item);
                setExpanded(false);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <p className="directory-count" aria-live="polite">
        {matching.length} รายการ
      </p>
      <div className="directory-grid">
        {visible.map((page) => (
          <Link className="directory-card" key={page.path} href={page.path}>
            {(page.kind === "article" || page.image || group(page) === "ซอฟต์แวร์") && (
              <div className="directory-card-image">
                <ProductImage
                  src={page.image}
                  alt={page.title}
                  fill
                  sizes="(max-width: 720px) 90vw, 30vw"
                />
              </div>
            )}
            <div className="directory-card-copy">
              <span>{group(page)}</span>
              <h2>{page.title}</h2>
              <ArrowUpRight size={20} />
            </div>
          </Link>
        ))}
      </div>
      {!matching.length && <p className="empty-state">ยังไม่พบข้อมูล ลองใช้คำค้นอื่น</p>}
      {visible.length < matching.length && (
        <div className="catalog-load-more">
          <button className="button button-outline" onClick={() => setExpanded(true)}>
            ดูทั้งหมด {matching.length} รายการ
          </button>
        </div>
      )}
    </div>
  );
}
