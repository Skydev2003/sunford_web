import { expect, test } from "@playwright/test";

const catalogName = "แคตตาล็อกสินค้า Sunford";
const cardPrice = /^(?:฿[\d,.]+|สอบถามราคา)$/;

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [320, 390, 834, 1440]) {
  test(`search, browsing and product prices remain clear at ${width}px`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const { products } = await (await request.get("/api/products")).json();
    const source = products.find((product: { id: string }) => product.id === "wps10ks");
    expect(source).toBeTruthy();
    await page.goto("/products?category=scales");
    const catalog = page.getByRole("region", { name: catalogName });
    const search = catalog.getByRole("textbox", { name: "ค้นหารุ่นสินค้า", exact: true });
    await expect(search).toBeVisible();
    await expect(
      catalog.getByText("ยังไม่ทราบรุ่น เลือกจากหมวดสินค้า", { exact: true }),
    ).toBeVisible();
    const categoryNavigation = catalog.getByRole("navigation", {
      name: "หมวดหมู่สินค้า",
      exact: true,
    });
    expect(
      await search.evaluate((element) =>
        Boolean(
          element.compareDocumentPosition(document.querySelector("#catalog-categories")!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      ),
    ).toBe(true);
    await search.fill("WPS10KS");
    const card = catalog.locator("#mock-product-results article");
    await expect(card.getByRole("heading", { level: 3 })).toHaveText("WPS10KS");
    await expect(card.locator("[data-product-highlight]")).toHaveText("ชาร์จได้ ไม่ต้องซื้อถ่าน");
    const price = card.locator("[data-product-highlight] + p");
    await expect(price).toHaveText([cardPrice]);
    await expect(card.locator("dl")).toHaveCount(0);
    const tools = catalog.getByRole("group", { name: "เครื่องมือรายการสินค้า", exact: true });
    await expect(
      tools.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }),
    ).toBeVisible();
    await expect(price).toBeVisible();
    expect(await price.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(
      true,
    );
    const withoutFacts = products.find(
      (product: {
        warehouseCategoryId: string;
        warehouseSpecifications: unknown[];
        warehouseCard?: Record<string, string>;
      }) =>
        product.warehouseCategoryId === "scales" &&
        product.warehouseSpecifications.length === 0 &&
        ["capacity", "readability", "connection", "subtitle"].every(
          (field) => !product.warehouseCard?.[field]?.trim(),
        ),
    );
    expect(withoutFacts).toBeTruthy();
    await search.fill(withoutFacts.warehouseSku);
    const withoutFactsCard = card.filter({
      has: page.locator(`a[href^="/products/${withoutFacts.slug}"]`),
    });
    await expect(withoutFactsCard.getByRole("heading", { level: 3 })).toHaveText(withoutFacts.name);
    await expect(withoutFactsCard.locator("[data-product-highlight] + p")).toHaveText([cardPrice]);
    await search.fill("no-such-model-hicks");
    await expect(
      catalog.getByRole("heading", { name: "ยังไม่พบสินค้าที่คุณค้นหา", exact: true }),
    ).toBeVisible();
    await search.fill("");
    await expect(
      categoryNavigation.getByRole("button", { name: "เครื่องชั่ง", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "ปิดแคตตาล็อกสินค้า" }).click();
    await page.goto("/products?category=platforms");
    await expect(page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true })).toBeVisible();
    if (width < 1100) {
      const sizes = await page.getByRole("region", { name: catalogName }).evaluate((element) => ({
        catalog: element.getBoundingClientRect().width,
        search: element.querySelector("#catalog-search")!.parentElement!.getBoundingClientRect()
          .width,
        padding:
          parseFloat(getComputedStyle(element).paddingLeft) +
          parseFloat(getComputedStyle(element).paddingRight),
      }));
      expect(sizes.search).toBeGreaterThanOrEqual(sizes.catalog - sizes.padding - 2);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath(`catalog-card-${width}.png`) });
    expect(errors).toEqual([]);
  });
}

