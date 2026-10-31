import type { ReactNode } from "react";
import { ProductImage } from "@/components/ui/product-image";
import { getCategoryBanner } from "../data/category-banners";
import styles from "./category-banner.module.css";

export function CategoryBanner({
  category,
  title,
  description,
  children,
  standalone = false,
}: {
  category: string;
  title: string;
  description?: string;
  children?: ReactNode;
  standalone?: boolean;
}) {
  const banner = getCategoryBanner(category);
  if (!banner) return null;
  const polished = banner.image.includes("/category-banners-v4/");
  return (
    <header
      className={`${styles.banner} ${banner.width / banner.height > 4 ? styles.panoramic : ""} ${polished ? styles.polished : ""} ${standalone ? `container ${styles.standalone}` : ""}`}
      data-category-banner={category}
    >
      <div className={styles.visual}>
        <ProductImage
          src={banner.image}
          alt={`${banner.title} — ${banner.referenceProduct}`}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 1680px) calc(100vw - 300px), 1380px"
          unoptimized={polished}
          preload
        />
      </div>
      <div className={styles.copy}>
        <span className={styles.brand}>SUNFORD</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {children}
      </div>
    </header>
  );
}
