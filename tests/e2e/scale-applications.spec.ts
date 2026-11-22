import { expect, test } from "@playwright/test";

const overview = "/products/category/scales";
const applications = `${overview}/applications`;

for (const [width, slug] of [
  [390, "cafes"],
  [1440, "bakeries"],
] as const) {
  test(`scale applications connect the overview to Warehouse models at ${width}px`, async ({
    page,
  }) => {
    test.slow();
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(overview, { waitUntil: "domcontentloaded" });
    const section = page.getByRole("region", { name: "เลือกเครื่องชั่งตามการใช้งาน" });
    const rail = section.getByRole("list", { name: "กลุ่มการใช้งานเครื่องชั่ง" });
    const tiles = rail.locator(":scope > li > a");
    await expect(tiles.first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const links = await tiles.evaluateAll((items) =>
      items.map((item) => item.getAttribute("href")),
    );
    expect(links).toContain(`${applications}/${slug}`);
    expect(new Set(links).size).toBe(links.length);
    const allOverviewLinks = await section
      .locator(`a[href^="${applications}/"]`)
      .evaluateAll((items) => items.map((item) => item.getAttribute("href")));
    expect(allOverviewLinks.length).toBeGreaterThan(links.length);
    await section.getByRole("link", { name: "ดูทุกกลุ่มการใช้งาน" }).press("Enter");
    await expect(page).toHaveURL(new RegExp(`${applications}$`), { timeout: 20_000 });
    const indexLinks = page.locator(`main:visible a[href^="${applications}/"]`);
    await expect(indexLinks).toHaveCount(allOverviewLinks.length);
    const allLinks = await indexLinks.evaluateAll((items) =>
      items.map((item) => item.getAttribute("href")),
    );
    expect(allLinks.toSorted()).toEqual(allOverviewLinks.toSorted());

    await page.goBack({ waitUntil: "domcontentloaded" });
    const tile = rail.locator(`a[href="${applications}/${slug}"]`);
    const label = await tile.getByRole("heading").innerText();
    await tile.scrollIntoViewIfNeeded();
    await expect(tile).toBeInViewport();
    await tile.click();
    await expect(page).toHaveURL(new RegExp(`${applications}/${slug}$`), { timeout: 20_000 });
    await expect(page.getByRole("heading", { level: 1, name: label, exact: true })).toBeVisible();
    const models = page.getByRole("list", { name: "เครื่องชั่งสำหรับงานนี้" });
    await expect(models.getByText("ใช้ได้บางกรณี ควรตรวจสเปกให้ตรงกับงาน").first()).toBeVisible();
    const product = models.getByRole("link").first();
    const href = await product.getAttribute("href");
    expect(href).toMatch(/^\/products\/[^/]+$/);
    await product.click();
    await expect(page).toHaveURL(new URL(href!, page.url()).href, { timeout: 20_000 });
  });
}
