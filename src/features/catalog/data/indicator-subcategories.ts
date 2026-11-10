import type { Product } from "../types";
import { warehouseSubcategories } from "./warehouse-categories";
import type { ProductCategory } from "./mock-categories";

type IndicatorModel = { model: string; sourceIds: string[]; documentModel?: string };
const indicator = (model: string, sourceId?: string): IndicatorModel => ({
  model,
  documentModel: `Indicator-${model}`,
  sourceIds: sourceId ? [sourceId] : [`Indicator-${model}`, model],
});

const subcategories: { id: string; label: string; models: IndicatorModel[] }[] = [
  {
    id: "indicator-lcd",
    label: "LCD",
    models: [
      indicator("AW31", "10777"),
      indicator("AC31P", "10781"),
      indicator("SW31F", "10784"),
      indicator("WP31C", "10779"),
      { model: "LCDC1C5", sourceIds: ["LCDC1C5"] },
    ],
  },
  {
    id: "indicator-led",
    label: "LED",
    models: [
      indicator("SW31", "10778"),
      indicator("WP31E", "10780"),
      indicator("WP31EUSB"),
      { model: "LED-R1", sourceIds: ["LED-R1", "10725"] },
      { model: "LED-R3", sourceIds: ["LED-R3", "10723"] },
      { model: "LED-R5", sourceIds: ["LED-R5", "10724"] },
    ],
  },
  {
    id: "indicator-waterproof",
    label: "กันน้ำ",
    models: [indicator("WP31C", "10779"), indicator("WP31E", "10780"), indicator("WP31EUSB")],
  },
];

const modelCode = (value: string) =>
  value
    .trim()
    .replace(/^Indicator[-\s]+/i, "")
    .toUpperCase();

export function getIndicatorSubcategories(products: Product[]): ProductCategory["subcategories"] {
  const bySourceId = new Map(products.map((product) => [product.sourceId, product]));
  return warehouseSubcategories(
    subcategories.map(({ id, label, models }) => {
      const entries = models.map(({ model, documentModel, sourceIds }) => {
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
        productIds: [
          ...new Set(entries.flatMap((entry) => (entry.productId ? [entry.productId] : []))),
        ],
        entries,
      };
    }),
    products,
  );
}
