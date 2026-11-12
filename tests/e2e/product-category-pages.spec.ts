import { expect, test, type Locator, type Page } from "@playwright/test";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";

const children = defaultNavigation[0].groups!.flatMap((group) => group.links);
const catalogName = "แคตตาล็อกสินค้า Sunford";

async function categoryCatalog(page: Page, id: string) {
  if (["scales", "indicators", "platforms", "pos", "accessories"].includes(id)) {
    const title = `ดู${productCategoryDefinitions.find((category) => category.id === id)!.label}ทั้งหมด`;
    const finder = page.getByRole("dialog", { name: title, exact: true });
    if (!new URL(page.url()).searchParams.has("subcategory") && !(await finder.isVisible()))
      await page
        .locator('[data-overview-section="lineup"]')
        .getByRole("button", { name: title, exact: true })
        .click();
    await expect(finder).toBeVisible();
    return finder.getByRole("region", { name: catalogName });
  }
  return page.getByRole("region", { name: catalogName }).filter({ visible: true });
}

async function catalogState(catalog: Locator) {
  const more = catalog.getByRole("button", { name: /^ดูเพิ่มเติม \(/ });
  while (await more.count()) await more.click();
  return {
    status: await catalog.getByRole("status").innerText(),
    entries: await catalog.locator("#mock-product-results > article").evaluateAll((cards) =>
      cards.map((card) => {
        const src = card.querySelector("img")?.getAttribute("src");
        const url = src ? new URL(src, location.origin) : null;
        return {
          model: card.querySelector("h3")?.textContent?.trim(),
          href: card.querySelector("a")?.getAttribute("href") ?? null,
          image: url?.searchParams.get("url") ?? url?.pathname ?? null,
          mock: card.hasAttribute("data-mock-product"),
        };
      }),
    ),
  };
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 1440]) {
  test(`five category pages show their own products and retain all-products access at ${width}px`, async ({
    page,
    context,
  }) => {
    test.slow();
    await page.setViewportSize({ width, height: 1000 });
    const reference = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const { id, label } of productCategoryDefinitions) {
      const path = `/products/category/${id}`;
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
      const catalog = await categoryCatalog(page, id);
      await expect(
        catalog.getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true }),
      ).toHaveCount(
        ["scales", "indicators", "platforms", "pos", "accessories"].includes(id) ? 1 : 0,
      );
      await expect(catalog.getByRole("group", { name: "สินค้าเด่น", exact: true })).toHaveCount(0);
      await expect(
        page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true }),
      ).not.toBeVisible();
      await expect(catalog.locator("#mock-product-results > article").first()).toBeVisible();
      await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
      await expect(page.locator(".site-footer:visible,[data-products-footer]:visible")).toHaveCount(
        1,
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({ path: test.info().outputPath(`category-${id}-${width}.png`) });
      await reference.goto(`/products?category=${id}`);
      const popup = reference.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true });
      await expect(popup).toBeVisible();
      const oldCatalog = popup.getByRole("region", { name: catalogName });
      await expect(
        oldCatalog.getByRole("heading", { level: 2, name: label, exact: true }),
      ).toBeVisible();
      expect(await catalogState(catalog)).toEqual(await catalogState(oldCatalog));
      if (["scales", "indicators", "platforms", "pos", "accessories"].includes(id))
        await page
          .getByRole("dialog", { name: `ดู${label}ทั้งหมด`, exact: true })
          .getByRole("button", { name: "ปิดแคตตาล็อกสินค้า" })
          .click();
      const allProducts = ["scales", "indicators", "platforms", "pos", "accessories"].includes(id)
        ? page
            .locator('[data-overview-section="chapters"]')
            .getByRole("link", { name: "สินค้าทั้งหมด", exact: true })
        : catalog.getByRole("link", { name: "สินค้าทั้งหมด", exact: true });
      await expect(allProducts).toHaveAttribute("href", "/products?catalog=all");
      await allProducts.click();
      await expect(page).toHaveURL(/\/products\?catalog=all$/);
      const allPopup = page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true });
      await expect(allPopup).toBeVisible();
      const allCatalog = allPopup.getByRole("region", { name: catalogName });
      await expect(
        allCatalog.getByRole("heading", { level: 2, exact: true, name: "ผลิตภัณฑ์ทั้งหมด" }),
      ).toBeVisible();
      await expect(
        allCatalog
          .getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true })
          .getByRole("button"),
      ).toHaveCount(5);
      await page.keyboard.press("Escape");
      await expect(allPopup).not.toBeVisible();
      await page.goBack();
      await expect(page).toHaveURL(new URL(path, page.url()).href);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
      await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
    }
    expect(errors).toEqual([]);
    await reference.close();
  });
}

test("all23 child destinations match the existing catalog in their category presentation", async ({
  page,
  context,
}) => {
  test.setTimeout(180000);
  const reference = await context.newPage();
  for (const child of children) {
    const params = new URL(child.href, "http://localhost").searchParams;
    const id = params.get("category")!;
    const childId = params.get("subcategory")!;
    await page.goto(`/products/category/${id}?subcategory=${childId}`);
    const catalog = await categoryCatalog(page, id);
    const selected = catalog
      .getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" })
      .getByRole("button", { name: child.label, exact: true });
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true }),
    ).not.toBeVisible();
    await reference.goto(child.href);
    const popup = reference.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true });
    await expect(popup).toBeVisible();
    const oldCatalog = popup.getByRole("region", { name: catalogName });
    await expect(
      oldCatalog
        .getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" })
        .getByRole("button", { name: child.label, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(await catalogState(catalog)).toEqual(await catalogState(oldCatalog));
  }
  await reference.close();
});

