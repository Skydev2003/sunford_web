import type { Product } from "../types";
import { warehouseSubcategories } from "./warehouse-categories";
import type { ProductCategory } from "./mock-categories";
import { catalogCardName } from "./catalog-card-names";
import { getConsumableSizeProducts } from "./consumable-sizes";

type AccessoryModel = { model: string; sourceIds: string[]; documentModel?: string };

export const accessorySubcategoryDefinitions: {
  id: string;
  label: string;
  models: AccessoryModel[];
}[] = [
  {
    id: "accessory-displays",
    label: "จอแสดงผลเสริมและระบบต่อพ่วง",
    models: [
      { model: "LED-R1", sourceIds: ["LED-R1", "10725"] },
      { model: "LED-R3", sourceIds: ["LED-R3", "10723"] },
      { model: "LED-R5", sourceIds: ["LED-R5", "10724"] },
      { model: "LCDC1C5", sourceIds: ["LCDC1C5"] },
    ],
  },
  {
    id: "accessory-cables",
    label: "สายสัญญาณและหัวต่อ",
    models: [
      { model: "RS2321M2F", sourceIds: ["RS2321M2F"] },
      { model: "LoadcellCable", sourceIds: ["LoadcellCable"] },
      { model: "CableConnector", sourceIds: ["CableConnector"] },
    ],
  },
  {
    id: "accessory-mechanical",
    label: "อุปกรณ์เคลื่อนย้ายและชิ้นส่วนแท่นชั่ง",
    models: [
      { model: "NY30M12", sourceIds: ["10840"] },
      { model: "PU20M10", sourceIds: ["10842"] },
      { model: "PU20M12", sourceIds: ["PU20M12"] },
      { model: "PU25M12", sourceIds: ["PU25M12"] },
    ],
  },
  {
    id: "accessory-pos",
    label: "อุปกรณ์ระบบหน้าร้านและต่อพ่วง POS",
    models: [
      {
        model: "DRW-350",
        documentModel: "SUNFORD DRW-350 (DRW350-B / DRW350-W)",
        sourceIds: ["10741"],
      },
      { model: "LP42", sourceIds: ["LP42"] },
      { model: "LP53", sourceIds: ["10732"] },
      { model: "LP54", sourceIds: ["10733"] },
      { model: "TRP-58B", sourceIds: ["10726"] },
    ],
  },
  { id: "accessory-consumables", label: "วัสดุสิ้นเปลือง", models: [] },
];

const modelCode = (value: string) =>
  value
    .trim()
    .replace(/^SUNFORD\s+/i, "")
    .toUpperCase();

export function getAccessorySubcategories(products: Product[]): ProductCategory["subcategories"] {
  const bySourceId = new Map(products.map((product) => [product.sourceId, product]));
  return warehouseSubcategories(
    accessorySubcategoryDefinitions.map(({ id, label, models }) => {
      const entries =
        id === "accessory-consumables"
          ? getConsumableSizeProducts(products).map((product) => ({
              model: catalogCardName(product),
              documentModel: catalogCardName(product),
              productId: product.id,
            }))
          : models.map(({ model, documentModel, sourceIds }) => {
              const product =
                sourceIds.map((sourceId) => bySourceId.get(sourceId)).find(Boolean) ??
                products.find((product) => modelCode(product.name) === modelCode(model));
              return {
                model,
                documentModel: documentModel ?? model,
                ...(product ? { productId: product.id } : {}),
              };
            });
      return {
        id,
        label,
        entries,
        productIds: [
          ...new Set(entries.flatMap((entry) => (entry.productId ? [entry.productId] : []))),
        ],
      };
    }),
    products,
  );
}
