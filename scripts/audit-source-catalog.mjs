import { load } from "cheerio";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { flight, collectionGrid, walk } from "./lib/sunford-source.mjs";

const origin = "https://www.sunford.co";
const pages = JSON.parse(await readFile("src/features/content/data/pages.json", "utf8"));
const products = JSON.parse(await readFile("src/features/content/data/products.json", "utf8"));
const cache = "node_modules/.cache/sunford-import";
await mkdir(cache, { recursive: true });
await mkdir("output", { recursive: true });
const normalize = (path) => decodeURIComponent(new URL(path, origin).pathname).replace(/\/$/, "");
const paths = new Set(
  pages
    .filter((p) => p.kind === "collection" || /^\/(product|indicator)(\/|$)/i.test(p.path))
    .map((p) => p.path),
);
const xml = await (await fetch(`${origin}/sitemap.xml`)).text();
for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
  const path = normalize(match[1]);
  if (/^\/(collections|product|indicator)(\/|$)/i.test(path)) paths.add(path);
}
const records = [];
const targets = [...paths];
let cursor = 0;
async function getHtml(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(40000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  const digest = createHash("sha256").update(url).digest("hex").slice(0, 20);
  await writeFile(`${cache}/${digest}.html`, html);
  return html;
}
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (cursor < targets.length) {
      const path = targets[cursor++];
      try {
        const url = new URL(path, origin).href;
        const $ = load(await getHtml(url));
        const parsed = flight($);
        const grid = collectionGrid(parsed.records, parsed.resolve);
        const handles = new Set(grid.map((p) => p.handle));
        let pageParamKey = "page",
          maxPage = 1;
        walk(Object.values(parsed.records), (value) => {
          if (
            typeof value.pageParamKey === "string" &&
            Number.isInteger(value.maxPage) &&
            value.maxPage > maxPage
          ) {
            pageParamKey = value.pageParamKey;
            maxPage = value.maxPage;
          }
        });
        for (let page = 2; page <= maxPage; page++) {
          const more = flight(load(await getHtml(`${url}?${pageParamKey}=${page}`)));
          collectionGrid(more.records, more.resolve).forEach((p) => handles.add(p.handle));
        }
        const root = $(".dynamic__layout__component").children().last();
        root.find("script,style,header,footer,.sf-footer").remove();
        const text = root.text();
        if (!root.length || (text.includes("ไม่พบหน้านี้") && text.includes("อาจไม่มีอยู่จริง")))
          throw new Error("Source page unavailable");
        const prior = pages.find((p) => p.path === path);
        records.push({
          path,
          title:
            $("h1").first().text().trim() || $("h2").first().text().trim() || prior?.title || path,
          sourceHandles: [...handles],
          previousHandles: prior?.productHandles ?? [],
          missingHandles: [...handles].filter((h) => !prior?.productHandles.includes(h)),
          missingProducts: [...handles].filter((h) => !products.some((p) => p.sourceId === h)),
          emptyInSource: text.includes("ไม่มีสินค้าในคอลเลกชันนี้"),
          pagination: { maxPage, pageParamKey },
        });
      } catch (error) {
        records.push({ path, error: error.message });
      }
      if (records.length % 20 === 0)
        console.log(`Audited ${records.length}/${targets.length} category pages.`);
    }
  }),
);
records.sort((a, b) => a.path.localeCompare(b.path));
const report = { checkedAt: new Date().toISOString(), source: origin, records };
await writeFile("output/catalog-source-audit.json", JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      pages: records.length,
      incompletePages: records.filter((r) => r.missingHandles?.length).length,
      missingProducts: [...new Set(records.flatMap((r) => r.missingProducts ?? []))],
      unavailable: records.filter((r) => r.error).map(({ path, error }) => ({ path, error })),
      emptyCategories: records.filter((r) => r.emptyInSource).length,
    },
    null,
    2,
  ),
);
