import assert from "node:assert/strict";
import test from "node:test";
import {
  pricedProducts,
  quotationTotals,
  selectedQuoteItems,
} from "../../src/features/catalog/data/quotation";

test("handoff fills confirmed product IDs and retains pending models exactly once", () => {
  const presets = [
    { code: "Indicator-AW31", pricedId: "head-id", label: "Indicator-AW31" },
    { code: "TMS-60-AW31", label: "แท่นชั่ง (รหัสชุด TMS-60-AW31)" },
    { code: "LoadcellCable", label: "LoadcellCable" },
  ];
  assert.deepEqual(
    selectedQuoteItems(
      ["Indicator-AW31", "Indicator-AW31", "TMS-60-AW31", "LoadcellCable", "invalid"],
      presets,
    ),
    {
      ids: ["head-id"],
      pending: ["แท่นชั่ง (รหัสชุด TMS-60-AW31)", "LoadcellCable", "invalid"],
    },
  );
  assert.deepEqual(selectedQuoteItems([], presets), { ids: [], pending: [] });
});

test("a verified complete kit includes its head exactly once in either selection order", () => {
  const presets = [
    { code: "Indicator-AW31", pricedId: "G107770", label: "AW31" },
    {
      code: "TMS-60-AW31",
      pricedId: "G106308",
      label: "TMS-60-AW31",
      includesCodes: ["Indicator-AW31"],
    },
    { code: "LoadcellCable", pricedId: "G107060", label: "LoadcellCable" },
  ];
  for (const selection of [
    ["Indicator-AW31", "TMS-60-AW31"],
    ["TMS-60-AW31", "Indicator-AW31"],
  ]) {
    assert.deepEqual(selectedQuoteItems([...selection, "LoadcellCable"], presets), {
      ids: ["G106308", "G107060"],
      pending: [],
    });
  }
  assert.deepEqual(selectedQuoteItems(["Indicator-AW31"], presets), {
    ids: ["G107770"],
    pending: [],
  });
  assert.deepEqual(quotationTotals(10000 * 2), { net: 20000, vat: 1400, gross: 21400 });
});

test("Warehouse SKU, unit and net price are preserved to the satang", () => {
  const item = {
    warehouseSku: "001",
    name: "สินค้า",
    warehouseUnit: "ชุด",
    warehouseNetUnitSatang: 107,
  };
  assert.deepEqual(pricedProducts([item]), [
    { id: "001", name: "สินค้า", unit: "ชุด", unitSatang: 107 },
  ]);
  for (const warehouseNetUnitSatang of [NaN, Infinity, -1, 0, 0.001, null, undefined])
    assert.deepEqual(pricedProducts([{ ...item, warehouseNetUnitSatang }]), []);
});
test("VAT is added once to the document net, rounded to the nearest satang", () => {
  assert.deepEqual(quotationTotals(100000), { net: 100000, vat: 7000, gross: 107000 });
  assert.deepEqual(quotationTotals(25 * 2), { net: 50, vat: 4, gross: 54 });
  assert.equal(quotationTotals(Number.MAX_SAFE_INTEGER), null);
});
