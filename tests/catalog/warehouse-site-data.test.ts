import test from "node:test";
import assert from "node:assert/strict";
import { warehouseSiteProducts } from "../../src/features/catalog/data/warehouse-site-data";
import { warehouseCatalog } from "../../src/features/catalog/data/warehouse-products";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import { getWeighingOptions } from "../../src/features/content/data/weighing-options";
import { warehouseContentPage } from "../../src/features/content/data/warehouse-content";
import type { SourcePage } from "../../src/features/content/types";

test("sitewide public products exclude every editorial fallback while retaining URL identity", () => {
  const [raw] = warehouseCatalog(
    [
      {
        sku: "G106308",
        product_name: "SUNFORD เครื่องชั่ง TMS-60-AW31",
        unit: "เครื่อง",
        sale_price: 0,
        image_url: null,
        description: "",
        group_name: "เครื่องชั่ง",
      },
    ],
    getSnapshotProducts(),
  );
  const [product] = warehouseSiteProducts([raw]);
  assert.equal(product.id, raw.id);
  assert.equal(product.slug, raw.slug);
  for (const key of [
    "image",
    "description",
    "subtitle",
    "capacity",
    "readability",
    "connection",
  ] as const)
    assert.equal(product[key], "");
  assert.equal(product.badge, null);
  assert.equal(product.featured, false);
  assert.equal(product.fallbackImage, undefined);
  assert.equal(product.price, null);
  assert.equal(product.warehouseCategoryId, "scales");
  const [head] = warehouseSiteProducts([
    { ...raw, warehouseSku: "HEAD", warehouseName: "Indicator AW31", name: "AW31" },
  ]);
  assert.equal(
    getWeighingOptions([head, product]).find((o) => o.sku === "HEAD")?.compatibleCodes?.length,
    0,
  );
  const [kit] = warehouseSiteProducts(
    [raw],
    [{ root_sku: raw.warehouseSku!, sku: "HEAD", quantity: "1" }],
  );
  const options = getWeighingOptions([head, kit]);
  assert.equal(options.find((o) => o.sku === kit.warehouseSku)?.includesHead, true);
  assert.deepEqual(options.find((o) => o.sku === "HEAD")?.compatibleCodes, [kit.warehouseSku]);
});

test("legacy product documents keep structural tags but clear prose and media without Warehouse content", () => {
  const source: SourcePage = {
    path: "/solutions/rs232",
    sourceUrl: "/solutions/rs232",
    title: "RS232",
    kind: "page",
    html: '<section class="layout"><h2>OLD PRODUCT</h2><img src="/old.jpg" width="400" height="300"><p>OLD SPEC</p></section>',
    text: "OLD SPEC",
    images: ["/old.jpg"],
    productHandles: [],
    collectionIds: [],
  };
  const document = warehouseContentPage(source, []);
  assert.equal(document.text, "");
  assert.deepEqual(document.images, []);
  assert.match(document.html, /class="layout"/);
  assert.match(document.html, /width="400" height="300"/);
  assert.doesNotMatch(document.html, /OLD|old.jpg/);
});
