import { contactPath } from "@/features/content/data/contact-route";
import { mesPaths } from "@/features/content/data/mes-paths";
import { isProductCategoryPath } from "@/features/catalog/data/category-paths";
import { productListingFeatureHref } from "@/features/catalog/data/catalog-submenu-destinations";
import {
  indicatorOverviewFeatures,
  platformIndicatorsPath,
  platformStructuresPath,
  platformStructureTypes,
  scaleOverviewFeatures,
} from "@/features/catalog/data/catalog-overview-features";
import { scaleSpecBuilderPath } from "@/features/catalog/data/scale-spec-builder-path";
import { platformSpecBuilderPath } from "@/features/catalog/data/platform-spec-builder-path";
import { editorialArticlesPath } from "@/features/content/data/editorial-sections";
import type { NavigationItem } from "../types";
import { resolveCategoryHref } from "@/features/catalog/data/category-destinations";
import { platformPlacementPages } from "@/features/catalog/data/product-subcategory-pages";
import { posPlatformLabels } from "@/features/catalog/data/pos-subcategories";
import { sunford } from "@/features/home/data/brand";
import { catalogPageTitles, siteMenuLabel } from "./site-menu-labels";

const guideHref = platformSpecBuilderPath;
const componentShopHref =
  "https://sunfordshop.com/%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2/?sort=6";
type MenuEntry = [label: string, href: string, subtitle?: string];

const headerMenu: MenuEntry[] = [
  [catalogPageTitles["/products"], "/products"],
  [catalogPageTitles["/scales"], "/scales"],
  [catalogPageTitles["/platforms"], "/platforms"],
  ["ซอฟต์แวร์", sunford.downloads],
  ["อุปกรณ์เสริม", "/accessories"],
  ["POS", "/pos"],
  ["MES", sunford.mes],
  ["โซลูชัน", "/solutions"],
  ["บริการช่วยเหลือ", "/service"],
];

type HeaderGroup = { label: string; links: MenuEntry[] };

const contactGroup: HeaderGroup = { label: "ช่วยเหลือ", links: [["ติดต่อเรา", contactPath]] };
const onlineShop: MenuEntry = ["เลือกซื้อที่ร้านออนไลน์", "https://sunfordshop.com/"];
const quotation: MenuEntry = ["ขอใบเสนอราคา", "/service/quotation"];
const businessHelp: HeaderGroup = {
  label: "ช่วยเหลือ",
  links: [
    ["ให้คำปรึกษาแนะนำ", contactPath],
    ["ทดลองใช้งานจริง", contactPath],
    onlineShop,
    quotation,
    ...contactGroup.links,
  ],
};

function configuredMenu(
  href: string,
  label: string,
  [primary, ...groups]: [HeaderGroup, ...HeaderGroup[]],
  disabled: ReadonlySet<string>,
): NavigationItem {
  const link = ([label, href, subtitle]: MenuEntry) => ({
    label,
    href,
    ...(subtitle ? { subtitle } : {}),
    ...(!href || disabled.has(href) ? { disabled: true } : {}),
  });
  return {
    href,
    label,
    submenuLabel: primary.label,
    links: primary.links.map(link),
    groups: groups.map((group) => ({ label: group.label, links: group.links.map(link) })),
  };
}

