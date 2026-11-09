import type { OverlayProduct } from "../types";
import type { ProductCategory } from "./mock-categories";

export type CatalogDecisionFact = { label: string; value: string };

export function catalogFieldValue(value: string | undefined): string | null {
  const text = value?.trim();
  return text && !/^[—–-]+$/.test(text) ? text : null;
}

export function getCatalogDecisionFacts(
  product: Pick<OverlayProduct, "id" | "subtitle" | "capacity" | "readability" | "connection">,
  category?: ProductCategory,
): CatalogDecisionFact[] {
  const facts: CatalogDecisionFact[] = [];
  const add = (label: string, value: string | undefined) => {
    const text = catalogFieldValue(value);
    if (text) facts.push({ label, value: text });
  };
  if (category?.id === "indicators") {
    const display = category.subcategories.find(
      (child) =>
        ["indicator-lcd", "indicator-led"].includes(child.id) &&
        child.productIds.includes(product.id),
    );
    add("หน้าจอ", display?.label);
    add("การเชื่อมต่อ", product.connection);
    if (
      category.subcategories.some(
        (child) => child.id === "indicator-waterproof" && child.productIds.includes(product.id),
      )
    )
      add("การใช้งาน", "กันน้ำ");
  } else {
    const classification = {
      platforms: { prefix: "platform-", label: "วัสดุ" },
      pos: { prefix: "pos-", label: "ระบบปฏิบัติการ" },
      accessories: { prefix: "accessory-", label: "ประเภท" },
    }[category?.id ?? ""];
    if (classification) {
      const child = category?.subcategories.find(
        (child) =>
          child.id.startsWith(classification.prefix) && child.productIds.includes(product.id),
      );
      add(classification.label, child?.label);
    }
    if (category && ["scales", "platforms", "pos"].includes(category.id)) {
      add("พิกัดน้ำหนัก", product.capacity);
      add("ค่าละเอียด", product.readability);
    }
    add("การเชื่อมต่อ", product.connection);
  }
  if (!facts.length) add("ข้อมูลสินค้า", product.subtitle);
  return facts.slice(0, 3);
}

const comparisonFields = [
  { label: "การใช้งาน", key: "subtitle" },
  { label: "พิกัดน้ำหนัก", key: "capacity" },
  { label: "ค่าละเอียด", key: "readability" },
  { label: "การเชื่อมต่อ", key: "connection" },
] as const;

export function getCatalogComparisonRows(products: readonly OverlayProduct[]) {
  return comparisonFields.map((field) => {
    const values = products.map((product) => catalogFieldValue(product[field.key]));
    return {
      ...field,
      values,
      different:
        products.length > 1 && values.every((value) => value !== null) && new Set(values).size > 1,
    };
  });
}
