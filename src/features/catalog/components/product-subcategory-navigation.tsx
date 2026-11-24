"use client";

import { useLayoutEffect, useRef } from "react";
import { PRODUCT_IMAGE_PLACEHOLDER, ProductImage } from "@/components/ui/product-image";
import { CatalogNavigationLink } from "./catalog-navigation-link";
import styles from "./product-directory.module.css";

export function ProductSubcategoryNavigation({
  items,
  currentHref,
}: {
  items: readonly { href: string; label: string; image?: string; fallbackImage?: string }[];
  currentHref: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const previousHref = useRef(currentHref);

  useLayoutEffect(() => {
    if (previousHref.current === currentHref) return;
    previousHref.current = currentHref;
    const track = trackRef.current;
    const current = track?.querySelector('[aria-current="page"]');
    if (!track || !current) return;

    const viewport = track.getBoundingClientRect();
    const link = current.getBoundingClientRect();
    if (link.left < viewport.left) {
      track.scrollLeft += link.left - viewport.left;
    } else if (link.right > viewport.right) {
      track.scrollLeft += link.right - viewport.right;
    }
  }, [currentHref]);

  return (
    <nav className={styles.listingNavigation} aria-label="หมวดย่อยสินค้า">
      <ul ref={trackRef}>
        {items.map(({ href, label, image, fallbackImage }) => (
          <li key={href}>
            <CatalogNavigationLink
              href={href}
              aria-current={href === currentHref ? "page" : undefined}
              scroll={false}
              prefetch={href !== currentHref}
              onNavigate={(event) => {
                if (href === currentHref) event.preventDefault();
              }}
            >
              <span className={styles.listingCategoryArt}>
                <ProductImage
                  src={image ?? PRODUCT_IMAGE_PLACEHOLDER}
                  fallbackSrc={fallbackImage}
                  alt=""
                  fill
                  sizes="100px"
                />
              </span>
              <span>{label}</span>
            </CatalogNavigationLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
