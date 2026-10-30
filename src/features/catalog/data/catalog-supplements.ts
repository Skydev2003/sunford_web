import pages from "@/features/content/data/pages.json";
import type { Product } from "../types";

// Some newer source records are absent from the older collection page indexes.
const indexedCollections = new Set([
  "scales",
  "industrial-indicators",
  "commercial-indicators",
  "scale-platforms",
  "pos-scale-integration",
  "scale-accessories",
  "consumables",
  "printers",
  "scale-peripherals",
  "parts",
]);
const indexed = new Set(
  pages
    .filter((page) => indexedCollections.has(page.path.split("/").at(-1)!))
    .flatMap((page) => page.productHandles ?? []),
);

export function supplementalCatalogGroup(product: Product) {
  if (product.sourceId && indexed.has(product.sourceId)) return undefined;
  if (/\bindicator\b|อินดิเคเตอร์/i.test(product.name)) return "/Indicator";
  if (/^Platform\b|โครงสร้างแท่นชั่ง/i.test(product.name)) return "/product/scale-platforms";
  if (
    product.category === "accessories" ||
    product.topics?.some((topic) =>
      ["consumables", "parts", "data-devices", "peripherals"].includes(topic),
    )
  )
    return "/product/scale-accessories";
  if (product.category === "pos") return "/Product/POS";
  return "/products";
}
