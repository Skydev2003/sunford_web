import { expect, test } from "@playwright/test";

const index = "/technical-specification";
const guideRoot = `${index}/guides`;
const slugs = [
  "basic-usage",
  "lifestyle",
  "industry",
  "retail",
  "laboratory",
  "rls1100",
  "lp50",
  "sql-server",
];

for (const width of [390, 1440]) {
  test(`technical manuals switch in the same reading pane at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(index);
    const main = page.getByRole("main");
    const article = main.locator("#guide-content");
    const heading = article.getByRole("heading", { level: 1 });
    await expect(heading).toHaveText("การใช้งานและการดูแลรักษาเครื่องชั่ง");
    if (width === 390) await main.getByText("สารบัญคู่มือ", { exact: true }).click();
    const sidebar = main.getByRole("navigation", { name: "บทและคู่มือ" });
    const links = sidebar.getByRole("link");
    await expect(links).toHaveCount(slugs.length);
    await expect(sidebar.locator("details").first().getByRole("link")).toHaveText([
      "การใช้งานและการดูแลรักษาเครื่องชั่ง",
      "ครัวเรือน",
      "การผลิต",
      "คำนวณราคา",
      "งานวิเคราะห์",
    ]);
    expect(
      await links.evaluateAll((items) => items.map((item) => item.getAttribute("href"))),
    ).toEqual(slugs.map((slug) => `${index}?guide=${slug}#guide-content`));
    await page.evaluate(() => (document.documentElement.dataset.guidebookDocument = "original"));
    await links.filter({ hasText: "RLS1100" }).click();
    await expect(page).toHaveURL(`${index}?guide=rls1100#guide-content`);
    await expect(heading).toContainText(/RLS\s*1100/i);
    await expect(page.locator("html")).toHaveAttribute("data-guidebook-document", "original");
    expect(page.context().pages()).toEqual([page]);
    await expect(article.locator("ol").first()).toBeVisible();
    const image = article.locator("figure img").first();
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0);
    for (const file of ["rls1100-products.xlsx", "rls1100-label.pdf"]) {
      const link = article.locator(`a[href="/downloads/manuals/${file}"]`).first();
      const [download] = await Promise.all([page.waitForEvent("download"), link.click()]);
      expect(download.suggestedFilename()).toBe(file);
      await expect(page).toHaveURL(`${index}?guide=rls1100#guide-content`);
    }
    if (width === 1440) {
      const outline = main.getByRole("navigation", { name: "ในหน้านี้" });
      await outline.getByRole("link", { name: "ใส่ม้วนฉลากและทดลองพิมพ์" }).click();
      await expect(
        article.getByRole("heading", { name: "ใส่ม้วนฉลากและทดลองพิมพ์" }),
      ).toBeFocused();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    const industrial = sidebar.getByRole("link", { name: "การผลิต", exact: true });
    await industrial.click();
    await expect(heading).toContainText("อุตสาหกรรม");
    await expect(industrial).toHaveAttribute("aria-current", "page");
    await expect(article.getByRole("table").first()).toBeVisible();
    await page.goBack();
    await expect(heading).toContainText(/RLS\s*1100/i);
    await page.reload();
    await expect(heading).toContainText(/RLS\s*1100/i);
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
