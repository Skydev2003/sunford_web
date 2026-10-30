"use client";
import { Tooltip } from "@/components/ui/tooltip";
import { useCategories } from "@/features/cms/components/categories-provider";
import { ProductImage } from "@/components/ui/product-image";
import Link from "next/link";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import type { ProductCardData } from "../types";

import { useCatalogStore } from "@/stores/catalog-store";

export function ProductCard({
  product,
  categoryLabel,
}: {
  product: ProductCardData;
  categoryLabel?: string;
}) {
  const categories = useCategories();
  const ids = useCatalogStore((s) => s.compareIds);
  const toggleCompare = useCatalogStore((s) => s.toggleCompare);
  const selected = ids.includes(product.id);
  return (
    <article className="product-card">
      <div className="product-card-top">
        <span className={product.badge ? "product-badge" : "category-tag"}>
          {product.badge ??
            categoryLabel ??
            categories.find((c) => c.id === product.category)?.english}
        </span>
        <Tooltip>
          <button
            className={`compare-button ${selected ? "selected" : ""}`}
            aria-label={`${selected ? "นำออกจาก" : "เพิ่มเพื่อ"}เปรียบเทียบ ${product.name}`}
            aria-pressed={selected}
            disabled={!selected && ids.length >= 3}
            onClick={() => toggleCompare(product.id)}
          >
            {selected ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </Tooltip>
      </div>
      <Link href={`/products/${product.slug}`} className="product-card-image">
        <ProductImage
          src={product.image}
          alt={`SUNFORD ${product.name}`}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 30vw"
        />
      </Link>
      <div className="product-card-copy">
        <span className="product-category">
          {categoryLabel ?? categories.find((c) => c.id === product.category)?.label}
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
