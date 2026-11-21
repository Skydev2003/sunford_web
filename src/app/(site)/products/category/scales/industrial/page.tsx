import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteLoading } from "@/features/site/components/site-loading";
import { ScaleSubcategoryPage } from "@/features/catalog/components/scale-subcategory-page";

export const metadata: Metadata = { title: "เครื่องชั่งอุตสาหกรรมงานผลิต" };

export default function IndustrialScalesPage() {
  return (
    <Suspense fallback={<SiteLoading />}>
      <ScaleSubcategoryPage subcategoryId="scale-industrial" />
    </Suspense>
  );
}
