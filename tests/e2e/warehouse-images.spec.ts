import { expect, test, type Locator } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import {
  readWarehouseProducts,
  closeWarehousePool,
} from "../../src/features/services/warehouse-postgres";
import {
  isPublicWarehouseSku,
  warehousePhotoUrl,
} from "../../src/features/catalog/data/warehouse-products";

loadEnvConfig(process.cwd(), true);
test.afterAll(() => closeWarehousePool());
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

const imageSource = (image: Locator) =>
  image.evaluate((el) => {
    const src = el.getAttribute("src") ?? "";
    return new URL(src, location.origin).searchParams.get("url") ?? src;
  });

test("every Warehouse photo uses its current version and overrides CMS in the detail gallery", async ({
  page,
  request,
}) => {
  const current = await readWarehouseProducts();
  const { products } = await (await request.get("/api/products")).json();
  const photographed = current.items.filter(
    (item) => item.image_url && isPublicWarehouseSku(item.sku),
  );
  for (const item of photographed) {
    const product = products.find((p: { warehouseSku: string }) => p.warehouseSku === item.sku);
    const expected = new URL(item.image_url!, "https://warehouse.invalid").searchParams.get("v");
    expect(new URL(product.image, "https://site.invalid").searchParams.get("v")).toBe(expected);
    expect(product.image).toMatch(/^\/(?:images\/warehouse-cache|api\/products)\//);
  }
  const product = products.find(
    (p: { warehouseSku: string; fallbackImage?: string }) =>
      p.warehouseSku === "G106698" && p.fallbackImage,
  );
  expect(product).toBeTruthy();
  await page.goto(`/products/${product.slug}`);
  const photo = page.locator(".detail-image img");
  await expect
    .poll(() => photo.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  expect(await imageSource(photo)).toBe(product.image);
});

for (const width of [390, 1440]) {
  test(`failed Warehouse photo uses CMS fallback on card and detail at ${width}px`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width, height: 960 });
    const { products } = await (await request.get("/api/products")).json();
    const product = products.find((p: { warehouseSku: string }) => p.warehouseSku === "G106698");
    expect(product.fallbackImage).toBeTruthy();
    let blocked = 0;
    await page.route("**/_next/image?**", async (route) => {
      const source = new URL(route.request().url()).searchParams.get("url");
      if (source === product.image) {
        blocked++;
        await route.fulfill({ status: 503, body: "Expected test failure" });
      } else await route.continue();
    });
    await page.goto("/products");
    const card = page.locator(`[data-warehouse-sku="${product.warehouseSku}"]`);
    await card.scrollIntoViewIfNeeded();
    const cardPhoto = card.locator("img").first();
    await expect.poll(() => imageSource(cardPhoto)).toBe(product.fallbackImage);
    await expect
      .poll(() => cardPhoto.evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await card.getByRole("link").first().click();
    const detail = page.locator(".detail-image img");
    await expect.poll(() => imageSource(detail)).toBe(product.fallbackImage);
    await expect
      .poll(() => detail.evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    expect(blocked).toBeGreaterThan(0);
    await page.screenshot({ path: test.info().outputPath(`cms-fallback-${width}.png`) });
  });
}

test("two source versions get separate real optimizer cache keys without an image refresh command", async ({
  request,
}) => {
  test.setTimeout(60000);
  const current = await readWarehouseProducts();
  const item = current.items.find((item) => item.image_url && isPublicWarehouseSku(item.sku))!;
  const first = new URL(item.image_url!, "https://warehouse.invalid");
  first.searchParams.set("v", new Date().toISOString());
  const second = new URL(first);
  second.searchParams.set("v", new Date(Date.now() + 1000).toISOString());
  const sources = [first, second].map((version) =>
    warehousePhotoUrl({ ...item, image_url: version.pathname + version.search }),
  );
  expect(sources[0]).not.toBe(sources[1]);
  for (const source of sources) {
    const response = await request.get(
      "/_next/image?" + new URLSearchParams({ url: source, w: "640", q: "75" }),
    );
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/^image\//);
    if (process.env.IMAGE_PRODUCTION_QA === "1")
      expect(response.headers()["x-nextjs-cache"]).toBe("MISS");
  }
});

test("builder uses the live Warehouse kit photo and falls back to CMS on load failure", async ({
  page,
  request,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 390, height: 900 });
  const { products } = await (await request.get("/api/products")).json();
  const kit = products.find((p: { warehouseSku: string }) => p.warehouseSku === "G106308");
  expect(kit.fallbackImage).toBeTruthy();
  let failPrimary = false;
  await page.route("**/_next/image?**", async (route) => {
    if (failPrimary && new URL(route.request().url()).searchParams.get("url") === kit.image)
      await route.fulfill({ status: 503, body: "Expected test failure" });
    else await route.continue();
  });
  for (const fallback of [false, true]) {
    failPrimary = fallback;
    await page.goto("/guides/indicator-platform-compatibility");
    await page.getByRole("button", { name: "เลือก Indicator-AW31", exact: true }).click();
    const choose = page.getByRole("button", { name: "เลือก TMS-60-AW31", exact: true });
    const card = page.locator("article").filter({ has: choose });
    await card.scrollIntoViewIfNeeded();
    const photo = card.locator("img");
    await expect.poll(() => imageSource(photo)).toBe(fallback ? kit.fallbackImage : kit.image);
    await expect
      .poll(() => photo.evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await choose.click();
    await expect(
      page.locator("main aside").getByRole("link", { name: /ทำใบเสนอราคา/ }),
    ).toBeEnabled();
  }
  await page.screenshot({ path: test.info().outputPath("builder-cms-fallback-390.png") });
});
