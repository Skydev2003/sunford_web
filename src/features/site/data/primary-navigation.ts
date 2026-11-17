import type { NavigationItem } from "../types";
import { resolveCategoryHref } from "@/features/catalog/data/category-destinations";

// Confirmed by the destination/content audit on 2026-11-16; recheck before enabling.
const unavailableDestinations = new Set([
  "/products/category/scales/analytical",
  "/products/category/scales/checkweigher",
  "/products/category/scales/sets",
  "/products/category/indicators/waterproof",
  "/products/category/platforms/carbon-steel",
  "/products/category/platforms/sus304",
  "/products/category/platforms/sus201",
  "/products/category/platforms/abs",
  "/products/category/pos/sets",
  "/products/category/accessories/printers",
  "/products/category/accessories/pos",
  "/products/category/accessories/electronics",
  "/products/category/accessories/weights",
  "/solutions/checkweighing",
  "/solutions/rs232",
  "/solutions/wireless",
  "/solutions/external-display",
  "/solutions/wet-environments",
  "/solutions/pos",
  "/solutions/label-printing",
  "/solutions/pos-label-printing",
  "/technical-specification",
  "/software/download",
]);

const guideHref = "/guides/indicator-platform-compatibility";

export function getPrimaryNavigationItems(navigation: NavigationItem[]): NavigationItem[] {
  const savedLinks = navigation.flatMap((item) => [
    ...item.links,
    ...(item.groups ?? []).flatMap((group) => group.links),
  ]);
  const savedDisabled = new Set(
    savedLinks.filter((link) => link.disabled).map((link) => resolveCategoryHref(link.href)),
  );
  const links = (entries: [label: string, href: string][]): NavigationItem["links"] =>
    entries.map(([label, source]) => {
      const href = resolveCategoryHref(source);
      const disabled = unavailableDestinations.has(href) || savedDisabled.has(href);
      return { label, href, ...(disabled ? { disabled: true } : {}) };
    });
  const help = links([
    ["คู่มือและสเปก", "/technical-specification"],
    ["ลงทะเบียนรับประกัน", "/warranty/register"],
    ["เงื่อนไขรับประกัน", "/warranty/policy"],
    ["ติดต่อฝ่ายบริการ", "/contact-us"],
  ]);
  const productLinks = navigation.find((item) => item.href === "/products")?.links ?? [];
  const categoryLabel = (id: string, fallback: string) =>
    productLinks.find((link) => new URLSearchParams(link.href.split("?")[1]).get("category") === id)
      ?.label ?? fallback;
  const menu = (
    label: string,
    href: string,
    children: [string, string][],
    uses: [string, string][],
    assistance = help,
    submenuLabel = "สินค้า",
  ): NavigationItem => ({
    label,
    href,
    submenuLabel,
    links: links(children),
    groups: [
      { label: "การใช้งาน", links: links(uses) },
      { label: "ช่วยเหลือ", links: assistance },
    ],
  });

  return [
    menu(
      "ผลิตภัณฑ์ทั้งหมด",
      "/products",
      [
        ["เครื่องชั่ง", "/products/category/scales"],
        ["อินดิเคเตอร์", "/products/category/indicators"],
        ["แท่นชั่ง", "/products/category/platforms"],
        ["POS", "/products/category/pos"],
        ["อุปกรณ์เสริม", "/products/category/accessories"],
      ],
      [
        ["ร้านค้าและตลาด", "/product/commercial"],
        ["ครัวและกาแฟ", "/collections/coffee-scales"],
        ["โรงงาน", "/product/industrial"],
        ["ห้องแล็บ", "/product/laboratory"],
      ],
    ),
    menu(
      categoryLabel("scales", "เครื่องชั่ง"),
      "/products/category/scales",
      [
        ["คำนวณราคา", "/products/category/scales/price"],
        ["อุตสาหกรรม", "/products/category/scales/industrial"],
        ["งานวิเคราะห์", "/products/category/scales/analytical"],
        ["ครัวและกาแฟ", "/products/category/scales/kitchen"],
        ["กันน้ำ", "/products/category/scales/water-dust"],
        ["ตรวจน้ำหนักอัตโนมัติ", "/products/category/scales/checkweigher"],
        ["ชุดพร้อมใช้", "/products/category/scales/sets"],
      ],
      [
        ["เชื่อม POS", "/solutions/pos"],
        ["พิมพ์ฉลาก", "/solutions/label-printing"],
        ["งานเปียกชื้น", "/solutions/wet-environments"],
      ],
    ),
    menu(
      categoryLabel("indicators", "อินดิเคเตอร์แท่นชั่ง"),
      "/products/category/indicators",
      [
        ["LCD", "/products/category/indicators/lcd"],
        ["LED", "/products/category/indicators/led"],
        ["กันน้ำ", "/products/category/indicators/waterproof"],
      ],
      [
        ["ตรวจน้ำหนักขาด–เกิน", "/solutions/checkweighing"],
        ["ส่งข้อมูล RS232", "/solutions/rs232"],
        ["ส่งข้อมูลไร้สาย", "/solutions/wireless"],
        ["ต่อจอภายนอก", "/solutions/external-display"],
      ],
    ),
    menu(
      categoryLabel("platforms", "โครงสร้างแท่นชั่ง"),
      "/products/category/platforms",
      [
        ["เหล็กคาร์บอน", "/products/category/platforms/carbon-steel"],
        ["สแตนเลส SUS304", "/products/category/platforms/sus304"],
        ["สแตนเลส SUS201", "/products/category/platforms/sus201"],
        ["พลาสติก ABS", "/products/category/platforms/abs"],
      ],
      [
        ["งานโรงงาน", "/product/industrial"],
        ["ตรวจน้ำหนักขาด–เกิน", "/solutions/checkweighing"],
        ["งานเปียกชื้น", "/solutions/wet-environments"],
      ],
    ),
    menu(
      categoryLabel("pos", "ระบบ POS"),
      "/products/category/pos",
      [
        ["Android", "/products/category/pos/android"],
        ["Windows", "/products/category/pos/windows"],
        ["ชุดพร้อมใช้", "/products/category/pos/sets"],
        ["ซอฟต์แวร์", "/applications-and-softwares"],
      ],
      [
        ["เชื่อมเครื่องชั่ง", "/solutions/pos"],
        ["พิมพ์ฉลากและบาร์โค้ด", "/solutions/label-printing"],
        ["พิมพ์ฉลากจาก POS", "/solutions/pos-label-printing"],
      ],
    ),
    menu(
      categoryLabel("accessories", "อุปกรณ์เสริม"),
      "/products/category/accessories",
      [
        ["จอและไฟเตือน", "/products/category/accessories/displays"],
        ["สายและหัวต่อ", "/products/category/accessories/cables"],
        ["เครื่องพิมพ์", "/products/category/accessories/printers"],
        ["สแกนเนอร์และลิ้นชัก", "/products/category/accessories/pos"],
        ["ชิ้นส่วนแท่นและอุปกรณ์เคลื่อนย้าย", "/products/category/accessories/mechanical"],
        ["โหลดเซลล์และอะไหล่อิเล็กทรอนิกส์", "/products/category/accessories/electronics"],
        ["กระดาษและฉลาก", "/products/category/accessories/consumables"],
        ["ลูกตุ้มน้ำหนัก", "/products/category/accessories/weights"],
      ],
      [
        ["ต่อจอภายนอก", "/solutions/external-display"],
        ["ส่งข้อมูล RS232", "/solutions/rs232"],
        ["เชื่อม POS", "/solutions/pos"],
        ["พิมพ์ฉลาก", "/solutions/label-printing"],
      ],
    ),
    menu(
      "จัดสเปค",
      guideHref,
      [
        ["อินดิเคเตอร์", "/products/category/indicators"],
        ["แท่นชั่ง", "/products/category/platforms"],
        ["เปิดหน้าจัดสเปค", guideHref],
      ],
      [
        ["งานโรงงาน", "/product/industrial"],
        ["ตรวจน้ำหนักขาด–เกิน", "/solutions/checkweighing"],
        ["งานเปียกชื้น", "/solutions/wet-environments"],
      ],
      help.filter((link) => link.href !== "/warranty/register"),
      "เลือกอุปกรณ์",
    ),
    menu(
      "บริการ",
      "/service",
      [
        ["หลังการขาย", "/service"],
        ["ลงทะเบียนรับประกัน", "/warranty/register"],
        ["ขอใบเสนอราคา", "/service/quotation"],
      ],
      [
        ["โซลูชันธุรกิจ", "/solutions"],
        ["ซอฟต์แวร์", "/applications-and-softwares"],
        ["ดาวน์โหลด", "/software/download"],
      ],
      links([
        ["คู่มือและสเปก", "/technical-specification"],
        ["เงื่อนไขรับประกัน", "/warranty/policy"],
        ["เกี่ยวกับเรา", "/about-us"],
        ["ติดต่อเรา", "/contact-us"],
      ]),
      "บริการ",
    ),
  ];
}
