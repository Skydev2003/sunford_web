import { productCategoryDefinitions } from "./mock-categories";
import { getProductSubcategoryPageByHref } from "./product-subcategory-pages";

const submenuFeatures: Record<string, string> = {
  "scale-counting": "scale-counting",
  "scale-checkweighing": "scale-checkweighing",
  "indicator-rs232": "indicator-rs232",
  "indicator-waterproof": "ip67",
};

export const getSubmenuFeature = (subcategoryId: string) => submenuFeatures[subcategoryId];
export const productListingAnchor = (categoryId: string) => `product-listing-${categoryId}`;
export const productLineupAnchor = (categoryId: string) => `product-lineup-${categoryId}`;

export function catalogSubmenuDestination(href: string): string {
  if (href.includes("#")) return href;
  const subcategory = getProductSubcategoryPageByHref(href);
  if (subcategory) {
    const feature = getSubmenuFeature(subcategory.id);
    const anchor = productListingAnchor(subcategory.categoryId);
    if (!feature) return `${href}#${anchor}`;
    const target = new URL(href, "https://sunford.local");
    target.searchParams.set("feature", feature);
    return `${target.pathname}${target.search}#${anchor}`;
  }
  const category = productCategoryDefinitions.find(({ id }) => href === `/products/category/${id}`);
  return category ? `${href}#${productLineupAnchor(category.id)}` : href;
}
