import { expect, test, type Page } from "@playwright/test";
import { resolveCategoryHref } from "../../src/features/catalog/data/category-destinations";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";
import { getScaleSubcategories } from "../../src/features/catalog/data/scale-subcategories";
import { getIndicatorSubcategories } from "../../src/features/catalog/data/indicator-subcategories";
import { getPlatformSubcategories } from "../../src/features/catalog/data/platform-subcategories";
import { getPosSubcategories } from "../../src/features/catalog/data/pos-subcategories";
import { getAccessorySubcategories } from "../../src/features/catalog/data/accessory-subcategories";
import { deduplicateConsumableSizes } from "../../src/features/catalog/data/consumable-sizes";
import { catalogProductGroup } from "../../src/features/catalog/data/catalog-supplements";
import type { Product } from "../../src/features/catalog/types";

const resolvers = [
  getScaleSubcategories,
  getIndicatorSubcategories,
  getPlatformSubcategories,
  getPosSubcategories,
  getAccessorySubcategories,
];
const groups = productCategoryDefinitions.map((parent, index) => ({
  ...parent,
  children: resolvers[index]([]).map(({ id, label }) => ({
    id,
    label: parent.id === "scales" ? label.replace(/^เครื่องชั่ง/, "") : label,
    href: resolveCategoryHref(`/products/category/${parent.id}?subcategory=${id}`),
  })),
}));
async function productMenu(page: Page, width: number, label: string) {
  const finder = page
    .getByRole("dialog")
    .filter({ has: page.getByRole("button", { name: "ปิดแคตตาล็อกสินค้า" }) });
  if (await finder.isVisible())
    await finder.getByRole("button", { name: "ปิดแคตตาล็อกสินค้า" }).click();
  const header = page.locator("[data-products-header]:visible");
  await expect(header.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล" })).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);
  if (width >= 834) await header.getByRole("link", { name: label, exact: true }).hover();
  else {
    await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
    await header.getByRole("button", { name: `เปิดเมนูย่อย${label}`, exact: true }).click();
  }
  const panel = header.locator("#products-navigation-panel");
  await expect(panel).toBeVisible();
  return panel.locator(":scope > div > div").first();
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [1440, 390]) {
  test(`all23 product submenu links activate their real catalog children at ${width}px`, async ({
    page,
    request,
  }) => {
    test.slow();
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const { products } = (await (await request.get("/api/products")).json()) as {
      products: Product[];
    };
    const visible = deduplicateConsumableSizes(products);
    await page.goto("/contact-us");
    let first = true;
    for (const [index, parent] of groups.entries()) {
      const input =
        parent.id === "indicators"
          ? visible
          : visible.filter((product) => catalogProductGroup(product) === parent.path);
      const expected = resolvers[index](input);
      for (const [childIndex, child] of parent.children.entries()) {
        const menu = await productMenu(page, width, parent.label);
        await expect(menu.locator(":scope > p")).toHaveText(`สำรวจ${parent.label}`);
        await expect(menu.locator("a")).toHaveCount(parent.children.length);
        await expect(menu.locator("a")).toHaveText(parent.children.map(({ label }) => label));
        expect(
          await menu
            .locator("a")
            .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
        ).toEqual(parent.children.map(({ href }) => href));
        if (first) {
          await page.screenshot({ path: test.info().outputPath(`product-children-${width}.png`) });
          first = false;
        }
        await menu.getByRole("link", { name: child.label, exact: true }).click();
        if (width >= 834) await page.mouse.move(width - 20, 600);
        await expect(page).toHaveURL(new URL(child.href, page.url()).href);
        const main = page.locator(`[data-product-subcategory-page="${child.id}"]`);
        await expect(main).toBeVisible();
        await expect(main.getByRole("heading", { level: 1 })).toHaveText(
          parent.id === "scales" ? expected[childIndex].label : `${parent.label} ${child.label}`,
        );
        const mocks = expected[childIndex].entries?.filter((entry) => !entry.productId).length ?? 0;
        await expect(main.getByRole("status")).toHaveText(
          `${expected[childIndex].productIds.length} รายการ${mocks ? ` · ${mocks} รุ่นตัวอย่าง (Mock)` : ""}`,
        );
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
        await expect(page.locator("#products-navigation-panel:visible")).toHaveCount(0);
      }
    }
    expect(errors).toEqual([]);
  });
}

for (const width of [320, 768, 1400, 1920]) {
  test(`product submenu keeps every group reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/contact-us");
    const menu = await productMenu(page, width, "อุปกรณ์เสริม");
    const viewportMenu = page.locator("#products-navigation-panel:visible");
    await expect(viewportMenu.locator(":scope > div > div > p")).toHaveText([
      "สำรวจอุปกรณ์เสริม",
      "การใช้งานและโซลูชัน",
      "ข้อมูลและความช่วยเหลือ",
    ]);
    await expect(menu.locator("a")).toHaveCount(groups[4].children.length);
    const last = menu.getByRole("link", { name: "วัสดุสิ้นเปลือง", exact: true });
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const box = (await viewportMenu.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(901);
    await page.screenshot({ path: test.info().outputPath(`product-children-${width}.png`) });
    await last.click();
    await expect(page).toHaveURL(/\/products\/category\/accessories\/consumables$/);
    await expect(
      page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" }).getByRole("status"),
    ).toHaveText("7 รายการ");
  });
}

test("child URLs support refresh, same-family links, local changes, clearing and browser history", async ({
  page,
}) => {
  test.slow();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/products?category=accessories&trace=keep#products");
  const catalog = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  const track = catalog.getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" });
  await expect(track.getByRole("button", { name: "ทั้งหมด", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const search = catalog.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" });
  await search.fill("LP53");
  await expect(catalog.locator("#mock-product-results article h3")).toHaveText(["LP53"]);
  await search.fill("");
  await page.reload();
  await expect(track.getByRole("button", { name: "ทั้งหมด", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(new URL(page.url()).searchParams.get("trace")).toBe("keep");
  expect(new URL(page.url()).hash).toBe("");
  await catalog
    .getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true })
    .getByRole("button", { name: "ระบบ POS", exact: true })
    .click();
  await expect(track.getByRole("button", { name: "ทั้งหมด", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(new URL(page.url()).searchParams.get("subcategory")).toBeNull();
  const previous = page.url();
  const menu = await productMenu(page, 1440, "ระบบ POS");
  await menu.getByRole("link", { name: "Windows", exact: true }).click();
  await expect(page).toHaveURL(/\/products\/category\/pos\/windows$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL(previous);
  await expect(track.getByRole("button", { name: "ทั้งหมด", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.goForward();
  await expect(page).toHaveURL(/\/products\/category\/pos\/windows$/);
  const sameFamily = await productMenu(page, 1440, "ระบบ POS");
  await sameFamily.getByRole("link", { name: "Android", exact: true }).click();
  await expect(page).toHaveURL(/\/products\/category\/pos\/android$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "เส้นทางนำทาง", exact: true })
    .getByRole("link", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true })
    .click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("link", { name: "ดูรุ่นสินค้าทั้งหมด", exact: true }).click();
  await expect(page).toHaveURL(/\/products\?catalog=all$/);
  await expect(catalog.getByRole("heading", { level: 2 })).toHaveText("ผลิตภัณฑ์ทั้งหมด");
});

test("unknown and cross-family child IDs fall back safely, while empty iOS remains a real destination", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const catalog = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  for (const [query, heading] of [
    ["category=pos&subcategory=indicator-led", "ระบบ POS"],
    ["category=indicators&subcategory=unknown", "อินดิเคเตอร์แท่นชั่ง"],
    ["subcategory=pos-ios", "ผลิตภัณฑ์ทั้งหมด"],
    ["category=unknown&subcategory=pos-ios", "ผลิตภัณฑ์ทั้งหมด"],
  ]) {
    await page.goto(`/products?${query}`);
    await expect(catalog.getByRole("heading", { level: 2 })).toHaveText(heading);
    await expect(
      catalog
        .getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" })
        .getByRole("button", { name: "ทั้งหมด", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  }
  await page.goto("/products?category=pos&subcategory=pos-ios");
  await expect(page).toHaveURL(/\/products\/category\/pos\/ios$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(catalog.getByRole("status")).toHaveText("0 รายการ");
  await expect(
    catalog.getByRole("heading", { name: "ยังไม่พบสินค้าที่คุณค้นหา", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
