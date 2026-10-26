import type { NavigationGroup } from "../types";

export const defaultNavigationGroups: Record<string, NavigationGroup[]> = {
  "/products": [
    {
      label: "เลือกตามการใช้งาน",
      links: [
        { label: "ชั่งน้ำหนัก", href: "/collections/เครื่องชั่งน้ำหนัก" },
        { label: "นับจำนวน", href: "/collections/เครื่องชั่งนับจำนวน" },
        { label: "คำนวณราคา", href: "/collections/เครื่องชั่งคำนวณราคา" },
        { label: "พิมพ์ฉลาก", href: "/collections/เครื่องชั่งคำนวณราคา พิมพ์ฉลากสติ๊กเกอร์" },
      ],
    },
    {
      label: "เลือกเครื่องชั่งให้เหมาะกับงาน",
      links: [
        { label: "วิธีเลือกพิกัดน้ำหนัก", href: "/guides/scales#capacity" },
        { label: "ความละเอียด", href: "/guides/scales#resolution" },
        { label: "เปรียบเทียบรุ่น", href: "/guides/scales#compare" },
      ],
    },
  ],
  "/Indicator": [
    {
      label: "เลือกตามคุณสมบัติ",
      links: [
        { label: "ชั่งน้ำหนัก", href: "/collections/อินดิเคเตอร์ชั่งน้ำหนัก" },
        { label: "นับจำนวน", href: "/collections/อินดิเคเตอร์นับจำนวน" },
        { label: "กันน้ำ", href: "/collections/อินดิเคเตอร์กันน้ำ" },
        { label: "เชื่อมต่อข้อมูล", href: "/product/อุปกรณ์ส่งข้อมูล" },
      ],
    },
    {
      label: "ก่อนเลือกอินดิเคเตอร์",
      links: [
        { label: "การจับคู่กับแท่นชั่ง", href: "/guides/indicators#platforms" },
        { label: "รูปแบบการเชื่อมต่อ", href: "/guides/indicators#connections" },
        { label: "เปรียบเทียบรุ่น", href: "/guides/indicators#compare" },
      ],
    },
  ],
  "/product/โครงสร้างแท่นชั่ง": [
    {
      label: "เลือกตามลักษณะงาน",
      links: [
        { label: "งานทั่วไป", href: "/product/โครงสร้างแท่นชั่ง" },
        { label: "งานเปียก", href: "/guides/platforms#environment" },
        { label: "งานน้ำหนักมาก", href: "/collections/แท่นชั่งตั้งพืั้น ขนาดใหญ่" },
      ],
    },
    {
      label: "ก่อนเลือกแท่นชั่ง",
      links: [
        { label: "ขนาดแท่น", href: "/guides/platforms#size" },
        { label: "พิกัดน้ำหนัก", href: "/guides/platforms#capacity" },
        { label: "การเลือกหัวอ่านที่ใช้ร่วมกัน", href: "/guides/platforms#indicators" },
      ],
    },
  ],
  "/Product/POS": [
    {
      label: "ซอฟต์แวร์และอุปกรณ์",
      links: [
        { label: "ซอฟต์แวร์ POS", href: "/software/download" },
        { label: "เครื่องพิมพ์", href: "/collections/เครื่องพิมพ์" },
        { label: "อุปกรณ์ต่อพ่วง", href: "/product/อุปกรณ์ต่อพ่วง" },
      ],
    },
    {
      label: "รู้จักระบบ POS",
      links: [
        { label: "เปรียบเทียบ Android / Windows", href: "/guides/pos#systems" },
        { label: "ตัวอย่างการใช้งาน", href: "/guides/pos#workflows" },
        { label: "การเชื่อมต่อเครื่องชั่ง", href: "/guides/pos#scales" },
      ],
    },
  ],
  "/product/อุปกรณ์ประกอบเครื่องชั่ง": [
    {
      label: "เลือกอุปกรณ์ให้ตรงงาน",
      links: [
        { label: "สำหรับเครื่องชั่ง", href: "/product/อุปกรณ์ประกอบเครื่องชั่ง" },
        { label: "สำหรับระบบ POS", href: "/collections/POS Related" },
        { label: "สำหรับงานพิมพ์", href: "/collections/เครื่องพิมพ์" },
      ],
    },
    {
      label: "ก่อนเลือกอุปกรณ์",
      links: [
        { label: "ตรวจสอบรุ่นที่รองรับ", href: "/guides/accessories#compatibility" },
        { label: "เลือกเครื่องพิมพ์", href: "/guides/accessories#printers" },
        { label: "เลือกวัสดุสิ้นเปลือง", href: "/guides/accessories#consumables" },
      ],
    },
  ],
};

