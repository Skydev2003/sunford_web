import { expect, test } from "@playwright/test";

const index = "/technical-specification";
const guideRoot = `${index}/guides`;
const slugs = [
  "basic-usage",
  "laboratory",
  "industry",
  "retail",
  "lifestyle",
  "rls1100",
  "lp50",
  "sql-server",
];

for (const width of [390, 1440]) {
  test(`technical manuals open locally and fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(index);
    const main = page.getByRole("main");
    const links = main.locator(`a[href^="${guideRoot}/"]`);
    await expect(links).toHaveCount(slugs.length);
    expect(
      await links.evaluateAll((items) => items.map((item) => item.getAttribute("href"))),
    ).toEqual(slugs.map((slug) => `${guideRoot}/${slug}`));
    await links.filter({ hasText: "RLS1100" }).click();
    await expect(page).toHaveURL(`${guideRoot}/rls1100`);
    await expect(main.getByRole("heading", { level: 1 })).toContainText(/RLS\s*1100/i);
    await expect(page).toHaveTitle(/RLS\s*1100/i);
    const article = main.getByRole("article").first();
    await expect(article).toBeVisible();
    await expect(article.locator("ol").first()).toBeVisible();
    const image = article.locator("figure img").first();
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0);
    for (const file of ["rls1100-products.xlsx", "rls1100-label.pdf"])
      await expect(article.locator(`a[href="/downloads/manuals/${file}"]`).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await main.getByRole("link", { name: "กลับไปหน้าคู่มือและสเปก" }).click();
    await expect(page).toHaveURL(index);
    await page.goto(`${guideRoot}/industry`);
    await expect(main.getByRole("heading", { level: 1 })).toContainText("อุตสาหกรรม");
    await expect(main.getByRole("table").first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  });
}

test("legacy manual paths redirect locally and unknown guides are not indexed", async ({
  page,
  request,
}) => {
  test.setTimeout(90_000);
  for (const [oldPath, slug] of [
    ["/support/Usage", "basic-usage"],
    ["/support/Technical-assistance/ห้องปฏิบัติการ", "laboratory"],
    ["/support/Technical-assistance/อุตสาหกรรม", "industry"],
    ["/support/Technical-assistance/พาณิชยกรรมและบริการ", "retail"],
    ["/support/Technical-assistance/ไลฟ์สไตล์", "lifestyle"],
    ["/software/download/sunford-lp50-label-printer/settings", "lp50"],
    ["/software/download/sunford-pos-smart-retail/sql-server-settings", "sql-server"],
  ]) {
    const redirect = await request.get(`${oldPath}?ref=legacy`, { maxRedirects: 0 });
    expect(redirect.status()).toBe(308);
    expect(redirect.headers().location).toBe(`${guideRoot}/${slug}?ref=legacy`);
    const res = await page.goto(oldPath);
    expect(res?.ok()).toBe(true);
    await expect(page).toHaveURL(`${guideRoot}/${slug}`);
  }
  await page.goto(`${guideRoot}/unknown-manual`);
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: "ยังไม่พบหน้าที่คุณกำลังมองหา" })).toBeVisible();
  await expect(main.getByRole("article")).toHaveCount(0);
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();

  const workbook = await request.head("/downloads/manuals/rls1100-products.xlsx");
  const label = await request.head("/downloads/manuals/rls1100-label.pdf");
  expect(workbook.ok()).toBe(true);
  expect(workbook.headers()["content-type"]).toContain("spreadsheetml");
  expect(label.ok()).toBe(true);
  expect(label.headers()["content-type"]).toContain("application/pdf");
});
