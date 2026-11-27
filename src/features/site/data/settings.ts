import type { HeroSettings, SiteSettings } from "../types";
import { sunford } from "@/features/home/data/brand";
export const sunfordLogo = "/icon.svg";

export const defaultHero: HeroSettings = {
  announcement: "เทคโนโลยีการชั่งและระบบจัดการข้อมูล เพื่อธุรกิจของคุณ",
  announcementLabel: "ให้เราช่วยเลือก",
  announcementHref: "/service",
  tagline: "ความแม่นยำ ที่เรียบง่ายกว่า.",
  primaryLabel: "ดูเพิ่มเติม",
  secondaryLabel: "ค้นพบผลิตภัณฑ์",
  secondaryHref: "#products",
  slides: ["acs30-jc21", "feh5ks", "wps10ks"].map((productId) => ({
    productId,
    title: "",
    description: "",
    image: "",
    href: "",
  })),
};
export const defaultSite: SiteSettings = {
  logo: sunfordLogo,
  name: "SUNFORD",
  phone: sunford.phone,
  phoneHref: sunford.phoneHref,
  email: sunford.email,
  line: sunford.line,
  messenger: sunford.messenger,
};
export const spotlightDefaults = {
  title: "SUNFORD WPS10KS",
  accent: "ชั่งน้ำหนัก นับจำนวน พร้อมมาตรฐาน IP67",
  description: "",
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
  eyebrow: "INTERESTING ARTICLES",
  title: "บทความน่ารู้",
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
  softwareHref: sunford.downloads,
};
