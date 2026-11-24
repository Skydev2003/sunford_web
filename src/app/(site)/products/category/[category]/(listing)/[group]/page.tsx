import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductSubcategoryPage } from "@/features/catalog/components/product-subcategory-page";
import { productSubcategoryPages } from "@/features/catalog/data/product-subcategory-pages";
import { getSubmenuFeature } from "@/features/catalog/data/catalog-submenu-destinations";
import styles from "@/features/catalog/components/product-directory.module.css";
import overview from "@/features/catalog/components/products-overview.module.css";

type Props = {
  params: Promise<{ category: string; group: string }>;
  searchParams: Promise<{ feature?: string | string[] }>;
};

export function generateStaticParams() {
  return productSubcategoryPages.map(({ categoryId, slug }) => ({
    category: categoryId,
    group: slug,
  }));
}

async function getDefinition(params: Props["params"]) {
  const { category, group } = await params;
  return productSubcategoryPages.find(
    (page) => page.categoryId === category && page.slug === group,
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const definition = await getDefinition(params);
  if (definition?.id === "scale-industrial") return { title: "เครื่องชั่งอุตสาหกรรมงานผลิต" };
  return {
    title:
      (definition?.categoryId === "scales" ? definition.label : definition?.title) ?? "ไม่พบข้อมูล",
  };
}

async function ListingContent({ params, searchParams }: Props) {
  const definition = await getDefinition(params);
  if (!definition) notFound();
  const feature = getSubmenuFeature(definition.id);
  const initialFeature = feature && (await searchParams).feature === feature ? feature : undefined;
  return (
    <ProductSubcategoryPage
      categoryId={definition.categoryId}
      subcategoryId={definition.id}
      initialFeature={initialFeature}
    />
  );
}

export default function ListingPage(props: Props) {
  return (
    <Suspense
      fallback={
        <p role="status" className={`${overview.sectionInner} ${styles.listingLoading}`}>
          กำลังโหลดรายการสินค้า…
        </p>
      }
    >
      <ListingContent {...props} />
    </Suspense>
  );
}
