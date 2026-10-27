// Leave room for multipart metadata below Vercel's 4.5 MB request limit.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export function imageSizeError(file: { size: number }): string | undefined {
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES)
    return "เลือกรูป JPG, PNG หรือ WebP ขนาดไม่เกิน 4 MB";
}
