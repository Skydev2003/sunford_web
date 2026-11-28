import assert from "node:assert/strict";
import { test } from "node:test";
import {
  normalizeSearchText,
  prepareCatalogSearch,
  searchCatalogProducts,
  searchContentPages,
} from "../../src/features/catalog/data/catalog-search";
import type { OverlayProduct } from "../../src/features/catalog/types";

const categories = [{ id: "scales", label: "เครื่องชั่ง" }];
const product = (id: string, fields: Partial<OverlayProduct> = {}): OverlayProduct => ({
  id,
  slug: id,
  name: "Unrelated",
  category: "scales",
  subtitle: "",
  description: "",
  image: "",
  capacity: "",
  readability: "",
  connection: "",
  ...fields,
});
const find = (products: OverlayProduct[], query: string) =>
  searchCatalogProducts(prepareCatalogSearch(products, categories), query);
const ids = (products: OverlayProduct[]) => products.map(({ id }) => id);

test("ranks SKU, exact model, identifier prefix, name prefix, name infix, then description", () => {
  const input = [
    product("description", { description: "ABC1 ABC1 ABC1" }),
    product("name-infix", { name: "XABC1Y" }),
    product("name-prefix", { name: "ABC1 accessory" }),
    product("model-prefix", { warehouseModelCodes: ["ABC10"] }),
    product("model", { warehouseModelCodes: ["ABC1"] }),
    product("sku", { warehouseSku: "ABC1" }),
  ];
  assert.deepEqual(ids(find(input, "abc1")), [
    "sku",
    "model",
    "model-prefix",
    "name-prefix",
    "name-infix",
    "description",
  ]);
});

test("exact full names share the exact-model tier and ties preserve source order", () => {
  const input = [
    product("prefix", { warehouseSku: "ABC10" }),
    product("full-name", { warehouseName: "ABC1" }),
    product("full-model", { warehouseModelCodes: ["ABC1"] }),
  ];
  assert.deepEqual(ids(find(input, "ABC1")), ["full-name", "full-model", "prefix"]);
});

test("normalizes case, whitespace and NFC without removing Thai marks", () => {
  assert.equal(normalizeSearchText("  Cafe\u0301\t  เครื่องชั่ง\n "), "café เครื่องชั่ง");
  const input = [product("thai", { name: "เครื่องชั่ง", description: "CAFÉ" })];
  assert.deepEqual(ids(find(input, " cafe\u0301  เครื่องชั่ง ")), ["thai"]);
  assert.deepEqual(find(input, "เครืองชัง"), []);
});

for (const query of ["WPS10KS", "wps-10ks", " wps  10ks ", "WPS 10K", "WPS"]) {
  test(`matches verified identifier formatting/prefix: ${JSON.stringify(query)}`, () => {
    const input = [
      product("other-model", { warehouseModelCodes: ["WPS6KS"] }),
      product("target", { warehouseModelCodes: ["WPS10KS"] }),
    ];
    const result = ids(find(input, query));
    assert.ok(result.includes("target"));
    if (query !== "WPS") assert.deepEqual(result, ["target"]);
  });
}

test("identifier normalization works in source codes and mixed multi-word queries", () => {
  const input = [product("source", { warehouseSku: "G-100", warehouseModelCodes: ["WPS-10KS"] })];
  for (const query of ["g100", "G 100", "เครื่องชั่ง wps10ks", "wps-10ks เครื่องชั่ง"])
    assert.deepEqual(ids(find(input, query)), ["source"]);
});

test("does not collapse different model digits, decimals, slash, or similar letters", () => {
  const input = [
    product("six", { warehouseModelCodes: ["WPS6KS"] }),
    product("decimal", { name: "1.0", warehouseModelCodes: ["A1.0"] }),
    product("slash", { name: "A/B", warehouseModelCodes: ["A1/B"] }),
    product("letter-o", { warehouseModelCodes: ["AO1"] }),
    product("letter-i", { warehouseModelCodes: ["AI1"] }),
  ];
  for (const query of ["WPS10KS", "10", "AB", "A10", "A1B", "A01", "A11"])
    assert.deepEqual(find(input, query), [], query);
  assert.deepEqual(ids(find(input, "1.0")), ["decimal"]);
  assert.deepEqual(ids(find(input, "A/B")), ["slash"]);
});

