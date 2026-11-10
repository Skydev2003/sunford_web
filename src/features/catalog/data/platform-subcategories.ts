import { catalogProductGroup } from "./catalog-supplements";
import { warehouseSubcategories } from "./warehouse-categories";
import type { Product } from "../types";
import type { ProductCategory } from "./mock-categories";

type PlatformMaterial = {
  id: string;
  label: string;
  models: { model: string; sourceId?: string }[];
};

export const platformSubcategoryDefinitions: PlatformMaterial[] = [
  {
    id: "platform-carbon-steel",
    label: "เหล็กคาร์บอนพ่นอบสีกันสนิม",
    models: [
      { model: "TCS 4050", sourceId: "10755" },
      { model: "TCS 4560", sourceId: "10756" },
      { model: "TCS 5060", sourceId: "10761" },
      { model: "TCS 6080", sourceId: "10762" },
      { model: "FCS 3040", sourceId: "10752" },
      { model: "FCS 4050", sourceId: "10753" },
      { model: "FCS60100", sourceId: "10764" },
      { model: "FCS 4560", sourceId: "10754" },
      { model: "FCS100100", sourceId: "10774" },
      { model: "FCS120120", sourceId: "10775" },
      { model: "BCS100100", sourceId: "10770" },
      { model: "BCS120120", sourceId: "10771" },
    ],
  },
  {
    id: "platform-sus304",
    label: "สแตนเลส SUS304",
    models: [
      { model: "TMS 3040", sourceId: "10757" },
      { model: "TSS 3040", sourceId: "10758" },
      { model: "TSS 4050", sourceId: "10759" },
      { model: "TSS 5060", sourceId: "10760" },
      { model: "FSS100100", sourceId: "10766" },
      { model: "FSS120120", sourceId: "10767" },
      { model: "BSS100100", sourceId: "10772" },
      { model: "BSS120120", sourceId: "10773" },
      { model: "CSS 3838", sourceId: "10751" },
    ],
  },
  {
    id: "platform-sus201",
    label: "สแตนเลส SUS201",
    models: [
      { model: "VCS60100", sourceId: "10765" },
      { model: "TIS 3949", sourceId: "10763" },
    ],
  },
  {
    id: "platform-abs",
    label: "พลาสติก ABS เหนียวพิเศษ",
    models: [{ model: "พลาสติก ABS เหนียวพิเศษ" }],
  },
];

export function getPlatformSubcategories(products: Product[]): ProductCategory["subcategories"] {
  const platforms = products.filter(
    (product) => catalogProductGroup(product) === "/product/scale-platforms",
  );
  const bySourceId = new Map(platforms.map((product) => [product.sourceId, product]));
  return warehouseSubcategories(
    platformSubcategoryDefinitions.map(({ id, label, models }) => {
      const entries = models.map(({ model, sourceId }) => {
        const product = sourceId ? bySourceId.get(sourceId) : undefined;
        return { model, documentModel: model, ...(product ? { productId: product.id } : {}) };
      });
      return {
        id,
        label,
        productIds: entries.flatMap((entry) => (entry.productId ? [entry.productId] : [])),
        entries,
      };
    }),
    products,
  );
}
