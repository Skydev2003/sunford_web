import type { Product } from "../types";
import { warehouseSubcategories } from "./warehouse-categories";
import type { ProductCategory } from "./mock-categories";

const platforms: { id: string; label: string; sourceIds: string[] }[] = [
  { id: "pos-ios", label: "iOS", sourceIds: [] },
  { id: "pos-android", label: "Android", sourceIds: ["10802", "10805"] },
  { id: "pos-windows", label: "Windows", sourceIds: ["10801"] },
];

export function getPosSubcategories(products: Product[]): ProductCategory["subcategories"] {
  return warehouseSubcategories(
    platforms.map(({ id, label, sourceIds }) => ({
      id,
      label,
      productIds: products
        .filter((product) => sourceIds.includes(product.sourceId ?? ""))
        .map((product) => product.id),
    })),
    products,
  );
}
