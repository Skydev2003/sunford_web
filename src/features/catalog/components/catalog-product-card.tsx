"use client";

import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { useCategories } from "@/features/cms/components/categories-provider";
import { useCatalogStore } from "@/stores/catalog-store";
import type { ProductCardData } from "../types";
import type { CatalogDecisionFact } from "../data/catalog-decision-facts";
import styles from "./product-browser.module.css";

const productPhotos: Record<string, string> = {
  "acs30-jc21": "/images/products/acs30-jc21-cutout.png",
  wps10ks: "/images/products/wps10ks.png",
  feh5ks: "/images/products/feh5ks.png",
};

export const catalogProductPhoto = (product: Pick<ProductCardData, "id" | "image">) =>
  productPhotos[product.id] ?? product.image;

export function CatalogProductCard({
  product,
  categoryLabel,
  headingLevel = 3,
  modelOnly = false,
  decisionFacts,
}: {
  product: ProductCardData;
  categoryLabel?: string;
  headingLevel?: 2 | 3;
  modelOnly?: boolean;
  decisionFacts?: readonly CatalogDecisionFact[];
}) {
  const categories = useCategories();
  const compareIds = useCatalogStore((s) => s.compareIds);
  const compareMode = useCatalogStore((s) => s.compareMode);
  const toggleCompare = useCatalogStore((s) => s.toggleCompare);
  const selected = compareIds.includes(product.id);
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article
      className={styles.card}
      data-model-only={modelOnly || undefined}
      data-decision-facts={decisionFacts ? true : undefined}
    >
      <Link href={`/products/${product.slug}`} className={styles.image}>
        <ProductImage
          src={catalogProductPhoto(product)}
          alt={`SUNFORD ${product.name}`}
          fill
          sizes="(max-width: 600px) 45vw, (max-width: 1100px) 30vw, 22vw"
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
      <div className={styles.copy}>
        {!modelOnly && <span className={styles.brand}>SUNFORD</span>}
        <Link href={`/products/${product.slug}`}>
          <Heading>{product.name}</Heading>
        </Link>
        {decisionFacts && decisionFacts.length > 0 && (
          <dl
            className={styles.decisionFacts}
            aria-label={`ข้อมูลช่วยเลือก ${product.name}`}
            data-product-facts
          >
            {decisionFacts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {!modelOnly && (
          <>
            <p>{product.subtitle}</p>
            <div className={styles.tags}>
              {product.badge && <span>{product.badge}</span>}
              {product.capacity && product.capacity !== "—" && <span>{product.capacity}</span>}
              <span>
                {categoryLabel ??
                  categories.find((category) => category.id === product.category)?.label}
              </span>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
