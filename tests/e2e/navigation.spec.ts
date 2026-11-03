import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";

const labels = ["สินค้า", "โซลูชันตามธุรกิจ", "ซอฟต์แวร์", "บริการ", "เกี่ยวกับเรา", "ติดต่อเรา"];
const menus = [
  {
    label: "สินค้า",
    groups: ["เครื่องชั่งดิจิทัล", "อินดิเคเตอร์และแท่นชั่ง", "ระบบ POS และอุปกรณ์"],
  },
  {
    label: "โซลูชันตามธุรกิจ",
    groups: ["ค้าปลีก อาหารและกาแฟ", "อุตสาหกรรมและการผลิต", "ห้องแล็บและข้อมูลธุรกิจ"],
  },
  { label: "ซอฟต์แวร์", groups: ["ค้าปลีกและระบบ POS", "งานชั่งและการผลิต", "ครัวเรือนและสุขภาพ"] },
  { label: "บริการ", groups: ["ข้อมูลและความช่วยเหลือ"] },
  { label: "เกี่ยวกับเรา", groups: [] },
];

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("navigation changes mode at 1400px and closes menus when the layout changes", async ({
  page,
}) => {
  for (const route of ["/", "/products", "/contact-us"]) {
    await page.setViewportSize({ width: 1399, height: 540 });
    await page.goto(route);
    const toggle = page.getByRole("button", { name: "เปิดเมนู", exact: true });
    await toggle.click();
    const mobile = page.locator("#mobile-navigation");
    await expect(mobile).toBeVisible();
    expect(await mobile.evaluate((n) => n.clientHeight <= innerHeight - 55)).toBe(true);
    await page.setViewportSize({ width: 1400, height: 900 });
    await expect(mobile).toHaveCount(0);
    await expect(page.locator(".desktop-nav")).toBeVisible();
    const desktop = page.locator(".desktop-nav a").first();
    await desktop.focus();
    await expect(desktop).toHaveAttribute("aria-expanded", "true");
    await page.setViewportSize({ width: 1399, height: 900 });
    await expect(page.locator(".site-header")).not.toHaveClass(/is-menu-open/);
    await expect(toggle).toBeVisible();
  }
});

test("six company menus expose real destinations without calibration or a top bar", async ({
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
  const contact = page
    .locator(".desktop-nav")
    .getByRole("link", { name: "ติดต่อเรา", exact: true });
  await contact.hover();
  await expect(contact).not.toHaveAttribute("aria-expanded");
  await expect(page.locator("#desktop-submenu")).toHaveAttribute("aria-hidden", "true");
  await contact.click();
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
  await expect(mobile.locator("summary")).toHaveText(labels.slice(0, 5));
  await expect(mobile.locator(":scope > a")).toHaveText(["ติดต่อเรา"]);
  const products = mobile.locator("details").first();
  await expect(products).not.toHaveAttribute("open");
  await products.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(products).toHaveAttribute("open", "");
  await expect(products.getByRole("link", { name: "อินดิเคเตอร์", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(mobile).toHaveCount(0);
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.locator("#mobile-navigation summary").first().click();
  await page
    .locator("#mobile-navigation")
    .getByRole("link", { name: "อินดิเคเตอร์", exact: true })
    .click();
  await expect(page).toHaveURL(/\/Indicator$/);
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
    .filter({ hasText: /^ซอฟต์แวร์$/ })
    .click();
  await mobile.getByRole("link", { name: "SUNFORD INDUS", exact: true }).click();
  await expect(page).toHaveURL(/\/software\/download\/sunford-indus$/);
  await expect(mobile).toHaveCount(0);
  await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  await mobile
    .locator("summary")
    .filter({ hasText: /^บริการ$/ })
    .click();
  await mobile.getByRole("link", { name: "ลงทะเบียนรับประกัน", exact: true }).click();
  await expect(page).toHaveURL(/\/warranty\/register$/);
  await expect(mobile).toHaveCount(0);
});

test("wide menus fit the viewport and preserve the logo-aligned origin and hover motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
  for (const width of [1400, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const label of ["สินค้า", "ซอฟต์แวร์", "บริการ", "เกี่ยวกับเรา"]) {
      await page.locator(".desktop-nav").getByRole("link", { name: label, exact: true }).hover();
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
  await page.goto("/");
  await page.locator(".desktop-nav").getByRole("link", { name: "สินค้า", exact: true }).hover();
  await page
    .locator(".submenu-panel.is-active")
    .getByRole("link", { name: "เปรียบเทียบ Android / Windows", exact: true })
    .click();
  await expect(page).toHaveURL(/\/guides\/pos#systems$/);
  await expect(page.locator("#systems h2")).toHaveText("เปรียบเทียบ Android / Windows");
  for (const width of [320, 390, 768, 1100, 1399, 1400, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test("desktop company destinations remain available without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator(".desktop-nav > a")).toHaveText(labels);
    await expect(page.locator('.desktop-nav a[href="/products"]')).toBeVisible();
    await page.locator('.desktop-nav a[href="/service"]').click();
    await expect(page).toHaveURL(/\/service$/);
    await expect(page.locator("main")).toBeVisible();
  } finally {
    await context.close();
  }
});
