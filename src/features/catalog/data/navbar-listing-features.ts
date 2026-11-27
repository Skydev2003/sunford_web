import type { Product } from "../types";
import type { ProductCategory } from "./mock-categories";
import { getSubmenuFeature, productListingFeatureHref } from "./catalog-submenu-destinations";
import { getProductListingFeatures } from "./product-listing-features";
import { isPlatformPlacementId } from "./platform-subcategory-definitions";
import { productSubcategoryPages, resolveListingSubcategory } from "./product-subcategory-pages";

export type NavbarListingFeatures = Record<string, { label: string; href: string }[]>;

const preferredScalePage: Record<string, string> = {
  "device-connection": "scale-industrial",
  "water-resistant": "scale-water-dust",
  "price-computing": "scale-price",
};

const scaleFeatureOrder = [
  "device-connection",
  "water-resistant",
  "price-computing",
  "scale-counting",
  "scale-checkweighing",
];

export function buildNavbarListingFeatures(
  categories: readonly Pick<ProductCategory, "id" | "subcategories">[],
  products: readonly Product[],
  disabledHrefs: readonly string[] = [],
): NavbarListingFeatures {
  const published = products.filter(({ warehouseSku }) => warehouseSku);
  const disabled = new Set(disabledHrefs);
  return Object.fromEntries(
    categories.map((category) => {
      const candidates = productSubcategoryPages
        .filter(
          ({ categoryId, href, id }) =>
            categoryId === category.id &&
            !disabled.has(href) &&
            (categoryId !== "platforms" || isPlatformPlacementId(id)),
        )
        .flatMap((page) => {
          const child = resolveListingSubcategory(page, category, published);
          if (!child) return [];
          const ids = new Set(child.productIds);
          return getProductListingFeatures(
            category.id,
            page.id,
            published.filter(({ id }) => ids.has(id)),
          )
            .filter(({ exclusiveGroup }) => exclusiveGroup !== "material")
            .map(({ id, label, productIds }) => ({
              label,
              href: productListingFeatureHref(page.href, category.id, id),
              count: productIds.length,
              order: scaleFeatureOrder.indexOf(id),
              preferred: getSubmenuFeature(page.id) === id || preferredScalePage[id] === page.id,
            }));
        })
        .filter(({ href }) => !disabled.has(href));
      const ranked = candidates.sort((first, second) => second.count - first.count);
      const byLabel = new Map<string, (typeof ranked)[number]>();
      for (const candidate of ranked) {
        const current = byLabel.get(candidate.label);
        if (!current || (candidate.preferred && !current.preferred)) {
          byLabel.set(candidate.label, candidate);
        }
      }
      const links = [...byLabel.values()]
        .slice(0, 6)
        .sort((first, second) =>
          category.id === "scales"
            ? first.order - second.order
            : first.label.length - second.label.length,
        )
        .map(({ label, href }) => ({ label, href }));
      return [`/products/category/${category.id}`, links];
    }),
  );
}
