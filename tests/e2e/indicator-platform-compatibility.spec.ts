import { test, expect } from "@playwright/test";
import { getWeighingOptions } from "../../src/features/content/data/weighing-options";

const path = "/guides/indicator-platform-compatibility";
test.use({ reducedMotion: "reduce" });

for (const width of [390, 834, 1440]) {
  test(`Warehouse sidebar and confirmed pair gating at ${width}px`, async ({ page, request }) => {
    const { products } = await (await request.get("/api/products")).json();
    const options = getWeighingOptions(products);
    const heads = options.filter((o) => o.kind === "head");
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    const sidebar = page.getByRole("complementary", { name: "ชุดที่เลือก" });
    await expect(sidebar.locator("header")).toContainText("฿0.00");
    for (const label of ["หัวอ่าน", "แท่นชั่ง", "อุปกรณ์เสริม"])
      await expect(sidebar.getByRole("region", { name: label, exact: true })).toBeVisible();
    await expect(page.locator("main article h3")).toHaveText(heads.map((o) => o.displayName!));
    for (const head of heads) {
      const pending = !head.compatibleCodes?.length;
      const button = page.getByRole("button", {
        name: pending ? `${head.code} รอยืนยันรุ่นแท่นชั่ง` : `เลือก ${head.code}`,
        exact: true,
      });
      if (pending) await expect(button).toBeDisabled();
      else await expect(button).toBeEnabled();
    }
    await expect(sidebar.getByRole("button", { name: "อุปกรณ์เสริม", exact: true })).toBeDisabled();
    const confirmed = heads.find((o) => o.compatibleCodes?.length);
    if (confirmed) {
      await page.getByRole("button", { name: `เลือก ${confirmed.code}`, exact: true }).click();
      const selected = sidebar.getByRole("region", { name: "หัวอ่าน", exact: true });
      await expect(selected.getByRole("link")).toHaveText(confirmed.displayName!);
      const platform = options.find((o) => confirmed.compatibleCodes!.includes(o.code))!;
      await page.getByRole("button", { name: `เลือก ${platform.code}`, exact: true }).click();
      await expect(
        sidebar.getByRole("region", { name: "แท่นชั่ง", exact: true }).getByRole("link"),
      ).toHaveText(platform.displayName!);
      const quote = sidebar.getByRole("link", { name: /ทำใบเสนอราคา/ });
      expect(
        new URL((await quote.getAttribute("href"))!, "http://local").searchParams.getAll("model"),
      ).toEqual([confirmed.code, platform.code]);
      await sidebar
        .getByRole("button", { name: `นำ ${confirmed.code} ออกจากชุด`, exact: true })
        .click();
      await expect(quote).toHaveCount(0);
    } else {
      await expect(
        sidebar.getByRole("button", { name: "ทำใบเสนอราคา", exact: true }),
      ).toBeDisabled();
      await sidebar.getByRole("button", { name: "แท่นชั่ง", exact: true }).click();
      await expect(page.locator("main article")).toHaveCount(0);
      await expect(sidebar.getByRole("link", { name: /ทำใบเสนอราคา/ })).toHaveCount(0);
      await sidebar.getByRole("button", { name: "หัวอ่าน", exact: true }).click();
    }
    const rail = (await sidebar.boundingBox())!;
    const search = (await page.getByRole("searchbox").boundingBox())!;
    if (width < 768) expect(rail.y + rail.height).toBeLessThanOrEqual(search.y);
    else expect(rail.x + rail.width).toBeLessThan(search.x);
    await page.getByRole("searchbox").fill(heads[0].code);
    await expect(page.locator("main article h3")).toHaveText([heads[0].displayName!]);
    const popup = page.waitForEvent("popup");
    await page.locator("main article h3 a").click();
    const detail = await popup;
    await expect(detail.locator("#product-overview h1")).toHaveText(heads[0].displayName!);
    await detail.close();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await sidebar.scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath(`warehouse-sidebar-${width}.png`) });
  });
}
for (const [width, entry] of [
  [390, "/"],
  [1440, "/contact-us"],
] as const) {
  test(`Services links to both hubs at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const [label, href] of [
      ["โซลูชันตามธุรกิจ", "/solutions"],
      ["ซอฟต์แวร์", "/applications-and-softwares"],
    ]) {
      await page.goto(entry);
      if (entry === "/") {
        await expect(page.locator("[data-brand-opening]")).toHaveAttribute(
          "data-phase",
          "complete",
        );
        await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
        await page.locator("#mobile-navigation summary").filter({ hasText: "บริการ" }).click();
      } else
        await page
          .locator("[data-products-header]:visible")
          .getByRole("button", { name: "บริการ", exact: true })
          .click();
      const menu = page.locator("#mobile-navigation:visible, #products-navigation-panel:visible");
      await menu.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(href + "$"));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });
}
for (const width of [320, 390, 600, 768, 834, 1024, 1440, 1920]) {
  test(`guide discloses models on demand at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { level: 1 })).toHaveText("จัดสเปคเครื่องชั่ง");
    await expect(main.locator(":scope > header")).toHaveCount(0);
    const nav = await page.locator("[data-products-header]:visible").boundingBox();
    const builder = await main.getByRole("region", { name: "เลือกอุปกรณ์จัดชุด" }).boundingBox();
    expect(builder!.y - nav!.y - nav!.height).toBeCloseTo(24, 0);
    await expect(main.locator("details")).toHaveCount(5);
    await expect(main.locator("details[open]")).toHaveCount(0);
    if ([390, 834, 1440].includes(width))
      await page.screenshot({ path: test.info().outputPath(`guide-${width}.png`) });
    for (const summary of await main.locator("summary").all()) {
      await summary.focus();
      await summary.press("Enter");
    }
    await expect(main.locator("details[open]")).toHaveCount(5);
    const { products } = await (await page.request.get("/api/products")).json();
    const options = getWeighingOptions(products);
    await expect(
      main.locator("details a").filter({ hasText: options[0].displayName }).first(),
    ).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
for (const route of ["/", "/contact-us"]) {
  test(`mobile main menu opens the guide directly from ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    if (route === "/")
      await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
    const nav = page.locator(
      route === "/" ? ".site-header:visible" : "[data-products-header]:visible",
    );
    await nav.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
    await nav.getByRole("link", { name: "จัดสเปค", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(path + "$"));
  });
  test(`open guide directly from ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 900 });
    await page.goto(route);
    if (route === "/")
      await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
    const nav = page.locator(
      route === "/" ? ".site-header:visible" : "[data-products-header]:visible",
    );
    await nav.getByRole("link", { name: "จัดสเปค", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(path + "$"));
  });
}
