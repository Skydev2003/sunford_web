import type { Metadata } from "next";
import { Suspense } from "react";
import { ScaleSubcategoryPage } from "@/features/catalog/components/scale-subcategory-page";

export const metadata: Metadata = { title: "เครื่องชั่งอุตสาหกรรมงานผลิต" };

export default function IndustrialScalesPage() {
  return (
    <Suspense fallback={<p role="status">กำลังโหลดหมวดสินค้า…</p>}>
      <ScaleSubcategoryPage subcategoryId="scale-industrial" />
    </Suspense>
  );
}
