"use server";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { getAdminSession } from "./auth";
import { isAllowedProductImage, removeUnusedImage } from "./media";
import { productInputSchema, versionSchema } from "../validation";
import type { ActionState } from "../types";
import { getSnapshotProducts } from "@/features/content/data/catalog-snapshot";

function invalidateProducts(...slugs: string[]) {
  updateTag("products");
  revalidatePath("/", "page");
  revalidatePath("/products");
  revalidatePath("/api/products");
  revalidatePath("/(site)/[...path]", "page");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/new");
  slugs.forEach((slug) => revalidatePath(`/products/${slug}`));
}
export async function saveProductAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง" };
  const raw = Object.fromEntries(formData);
  const parsed = productInputSchema.safeParse({
    ...raw,
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success)
    return { error: "กรุณาตรวจสอบข้อมูลสินค้า", fieldErrors: parsed.error.flatten().fieldErrors };
  if (!isAllowedProductImage(parsed.data.image))
    return { error: "กรุณาอัปโหลดรูปผ่านช่องรูปสินค้า" };
  const id = formData.get("id");
  let oldImage: string | undefined;
  let oldSlug: string | undefined;
  try {
    const reserved = getSnapshotProducts().some(
      (product) =>
        product.id !== id &&
        [product.slug, product.sourceId].some((slug) => slug === parsed.data.slug),
    );
    const duplicate = await getPrisma().product.findFirst({
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
      const previous = await getPrisma().product.findFirst({
        where: { id: version.data.id, deletedAt: null },
      });
      if (!previous) return { error: "ไม่พบสินค้านี้ อาจถูกลบไปแล้ว" };
      const result = await getPrisma().product.updateMany({
        where: {
          id: version.data.id,
          updatedAt: new Date(version.data.updatedAt),
          deletedAt: null,
        },
        data: { ...parsed.data, catalogManaged: true },
      });
      if (!result.count) return { error: "สินค้าถูกแก้ไขจากอีกหน้าแล้ว กรุณาโหลดใหม่ก่อนบันทึก" };
      oldImage = previous.image;
      oldSlug = previous.slug;
    } else {
      await getPrisma().product.create({
        data: { ...parsed.data, id: crypto.randomUUID(), catalogManaged: true },
      });
    }
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
  redirect("/admin/products?saved=1");
}
export async function deleteProductAction(formData: FormData): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง" };
  const parsed = versionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "ข้อมูลสินค้าไม่ถูกต้อง" };
  try {
    const previous = await getPrisma().product.findFirst({
      where: { id: parsed.data.id, deletedAt: null },
    });
    if (!previous) return { error: "ไม่พบสินค้านี้ อาจถูกลบไปแล้ว" };
    const result = await getPrisma().product.updateMany({
      where: { id: parsed.data.id, updatedAt: new Date(parsed.data.updatedAt), deletedAt: null },
      data: { deletedAt: new Date(), published: false },
    });
    if (!result.count) return { error: "สินค้าถูกแก้ไขจากอีกหน้าแล้ว กรุณาโหลดใหม่ก่อนลบ" };
    invalidateProducts(previous.slug);
  } catch {
    return { error: "ลบสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }
  return {};
}
