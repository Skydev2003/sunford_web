"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowUpRight } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import type { SourcePage } from "../types";

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

export function SoftwareCatalog({
  catalog,
}: {
  catalog: NonNullable<SourcePage["softwareCatalog"]>;
}) {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash.slice(1),
    () => "all",
  );
  const category = catalog.categories.some((item) => item.id === hash) ? hash : "all";
  const items = catalog.items.filter((item) => category === "all" || item.category === category);

  return (
    <section className="software-catalog container" aria-label="แอปพลิเคชันและซอฟต์แวร์ Sunford">
      <nav className="software-filters" aria-label="หมวดหมู่ซอฟต์แวร์">
        {catalog.categories.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={item.id === category ? "true" : undefined}
            onClick={(event) => {
              event.preventDefault();
              window.history.replaceState(null, "", `#${item.id}`);
              window.dispatchEvent(new HashChangeEvent("hashchange"));
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <p className="directory-count" aria-live="polite">
        {items.length} รายการ
      </p>
      <div className="software-grid" aria-live="polite">
        {items.map((item) => (
          <Link key={item.path} href={item.path} className="software-card">
            <div className="software-card-image">
              <ProductImage
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 30vw"
              />
            </div>
            <div className="software-card-copy">
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <span>
                ดูรายละเอียด <ArrowUpRight size={16} />
              </span>
            </div>
          </Link>
        ))}
      </div>
      {!items.length && <p className="empty-state">ไม่มีข้อมูลที่ตรงกับหมวดหมู่ที่เลือก</p>}
    </section>
  );
}
