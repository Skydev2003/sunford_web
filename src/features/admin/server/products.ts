import "server-only";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin, type AdminSession } from "./auth";
import type { AdminProduct, AdminProductSummary } from "../types";
import {
  resolveManagedCategory,
  resolveManagedProduct,
} from "@/features/catalog/data/managed-products";
import { productMediaDefaults } from "@/features/cms/server/product-media";
import type { ProductMedia } from "@/features/cms/types";

export async function listAdminProducts(): Promise<AdminProduct[]> {
  await requireAdmin();
  const products = await getPrisma().product.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return products
    .map((product) => ({
      ...resolveManagedProduct(product),
      updatedAt: product.updatedAt.toISOString(),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export async function listAdminProductSummaries(): Promise<AdminProductSummary[]> {
  await requireAdmin();
  const products = await getPrisma().product.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      categoryId: true,
      image: true,
      featured: true,
      published: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
      catalogManaged: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return products
    .map((row) => {
      const product = resolveManagedProduct(row);
      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        image: product.image,
        featured: product.featured,
        published: product.published,
        sortOrder: product.sortOrder,
        updatedAt: product.updatedAt.toISOString(),
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}
export async function getAdminCategoryCounts(): Promise<Record<string, number>> {
  await requireAdmin();
  const products = await getPrisma().product.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      category: true,
      categoryId: true,
      catalogManaged: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  const counts: Record<string, number> = {};
  for (const product of products) {
    const category = resolveManagedCategory(product);
    counts[category] = (counts[category] ?? 0) + 1;
  }
  return counts;
}

export async function getAdminProduct(
  id: string,
  session?: AdminSession,
): Promise<AdminProduct | null> {
  if (!session) await requireAdmin();
  const product = await getPrisma().product.findFirst({ where: { id, deletedAt: null } });
  if (!product) return null;
  const resolved = resolveManagedProduct(product);
  const document = await getPrisma().cmsDocument.findUnique({
    where: { id: `product-media:${id}` },
  });
  const media =
    document && !document.deletedAt
      ? (document.data as unknown as ProductMedia)
      : productMediaDefaults(resolved);
  return {
    ...resolved,
    gallery: media.gallery.map((entry) => entry.image),
    updatedAt: product.updatedAt.toISOString(),
  };
}
