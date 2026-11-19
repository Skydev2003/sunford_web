import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { catalogCardName } from "../data/catalog-card-names";
import { formatPrice } from "../data/price-format";
import type { ClientProduct } from "../types";
import { ProductPhotoCard } from "./scale-showcase-card";
import photoStyles from "./scale-showcase-card.module.css";
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
    category: "งานชั่งในโรงงาน",
    name: "WeWeigh2",
    caption: "ดูน้ำหนักสด เทียบช่วงเป้าหมาย",
    image: "/images/products/software-showcase/weweigh2-home-front-4k.webp",
    href: "https://weweigh.app/",
  },
  { id: "rls1800", sku: "G106827", category: "เครื่องชั่งพิมพ์ฉลาก" },
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
    let name: string, href: string, caption: string;
    if ("sku" in item) {
      const product = bySku.get(item.sku);
      if (!product) return null;
      name = catalogCardName(product);
      href = `/products/${product.slug}`;
      caption =
        "caption" in item
          ? item.caption
          : product.price == null
            ? "สอบถามราคา"
            : `${formatPrice(product.price)} บาท (ก่อน VAT)`;
    } else {
      ({ name, href, caption } = item);
    }
    const image =
      "image" in item ? item.image : `/images/products/software-showcase/${id}-front-4k.webp`;
    const heading = `products-system-${id}`;
    if ("sku" in item) {
      return (
        <li key={id} className={photoStyles.card} data-software={id}>
          <ProductPhotoCard
            href={href}
            heading={heading}
            name={name}
            label={category}
            descriptionId={`${heading}-tagline`}
            image={<Image src={image} alt="" fill sizes="216px" />}
          >
            <p id={`${heading}-tagline`}>{caption}</p>
          </ProductPhotoCard>
        </li>
      );
    }
    return (
      <li key={id} className={styles.card} data-software={id}>
        <Link
          href={href}
          className={styles.softwareCard}
          aria-labelledby={heading}
          aria-describedby={`${heading}-tagline`}
        >
          <div className={styles.softwareCopy}>
            <p>{category}</p>
            <h3 id={heading}>{name}</h3>
            <p id={`${heading}-tagline`}>{caption}</p>
          </div>
          <div className={styles.softwareVisual}>
            <div className={styles.softwarePicture}>
              <Image
                src={image}
                alt=""
                fill
                sizes="(max-width: 370px) calc(100vw - 60px), (max-width: 736px) 309px, 400px"
              />
            </div>
          </div>
          <ChevronRight className={styles.softwareArrow} aria-hidden="true" />
        </Link>
      </li>
    );
  });
}
