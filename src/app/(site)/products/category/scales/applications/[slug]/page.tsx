import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CatalogProductCard } from "@/features/catalog/components/catalog-product-card";
import { getScaleApplicationListings } from "@/features/catalog/server/scale-applications";
import styles from "../scale-applications.module.css";

type Props = { params: Promise<{ slug: string }> };

export const instant = false;
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  return (await getScaleApplicationListings()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const application = (await getScaleApplicationListings()).find((item) => item.slug === slug);
  if (!application) notFound();
  return { title: application.label };
}

export default async function ScaleApplicationPage({ params }: Props) {
  const { slug } = await params;
  const application = (await getScaleApplicationListings()).find((item) => item.slug === slug);
  if (!application) notFound();

  return (
    <main id="main-content" className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="เส้นทางนำทาง">
        <Link href="/products/category/scales">เครื่องชั่ง</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <Link href="/products/category/scales/applications">เลือกตามการใช้งาน</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{application.label}</span>
      </nav>
      <h1 className={styles.heading}>{application.label}</h1>
      {application.products.length ? (
        <ul className={styles.list} aria-label="เครื่องชั่งสำหรับงานนี้">
          {application.products.map(({ card, conditional }) => (
            <li key={card.id}>
              <CatalogProductCard product={card} headingLevel={2} modelOnly categoryLift />
              {conditional && (
                <p className={styles.conditional}>ใช้ได้บางกรณี ควรตรวจสเปกให้ตรงกับงาน</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>ยังไม่มีรุ่นที่ยืนยันสำหรับงานนี้</p>
      )}
      <Link href="/contact-us" className={styles.contact}>
        ปรึกษาการเลือกเครื่องชั่ง
      </Link>
    </main>
  );
}
