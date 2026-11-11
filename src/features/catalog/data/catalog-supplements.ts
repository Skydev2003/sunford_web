import pages from "@/features/content/data/pages.json";
import { getSnapshotProducts } from "@/features/content/data/catalog-snapshot";
import type { Product } from "../types";

type CatalogGroup =
  | "/products"
  | "/Indicator"
  | "/product/scale-platforms"
  | "/Product/POS"
  | "/product/scale-accessories";
const snapshots = getSnapshotProducts();
const sourceById = new Map(snapshots.map((product) => [product.sourceId, product]));
const sourceByProductId = new Map(snapshots.map((product) => [product.id, product]));
const groupCollections: [CatalogGroup, string[]][] = [
  ["/Indicator", ["laboratory-indicators", "industrial-indicators", "commercial-indicators"]],
  ["/product/scale-platforms", ["scale-platforms"]],
  ["/Product/POS", ["pos-scale-integration", "pos-android", "pos-windows"]],
  [
    "/product/scale-accessories",
    ["scale-accessories", "consumables", "printers", "scale-peripherals", "parts", "premium"],
  ],
  ["/products", ["scales"]],
];
const sourceGroups = new Map<string, CatalogGroup>();
for (const [group, collections] of groupCollections) {
  for (const page of pages.filter((page) => collections.includes(page.path.split("/").at(-1)!))) {
    for (const sourceId of page.productHandles ?? []) {
      // Specialized hardware wins over the broad legacy scales collection.
      if (!sourceGroups.has(sourceId)) sourceGroups.set(sourceId, group);
    }
  }
}

function originalProduct(product: Product) {
  return sourceById.get(product.sourceId) ?? sourceByProductId.get(product.id);
}

/** The hardware family is independent of stale database category defaults. */
export function catalogProductGroup(product: Product): CatalogGroup | undefined {
  if (product.warehouseCategoryId) {
    return (
      {
        scales: "/products",
        indicators: "/Indicator",
        platforms: "/product/scale-platforms",
        pos: "/Product/POS",
        accessories: "/product/scale-accessories",
      } as Record<string, CatalogGroup>
    )[product.warehouseCategoryId];
  }
  if (product.warehouseSku) return undefined;
  const source = originalProduct(product);
  if (
    ["10732", "10733", "10838", "10839", "10840", "10841", "10842", "10843", "10844"].includes(
      source?.sourceId ?? product.sourceId ?? "",
    )
  )
    return "/product/scale-accessories";
  const name = source?.name ?? product.name;
  if (/\bindicator\b|อินดิเคเตอร์/i.test(name)) return "/Indicator";
  if (/^Platform\b|โครงสร้างแท่นชั่ง/i.test(name)) return "/product/scale-platforms";
  const indexedGroup = source?.sourceId && sourceGroups.get(source.sourceId);
  if (indexedGroup) return indexedGroup;
  const category = source?.category ?? product.category;
  if (category === "accessories") return "/product/scale-accessories";
  if (category === "pos") return "/Product/POS";
  if (source || /เครื่องชั่ง|\b(?:ACS|TCS|FCS|TSS|CSS|TMS|WPS|FEH|RLS)[-\d]/i.test(name))
    return "/products";
  return undefined;
}

export function catalogProductCategory(product: Product): Product["category"] {
  if (product.warehouseSku) return product.category;
  const group = catalogProductGroup(product);
  if (group === "/product/scale-accessories") return "accessories";
  if (group === "/Product/POS") return "pos";
  return originalProduct(product)?.category ?? product.category;
}

const sectionIndexes = (collections: string[]) =>
  new Set(
    pages
      .filter((page) => collections.includes(page.path.split("/").at(-1)!))
      .flatMap((page) => page.productHandles ?? []),
  );
const scaleSectionIndex = sectionIndexes([
  "laboratory",
  "industrial",
  "commercial",
  "lifestyle-scales",
]);
const accessorySectionIndex = sectionIndexes([
  "data-interfaces",
  "scale-peripherals",
  "printers",
  "parts",
  "consumables",
  "premium",
]);

/** Fill gaps in older subcategory indexes without changing existing memberships. */
export function supplementalCatalogSection(product: Product): string | undefined {
  if (product.warehouseSku) return undefined;
  const source = originalProduct(product);
  const sourceId = source?.sourceId ?? product.sourceId ?? "";
  const group = catalogProductGroup(product);
  if (group === "/products" && !scaleSectionIndex.has(sourceId)) {
    switch (catalogProductCategory(product)) {
      case "laboratory":
        return "/product/laboratory";
      case "lifestyle":
        return "/product/lifestyle-scales";
      case "commercial":
      case "smart":
      case "pos":
        return "/product/commercial";
      case "industrial":
      case "food":
        return "/product/industrial";
    }
  }
  if (group === "/product/scale-accessories" && !accessorySectionIndex.has(sourceId)) {
    const name = source?.name ?? product.name;
    if (/sticker|สติ[๊กก]*เกอร์|กระดาษ/i.test(name)) return "/product/consumables";
    if (/LED-R|จอแสดงผล|จอเสริม/i.test(name)) return "/product/scale-peripherals";
    if (/^RAMP\b|เสาสแตนเลส|ทางลาด/i.test(name)) return "/product/scale-parts";
  }
  return undefined;
}

// Some newer source records are absent from the older collection page indexes.
const indexedCollections = new Set([
  "scales",
  "industrial-indicators",
  "commercial-indicators",
  "scale-platforms",
  "pos-scale-integration",
  "scale-accessories",
  "consumables",
  "printers",
  "scale-peripherals",
  "parts",
]);
const indexed = new Set(
  pages
    .filter((page) => indexedCollections.has(page.path.split("/").at(-1)!))
    .flatMap((page) => page.productHandles ?? []),
);

export function supplementalCatalogGroup(product: Product) {
  if (product.sourceId && indexed.has(product.sourceId)) return undefined;
  return catalogProductGroup(product);
}
