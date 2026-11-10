import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { products } from "../data/products";
import type { Product } from "../types";
import { hasDatabase } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { getSnapshotProducts } from "@/features/content/server/content-repository";
import { resolveManagedProduct } from "../data/managed-products";
import { findCatalogProduct } from "../data/product-lookup";
import { getDocuments } from "@/features/cms/server/documents";
import type { ProductMedia } from "@/features/cms/types";
import { publicPath } from "@/features/content/data/public-paths.mjs";
import { attachProductTopics } from "./product-topics";
import { catalogProductCategory } from "../data/catalog-supplements";
import {
  getOfficialProducts,
  savedWarehouseImage,
} from "@/features/services/warehouse-product.server";
import { warehouseCatalog } from "../data/warehouse-products";

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  cacheTag("products");
  const [official, editorial] = await Promise.all([getOfficialProducts(), getEditorialProducts()]);
  return attachProductTopics(warehouseCatalog(official.items, editorial, savedWarehouseImage));
}

async function getEditorialProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const snapshot = getSnapshotProducts();
  if (!hasDatabase()) return attachProductTopics(snapshot.length ? snapshot : products);
  const managed = await getPrisma().product.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      categoryId: true,
      subtitle: true,
      description: true,
      image: true,
      capacity: true,
      readability: true,
      connection: true,
      badge: true,
      featured: true,
      sortOrder: true,
      catalogManaged: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  // Never append the snapshot here: doing so would resurrect hidden/deleted rows.
  const media = await getDocuments("product-media");
  return attachProductTopics(
    managed
      .map((row) => {
        const resolved = resolveManagedProduct(row);
        const product = {
          ...resolved,
          category: catalogProductCategory(resolved),
          slug: publicPath(`/${resolved.slug}`).slice(1),
        };
        const doc = media.find((doc) => doc.id === `product-media:${product.id}` && !doc.deletedAt);
        if (!doc) return product;
        const settings = doc.data as unknown as ProductMedia;
        return { ...product, media: settings, price: settings.price };
      })
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );
}
export async function getProduct(slug: string) {
  return findCatalogProduct(await getProducts(), slug);
}
