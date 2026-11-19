import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { catalogCardName } from "../data/catalog-card-names";
import type { ClientProduct } from "../types";
import type { ScaleShowcaseItem } from "../data/scale-showcase";
import "./scale-showcase.css";
import styles from "./scale-showcase-card.module.css";

type ShowcaseItem = {
  product: ClientProduct;
  group: string;
  label: string;
  background: string;
  surface?: string;
  lightText?: boolean;
  photo: string;
  tagline?: string;
  imageMode?: ScaleShowcaseItem["imageMode"];
};

export function ProductPhotoCard({
  href,
  heading,
  name,
  label,
  descriptionId,
  image,
  children,
}: {
  href: string;
  heading: string;
  name: string;
  label?: string;
  descriptionId?: string;
  image: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={styles.photoFirst}
      data-product-card-photo-first
      aria-labelledby={heading}
      aria-describedby={descriptionId}
    >
      <div className={styles.photoPanel}>
        <div className={styles.photoFrame}>{image}</div>
      </div>
      <div className={styles.photoCardFooter}>
        <div className={styles.photoCardCopy}>
          {label && <p className={styles.photoCardCategory}>{label}</p>}
          <h3 id={heading}>{name}</h3>
          {children}
        </div>
        <ChevronRight className={styles.photoCardArrow} aria-hidden="true" strokeWidth={2.5} />
      </div>
    </Link>
  );
}

export function ProductShowcaseCard({
  item,
  shelf,
  first,
}: {
  item: ShowcaseItem;
  shelf: string;
  first: boolean;
}) {
  const { product, background, label, photo, tagline, imageMode, surface, lightText } = item;
  const name = catalogCardName(product);
  const prefix = shelf === "indicators" ? "components" : shelf;
  const heading =
    shelf === "scales" ? `products-model-${product.id}` : `products-${prefix}-model-${product.id}`;
  const imageFrame =
    imageMode === "bleed"
      ? "sc:absolute sc:bottom-0 sc:aspect-square sc:max-h-[calc(100%+0.875rem)] sc:w-[120%] sc:max-w-none sc:translate-y-3"
      : "sc:absolute sc:bottom-0 sc:h-[95%] sc:w-[98%]";
  return (
    <li
      className={styles.card}
      data-warehouse-sku={product.warehouseSku}
      data-design={product.warehouseSku}
      data-scale-group={imageMode ? item.group : undefined}
      data-image-mode={imageMode}
    >
      {shelf !== "scales" ? (
        <ProductPhotoCard
          href={`/products/${product.slug}`}
          heading={heading}
          name={name}
          label={label}
          descriptionId={tagline ? `${heading}-tagline` : undefined}
          image={
            <ProductImage
              src={photo}
              fallbackSrc={product.image || product.fallbackImage}
              alt={name}
              placeholder="product"
              fill
              sizes="216px"
            />
          }
        >
          {tagline && <p id={`${heading}-tagline`}>{tagline}</p>}
        </ProductPhotoCard>
      ) : (
        <Link
          href={`/products/${product.slug}`}
          aria-labelledby={heading}
          aria-describedby={tagline ? `${heading}-tagline` : undefined}
          className={`sc:group sc:relative sc:flex sc:h-full sc:min-h-[28.125rem] sc:min-[737px]:min-h-[31.25rem] sc:cursor-pointer sc:flex-col sc:justify-between sc:overflow-hidden sc:rounded-3xl sc:shadow-sm sc:motion-safe:transition-all sc:motion-safe:duration-300 sc:motion-safe:hover:-translate-y-1 sc:hover:shadow-lg sc:motion-reduce:transition-none ${lightText ? "sc:text-white sc:has-data-product-image-placeholder:text-[#1D1D1F]" : "sc:text-[#1D1D1F]"} ${imageMode ? "" : "sc:p-7"} ${background}`}
        >
          {surface && (
            <div
              aria-hidden="true"
              data-scale-surface
              className={`sc:pointer-events-none sc:absolute sc:inset-x-0 sc:bottom-0 sc:z-0 sc:motion-safe:transition-[height] sc:motion-safe:duration-500 sc:motion-safe:group-hover:h-[48%] ${surface}`}
            />
          )}
          <div className={`sc:relative sc:z-10 sc:shrink-0 ${imageMode ? "sc:p-6 sc:md:p-7" : ""}`}>
            <p
              className={`sc:text-xs sc:opacity-85 ${imageMode ? "sc:mb-1! sc:font-semibold sc:tracking-wide" : "sc:mb-1 sc:font-medium"}`}
            >
              {label}
            </p>
            <h3
              id={heading}
              className={`sc:font-bold sc:tracking-tight sc:wrap-anywhere ${imageMode ? "sc:text-2xl sc:md:text-[28px] sc:leading-none" : "sc:text-xl sc:md:text-2xl"}`}
            >
              {name}
            </h3>
            {tagline && (
              <p
                id={`${heading}-tagline`}
                title={tagline}
                className="sc:mt-2! sc:line-clamp-1 sc:text-sm sc:md:text-base sc:font-normal sc:leading-normal sc:opacity-90"
              >
                {tagline}
              </p>
            )}
          </div>
          <div
            className={
              imageMode
                ? `sc:relative sc:z-10 sc:isolate sc:mt-auto sc:flex sc:min-h-0 sc:max-h-[250px] sc:w-full sc:flex-1 sc:items-end sc:justify-center sc:md:max-h-[270px] ${imageMode === "bleed" ? "sc:overflow-visible" : "sc:overflow-hidden"}`
                : "sc:relative sc:z-10 sc:isolate sc:-mx-7 sc:mt-5 sc:-mb-7 sc:flex-1 sc:overflow-hidden"
            }
          >
            <div className={imageMode ? imageFrame : styles.photo}>
              <ProductImage
                src={photo}
                fallbackSrc={product.image || product.fallbackImage}
                alt={name}
                placeholder="product"
                className={`sc:origin-bottom sc:object-contain sc:object-bottom sc:motion-safe:duration-500 ${imageMode === "full-bottom" ? "sc:mx-auto sc:max-w-full sc:motion-safe:transition-[scale,max-width] sc:motion-safe:group-hover:max-w-[97%]" : "sc:motion-safe:transition-transform"} ${
                  imageMode
                    ? "sc:drop-shadow-[0_18px_24px_rgba(0,0,0,0.22)] sc:motion-safe:group-hover:scale-105"
                    : "sc:scale-105 sc:drop-shadow-[0_4px_5px_rgb(29_29_31/0.13)] sc:motion-safe:group-hover:scale-110"
                }`}
                fill
                preload={first}
                sizes="(max-width: 370px) calc(100vw - 24px), (max-width: 736px) 340px, 440px"
              />
            </div>
          </div>
          <ChevronRight
            className={`sc:pointer-events-none sc:absolute sc:right-4 sc:bottom-4 sc:z-20 sc:size-9 sc:rounded-full sc:p-2 sc:text-neutral-900 sc:motion-safe:transition-transform sc:motion-safe:duration-300 sc:lg:right-5 sc:lg:bottom-5 ${imageMode ? "sc:bg-white sc:shadow-md sc:motion-safe:group-hover:scale-110" : "sc:bg-white/90 sc:shadow-sm sc:backdrop-blur-sm sc:motion-safe:group-hover:scale-105"}`}
            aria-hidden="true"
            strokeWidth={2.5}
          />
        </Link>
      )}
    </li>
  );
}
