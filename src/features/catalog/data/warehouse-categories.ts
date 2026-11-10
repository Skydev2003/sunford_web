import type { Product } from "../types";
import type { ProductCategory } from "./mock-categories";

export function warehouseSubcategories(
  groups: ProductCategory["subcategories"],
  products: Product[],
): ProductCategory["subcategories"] {
  if (!products.some((product) => product.warehouseSku)) return groups;
  return groups.map((group) => {
    const members = products.filter((product) =>
      product.warehouseSubcategoryIds?.includes(group.id),
    );
    return {
      ...group,
      productIds: members.map((product) => product.id),
      entries: members.map((product) => {
        const model = product.warehouseModelCodes?.[0] ?? product.name;
        return { model, documentModel: model, productId: product.id };
      }),
    };
  });
}
