import assert from "node:assert/strict";
import { test } from "node:test";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import { resolveManagedProduct } from "../../src/features/catalog/data/managed-products";
import { productPresentation } from "../../src/features/catalog/data/product-presentation";
import { productInputSchema } from "../../src/features/admin/validation";
import { categories } from "../../src/features/catalog/types";
import { findCatalogProduct } from "../../src/features/catalog/data/product-lookup";
import sourceProducts from "../../src/features/content/data/products.json";
import type { SourceProduct } from "../../src/features/content/types";
import { defaultHomeImages, homeImageSlots } from "../../src/features/home/data/image-slots";

test("homepage image defaults preserve the current artwork in five independent positions", () => {
  const products = getSnapshotProducts();
  const before = structuredClone(products);
  const defaults = defaultHomeImages(products, "/images/software.png");
  assert.equal(homeImageSlots.length, 5);
  assert.equal(new Set(homeImageSlots.map((slot) => slot.id)).size, 5);
  assert.equal(defaults.spotlight, "/images/products/rls1100.png");
  assert.equal(defaults.smart, products.find((p) => p.id === "rls1100")?.image);
  assert.equal(defaults.digital, products.find((p) => p.id === "feh5ks")?.image);
  assert.equal(defaults.software, "/images/software.png");
  assert.deepEqual(products, before);
});

test("all 150 existing products can be saved without changing their slugs or categories", () => {
  const snapshot = getSnapshotProducts();
  assert.equal(snapshot.length, 150);
  assert.equal(new Set(snapshot.map((p) => p.slug)).size, snapshot.length);
  for (const product of snapshot) {
    const result = productInputSchema.safeParse({
      ...product,
      badge: product.badge ?? "",
      published: true,
    });
    assert.ok(result.success, `${product.id}: ${JSON.stringify(result.error?.flatten())}`);
  }
  for (const category of categories.filter((c) => c.id !== "all")) {
    assert.ok(
      productInputSchema.safeParse({
        ...snapshot[0],
        category: category.id,
        badge: "",
        published: true,
      }).success,
    );
  }
});

test("legacy display is preserved until saved; explicit edits win while original metadata survives", () => {
  const snapshot = getSnapshotProducts()[0];
  const legacy = {
    ...snapshot,
    name: "Old database seed",
    image: "/images/products/old.png",
    catalogManaged: false,
    published: false,
  };
  const original = structuredClone(legacy);
  const before = resolveManagedProduct(legacy);
  assert.equal(before.name, snapshot.name);
  assert.equal(before.image, snapshot.image);
  assert.equal(before.published, false);
  const edited = resolveManagedProduct({
    ...legacy,
    name: "Admin edit",
    image: "/images/products/new.png",
    catalogManaged: true,
  });
  assert.equal(edited.name, "Admin edit");
  assert.equal(edited.imageOverridden, true);
  assert.equal(edited.sourceId, snapshot.sourceId);
  assert.equal(edited.sourceUrl, snapshot.sourceUrl);
  assert.equal(edited.price, snapshot.price);
  assert.deepEqual(legacy, original);
});

test("case-distinct original URLs stay separate and hidden records never fall back to a different product", () => {
  const snapshot = getSnapshotProducts();
  assert.equal(findCatalogProduct(snapshot, "rls1100")?.id, "rls1100");
  assert.equal(findCatalogProduct(snapshot, "RLS1100")?.id, "sunford-RLS1100");
  const hidden = snapshot.filter((p) => p.id !== "rls1100");
  assert.equal(findCatalogProduct(hidden, "rls1100"), undefined);
  assert.equal(findCatalogProduct(hidden, "10639"), undefined);
  const renamed = snapshot.map((p) => (p.id === "wps10ks" ? { ...p, slug: "new-wps" } : p));
  assert.equal(findCatalogProduct(renamed, "wps10ks")?.slug, "new-wps");
  assert.equal(findCatalogProduct(renamed, "10669")?.slug, "new-wps");
});

test("details retain the original gallery and rich specifications; edited fields appear immediately", () => {
  const snapshot = getSnapshotProducts().find((p) => p.id === "wps10ks")!;
  const source = (sourceProducts as SourceProduct[]).find((p) => p.sourceId === snapshot.sourceId)!;
  const before = productPresentation(snapshot, snapshot, source);
  assert.deepEqual(before.images, source.images);
  assert.equal(before.descriptionHtml, source.descriptionHtml);
  assert.deepEqual(before.specifications, source.specifications);
  const after = productPresentation(
    {
      ...snapshot,
      image: "/images/products/new.png",
      description: "New description",
      capacity: "25 kg",
    },
    snapshot,
    source,
  );
  assert.equal(after.images[0], "/images/products/new.png");
  assert.ok(source.images.every((image) => after.images.includes(image)));
  assert.equal(after.descriptionHtml, undefined);
  assert.ok(after.specifications.some((spec) => spec.value === "25 kg"));
  assert.equal(source.descriptionHtml, before.descriptionHtml);
});
