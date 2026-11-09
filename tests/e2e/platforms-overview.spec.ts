import { expect, test } from "@playwright/test";
import { platformSubcategoryDefinitions } from "../../src/features/catalog/data/platform-subcategories";
import { buyingGuides } from "../../src/features/content/data/buying-guides";

const path = "/products/category/platforms";
const label = "โครงสร้างแท่นชั่ง";
const title = `ดู${label}ทั้งหมด`;
const guide = buyingGuides.find(({ slug }) => slug === "platforms")!;
const chapters = platformSubcategoryDefinitions.map(({ id, label }) => [id, label]);

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 1440]) {
  test(`platforms reuse scales sections with their own content at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(path);
    const overview = page.locator('[data-overview-category="platforms"]:visible');
    const main = overview.locator("main");
    await expect(main.getByRole("heading", { level: 1 })).toHaveText(label);
    expect(
      await main
        .locator("[data-overview-section]")
        .evaluateAll((sections) =>
          sections.map((section) => section.getAttribute("data-overview-section")),
        ),
    ).toEqual(["chapters", "hero", "lineup", "services", "features", "accordion", "index"]);
    await expect(main.locator("#products-chapters > li")).toHaveCount(4);
    await expect(main.locator('[data-overview-section="hero"] li')).toHaveCount(2);
    await expect(main.locator("#products-lineup > li")).toHaveCount(6);
    await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
    await expect(page.locator("[data-products-footer]:visible")).toHaveCount(1);
    await expect(page.locator(".site-footer:visible")).toHaveCount(0);
    await expect(page.getByRole("dialog", { name: title, exact: true })).not.toBeVisible();
    await page.screenshot({ path: test.info().outputPath(`platforms-top-${width}.png`) });
    for (const id of ["products-lineup", "products-services", "products-features"]) {
      await main.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.screenshot({ path: test.info().outputPath(`${id}-${width}.png`) });
    }
    const features = main.locator("#products-features > li");
    await expect(features.locator("h3")).toHaveText(guide.sections.map((section) => section.title));
    await features.first().getByRole("button").click();
    const story = page.getByRole("dialog", { name: guide.sections[0].title, exact: true });
    await expect(story).toContainText(guide.sections[0].paragraphs[1]);
    await expect(
      story.getByRole("link", { name: "ดูแท่นชั่งสแตนเลสสตีล ›", exact: true }),
    ).toHaveAttribute("href", "/collections/stainless-steel-platforms");
    await page.keyboard.press("Escape");
    await page
      .locator('[data-overview-section="lineup"]')
      .getByRole("button", { name: title, exact: true })
      .click();
    const finder = page.getByRole("dialog", { name: title, exact: true });
    await expect(finder).toBeVisible();
    await expect(story).not.toBeVisible();
    await expect(finder.getByRole("status")).toHaveText("23 รายการ · 1 รุ่นตัวอย่าง (Mock)");
    await page.keyboard.press("Escape");
    await expect(finder).not.toBeVisible();
    const accordion = main.locator('[data-overview-section="accordion"]');
    await expect(accordion.getByRole("heading", { level: 2 })).toHaveText(
      `เลือก${label}ให้เหมาะกับงาน`,
    );
    for (const [index, section] of guide.sections.entries()) {
      const button = accordion.getByRole("button").nth(index);
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await expect(accordion.getByRole("region").filter({ visible: true })).toContainText(
        section.paragraphs[0],
      );
    }
    await page.screenshot({ path: test.info().outputPath(`platforms-accordion-${width}.png`) });
    expect(errors).toEqual([]);
  });

  test(`platform chapters and reload keep category ownership at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(path);
    const finder = page.getByRole("dialog", { name: title, exact: true });
    const catalog = finder.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
    for (const [id, name] of chapters) {
      await page.locator("#products-chapters").getByRole("button", { name, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`subcategory=${id}`));
      await expect(
        catalog.getByRole("heading", { name: label, exact: true, level: 2 }),
      ).toBeVisible();
      await expect(
        catalog
          .getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" })
          .getByRole("button", { name, exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await expect(
        catalog
          .getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true })
          .getByRole("button"),
      ).toHaveCount(1);
      await page.keyboard.press("Escape");
    }
    await page.goto(`${path}?subcategory=platform-sus304&trace=keep`);
    await expect(finder).toBeVisible();
    await expect(
      catalog
        .getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" })
        .getByRole("button", { name: "สแตนเลส SUS304", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect.poll(() => new URL(page.url()).searchParams.get("subcategory")).toBeNull();
    expect(new URL(page.url()).searchParams.get("trace")).toBe("keep");
    await expect(finder).not.toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
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
  await page
    .locator('[data-overview-section="chapters"]')
    .getByRole("link", { name: "สินค้าทั้งหมด", exact: true })
    .click();
  await expect(page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
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
