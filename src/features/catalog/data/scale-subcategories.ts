import manifest from "./scale-category-models.json";
import { warehouseSubcategories } from "./warehouse-categories";
import { catalogProductGroup } from "./catalog-supplements";
import type { Product } from "../types";
import type { ProductCategory, ScaleModelEntry } from "./mock-categories";

export const scaleSubcategoryDefinitions = manifest.categories;
const aliases: Record<string, string> = {
  "VB3000S HiCoFE": "Hi CoFE",
  "Fitdays Smart Scale - FD1000": "Fitdays",
};
const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toUpperCase();
const tokenMatch = (value: string, model: string) => {
  const escaped = model.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^A-Z0-9-])${escaped}(?=$|[^A-Z0-9-])`, "i").test(value);
};

export function findScaleModel(products: Product[], model: string): Product | undefined {
  if (aliases[model]) {
    const matches = products.filter(
      (product) => normalize(product.name) === normalize(aliases[model]),
    );
    return matches.length === 1 ? matches[0] : undefined;
  }
  return (
    products.find((product) => normalize(product.name) === normalize(model)) ??
    products.find((product) => normalize(product.sourceId ?? "") === normalize(model)) ??
    products.find((product) => normalize(product.slug) === normalize(model)) ??
    products.find((product) => tokenMatch(product.name, model))
  );
}

export function getScaleSubcategories(products: Product[]): ProductCategory["subcategories"] {
  const scales = products.filter((product) => catalogProductGroup(product) === "/products");
  return warehouseSubcategories(
    manifest.categories.map((category) => {
      const entries: ScaleModelEntry[] = category.groups
        .flatMap((group) => group.models)
        .flatMap((documentModel) => {
          const variants =
            documentModel === "WSS30KS" ? ["WSS30KS-LCD", "WSS30KS-LED"] : [documentModel];
          return variants.map((model) => {
            const product = findScaleModel(scales, model);
            return { model, documentModel, ...(product ? { productId: product.id } : {}) };
          });
        });
      return {
        id: category.id,
        label: category.label,
        productIds: [
          ...new Set(entries.flatMap((entry) => (entry.productId ? [entry.productId] : []))),
        ],
        entries,
      };
    }),
    products,
  );
}
