import { test, expect } from "@playwright/test";

test("home solutions show editable artwork, working destinations and a compact responsive layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  const section = page.locator("#solutions");
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole("heading", { level: 2 })).toContainText(
    "เมื่อทุกอย่างเชื่อมถึงกัน",
  );
  await expect(section.locator("img")).toHaveCount(4);
  for (const img of await section.locator("img").all()) {
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
      .toBe(true);
  }
  await expect(section.getByRole("link", { name: /ค้นพบ SUNFORD POS/ })).toHaveAttribute(
    "href",
    "/products/pos1100",
  );
  await expect(section.getByRole("link", { name: /ACCESSORIES/ })).toHaveAttribute(
    "href",
    "/product/อุปกรณ์ประกอบเครื่องชั่ง",
  );
  await expect(section.getByRole("link", { name: /SOFTWARE & APPLICATIONS/ })).toHaveAttribute(
    "href",
    "/applications-and-softwares",
  );
  expect(await section.evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(740);
  await section.screenshot({
    path: "output/business-solutions-desktop.png",
    animations: "disabled",
    caret: "initial",
  });
  for (const width of [768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `Overflow at ${width}px`,
    ).toBe(true);
    for (const img of await section.locator('img:not([aria-hidden="true"])').all())
      await expect(img).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await section.screenshot({
    path: "output/business-solutions-mobile.png",
    animations: "disabled",
    caret: "initial",
  });
});
