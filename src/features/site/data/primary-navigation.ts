import { contactPath } from "@/features/content/data/contact-route";
import type { NavigationItem } from "../types";
import { resolveCategoryHref } from "@/features/catalog/data/category-destinations";
import { platformPlacementPages } from "@/features/catalog/data/product-subcategory-pages";
import { siteMenuLabel } from "./site-menu-labels";

const guideHref = "/guides/indicator-platform-compatibility";
type MenuEntry = [label: string, href: string];

export function getDisabledNavigationDestinations(navigation: NavigationItem[]) {
  return new Set(
    navigation
      .flatMap((item) => [...item.links, ...(item.groups ?? []).flatMap((group) => group.links)])
      .filter((link) => link.disabled)
      .map((link) => resolveCategoryHref(link.href)),
  );
}

export function getPrimaryNavigationItems(
  navigation: NavigationItem[],
  readySubcategoryHrefs: readonly string[] = [],
  surface: "navbar" | "category-chapters" = "navbar",
): NavigationItem[] {
  // Older catalog callers still supply inventory readiness; route availability is independent of it.
  void readySubcategoryHrefs;
  const savedDisabled = getDisabledNavigationDestinations(navigation);
  const links = (
    entries: MenuEntry[],
    order: "length" | "configured" = "length",
  ): NavigationItem["links"] => {
    const ordered =
      order === "configured"
        ? entries
        : entries.toSorted(
            ([first], [second]) =>
              Number(second.endsWith("ทั้งหมด")) - Number(first.endsWith("ทั้งหมด")) ||
              first.length - second.length,
          );
    const byDestination = new Map<string, NavigationItem["links"][number]>();
    for (const [label, source] of ordered) {
      const href = resolveCategoryHref(source);
      if (byDestination.has(href) && surface === "navbar") continue;
      byDestination.set(surface === "navbar" ? href : `${href}:${label}`, {
        label: surface === "navbar" ? siteMenuLabel(href, label) : label,
        href,
        ...(savedDisabled.has(href) ? { disabled: true } : {}),
      });
    }
    return [...byDestination.values()];
  };
  const help = links([
    ["คู่มือและสเปก", "/technical-specification"],
    ["ลงทะเบียนรับประกัน", "/warranty/register"],
    ["เงื่อนไขรับประกัน", "/warranty/policy"],
    ["ติดต่อฝ่ายบริการ", contactPath],
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
    label: surface === "navbar" ? siteMenuLabel(href, label) : label,
    href,
    submenuLabel,
    links: links(children, childOrder),
    groups: [
      surface === "navbar" && href.startsWith("/products/category/")
        ? { label: "คุณสมบัติ", links: [] }
        : {
            label: secondaryLabel,
            links: links(uses, href === "/products" ? "configured" : "length"),
          },
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
        ["เครื่องชั่งคำนวณราคา", "/products/category/scales/price"],
        ["เครื่องชั่งครัวและกาแฟ", "/products/category/scales/kitchen"],
        ["เครื่องชั่งสำหรับโรงงาน", "/products/category/scales/industrial"],
        ["ดาวน์โหลดซอฟต์แวร์ POS", "/software/download#retail-software"],
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
      [
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
              ["ติดต่อฝ่ายบริการ", contactPath],
              ["ลงทะเบียนรับประกัน", "/warranty/register"],
            ],
            "configured",
          )
        : links([
            ["คู่มือและสเปก", "/technical-specification"],
            ["ขอใบเสนอราคา", "/service/quotation"],
            ["ลงทะเบียนรับประกัน", "/warranty/register"],
            ["ติดต่อฝ่ายบริการ", contactPath],
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
      [
        ["เชื่อมต่อ RS232", "/products/category/indicators/rs232"],
        ["ดูโครงสร้างแท่นชั่ง", "/products/category/platforms"],
        ["ดูจอและไฟเตือน", "/products/category/accessories/displays"],
      ],
      surface === "navbar"
        ? links(
            [
              ["ขอใบเสนอราคา", "/service/quotation"],
              ["ติดต่อฝ่ายบริการ", contactPath],
              ["คู่มือเลือกหัวอ่านและแท่นชั่ง", guideHref],
            ],
            "configured",
          )
        : links([
            ["คู่มือเลือกหัวอ่านและแท่นชั่ง", guideHref],
            ["ขอใบเสนอราคา", "/service/quotation"],
            ["เงื่อนไขรับประกัน", "/warranty/policy"],
            ["ติดต่อฝ่ายบริการ", contactPath],
          ]),
      "สินค้า",
      "การใช้งาน",
    ),
    menu(
      categoryLabel("platforms", "โครงสร้างแท่นชั่ง"),
      "/products/category/platforms",
      platformPlacementPages.map(({ label, href }) => [label, href]),
      [
        ["อินดิเคเตอร์แท่นชั่ง", "/products/category/indicators"],
        ["ชิ้นส่วนแท่น", "/products/category/accessories/mechanical"],
        ["โหลดเซลล์และอะไหล่อิเล็กทรอนิกส์", "/products/category/accessories/electronics"],
      ],
      links([
        ["คู่มือเลือกหัวอ่านและแท่นชั่ง", guideHref],
        ["สอบถามรุ่นและสเปก", contactPath],
        ["ขอใบเสนอราคา", "/service/quotation"],
        ["ติดต่อฝ่ายบริการ", contactPath],
      ]),
      "สินค้า",
      "อุปกรณ์ที่ใช้ร่วมกัน",
      "configured",
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
        ["สแกนเนอร์และลิ้นชัก", "/products/category/accessories/scanners-and-cash-drawers"],
      ],
      links([
        ["คู่มือและสเปก", "/technical-specification"],
        ["ขอใบเสนอราคา", "/service/quotation"],
        ["ลงทะเบียนรับประกัน", "/warranty/register"],
        ["ติดต่อฝ่ายบริการ", contactPath],
      ]),
      "สินค้า",
      "อุปกรณ์ที่ใช้ร่วมกัน",
    ),
    menu(
      categoryLabel("accessories", "อุปกรณ์เสริม"),
      "/products/category/accessories",
      [
        ["อุปกรณ์ POS", "/products/category/accessories/pos"],
        ["จอและไฟเตือน", "/products/category/accessories/displays"],
        ["สายและหัวต่อ", "/products/category/accessories/cables"],
        ["เครื่องพิมพ์", "/products/category/accessories/printers"],
        ["ชิ้นส่วนแท่น", "/products/category/accessories/mechanical"],
        ["ลูกตุ้มน้ำหนัก", "/products/category/accessories/weights"],
        ["โหลดเซลล์และอะไหล่อิเล็กทรอนิกส์", "/products/category/accessories/electronics"],
        ["อื่น ๆ", "/products/category/accessories/consumables"],
      ],
      [
        ["กระดาษและฉลาก", "/products/category/accessories/consumables"],
        ["กระดาษความร้อน", "/products/category/accessories/thermal-paper"],
        ["ฉลากและสติ๊กเกอร์", "/products/category/accessories/labels"],
      ],
      links([
        ["สอบถามอุปกรณ์ที่ใช้ร่วมกัน", contactPath],
        ["ขอใบเสนอราคา", "/service/quotation"],
        ["เงื่อนไขรับประกัน", "/warranty/policy"],
        ["ติดต่อฝ่ายบริการ", contactPath],
      ]),
      "สินค้า",
      "วัสดุสิ้นเปลือง",
      "configured",
    ),
    menu(
      "จัดสเปค",
      guideHref,
      [
        ["เลือกอินดิเคเตอร์", "/products/category/indicators"],
        ["เลือกแท่นชั่ง", "/products/category/platforms"],
        ["ดูอุปกรณ์เสริม", "/products/category/accessories"],
      ],
      [["สอบถามความเข้ากันได้", contactPath]],
      links([
        ["ขอใบเสนอราคา", "/service/quotation"],
        ["เงื่อนไขรับประกัน", "/warranty/policy"],
        ...(surface === "navbar" ? [] : [["ติดต่อฝ่ายบริการ", contactPath] satisfies MenuEntry]),
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
        ["ดาวน์โหลดซอฟต์แวร์", "/software/download"],
        ["คู่มือและสเปก", "/technical-specification"],
      ],
      links([
        ["เงื่อนไขรับประกัน", "/warranty/policy"],
        ["นโยบายยกเลิกและคืนสินค้า", "/cancel-and-return/policy"],
        ["เกี่ยวกับ SUNFORD", "/about-us"],
        ["ติดต่อเรา", contactPath],
      ]),
      "บริการ",
      "ซอฟต์แวร์และเอกสาร",
    ),
  ];
}
