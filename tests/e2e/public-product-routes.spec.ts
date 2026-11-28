import { expect, test } from "@playwright/test";
import { load } from "cheerio";
import type { Product } from "../../src/features/catalog/types";

test("products without a published category use the Shop breadcrumb and Navbar link", async ({
  request,
}) => {
  const { products }: { products: Product[] } = await (await request.get("/api/products")).json();
  const item = products.find(
    ({ warehouseCategoryId, category }) => !warehouseCategoryId && category === "uncategorized",
  );
  expect(item).toBeDefined();
  const response = await request.get(`/products/${encodeURIComponent(item!.slug)}`);
  const $ = load(await response.text());
  expect(response.status()).toBe(200);
  expect($("main[data-primary-category=products] h1").text()).toBe(item!.name);
  expect($('nav[aria-label="เส้นทางสินค้า"] a').attr("href")).toBe("/products");
  expect($("header a[aria-current=location]").attr("href")).toBe("/products");
});

test("a Warehouse bookmark redirects permanently to its model with query intact", async ({
  request,
}) => {
  const response = await request.get("/products/warehouse-G106124?ref=legacy", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(new URL(response.headers().location, response.url()).pathname).toBe(
    "/products/acs-30-fc31",
  );
  expect(new URL(response.headers().location, response.url()).search).toBe("?ref=legacy");
  expect((await request.get("/products/acs-30-fc31", { maxRedirects: 0 })).status()).toBe(200);
});

test("model SEO, breadcrumb and active Navbar category are in the server HTML", async ({
  request,
}) => {
  const response = await request.get("/products/wps10ks");
  expect(response.status()).toBe(200);
  const $ = load(await response.text());
  const canonical = "https://sunford-web.vercel.app/products/wps10ks";
  expect($("link[rel=canonical]").attr("href")).toBe(canonical);
  expect($('meta[property="og:url"]').attr("content")).toBe(canonical);
  expect($("main[data-primary-category=scales] h1").text()).toBe("WPS10KS");
  expect($('nav[aria-label="เส้นทางสินค้า"] a').attr("href")).toBe("/scales");
  expect($("header a[aria-current=location]").attr("href")).toBe("/scales");
  const schema = JSON.parse($('script[type="application/ld+json"]').text());
  expect(schema["@graph"]).toEqual([
    expect.objectContaining({ "@type": "Product", name: "WPS10KS", url: canonical }),
    expect.objectContaining({ "@type": "BreadcrumbList" }),
  ]);
});

test("the contact URL sends the contact H1 with JavaScript disabled", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/service?section=contact");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("ติดต่อเรา");
    await page.goto("/service");
    await expect(page.locator("main h1")).toHaveText("ส่งเครื่องซ่อม");
  } finally {
    await context.close();
  }
});
