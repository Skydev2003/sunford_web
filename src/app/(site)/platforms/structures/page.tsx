import {
  ProductCategoryOverview,
  productCategoryMetadata,
} from "@/features/catalog/components/product-category-overview";
import {
  platformStructuresPath,
  type OverviewRequest,
} from "@/features/catalog/data/catalog-overview-features";

export const instant = false;

export function generateMetadata() {
  return productCategoryMetadata(
    "platforms",
    platformStructuresPath,
    "โครงสร้างแท่นชั่ง",
    "สำรวจโครงสร้างแท่นชั่ง SUNFORD ทั้ง 5 รูปแบบ ตั้งแต่ Bench-top ถึง Weighing desk พร้อมกรองรุ่นตามลักษณะงานและวัสดุ",
  );
}

export default function Page({ searchParams }: { searchParams: OverviewRequest }) {
  return <ProductCategoryOverview categoryId="platforms" searchParams={searchParams} />;
}
