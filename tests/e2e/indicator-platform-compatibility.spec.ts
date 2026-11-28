import { test, expect } from "@playwright/test";
import { getWeighingOptions } from "../../src/features/content/data/weighing-options";

const path = "/platforms/custom-spec";
test.use({ reducedMotion: "reduce" });

test("recommended sets prefill a single priced model in the quotation", async ({ page }) => {
  await page.goto(path);
  const links = page.getByRole("link", { name: "ขอใบเสนอราคาชุดนี้", exact: true });
  await expect(links.first()).toBeVisible();

  const count = await links.count();
  for (let index = 0; index < count; index++) {
    const link = links.nth(index);
    const name = await link.locator("..").getByRole("heading", { level: 3 }).textContent();
    await expect(link).toHaveAttribute("href", "/service/quotation");
    await link.click();
    await expect(page).toHaveURL(/\/service\/quotation\?selection=/, { timeout: 20_000 });
    const row = page.getByRole("button", { name: /^เลือกรุ่นสินค้ารายการที่/ });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(name!);
    await page.goBack();
  }
});

for (const width of [390, 834, 1440]) {
  test(`Warehouse sidebar and confirmed pair gating at ${width}px`, async ({ page, request }) => {
    const { products } = await (await request.get("/api/products")).json();
    const options = getWeighingOptions(products);
    const heads = options.filter((o) => o.kind === "head");
    const platforms = options.filter((o) => o.kind === "platform");
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    const sidebar = page.getByRole("complementary", { name: "ชุดที่เลือก" });
    await expect(sidebar.locator("header")).toContainText("฿0.00");
    for (const label of ["แท่นชั่ง", "อินดิเคเตอร์", "อุปกรณ์เสริม"])
      await expect(sidebar.getByRole("region", { name: label, exact: true })).toBeVisible();
    await expect(sidebar.getByRole("button", { name: "แท่นชั่ง", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator("main article h3")).toHaveText(platforms.map((o) => o.displayName!));
    await sidebar.getByRole("button", { name: "อินดิเคเตอร์", exact: true }).click();
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
      const platform = options.find((o) => confirmed.compatibleCodes!.includes(o.code))!;
      await sidebar.getByRole("button", { name: "แท่นชั่ง", exact: true }).click();
      await page.getByRole("button", { name: `เลือก ${platform.code}`, exact: true }).click();
      await expect(page.getByRole("heading", { name: /^อินดิเคเตอร์สำหรับ / })).toBeVisible();
      await page.getByRole("button", { name: `เลือก ${confirmed.code}`, exact: true }).click();
      const selected = sidebar.getByRole("region", { name: "อินดิเคเตอร์", exact: true });
      await expect(selected.getByText(confirmed.displayName!, { exact: true })).toBeVisible();
      await expect(
        selected.getByRole("link", { name: `ดูสเปค ${confirmed.code}` }),
      ).toHaveAttribute("href", confirmed.detailHref);
      await expect(
        sidebar
          .getByRole("region", { name: "แท่นชั่ง", exact: true })
          .getByRole("link", { name: `ดูสเปค ${platform.code}` }),
      ).toHaveAttribute("href", platform.detailHref);
      const quote = sidebar.getByRole("link", { name: /ทำใบเสนอราคา/ });
      await expect(quote).toHaveAttribute("href", "/service/quotation");
      const [quotationPage] = await Promise.all([page.waitForEvent("popup"), quote.click()]);
      await expect(quotationPage).toHaveURL(/\/service\/quotation\?selection=/);
      const rows = quotationPage.getByRole("button", { name: /^เลือกรุ่นสินค้ารายการที่/ });
      await expect(rows).toHaveCount(2);
      expect(
        (await rows.evaluateAll((items) => items.map((item) => item.getAttribute("value")))).sort(),
      ).toEqual([confirmed.sku, platform.sku].sort());
      await quotationPage.close();
      await sidebar
        .getByRole("button", { name: `นำ ${confirmed.code} ออกจากชุด`, exact: true })
        .click();
      await expect(quote).toHaveCount(0);
      await sidebar
        .getByRole("button", { name: `นำ ${platform.code} ออกจากชุด`, exact: true })
        .click();
      await sidebar.getByRole("button", { name: "อินดิเคเตอร์", exact: true }).click();
    } else {
      await expect(
        sidebar.getByRole("button", { name: "ทำใบเสนอราคา", exact: true }),
      ).toBeDisabled();
      await sidebar.getByRole("button", { name: "แท่นชั่ง", exact: true }).click();
      await expect(page.locator("main article")).toHaveCount(platforms.length);
      await expect(page.getByRole("link", { name: "ชุดสำเร็จที่แนะนำ" })).toHaveAttribute(
        "href",
        "#recommended-sets",
      );
      await expect(sidebar.getByRole("link", { name: /ทำใบเสนอราคา/ })).toHaveCount(0);
      await sidebar.getByRole("button", { name: "อินดิเคเตอร์", exact: true }).click();
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
    await page.screenshot({
      path: test.info().outputPath(`warehouse-sidebar-${width}.png`),
      caret: "initial",
    });
  });
}
for (const [width, entry] of [
  [390, "/"],
  [1440, "/service?section=contact"],
] as const) {
  test(`Navbar links to both hubs at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const [label, href] of [
      ["โซลูชัน", "/solutions"],
      ["ซอฟต์แวร์", "/software"],
    ]) {
      await page.goto(entry);
      const nav = page.locator(
        entry === "/" ? ".site-header:visible" : "[data-products-header]:visible",
      );
      if (entry === "/") {
        await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-enhanced", "true");
        await nav.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      }
      await nav.getByRole("link", { name: label, exact: true }).click();
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
    await expect(main.getByRole("heading", { level: 1 })).toHaveText("จัดสเปคแท่นชั่ง");
    await expect(main.locator(":scope > header")).toHaveCount(0);
    const nav = await page.locator("[data-products-header]:visible").boundingBox();
    const title = await main.getByRole("heading", { level: 1 }).boundingBox();
    const builder = await main.getByRole("region", { name: "เลือกอุปกรณ์จัดชุด" }).boundingBox();
    const entrySpacing = width >= 1280 ? 32 : width >= 768 ? 24 : 16;
    expect(title!.y - nav!.y - nav!.height).toBeCloseTo(entrySpacing, 0);
    expect(builder!.y).toBeGreaterThan(title!.y + title!.height);
    await expect(main.locator("details")).toHaveCount(5);
    await expect(main.locator("details[open]")).toHaveCount(0);
    if ([390, 834, 1440].includes(width))
      await page.screenshot({
        path: test.info().outputPath(`guide-${width}.png`),
        caret: "initial",
      });
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
for (const route of ["/", "/service?section=contact"]) {
  test(`mobile main menu opens the guide directly from ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    if (route === "/")
      await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-enhanced", "true");
    const nav = page.locator(
      route === "/" ? ".site-header:visible" : "[data-products-header]:visible",
    );
    await nav.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
    await nav.getByRole("button", { name: "เปิดเมนูย่อยแท่นชั่ง", exact: true }).click();
    await nav
      .locator('[data-nav-menu="/platforms"]')
      .getByRole("link", { name: "จัดสเปค", exact: true })
      .click();
    await expect(page).toHaveURL(path, { timeout: 15_000 });
  });
  test(`desktop main menu opens the guide directly from ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route);
    if (route === "/")
      await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-enhanced", "true");
    const nav = page.locator(
      route === "/" ? ".site-header:visible" : "[data-products-header]:visible",
    );
    await nav.getByRole("link", { name: "แท่นชั่ง", exact: true }).press("ArrowDown");
    await nav
      .locator('[data-nav-menu="/platforms"]')
      .getByRole("link", { name: "จัดสเปค", exact: true })
      .click();
    await expect(page).toHaveURL(path, { timeout: 15_000 });
  });
}
