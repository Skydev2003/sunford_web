import pages from "@/features/content/data/pages.json";
import {
  platformPlacementDefinitions,
  platformSubcategoryDefinitions,
} from "./platform-subcategory-definitions";
import { catalogProductGroup } from "./catalog-supplements";
import { approvedWarehouseMappings } from "./warehouse-products";
import type { Product } from "../types";
import type { ProductCategory } from "./mock-categories";

export { platformSubcategoryDefinitions } from "./platform-subcategory-definitions";

const sourceIdBySku = new Map<string, string>([
  ...approvedWarehouseMappings.flatMap(({ sku, categoryId, legacyProductCandidateIds }) => {
    const sourceId = legacyProductCandidateIds[0]?.replace(/^sunford-/, "");
    return categoryId === "platforms" && sourceId ? [[sku, sourceId] as const] : [];
  }),
  // These published SKUs correspond to the exact TCS 6080 and TIS 3949 legacy models.
  ["G107626", "10762"],
  ["G107633", "10763"],
]);

const placementSourceIds = platformPlacementDefinitions.map(({ collections, ...placement }) => {
  const sources = new Set<string>(collections);
  const sourceIds = new Set(
    pages
      .filter(({ path }) => sources.has(path))
      .flatMap(({ productHandles }) => productHandles ?? []),
  );
  return { ...placement, sourceIds };
});

function platformSourceId(product: Product) {
  return product.warehouseSku ? sourceIdBySku.get(product.warehouseSku) : product.sourceId;
}

export function getPlatformPlacementSubcategories(
  products: Product[],
): ProductCategory["subcategories"] {
  const warehouse = products.some(({ warehouseSku }) => warehouseSku);
  const platforms = products.filter(
    (product) =>
      (!warehouse || product.warehouseSku) &&
      catalogProductGroup(product) === "/product/scale-platforms",
  );
  return placementSourceIds.map(({ id, label, sourceIds }) => ({
    id,
    label,
    productIds: platforms
      .filter((product) => sourceIds.has(platformSourceId(product) ?? ""))
      .map(({ id }) => id),
  }));
}

export function getPlatformMaterialId(product: Product): string | undefined {
  const material = platformSubcategoryDefinitions.find(({ id }) =>
    product.warehouseSubcategoryIds?.includes(id),
  );
  if (material) return material.id;
  if (
    product.warehouseSpecifications?.some(
      ({ label, value }) => label === "วัสดุโครงสร้าง" && value.trim(),
    )
  )
    return undefined;

  const sourceId = platformSourceId(product);
  if (!sourceId) return undefined;
  return platformSubcategoryDefinitions.find(({ models }) =>
    models.some((model) => model.sourceId === sourceId),
  )?.id;
}

export function getPlatformSubcategories(products: Product[]): ProductCategory["subcategories"] {
  const platforms = products.filter(
    (product) => catalogProductGroup(product) === "/product/scale-platforms",
  );
  const bySourceId = new Map(platforms.map((product) => [product.sourceId, product]));
  const warehouse = products.some(({ warehouseSku }) => warehouseSku);
  return platformSubcategoryDefinitions.map(({ id, label, models }) => {
    if (warehouse) {
      const members = platforms.filter(
        (product) => product.warehouseSku && getPlatformMaterialId(product) === id,
      );
      return {
        id,
        label,
        productIds: members.map(({ id }) => id),
        entries: members.map((product) => ({
          model: product.name,
          documentModel: product.warehouseModelCodes?.[0] ?? product.name,
          productId: product.id,
        })),
      };
    }
    const entries = models.map(({ model, sourceId }) => {
      const product = sourceId ? bySourceId.get(sourceId) : undefined;
      return { model, documentModel: model, ...(product ? { productId: product.id } : {}) };
    });
    return {
      id,
      label,
      productIds: entries.flatMap((entry) => (entry.productId ? [entry.productId] : [])),
      entries,
    };
  });
}