test("AND spans separate fields in any order and repeated terms do not change rank", () => {
  const input = [
    product("description-only", { description: "WPS10KS เครื่องชั่ง" }),
    product("actual-model", { warehouseModelCodes: ["WPS10KS"] }),
    product("partial", { warehouseModelCodes: ["WPS6KS"] }),
  ];
  for (const query of ["เครื่องชั่ง WPS10KS", "WPS10KS เครื่องชั่ง", "WPS10KS เครื่องชั่ง WPS10KS"])
    assert.deepEqual(ids(find(input, query)), ["actual-model", "description-only"]);
  assert.deepEqual(find(input, "WPS10KS absent"), []);
});

test("name-only AND outranks mixed-field matches without manufacturing word boundaries", () => {
  const input = [
    product("mixed", { description: "alpha beta" }),
    product("name", { name: "XalphaY ZbetaQ" }),
    product("boundary", { name: "alpha", subtitle: "beta" }),
  ];
  assert.deepEqual(ids(find(input, "alpha beta")), ["boundary", "name", "mixed"]);
  assert.deepEqual(
    find([product("boundary", { name: "alpha", subtitle: "beta" })], "alphabeta"),
    [],
  );
});

test("description references are searchable but do not become product identity", () => {
  const input = [
    product("reference", { slug: "ABC1", description: "ABC1" }),
    product("real", { warehouseModelCodes: ["ABC1"] }),
  ];
  assert.deepEqual(ids(find(input, "ABC1")), ["real", "reference"]);
  assert.deepEqual(find([product("slug-only", { slug: "ABC1" })], "ABC1"), []);
});

test("missing metadata/category never becomes undefined text or invented identity", () => {
  const input = [product("missing", { category: "unknown" })];
  assert.deepEqual(find(input, "undefined"), []);
  assert.deepEqual(find(input, "WPS10KS"), []);
  assert.deepEqual(ids(find(input, "unrelated")), ["missing"]);
});

test("empty queries preserve source order, object identity and immutable input", () => {
  const input = [product("b"), product("a")];
  const before = structuredClone(input);
  input.forEach(Object.freeze);
  Object.freeze(input);
  for (const query of ["", " \n\t ", "Unrelated"]) {
    const result = find(input, query);
    assert.deepEqual(ids(result), ["b", "a"]);
    assert.equal(result[0], input[0]);
  }
  assert.deepEqual(input, before);
});

test("all matches are ranked before display slicing so late exact results are retained", () => {
  const input = [
    ...Array.from({ length: 45 }, (_, i) => product(`reference-${i}`, { description: "ABC1" })),
    product("late-exact", { warehouseSku: "ABC1" }),
  ];
  const found = find(input, "ABC1");
  assert.equal(found.length, 46);
  assert.equal(found.slice(0, 40)[0].id, "late-exact");
});

test("content pages use normalized AND, retain order and have no empty-query results", () => {
  const pages = [
    { title: "การรับประกัน", path: "/service/warranty/register" },
    { title: "การรับประกัน", path: "/service/warranty/policy" },
    { title: "Other", path: "/warranty" },
  ];
  for (const query of ["รับประกัน WARRANTY", " warranty  รับประกัน warranty "])
    assert.deepEqual(searchContentPages(pages, query), pages.slice(0, 2));
  assert.deepEqual(searchContentPages(pages, "register รับประกัน"), [pages[0]]);
  assert.deepEqual(searchContentPages(pages, "รับประกัน absent"), []);
  assert.deepEqual(searchContentPages(pages, " \n "), []);
});
