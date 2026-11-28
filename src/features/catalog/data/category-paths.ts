import { productCategoryDefinitions } from "./mock-categories";

export type ProductCategorySlug = (typeof productCategoryDefinitions)[number]["id"];

export const productCategorySlugs = productCategoryDefinitions.map(({ id }) => id);

export function productCategoryPath(id: string) {
  return `/${id}`;
}

export function legacyProductCategoryPath(id: string) {
  return `/products/category/${id}`;
}

export function productCategoryAliasPath(id: string) {
  return `/products/${id}`;
}

export function isProductCategoryPath(pathname: string) {
  return productCategorySlugs.some((id) => pathname === productCategoryPath(id));
}
