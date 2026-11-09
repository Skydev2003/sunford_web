import { expect, test } from "@playwright/test";

const catalogName = "แคตตาล็อกสินค้า Sunford";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [320, 390, 834, 1440]) {
  test(`search, browsing and verified facts remain clear at ${width}px`, async ({
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
    const facts = card.locator("[data-product-facts]");
    await expect(facts).toContainText(source.capacity.trim());
    await expect(facts).toContainText(source.readability.trim());
    await expect(facts).toContainText(source.connection.trim());
    await expect(facts).toContainText("ค่าละเอียด");
    const tools = catalog.getByRole("group", { name: "เครื่องมือรายการสินค้า", exact: true });
    await expect(
      tools.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }),
    ).toBeVisible();
    await catalog.getByRole("button", { name: "แสดงแบบรายการ", exact: true }).click();
    await expect(facts).toBeVisible();
    expect(await facts.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(
      true,
    );
    await catalog.getByRole("button", { name: "แสดงแบบตาราง", exact: true }).click();
    await search.fill("VL15000S");
    await expect(catalog.locator("article[data-mock-product]")).toBeVisible();
    await expect(catalog.locator("article[data-mock-product] [data-product-facts]")).toHaveCount(0);
    await search.fill("no-such-model-hicks");
    await expect(
      catalog.getByRole("heading", { name: "ยังไม่พบสินค้าที่คุณค้นหา", exact: true }),
    ).toBeVisible();
    await search.fill("");
    await expect(
      categoryNavigation.getByRole("button", { name: "เครื่องชั่ง", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "ปิดแคตตาล็อกสินค้า" }).click();
    await page.goto("/products/category/platforms");
    await page
      .locator('[data-overview-section="lineup"]')
      .getByRole("button", { name: "ดูโครงสร้างแท่นชั่งทั้งหมด", exact: true })
      .click();
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
    await page.screenshot({ path: test.info().outputPath(`decision-facts-${width}.png`) });
    expect(errors).toEqual([]);
  });
}

test("indicator facts use verified display membership without presenting legacy display weights", async ({
  page,
}) => {
  await page.goto("/products/category/indicators?subcategory=indicator-led");
  const catalog = page.getByRole("region", { name: catalogName });
  await catalog.getByRole("textbox", { name: "ค้นหารุ่นสินค้า", exact: true }).fill("LED-R5");
  const card = catalog
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: "LED-R5", exact: true }) });
  await expect(card).toBeVisible();
  await expect(card.locator("[data-product-facts]")).toContainText("หน้าจอLED");
  await expect(card.locator("[data-product-facts]")).not.toContainText("พิกัดน้ำหนัก");
  await expect(card.locator("[data-product-facts]")).not.toContainText("ค่าละเอียด");
  await catalog.getByRole("textbox", { name: "ค้นหารุ่นสินค้า", exact: true }).fill("");
  await catalog.getByRole("button", { name: "กันน้ำ", exact: true }).click();
  const realCards = catalog.locator("article[data-decision-facts]");
  expect(await realCards.count()).toBeGreaterThan(0);
  for (const card of await realCards.all())
    await expect(card.locator("[data-product-facts]")).toContainText("กันน้ำ");
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

test("decision facts and controls remain readable at200percent CSS zoom", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/products/category/platforms");
  await page
    .locator('[data-overview-section="lineup"]')
    .getByRole("button", { name: "ดูโครงสร้างแท่นชั่งทั้งหมด", exact: true })
    .click();
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  const catalog = page.getByRole("region", { name: catalogName });
  await expect(
    catalog.getByRole("textbox", { name: "ค้นหารุ่นสินค้า", exact: true }),
  ).toBeVisible();
  await expect(catalog.locator("[data-product-facts]").first()).toBeVisible();
  expect(await catalog.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(
    true,
  );
  await page.screenshot({ path: test.info().outputPath("decision-facts-zoom200.png") });
});
