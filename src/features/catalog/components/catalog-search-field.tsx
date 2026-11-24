"use client";

import type { Ref } from "react";
import { Search } from "lucide-react";
import styles from "./product-category-mock.module.css";

export function CatalogSearchField({
  value,
  onChange,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  inputRef?: Ref<HTMLInputElement>;
}) {
  return (
    <div className={styles.entrySearch}>
      <label className={styles.searchField}>
        <span className={styles.selectionLabel}>ค้นหารุ่นสินค้า</span>
        <span className={styles.search}>
          <Search size={21} aria-hidden="true" />
          <input
            ref={inputRef}
            id="catalog-search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="พิมพ์ชื่อรุ่นที่ต้องการ"
            aria-label="ค้นหารุ่นสินค้า"
          />
        </span>
      </label>
    </div>
  );
}
