import { expect, test } from "@playwright/test";
import { verifyCategoryOverview } from "./helpers/category-overview";

const path = "/indicators";
const listingPath = "/platforms/indicators";
const subcategoryRoot = "/indicators";
const label = "อินดิเคเตอร์แท่นชั่ง";
const title = "ดูสินค้าทั้งหมด";
const catalogPath = "/products?category=indicators";
const chapters = [
  ["indicator-lcd", "LCD"],
  ["indicator-led", "LED"],
];

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("indicator bookmarks resolve to the shared category URL", async ({ page }) => {
  for (const [alias, status] of [
    ["/Indicator", 308],
    ["/indicators", 307],
  ] as const) {
    const response = await page.request.get(`${alias}?trace=keep`, { maxRedirects: 0 });
    expect(response.status()).toBe(status);
    const target = new URL(response.headers().location, response.url());
    expect(`${target.pathname}${target.search}`).toBe(`${path}?trace=keep`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const menu = page.locator(".site-header").getByRole("link", {
    name: "อินดิเคเตอร์",
    exact: true,
  });
  await expect(menu).toHaveAttribute("href", path);
  await menu.click();
  await expect(page).toHaveURL(path);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("อินดิเคเตอร์");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `https://sunford-web.vercel.app${path}`,
  );
  const lineup = page.locator('[data-overview-section="lineup"]');
  await expect(lineup.locator("#products-lineup > li > a").first()).toBeVisible();
  await expect(lineup.getByText("เลือกอินดิเคเตอร์ให้เข้ากับงานและแท่นชั่ง")).toHaveCount(0);
});

for (const width of [390, 1440]) {
  test(`all five shortened category URLs preserve their catalog at ${width}px`, async ({
    page,
  }) => {
    test.slow();
    await page.setViewportSize({ width, height: 900 });
    for (const [id, heading] of [
      ["scales", "เครื่องชั่ง"],
      ["indicators", "อินดิเคเตอร์แท่นชั่ง"],
      ["platforms", "โครงสร้างแท่นชั่ง"],
      ["pos", "ระบบ POS"],
      ["accessories", "อุปกรณ์เสริม"],
    ]) {
      const target = `/${id}`;
      const response = await page.request.get(`/products/category/${id}?trace=keep`, {
        maxRedirects: 0,
      });
      expect(response.status()).toBe(308);
      const redirected = new URL(response.headers().location, response.url());
      expect(`${redirected.pathname}${redirected.search}`).toBe(`${target}?trace=keep`);
      await page.goto(target);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await expect(page.locator(`[data-overview-category="${id}"]`)).toBeVisible();
      await expect(page.locator('[data-overview-section="chapters"]')).toBeVisible();
      await expect(page.locator("#products-lineup > li > a").first()).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://sunford-web.vercel.app${target}`,
      );
      await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  });
}

for (const width of [390, 1440]) {
  test(`indicators overview presents its catalog and guides at ${width}px`, async ({ page }) => {
    test.slow();
    await verifyCategoryOverview(page, "indicators", width);
  });

  test(`indicator chapters and reload keep category ownership at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(listingPath);
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
      await expect(page).toHaveURL(listingPath);
    }
    await page.goto(`${subcategoryRoot}/waterproof`);
    await expect(
      page.locator('[data-indicator-subcategory-page="indicator-waterproof"]'),
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.goto(`${path}?subcategory=indicator-led&trace=keep`);
    await expect(page).toHaveURL(new RegExp(subcategoryRoot + "/led\\?trace=keep$"));
    await page.reload();
    await expect(page.locator('[data-indicator-subcategory-page="indicator-led"]')).toBeVisible();
    expect(new URL(page.url()).searchParams.get("trace")).toBe("keep");
    await expect(finder).not.toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    await page.goto(catalogPath);
    await expect(finder).toBeVisible();
    await catalog.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("no-indicator-match");
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

for (const width of [390, 834, 1440]) {
  test(`indicator overview remains responsive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(listingPath);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("อินดิเคเตอร์");
    const chapters = page.locator("#products-chapters");
    await expect(chapters.locator("li")).toHaveCount(2);
    await expect(chapters.getByText("LCD", { exact: true })).toBeVisible();
    await expect(chapters.getByText("LED", { exact: true })).toBeVisible();
    const filters = page.getByRole("navigation", { name: "คุณสมบัติอินดิเคเตอร์" });
    const features = [
      ["connectivity", "เชื่อมต่ออุปกรณ์"],
      ["waterproof", "กันน้ำกันฝุ่น"],
      ["price-computing", "คำนวณราคา"],
      ["counting", "นับจำนวน"],
      ["checkweighing", "เตือนน้ำหนักขาดเกิน"],
    ] as const;
    await expect(filters.getByRole("link")).toHaveText([
      "ทุกผลิตภัณฑ์",
      ...features.map(([, label]) => label),
    ]);
    const all = filters.getByRole("link", { name: "ทุกผลิตภัณฑ์", exact: true });
    await expect(all).toHaveAttribute("aria-current", "true");
    const products = page.locator("#products-lineup > li > a");
    await expect(products.first()).toBeVisible();
    const allCount = await products.count();
    for (const [id, label] of features) {
      const link = filters.getByRole("link", { name: label, exact: true });
      const href = `${listingPath}?feature=${id}`;
      await expect(link).toHaveAttribute("href", href);
      await link.click();
      await expect(page).toHaveURL(href);
      await expect(link).toHaveAttribute("aria-current", "true");
      await expect(link).toHaveCSS("color", "rgb(255, 255, 255)");
      await expect(page.locator("[data-active-catalog-feature]")).toContainText(label);
      if (id === "waterproof") {
        await expect(products.first()).toBeVisible();
        expect(await products.count()).toBeLessThan(allCount);
      }
    }
    await expect(filters.getByRole("link").last()).toBeInViewport();
    await all.click();
    await expect(page).toHaveURL(listingPath);
    await expect(all).toHaveAttribute("aria-current", "true");
    await expect(products).toHaveCount(allCount);
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
    .locator("[data-products-nav]:visible")
    .getByRole("link", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true })
    .click();
  const directory = page.locator("[data-products-directory]");
  await expect(directory.locator('#products-categories a[href^="/products/"]')).toHaveCount(5);
  await page.goto("/products?catalog=all");
  await expect(page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goBack();
  await expect(directory).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("อินดิเคเตอร์");
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
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("อินดิเคเตอร์");
  await page
    .locator("[data-products-header]:visible")
    .getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true })
    .click();
  const search = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ", exact: true });
  await expect(search).toBeVisible();
  await search.getByRole("button", { name: "ปิด", exact: true }).click();
  expect(errors).toEqual([]);
});
