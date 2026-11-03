import { expect, test, type Page } from "@playwright/test";

type OpeningProbe = { starts: number; watch: boolean; covered: boolean; documentId: string };
const errors = new WeakMap<Page, string[]>();

const probe = (page: Page) =>
  page.evaluate(() => (window as unknown as { openingProbe: OpeningProbe }).openingProbe);

async function homeReady(page: Page) {
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete", {
    timeout: 10000,
  });
  await expect(page.locator("[data-brand-opening]")).toBeHidden();
  await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-ready", "true");
}

test.beforeEach(async ({ page }) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on("pageerror", (error) => messages.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat/i.test(message.text())) messages.push(message.text());
  });
  await page.addInitScript(() => {
    const state = { starts: 0, watch: false, covered: false, documentId: crypto.randomUUID() };
    Object.assign(window, { openingProbe: state });
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      if (this.matches("[data-brand-opening-logo]")) state.starts++;
      return animate.call(this, keyframes, options);
    };
    const sample = () => {
      const opening = document.querySelector("[data-brand-opening]");
      if (state.watch && opening) {
        const style = getComputedStyle(opening);
        if (style.display !== "none" && style.visibility === "visible") state.covered = true;
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
});

test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
});

for (const width of [1440, 390]) {
  test(`Back at the Hero skips the opening at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await homeReady(page);
    const initial = await probe(page);
    expect(initial.starts).toBe(1);
    await page.evaluate(() => {
      (window as unknown as { openingProbe: OpeningProbe }).openingProbe.watch = true;
    });
    await page.locator('[data-hero-scene] a[href="/contact-us"]').click();
    await expect(page).toHaveURL(/\/contact-us$/);
    expect((await probe(page)).documentId).toBe(initial.documentId);
    await page.goBack();
    await homeReady(page);
    expect((await probe(page)).starts).toBe(1);
    expect((await probe(page)).covered).toBe(false);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await page.goForward();
    await expect(page).toHaveURL(/\/contact-us$/);
    await page.locator(".site-header .brand").click();
    await homeReady(page);
    expect((await probe(page)).starts).toBe(1);
    expect((await probe(page)).covered).toBe(false);
  });
}

test("Back from a product preserves the homepage scroll position without replaying", async ({
  page,
}) => {
  await page.goto("/");
  await homeReady(page);
  const product = page.locator(".product-spotlight .spotlight-visual");
  await product.scrollIntoViewIfNeeded();
  const previousScroll = await page.evaluate(() => scrollY);
  expect(previousScroll).toBeGreaterThan(100);
  await product.click();
  await expect(page).toHaveURL(/\/products\/acs30-jc21$/);
  await page.goBack();
  await homeReady(page);
  expect((await probe(page)).starts).toBe(1);
  await expect
    .poll(async () => Math.abs((await page.evaluate(() => scrollY)) - previousScroll))
    .toBeLessThan(2);
});

test("reloads a scrolled homepage at the Hero and plays the opening again", async ({ page }) => {
  await page.goto("/");
  await homeReady(page);
  await page.locator("#stories").scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100);
  await page.reload({ waitUntil: "domcontentloaded" });
  await homeReady(page);
  expect((await probe(page)).starts).toBe(1);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(await page.evaluate(() => history.scrollRestoration)).toBe("auto");
  await expect(page.locator("[data-hero-scene]")).toBeInViewport();
  await page.locator("#stories").scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100);
});

test("reloads an anchored homepage at the Hero while preserving query parameters", async ({
  page,
}) => {
  await page.goto("/?source=reload-test#stories");
  await homeReady(page);
  expect((await probe(page)).starts).toBe(0);
  await expect(page.locator("#stories")).toBeInViewport();
  await page.reload({ waitUntil: "domcontentloaded" });
  await homeReady(page);
  await expect(page).toHaveURL(/\/\?source=reload-test$/);
  expect((await probe(page)).starts).toBe(1);
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

for (const route of ["/products", "/products/acs30-jc21", "/contact-us", "/service"]) {
  test(`refresh starts ${route} at its own top`, async ({ page }) => {
    await page.goto(`${route}?source=reload-test#contact`);
    await page.locator("footer").scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(new RegExp(`${route}\\?source=reload-test$`));
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator("[data-brand-opening]")).toHaveCount(0);
    await expect(page.locator(".site-header .brand")).toBeVisible();
    expect((await probe(page)).starts).toBe(0);
    await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe("auto");
    await page.locator("footer").scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100);
  });
}

test("document history traversal does not restart the opening", async ({ page }) => {
  await page.goto("/");
  await homeReady(page);
  const initialDocument = (await probe(page)).documentId;
  await page.goto("/contact-us");
  await page.goBack();
  await homeReady(page);
  const restored = await probe(page);
  expect(restored.starts).toBe(restored.documentId === initialDocument ? 1 : 0);
  expect(await page.evaluate(() => document.documentElement.dataset.homeOpening)).toBe("skip");
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe(
    "hidden",
  );
});
