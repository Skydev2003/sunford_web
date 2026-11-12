import type { ClientProduct, Product, ProductCardData } from "../types";
import { warehouseModelName } from "./catalog-card-names";

export function productCardData(product: Product): ProductCardData {
  if (product.warehouseSku) {
    return {
      id: product.id,
      slug: product.slug,
      name: warehouseModelName(product.warehouseSku, product.warehouseName ?? product.warehouseSku),
      category: product.category,
      warehouseSku: product.warehouseSku,
      price: product.price,
      subtitle: product.warehouseCard?.subtitle ?? "",
      capacity: product.warehouseCard?.capacity ?? "",
      image: product.warehouseCard?.image ?? "",
      badge: null,
    };
  }
  const {
    price,
    id,
    slug,
    name,
    category,
    subtitle,
    image,
    fallbackImage,
    warehouseSku,
    capacity,
    badge,
  } = product;
  return {
    price,
    id,
    slug,
    name,
    category,
    subtitle,
    image,
    fallbackImage,
    warehouseSku,
    capacity,
    badge,
  };
}

export function clientProductData(product: Product): ClientProduct {
  return {
    ...productCardData(product),
    description: product.warehouseSku
      ? (product.warehouseCard?.description ?? "")
      : product.description,
    warehouseName: product.warehouseName,
    warehouseGroup: product.warehouseGroup,
    featured: product.featured,
    topics: product.topics,
    price: product.price,
    warehouseSku: product.warehouseSku,
    warehouseModelCodes: product.warehouseModelCodes,
    warehouseCategoryId: product.warehouseCategoryId,
    warehouseSubcategoryIds: product.warehouseSubcategoryIds,
    imageOverridden: product.warehouseSku ? true : product.imageOverridden,
    readability: product.warehouseSku
      ? (product.warehouseCard?.readability ?? "")
      : product.readability,
    connection: product.warehouseSku
      ? (product.warehouseCard?.connection ?? "")
      : product.connection,
  };
}
