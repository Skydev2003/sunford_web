import type { NavigationItem } from "../types";
import { resolveCategoryHref } from "@/features/catalog/data/category-destinations";

// Phase A keeps destinations awaiting pages, classification or verified data disabled.
const unavailableDestinations = new Set([
  "/technical-specification",
  "/products/category/scales/checkweigher",
  "/products/category/scales/sets",
  "/products/category/scales/analytical",
  "/products/category/scales/counting",
  "/products/category/scales/checkweighing",
  "/products/category/indicators/waterproof",
  "/products/category/indicators/rs232",
  "/products/category/platforms/tcs-tss",
  "/products/category/platforms/fcs-fss",
  "/products/category/platforms/bcs-bss",
  "/products/category/platforms/dcs-dss",
  "/products/category/platforms/other-series",
  "/products/category/platforms/carbon-steel",
  "/products/category/platforms/sus304",
  "/products/category/platforms/sus201",
  "/products/category/platforms/abs",
  "/products/category/accessories/electronics",
  "/products/category/pos/terminals",
  "/products/category/pos/workstations",
  "/products/category/pos/sets",
  "/products/category/pos/ios",
  "/products/category/accessories/printers",
  "/products/category/accessories/pos",
  "/products/category/accessories/weights",
  "/products/category/accessories/thermal-paper",
  "/products/category/accessories/labels",
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
    entries
      .toSorted(
        ([first], [second]) =>
          Number(second.endsWith("ทั้งหมด")) - Number(first.endsWith("ทั้งหมด")) ||
          first.length - second.length,
      )
      .map(([label, source]) => {
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
    secondaryLabel = "การใช้งาน",
  ): NavigationItem => ({
    label,
    href,
    submenuLabel,
    links: links(children),
    groups: [
      { label: secondaryLabel, links: links(uses) },
      { label: "ช่วยเหลือ", links: assistance },
    ],
  });

  return [
    menu(
      "ผลิตภัณฑ์ทั้งหมด",
      "/products",
      [
        ["เครื่องชั่ง", "/products/category/scales"],
        ["อินดิเคเตอร์แท่นชั่ง", "/products/category/indicators"],
        ["โครงสร้างแท่นชั่ง", "/products/category/platforms"],
        ["ระบบ POS", "/products/category/pos"],
        ["อุปกรณ์เสริม", "/products/category/accessories"],
      ],
      [
        ["คำนวณราคาและงานขาย", "/products/category/scales/price"],
        ["งานผลิตและอุตสาหกรรม", "/products/category/scales/industrial"],
        ["ครัวและกาแฟ", "/products/category/scales/kitchen"],
        ["ซอฟต์แวร์ POS", "/applications-and-softwares"],
      ],
      help,
      "สินค้า",
      "การใช้งาน",
    ),
    menu(
      categoryLabel("scales", "เครื่องชั่ง"),
      "/products/category/scales",
      [
        ["คำนวณราคา", "/products/category/scales/price"],
        ["อุตสาหกรรม", "/products/category/scales/industrial"],
        ["งานวิเคราะห์", "/products/category/scales/analytical"],
        ["ครัวและกาแฟ", "/products/category/scales/kitchen"],
        ["กันน้ำ–กันฝุ่น", "/products/category/scales/water-dust"],
        ["ตั้งโต๊ะ", "/products/category/scales/benchtop"],
        ["ตั้งพื้น", "/products/category/scales/floor"],
        ["มีเสา", "/products/category/scales/pole"],
      ],
      [
        ["กันน้ำ", "/products/category/scales/water-dust"],
        ["นับจำนวนชิ้น", "/products/category/scales/counting"],
        ["เตือนน้ำหนักขาด–เกิน", "/products/category/scales/checkweighing"],
        ["ตั้งโต๊ะ", "/products/category/scales/benchtop"],
        ["ตั้งพื้น", "/products/category/scales/floor"],
      ],
      links([
        ["คู่มือและสเปก", "/technical-specification"],
        ["ขอใบเสนอราคา", "/service/quotation"],
        ["ลงทะเบียนรับประกัน", "/warranty/register"],
        ["ติดต่อฝ่ายบริการ", "/contact-us"],
      ]),
      "สินค้า",
      "คุณสมบัติ",
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
        ["เชื่อมต่อ RS232", "/products/category/indicators/rs232"],
        ["ดูโครงสร้างแท่นชั่ง", "/products/category/platforms"],
        ["ดูจอและไฟเตือน", "/products/category/accessories/displays"],
      ],
      links([
        ["คู่มือเลือกหัวอ่านและแท่นชั่ง", guideHref],
        ["ขอใบเสนอราคา", "/service/quotation"],
        ["เงื่อนไขรับประกัน", "/warranty/policy"],
        ["ติดต่อฝ่ายบริการ", "/contact-us"],
      ]),
      "สินค้า",
      "การใช้งาน",
    ),
    menu(
      categoryLabel("platforms", "โครงสร้างแท่นชั่ง"),
      "/products/category/platforms",
      [
        ["เหล็กคาร์บอนพ่นอบสีกันสนิม", "/products/category/platforms/carbon-steel"],
        ["สแตนเลส SUS304", "/products/category/platforms/sus304"],
        ["สแตนเลส SUS201", "/products/category/platforms/sus201"],
        ["พลาสติก ABS เหนียวพิเศษ", "/products/category/platforms/abs"],
      ],
      [
        ["อินดิเคเตอร์แท่นชั่ง", "/products/category/indicators"],
        ["ชิ้นส่วนแท่น", "/products/category/accessories/mechanical"],
        ["โหลดเซลล์และอะไหล่อิเล็กทรอนิกส์", "/products/category/accessories/electronics"],
      ],
      links([
        ["คู่มือเลือกหัวอ่านและแท่นชั่ง", guideHref],
        ["สอบถามรุ่นและสเปก", "/contact-us"],
        ["ขอใบเสนอราคา", "/service/quotation"],
        ["ติดต่อฝ่ายบริการ", "/contact-us"],
      ]),
      "สินค้า",
      "เลือกอุปกรณ์ร่วม",
    ),
    menu(
      categoryLabel("pos", "ระบบ POS"),
      "/products/category/pos",
      [
        ["iOS", "/products/category/pos/ios"],
        ["Android", "/products/category/pos/android"],
        ["Windows", "/products/category/pos/windows"],
      ],
      [
        ["เครื่องพิมพ์", "/products/category/accessories/printers"],
        ["สแกนเนอร์และลิ้นชัก", "/products/category/accessories/pos"],
      ],
      links([
        ["คู่มือและสเปก", "/technical-specification"],
        ["ขอใบเสนอราคา", "/service/quotation"],
        ["ลงทะเบียนรับประกัน", "/warranty/register"],
        ["ติดต่อฝ่ายบริการ", "/contact-us"],
      ]),
      "สินค้า",
      "ระบบและอุปกรณ์",
    ),
    menu(
      categoryLabel("accessories", "อุปกรณ์เสริม"),
      "/products/category/accessories",
      [
        ["จอและไฟเตือน", "/products/category/accessories/displays"],
        ["สายและหัวต่อ", "/products/category/accessories/cables"],
        ["เครื่องพิมพ์", "/products/category/accessories/printers"],
        ["อุปกรณ์ POS", "/products/category/accessories/pos"],
        ["ชิ้นส่วนแท่น", "/products/category/accessories/mechanical"],
        ["โหลดเซลล์และอะไหล่อิเล็กทรอนิกส์", "/products/category/accessories/electronics"],
        ["ลูกตุ้มน้ำหนัก", "/products/category/accessories/weights"],
      ],
      [
        ["กระดาษและฉลาก", "/products/category/accessories/consumables"],
        ["กระดาษความร้อน", "/products/category/accessories/thermal-paper"],
        ["ฉลากและสติ๊กเกอร์", "/products/category/accessories/labels"],
      ],
      links([
        ["สอบถามอุปกรณ์ที่ใช้ร่วมกัน", "/contact-us"],
        ["ขอใบเสนอราคา", "/service/quotation"],
        ["เงื่อนไขรับประกัน", "/warranty/policy"],
        ["ติดต่อฝ่ายบริการ", "/contact-us"],
      ]),
      "สินค้า",
      "วัสดุสิ้นเปลือง",
    ),
    menu(
      "จัดสเปค",
      guideHref,
      [
        ["เลือกอินดิเคเตอร์", "/products/category/indicators"],
        ["เลือกแท่นชั่ง", "/products/category/platforms"],
        ["ดูอุปกรณ์เสริม", "/products/category/accessories"],
      ],
      [["สอบถามความเข้ากันได้", "/contact-us"]],
      links([
        ["ขอใบเสนอราคา", "/service/quotation"],
        ["เงื่อนไขรับประกัน", "/warranty/policy"],
        ["ติดต่อฝ่ายบริการ", "/contact-us"],
      ]),
      "เลือกอุปกรณ์",
      "ตรวจสอบก่อนเลือก",
    ),
    menu(
      "บริการ",
      "/service",
      [
        ["ลงทะเบียนรับประกัน", "/warranty/register"],
        ["ขอใบเสนอราคา", "/service/quotation"],
      ],
      [
        ["ซอฟต์แวร์และสิทธิ์ใช้งาน", "/applications-and-softwares"],
        ["ดาวน์โหลดซอฟต์แวร์", "/software/download"],
        ["คู่มือและสเปก", "/technical-specification"],
      ],
      links([
        ["เงื่อนไขรับประกัน", "/warranty/policy"],
        ["นโยบายยกเลิกและคืนสินค้า", "/cancel-and-return/policy"],
        ["เกี่ยวกับ SUNFORD", "/about-us"],
        ["ติดต่อเรา", "/contact-us"],
      ]),
      "บริการ",
      "ซอฟต์แวร์และเอกสาร",
    ),
  ];
}
