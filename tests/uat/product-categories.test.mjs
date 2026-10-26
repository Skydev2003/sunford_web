import assert from "node:assert/strict";
import test from "node:test";
import { tsImport } from "tsx/esm/api";

const { ProductCategory } = await tsImport("../../src/generated/prisma/enums.ts", import.meta.url);
const { categories } = await tsImport("../../src/features/catalog/types.ts", import.meta.url);
const { productInputSchema } = await tsImport(
  "../../src/features/admin/validation.ts",
  import.meta.url,
);
const catalogueCategories = categories.filter(({ id }) => id !== "all").map(({ id }) => id);

test("Prisma can decode every category shown by the catalogue and admin form", () => {
  assert.deepEqual(Object.values(ProductCategory).sort(), [...catalogueCategories].sort());
});

test("admin validation accepts every catalogue category, including imported products", () => {
  const input = {
    name: "Category regression check",
    slug: "category-regression-check",
    subtitle: "Test product",
    description: "Test product description",
    image: "/images/products/wps10ks.png",
    capacity: "10 kg",
    readability: "1 g",
    connection: "USB",
    badge: "",
    sortOrder: 0,
    published: false,
    featured: false,
  };
  for (const category of catalogueCategories) {
    assert.equal(productInputSchema.safeParse({ ...input, category }).success, true, category);
  }
  for (const category of ["all", "unknown"]) {
    assert.equal(productInputSchema.safeParse({ ...input, category }).success, false, category);
  }
});
