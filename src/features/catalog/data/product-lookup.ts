import type { Product } from "../types";
import { getSnapshotProducts } from "@/features/content/data/catalog-snapshot";
import { productCategorySlugs } from "./category-paths";

export function productPrimaryCategory(product: Product) {
  return (
    productCategorySlugs.find((id) => id === (product.warehouseCategoryId ?? product.category)) ??
    "products"
  );
}

export function findCatalogProduct(products: Product[], slug: string) {
  const aliases: Record<string, string> = { lp50: "10728", lp51: "10730" };
  const target = aliases[slug.toLowerCase()] ?? slug;
  // Inventory variants of a model share one detail route. Prefer its prior public owner.
  const matches = products.filter((product) => product.slug === target);
  const exact =
    matches.find((product) => product.legacySlug?.toLowerCase() === target.toLowerCase()) ??
    matches.find((product) => product.price != null && product.price > 0 && product.image) ??
    matches[0];
  if (exact) return exact;
  const warehouseAlias = /^warehouse-(.+)$/i.exec(target);
  const skuTarget = warehouseAlias?.[1] ?? target;
  const sku = products.find(
    (product) =>
      product.warehouseSku?.toLowerCase() === skuTarget.toLowerCase() ||
      (warehouseAlias &&
        encodeURIComponent(product.warehouseSku ?? "").toLowerCase() === skuTarget.toLowerCase()),
  );
  if (sku) return sku;
  const previous = products.find((product) => product.legacySlug === target);
  if (previous) return previous;
  const legacy = getSnapshotProducts().find(
    (product) => product.slug === target || product.sourceId === target,
  );
  if (legacy)
    return products.find(
      (product) => product.id === legacy.id || product.sourceId === legacy.sourceId,
    );
  return products.find(
    (product) =>
      product.slug.toLowerCase() === target.toLowerCase() ||
      product.legacySlug?.toLowerCase() === target.toLowerCase() ||
      product.sourceId?.toLowerCase() === target.toLowerCase(),
  );
}
