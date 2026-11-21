import type { Metadata } from "next";
import { Suspense } from "react";
import { productCardData } from "@/features/catalog/data/client-products";
import {
  createSpecificationIndex,
  specificationQueryLimit,
} from "@/features/catalog/data/technical-specifications";
import { getStorefrontProducts } from "@/features/catalog/server/product-repository";
import {
  installationGuides,
  productAdvice,
  usageGuide,
} from "@/features/content/data/technical-manuals";
import styles from "./technical-specification.module.css";
import { SpecificationResults } from "./specification-results";

const title = "คู่มือและสเปก";

export const metadata: Metadata = {
  title,
  description: "ค้นหาสเปกสินค้าซันฟอร์ดด้วยรหัส SKU หรือชื่อรุ่น และอ่านคู่มือการใช้งานและติดตั้ง",
};

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export default function TechnicalSpecificationPage({ searchParams }: Props) {
  return (
    <main className={`source-content-page ${styles.page}`} id="main-content">
      <header className="content-heading container">
        <h1>{title}</h1>
      </header>
      <section className="container" aria-labelledby="spec-search-heading" id="spec-search">
        <h2 id="spec-search-heading">ค้นหาสเปกสินค้า</h2>
        <Suspense
          fallback={
            <>
              <p className={styles.loading} role="status">
                กำลังโหลดข้อมูลสินค้า…
              </p>
              <noscript>
                <a href="#spec-results">ไปที่แบบค้นหาสเปกสินค้า</a>
              </noscript>
            </>
          }
        >
          <SpecificationSearch searchParams={searchParams} />
        </Suspense>
      </section>
      <ManualLinks title="คู่มือการใช้งาน" links={[usageGuide, ...productAdvice]} />
      <ManualLinks title="คู่มือติดตั้งและไฟล์ประกอบ" links={installationGuides} />
    </main>
  );
}

async function SpecificationSearch({ searchParams }: Props) {
  const [{ q }, products] = await Promise.all([searchParams, getStorefrontProducts()]);
  const query = (typeof q === "string" ? q : (q?.[0] ?? ""))
    .slice(0, specificationQueryLimit)
    .trim();
  const index = createSpecificationIndex(products, (product) => {
    const { slug, name, image } = productCardData(product);
    return { slug, name, image };
  });
  return <SpecificationResults index={index} initialQuery={query} />;
}

function ManualLinks({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <section className="container">
      <h2>{title}</h2>
      <ul className={styles.manuals}>
        {links.map(({ label, href }) => (
          <li key={href}>
            <a className="button button-outline" href={href}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
