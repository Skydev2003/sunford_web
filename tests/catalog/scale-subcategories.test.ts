import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import manifest from "../../src/features/catalog/data/scale-category-models.json";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import { getScaleSubcategories } from "../../src/features/catalog/data/scale-subcategories";
import type { Product } from "../../src/features/catalog/types";

const products = getSnapshotProducts();
const children = getScaleSubcategories(products);
const child = (id: string) => children.find((item) => item.id === id)!;

test("manifest preserves all eight headings, groups and model lists from the supplied Markdown", () => {
  const bytes = readFileSync(new URL("../../docs/sunford-scale-categories.md", import.meta.url));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), manifest.referenceSha256);
  const sections = bytes.toString("utf8").split(/^## /m).slice(1);
  assert.equal(sections.length, 8);
  sections.forEach((section, index) => {
    const lines = section.split(/\r?\n/);
    const heading = lines[0].match(/^\d+\.\s+(.*?)\s+\((.*)\)$/)!;
    const groups: { label: string; models: string[] }[] = [];
    for (const line of lines.slice(1)) {
      const group = line.match(/^[-*]\s+\*\*(.*?)\*\*:/);
      if (group) groups.push({ label: group[1], models: [] });
      const models = [...line.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
      if (models.length) groups.at(-1)!.models.push(...models);
    }
    assert.equal(manifest.categories[index].label, heading[1]);
    assert.equal(manifest.categories[index].englishLabel, heading[2]);
    assert.deepEqual(manifest.categories[index].groups, groups);
  });
});

test("every document model appears in order as real or mock, including both WSS display variants", () => {
  children.forEach((category, index) => {
    const expected = manifest.categories[index].groups
      .flatMap((group) => group.models)
      .flatMap((model) => (model === "WSS30KS" ? [model, model] : [model]));
    assert.deepEqual(
      category.entries!.map((entry) => entry.documentModel),
      expected,
    );
    assert.equal(
      new Set(category.entries!.map((entry) => entry.model)).size,
      category.entries!.length,
    );
    assert.deepEqual(category.productIds, [
      ...new Set(category.entries!.flatMap((entry) => (entry.productId ? [entry.productId] : []))),
    ]);
  });
  assert.deepEqual(
    child("scale-water-dust")
      .entries!.filter((entry) => entry.documentModel === "WSS30KS")
      .map((entry) => entry.model),
    ["WSS30KS-LCD", "WSS30KS-LED"],
  );
});

test("similar capacities and suffixes never replace document codes that are missing", () => {
  const missing = new Set(
    children.flatMap((category) =>
      category.entries!.filter((entry) => !entry.productId).map((entry) => entry.model),
    ),
  );
  for (const model of [
    "VL15000S",
    "ACS-3-AC31",
    "ACS-30-AC31",
    "TSS-60-SW31S",
    "VCS-300-SW31S",
    "TSS-150-WP31E",
    "TIS-300-JC62Z",
  ])
    assert.ok(missing.has(model), model);
  assert.ok(products.some((product) => product.name === "VL1500S"));
  assert.ok(!child("scale-kitchen").productIds.includes("sunford-10629"));
});

test("document aliases resolve existing Fitdays and Hi CoFE records without creating products", () => {
  const entries = child("scale-kitchen").entries!;
  assert.equal(
    entries.find((entry) => entry.model === "Fitdays Smart Scale - FD1000")!.productId,
    "sunford-10624",
  );
  assert.equal(
    entries.find((entry) => entry.model === "VB3000S HiCoFE")!.productId,
    "sunford-10646",
  );
  assert.equal(
    child("scale-price").entries!.find((entry) => entry.model === "ACS-30-JC21")!.productId,
    "acs30-jc21",
  );
});

test("the document replaces keyword membership instead of adding unrelated fact matches", () => {
  assert.ok(!child("scale-kitchen").productIds.includes("feh5ks"));
  assert.ok(child("scale-kitchen").productIds.includes("sunford-10624"));
  assert.ok(child("scale-pole").productIds.includes("pos1100"));
  assert.ok(child("scale-water-dust").productIds.includes("sunford-10867"));
  const changed = products.map((product) => ({
    ...product,
    description: "ครอบครัว งานครัว กาแฟ กันน้ำและกันฝุ่น แบบตั้งพื้น มีเสา",
  }));
  assert.deepEqual(getScaleSubcategories(changed), children);
});

test("unpublished or absent models become mock rather than reappearing from source snapshots", () => {
  const withoutWps = getScaleSubcategories(products.filter((product) => product.id !== "wps10ks"));
  for (const category of withoutWps)
    for (const entry of category.entries!)
      if (entry.model === "WPS10KS") assert.equal(entry.productId, undefined);
});

test("models from another parent cannot fill a scale mock", () => {
  const nonScale: Product = {
    ...products[0],
    id: "test-accessory",
    sourceId: undefined,
    sourceUrl: undefined,
    name: "FEH30KS",
    category: "accessories",
  };
  const result = getScaleSubcategories([...products, nonScale]);
  assert.equal(
    result
      .find((category) => category.id === "scale-industrial")!
      .entries!.find((entry) => entry.model === "FEH30KS")!.productId,
    undefined,
  );
});

test("a newly supplied exact scale resolves automatically while source records remain unchanged", () => {
  const before = structuredClone(products);
  const newScale: Product = {
    ...products[0],
    id: "test-feh30",
    sourceId: undefined,
    sourceUrl: undefined,
    slug: "test-feh30",
    name: "FEH30KS",
    category: "industrial",
  };
  const result = getScaleSubcategories([...products, newScale]);
  assert.equal(
    result
      .find((category) => category.id === "scale-industrial")!
      .entries!.find((entry) => entry.model === "FEH30KS")!.productId,
    "test-feh30",
  );
  assert.deepEqual(products, before);
});
