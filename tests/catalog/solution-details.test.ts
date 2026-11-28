import assert from "node:assert/strict";
import test from "node:test";
import {
  getSolutionEvidence,
  solutionDetails,
} from "../../src/features/content/data/solution-details";
import { solutions } from "../../src/features/content/data/solutions";
import { getSolutionGuidance } from "../../src/features/content/data/solution-guidance";
import type { Product } from "../../src/features/catalog/types";

test("every Solutions card and both business systems have an internal destination", () => {
  assert.equal(solutions.length, 14);
  for (const path of [...solutions.map((item) => item.path), "/solutions/erp", "/mes"]) {
    const detail = solutionDetails[path];
    assert.ok(detail?.title && detail.links.length > 0, path);
    for (const { href } of detail.links) assert.match(href, /^\/[^/]/, path);
  }
});

test("the MES overview links to both dedicated workflow pages", () => {
  const overview = solutionDetails["/mes"];
  const workflows = [
    ["batch-control", "ควบคุมชุดการผลิต"],
    ["formula-control", "ควบคุมสูตรการผลิต"],
  ] as const;

  for (const [id, label] of workflows) {
    const href = `/mes/${id}`;
    assert.ok(
      overview.links.some((link) => link.href === href && link.label === label),
      href,
    );
    const workflow = overview.sections?.find((section) => section.id === id);
    assert.equal(workflow?.title, label);
    assert.ok(workflow.description, href);
  }
});

test("published legacy solutions retain practical guidance and their original source URL", () => {
  for (const { path, sourceUrl } of solutions) {
    const guidance = getSolutionGuidance(path);
    assert.ok(guidance?.summary && guidance.preparation, path);
    assert.equal(guidance.sourceUrl, sourceUrl);
    assert.equal(new URL(guidance.sourceUrl).hostname, "www.sunford.co");
  }
  assert.equal(getSolutionGuidance("/mes"), undefined);
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
  assert.deepEqual(getSolutionEvidence(solutionDetails["/solutions/erp"], products), []);
  assert.deepEqual(getSolutionEvidence(solutionDetails["/mes"], products), []);
});

test("retail price and label printing lists documented models with an external printer", () => {
  const solution = solutionDetails["/solutions/price-label-printing"];
  assert.equal(solution?.title, "ชั่งคำนวณราคาและพิมพ์ฉลากสินค้าหน้าร้าน");
  const models = [
    ["G106209", "TCS60JE62ZR"],
    ["G106407", "TCS-150-JE62ZR"],
    ["G108562", "TIS-150-JE62ZR"],
    ["TIS150JE62ZR", "TIS-150-JE62ZR"],
    ["G-SET19", "TCS-60-JE62ZR + 233B"],
  ];
  const products = models.map(([warehouseSku, name]) => ({ name, warehouseSku }) as Product);
  const evidence = getSolutionEvidence(solution, products);
  assert.deepEqual(
    evidence.map(({ product }) => product),
    products.slice(0, 3),
  );
  assert.ok(evidence.every(({ fact }) => fact.includes("เครื่องพิมพ์ภายนอก")));
});
