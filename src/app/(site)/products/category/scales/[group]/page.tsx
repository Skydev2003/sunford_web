import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScaleSubcategoryPage } from "@/features/catalog/components/scale-subcategory-page";
import { scaleSubcategoryPages } from "@/features/catalog/data/scale-subcategory-pages";

type Props = { params: Promise<{ group: string }> };

export function generateStaticParams() {
  return scaleSubcategoryPages
    .filter((page) => page.slug !== "industrial")
    .map((page) => ({ group: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group } = await params;
  return {
    title: scaleSubcategoryPages.find((page) => page.slug === group)?.label ?? "ไม่พบข้อมูล",
  };
}

export default async function ScaleGroupPage({ params }: Props) {
  const { group } = await params;
  const page = scaleSubcategoryPages.find((item) => item.slug === group);
  if (!page) notFound();
  return <ScaleSubcategoryPage subcategoryId={page.id} />;
}
