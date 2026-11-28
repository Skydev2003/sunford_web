import { buyingGuideHref } from "@/features/content/data/buying-guides";
import type { Product } from "../types";
import { platformSpecBuilderPath } from "./platform-spec-builder-path";

const accessories = "/accessories";
const scales = "/scales";
const printers = { href: `${accessories}/printers`, label: "เครื่องพิมพ์" };
const thermalPaper = { href: `${accessories}/thermal-paper`, label: "กระดาษความร้อน" };
const labels = { href: `${accessories}/labels`, label: "ฉลากและสติ๊กเกอร์" };
const cables = { href: `${accessories}/cables`, label: "สายและหัวต่อ" };
const consumables = { href: `${accessories}/consumables`, label: "วัสดุสิ้นเปลือง" };
const scaleGuide = { href: buyingGuideHref("scales"), label: "คู่มือเลือกเครื่องชั่ง" };
const labelPrinting = { href: "/solutions/label-printing", label: "โซลูชันงานพิมพ์ฉลาก" };
const pos = { href: "/pos", label: "ระบบ POS" };
const scannerAndCashDrawerSkus = new Set([
  "G107374",
  "G107381",
  "G107411",
  "SUNFORDDRW350-B",
  "SUNFORDDRW350-W",
]);

export const consumableSubtypeLinks = [thermalPaper, labels];

const counting = /นับจำนวน(?:ชิ้น)?|นับชิ้น|\bcounting scales?\b/i;
const checkweighing = /เตือน(?:ช่วงน้ำหนัก|น้ำหนักขาด\s*[-–—/]?\s*เกิน)/i;
const labelMaterial = /สติ[๊้]?กเกอร์|ฉลาก|เลเบล|\blabels?(?=\b|\d{2,3}\s*[x×*]\s*\d{2,3})/i;
const option =
  /ออปชั[่น]+|ตัวเลือก|เพิ่มเติม|เสริม|ไม่รองรับ|ไม่มี|\boptional\b|\boption\b|\bnot supported\b/i;

function supportsFeature(product: Product, feature: RegExp) {
  const fact = product.warehouseSpecifications?.find(({ label }) => feature.test(label));
  return fact
    ? /^(รองรับ|ใช่|yes|true)$/i.test(fact.value.trim())
    : feature.test(product.warehouseName ?? "") && !option.test(product.warehouseName ?? "");
}

export function hasDeviceConnection(product: Product) {
  return (
    product.warehouseSpecifications?.some(
      ({ label, value }) =>
        /เชื่อมต่อ|พอร์[ตท]|เครื่องพิมพ์|ลิ้นชัก|port|interface/i.test(label) &&
        /ส่งข้อมู[ล]?|เครื่องพิมพ์|ลิ้นชัก|อุปกรณ์เสริม|\b(?:RS[-\s]?232|Bluetooth|USB|POS|Wi[-\s]?Fi|LAN|Ethernet)\b/i.test(
          value,
        ) &&
        !option.test(`${label} ${value}`),
    ) ?? false
  );
}

function hasRs232(product: Product) {
  return (
    product.warehouseSpecifications?.some(
      ({ label, value }) =>
        /เชื่อมต่อ|พอร์[ตท]|port|interface/i.test(label) &&
        /\bRS[-\s]?232\b/i.test(value) &&
        !option.test(`${label} ${value}`),
    ) ?? false
  );
}

function definePage<Category extends "scales" | "indicators" | "accessories", Id extends string>(
  categoryId: Category,
  id: Id,
  slug: string,
  label: string,
  relatedLinks: readonly { href: string; label: string }[],
  matches: (product: Product) => boolean,
) {
  return {
    id,
    categoryId,
    slug,
    label,
    title: label,
    href: `/${categoryId}/${slug}`,
    returnContext: id,
    relatedLinks,
    matches: (product: Product) =>
      Boolean(product.warehouseSku) &&
      product.warehouseCategoryId === categoryId &&
      matches(product),
  };
}

export const additionalScaleSubcategoryPages = [
  definePage("scales", "scale-counting", "counting", "นับจำนวน", [scaleGuide], (product) =>
    supportsFeature(product, counting),
  ),
  definePage(
    "scales",
    "scale-checkweighing",
    "checkweighing",
    "เตือนน้ำหนักขาดเกิน",
    [
      { href: `${scales}/industrial`, label: "เครื่องชั่งอุตสาหกรรม" },
      { href: "/solutions/checkweighing", label: "โซลูชันตรวจสอบน้ำหนัก" },
    ],
    (product) => supportsFeature(product, checkweighing),
  ),
];

