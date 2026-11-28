import { productCategoryPath } from "./category-paths";

const submenuFeatures: Record<string, string> = {
  "scale-counting": "scale-counting",
  "scale-checkweighing": "scale-checkweighing",
  "indicator-rs232": "indicator-rs232",
  "indicator-waterproof": "ip67",
};

export const getSubmenuFeature = (subcategoryId: string) => submenuFeatures[subcategoryId];
export const productListingAnchor = (categoryId: string) => `product-listing-${categoryId}`;
export const productLineupAnchor = (categoryId: string) => `product-lineup-${categoryId}`;

export const platformCatalogSections = {
  structures: productListingAnchor("platforms"),
  indicators: productLineupAnchor("indicators"),
};

export function productListingFeatureHref(categoryId: string, featureId: string, group?: string) {
  const query = new URLSearchParams({ feature: featureId });
  if (group) query.set("group", group);
  return `${productCategoryPath(categoryId)}?${query}`;
}

export function catalogSubmenuDestination(href: string): string {
  return href.split("#")[0];
}
