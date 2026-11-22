import type { Metadata } from "next";
import { ArrowDown, ArrowUpRight, Download } from "lucide-react";
import { softwareDownloadGroups as groups } from "@/features/content/data/software-downloads";
import styles from "./download.module.css";

const title = "ดาวน์โหลดซอฟต์แวร์";
const description = "เลือกไฟล์ติดตั้งตามรุ่นสินค้าและระบบปฏิบัติการของคุณ";
export const metadata: Metadata = { title, description };

export default function SoftwareDownloadPage() {
  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.intro}>
        <div className={styles.container}>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </header>

      <div className={`${styles.container} ${styles.directory}`}>
        <nav className={styles.navigation} aria-label="ไปยังหมวดซอฟต์แวร์">
          {groups.map(({ id, name }) => (
            <a key={id} href={`#${id}`}>
              {name}
              <ArrowDown size={16} aria-hidden="true" />
            </a>
          ))}
        </nav>

        <div className={styles.groups}>
          {groups.map(({ id, name, products }) => (
            <section key={id} id={id} className={styles.group} aria-labelledby={`${id}-heading`}>
              <h2 id={`${id}-heading`}>{name}</h2>
              {Object.entries(
                Object.groupBy(products, ({ downloads }) =>
                  [...new Set(downloads.map(({ platform }) => platform))].join(" และ "),
                ),
              ).map(([platforms, models]) => (
                <div className={styles.system} key={platforms}>
                  <h3>{platforms}</h3>
                  <ul className={styles.products} role="list">
                    {models?.map((product) => (
                      <li key={product.name} className={styles.product}>
                        <h4>{product.name}</h4>
                        <ul className={styles.downloads} role="list">
                          {product.downloads.map(({ platform, label, href, filename }) => (
                            <li key={href}>
                              <a
                                className={styles.download}
                                href={href}
                                aria-label={`${label} ${product.name} สำหรับ ${platform}`}
                              >
                                <Download
                                  size={19}
                                  aria-hidden="true"
                                  className={styles.fileIcon}
                                />
                                <span className={styles.downloadCopy}>
                                  <strong>{label}</strong>
                                  <span>{filename ?? platform}</span>
                                </span>
                                <ArrowUpRight
                                  size={17}
                                  aria-hidden="true"
                                  className={styles.arrow}
                                />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
