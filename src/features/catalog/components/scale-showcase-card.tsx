import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
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
  photoAspect?: number;
  tagline?: string;
  imageMode?: ScaleShowcaseItem["imageMode"];
  lettering?: ScaleShowcaseItem["lettering"];
};

export const productRailCardSizes = "(max-width: 736px) min(calc(100vw - 60px), 309px), 400px";

export function showcasePhotoSizes(aspect = 1) {
  return `${Math.ceil(216 * Math.min(1, aspect))}px`;
}

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
  prioritize = false,
}: {
  item: ShowcaseItem;
  shelf: string;
  first: boolean;
  prioritize?: boolean;
}) {
  const { product, background, label, photo, tagline, imageMode, surface } = item;
  const name = catalogCardName(product);
  const lettering = item.lettering;
  const photoSizes = showcasePhotoSizes(item.photoAspect);
  const bleed = imageMode === "bleed";
  // The framed artwork box is 98% of the card width and 95% of the 54% artwork area.
  const aspect = item.photoAspect ?? 2;
  const mobileWidth = Math.ceil(Math.min(bleed ? 371 : 303, (bleed ? 243 : 231) * aspect));
  const desktopWidth = Math.ceil(Math.min(bleed ? 480 : 392, (bleed ? 270 : 257) * aspect));
  const scaleImageSizes = `(max-width: 736px) min(calc(100vw - 60px), ${mobileWidth}px), ${desktopWidth}px`;
  const scaleFallbackSizes = "(max-width: 736px) min(calc(100vw - 60px), 303px), 392px";
  const prefix = shelf === "indicators" ? "components" : shelf;
  const heading =
    shelf === "scales" ? `products-model-${product.id}` : `products-${prefix}-model-${product.id}`;
  const imageFrame =
    imageMode === "bleed"
      ? "sc:absolute sc:bottom-0 sc:aspect-square sc:max-h-full sc:w-[120%] sc:max-w-none sc:translate-y-3"
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
              progressive
              prioritize={prioritize}
              fill
              sizes={photoSizes}
              fallbackSizes={showcasePhotoSizes()}
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
          style={
            lettering &&
            ({
              "--scale-ink": lettering.ink,
              "--name-width-em": lettering.nameWidthEm,
            } as CSSProperties)
          }
          className={`sc:@container sc:group sc:relative sc:flex sc:h-full sc:min-h-[28.125rem] sc:min-[737px]:min-h-[31.25rem] sc:cursor-pointer sc:flex-col sc:justify-between sc:overflow-hidden sc:rounded-3xl sc:shadow-sm sc:motion-safe:transition-all sc:motion-safe:duration-300 sc:motion-safe:hover:-translate-y-1 sc:hover:shadow-lg sc:motion-reduce:transition-none ${styles.scaleLink} ${background}`}
        >
          {surface && (
            <div
              aria-hidden="true"
              data-scale-surface
              className={`sc:pointer-events-none sc:absolute sc:inset-x-0 sc:bottom-0 sc:z-0 sc:motion-safe:transition-[height] sc:motion-safe:duration-500 sc:motion-safe:group-hover:h-[48%] ${surface}`}
            />
          )}
          <div className="sc:relative sc:z-15 sc:shrink-0 sc:[--copy-inset:1.5rem] sc:p-(--copy-inset) sc:md:[--copy-inset:1.75rem]">
            <p className="sc:text-[clamp(0.75rem,4cqw,0.8125rem)] sc:leading-4 sc:font-semibold sc:tracking-wide">
              {label}
            </p>
            <h3
              id={heading}
              aria-label={name}
              className={`sc:mt-2! sc:w-max sc:max-w-full sc:leading-none sc:font-extrabold sc:tracking-[-0.02em] sc:whitespace-nowrap ${styles.scaleName}`}
            >
              {name.split(/(\d+)/).map((part, index) =>
                index % 2 ? (
                  part
                ) : (
                  <span className="sc:font-normal" key={index}>
                    {part}
                  </span>
                ),
              )}
            </h3>
            {tagline && (
              <p
                id={`${heading}-tagline`}
                title={tagline}
                className={`sc:mt-2.5! sc:line-clamp-2 sc:text-[clamp(0.95rem,5cqw,1.1rem)] sc:leading-[1.45] sc:font-medium ${styles.scaleTagline}`}
              >
                {tagline}
              </p>
            )}
          </div>
          <div
            data-scale-artwork
            className="sc:relative sc:z-10 sc:isolate sc:mt-auto sc:flex sc:min-h-0 sc:max-h-[54%] sc:w-full sc:flex-1 sc:items-end sc:justify-center sc:overflow-hidden"
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
                prioritize={first || prioritize}
                preloadMedia={
                  first
                    ? "(375px <= width <= 480px) and (min-height: 840px), (min-width: 1280px) and (min-height: 900px)"
                    : undefined
                }
                progressive
                sizes={scaleImageSizes}
                fallbackSizes={scaleFallbackSizes}
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
