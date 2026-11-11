import "server-only";
import { cache } from "react";
import { getStorefrontProducts } from "./product-repository";
import { getCatalogPage } from "./catalog-page";
import { getClientProducts } from "./client-products";
import { getScaleSubcategories } from "../data/scale-subcategories";
import { getPlatformSubcategories } from "../data/platform-subcategories";
import { getPosSubcategories } from "../data/pos-subcategories";
import { getIndicatorSubcategories } from "../data/indicator-subcategories";
import { deduplicateConsumableSizes } from "../data/consumable-sizes";
import { getAccessorySubcategories } from "../data/accessory-subcategories";
import { catalogCardName } from "../data/catalog-card-names";
import { productCategoryDefinitions } from "../data/mock-categories";

export const getProductCategories = cache(async () => {
  const catalogProducts = await getStorefrontProducts();
  const warehouse = catalogProducts.some((product) => product.warehouseSku);
  const products = warehouse ? catalogProducts : deduplicateConsumableSizes(catalogProducts);
  const categories = await Promise.all(
    productCategoryDefinitions.map(async ({ id, label, path }) => {
      const catalog = products.some((product) => product.warehouseSku)
        ? { products: products.filter((product) => product.warehouseCategoryId === id) }
        : await getCatalogPage(path, products);
      const indicatorSubcategories =
        id === "indicators" ? getIndicatorSubcategories(products) : undefined;
      const productIds = [
        ...new Set([
          ...(catalog?.products ?? []).map((product) => product.id),
          ...(indicatorSubcategories?.flatMap((child) => child.productIds) ?? []),
        ]),
      ];
      return {
        id,
        label,
        productIds,
        subcategoriesAreMock: false,
        subcategories:
          id === "scales"
            ? getScaleSubcategories(catalog?.products ?? [])
            : id === "platforms"
              ? getPlatformSubcategories(catalog?.products ?? [])
              : id === "pos"
                ? getPosSubcategories(catalog?.products ?? [])
                : id === "indicators"
                  ? indicatorSubcategories!
                  : getAccessorySubcategories(catalog?.products ?? []),
      };
    }),
  );
  const productIds = new Set(categories.flatMap((category) => category.productIds));
  const clientProducts = (await getClientProducts()).filter(
    (product) => warehouse || productIds.has(product.id),
  );
  const cardNames = Object.fromEntries(
    clientProducts.map((product) => [product.id, catalogCardName(product)]),
  );
  return { products: clientProducts, categories, cardNames };
});
