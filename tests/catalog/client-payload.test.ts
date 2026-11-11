import assert from "node:assert/strict";
import { test } from "node:test";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import {
  clientProductData,
  productCardData,
} from "../../src/features/catalog/data/client-products";
import { heroSlideData } from "../../src/features/home/data/hero-slides";

const products = getSnapshotProducts();

test("client catalogue retains source-derived topics without rich product data", () => {
  const product = { ...products[0], topics: ["counting", "connected"] };
  const client = clientProductData(product);
  assert.deepEqual(client.topics, ["counting", "connected"]);
  assert.equal(Object.hasOwn(client, "media"), false);
  assert.equal(Object.hasOwn(client, "sourceId"), false);
  assert.equal(Object.hasOwn(client, "sortOrder"), false);
});

test("client projections retain full search matches, catalogue order and comparison values", () => {
  const search = (p: { name: string; subtitle: string; description: string }, q: string) =>
    `${p.name} ${p.subtitle} ${p.description}`.toLowerCase().includes(q.toLowerCase().trim());
  const queries = [
    "",
    " WPS ",
    "NO-SUCH-PRODUCT",
    ...products.flatMap((p) => [p.name, p.description.slice(-30)]),
  ];
  const projected = products.map(clientProductData);
  assert.deepEqual(
    projected.map((p) => p.id),
    products.map((p) => p.id),
  );
  for (const q of queries) {
    assert.deepEqual(
      projected.filter((p) => search(p, q)).map((p) => p.id),
      products.filter((p) => search(p, q)).map((p) => p.id),
    );
  }
  for (const product of products) {
    const projected = clientProductData(product);
    for (const field of ["subtitle", "capacity", "readability", "connection"] as const)
      assert.equal(projected[field], product[field]);
  }
});

test("projections exclude rich content and internal fields while retaining storefront overrides", () => {
  const product = {
    ...products[0],
    price: 1234,
    imageOverridden: true,
    image: "/images/custom.png",
    internalField: "internal-only-marker",
    media: {
      price: 1234,
      gallery: [{ image: "gallery-only-marker" }],
      descriptionHtml: "rich-only-marker",
      detailsHtml: "details-only-marker",
      specifications: [],
      videos: [],
    },
  };
  for (const project of [productCardData, clientProductData]) {
    const json = JSON.stringify(project(product));
    for (const field of ["media", "sourceUrl", "sourceId", "sortOrder", "internalField"])
      assert.equal(Object.hasOwn(project(product), field), false);
    assert.doesNotMatch(json, /(?:internal|gallery|rich|details)-only-marker/);
  }
  const storefront = clientProductData(product);
  assert.equal(storefront.price, 1234);
  assert.equal(storefront.imageOverridden, true);
  assert.equal(storefront.image, product.image);
});

test("homepage Hero preserves configured campaign content as the owner exception", () => {
  const product = { ...products[0], id: "acs30-jc21" };
  const [slide] = heroSlideData(
    [product],
    [{ productId: product.id, title: "", description: "", image: "", href: "" }],
  );
  assert.equal(slide.image, "/images/products/acs30-jc21-cutout.png");
  assert.equal(slide.model, "/models/acs30-jc21.glb");
  assert.equal(slide.descriptionOverride, undefined);
  const [custom] = heroSlideData(
    [product],
    [
      {
        productId: product.id,
        title: "Custom",
        description: "Campaign",
        image: "/campaign.png",
        href: "/contact-us",
      },
    ],
  );
  assert.equal(custom.descriptionOverride, "Campaign");
  assert.equal(custom.image, "/campaign.png");
  assert.equal(custom.href, "/contact-us");
});
