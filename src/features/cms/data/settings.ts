import type { Field, HeroSettings, SiteSettings } from "../types";
import { sunford } from "@/features/home/data/brand";
export const defaultHero: HeroSettings = {
  announcement: "เทคโนโลยีการชั่งและระบบจัดการข้อมูล เพื่อธุรกิจของคุณ",
  announcementLabel: "ให้เราช่วยเลือก",
  announcementHref: "#support",
  tagline: "ความแม่นยำ ที่เรียบง่ายกว่า.",
  primaryLabel: "ดูเพิ่มเติม",
  secondaryLabel: "ค้นพบผลิตภัณฑ์",
  secondaryHref: "#products",
  slides: ["acs30-jc21", "feh5ks", "rls1100"].map((productId) => ({
    productId,
    title: "",
    description: "",
    image: "",
    href: "",
  })),
};
export const defaultSite: SiteSettings = {
  logo: "/images/sunford-logo.png",
  name: "SUNFORD",
  phone: sunford.phone,
  phoneHref: sunford.phoneHref,
  email: sunford.email,
  line: sunford.line,
};
export const linkFields: Field[] = [
  { key: "label", label: "ข้อความ" },
  { key: "href", label: "ลิงก์", hint: "/path ภายในเว็บ หรือ https:// สำหรับภายนอก" },
];
export const videoFields: Field[] = [
  {
    key: "id",
    label: "YouTube URL หรือรหัสวิดีโอ",
    hint: "เช่น https://www.youtube.com/watch?v=abcdefghijk",
  },
  { key: "image", label: "ภาพปกวิดีโอ", type: "image" },
];
export const heroFields = (products: { id: string; name: string }[]): Field[] => [
  { key: "announcement", label: "ข้อความแถบประกาศ" },
  { key: "announcementLabel", label: "ข้อความปุ่มแถบประกาศ" },
  { key: "announcementHref", label: "ลิงก์แถบประกาศ" },
  { key: "tagline", label: "คำโฆษณาใต้ชื่อสินค้า" },
  { key: "primaryLabel", label: "ข้อความปุ่มหลัก" },
  { key: "secondaryLabel", label: "ข้อความปุ่มรอง" },
  { key: "secondaryHref", label: "ลิงก์ปุ่มรอง" },
  {
    key: "slides",
    label: "สไลด์ (เรียงตามลำดับที่แสดง)",
    type: "array",
    initial: { productId: "", title: "", description: "", image: "", href: "" },
    fields: [
      {
        key: "productId",
        label: "อ้างอิงสินค้า",
        type: "select",
        options: [
          { value: "", label: "ไม่อ้างอิงสินค้า" },
          ...products.map((p) => ({ value: p.id, label: p.name })),
        ],
        hint: "อ้างอิงด้วยรหัสสินค้า ลิงก์จะตาม URL ล่าสุด และไม่แสดงสไลด์หากสินค้าถูกซ่อนหรือลบ",
      },
      { key: "title", label: "หัวข้อ (เว้นว่างเพื่อใช้ชื่อสินค้า)" },
      { key: "description", label: "คำโปรย (เว้นว่างเพื่อใช้คำโปรยสินค้า)", type: "textarea" },
      { key: "image", label: "รูปสไลด์ (เว้นว่างเพื่อใช้รูปสินค้า)", type: "image" },
      { key: "href", label: "ลิงก์ (เว้นว่างเพื่อใช้หน้าสินค้า)" },
    ],
  },
];
export const siteFields: Field[] = [
  { key: "logo", label: "โลโก้", type: "image" },
  { key: "name", label: "ชื่อแบรนด์" },
  { key: "phone", label: "เบอร์โทรที่แสดง" },
  { key: "phoneHref", label: "ลิงก์โทรศัพท์ เช่น tel:034276999" },
  { key: "email", label: "อีเมล" },
  { key: "line", label: "ลิงก์ LINE" },
];
export const spotlightDefaults = {
  title: "ชั่ง. พิมพ์. จัดการ.",
  accent: "ง่ายในเครื่องเดียว.",
  description: "เครื่องชั่งพิมพ์ฉลากบาร์โค้ด\nให้ทุกร้านค้า ทำงานได้เป็นระบบยิ่งขึ้น",
  primaryLabel: "ดูเพิ่มเติม",
  secondaryLabel: "ปรึกษาผู้เชี่ยวชาญ",
  secondaryHref: "#contact",
};
export const showcaseDefaults = {
  digitalName: "เครื่องชั่งดิจิทัล",
  digitalEnglish: "DIGITAL SCALE",
  digitalDescription: "ความแม่นยำที่พร้อมสำหรับทุกงาน ตั้งแต่บ้าน ร้านค้า ไปจนถึงโรงงาน",
  smartName: "เครื่องชั่งอัจฉริยะ",
  smartEnglish: "SMART SCALE",
  smartDescription: "เชื่อมต่อข้อมูลและอุปกรณ์ ให้การทำงานในยุคดิจิทัลคล่องตัวยิ่งขึ้น",
  accessoriesName: "อุปกรณ์เสริม",
  accessoriesEnglish: "ACCESSORIES",
  accessoriesDescription: "เครื่องพิมพ์ จอแสดงผล และระบบ POS ที่เติมเต็มงานชั่งของคุณ",
  softwareName: "แอปพลิเคชันและซอฟต์แวร์",
  softwareEnglish: "APPLICATIONS & SOFTWARE",
  softwareDescription: "ติดตาม วิเคราะห์ และจัดการข้อมูล เพื่อการตัดสินใจที่แม่นยำ",
  linkLabel: "ดูเพิ่มเติม",
};
export const storiesDefaults = {
  eyebrow: "SUNFORD STORIES",
  title: "เรื่องราวของคนทำธุรกิจ.",
  linkLabel: "ดูเรื่องราวทั้งหมด",
  href: "/news-and-activities",
  cardLabel: "SUNFORD BIZ TALK",
  readLabel: "อ่านเพิ่มเติม",
  videoTitle: "วิดีโอจาก Sunford",
};
export const catalogDefaults = {
  eyebrow: "THE SUNFORD COLLECTION",
  title: "เลือกความแม่นยำ",
  accent: "ในแบบของคุณ.",
  linkLabel: "สำรวจผลิตภัณฑ์ทั้งหมด",
  href: "/products",
  note: "เลือกสิ่งที่ใช่ได้ง่ายขึ้น",
  noteDetail: "กด + บนสินค้าเพื่อเปรียบเทียบได้สูงสุด 3 รุ่น",
  navEyebrow: "OUR PRODUCTS",
  navTitle: "ครบทุกงานชั่ง",
  navDigital: "เครื่องชั่งดิจิทัล",
  navDigitalEnglish: "Digital scale",
  navSmart: "เครื่องชั่งอัจฉริยะ",
  navSmartEnglish: "Smart scale",
  navAccessories: "อุปกรณ์เสริม",
  navAccessoriesEnglish: "Accessories",
  navSoftware: "แอปพลิเคชันและซอฟต์แวร์",
  navSoftwareEnglish: "Applications & software",
  accessoriesHref: sunford.accessories,
  softwareHref: sunford.software,
};
export const textFields = (
  defaults: Record<string, string>,
  labels: Record<string, string> = {},
): Field[] =>
  Object.keys(defaults).map((key) => ({
    key,
    label: labels[key] ?? key,
    type: /description/i.test(key) ? "textarea" : "text",
  }));
