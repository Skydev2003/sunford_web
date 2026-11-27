import { contactPath } from "@/features/content/data/contact-route";
import { editorialArticlesPath } from "@/features/content/data/editorial-sections";
import type { NavigationItem } from "../types";
import { resolveCategoryHref } from "@/features/catalog/data/category-destinations";
import { platformPlacementPages } from "@/features/catalog/data/product-subcategory-pages";
import { sunford } from "@/features/home/data/brand";
import { siteMenuLabel } from "./site-menu-labels";

const guideHref = "/guides/indicator-platform-compatibility";
const componentShopHref =
  "https://sunfordshop.com/%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2/?sort=6";
type MenuEntry = [label: string, href: string];

const headerMenu: MenuEntry[] = [
  ["ร้าน", "/products"],
  ["เครื่องชั่ง", "/products/category/scales"],
  ["แท่นชั่ง", "/products/category/platforms"],
  ["อินดิเคเตอร์", "/products/category/indicators"],
  ["จัดสเปค", guideHref],
  ["ซอฟต์แวร์", sunford.downloads],
  ["อุปกรณ์เสริม", "/products/category/accessories"],
  ["POS", "/products/category/pos"],
  ["MES", sunford.mes],
  ["โซลูชัน", "/solutions"],
  ["บริการช่วยเหลือ", "/service"],
];

type HeaderGroup = { label: string; links: MenuEntry[] };

const contactGroup: HeaderGroup = { label: "ช่วยเหลือ", links: [["ติดต่อเรา", contactPath]] };

const headerSubmenus: Partial<Record<string, [HeaderGroup, ...HeaderGroup[]]>> = {
  [sunford.downloads]: [
    {
      label: "ซอฟต์แวร์",
      links: [
        ["การพาณิชย์และค้าปลีก", `${sunford.downloads}#retail-software`],
        ["การผลิตอุตสาหกรรม", `${sunford.downloads}#industrial-software`],
        ["ครัวเรือนและสุขภาพ", `${sunford.downloads}#household-software`],
      ],
    },
    contactGroup,
  ],
  [sunford.mes]: [
    {
      label: "สินค้า",
      links: [
        ["ควบคุมชุดการผลิต", `${sunford.mes}/batch-control`],
        ["ควบคุมสูตรการผลิต", `${sunford.mes}/formula-control`],
      ],
    },
    contactGroup,
  ],
  "/solutions": [
    {
      label: "สำหรับนักพัฒนา",
      links: [
        ["ส่งข้อมูลน้ำหนักเข้าคอมพิวเตอร์ (แบบใช้สาย)", "/solutions/rs232"],
        ["ส่งข้อมูลน้ำหนักเข้าคอมพิวเตอร์ (แบบไร้สาย)", "/solutions/wireless"],
        ["บันทึกข้อมูลน้ำหนักลง USB Drive", "/solutions/usb-drive"],
        ["ตั้งค่าพารามิเตอร์และรูปแบบการรับส่งข้อมูล", ""],
        ["ปรับรูปแบบข้อมูลส่งออกด้วยไดรเวอร์", "/solutions/driver"],
        ["เชื่อมต่อเครื่องชั่งกับอุปกรณ์ PLC", "/solutions/plc"],
      ],
    },
    {
      label: "สำหรับผู้ใช้งานพาณิชยกรรม",
      links: [
        ["งานชั่งพื้นที่เปียก ฉีดล้าง และมีฝุ่นละออง", "/solutions/wet-environments"],
        ["แจ้งเตือนน้ำหนักขาด-เกินตามช่วงที่กำหนด", "/solutions/checkweighing"],
        ["เชื่อมต่อจอแสดงผลภายนอก", "/solutions/external-display"],
        ["พิมพ์สติ๊กเกอร์น้ำหนัก วันที่ บาร์โค้ด และ QR Code", "/solutions/label-printing"],
        ["บันทึกรายงานการชั่งบน Windows", "/solutions/windows"],
        ["บันทึกรายงานการชั่งบน Android (ขั้นต้น)", "/solutions/android"],
        ["บันทึกรายงานการชั่งบน Android (ขั้นสูง)", ""],
        ["ชั่งน้ำหนักพร้อมสร้าง Lot No. และ Serial No.", "/solutions/lot-serial"],
      ],
    },
    {
      label: "สำหรับผู้ใช้งานอุตสาหกรรม",
      links: [
        ["เชื่อมต่อเครื่องชั่งกับระบบขายหน้าร้าน (POS)", "/solutions/pos"],
        [
          "พิมพ์สติ๊กเกอร์น้ำหนัก วันที่ บาร์โค้ด และ QR Code (POS)",
          "/solutions/pos-label-printing",
        ],
      ],
    },
  ],
};

