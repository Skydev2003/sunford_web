import { expect, test, type Page } from "@playwright/test";
import { recordStaggerMotion, type StaggerWindow } from "./helpers/stagger-motion";

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

for (const width of [320, 390, 734, 768, 834, 1024, 1068, 1440, 1521, 1920]) {
  test(`storefront and five actual product categories and existing chrome remain contained at ${width}px`, async ({
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
    await expect(sections.first().locator("h2 + span")).toHaveCount(0);
    await expect(sections.first().locator("ul")).toHaveCSS("scrollbar-width", "none");
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
    const actual = await sections.evaluateAll((nodes) =>
      nodes.map((section) =>
        [...section.querySelectorAll("[data-warehouse-sku]")].map((card) => ({
          sku: card.getAttribute("data-warehouse-sku"),
          href: card.querySelector("a")?.getAttribute("href"),
          specs: [...card.querySelectorAll("[data-product-spec]")].map((item) => item.textContent),
        })),
      ),
    );
    for (const shelf of actual) expect(shelf.length).toBeGreaterThan(0);
    const expected = products.map(
      (p: {
        warehouseSku: string;
        slug: string;
        warehouseCard?: { capacity: string; readability: string; connection: string };
      }) => ({
        sku: p.warehouseSku,
        href: `/products/${p.slug}`,
        specs: [
          p.warehouseCard?.capacity,
          p.warehouseCard?.readability,
          p.warehouseCard?.connection,
        ]
          .flatMap((value, index) =>
            value?.trim() && value.trim() !== "—"
              ? [`${["พิกัดชั่ง", "ความละเอียด", "การเชื่อมต่อ"][index]} ${value.trim()}`]
              : [],
          )
          .slice(0, 2),
      }),
    );
    expect(actual.flat()).toEqual(expect.arrayContaining(expected));
    await expect(directory.locator("[data-warehouse-sku]")).toHaveCount(products.length);
    await expect(
      directory.locator('[data-warehouse-sku] > a > svg[aria-hidden="true"]'),
    ).toHaveCount(products.length);
    await expect(directory).not.toContainText("Mock");
    await expect(
      directory.getByRole("link", { name: "ดูรุ่นสินค้าทั้งหมด", exact: true }),
    ).toHaveCount(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
    await expect(page.locator("[data-products-footer]:visible")).toHaveCount(1);
    const expectedLeft = Math.round((await directory.locator("h1").boundingBox())!.x);
    const leftEdges = await directory.evaluate((element) => {
      const selectors = ["[data-products-category-section] h2", "[data-warehouse-sku]"];
      return selectors.map((selector) =>
        Math.round(element.querySelector(selector)!.getBoundingClientRect().left),
      );
    });
    expect(leftEdges).toEqual(Array.from({ length: 2 }, () => expectedLeft));
    const geometry = await sections.first().evaluate((section) => {
      const heading = section.firstElementChild!.getBoundingClientRect();
      const rail = section.querySelector("ul")!;
      const card = rail.querySelector("li > a")!;
      const box = card.getBoundingClientRect();
      const chevron = card.querySelector("svg")!.getBoundingClientRect();
      return {
        chevron: [
          chevron.width,
          Math.round(box.right - chevron.right),
          Math.round(box.bottom - chevron.bottom),
        ],
        gap: getComputedStyle(rail).columnGap,
        padding: getComputedStyle(card).padding,
        width: box.width,
        height: box.height,
        headingGap:
          box.top -
          heading.bottom +
          parseFloat(getComputedStyle(section.firstElementChild!).paddingBottom),
      };
    });
    expect(geometry.gap).toBe(width >= 1024 ? "20px" : "16px");
    expect(geometry.chevron).toEqual(width >= 1024 ? [36, 20, 20] : [24, 16, 16]);
    expect(geometry.padding).toBe(width >= 1024 ? "28px" : "20px");
    expect(Math.abs(geometry.width - Math.min(width * 0.78, 384))).toBeLessThan(1);
    expect(geometry.height).toBeGreaterThanOrEqual(width >= 1024 ? 460 : 304);
    expect(geometry.headingGap).toBe(width >= 1024 ? 24 : 16);
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
    await page.screenshot({ path: test.info().outputPath(`products-store-${width}.png`) });
    expect(errors).toEqual([]);
  });
}

test("whole product card and corner chevron open the same SKU", async ({ page }) => {
  await page.goto("/products");
  const card = page.locator("[data-warehouse-sku] > a").first();
  const href = await card.getAttribute("href");
  await card.scrollIntoViewIfNeeded();
  const hits = await card.evaluate((link) => {
    const box = link.getBoundingClientRect();
    const samples = ["h3", "img", "svg"].map((selector) => {
      const rect = link.querySelector(selector)!.getBoundingClientRect();
      return [rect.left + rect.width / 2, rect.top + rect.height / 2];
    });
    samples.push([box.left + 24, box.top + 10]);
    return samples.map(([x, y]) => {
      const hit = document.elementFromPoint(x, y);
      return hit?.closest("a") === link && getComputedStyle(hit).cursor === "pointer";
    });
  });
  expect(hits).toEqual([true, true, true, true]);
  await card.hover();
  await expect(card).toHaveCSS("transform", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(card).toHaveCSS("transform", "matrix(1.01, 0, 0, 1.01, 0, 0)");
  const arrow = (await card.locator("svg").boundingBox())!;
  await page.mouse.click(arrow.x + arrow.width / 2, arrow.y + arrow.height / 2);
  await expect(page).toHaveURL((url) => url.pathname === href);
  await page.goBack();
  await card.focus();
  await card.press("Enter");
  await expect(page).toHaveURL((url) => url.pathname === href);
});

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
    ["อุตสาหกรรม", "/products/category/scales/industrial"],
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

test("Navbar hover reveals each submenu and honors reduced motion and keyboard input", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/products");
  await expect(page.locator('[data-products-overview][data-controls-ready="true"]')).toBeVisible();
  const nav = page.locator("[data-products-nav]");
  const scales = nav.getByRole("link", { name: "เครื่องชั่ง", exact: true });
  const indicators = nav.getByRole("link", { name: "อินดิเคเตอร์แท่นชั่ง", exact: true });
  const panel = page.locator("#products-navigation-panel");
  await scales.hover();
  await page.mouse.move(10, 400);
  await page.waitForTimeout(350);
  await expect(panel).toHaveCount(0);

  for (const [trigger, category] of [
    [scales, "scales"],
    [indicators, "indicators"],
  ] as const) {
    await trigger.hover();
    const menu = panel.locator(`[data-nav-menu="/products/category/${category}"]`);
    await expect(menu).toHaveAttribute("data-nav-hover-reveal");
    const entries = menu.locator('[data-nav-column="primary"] [data-nav-hover-item]');
    await expect(entries.first()).toHaveCSS("animation-duration", "0.32s");
    await expect(entries.first()).toHaveCSS(
      "animation-timing-function",
      "cubic-bezier(0.4, 0, 0.6, 1)",
    );
    await expect(entries.nth(1)).toHaveCSS("animation-delay", "0.02s");
    await expect(panel.locator("[data-nav-menu]")).toHaveCount(1);
  }
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await scales.press("ArrowDown");
  await expect(panel.locator("[data-nav-hover-item]").first()).toHaveCSS("animation-name", "none");
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.mouse.move(10, 400);
  await indicators.hover();
  await expect(panel.locator("[data-nav-hover-item]").first()).toHaveCSS("animation-name", "none");

  await page.goto("/products/category/scales");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("[data-products-header] button:visible").first()).toBeEnabled();
  await page.mouse.move(10, 400);
  await scales.hover();
  await expect(panel.locator("[data-nav-hover-item]").first()).toHaveCSS(
    "animation-name",
    "navHoverReveal",
  );
});

test("Navbar flyout on touch widths opens by tapping without hover animation", async ({
  browser,
  baseURL,
}) => {
  for (const width of [768, 390]) {
    const page = await browser.newPage({
      baseURL,
      viewport: { width, height: 900 },
      hasTouch: true,
    });
    try {
      await page.goto("/products");
      await page.getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
      await page.getByRole("button", { name: "เปิดเมนูย่อยเครื่องชั่ง", exact: true }).tap();
      await expect(page.locator("[data-nav-menu]")).toHaveCSS("animation-name", "none");
    } finally {
      await page.close();
    }
  }
});

test("storefront products are readable immediately in both motion modes", async ({ page }) => {
  await recordStaggerMotion(page);
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/products");
    const directory = page.locator("[data-products-directory]");
    await expect(directory.getByRole("heading", { level: 1 })).toBeInViewport();
    await directory.locator("[data-warehouse-sku]").last().scrollIntoViewIfNeeded();
    expect(
      await directory.evaluate(
        (root) =>
          (window as unknown as StaggerWindow).staggerAnimations.filter((animation) =>
            root.contains((animation.effect as KeyframeEffect).target),
          ).length,
      ),
    ).toBe(0);
  }
});

test("mobile product rail supports native horizontal keyboard scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products");
  const rail = page.locator("[data-products-category-section]").first().locator("ul");
  await rail.focus();
  await expect(rail).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBeGreaterThan(100);
  await page.keyboard.press("ArrowLeft");
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
  expect(html).not.toContain("data-products-index-carousel");
  expect(html).toContain('id="products-categories"');
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
