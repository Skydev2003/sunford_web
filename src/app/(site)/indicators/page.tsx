import {
  ProductCategoryOverview,
  productCategoryMetadata,
} from "@/features/catalog/components/product-category-overview";

export const ensureStatic = "navigation";
export const metadata = productCategoryMetadata("indicators");

export default function Page() {
  return <ProductCategoryOverview categoryId="indicators" />;
}
