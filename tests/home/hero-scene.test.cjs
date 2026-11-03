/* eslint-disable @typescript-eslint/no-require-imports -- Node SSR tests load TSX with a scoped CSS hook. */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
require("tsx/cjs");
const cssLoader = require.extensions[".css"];
require.extensions[".css"] = (module) => {
  module.exports = new Proxy(
    {},
    { get: (_target, key) => (key === "__esModule" ? false : String(key)) },
  );
};
const { HeroScene } = require("../../src/features/home/components/hero-scene.tsx");
if (cssLoader) require.extensions[".css"] = cssLoader;
else delete require.extensions[".css"];
const { heroSlideData } = require("../../src/features/home/data/hero-slides.ts");
const render = (product) =>
  renderToStaticMarkup(React.createElement(HeroScene, { opening: false, product }));

test("empty configuration keeps one H1, consultation and a catalogue recovery link in HTML", () => {
  const html = render();
  assert.equal((html.match(/<h1 /g) || []).length, 1);
  assert.match(html, /เครื่องชั่ง SUNFORD/);
  assert.match(html, /สำหรับธุรกิจของคุณ/);
  assert.match(html, /href="\/contact-us"/);
  assert.match(html, /href="\/products"/);
  assert.doesNotMatch(html, /<img|\.glb|canvas|data-hero-information|data-hero-detail-card/);
});

test("custom CMS image, product link and explicit description survive resolution and rendering", () => {
  const [slide] = heroSlideData(
    [],
    [
      {
        productId: "",
        title: "Special Scale",
        image: "/custom-scale.webp",
        href: "/products/special",
        description: "ข้อความจาก CMS",
      },
    ],
  );
  const html = render(slide);
  assert.match(html, /src="\/custom-scale.webp"/);
  assert.match(html, /href="\/products\/special"/);
  assert.match(html, /ข้อความจาก CMS/);
  assert.doesNotMatch(html, /IP67|30 กก\.|<li\b|ConSentinel|112\+|55K/);
});

test("default product uses one compact discoverable image and the company introduction", () => {
  const html = render({
    name: "ACS-30-JC21",
    image: "/images/products/acs30-jc21-cutout.png",
    href: "/products/acs30-jc21",
    description: "A product subtitle",
  });
  assert.match(html, /src="\/images\/hero\/acs30-jc21-front.webp"/);
  assert.match(html, /width="800" height="521"/);
  assert.match(html, /fetchPriority="high"/);
  assert.match(html, /เครื่องชั่งดิจิทัลและโซลูชันธุรกิจ พร้อมบริการหลังการขาย/);
  assert.doesNotMatch(html, /loading="lazy"|data:image|A product subtitle/);
});
