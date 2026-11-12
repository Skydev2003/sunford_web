import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { products } from "../data/products";
import type { Product } from "../types";
import { getSnapshotProducts } from "@/features/content/data/catalog-snapshot";
import { findCatalogProduct } from "../data/product-lookup";
import { attachProductTopics } from "./product-topics";
import {
  getOfficialProducts,
  savedWarehouseImage,
} from "@/features/services/warehouse-product.server";
import { warehouseCatalog } from "../data/warehouse-products";
import { attachWarehouseCardFacts } from "../data/warehouse-card-data";
import { warehouseDetailProduct } from "../data/warehouse-detail-data";
import { warehouseSiteProducts } from "../data/warehouse-site-data";
import {
  readWarehouseCardFacts,
  readWarehouseComponents,
} from "@/features/services/warehouse-postgres";

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  cacheTag("products");
  return (await getCurrentProducts()).products;
}

export async function getCurrentProducts(): Promise<{ products: Product[]; readAt: string }> {
  const [official, editorial] = await Promise.all([getOfficialProducts(), getEditorialProducts()]);
  const skus = official.items.map((item) => item.sku);
  const [facts, components] = await Promise.all([
    readWarehouseCardFacts(skus),
    readWarehouseComponents(skus),
  ]);
  return {
    products: attachProductTopics(
      warehouseSiteProducts(
        attachWarehouseCardFacts(
          warehouseCatalog(official.items, editorial, savedWarehouseImage),
          facts,
        ),
        components,
      ),
    ),
    readAt: official.readAt,
  };
}

export { getProducts as getStorefrontProducts };

async function getEditorialProducts(): Promise<Product[]> {
  const snapshot = getSnapshotProducts();
  return attachProductTopics(snapshot.length ? snapshot : products);
}

export async function getProduct(slug: string) {
  const product = findCatalogProduct(await getProducts(), slug);
  return product ? warehouseDetailProduct(product) : undefined;
}
