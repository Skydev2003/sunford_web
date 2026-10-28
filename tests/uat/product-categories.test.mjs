import assert from "node:assert/strict";
import test from "node:test";
import { tsImport } from "tsx/esm/api";

const { ProductCategory } = await tsImport("../../src/generated/prisma/enums.ts", import.meta.url);
const { categories } = await tsImport("../../src/features/catalog/types.ts", import.meta.url);
const catalogueCategories = categories.filter(({ id }) => id !== "all").map(({ id }) => id);

test("Prisma can decode every category shown by the catalogue", () => {
  assert.deepEqual(Object.values(ProductCategory).sort(), [...catalogueCategories].sort());
});