test("category filters, refresh, navigation history and comparison stay inside the category", async ({
  page,
}) => {
  await page.goto("/products/category/scales?subcategory=scale-price&trace=keep");
  const catalog = await categoryCatalog(page, "scales");
  const subcategories = catalog.getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" });
  await expect(
    subcategories.getByRole("button", { name: "คำนวณราคาหน้าร้าน", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await subcategories.getByRole("button", { name: "ตั้งพื้น", exact: true }).click();
  await expect(page).toHaveURL(/subcategory=scale-floor/);
  expect(new URL(page.url()).searchParams.get("trace")).toBe("keep");
  await page.reload();
  await expect(
    page.getByRole("dialog", { name: "ดูเครื่องชั่งทั้งหมด", exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "เครื่องชั่ง", exact: true }),
  ).toBeVisible();
  await page
    .locator("#products-chapters")
    .getByRole("button", { name: "เครื่องชั่งตั้งพื้น", exact: true })
    .click();
  await expect(
    subcategories.getByRole("button", { name: "ตั้งพื้น", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("dialog", { name: "ดูเครื่องชั่งทั้งหมด", exact: true })
    .getByRole("button", { name: "ปิดแคตตาล็อกสินค้า" })
    .click();
  const header = page.locator("[data-products-header]:visible");
  await header.getByRole("link", { name: "ระบบ POS", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("ระบบ POS");
  await page.goBack();
  await expect(page.locator("[data-products-overview]:visible #products-title")).toHaveText(
    "เครื่องชั่ง",
  );
  await expect(
    subcategories.getByRole("button", { name: "ตั้งพื้น", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goForward();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("ระบบ POS");
  await page.goBack();
  await catalog
    .getByRole("textbox", { name: "ค้นหารุ่นสินค้า" })
    .fill("no-such-product-first-step");
  await expect(
    catalog.getByRole("heading", { name: "ยังไม่พบสินค้าที่คุณค้นหา", exact: true }),
  ).toBeVisible();
  await catalog.getByRole("button", { name: "ล้างตัวกรองทั้งหมด", exact: true }).click();
  await expect(page.locator("[data-products-overview]:visible #products-title")).toHaveText(
    "เครื่องชั่ง",
  );
  await expect(subcategories.getByRole("button", { name: "ทั้งหมด", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(new URL(page.url()).pathname).toBe("/products/category/scales");
  await catalog.getByRole("button", { name: "แสดงแบบรายการ", exact: true }).click();
  await expect(catalog.getByRole("button", { name: "แสดงแบบรายการ", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await catalog.getByRole("button", { name: "แสดงแบบตาราง", exact: true }).click();
  await catalog.getByRole("button", { name: "สินค้าแนะนำ", exact: true }).click();
  await expect(catalog.getByRole("button", { name: "สินค้าแนะนำ", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await catalog.getByRole("button", { name: "สินค้าแนะนำ", exact: true }).click();
  await catalog.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
  const compare = catalog.locator("article[data-model-only]").first().getByRole("button");
  await expect(compare).toHaveAttribute("aria-pressed", "false");
  await compare.click();
  await expect(compare).toHaveAttribute("aria-pressed", "true");
});

for (const width of [320, 768, 834, 1920]) {
  test(`category pages keep products and all-products button reachable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const { id, label } of productCategoryDefinitions) {
      await page.goto(`/products/category/${id}`);
      if (["scales", "indicators", "platforms", "pos", "accessories"].includes(id)) {
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
        await expect(
          page
            .locator('[data-overview-section="chapters"]')
            .getByRole("link", { name: "สินค้าทั้งหมด", exact: true }),
        ).toBeInViewport();
        await expect(page.locator('[data-overview-section="hero"]')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        continue;
      }
      const catalog = page.getByRole("region", { name: catalogName });
      await expect(catalog.getByRole("heading", { level: 1 })).toHaveText(label);
      await expect(
        catalog.getByRole("link", { name: "สินค้าทั้งหมด", exact: true }),
      ).toBeInViewport();
      await expect(catalog.locator("#mock-product-results > article").first()).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (id === "indicators")
        await page.screenshot({ path: test.info().outputPath(`category-responsive-${width}.png`) });
    }
  });
}

test("unknown category returns404 and unknown or foreign child cannot escape its parent", async ({
  page,
  request,
}) => {
  const response = await request.get("/products/category/unknown-first-step");
  expect(response.status()).toBe(404);
  for (const child of ["unknown-child", "pos-ios"]) {
    await page.goto(`/products/category/scales?category=pos&subcategory=${child}`);
    const catalog = await categoryCatalog(page, "scales");
    await expect(
      catalog.getByRole("heading", { level: 2, name: "เครื่องชั่ง", exact: true }),
    ).toBeVisible();
    await expect(
      catalog
        .getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" })
        .getByRole("button", { name: "ทั้งหมด", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      catalog
        .getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" })
        .getByRole("button", { name: "iOS", exact: true }),
    ).toHaveCount(0);
  }
});
