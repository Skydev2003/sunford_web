"use server";
import { fileTypeFromBuffer } from "file-type";
import { getAdminSession } from "./auth";
import { PRODUCT_IMAGE_BUCKET, removeUnusedImage } from "./media";
import { imageSizeError } from "../media-limits";

export async function uploadProductImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: "กรุณาเข้าสู่ระบบด้วยบัญชีแอดมิน" };
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "กรุณาเลือกรูปภาพ" };
  const sizeError = imageSizeError(file);
  if (sizeError) return { error: sizeError };
  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const type = await fileTypeFromBuffer(buffer);
    if (!type || !["image/jpeg", "image/png", "image/webp"].includes(type.mime))
      return { error: "ไฟล์นี้ไม่ใช่รูป JPG, PNG หรือ WebP ที่รองรับ" };
    const path = `${session.user.id}/${crypto.randomUUID()}.${type.ext}`;
    const { error } = await session.supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .upload(path, buffer, { contentType: type.mime, upsert: false, cacheControl: "31536000" });
    if (error) return { error: "อัปโหลดรูปไม่สำเร็จ กรุณาลองอีกครั้ง" };
    return {
      url: session.supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl,
    };
  } catch {
    return { error: "อัปโหลดรูปไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }
}
export async function discardProductImage(image: string) {
  const session = await getAdminSession();
  if (!session) return;
  await removeUnusedImage(session.supabase, image);
}
