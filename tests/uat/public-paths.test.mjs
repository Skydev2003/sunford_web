import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import {
  publicPath,
  publicContent,
  legacyPathCandidates,
} from "../../src/features/content/data/public-paths.mjs";

const pages = JSON.parse(
  readFileSync(new URL("../../src/features/content/data/pages.json", import.meta.url), "utf8"),
);
const legacyPages = pages.filter((page) =>
  /[\u0e00-\u0e7f]/.test(decodeURIComponent(new URL(page.sourceUrl).pathname)),
);

test("all 112 legacy paths map to distinct English pages without new case collisions", () => {
  assert.equal(legacyPages.length, 112);
  const paths = new Set();
  for (const page of legacyPages) {
    const original = new URL(page.sourceUrl).pathname;
    assert.equal(publicPath(original), page.path);
    assert.equal(publicPath(decodeURIComponent(original)), page.path);
    assert.equal(publicPath(page.path), page.path);
    assert.doesNotMatch(page.path, /[^\x00-\x7f]/);
    assert.ok(!paths.has(page.path.toLowerCase()), page.path);
    paths.add(page.path.toLowerCase());
    assert.equal(
      pages.filter((candidate) => candidate.path.toLowerCase() === page.path.toLowerCase()).length,
      1,
      page.path,
    );
  }
});

test("path conversion preserves queries, fragments, existing ASCII URLs and external destinations", () => {
  const page = legacyPages.find((page) => page.path === "/product/laboratory");
  const original = new URL(page.sourceUrl).pathname;
  assert.equal(
    publicPath(`${original}?category=scales#specifications`),
    `${page.path}?category=scales#specifications`,
  );
  for (const value of [
    "/Product/Lifestyle",
    "/collections/Peripherals",
    "/products/TCS-150-AW31",
    "https://example.com/ไทย",
    "//example.com/ไทย",
    "mailto:info@example.com",
    "/invalid%ZZ",
  ])
    assert.equal(publicPath(value), value);
  const unknown = "หน้าใหม่สำหรับเนื้อหา";
  assert.match(publicPath(`/${unknown}`), /^\/content-[a-f0-9]{16}$/);
  assert.equal(publicPath(`/${encodeURIComponent(unknown)}`), publicPath(`/${unknown}`));
});

test("CMS content converts paths while retaining source references, rich markup and legacy patch identities", () => {
  const page = legacyPages.find((page) => page.path === "/product/scale-accessories");
  const original = decodeURIComponent(new URL(page.sourceUrl).pathname);
  const data = {
    href: original,
    sourceUrl: page.sourceUrl,
    html: `<p>ข้อความ <a href="${original}#products">สินค้า</a><br><strong>เดิม</strong></p>`,
  };
  assert.deepEqual(publicContent(data), {
    ...data,
    href: page.path,
    html: data.html.replace(original, page.path),
  });
  assert.ok(legacyPathCandidates(page.path).includes(original));
  assert.deepEqual(publicContent(publicContent(data)), publicContent(data));
});

test("repository filenames, source URL literals and imported public links contain no Thai paths", () => {
  const output = execFileSync(process.execPath, ["scripts/audit-paths.mjs"], { encoding: "utf8" });
  assert.match(output, /no Thai paths/);
});
