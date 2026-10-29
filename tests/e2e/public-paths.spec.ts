import { expect, test } from "@playwright/test";
import { load } from "cheerio";
import sourcePages from "../../src/features/content/data/pages.json";
import type { Product } from "../../src/features/catalog/types";

test("every former Thai route redirects once to its English page with query values intact", async ({
  request,
}) => {
  test.setTimeout(120000);
  const legacy = sourcePages.filter((page) =>
    /[\u0e00-\u0e7f]/.test(decodeURIComponent(new URL(page.sourceUrl).pathname)),
  );
  expect(legacy).toHaveLength(111);
  for (const page of legacy) {
    const path = new URL(page.sourceUrl).pathname;
    const response = await request.get(`${path}?ref=legacy`, { maxRedirects: 0 });
    expect(response.status(), path).toBe(308);
    const destination = new URL(response.headers().location, response.url());
    expect(destination.pathname).toBe(page.path);
    expect(destination.search).toBe("?ref=legacy");
    const canonical = await request.get(destination.href, { maxRedirects: 0 });
    expect(canonical.status(), page.path).toBe(200);
  }
});

test("all public pages and their rendered internal link and media paths are free of Thai characters", async ({
  request,
  baseURL,
}) => {
  test.setTimeout(180000);
  const response = await request.get("/api/products");
  expect(response.status()).toBe(200);
  const { products } = (await response.json()) as { products: Product[] };
  const routes = new Set([
    "/",
    "/products",
    "/explore",
    ...sourcePages.filter((page) => page.kind !== "product").map((page) => page.path),
    ...products.map((product) => `/products/${product.slug}`),
    ...["scales", "indicators", "platforms", "pos", "accessories"].map((slug) => `/guides/${slug}`),
  ]);
  const origin = new URL(baseURL!).origin;
  for (const path of routes) {
    expect(decodeURIComponent(path), path).not.toMatch(/[\u0e00-\u0e7f]/);
    const page = await request.get(path);
    expect(page.status(), path).toBe(200);
    const $ = load(await page.text());
    const invalid = new Set<string>();
    $("[href], [src], [action], [poster]").each((_, element) => {
      for (const attribute of ["href", "src", "action", "poster"]) {
        const value = $(element).attr(attribute);
        if (!value) continue;
        const url = new URL(value, new URL(path, origin));
        if (url.origin === origin && /[\u0e00-\u0e7f]/.test(decodeURIComponent(url.pathname)))
          invalid.add(`${attribute}=${value}`);
      }
    });
    expect([...invalid], path).toEqual([]);
  }
});
