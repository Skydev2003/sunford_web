"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  findTechnicalSpecifications,
  specificationQueryLimit,
  type SpecificationEntry,
} from "@/features/catalog/data/technical-specifications";
import styles from "./technical-specification.module.css";

const searchPath = "/technical-specification#spec-results";

export function SpecificationResults({
  index,
  initialQuery,
}: {
  index: SpecificationEntry<{ slug: string; name: string; image: string }>[];
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const input = useRef<HTMLInputElement>(null);
  const { total, matches } = findTechnicalSpecifications(index, query);

  useEffect(() => {
    const restoreQuery = () => {
      const url = new URL(window.location.href);
      if (url.pathname === "/technical-specification")
        setQuery((url.searchParams.get("q") ?? "").slice(0, specificationQueryLimit));
    };
    window.addEventListener("popstate", restoreQuery);
    return () => window.removeEventListener("popstate", restoreQuery);
  }, []);

  const updateQuery = (value: string) => {
    setQuery(value);
    const url = new URL(window.location.href);
    if (value.trim()) url.searchParams.set("q", value.trim());
    else url.searchParams.delete("q");
    if (url.href !== window.location.href) window.history.replaceState(null, "", url);
  };

  return (
    <section
      id="spec-results"
      className={styles.searchResults}
      aria-label="แบบค้นหาและผลการค้นหาสเปก"
    >
      <form
        action={searchPath}
        method="get"
        role="search"
        className={styles.form}
        onSubmit={(event) => event.preventDefault()}
      >
        <label htmlFor="spec-query">รหัส SKU หรือชื่อรุ่น</label>
        <div className={styles.searchControls}>
          <input
            ref={input}
            id="spec-query"
            name="q"
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            maxLength={specificationQueryLimit}
            required
          />
          <noscript>
            <button type="submit" className="button button-red">
              ค้นหา
            </button>
          </noscript>
          {query && (
            <a
              className="button button-outline"
              href={searchPath}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                updateQuery("");
                input.current?.focus();
              }}
            >
              ล้างการค้นหา
            </a>
          )}
        </div>
      </form>
      <p className={styles.resultCount} role="status">
        {query.trim()
          ? matches.length
            ? `พบ ${matches.length} รายการ`
            : "ไม่พบข้อมูลสเปกสำหรับคำค้นนี้"
          : `มีข้อมูลสเปกที่ยืนยันแล้ว ${total} รายการ`}
      </p>
      {matches.length > 0 && (
        <div className={styles.resultGrid}>
          {matches.map(({ slug, name, image }) => (
            <Link key={slug} className={styles.result} href={`/products/${slug}`} prefetch={false}>
              {image && <Image src={image} alt="" width={64} height={64} />}
              <span>{name}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
