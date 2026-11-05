import { writeFile, mkdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import sanitizeHtml from "sanitize-html";
import postcss from "postcss";
import { solutionSources } from "./solution-sources.mjs";
import { publicPath } from "../src/features/content/data/public-paths.mjs";
import assert from "node:assert/strict";
import path from "node:path";

const argument = (name) => {
  const index = process.argv.indexOf(name);
  if (index < 0) return null;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a directory`);
  return path.resolve(value);
};
const proseIds = new Set(["lot-serial", "pos", "windows", "driver"]);

if (argument("--apply-staged")) {
  const stage = argument("--apply-staged");
  const folder = "src/features/content/data";
  const old = JSON.parse(await readFile(`${folder}/solutions.json`, "utf8"));
  const additions = JSON.parse(await readFile(`${stage}/solutions.json`, "utf8"));
  assert.equal(additions.length, proseIds.size);
  assert.deepEqual(new Set(additions.map((row) => row.id)), proseIds);
  for (const row of additions) {
    assert(row.text.length > 300 && row.path === `/solutions/${row.id}`);
    const $ = load(row.html);
    assert.equal($("script,style,link,form,input,object,embed,[style]").length, 0);
    $("*").each((_, node) => {
      for (const [name, value] of Object.entries(node.attribs ?? {})) {
        assert(!/^on/i.test(name));
        assert(!/^\s*(javascript|vbscript|data):/i.test(value));
      }
    });
  }
  const merged = old.map((row) => additions.find((item) => item.id === row.id) ?? row);
  merged.push(...additions.filter((row) => !old.some((item) => item.id === row.id)));
  const report = JSON.parse(await readFile(`${folder}/solutions-import-report.json`, "utf8"));
  const refresh = JSON.parse(await readFile(`${stage}/solutions-import-report.json`, "utf8"));
  report.pages = report.pages.map((row) => refresh.pages.find((item) => item.id === row.id) ?? row);
  report.pages.push(
    ...refresh.pages.filter((row) => !report.pages.some((item) => item.id === row.id)),
  );
  report.lastTargetedRefresh = {
    checkedAt: refresh.checkedAt,
    ids: [...proseIds],
    importedSourceCss: false,
  };
  await writeFile(`${folder}/solutions.json`, JSON.stringify(merged, null, 2) + "\n");
  await writeFile(
    `${folder}/solution-links.json`,
    JSON.stringify(
      merged.map(({ id, title, path }) => ({ id, title, path })),
      null,
      2,
    ) + "\n",
  );
  await writeFile(`${folder}/solutions-import-report.json`, JSON.stringify(report, null, 2) + "\n");
  console.log("Merged four verified solutions; all other solutions and source CSS preserved.");
  process.exit(0);
}

if (argument("--stage")) {
  const stage = argument("--stage");
  const sources = argument("--source-dir");
  assert(sources, "Staging requires fresh --source-dir HTML captured for review");
  const digest = (value) => createHash("sha256").update(value).digest("hex").slice(0, 20);
  const readSource = async (url) =>
    load(await readFile(path.join(sources, `${digest(new URL(url).href)}.html`), "utf8"));
  const originals = JSON.parse(await readFile("src/features/content/data/pages.json", "utf8"));
  const manifest = JSON.parse(await readFile(path.join(stage, "asset-manifest.json"), "utf8"));
  const unavailable = JSON.parse(await readFile(path.join(stage, "asset-failures.json"), "utf8"));
  const sourceLinks = new Map(
    solutionSources.map((source) => [
      decodeURIComponent(new URL(source.sourceUrl).pathname),
      source.path,
    ]),
  );
  const copy = ($) => {
    const root = $(".dynamic__layout__component").children().last().clone();
    assert(root.length, "Missing source content root");
    root.find(".service-body").closest("section").remove();
    root
      .find(
        "script,style,meta,title,link,noscript,form,input,select,textarea,.sf-footer,[id^='component-footer'],[id*='component-shelve-article-banner'],.salesdesk_widget_button_group",
      )
      .remove();
    root.find("svg").each((_, node) => {
      const image = $(node);
      const label =
        image.attr("aria-label") ||
        image
          .find("text")
          .map((_, text) => $(text).text())
          .get()
          .join(" ");
      if (label) image.replaceWith($("<span>").text(label));
      else image.remove();
    });
    root.find("a[href]").each((_, node) => {
      const anchor = $(node);
      const href = anchor.attr("href");
      if (href.startsWith("#")) return;
      const url = new URL(href, "https://www.sunford.co");
      if (url.hostname.replace(/^www\./, "") === "sunford.co") {
        anchor.attr(
          "href",
          `${sourceLinks.get(decodeURIComponent(url.pathname)) ?? publicPath(url.pathname)}${url.search}${url.hash}`,
        );
      }
    });
    root.find("img[src]").each((_, node) => {
      const image = $(node);
      const found = manifest.find((asset) => asset.source === image.attr("src"));
      if (!found) {
        assert(
          unavailable.some((asset) => asset.source === image.attr("src")),
          `Unstaged source image: ${image.attr("src")}`,
        );
        image.remove();
      } else image.attr("src", found.path);
    });
    const html = sanitizeHtml(root.html(), {
      allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "iframe", "video", "source"],
      transformTags: { main: "div", header: "div", footer: "div" },
      allowedAttributes: {
        a: ["href", "title", "target", "rel"],
        img: ["src", "alt", "width", "height", "loading"],
        iframe: ["src", "title", "allowfullscreen"],
        video: ["src", "poster", "controls"],
        source: ["src", "type"],
        td: ["colspan", "rowspan"],
        th: ["colspan", "rowspan"],
      },
      allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "www.google.com"],
      allowedSchemes: ["https", "http", "mailto", "tel"],
    });
    const text = load(html, null, false).text().replace(/\s+/g, " ").trim();
    assert.equal(
      text.replace(/\s/g, ""),
      root.text().replace(/\s/g, ""),
      "Source text lost during sanitization",
    );
    assert(text.length > 300, "Source body is empty");
    const parsed = load(html, null, false);
    return {
      html,
      text,
      images: parsed("img")
        .map((_, node) => parsed(node).attr("src"))
        .get(),
    };
  };
  const staged = [];
  for (const source of solutionSources.filter((row) => proseIds.has(row.id))) {
    const content = copy(await readSource(source.sourceUrl));
    staged.push({
      ...source,
      sourceUrl: new URL(source.sourceUrl).href,
      kind: "page",
      ...content,
      productHandles: [],
      collectionIds: [],
      hasSourcePlaceholder: false,
    });
  }
  const updates = [];
  for (const destination of [
    "/software/download/sunford-drv",
    "/blogs/editorial/before-using-a-price-computing-scale",
  ]) {
    const original = originals.find((page) => page.path === destination);
    assert(original);
    updates.push({ ...original, ...copy(await readSource(original.sourceUrl)) });
  }
  const covers = [];
  for (const article of originals.filter((page) => /\/SUNFORD_BIZ_TALK_EP\.\d+$/.test(page.path))) {
    const $ = await readSource(article.sourceUrl);
    const url = $("meta[property='og:image']").attr("content");
    const asset = manifest.find((item) => item.source === url);
    assert(asset, `Unverified article cover: ${article.path}`);
    covers.push({ path: article.path, image: asset.path, source: url });
  }
  await writeFile(path.join(stage, "solutions.json"), JSON.stringify(staged, null, 2));
  await writeFile(
    path.join(stage, "content-updates.json"),
    JSON.stringify({ pages: updates, covers }, null, 2),
  );
  await writeFile(
    path.join(stage, "solutions-import-report.json"),
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        pages: staged.map(({ id, path, sourceUrl, text }) => ({
          id,
          path,
          sourceUrl,
          characters: text.length,
          textPreserved: true,
          sourceEmpty: false,
          importedSourceCss: false,
        })),
      },
      null,
      2,
    ),
  );
  console.log(
    `Staged ${staged.length} solutions, ${updates.length} content pages and ${covers.length} verified covers without source CSS.`,
  );
  process.exit(0);
}

await mkdir("output/solutions-source", { recursive: true });
await mkdir("public/images/solutions", { recursive: true });
const pages = [],
  report = [],
  styles = [];
const assets = new Map();
const links = new Map(solutionSources.map((s) => [new URL(s.sourceUrl).pathname, s.path]));
const text = (html) => load(html, null, false).text().replace(/\s+/g, " ").trim();
async function asset(value, base) {
  if (!value || value.startsWith("data:")) return value;
  const url = new URL(value, base).href;
  if (assets.has(url)) return assets.get(url);
  const response = await fetch(url, { signal: AbortSignal.timeout(40000) });
  if (!response.ok) throw new Error(`Asset ${response.status}: ${url}`);
  const type = response.headers.get("content-type") || "";
  const extension = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/gif": "gif",
  }[type.split(";")[0]];
  if (!extension) throw new Error(`Unexpected asset type ${type}: ${url}`);
  const local = `/images/solutions/${createHash("sha256").update(url).digest("hex").slice(0, 20)}.${extension}`;
  await writeFile(`public${local}`, Buffer.from(await response.arrayBuffer()));
  assets.set(url, local);
  return local;
}
for (const source of solutionSources) {
  const response = await fetch(source.sourceUrl, { signal: AbortSignal.timeout(40000) });
  if (!response.ok) throw new Error(`${source.id}: HTTP ${response.status}`);
  const raw = await response.text();
  await writeFile(`output/solutions-source/${source.id}.html`, raw);
  const $ = load(raw);
  const root = $(".dynamic__layout__component").children().last();
  if (!root.length || root.text().includes("อาจไม่มีอยู่จริง"))
    throw new Error(`Missing page ${source.id}`);
  const scope = `.solution-source--${source.id}`;
  root.find("style").each((_, node) => {
    const css = postcss.parse($(node).html() || "");
    css.walkAtRules((rule) => {
      if (/^(import|font-face|keyframes|-webkit-keyframes)$/i.test(rule.name)) rule.remove();
    });
    css.walkRules((rule) => {
      rule.selector = rule.selectors
        .map((selector) => `${scope} ${selector.replace(/(^|\s)(body|html|:root)(?=\s|$)/g, "$1")}`)
        .join(",\n");
    });
    css.walkDecls((decl) => {
      if (/url\s*\(|expression\s*\(|animation|transition/.test(`${decl.prop}:${decl.value}`))
        decl.remove();
      if (decl.prop === "font-family") decl.value = "inherit";
    });
    styles.push(css.toString());
  });
  root.find("script,style,noscript,form,input,select,textarea").remove();
  root.find("[id^='component-footer'], .salesdesk_widget_button_group").remove();
  const originalText = text(root.html());
  const originalHeadings = root
    .find("h1,h2,h3,h4,h5,h6")
    .map((_, e) => $(e).text().trim())
    .get();
  const originalImages = root.find("img").length;
  for (const node of root.find("img").toArray()) {
    const image = $(node);
    const src = image.attr("src") || image.attr("data-src");
    if (!src) throw new Error(`${source.id}: image without source`);
    image.attr("src", await asset(src, source.sourceUrl));
    image.attr("loading", "lazy");
    image.removeAttr("srcset");
  }
  const linkAudit = [];
  root.find("a[href]").each((_, node) => {
    const anchor = $(node),
      original = anchor.attr("href");
    const url = new URL(original, source.sourceUrl);
    let target = url.href;
    if (url.hostname.replace(/^www\./, "") === "sunford.co") {
      const local = links.get(url.pathname);
      target = local
        ? `${local}${url.search}${url.hash}`
        : publicPath(`${url.pathname}${url.search}${url.hash}`);
    }
    if (original.startsWith("#")) target = original;
    anchor.attr("href", target);
    if (/^https?:/.test(target)) anchor.attr("rel", "noopener noreferrer");
    else anchor.removeAttr("target");
    linkAudit.push({ label: anchor.text().trim(), source: original, target });
  });
  const html = sanitizeHtml(root.html(), {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "video",
      "source",
      "iframe",
      "svg",
      "path",
      "rect",
      "circle",
      "ellipse",
      "line",
      "polyline",
      "polygon",
      "g",
      "text",
      "defs",
      "marker",
      "linearGradient",
      "stop",
      "use",
    ],
    allowedAttributes: {
      "*": ["class", "id", "role", "aria-label"],
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      iframe: ["src", "title", "allowfullscreen", "loading"],
      video: ["src", "poster", "controls", "playsinline"],
      source: ["src", "type"],
      svg: ["viewBox", "width", "height", "fill", "stroke", "xmlns"],
      path: ["d", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin"],
      rect: ["x", "y", "width", "height", "rx", "fill", "stroke"],
      circle: ["cx", "cy", "r", "fill", "stroke"],
      ellipse: ["cx", "cy", "rx", "ry", "fill", "stroke"],
      line: ["x1", "x2", "y1", "y2", "stroke"],
      polyline: ["points", "fill", "stroke"],
      polygon: ["points", "fill", "stroke"],
      g: ["transform", "fill", "stroke"],
      text: ["x", "y", "fill", "text-anchor"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    parser: { lowerCaseTags: false, lowerCaseAttributeNames: false },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "www.google.com"],
  });
  if (text(html) !== originalText) throw new Error(`${source.id}: text lost during sanitization`);
  const parsed = load(html, null, false);
  if (parsed("img").length !== originalImages) throw new Error(`${source.id}: images lost`);
  pages.push({
    ...source,
    sourceUrl: encodeURI(source.sourceUrl),
    kind: "page",
    html,
    text: originalText,
    images: parsed("img")
      .map((_, e) => parsed(e).attr("src"))
      .get(),
    productHandles: [],
    collectionIds: [],
    hasSourcePlaceholder: false,
  });
  report.push({
    id: source.id,
    path: source.path,
    sourceUrl: source.sourceUrl,
    characters: originalText.length,
    headings: originalHeadings,
    images: originalImages,
    svg: parsed("svg").length,
    tables: parsed("table").length,
    videos: parsed("iframe,video").length,
    links: linkAudit,
    textPreserved: true,
    sourceEmpty: originalText.length === 0,
  });
  console.log(
    `${source.id}: ${originalText.length} characters, ${originalImages} images, ${originalHeadings.length} headings`,
  );
}
await writeFile("src/features/content/data/solutions.json", JSON.stringify(pages, null, 2) + "\n");
await writeFile(
  "src/features/content/data/solution-links.json",
  JSON.stringify(
    pages.map(({ id, title, path }) => ({ id, title, path })),
    null,
    2,
  ) + "\n",
);
await writeFile("src/features/content/components/solutions-source.css", styles.join("\n\n") + "\n");
await writeFile(
  "src/features/content/data/solutions-import-report.json",
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      source: "https://www.sunford.co/",
      pages: report,
      assets: [...assets].map(([source, path]) => ({ source, path })),
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Imported ${pages.filter((page) => page.text.length).length} populated pages; ${pages.filter((page) => !page.text.length).length} source pages are empty; ${assets.size} assets.`,
);
