import { expect, test, type Page } from "@playwright/test";

async function productTheme(page: Page) {
  return page.locator("main.product-detail:visible").evaluate((main) => ({
    surface: getComputedStyle(main.parentElement!).backgroundColor,
    footer: getComputedStyle(document.querySelector(".site-footer")!).backgroundColor,
  }));
}

for (const width of [390, 834, 1440]) {
  test(`product theme matches direct loading after home navigation and history at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/products/wps10ks");
    await expect(page.locator("main.product-detail:visible h1")).toHaveText("WPS10KS");
    const direct = await productTheme(page);
    expect(direct.surface).toBe("rgb(255, 255, 255)");

    await page.goto("/");
    await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
    await expect(page.locator('[data-home-route="true"]')).toHaveCSS(
      "background-color",
      "rgb(0, 0, 0)",
    );
    await page.evaluate(() => {
      document.documentElement.dataset.navigationProbe = "same-document";
    });
    await page.getByRole("button", { name: "ค้นหาสินค้า", exact: true }).click();
    await page.getByRole("textbox", { name: "ค้นหาสินค้า Sunford" }).fill("G106698");
    await page.locator('.search-results a[href="/products/wps10ks"]').click();
    await page.waitForURL("**/products/wps10ks");
    await expect(page.locator("main.product-detail:visible h1")).toHaveText("WPS10KS");
    expect(await productTheme(page)).toEqual(direct);
    await expect(page.locator("html")).toHaveAttribute("data-navigation-probe", "same-document");
    await expect
      .poll(() =>
        page
          .locator("main.product-detail:visible .detail-image img")
          .evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    await page.screenshot({ path: test.info().outputPath(`product-light-${width}.png`) });

    await page.goBack();
    await page.waitForURL("/");
    await expect(page.locator('[data-home-route="true"]')).toHaveCSS(
      "background-color",
      "rgb(0, 0, 0)",
    );
    await expect(page.locator(".site-footer")).toHaveCSS("background-color", "rgb(0, 0, 0)");
    await page.goForward();
    await page.waitForURL("**/products/wps10ks");
    await expect(page.locator("main.product-detail:visible h1")).toHaveText("WPS10KS");
    expect(await productTheme(page)).toEqual(direct);
    await expect(page.locator("html")).toHaveAttribute("data-navigation-probe", "same-document");

    await page.locator('a[href="/products"]:visible').first().click();
    await page.waitForURL("**/products");
    await page
      .locator('[data-products-directory] [data-warehouse-sku="G106698"] a')
      .first()
      .click();
    await page.waitForURL("**/products/wps10ks");
    await expect(page.locator("main.product-detail:visible h1")).toHaveText("WPS10KS");
    expect(await productTheme(page)).toEqual(direct);
    await expect(page.locator("html")).toHaveAttribute("data-navigation-probe", "same-document");
  });
}
