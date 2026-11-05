import type { Product } from "../types";

const sizeGroups = [
  ["Sticker_6040", "10750", "10747", "10742", "10812", "10811"],
  ["10748", "10740", "10810"],
  ["10749", "10809"],
  ["Sticker_5750", "10743", "10746"],
  ["Sticker_8080", "10744", "10745", "10824"],
];
const sizeBySourceId = new Map(
  sizeGroups.flatMap((sourceIds, size) => sourceIds.map((sourceId) => [sourceId, size] as const)),
);

export function deduplicateConsumableSizes(products: Product[]): Product[] {
  const seen = new Set<number>();
  return products.filter((product) => {
    const size = sizeBySourceId.get(product.sourceId ?? "");
    if (size === undefined) return true;
    if (seen.has(size)) return false;
    seen.add(size);
    return true;
  });
}

export function getConsumableSizeProducts(products: Product[]): Product[] {
  return deduplicateConsumableSizes(
    products.filter(
      (product) =>
        sizeBySourceId.has(product.sourceId ?? "") ||
        ["Sticker_5330", "Sticker_5320"].includes(product.sourceId ?? ""),
    ),
  );
}
