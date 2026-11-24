import type { Product } from "../types";
import {
  additionalAccessorySubcategoryPages,
  additionalScaleSubcategoryPages,
  indicatorRs232SubcategoryPage,
} from "./additional-subcategory-pages";
import { warehouseFact } from "./warehouse-site-data";

export type ProductListingFeature = {
  id: string;
  label: string;
  productIds: string[];
  exclusive?: true;
};

type FeatureRule = Omit<ProductListingFeature, "productIds"> & {
  matches: (product: Product) => boolean | undefined;
};

const scales: FeatureRule[] = [
  ...additionalScaleSubcategoryPages,
  {
    id: "water-resistant",
    label: "กันน้ำ",
    matches: (product) => product.warehouseSubcategoryIds?.includes("scale-water-dust"),
  },
  {
    id: "tare",
    label: "หักน้ำหนักภาชนะ",
    matches: (product) =>
      /^(รองรับ|ใช่|yes|true)$/i.test(warehouseFact(product, "หักน้ำหนักภาชนะ").trim()),
  },
];

const indicators: FeatureRule[] = [
  indicatorRs232SubcategoryPage,
  {
    id: "ip67",
    label: "กันน้ำ IP67",
    matches: (product) =>
      product.warehouseSubcategoryIds?.includes("indicator-waterproof") &&
      /^IP\s*67$/i.test(warehouseFact(product, "ระดับการป้องกัน IP").trim()),
  },
];

const pos = [
  {
    id: "pos-device",
    label: "เครื่อง POS และเวิร์กสเตชัน",
    warehouseGroup: "ระบบขายและเวิร์กสเตชัน",
  },
  { id: "pos-kit", label: "ชุด POS", warehouseGroup: "สินค้าจำหน่ายแบบแพ็ก" },
  { id: "pos-software", label: "ซอฟต์แวร์ POS", warehouseGroup: "โปรแกรมและสิทธิ์ใช้งาน" },
].map(({ id, label, warehouseGroup }): FeatureRule => ({
  id,
  label,
  exclusive: true,
  matches: (product) => product.warehouseGroup === warehouseGroup,
}));

const accessoryTypes: Record<string, readonly [string, RegExp][]> = {
  "accessory-displays": [
    ["จอแสดงผล", /จอแสดงผล/],
    ["ไฟเตือน", /ไฟเตือน|ไฟสัญญาณ/],
  ],
  "accessory-cables": [
    ["สาย RS232", /\bRS[-\s]?232/iu],
    ["สายโหลดเซลล์", /Load\s*cell\s+Cable|สายโหลดเซลล์/i],
    ["หัวต่อ", /Connector|หัวต่อ/i],
    ["ชุดสายไฟ", /ชุดสายไฟ/],
  ],
  "accessory-pos": [
    ["เครื่องพิมพ์", /SUNFORD\s+เครื่องพิมพ์/i],
    ["สแกนเนอร์", /สแกนเนอร์|\bScanner\b/i],
    ["ลิ้นชักไฟฟ้า", /ลิ้นชักไฟฟ้า|\bCash Drawer\b/i],
    ["คีย์บอร์ดและเมาส์", /คีย์บอร์ด.*เม[้า]+ส์|\bKeyboard\b.*\bMouse\b/i],
  ],
  "accessory-scanners-and-cash-drawers": [
    ["สแกนเนอร์", /สแกนเนอร์|\bScanner\b/i],
    ["ลิ้นชักไฟฟ้า", /ลิ้นชักไฟฟ้า|\bCash Drawer\b/i],
  ],
  "accessory-mechanical": [
    ["ล้อ", /(?:^|[\s-])ล้อ\s/],
    ["ทางลาด", /ทางลาด|\bRAMP\b/i],
    ["เสาแท่นชั่ง", /\bFloor pole\b|เสาแท่นชั่ง/i],
    ["ขาปรับระดับ", /ขา(?:เกลียว)?ปรับระดับ/],
    ["จานชั่ง", /จานชั่ง/],
  ],
  "accessory-electronics": [
    ["โหลดเซลล์", /Load\s*cell|โหลดเซลล์/i],
    ["แผงวงจร", /\bPCB\b|แผงวงจร/i],
    ["บลูทูธ", /Bluetooth|บลูทูธ/i],
  ],
};

function matchingFeatures(products: readonly Product[], rules: readonly FeatureRule[]) {
  return rules
    .map(({ id, label, exclusive, matches }) => ({
      id,
      label,
      exclusive,
      productIds: products.filter(matches).map(({ id }) => id),
    }))
    .filter(({ productIds }) => productIds.length > 0);
}

function nameFeatures(
  products: readonly Product[],
  valueFromName: (name: string) => string | undefined,
): ProductListingFeature[] {
  const memberships = new Map<string, string[]>();
  for (const product of products) {
    const label = valueFromName(product.warehouseName ?? "");
    if (!label) continue;
    const ids = memberships.get(label) ?? [];
    ids.push(product.id);
    memberships.set(label, ids);
  }
  return [...memberships.entries()]
    .sort(([first], [second]) => first.localeCompare(second, "th", { numeric: true }))
    .map(([label, productIds]) => ({ id: label, label, productIds, exclusive: true }));
}

export function getProductListingFeatures(
  categoryId: string,
  subcategoryId: string,
  products: readonly Product[],
): ProductListingFeature[] {
  switch (categoryId) {
    case "scales":
      return matchingFeatures(products, scales);
    case "indicators":
      return matchingFeatures(products, indicators);
    case "platforms":
      return nameFeatures(products, (name) => {
        const series = name.match(/\bPlatform\s+(?:Terminal\s+)?([A-Z]{2,5})\s*\d{4,6}\b/i)?.[1];
        return series && `ซีรีส์ ${series.toUpperCase()}`;
      });
    case "pos":
      return matchingFeatures(products, pos);
    case "accessories": {
      if (subcategoryId === "accessory-consumables") {
        return matchingFeatures(
          products,
          additionalAccessorySubcategoryPages
            .filter(({ id }) => ["accessory-thermal-paper", "accessory-labels"].includes(id))
            .map((page) => ({ ...page, exclusive: true })),
        );
      }
      if (subcategoryId === "accessory-thermal-paper" || subcategoryId === "accessory-labels") {
        return nameFeatures(products, (name) => {
          const size = name.match(/(?:\s|Label)(\d{2,3})\s*[x×*]\s*(\d{2,3})(?=\b|WP)/i);
          return size ? `${size[1]} × ${size[2]}` : undefined;
        });
      }
      if (subcategoryId === "accessory-printers") {
        return nameFeatures(products, (name) => {
          const series = name.match(/เครื่องพิมพ์\s+([A-Z]{2,5})(?=[-\s]*\d)/i)?.[1];
          if (series) return `ซีรีส์ ${series.toUpperCase()}`;
          return /เครื่องพิมพ์\s+58IIN\b/i.test(name) ? "รุ่น 58IIN" : undefined;
        });
      }
      return matchingFeatures(
        products,
        (accessoryTypes[subcategoryId] ?? []).map(([label, pattern]) => ({
          id: label,
          label,
          exclusive: true,
          matches: (product) => pattern.test(product.warehouseName ?? ""),
        })),
      );
    }
    default:
      return [];
  }
}
