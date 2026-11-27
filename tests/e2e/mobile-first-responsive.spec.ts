import { expect, test, type Page } from "@playwright/test";

const viewports = [320, 390, 768, 1024, 1440, 1920];
const boundaries = [
  639, 640, 641, 767, 768, 769, 833, 834, 1023, 1024, 1025, 1279, 1280, 1281, 1535, 1536, 1537,
];
const templateWidths =
  process.env.MF_BOUNDARIES === "1"
    ? [...new Set([...viewports, ...boundaries, 720, 735, 759, 800, 900, 1069, 1100, 1400])].sort(
        (a, b) => a - b,
      )
    : viewports;
const templates = [
  "/",
  "/products",
  "/explore",
  "/products/category/scales",
  "/products/category/indicators",
  "/products/category/platforms",
  "/products/category/pos",
  "/products/category/accessories",
  "/products/wps10ks",
  "/products/warehouse-G107404",
  "/service?section=contact",
  "/service",
  "/about-us",
  "/solutions",
  "/guides/indicator-platform-compatibility",
  "/service/quotation",
];

async function settled(page: Page, route: string) {
  const response = await page.goto(route);
  expect(response?.ok()).toBe(true);
  await expect(page.locator("main:visible h1").first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(
    page.getByRole("button", {
      name: "ค้นหาสินค้าและข้อมูล",
      exact: true,
    }),
  ).toBeEnabled();
}

async function geometry(page: Page) {
  return page.evaluate(() => {
    const header = [...document.querySelectorAll("header")].find((element) =>
      element.checkVisibility(),
    )!;
    const controls = [...header.querySelectorAll("a,button")]
      .filter(
        (element) =>
          element.checkVisibility({ checkOpacity: true }) &&
          !element.closest("#products-navigation-panel,.mobile-nav,[data-nav-panel]"),
      )
      .map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          name: element.getAttribute("aria-label") || element.textContent?.trim(),
          x: bounds.x,
          right: bounds.right,
          top: bounds.top,
          width: bounds.width,
          height: bounds.height,
          hit: element.contains(
            document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2),
          ),
        };
      })
      .filter((bounds) => bounds.height > 0 && bounds.top >= 0 && bounds.top < 100);
    return { width: innerWidth, document: document.documentElement.scrollWidth, controls };
  });
}

test.describe("mobile-first responsive", () => {
  test.use({ reducedMotion: "reduce" });
  for (const route of templates) {
    test(`${route} preserves public template reflow`, async ({ page }, info) => {
      test.setTimeout(90_000);
      await settled(page, route);
      const results = [];
      for (const width of templateWidths) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(
          () =>
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
        const measured = await geometry(page);
        results.push(measured);
        expect(measured.document, `${route} at${width}`).toBeLessThanOrEqual(width + 1);
        for (const control of measured.controls) {
          expect(control.x, control.name).toBeGreaterThanOrEqual(-1);
          expect(control.right, control.name).toBeLessThanOrEqual(width + 1);
          expect(control.hit, control.name).toBe(true);
        }
      }
      await info.attach("reflow", {
        body: JSON.stringify(results),
        contentType: "application/json",
      });
    });
  }

  for (const route of ["/", "/service?section=contact"]) {
    test(`${route} desktop keyboard follows current visible menu order`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await settled(page, route);
      const header = page.locator("header:visible");
      const trigger = header.getByRole("link", { name: "เครื่องชั่ง", exact: true });
      await trigger.focus();
      await page.keyboard.press("ArrowDown");
      const href = await trigger.getAttribute("href");
      const panel =
        route === "/"
          ? page.locator("[data-nav-menu]")
          : header.locator(`[data-nav-menu="${href}"]`);
      const links = panel.getByRole("link");
      await expect(links.first()).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(links.nth(1)).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(links.nth(2)).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
    });

    test(`${route} Header uses lg at every boundary`, async ({ page }, info) => {
      await settled(page, route);
      for (const width of boundaries) {
        await page.setViewportSize({ width, height: 900 });
        const toggle = page.getByRole("button", { name: "เปิดเมนู", exact: true });
        if (width < 1024) await expect(toggle).toBeVisible();
        else await expect(toggle).toBeHidden();
        const measured = await geometry(page);
        expect(measured.document).toBeLessThanOrEqual(width + 1);
        for (const control of measured.controls) {
          expect(control.x, `${width}:${control.name}`).toBeGreaterThanOrEqual(-1);
          expect(control.right, `${width}:${control.name}`).toBeLessThanOrEqual(width + 1);
        }
      }
      await page.screenshot({ path: info.outputPath("wide-header.png") });
    });

    test(`${route} resizing an open menu releases inert and scroll lock`, async ({ page }) => {
      await page.setViewportSize({ width: 834, height: 600 });
      await settled(page, route);
      const trigger = page.getByRole("button", { name: "เปิดเมนู", exact: true });
      await trigger.click();
      await expect(page.getByRole("button", { name: "ปิดเมนู", exact: true })).toBeVisible();
      await page.setViewportSize({ width: 1024, height: 600 });
      await expect(page.getByRole("button", { name: "ปิดเมนู", exact: true })).toBeHidden();
      expect(
        await page
          .locator("main:visible")
          .evaluateAll((elements) => elements.every((element) => !(element as HTMLElement).inert)),
      ).toBe(true);
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
      await page.setViewportSize({ width: 833, height: 600 });
      await trigger.click();
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
    });
  }
});

