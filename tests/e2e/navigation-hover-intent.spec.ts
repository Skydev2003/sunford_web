import { expect, test, type Page } from "@playwright/test";

const variants = ["/", "/service?section=contact", "/scales"] as const;
const hoverDelay = 600;
const header = (page: Page, route: string) =>
  page.locator(route === "/" ? ".site-header:visible" : "[data-products-header]:visible");
const panel = (page: Page) => page.locator("#products-navigation-panel");
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
    await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-enhanced", "true");
  else await expect(header(page, route).getByRole("button").first()).toBeEnabled();
}

async function pauseTimers(page: Page) {
  await page.clock.install({ time: new Date("2026-11-09T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-11-09T00:00:10Z"));
}

async function enterHistoryRoute(page: Page, route: string, mobile = false) {
  const previous = route === "/service?section=contact" ? "/scales" : "/service?section=contact";
  await visit(page, previous, mobile ? 390 : 1440);
  if (mobile) await page.setViewportSize({ width: 390, height: 844 });
  const nav = header(page, previous);
  if (route === "/") {
    await nav.getByRole("link", { name: "SUNFORD หน้าแรก", exact: true }).click();
  } else if (route === "/service?section=contact") {
    if (mobile) {
      await nav.getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
      await nav.getByRole("button", { name: "เปิดเมนูย่อยผลิตภัณฑ์ทั้งหมด", exact: true }).tap();
    } else {
      await nav.getByRole("link", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true }).hover();
    }
    await panel(page).locator('a[href="/service?section=contact"]').click();
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
    await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-enhanced", "true");
  else await expect(header(page, route).getByRole("button").first()).toBeEnabled();
  return previous;
}

async function leave(page: Page) {
  await page.mouse.move(1435, 950);
  await page.clock.runFor(500);
}

for (const route of ["/", "/service?section=contact"]) {
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
      const content = panel(page).locator("[data-nav-hover-reveal]");
      const items = content.locator('[data-nav-column="primary"] [data-nav-hover-item]');
      for (const [index, delay] of ["0s", "0.02s", "0.04s"].entries()) {
        await expect(items.nth(index)).toHaveCSS("animation-name", /navHoverReveal$/);
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
    await expect(panel(page).locator("[data-nav-hover-reveal]")).toHaveCount(1);
    await trigger(page, route, "อินดิเคเตอร์").hover();
    const indicators = panel(page).locator('[data-nav-menu="/indicators"]');
    await expect(indicators.locator("[data-nav-hover-item]").first()).toHaveCSS(
      "animation-name",
      /navHoverReveal$/,
    );
    await page.mouse.move(10, 950);
    await expect(panel(page).locator("[data-nav-hover-reveal]")).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await scales.hover();
    await expect(
      panel(page).locator("[data-nav-hover-reveal] [data-nav-hover-item]").first(),
    ).toHaveCSS("animation-name", "none");
  });

  for (const width of [1024, 1194]) {
    test(`${route} touch-only screens at ${width}px can open submenus and follow category links`, async ({
      browser,
      baseURL,
    }) => {
      const page = await browser.newPage({
        baseURL,
        viewport: { width, height: 834 },
        hasTouch: true,
      });
      try {
        await visit(page, route, width);
        const nav = header(page, route);
        expect(
          await page.evaluate(() => matchMedia("(hover: none) and (pointer: coarse)").matches),
        ).toBe(true);
        await expect(nav.locator(".desktop-nav")).toBeHidden();
        const toggle = nav.getByRole("button", { name: "เปิดเมนู", exact: true });
        await toggle.tap();
        await nav.getByRole("button", { name: "เปิดเมนูย่อยโซลูชัน", exact: true }).tap();
        const solutions = panel(page).locator('[data-nav-menu="/solutions"]');
        await expect(solutions).toBeVisible();
        const last = solutions.getByRole("link", { name: /QR Code \(POS\)$/ });
        await last.tap();
        await expect(page).toHaveURL("/solutions/pos-label-printing");
        await expect(panel(page)).toHaveCount(0);

        const destinationNav = header(page, "/solutions/pos-label-printing");
        await destinationNav.getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
        await destinationNav
          .locator("[data-nav-category-row]")
          .getByRole("link", { name: "เครื่องชั่ง", exact: true })
          .tap();
        await expect(page).toHaveURL("/scales");
        await expect(panel(page)).toHaveCount(0);
      } finally {
        await page.close();
      }
    });
  }
}

