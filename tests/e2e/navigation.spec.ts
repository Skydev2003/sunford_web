import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { getPrimaryNavigationItems } from "../../src/features/site/data/primary-navigation";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});
const labels = [
  "ผลิตภัณฑ์ทั้งหมด",
  ...productCategoryDefinitions.map(({ label }) => label),
  "จัดสเปค",
  "บริการ",
];
const menus = getPrimaryNavigationItems(defaultNavigation).map((item) => ({
  label: item.label,
  groups: item.groups!.map((group) => group.label),
}));
for (const width of [1440, 390]) {
  test(`primary product links match the catalog and select each real family at ${width}px`, async ({
    page,
  }) => {
    test.slow();
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const { id, label } of productCategoryDefinitions) {
      await page.goto("/");
      if (width < 1024) await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      const nav = page.locator(width < 1024 ? "#products-navigation-panel" : ".desktop-nav");
      const parent = nav.getByRole("link", { name: label, exact: true });
      await expect(parent).toHaveAttribute("href", `/products/category/${id}`);
      await parent.click();
      await expect(page).toHaveURL(new URL(`/products/category/${id}`, page.url()).href);
      const chapters = page.locator('[data-overview-section="chapters"]:visible');
      await expect(chapters.getByRole("heading", { level: 1, name: label })).toBeVisible();
      await expect(chapters.getByRole("link", { name: "สินค้าทั้งหมด", exact: true })).toHaveCount(
        0,
      );
      if (width < 1024) await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      await page
        .locator(width < 1024 ? "#products-navigation-panel" : "[data-products-nav]:visible")
        .getByRole("link", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true })
        .click();
      await expect(page).toHaveURL(/\/products$/);
      await expect(page.locator("[data-products-directory]:visible")).toBeVisible();
      await page.goBack();
      await expect(page).toHaveURL(new URL(`/products/category/${id}`, page.url()).href);
      if (id !== "accessories") {
        await expect(
          page.getByRole("heading", { level: 1, name: label, exact: true }),
        ).toBeVisible();
        await expect(page.locator("#products-lineup > li:has(h3)").first()).toBeVisible();
        await expect(
          page.locator(
            `[data-overview-category="${id}"]:visible [data-return-scope="catalog-finder"]`,
          ),
        ).toHaveCount(0);
        continue;
      }
      await page
        .locator('[data-overview-section="lineup"]')
        .getByRole("button", { name: `ดู${label}ทั้งหมด`, exact: true })
        .click();
      const catalog = page
        .getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" })
        .filter({ visible: true });
      await expect(
        catalog.getByRole("heading", { level: 2, name: label, exact: true }),
      ).toBeVisible();
      await expect(catalog.locator("#mock-product-results article").first()).toBeVisible();
      await expect(
        catalog
          .getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true })
          .getByRole("button", { name: label, exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await page.keyboard.press("Escape");
    }
    if (width < 1024) await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
    await page
      .locator(width < 1024 ? "#products-navigation-panel" : "[data-products-nav]:visible")
      .getByRole("link", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true })
      .click();
    await expect(page).toHaveURL(/\/products$/);
    await expect(
      page
        .locator("main:visible")
        .getByRole("heading", { level: 1, name: "เครื่องชั่งน้ำหนักล้ำสมัย", exact: true }),
    ).toBeAttached();
    await expect(
      page
        .locator("main:visible")
        .getByRole("list", { name: "เครื่องชั่ง", exact: true })
        .getByRole("link")
        .first(),
    ).toBeVisible();
    await page.screenshot({ path: test.info().outputPath(`selected-family-${width}.png`) });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
  });
}

