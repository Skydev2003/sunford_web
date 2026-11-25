import assert from "node:assert/strict";
import { test } from "node:test";
import sourceProducts from "../../src/features/content/data/products.json";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import { catalogProductGroup } from "../../src/features/catalog/data/catalog-supplements";
import {
  getPlatformMaterialId,
  getPlatformPlacementSubcategories,
  getPlatformSubcategories,
  platformSubcategoryDefinitions,
} from "../../src/features/catalog/data/platform-subcategories";
import type { Product } from "../../src/features/catalog/types";

const products = getSnapshotProducts();
const children = getPlatformSubcategories(products);

test("platform placements use published identities and allow a verified model in both groups", () => {
  const [floor, benchtop] = getPlatformPlacementSubcategories(products);
  assert.equal(floor.productIds.length, 22);
  assert.deepEqual(benchtop.productIds.toSorted(), ["sunford-10757", "sunford-10758"]);
  assert.ok(floor.productIds.includes("sunford-10758"));
  assert.equal(new Set([...floor.productIds, ...benchtop.productIds]).size, 23);

  const publish = (warehouseSku: string, overrides: Partial<Product> = {}): Product => ({
    ...products[0],
    sourceId: undefined,
    id: warehouseSku,
    warehouseSku,
    warehouseCategoryId: "platforms",
    ...overrides,
  });
  const desk = publish("G107572");
  const both = publish("G107589");
  const floorOnly = publish("G107626");
  const unknown = publish("UNKNOWN", { name: "TMS 3040" });
  const [warehouseFloor, warehouseBenchtop] = getPlatformPlacementSubcategories([
    desk,
    both,
    floorOnly,
    unknown,
  ]);
  assert.deepEqual(warehouseFloor.productIds, ["G107589", "G107626"]);
  assert.deepEqual(warehouseBenchtop.productIds, ["G107572", "G107589"]);
  assert.equal(getPlatformMaterialId(desk), "platform-sus304");
  assert.equal(getPlatformMaterialId(unknown), undefined);
  assert.equal(
    getPlatformMaterialId(
      publish("G107572", {
        warehouseSpecifications: [{ label: "วัสดุโครงสร้าง", value: "เฉพาะจาน SUS304" }],
      }),
    ),
    undefined,
  );
});

test("platform materials preserve the four owner labels and classify all 23 existing structures", () => {
  assert.deepEqual(
    children.map(({ label }) => label),
    ["แท่นเหล็กคาร์บอน", "สแตนเลส SUS304", "สแตนเลส SUS201", "พลาสติก ABS"],
  );
  assert.deepEqual(
    children.map(({ productIds }) => productIds.length),
    [12, 9, 2, 0],
  );
  const ids = children.flatMap(({ productIds }) => productIds);
  assert.equal(new Set(ids).size, 23);
  assert.deepEqual(
    [...ids].sort(),
    products
      .filter((product) => catalogProductGroup(product) === "/product/scale-platforms")
      .map(({ id }) => id)
      .sort(),
  );
  const expectedMaterials = ["Carbon Steel", "SUS304 Stainless Steel", "SUS201 Stainless Steel"];
  children.slice(0, 3).forEach((child, index) => {
    for (const entry of child.entries!) {
      const product = products.find(({ id }) => id === entry.productId)!;
      const source = sourceProducts.find(({ sourceId }) => sourceId === product.sourceId)!;
      assert.equal(
        source.description.match(/วัสดุโครงสร้าง\s+([^\r\n]+)/)?.[1].trim(),
        expectedMaterials[index],
      );
      assert.equal(entry.model, source.name.replace(/^Platform\s+/, ""));
    }
  });
  assert.ok(children[0].productIds.includes("sunford-10755"));
  assert.ok(!children[2].productIds.includes("sunford-10755"));
});

test("ABS is an explicitly named mock without an invented model or product", () => {
  assert.deepEqual(children[3].productIds, []);
  assert.deepEqual(children[3].entries, [
    {
      model: "พลาสติก ABS เหนียวพิเศษ",
      documentModel: "พลาสติก ABS เหนียวพิเศษ",
    },
  ]);
});

test("absent or unpublished platforms stay mock without reappearing from source data", () => {
  const result = getPlatformSubcategories(products.filter(({ sourceId }) => sourceId !== "10755"));
  assert.equal(result[0].entries!.find(({ model }) => model === "TCS 4050")!.productId, undefined);
  assert.equal(result[0].productIds.length, 11);
  assert.ok(
    getPlatformSubcategories([]).every(
      ({ productIds, entries }) =>
        productIds.length === 0 && entries!.every(({ productId }) => !productId),
    ),
  );
});

test("another family and similar models cannot fill a missing platform", () => {
  const other: Product = {
    ...products[0],
    id: "unrelated-platform-code",
    sourceId: undefined,
    sourceUrl: undefined,
    name: "TCS 4050",
    category: "accessories",
  };
  const similar: Product = {
    ...other,
    id: "different-source",
    name: "Platform TCS 4050",
    sourceId: "unlisted-platform",
  };
  const result = getPlatformSubcategories([other, similar]);
  assert.ok(result.every(({ productIds }) => productIds.length === 0));
});

test("stable source identities survive display edits without mutating input or guessing new material", () => {
  const before = structuredClone(products);
  const edited = products.map((product) => ({
    ...product,
    name: "Changed CMS display name",
    description: "ABS SUS201",
  }));
  assert.deepEqual(getPlatformSubcategories(edited), children);
  const unknown: Product = {
    ...products[0],
    id: "new-platform",
    sourceId: "new-platform",
    name: "Platform NEW",
  };
  assert.deepEqual(getPlatformSubcategories([...products, unknown]), children);
  assert.deepEqual(products, before);
  assert.equal(platformSubcategoryDefinitions.flatMap(({ models }) => models).length, 24);
});