test("Home category and story variants follow the shared breakpoints", async ({ page }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await settled(page, "/");
  const section = page.locator("#product-experience");
  const track = page.locator(".stories-track");
  for (const width of [
    320, 390, 639, 640, 720, 735, 759, 767, 768, 769, 992, 1023, 1024, 1279, 1280, 1440,
  ]) {
    await page.setViewportSize({ width, height: 900 });
    await section.scrollIntoViewIfNeeded();
    const media = (await section.locator(".category-feature-media").boundingBox())!;
    const choices = (await section.locator(".category-feature-grid").boundingBox())!;
    expect(media.width / media.height).toBeCloseTo(16 / 9, 2);
    if (width < 1024) expect(choices.y).toBeGreaterThan(media.y + media.height);
    else expect(media.x).toBeGreaterThan(choices.x + choices.width);
    const description = section.locator(".category-feature-description").first();
    if (width < 640) await expect(description).toBeHidden();
    else await expect(description).toBeVisible();
    await track.scrollIntoViewIfNeeded();
    await track.focus();
    const before = await track.getAttribute("data-active-index");
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => track.getAttribute("data-active-index")).not.toBe(before);
    await expect
      .poll(
        () =>
          track
            .locator("[data-clarity]")
            .evaluateAll(
              (nodes) =>
                nodes.filter((node) => Number(node.getAttribute("data-clarity")) > 0.995).length,
            ),
        { message: `story clarity at ${width}px` },
      )
      .toBe(width < 768 ? 1 : 3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width + 1,
    );
  }
});

test("Products intro aligns across md and the storefront stays within the viewport", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await settled(page, "/products");
  const intro = page.locator("[data-products-directory] header");
  for (const width of [
    320, 390, 639, 640, 641, 720, 734, 735, 759, 767, 768, 769, 800, 833, 834, 900, 1023, 1024,
    1025, 1069, 1279, 1280, 1281, 1535, 1536, 1537,
  ]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo(0, 0));
    const title = (await intro.locator("h1").boundingBox())!;
    const help = (await intro.locator("p").boundingBox())!;
    if (width < 768) expect(help.y).toBeGreaterThanOrEqual(title.y + title.height);
    else expect(help.x).toBeGreaterThanOrEqual(title.x + title.width - 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width + 1,
    );
  }
});

