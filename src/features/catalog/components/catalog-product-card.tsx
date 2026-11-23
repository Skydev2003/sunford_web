"use client";

import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { useCatalogStore } from "@/stores/catalog-store";
import type { ProductCardData } from "../types";
import { ProductCardCaption } from "./product-card-caption";
import styles from "./product-browser.module.css";

const productPhotos: Record<string, string> = {
  "acs30-jc21": "/images/products/acs30-jc21-cutout.png",
  wps10ks: "/images/products/wps10ks.png",
  feh5ks: "/images/products/feh5ks.png",
};

export const catalogProductPhoto = (
  product: Pick<ProductCardData, "id" | "image" | "warehouseSku">,
) => (product.warehouseSku ? product.image : productPhotos[product.id] || product.image);

export function CatalogProductCard({
  product,
  headingLevel = 3,
  categoryLift = false,
  directory = false,
  prioritizeImage = false,
  preloadImageMedia,
  imageBlurDataURL,
  returnContext,
}: {
  product: ProductCardData;
  headingLevel?: 2 | 3;
  categoryLift?: boolean;
  directory?: boolean;
  prioritizeImage?: boolean;
  preloadImageMedia?: string;
  imageBlurDataURL?: string;
  returnContext?: import("../data/product-subcategory-pages").ProductReturnContext;
}) {
  const compareIds = useCatalogStore((s) => s.compareIds);
  const compareMode = useCatalogStore((s) => s.compareMode);
  const toggleCompare = useCatalogStore((s) => s.toggleCompare);
  const selected = compareIds.includes(product.id);
  const href = `/products/${product.slug}${returnContext ? `?from=${returnContext}` : ""}`;
  return (
    <article
      className={styles.card}
      data-model-only
      data-category-lift={categoryLift || undefined}
      data-directory-card={directory || undefined}
    >
      <Link href={href} className={styles.image} prefetch>
        <ProductImage
          placeholder="product"
          progressive={categoryLift}
          prioritize={prioritizeImage}
          preloadMedia={preloadImageMedia}
          blurDataURL={imageBlurDataURL}
          src={catalogProductPhoto(product)}
          fallbackSrc={product.fallbackImage}
          alt={`SUNFORD ${product.name}`}
          fill
          sizes={
            directory
              ? "(width < 24rem) 90vw, (width < 64rem) 46vw, 22vw"
              : "(width < 40rem) 45vw, (width < 80rem) 30vw, 22vw"
          }
        />
      </Link>
      {compareMode && (
        <button
          className={styles.compare}
          aria-label={`${selected ? "นำออกจาก" : "เพิ่มเพื่อ"}เปรียบเทียบ ${product.name}`}
          aria-pressed={selected}
          disabled={!selected && compareIds.length >= 3}
          onClick={() => toggleCompare(product.id)}
        >
          {selected ? <Check size={15} /> : <Plus size={15} />}
        </button>
      )}
      <ProductCardCaption
        className={styles.copy}
        headingLevel={headingLevel}
        href={href}
        name={product.name}
        highlight={product.highlight}
        price={product.price}
      />
    </article>
  );
}
