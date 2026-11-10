import type { Metadata } from "next";
import { ScaleSubcategoryPage } from "@/features/catalog/components/scale-subcategory-page";

export const metadata: Metadata = { title: "เครื่องชั่งอุตสาหกรรมงานผลิต" };

export default function IndustrialScalesPage() {
  return <ScaleSubcategoryPage subcategoryId="scale-industrial" />;
}
