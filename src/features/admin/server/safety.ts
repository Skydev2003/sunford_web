import "server-only";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "./auth";
import { importedPages } from "@/features/content/server/content-repository";
import { resolveManagedCategory } from "@/features/catalog/data/managed-products";
import { categories } from "@/features/catalog/types";
import type { CmsData } from "@/features/cms/types";
import type { TrashItem } from "../safety-types";

export async function listTrash(): Promise<TrashItem[]> {
  await requireAdmin();
  const db = getPrisma();
  const [products, documents] = await Promise.all([
    db.product.findMany({
      where: { deletedAt: { not: null } },
      select: {
        id: true,
        name: true,
        category: true,
        categoryId: true,
        catalogManaged: true,
        deletedAt: true,
        updatedAt: true,
      },
    }),
    db.cmsDocument.findMany({
      where: { kind: { in: ["page", "category"] }, deletedAt: { not: null } },
    }),
  ]);
  return [
    ...products.map((row): TrashItem => ({
      id: row.id,
      kind: "product",
      title: row.name,
      deletedAt: row.deletedAt!.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      category: resolveManagedCategory(row),
    })),
    ...documents.map((row): TrashItem => {
      const data = row.data as CmsData;
      const original = importedPages.find((page) => page.path === data.sourcePath);
      const category = categories.find((item) => `category:${item.id}` === row.id);
      return {
        id: row.id,
        kind: row.kind as "page" | "category",
        title: String(data.title ?? data.label ?? original?.title ?? category?.label ?? row.id),
        deletedAt: row.deletedAt!.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      };
    }),
  ].sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
}

export async function listAudit(page: number, type?: string, id?: string) {
  await requireAdmin();
  const where = { ...(type ? { entityType: type } : {}), ...(id ? { entityId: id } : {}) };
  const db = getPrisma();
  const count = await db.auditLog.count({ where });
  const pages = Math.max(1, Math.ceil(count / 25));
  const current = Math.min(Math.max(1, page), pages);
  const rows = await db.auditLog.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (current - 1) * 25,
    take: 25,
  });
  return {
    rows: rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
    count,
    pages,
    current,
  };
}
