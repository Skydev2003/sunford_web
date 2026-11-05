import { expect, test, type Page } from "@playwright/test";
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
    href: `/products?category=${parent.id}&subcategory=${id}`,
  })),
}));
const menuGroupLabels = [
  "เครื่องชั่ง",
  "อินดิเคเตอร์และโครงสร้างแท่นชั่ง",
  "ระบบ POS และอุปกรณ์เสริม",
];

async function productMenu(page: Page, width: number) {
  if (width >= 1400) {
    await page.locator(".desktop-nav").getByRole("link", { name: "สินค้า", exact: true }).hover();
    const panel = page.locator(".desktop-submenu.is-open .submenu-panel.is-active");
    await expect(panel).toBeVisible();
    return panel.locator(".submenu-group-secondary");
  }
  await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  const products = page.locator("#mobile-navigation details").first();
  await products.locator("summary").click();
  return products.locator(".mobile-nav-section");
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
        const menu = await productMenu(page, width);
        await expect(menu.locator(":scope > p")).toHaveText(menuGroupLabels);
        await expect(menu.locator("a")).toHaveCount(23);
        await expect(menu.locator("a")).toHaveText(
          groups.flatMap(({ children }) => children.map(({ label }) => label)),
        );
        expect(
          await menu
            .locator("a")
            .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
        ).toEqual(groups.flatMap(({ children }) => children.map(({ href }) => href)));
        if (first) {
          await page.screenshot({ path: test.info().outputPath(`product-children-${width}.png`) });
          first = false;
        }
        await menu.getByRole("link", { name: child.label, exact: true }).click();
        await expect(page).toHaveURL(new URL(child.href, page.url()).href);
        const catalog = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
        await expect(catalog.getByRole("heading", { level: 2 })).toHaveText(parent.label);
        await expect(
          catalog
            .getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" })
            .getByRole("button", { name: child.label, exact: true }),
        ).toHaveAttribute("aria-pressed", "true");
        const real = expected[childIndex].productIds.length;
        const mocks = expected[childIndex].entries?.filter((entry) => !entry.productId).length ?? 0;
        await expect(catalog.getByRole("status")).toHaveText(
          `${real} รายการ${mocks ? ` · ${mocks} รุ่นตัวอย่าง (Mock)` : ""}`,
        );
        if (width < 1400) await expect(page.locator("#mobile-navigation")).toHaveCount(0);
        else await expect(page.locator("#desktop-submenu")).toHaveAttribute("aria-hidden", "true");
      }
    }
    expect(errors).toEqual([]);
  });
}

for (const width of [320, 768, 1400, 1920]) {
  test(`product submenu keeps every group reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/contact-us");
    const menu = await productMenu(page, width);
    await expect(menu).toHaveCount(3);
    await expect(menu.locator("a")).toHaveCount(23);
    const last = menu.last().getByRole("link", { name: "วัสดุสิ้นเปลือง", exact: true });
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const viewportMenu = page.locator(
      width >= 1400 ? ".desktop-submenu.is-open" : "#mobile-navigation",
    );
    const box = (await viewportMenu.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(901);
    await page.screenshot({ path: test.info().outputPath(`product-children-${width}.png`) });
    await last.click();
    await expect(page).toHaveURL(
      /\/products\?category=accessories&subcategory=accessory-consumables$/,
    );
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
  await page.goto(
    "/products?category=indicators&subcategory=indicator-waterproof&trace=keep#products",
  );
  const catalog = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  const track = catalog.getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" });
  await expect(track.getByRole("button", { name: "กันน้ำ", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await track.getByRole("button", { name: "LED", exact: true }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("subcategory"))
    .toBe("indicator-led");
  expect(new URL(page.url()).searchParams.get("trace")).toBe("keep");
  expect(new URL(page.url()).hash).toBe("#products");
  await page.reload();
  await expect(track.getByRole("button", { name: "LED", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(new URL(page.url()).hash).toBe("");
  await track.getByRole("button", { name: "ทั้งหมด", exact: true }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get("subcategory")).toBeNull();
  await track.getByRole("button", { name: "LCD", exact: true }).click();
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
  const menu = await productMenu(page, 1440);
  await menu.getByRole("link", { name: "Windows", exact: true }).click();
  await expect(track.getByRole("button", { name: "Windows", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.goBack();
  await expect(page).toHaveURL(previous);
  await expect(track.getByRole("button", { name: "ทั้งหมด", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.goForward();
  await expect(track.getByRole("button", { name: "Windows", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const sameFamily = await productMenu(page, 1440);
  await sameFamily.getByRole("link", { name: "Android", exact: true }).click();
  await expect(track.getByRole("button", { name: "Android", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await catalog.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).click();
  await expect(page).toHaveURL(/\/products$/);
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
  await expect(catalog.getByRole("status")).toHaveText("0 รายการ");
  await expect(
    catalog.getByRole("heading", { name: "ยังไม่พบสินค้าที่คุณค้นหา", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
