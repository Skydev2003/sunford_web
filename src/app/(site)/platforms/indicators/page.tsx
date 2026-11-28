import {
  ProductCategoryOverview,
  productCategoryMetadata,
} from "@/features/catalog/components/product-category-overview";
import {
  platformIndicatorsPath,
  type OverviewRequest,
} from "@/features/catalog/data/catalog-overview-features";

export const instant = false;

export function generateMetadata() {
  return productCategoryMetadata("indicators", platformIndicatorsPath);
}

export default function Page({ searchParams }: { searchParams: OverviewRequest }) {
  return <ProductCategoryOverview categoryId="indicators" searchParams={searchParams} />;
}
