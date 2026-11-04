import type { Metadata } from "next";
import { ProductCategoryMock } from "@/features/catalog/components/product-category-mock";
import { getProducts } from "@/features/catalog/server/product-repository";
import { getCatalogPage } from "@/features/catalog/server/catalog-page";
import { getClientProducts } from "@/features/catalog/server/client-products";
import { getScaleSubcategories } from "@/features/catalog/data/scale-subcategories";
import { catalogCardName } from "@/features/catalog/data/catalog-card-names";
import {
  getMockSubcategories,
  productCategoryDefinitions,
} from "@/features/catalog/data/mock-categories";
export const metadata: Metadata = { title: "ผลิตภัณฑ์ทั้งหมด" };
export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await Promise.all(
    productCategoryDefinitions.map(async ({ id, label, path }) => {
      const catalog = await getCatalogPage(path, products);
      const productIds = (catalog?.products ?? []).map((product) => product.id);
      return {
        id,
        label,
        productIds,
        subcategoriesAreMock: id !== "scales",
        subcategories:
          id === "scales"
            ? getScaleSubcategories(catalog?.products ?? [])
            : getMockSubcategories(id, productIds),
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
