import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { productCategoryMetadata } from "@/features/catalog/components/product-category-overview";
import {
  platformIndicatorsPath,
  platformStructuresPath,
} from "@/features/catalog/data/catalog-overview-features";
import { platformCatalogSections } from "@/features/catalog/data/catalog-submenu-destinations";
import { platformSpecBuilderPath } from "@/features/catalog/data/platform-spec-builder-path";
import styles from "./platforms.module.css";

const options = [
  {
    id: platformCatalogSections.indicators,
    title: "อินดิเคเตอร์",
    detail: "เลือกหัวอ่านตามการแสดงผล การเชื่อมต่อ และคุณสมบัติที่งานชั่งต้องใช้",
    href: platformIndicatorsPath,
    image: "/images/products/category-families/indicators.webp",
  },
  {
    id: platformCatalogSections.structures,
    title: "โครงสร้างแท่นชั่ง",
    detail: "สำรวจแท่นตั้งโต๊ะ แท่นตั้งพื้น และโครงสร้างเฉพาะทางรวม 5 รูปแบบ",
    href: platformStructuresPath,
    image: "/images/products/category-families/platforms.webp",
  },
  {
    id: "platform-custom-spec",
    title: "จัดสเปคแท่นชั่ง",
    detail: "เลือกแท่น จับคู่อินดิเคเตอร์ และเพิ่มอุปกรณ์เสริมให้เหมาะกับหน้างาน",
    href: platformSpecBuilderPath,
    image: "/images/pd/platform-spotlight.webp",
  },
];

export function generateMetadata() {
  return productCategoryMetadata(
    "platforms",
    "/platforms",
    "แท่นชั่งอุตสาหกรรม",
    "รู้จักส่วนประกอบของชุดแท่นชั่งอุตสาหกรรม SUNFORD เลือกอินดิเคเตอร์ โครงสร้างแท่นชั่ง หรือจัดสเปคให้เหมาะกับหน้างาน",
  );
}

export default function Page() {
  return (
    <main id="main-content" className={styles.hub}>
      <div className="container">
        <header className={styles.intro}>
          <h1>แท่นชั่ง</h1>
          <p>
            ชุดแท่นชั่งอุตสาหกรรมประกอบด้วยตัวแท่นที่รับน้ำหนักและโหลดเซลล์ที่ส่งสัญญาณไปยัง
            อินดิเคเตอร์หรือหัวอ่าน หัวอ่านแสดงค่าน้ำหนักและส่งข้อมูลต่อได้ตามรุ่น
            เลือกขนาดและพิกัดของแท่นให้เหมาะกับชิ้นงาน
            แล้วจับคู่กับหัวอ่านที่รองรับโหลดเซลล์และอุปกรณ์ที่ใช้
          </p>
        </header>
        <nav aria-label="เลือกส่วนประกอบและจัดสเปคแท่นชั่ง">
          <ul className={styles.cards} role="list">
            {options.map(({ id, title, detail, href, image }, index) => (
              <li key={id} id={id}>
                <Link
                  className={styles.card}
                  href={href}
                  aria-labelledby={`${id}-title`}
                  aria-describedby={`${id}-detail`}
                >
                  <div className={styles.art}>
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="(min-width: 80rem) 23rem, (min-width: 56rem) 30vw, (min-width: 36rem) 45vw, 90vw"
                      preload={index === 0}
                    />
                  </div>
                  <div className={styles.cardCopy}>
                    <h2 id={`${id}-title`}>{title}</h2>
                    <p id={`${id}-detail`}>{detail}</p>
                    <ArrowRight className={styles.arrow} size={22} aria-hidden="true" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
