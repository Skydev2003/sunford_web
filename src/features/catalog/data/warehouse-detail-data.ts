import type { Product } from "../types";
import { clientProductData } from "./client-products";

export function warehouseDetailProduct(product: Product): Product {
  if (!product.warehouseSku) return product;
  return {
    ...product,
    ...clientProductData(product),
    fallbackImage: undefined,
    media: undefined,
    sourceId: undefined,
    sourceUrl: undefined,
    featured: false,
  };
}
