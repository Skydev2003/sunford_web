import { isProductCategoryPath } from "@/features/catalog/data/category-paths";

export function isCatalogOverviewPath(pathname: string) {
  return pathname === "/products" || isProductCategoryPath(pathname);
}
