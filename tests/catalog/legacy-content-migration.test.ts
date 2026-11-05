import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
import pages from "../../src/features/content/data/pages.json";
import products from "../../src/features/content/data/products.json";
import solutions from "../../src/features/content/data/solutions.json";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import { catalogProductGroup } from "../../src/features/catalog/data/catalog-supplements";

const importedIds = [
  "10732",
  "10733",
  "10838",
  "10839",
  "10840",
  "10841",
  "10842",
  "10843",
  "10844",
];

test("all nine verified accessory SKUs retain distinct identities, local galleries and source details", () => {
  for (const id of importedIds) {
    const record = products.find((product) => product.sourceId === id);
    assert(record, `Missing source SKU ${id}`);
    assert.equal(record.sourceUrl, `https://www.sunford.co/products/${id}`);
    assert(record.description.length > 20, `Missing description for ${id}`);
    assert(record.images.length > 0, `Missing gallery for ${id}`);
    assert(record.images.every((src) => src.startsWith("/images/imported/")));
    const product = getSnapshotProducts().find((product) => product.sourceId === id);
    assert(product);
    assert.equal(catalogProductGroup(product), "/product/scale-accessories");
  }
  assert.equal(products.filter((product) => importedIds.includes(product.sourceId)).length, 9);
  assert.notEqual(
    products.find((p) => p.sourceId === "10838")?.path,
    products.find((p) => p.sourceId === "10839")?.path,
  );
});

test("previously empty and newly added solutions have real source content without executable or imported style markup", () => {
  for (const id of ["lot-serial", "pos", "windows", "driver"]) {
    const page = solutions.find((page) => page.id === id);
    assert(page, `Missing solution ${id}`);
    assert(page.text.length > 300, `Empty solution ${id}`);
    const $ = load(page.html);
    assert.equal($("script,style,link,form,input,object,embed").length, 0);
    assert.equal(
      $("main,header,footer").length,
      0,
      "Imported prose must not nest document landmarks",
    );
    $("*").each((_, node) => {
      if ("attribs" in node)
        for (const name of Object.keys(node.attribs)) assert(!/^on|^style$/i.test(name));
    });
  }
});

test("DRV and price-scale preparation article keep real explanatory content", () => {
  for (const path of [
    "/software/download/sunford-drv",
    "/blogs/editorial/before-using-a-price-computing-scale",
  ]) {
    const page = pages.find((page) => page.path === path);
    assert(page && page.text.length > 300, `Missing explanation: ${path}`);
  }
  const drv = pages.find((page) => page.path === "/software/download/sunford-drv")!;
  assert.equal(load(drv.html)("iframe").length, 2, "Existing Driver videos must remain");
});

test("all Biz Talk episodes retain their existing video and have a verified local cover", () => {
  const episodes = pages.filter((page) => /\/SUNFORD_BIZ_TALK_EP\.\d+$/.test(page.path));
  assert.equal(episodes.length, 27);
  for (const episode of episodes) {
    assert(episode.images[0]?.startsWith("/images/imported/"), `Missing cover: ${episode.path}`);
    assert.equal(load(episode.html)("iframe").length, 1, `Lost video: ${episode.path}`);
  }
});

test("targeted merge rejects category edits and executable source HTML before writing any application data", () => {
  const script = fileURLToPath(new URL("../../scripts/import-sunford.mjs", import.meta.url));
  for (const attack of ["category", "handler"]) {
    const directory = mkdtempSync(path.join(tmpdir(), "sunford-content-test-"));
    try {
      const folder = path.join(directory, "src/features/content/data");
      const stage = path.join(directory, "stage");
      mkdirSync(folder, { recursive: true });
      mkdirSync(stage);
      const originals = pages.filter((row) => !importedIds.includes(row.path.split("/").at(-1)!));
      const originalProducts = products.filter((row) => !importedIds.includes(row.sourceId));
      writeFileSync(path.join(folder, "pages.json"), JSON.stringify(originals));
      writeFileSync(path.join(folder, "products.json"), JSON.stringify(originalProducts));
      const stagedPages = structuredClone(pages);
      const stagedProducts = structuredClone(products);
      if (attack === "category") {
        const collection = stagedPages.find((row) => row.kind === "collection")! as {
          productHandles: string[];
        };
        collection.productHandles.push("unapproved-member");
      } else {
        stagedProducts.find((row) => row.sourceId === "10732")!.descriptionHtml +=
          '<img src="x" onerror="alert(1)">';
      }
      const updates = pages.filter((row) =>
        [
          "/software/download/sunford-drv",
          "/blogs/editorial/before-using-a-price-computing-scale",
        ].includes(row.path),
      );
      writeFileSync(path.join(stage, "pages.json"), JSON.stringify(stagedPages));
      writeFileSync(path.join(stage, "products.json"), JSON.stringify(stagedProducts));
      writeFileSync(
        path.join(stage, "content-updates.json"),
        JSON.stringify({ pages: updates, covers: [] }),
      );
      writeFileSync(
        path.join(stage, "asset-manifest.json"),
        JSON.stringify(
          [...products, ...updates].flatMap((row) => row.images.map((path) => ({ path }))),
        ),
      );
      const before = readFileSync(path.join(folder, "pages.json"), "utf8");
      const result = spawnSync(process.execPath, [script, "--apply-staged", stage], {
        cwd: directory,
        encoding: "utf8",
      });
      assert.equal(result.status, 1);
      assert.match(
        result.stderr,
        attack === "category" ? /Original pages or collections changed/ : /Unsafe source attribute/,
      );
      assert.equal(readFileSync(path.join(folder, "pages.json"), "utf8"), before);
      assert.equal(
        readFileSync(path.join(folder, "products.json"), "utf8"),
        JSON.stringify(originalProducts),
      );
    } finally {
      assert(
        path
          .resolve(directory)
          .startsWith(path.resolve(tmpdir()) + path.sep + "sunford-content-test-"),
      );
      rmSync(directory, { recursive: true, force: true });
    }
  }
});
