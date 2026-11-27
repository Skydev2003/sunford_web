import { contactPath } from "@/features/content/data/contact-route";
import Link from "next/link";
import styles from "./indicator-platform-compatibility-page.module.css";
import { getProducts } from "@/features/catalog/server/product-repository";
import { getWeighingOptions } from "../data/weighing-options";
import { WeighingBuilder } from "./weighing-builder";

const recommendedSets = [
  { sku: "G-SET02", usage: "ชั่งและพิมพ์สลิปที่เคาน์เตอร์" },
  { sku: "G-SET19", usage: "ชั่งคำนวณราคาและพิมพ์ฉลากหน้าร้าน พิกัด 60 กก." },
  { sku: "G-SET05", usage: "ชั่งคำนวณราคาและพิมพ์ฉลากหน้าร้าน พิกัด 150 กก." },
  { sku: "G-SET04", usage: "ชั่งน้ำหนักและอ่านค่าจากจอแสดงผลแยก" },
  { sku: "G-SET10", usage: "ชั่งและพิมพ์ฉลากในงานผลิตและคลังสินค้า" },
];

export async function IndicatorPlatformCompatibilityPage() {
  const products = await getProducts(),
    options = getWeighingOptions(products);
  const sets = recommendedSets.flatMap(({ sku, usage }) => {
    const product = products.find((item) => item.warehouseSku === sku);
    return product ? [{ product, usage }] : [];
  });
  return (
    <main id="main-content" className={styles.page}>
      <h1 className={styles.screenReaderTitle}>จัดสเปคเครื่องชั่ง</h1>
      <WeighingBuilder options={options} />
      <section
        id="recommended-sets"
        className={styles.anchor}
        aria-labelledby="recommended-sets-title"
        tabIndex={-1}
      >
        <h2 id="recommended-sets-title" className={styles.guideTitle}>
          ช่วยเลือกรุ่นที่ใช่
        </h2>
        {sets.length ? (
          <ul className={`${styles.grid} ${styles.recommendedSets}`}>
            {sets.map(({ product, usage }) => (
              <li key={product.id} className={styles.card}>
                <h3>
                  <Link href={`/products/${product.slug}`}>{product.name}</Link>
                </h3>
                <p>{usage}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>ขณะนี้ชุดแนะนำยังไม่พร้อมแสดง สามารถปรึกษา SUNFORD เพื่อเลือกชุดที่เหมาะกับงานได้</p>
        )}
      </section>
      <h2 className={styles.guideTitle}>คู่มือเลือกตามลักษณะงาน</h2>
      <div className={styles.grid}>
        {["หัวอ่าน", "แท่นชั่ง", "ชุดสินค้า", "การเชื่อมต่อ"].map((title, index) => (
          <details className={styles.card} key={title}>
            <summary>
              <span className={styles.meta}></span>
              <strong>{title}</strong>
              <span></span>
            </summary>
            <div className={styles.body}>
              {options
                .filter((o) =>
                  index === 0
                    ? o.kind === "head"
                    : index === 1
                      ? o.kind === "platform"
                      : o.includesHead,
                )
                .map((o) => (
                  <div key={o.code}>
                    <Link href={o.detailHref}>{o.displayName}</Link>
                    <p>{o.description}</p>
                    <dl>
                      {o.compatibleCodes?.map((code) => (
                        <div key={code}>
                          <dt></dt>
                          <dd>{options.find((x) => x.code === code)?.displayName ?? ""}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
            </div>
          </details>
        ))}
      </div>
      <details className={styles.accessories}>
        <summary>
          <strong>อุปกรณ์เสริมและสายสัญญาณ</strong>
        </summary>
        <dl className={styles.body}>
          {options
            .filter((o) => o.kind === "accessory")
            .map((o) => (
              <div key={o.code}>
                <dt>
                  <Link href={o.detailHref}>{o.displayName}</Link>
                </dt>
                <dd>{o.description}</dd>
              </div>
            ))}
        </dl>
      </details>
      <Link className={styles.contact} href={contactPath}>
        ปรึกษาเรื่องชุดชั่งกับ SUNFORD ›
      </Link>
    </main>
  );
}
