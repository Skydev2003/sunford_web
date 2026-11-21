import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteLoading } from "@/features/site/components/site-loading";
import { ScaleSubcategoryPage } from "@/features/catalog/components/scale-subcategory-page";
import { scaleSubcategoryPages } from "@/features/catalog/data/scale-subcategory-pages";
import { additionalScaleSubcategoryPages } from "@/features/catalog/data/additional-subcategory-pages";

type Props = { params: Promise<{ group: string }> };
const pages = [...scaleSubcategoryPages, ...additionalScaleSubcategoryPages];

export function generateStaticParams() {
  return pages.filter((page) => page.slug !== "industrial").map((page) => ({ group: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group } = await params;
  return {
    title: pages.find((page) => page.slug === group)?.label ?? "ไม่พบข้อมูล",
  };
}

export default function ScaleGroupPage({ params }: Props) {
  return (
    <Suspense fallback={<SiteLoading />}>
      <ScaleGroupContent params={params} />
    </Suspense>
  );
}

async function ScaleGroupContent({ params }: Props) {
  const { group } = await params;
  const page = pages.find((item) => item.slug === group);
  if (!page) notFound();
  return <ScaleSubcategoryPage subcategoryId={page.id} />;
}
