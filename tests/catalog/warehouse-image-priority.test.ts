import test from "node:test";
import assert from "node:assert/strict";
import {
  warehouseCatalog,
  type WarehouseItem,
} from "../../src/features/catalog/data/warehouse-products";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import { productPresentation } from "../../src/features/catalog/data/product-presentation";

const cms = {
  ...getSnapshotProducts().find((p) => p.id === "sunford-10630")!,
  image: "/images/cms.webp",
};
const item: WarehouseItem = {
  sku: "G106308",
  product_name: "สินค้า Warehouse",
  unit: "เครื่อง",
  sale_price: 100,
  image_url: "/api/store/products/image?master_item_id=99&v=2026-11-11T01%3A00%3A00Z",
};

test("Warehouse photo overrides CMS with a versioned URL and keeps CMS as fallback", () => {
  const product = warehouseCatalog([item], [cms])[0];
  assert.match(product.image, /^\/api\/products\/G106308\/image\?v=/);
  assert.equal(
    new URL(product.image, "https://test.invalid").searchParams.get("v"),
    "2026-11-11T01:00:00Z",
  );
  assert.equal(product.fallbackImage, cms.image);
  assert.equal(product.price, 100);
});

test("source-version changes automatically change local and proxy cache keys without an export command", () => {
  const changed = { ...item, image_url: item.image_url!.replace("01%3A", "02%3A") };
  for (const saved of [undefined, () => "/images/warehouse-cache/cached.webp"]) {
    const a = warehouseCatalog([item], [cms], saved)[0];
    const b = warehouseCatalog([changed], [cms], saved)[0];
    assert.notEqual(a.image, b.image);
    assert.match(a.image, /[?&]v=/);
    assert.equal(a.name, b.name);
  }
});

test("missing Warehouse image uses CMS, while Warehouse photos/prices work without CMS", () => {
  assert.equal(warehouseCatalog([{ ...item, image_url: null }], [cms])[0].image, cms.image);
  const product = warehouseCatalog([item], [])[0];
  assert.match(product.image, /^\/api\/products\//);
  assert.equal(product.fallbackImage, undefined);
  assert.equal(product.warehouseNetUnitSatang, 10000);
});

test("Warehouse details omit editorial galleries and rich content", () => {
  const product = {
    ...warehouseCatalog([item], [cms])[0],
    image: "/api/products/G106308/image?v=primary",
  };
  const gallery = productPresentation({
    ...product,
    media: {
      price: 100,
      gallery: [{ image: cms.image }],
      descriptionHtml: "<p>เนื้อหาเดิม</p>",
      detailsHtml: "",
      specifications: [],
      videos: [],
    },
  });
  assert.deepEqual(
    gallery.images,
    product.warehouseCard?.image ? [product.warehouseCard.image] : [],
  );
  assert(!gallery.images.includes(cms.image));
  assert.equal(gallery.descriptionHtml, undefined);
});
