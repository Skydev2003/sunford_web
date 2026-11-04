export const productCategoryDefinitions = [
  { id: "scales", label: "เครื่องชั่ง", path: "/products" },
  { id: "indicators", label: "อินดิเคเตอร์แท่นชั่ง", path: "/Indicator" },
  { id: "platforms", label: "โครงสร้างแท่นชั่ง", path: "/product/scale-platforms" },
  { id: "pos", label: "ระบบ POS", path: "/Product/POS" },
  { id: "accessories", label: "อุปกรณ์เสริม", path: "/product/scale-accessories" },
] as const;

export type ScaleModelEntry = {
  model: string;
  documentModel: string;
  productId?: string;
};

export type ProductCategory = {
  id: string;
  label: string;
  productIds: string[];
  subcategoriesAreMock: boolean;
  subcategories: { id: string; label: string; productIds: string[]; entries?: ScaleModelEntry[] }[];
};

export function getMockSubcategories(categoryId: string, productIds: string[]) {
  return Array.from({ length: 2 }, (_, index) => ({
    id: `mock-${categoryId}-${index + 1}`,
    label: `หมวดย่อย ${String(index + 1).padStart(2, "0")}`,
    // Only the children remain a demo; their products stay inside the real parent.
    productIds: productIds.filter((_, productIndex) => productIndex % 2 === index),
  }));
}
