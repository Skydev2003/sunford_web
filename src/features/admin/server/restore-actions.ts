"use server";
import { z } from "zod";
import { revalidatePath, updateTag } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { getAdminSession } from "./auth";
import { auditEntry } from "./audit";
import { invalidateProducts } from "./product-cache";
import { categories } from "@/features/catalog/types";
import { resolveManagedCategory } from "@/features/catalog/data/managed-products";
import { importedPages } from "@/features/content/server/content-repository";
import { getSnapshotProducts } from "@/features/content/data/catalog-snapshot";
import { sourcePageId } from "@/features/cms/server/identity";
import type { Prisma } from "@/generated/prisma/client";
import type { ActionState } from "../types";
import type { CmsData } from "@/features/cms/types";

const inputSchema = z
  .object({
    kind: z.enum(["product", "page", "category"]),
    id: z.string().min(1).max(150),
    updatedAt: z.iso.datetime(),
    category: z.string().min(1).max(150).optional(),
  })
  .strict();
const stale = "ข้อมูลในถังขยะเปลี่ยนไปแล้ว กรุณาโหลดใหม่ก่อนกู้คืน";
const invalidCategory = "หมวดหมู่เดิมไม่มีอยู่แล้ว กรุณาเลือกหมวดหมู่ปลายทาง";
const duplicateCategory = "ชื่อหมวดหมู่นี้มีอยู่แล้ว กรุณาเปลี่ยนชื่อหมวดหมู่ที่ซ้ำก่อนกู้คืน";
const missingPage = "ข้อมูลหน้าที่เก็บไว้ไม่ครบ กรุณาติดต่อผู้ดูแลระบบ";

export async function restoreItemAction(input: unknown): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง" };
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { error: "ข้อมูลการกู้คืนไม่ถูกต้อง" };
  const { kind, id, updatedAt } = parsed.data;
  try {
    const slug = await getPrisma().$transaction(
      async (db) => {
        await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('catalog-categories'))`;
        if (kind === "product") {
          const row = await db.product.findUnique({ where: { id } });
          if (!row?.deletedAt || row.updatedAt.toISOString() !== updatedAt) throw new Error(stale);
          const categoryId = parsed.data.category ?? resolveManagedCategory(row);
          const original = categories.find(
            (category) => category.id !== "all" && category.id === categoryId,
          );
          const category = await db.cmsDocument.findUnique({
            where: { id: `category:${categoryId}` },
          });
          if (
            categoryId === "all" ||
            category?.deletedAt ||
            (category && category.kind !== "category") ||
            (!original && !category)
          )
            throw new Error(invalidCategory);
          const result = await db.product.updateMany({
            where: { id, updatedAt: new Date(updatedAt), deletedAt: { not: null } },
            data: {
              deletedAt: null,
              published: false,
              categoryId,
              category: original ? (original.id as typeof row.category) : "accessories",
              updatedAt: new Date(Math.max(Date.now(), row.updatedAt.getTime() + 1)),
            },
          });
          if (!result.count) throw new Error(stale);
          await db.auditLog.create({
            data: auditEntry(session, "product", id, row.name, "restore", [
              "deletedAt",
              "published",
              ...(categoryId !== resolveManagedCategory(row) ? ["categoryId"] : []),
            ]),
          });
          return row.slug;
        }
        const row = await db.cmsDocument.findUnique({ where: { id } });
        if (!row?.deletedAt || row.kind !== kind || row.updatedAt.toISOString() !== updatedAt)
          throw new Error(stale);
        let data = row.data as CmsData;
        if (kind === "category") {
          if (id === "category:all") throw new Error(stale);
          const label = String(data.label ?? "").toLocaleLowerCase();
          const documents = await db.cmsDocument.findMany({ where: { kind: "category" } });
          if (
            documents.some(
              (item) =>
                !item.deletedAt &&
                String((item.data as CmsData).label).toLocaleLowerCase() === label,
            ) ||
            categories.some(
              (item) =>
                `category:${item.id}` !== id &&
                item.label.toLocaleLowerCase() === label &&
                !documents.some((doc) => doc.id === `category:${item.id}`),
            )
          )
            throw new Error(duplicateCategory);
        } else {
          if (!data.path || !data.title) {
            const original = importedPages.find(
              (page) =>
                page.path === data.sourcePath &&
                sourcePageId(page.path) === id &&
                page.kind !== "product" &&
                page.path !== "/",
            );
            if (!original) throw new Error(missingPage);
            const productIds = getSnapshotProducts()
              .filter((product) => original.productHandles.includes(product.sourceId ?? ""))
              .map((product) => product.id);
            const available = await db.product.findMany({
              where: { id: { in: productIds }, deletedAt: null },
              select: { id: true },
            });
            data = {
              sourcePath: original.path,
              path: original.path,
              title: original.title,
              kind: original.kind,
              html: original.html,
              images: original.images.map((image) => ({ image })),
              videos: original.videos ?? [],
              productIds: available.map(({ id }) => ({ id })),
              order: 0,
              published: false,
            };
          }
          data = { ...data, published: false };
        }
        const result = await db.cmsDocument.updateMany({
          where: { id, kind, updatedAt: new Date(updatedAt), deletedAt: { not: null } },
          data: {
            deletedAt: null,
            data: data as Prisma.InputJsonObject,
            updatedAt: new Date(Math.max(Date.now(), row.updatedAt.getTime() + 1)),
          },
        });
        if (!result.count) throw new Error(stale);
        await db.auditLog.create({
          data: auditEntry(session, kind, id, String(data.title ?? data.label ?? id), "restore", [
            "deletedAt",
            ...(kind === "page" ? ["published"] : []),
          ]),
        });
      },
      { isolationLevel: "Serializable", timeout: 15000 },
    );
    if (slug) invalidateProducts(slug);
    updateTag("cms");
    updateTag("products");
    updateTag("home-images");
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    if (
      error instanceof Error &&
      [stale, invalidCategory, duplicateCategory, missingPage].includes(error.message)
    )
      return { error: error.message };
    if (typeof error === "object" && error && "code" in error && error.code === "P2034")
      return { error: stale };
    return { error: "กู้คืนไม่สำเร็จ กรุณาลองใหม่" };
  }
}
