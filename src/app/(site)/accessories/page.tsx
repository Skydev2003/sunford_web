import type { OverviewRequest } from "@/features/catalog/data/catalog-overview-features";
import {
  ProductCategoryOverview,
  productCategoryMetadata,
} from "@/features/catalog/components/product-category-overview";

export const instant = false;
export const metadata = productCategoryMetadata("accessories");

export default function Page({ searchParams }: { searchParams: OverviewRequest }) {
  return <ProductCategoryOverview categoryId="accessories" searchParams={searchParams} />;
}
