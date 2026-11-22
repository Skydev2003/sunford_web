import type { NavigationItem } from "../types";
import { resolveCategoryHref } from "@/features/catalog/data/category-destinations";
import { warehouseGatedSubcategoryHrefs } from "@/features/catalog/data/product-subcategory-pages";

// Phase A keeps destinations awaiting pages, classification or verified data disabled.
const unavailableDestinations = new Set([
  "/products/category/scales/checkweigher",
  "/products/category/scales/sets",
  "/products/category/platforms/tcs-tss",
  "/products/category/platforms/fcs-fss",
  "/products/category/platforms/bcs-bss",
  "/products/category/platforms/dcs-dss",
  "/products/category/platforms/other-series",
  "/products/category/pos/terminals",
  "/products/category/pos/workstations",
  "/products/category/pos/sets",
]);

const guideHref = "/guides/indicator-platform-compatibility";
type MenuEntry = [label: string, href: string, disabled?: boolean];

export function getPrimaryNavigationItems(
  navigation: NavigationItem[],
  readySubcategoryHrefs: readonly string[] = [],
  surface: "navbar" | "category-chapters" = "navbar",
): NavigationItem[] {
  const savedLinks = navigation.flatMap((item) => [
    ...item.links,
    ...(item.groups ?? []).flatMap((group) => group.links),
  ]);
  const savedDisabled = new Set(
    savedLinks.filter((link) => link.disabled).map((link) => resolveCategoryHref(link.href)),
  );
  const readySubcategories = new Set(readySubcategoryHrefs);
  const links = (
    entries: MenuEntry[],
    order: "length" | "configured" = "length",
  ): NavigationItem["links"] =>
    (order === "configured"
      ? entries
      : entries.toSorted(
          ([first], [second]) =>
            Number(second.endsWith("ทั้งหมด")) - Number(first.endsWith("ทั้งหมด")) ||
            first.length - second.length,
        )
    ).map(([label, source, disabledInMenu]) => {
      const href = resolveCategoryHref(source);
      const disabled =
        disabledInMenu ||
        unavailableDestinations.has(href) ||
        savedDisabled.has(href) ||
        (warehouseGatedSubcategoryHrefs.has(href) && !readySubcategories.has(href));
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
    children: MenuEntry[],
    uses: MenuEntry[],
    assistance = help,
    submenuLabel = "สินค้า",
    secondaryLabel = "การใช้งาน",
    childOrder: "length" | "configured" = "length",
  ): NavigationItem => ({
    label,
    href,
    submenuLabel,
    links: links(children, childOrder),
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
        ["ครัวเรือน", "/products/category/scales/kitchen"],
        ["การผลิต", "/products/category/scales/industrial"],
        ["คำนวณราคา", "/products/category/scales/price"],
        ["งานวิเคราะห์", "/products/category/scales/analytical"],
      ],
      surface === "navbar"
        ? [
            ["นับจำนวนชิ้น", "/products/category/scales/counting"],
            ["เตือนน้ำหนักขาด–เกิน", "/products/category/scales/checkweighing"],
          ]
        : [
            ["กันน้ำ", "/products/category/scales/water-dust"],
            ["นับจำนวนชิ้น", "/products/category/scales/counting"],
            ["เตือนน้ำหนักขาด–เกิน", "/products/category/scales/checkweighing"],
            ["ตั้งโต๊ะ", "/products/category/scales/benchtop"],
            ["ตั้งพื้น", "/products/category/scales/floor"],
          ],
      surface === "navbar"
        ? links(
            [
              ["ขอใบเสนอราคา", "/service/quotation"],
              ["ติดต่อฝ่ายบริการ", "/contact-us"],
              ["ลงทะเบียนรับประกัน", "/warranty/register"],
            ],
            "configured",
          )
        : links([
            ["คู่มือและสเปก", "/technical-specification"],
            ["ขอใบเสนอราคา", "/service/quotation"],
            ["ลงทะเบียนรับประกัน", "/warranty/register"],
            ["ติดต่อฝ่ายบริการ", "/contact-us"],
          ]),
      "สินค้า",
      "คุณสมบัติ",
      "configured",
    ),
    menu(
      categoryLabel("indicators", "อินดิเคเตอร์แท่นชั่ง"),
      "/products/category/indicators",
      [
        ["LCD", "/products/category/indicators/lcd"],
        ["LED", "/products/category/indicators/led"],
      ],
      surface === "navbar"
        ? [
            ["เชื่อมต่อ RS232", "/products/category/indicators/rs232"],
            ["ตัวเครื่องกันน้ำ IP67", "/products/category/indicators/waterproof"],
          ]
        : [
            ["เชื่อมต่อ RS232", "/products/category/indicators/rs232"],
            ["ดูโครงสร้างแท่นชั่ง", "/products/category/platforms"],
            ["ดูจอและไฟเตือน", "/products/category/accessories/displays"],
          ],
      surface === "navbar"
        ? links(
            [
              ["ขอใบเสนอราคา", "/service/quotation"],
              ["ติดต่อฝ่ายบริการ", "/contact-us"],
              ["คู่มือเลือกหัวอ่านและแท่นชั่ง", guideHref],
            ],
            "configured",
          )
        : links([
            ["คู่มือเลือกหัวอ่านและแท่นชั่ง", guideHref],
            ["ขอใบเสนอราคา", "/service/quotation"],
            ["เงื่อนไขรับประกัน", "/warranty/policy"],
            ["ติดต่อฝ่ายบริการ", "/contact-us"],
          ]),
      "สินค้า",
      surface === "navbar" ? "คุณสมบัติ" : "การใช้งาน",
    ),
    menu(
      categoryLabel("platforms", "โครงสร้างแท่นชั่ง"),
      "/products/category/platforms",
      [
        ["แท่นเหล็กคาร์บอน", "/products/category/platforms/carbon-steel"],
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
        surface === "navbar"
          ? ["สแกนเนอร์และลิ้นชัก", "/products/category/accessories/scanners-and-cash-drawers"]
          : ["สแกนเนอร์และลิ้นชัก", "/products/category/accessories/pos", true],
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
