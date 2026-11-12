import type { Product } from "../types";
import { getSnapshotProducts } from "@/features/content/data/catalog-snapshot";

export function findCatalogProduct(products: Product[], slug: string) {
  const aliases: Record<string, string> = { lp50: "10728", lp51: "10730" };
  const target = aliases[slug.toLowerCase()] ?? slug;
  // Imported URLs can differ only by case. Resolve exact routes first so each
  // record remains individually editable/hideable without changing old URLs.
  const exact = products.find((product) => product.slug === target);
  if (exact) return exact;
  const sku = products.find(
    (product) => product.warehouseSku?.toLowerCase() === target.toLowerCase(),
  );
  if (sku) return sku;
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
      product.sourceId?.toLowerCase() === target.toLowerCase(),
  );
}
