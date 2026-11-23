import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { catalogCardName } from "../data/catalog-card-names";
import type { ClientProduct } from "../types";
import { ProductPhotoCard, showcasePhotoSizes } from "./scale-showcase-card";
import photoStyles from "./scale-showcase-card.module.css";
import { WeWeighCardMotion } from "./weweigh-card-motion";
import styles from "./products-index-content.module.css";

const systems = [
  {
    id: "p1w",
    sku: "G108012",
  },
  {
    id: "p1",
    sku: "G108029",
    photoAspect: 3881 / 4096,
  },
  {
    id: "p4",
    sku: "G108050",
  },
  {
    id: "p3",
    sku: "G108043",
  },
  {
    id: "weweigh2",
    category: "ชั่งงานโรงงานได้แม้ออฟไลน์",
    name: "WeWeigh2",
    caption: "เชื่อมเครื่องชั่งจริง จัดการสูตร พิมพ์ฉลาก ส่งข้อมูลเข้า ERP",
    image: "/images/products/software-showcase/weweigh-card-mark-4k.webp",
    href: "https://weweigh.app/",
  },
  { id: "rls1800", sku: "G106827", photoAspect: 3172 / 4096 },
  {
    id: "lp50",
    sku: "G107282",
    image: "/images/products/component-showcase/g107282-front-4k.webp",
  },
] as const;

export function SmartSystemShowcaseCards({ products }: { products: ClientProduct[] }) {
  const bySku = new Map(products.map((product) => [product.warehouseSku, product]));
  return systems.map((item) => {
    const { id } = item;
    const heading = `products-system-${id}`;
    if ("sku" in item) {
      const product = bySku.get(item.sku);
      if (!product) return null;
      const name = catalogCardName(product);
      const image =
        "image" in item ? item.image : `/images/products/software-showcase/${id}-front-4k.webp`;
      return (
        <li key={id} className={photoStyles.card} data-software={id}>
          <ProductPhotoCard
            href={`/products/${product.slug}`}
            heading={heading}
            name={name}
            highlight={product.highlight}
            price={product.price}
            image={
              <ProductImage
                src={image}
                fallbackSrc={product.image || product.fallbackImage}
                alt=""
                placeholder="product"
                fill
                sizes={showcasePhotoSizes("photoAspect" in item ? item.photoAspect : undefined)}
                fallbackSizes={showcasePhotoSizes()}
              />
            }
          />
        </li>
      );
    }
    const { category, name, href, caption, image } = item;
    return (
      <li key={id} className={styles.card} data-software={id}>
        <Link
          href={href}
          className={styles.softwareCard}
          aria-labelledby={heading}
          aria-describedby={`${heading}-tagline`}
        >
          <div className={styles.softwareCopy} data-weweigh-copy>
            <p>{category}</p>
            <h3 id={heading} className={styles.accessibleTitle}>
              {name}
            </h3>
            <p id={`${heading}-tagline`}>{caption}</p>
          </div>
          <WeWeighCardMotion>
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 736px) min(calc(100vw - 116px), 253px), 344px"
            />
          </WeWeighCardMotion>
          <ChevronRight className={styles.softwareArrow} aria-hidden="true" />
        </Link>
      </li>
    );
  });
}
