const news = {
  path: "/news-and-activities",
  title: "ข่าวสารและกิจกรรม",
} as const;

const articles = {
  path: "/service/articles",
  title: "บทความจากซันฟอร์ด",
} as const;

export const editorialArticlesPath = articles.path;
export const legacyEditorialArticlesPath = "/business/blogs/editorial";
export const featuredEditorialArticles = [
  {
    path: "/blogs/editorial/tcs-platform-scale-transit-screws",
    cover: "/images/imported/19c5ba6de88d012634f6.avif",
    summary: "รู้จักหน้าที่ของสกรูป้องกันกระแทก และความต่างจากสกรูสำหรับขนส่งในเครื่องชั่งแบบแท่น",
  },
  {
    path: "/blogs/editorial/price-computing-scale-quick-guide",
    cover: "/images/imported/a9d9b411f0be83f70b09.avif",
    summary: "ดูขั้นตอนใช้งานเครื่องชั่งคำนวณราคาในคู่มือภาพของซันฟอร์ด",
  },
  {
    path: "/blogs/editorial/before-using-a-price-computing-scale",
    cover: "/images/imported/74375f62a2c0c53aea7e.avif",
    summary: "สิ่งที่ควรตรวจสอบก่อนเริ่มชั่งขาย ตั้งแต่การรับรอง ตำแหน่งวาง ไปจนถึงการเปิดใช้งาน",
  },
  {
    path: "/blogs/editorial/food-contact-stainless-steel-scale-pans",
    cover: "/images/imported/f3aed7467ed6e9c30c08.avif",
    summary: "รู้จักเกรดสแตนเลสที่ใช้กับจานชั่งอาหาร และวิธีดูแลจานชั่งหลังใช้งาน",
  },
  {
    path: "/blogs/editorial/weights-and-measures-certification",
    cover: "/images/imported/4052e4ab0912b14f2d56.avif",
    summary: "รู้จักหนังสือรับรองและเครื่องหมายคำรับรองของเครื่องชั่งที่ใช้ในการค้า",
  },
  {
    path: "/blogs/editorial/ip-ratings-guide",
    cover: "/images/imported/8467dc6efb1c6cf55448.avif",
    summary: "อ่านความหมายของตัวเลข IP เพื่อเข้าใจระดับการป้องกันฝุ่นและน้ำของอุปกรณ์",
  },
  {
    path: "/blogs/editorial/iso-17025-scale-calibration",
    cover: "/images/imported/31a491d9bc34d77881fc.avif",
    summary: "ทำความรู้จักใบรับรองจากห้องปฏิบัติการและค่าความไม่แน่นอนของการวัดที่ระบุในเอกสาร",
  },
  {
    path: "/blogs/editorial/battery-charging-guide",
    cover: "/images/imported/973ef2336fd760f1244c.avif",
    summary: "ข้อควรทราบเรื่องการชาร์จแบตเตอรี่และการเลือกอะแดปเตอร์ให้ตรงกับรุ่นเครื่องชั่ง",
  },
  {
    path: "/blogs/editorial/do-you-need-a-home-scale",
    cover: "/images/imported/bfc8662604f8585f0c51.avif",
    summary: "รู้จักเครื่องชั่งในบ้าน กับบทบาทในการติดตามน้ำหนักและการดูแลตัวเอง",
  },
];

export const publishedEditorialArticlePaths = new Set([
  ...featuredEditorialArticles.map(({ path }) => path),
  "/blogs/editorial/lcd-vs-led-displays",
  "/blogs/editorial/why-scales-show-weight-without-a-load",
]);

export const editorialUnavailable = "ยังไม่มีข่าวหรือบทความที่เผยแพร่บนเว็บไซต์";

export function getEditorialSection(path: string) {
  if (path === news.path) return news;
  if (
    path === articles.path ||
    path === legacyEditorialArticlesPath ||
    path === "/blogs/editorial" ||
    path === "/business"
  ) {
    return articles;
  }
  return undefined;
}
