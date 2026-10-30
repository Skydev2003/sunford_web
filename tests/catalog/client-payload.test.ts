import assert from "node:assert/strict";
import { test } from "node:test";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import {
  clientProductData,
  productCardData,
} from "../../src/features/catalog/data/client-products";
import { heroSlideData } from "../../src/features/home/data/hero-slides";
import { defaultHero } from "../../src/features/cms/data/settings";

const products = getSnapshotProducts();

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

test("server Hero slides keep configured order, assets and destinations without the catalogue", () => {
  const slides = heroSlideData(products, defaultHero.slides);
  assert.deepEqual(
    slides.map((s) => s.name),
    ["ACS-30-JC21", "FEH5KS", "WPS10KS"],
  );
  assert.deepEqual(
    slides.map((s) => s.model),
    ["/models/acs30-jc21.glb", "/models/feh5ks.glb", "/models/wps10ks.glb"],
  );
  assert.equal(slides[0].image, "/images/products/acs30-jc21-cutout.png");
  assert.equal(slides[0].ribbonImage, "/images/hero/acs30-jc21-carousel-cutout.png");
  assert.equal(slides[0].href, "/products/acs30-jc21");
  assert.ok(slides.every((slide) => slide.highlights?.length === 3));
  const reversed = heroSlideData(products, [...defaultHero.slides].reverse());
  assert.match(reversed[0].highlights![0], /IP67/);
  assert.equal(reversed.at(-1)!.highlights![0], "ชั่งพร้อมคิดราคา สูงสุด 30 กก.");
  const hidden = heroSlideData(
    products.filter((p) => p.id !== "acs30-jc21"),
    defaultHero.slides,
  );
  assert.deepEqual(
    hidden.map((s) => s.id),
    ["1:feh5ks", "2:wps10ks"],
  );
  assert.ok(JSON.stringify(slides).length < JSON.stringify(products).length / 20);
});

test("Hero respects image overrides, custom slides and missing product fallbacks", () => {
  const overridden = products.map((p) =>
    p.id === "acs30-jc21" ? { ...p, imageOverridden: true, image: "/custom.png" } : p,
  );
  const first = heroSlideData(overridden, defaultHero.slides)[0];
  assert.equal(first.image, "/custom.png");
  assert.equal(first.ribbonImage, "/custom.png");
  const custom = heroSlideData(products, [
    {
      productId: "acs30-jc21",
      title: "Custom",
      description: "Copy",
      image: "/campaign.png",
      href: "/contact-us",
    },
  ])[0];
  assert.deepEqual(
    [custom.name, custom.description, custom.image, custom.ribbonImage, custom.href, custom.model],
    ["Custom", "Copy", "/campaign.png", "/campaign.png", "/contact-us", undefined],
  );
  const fallback = heroSlideData(
    [],
    [{ productId: "", title: "", description: "", image: "", href: "" }],
  )[0];
  assert.equal(fallback.name, "SUNFORD");
  assert.equal(fallback.href, "/products");
  assert.equal(fallback.highlights, undefined);
  assert.equal(heroSlideData([], defaultHero.slides).length, 0);
});
