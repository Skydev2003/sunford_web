import type { Metadata } from "next";
import Link from "next/link";
import { CatalogNavigationLink } from "@/features/catalog/components/catalog-navigation-link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CatalogProductCard } from "@/features/catalog/components/catalog-product-card";
import { warehouseBlurDataURL } from "@/features/catalog/server/warehouse-image-previews";
import { getScaleApplicationListings } from "@/features/catalog/server/scale-applications";
import { scaleApplicationCopy } from "./application-copy";
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
  const description = scaleApplicationCopy.get(application.slug);

  return (
    <main id="main-content" className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="เส้นทางนำทาง">
        <CatalogNavigationLink href="/products/category/scales">เครื่องชั่ง</CatalogNavigationLink>
        <ChevronRight size={14} aria-hidden="true" />
        <CatalogNavigationLink href="/products/category/scales/applications">
          เลือกตามการใช้งาน
        </CatalogNavigationLink>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{application.label}</span>
      </nav>
      <h1 className={styles.heading}>{application.label}</h1>
      {description && <p className={styles.description}>{description}</p>}
      {application.products.length ? (
        <ul className={styles.list} aria-label="เครื่องชั่งสำหรับงานนี้">
          {application.products.map(({ card, conditional }, index) => (
            <li key={card.id}>
              <CatalogProductCard
                product={card}
                headingLevel={2}
                modelOnly
                categoryLift
                prioritizeImage={index < 6}
                imageBlurDataURL={index < 6 ? warehouseBlurDataURL(card.image) : undefined}
              />
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
