"use server";

import { getPrisma } from "@/lib/prisma";
import { Prisma, type Product as ProductRecord } from "@/generated/prisma/client";
import { categories } from "@/features/catalog/types";
import { resolveManagedProduct } from "@/features/catalog/data/managed-products";
import { getAdminSession } from "./auth";
import { invalidateProducts } from "./product-cache";
import { productTableSchema } from "../product-table-schema";
import type { ActionState } from "../types";
import { auditEntry } from "./audit";

const stale =
  "ข้อมูลสินค้าบางรายการเปลี่ยนไปแล้ว กรุณาโหลดใหม่ก่อนทำรายการ ทั้งชุดยังไม่ได้ถูกแก้ไข";

export async function manageProductsAction(input: unknown): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง" };
  const parsed = productTableSchema.safeParse(input);
  if (!parsed.success)
    return { error: "ข้อมูลคำสั่งไม่ถูกต้อง เลือกสินค้าได้ไม่เกิน 5,000 รายการต่อครั้ง" };
  const command = parsed.data;
  try {
    const slugs = await getPrisma().$transaction(
      async (db) => {
        await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('catalog-categories'))`;
        const records = await db.product.findMany({
          where: {
            deletedAt: null,
            ...(command.type === "reorder"
              ? {}
              : { id: { in: command.items.map((item) => item.id) } }),
          },
        });
        const expected = new Map(command.items.map((item) => [item.id, item.updatedAt]));
        if (
          records.length !== command.items.length ||
          records.some((row) => expected.get(row.id) !== row.updatedAt.toISOString())
        )
          throw new Error(stale);
        let category: ProductRecord["category"] | undefined;
        if (command.type === "category") {
          const original = categories.find(
            (item) => item.id !== "all" && item.id === command.categoryId,
          );
          const document = await db.cmsDocument.findUnique({
            where: { id: `category:${command.categoryId}` },
          });
          if (
            command.categoryId === "all" ||
            document?.deletedAt ||
            (document && document.kind !== "category") ||
            (!original && !document)
          )
            throw new Error("หมวดหมู่ปลายทางไม่มีอยู่แล้ว กรุณาเลือกใหม่");
          category = (original?.id as ProductRecord["category"] | undefined) ?? "accessories";
        }
        const positions = new Map(command.items.map((item, index) => [item.id, index]));
        const now = Date.now();
        const updates = records.flatMap((row) => {
          const product = resolveManagedProduct(row);
          const sortOrder = command.type === "reorder" ? positions.get(row.id)! : product.sortOrder;
          if (command.type === "reorder" && sortOrder === product.sortOrder) return [];
          return [
            {
              id: row.id,
              expectedAt: row.updatedAt.toISOString(),
              updatedAt: new Date(Math.max(now, row.updatedAt.getTime() + 1)).toISOString(),
              slug: product.slug,
              name: product.name,
              category:
                category ??
                categories.find((item) => item.id !== "all" && item.id === product.category)?.id ??
                row.category,
              categoryId:
                command.type === "category"
                  ? category === command.categoryId
                    ? null
                    : command.categoryId
                  : row.categoryId,
              subtitle: product.subtitle,
              description: product.description,
              image: product.image,
              capacity: product.capacity,
              readability: product.readability,
              connection: product.connection,
              badge: product.badge,
              published:
                command.type === "hide" || command.type === "delete"
                  ? false
                  : command.type === "publish"
                    ? true
                    : row.published,
              featured: product.featured,
              sortOrder,
              deletedAt: command.type === "delete" ? new Date(now).toISOString() : null,
              ...(command.type === "update" ? command.changes : {}),
            },
          ];
        });
        for (let offset = 0; offset < updates.length; offset += 500) {
          const batch = updates.slice(offset, offset + 500);
          const count = await db.$executeRaw(Prisma.sql`
          UPDATE products AS p SET
            slug = v.slug, name = v.name, category = v.category::"ProductCategory", "categoryId" = v."categoryId",
            subtitle = v.subtitle, description = v.description, image = v.image,
            capacity = v.capacity, readability = v.readability, connection = v.connection, badge = v.badge,
            published = v.published, featured = v.featured, "sortOrder" = v."sortOrder",
            "deletedAt" = v."deletedAt", "updatedAt" = v."updatedAt", "catalogManaged" = true
          FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb) AS v(
            id text, "expectedAt" timestamp, "updatedAt" timestamp, slug text, name text, category text, "categoryId" text,
            subtitle text, description text, image text, capacity text, readability text, connection text, badge text,
            published boolean, featured boolean, "sortOrder" integer, "deletedAt" timestamp
          )
          WHERE p.id = v.id AND p."updatedAt" = v."expectedAt" AND p."deletedAt" IS NULL
        `);
          if (count !== batch.length) throw new Error(stale);
        }
        if (updates.length)
          await db.auditLog.createMany({
            data: updates.map((item) =>
              auditEntry(
                session,
                "product",
                item.id,
                item.name,
                command.type === "category" ? "move" : command.type,
                command.type === "update"
                  ? Object.keys(command.changes)
                  : command.type === "category"
                    ? ["categoryId"]
                    : command.type === "reorder"
                      ? ["sortOrder"]
                      : command.type === "delete"
                        ? ["deletedAt", "published"]
                        : ["published"],
              ),
            ),
          });
        return updates.map((item) => item.slug);
      },
      { isolationLevel: "Serializable", timeout: 30000 },
    );
    invalidateProducts(...slugs);
    return { success: true };
  } catch (error) {
    if (
      error instanceof Error &&
      [stale, "หมวดหมู่ปลายทางไม่มีอยู่แล้ว กรุณาเลือกใหม่"].includes(error.message)
    )
      return { error: error.message };
    if (typeof error === "object" && error && "code" in error && error.code === "P2034")
      return { error: stale };
    return { error: "บันทึกการเปลี่ยนแปลงไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }
}
