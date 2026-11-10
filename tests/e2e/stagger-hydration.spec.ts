import { expect, test, type Page } from "@playwright/test";
import {
  expectStaggerMotion,
  recordStaggerMotion,
  type StaggerWindow,
} from "./helpers/stagger-motion";

test.skip(
  process.env.STAGGER_DEV_QA !== "1",
  "Run against a real Next development server with STAGGER_DEV_QA=1",
);

async function probe(page: Page) {
  const errors: string[] = [];
  const delayed: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydrat|server rendered HTML|didn.t match/i.test(message.text())
    )
      errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await recordStaggerMotion(page);
  await page.addInitScript(() => {
    Object.assign(window, { staggerMarkerWrites: 0 });
    new MutationObserver((records) => {
      for (const record of records)
        if (record.attributeName === "data-stagger-bounce")
          Reflect.set(
            window,
            "staggerMarkerWrites",
            Reflect.get(window, "staggerMarkerWrites") + 1,
          );
    }).observe(document, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-stagger-bounce"],
    });
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.route("**/*.js", async (request) => {
    const response = await request.fetch();
    const body = await response.text();
    if (
      /function (ProductsOverview|SoftwareCatalog|AfterSalesPage|ProductCategoryMock|ProductGallery)\(/.test(
        body,
      ) &&
      !body.includes("function CatalogRouteFrame(")
    ) {
      delayed.push(new URL(request.request().url()).pathname);
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
    await request.fulfill({ response, body });
  });
  return { errors, delayed };
}

async function clean(page: Page, errors: string[]) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  expect(errors).toEqual([]);
  await expect(page.locator("[data-stagger-bounce]")).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, "staggerMarkerWrites"))).toBe(0);
}

for (const route of ["/products/category/scales", "/software/download", "/service"]) {
  test(`development delayed child hydration stays clean on cold load and reload: ${route}`, async ({
    page,
  }) => {
    test.setTimeout(240000);
    await page.setViewportSize({ width: 1440, height: 1000 });
    const state = await probe(page);
    for (const reload of [false, true]) {
      if (reload) await page.reload({ waitUntil: "load" });
      else await page.goto(route, { waitUntil: "load" });
      await expect(page.locator('[data-stagger-bounce-root="enabled"]')).toHaveCount(1);
      if (route.includes("scales")) {
        await expect(page.locator('[data-overview-category="scales"]')).toHaveAttribute(
          "data-controls-ready",
          "true",
          { timeout: 45000 },
        );
        await expectStaggerMotion(page.locator("#products-title"));
        const open = page
          .getByRole("button", { name: "ดูเครื่องชั่งทั้งหมด", exact: true })
          .first();
        await open.click();
        await expect(
          page.getByRole("dialog", { name: "ดูเครื่องชั่งทั้งหมด", exact: true }),
        ).toBeVisible();
        await page.keyboard.press("Escape");
      } else if (route.includes("software")) {
        const filter = page.locator(".software-filters a").nth(1);
        await filter.click();
        await expect(filter).toHaveAttribute("aria-current", "true");
      } else {
        const tab = page.getByRole("tab").nth(1);
        await tab.click();
        await expect(tab).toHaveAttribute("aria-selected", "true");
      }
      expect(
        await page.evaluate(() => (window as unknown as StaggerWindow).staggerAnimations.length),
      ).toBeGreaterThan(0);
      await clean(page, state.errors);
    }
    expect(state.delayed.length).toBeGreaterThan(0);
    await test.info().attach("development-hydration.json", {
      body: JSON.stringify({ route, ...state }),
      contentType: "application/json",
    });
  });
}

for (const width of [390, 1440]) {
  test(`development client navigation, gallery and cached history stay clean at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 1000 });
    const state = await probe(page);
    await page.goto("/products/category/scales/benchtop", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" })).toBeVisible({
      timeout: 45000,
    });
    await expectStaggerMotion(page.locator("main h1"));
    const product = page.locator('#mock-product-results a[href^="/products/"]').first();
    const href = await product.getAttribute("href");
    await product.click();
    await expect(page).toHaveURL(new URL(href!, page.url()).href, { timeout: 30000 });
    const thumbnail = page.locator(".gallery-thumbnails button").last();
    await thumbnail.click();
    await expect(thumbnail).toHaveAttribute("aria-pressed", "true");
    await clean(page, state.errors);
    await page.goBack();
    await expect(page.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" })).toBeVisible();
    await clean(page, state.errors);
    await page.goForward();
    await expect(page.locator(".product-gallery")).toBeVisible();
    await thumbnail.click();
    await expect(thumbnail).toHaveAttribute("aria-pressed", "true");
    await clean(page, state.errors);
    expect(state.delayed.length).toBeGreaterThan(0);
  });
}
