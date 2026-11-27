import { expect, test, type Locator, type Page } from "@playwright/test";
import { catalogSubmenuDestination } from "../../src/features/catalog/data/catalog-submenu-destinations";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import {
  getHeaderNavigationItems,
  getPrimaryNavigationItems,
} from "../../src/features/site/data/primary-navigation";

const menus = getPrimaryNavigationItems(defaultNavigation);
const headerMenus = getHeaderNavigationItems(defaultNavigation);
const headerLabels = new Map(headerMenus.map(({ href, label }) => [href, label]));
const routes = ["/", "/service?section=contact"];
const duplicateKeyWarnings = new WeakMap<Page, string[]>();

test.beforeEach(({ page }) => {
  const warnings: string[] = [];
  duplicateKeyWarnings.set(page, warnings);
  page.on("console", (message) => {
    if (/Encountered two children with the same key|unique ["']key["'] prop/.test(message.text()))
      warnings.push(message.text());
  });
});

test.afterEach(({ page }) => {
  expect(duplicateKeyWarnings.get(page)).toEqual([]);
});

function header(page: Page, route: string) {
  return page.locator(
    route === "/" ? "header.site-header:visible" : "[data-products-header]:visible",
  );
}

async function visit(page: Page, route: string) {
  await page.goto(route);
  await page.evaluate(() => document.fonts.ready);
  if (route === "/")
    await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-enhanced", "true");
  else
    await expect(
      header(page, route).getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true }),
    ).toBeEnabled();
}

async function openMenu(
  page: Page,
  route: string,
  width: number,
  index: number,
  menu = menus[index],
) {
  const nav = header(page, route);
  const label = headerLabels.get(menu.href)!;
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  if (width >= 1024) {
    await page.mouse.move(width - 4, page.viewportSize()!.height - 4);
    const trigger = nav.locator(".desktop-nav").getByRole("link", { name: label, exact: true });
    await trigger.press("ArrowDown");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  } else {
    const back = nav.getByRole("button", { name: "เมนูหลัก", exact: true });
    if (await back.isVisible()) await back.click();
    if (!(await nav.locator("#products-navigation-panel").isVisible()))
      await nav.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
    await nav
      .getByRole("button", {
        name: `เปิดเมนูย่อย${label}`,
        exact: true,
      })
      .click();
  }
  const panel = nav.locator(`[data-nav-menu="${menu.href}"]:visible`);
  await expect(panel).toBeVisible();
  return panel;
}

async function checkEntry(entry: Locator, expected: { href: string; disabled?: boolean }) {
  if (expected.disabled) {
    await expect(entry).toHaveAttribute("aria-disabled", "true");
    expect(await entry.getAttribute("href")).toBeNull();
    expect(await entry.getAttribute("tabindex")).toBeNull();
    expect(
      await entry.evaluate((node) => ({
        tag: node.tagName,
        tabIndex: (node as HTMLElement).tabIndex,
      })),
    ).toEqual({ tag: "SPAN", tabIndex: -1 });
  } else {
    await expect(entry).toHaveAttribute("href", catalogSubmenuDestination(expected.href));
    expect(await entry.getAttribute("aria-disabled")).toBeNull();
  }
}

