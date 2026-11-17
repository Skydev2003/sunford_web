import { sunford } from "@/features/home/data/brand";

export const footerNavigation = [
  {
    label: "ผลิตภัณฑ์",
    links: [
      { label: "ผลิตภัณฑ์ทั้งหมด", href: "/products" },
      { label: "เครื่องชั่งดิจิทัล", href: "/products/category/scales" },
      { label: "หัวอ่านน้ำหนัก", href: "/products/category/indicators" },
      { label: "แท่นชั่ง", href: "/products/category/platforms" },
      { label: "ระบบ POS และอุปกรณ์", href: "/products/category/pos" },
      { label: "อุปกรณ์เสริม", href: "/products/category/accessories" },
    ],
  },
  {
    label: "โซลูชันและซอฟต์แวร์",
    links: [
      { label: "โซลูชัน", href: "/solutions" },
      { label: "ERP", href: sunford.erp },
      { label: "MES", href: sunford.mes },
      { label: "แอปพลิเคชันและซอฟต์แวร์", href: sunford.software },
    ],
  },
  {
    label: "บริการและช่วยเหลือ",
    links: [
      { label: "บริการหลังการขาย", href: sunford.service },
      { label: "ขอใบเสนอราคา", href: "/service/quotation" },
      { label: "คู่มือเลือกหัวอ่านและแท่นชั่ง", href: "/guides/indicator-platform-compatibility" },
      { label: "ดาวน์โหลดซอฟต์แวร์", href: sunford.downloads },
      { label: "ลงทะเบียนรับประกัน", href: sunford.warranty },
    ],
  },
] as const;

export const footerLegalLinks = [
  { label: "ความเป็นส่วนตัวและคุกกี้", href: "/privacy-policy-and-cookie-policy" },
  { label: "นโยบายการรับประกัน", href: sunford.warrantyPolicy },
  { label: "การยกเลิกและคืนสินค้า", href: "/cancel-and-return/policy" },
] as const;
