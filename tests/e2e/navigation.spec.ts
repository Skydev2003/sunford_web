import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});
const labels = [
  "ผลิตภัณฑ์ทั้งหมด",
  ...productCategoryDefinitions.map(({ label }) => label),
  "จัดสเปค",
  "บริการ",
];
const menus = [
  { label: "ผลิตภัณฑ์ทั้งหมด", groups: ["ลิงก์ด่วน", "บริการและความช่วยเหลือ"] },
  ...productCategoryDefinitions.map(({ label }) => ({
    label,
    groups: ["การใช้งานและโซลูชัน", "ข้อมูลและความช่วยเหลือ"],
  })),
  { label: "บริการ", groups: ["ข้อมูลและความช่วยเหลือ", "บริษัท"] },
];
for (const width of [1440, 390]) {
  test(`primary product links match the catalog and select each real family at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const { id, label } of productCategoryDefinitions) {
      await page.goto("/");
      if (width < 834) await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      const nav = page.locator(width < 834 ? "#mobile-navigation" : ".desktop-nav");
      const parent = nav.getByRole("link", { name: label, exact: true });
      await expect(parent).toHaveAttribute("href", `/products/category/${id}`);
      await parent.click();
      await expect(page).toHaveURL(new URL(`/products/category/${id}`, page.url()).href);
      const local = ["scales", "indicators", "platforms", "pos", "accessories"].includes(id);
      if (local)
        await page
          .locator('[data-overview-section="lineup"]')
          .getByRole("button", { name: `ดู${label}ทั้งหมด`, exact: true })
          .click();
      const catalog = page
        .getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" })
        .filter({ visible: true });
      await expect(
        catalog.getByRole("heading", { level: local ? 2 : 1, name: label, exact: true }),
      ).toBeVisible();
      await expect(catalog.locator("#mock-product-results article").first()).toBeVisible();
      if (local) {
        await expect(
          catalog
            .getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true })
            .getByRole("button", { name: label, exact: true }),
        ).toHaveAttribute("aria-pressed", "true");
        await page.keyboard.press("Escape");
      }
    }
    await page
      .locator('[data-overview-section="chapters"]')
      .getByRole("link", { name: "สินค้าทั้งหมด", exact: true })
      .click();
    await expect(page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "ผลิตภัณฑ์ทั้งหมด", exact: true }),
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
  await expect(catalog.getByRole("heading", { level: 2 })).toHaveText("ผลิตภัณฑ์ทั้งหมด");
  await page.goto("/products?category=not-a-real-family");
  await expect(catalog.getByRole("heading", { level: 2 })).toHaveText("ผลิตภัณฑ์ทั้งหมด");
  await expect(catalog.locator("article")).toHaveCount(24);
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto("/products");
    // Check server HTML; streamed content can remain hidden with scripting disabled.
    await expect(staticPage.locator("h1")).toHaveText("ผลิตภัณฑ์");
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

test("navigation changes mode at 834px and closes menus when the layout changes", async ({
  page,
}) => {
  for (const route of ["/", "/products", "/contact-us"]) {
    const home = route === "/";
    const breakpoint = 834;
    await page.setViewportSize({ width: breakpoint - 1, height: 540 });
    await page.goto(route);
    const header = page.locator(home ? ".site-header:visible" : "[data-products-header]:visible");
    const toggle = header.getByRole("button", { name: "เปิดเมนู", exact: true });
    await toggle.click();
    const mobile = header.locator(home ? "#mobile-navigation" : "#products-navigation-panel");
    await expect(mobile).toBeVisible();
    expect(await mobile.evaluate((n) => n.clientHeight <= innerHeight - 43)).toBe(true);
    await page.setViewportSize({ width: breakpoint, height: 900 });
    await expect(mobile).toHaveCount(0);
    const desktop = header.getByRole("link", { name: "เครื่องชั่ง", exact: true });
    await expect(desktop).toBeVisible();
    await page.keyboard.press("Tab");
    await desktop.focus();
    await expect(desktop).toHaveAttribute("aria-expanded", "true");
    await page.setViewportSize({ width: breakpoint - 1, height: 900 });
    await expect(mobile).toHaveCount(0);
    await expect(toggle).toBeVisible();
  }
});

test("nine company menus expose real destinations without calibration or a top bar", async ({
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
    const panel = page.locator(".desktop-submenu.is-open .submenu-panel.is-active");
    await expect(panel.locator(".submenu-group-secondary > p")).toHaveText(menu.groups);
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
        const fragment =
          target.pathname === "/software/download"
            ? `href="${target.hash}"`
            : `id="${target.hash.slice(1)}"`;
        expect(destinations.get(target.pathname)?.includes(fragment), href).toBe(true);
      }
    }
  }
  await page.locator(".brand").focus();
  await expect(page.locator("#desktop-submenu")).toHaveAttribute("aria-hidden", "true");
  await page.locator(".desktop-nav").getByRole("link", { name: "บริการ", exact: true }).focus();
  await page
    .locator(".submenu-panel.is-active")
    .getByRole("link", { name: "ติดต่อเรา", exact: true })
    .click();
  await expect(page).toHaveURL(/\/contact-us$/);
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
  const mobile = page.locator("#mobile-navigation");
  await expect(mobile.locator("summary")).toHaveCount(7);
  await expect(mobile.locator(".mobile-nav-category-link")).toHaveText([
    "ผลิตภัณฑ์ทั้งหมด",
    ...productCategoryDefinitions.map(({ label }) => label),
  ]);
  const products = mobile
    .locator("details")
    .filter({ has: page.getByLabel("เปิดเมนูย่อยอินดิเคเตอร์แท่นชั่ง") });
  await expect(products).not.toHaveAttribute("open");
  await products.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(products).toHaveAttribute("open", "");
  await expect(products.getByRole("link", { name: "LCD", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(mobile).toHaveCount(0);
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page
    .locator('#mobile-navigation summary[aria-label="เปิดเมนูย่อยอินดิเคเตอร์แท่นชั่ง"]')
    .click();
  await page.locator("#mobile-navigation").getByRole("link", { name: "LCD", exact: true }).click();
  await expect(page).toHaveURL(/\/products\/category\/indicators\/lcd$/);
  await expect(page.locator("#mobile-navigation")).toHaveCount(0);
});

test("mobile software and warranty links remain reachable in a short viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 540 });
  await page.goto("/");
  await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  const mobile = page.locator("#mobile-navigation");
  await mobile
    .locator("summary")
    .filter({ hasText: /^บริการ$/ })
    .click();
  await mobile.getByRole("link", { name: "ซอฟต์แวร์", exact: true }).click();
  await page.locator('.software-catalog a[href="/software/download/sunford-indus"]').click();
  await expect(page).toHaveURL(/\/software\/download\/sunford-indus$/);
  await expect(mobile).toHaveCount(0);
  await page.goto("/");
  await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  await mobile
    .locator("summary")
    .filter({ hasText: /^บริการ$/ })
    .click();
  await mobile.getByRole("link", { name: "ลงทะเบียนรับประกัน", exact: true }).click();
  await expect(page).toHaveURL(/\/warranty\/register$/);
  await expect(mobile).toHaveCount(0);
});

for (const route of ["/", "/contact-us"]) {
  test(`all flyout headings and first links align with the logo on ${route}`, async ({ page }) => {
    const home = route === "/";
    await page.goto(route);
    if (home)
      await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
    const nav = page.locator(home ? ".desktop-nav" : "[data-products-nav]");
    const logo = page.locator(home ? ".brand" : '[data-products-nav] a[href="/"]');
    const panel = page.locator(home ? ".submenu-panel.is-active" : "#products-navigation-panel");
    for (const width of [834, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const { label } of menus) {
        const trigger = nav.getByText(label, { exact: true });
        await trigger.press("ArrowDown");
        await expect(trigger).toHaveAttribute("aria-expanded", "true");
        const firstLink = panel.locator("a:visible").first();
        await expect(firstLink).toBeFocused();
        const logoX = (await logo.boundingBox())!.x;
        for (const text of [panel.locator("p:visible").first(), firstLink]) {
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
      const panel = page.locator(".desktop-submenu.is-open .submenu-panel.is-active");
      await expect(panel).toBeVisible();
      const bounds = (await panel.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(23);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 23);
      const primary = (await panel.locator(".submenu-group-primary").boundingBox())!;
      const logo = (await page.locator(".brand").boundingBox())!;
      expect(Math.abs(primary.x - logo.x)).toBeLessThan(1);
      const link = panel.locator(".submenu-links a").first();
      const before = (await link.boundingBox())!;
      await link.hover();
      await expect(link.locator("span")).toHaveCSS("transform", "matrix(1.06, 0, 0, 1.06, 0, 0)");
      expect((await link.boundingBox())!.width).toBeCloseTo(before.width, 1);
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.locator(".submenu-panel.is-active .submenu-links a").first().locator("span"),
  ).toHaveCSS("transform", "none");
  await page.keyboard.press("Escape");
  await expect(page.locator("#desktop-submenu")).toHaveAttribute("aria-hidden", "true");
});

test("product buying guides and responsive layouts remain available", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/guides/pos#systems");
  await expect(page).toHaveURL(/\/guides\/pos#systems$/);
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
