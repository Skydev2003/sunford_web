import { expect, test } from "@playwright/test";
import { platformSubcategoryPages } from "../../src/features/catalog/data/product-subcategory-pages";
import { verifyCategoryOverview } from "./helpers/category-overview";

const path = "/products/category/platforms";
const label = "โครงสร้างแท่นชั่ง";
const title = `ดู${label}ทั้งหมด`;

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 1440]) {
  test(`platforms overview presents its catalog and guides at ${width}px`, async ({ page }) => {
    test.slow();
    await verifyCategoryOverview(page, "platforms", width);
  });

  test(`platform chapters and reload keep category ownership at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(path);
    const finder = page.getByRole("dialog", { name: title, exact: true });
    const catalog = finder.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
    for (const { id, label: name, href, title } of platformSubcategoryPages) {
      const button = page
        .locator("#products-chapters")
        .getByText(name, { exact: true })
        .locator("..");
      await expect(button).toBeVisible();
      if (await button.isEnabled()) await button.click();
      else await page.goto(href);
      await expect(page).toHaveURL(new URL(href, page.url()).href);
      await expect(page.locator(`[data-product-subcategory-page="${id}"] h1`)).toHaveText(title);
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await page.goBack();
      await expect(page).toHaveURL(new RegExp(path + "$"));
    }
    await page.goto(`${path}?subcategory=platform-sus304&trace=keep`);
    await expect(page).toHaveURL(new RegExp(path + "/sus304\\?trace=keep$"));
    await page.reload();
    await expect(page.locator('[data-product-subcategory-page="platform-sus304"]')).toBeVisible();
    expect(new URL(page.url()).searchParams.get("trace")).toBe("keep");
    await expect(finder).not.toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    await page.goto(path);
    await page
      .locator('[data-overview-section="lineup"]')
      .getByRole("button", { name: title, exact: true })
      .click();
    await catalog.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("no-platform-match");
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
  test(`platform overview remains responsive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
    await expect(page.locator("#products-chapters > li")).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath(`platforms-${width}.png`) });
  });
}

test("platform cache navigation preserves a single active chrome and overlay host", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(path);
  await expect(page.locator('[data-overview-section="chapters"]')).toBeVisible();
  await expect(
    page
      .locator('[data-overview-section="chapters"]')
      .getByRole("link", { name: "สินค้าทั้งหมด", exact: true }),
  ).toHaveCount(0);
  await page.goto("/products");
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
  await page
    .locator("[data-products-header]:visible")
    .getByRole("link", { name: "SUNFORD หน้าแรก", exact: true })
    .click();
  await expect(page.locator(".site-header:visible")).toHaveCount(1);
  await expect(page.locator(".site-header:visible")).toHaveCSS("position", "fixed");
  await expect(page.locator(".site-header:visible")).toHaveCSS("height", "44px");
  await expect(page.locator("[data-products-header]:visible")).toHaveCount(0);
  await page.goBack();
  await expect(
    page.locator('[data-overview-category="platforms"]:visible #products-title'),
  ).toHaveText(label);
  await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
  expect(errors).toEqual([]);
});
