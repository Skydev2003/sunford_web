import "server-only";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "./auth";
import type { AdminProduct } from "../types";

export async function listAdminProducts(): Promise<AdminProduct[]> {
  await requireAdmin();
  const products = await getPrisma().product.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return products.map((product) => ({ ...product, updatedAt: product.updatedAt.toISOString() }));
}
export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  await requireAdmin();
  const product = await getPrisma().product.findUnique({ where: { id } });
  return product ? { ...product, updatedAt: product.updatedAt.toISOString() } : null;
}
