import type { Metadata } from "next";
import { Suspense } from "react";
import { ScaleSpecBuilder } from "@/features/content/components/scale-spec-builder";
import styles from "@/features/content/components/indicator-platform-compatibility-page.module.css";
import { pricedProducts } from "@/features/catalog/data/quotation";
import { scaleSpecBuilderPath } from "@/features/catalog/data/scale-spec-builder-path";
import { getProducts } from "@/features/catalog/server/product-repository";
import { SiteLoading } from "@/features/site/components/site-loading";
import { catalogPageTitles } from "@/features/site/data/site-menu-labels";

export function generateMetadata(): Metadata {
  const title = "จัดสเปคเครื่องชั่งและอุปกรณ์เสริม";
  const description = "เลือกรุ่นเครื่องชั่งและอุปกรณ์เสริม SUNFORD เพื่อเตรียมใบเสนอราคา";
  const canonical = `https://sunford-web.vercel.app${scaleSpecBuilderPath}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

async function ScaleSelection() {
  const products = pricedProducts(await getProducts()).filter(
    ({ categoryId }) => categoryId === "scales" || categoryId === "accessories",
  );
  if (!products.length) return <p>ยังไม่มีเครื่องชั่งหรืออุปกรณ์เสริมที่ออกใบเสนอราคาออนไลน์ได้</p>;
  return <ScaleSpecBuilder products={products} />;
}

export default function ScaleSpecBuilderPage() {
  return (
    <main id="main-content" className={styles.page}>
      <header className="content-heading">
        <h1>{catalogPageTitles[scaleSpecBuilderPath]}</h1>
      </header>
      <Suspense fallback={<SiteLoading label="กำลังโหลดสินค้าที่ออกใบเสนอราคาได้…" />}>
        <ScaleSelection />
      </Suspense>
    </main>
  );
}
