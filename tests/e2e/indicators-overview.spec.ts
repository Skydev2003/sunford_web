import { expect, test } from "@playwright/test";
import { verifyCategoryOverview } from "./helpers/category-overview";

const path = "/products/category/indicators";
const label = "อินดิเคเตอร์แท่นชั่ง";
const title = `ดู${label}ทั้งหมด`;
const chapters = [
  ["indicator-lcd", "LCD"],
  ["indicator-led", "LED"],
];

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 1440]) {
  test(`indicators overview presents its catalog and guides at ${width}px`, async ({ page }) => {
    test.slow();
    await verifyCategoryOverview(page, "indicators", width);
  });

  test(`indicator chapters and reload keep category ownership at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(path);
    const finder = page.getByRole("dialog", { name: title, exact: true });
    const catalog = finder.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
    for (const [id, name] of chapters) {
      await page
        .locator("#products-chapters")
        .getByText(name, { exact: true })
        .locator("..")
        .click();
      await expect(page.locator(`[data-indicator-subcategory-page="${id}"]`)).toBeVisible();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await page.goBack();
      await expect(page).toHaveURL(new RegExp(path + "$"));
    }
    await page.goto(`${path}/waterproof`);
    await expect(
      page.locator('[data-indicator-subcategory-page="indicator-waterproof"]'),
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.goto(`${path}?subcategory=indicator-led&trace=keep`);
    await expect(page).toHaveURL(new RegExp(path + "/led\\?trace=keep$"));
    await page.reload();
    await expect(page.locator('[data-indicator-subcategory-page="indicator-led"]')).toBeVisible();
    expect(new URL(page.url()).searchParams.get("trace")).toBe("keep");
    await expect(finder).not.toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    await page.goto(path);
    await page
      .locator('[data-overview-section="lineup"]')
      .getByRole("button", { name: title, exact: true })
      .click();
    await catalog.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("no-indicator-match");
    await expect(
      catalog.getByRole("heading", { name: "ยังไม่พบสินค้าที่คุณค้นหา", exact: true }),
    ).toBeVisible();
    await catalog.getByRole("button", { name: "ล้างตัวกรองทั้งหมด", exact: true }).click();
    await catalog.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
    const compare = catalog.locator("article[data-model-only]").first().getByRole("button");
    await compare.click();
    await expect(compare).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Escape");
    await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
  });
}

for (const width of [768, 834]) {
  test(`indicator overview remains responsive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
    await expect(page.locator("#products-chapters > li")).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath(`indicators-${width}.png`) });
  });
}

test("indicator cache navigation preserves a single active chrome and overlay host", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(path);
  await page
    .locator('[data-overview-section="chapters"]')
    .getByRole("link", { name: "สินค้าทั้งหมด", exact: true })
    .click();
  const directory = page.locator("[data-products-directory]");
  await expect(
    directory.locator('#products-categories a[href^="/products/category/"]'),
  ).toHaveCount(5);
  await page.goto("/products?catalog=all");
  await expect(page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goBack();
  await expect(directory).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
  for (const [target, heading] of [
    ["เครื่องชั่ง", "เครื่องชั่ง"],
    [label, label],
    ["ระบบ POS", "ระบบ POS"],
    [label, label],
  ]) {
    await page
      .locator("[data-products-header]:visible")
      .getByRole("link", { name: target, exact: true })
      .click();
    await page.mouse.move(1400, 700);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
    await expect(page.locator(".site-footer:visible,[data-products-footer]:visible")).toHaveCount(
      1,
    );
  }
  await page
    .locator('[data-overview-section="lineup"]:visible')
    .getByRole("button", { name: title, exact: true })
    .click();
  const finder = page.getByRole("dialog", { name: title, exact: true });
  await expect(finder).toBeVisible();
  await finder.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
  const controls = finder.locator("article[data-model-only]").getByRole("button");
  await controls.nth(0).click();
  await controls.nth(1).click();
  await finder.getByRole("button", { name: "ดูการเปรียบเทียบ", exact: true }).click();
  const comparison = page.getByRole("dialog", { name: "เปรียบเทียบสินค้า", exact: true });
  await expect(comparison).toBeVisible();
  await expect(comparison.locator("table thead th")).toHaveCount(3);
  await comparison.getByRole("button", { name: "ปิด", exact: true }).click();
  await page.keyboard.press("Escape");
  await page
    .locator("[data-products-header]:visible")
    .getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true })
    .click();
  const search = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ", exact: true });
  await expect(search).toBeVisible();
  await search.getByRole("button", { name: "ปิด", exact: true }).click();
  expect(errors).toEqual([]);
});
