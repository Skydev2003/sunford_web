"use server";
import { redirect } from "next/navigation";
import { updateTag, revalidatePath } from "next/cache";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { getAdminSession } from "./auth";
import { isAllowedProductImage, removeUnusedImage } from "./media";
import { homeImageSlots } from "@/features/home/data/image-slots";
import type { ActionState } from "../types";
import { homePageOptions } from "@/features/home/server/home-link-options";

const imageInput = z.object({
  slot: z.enum(homeImageSlots.map((slot) => slot.id)),
  image: z.string().max(2048),
  updatedAt: z.union([z.iso.datetime(), z.literal("")]),
  targetType: z.enum(["default", "product", "page"]).optional(),
  targetProductId: z.string().max(100).optional(),
  targetPagePath: z.string().max(1024).optional(),
});
const stale = { error: "รูปนี้ถูกแก้ไขจากอีกหน้าแล้ว กรุณาโหลดหน้าใหม่ก่อนบันทึก" };

export async function saveHomeImageAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง" };
  const parsed = imageInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success || !isAllowedProductImage(parsed.data.image))
    return { error: "ข้อมูลรูปไม่ถูกต้อง กรุณาอัปโหลดรูปผ่านแบบฟอร์ม" };
  const { slot, image, updatedAt, targetType } = parsed.data;
  let previousImage: string | undefined;
  try {
    const previous = await getPrisma().homepageImage.findUnique({ where: { slot } });
    if ((previous?.updatedAt.toISOString() ?? "") !== updatedAt) return stale;
    let targetProductId = previous?.targetProductId ?? null;
    let targetPagePath = previous?.targetPagePath ?? null;
    if (targetType !== undefined) {
      targetProductId = null;
      targetPagePath = null;
      if (targetType === "product") {
        const product =
          parsed.data.targetProductId &&
          (await getPrisma().product.findFirst({
            where: { id: parsed.data.targetProductId, published: true, deletedAt: null },
            select: { id: true },
          }));
        if (!product) return { error: "กรุณาเลือกสินค้าที่เผยแพร่และยังไม่ถูกลบเป็นปลายทาง" };
        targetProductId = product.id;
      } else if (targetType === "page") {
        if (!homePageOptions().some((page) => page.path === parsed.data.targetPagePath))
          return { error: "กรุณาเลือกหน้าข้อมูลจากรายการในเว็บไซต์" };
        targetPagePath = parsed.data.targetPagePath!;
      }
    }
    const data = { image, targetProductId, targetPagePath };
    const hasSetting = Boolean(image || targetProductId || targetPagePath);
    if (previous) {
      const where = { slot, updatedAt: new Date(updatedAt) };
      const result = hasSetting
        ? await getPrisma().homepageImage.updateMany({ where, data })
        : await getPrisma().homepageImage.deleteMany({ where });
      if (!result.count) return stale;
      previousImage = previous.image;
    } else if (hasSetting) {
      await getPrisma().homepageImage.create({ data: { slot, ...data } });
    }
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002")
      return stale;
    return { error: "บันทึกรูปไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }
  updateTag("home-images");
  revalidatePath("/", "page");
  revalidatePath("/admin/home-images");
  if (previousImage && previousImage !== image) {
    try {
      await removeUnusedImage(session.supabase, previousImage);
    } catch {
      /* The saved image remains valid. */
    }
  }
  redirect(`/admin/home-images?saved=${slot}`);
}
