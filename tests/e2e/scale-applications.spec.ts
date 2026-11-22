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
    const filters = page.getByRole("group", { name: "กรองผลิตภัณฑ์" });
    const link = filters.getByRole("link", { name: "เลือกตามการใช้งาน", exact: true });
    await expect(link).toHaveAttribute("href", applications);
    await expect(page.locator('[data-overview-section="applications"]')).toHaveCount(0);
    await expect(page.locator(`main:visible a[href^="${applications}/"]`)).toHaveCount(0);
    await link.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${applications}$`), { timeout: 20_000 });
    const indexLinks = page.locator(`main:visible a[href^="${applications}/"]`);
    const groupLink = indexLinks.and(page.locator(`a[href="${applications}/${slug}"]`));
    await expect(groupLink).toBeVisible();
    const allLinks = await indexLinks.evaluateAll((items) =>
      items.map((item) => item.getAttribute("href")),
    );
    expect(allLinks.length).toBeGreaterThan(1);
    expect(new Set(allLinks).size).toBe(allLinks.length);
    const label = await groupLink.innerText();
    await groupLink.click();
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
