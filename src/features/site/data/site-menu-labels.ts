import { contactPath } from "@/features/content/data/contact-route";
import { scaleSpecBuilderPath } from "@/features/catalog/data/scale-spec-builder-path";
import { platformSpecBuilderPath } from "@/features/catalog/data/platform-spec-builder-path";

export const catalogPageTitles = {
  "/products": "ร้าน",
  "/scales": "เครื่องชั่ง",
  "/platforms": "แท่นชั่ง",
  "/indicators": "อินดิเคเตอร์",
  "/platforms/indicators": "อินดิเคเตอร์",
  "/scales/laboratory": "ห้องปฏิบัติการ",
  "/scales/industrial": "อุตสาหกรรม",
  "/scales/retail": "ร้านค้าและบริการ",
  "/scales/household": "ครัวเรือนและบุคคล",
  "/scales/water-dust": "กันน้ำกันฝุ่น",
  [scaleSpecBuilderPath]: "จัดสเปค",
} as const;

export function catalogPageTitle(href: string, fallback: string) {
  return Object.hasOwn(catalogPageTitles, href)
    ? catalogPageTitles[href as keyof typeof catalogPageTitles]
    : fallback;
}

const labels = {
  "/products": "ผลิตภัณฑ์ทั้งหมด",
  "/scales": "เครื่องชั่ง",
  "/scales/laboratory": "ห้องปฏิบัติการ",
  "/scales/industrial": "อุตสาหกรรม",
  "/scales/retail": "พาณิชยกรรมและบริการ",
  "/scales/household": "ไลฟ์สไตล์",
  "/indicators": "อินดิเคเตอร์แท่นชั่ง",
  "/platforms/indicators": "อินดิเคเตอร์แท่นชั่ง",
  "/platforms": "โครงสร้างแท่นชั่ง",
  "/pos": "ระบบ POS",
  "/accessories": "อุปกรณ์เสริม",
  "/accessories/displays": "จอและไฟเตือน",
  [platformSpecBuilderPath]: "จัดสเปค",
  "/service": "บริการ",
  "/service/quotation": "ขอใบเสนอราคา",
  "/service/technical-specification": "คู่มือและสเปก",
  "/software": "ดาวน์โหลดซอฟต์แวร์",
  "/software/retail": "ดาวน์โหลดซอฟต์แวร์ POS",
  [contactPath]: "ติดต่อเรา",
  "/about-us": "เกี่ยวกับ SUNFORD",
  "/service/warranty/register": "ลงทะเบียนรับประกัน",
  "/service/warranty/policy": "เงื่อนไขรับประกัน",
  "/service/cancel-and-return/policy": "นโยบายยกเลิกและคืนสินค้า",
} as const;

export function siteMenuLabel(href: string, fallback: string) {
  return Object.hasOwn(labels, href) ? labels[href as keyof typeof labels] : fallback;
}

export function siteMenuLink(href: keyof typeof labels) {
  return { href, label: labels[href] };
}
