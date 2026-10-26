import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { products } from "../data/products";
import type { Product } from "../types";
import { hasDatabase } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  if (!hasDatabase()) return products;
  return getPrisma().product.findMany({
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
}
export async function getProduct(slug: string) {
  return (await getProducts()).find((product) => product.slug === slug);
}