export const indicatorRs232SubcategoryPage = definePage(
  "indicators",
  "indicator-rs232",
  "rs232",
  "เชื่อมต่อ RS232",
  [{ href: "/solutions/rs232", label: "โซลูชัน RS232" }, cables],
  hasRs232,
);

// Imported indicator collections cross-checked against docs/warehouse/sku-category-mapping.csv.
const indicatorApplicationGroups = [
  {
    slug: "laboratory",
    label: "ห้องปฏิบัติการ",
    warehouseSkus: [],
  },
  {
    slug: "industrial",
    label: "อุตสาหกรรม",
    warehouseSkus: ["G107763", "G107770", "G107787", "G107794", "G107800", "G107817"],
  },
  {
    slug: "commercial",
    label: "ร้านค้าและบริการ",
    warehouseSkus: ["G107848"],
  },
] as const;

export const additionalIndicatorSubcategoryPages = [
  indicatorRs232SubcategoryPage,
  ...indicatorApplicationGroups.map(({ slug, label, warehouseSkus }) => {
    const skus = new Set<string>(warehouseSkus);
    return {
      ...definePage(
        "indicators",
        `indicator-${slug}` as const,
        slug,
        label,
        [
          {
            href: platformSpecBuilderPath,
            label: "คู่มือเลือกหัวอ่านและแท่นชั่ง",
          },
        ],
        ({ warehouseSku }) => skus.has(warehouseSku ?? ""),
      ),
      title: `อินดิเคเตอร์แท่นชั่ง ${label}`,
    };
  }),
];

export const additionalAccessorySubcategoryPages = [
  definePage(
    "accessories",
    "accessory-electronics",
    "electronics",
    "โหลดเซลล์และอะไหล่อิเล็กทรอนิกส์",
    [
      { href: "/platforms", label: "โครงสร้างแท่นชั่ง" },
      { href: platformSpecBuilderPath, label: "คู่มือเลือกหัวอ่านและแท่นชั่ง" },
      cables,
    ],
    ({ warehouseGroup, warehouseName = "" }) => {
      if (warehouseGroup !== "ชิ้นส่วน" || /cable|สาย/i.test(warehouseName)) return false;
      const electronicPart =
        /ชิ้นส่วน\s*[-–:]\s*(?:load\s*cell|โหลดเซลล์?|อะไหล่อิเล็กทรอนิกส์|แผงวงจร)(?:\s|$)/i.test(
          warehouseName,
        );
      const circuitOrTransmitter =
        /ชิ้นส่วน\s*[-–:]\s*(?:PCB|ส่วนขยายวงจร\s*บลูทูธ|วงจรแท่นชั่ง(?:เทอร์มินอล)?|อุปกรณ์ส่งสัญญาณ\s*บลูทูธ)(?:\s+[a-z0-9,.-]+ม?)*\s*$/i.test(
          warehouseName,
        );
      return (electronicPart && !/แท่น/.test(warehouseName)) || circuitOrTransmitter;
    },
  ),
  definePage(
    "accessories",
    "accessory-printers",
    "printers",
    printers.label,
    [pos, labelPrinting, thermalPaper, labels],
    ({ warehouseGroup }) => warehouseGroup === "เครื่องพิมพ์",
  ),
  definePage(
    "accessories",
    "accessory-scanners-and-cash-drawers",
    "scanners-and-cash-drawers",
    "สแกนเนอร์และลิ้นชัก",
    [pos, { href: `${accessories}/pos`, label: "อุปกรณ์ POS" }],
    ({ warehouseSku }) => scannerAndCashDrawerSkus.has(warehouseSku ?? ""),
  ),
  definePage(
    "accessories",
    "accessory-weights",
    "weights",
    "ลูกตุ้มน้ำหนัก",
    [{ href: scales, label: "เครื่องชั่ง" }, scaleGuide],
    ({ warehouseGroup }) => warehouseGroup === "ลูกตุ้มและตุ้มน้ำหนัก",
  ),
  definePage(
    "accessories",
    "accessory-thermal-paper",
    "thermal-paper",
    thermalPaper.label,
    [consumables, printers],
    ({ warehouseGroup, warehouseName }) =>
      warehouseGroup === "วัสดุสิ้นเปลือง" &&
      /กระดาษความร้อน|\bthermal\s*paper(?=\b|\d+\b)/i.test(warehouseName ?? "") &&
      !labelMaterial.test(warehouseName ?? ""),
  ),
  definePage(
    "accessories",
    "accessory-labels",
    "labels",
    labels.label,
    [consumables, printers, labelPrinting],
    ({ warehouseGroup, warehouseName }) =>
      warehouseGroup === "วัสดุสิ้นเปลือง" && labelMaterial.test(warehouseName ?? ""),
  ),
];
