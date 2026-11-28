import type { OverviewRequest } from "@/features/catalog/data/catalog-overview-features";
import {
  ProductCategoryOverview,
  productCategoryMetadata,
} from "@/features/catalog/components/product-category-overview";

export const instant = false;
export const metadata = productCategoryMetadata("scales");

export default function Page({ searchParams }: { searchParams: OverviewRequest }) {
  return <ProductCategoryOverview categoryId="scales" searchParams={searchParams} />;
}
