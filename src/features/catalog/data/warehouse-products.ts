import mapping from "./warehouse-product-mapping.json";
import type { Product } from "../types";

export type WarehouseItem = {
  sku: string;
  product_name: string;
  unit: string;
  sale_price: number | null;
  image_url: string | null;
};

export function parseWarehouseProducts(data: unknown): {
  total_count: number;
  items: WarehouseItem[];
} {
  if (!data || typeof data !== "object") throw new Error("Invalid Warehouse product list");
  const list = data as { total_count?: unknown; items?: unknown };
  const skus = new Set<string>();
  if (!Array.isArray(list.items) || list.total_count !== list.items.length)
    throw new Error("Incomplete Warehouse product list");
  for (const item of list.items) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item.sku !== "string" ||
      !item.sku.trim() ||
      item.sku !== item.sku.trim() ||
      skus.has(item.sku.toUpperCase()) ||
      typeof item.product_name !== "string" ||
      !item.product_name.trim() ||
      typeof item.unit !== "string" ||
      !item.unit.trim() ||
      (item.image_url !== null && typeof item.image_url !== "string") ||
      (item.sale_price !== null &&
        (typeof item.sale_price !== "number" ||
          !Number.isFinite(item.sale_price) ||
          item.sale_price < 0 ||
          !Number.isSafeInteger(Math.round(item.sale_price * 100))))
    )
      throw new Error("Invalid Warehouse product item");
    skus.add(item.sku.toUpperCase());
  }
  return list as { total_count: number; items: WarehouseItem[] };
}

const modelKey = (family: string | null, code: string) =>
  `${family}:${code.toUpperCase().replace(/[^A-Z0-9]/g, "")}`;
const candidates = mapping.items.filter(
  (item) =>
    item.skuPreference === "primary_group" &&
    item.sku.startsWith("G") &&
    item.status === "mapped" &&
    item.categoryId &&
    item.subcategoryIds.length &&
    item.legacyProductCandidateIds.length <= 1,
);
const occurrences = new Map<string, number>();
for (const item of candidates) {
  for (const key of new Set([
    ...item.modelCodes.map((code) => modelKey(item.categoryId, code)),
    ...item.legacyProductCandidateIds.map((id) => `legacy:${id}`),
  ]))
    occurrences.set(key, (occurrences.get(key) ?? 0) + 1);
}

export const approvedWarehouseMappings = candidates.filter((item) =>
  [
    ...item.modelCodes.map((code) => modelKey(item.categoryId, code)),
    ...item.legacyProductCandidateIds.map((id) => `legacy:${id}`),
  ].every((key) => occurrences.get(key) === 1),
);

export function warehouseCatalog(items: WarehouseItem[], editorial: Product[]): Product[] {
  const live = new Map(items.map((item) => [item.sku, item]));
  const content = new Map(editorial.map((item) => [item.id, item]));
  return approvedWarehouseMappings
    .flatMap((entry, index): Product[] => {
      const item = live.get(entry.sku);
      if (!item) return [];
      const legacyId = entry.legacyProductCandidateIds[0];
      const existing = legacyId ? content.get(legacyId) : undefined;
      if (legacyId && !existing) return [];
      const net = item.sale_price === null ? null : Math.round(item.sale_price * 100);
      const gross =
        net === null ? null : net + Number((BigInt(net) * BigInt(7) + BigInt(50)) / BigInt(100));
      if (gross !== null && !Number.isSafeInteger(gross)) return [];
      return [
        {
          id: existing?.id ?? `warehouse-${item.sku}`,
          slug: existing?.slug ?? `warehouse-${encodeURIComponent(item.sku)}`,
          name: item.product_name,
          category:
            existing?.category ??
            (entry.categoryId === "scales" ? "industrial" : entry.categoryId!),
          subtitle: existing?.subtitle ?? "",
          description: existing?.description ?? "",
          image:
            existing?.image ||
            (item.image_url ? `/api/products/${encodeURIComponent(item.sku)}/image` : ""),
          capacity: existing?.capacity ?? "—",
          readability: existing?.readability ?? "—",
          connection: existing?.connection ?? "—",
          badge: existing?.badge ?? null,
          featured: existing?.featured ?? false,
          sortOrder: existing?.sortOrder ?? 1000 + index,
          sourceId: existing?.sourceId,
          sourceUrl: existing?.sourceUrl,
          media: existing?.media
            ? { ...existing.media, price: gross === null || net === 0 ? null : gross / 100 }
            : undefined,
          price: gross === null || net === 0 ? null : gross / 100,
          imageOverridden: existing?.imageOverridden,
          warehouseSku: item.sku,
          warehouseUnit: item.unit,
          warehouseNetUnitSatang: net,
          warehouseCategoryId: entry.categoryId!,
          warehouseSubcategoryIds: entry.subcategoryIds,
          warehouseModelCodes: entry.modelCodes,
        },
      ];
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
