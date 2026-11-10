import { expect, test } from "@playwright/test";
import { getScaleSubcategoryPage } from "../../src/features/catalog/data/scale-subcategory-pages";
import { defaultNavigation } from "../../src/features/cms/data/navigation";
import { buyingGuides } from "../../src/features/content/data/buying-guides";
import { scaleSubcategoryDefinitions } from "../../src/features/catalog/data/scale-subcategories";

const scalePath = "/products/category/scales";
const children = defaultNavigation[0]
  .groups!.flatMap((group) => group.links)
  .filter(
    (link) => new URL(link.href, "http://localhost").searchParams.get("category") === "scales",
  );
const guide = buyingGuides.find(({ slug }) => slug === "scales")!;

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
    const local = page.getByRole("dialog", { name: "ดูเครื่องชั่งทั้งหมด", exact: true });
    await page
      .locator('[data-overview-section="lineup"]')
      .getByRole("button", { name: "ดูเครื่องชั่งทั้งหมด", exact: true })
      .click();
    await expect(local).toBeVisible();
    await expect(local.getByRole("status")).toHaveText("74 รายการ · 18 รุ่นตัวอย่าง (Mock)");
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
  test(`scales reuse the Apple layout with scales content only at ${width}px`, async ({
    page,
    context,
  }) => {
    test.slow();
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(scalePath);
    const overview = page.locator('[data-overview-category="scales"]:visible');
    const main = overview.locator("main");
    await expect(main.getByRole("heading", { level: 1 })).toHaveText("เครื่องชั่ง");
    expect(
      await main
        .locator("[data-overview-section]")
        .evaluateAll((sections) =>
          sections.map((section) => section.getAttribute("data-overview-section")),
        ),
    ).toEqual(["chapters", "hero", "lineup", "services", "features", "accordion", "index"]);
    await expect(main.locator("#products-chapters button")).toHaveText(
      scaleSubcategoryDefinitions.map((child) => child.label),
    );
    await expect(main.locator('[data-overview-section="hero"] li')).toHaveCount(2);
    await expect(main.locator("#products-lineup > li")).toHaveCount(6);
    await expect(main.locator("#products-services > li")).toHaveCount(5);
    await expect(main.locator("#products-features h3")).toHaveText(
      guide.sections.map((section) => section.title),
    );
    await expect(main.locator('[data-overview-section="essentials"]')).toHaveCount(0);
    await expect(
      main.locator(
        'a[href="/applications-and-softwares"],a[href="/product/scale-accessories"],a[href="/guides/pos"],a[href="/guides/indicators"]',
      ),
    ).toHaveCount(0);
    const reference = await context.newPage();
    await reference.goto("/products?category=scales");
    const referenceCatalog = reference
      .getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true })
      .getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
    await expect(
      referenceCatalog.getByRole("heading", { level: 2, name: "เครื่องชั่ง", exact: true }),
    ).toBeVisible();
    const more = referenceCatalog.getByRole("button", { name: /^ดูเพิ่มเติม \(/ });
    while (await more.count()) await more.click();
    const allowed = await referenceCatalog
      .locator("#mock-product-results a")
      .evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute("href")))]);
    const productLinks = await main
      .locator('a[href^="/products/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(productLinks.every((href) => href === scalePath || allowed.includes(href))).toBe(true);
    await reference.close();
    await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
    await expect(page.locator("[data-products-footer]:visible")).toHaveCount(1);
    await expect(page.locator(".site-footer:visible")).toHaveCount(0);
    await page.screenshot({ path: test.info().outputPath(`scales-hero-${width}.png`) });
    for (const id of ["products-lineup", "products-services", "products-features"]) {
      await main.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.screenshot({ path: test.info().outputPath(`${id}-${width}.png`) });
    }
    const cards = main.locator("#products-features > li");
    const trigger = cards.first().getByRole("button");
    await trigger.click();
    const story = page.getByRole("dialog", { name: guide.sections[0].title, exact: true });
    await expect(story).toBeVisible();
    await expect(story).toContainText(guide.sections[0].paragraphs[1]);
    await story.getByRole("link", { name: "ดูเครื่องชั่งทั้งหมด ›", exact: true }).click();
    const finder = page.getByRole("dialog", { name: "ดูเครื่องชั่งทั้งหมด", exact: true });
    await expect(finder).toBeVisible();
    await expect(story).not.toBeVisible();
    await expect(finder.getByRole("status")).toHaveText("74 รายการ · 18 รุ่นตัวอย่าง (Mock)");
    await page.keyboard.press("Escape");
    await expect(finder).not.toBeVisible();
    const accordion = main.locator('[data-overview-section="accordion"]');
    const buttons = accordion.getByRole("button");
    for (const [index, section] of guide.sections.entries()) {
      await buttons.nth(index).click();
      await expect(buttons.nth(index)).toHaveAttribute("aria-expanded", "true");
      await expect(accordion.getByRole("region").filter({ visible: true })).toContainText(
        section.paragraphs[0],
      );
      await expect(
        accordion.getByRole("img", { name: section.title, exact: true }).filter({ visible: true }),
      ).toHaveCount(1);
    }
    await page.screenshot({ path: test.info().outputPath(`scales-accordion-${width}.png`) });
    expect(errors).toEqual([]);
  });

  test(`eight scale chapters open the matching listing at ${width}px`, async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(scalePath);
    const rail = page.locator('[data-overview-category="scales"]:visible #products-chapters');
    for (const [index, child] of children.entries()) {
      const button = rail.getByRole("button", {
        name: scaleSubcategoryDefinitions[index].label,
        exact: true,
      });
      await button.click();
      const childId = new URL(child.href, page.url()).searchParams.get("subcategory")!;
      await expect(page).toHaveURL(
        new URL(getScaleSubcategoryPage(childId)!.href, page.url()).href,
      );
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
    await expect(main.locator("#products-chapters button")).toHaveCount(8);
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
  await page.getByRole("link", { name: "ดูรุ่นสินค้าทั้งหมด", exact: true }).click();
  const full = page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true });
  await expect(full).toBeVisible();
  await expect(
    full.getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true }).getByRole("button"),
  ).toHaveCount(5);
  await page.keyboard.press("Escape");
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
  await expect(page.locator(".site-footer:visible")).toHaveCount(0);
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
