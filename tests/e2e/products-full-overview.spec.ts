import { expect, test, type Page } from "@playwright/test";
import { expectStaggerMotion, recordStaggerMotion } from "./helpers/stagger-motion";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function openScalesMenu(page: Page) {
  await expect(page.locator("[data-products-header]:visible button:visible").first()).toBeEnabled();
  const trigger = page
    .locator("[data-products-nav]")
    .getByRole("link", { name: "เครื่องชั่ง", exact: true });
  await trigger.focus();
  await trigger.press("ArrowDown");
  await expect(trigger).toHaveAttribute("aria-expanded", "true", { timeout: 1_000 });
  return page.locator("#products-navigation-panel");
}

for (const width of [320, 390, 734, 768, 834, 1024, 1068, 1440, 1920]) {
  test(`carousel and five actual product categories and existing chrome remain contained at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/products");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("ผลิตภัณฑ์ทั้งหมด");
    const directory = page.locator("[data-products-directory]");
    const sections = directory.locator("[data-products-category-section]");
    await expect(sections).toHaveCount(6);
    await expect(sections.locator("h2")).toHaveText([
      "เครื่องชั่ง",
      "อินดิเคเตอร์แท่นชั่ง",
      "โครงสร้างแท่นชั่ง",
      "ระบบ POS",
      "อุปกรณ์เสริม",
      "รายการอื่น ๆ",
    ]);
    const response = await page.request.get("/api/products");
    expect(response.ok()).toBe(true);
    const { products } = await response.json();
    for (const section of await sections.all()) {
      const cards = section.locator("[data-warehouse-sku]");
      expect(await cards.count()).toBeGreaterThan(0);
      for (const card of await cards.all()) {
        const sku = await card.getAttribute("data-warehouse-sku");
        const product = products.find(
          (product: { warehouseSku: string }) => product.warehouseSku === sku,
        );
        expect(product).toBeTruthy();
        await expect(card.getByRole("link").first()).toHaveAttribute(
          "href",
          `/products/${product.slug}`,
        );
      }
    }
    await expect(directory.locator("[data-warehouse-sku]")).toHaveCount(products.length);
    await expect(directory).not.toContainText("Mock");
    await expect(
      directory.getByRole("link", { name: "ดูรุ่นสินค้าทั้งหมด", exact: true }),
    ).toHaveCount(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
    await expect(page.locator("[data-products-footer]:visible")).toHaveCount(1);
    const expectedLeft = width <= 600 ? 32 : Math.max(48, (width - 1180) / 2);
    const leftEdges = await directory.evaluate((element) => {
      const selectors = ["[data-products-category-section] h2", "[data-warehouse-sku]"];
      return selectors.map((selector) =>
        Math.round(element.querySelector(selector)!.getBoundingClientRect().left),
      );
    });
    expect(leftEdges).toEqual(Array.from({ length: 2 }, () => expectedLeft));
    expect(
      await sections
        .first()
        .locator("ul")
        .evaluate((element) => element.scrollWidth > element.clientWidth),
    ).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: test.info().outputPath(`mock-sections-${width}.png`) });
    expect(errors).toEqual([]);
  });
}

test("direct all-model finder keeps search and legacy query entry", async ({ page }) => {
  await page.goto("/products?catalog=all");
  const finder = page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true });
  await expect(finder).toBeVisible();
  await expect(
    finder.getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true }).getByRole("button"),
  ).toHaveCount(5);
  await finder.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("WPS10KS");
  await expect(
    finder.getByRole("heading", { level: 3, name: "WPS10KS", exact: true }).first(),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(finder).not.toBeVisible();
  await page.goto("/products?category=scales&subcategory=scale-kitchen");
  await expect(page).toHaveURL(/\/products\/category\/scales\/kitchen$/);
  await expect(page.locator('[data-scale-subcategory-page="scale-kitchen"]')).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Navbar category/industrial navigation retains one active header/footer through history", async ({
  page,
}) => {
  await page.goto("/products");
  for (const [name, href] of [
    ["เครื่องชั่ง", "/products/category/scales"],
    ["อุตสาหกรรมงานผลิต", "/products/category/scales/industrial"],
  ]) {
    const panel = await openScalesMenu(page);
    if (name === "เครื่องชั่ง")
      await page.locator("[data-products-nav]").getByRole("link", { name, exact: true }).click();
    else await panel.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(href + "$"));
    await expect(page.locator(":is([data-products-header], .site-header):visible")).toHaveCount(1);
    await expect(page.locator(":is([data-products-footer], .site-footer):visible")).toHaveCount(1);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.goBack();
    await expect(page.locator("[data-products-directory]")).toBeVisible();
    await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
    await expect(page.locator("[data-products-footer]:visible")).toHaveCount(1);
  }
});

test("actual product cards use the existing viewport entrance and reduced-motion opt-out", async ({
  page,
}) => {
  await recordStaggerMotion(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/products");
  const firstCard = page.locator("[data-warehouse-sku]").first();
  await firstCard.scrollIntoViewIfNeeded();
  await expectStaggerMotion(firstCard);
  const laterCard = page.locator("[data-products-category-section]").last().locator("li").first();
  expect(
    await laterCard.evaluate(
      (element) =>
        element.getAnimations().filter((animation) => animation.id === "sunford-stagger-bounce")
          .length,
    ),
  ).toBe(0);
  await laterCard.scrollIntoViewIfNeeded();
  await expectStaggerMotion(laterCard);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  expect(
    await page
      .locator("[data-warehouse-sku]")
      .first()
      .evaluate(
        (element) =>
          element.getAnimations().filter((animation) => animation.id === "sunford-stagger-bounce")
            .length,
      ),
  ).toBe(0);
});

test("mobile product rail supports native horizontal keyboard scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products");
  const rail = page.locator("[data-products-category-section]").first().locator("ul");
  await rail.focus();
  await expect(rail).toBeFocused();
  for (let press = 0; press < 12; press++) await page.keyboard.press("ArrowRight");
  await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBeGreaterThan(100);
  for (let press = 0; press < 12; press++) await page.keyboard.press("ArrowLeft");
  await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBe(0);
  await expect(rail).toHaveCSS("scroll-snap-type", /x mandatory|inline mandatory/);
});

test("server response contains actual category products without motion hiding", async ({
  request,
}) => {
  const response = await request.get("/products");
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain("ผลิตภัณฑ์ทั้งหมด");
  expect(html).toContain("data-products-index-carousel");
  for (const category of [
    "เครื่องชั่ง",
    "อินดิเคเตอร์แท่นชั่ง",
    "โครงสร้างแท่นชั่ง",
    "ระบบ POS",
    "อุปกรณ์เสริม",
  ])
    expect(html).toContain(category);
  expect(html).toContain('data-warehouse-sku="G106308"');
  expect(html).not.toContain("รอเพิ่มเนื้อหาหลัก");
  expect(html).toContain("data-products-category-section");
  expect(html).toContain("data-warehouse-sku");
  expect(html).not.toContain("data-stagger-bounce=");
});

test("shared scales hero pauses for reduced motion, supports keyboard tabs, play and offscreen pause", async ({
  page,
}) => {
  await page.goto("/products/category/scales");
  const hero = page.locator('[data-overview-section="hero"]');
  const tabs = hero.getByRole("tab");
  await expect(
    hero.getByRole("button", { name: "เล่นแกลเลอรีสินค้าเด่น", exact: true }),
  ).toBeVisible();
  await expect(tabs.first()).toBeEnabled();
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await hero.getByRole("button", { name: "เล่นแกลเลอรีสินค้าเด่น", exact: true }).click();
  await expect(
    hero.getByRole("button", { name: "หยุดแกลเลอรีสินค้าเด่น", exact: true }),
  ).toBeVisible();
  await page.locator("[data-products-footer]").scrollIntoViewIfNeeded();
  await expect(
    hero.getByRole("button", { name: "เล่นแกลเลอรีสินค้าเด่น", exact: true }),
  ).toHaveCount(1);
});

test.describe("shared scales gallery touch gestures", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("native swipe moves the hero while vertical page scrolling remains available", async ({
    page,
    context,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/products/category/scales");
    const track = page.locator('[data-overview-section="hero"] ul');
    await track.scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("button", { name: "หยุดแกลเลอรีสินค้าเด่น", exact: true }),
    ).toBeVisible();
    await page.bringToFront();
    const session = await context.newCDPSession(page);
    const swipe = async (dx: number, dy: number) => {
      const bounds = (await track.boundingBox())!;
      const x = dx ? 300 : 195;
      const y = Math.max(100, Math.min(700, bounds.y + bounds.height / 2));
      await session.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
      });
      for (let step = 1; step <= 8; step++) {
        await session.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: x + (dx * step) / 8, y: y + (dy * step) / 8 }],
        });
        await page.waitForTimeout(16);
      }
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(250);
    };
    await swipe(-240, 0);
    await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(100);
    await expect(
      page.getByRole("button", { name: "เล่นแกลเลอรีสินค้าเด่น", exact: true }),
    ).toBeVisible();
    await track.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => scrollY);
    await swipe(0, -120);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath("native-touch-gallery.png") });
    await session.detach();
  });
});
