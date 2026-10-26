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
