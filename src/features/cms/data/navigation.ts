import type { NavigationGroup, NavigationItem } from "../types";
import { productCategoryDefinitions } from "@/features/catalog/data/mock-categories";

const productSubmenuLabel = "ผลิตภัณฑ์ทั้งหมด";
const productLinks = [
  { label: productSubmenuLabel, href: "/products" },
  ...productCategoryDefinitions.map(({ id, label }) => ({
    label,
    href: `/products?category=${id}`,
  })),
];

const productSubcategories: Record<
  (typeof productCategoryDefinitions)[number]["id"],
  { id: string; label: string }[]
> = {
  scales: [
    { id: "scale-price", label: "คำนวณราคาหน้าร้าน" },
    { id: "scale-industrial", label: "อุตสาหกรรมงานผลิต" },
    { id: "scale-analytical", label: "งานวิเคราะห์ความแม่นยำสูง" },
    { id: "scale-kitchen", label: "งานครัวและกาแฟ" },
    { id: "scale-water-dust", label: "กันน้ำและกันฝุ่น 100%" },
    { id: "scale-benchtop", label: "ตั้งโต๊ะ" },
    { id: "scale-floor", label: "ตั้งพื้น" },
    { id: "scale-pole", label: "มีเสา" },
  ],
  indicators: [
    { id: "indicator-lcd", label: "LCD" },
    { id: "indicator-led", label: "LED" },
    { id: "indicator-waterproof", label: "กันน้ำ" },
  ],
  platforms: [
    { id: "platform-carbon-steel", label: "เหล็กคาร์บอนพ่นอบสีกันสนิม" },
    { id: "platform-sus304", label: "สแตนเลส SUS304" },
    { id: "platform-sus201", label: "สแตนเลส SUS201" },
    { id: "platform-abs", label: "พลาสติก ABS เหนียวพิเศษ" },
  ],
  pos: [
    { id: "pos-ios", label: "iOS" },
    { id: "pos-android", label: "Android" },
    { id: "pos-windows", label: "Windows" },
  ],
  accessories: [
    { id: "accessory-displays", label: "จอแสดงผลเสริมและระบบต่อพ่วง" },
    { id: "accessory-cables", label: "สายสัญญาณและหัวต่อ" },
    { id: "accessory-mechanical", label: "อุปกรณ์เคลื่อนย้ายและชิ้นส่วนแท่นชั่ง" },
    { id: "accessory-pos", label: "อุปกรณ์ระบบหน้าร้านและต่อพ่วง POS" },
    { id: "accessory-consumables", label: "วัสดุสิ้นเปลือง" },
  ],
};
const productGroupDefinitions = [
  { label: "เครื่องชั่ง", categories: ["scales"] },
  { label: "อินดิเคเตอร์และโครงสร้างแท่นชั่ง", categories: ["indicators", "platforms"] },
  { label: "ระบบ POS และอุปกรณ์เสริม", categories: ["pos", "accessories"] },
] as const;
const productGroups: NavigationGroup[] = productGroupDefinitions.map(({ label, categories }) => ({
  label,
  links: categories.flatMap((id) =>
    productSubcategories[id].map((child) => ({
      label: child.label,
      href: `/products?category=${id}&subcategory=${child.id}`,
    })),
  ),
}));

export const defaultNavigation: NavigationItem[] = [
  {
    label: "สินค้า",
    submenuLabel: productSubmenuLabel,
    href: "/products",
    links: productLinks,
    groups: productGroups,
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
  if (
    items.length !== defaultNavigation.length ||
    !items.every((item, index) => item.href === defaultNavigation[index].href)
  )
    return defaultNavigation;
  const products = items.find((item) => item.href === "/products")!;
  if (
    products.submenuLabel === productSubmenuLabel &&
    products.links.length === productLinks.length &&
    products.links.every(
      (link, index) =>
        link.label === productLinks[index].label && link.href === productLinks[index].href,
    ) &&
    products.groups?.length === productGroups.length &&
    products.groups.every(
      (group, index) =>
        group.label === productGroups[index].label &&
        group.links.length === productGroups[index].links.length &&
        group.links.every(
          (link, linkIndex) =>
            link.label === productGroups[index].links[linkIndex].label &&
            link.href === productGroups[index].links[linkIndex].href,
        ),
    )
  )
    return items;
  return items.map((item) =>
    item.href === "/products"
      ? { ...item, submenuLabel: productSubmenuLabel, links: productLinks, groups: productGroups }
      : item,
  );
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
