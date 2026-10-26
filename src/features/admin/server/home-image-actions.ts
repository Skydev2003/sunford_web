"use server";
import { redirect } from "next/navigation";
import { updateTag, revalidatePath } from "next/cache";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { getAdminSession } from "./auth";
import { isAllowedProductImage, removeUnusedImage } from "./media";
import { homeImageSlots } from "@/features/home/data/image-slots";
import type { ActionState } from "../types";

const imageInput = z.object({
  slot: z.enum(homeImageSlots.map((slot) => slot.id)),
  image: z.string().max(2048),
  updatedAt: z.union([z.iso.datetime(), z.literal("")]),
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
  const { slot, image, updatedAt } = parsed.data;
  let previousImage: string | undefined;
  try {
    const previous = await getPrisma().homepageImage.findUnique({ where: { slot } });
    if ((previous?.updatedAt.toISOString() ?? "") !== updatedAt) return stale;
    if (previous) {
      const where = { slot, updatedAt: new Date(updatedAt) };
      const result = image
        ? await getPrisma().homepageImage.updateMany({ where, data: { image } })
        : await getPrisma().homepageImage.deleteMany({ where });
      if (!result.count) return stale;
      previousImage = previous.image;
    } else if (image) {
      await getPrisma().homepageImage.create({ data: { slot, image } });
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
