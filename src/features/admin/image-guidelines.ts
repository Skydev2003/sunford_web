export const imageGuidelines = {
  product: { width: 1200, height: 1200, label: "รูปหลัก การ์ดสินค้า และแกลเลอรี" },
  hero: { width: 1600, height: 1000, label: "รูปสินค้าด้านขวาของแบนเนอร์หลัก" },
  cover: { width: 1600, height: 900, label: "รูปปกบทความหรือวิดีโอ" },
  page: { width: 1180, height: 340, label: "รูปปกบนหน้าข้อมูลและบทความ" },
  logo: { width: 600, height: 200, label: "โลโก้บนแถบนำทาง" },
} as const;

export type ImageGuideline = { width: number; height: number; label: string };

export function imageHint(preset: ImageGuideline) {
  return `แนะนำ ${preset.width} × ${preset.height} พิกเซล · JPG, PNG หรือ WebP ไม่เกิน 4 MB ต่อรูป · เลือกตัดภาพหรือใช้รูปต้นฉบับได้`;
}
