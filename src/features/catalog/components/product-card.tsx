"use client";
import { Tooltip } from "@/components/ui/tooltip";
import { ProductImage } from "@/components/ui/product-image";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import type { ProductCardData } from "../types";
import { ProductCardCaption } from "./product-card-caption";

import { useCatalogStore } from "@/stores/catalog-store";

export function ProductCard({ product }: { product: ProductCardData }) {
  const ids = useCatalogStore((s) => s.compareIds);
  const compareMode = useCatalogStore((s) => s.compareMode);
  const toggleCompare = useCatalogStore((s) => s.toggleCompare);
  const selected = ids.includes(product.id);
  return (
    <article className="product-card">
      {compareMode && (
        <div className="product-card-top">
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
      )}
      <Link href={`/products/${product.slug}`} className="product-card-image">
        <ProductImage
          placeholder="product"
          src={product.image}
          fallbackSrc={product.fallbackImage}
          alt={`SUNFORD ${product.name}`}
          fill
          sizes="(width < 40rem) 90vw, (width < 64rem) 45vw, 30vw"
        />
      </Link>
      <ProductCardCaption
        className="product-card-copy"
        href={`/products/${product.slug}`}
        name={product.name}
        highlight={product.highlight}
        price={product.price}
      />
    </article>
  );
}
