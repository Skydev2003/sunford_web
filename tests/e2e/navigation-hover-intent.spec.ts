import { expect, test, type Page } from "@playwright/test";

const variants = ["/", "/contact-us", "/products/category/scales"] as const;
const hoverDelay = (route: string) => (route === "/" ? 500 : 600);
const header = (page: Page, route: string) =>
  page.locator(route === "/" ? ".site-header:visible" : "[data-products-header]:visible");
const panel = (page: Page, route: string) =>
  page.locator(route === "/" ? "#desktop-submenu" : "#products-navigation-panel");
const trigger = (page: Page, route: string, name = "เครื่องชั่ง") =>
  header(page, route).getByRole("link", { name, exact: true });

async function visit(page: Page, route: string, width = 1440) {
  await page.setViewportSize({ width, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.mouse.move(width - 5, 950);
  await page.goto(route);
  await page.evaluate(() => document.fonts.ready);
  await expect(header(page, route)).toBeVisible();
  if (route === "/")
    await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
  else await expect(header(page, route).getByRole("button").first()).toBeEnabled();
}

async function pauseTimers(page: Page) {
  await page.clock.install({ time: new Date("2026-11-09T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-11-09T00:00:10Z"));
}

async function enterHistoryRoute(page: Page, route: string, mobile = false) {
  const previous = route === "/contact-us" ? "/products/category/scales" : "/contact-us";
  await visit(page, previous, mobile ? 390 : 1440);
  if (mobile) await page.setViewportSize({ width: 390, height: 844 });
  const nav = header(page, previous);
  if (route === "/") {
    await nav.getByRole("link", { name: "SUNFORD หน้าแรก", exact: true }).click();
  } else if (route === "/contact-us") {
    if (mobile) {
      await nav.getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
      await nav.getByRole("button", { name: "เปิดเมนูย่อยผลิตภัณฑ์ทั้งหมด", exact: true }).tap();
    } else {
      await nav.getByRole("link", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true }).hover();
    }
    await panel(page, previous).locator('a[href="/contact-us"]').click();
  } else {
    if (mobile) await nav.getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
    await nav
      .getByRole("link", {
        name: route === "/products" ? "ผลิตภัณฑ์ทั้งหมด" : "เครื่องชั่ง",
        exact: true,
      })
      .click();
  }
  await expect(page).toHaveURL(new URL(route, page.url()).href);
  if (route === "/")
    await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
  else await expect(header(page, route).getByRole("button").first()).toBeEnabled();
  return previous;
}

async function leave(page: Page) {
  await page.mouse.move(1435, 950);
  await page.clock.runFor(500);
}

for (const route of ["/", "/contact-us"]) {
  test(`${route} hover motion follows the 1024px breakpoint`, async ({ page }) => {
    await visit(page, route);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const nav = header(page, route);
    const mobile = nav.getByRole("button", { name: "เปิดเมนู", exact: true });
    const scales = trigger(page, route);
    for (const width of [390, 768, 1023]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect(mobile).toBeVisible();
      await expect(scales).not.toBeVisible();
    }
    for (const width of [1024, 1025, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.mouse.move(10, 950);
      await expect(mobile).not.toBeVisible();
      await scales.hover();
      const content = panel(page, route).locator("[data-nav-hover-reveal]");
      const items = content.locator('[data-nav-column="primary"] [data-nav-hover-item]');
      for (const [index, delay] of ["0s", "0.02s", "0.04s"].entries()) {
        await expect(items.nth(index)).toHaveCSS("animation-name", "navHoverReveal");
        await expect(items.nth(index)).toHaveCSS("animation-duration", "0.32s");
        await expect(items.nth(index)).toHaveCSS("animation-delay", delay);
      }
      const delays = await items.evaluateAll((nodes) =>
        nodes.map((node) => Math.round(parseFloat(getComputedStyle(node).animationDelay) * 1000)),
      );
      expect(delays).toEqual(delays.map((_, index) => Math.min(240, index * 20)));
      for (const [column, headingDelay, nextDelay] of [
        ["uses", "0.06s", "0.08s"],
        ["help", "0.12s", "0.14s"],
      ]) {
        const group = content.locator(`[data-nav-column="${column}"]`);
        const links = group.locator("[data-nav-hover-item]");
        await expect(group.locator(":scope > p")).toHaveCSS("animation-delay", headingDelay);
        await expect(links.first()).toHaveCSS("animation-delay", headingDelay);
        await expect(links.nth(1)).toHaveCSS("animation-delay", nextDelay);
      }
      await page.keyboard.press("Escape");
      await expect(content).toHaveCount(0);
    }
    await page.mouse.move(10, 950);
    await scales.hover();
    await expect(panel(page, route).locator("[data-nav-hover-reveal]")).toHaveCount(1);
    await trigger(page, route, "อินดิเคเตอร์แท่นชั่ง").hover();
    const indicators = panel(page, route).locator(
      '[data-nav-menu="/products/category/indicators"]',
    );
    await expect(indicators.locator("[data-nav-hover-item]").first()).toHaveCSS(
      "animation-name",
      "navHoverReveal",
    );
    await page.mouse.move(10, 950);
    await expect(panel(page, route).locator("[data-nav-hover-reveal]")).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await scales.hover();
    await expect(
      panel(page, route).locator("[data-nav-hover-reveal] [data-nav-hover-item]").first(),
    ).toHaveCSS("animation-name", "none");
  });

  test(`${route} touch at 1024px follows the category link without a hover reveal`, async ({
    browser,
    baseURL,
  }) => {
    const page = await browser.newPage({
      baseURL,
      viewport: { width: 1024, height: 900 },
      hasTouch: true,
    });
    try {
      await visit(page, route, 1024);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      expect(await page.evaluate(() => matchMedia("(hover: none)").matches)).toBe(true);
      await pauseTimers(page);
      await trigger(page, route).hover();
      await page.clock.runFor(hoverDelay(route) + 50);
      await expect(panel(page, route).locator("[data-nav-hover-reveal]")).not.toBeVisible();
      await trigger(page, route).tap();
      await expect(page).toHaveURL(/\/products\/category\/scales$/);
      await expect(page.locator("[data-nav-hover-reveal]")).toHaveCount(0);
    } finally {
      await page.close();
    }
  });
}

for (const route of variants) {
  test(`${route} opens after ${hoverDelay(route)}ms, cancels quick passes and switches only to the intended trigger`, async ({
    page,
  }) => {
    await visit(page, route);
    await pauseTimers(page);
    const first = trigger(page, route);
    const second = trigger(page, route, "อินดิเคเตอร์แท่นชั่ง");
    await first.hover();
    await page.clock.runFor(hoverDelay(route) - 1);
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(panel(page, route)).not.toBeVisible();
    await page.clock.runFor(1);
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(panel(page, route)).toBeVisible();
    await leave(page);
    await expect(panel(page, route)).not.toBeVisible();
    await first.hover();
    await page.clock.runFor(100);
    await second.hover();
    await page.clock.runFor(hoverDelay(route) - 1);
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(second).toHaveAttribute("aria-expanded", "false");
    await page.clock.runFor(1);
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await leave(page);
    await first.hover();
    await page.clock.runFor(100);
    await page.mouse.move(1435, 950);
    await page.clock.runFor(700);
    await expect(panel(page, route)).not.toBeVisible();
  });

  test(`${route} pointer focus cannot bypass delay and clicking navigates without a delayed reopen`, async ({
    page,
  }) => {
    await visit(page, route);
    await pauseTimers(page);
    const first = trigger(page, route);
    await first.hover();
    await page.clock.runFor(100);
    await page.mouse.down();
    await expect(first).toBeFocused();
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await page.mouse.up();
    await expect(page).toHaveURL(/\/products\/category\/scales$/);
    await page.clock.runFor(1000);
    await expect(page.locator("#products-navigation-panel")).not.toBeVisible();
    await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
    await leave(page);
    const next = trigger(page, "/products/category/scales");
    await next.hover();
    await page.clock.runFor(hoverDelay("/products/category/scales") - 1);
    await expect(next).toHaveAttribute("aria-expanded", "false");
    await page.clock.runFor(1);
    await expect(next).toHaveAttribute("aria-expanded", "true");
  });

  test(`${route} keyboard access is immediate and Escape cancels pending hover`, async ({
    page,
  }) => {
    await visit(page, route);
    await pauseTimers(page);
    const first = trigger(page, route);
    await first.hover();
    await page.clock.runFor(100);
    await page.keyboard.press("Escape");
    await page.clock.runFor(700);
    await expect(panel(page, route)).not.toBeVisible();
    await page.keyboard.press("Tab");
    await first.focus();
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await first.press("ArrowDown");
    await page.clock.runFor(17);
    await expect(panel(page, route).getByRole("link").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(first).toBeFocused();
    await expect(panel(page, route)).not.toBeVisible();
    await page.clock.runFor(700);
    await expect(panel(page, route)).not.toBeVisible();
  });

  test(`${route} pending hover is canceled at the mobile breakpoint`, async ({ page }) => {
    await visit(page, route);
    await pauseTimers(page);
    await trigger(page, route).hover();
    await page.clock.runFor(100);
    await page.setViewportSize({ width: 1023, height: 1000 });
    await page.clock.runFor(700);
    await expect(panel(page, route)).not.toBeVisible();
    await expect(
      header(page, route).getByRole("button", { name: "เปิดเมนู", exact: true }),
    ).toBeVisible();
  });

  test(`${route} pointer can enter the panel and activate an unchanged child destination`, async ({
    page,
  }) => {
    await visit(page, route);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await trigger(page, route).hover();
    await expect(panel(page, route)).toBeVisible();
    const child = panel(page, route).getByRole("link").first();
    const destination = await child.getAttribute("href");
    await child.hover();
    await expect(panel(page, route)).toBeVisible();
    await child.click();
    await expect(page).toHaveURL(new URL(destination!, page.url()).href);
    await expect(
      page.locator("#products-navigation-panel:visible, #desktop-submenu.is-open:visible"),
    ).toHaveCount(0);
    await expect(page.locator("footer:visible")).toHaveCount(1);
  });
}

for (const route of ["/contact-us", "/products/category/scales"]) {
  test(`${route} click-only triggers toggle immediately and remain closed until pointer leaves`, async ({
    page,
  }) => {
    await visit(page, route);
    await pauseTimers(page);
    const button = header(page, route).getByRole("button", {
      name: "บริการ",
      exact: true,
    });
    await button.hover();
    await page.clock.runFor(100);
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await page.clock.runFor(1000);
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await leave(page);
    await button.hover();
    await page.clock.runFor(300);
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await button.press("Enter");
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await button.press("Enter");
    await expect(button).toHaveAttribute("aria-expanded", "false");
  });
}

for (const [from, to] of [
  ["/contact-us", "/"],
  ["/", "/contact-us"],
]) {
  test(`pending hover from ${from} does not survive navigation to ${to} and cached history`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await visit(page, from);
    await pauseTimers(page);
    await trigger(page, from).hover();
    await page.clock.runFor(100);
    await page.evaluate((href) => {
      const link = document.querySelector<HTMLAnchorElement>(
        href === "/" ? '[data-products-header] a[href="/"]' : '.hero-main a[href="/contact-us"]',
      );
      if (!link) throw new Error("Existing route link missing");
      link.click();
    }, to);
    await expect(page).toHaveURL(new URL(to, page.url()).href);
    await page.clock.runFor(1000);
    await expect(panel(page, to)).not.toBeVisible();
    await page.goBack();
    await page.clock.runFor(1000);
    await expect(panel(page, from)).not.toBeVisible();
    await page.goForward();
    await page.clock.runFor(1000);
    await expect(panel(page, to)).not.toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("browser history closes an open menu before restoring a cached category page", async ({
  page,
}) => {
  await visit(page, "/contact-us");
  await trigger(page, "/contact-us").click();
  await expect(page).toHaveURL(/\/products\/category\/scales$/);
  await page.mouse.move(1435, 950);
  await trigger(page, "/products/category/scales").hover();
  await expect(panel(page, "/products/category/scales")).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/contact-us$/);
  await expect(panel(page, "/contact-us")).not.toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/products\/category\/scales$/);
  await expect(panel(page, "/products/category/scales")).not.toBeVisible();
});

const historyRoutes = ["/", "/products", "/products/category/scales", "/contact-us"] as const;

for (const route of historyRoutes) {
  test(`${route} cached keyboard menu stays closed after Back and Forward with pointer away`, async ({
    page,
  }) => {
    const previous = await enterHistoryRoute(page, route);
    await page.mouse.move(1435, 950);
    await page.keyboard.press("Tab");
    await trigger(page, route).focus();
    await trigger(page, route).press("ArrowDown");
    await expect(panel(page, route).getByRole("link").first()).toBeFocused();
    await page.goBack();
    await expect(page).toHaveURL(new URL(previous, page.url()).href);
    await page.goForward();
    await expect(page).toHaveURL(new URL(route, page.url()).href);
    await page.screenshot({ path: test.info().outputPath("cached-keyboard-menu-return.png") });
    await expect(panel(page, route)).not.toBeVisible();
    await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
  });
}

test.describe("cached mobile menus", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  for (const route of historyRoutes) {
    test(`${route} cached mobile menu stays closed after Back and Forward`, async ({ page }) => {
      const previous = await enterHistoryRoute(page, route, true);
      await header(page, route).getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
      const menu = page.locator(
        route === "/" ? "#mobile-navigation" : "#products-navigation-panel",
      );
      await expect(menu).toBeVisible();
      await page.goBack();
      await expect(page).toHaveURL(new URL(previous, page.url()).href);
      await page.goForward();
      await expect(page).toHaveURL(new URL(route, page.url()).href);
      await page.screenshot({ path: test.info().outputPath("cached-mobile-menu-return.png") });
      await expect(menu).not.toBeVisible();
      await expect(
        header(page, route).getByRole("button", { name: "เปิดเมนู", exact: true }),
      ).toBeVisible();
      await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    });
  }
});

for (const route of ["/", "/contact-us"]) {
  test(`${route} modified child clicks retain native new-tab navigation`, async ({ page }) => {
    await visit(page, route);
    await trigger(page, route).hover();
    await expect(panel(page, route)).toBeVisible();
    const child = panel(page, route).getByRole("link").first();
    const destination = await child.getAttribute("href");
    const original = page.url();
    const [next] = await Promise.all([
      page.context().waitForEvent("page"),
      child.click({ modifiers: ["Control"] }),
    ]);
    await expect(next).toHaveURL(new URL(destination!, original).href);
    await expect(page).toHaveURL(original);
    await next.close();
  });

  test(`${route} native touch menus retain immediate disclosure and child navigation`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: "reduce",
    });
    try {
      const page = await context.newPage();
      await page.goto(route);
      const nav = header(page, route);
      await nav.getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
      const disclosure =
        route === "/"
          ? nav.locator('summary[aria-label="เปิดเมนูย่อยเครื่องชั่ง"]')
          : nav.getByRole("button", { name: "เปิดเมนูย่อยเครื่องชั่ง", exact: true });
      await disclosure.tap();
      const links = route === "/" ? nav.locator(".mobile-nav-panel:visible") : panel(page, route);
      const child = links.locator('a[href="/products/category/scales/price"]').first();
      await expect(child).toBeVisible();
      await child.tap();
      await expect(page).toHaveURL(/\/products\/category\/scales\/price$/);
      await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    } finally {
      await context.close();
    }
  });
}