export function getHeaderNavigationItems(navigation: NavigationItem[]): NavigationItem[] {
  const itemsByHref = new Map(
    [...navigation, ...getPrimaryNavigationItems(navigation)].map((item) => [item.href, item]),
  );
  const disabled = getDisabledNavigationDestinations(navigation);
  const link = ([label, href]: MenuEntry) => ({
    label,
    href,
    ...(!href || disabled.has(href) ? { disabled: true } : {}),
  });
  return headerMenu.map(([label, href]) => {
    const submenu = headerSubmenus[href];
    if (submenu) {
      const [primary, ...groups] = submenu;
      return {
        label,
        href,
        submenuLabel: primary.label,
        links: primary.links.map(link),
        groups: groups.map((group) => ({ label: group.label, links: group.links.map(link) })),
      };
    }
    const menu = itemsByHref.get(href);
    return { ...menu, label, href, links: menu?.links ?? [] };
  });
}

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
    useSiteLabels = surface === "navbar",
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
        label: useSiteLabels ? siteMenuLabel(href, label) : label,
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
    surface === "navbar"
      ? {
          label: siteMenuLabel("/products", "ผลิตภัณฑ์ทั้งหมด"),
          href: "/products",
          submenuLabel: "สินค้า",
          links: links(
            [
              ["เครื่องชั่ง", "/products/category/scales"],
              ["โครงสร้างแท่นชั่ง", "/products/category/platforms"],
              ["อินดิเคเตอร์", "/products/category/indicators"],
              ["ระบบ POS", "/products/category/pos"],
              ["ระบบ MES", sunford.mes],
              ["อุปกรณ์เสริม", "/products/category/accessories"],
            ],
            "configured",
            false,
          ),
          groups: [
            {
              label: "ลิงก์ด่วน",
              links: links(
                [
                  ["เลือกซื้อสินค้า", "https://sunfordshop.com/"],
                  ["ลงทะเบียนรับประกัน", "/warranty/register"],
                  ["ใบเสนอราคา", "/service/quotation"],
                ],
                "configured",
                false,
              ),
            },
          ],
        }
      : menu(
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
      surface === "navbar"
        ? [
            ["ห้องปฏิบัติการ", "/products/category/scales/analytical"],
            ["อุตสาหกรรม", "/products/category/scales/industrial"],
            ["พาณิชยกรรมและบริการ", "/products/category/scales/price"],
            ["ไลฟ์สไตล์", "/products/category/scales/kitchen"],
          ]
        : [
            ["ครัวเรือนและบุคคล", "/products/category/scales/kitchen"],
            ["อุตสาหกรรม", "/products/category/scales/industrial"],
            ["ร้านค้าและบริการ", "/products/category/scales/price"],
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
              ["เลือกซื้อเครื่องชั่ง", "https://sunfordshop.com/"],
              ["เงื่อนไขรับประกัน", "/warranty/policy"],
              ["ติดต่อเรา", contactPath],
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
    surface === "navbar"
      ? {
          label: siteMenuLabel("/products/category/indicators", "อินดิเคเตอร์แท่นชั่ง"),
          href: "/products/category/indicators",
          submenuLabel: "สินค้า",
          links: links(
            [
              ["อุตสาหกรรม", "/products/category/indicators/industrial"],
              ["พาณิชยกรรมและบริการ", "/products/category/indicators/commercial"],
            ],
            "configured",
          ),
          groups: [
            {
              label: "คุณสมบัติ",
              links: [
                ...links(
                  [
                    ["เชื่อมต่ออุปกรณ์", "/products/category/indicators/rs232"],
                    ["กันน้ำกันฝุ่น", "/products/category/indicators/waterproof"],
                  ],
                  "configured",
                ),
                { label: "คำนวณราคา", href: "", disabled: true },
                { label: "นับจำนวน", href: "", disabled: true },
                { label: "เตือนน้ำหนักขาดเกิน", href: "", disabled: true },
              ],
            },
            {
              label: "ช่วยเหลือ",
              links: links(
                [
                  ["เลือกซื้ออินดิเคเตอร์", componentShopHref],
                  ["ติดต่อเรา", contactPath],
                ],
                "configured",
              ),
            },
          ],
        }
      : menu(
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
          links([
            ["คู่มือเลือกหัวอ่านและแท่นชั่ง", guideHref],
            ["ขอใบเสนอราคา", "/service/quotation"],
            ["เงื่อนไขรับประกัน", "/warranty/policy"],
            ["ติดต่อฝ่ายบริการ", contactPath],
          ]),
          "สินค้า",
          "การใช้งาน",
        ),
    surface === "navbar"
      ? {
          label: siteMenuLabel("/products/category/platforms", "โครงสร้างแท่นชั่ง"),
          href: "/products/category/platforms",
          submenuLabel: "สินค้า",
          links: links(
            [
              ["แท่นชั่งตั้งโต๊ะ", "/products/category/platforms/benchtop"],
              ["แท่นชั่งตั้งพื้น", "/products/category/platforms/floor"],
            ],
            "configured",
          ),
          groups: [
            {
              label: "คุณสมบัติ",
              links: links(
                [
                  ["สแตนเลส 304", "/products/category/platforms/sus304"],
                  ["สแตนเลส 201", "/products/category/platforms/sus201"],
                  ["เหล็กคาร์บอน", "/products/category/platforms/carbon-steel"],
                ],
                "configured",
              ),
            },
            {
              label: "ช่วยเหลือ",
              links: links(
                [
                  ["เลือกซื้อแท่นชั่ง", componentShopHref],
                  ["ติดต่อเรา", contactPath],
                ],
                "configured",
              ),
            },
          ],
        }
      : menu(
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
    surface === "navbar"
      ? {
          label: siteMenuLabel("/products/category/pos", "ระบบ POS"),
          href: "/products/category/pos",
          submenuLabel: "สินค้า",
          links: links(
            [
              ["Android", "/products/category/pos/android"],
              ["Windows", "/products/category/pos/windows"],
            ],
            "configured",
          ),
          groups: [
            {
              label: "ช่วยเหลือ",
              links: links(
                [
                  [
                    "เลือกซื้อเครื่อง POS",
                    "https://sunfordshop.com/%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2/18/SUNFORD%20POS%20&%20Gadget",
                  ],
                  ["ติดต่อเรา", contactPath],
                ],
                "configured",
              ),
            },
          ],
        }
      : menu(
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
    surface === "navbar"
      ? {
          label: siteMenuLabel("/products/category/accessories", "อุปกรณ์เสริม"),
          href: "/products/category/accessories",
          submenuLabel: "สินค้า",
          links: links(
            [
              ["อุปกรณ์ส่งข้อมูล", "/products/category/accessories/cables"],
              ["อุปกรณ์ต่อพ่วง", "/products/category/accessories/displays"],
              ["เครื่องพิมพ์", "/products/category/accessories/printers"],
              ["ชิ้นส่วนเสริม", "/products/category/accessories/mechanical"],
              ["วัสดุสิ้นเปลือง", "/products/category/accessories/consumables"],
            ],
            "configured",
            false,
          ),
          groups: [
            {
              label: "ช่วยเหลือ",
              links: links(
                [
                  ["เลือกซื้ออุปกรณ์เสริม", componentShopHref],
                  ["ติดต่อเรา", contactPath],
                ],
                "configured",
              ),
            },
          ],
        }
      : menu(
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
    surface === "navbar"
      ? {
          label: siteMenuLabel("/service", "บริการ"),
          href: "/service",
          submenuLabel: "บริการ",
          links: links(
            [
              ["ขอใบเสนอราคา", "/service/quotation"],
              ["ลงทะเบียนรับประกัน", "/warranty/register"],
              ["บริการหลังการขาย", "/service"],
            ],
            "configured",
            false,
          ),
          groups: [
            {
              label: "เอกสาร",
              links: links(
                [
                  ["บทความ", editorialArticlesPath],
                  ["เกี่ยวกับผลิตภัณฑ์", "/support/technical-assistance"],
                ],
                "configured",
              ),
            },
            { label: "ช่วยเหลือ", links: links([["ติดต่อเรา", contactPath]]) },
          ],
        }
      : menu(
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
