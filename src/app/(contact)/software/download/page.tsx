import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, BookOpen, Download, Factory, House, Store } from "lucide-react";
import { softwareDownloadGroups as groups } from "@/features/content/data/software-downloads";
import styles from "./download.module.css";

const title = "ดาวน์โหลดซอฟต์แวร์";
const description = "เลือกไฟล์ติดตั้งตามรุ่นและระบบปฏิบัติการ หรือดูคู่มือและวิดีโอการใช้งาน";
const supportLabel = "คู่มือและวิดีโอ";
const bannerIconProps = { "aria-hidden": true, strokeWidth: 1.5, className: styles.groupIcon };
const groupIcons: Record<string, ReactNode> = {
  "retail-software": <Store {...bannerIconProps} />,
  "industrial-software": <Factory {...bannerIconProps} />,
  "household-software": <House {...bannerIconProps} />,
};
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

      <div className={`${styles.container} ${styles.groups}`}>
        {groups.map(({ id, name, products }) => (
          <section key={id} id={id} className={styles.group} aria-labelledby={`${id}-heading`}>
            <h2 id={`${id}-heading`} className={styles.groupBanner}>
              <span>{name}</span>
              {groupIcons[id] ?? <Download {...bannerIconProps} />}
            </h2>
            {Object.entries(
              Object.groupBy(
                products,
                ({ downloads }) =>
                  [...new Set(downloads.map(({ platform }) => platform))].join(" และ ") ||
                  supportLabel,
              ),
            ).map(([platforms, models]) => (
              <div className={styles.system} key={platforms}>
                <h3>{platforms}</h3>
                <ul className={styles.products} role="list">
                  {models?.map((product) => (
                    <li key={product.name} className={styles.product}>
                      <h4>{product.name}</h4>
                      <ul className={styles.downloads} role="list">
                        {product.downloads.length ? (
                          product.downloads.map(({ platform, label, href, filename }) => (
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
                          ))
                        ) : (
                          <li>
                            <Link
                              className={styles.download}
                              href={`/software/download/${product.slug}`}
                              aria-label={`ดูคู่มือและวิดีโอ ${product.name}`}
                            >
                              <BookOpen size={19} aria-hidden="true" className={styles.fileIcon} />
                              <span className={styles.downloadCopy}>
                                <strong>ดูคู่มือและวิดีโอ</strong>
                              </span>
                              <ArrowUpRight size={17} aria-hidden="true" className={styles.arrow} />
                            </Link>
                          </li>
                        )}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
