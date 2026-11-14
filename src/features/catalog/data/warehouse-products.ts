import mapping from "./warehouse-product-mapping.json";
import { warehouseDisplayName } from "./catalog-card-names";
import type { Product } from "../types";

export type WarehouseItem = {
  sku: string;
  product_name: string;
  product_short_name?: string | null;
  unit: string;
  sale_price: number | null;
  image_url: string | null;
  description?: string | null;
  group_name?: string | null;
  usage_family?: string | null;
};

const warehouseOnlySkus = new Set([
  "72",
  "CALIBRATION FEE TYPE 2",
  "S000005",
  "S000006",
  "DEVAPP",
  "G109767",
  "G109774",
  "G109781",
  "G109798",
  "G107992",
  "G108005",
]);
const warehouseOnlyGroups = new Set([
  "ค่าบริการ",
  "ค่าขนส่ง",
  "ส่วนลด",
  "บัตรกำนัล",
  "ถุงมือและอุปกรณ์ป้องกัน",
]);

export function isPublicWarehouseSku(sku: string) {
  return !/^x/i.test(sku) && !warehouseOnlySkus.has(sku.toUpperCase());
}

export function isPublicWarehouseItem(
  item: Pick<WarehouseItem, "sku" | "product_name" | "product_short_name" | "group_name">,
) {
  if (!isPublicWarehouseSku(item.sku) || warehouseOnlyGroups.has(item.group_name?.trim() ?? ""))
    return false;
  const names = [item.product_name, item.product_short_name ?? ""];
  return !names.some((name) =>
    /ถุงมือ|\bgloves?\b|(?:^|\s)ด้าย|ค่าบริการ|ค่าพัฒนาโปรแกรม|ค่าสอบเทียบ|ค่าขนส่ง|ค่าจัดส่ง|\b(?:service|customized|shipping|calibration)\s*fee\b/i.test(
      name,
    ),
  );
}

export function parseWarehouseProducts(data: unknown): {
  total_count: number;
  items: WarehouseItem[];
} {
  if (!data || typeof data !== "object") throw new Error("Invalid Warehouse product list");
  const list = data as { total_count?: unknown; items?: unknown };
  const skus = new Map<string, WarehouseItem>();
  if (!Array.isArray(list.items) || list.total_count !== list.items.length)
    throw new Error("Incomplete Warehouse product list");
  for (const item of list.items) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item.sku !== "string" ||
      !item.sku.trim() ||
      item.sku !== item.sku.trim() ||
      typeof item.product_name !== "string" ||
      !item.product_name.trim() ||
      (item.product_short_name !== undefined &&
        item.product_short_name !== null &&
        (typeof item.product_short_name !== "string" ||
          !item.product_short_name.trim() ||
          item.product_short_name !== item.product_short_name.trim())) ||
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
    const key = item.sku.toUpperCase();
    const previous = skus.get(key);
    if (
      previous &&
      (previous.sku !== item.sku ||
        previous.product_name !== item.product_name ||
        previous.product_short_name !== item.product_short_name ||
        previous.unit !== item.unit ||
        previous.sale_price !== item.sale_price ||
        previous.image_url !== item.image_url)
    )
      throw new Error("Conflicting Warehouse SKU");
    skus.set(key, item);
  }
  const items = [...skus.values()].filter(isPublicWarehouseItem);
  return { total_count: items.length, items };
}

const modelKey = (family: string | null, code: string) =>
  `${family}:${code.toUpperCase().replace(/[^A-Z0-9]/g, "")}`;
const candidates = mapping.items.filter(
  (item) =>
    item.useForIdentity !== false &&
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

const bySku = new Map(mapping.items.map((entry) => [entry.sku, entry]));
const verifiedBySku = new Map(approvedWarehouseMappings.map((entry) => [entry.sku, entry]));

export function warehousePhotoUrl(
  item: Pick<WarehouseItem, "sku" | "image_url">,
  saved?: string | null,
) {
  if (!item.image_url) return "";
  const version = new URL(item.image_url, "https://warehouse.invalid").searchParams.get("v");
  const source = saved || `/api/products/${encodeURIComponent(item.sku)}/image`;
  return version
    ? `${source}${source.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`
    : source;
}

export function warehouseCatalog(
  items: WarehouseItem[],
  editorial: Product[],
  savedImage?: (item: WarehouseItem) => string | null,
): Product[] {
  const content = new Map(editorial.map((item) => [item.id, item]));
  return items
    .filter(isPublicWarehouseItem)
    .flatMap((item, index): Product[] => {
      const entry = bySku.get(item.sku);
      const verified = verifiedBySku.get(item.sku);
      const categoryId =
        entry && ["mapped", "category_only"].includes(entry.status)
          ? (entry.categoryId ?? undefined)
          : undefined;
      const legacyId = verified?.legacyProductCandidateIds[0];
      const existing = legacyId ? content.get(legacyId) : undefined;
      const routeOwner = verified?.preserveWarehouseIdentity ? undefined : existing;
      const cmsImage = existing?.image || existing?.media?.gallery[0]?.image || "";
      const warehouseImage = warehousePhotoUrl(item, savedImage?.(item));
      const net = item.sale_price === null ? null : Math.round(item.sale_price * 100);
      if (net !== null && !Number.isSafeInteger(net)) return [];
      const price = net === null || net === 0 ? null : net / 100;
      const displaySource = item.product_short_name?.trim() || item.product_name.trim();
      const displayName = warehouseDisplayName(item.sku, displaySource);
      return [
        {
          id: routeOwner?.id ?? `warehouse-${item.sku}`,
          slug: routeOwner?.slug ?? `warehouse-${encodeURIComponent(item.sku)}`,
          name: displayName,
          storefrontName: displayName,
          warehouseName: item.product_name,
          warehouseGroup: item.group_name ?? "",
          warehouseUsageFamily: item.usage_family ?? "",
          warehouseCard: {
            image: warehouseImage,
            description: item.description?.trim() ?? "",
            subtitle: "",
            capacity: "",
            readability: "",
            connection: "",
          },
          category:
            existing?.category ??
            (categoryId === "scales" ? "industrial" : (categoryId ?? "uncategorized")),
          subtitle: existing?.subtitle ?? "",
          description: existing?.description ?? "",
          image: warehouseImage || cmsImage,
          fallbackImage: warehouseImage && cmsImage ? cmsImage : undefined,
          capacity: existing?.capacity ?? "—",
          readability: existing?.readability ?? "—",
          connection: existing?.connection ?? "—",
          badge: existing?.badge ?? null,
          featured: existing?.featured ?? false,
          sortOrder: routeOwner?.sortOrder ?? 1000 + index,
          sourceId: existing?.sourceId,
          sourceUrl: existing?.sourceUrl,
          media: existing?.media ? { ...existing.media, price } : undefined,
          price,
          imageOverridden: existing?.imageOverridden,
          warehouseSku: item.sku,
          warehouseUnit: item.unit.trim() === "ไม่ระบุหน่วย (PEAK)" ? undefined : item.unit.trim(),
          warehouseNetUnitSatang: net,
          warehouseCategoryId: categoryId,
          warehouseSubcategoryIds: entry?.status === "mapped" ? entry.subcategoryIds : [],
          warehouseModelCodes: verified?.modelCodes ?? [],
        },
      ];
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
