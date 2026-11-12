import assert from "node:assert/strict";
import test from "node:test";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import { warehouseCatalog } from "../../src/features/catalog/data/warehouse-products";
import { attachWarehouseCardFacts } from "../../src/features/catalog/data/warehouse-card-data";
import { warehouseDetailProduct } from "../../src/features/catalog/data/warehouse-detail-data";
import { productPresentation } from "../../src/features/catalog/data/product-presentation";

test("Warehouse detail projection omits all editorial fallback fields and absent specs", () => {
  const [product] = warehouseCatalog(
    [
      {
        sku: "G106308",
        product_name: "SUNFORD TMS-60-AW31",
        unit: "เครื่อง",
        sale_price: 0,
        image_url: null,
        description: "",
      },
    ],
    getSnapshotProducts(),
  );
  assert.ok(product.image);
  assert.ok(product.description);
  const detail = warehouseDetailProduct(product);
  for (const field of [
    "image",
    "description",
    "subtitle",
    "capacity",
    "readability",
    "connection",
  ] as const)
    assert.equal(detail[field], "");
  assert.equal(detail.price, null);
  assert.equal(detail.media, undefined);
  assert.equal(detail.fallbackImage, undefined);
  assert.equal(detail.sourceId, undefined);
  assert.deepEqual(productPresentation(product).images, []);
  assert.deepEqual(productPresentation(product).specifications, []);
});

test("Warehouse details preserve verified fact types, zero numeric values and text safely", () => {
  const [product] = warehouseCatalog(
    [
      {
        sku: "G106308",
        product_name: "SUNFORD TMS-60-AW31",
        unit: "เครื่อง",
        sale_price: 100,
        image_url: "/photo",
        description: "Warehouse-only description",
      },
    ],
    getSnapshotProducts(),
  );
  const fact = {
    sku: "G106308",
    title: "พิกัดชั่งต่ำสุด",
    value_text: null,
    value_number: "0",
    unit: "g",
  };
  const [enriched] = attachWarehouseCardFacts(
    [product],
    [
      fact,
      { ...fact, title: "หน่วยชั่งที่รองรับ", value_number: null, value_options: ["kg", "lb"] },
      {
        ...fact,
        title: "จุดเด่นสินค้า",
        value_number: null,
        value_text: "<script>unsafe</script>",
      },
      { ...fact, title: "วัสดุ", value_number: null, value_text: "one" },
      { ...fact, title: "วัสดุ", value_number: null, value_text: "two" },
    ],
  );
  const detail = warehouseDetailProduct(enriched);
  assert.equal(detail.description, "Warehouse-only description");
  assert.equal(detail.price, 107);
  const view = productPresentation(detail);
  assert.equal(view.images.length, 1);
  assert.deepEqual(view.specifications, [
    { label: "พิกัดชั่งต่ำสุด", value: "0 g" },
    { label: "หน่วยชั่งที่รองรับ", value: "kg, lb" },
    { label: "จุดเด่นสินค้า", value: "<script>unsafe</script>" },
  ]);
  assert.equal(view.descriptionHtml, undefined);
});
