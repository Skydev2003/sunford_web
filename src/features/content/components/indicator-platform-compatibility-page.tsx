import Link from "next/link";
import { weighingAccessories, weighingGroups } from "../data/indicator-platform-compatibility";
import styles from "./indicator-platform-compatibility-page.module.css";
import { getProducts } from "@/features/catalog/server/product-repository";
import { getWeighingOptions } from "../data/weighing-options";
import { WeighingBuilder } from "./weighing-builder";

const guideModelDetails: Record<string, string> = {
  "Indicator-WP31EUSB": "จอ LED พร้อม USB กันน้ำ · IP67",
  JC62Z: "จอ LCD แสดงน้ำหนัก ราคาต่อหน่วย และยอดรวม",
  JE62ZR: "จอ LED แสดงน้ำหนัก ราคาต่อหน่วย และยอดรวม",
};

export async function IndicatorPlatformCompatibilityPage() {
  const products = await getProducts();
  const options = getWeighingOptions(products);
  return (
    <main id="main-content" className={styles.page}>
      <h1 className={styles.screenReaderTitle}>จัดสเปคเครื่องชั่ง</h1>
      <WeighingBuilder options={options} />
      <h2 className={styles.guideTitle}>คู่มือเลือกตามลักษณะงาน</h2>
      <div className={styles.grid}>
        {weighingGroups.map((group, index) => (
          <details key={group.title} className={styles.card}>
            <summary>
              <span className={styles.meta}>
                {group.display} · {group.capacity}
              </span>
              <strong>{group.title}</strong>
              <span>{group.purpose}</span>
            </summary>
            <div className={styles.body}>
              <h2 id={`guide-heads-${index}`} className={styles.anchor}>
                หัวอ่านที่ใช้
              </h2>
              <div className={styles.headModels}>
                {options
                  .filter((o) => o.kind === "head" && o.group === group.title)
                  .map((o) =>
                    o.detailHref.startsWith("#") ? (
                      <section
                        key={o.code}
                        id={o.detailHref.slice(1)}
                        className={styles.headCard}
                        tabIndex={-1}
                      >
                        <h3>{o.code}</h3>
                        <p>{guideModelDetails[o.code] ?? o.description}</p>
                      </section>
                    ) : (
                      <Link
                        key={o.code}
                        href={o.detailHref}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {o.code}
                      </Link>
                    ),
                  )}
              </div>
              <p>{group.functions}</p>
              <p>{group.connection}</p>
              <h2>แท่นชั่งที่ใช้ร่วมกัน</h2>
              <dl>
                {group.platforms.map(([type, models]) => (
                  <div key={type}>
                    <dt>{type}</dt>
                    <dd>
                      {models.split(", ").map((code, index) => (
                        <span key={code}>
                          {index > 0 && ", "}
                          <span
                            className={styles.modelTarget}
                            id={`platform-card-${code}`}
                            tabIndex={-1}
                          >
                            {code}
                          </span>
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </details>
        ))}
      </div>
      <details className={styles.accessories}>
        <summary>
          <strong>อุปกรณ์เสริมและสายสัญญาณ</strong>
        </summary>
        <dl className={styles.body}>
          {weighingAccessories.map(([code, usage]) => (
            <div key={code}>
              <dt>
                {code.split(" / ").map((model, index) => (
                  <span key={model}>
                    {index > 0 && " / "}
                    <span
                      className={styles.modelTarget}
                      id={`accessory-card-${model}`}
                      tabIndex={-1}
                    >
                      {model}
                    </span>
                  </span>
                ))}
              </dt>
              <dd>{usage}</dd>
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
