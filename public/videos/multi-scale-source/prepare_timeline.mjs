import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { bakeTimeline, sampleTimeline, projectedBounds } from "./sequence-engine.mjs";
const root = new URL("../../../", import.meta.url),
  out = new URL("outputs/sunford-multi-scale/", root);
const config = JSON.parse(readFileSync(new URL("./products.json", import.meta.url))),
  timeline = bakeTimeline(config),
  checks = [];
mkdirSync(out, { recursive: true });
writeFileSync(new URL("products.json", out), JSON.stringify(config, null, 2));
for (const product of config.products) {
  copyFileSync(
    new URL(`public/models/${product.src.replace(/^\.\//, "")}`, root),
    new URL(product.src, out),
  );
}
for (const aspect of [16 / 9, 20 / 9, 1, 9 / 16]) {
  let margin = 1;
  for (let i = 0; i < timeline.duration * 120; i++) {
    const p = sampleTimeline(config, timeline, i / 120, aspect),
      b = projectedBounds(config, p, aspect);
    margin = Math.min(margin, b[0], 1 - b[1], b[2], 1 - b[3]);
    if (margin < config.safe_margin - 1e-7) throw Error("Product is cropped");
    if (Math.abs(p.weights.reduce((a, b) => a + b, 0) - 1) > 1e-9)
      throw Error("Invalid transition weights");
  }
  checks.push({ aspect, samples: timeline.duration * 120, minimum_margin: margin });
}
// Extensibility: one and three-product playlists must retain valid timing and weights.
for (const n of [1, 3]) {
  const c = {
    ...config,
    products: Array.from({ length: n }, (_, i) => ({ ...config.products[i % 2], id: "test-" + i })),
  };
  const t = bakeTimeline(c);
  for (let i = 0; i <= t.duration * 60; i++) {
    const p = sampleTimeline(c, t, i / 60);
    if (Math.abs(p.weights.reduce((a, b) => a + b, 0) - 1) > 1e-9)
      throw Error("Playlist extension failed");
  }
}
writeFileSync(new URL("camera-timeline.json", out), JSON.stringify(timeline));
writeFileSync(
  new URL("animation-checks.json", out),
  JSON.stringify(
    {
      passed: true,
      duration: timeline.duration,
      products: config.products.map((p) => p.id),
      frames: timeline.frames.length - 1,
      framing: checks,
      one_and_three_product_playlists: true,
    },
    null,
    2,
  ),
);
console.log("Timeline prepared", checks);
