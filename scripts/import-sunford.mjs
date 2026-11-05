import { walk, collectionGrid, flight } from "./lib/sunford-source.mjs";
import { load } from "cheerio";
import sanitizeHtml from "sanitize-html";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { publicContent, publicPath } from "../src/features/content/data/public-paths.mjs";
import assert from "node:assert/strict";

const option = (name) => {
  const index = process.argv.indexOf(name);
  if (index < 0) return null;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a path`);
  return path.resolve(value);
};
const legacyProductIds = new Set([
  "10732",
  "10733",
  "10838",
  "10839",
  "10840",
  "10841",
  "10842",
  "10843",
  "10844",
]);

if (option("--apply-staged")) {
  const stage = option("--apply-staged");
  const folder = "src/features/content/data";
  const read = async (name) => JSON.parse(await readFile(name, "utf8"));
  const oldProducts = await read(`${folder}/products.json`);
  const oldPages = await read(`${folder}/pages.json`);
  const stagedProducts = await read(`${stage}/products.json`);
  const stagedPages = await read(`${stage}/pages.json`);
  const updates = await read(`${stage}/content-updates.json`);
  const manifest = await read(`${stage}/asset-manifest.json`);
  for (const old of oldProducts) {
    assert.deepEqual(
      stagedProducts.find((row) => row.sourceId === old.sourceId),
      old,
      `Existing product changed: ${old.sourceId}`,
    );
  }
  const added = stagedProducts.filter(
    (row) => !oldProducts.some((old) => old.sourceId === row.sourceId),
  );
  const expectedMissing = [...legacyProductIds].filter(
    (id) => !oldProducts.some((row) => row.sourceId === id),
  );
  assert.equal(added.length, expectedMissing.length);
  assert.deepEqual(new Set(added.map((row) => row.sourceId)), new Set(expectedMissing));
  const addedPages = stagedPages.filter((row) => !oldPages.some((old) => old.path === row.path));
  assert.equal(stagedPages.length, oldPages.length + added.length);
  assert.deepEqual(
    new Set(addedPages.map((row) => row.path)),
    new Set(expectedMissing.map((id) => `/products/${id}`)),
  );
  assert(
    addedPages.every(
      (row) =>
        row.kind === "product" &&
        row.productHandles.length === 1 &&
        row.productHandles[0] === row.path.split("/").at(-1),
    ),
  );
  const allowedUpdates = new Set([
    "/software/download/sunford-drv",
    "/blogs/editorial/before-using-a-price-computing-scale",
  ]);
  assert.deepEqual(new Set(updates.pages.map((row) => row.path)), allowedUpdates);
  const fingerprint = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
  for (const original of oldPages) {
    if (allowedUpdates.has(original.path) || legacyProductIds.has(original.path.split("/").at(-1)))
      continue;
    const staged = stagedPages.find((row) => row.path === original.path);
    const withCover = updates.covers.some((row) => row.path === original.path);
    const comparable = (row) => (withCover && row ? { ...row, images: [] } : row);
    assert.equal(
      fingerprint(comparable(staged)),
      fingerprint(comparable(original)),
      "Original pages or collections changed",
    );
  }
  assert.equal(new Set(updates.covers.map((row) => row.path)).size, updates.covers.length);
  for (const cover of updates.covers) {
    assert(/^\/blogs\/editorial\/SUNFORD_BIZ_TALK_EP\.\d+$/.test(cover.path));
    assert(oldPages.some((row) => row.path === cover.path));
  }
  const localImages = new Set(manifest.map((asset) => asset.path));
  for (const row of [
    ...stagedProducts.filter((row) => legacyProductIds.has(row.sourceId)),
    ...updates.pages,
  ]) {
    assert(new URL(row.sourceUrl).hostname === "www.sunford.co");
    if (row.sourceId) {
      assert.equal(row.sourceUrl, `https://www.sunford.co/products/${row.sourceId}`);
      assert(row.images.length && row.description.trim());
    }
    for (const field of ["html", "descriptionHtml", "detailsHtml", "specificationHtml"]) {
      const $ = load(row[field] || "");
      assert.equal(
        $("script,style,link,form,input,object,embed").length,
        0,
        `Unsafe HTML: ${row.path}`,
      );
      $("*").each((_, node) => {
        for (const [name, value] of Object.entries(node.attribs || {})) {
          assert(!/^on|^style$/i.test(name), "Unsafe source attribute");
          assert(!/^\s*(javascript|vbscript|data):/i.test(value), "Unsafe source URL");
        }
      });
    }
    assert(
      row.images.every((src) => localImages.has(src)),
      `Unverified image in ${row.path}`,
    );
  }
  for (const cover of updates.covers) assert(localImages.has(cover.image), "Unverified cover");
  for (const asset of manifest) {
    assert(/^https:\/\//.test(asset.source));
    const extension = path.extname(new URL(asset.source).pathname).toLowerCase();
    assert([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"].includes(extension));
    const name = `${createHash("sha256").update(asset.source).digest("hex").slice(0, 20)}${extension}`;
    assert.equal(asset.path, `/images/imported/${name}`);
    const bytes = await readFile(path.join(stage, "assets", name));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
    const target = path.join("public/images/imported", name);
    try {
      assert.equal(
        createHash("sha256")
          .update(await readFile(target))
          .digest("hex"),
        asset.sha256,
        "Refusing to replace existing image",
      );
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  const finalPages = stagedPages.map((page) => {
    const replacement = updates.pages.find((row) => row.path === page.path);
    const cover = updates.covers.find((row) => row.path === page.path);
    return replacement ?? (cover ? { ...page, images: [cover.image] } : page);
  });
  for (const old of oldPages.filter((row) => row.kind === "collection")) {
    assert.deepEqual(
      finalPages.find((row) => row.path === old.path),
      old,
    );
  }
  for (const asset of manifest) {
    const name = asset.path.split("/").at(-1);
    const target = path.join("public/images/imported", name);
    try {
      await writeFile(target, await readFile(path.join(stage, "assets", name)), { flag: "wx" });
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
  }
  const report = await read(`${folder}/import-report.json`);
  report.pages = finalPages.length;
  report.products = stagedProducts.length;
  report.collections = finalPages.filter((row) => row.kind === "collection").length;
  report.legacyContentMigration = {
    checkedAt: new Date().toISOString(),
    addedProductIds: [...legacyProductIds],
    updatedPages: [...allowedUpdates],
    covers: updates.covers.length,
    categoriesPreserved: true,
  };
  for (const [name, value] of [
    ["pages", finalPages],
    ["products", stagedProducts],
    ["import-report", report],
  ]) {
    await writeFile(`${folder}/${name}.json`, JSON.stringify(value, null, 2));
  }
  console.log(
    `Merged ${added.length} new products, ${updates.pages.length} content pages and ${updates.covers.length} covers; all existing products and collections preserved.`,
  );
  process.exit(0);
}

const origin = "https://www.sunford.co";
// A targeted refresh merges these pages and their products into the snapshot.
const requestedPaths = process.argv.includes("--paths")
  ? process.argv
      .slice(process.argv.indexOf("--paths") + 1)
      .filter(
        (value, index, values) => !values.slice(0, index + 1).some((item) => item.startsWith("--")),
      )
  : null;
const usePageCache = process.argv.includes("--use-page-cache");
if (requestedPaths && !requestedPaths.length) throw new Error("--paths requires source paths");
const previous = requestedPaths
  ? Object.fromEntries(
      await Promise.all(
        ["pages", "products", "import-report"].map(async (name) => [
          name,
          JSON.parse(await readFile(`src/features/content/data/${name}.json`, "utf8")),
        ]),
      ),
    )
  : null;
const cacheDir = path.resolve("node_modules/.cache/sunford-import");
const stageDirectory = option("--stage");
if (stageDirectory && !requestedPaths) throw new Error("Staging requires explicit --paths");
const sourceDirectory = option("--source-dir");
const outputDir = stageDirectory ?? path.resolve("src/features/content/data");
const assetDir = stageDirectory
  ? path.join(stageDirectory, "assets")
  : path.resolve("public/images/imported");
await Promise.all([
  mkdir(cacheDir, { recursive: true }),
  mkdir(outputDir, { recursive: true }),
  mkdir(assetDir, { recursive: true }),
]);
const digest = (value) => createHash("sha256").update(value).digest("hex").slice(0, 20);
const normalize = (value) => {
  try {
    return decodeURIComponent(new URL(value, origin).pathname).replace(/\/$/, "") || "/";
  } catch {
    return null;
  }
};
const excluded =
  /^\/(signin|signup|forgot-password|cart|checkout|payment|search|home-test|Oder)(\/|$)/i;
const sourceUrls = new Map();
const report = {
  checkedAt: new Date().toISOString(),
  source: origin,
  pages: 0,
  products: 0,
  collections: 0,
  assets: 0,
  failedPages: [],
  missingImages: [],
  excludedPaths: [],
  placeholderPages: [],
};
const assets = new Map();
const pages = [];
const products = [];
const withheldDetails = [];
function reviewedProductHtml(html, sourceId) {
  if (!stageDirectory || sourceId !== "10838") return html;
  const $ = load(html, null, false);
  $("p")
    .filter((_, node) => $(node).text().trim() === "ล้อแสตนเลส SUS304 Nylon ปลอดภัยสำหรับงานอาหาร")
    .remove();
  return $.html();
}
const rawCollections = new Map();
const gridProducts = new Map();
function localLink(href) {
  try {
    const url = new URL(href, origin);
    if (!["http:", "https:"].includes(url.protocol)) return href;
    if (url.hostname.replace(/^www\./, "") === "sunford.co") {
      if (excluded.test(normalize(url.href))) return url.href;
      return `${url.pathname}${url.search}${url.hash}`;
    }
    return url.href;
  } catch {
    return "";
  }
}
function clean(html) {
  const $ = load(html || "", null, false);
  $("script,style,noscript,svg,button,input,select,textarea,form").each((_, element) => {
    if (element.name === "form" || element.name === "button")
      $(element).replaceWith($(element).contents());
    else $(element).remove();
  });
  $("[hidden],.hidden").remove();
  $("p")
    .filter(
      (_, e) =>
        !$(e)
          .text()
          .replace(/\u00a0/g, " ")
          .trim() && !$(e).find("img,video,iframe").length,
    )
    .remove();
  $("img").each((_, element) => {
    let src = $(element).attr("src") || $(element).attr("data-src");
    if (src && src.startsWith("http")) assets.set(src, null);
    else if (!src)
      $(element).replaceWith(
        '<div class="media-placeholder" role="img" aria-label="พื้นที่สำหรับรูปภาพ"><span>พื้นที่สำหรับรูปภาพ</span></div>',
      );
  });
  $("a").each((_, element) => {
    const href = $(element).attr("href");
    if (href) $(element).attr("href", localLink(href));
  });
  return sanitizeHtml($.html(), {
    allowedTags: [
      "div",
      "span",
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "a",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "br",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "caption",
      "blockquote",
      "pre",
      "code",
      "img",
      "video",
      "source",
      "iframe",
      "details",
      "summary",
      "section",
      "figure",
      "figcaption",
      "label",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      video: ["src", "controls", "poster", "playsinline"],
      source: ["src", "type"],
      iframe: ["src", "title", "allowfullscreen", "loading"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
      div: ["class", "role", "aria-label"],
    },
    allowedClasses: { div: ["media-placeholder"] },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "www.google.com"],
    allowedSchemes: ["https", "http", "mailto", "tel"],
    transformTags: {
      a: (tag, attrs) => ({
        tagName: tag,
        attribs: {
          ...attrs,
          ...(/^https?:/.test(attrs.href || "") ? { target: "_blank", rel: "noreferrer" } : {}),
        },
      }),
      img: (tag, attrs) => ({ tagName: tag, attribs: { ...attrs, loading: "lazy" } }),
    },
  });
}
const plain = (html) => {
  const $ = load(html || "", null, false);
  $("br").replaceWith("\n");
  $("p,li,h1,h2,h3,h4,h5,h6,tr").append("\n");
  return $.text()
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();
};
const attrs = (value) =>
  Array.isArray(value) ? value.find((item) => item?.loc === "TH") || value[0] : value;
async function getHtml(url) {
  if (sourceDirectory) return readFile(path.join(sourceDirectory, `${digest(url)}.html`), "utf8");
  const file = path.join(cacheDir, `${digest(url)}.html`);
  if (!requestedPaths || (usePageCache && !new URL(url).pathname.startsWith("/products/"))) {
    try {
      return await readFile(file, "utf8");
    } catch {}
  }
  let last;
  for (let retry = 0; retry < 3; retry++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(40000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      await writeFile(file, html);
      return html;
    } catch (error) {
      last = error;
    }
  }
  throw last;
}
function addUrl(href) {
  try {
    const url = new URL(href, origin);
    if (url.hostname.replace(/^www\./, "") !== "sunford.co") return;
    const pathname = normalize(url.href);
    if (
      !pathname ||
      excluded.test(pathname) ||
      /\.(pdf|zip|rar|exe|png|jpg|webp|mp4|xlsx?|docx?)$/i.test(pathname)
    )
      return;
    if (!sourceUrls.has(pathname)) sourceUrls.set(pathname, `${origin}${url.pathname}`);
  } catch {}
}
if (requestedPaths) {
  requestedPaths.forEach(addUrl);
} else {
  const xml = await (await fetch(`${origin}/sitemap.xml`)).text();
  for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const pathname = normalize(match[1]);
    if (excluded.test(pathname)) report.excludedPaths.push(pathname);
    else addUrl(match[1]);
  }
  addUrl(origin);
}
let processed = 0;
async function processPage(sourcePath, url) {
  try {
    const html = await getHtml(url);
    const $ = load(html);
    const { records, resolve } = flight($);
    const sourceProduct = Object.values(records).find(
      (value) =>
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        value.handle === sourcePath.split("/").at(-1) &&
        value.productDetail &&
        value.attributes,
    );
    const product = sourceProduct ? resolve(sourceProduct) : null;
    const root = $(".dynamic__layout__component").children().last();
    if (!requestedPaths) $("a[href]").each((_, e) => addUrl($(e).attr("href")));
    root
      .find(
        'script,style,noscript,svg,.sf-footer,[id^="nav-"],header,footer,.salesdesk_widget_button_group',
      )
      .remove();
    root.find(".service-body").closest("section").remove();
    root.find('[id*="component-shelve-article-banner"]').remove();
    const rootText = plain(root.html());
    if (
      (rootText.includes("ไม่พบหน้านี้") && rootText.includes("อาจไม่มีอยู่จริง")) ||
      !root.length
    ) {
      report.failedPages.push({ path: sourcePath, reason: "Source page unavailable" });
      return;
    }
    let title = product ? attrs(product.attributes)?.displayName : null;
    title ||= $("h1").first().text().trim();
    title ||= $('meta[property="og:title"]').attr("content") || $("title").text().trim();
    if (!title || title === "Sunford")
      title = sourcePath.split("/").at(-1)?.replaceAll("-", " ") || "Sunford";
    const bodyHtml = clean(root.html());
    const mainImages = root
      .find("img[src]")
      .map((_, e) => $(e).attr("src"))
      .get()
      .filter(
        (src) =>
          /^https?:/.test(src || "") && !/logo|icon|webBannerComponent\/2025\/7\/11/i.test(src),
      );
    const localProductLinks = [
      ...new Set(
        root
          .find('a[href*="/products/"]')
          .map((_, e) => normalize($(e).attr("href"))?.split("/").at(-1))
          .get(),
      ),
    ];
    // Product landing pages use the same streamed grid as collection pages.
    if (collectionGrid(records, resolve).length || sourcePath.startsWith("/collections/")) {
      const collect = (items) =>
        items.forEach((item) => {
          localProductLinks.push(item.handle);
          gridProducts.set(item.handle, { product: item, sourceUrl: url });
          if (requestedPaths) addUrl(`/products/${encodeURIComponent(item.handle)}`);
        });
      collect(collectionGrid(records, resolve));
      let maxPage = 1;
      let pageParamKey = "page";
      walk(Object.values(records), (value) => {
        if (typeof value.pageParamKey === "string" && Number.isInteger(value.maxPage)) {
          maxPage = Math.max(maxPage, value.maxPage);
          pageParamKey = value.pageParamKey;
        }
      });
      for (let currentPage = 2; currentPage <= Math.min(maxPage, 50); currentPage++) {
        const more = flight(load(await getHtml(`${url}?${pageParamKey}=${currentPage}`)));
        collect(collectionGrid(more.records, more.resolve));
      }
    }
    let collectionIds = [];
    for (const value of Object.values(records))
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        (value.collection || value.collectionData)
      ) {
        const candidate = resolve(value.collection || value.collectionData);
        if (candidate?.id) collectionIds.push(candidate.id);
      }
    if (sourcePath.startsWith("/collections/")) {
      for (const value of Object.values(records))
        if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          value.handle &&
          (/collection/i.test(JSON.stringify(Object.keys(value))) || value.type === "COLLECTION")
        ) {
          const item = resolve(value);
          if (normalize(`/collections/${item.handle}`) === sourcePath && item.id) {
            rawCollections.set(item.id, {
              path: sourcePath,
              title: attrs(item.attributes)?.title || attrs(item.attributes)?.name || title,
            });
            collectionIds.push(item.id);
          }
        }
    }
    const videoIds = new Set();
    walk(Object.values(records), (value) => {
      if (
        !Array.isArray(value) &&
        Array.isArray(value.list) &&
        value.list.length &&
        value.list.every((item) => typeof item === "string" && /^[A-Za-z0-9_-]{11}$/.test(item))
      )
        value.list.forEach((id) => videoIds.add(id));
    });
    const videos = [...videoIds].map((id) => {
      const image = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      assets.set(image, null);
      return { id, image };
    });
    const page = {
      path: sourcePath,
      title,
      sourceUrl: url,
      html: bodyHtml,
      text: plain(bodyHtml),
      images: [...new Set(mainImages)],
      productHandles: [...new Set(localProductLinks)],
      collectionIds: [...new Set(collectionIds)],
      videos,
    };
    if (sourcePath === "/software/download") {
      const items = root
        .find("a.product-card-link[data-category]")
        .map((_, element) => {
          const card = $(element);
          return {
            path: localLink(card.attr("href")),
            title: card.find("h3").text().trim(),
            description: card.find("p").text().trim(),
            image: card.find("img").attr("src") || "",
            category: card.attr("data-category"),
          };
        })
        .get();
      const categoryIds = [...new Set(items.map((item) => item.category))];
      const categories = root
        .find(".nav-tab")
        .map((index, element) => ({
          id: index === 0 ? "all" : categoryIds[index - 1],
          label: $(element).text().trim(),
        }))
        .get();
      if (!items.length || categories.some((category) => !category.id))
        throw new Error("Software catalogue markup is incomplete");
      page.softwareCatalog = { categories, items };
    }
    if (/Lorem ipsum/i.test(page.text)) {
      report.placeholderPages.push(sourcePath);
      page.hasSourcePlaceholder = true;
    }
    if (product) {
      const attribute = attrs(product.attributes) || {};
      const detail = attrs(product.productDetail?.attributes) || {};
      const specsHeading = root
        .find("h1")
        .filter((_, e) => $(e).text().trim() === "ข้อมูลผลิตภัณฑ์")
        .first();
      const specifications = specsHeading
        .parent()
        .next()
        .children("div")
        .map((_, e) => {
          const cells = $(e).children("p");
          return cells.length >= 2
            ? { label: cells.eq(0).text().trim(), value: cells.eq(1).text().trim() }
            : null;
        })
        .get();
      const descriptionHtml = reviewedProductHtml(
        clean(attribute.description || ""),
        product.handle,
      );
      const detailsHtml = reviewedProductHtml(clean(detail.body_html || ""), product.handle);
      if (stageDirectory && product.handle === "10838") {
        withheldDetails.push({
          sourceId: "10838",
          sourceText: "ล้อแสตนเลส SUS304 Nylon ปลอดภัยสำหรับงานอาหาร",
          reason:
            "Source description calls the wheel PU and Nylon; material/food-contact claim needs owner confirmation.",
        });
        page.html = reviewedProductHtml(page.html, product.handle);
        page.text = plain(page.html);
      }
      const images = [
        ...new Set(
          [product.featuredImageUrl, ...(product.imagesUrl || [])].filter(
            (url) => typeof url === "string" && /^https?:/.test(url),
          ),
        ),
      ];
      images.forEach((url) => assets.set(url, null));
      products.push({
        sourceId: product.handle,
        name: attribute.displayName || title,
        sourceUrl: url,
        path: sourcePath,
        descriptionHtml,
        detailsHtml,
        description: plain(descriptionHtml),
        details: plain(detailsHtml),
        images,
        imageAlt: product.imagesAlt || [],
        collectionIds: product.collectionIds || [],
        specificationHtml: reviewedProductHtml(bodyHtml, product.handle),
        specifications,
        price:
          product.productVariant?.find((item) => item.show_price && item.priceFull > 0)
            ?.priceFull ?? null,
      });
      page.kind = "product";
      page.productHandles = [product.handle];
    } else
      page.kind = sourcePath.startsWith("/collections/")
        ? "collection"
        : /\/blogs\//.test(sourcePath)
          ? "article"
          : "page";
    pages.push(page);
  } catch (error) {
    report.failedPages.push({
      path: sourcePath,
      reason: error.message.includes("HTTP") ? error.message : "Source did not respond",
    });
  } finally {
    processed++;
    if (processed % 20 === 0)
      console.log(
        `Read ${processed} public pages; discovered ${sourceUrls.size}; products ${products.length}.`,
      );
  }
}
const completed = new Set();
while (true) {
  const pending = [...sourceUrls].filter(([key]) => !completed.has(key));
  if (!pending.length) break;
  let cursor = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (cursor < pending.length) {
        const [key, url] = pending[cursor++];
        completed.add(key);
        await processPage(key, url);
      }
    }),
  );
}
const modelKey = (value) =>
  value
    .replace(/^SUNFORD\s*/i, "")
    .split("\n")[0]
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
for (const [handle, { product, sourceUrl }] of gridProducts) {
  const attribute = attrs(product.attributes) || {};
  const name = attribute.displayName || handle;
  if (products.some((item) => item.sourceId === handle || modelKey(item.name) === modelKey(name)))
    continue;
  const detail = attrs(product.productDetail?.attributes) || {};
  const descriptionHtml = clean(attribute.description || "");
  const detailsHtml = clean(detail.body_html || "");
  const images = [
    ...new Set(
      [product.featuredImageUrl, ...(product.imagesUrl || [])].filter(
        (url) => typeof url === "string" && /^https?:/.test(url),
      ),
    ),
  ];
  images.forEach((url) => assets.set(url, null));
  products.push({
    sourceId: handle,
    name,
    sourceUrl,
    path: `/products/${handle}`,
    descriptionHtml,
    detailsHtml,
    description: plain(descriptionHtml),
    details: plain(detailsHtml),
    images,
    imageAlt: product.imagesAlt || [],
    collectionIds: product.collectionIds || [],
    specificationHtml: "",
    price: null,
  });
}
for (const product of products) {
  const collections = pages
    .filter((page) => page.kind === "collection" && page.productHandles.includes(product.sourceId))
    .map(({ path, title }) => ({ path, title }));
  const prior = previous?.products.find((item) => item.sourceId === product.sourceId);
  product.collections = [
    ...(prior?.collections ?? []).filter(
      (item) => !pages.some((page) => publicPath(page.path) === publicPath(item.path)),
    ),
    ...collections,
  ];
}
for (const page of pages.filter((item) => item.kind === "collection")) {
  const ids = page.collectionIds;
  page.productHandles = [
    ...new Set([
      ...page.productHandles,
      ...products
        .filter((product) => product.collectionIds.some((id) => ids.includes(id)))
        .map((product) => product.sourceId),
    ]),
  ];
}
console.log(`Downloading ${assets.size} image assets.`);
let assetCursor = 0;
const assetUrls = [...assets.keys()];
await Promise.all(
  Array.from({ length: 5 }, async () => {
    while (assetCursor < assetUrls.length) {
      const url = assetUrls[assetCursor++];
      try {
        const parsed = new URL(url);
        if (
          !/\.(cloudfront\.net|amazonaws\.com|sunford\.co|sunfordshop\.com|sunfordthai\.com|ibb\.co|ytimg\.com)$/i.test(
            parsed.hostname,
          ) &&
          !/(^|\.)sunford\.co$/i.test(parsed.hostname)
        )
          throw new Error("Unsupported image host");
        const extension = path.extname(parsed.pathname).toLowerCase();
        if (![".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"].includes(extension))
          throw new Error("No supported image extension");
        const name = `${digest(url)}${extension}`;
        const target = path.join(assetDir, name);
        try {
          await readFile(target);
        } catch {
          const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
          if (!response.ok || !response.headers.get("content-type")?.startsWith("image/"))
            throw new Error("Image unavailable");
          await writeFile(target, Buffer.from(await response.arrayBuffer()));
        }
        assets.set(url, `/images/imported/${name}`);
        report.assets++;
      } catch {
        assets.set(url, "");
        report.missingImages.push(url);
      }
      if (assetCursor % 75 === 0)
        console.log(`Processed ${assetCursor}/${assetUrls.length} images.`);
    }
  }),
);
function rewriteMedia(html) {
  const $ = load(html || "", null, false);
  $("img").each((_, e) => {
    const src = $(e).attr("src");
    if (assets.has(src)) {
      const local = assets.get(src);
      if (local) $(e).attr("src", local);
      else
        $(e).replaceWith(
          '<div class="media-placeholder" role="img" aria-label="พื้นที่สำหรับรูปภาพ"><span>พื้นที่สำหรับรูปภาพ</span></div>',
        );
    }
  });
  return $.html();
}
if (stageDirectory) {
  let manifest = [];
  try {
    manifest = JSON.parse(await readFile(path.join(stageDirectory, "asset-manifest.json"), "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  for (const [source, local] of assets) {
    if (!local) continue;
    const bytes = await readFile(path.join(assetDir, local.split("/").at(-1)));
    manifest.push({
      source,
      path: local,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
  await writeFile(
    path.join(stageDirectory, "asset-manifest.json"),
    JSON.stringify([...new Map(manifest.map((asset) => [asset.source, asset])).values()], null, 2),
  );
  await writeFile(
    path.join(stageDirectory, "withheld-details.json"),
    JSON.stringify(withheldDetails, null, 2),
  );
}
for (const product of products) {
  product.images = product.images.map((url) => assets.get(url) || "").filter(Boolean);
  for (const field of ["descriptionHtml", "detailsHtml", "specificationHtml"])
    product[field] = rewriteMedia(product[field]);
}
for (const page of pages) {
  page.images = page.images.map((url) => assets.get(url) || "").filter(Boolean);
  page.html = rewriteMedia(page.html);
  page.videos = page.videos.map(({ id, image }) => ({ id, image: assets.get(image) || "" }));
  if (page.softwareCatalog)
    page.softwareCatalog.items = page.softwareCatalog.items.map((item) => ({
      ...item,
      image: assets.get(item.image) || "",
    }));
}
// Keep known unavailable source illustrations in the audit without blocking
// a refresh of readable content. Newly missing assets still fail the import.
const newlyMissingImages = report.missingImages.filter(
  (url) => !previous?.["import-report"].missingImages.includes(url),
);
const newlyFailedPages = report.failedPages.filter(
  (page) => !previous?.["import-report"].failedPages.some((prior) => prior.path === page.path),
);
if (requestedPaths && (newlyFailedPages.length || newlyMissingImages.length))
  throw new Error(`Targeted import incomplete: ${JSON.stringify(report)}`);
const merge = (existing, refreshed, key) => {
  const index = new Map(refreshed.map((item) => [item[key], item]));
  return [
    ...existing.map((item) => index.get(item[key]) ?? item),
    ...refreshed.filter((item) => !existing.some((old) => old[key] === item[key])),
  ];
};
const canonicalPages = publicContent(pages);
const canonicalProducts = publicContent(products);
const outputPages = previous
  ? merge(publicContent(previous.pages), canonicalPages, "path")
  : canonicalPages;
const outputProducts = previous
  ? merge(publicContent(previous.products), canonicalProducts, "sourceId")
  : canonicalProducts;
const outputReport = previous
  ? {
      ...previous["import-report"],
      lastTargetedRefresh: {
        checkedAt: report.checkedAt,
        paths: requestedPaths,
        pages: pages.length,
        products: products.length,
        failedPages: report.failedPages,
        missingImages: report.missingImages,
      },
    }
  : report;
outputReport.pages = outputPages.length;
outputReport.products = outputProducts.length;
outputReport.collections = outputPages.filter((page) => page.kind === "collection").length;
for (const [name, data] of [
  ["pages", outputPages],
  ["products", outputProducts],
  ["import-report", outputReport],
]) {
  const filename = path.join(outputDir, `${name}.json`);
  await writeFile(`${filename}.tmp`, JSON.stringify(data, null, 2));
  for (let attempt = 0; ; attempt++) {
    try {
      await rename(`${filename}.tmp`, filename);
      break;
    } catch (error) {
      // Windows file watchers can briefly hold the destination open.
      if (!["EPERM", "EBUSY"].includes(error.code) || attempt >= 5) throw error;
      await delay(200 * (attempt + 1));
    }
  }
}
console.log(
  JSON.stringify(
    {
      pages: outputReport.pages,
      products: outputReport.products,
      collections: outputReport.collections,
      assets: report.assets,
      failedPages: report.failedPages,
      missingImageCount: report.missingImages.length,
    },
    null,
    2,
  ),
);
