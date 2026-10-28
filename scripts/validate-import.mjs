import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { load } from "cheerio";
import path from "node:path";

const folder = "src/features/content/data";
const [pages, products, report] = await Promise.all(
  ["pages", "products", "import-report"].map(async (name) =>
    JSON.parse(await readFile(`${folder}/${name}.json`, "utf8")),
  ),
);
assert.equal(pages.length, report.pages);
assert.equal(products.length, report.products);
assert(products.length >= 150, "Expected every readable product page to be imported");
assert.equal(
  new Set(products.map((product) => product.sourceId)).size,
  products.length,
  "Product source IDs must be unique",
);
assert.equal(
  new Set(pages.map((page) => page.path)).size,
  pages.length,
  "Source page paths must be unique",
);
const media = new Set();
let htmlCount = 0;
let videoCount = 0;
for (const entry of [...pages, ...products]) {
  assert(entry.sourceUrl.startsWith("https://www.sunford.co/"), "Unexpected content source");
  for (const image of entry.images ?? []) media.add(image);
  if (entry.softwareCatalog) {
    const { categories, items } = entry.softwareCatalog;
    const categoryIds = new Set(categories.map((category) => category.id));
    assert(categoryIds.has("all"), "Software catalogue requires an all category");
    assert.equal(categoryIds.size, categories.length, "Duplicate software categories");
    assert.equal(new Set(items.map((item) => item.path)).size, items.length);
    for (const item of items) {
      assert(
        item.title && item.description && item.image,
        `Incomplete software card: ${item.path}`,
      );
      assert(categoryIds.has(item.category), `Unknown software category: ${item.category}`);
      assert(
        pages.some((page) => page.path === item.path),
        `Missing software page: ${item.path}`,
      );
      media.add(item.image);
    }
  }
  for (const video of entry.videos ?? []) {
    assert(/^[A-Za-z0-9_-]{11}$/.test(video.id));
    if (video.image) media.add(video.image);
    videoCount++;
  }
  for (const key of ["html", "descriptionHtml", "detailsHtml", "specificationHtml"])
    if (entry[key]) {
      const $ = load(entry[key]);
      htmlCount++;
      assert.equal(
        $("script,style,object,embed").length,
        0,
        `Executable source markup in ${entry.path}`,
      );
      $("*").each((_, element) => {
        for (const [name, value] of Object.entries(element.attribs ?? {})) {
          assert(!/^on/i.test(name), `Inline event handler in ${entry.path}`);
          assert(!/^javascript:/i.test(value), `Unsafe URL in ${entry.path}`);
        }
      });
      $("img[src]").each((_, element) => media.add($(element).attr("src")));
    }
}
for (const image of media) {
  assert(image.startsWith("/images/"), `Image not stored locally: ${image}`);
  const target = path.resolve("public", `.${image}`);
  assert(target.startsWith(path.resolve("public") + path.sep), "Image escaped the public folder");
  await access(target);
}
console.log(
  `Validated ${pages.length} pages, ${products.length} product records, ${htmlCount} sanitized content blocks, ${media.size} local images and ${videoCount} video references.`,
);
console.log(
  `${report.failedPages.length} unavailable source URLs and ${report.missingImages.length} unavailable images are recorded in import-report.json.`,
);
