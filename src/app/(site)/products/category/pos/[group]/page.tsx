import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteLoading } from "@/features/site/components/site-loading";
import { ProductSubcategoryPage } from "@/features/catalog/components/product-subcategory-page";
import { posSubcategoryPages } from "@/features/catalog/data/product-subcategory-pages";

type Props = { params: Promise<{ group: string }> };

export function generateStaticParams() {
  return posSubcategoryPages.map((page) => ({ group: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group } = await params;
  return { title: posSubcategoryPages.find((page) => page.slug === group)?.title ?? "ไม่พบข้อมูล" };
}

export default function PosGroupPage({ params }: Props) {
  return (
    <Suspense fallback={<SiteLoading />}>
      <PosGroupContent params={params} />
    </Suspense>
  );
}

async function PosGroupContent({ params }: Props) {
  const { group } = await params;
  const page = posSubcategoryPages.find((item) => item.slug === group);
  if (!page) notFound();
  return <ProductSubcategoryPage categoryId="pos" subcategoryId={page.id} />;
}
