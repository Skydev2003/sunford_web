import assert from "node:assert/strict";
import { test } from "node:test";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import sources from "../../src/features/content/data/products.json";
import { productPresentation } from "../../src/features/catalog/data/product-presentation";
import { productSummary } from "../../src/features/catalog/data/product-summary";

function summaryFor(sourceId: string) {
  const product = getSnapshotProducts().find((product) => product.sourceId === sourceId)!;
  const source = sources.find((source) => source.sourceId === sourceId)!;
  return productSummary(product, productPresentation(product, product, source), source.detailsHtml);
}

test("RLS1100 preview uses its own verified features and one actual capacity, not reference specifications", () => {
  const summary = summaryFor("10639");
  assert.match(summary.highlights.join(" "), /LCD/);
  assert.match(summary.highlights.join(" "), /2 ด้าน/);
  assert.match(summary.highlights.join(" "), /10,000/);
  assert.match(summary.highlights.join(" "), /บาร์โค้ด/);
  assert.doesNotMatch(summary.highlights.join(" "), /IP68|99 PLU|DIGI/);
  assert.deepEqual(summary.weighing, { capacity: "30 กิโลกรัม", readability: "5/10 กรัม" });
});

test("different models retain their own capacities and non-weighing items never get a fabricated table", () => {
  assert.deepEqual(summaryFor("10637").weighing, {
    capacity: "5 กิโลกรัม",
    readability: "1 กรัม",
  });
  assert.equal(summaryFor("10801").weighing, null);
  assert.equal(summaryFor("10792").weighing, null);
  assert.equal(summaryFor("10757").weighing, null);
});

test("every product preview is short, omits unknown values, and leaves source content intact", () => {
  for (const product of getSnapshotProducts()) {
    const source = sources.find((source) => source.sourceId === product.sourceId)!;
    const before = JSON.stringify({ product, source });
    const summary = productSummary(
      product,
      productPresentation(product, product, source),
      source.detailsHtml,
    );
    assert.ok(summary.highlights.length <= 6, product.name);
    assert.equal(new Set(summary.highlights).size, summary.highlights.length, product.name);
    for (const text of summary.highlights) {
      assert.ok(text.length <= 160, `${product.name}: ${text}`);
      assert.doesNotMatch(text, /^[-–—]+$|^(ไม่มี|ไม่ระบุ)$/);
    }
    assert.equal(JSON.stringify({ product, source }), before);
  }
});
