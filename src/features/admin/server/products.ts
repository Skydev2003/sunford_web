import "server-only";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "./auth";
import type { AdminProduct } from "../types";
import { resolveManagedProduct } from "@/features/catalog/data/managed-products";
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
export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  await requireAdmin();
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
