import type { ClientProduct, Product, ProductCardData } from "../types";
import { warehouseModelName } from "./catalog-card-names";
import { lineupSalesCopy } from "./lineup-sales-copy";

export function productCardData(product: Product): ProductCardData {
  if (product.warehouseSku) {
    const name =
      product.storefrontName ??
      warehouseModelName(product.warehouseSku, product.warehouseName ?? product.warehouseSku);
    const subtitle = product.warehouseCard?.subtitle ?? "";
    const capacity = product.warehouseCard?.capacity ?? "";
    return {
      id: product.id,
      slug: product.slug,
      name,
      category: product.category,
      warehouseSku: product.warehouseSku,
      price: product.price,
      subtitle,
      capacity,
      image: product.warehouseCard?.image ?? "",
      badge: null,
      highlight: lineupSalesCopy({
        ...product,
        name,
        subtitle,
        capacity,
        warehouseCategoryId: product.warehouseCategoryId ?? product.category,
        description: product.warehouseCard?.description ?? "",
        readability: product.warehouseCard?.readability ?? "",
        connection: product.warehouseCard?.connection ?? "",
      }),
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
  const summary = subtitle.replace(/\s+/g, " ").trim();
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
    highlight: summary.length <= 34 && summary !== name && !/^[-–—]+$/.test(summary) ? summary : "",
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
