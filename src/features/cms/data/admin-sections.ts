import type { HomeImageSlot } from "@/features/home/data/image-slots";

export const homeSettingCards: {
  id: string;
  title: string;
  description: string;
  imageSlots: readonly HomeImageSlot[];
}[] = [
  {
    id: "hero",
    title: "แบนเนอร์หลักและสไลด์",
    description: "เลือกสินค้า เรียงสไลด์ รูป คำโฆษณา และปุ่ม",
    imageSlots: [],
  },
  {
    id: "spotlight",
    title: "สินค้าเด่นบนพื้นดำ",
    description: "หัวข้อ คำโปรย รูปสินค้า และข้อความปุ่ม",
    imageSlots: ["spotlight"],
  },
  {
    id: "showcase",
    title: "การ์ดผลิตภัณฑ์หน้าแรก",
    description: "ชื่อ คำโปรย รูปภาพ และปลายทางของการ์ดทั้ง 4",
    imageSlots: ["digital", "smart", "accessories", "software"],
  },
  {
    id: "catalog",
    title: "หัวข้อสินค้าและแถบนำทางหน้าแรก",
    description: "หัวข้อแนะนำสินค้า ข้อความเปรียบเทียบ และแถบลิงก์สินค้า",
    imageSlots: [],
  },
  {
    id: "section:solutions",
    title: "โซลูชันธุรกิจ",
    description: "ข้อความ รูปภาพ และปลายทางลิงก์",
    imageSlots: [],
  },
  {
    id: "section:story",
    title: "เรื่องราวแบรนด์",
    description: "เนื้อหา รูปภาพ และลิงก์รู้จักเรา",
    imageSlots: [],
  },
  {
    id: "stories",
    title: "หัวข้อข่าวและวิดีโอหน้าแรก",
    description: "หัวข้อ ข้อความปุ่ม และลิงก์อ่านต่อ",
    imageSlots: [],
  },
  {
    id: "videos",
    title: "วิดีโอหน้าแรก",
    description: "เพิ่ม ลบ เรียงวิดีโอ และเปลี่ยนภาพปก",
    imageSlots: [],
  },
  {
    id: "section:support",
    title: "บริการและการสนับสนุน",
    description: "หัวข้อ รายละเอียดบริการ และลิงก์",
    imageSlots: [],
  },
];

export const siteSettingCards = [
  {
    id: "site",
    title: "โลโก้และข้อมูลติดต่อ",
    description: "โลโก้ ชื่อแบรนด์ เบอร์โทร อีเมล และ LINE",
  },
  { id: "navigation", title: "เมนูนำทาง", description: "เพิ่ม แก้ไข เรียงเมนู และลิงก์ย่อย" },
  {
    id: "section:footer",
    title: "ส่วนท้ายเว็บไซต์",
    description: "ข้อความ เวลาบริการ ที่อยู่ และลิงก์ส่วนท้าย",
  },
];

export function editorParent(id: string, kind: string) {
  if (homeSettingCards.some((card) => card.id === id))
    return { href: "/admin/home-images", label: "จัดการหน้าแรก" };
  if (kind === "category") return { href: "/admin/categories", label: "หมวดหมู่สินค้า" };
  if (kind === "product-media") return { href: "/admin/products", label: "ผลิตภัณฑ์" };
  if (siteSettingCards.some((card) => card.id === id)) return null;
  return { href: "/admin/content", label: "หน้าข้อมูลและบทความ" };
}
