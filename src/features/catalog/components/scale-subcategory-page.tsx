import { ProductSubcategoryPage } from "./product-subcategory-page";

export function ScaleSubcategoryPage({ subcategoryId }: { subcategoryId: string }) {
  return <ProductSubcategoryPage categoryId="scales" subcategoryId={subcategoryId} />;
}