test("catalog category URLs support direct entry, refresh, local changes and browser history", async ({
  page,
  browser,
  baseURL,
}) => {
  test.slow();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/products?category=pos");
  const catalog = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  await expect(catalog.getByRole("heading", { level: 2 })).toHaveText("ระบบ POS");
  await page.reload();
  await expect(catalog.getByRole("heading", { level: 2 })).toHaveText("ระบบ POS");
  const parents = catalog.getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true });
  await parents.getByRole("button", { name: "โครงสร้างแท่นชั่ง", exact: true }).click();
  await expect(page).toHaveURL(/\/products\?category=platforms$/);
  await page.goto("/products?category=pos");
  await expect(page).toHaveURL(/\/products\?category=pos$/);
  await expect(catalog.getByRole("heading", { level: 2 })).toHaveText("ระบบ POS");
  await page.goBack();
  await expect(page).toHaveURL(/\/products\?category=platforms$/);
  await expect(catalog.getByRole("heading", { level: 2 })).toHaveText("โครงสร้างแท่นชั่ง");
  await catalog.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(catalog).not.toBeVisible();
  await expect(page.locator("main:visible").getByRole("heading", { level: 1 })).toHaveText(
    "ผลิตภัณฑ์ทั้งหมด",
  );
  await page.goto("/products?category=not-a-real-family");
  await expect(catalog.getByRole("heading", { level: 2 })).toHaveText("ผลิตภัณฑ์ทั้งหมด");
  await expect(catalog.locator("article")).toHaveCount(24);
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto("/products", { waitUntil: "domcontentloaded" });
    // Check server HTML; streamed content can remain hidden with scripting disabled.
    await expect(staticPage.locator("h1")).toHaveText("ผลิตภัณฑ์ทั้งหมด");
    for (const { id } of productCategoryDefinitions)
      await expect(
        staticPage.locator(`[data-products-nav] a[href="/products/category/${id}"]`),
      ).toHaveCount(1);
  } finally {
    await context.close();
  }
});

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("navigation changes mode at 1024px and closes menus when the layout changes", async ({
  page,
}) => {
  for (const route of ["/", "/products", "/service?section=contact"]) {
    const home = route === "/";
    const breakpoint = 1024;
    await page.setViewportSize({ width: breakpoint - 1, height: 540 });
    await page.goto(route);
    const header = page.locator(home ? ".site-header:visible" : "[data-products-header]:visible");
    const toggle = header.getByRole("button", { name: "เปิดเมนู", exact: true });
    await toggle.click();
    const mobile = header.locator("#products-navigation-panel");
    await expect(mobile).toBeVisible();
    expect(await mobile.evaluate((n) => n.clientHeight <= innerHeight - 43)).toBe(true);
    await page.setViewportSize({ width: breakpoint, height: 900 });
    await expect(mobile).toHaveCount(0);
    const desktop = header.getByRole("link", { name: "เครื่องชั่ง", exact: true });
    await expect(desktop).toBeVisible();
    await page.keyboard.press("Tab");
    await desktop.press("ArrowDown");
    await expect(desktop).toHaveAttribute("aria-expanded", "true");
    await page.setViewportSize({ width: breakpoint - 1, height: 900 });
    await expect(mobile).toHaveCount(0);
    await expect(toggle).toBeVisible();
  }
});

test("eight company menus expose real destinations without calibration or a top bar", async ({
  page,
  request,
}) => {
  test.slow();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".desktop-nav > a")).toHaveText(labels);
  await expect(page.locator(".site-header")).not.toContainText(/สอบเทียบ|calibration/i);
  expect(
    await page.locator(".header-inner").evaluate((el) => el.getBoundingClientRect().height),
  ).toBeLessThanOrEqual(58);
  await expect(page.locator(".nav-glass")).toHaveCSS("backdrop-filter", "blur(12px)");
  const destinations = new Map<string, string>();
  for (const menu of menus) {
    await page.locator(".desktop-nav").getByRole("link", { name: menu.label, exact: true }).hover();
    const panel = page.locator("[data-nav-menu]");
    await expect(
      panel.locator('[data-nav-column]:not([data-nav-column="primary"]) > p'),
    ).toHaveText(menu.groups);
    const links = await panel
      .locator("a")
      .evaluateAll((elements) => elements.map((el) => el.getAttribute("href")!));
    for (const href of links) {
      const target = new URL(href, page.url());
      expect(target.origin).toBe(new URL(page.url()).origin);
      if (!destinations.has(target.pathname)) {
        const response = await request.get(target.pathname);
        expect(response.status(), href).toBe(200);
        destinations.set(target.pathname, await response.text());
      }
      if (target.hash) {
        const fragment = `id="${target.hash.slice(1)}"`;
        expect(destinations.get(target.pathname)?.includes(fragment), href).toBe(true);
      }
    }
  }
  await page.locator('[data-products-nav] > a[href="/"]').focus();
  await expect(page.locator("#products-navigation-panel")).toBeHidden();
  await page
    .locator(".desktop-nav")
    .getByRole("link", { name: "บริการ", exact: true })
    .press("ArrowDown");
  await page
    .locator("[data-nav-menu]")
    .getByRole("link", { name: "ติดต่อเรา", exact: true })
    .click();
  await expect(page).toHaveURL(/\/service\?section=contact$/);
  await test.info().attach("verified-destinations.json", {
    body: JSON.stringify([...destinations.keys()], null, 2),
    contentType: "application/json",
  });
  await writeFile(
    test.info().outputPath("verified-destinations.json"),
    JSON.stringify([...destinations.keys()], null, 2),
  );
});

