import { expect, test } from "@playwright/test";

import { verifyCategoryOverview } from "./helpers/category-overview";

const path = "/products/category/pos";
const label = "ระบบ POS";
const title = "ดูสินค้าทั้งหมด";
const catalogPath = "/products?category=pos";
const chapters = [
  ["pos-ios", "iOS"],
  ["pos-android", "Android"],
  ["pos-windows", "Windows"],
];

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 1440]) {
  test(`pos overview presents its catalog and guides at ${width}px`, async ({ page }) => {
    test.slow();
    await verifyCategoryOverview(page, "pos", width);
  });

  test(`POS chapters and reload keep category ownership at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(path);
    const finder = page.getByRole("dialog", { name: title, exact: true });
    const catalog = finder.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
    for (const [id, name] of chapters) {
      const button = page
        .locator("#products-chapters")
        .getByText(name, { exact: true })
        .locator("..");
      const href = `${path}/${id.replace("pos-", "")}`;
      await expect(button).toBeVisible();
      const enabled = await button.isEnabled();
      if (!enabled) await page.goto(href);
      else await button.click();
      await expect(page).toHaveURL(new URL(href, page.url()).href);
      const listing = page.locator(`[data-product-subcategory-page="${id}"]`);
      await expect(listing.locator("h1")).toHaveText(`${label} ${name}`);
      const more = listing.getByRole("button", { name: /^ดูเพิ่มเติม \(/ });
      while (await more.isVisible()) await more.click();
      const count = await listing.locator("article[data-model-only]").count();
      if (id === "pos-ios" && count === 0) {
        await expect(listing.locator("[data-subcategory-empty]")).toBeVisible();
        await expect(listing.getByRole("link", { name: "ระบบ POS Android" })).toHaveAttribute(
          "href",
          `${path}/android`,
        );
      } else {
        expect(count).toBeGreaterThan(0);
        await expect(listing.getByRole("status")).toHaveText(`${count} รายการ`);
      }
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await page.goBack();
      await expect(page).toHaveURL(new RegExp(path + "$"));
    }
    await page.goto(`${path}?subcategory=pos-android&trace=keep`);
    await expect(page).toHaveURL(new RegExp(path + "/android\\?trace=keep$"));
    await page.reload();
    await expect(page.locator('[data-product-subcategory-page="pos-android"]')).toBeVisible();
    expect(new URL(page.url()).searchParams.get("trace")).toBe("keep");
    await expect(finder).not.toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    await page.goto(catalogPath);
    await expect(finder).toBeVisible();
    await catalog.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("no-POS-match");
    await expect(
      catalog.getByRole("heading", { name: "ยังไม่พบสินค้าที่คุณค้นหา", exact: true }),
    ).toBeVisible();
    await catalog.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).clear();
    await catalog.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
    const compare = catalog
      .getByRole("button", { name: /^(เพิ่มเพื่อ|นำออกจาก)เปรียบเทียบ/ })
      .first();
    await compare.click();
    await expect(compare).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Escape");
    await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
  });
}

for (const width of [768, 834]) {
  test(`POS overview remains responsive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
    await expect(page.locator("#products-chapters > li")).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath(`pos-${width}.png`) });
  });
}

test("POS cache navigation preserves a single active chrome and overlay host", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(path);
  await page
    .locator("[data-products-nav]:visible")
    .getByRole("link", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true })
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
    ["อุปกรณ์เสริม", "อุปกรณ์เสริม"],
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
  await page.goto(catalogPath);
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
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
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
  await expect(page.locator('[data-overview-category="pos"]:visible #products-title')).toHaveText(
    label,
  );
  await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
  expect(errors).toEqual([]);
});
