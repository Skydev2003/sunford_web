import type { Metadata } from "next";
import { ArrowDown, ArrowUpRight, Download } from "lucide-react";
import styles from "./download.module.css";

const title = "ดาวน์โหลดซอฟต์แวร์";
const description = "เลือกไฟล์ติดตั้งตามรุ่นสินค้าและระบบปฏิบัติการของคุณ";
const driveFile = (id: string) => `https://drive.google.com/file/d/${id}/view`;
const googlePlay = (id: string) => `https://play.google.com/store/apps/details?id=${id}`;

type Download = {
  platform: "Windows" | "Android" | "iOS";
  label: string;
  href: string;
  filename?: string;
};

const groups: {
  id: string;
  name: string;
  products: { name: string; downloads: Download[] }[];
}[] = [
  {
    id: "retail-software",
    name: "ค้าปลีก",
    products: [
      {
        name: "SUNFORD RLS1100",
        downloads: [
          {
            platform: "Windows",
            label: "เปิดตัวติดตั้ง",
            filename: "RLS1000_SETUP_SUNFORD_2.0.0_T7.exe",
            href: driveFile("1ISol4SrRrs5PqUhQVpgoUtEZmz3CVlSe"),
          },
        ],
      },
      {
        name: "SUNFORD RLS1800",
        downloads: [
          {
            platform: "Windows",
            label: "เปิดตัวติดตั้ง",
            filename: "517_RLS_SUNFORD_2.0.2.exe",
            href: driveFile("1F5d8ou7_pKoi9WWbMJDN0IEdW2r-ZjaM"),
          },
        ],
      },
      {
        name: "SUNFORD SmartRetail POS",
        downloads: [
          {
            platform: "Windows",
            label: "เปิดตัวติดตั้ง",
            filename: "Sunford POS [Setup].exe",
            href: driveFile("1jy6LilI-KZR4a4OPTB-C34s0ZWqk2ta5"),
          },
          {
            platform: "Windows",
            label: "เปิดไฟล์ประกอบ SQL Server Express 2019",
            filename: "SQL2019-SSEI-Expr.exe",
            href: driveFile("1RKNriODmduC0w3aOcZhmj0f52Rbvacln"),
          },
        ],
      },
    ],
  },
  {
    id: "industrial-software",
    name: "อุตสาหกรรม",
    products: [
      {
        name: "SUNFORD Connect INDUS 1.10",
        downloads: [
          {
            platform: "Windows",
            label: "เปิดไฟล์ ZIP",
            filename: "SUNFORD Connect INDUST V.1.10.zip",
            href: driveFile("10V84MFRieSg8HwQG1-4I_0WTT7oe4WEo"),
          },
        ],
      },
      {
        name: "LP Label Editor สำหรับ LP50",
        downloads: [
          {
            platform: "Windows",
            label: "เปิดตัวติดตั้ง",
            filename: "ScaleLabel-1.0.14.20200904.exe",
            href: driveFile("1PqrmTuq5CpOlncTFg9rJHUVCjGIZXkw5"),
          },
        ],
      },
      {
        name: "WeWeigh",
        downloads: [
          { platform: "Android", label: "Google Play", href: googlePlay("com.weweighApp") },
        ],
      },
    ],
  },
  {
    id: "household-software",
    name: "ครัวเรือนและสุขภาพ",
    products: [
      {
        name: "Fitdays",
        downloads: [
          { platform: "Android", label: "Google Play", href: googlePlay("cn.fitdays.fitdays") },
          {
            platform: "iOS",
            label: "App Store",
            href: "https://apps.apple.com/th/app/fitdays/id1434527961",
          },
        ],
      },
    ],
  },
];

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
