import assert from "node:assert/strict";
import test from "node:test";
import { warehouseCatalog } from "../../src/features/catalog/data/warehouse-products";
import { attachWarehouseCardFacts } from "../../src/features/catalog/data/warehouse-card-data";
import {
  clientProductData,
  productCardData,
} from "../../src/features/catalog/data/client-products";
import { getCatalogDecisionFacts } from "../../src/features/catalog/data/catalog-decision-facts";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";

test("Warehouse cards exclude conflicting editorial fields and keep absent Warehouse fields empty", () => {
  const editorial = getSnapshotProducts().map((product) => ({
    ...product,
    image: "/old-photo.png",
    subtitle: "OLD-SUBTITLE",
    description: "OLD-DESCRIPTION",
    capacity: "OLD-CAPACITY",
    readability: "OLD-READABILITY",
    connection: "OLD-CONNECTION",
    badge: "OLD-BADGE",
  }));
  const [product] = warehouseCatalog(
    [
      {
        sku: "G106308",
        product_name: "SUNFORD เครื่องชั่ง TMS-60-AW31",
        unit: "เครื่อง",
        sale_price: 0,
        image_url: null,
        description: "Warehouse description",
      },
    ],
    editorial,
  );
  assert.equal(product.subtitle, "OLD-SUBTITLE");
  const client = clientProductData(product);
  assert.equal(client.description, "Warehouse description");
  assert.equal(client.name, "TMS-60-AW31");
  assert.equal(client.price, null);
  for (const field of ["image", "subtitle", "capacity", "readability", "connection"] as const)
    assert.equal(client[field], "");
  assert.equal(client.fallbackImage, undefined);
  assert.equal(client.badge, null);
  assert.doesNotMatch(JSON.stringify(productCardData(product)), /OLD-|old-photo/);
  assert.deepEqual(getCatalogDecisionFacts(client), []);

  const fact = {
    sku: "G106308",
    title: "พิกัดชั่งสูงสุด",
    value_text: null,
    value_number: "60000",
    unit: "g",
  };
  const [enriched] = attachWarehouseCardFacts([product], [fact]);
  assert.equal(clientProductData(enriched).capacity, "60000 g");
  assert.equal(enriched.capacity, "OLD-CAPACITY");
  const [conflicting] = attachWarehouseCardFacts(
    [product],
    [fact, { ...fact, value_number: "150000" }],
  );
  assert.equal(clientProductData(conflicting).capacity, "");
});