const navigation = [
  {
    label: "เครื่องชั่ง",
    href: "/products",
    links: [
      ["ห้องปฏิบัติการ", "/product/ห้องปฏิบัติการ"],
      ["อุตสาหกรรม", "/product/อุตสาหกรรม"],
      ["พาณิชยกรรมและบริการ", "/product/พาณิชยกรรมและบริการ"],
      ["ไลฟ์สไตล์", "/product/ไลฟ์สไตล์"],
    ],
  },
  {
    label: "อินดิเคเตอร์แท่นชั่ง",
    href: "/Indicator",
    links: [
      ["ห้องปฏิบัติการ", "/Indicator/ห้องปฏิบัติการ"],
      ["อุตสาหกรรม", "/Indicator/อุตสาหกรรม"],
      ["พาณิชยกรรมและบริการ", "/Indicator/พาณิชยกรรมและบริการ"],
    ],
  },
  {
    label: "โครงสร้างแท่นชั่ง",
    href: "/product/โครงสร้างแท่นชั่ง",
    links: [
      ["แท่นชั่งตั้งโต๊ะ", "/Product/แท่นชั่งตั้งโต๊ะ"],
      ["แท่นชั่งตั้งพื้น", "/Product/แท่นชั่งตั้งพืั้น"],
    ],
  },
  {
    label: "ระบบ POS",
    submenuLabel: "ระบบ POS ชั่งน้ำหนักเพื่อการขาย",
    href: "/Product/POS",
    links: [
      ["POS ระบบ Android", "/Product/POS/Android"],
      ["POS ระบบ Windows", "/Product/POS/Windows"],
    ],
  },
  {
    label: "อุปกรณ์เสริม",
    submenuLabel: "อุปกรณ์และวัสดุเสริม",
    href: "/product/อุปกรณ์ประกอบเครื่องชั่ง",
    links: [
      ["อุปกรณ์ส่งข้อมูล", "/product/อุปกรณ์ส่งข้อมูล"],
      ["อุปกรณ์ต่อพ่วง", "/product/อุปกรณ์ต่อพ่วง"],
      ["Thermal Printer", "/collections/เครื่องพิมพ์"],
      ["ชิ้นส่วนเสริม", "/product/Scale-parts"],
      ["วัสดุสิ้นเปลือง", "/product/Consumables"],
    ],
  },
  {
    label: "บริการและการสนับสนุน",
    href: "/#support",
    links: [
      ["บริการและการสนับสนุน", "/#support"],
      ["ลงทะเบียนรับประกัน", "/warranty/register"],
      ["นโยบายการรับประกันสินค้า", "/warranty/policy"],
      ["การยกเลิกและคืนสินค้า", "/cancel-and-return/policy"],
      ["Technical Specification", "/technical-specification"],
      ["ติดต่อเรา", "/contact-us"],
    ],
  },
];
export const defaultNavigation = navigation.map((item) => ({
  ...item,
  submenuLabel: item.submenuLabel ?? item.label,
  groups: defaultNavigationGroups[item.href] ?? [],
  links: item.links.map(([label, href]) => ({ label, href })),
}));
export const defaultNavigationExtras = {
  exploreLabel: "สำรวจเพิ่มเติม",
  exploreLinks: [
    { label: "ทุกเรื่องของ Sunford", href: "/explore" },
    { label: "รู้จักซันฟอร์ด", href: "/about-us" },
    { label: "ข่าวสารและกิจกรรม", href: "/news-and-activities" },
  ],
  helpLabel: "ให้เราช่วยคุณ",
  helpLinks: [
    { label: "ติดต่อเรา", href: "/contact-us" },
    { label: "ลงทะเบียนรับประกัน", href: "/warranty/register" },
    { label: "ข้อมูลทางเทคนิค", href: "/technical-specification" },
  ],
  mobileLinks: [
    { label: "สำรวจข้อมูลทั้งหมด", href: "/explore" },
    { label: "ติดต่อเรา", href: "/contact-us" },
  ],
};