for (const width of [390, 834, 1440]) {
  test(`shop icon matches the homepage across public pages at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/products",
      "/products/category/scales",
      "/products/wps10ks",
      "/service/quotation",
      "/service?section=contact",
    ]) {
      await visit(page, route);
      const shop = header(page, route).getByRole("link", { name: "ร้านค้า SUNFORD", exact: true });
      await expect(shop).toBeVisible();
      await expect(shop).toHaveAttribute("href", "https://sunfordshop.com/");
      expect(await shop.getAttribute("target")).toBeNull();
      const icon = shop.locator("picture img");
      await expect(icon).toHaveAttribute("alt", "");
      for (const motion of ["no-preference", "reduce"] as const) {
        await page.emulateMedia({ reducedMotion: motion });
        const filename = motion === "reduce" ? "shopping-loader-still.png" : "shopping-loader.svg";
        await expect
          .poll(() =>
            icon.evaluate((img: HTMLImageElement) =>
              img.complete && img.naturalWidth > 0 ? new URL(img.currentSrc).pathname : "",
            ),
          )
          .toBe(`/images/navigation/${filename}`);
        await expect(icon).toHaveCSS("width", "36px");
        await expect(icon).toHaveCSS("height", "36px");
      }
      const box = (await shop.boundingBox())!;
      const iconBox = (await icon.boundingBox())!;
      expect(iconBox.x + iconBox.width / 2).toBeCloseTo(box.x + box.width / 2, 0);
      expect(iconBox.y + iconBox.height / 2).toBeCloseTo(box.y + box.height / 2, 0);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(box.height).toBe(44);
      await expect(
        header(page, route).getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ" }),
      ).toHaveCount(0);
      await shop.hover();
      await expect(page.getByRole("tooltip")).toHaveText("ร้านค้า SUNFORD");
      await page.mouse.move(0, 500);
    }
  });
}

for (const route of routes) {
  test(`${route} shop retains native click, Enter and modified-click navigation`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.context().route("https://sunfordshop.com/**", (request) =>
      request.fulfill({
        contentType: "text/html",
        body: "<title>Shop navigation fixture</title>",
      }),
    );
    for (const activation of ["click", "Enter", "Control-click"]) {
      await visit(page, route);
      const shop = header(page, route).getByRole("link", { name: "ร้านค้า SUNFORD", exact: true });
      if (activation === "Control-click") {
        const popupPromise = page.context().waitForEvent("page");
        await shop.click({ modifiers: ["Control"] });
        const popup = await popupPromise;
        await expect(popup).toHaveURL("https://sunfordshop.com/");
        expect(new URL(page.url()).pathname).toBe(route);
        await popup.close();
      } else {
        if (activation === "click") await shop.click();
        else {
          await shop.focus();
          await page.keyboard.press("Enter");
        }
        await expect(page).toHaveURL("https://sunfordshop.com/");
      }
    }
  });
}

test("catalogue toolbar still selects products and opens comparison after Navbar shop replacement", async ({
  page,
}) => {
  await visit(page, "/products?catalog=all");
  const catalogue = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  await catalogue.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
  for (let index = 0; index < 2; index++)
    await catalogue
      .getByRole("button", { name: /^เพิ่มเพื่อเปรียบเทียบ / })
      .first()
      .click();
  await expect(page.locator(".compare-bar")).toContainText("2/3");
  await page.getByRole("button", { name: /ดูการเปรียบเทียบ/ }).click();
  const dialog = page.getByRole("dialog", { name: "เปรียบเทียบสินค้า", exact: true });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

for (const route of routes) {
  for (const width of [280, 320, 390, 768, 833, 834, 1023, 1024, 1440, 1920, 2560]) {
    test(`${route} all Navbar panels retain their configured columns and disabled choices at ${width}px`, async ({
      page,
    }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height: width === 768 ? 390 : 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await visit(page, route);
      let entries = 0;
      for (let index = 0; index < headerMenus.length; index++) {
        const menu = headerMenus[index];
        const panel = await openMenu(page, route, width, index, menu);
        expect(
          await panel.evaluate((node) => node.scrollWidth - node.clientWidth),
          menu.label,
        ).toBeLessThanOrEqual(1);
        const columns = panel.locator("[data-nav-column]");
        await expect(columns).toHaveCount(1 + menu.groups!.length);
        await expect(columns.locator(":scope > p")).toHaveText([
          menu.submenuLabel!,
          ...menu.groups!.map((group) => group.label),
        ]);
        const expectedColumns = [menu.links, ...menu.groups!.map((group) => group.links)];
        const features = menu.groups![0];
        const hasLiveFeatures = features.label === "คุณสมบัติ" && features.links.length === 0;
        if (hasLiveFeatures) await expect(columns.nth(1).getByRole("link").first()).toBeVisible();
        const boxes = await columns.evaluateAll((nodes) =>
          nodes.map((node) => {
            const { x, y, width, height } = node.getBoundingClientRect();
            return { x, y, width, height };
          }),
        );
        if (width >= 1024) {
          for (let column = 1; column < expectedColumns.length; column++) {
            expect(boxes[column].x).toBeGreaterThanOrEqual(
              boxes[column - 1].x + boxes[column - 1].width,
            );
            expect(boxes[column].x - boxes[column - 1].x - boxes[column - 1].width).toBeCloseTo(
              32,
              0,
            );
            expect(Math.abs(boxes[column].y - boxes[0].y)).toBeLessThanOrEqual(1);
          }
          expect(boxes[0].width).toBeLessThanOrEqual(360);
        } else {
          for (let column = 1; column < boxes.length; column++) {
            const previous = boxes[column - 1];
            expect(boxes[column].y).toBeGreaterThanOrEqual(previous.y + previous.height);
          }
        }
        for (let column = 0; column < expectedColumns.length; column++) {
          const choices = columns.nth(column).getByRole("link");
          const isFeatureColumn = hasLiveFeatures && column === 1;
          const count = isFeatureColumn ? await choices.count() : expectedColumns[column].length;
          if (isFeatureColumn) expect(count).toBeLessThanOrEqual(6);
          else await expect(choices).toHaveText(expectedColumns[column].map((link) => link.label));
          for (let item = 0; item < count; item++) {
            if (!isFeatureColumn) {
              await checkEntry(choices.nth(item), expectedColumns[column][item]);
              entries++;
            }
            const box = await choices.nth(item).boundingBox();
            expect(box!.width).toBeGreaterThan(0);
            expect(box!.x).toBeGreaterThanOrEqual(-1);
            expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
          }
        }
        if (expectedColumns.flat().some((link) => link.disabled)) {
          const unavailable = panel.locator('[aria-disabled="true"]').first();
          const ready = panel.locator("a[href]").first();
          const unavailableColor = await unavailable.evaluate(
            (node) => getComputedStyle(node).color,
          );
          const readyColor = await ready.evaluate((node) => getComputedStyle(node).color);
          if (menu.href === "/solutions") expect(unavailableColor).toBe(readyColor);
          else expect(unavailableColor).not.toBe(readyColor);
        }
        const last = panel.locator("[data-nav-column] a").last();
        await last.focus();
        await expect(last).toBeInViewport({ ratio: 1 });
        if (width === 390 || width === 1440)
          await page.screenshot({ path: test.info().outputPath(`menu-${index}-${width}.png`) });
      }
      expect(entries).toBe(
        headerMenus.flatMap((menu) => [
          ...menu.links,
          ...menu.groups!.flatMap((group) => group.links),
        ]).length,
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (width >= 1024) {
        const controls = await header(page, route)
          .locator(route === "/" ? ".header-inner a, .header-inner button" : "nav a, nav button")
          .evaluateAll((nodes) =>
            nodes
              .filter((node) => node.getClientRects().length)
              .map((node) => {
                const r = node.getBoundingClientRect();
                return { x: r.x, right: r.right };
              }),
          );
        expect(controls.every((r) => r.x >= 0 && r.right <= width)).toBe(true);
      }
      await page.keyboard.press("Escape");
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    });
  }

  for (const width of [390, 1440]) {
    test(`${route} every ready entry navigates and every unavailable entry blocks all pointer activation at ${width}px`, async ({
      page,
    }) => {
      test.setTimeout(240_000);
      await page.context().route("https://sunfordshop.com/**", (request) =>
        request.fulfill({
          contentType: "text/html",
          body: "<main><h1>SUNFORD Shop</h1><p>เลือกซื้อเครื่องชั่งดิจิทัลและอุปกรณ์ SUNFORD อย่างเป็นทางการพร้อมบริการหลังการขายและการรับประกัน</p></main>",
        }),
      );
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await visit(page, route);
      let checked = 0;
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      for (let index = 0; index < menus.length; index++) {
        const columns = [menus[index].links, ...menus[index].groups!.map((group) => group.links)];
        for (let column = 0; column < columns.length; column++) {
          for (let item = 0; item < columns[column].length; item++) {
            const expected = columns[column][item];
            const panel = await openMenu(page, route, width, index);
            const entry = panel
              .locator("[data-nav-column]")
              .nth(column)
              .getByRole("link")
              .nth(item);
            await checkEntry(entry, expected);
            await entry.scrollIntoViewIfNeeded();
            const original = page.url();
            if (expected.disabled) {
              const pages = page.context().pages().length;
              const history = await page.evaluate(() => window.history.length);
              const box = await entry.boundingBox();
              const x = box!.x + Math.min(8, box!.width / 2),
                y = box!.y + box!.height / 2;
              await page.mouse.click(x, y);
              await page.mouse.click(x, y, { button: "middle" });
              await page.keyboard.down("Control");
              await page.mouse.click(x, y);
              await page.keyboard.up("Control");
              await page.keyboard.down("Meta");
              await page.mouse.click(x, y);
              await page.keyboard.up("Meta");
              await expect(page).toHaveURL(original);
              expect(page.context().pages().length).toBe(pages);
              expect(await page.evaluate(() => window.history.length)).toBe(history);
              await expect(panel).toBeVisible();
            } else {
              await entry.click();
              await expect(page).toHaveURL(
                new URL(catalogSubmenuDestination(expected.href), original).href,
                {
                  timeout: 15_000,
                },
              );
              const main = page.locator("main:visible");
              await expect(main).toHaveCount(1);
              await expect(main.locator("h1").first()).not.toHaveText("");
              expect((await main.innerText()).trim().length).toBeGreaterThan(80);
              if (/^\/products\/category\/[^/]+$/.test(expected.href)) {
                const lineup = main.locator('[data-overview-section="lineup"]');
                const platforms = expected.href === "/products/category/platforms";
                const filters = lineup.getByRole("group", {
                  name: platforms ? "กรองตามวัสดุ" : "กรองผลิตภัณฑ์",
                });
                await expect(
                  filters.getByRole("button", { name: platforms ? "ทุกวัสดุ" : "ทุกผลิตภัณฑ์" }),
                ).toBeVisible();
                await expect(filters.getByRole("link")).toHaveCount(0);
                await expect(lineup.locator("#products-lineup > li:has(h3)").first()).toBeVisible();
              } else if (expected.href.startsWith("/products/category/")) {
                await expect(
                  main.locator('a[href^="/products/"]:not([href^="/products/category/"])').first(),
                ).toBeAttached();
              }
              if (page.url() !== original) {
                await page.goBack();
                await expect(page).toHaveURL(original);
              }
              await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
            }
            checked++;
          }
        }
      }
      expect(checked).toBe(
        menus.flatMap((menu) => [...menu.links, ...menu.groups!.flatMap((group) => group.links)])
          .length,
      );
      expect(errors).toEqual([]);
      await page.keyboard.press("Escape");
    });
  }

  test(`${route} keyboard skips disabled choices and the guide remains directly reachable`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await visit(page, route);
    const panel = await openMenu(page, route, 1440, 3);
    const trigger = header(page, route).getByRole("link", {
      name: "แท่นชั่ง",
      exact: true,
    });
    await trigger.press("ArrowDown");
    await expect(panel.locator("a[href]").first()).toBeFocused();
    for (let index = 0; index < 3; index++) {
      await page.keyboard.press("Tab");
      expect(
        await page.evaluate(() => document.activeElement?.getAttribute("aria-disabled")),
      ).not.toBe("true");
    }
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    const guide = header(page, route)
      .locator(route === "/" ? ".desktop-nav" : "[data-products-nav]")
      .getByRole("link", { name: "จัดสเปค", exact: true });
    await guide.click();
    await expect(page).toHaveURL(/\/guides\/indicator-platform-compatibility$/);
    await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
  });
}

test("touch menus, landscape navigation and 200 percent zoom remain usable", async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(240_000);
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  try {
    const page = await context.newPage();
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of routes) {
      await visit(page, route);
      let disabledChoices = 0;
      for (let index = 0; index < menus.length; index++) {
        const panel = await openMenu(page, route, 390, index);
        const disabled = panel.locator('[aria-disabled="true"]');
        for (let item = 0; item < (await disabled.count()); item++) {
          const entry = disabled.nth(item);
          await entry.scrollIntoViewIfNeeded();
          const box = await entry.boundingBox();
          const original = page.url();
          await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);
          await expect(page).toHaveURL(original);
          await expect(panel).toBeVisible();
          expect(page.context().pages().length).toBe(1);
          disabledChoices++;
        }
      }
      const disabledInSettings = menus
        .flatMap((menu) => [...menu.links, ...menu.groups!.flatMap((group) => group.links)])
        .filter((entry) => entry.disabled);
      expect(disabledChoices).toBe(disabledInSettings.length);
      await page.keyboard.press("Escape");
    }
    await page.setViewportSize({ width: 844, height: 390 });
    for (const route of routes) {
      await visit(page, route);
      for (let index = 0; index < menus.length; index++) {
        const nav = header(page, route);
        await nav.getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
        const trigger = nav.locator("#products-navigation-panel").getByRole("link", {
          name: headerLabels.get(menus[index].href),
          exact: true,
        });
        await trigger.tap();
        await expect(page).toHaveURL(new URL(menus[index].href, baseURL).href, { timeout: 15_000 });
        if (menus[index].href !== route) await page.goBack();
      }
    }
    const cdp = await context.newCDPSession(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 720,
      height: 450,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await visit(page, "/service?section=contact");
    for (let index = 0; index < menus.length; index++)
      await expect(await openMenu(page, "/service?section=contact", 720, index)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  } finally {
    await context.close();
  }
});

test("short desktop menus reset scroll when hovering to another menu and unlock on resize", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1040, height: 260 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const route = "/service?section=contact";
  await visit(page, route);
  const nav = header(page, route);
  const panel = nav.locator("#products-navigation-panel");
  await page.mouse.move(4, 220);
  await nav.locator(".desktop-nav").getByRole("link", { name: "โซลูชัน", exact: true }).hover();
  await expect(panel.locator('[data-nav-menu="/solutions"]')).toBeVisible();
  await panel.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  expect(await panel.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
  await nav.locator(".desktop-nav").getByRole("link", { name: "เครื่องชั่ง", exact: true }).hover();
  await expect(panel.locator('[data-nav-menu="/products/category/scales"]')).toBeVisible();
  await expect(panel.locator('[data-nav-column="uses"] a').first()).toBeVisible();
  expect(await panel.evaluate((node) => node.scrollTop)).toBe(0);

  await page.setViewportSize({ width: 1023, height: 260 });
  await expect(panel).toHaveCount(0);
  await nav.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  await nav.getByRole("button", { name: "เปิดเมนูย่อยโซลูชัน", exact: true }).click();
  await expect(panel.locator('[data-nav-menu="/solutions"]')).toBeVisible();
  await page.setViewportSize({ width: 1024, height: 260 });
  await expect(panel).toHaveCount(0);
  await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});
