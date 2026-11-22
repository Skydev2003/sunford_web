import assert from "node:assert/strict";
import test from "node:test";
import {
  getSolutionEvidence,
  solutionDetails,
} from "../../src/features/content/data/solution-details";
import { solutions } from "../../src/features/content/data/solutions";
import type { Product } from "../../src/features/catalog/types";

test("every Solutions card and both business systems have an internal destination", () => {
  assert.equal(solutions.length, 14);
  for (const path of [...solutions.map((item) => item.path), "/solution/erp", "/solution/mes"]) {
    const detail = solutionDetails[path];
    assert.ok(detail?.title && detail.links.length > 0, path);
    for (const { href } of detail.links) assert.match(href, /^\/[^/]/, path);
  }
});

test("solution evidence uses published products with an explicit connection fact", () => {
  const product = (id: string, value: string, sku?: string) =>
    ({
      id,
      warehouseSku: sku,
      warehouseCategoryId: "indicators",
      warehouseSpecifications: [{ label: "เงื่อนไขการเชื่อมต่อ", value }],
    }) as Product;
  const wired = product("wired", "ส่งข้อมูลผ่านพอร์ท RS232", "G1");
  const optional = product("optional", "พอร์ท RS232 เป็นตัวเลือก", "G2");
  const noSku = product("legacy", "ส่งข้อมูลผ่านพอร์ท RS232");
  const wireless = product("wireless", "ส่งข้อมูลผ่าน Bluetooth", "G3");
  const products = [wired, optional, noSku, wireless];
  assert.deepEqual(getSolutionEvidence(solutionDetails["/solutions/rs232"], products), [
    { product: wired, fact: "ส่งข้อมูลผ่านพอร์ท RS232" },
  ]);
  assert.deepEqual(getSolutionEvidence(solutionDetails["/solutions/wireless"], products), [
    { product: wireless, fact: "ส่งข้อมูลผ่าน Bluetooth" },
  ]);
  assert.deepEqual(getSolutionEvidence(solutionDetails["/solution/erp"], products), []);
  assert.deepEqual(getSolutionEvidence(solutionDetails["/solution/mes"], products), []);
});
