import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductSubcategoryPage } from "@/features/catalog/components/product-subcategory-page";
import { platformSubcategoryPages } from "@/features/catalog/data/product-subcategory-pages";

type Props = { params: Promise<{ group: string }> };

export function generateStaticParams() {
  return platformSubcategoryPages.map((page) => ({ group: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group } = await params;
  return {
    title: platformSubcategoryPages.find((page) => page.slug === group)?.title ?? "ไม่พบข้อมูล",
  };
}

export default async function PlatformGroupPage({ params }: Props) {
  const { group } = await params;
  const page = platformSubcategoryPages.find((item) => item.slug === group);
  if (!page) notFound();
  return <ProductSubcategoryPage categoryId="platforms" subcategoryId={page.id} />;
}
