import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getProductUsageVideos,
  productVideoCatalog,
} from "../../src/features/catalog/data/product-usage-videos";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";

test("videos match exact source models and their duplicate catalog records", () => {
  const products = getSnapshotProducts();
  const videos = (sourceId: string) =>
    getProductUsageVideos(products.find((p) => p.sourceId === sourceId)!);
  assert.ok(videos("10609").some((v) => v.id === "da7xfrccHfI"));
  assert.deepEqual(videos("10609"), videos("ACS-30-JC21"));
  assert.ok(videos("10637").some((v) => v.id === "idpv9oLyQ4w"));
  assert.deepEqual(videos("10637"), videos("FEH5KS"));
  assert.ok(videos("10669").some((v) => v.id === "cRkWLAhAVRU"));
  assert.ok(!videos("10621").some((v) => v.id === "da7xfrccHfI"));
  assert.ok(!videos("10779").some((v) => v.id === "KOTeWhXegT4"));
  assert.deepEqual(videos("10792"), []);
  assert.deepEqual(
    getProductUsageVideos({ id: "unmatched", sourceId: "RLS1000", slug: "RLS1000" }),
    [],
  );
});

test("every curated video belongs to the supplied channel and references existing products", () => {
  const products = getSnapshotProducts();
  const sourceIds = new Set(products.map((p) => p.sourceId));
  assert.equal(productVideoCatalog.channel.id, "UCAr4sj68DRFTnkcOaQ7aclg");
  assert.equal(
    new Set(productVideoCatalog.videos.map((v) => v.id)).size,
    productVideoCatalog.videos.length,
  );
  for (const video of productVideoCatalog.videos) {
    assert.match(video.id, /^[\w-]{11}$/);
    assert.ok(video.title.trim());
    assert.equal(video.url, `https://www.youtube.com/watch?v=${video.id}`);
    assert.equal(video.image, `/images/product-videos/${video.id}.webp`);
    for (const sourceId of video.sourceIds) assert.ok(sourceIds.has(sourceId), sourceId);
  }
  for (const product of products) {
    const videos = getProductUsageVideos(product);
    assert.equal(new Set(videos.map((v) => v.id)).size, videos.length, product.name);
  }
});
