import { contactPath } from "@/features/content/data/contact-route";
import Link from "next/link";
import styles from "./indicator-platform-compatibility-page.module.css";
import { getProducts } from "@/features/catalog/server/product-repository";
import { pricedProducts } from "@/features/catalog/data/quotation";
import { getWeighingOptions } from "../data/weighing-options";
import { WeighingBuilder } from "./weighing-builder";
import { QuoteSelectionLink } from "@/features/catalog/components/quote-selection-link";

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
  const optionNames = new Map(options.map(({ code, displayName }) => [code, displayName]));
  const pricedIds = new Set(pricedProducts(products).map(({ id }) => id));
  const guideGroups = [
    { title: "หัวอ่าน", entries: options.filter(({ kind }) => kind === "head") },
    {
      title: "แท่นชั่ง",
      entries: options.filter(({ kind, includesHead }) => kind === "platform" && !includesHead),
    },
    { title: "ชุดสินค้า", entries: options.filter(({ includesHead }) => includesHead) },
    {
      title: "การเชื่อมต่อ",
      entries: options.filter(({ kind, connections }) => kind === "head" && connections?.length),
      showConnections: true,
    },
  ];
  const sets = recommendedSets.flatMap(({ sku, usage }) => {
    const product = products.find((item) => item.warehouseSku === sku);
    return product
      ? [{ product, usage, sku, canQuote: optionNames.has(sku) && pricedIds.has(sku) }]
      : [];
  });
  return (
    <main id="main-content" className={styles.page}>
      <h1 className={styles.guideTitle}>จัดสเปคแท่นชั่ง</h1>
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
            {sets.map(({ product, usage, sku, canQuote }) => (
              <li key={product.id} className={styles.card}>
                <h3>
                  <Link href={`/products/${product.slug}`}>{product.name}</Link>
                </h3>
                <p>{usage}</p>
                {canQuote && (
                  <QuoteSelectionLink models={[sku]}>ขอใบเสนอราคาชุดนี้</QuoteSelectionLink>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>ขณะนี้ชุดแนะนำยังไม่พร้อมแสดง สามารถปรึกษา SUNFORD เพื่อเลือกชุดที่เหมาะกับงานได้</p>
        )}
      </section>
      <h2 className={styles.guideTitle}>คู่มือเลือกตามลักษณะงาน</h2>
      <div className={styles.grid}>
        {guideGroups.map(({ title, entries, showConnections }) => (
          <details className={styles.card} key={title}>
            <summary>
              <strong>{title}</strong>
            </summary>
            <div className={styles.body}>
              {!entries.length && <p>ยังไม่มีข้อมูลยืนยันสำหรับกลุ่มนี้ในแค็ตตาล็อก</p>}
              {entries.map((option) => (
                <div key={option.code}>
                  <Link href={option.detailHref}>{option.displayName}</Link>
                  {option.description && <p>{option.description}</p>}
                  {showConnections ? (
                    <ul>
                      {option.connections?.map((connection, index) => (
                        <li key={index}>{connection}</li>
                      ))}
                    </ul>
                  ) : (
                    Boolean(option.compatibleCodes?.length) && (
                      <dl>
                        <dt>
                          {option.kind === "head" ? "แท่นชั่งที่จับคู่ได้" : "หัวอ่านที่จับคู่ได้"}
                        </dt>
                        {option.compatibleCodes?.map((code) => (
                          <dd key={code}>{optionNames.get(code) ?? code}</dd>
                        ))}
                      </dl>
                    )
                  )}
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
