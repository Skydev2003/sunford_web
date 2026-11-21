import { platformSubcategoryDefinitions } from "./platform-subcategory-definitions";
import { catalogProductGroup } from "./catalog-supplements";
import { warehouseSubcategories } from "./warehouse-categories";
import type { Product } from "../types";
import type { ProductCategory } from "./mock-categories";

export { platformSubcategoryDefinitions } from "./platform-subcategory-definitions";

export function getPlatformSubcategories(products: Product[]): ProductCategory["subcategories"] {
  const platforms = products.filter(
    (product) => catalogProductGroup(product) === "/product/scale-platforms",
  );
  const bySourceId = new Map(platforms.map((product) => [product.sourceId, product]));
  return warehouseSubcategories(
    platformSubcategoryDefinitions.map(({ id, label, models }) => {
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
    }),
    products,
  );
}
