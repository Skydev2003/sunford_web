import { expect, test, type Page } from "@playwright/test";

async function surfaceState(page: Page) {
  return page.locator("main:visible").evaluate((main) => {
    const style = getComputedStyle(main);
    const footer = [...document.querySelectorAll(".site-footer, [data-products-footer]")].find(
      (element) => element.getClientRects().length,
    );
    const header = [...document.querySelectorAll("header")].find(
      (element) => element.getClientRects().length && !element.closest("main"),
    );
    return {
      surface: getComputedStyle(main.parentElement!).backgroundColor,
      background: style.backgroundColor,
      color: style.color,
      paddingTop: style.paddingTop,
      fontFamily: style.fontFamily,
      footer: footer ? getComputedStyle(footer).backgroundColor : null,
      header: header ? getComputedStyle(header).backgroundColor : null,
      overflow: getComputedStyle(document.body).overflow,
      inert: (main as HTMLElement).inert,
      dialogs: document.querySelectorAll("dialog[open]").length,
    };
  });
}

async function ready(page: Page, route: string) {
  await page.waitForURL((url) => url.pathname === route);
  await expect(page.locator("main:visible")).toHaveCount(1);
  await page.evaluate(async () => {
    await document.fonts.ready;
    scrollTo({ top: 0, behavior: "instant" });
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  if (route === "/") {
    await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
  }
}

const desktopRoutes = [
  "/",
  "/products",
  "/products/wps10ks",
  "/products/category/scales",
  "/products/category/indicators",
  "/products/category/platforms",
  "/products/category/pos",
  "/products/category/accessories",
  "/products/category/scales/industrial",
  "/products/category/indicators/lcd",
  "/products/category/accessories/cables",
  "/guides/indicator-platform-compatibility",
  "/service/quotation",
  "/about-us",
  "/contact-us",
  "/software/download",
  "/applications-and-softwares",
  "/warranty/policy",
  "/explore",
  "/business/blogs/editorial",
];
const responsiveRoutes = [
  "/products",
  "/products/wps10ks",
  "/products/category/scales/industrial",
  "/guides/indicator-platform-compatibility",
  "/service/quotation",
  "/contact-us",
];

for (const width of [390, 834, 1440]) {
  for (const route of width === 1440 ? desktopRoutes : responsiveRoutes) {
    test(`${route} restores its direct-load surface after service/history at ${width}px`, async ({
      page,
    }) => {
      test.setTimeout(60000);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 950 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(200);
      await ready(page, route);
      const direct = await surfaceState(page);
      expect(direct.inert).toBe(false);
      expect(direct.overflow).not.toBe("hidden");
      await page.evaluate(() => {
        document.documentElement.dataset.navigationProbe = "same-document";
      });

      let historySteps = 1;
      if (!(await page.locator('a[href="/service"]:visible').count())) {
        await page.locator('a[href="/contact-us"]:visible').first().click();
        await ready(page, "/contact-us");
        historySteps += 1;
      }
      await page.locator('a[href="/service"]:visible').first().click();
      await ready(page, "/service");
      expect((await surfaceState(page)).surface).toBe("rgb(246, 248, 251)");
      for (let step = 0; step < historySteps; step += 1) await page.goBack();
      await ready(page, route);
      await expect.poll(() => surfaceState(page)).toEqual(direct);
      await expect(page.locator("html")).toHaveAttribute("data-navigation-probe", "same-document");
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);

      for (let step = 0; step < historySteps; step += 1) await page.goForward();
      await ready(page, "/service");
      expect((await surfaceState(page)).surface).toBe("rgb(246, 248, 251)");
      for (let step = 0; step < historySteps; step += 1) await page.goBack();
      await ready(page, route);
      await expect.poll(() => surfaceState(page)).toEqual(direct);
      expect(errors).toEqual([]);
      if (responsiveRoutes.includes(route)) {
        await page.screenshot({ path: test.info().outputPath(`restored-${width}.png`) });
      }
    });
  }
}

test("mobile menu and search release scrolling and inert state during client navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/service");
  await ready(page, "/service");
  await page.evaluate(() => {
    document.documentElement.dataset.navigationProbe = "same-document";
  });
  await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  await expect(page.locator("main:visible")).toHaveAttribute("inert", "");
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.locator('#products-navigation-panel a[href="/products"]').click();
  await ready(page, "/products");
  await expect.poll(async () => (await surfaceState(page)).inert).toBe(false);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await page.getByRole("button", { name: /ค้นหาสินค้า/ }).click();
  await page.getByRole("textbox", { name: "ค้นหาสินค้า Sunford" }).fill("G106698");
  await page.locator('.search-results a[href="/products/wps10ks"]').click();
  await ready(page, "/products/wps10ks");
  await expect(page.locator("main:visible h1")).toHaveText("WPS10KS");
  await expect.poll(async () => (await surfaceState(page)).inert).toBe(false);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("data-navigation-probe", "same-document");
});
