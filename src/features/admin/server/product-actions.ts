"use server";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { getAdminSession } from "./auth";
import { isAllowedProductImage, removeUnusedImage } from "./media";
import { productInputSchema, versionSchema } from "../validation";
import type { ActionState } from "../types";
import { getSnapshotProducts } from "@/features/content/data/catalog-snapshot";
import { getCategories } from "@/features/cms/server/categories";
import { categories } from "@/features/catalog/types";
import { z } from "zod";
import { resolveManagedProduct } from "@/features/catalog/data/managed-products";
import type { Prisma } from "@/generated/prisma/client";
import type { ProductMedia } from "@/features/cms/types";
import { productMediaDefaults } from "@/features/cms/server/product-media";
import { invalidateProducts } from "./product-cache";
import { auditEntry, changedFields } from "./audit";

export async function saveProductAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง" };
  const raw = Object.fromEntries(formData);
  const availableCategories = await getCategories();
  const parsed = productInputSchema
    .extend({
      category: z
        .string()
        .refine(
          (id) => id !== "all" && availableCategories.some((category) => category.id === id),
          "กรุณาเลือกหมวดหมู่ที่มีอยู่",
        ),
    })
    .safeParse({
      ...raw,
      published: formData.get("published") === "on",
      featured: formData.get("featured") === "on",
    });
  if (!parsed.success)
    return { error: "กรุณาตรวจสอบข้อมูลสินค้า", fieldErrors: parsed.error.flatten().fieldErrors };
  if (!isAllowedProductImage(parsed.data.image))
    return { error: "กรุณาอัปโหลดรูปผ่านช่องรูปสินค้า" };
  let gallery: string[] | undefined;
  if (formData.has("gallery")) {
    try {
      gallery = z
        .array(
          z
            .string()
            .max(2048)
            .refine((image) => Boolean(image) && isAllowedProductImage(image)),
        )
        .max(50)
        .parse(JSON.parse(String(formData.get("gallery"))));
    } catch {
      return { error: "แกลเลอรีไม่ถูกต้อง กรุณาอัปโหลดรูปผ่านช่องรูปสินค้า" };
    }
  }
  const id = formData.get("id");
  const category =
    categories.find((category) => category.id === parsed.data.category && category.id !== "all")
      ?.id ?? "accessories";
  const data = {
    ...parsed.data,
    category: category as Exclude<(typeof categories)[number]["id"], "all">,
    categoryId: category === parsed.data.category ? null : parsed.data.category,
  };
  let oldImage: string | undefined;
  let oldSlug: string | undefined;
  try {
    const problem = await getPrisma().$transaction(async (db) => {
      await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('catalog-categories'))`;
      const selectedCategory = await db.cmsDocument.findUnique({
        where: { id: `category:${parsed.data.category}` },
      });
      if (
        selectedCategory?.deletedAt ||
        (!selectedCategory && !categories.some((category) => category.id === parsed.data.category))
      )
        return { error: "หมวดหมู่นี้ถูกลบไปแล้ว กรุณาเลือกใหม่" };
      const reserved = getSnapshotProducts().some(
        (product) =>
          product.id !== id &&
          [product.slug, product.sourceId].some((slug) => slug === parsed.data.slug),
      );
      const duplicate = await db.product.findFirst({
        where: {
          slug: parsed.data.slug,
          ...(typeof id === "string" ? { NOT: { id } } : {}),
        },
      });
      if (reserved || duplicate)
        return {
          error: "URL สินค้านี้ถูกใช้แล้ว กรุณาเปลี่ยน URL",
          fieldErrors: { slug: ["URL นี้ถูกใช้แล้ว"] },
        };
      if (id) {
        const version = versionSchema.safeParse({ id, updatedAt: formData.get("updatedAt") });
        if (!version.success) return { error: "ข้อมูลเวอร์ชันสินค้าไม่ถูกต้อง กรุณาโหลดหน้าใหม่" };
        const previous = await db.product.findFirst({
          where: { id: version.data.id, deletedAt: null },
        });
        if (!previous) return { error: "ไม่พบสินค้านี้ อาจถูกลบไปแล้ว" };
        const result = await db.product.updateMany({
          where: {
            id: version.data.id,
            updatedAt: new Date(version.data.updatedAt),
            deletedAt: null,
          },
          data: { ...data, catalogManaged: true },
        });
        if (!result.count) return { error: "สินค้าถูกแก้ไขจากอีกหน้าแล้ว กรุณาโหลดใหม่ก่อนบันทึก" };
        const media = await db.cmsDocument.findUnique({
          where: { id: "product-media:" + version.data.id },
        });
        if ((media && !media.deletedAt) || gallery !== undefined) {
          const effective = resolveManagedProduct(previous);
          const metadata =
            media && !media.deletedAt
              ? (media.data as unknown as ProductMedia)
              : productMediaDefaults(effective);
          const next = { ...metadata };
          if (effective.description !== parsed.data.description)
            next.descriptionHtml =
              "<p>" +
              parsed.data.description
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;") +
              "</p>";
          if (effective.image !== parsed.data.image)
            next.gallery = [
              ...(parsed.data.image ? [{ image: parsed.data.image }] : []),
              ...metadata.gallery.filter((entry) => entry.image !== parsed.data.image),
            ];
          if (gallery !== undefined) next.gallery = gallery.map((image) => ({ image }));
          next.specifications = [...metadata.specifications];
          for (const [key, label, pattern] of [
            ["capacity", "พิกัดน้ำหนัก", /พิกัดน้ำหนัก|น้ำหนักสูงสุด/],
            ["readability", "ความละเอียด", /อ่านละเอียด|ความละเอียด|ค่าละเอียด/],
            ["connection", "การเชื่อมต่อ", /การเชื่อมต่อ|พอร์ท|พอร์ต/],
          ] as const) {
            if (effective[key] === parsed.data[key]) continue;
            const index = next.specifications.findIndex((spec) => pattern.test(spec.label));
            if (index >= 0)
              next.specifications[index] = {
                ...next.specifications[index],
                value: parsed.data[key],
              };
            else next.specifications.push({ label, value: parsed.data[key] });
          }
          await db.cmsDocument.upsert({
            where: { id: `product-media:${version.data.id}` },
            create: {
              id: `product-media:${version.data.id}`,
              kind: "product-media",
              data: next as unknown as Prisma.InputJsonObject,
            },
            update: { data: next as unknown as Prisma.InputJsonObject },
          });
        }
        oldImage = previous.image;
        oldSlug = previous.slug;
        await db.auditLog.create({
          data: auditEntry(session, "product", previous.id, data.name, "update", [
            ...changedFields(resolveManagedProduct(previous), data),
            ...(gallery !== undefined ? ["gallery"] : []),
          ]),
        });
      } else {
        const created = await db.product.create({
          data: { ...data, id: crypto.randomUUID(), catalogManaged: true },
        });
        await db.auditLog.create({
          data: auditEntry(
            session,
            "product",
            created.id,
            created.name,
            "create",
            Object.keys(data),
          ),
        });
        if (gallery?.length) {
          const metadata = productMediaDefaults(resolveManagedProduct(created));
          await db.cmsDocument.create({
            data: {
              id: `product-media:${created.id}`,
              kind: "product-media",
              data: {
                ...metadata,
                gallery: gallery.map((image) => ({ image })),
              } as unknown as Prisma.InputJsonObject,
            },
          });
        }
      }
    });
    if (problem) return problem;
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002")
      return {
        error: "URL สินค้านี้ถูกใช้แล้ว กรุณาเปลี่ยน URL",
        fieldErrors: { slug: ["URL นี้ถูกใช้แล้ว"] },
      };
    return { error: "บันทึกสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }
  invalidateProducts(parsed.data.slug, ...(oldSlug ? [oldSlug] : []));
  if (oldImage && oldImage !== parsed.data.image) {
    try {
      await removeUnusedImage(session.supabase, oldImage);
    } catch {
      /* Saved product remains valid. */
    }
  }
  if (formData.get("detail") === "1") return { success: true };
  redirect("/admin/products?saved=1");
}
export async function deleteProductAction(formData: FormData): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง" };
  const parsed = versionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "ข้อมูลสินค้าไม่ถูกต้อง" };
  try {
    const problem = await getPrisma().$transaction(async (db) => {
      const previous = await db.product.findFirst({
        where: { id: parsed.data.id, deletedAt: null },
      });
      if (!previous) return { error: "ไม่พบสินค้านี้ อาจถูกลบไปแล้ว" };
      const result = await db.product.updateMany({
        where: { id: parsed.data.id, updatedAt: new Date(parsed.data.updatedAt), deletedAt: null },
        data: { deletedAt: new Date(), published: false },
      });
      if (!result.count) return { error: "สินค้าถูกแก้ไขจากอีกหน้าแล้ว กรุณาโหลดใหม่ก่อนลบ" };
      await db.auditLog.create({
        data: auditEntry(
          session,
          "product",
          previous.id,
          resolveManagedProduct(previous).name,
          "delete",
          ["deletedAt", "published"],
        ),
      });
      return { slug: previous.slug };
    });
    if ("error" in problem) return { error: problem.error };
    invalidateProducts(problem.slug);
  } catch {
    return { error: "ลบสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }
  return {};
}