test("mobile groups expand with the keyboard, close on Escape and navigate to a real indicator", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "เปิดเมนู", exact: true });
  await toggle.click();
  const mobile = page.locator("#products-navigation-panel");
  await expect(mobile.locator("[data-nav-category-row]")).toHaveCount(8);
  await expect(mobile.locator("[data-nav-category-row] > a")).toHaveText(labels);
  const indicators = mobile.getByRole("button", {
    name: "เปิดเมนูย่อยอินดิเคเตอร์แท่นชั่ง",
    exact: true,
  });
  await indicators.press("Enter");
  await expect(mobile.getByRole("button", { name: "เมนูหลัก", exact: true })).toBeFocused();
  await expect(mobile.getByRole("link", { name: "LCD", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(mobile).toHaveCount(0);
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page
    .locator('#products-navigation-panel button[aria-label="เปิดเมนูย่อยอินดิเคเตอร์แท่นชั่ง"]')
    .click();
  await page
    .locator("#products-navigation-panel")
    .getByRole("link", { name: "LCD", exact: true })
    .click();
  await expect(page).toHaveURL(/\/products\/category\/indicators\/lcd#product-listing-indicators$/);
  await expect(page.locator("#products-navigation-panel")).toHaveCount(0);
});

test("mobile software and warranty links remain reachable in a short viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 540 });
  await page.goto("/");
  await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  const mobile = page.locator("#products-navigation-panel");
  const serviceMenu = mobile.locator('button[aria-label="เปิดเมนูย่อยบริการ"]');
  await serviceMenu.click();
  await mobile.getByRole("link", { name: "ดาวน์โหลดซอฟต์แวร์", exact: true }).click();
  await expect(page).toHaveURL("/software/download");
  await expect(page.getByRole("main").locator("#retail-software")).toBeVisible();
  await expect(mobile).toHaveCount(0);
  await page.goto("/");
  await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  await serviceMenu.click();
  await mobile.getByRole("link", { name: "ลงทะเบียนรับประกัน", exact: true }).click();
  await expect(page).toHaveURL(/\/warranty\/register$/);
  await expect(mobile).toHaveCount(0);
});

for (const route of ["/", "/service?section=contact"]) {
  test(`all flyout headings and first links align with the logo on ${route}`, async ({ page }) => {
    const home = route === "/";
    await page.goto(route);
    if (home)
      await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
    const nav = page.locator(home ? ".desktop-nav" : "[data-products-nav]");
    const logo = page.locator(home ? ".brand" : '[data-products-nav] a[href="/"]');
    const panel = page.locator(home ? "[data-nav-menu]" : "#products-navigation-panel");
    for (const width of [834, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const { label } of menus) {
        const trigger = nav.getByText(label, { exact: true });
        await trigger.press("ArrowDown");
        await expect(trigger).toHaveAttribute("aria-expanded", "true");
        const firstLink = panel.locator("a:visible").first();
        await expect(firstLink).toBeFocused();
        const logoX = (await logo.boundingBox())!.x;
        const firstChoice = panel.locator('[data-nav-column="primary"]').getByRole("link").first();
        for (const text of [panel.locator("p:visible").first(), firstChoice]) {
          expect(Math.abs((await text.boundingBox())!.x - logoX), label).toBeLessThanOrEqual(1);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width,
        );
        await page.keyboard.press("Escape");
      }
    }
  });
}

test("wide menus fit the viewport and preserve the logo-aligned origin and hover motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
  for (const width of [1400, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const label of ["เครื่องชั่ง", "โครงสร้างแท่นชั่ง", "บริการ"]) {
      const trigger = page.locator(".desktop-nav").getByRole("link", { name: label, exact: true });
      await trigger.hover();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      const panel = page.locator("[data-nav-menu]");
      await expect(panel).toBeVisible();
      const bounds = (await panel.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(23);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 23);
      const primary = (await panel.locator('[data-nav-column="primary"]').boundingBox())!;
      const logo = (await page.locator('[data-products-nav] > a[href="/"]').boundingBox())!;
      expect(Math.abs(primary.x - logo.x)).toBeLessThan(1);
      const link = panel.locator("[data-nav-column] a").first();
      const before = (await link.boundingBox())!;
      await link.hover();
      await expect(link.locator("span")).toHaveCSS("transform", "matrix(1.06, 0, 0, 1.06, 0, 0)");
      expect((await link.boundingBox())!.width).toBeCloseTo(before.width, 1);
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.locator('[data-nav-menu] [data-nav-column="primary"] a').first().locator("span"),
  ).toHaveCSS("transform", "none");
  await page.keyboard.press("Escape");
  await expect(page.locator("#products-navigation-panel")).toBeHidden();
});

test("product buying guides and responsive layouts remain available", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/guides/pos#systems");
  await expect(page).toHaveURL("/technical-specification?guide=pos#systems");
  await expect(page.locator("#systems h2")).toHaveText("เปรียบเทียบ Android / Windows");
  for (const width of [320, 390, 768, 1100, 1399, 1400, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test("desktop company destinations remain available before hydration", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route(/\/_next\/static\/.*\.js(?:\?|$)/, async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "commit" });
    await expect(page.locator(".desktop-nav > a")).toHaveText(labels);
    await expect(page.locator('.desktop-nav a[href="/products/category/scales"]')).toBeVisible();
    await page.locator('.desktop-nav a[href="/service"]').click({ noWaitAfter: true });
    await page.waitForURL(/\/service$/, { waitUntil: "commit" });
    await expect(page.locator("main")).toBeVisible();
  } finally {
    release();
    await page.unrouteAll({ behavior: "wait" });
  }
});
