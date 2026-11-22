import { expect, test } from "@playwright/test";
import { getScaleSubcategoryPage } from "../../src/features/catalog/data/scale-subcategory-pages";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { verifyCategoryOverview } from "./helpers/category-overview";

const scalePath = "/products/category/scales";
const chapterNames: Record<string, string> = {
  "scale-kitchen": "ครัวเรือน",
  "scale-industrial": "การผลิต",
  "scale-price": "คำนวณราคา",
  "scale-analytical": "งานวิเคราะห์",
};
const children = defaultNavigation[0]
  .groups!.flatMap((group) => group.links)
  .filter(
    (link) => new URL(link.href, "http://localhost").searchParams.get("category") === "scales",
  );

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 1440]) {
  test(`scale child URLs reload as listings and intentional all-model actions stay available at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${scalePath}?subcategory=scale-kitchen&trace=keep#scale-section`);
    await expect(page).toHaveURL(
      /\/products\/category\/scales\/kitchen\?trace=keep#scale-section$/,
    );
    await page.reload();
    await expect(page.locator('[data-scale-subcategory-page="scale-kitchen"]')).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(new URL(page.url()).searchParams.get("trace")).toBe("keep");
    await page.goto(scalePath);
    const lineupSize = await page.locator("#products-lineup > li > a").count();
    expect(lineupSize).toBeGreaterThan(0);
    const local = page.getByRole("dialog", { name: "ดูเครื่องชั่งทั้งหมด", exact: true });
    await page
      .locator('[data-overview-section="lineup"]')
      .getByRole("button", { name: "ดูเครื่องชั่งทั้งหมด", exact: true })
      .click();
    await expect(local).toBeVisible();
    await expect(local.getByRole("status")).toHaveText(`${lineupSize} รายการ`);
    await page.keyboard.press("Escape");
    await page.goto("/products?catalog=all");
    await page.reload();
    const full = page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true });
    await expect(full).toBeVisible();
    await expect(
      full.getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true }).getByRole("button"),
    ).toHaveCount(5);
  });
}

for (const width of [390, 1440]) {
  test(`scales overview presents its catalog and guides at ${width}px`, async ({ page }) => {
    test.slow();
    await verifyCategoryOverview(page, "scales", width);
  });

  test(`scale chapters and legacy links open the matching listings at ${width}px`, async ({
    page,
  }) => {
    test.slow();
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(scalePath);
    const rail = page.locator('[data-overview-category="scales"]:visible #products-chapters');
    for (const child of children) {
      const childId = new URL(child.href, page.url()).searchParams.get("subcategory")!;
      const href = getScaleSubcategoryPage(childId)!.href;
      const name = chapterNames[childId];
      if (name) {
        const button = rail.getByText(name, { exact: true }).locator("..");
        await expect(button).toBeVisible();
        if (childId === "scale-analytical" && (await button.isDisabled())) await page.goto(href);
        else await button.click();
      } else await page.goto(child.href);
      await expect(page).toHaveURL(new URL(href, page.url()).href);
      await expect(page.locator(`[data-scale-subcategory-page="${childId}"]`)).toBeVisible();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await page.goBack();
      await expect(rail).toBeVisible();
    }
  });
}

for (const width of [320, 390, 768, 834, 1024, 1440, 1920, 844]) {
  test(`scales template is responsive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 844 ? 390 : 1000 });
    await page.goto(scalePath);
    const main = page.locator('[data-overview-category="scales"]:visible main');
    await expect(main.getByRole("heading", { level: 1 })).toHaveText("เครื่องชั่ง");
    await expect(main.getByRole("link", { name: "สินค้าทั้งหมด", exact: true })).toBeVisible();
    if (width >= 390) {
      const title = (await main.getByRole("heading", { level: 1 }).boundingBox())!;
      const button = (await main
        .getByRole("link", { name: "สินค้าทั้งหมด", exact: true })
        .boundingBox())!;
      expect(
        Math.abs(title.y + title.height / 2 - button.y - button.height / 2),
      ).toBeLessThanOrEqual(1);
    }
    await expect(main.locator("#products-chapters > li > :is(a, button)")).toHaveCount(4);
    await main
      .locator('[data-overview-section="lineup"]')
      .getByRole("button", { name: "ดูเครื่องชั่งทั้งหมด", exact: true })
      .click();
    const finder = page.getByRole("dialog", { name: "ดูเครื่องชั่งทั้งหมด", exact: true });
    await expect(finder).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath(`scales-finder-${width}.png`) });
    await page.keyboard.press("Escape");
    await expect(finder).not.toBeVisible();
  });
}

test("scales and full catalog keep the right overlay host across cached navigation", async ({
  page,
}) => {
  await page.goto(scalePath);
  await page
    .locator('[data-overview-section="chapters"]')
    .getByRole("link", { name: "สินค้าทั้งหมด", exact: true })
    .click();
  const directory = page.locator("[data-products-directory]");
  await expect(
    directory.locator('#products-categories a[href^="/products/category/"]'),
  ).toHaveCount(5);
  await page.goto("/products?catalog=all");
  const full = page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true });
  await expect(full).toBeVisible();
  await expect(
    full.getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true }).getByRole("button"),
  ).toHaveCount(5);
  await page.keyboard.press("Escape");
  await page.goBack();
  await expect(directory).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(new URL(scalePath, page.url()).href);
  await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
  await expect(page.locator("[data-products-footer]:visible")).toHaveCount(1);
  await page
    .locator('[data-overview-category="scales"]:visible [data-overview-section="lineup"]')
    .getByRole("button", { name: "ดูเครื่องชั่งทั้งหมด", exact: true })
    .click();
  const local = page.getByRole("dialog", { name: "ดูเครื่องชั่งทั้งหมด", exact: true });
  await expect(local).toBeVisible();
  await local.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
  const controls = local.locator("article[data-model-only]").getByRole("button");
  await controls.nth(0).click();
  await controls.nth(1).click();
  await local.getByRole("button", { name: "ดูการเปรียบเทียบ", exact: true }).click();
  const compare = page.getByRole("dialog", { name: "เปรียบเทียบสินค้า", exact: true });
  await expect(compare).toBeVisible();
  await expect(compare.locator("table thead th")).toHaveCount(3);
  await compare.getByRole("button", { name: "ปิด", exact: true }).click();
  await page.keyboard.press("Escape");
  await page
    .locator("[data-products-header]:visible")
    .getByRole("link", { name: "อินดิเคเตอร์แท่นชั่ง", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("อินดิเคเตอร์แท่นชั่ง");
  await expect(page.locator("[data-products-footer]:visible")).toHaveCount(1);
  await expect(page.locator("footer:visible")).toHaveCount(1);
  await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
  await page
    .locator("[data-products-header]:visible")
    .getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true })
    .click();
  const search = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ", exact: true });
  await expect(search).toBeVisible();
  await search.getByRole("button", { name: "ปิด", exact: true }).click();
  await page.goBack();
  await expect(page.locator('[data-overview-category="scales"]:visible')).toHaveCount(1);
  await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
});
