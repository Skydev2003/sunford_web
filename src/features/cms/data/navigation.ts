const navigation = [
  {
    label: "ผลิตภัณฑ์",
    href: "/products",
    links: [
      ["สำรวจผลิตภัณฑ์ทั้งหมด", "/products"],
      ["เครื่องชั่งดิจิทัล", "/Product/Digital-weighing"],
      ["ห้องปฏิบัติการ", "/product/ห้องปฏิบัติการ"],
      ["อุตสาหกรรม", "/product/อุตสาหกรรม"],
      ["พาณิชยกรรมและบริการ", "/product/พาณิชยกรรมและบริการ"],
      ["ไลฟ์สไตล์", "/product/ไลฟ์สไตล์"],
    ],
  },
  {
    label: "เครื่องชั่งอัจฉริยะ",
    href: "/Product/MES",
    links: [
      ["ระบบ MES ชั่งน้ำหนักเพื่อการผลิต", "/Product/MES"],
      ["ระบบ POS ชั่งน้ำหนักเพื่อการขาย", "/Product/POS"],
      ["Smart weighing", "/collections/Smart weighing"],
      ["เครื่องชั่งเชื่อมต่อแบบมีสาย", "/product/wired-smart-scale"],
      ["เครื่องชั่งเชื่อมต่อไร้สาย", "/product/wireless-smart-scale"],
    ],
  },
  {
    label: "อุปกรณ์เสริม",
    href: "/product/อุปกรณ์ประกอบเครื่องชั่ง",
    links: [
      ["อุปกรณ์และวัสดุเสริมทั้งหมด", "/product/อุปกรณ์ประกอบเครื่องชั่ง"],
      ["อุปกรณ์ส่งข้อมูล", "/product/อุปกรณ์ส่งข้อมูล"],
      ["อุปกรณ์ต่อพ่วง", "/product/อุปกรณ์ต่อพ่วง"],
      ["อินดิเคเตอร์แท่นชั่ง", "/Indicator"],
      ["โครงสร้างแท่นชั่ง", "/product/โครงสร้างแท่นชั่ง"],
    ],
  },
  {
    label: "ซอฟต์แวร์",
    href: "/applications-and-softwares",
    links: [
      ["แอปพลิเคชันและซอฟต์แวร์", "/applications-and-softwares"],
      ["ดาวน์โหลดซอฟต์แวร์", "/software/download"],
      ["SUNFORD POS Android", "/software/download/sunford-pos-android"],
      ["SUNFORD POS Basic", "/software/download/sunford-pos-basic"],
      ["SUNFORD INDUS", "/software/download/sunford-indus"],
    ],
  },
  {
    label: "โซลูชันสำหรับธุรกิจ",
    href: "/#solutions",
    links: [
      ["โซลูชันทั้งหมด", "/#solutions"],
      ["โซลูชัน ERP", "/solution/erp"],
      ["โซลูชัน MES", "/solution/mes"],
    ],
  },
  {
    label: "รู้จักซันฟอร์ด",
    href: "/about-us",
    links: [
      ["เรื่องราวของเรา", "/about-us"],
      ["ข่าวสารและกิจกรรม", "/news-and-activities"],
      ["สำรวจข้อมูลทั้งหมด", "/explore"],
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