test("Service tabs keep policies reachable on short desktops and reflow through every variant", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 720 });
  await settled(page, "/service");
  const policy = page.locator("main").getByRole("link", { name: "เงื่อนไขรับประกัน", exact: true });
  await expect(page.getByRole("tab")).toHaveCount(5);
  for (const tab of await page.getByRole("tab").all()) {
    await tab.click();
    await expect(page.getByRole("tabpanel")).toBeVisible();
    await expect(policy).toBeInViewport();
    const bottom = await page
      .locator("main:visible")
      .evaluate((main) => main.getBoundingClientRect().bottom + scrollY);
    expect(bottom).toBeLessThanOrEqual(720);
  }
  for (const width of [320, 390, 639, 640, 767, 768, 769, 1023, 1024, 1279, 1280, 1281]) {
    await page.setViewportSize({ width, height: 900 });
    for (const tab of await page.getByRole("tab").all()) {
      await tab.click();
      await expect(page.getByRole("tabpanel")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width + 1,
      );
    }
  }
});

for (const motion of ["reduce", "no-preference"] as const) {
  test(`short screens retain usable public controls with ${motion} motion`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.emulateMedia({ reducedMotion: motion });
    for (const route of [
      "/",
      "/products",
      "/products/category/scales",
      "/products/wps10ks",
      "/service?section=contact",
      "/service",
      "/guides/indicator-platform-compatibility",
      "/service/quotation",
    ]) {
      await settled(page, route);
      if (route === "/")
        await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-enhanced", "true", {
          timeout: 15_000,
        });
      for (const viewport of [
        { width: 667, height: 375 },
        { width: 844, height: 390 },
        { width: 768, height: 1024 },
        { width: 1024, height: 768 },
        { width: 1440, height: 600 },
      ]) {
        await page.setViewportSize(viewport);
        await page.evaluate(() => scrollTo(0, 0));
        await expect
          .poll(async () => (await geometry(page)).document)
          .toBeLessThanOrEqual(viewport.width + 1);
        for (const control of (await geometry(page)).controls) {
          expect(control.x, `${route}: ${control.name}`).toBeGreaterThanOrEqual(-1);
          expect(control.right, `${route}: ${control.name}`).toBeLessThanOrEqual(
            viewport.width + 1,
          );
          expect(control.hit, `${route}: ${control.name}`).toBe(true);
        }
      }
    }
  });
}

test("every current ready Header destination reflows", async ({ page }, info) => {
  test.skip(process.env.MF_FULL_SWEEP !== "1", "Full route sweep is enabled for phase acceptance.");
  test.setTimeout(600_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await settled(page, "/");
  const routes = [
    ...new Set(
      await page
        .locator("header a[href]")
        .evaluateAll((elements) =>
          elements
            .map((element) => element.getAttribute("href")!)
            .filter((href) => href.startsWith("/")),
        ),
    ),
  ];
  const results = [];
  const mediaQueries = new Set<string>();
  for (const route of routes) {
    await settled(page, route);
    const queries = await page.evaluate(() => {
      const found: string[] = [];
      const visit = (rules: CSSRuleList) => {
        for (const rule of rules) {
          if (rule instanceof CSSMediaRule && /width/.test(rule.conditionText))
            found.push(rule.conditionText);
          if (rule instanceof CSSGroupingRule) visit(rule.cssRules);
        }
      };
      for (const sheet of document.styleSheets) {
        try {
          visit(sheet.cssRules);
        } catch {
          /* External sheets cannot be inspected. */
        }
      }
      return found;
    });
    for (const query of queries) {
      mediaQueries.add(query);
      expect(query).not.toMatch(/max-width|width\s*<|min-width:\s*[\d.]+px/);
      for (const match of query.matchAll(/min-width:\s*([\d.]+)rem/g))
        expect([40, 48, 64, 80, 96]).toContain(Number(match[1]));
    }
    for (const width of viewports) {
      await page.setViewportSize({ width, height: 900 });
      const measured = await geometry(page);
      results.push({ route, ...measured });
      expect(measured.document, `${route}:${width}`).toBeLessThanOrEqual(width + 1);
    }
  }
  await info.attach("route-sweep", {
    body: JSON.stringify(results),
    contentType: "application/json",
  });
  await info.attach("active-viewport-media", {
    body: JSON.stringify([...mediaQueries]),
    contentType: "application/json",
  });
});
