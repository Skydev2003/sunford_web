import type { Product } from "../types";
import { classifyWarehouseProduct } from "./warehouse-classification";
import { warehouseDetailProduct } from "./warehouse-detail-data";

export function warehouseFact(product: Product, label: string): string {
  return product.warehouseSpecifications?.find((row) => row.label === label)?.value ?? "";
}

export function warehouseSiteProducts(
  products: Product[],
  components: { root_sku: string; sku: string; quantity: string }[] = [],
): Product[] {
  return products.map((raw, index) => {
    const product = warehouseDetailProduct(raw);
    const classification = classifyWarehouseProduct(product, products);
    const category = classification.categoryId;
    return {
      ...product,
      category: category ?? "uncategorized",
      sortOrder: index,
      warehouseCategoryId: category,
      warehouseComponents: components
        .filter((row) => row.root_sku === product.warehouseSku)
        .map((row) => ({ sku: row.sku, quantity: Number(row.quantity) })),
      warehouseSubcategoryIds: classification.subcategoryIds,
      warehouseModelCodes: [warehouseFact(product, "รุ่นสินค้า") || product.name],
    };
  });
}
