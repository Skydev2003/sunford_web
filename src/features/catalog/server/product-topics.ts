import "server-only";
import { classifyProductTopics } from "../data/product-topics";
import type { Product } from "../types";

export function attachProductTopics(products: Product[]): Product[] {
  return products.map((product) => ({
    ...product,
    topics: classifyProductTopics(
      { ...product, name: product.warehouseName ?? product.name },
      [],
      product.warehouseSpecifications?.map((row) => row.label + " " + row.value).join(" ") ?? "",
    ),
  }));
}