for (const route of variants) {
  test(`${route} opens after ${hoverDelay}ms, cancels quick passes and switches only to the intended trigger`, async ({
    page,
  }) => {
    await visit(page, route);
    await pauseTimers(page);
    const first = trigger(page, route);
    const second = trigger(page, route, "อินดิเคเตอร์");
    await first.hover();
    await page.clock.runFor(hoverDelay - 1);
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(panel(page)).not.toBeVisible();
    await page.clock.runFor(1);
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(panel(page)).toBeVisible();
    await leave(page);
    await expect(panel(page)).not.toBeVisible();
    await first.hover();
    await page.clock.runFor(100);
    await second.hover();
    await page.clock.runFor(hoverDelay - 1);
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(second).toHaveAttribute("aria-expanded", "false");
    await page.clock.runFor(1);
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await leave(page);
    await first.hover();
    await page.clock.runFor(100);
    await page.mouse.move(1435, 950);
    await page.clock.runFor(700);
    await expect(panel(page)).not.toBeVisible();
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
    await expect(page).toHaveURL(/\/scales$/);
    await page.clock.runFor(1000);
    await expect(page.locator("#products-navigation-panel")).not.toBeVisible();
    await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
    await leave(page);
    const next = trigger(page, "/scales");
    await next.hover();
    await page.clock.runFor(hoverDelay - 1);
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
    await expect(panel(page)).not.toBeVisible();
    await page.keyboard.press("Tab");
    await first.focus();
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await first.press("ArrowDown");
    await page.clock.runFor(17);
    await expect(panel(page).getByRole("link").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(first).toBeFocused();
    await expect(panel(page)).not.toBeVisible();
    await page.clock.runFor(700);
    await expect(panel(page)).not.toBeVisible();
  });

  test(`${route} pending hover is canceled at the mobile breakpoint`, async ({ page }) => {
    await visit(page, route);
    await pauseTimers(page);
    await trigger(page, route).hover();
    await page.clock.runFor(100);
    await page.setViewportSize({ width: 1023, height: 1000 });
    await page.clock.runFor(700);
    await expect(panel(page)).not.toBeVisible();
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
    await expect(panel(page)).toBeVisible();
    const child = panel(page).getByRole("link").first();
    const destination = await child.getAttribute("href");
    await child.hover();
    await expect(panel(page)).toBeVisible();
    await child.click();
    await expect(page).toHaveURL(new URL(destination!, page.url()).href);
    await expect(
      page.locator(
        "#products-navigation-panel:visible, #products-navigation-panel.is-open:visible",
      ),
    ).toHaveCount(0);
    await expect(page.locator("footer:visible")).toHaveCount(1);
  });
}

for (const route of variants) {
  test(`${route} service uses separate direct navigation and submenu access`, async ({ page }) => {
    await visit(page, route);
    const link = trigger(page, route, "บริการ");
    await link.press("ArrowDown");
    await expect(panel(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(link).toBeFocused();
    await link.press("Enter");
    await expect(page).toHaveURL(/\/service$/);
  });
}

for (const [from, to] of [
  ["/service?section=contact", "/"],
  ["/", "/service?section=contact"],
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
        href === "/"
          ? '[data-products-header] a[href="/"]'
          : '.hero-main a[href="/service?section=contact"]',
      );
      if (!link) throw new Error("Existing route link missing");
      link.click();
    }, to);
    await expect(page).toHaveURL(new URL(to, page.url()).href);
    await page.clock.runFor(1000);
    await expect(panel(page)).not.toBeVisible();
    await page.goBack();
    await page.clock.runFor(1000);
    await expect(panel(page)).not.toBeVisible();
    await page.goForward();
    await page.clock.runFor(1000);
    await expect(panel(page)).not.toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("browser history closes an open menu before restoring a cached category page", async ({
  page,
}) => {
  await visit(page, "/service?section=contact");
  await trigger(page, "/service?section=contact").click();
  await expect(page).toHaveURL(/\/scales$/);
  await page.mouse.move(1435, 950);
  await trigger(page, "/scales").hover();
  await expect(panel(page)).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/service\?section=contact$/);
  await expect(panel(page)).not.toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/scales$/);
  await expect(panel(page)).not.toBeVisible();
});

const historyRoutes = ["/", "/products", "/scales", "/service?section=contact"] as const;

for (const route of historyRoutes) {
  test(`${route} cached keyboard menu stays closed after Back and Forward with pointer away`, async ({
    page,
  }) => {
    const previous = await enterHistoryRoute(page, route);
    await page.mouse.move(1435, 950);
    await page.keyboard.press("Tab");
    await trigger(page, route).focus();
    await trigger(page, route).press("ArrowDown");
    await expect(panel(page).getByRole("link").first()).toBeFocused();
    await page.goBack();
    await expect(page).toHaveURL(new URL(previous, page.url()).href);
    await page.goForward();
    await expect(page).toHaveURL(new URL(route, page.url()).href);
    await page.screenshot({ path: test.info().outputPath("cached-keyboard-menu-return.png") });
    await expect(panel(page)).not.toBeVisible();
    await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
  });
}

test.describe("cached mobile menus", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  for (const route of historyRoutes) {
    test(`${route} cached mobile menu stays closed after Back and Forward`, async ({ page }) => {
      const previous = await enterHistoryRoute(page, route, true);
      await header(page, route).getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
      const menu = page.locator("#products-navigation-panel");
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

for (const route of ["/", "/service?section=contact"]) {
  test(`${route} modified child clicks retain native new-tab navigation`, async ({ page }) => {
    await visit(page, route);
    await trigger(page, route).hover();
    await expect(panel(page)).toBeVisible();
    const child = panel(page).getByRole("link").first();
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
      await nav.getByRole("button", { name: "เปิดเมนูย่อยเครื่องชั่ง", exact: true }).tap();
      const links = route === "/" ? nav.locator("[data-nav-menu]:visible") : panel(page);
      const child = links.locator('a[href="/scales/retail"]').first();
      await expect(child).toBeVisible();
      await child.tap();
      await expect(page).toHaveURL(/\/scales\/retail$/);
      await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    } finally {
      await context.close();
    }
  });
}
