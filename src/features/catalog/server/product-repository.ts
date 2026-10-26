import "server-only";
import { cacheLife } from "next/cache";
import { products } from "../data/products";
import type { Product } from "../types";
import { hasDatabase } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { getSnapshotProducts } from "@/features/content/server/content-repository";

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  const snapshot = getSnapshotProducts();
  if (!hasDatabase()) return snapshot.length ? snapshot : products;
  const managed = await getPrisma().product.findMany({
    where: { published: true },
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
    },
  });
  // Imported public content is authoritative for this source clone. Preserve any
  // additional products managed in the database without duplicating source models.
  return snapshot.length
    ? [...snapshot, ...managed.filter((item) => !snapshot.some((source) => source.id === item.id))]
    : managed;
}
export async function getProduct(slug: string) {
  const aliases: Record<string, string> = { lp50: "10728", lp51: "10730" };
  const target = aliases[slug.toLowerCase()] ?? slug;
  return (await getProducts()).find(
    (product) =>
      product.slug.toLowerCase() === target.toLowerCase() ||
      product.sourceId?.toLowerCase() === target.toLowerCase(),
  );
}
