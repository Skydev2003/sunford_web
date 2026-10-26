import "server-only";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "./auth";
import type { AdminProduct } from "../types";
import { resolveManagedProduct } from "@/features/catalog/data/managed-products";

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
  return product
    ? { ...resolveManagedProduct(product), updatedAt: product.updatedAt.toISOString() }
    : null;
}
