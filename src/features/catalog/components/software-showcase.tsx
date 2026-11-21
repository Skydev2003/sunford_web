import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { catalogCardName } from "../data/catalog-card-names";
import { formatPrice } from "../data/price-format";
import type { ClientProduct } from "../types";
import { ProductPhotoCard, showcasePhotoSizes } from "./scale-showcase-card";
import photoStyles from "./scale-showcase-card.module.css";
import { WeWeighCardMotion } from "./weweigh-card-motion";
import styles from "./products-index-content.module.css";

const systems = [
  {
    id: "p1w",
    sku: "G108012",
    category: "เครื่องบันทึกเงินสด",
    caption: "Windows 10 Pro พร้อมจอคู่ 15.6 นิ้ว",
  },
  {
    id: "p1",
    sku: "G108029",
    photoAspect: 3881 / 4096,
    category: "เครื่องบันทึกเงินสด",
    caption: "Android พร้อมจอสัมผัส 15.6 นิ้ว",
  },
  {
    id: "p4",
    sku: "G108050",
    category: "เครื่องบันทึกเงินสด",
    caption: "POS ขนาดกะทัดรัด จอสัมผัส 12.5 นิ้ว",
  },
  {
    id: "p3",
    sku: "G108043",
    category: "เครื่องบันทึกเงินสด",
    caption: "จอสัมผัส 14 นิ้ว พิมพ์สลิป 80 มม.",
  },
  {
    id: "weweigh2",
    category: "ชั่งงานโรงงานได้แม้ออฟไลน์",
    name: "WeWeigh2",
    caption: "เชื่อมเครื่องชั่งจริง จัดการสูตร พิมพ์ฉลาก ส่งข้อมูลเข้า ERP",
    image: "/images/products/software-showcase/weweigh-card-mark-4k.webp",
    href: "https://weweigh.app/",
  },
  { id: "rls1800", sku: "G106827", category: "เครื่องชั่งพิมพ์ฉลาก", photoAspect: 3172 / 4096 },
  {
    id: "lp50",
    sku: "G107282",
    category: "เครื่องพิมพ์ฉลาก",
    image: "/images/products/component-showcase/g107282-front-4k.webp",
  },
] as const;

export function SmartSystemShowcaseCards({ products }: { products: ClientProduct[] }) {
  const bySku = new Map(products.map((product) => [product.warehouseSku, product]));
  return systems.map((item) => {
    const { id, category } = item;
    const heading = `products-system-${id}`;
    if ("sku" in item) {
      const product = bySku.get(item.sku);
      if (!product) return null;
      const name = catalogCardName(product);
      const caption =
        "caption" in item
          ? item.caption
          : product.price == null
            ? "สอบถามราคา"
            : `${formatPrice(product.price)} บาท (ก่อน VAT)`;
      const image =
        "image" in item ? item.image : `/images/products/software-showcase/${id}-front-4k.webp`;
      return (
        <li key={id} className={photoStyles.card} data-software={id}>
          <ProductPhotoCard
            href={`/products/${product.slug}`}
            heading={heading}
            name={name}
            label={category}
            descriptionId={`${heading}-tagline`}
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
          >
            <p id={`${heading}-tagline`}>{caption}</p>
          </ProductPhotoCard>
        </li>
      );
    }
    const { name, href, caption, image } = item;
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
