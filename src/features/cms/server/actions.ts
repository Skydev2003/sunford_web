"use server";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { getAdminSession } from "@/features/admin/server/auth";
import { getPrisma } from "@/lib/prisma";
import { categories } from "@/features/catalog/types";
import { importedPages } from "@/features/content/server/content-repository";
import {
  categorySchema,
  contactLocationImagesSchema,
  footerSettingsSchema,
  heroSchema,
  mediaSchema,
  navigationSchema,
  pageSchema,
  patchesSchema,
  siteSchema,
  textSettingsSchema,
  videoSchema,
} from "./validation";
import { z } from "zod";
import type { ActionState } from "@/features/admin/types";
import type { Prisma } from "@/generated/prisma/client";
import { sourcePageId } from "./identity";
import { auditEntry, changedFields, type AuditType } from "@/features/admin/server/audit";

const settingsIds = [
  "hero",
  "site",
  "contact-locations",
  "navigation",
  "spotlight",
  "showcase",
  "stories",
  "videos",
  "catalog",
  "section:solutions",
  "section:story",
  "section:support",
  "section:footer",
];
function validIdentity(kind: string, id: string) {
  return kind === "settings"
    ? settingsIds.includes(id)
    : ["category", "page", "product-media"].includes(kind) &&
        id.startsWith(`${kind}:`) &&
        /^[a-z0-9][a-z0-9_-]{0,100}$/i.test(id.slice(kind.length + 1));
}
function schema(kind: string, id: string) {
  if (kind === "category") return categorySchema;
  if (kind === "page") return pageSchema;
  if (kind === "product-media") return mediaSchema;
  if (id === "hero") return heroSchema;
  if (id === "site") return siteSchema;
  if (id === "contact-locations") return contactLocationImagesSchema;
  if (id === "navigation") return navigationSchema;
  if (id === "videos") return z.object({ videos: z.array(videoSchema).max(30) });
  if (id === "section:footer") return footerSettingsSchema;
  if (id.startsWith("section:")) return patchesSchema;
  return textSettingsSchema;
}
function invalidate() {
  updateTag("cms");
  updateTag("products");
  updateTag("home-images");
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}
const stale = "ข้อมูลถูกแก้ไขจากอีกหน้าแล้ว กรุณาโหลดหน้าใหม่ก่อนบันทึก";
const normalize = (path: string) => decodeURIComponent(path).replace(/\/$/, "").toLowerCase();
export async function saveDocumentAction(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง" };
  const kind = String(form.get("kind") ?? "");
  const id = String(form.get("id") ?? "");
  const version = String(form.get("version") ?? "");
  if (!validIdentity(kind, id)) return { error: "ไม่พบส่วนที่ต้องการแก้ไข" };
  let input: unknown;
  try {
    input = JSON.parse(String(form.get("data")));
  } catch {
    return { error: "ข้อมูลไม่ถูกต้อง" };
  }
  const parsed = schema(kind, id).safeParse(input);
  if (!parsed.success)
    return {
      error: parsed.error.issues
        .map((issue) => `${issue.path.join(" → ")}: ${issue.message}`)
        .slice(0, 6)
        .join("\n"),
    };
  let data = parsed.data as Prisma.InputJsonObject;
  try {
    await getPrisma().$transaction(async (db) => {
      if (kind === "category")
        await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('catalog-categories'))`;
      if (kind === "page")
        await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('cms-pages'))`;
      const previous = await db.cmsDocument.findUnique({ where: { id } });
      if ((previous?.updatedAt.toISOString() ?? "") !== version || previous?.deletedAt)
        throw new Error(stale);
      if (kind === "page") {
        const page = pageSchema.parse(data);
        if (previous && (previous.data as { sourcePath?: string }).sourcePath !== page.sourcePath)
          throw new Error("เปลี่ยนการอ้างอิงหน้าต้นฉบับไม่ได้");
        const docs = await db.cmsDocument.findMany({ where: { kind: "page" } });
        const previousData = previous?.data as { path?: string; aliases?: string[] } | undefined;
        const aliases = [
          ...new Set([
            ...(previousData?.aliases ?? []),
            ...(previousData?.path && previousData.path !== page.path ? [previousData.path] : []),
          ]),
        ];
        data = { ...data, aliases };
        if (
          page.sourcePath &&
          (sourcePageId(page.sourcePath) !== id ||
            !importedPages.some(
              (p) => p.path === page.sourcePath && p.kind !== "product" && p.path !== "/",
            ))
        )
          throw new Error("หน้าต้นฉบับไม่ถูกต้อง");
        // A renamed or hidden imported URL remains reserved for its original document.
        if (
          importedPages.some(
            (p) =>
              normalize(p.path) === normalize(page.path) &&
              (!page.sourcePath || normalize(page.sourcePath) !== normalize(page.path)),
          ) ||
          docs.some(
            (row) =>
              row.id !== id &&
              [
                String((row.data as { path: string }).path),
                String((row.data as { sourcePath?: string }).sourcePath ?? ""),
                ...((row.data as { aliases?: string[] }).aliases ?? []),
              ].some((path) => path && normalize(path) === normalize(page.path)),
          )
        )
          throw new Error("URL นี้มีหน้าข้อมูลอยู่แล้ว");
        if (
          page.sourcePath &&
          docs.some(
            (row) =>
              row.id !== id &&
              (row.data as { sourcePath?: string }).sourcePath &&
              normalize(String((row.data as { sourcePath?: string }).sourcePath)) ===
                normalize(page.sourcePath),
          )
        )
          throw new Error("หน้าต้นฉบับนี้ถูกแก้ไขจากอีกหน้าแล้ว กรุณาโหลดใหม่");
        const productIds = page.productIds.map((p) => p.id);
        if (
          productIds.length &&
          (await db.product.count({ where: { id: { in: productIds }, deletedAt: null } })) !==
            new Set(productIds).size
        )
          throw new Error("สินค้าที่เชื่อมโยงถูกลบไปแล้ว กรุณาเลือกใหม่");
      }
      if (id === "hero") {
        const slides = heroSchema.parse(data).slides;
        const ids = [...new Set(slides.map((slide) => slide.productId).filter(Boolean))];
        if (
          ids.length &&
          (await db.product.count({
            where: { id: { in: ids }, deletedAt: null, published: true },
          })) !== ids.length
        )
          throw new Error("กรุณาเลือกสินค้าที่เผยแพร่สำหรับสไลด์");
        if (
          slides.some((slide) => !slide.productId && (!slide.image || !slide.title || !slide.href))
        )
          throw new Error("สไลด์ที่ไม่อ้างอิงสินค้าต้องมีหัวข้อ รูปภาพ และลิงก์");
      }
      if (kind === "category") {
        if (id === "category:all") throw new Error("หมวดทั้งหมดสงวนไว้สำหรับระบบ");
        const label = categorySchema.parse(data).label.toLowerCase();
        const rows = await db.cmsDocument.findMany({
          where: { kind: "category", deletedAt: null },
        });
        if (
          rows.some(
            (row) =>
              row.id !== id &&
              String((row.data as { label: string }).label).toLowerCase() === label,
          ) ||
          categories.some(
            (category) =>
              category.id !== id.slice(9) &&
              category.label.toLowerCase() === label &&
              !rows.some((row) => row.id === `category:${category.id}`),
          )
        )
          throw new Error("ชื่อหมวดหมู่นี้มีอยู่แล้ว");
      }
      if (kind === "product-media") {
        const productId = id.slice("product-media:".length);
        const productVersion = new Date(String(form.get("productVersion")));
        if (Number.isNaN(productVersion.getTime())) throw new Error(stale);
        const result = await db.product.updateMany({
          where: { id: productId, deletedAt: null, updatedAt: productVersion },
          data: { updatedAt: new Date(Math.max(Date.now(), productVersion.getTime() + 1)) },
        });
        if (!result.count) throw new Error(stale);
      }
      if (previous) {
        const result = await db.cmsDocument.updateMany({
          where: { id, updatedAt: new Date(version) },
          data: { data },
        });
        if (!result.count) throw new Error(stale);
      } else await db.cmsDocument.create({ data: { id, kind, data } });
      await db.auditLog.create({
        data: auditEntry(
          session,
          kind as AuditType,
          id,
          String(data.title ?? data.label ?? id),
          previous ? "update" : "create",
          changedFields(previous?.data as object | undefined, data),
        ),
      });
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      (error.code === "P2002" || error.code === "P2034")
    )
      return { error: stale };
    return {
      error:
        error instanceof Error && !/prisma|database|query|Invalid|connection/i.test(error.message)
          ? error.message
          : "บันทึกไม่สำเร็จ กรุณาลองใหม่",
    };
  }
  invalidate();
  if (form.get("detail") === "1") return { success: true };
  redirect(`/admin/content/${encodeURIComponent(id)}?saved=1`);
}
export async function deleteDocumentAction(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง" };
  const id = String(form.get("id"));
  const kind = String(form.get("kind"));
  const version = String(form.get("version") ?? "");
  if (!["category", "page"].includes(kind) || !validIdentity(kind, id) || id === "category:all")
    return { error: "ลบข้อมูลนี้ไม่ได้" };
  try {
    await getPrisma().$transaction(async (db) => {
      if (kind === "category")
        await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('catalog-categories'))`;
      const previous = await db.cmsDocument.findUnique({ where: { id } });
      if ((previous?.updatedAt.toISOString() ?? "") !== version || previous?.deletedAt)
        throw new Error(stale);
      let data: Prisma.InputJsonObject;
      if (kind === "category") {
        const categoryId = id.slice(9);
        const replacement = String(form.get("replacement") ?? "");
        const used = {
          deletedAt: null,
          OR: [
            { categoryId },
            ...(categories.some((c) => c.id === categoryId)
              ? [
                  {
                    categoryId: null,
                    category: categoryId as Exclude<(typeof categories)[number]["id"], "all">,
                  },
                ]
              : []),
          ],
        };
        if (await db.product.count({ where: used })) {
          const replacementDoc = await db.cmsDocument.findUnique({
            where: { id: `category:${replacement}` },
          });
          if (
            !replacement ||
            replacement === "all" ||
            replacement === categoryId ||
            replacementDoc?.deletedAt ||
            (!replacementDoc && !categories.some((c) => c.id === replacement))
          )
            throw new Error("เลือกหมวดหมู่ที่จะย้ายสินค้าทั้งหมดไปก่อนลบ");
          const legacy =
            categories.find((c) => c.id === replacement && c.id !== "all")?.id ?? "accessories";
          const moved = await db.product.findMany({
            where: used,
            select: { id: true, name: true },
          });
          await db.product.updateMany({
            where: used,
            data: {
              categoryId: replacement,
              category: legacy as Exclude<(typeof categories)[number]["id"], "all">,
            },
          });
          await db.auditLog.createMany({
            data: moved.map((product) =>
              auditEntry(session, "product", product.id, product.name, "move", ["categoryId"]),
            ),
          });
        }
        const original = categories.find((c) => c.id === categoryId);
        if (!previous && !original) throw new Error("ไม่พบหมวดหมู่นี้");
        data = (previous?.data as Prisma.InputJsonObject) ?? {
          label: original!.label,
          english: original!.english,
        };
      } else {
        if (previous) data = previous.data as Prisma.InputJsonObject;
        else {
          const sourcePath = String(form.get("sourcePath") ?? "");
          if (
            sourcePageId(sourcePath) !== id ||
            !importedPages.some(
              (page) => page.path === sourcePath && page.kind !== "product" && page.path !== "/",
            )
          )
            throw new Error("ไม่พบหน้านี้");
          data = { sourcePath };
        }
      }
      if (previous) {
        const result = await db.cmsDocument.updateMany({
          where: { id, updatedAt: new Date(version) },
          data: { deletedAt: new Date() },
        });
        if (!result.count) throw new Error(stale);
      } else await db.cmsDocument.create({ data: { id, kind, data, deletedAt: new Date() } });
      await db.auditLog.create({
        data: auditEntry(
          session,
          kind as AuditType,
          id,
          String(
            data.title ??
              data.label ??
              importedPages.find((page) => page.path === data.sourcePath)?.title ??
              id,
          ),
          "delete",
          ["deletedAt"],
        ),
      });
    });
  } catch (error) {
    return {
      error:
        error instanceof Error && !/prisma|query|database/i.test(error.message)
          ? error.message
          : "ลบไม่สำเร็จ กรุณาลองใหม่",
    };
  }
  invalidate();
  if (form.get("detail") === "1") return { success: true };
  redirect(kind === "category" ? "/admin/categories?deleted=1" : "/admin/content?deleted=1");
}