test("indicator and accessory cards show a short highlight and price with the model and photo", async ({
  page,
  request,
}) => {
  const {
    products,
  }: {
    products: {
      name: string;
      warehouseSubcategoryIds?: string[];
      warehouseCard?: { connection?: string };
    }[];
  } = await (await request.get("/api/products")).json();
  const source = products.find((product) => product.name === "SW31")!;
  expect(source.warehouseSubcategoryIds).toContain("indicator-led");
  expect(source.warehouseCard?.connection?.trim()).toBeTruthy();
  await page.goto("/indicators?subcategory=indicator-led");
  const catalog = page.getByRole("region", { name: catalogName });
  await catalog.getByRole("textbox", { name: "ค้นหารุ่นสินค้า", exact: true }).fill("SW31");
  const card = catalog
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: "SW31", exact: true }) });
  await expect(card).toBeVisible();
  await expect(card.locator("[data-product-highlight]")).toHaveText(/\S/);
  await expect(card.locator("[data-product-highlight] + p")).toHaveText([cardPrice]);
  await expect(card.locator("dl")).toHaveCount(0);
  const waterproof = products.filter((product) =>
    product.warehouseSubcategoryIds?.includes("indicator-waterproof"),
  );
  await page.goto("/indicators/waterproof");
  const realCards = page.locator("#mock-product-results article[data-model-only]");
  if (waterproof.length) {
    await expect(realCards).toHaveCount(waterproof.length);
    expect((await realCards.getByRole("heading", { level: 3 }).allTextContents()).sort()).toEqual(
      waterproof.map((product) => product.name).sort(),
    );
  } else await expect(realCards).toHaveCount(0);
  await page.goto("/products?category=accessories");
  await catalog.getByRole("textbox", { name: "ค้นหารุ่นสินค้า", exact: true }).fill("LED-R5");
  const display = catalog
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: "LED-R5", exact: true }) });
  await expect(display).toBeVisible();
  await expect(display.locator("[data-product-highlight]")).toHaveText("จอแสดงผลชนิด LED");
  await expect(display.locator("[data-product-highlight] + p")).toHaveText([cardPrice]);
  await expect(display.locator("dl")).toHaveCount(0);
});

for (const width of [390, 1440]) {
  test(`comparison keeps the cap and highlights only complete differing rows at ${width}px`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const { products } = await (await request.get("/api/products")).json();
    await page.goto("/products?category=scales");
    const catalog = page.getByRole("region", { name: catalogName });
    await catalog.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
    await expect(
      catalog.getByText("เลือกได้สูงสุด 3 รุ่น จากนั้นกดดูการเปรียบเทียบ", { exact: true }),
    ).toBeVisible();
    const choices = catalog.getByRole("button", { name: /^เพิ่มเพื่อเปรียบเทียบ/ });
    for (let index = 0; index < 3; index++) {
      const choice = choices.first();
      const box = (await choice.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      await choice.click();
    }
    await expect(page.locator(".compare-bar strong")).toHaveText("3/3");
    await expect(choices.first()).toBeDisabled();
    await page.getByRole("button", { name: "ดูการเปรียบเทียบ", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "เปรียบเทียบสินค้า", exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("เลือกไว้ 3 รุ่น", { exact: false })).toBeVisible();
    const scrollHint = dialog.getByText("เลื่อนตารางไปด้านข้างเพื่อดูรุ่นอื่น", { exact: true });
    if (width < 768) await expect(scrollHint).toBeVisible();
    else await expect(scrollHint).not.toBeVisible();
    await expect(dialog.locator("tbody tr")).toHaveCount(4);
    const slugs = await dialog
      .locator('thead a[href^="/products/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")!.split("/").at(-1)));
    const selected = slugs.map((slug) =>
      products.find((product: { slug: string }) => product.slug === slug),
    );
    for (const key of ["subtitle", "capacity", "readability", "connection"]) {
      const values = selected.map((product) => product[key]?.trim() ?? "");
      const known = values.every((value) => value && !/^[—–-]+$/.test(value));
      const different = known && new Set(values).size > 1;
      const row = dialog.locator(`tr[data-comparison-key="${key}"]`);
      if (different) await expect(row).toHaveAttribute("data-different", "true");
      else await expect(row).not.toHaveAttribute("data-different", "true");
      await expect(row.locator("td")).toHaveText(
        values.map((value) => (value && !/^[—–-]+$/.test(value) ? value : "—")),
      );
    }
    await page.screenshot({ path: test.info().outputPath(`comparison-clarity-${width}.png`) });
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(catalog).toBeVisible();
    await expect(
      catalog.getByRole("textbox", { name: "ค้นหารุ่นสินค้า", exact: true }),
    ).toBeFocused();
  });
}

test("product cards and controls remain readable at 200 percent CSS zoom", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/products?category=scales");
  const catalog = page.getByRole("region", { name: catalogName });
  await catalog.getByRole("textbox", { name: "ค้นหารุ่นสินค้า", exact: true }).fill("WPS10KS");
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  await expect(
    catalog.getByRole("textbox", { name: "ค้นหารุ่นสินค้า", exact: true }),
  ).toBeVisible();
  await expect(
    catalog.locator("article[data-model-only] [data-product-highlight]").first(),
  ).toBeVisible();
  expect(await catalog.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(
    true,
  );
  await page.screenshot({ path: test.info().outputPath("catalog-card-zoom200.png") });
});
