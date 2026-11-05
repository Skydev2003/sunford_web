import type { Metadata } from "next";
import { ProductCategoryMock } from "@/features/catalog/components/product-category-mock";
import { getProducts } from "@/features/catalog/server/product-repository";
import { getCatalogPage } from "@/features/catalog/server/catalog-page";
import { getClientProducts } from "@/features/catalog/server/client-products";
import { getScaleSubcategories } from "@/features/catalog/data/scale-subcategories";
import { getPlatformSubcategories } from "@/features/catalog/data/platform-subcategories";
import { getPosSubcategories } from "@/features/catalog/data/pos-subcategories";
import { getIndicatorSubcategories } from "@/features/catalog/data/indicator-subcategories";
import { deduplicateConsumableSizes } from "@/features/catalog/data/consumable-sizes";
import { getAccessorySubcategories } from "@/features/catalog/data/accessory-subcategories";
import { catalogCardName } from "@/features/catalog/data/catalog-card-names";
import { productCategoryDefinitions } from "@/features/catalog/data/mock-categories";
export const metadata: Metadata = { title: "ผลิตภัณฑ์ทั้งหมด" };
export default async function ProductsPage() {
  const products = deduplicateConsumableSizes(await getProducts());
  const categories = await Promise.all(
    productCategoryDefinitions.map(async ({ id, label, path }) => {
      const catalog = await getCatalogPage(path, products);
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
  const clientProducts = (await getClientProducts()).filter((product) =>
    productIds.has(product.id),
  );
  const productsById = new Map(products.map((product) => [product.id, product]));
  const cardNames = Object.fromEntries(
    clientProducts.map((product) => [
      product.id,
      catalogCardName(productsById.get(product.id) ?? product),
    ]),
  );
  return (
    <main id="main-content">
      <ProductCategoryMock
        products={clientProducts}
        categories={categories}
        cardNames={cardNames}
      />
    </main>
  );
}
