import { contactPath } from "@/features/content/data/contact-route";
const labels = {
  "/products": "ผลิตภัณฑ์ทั้งหมด",
  "/products/category/scales": "เครื่องชั่ง",
  "/products/category/scales/analytical": "ห้องปฏิบัติการ",
  "/products/category/scales/industrial": "อุตสาหกรรม",
  "/products/category/scales/price": "พาณิชยกรรมและบริการ",
  "/products/category/scales/kitchen": "ไลฟ์สไตล์",
  "/products/category/indicators": "อินดิเคเตอร์แท่นชั่ง",
  "/products/category/platforms": "โครงสร้างแท่นชั่ง",
  "/products/category/pos": "ระบบ POS",
  "/products/category/accessories": "อุปกรณ์เสริม",
  "/products/category/accessories/displays": "จอและไฟเตือน",
  "/guides/indicator-platform-compatibility": "จัดสเปค",
  "/service": "บริการ",
  "/service/quotation": "ขอใบเสนอราคา",
  "/technical-specification": "คู่มือและสเปก",
  "/software/download": "ดาวน์โหลดซอฟต์แวร์",
  "/software/download#retail-software": "ดาวน์โหลดซอฟต์แวร์ POS",
  [contactPath]: "ติดต่อเรา",
  "/about-us": "เกี่ยวกับ SUNFORD",
  "/warranty/register": "ลงทะเบียนรับประกัน",
  "/warranty/policy": "เงื่อนไขรับประกัน",
  "/cancel-and-return/policy": "นโยบายยกเลิกและคืนสินค้า",
} as const;

export function siteMenuLabel(href: string, fallback: string) {
  return Object.hasOwn(labels, href) ? labels[href as keyof typeof labels] : fallback;
}

export function siteMenuLink(href: keyof typeof labels) {
  return { href, label: labels[href] };
}
