import type { Product } from "../types";
import { productCategoryDefinitions } from "./mock-categories";
import { getProductSubcategoryPage } from "./product-subcategory-pages";
import { isPublicWarehouseSku } from "./warehouse-products";
import savedSelection from "./warehouse-storefront-selection.json";

type StorefrontSelection = {
  companyId: string;
  items: { masterItemId: string; sku: string; name: string; categoryId: string }[];
};

export function warehouseStorefrontProducts(
  products: Product[],
  companyId: string,
  selection: StorefrontSelection = savedSelection,
): Product[] {
  if (selection.companyId !== companyId) {
    throw new Error("Warehouse storefront selection belongs to a different company");
  }
  const bySku = new Map<string, StorefrontSelection["items"][number]>();
  const sourceIds = new Set<string>();
  for (const item of selection.items) {
    if (
      !/^[1-9]\d*$/.test(item.masterItemId) ||
      !item.sku.trim() ||
      item.sku !== item.sku.trim() ||
      !item.name.trim() ||
      !productCategoryDefinitions.some((category) => category.id === item.categoryId) ||
      bySku.has(item.sku.toUpperCase()) ||
      sourceIds.has(item.masterItemId)
    ) {
      throw new Error("Invalid or duplicate Warehouse storefront selection");
    }
    bySku.set(item.sku.toUpperCase(), item);
    sourceIds.add(item.masterItemId);
  }

  return products.flatMap((product) => {
    if (!product.warehouseSku || !isPublicWarehouseSku(product.warehouseSku)) return [];
    const item = bySku.get(product.warehouseSku.toUpperCase());
    if (!item) {
      return [{ ...product, storefrontName: product.name }];
    }
    return [
      {
        ...product,
        storefrontName: product.name,
        category: item.categoryId,
        warehouseCategoryId: item.categoryId,
        warehouseSubcategoryIds: (product.warehouseSubcategoryIds ?? []).filter((id) =>
          Boolean(getProductSubcategoryPage(id, item.categoryId)),
        ),
      },
    ];
  });
}
