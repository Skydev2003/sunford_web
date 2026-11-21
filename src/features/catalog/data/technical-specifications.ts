import type { Product } from "../types";

export const specificationQueryLimit = 80;

const searchKey = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]/gu, "");

type SpecificationProduct = Pick<
  Product,
  | "name"
  | "storefrontName"
  | "warehouseSku"
  | "warehouseName"
  | "warehouseModelCodes"
  | "warehouseSpecifications"
>;

export type SpecificationEntry<T> = { value: T; keys: string[] };

export function createSpecificationIndex<T extends SpecificationProduct, U>(
  products: readonly T[],
  project: (product: T) => U,
): SpecificationEntry<U>[] {
  return products.flatMap((product) => {
    if (!product.warehouseSku || !product.warehouseSpecifications?.length) return [];
    const model = product.warehouseSpecifications.find(({ label }) => label === "รุ่นสินค้า");
    const keys = [
      product.warehouseSku,
      product.name,
      product.storefrontName,
      product.warehouseName,
      model?.value,
      ...(product.warehouseModelCodes ?? []),
    ].flatMap((value) => (value ? [searchKey(value)] : []));
    return [{ value: project(product), keys: [...new Set(keys)] }];
  });
}

export function findTechnicalSpecifications<T>(
  index: readonly SpecificationEntry<T>[],
  query: string,
) {
  const term = searchKey(query);
  return {
    total: index.length,
    matches: term
      ? index.filter(({ keys }) => keys.some((key) => key.includes(term))).map(({ value }) => value)
      : [],
  };
}
