import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { getAccessorySubcategories } from "../../src/features/catalog/data/accessory-subcategories";
import {
  deduplicateConsumableSizes,
  getConsumableSizeProducts,
} from "../../src/features/catalog/data/consumable-sizes";
import { catalogProductGroup } from "../../src/features/catalog/data/catalog-supplements";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";

const products = getSnapshotProducts();
const parent = deduplicateConsumableSizes(products).filter(
  (product) => catalogProductGroup(product) === "/product/scale-accessories",
);
const children = getAccessorySubcategories(parent);
const product = (sourceId: string) => products.find((row) => row.sourceId === sourceId)!;

test("first four owner lists preserve exact document identifiers and order; consumables follow the explicit seven-size override", () => {
  const groups = readFileSync("docs/sunford-accessory-categories.md", "utf8")
    .split(/^### /m)
    .slice(1)
    .map((group) => [...group.matchAll(/^[-*] (.+)\r?$/gm)].map((match) => match[1].trim()));
  assert.deepEqual(
    children.slice(0, 4).map((child) => child.entries!.map((entry) => entry.documentModel)),
    groups.slice(0, 4),
  );
  assert.equal(children.length, 5);
  assert.deepEqual(
    children.map((child) => child.productIds.length),
    [3, 0, 2, 4, 7],
  );
  assert.deepEqual(
    children.map((child) => child.entries!.filter((entry) => !entry.productId).length),
    [1, 3, 2, 1, 0],
  );
  assert.equal(parent.length, 39);
  assert.equal(
    new Set(
      children
        .flatMap((child) => child.entries!)
        .filter((entry) => !entry.productId)
        .map((entry) => entry.model),
    ).size,
    7,
  );
});

test("remote displays use one current alias per model with exact-source priority and numeric fallback", () => {
  assert.deepEqual(children[0].productIds, [
    product("LED-R1").id,
    product("LED-R3").id,
    product("LED-R5").id,
  ]);
  const numericOnly = parent.filter(
    (row) => !["LED-R1", "LED-R3", "LED-R5"].includes(row.sourceId ?? ""),
  );
  assert.deepEqual(getAccessorySubcategories(numericOnly)[0].productIds, [
    product("10725").id,
    product("10723").id,
    product("10724").id,
  ]);
});

test("adjacent wheel and printer codes cannot substitute for missing models or invented drawer colors", () => {
  assert.deepEqual(children[2].productIds, [product("10840").id, product("10842").id]);
  assert.deepEqual(
    children[2].entries!.slice(2).map((entry) => entry.productId),
    [undefined, undefined],
  );
  assert.equal(children[3].entries![1].productId, undefined);
  assert.deepEqual(children[3].productIds, [
    product("10741").id,
    product("10732").id,
    product("10733").id,
    product("10726").id,
  ]);
  assert.equal(children[3].entries!.filter((entry) => entry.model.startsWith("DRW")).length, 1);
});

test("current missing inputs remain Mock without source fallback or mutation; unlisted rows remain in the parent", () => {
  const input = parent
    .filter((row) => !["LED-R1", "10725", "10840", "10741"].includes(row.sourceId ?? ""))
    .map((row) => ({ ...row, id: `edited-${row.id}` }));
  const before = structuredClone(input);
  const result = getAccessorySubcategories(input);
  assert.equal(result[0].entries![0].productId, undefined);
  assert.equal(result[2].entries![0].productId, undefined);
  assert.equal(result[3].entries![0].productId, undefined);
  assert(result.flatMap((child) => child.productIds).every((id) => id.startsWith("edited-")));
  assert.deepEqual(input, before);
  assert(parent.some((row) => row.sourceId === "TMS"));
  assert(!children.flatMap((child) => child.productIds).includes(product("TMS").id));
  assert(getAccessorySubcategories([]).every((child) => child.productIds.length === 0));
});

test("consumables preserve existing representative objects/order and exclude superseded document codes", () => {
  assert.deepEqual(
    children[4].productIds,
    getConsumableSizeProducts(parent).map((row) => row.id),
  );
  assert.deepEqual(getAccessorySubcategories(products)[4], children[4]);
  assert.equal(children[4].entries!.length, 7);
  for (const code of ["Label20x60-1000-50u", "Thermalpaper20", "Thermalpaper8020"])
    assert(!children.flatMap((child) => child.entries!).some((entry) => entry.model === code));
});

test("a supplied published exact cable code resolves only its matching Mock", () => {
  const cable = {
    ...product("TMS"),
    id: "published-cable",
    sourceId: "RS2321M2F",
    name: "RS2321M2F",
  };
  const result = getAccessorySubcategories([cable]);
  assert.deepEqual(result[1].productIds, ["published-cable"]);
  assert.equal(result[1].entries![0].productId, "published-cable");
  assert.equal(result[1].entries![1].productId, undefined);
});
