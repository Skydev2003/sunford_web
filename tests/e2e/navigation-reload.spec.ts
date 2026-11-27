import { expect, test, type Page } from "@playwright/test";

const errors = new WeakMap<Page, string[]>();

async function homeReady(page: Page) {
  await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-enhanced", "true");
  await expect(page.locator("[data-brand-opening]")).toHaveCount(0);
}

test.beforeEach(({ page }) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on("pageerror", (error) => messages.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat/i.test(message.text())) messages.push(message.text());
  });
});

test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
});

for (const width of [1440, 390]) {
  test(`Back returns to the Hero at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await homeReady(page);
    const initial = await page.evaluate(() => performance.timeOrigin);
    await page.locator('[data-hero-scene] a[href="/service?section=contact"]').click();
    await expect(page).toHaveURL(/\/service\?section=contact$/);
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(initial);
    await page.goBack();
    await homeReady(page);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await page.goForward();
    await expect(page).toHaveURL(/\/service\?section=contact$/);
    await page
      .locator(
        '.site-header .brand:visible, [data-products-header]:visible a[aria-label="SUNFORD หน้าแรก"]',
      )
      .click();
    await homeReady(page);
  });
}

test("Back from a product preserves the homepage scroll position", async ({ page }) => {
  await page.goto("/");
  await homeReady(page);
  const product = page.locator(".product-spotlight .spotlight-visual");
  await product.scrollIntoViewIfNeeded();
  const previousScroll = await page.evaluate(() => scrollY);
  expect(previousScroll).toBeGreaterThan(100);
  const destination = await page.request.get((await product.getAttribute("href"))!);
  expect(destination.ok()).toBe(true);
  await product.click();
  await expect(page).toHaveURL(destination.url());
  await page.goBack();
  await homeReady(page);
  await expect
    .poll(async () => Math.abs((await page.evaluate(() => scrollY)) - previousScroll))
    .toBeLessThan(2);
});

test("reloads a scrolled homepage directly at the Hero", async ({ page }) => {
  await page.goto("/");
  await homeReady(page);
  await page.locator("#stories").scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100);
  await page.reload({ waitUntil: "domcontentloaded" });
  await homeReady(page);
  await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe("auto");
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator("[data-hero-scene]")).toBeInViewport();
  await page.locator("#stories").scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100);
});

test("reloads an anchored homepage at the Hero while preserving query parameters", async ({
  page,
}) => {
  await page.goto("/?source=reload-test#stories");
  await homeReady(page);
  await page.locator("#stories").scrollIntoViewIfNeeded();
  await expect(page.locator("#stories")).toBeInViewport();
  await page.reload({ waitUntil: "domcontentloaded" });
  await homeReady(page);
  await expect(page).toHaveURL(/\/\?source=reload-test$/);
  await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe("auto");
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});

for (const route of [
  "/products",
  "/products/warehouse-G106094",
  "/service?section=contact",
  "/service",
]) {
  test(`refresh starts ${route} at its own top`, async ({ page }) => {
    await page.goto(`${route}?source=reload-test#contact`);
    const current = new URL(page.url());
    current.hash = "";
    await page.locator("footer:visible").scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(current.href);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator("[data-brand-opening]")).toHaveCount(0);
    await expect(
      page.locator(
        '.site-header .brand:visible, [data-products-header]:visible a[aria-label="SUNFORD หน้าแรก"]',
      ),
    ).toBeVisible();
    await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe("auto");
    await page.locator("footer").scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100);
  });
}

test("the homepage is usable after document history traversal", async ({ page }) => {
  await page.goto("/");
  await homeReady(page);
  await page.goto("/service?section=contact");
  await page.goBack();
  await homeReady(page);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe(
    "hidden",
  );
});
