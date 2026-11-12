import type { Product } from "../types";

export type WarehouseCardFact = {
  sku: string;
  title: string;
  value_text: string | null;
  value_number: string | null;
  value_options?: unknown;
  unit: string | null;
};

function factValue(fact: WarehouseCardFact): string {
  if (fact.value_text?.trim()) return fact.value_text.trim();
  if (fact.value_number !== null)
    return [fact.value_number, fact.unit?.trim()].filter(Boolean).join(" ");
  if (Array.isArray(fact.value_options))
    return fact.value_options
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean)
      .join(", ");
  return typeof fact.value_options === "string" ? fact.value_options.trim() : "";
}

const fields = {
  จุดเด่นสินค้า: "subtitle",
  พิกัดชั่งสูงสุด: "capacity",
  ค่าละเอียดการชั่ง: "readability",
  เงื่อนไขการเชื่อมต่อ: "connection",
} as const;

export function attachWarehouseCardFacts(products: Product[], facts: WarehouseCardFact[]) {
  return products.map((product) => {
    if (!product.warehouseCard || !product.warehouseSku) return product;
    const card = { ...product.warehouseCard };
    const valuesByTitle = new Map<string, Set<string>>();
    for (const fact of facts.filter((row) => row.sku === product.warehouseSku)) {
      const title = fact.title.trim();
      const value = factValue(fact);
      if (!title || !value) continue;
      const values = valuesByTitle.get(title) ?? new Set<string>();
      values.add(value);
      valuesByTitle.set(title, values);
    }
    const specifications = [...valuesByTitle].flatMap(([label, values]) =>
      values.size === 1 ? [{ label, value: [...values][0] }] : [],
    );
    for (const [title, field] of Object.entries(fields)) {
      card[field] = specifications.find((row) => row.label === title)?.value ?? "";
    }
    return { ...product, warehouseCard: card, warehouseSpecifications: specifications };
  });
}
