import type { NavigationGroup, NavigationItem } from "../types";

export const defaultNavigation: NavigationItem[] = [
  {
    label: "สินค้า",
    submenuLabel: "สินค้าทั้งหมด",
    href: "/products",
    links: [
      { label: "สินค้าทั้งหมด", href: "/products" },
      { label: "เครื่องชั่งดิจิทัล", href: "/Product/Digital-weighing" },
      { label: "อินดิเคเตอร์", href: "/Indicator" },
      { label: "โครงสร้างแท่นชั่ง", href: "/product/scale-platforms" },
      { label: "ระบบ POS", href: "/Product/POS" },
      { label: "อุปกรณ์เสริม", href: "/product/scale-accessories" },
    ],
    groups: [
      {
        label: "เครื่องชั่งดิจิทัล",
        links: [
          { label: "ห้องปฏิบัติการ", href: "/product/laboratory" },
          { label: "อุตสาหกรรม", href: "/product/industrial" },
          { label: "พาณิชยกรรมและบริการ", href: "/product/commercial" },
          { label: "ไลฟ์สไตล์", href: "/product/lifestyle-scales" },
          { label: "คำนวณราคา", href: "/collections/price-computing-scales" },
          { label: "เครื่องชั่งกาแฟ", href: "/collections/coffee-scales" },
          { label: "คู่มือเลือกเครื่องชั่ง", href: "/guides/scales" },
        ],
      },
      {
        label: "อินดิเคเตอร์และแท่นชั่ง",
        links: [
          { label: "อินดิเคเตอร์ห้องปฏิบัติการ", href: "/Indicator/laboratory" },
          { label: "อินดิเคเตอร์อุตสาหกรรม", href: "/Indicator/industrial" },
          { label: "อินดิเคเตอร์พาณิชยกรรม", href: "/Indicator/commercial" },
          { label: "แท่นชั่งตั้งโต๊ะ", href: "/Product/benchtop-platforms" },
          { label: "แท่นชั่งตั้งพื้น", href: "/Product/floor-platforms" },
          { label: "คู่มืออินดิเคเตอร์", href: "/guides/indicators" },
          { label: "คู่มือโครงสร้างแท่นชั่ง", href: "/guides/platforms" },
        ],
      },
      {
        label: "ระบบ POS และอุปกรณ์",
        links: [
          { label: "POS ระบบ Android", href: "/Product/POS/Android" },
          { label: "POS ระบบ Windows", href: "/Product/POS/Windows" },
          { label: "เครื่องพิมพ์", href: "/collections/printers" },
          { label: "อุปกรณ์ส่งข้อมูล", href: "/product/data-interfaces" },
          { label: "อุปกรณ์ต่อพ่วง", href: "/product/scale-peripherals" },
          { label: "ชิ้นส่วนและอะไหล่", href: "/product/Scale-parts" },
          { label: "วัสดุสิ้นเปลือง", href: "/product/Consumables" },
          { label: "เปรียบเทียบ Android / Windows", href: "/guides/pos#systems" },
          { label: "คู่มืออุปกรณ์เสริม", href: "/guides/accessories" },
        ],
      },
    ],
  },
  {
    label: "โซลูชันตามธุรกิจ",
    submenuLabel: "โซลูชันสำหรับธุรกิจ",
    href: "/solutions",
    links: [{ label: "โซลูชันทั้งหมด", href: "/solutions" }],
    groups: [
      {
        label: "ค้าปลีก อาหารและกาแฟ",
        links: [
          { label: "ร้านค้าและตลาดสด", href: "/product/commercial" },
          { label: "ร้านกาแฟ", href: "/collections/coffee-scales" },
          { label: "เชื่อมเครื่องชั่งกับระบบ POS", href: "/solutions/pos" },
          { label: "พิมพ์ฉลากและบาร์โค้ด", href: "/solutions/label-printing" },
          { label: "พิมพ์ฉลากจากระบบ POS", href: "/solutions/pos-label-printing" },
        ],
      },
      {
        label: "อุตสาหกรรมและการผลิต",
        links: [
          { label: "เครื่องชั่งสำหรับโรงงาน", href: "/product/industrial" },
          { label: "ระบบ MES สำหรับการผลิต", href: "/solution/mes" },
          { label: "ตรวจน้ำหนักขาด–เกิน", href: "/solutions/checkweighing" },
          { label: "สร้าง Lot No. และ Serial No.", href: "/solutions/lot-serial" },
          { label: "เชื่อมต่ออุปกรณ์ PLC", href: "/solutions/plc" },
          { label: "งานชั่งในสภาพเปียกชื้น", href: "/solutions/wet-environments" },
        ],
      },
      {
        label: "ห้องแล็บและข้อมูลธุรกิจ",
        links: [
          { label: "เครื่องชั่งสำหรับห้องแล็บ", href: "/product/laboratory" },
          { label: "ระบบ ERP เชื่อมต่อข้อมูล", href: "/solution/erp" },
          { label: "ส่งข้อมูลผ่านสาย RS232", href: "/solutions/rs232" },
          { label: "ส่งข้อมูลแบบไร้สาย", href: "/solutions/wireless" },
          { label: "บันทึกน้ำหนักลง USB Drive", href: "/solutions/usb-drive" },
          { label: "บันทึกข้อมูลบน Android", href: "/solutions/android" },
          { label: "เชื่อมต่อจอแสดงผลภายนอก", href: "/solutions/external-display" },
        ],
      },
    ],
  },
  {
    label: "ซอฟต์แวร์",
    href: "/applications-and-softwares",
    links: [
      { label: "แอปพลิเคชันและซอฟต์แวร์", href: "/applications-and-softwares" },
      { label: "ดาวน์โหลดซอฟต์แวร์", href: "/software/download" },
    ],
    groups: [
      {
        label: "ค้าปลีกและระบบ POS",
        links: [
          { label: "ซอฟต์แวร์สำหรับค้าปลีก", href: "/software/download#retail-software" },
          { label: "SUNFORD POS Android", href: "/software/download/sunford-pos-android" },
          { label: "SUNFORD SmartRetail POS", href: "/software/download/sunford-pos-smart-retail" },
          { label: "SUNFORD POS Basic", href: "/software/download/sunford-pos-basic" },
          { label: "SUNFORD RLS1100", href: "/software/download/sunford-rls1100" },
          { label: "SUNFORD RLS1800", href: "/software/download/sunford-rls1800" },
        ],
      },
      {
        label: "งานชั่งและการผลิต",
        links: [
          { label: "ซอฟต์แวร์สำหรับอุตสาหกรรม", href: "/software/download#industrial-software" },
          { label: "SUNFORD WeWeigh", href: "/software/download/sunford-we-weight" },
          { label: "SUNFORD INDUS", href: "/software/download/sunford-indus" },
          { label: "SUNFORD DRV", href: "/software/download/sunford-drv" },
          {
            label: "SUNFORD LP50 Label Printer",
            href: "/software/download/sunford-lp50-label-printer",
          },
        ],
      },
      {
        label: "ครัวเรือนและสุขภาพ",
        links: [
          { label: "ซอฟต์แวร์สำหรับครัวเรือน", href: "/software/download#household-software" },
          { label: "SUNFORD FITDAYS", href: "/software/download/fitdays" },
        ],
      },
    ],
  },
  {
    label: "บริการ",
    submenuLabel: "บริการและการรับประกัน",
    href: "/service",
    links: [
      { label: "บริการหลังการขาย", href: "/service" },
      { label: "ลงทะเบียนรับประกัน", href: "/warranty/register" },
      { label: "นโยบายการรับประกัน", href: "/warranty/policy" },
      { label: "การยกเลิกและคืนสินค้า", href: "/cancel-and-return/policy" },
    ],
    groups: [
      {
        label: "ข้อมูลและความช่วยเหลือ",
        links: [
          { label: "ข้อมูลทางเทคนิคและคู่มือ", href: "/technical-specification" },
          { label: "สั่งซื้ออะไหล่", href: "/support/accessory" },
          { label: "ติดต่อฝ่ายบริการ", href: "/contact-us" },
        ],
      },
    ],
  },
  {
    label: "เกี่ยวกับเรา",
    href: "/about-us",
    links: [
      { label: "รู้จักซันฟอร์ด", href: "/about-us" },
      { label: "ข่าวสารและกิจกรรม", href: "/news-and-activities" },
      { label: "บทความ", href: "/business/blogs/editorial" },
      { label: "สำรวจข้อมูลทั้งหมด", href: "/explore" },
    ],
  },
  { label: "ติดต่อเรา", href: "/contact-us", links: [] },
];

export const defaultNavigationGroups: Record<string, NavigationGroup[]> = Object.fromEntries(
  defaultNavigation.map((item) => [item.href, item.groups ?? []]),
);

export function resolveNavigationItems(items: NavigationItem[]): NavigationItem[] {
  return items.length === defaultNavigation.length &&
    items.every((item, index) => item.href === defaultNavigation[index].href)
    ? items
    : defaultNavigation;
}

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
  mobileLinks: [] as NavigationGroup["links"],
};