const headerSubmenus: Partial<Record<string, [HeaderGroup, ...HeaderGroup[]]>> = {
  [sunford.downloads]: [
    {
      label: "ซอฟต์แวร์",
      links: [
        ["การพาณิชย์และค้าปลีก", `${sunford.downloads}/retail`],
        ["การผลิตอุตสาหกรรม", `${sunford.downloads}/industrial`],
        ["ครัวเรือนและสุขภาพ", `${sunford.downloads}/household`],
      ],
    },
    contactGroup,
  ],
  [sunford.mes]: [
    {
      label: "สินค้า",
      links: [
        ["Batch MES", mesPaths.batchControl, "ควบคุมชุดการผลิต"],
        ["Batch formula MES", mesPaths.formulaControl, "ควบคุมสูตรการผลิต"],
      ],
    },
    businessHelp,
  ],
  "/solutions": [
    {
      label: "สำหรับนักพัฒนา",
      links: [
        ["ส่งข้อมูลน้ำหนักเข้าคอมพิวเตอร์ (แบบใช้สาย)", "/solutions/rs232"],
        ["ส่งข้อมูลน้ำหนักเข้าคอมพิวเตอร์ (แบบไร้สาย)", "/solutions/wireless"],
        ["บันทึกข้อมูลน้ำหนักลง USB Drive", "/solutions/usb-drive"],
        ["ตั้งค่าพารามิเตอร์และรูปแบบการรับส่งข้อมูล", "/solutions/data-format"],
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
        ["บันทึกรายงานการชั่งบน Android (ขั้นสูง)", "/solutions/android-advanced"],
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
  return headerMenu.map(([label, href]) => {
    const submenu = headerSubmenus[href];
    if (submenu) return configuredMenu(href, label, submenu, disabled);
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
    ["คู่มือและสเปก", "/service/technical-specification"],
    ["ลงทะเบียนรับประกัน", "/service/warranty/register"],
    ["เงื่อนไขรับประกัน", "/service/warranty/policy"],
    ["ติดต่อฝ่ายบริการ", contactPath],
  ]);
  const overviewFeatureLinks = (
    category: string,
    features: readonly (readonly [string, string])[],
  ) =>
    links(
      features.map(([id, label]) => [label, productListingFeatureHref(category, id)]),
      "configured",
    );
  const indicatorFeatures = links(
    indicatorOverviewFeatures.map(([id, label]) => [
      label,
      `${platformIndicatorsPath}?feature=${id}`,
    ]),
    "configured",
  );
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
      surface === "navbar" && isProductCategoryPath(href)
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
              [catalogPageTitles["/scales"], "/scales"],
              [catalogPageTitles["/platforms"], "/platforms"],
              [catalogPageTitles["/indicators"], platformIndicatorsPath],
              ["ระบบ POS", "/pos"],
              ["ระบบ MES", sunford.mes],
              ["อุปกรณ์เสริม", "/accessories"],
            ],
            "configured",
            false,
          ),
          groups: [
            {
              label: "ลิงก์ด่วน",
              links: links(
                [
                  ["เครื่องชั่งร้านค้าทั่วไป", "/scales/retail"],
                  ["เครื่องชั่งอุตสาหกรรม", "/scales/industrial"],
                  ["เครื่องชั่งประกอบเอง", guideHref],
                  ["เครื่องชั่งขนาดเล็ก", "/scales/household"],
                ],
                "configured",
                false,
              ),
            },
            {
              label: "ช่วยเหลือ",
              links: links(
                [
                  ["ขอใบเสนอราคา", "/service/quotation"],
                  ["เลือกซื้อที่ร้านออนไลน์", "https://sunfordshop.com/"],
                  ["เงื่อนไขรับประกัน", "/service/warranty/policy"],
                  ["ติดต่อเรา", contactPath],
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
            ["เครื่องชั่ง", "/scales"],
            ["อินดิเคเตอร์แท่นชั่ง", "/indicators"],
            ["โครงสร้างแท่นชั่ง", "/platforms"],
            ["ระบบ POS", "/pos"],
            ["อุปกรณ์เสริม", "/accessories"],
          ],
          [
            ["เครื่องชั่งคำนวณราคา", "/scales/retail"],
            ["เครื่องชั่งครัวและกาแฟ", "/scales/household"],
            ["เครื่องชั่งสำหรับโรงงาน", "/scales/industrial"],
            ["ดาวน์โหลดซอฟต์แวร์ POS", "/software/retail"],
          ],
          help,
          "สินค้า",
          "การใช้งาน",
        ),
    surface === "navbar"
      ? {
          label: siteMenuLabel("/scales", "เครื่องชั่ง"),
          href: "/scales",
          submenuLabel: "สินค้า",
          links: links(
            [
              [catalogPageTitles["/scales/laboratory"], "/scales/laboratory"],
              [catalogPageTitles["/scales/industrial"], "/scales/industrial"],
              [catalogPageTitles["/scales/retail"], "/scales/retail"],
              [catalogPageTitles["/scales/household"], "/scales/household"],
              [catalogPageTitles[scaleSpecBuilderPath], scaleSpecBuilderPath],
            ],
            "configured",
            false,
          ),
          groups: [
            {
              label: "คุณสมบัติ",
              links: overviewFeatureLinks("scales", scaleOverviewFeatures),
            },
            {
              label: "ช่วยเหลือ",
              links: links(
                [
                  ["ขอใบเสนอราคา", scaleSpecBuilderPath],
                  ["เลือกซื้อที่ร้านออนไลน์", "https://sunfordshop.com/"],
                  ["เงื่อนไขรับประกัน", "/service/warranty/policy"],
                  ["ติดต่อเรา", contactPath],
                ],
                "configured",
                false,
              ),
            },
          ],
        }
      : menu(
          categoryLabel("scales", "เครื่องชั่ง"),
          "/scales",
          [
            ["ครัวเรือนและบุคคล", "/scales/household"],
            ["อุตสาหกรรม", "/scales/industrial"],
            ["ร้านค้าและบริการ", "/scales/retail"],
            ["งานวิเคราะห์", "/scales/laboratory"],
          ],
          [
            ["กันน้ำ", "/scales/water-dust"],
            ["นับจำนวนชิ้น", "/scales/counting"],
            ["เตือนน้ำหนักขาด–เกิน", "/scales/checkweighing"],
            ["ตั้งโต๊ะ", "/scales/benchtop"],
            ["ตั้งพื้น", "/scales/floor"],
          ],
          links([
            ["คู่มือและสเปก", "/service/technical-specification"],
            ["ขอใบเสนอราคา", "/service/quotation"],
            ["ลงทะเบียนรับประกัน", "/service/warranty/register"],
            ["ติดต่อฝ่ายบริการ", contactPath],
          ]),
          "สินค้า",
          "คุณสมบัติ",
          "configured",
        ),
    surface === "navbar"
      ? {
          label: siteMenuLabel("/indicators", "อินดิเคเตอร์แท่นชั่ง"),
          href: "/indicators",
          submenuLabel: "สินค้า",
          links: links(
            [
              ["อุตสาหกรรม", "/indicators/industrial"],
              ["พาณิชยกรรมและบริการ", "/indicators/commercial"],
            ],
            "configured",
          ),
          groups: [
            {
              label: "คุณสมบัติ",
              links: indicatorFeatures,
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
          "/indicators",
          [
            ["LCD", "/indicators/lcd"],
            ["LED", "/indicators/led"],
          ],
          [
            ["เชื่อมต่อ RS232", "/indicators/rs232"],
            ["ดูโครงสร้างแท่นชั่ง", "/platforms"],
            ["ดูจอและไฟเตือน", "/accessories/displays"],
          ],
          links([
            ["คู่มือเลือกหัวอ่านและแท่นชั่ง", guideHref],
            ["ขอใบเสนอราคา", "/service/quotation"],
            ["เงื่อนไขรับประกัน", "/service/warranty/policy"],
            ["ติดต่อฝ่ายบริการ", contactPath],
          ]),
          "สินค้า",
          "การใช้งาน",
        ),
    surface === "navbar"
      ? {
          label: siteMenuLabel("/platforms", "โครงสร้างแท่นชั่ง"),
          href: "/platforms",
          submenuLabel: "สินค้า",
          links: links(
            [
              ["อินดิเคเตอร์", platformIndicatorsPath],
              ["โครงสร้างแท่นชั่ง", platformStructuresPath],
              ["จัดสเปค", guideHref],
            ],
            "configured",
            false,
          ),
          groups: [
            {
              label: "คุณสมบัติ",
              links: indicatorFeatures,
              linksByProduct: {
                [platformIndicatorsPath]: indicatorFeatures,
                [platformStructuresPath]: links(
                  platformStructureTypes.map(({ id, label }) => [
                    label,
                    `${platformStructuresPath}?type=${id}`,
                  ]),
                  "configured",
                ),
              },
            },
            {
              label: "ช่วยเหลือ",
              links: links(
                [
                  ["ขอใบเสนอราคา", "/service/quotation"],
                  ["เลือกซื้อที่ร้านออนไลน์", componentShopHref],
                  ["ติดต่อเรา", contactPath],
                ],
                "configured",
              ),
            },
          ],
        }
      : menu(
          categoryLabel("platforms", "โครงสร้างแท่นชั่ง"),
          "/platforms",
          platformPlacementPages.map(({ label, href }) => [label, href]),
          [
            ["อินดิเคเตอร์แท่นชั่ง", "/indicators"],
            ["ชิ้นส่วนแท่น", "/accessories/mechanical"],
            ["โหลดเซลล์และอะไหล่อิเล็กทรอนิกส์", "/accessories/electronics"],
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
      ? configuredMenu(
          "/pos",
          siteMenuLabel("/pos", "ระบบ POS"),
          [
            {
              label: "สินค้า",
              links: [
                [posPlatformLabels.android, "/pos/android"],
                [posPlatformLabels.windows, "/pos/windows"],
              ],
            },
            businessHelp,
          ],
          savedDisabled,
        )
      : menu(
          categoryLabel("pos", "ระบบ POS"),
          "/pos",
          [
            ["iOS", "/pos/ios"],
            [posPlatformLabels.android, "/pos/android"],
            [posPlatformLabels.windows, "/pos/windows"],
          ],
          [
            ["เครื่องพิมพ์", "/accessories/printers"],
            ["สแกนเนอร์และลิ้นชัก", "/accessories/scanners-and-cash-drawers"],
          ],
          links([
            ["คู่มือและสเปก", "/service/technical-specification"],
            ["ขอใบเสนอราคา", "/service/quotation"],
            ["ลงทะเบียนรับประกัน", "/service/warranty/register"],
            ["ติดต่อฝ่ายบริการ", contactPath],
          ]),
          "สินค้า",
          "อุปกรณ์ที่ใช้ร่วมกัน",
        ),
    surface === "navbar"
      ? configuredMenu(
          "/accessories",
          siteMenuLabel("/accessories", "อุปกรณ์เสริม"),
          [
            {
              label: "สินค้า",
              links: [
                ["อุปกรณ์ส่งข้อมูล", "/accessories/cables"],
                ["อุปกรณ์ต่อพ่วง", "/accessories/displays"],
                ["เครื่องพิมพ์", "/accessories/printers"],
                ["ชิ้นส่วนเสริม", "/accessories/mechanical"],
                ["วัสดุสิ้นเปลือง", "/accessories/consumables"],
              ],
            },
            {
              label: "ช่วยเหลือ",
              links: [
                ["เลือกเครื่องชั่งเพื่อประกอบ", scaleSpecBuilderPath],
                ["เลือกแท่นชั่งเพื่อประกอบ", platformSpecBuilderPath],
                onlineShop,
                ...contactGroup.links,
              ],
            },
          ],
          savedDisabled,
        )
      : menu(
          categoryLabel("accessories", "อุปกรณ์เสริม"),
          "/accessories",
          [
            ["อุปกรณ์ POS", "/accessories/pos"],
            ["จอและไฟเตือน", "/accessories/displays"],
            ["สายและหัวต่อ", "/accessories/cables"],
            ["เครื่องพิมพ์", "/accessories/printers"],
            ["ชิ้นส่วนแท่น", "/accessories/mechanical"],
            ["ลูกตุ้มน้ำหนัก", "/accessories/weights"],
            ["โหลดเซลล์และอะไหล่อิเล็กทรอนิกส์", "/accessories/electronics"],
            ["อื่น ๆ", "/accessories/consumables"],
          ],
          [
            ["กระดาษและฉลาก", "/accessories/consumables"],
            ["กระดาษความร้อน", "/accessories/thermal-paper"],
            ["ฉลากและสติ๊กเกอร์", "/accessories/labels"],
          ],
          links([
            ["สอบถามอุปกรณ์ที่ใช้ร่วมกัน", contactPath],
            ["ขอใบเสนอราคา", "/service/quotation"],
            ["เงื่อนไขรับประกัน", "/service/warranty/policy"],
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
        ["เลือกอินดิเคเตอร์", "/indicators"],
        ["เลือกแท่นชั่ง", "/platforms"],
        ["ดูอุปกรณ์เสริม", "/accessories"],
      ],
      [["สอบถามความเข้ากันได้", contactPath]],
      links([
        ["ขอใบเสนอราคา", "/service/quotation"],
        ["เงื่อนไขรับประกัน", "/service/warranty/policy"],
        ...(surface === "navbar" ? [] : [["ติดต่อฝ่ายบริการ", contactPath] satisfies MenuEntry]),
      ]),
      "เลือกอุปกรณ์",
      "ตรวจสอบก่อนเลือก",
    ),
    surface === "navbar"
      ? configuredMenu(
          "/service",
          siteMenuLabel("/service", "บริการ"),
          [
            {
              label: "บริการ",
              links: [
                ["ลงทะเบียนรับประกัน", "/service/warranty/register"],
                ["บริการหลังการขาย", "/service"],
              ],
            },
            {
              label: "เอกสาร",
              links: [
                ["บทความ", editorialArticlesPath],
                ["เกี่ยวกับผลิตภัณฑ์", "/service/technical-assistance"],
                ["เงื่อนไขการรับประกัน", "/service/warranty/policy"],
              ],
            },
            contactGroup,
          ],
          savedDisabled,
        )
      : menu(
          "บริการ",
          "/service",
          [
            ["ลงทะเบียนรับประกัน", "/service/warranty/register"],
            ["ขอใบเสนอราคา", "/service/quotation"],
          ],
          [
            ["ดาวน์โหลดซอฟต์แวร์", "/software"],
            ["คู่มือและสเปก", "/service/technical-specification"],
          ],
          links([
            ["เงื่อนไขรับประกัน", "/service/warranty/policy"],
            ["นโยบายยกเลิกและคืนสินค้า", "/service/cancel-and-return/policy"],
            ["เกี่ยวกับ SUNFORD", "/about-us"],
            ["ติดต่อเรา", contactPath],
          ]),
          "บริการ",
          "ซอฟต์แวร์และเอกสาร",
        ),
  ];
}
