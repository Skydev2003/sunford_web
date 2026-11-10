import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductSubcategoryPage } from "@/features/catalog/components/product-subcategory-page";
import { indicatorSubcategoryPages } from "@/features/catalog/data/product-subcategory-pages";

type Props = { params: Promise<{ group: string }> };

export function generateStaticParams() {
  return indicatorSubcategoryPages.map((page) => ({ group: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group } = await params;
  return {
    title: indicatorSubcategoryPages.find((page) => page.slug === group)?.title ?? "ไม่พบข้อมูล",
  };
}

export default async function IndicatorGroupPage({ params }: Props) {
  const { group } = await params;
  const page = indicatorSubcategoryPages.find((item) => item.slug === group);
  if (!page) notFound();
  return <ProductSubcategoryPage categoryId="indicators" subcategoryId={page.id} />;
}
