import { expect, test } from "@playwright/test";
import { getScaleSubcategoryPage } from "../../src/features/catalog/data/scale-subcategory-pages";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { verifyCategoryOverview } from "./helpers/category-overview";

const scalePath = "/products/category/scales";
const applicationsPath = `${scalePath}/applications`;
const applicationsName = "เลือกเครื่องชั่งตามการใช้งาน";
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
  test(`scale child URLs reload as listings and the full catalog stays available at ${width}px`, async ({
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
  test.describe(`scale applications links at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 }, hasTouch: width === 390 });

    test("old entry points link to applications and Back leaves the finder closed", async ({
      page,
    }) => {
      await page.goto(`${scalePath}?catalog=all&subcategory=unknown-child#catalog-search`);
      const overview = page.locator('[data-overview-category="scales"]:visible');
      await expect(overview).toHaveAttribute("data-controls-ready", "true");
      const finder = overview.locator('[data-return-scope="catalog-finder"]');
      await expect(finder).toHaveCount(0);
      await expect(overview.getByRole("button", { name: "ดูเครื่องชั่งทั้งหมด" })).toHaveCount(0);
      await expect(
        overview.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ" }),
      ).toHaveCount(0);
      await expect(overview.getByRole("link", { name: applicationsName, exact: true })).toHaveCount(
        2,
      );
      for (const section of ["lineup", "index"]) {
        const link = overview
          .locator(`[data-overview-section="${section}"]`)
          .getByRole("link", { name: applicationsName, exact: true });
        await expect(link).toHaveAttribute("href", applicationsPath);
        if (width === 390) await link.tap();
        else {
          await link.focus();
          await expect(link).toBeFocused();
          await page.keyboard.press("Enter");
        }
        await expect(page).toHaveURL(new URL(applicationsPath, page.url()).href);
        await expect(page.getByRole("heading", { level: 1, name: applicationsName })).toBeVisible();
        await page.goBack();
        await expect(overview.locator("#products-title")).toHaveText("เครื่องชั่ง");
        await expect(finder).toHaveCount(0);
      }
      await page.reload();
      await expect(overview).toHaveAttribute("data-controls-ready", "true");
      await expect(finder).toHaveCount(0);

      const capacity = overview.locator("#products-features > li").first().getByRole("button");
      await capacity.click();
      const capacityGuide = page.getByRole("dialog", { name: "วิธีเลือกพิกัดน้ำหนัก" });
      await expect(capacityGuide).toBeVisible();
      const guideLink = capacityGuide.getByRole("link", { name: applicationsName, exact: true });
      await expect(guideLink).toHaveAttribute("href", applicationsPath);
      if (width === 390) await guideLink.tap();
      else await guideLink.press("Enter");
      await expect(page).toHaveURL(new URL(applicationsPath, page.url()).href);
      await expect(page.getByRole("heading", { level: 1, name: applicationsName })).toBeVisible();
      await page.goBack();
      await expect(overview.locator("#products-title")).toHaveText("เครื่องชั่ง");
      await expect(finder).toHaveCount(0);
      if (await capacityGuide.isVisible()) await page.keyboard.press("Escape");

      await overview.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล" }).click();
      const search = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" });
      await expect(search).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(search).toBeHidden();
    });
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
    const applications = main
      .locator('[data-overview-section="lineup"]')
      .getByRole("link", { name: applicationsName, exact: true });
    await applications.scrollIntoViewIfNeeded();
    await expect(applications).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: test.info().outputPath(`scales-applications-link-${width}.png`),
    });
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
    .locator("[data-products-header]:visible")
    .getByRole("link", { name: "อินดิเคเตอร์แท่นชั่ง", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("อินดิเคเตอร์แท่นชั่ง");
  await expect(page.locator("[data-products-footer]:visible")).toHaveCount(1);
  await expect(page.locator("footer:visible")).toHaveCount(1);
  await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
  const indicatorFinder = page.getByRole("dialog", { name: "ดูอินดิเคเตอร์แท่นชั่งทั้งหมด" });
  await page
    .locator('[data-overview-section="lineup"]:visible')
    .getByRole("button", { name: "ดูอินดิเคเตอร์แท่นชั่งทั้งหมด" })
    .click();
  await expect(indicatorFinder).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(indicatorFinder).toBeHidden();
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
