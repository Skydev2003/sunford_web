import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductSubcategoryPage } from "@/features/catalog/components/product-subcategory-page";
import { accessorySubcategoryPages } from "@/features/catalog/data/product-subcategory-pages";

type Props = { params: Promise<{ group: string }> };

export function generateStaticParams() {
  return accessorySubcategoryPages.map((page) => ({ group: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group } = await params;
  return {
    title: accessorySubcategoryPages.find((page) => page.slug === group)?.title ?? "ไม่พบข้อมูล",
  };
}

export default function AccessoryGroupPage({ params }: Props) {
  return (
    <Suspense fallback={<p role="status">กำลังโหลดหมวดสินค้า…</p>}>
      <AccessoryGroupContent params={params} />
    </Suspense>
  );
}

async function AccessoryGroupContent({ params }: Props) {
  const { group } = await params;
  const page = accessorySubcategoryPages.find((item) => item.slug === group);
  if (!page) notFound();
  return <ProductSubcategoryPage categoryId="accessories" subcategoryId={page.id} />;
}
