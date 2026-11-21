import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteLoading } from "@/features/site/components/site-loading";
import { ProductSubcategoryPage } from "@/features/catalog/components/product-subcategory-page";
import { accessorySubcategoryPages } from "@/features/catalog/data/product-subcategory-pages";
import { additionalAccessorySubcategoryPages } from "@/features/catalog/data/additional-subcategory-pages";

type Props = { params: Promise<{ group: string }> };
const pages = [...accessorySubcategoryPages, ...additionalAccessorySubcategoryPages];

export function generateStaticParams() {
  return pages.map((page) => ({ group: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group } = await params;
  return {
    title: pages.find((page) => page.slug === group)?.title ?? "ไม่พบข้อมูล",
  };
}

export default function AccessoryGroupPage({ params }: Props) {
  return (
    <Suspense fallback={<SiteLoading />}>
      <AccessoryGroupContent params={params} />
    </Suspense>
  );
}

async function AccessoryGroupContent({ params }: Props) {
  const { group } = await params;
  const page = pages.find((item) => item.slug === group);
  if (!page) notFound();
  return <ProductSubcategoryPage categoryId="accessories" subcategoryId={page.id} />;
}
