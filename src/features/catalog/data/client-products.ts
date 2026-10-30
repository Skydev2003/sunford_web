import type { ClientProduct, Product, ProductCardData } from "../types";

export function productCardData(product: Product): ProductCardData {
  const { id, slug, name, category, subtitle, image, capacity, badge } = product;
  return { id, slug, name, category, subtitle, image, capacity, badge };
}

export function clientProductData(product: Product): ClientProduct {
  return {
    ...productCardData(product),
    description: product.description,
    featured: product.featured,
    topics: product.topics,
    price: product.price,
    imageOverridden: product.imageOverridden,
    readability: product.readability,
    connection: product.connection,
  };
}
