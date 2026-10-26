import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { products } from "../data/products";
import type { Product } from "../types";
import { hasDatabase } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { getSnapshotProducts } from "@/features/content/server/content-repository";
import { resolveManagedProduct } from "../data/managed-products";
import { findCatalogProduct } from "../data/product-lookup";

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const snapshot = getSnapshotProducts();
  if (!hasDatabase()) return snapshot.length ? snapshot : products;
  const managed = await getPrisma().product.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
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
    },
  });
  // Never append the snapshot here: doing so would resurrect hidden/deleted rows.
  return managed.map(resolveManagedProduct).sort((a, b) => a.sortOrder - b.sortOrder);
}
export async function getProduct(slug: string) {
  return findCatalogProduct(await getProducts(), slug);
}
