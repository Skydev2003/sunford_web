import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getScaleApplications } from "@/features/catalog/server/scale-applications";
import styles from "./scale-applications.module.css";

export const instant = false;
export const ensureStatic = "navigation";

export const metadata: Metadata = { title: "เลือกเครื่องชั่งตามการใช้งาน" };

export default async function ScaleApplicationsPage() {
  const applications = await getScaleApplications();
  return (
    <main id="main-content" className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="เส้นทางนำทาง">
        <Link href="/products/category/scales">เครื่องชั่ง</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">เลือกตามการใช้งาน</span>
      </nav>
      <h1 className={styles.heading}>เลือกเครื่องชั่งตามการใช้งาน</h1>
      <ul className={styles.list}>
        {applications.map(({ slug, label }) => (
          <li key={slug}>
            <Link
              className={styles.groupLink}
              href={`/products/category/scales/applications/${slug}`}
            >
              {label}
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
