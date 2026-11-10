import { expect, test } from "@playwright/test";
import { defaultNavigation } from "../../src/features/cms/data/navigation";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";

const labels = [
  "ผลิตภัณฑ์ทั้งหมด",
  ...productCategoryDefinitions.map(({ label }) => label),
  "จัดสเปค",
  "บริการ",
];
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 768, 833, 834, 1024, 1400, 1440, 1920]) {
  test(`Home Navbar spacing matches category and company pages at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const measurements = [];
    for (const route of ["/", "/products/category/scales", "/contact-us"]) {
      await page.goto(route);
      const home = route === "/";
      const header = page.locator(home ? ".site-header:visible" : "[data-products-header]:visible");
      await expect(header).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      measurements.push(
        await header.evaluate((element, home) => {
          const nav = element.querySelector(home ? ".header-inner" : "[data-products-nav]")!;
          const logo = nav.querySelector(home ? ".brand" : "a")!;
          const links = home ? nav.querySelectorAll(".desktop-nav > a") : nav.children[1].children;
          const rect = (node: Element) => {
            const { x, y, width, height } = node.getBoundingClientRect();
            return [x, y, width, height];
          };
          return [
            rect(element),
            rect(nav),
            rect(logo),
            ...Array.from(links, rect),
            ...Array.from(nav.lastElementChild!.querySelectorAll("button, .header-shop"), rect),
          ];
        }, home),
      );
      if (home) {
        await expect(header).toHaveAttribute("data-nav-tone", "dark");
        const top = await page
          .locator("[data-hero-scene]")
          .evaluate((el) => el.getBoundingClientRect().top);
        expect(Math.abs(top)).toBeLessThanOrEqual(1);
      }
      if (width === 1440)
        await page.screenshot({
          path: test
            .info()
            .outputPath(
              home ? "home.png" : route.includes("scales") ? "scales.png" : "contact.png",
            ),
        });
    }
    for (const reference of measurements.slice(1))
      for (let element = 0; element < reference.length; element++)
        for (let axis = 0; axis < 4; axis++)
          expect(
            Math.abs(measurements[0][element][axis] - reference[element][axis]),
          ).toBeLessThanOrEqual(1);
  });
}

for (const width of [1400, 1440, 1920]) {
  test(`Home shows all categories with dark Header and contained menus at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    const header = page.locator(".site-header:visible");
    await expect(header).toHaveAttribute("data-nav-tone", "dark");
    await expect(header).toHaveCSS("position", "fixed");
    await expect(header).toHaveCSS("height", "44px");
    await expect(header.locator(".nav-glass")).toHaveCSS(
      "background-color",
      "rgba(17, 17, 17, 0.5)",
    );
    await expect(header.locator(".desktop-nav > a")).toHaveText(labels);
    await page.evaluate(() => document.fonts.ready);
    const rectangles = await header.locator(".header-inner > *").evaluateAll((elements) =>
      elements.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, right: r.right, width: r.width };
      }),
    );
    for (let i = 1; i < rectangles.length; i++)
      expect(rectangles[i - 1].right).toBeLessThanOrEqual(rectangles[i].x + 1);
    const inner = await header.locator(".header-inner").boundingBox();
    expect(rectangles[0].x).toBeGreaterThanOrEqual(inner!.x - 1);
    expect(rectangles.at(-1)!.right).toBeLessThanOrEqual(inner!.x + inner!.width + 1);
    for (const { id, label } of productCategoryDefinitions) {
      const parent = header.locator(".desktop-nav").getByRole("link", { name: label, exact: true });
      await expect(parent).toHaveAttribute("href", `/products/category/${id}`);
      await parent.hover();
      const panel = header.locator(".submenu-panel.is-active");
      const expected = defaultNavigation[0]
        .groups!.flatMap(({ links }) => links)
        .filter((link) => new URLSearchParams(link.href.split("?")[1]).get("category") === id);
      await expect(panel.locator(".submenu-group-primary .submenu-links a")).toHaveText(
        expected.map(({ label }) => label),
      );
      await expect(panel.locator(".submenu-group-primary > p")).toHaveText(`สำรวจ${label}`);
      await expect(panel.locator(".submenu-group-secondary > p")).toHaveText([
        "การใช้งานและโซลูชัน",
        "ข้อมูลและความช่วยเหลือ",
      ]);
      await expect(panel.getByRole("link", { name: `ดู${label}ทั้งหมด`, exact: true })).toHaveCount(
        0,
      );
    }
    await header.locator(".desktop-nav").getByRole("link", { name: "บริการ", exact: true }).hover();
    const panel = header.locator(".submenu-panel.is-active");
    await expect(panel.getByRole("link", { name: "รู้จักซันฟอร์ด", exact: true })).toHaveAttribute(
      "href",
      "/about-us",
    );
    await expect(panel.getByRole("link", { name: "ติดต่อเรา", exact: true })).toHaveAttribute(
      "href",
      "/contact-us",
    );
    await page.keyboard.press("Escape");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath(`home-categories-${width}.png`) });
  });
}

