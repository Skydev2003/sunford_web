import Link from "next/link";
import styles from "./indicator-platform-compatibility-page.module.css";
import { getProducts } from "@/features/catalog/server/product-repository";
import { getWeighingOptions } from "../data/weighing-options";
import { WeighingBuilder } from "./weighing-builder";
export async function IndicatorPlatformCompatibilityPage() {
  const products = await getProducts(),
    options = getWeighingOptions(products);
  return (
    <main id="main-content" className={styles.page}>
      <h1 className={styles.screenReaderTitle}>จัดสเปคเครื่องชั่ง</h1>
      <WeighingBuilder options={options} />
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
      <Link className={styles.contact} href="/contact-us">
        ปรึกษาเรื่องชุดชั่งกับ SUNFORD ›
      </Link>
    </main>
  );
}
