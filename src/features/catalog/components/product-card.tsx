"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import type { Product } from "../types";
import { categories } from "../types";
import { useCatalogStore } from "@/stores/catalog-store";

export function ProductCard({ product }: { product: Product }) {
  const ids = useCatalogStore((s) => s.compareIds);
  const toggleCompare = useCatalogStore((s) => s.toggleCompare);
  const selected = ids.includes(product.id);
  return (
    <article className="product-card">
      <div className="product-card-top">
        <span className={product.badge ? "product-badge" : "category-tag"}>
          {product.badge ?? categories.find((c) => c.id === product.category)?.english}
        </span>
        <button
          className={`compare-button ${selected ? "selected" : ""}`}
          aria-label={`${selected ? "นำออกจาก" : "เพิ่มเพื่อ"}เปรียบเทียบ ${product.name}`}
          aria-pressed={selected}
          disabled={!selected && ids.length >= 3}
          onClick={() => toggleCompare(product.id)}
        >
          {selected ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>
      <Link href={`/products/${product.slug}`} className="product-card-image">
        <Image
          src={product.image}
          alt={`เครื่องชั่ง Sunford ${product.name}`}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 30vw"
        />
      </Link>
      <div className="product-card-copy">
        <span className="product-category">
          {categories.find((c) => c.id === product.category)?.label}
        </span>
        <Link href={`/products/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        <p>{product.subtitle}</p>
        <div className="product-card-bottom">
          <span>{product.capacity}</span>
          <Link href={`/products/${product.slug}`}>
            ดูรายละเอียด <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