for (const width of [390, 1440]) {
  test(`Home category names navigate directly at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const { id, label } of productCategoryDefinitions) {
      await page.goto("/");
      const header = page.locator(".site-header:visible");
      if (width < 834) await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      const parent =
        width < 834
          ? header.locator("#mobile-navigation").getByRole("link", { name: label, exact: true })
          : header.locator(".desktop-nav").getByRole("link", { name: label, exact: true });
      await parent.click();
      await expect(page).toHaveURL(new URL(`/products/category/${id}`, page.url()).href);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
      await expect(page.locator(".site-header:visible")).toHaveCount(0);
      await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
    }
  });
}

test("mobile native arrows expand children while names remain separate touch links", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 540 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");
  await page.getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
  const mobile = page.locator("#mobile-navigation");
  await expect(mobile.locator(".mobile-nav-category-link")).toHaveText(
    productCategoryDefinitions.map(({ label }) => label),
  );
  const group = mobile.locator(".mobile-nav-category").first();
  const arrow = group.locator("summary");
  const linkBox = await group.locator(".mobile-nav-category-link").boundingBox();
  const arrowBox = await arrow.boundingBox();
  expect(arrowBox!.width).toBeGreaterThanOrEqual(44);
  expect(linkBox!.x + linkBox!.width).toBeLessThanOrEqual(arrowBox!.x + 1);
  await arrow.tap();
  await expect(group.locator("details")).toHaveAttribute("open", "");
  const child = group.getByRole("link", { name: "งานครัวและกาแฟ", exact: true });
  await child.scrollIntoViewIfNeeded();
  await child.tap();
  await expect(page).toHaveURL(/\/products\/category\/scales\?subcategory=scale-kitchen$/);
  await expect(
    page.getByRole("dialog", { name: "ดูเครื่องชั่งทั้งหมด", exact: true }),
  ).toBeVisible();
  await context.close();
});

test("Home keyboard preserves parent navigation and first-child focus", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const parent = page
    .locator(".desktop-nav")
    .getByRole("link", { name: "เครื่องชั่ง", exact: true });
  await parent.focus();
  await page.keyboard.press("ArrowDown");
  const panel = page.locator(".submenu-panel.is-active");
  await expect(panel.getByRole("link", { name: "คำนวณราคาหน้าร้าน", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(parent).toBeFocused();
  await expect(page.locator("#desktop-submenu")).toHaveAttribute("aria-hidden", "true");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/products\/category\/scales$/);
});

test("Home category links work before hydration", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route(/\/_next\/static\/.*\.js(?:\?|$)/, async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "commit" });
    await expect(page.locator(".desktop-nav > a")).toHaveText(labels);
    const parent = page.locator('.desktop-nav a[href="/products/category/platforms"]');
    await expect(parent).toBeVisible();
    await parent.click({ noWaitAfter: true });
    await page.waitForURL(/\/products\/category\/platforms$/, { waitUntil: "commit" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("โครงสร้างแท่นชั่ง");
  } finally {
    release();
    await page.unrouteAll({ behavior: "wait" });
  }
});
