import { writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import sanitizeHtml from "sanitize-html";
import postcss from "postcss";
import { solutionSources } from "./solution-sources.mjs";
import { publicPath } from "../src/features/content/data/public-paths.mjs";

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
