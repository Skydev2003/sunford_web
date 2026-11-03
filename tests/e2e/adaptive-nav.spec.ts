import { expect, test, type Page } from "@playwright/test";

async function expectTone(page: Page, tone: "light" | "dark") {
  const header = page.locator(".site-header");
  await expect(header).toHaveAttribute("data-nav-tone", tone);
  await expect(header.locator(".nav-glass")).toHaveCSS("backdrop-filter", "blur(12px)");
  await expect(header.locator(".nav-glass")).toHaveCSS(
    "background-color",
    tone === "light" ? "rgba(255, 255, 255, 0.72)" : "rgba(17, 17, 17, 0.5)",
  );
  await expect(header).toHaveCSS(
    "color",
    tone === "light" ? "rgb(39, 49, 66)" : "rgb(207, 207, 207)",
  );
}

async function beneathNav(page: Page, selector: string) {
  await page
    .locator(selector)
    .evaluate((section) =>
      scrollTo({ top: section.getBoundingClientRect().top + scrollY + 20, behavior: "instant" }),
    );
}

for (const width of [1440, 390]) {
  test(`navigation follows dark and light sections, including expanded menus at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expectTone(page, "dark");
    await beneathNav(page, "#product-experience");
    await expectTone(page, "dark");
    await beneathNav(page, "#story");
    await expectTone(page, "light");
    const header = page.locator(".site-header");
    if (width >= 1400) {
      await header.locator(".desktop-nav a").first().focus();
      await expect(header.locator("#desktop-submenu")).toBeVisible();
      await expect(header.locator("#desktop-submenu")).toHaveCSS(
        "background-color",
        "rgba(255, 255, 255, 0.97)",
      );
      await expect(header.locator(".submenu-group").first()).toHaveCSS("color", "rgb(39, 49, 66)");
    } else {
      await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      await expect(header.locator("#mobile-navigation")).toBeVisible();
      await header.locator("#mobile-navigation summary").first().click();
      await expect(header.locator(".mobile-nav-panel a").first()).toBeVisible();
    }
    await expectTone(page, "light");
    await page.screenshot({ path: test.info().outputPath(`light-menu-${width}.png`) });
    await page.keyboard.press("Escape");
    await beneathNav(page, "#product-experience");
    await expectTone(page, "dark");
    await page.screenshot({ path: test.info().outputPath(`dark-${width}.png`) });
    expect(errors).toEqual([]);
  });

  test(`internal light pages and client navigation update navigation tone at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/Indicator");
    await expectTone(page, "light");
    await page.screenshot({ path: test.info().outputPath(`indicator-light-${width}.png`) });
    await page.getByRole("link", { name: "Sunford หน้าหลัก", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expectTone(page, "dark");
    await page
      .locator("[data-hero-scene]")
      .getByRole("link", { name: "ปรึกษาผู้เชี่ยวชาญ" })
      .click();
    await expect(page).toHaveURL(/\/contact-us$/);
    await expectTone(page, "light");
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expectTone(page, "dark");
  });
}

test("navigation has a light internal-page and dark homepage fallback without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const page = await browser.newPage({
    javaScriptEnabled: false,
    baseURL,
    viewport: { width: 1440, height: 900 },
  });
  await page.goto("/Indicator");
  await expect(page.locator(".nav-glass")).toHaveCSS(
    "background-color",
    "rgba(255, 255, 255, 0.72)",
  );
  await page.goto("/");
  await expect(page.locator(".nav-glass")).toHaveCSS("background-color", "rgba(17, 17, 17, 0.5)");
  await page.close();
});
