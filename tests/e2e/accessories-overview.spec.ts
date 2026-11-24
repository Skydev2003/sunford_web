import { expect, test } from "@playwright/test";
import { accessorySubcategoryDefinitions } from "../../src/features/catalog/data/accessory-subcategories";
import { buyingGuides } from "../../src/features/content/data/buying-guides";

const path = "/products/category/accessories";
const label = "อุปกรณ์เสริม";
const title = `ดู${label}ทั้งหมด`;
const guide = buyingGuides.find(({ slug }) => slug === "accessories")!;
const chapterNames: Record<string, string> = {
  "accessory-displays": "จอและไฟเตือน",
  "accessory-cables": "สายและหัวต่อ",
  "accessory-mechanical": "ชิ้นส่วนแท่น",
  "accessory-pos": "อุปกรณ์ POS",
  "accessory-consumables": "อื่น ๆ",
};

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 834, 1440]) {
  test(`accessory chapters show distinct artwork and share it with listings at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    const chapters = page.locator("#products-chapters > li > a");
    await expect(chapters).toHaveCount(8);
    const artwork = new Map<string, string>();
    for (const link of await chapters.all()) {
      const href = (await link.getAttribute("href"))!;
      const image = link.locator("img");
      await image.scrollIntoViewIfNeeded();
      const source = await image.evaluate(async (node: HTMLImageElement) => {
        await node.decode();
        const url = new URL(node.currentSrc);
        return url.searchParams.get("url") ?? url.pathname;
      });
      expect(source).toMatch(/^\/_next\/static\/media\//);
      expect(await image.getAttribute("alt")).toBe("");
      artwork.set(href, source);
    }
    expect(new Set(artwork.values()).size).toBe(8);

    const overviewFilter = page
      .getByRole("group", { name: "กรองผลิตภัณฑ์" })
      .getByRole("button", { name: "อื่น ๆ", exact: true });
    await overviewFilter.click();
    await expect(overviewFilter).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#products-lineup").getByRole("link").first()).toBeAttached();
    await expect(chapters.last()).toHaveText("อื่น ๆ");
    await chapters.last().click();
    await expect(page).toHaveURL(`${path}/consumables`);
    const filters = page.getByRole("navigation", { name: "หมวดย่อยสินค้า" });
    const selected = filters.locator('a[aria-current="page"]');
    await expect(selected).toHaveAttribute("href", `${path}/consumables`);
    const image = selected.locator("img");
    await image.scrollIntoViewIfNeeded();
    const source = await image.evaluate(async (node: HTMLImageElement) => {
      await node.decode();
      const url = new URL(node.currentSrc);
      return url.searchParams.get("url") ?? url.pathname;
    });
    expect(source).toBe(artwork.get(`${path}/consumables`));
    const products = page.locator("article[data-model-only]");
    const total = await products.count();
    for (const type of ["กระดาษความร้อน", "ฉลากและสติ๊กเกอร์"]) {
      const filter = page.getByRole("button", { name: type, exact: true });
      await filter.click();
      await expect(filter).toHaveAttribute("aria-pressed", "true");
      expect(await products.count()).toBeGreaterThan(0);
      expect(await products.count()).toBeLessThan(total);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

for (const width of [390, 834, 1440]) {
  test(`accessories follow the shared category layout at ${width}px`, async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(path);
    const overview = page.locator('[data-overview-category="accessories"]:visible');
    const main = overview.locator("main");
    await expect(main.getByRole("heading", { level: 1 })).toHaveText(label);
    expect(
      await main
        .locator("[data-overview-section]")
        .evaluateAll((sections) =>
          sections.map((section) => section.getAttribute("data-overview-section")),
        ),
    ).toEqual(["chapters", "lineup", "accordion", "services", "essentials", "index"]);
    await expect(main.locator("#products-chapters > li")).toHaveCount(8);
    const cards = main.locator("#products-lineup > li > a");
    const total = await cards.count();
    expect(total).toBeGreaterThan(6);
    await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
    await expect(page.locator("[data-products-footer]:visible")).toHaveCount(1);
    await expect(page.locator(".site-footer:visible")).toHaveCount(1);
    await expect(page.getByRole("dialog", { name: title, exact: true })).not.toBeVisible();
    await page.screenshot({ path: test.info().outputPath(`accessories-top-${width}.png`) });
    for (const id of ["products-lineup", "products-services"]) {
      await main.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.screenshot({ path: test.info().outputPath(`${id}-${width}.png`) });
    }
    const services = main.locator("#products-services > li");
    await expect(services.locator("h3")).toHaveText([
      "เลือกอุปกรณ์ที่ใช้ร่วมกัน",
      "ขอใบเสนอราคา",
      "บริการหลังการขาย",
      "ลงทะเบียนรับประกัน",
    ]);
    await expect(services.locator(":scope > p")).toHaveText([
      /รุ่นเครื่องชั่ง.*พอร์ต.*ขั้วต่อ/,
      /รุ่นและจำนวน.*ฝ่ายขาย/,
      /ชื่อรุ่น.*ซ่อม.*เคลม/,
      /หลักฐานการซื้อ.*ลงทะเบียน/,
    ]);
    await expect(services.locator("button, a")).toHaveCount(0);
    await expect
      .poll(() =>
        services.evaluateAll((items) => {
          const product = document.querySelector("#products-lineup > li")!.getBoundingClientRect();
          return Math.max(
            ...items.flatMap((item) => {
              const card = item.getBoundingClientRect();
              return [Math.abs(card.width - product.width), Math.abs(card.height - product.height)];
            }),
          );
        }),
      )
      .toBeLessThan(1);
    const filters = main.getByRole("group", { name: "กรองผลิตภัณฑ์" });
    const printers = filters.getByRole("button", { name: "เครื่องพิมพ์", exact: true });
    await printers.click();
    await expect(printers).toHaveAttribute("aria-pressed", "true");
    const printerLinks = await cards.evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")!),
    );
    expect(printerLinks.length).toBeGreaterThan(0);
    expect(printerLinks.length).toBeLessThan(total);
    await main
      .locator("#products-chapters")
      .getByRole("link", { name: "เครื่องพิมพ์", exact: true })
      .click();
    const listing = page.locator('[data-product-subcategory-page="accessory-printers"]:visible');
    await expect(page).toHaveURL(`${path}/printers`, { timeout: 15_000 });
    await expect(listing).toBeVisible({ timeout: 15_000 });
    await expect(listing.getByRole("status")).toHaveText(`${printerLinks.length} รายการ`);
    const more = listing.getByRole("button", { name: /^ดูเพิ่มเติม \(/ });
    while (await more.count()) await more.click();
    const listedLinks = await listing
      .locator("article[data-model-only] h3")
      .evaluateAll((titles) =>
        titles.map((title) => title.closest("a")!.getAttribute("href")!.split("?")[0]),
      );
    expect(listedLinks.sort()).toEqual(printerLinks.sort());
    await page.goBack();
    await expect(printers).toHaveAttribute("aria-pressed", "true");
    await filters.getByRole("button", { name: "ทุกผลิตภัณฑ์", exact: true }).click();
    await expect(cards).toHaveCount(total);
    const essentials = main.locator("#products-essentials");
    await expect(essentials.locator(":scope > li")).toHaveCount(2);
    await expect(
      essentials.getByRole("link", { name: "ดูเครื่องชั่ง", exact: true }),
    ).toHaveAttribute("href", "/products/category/scales");
    await expect(essentials.getByRole("link", { name: "ดูระบบ POS", exact: true })).toHaveAttribute(
      "href",
      "/products/category/pos",
    );
    const accordion = main.locator('[data-overview-section="accordion"]');
    await expect(accordion.getByRole("heading", { level: 2 })).toHaveText(
      `เลือก${label}ให้เหมาะกับงาน`,
    );
    const details = accordion.locator("details");
    await expect(details.first()).toHaveAttribute("open", "");
    for (const [index, section] of guide.sections.entries()) {
      const panel = details.nth(index);
      await expect(panel.locator("summary")).toHaveText(section.title);
      if (index > 0) await panel.locator("summary").click();
      await expect(panel).toHaveAttribute("open", "");
      await expect(panel.locator("p")).not.toBeEmpty();
      await expect(panel.locator("img")).toBeVisible();
    }
    await expect(accordion.locator("details[open]")).toHaveCount(1);
    await page.screenshot({ path: test.info().outputPath(`accessories-accordion-${width}.png`) });
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 1440]) {
  test(`accessory chapters and reload keep category ownership at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(path);
    const finder = page.getByRole("dialog", { name: title, exact: true });
    for (const { id, label: name } of accessorySubcategoryDefinitions) {
      const href = `${path}/${id.replace("accessory-", "")}`;
      const chapterName = chapterNames[id];
      if (chapterName)
        await page
          .locator("#products-chapters")
          .getByRole("link", { name: chapterName, exact: true })
          .click();
      else await page.goto(href);
      await expect(page).toHaveURL(new URL(href, page.url()).href);
      const listing = page.locator(`[data-product-subcategory-page="${id}"]`);
      await expect(listing.locator("h1")).toHaveText(`${label} ${name}`);
      await expect(listing.getByRole("status")).toHaveText(/^\d+ รายการ$/);
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await page.goBack();
      await expect(page).toHaveURL(new RegExp(path + "$"));
    }
    await page.goto(`${path}?subcategory=accessory-cables&trace=keep`);
    await expect(page).toHaveURL(new RegExp(path + "/cables\\?trace=keep$"));
    await page.reload();
    await expect(page.locator('[data-product-subcategory-page="accessory-cables"]')).toBeVisible();
    expect(new URL(page.url()).searchParams.get("trace")).toBe("keep");
    await expect(finder).not.toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
  });
}

for (const width of [768, 834]) {
  test(`accessory overview remains responsive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
    await expect(page.locator("#products-chapters > li")).toHaveCount(8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath(`accessories-${width}.png`) });
  });
}

test("accessory cable listing retains noninteractive Mock models in comparison mode", async ({
  page,
}) => {
  await page.goto(`${path}?subcategory=accessory-cables`);
  const listing = page.locator('[data-product-subcategory-page="accessory-cables"]');
  await expect(listing).toBeVisible();
  await expect(listing.locator("article img")).toHaveCount(0);
  await listing.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
  await expect(listing.locator("article[data-mock-product]")).toHaveCount(3);
  await expect(listing.locator("article[data-mock-product] :is(button,a,img)")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "ดูการเปรียบเทียบ", exact: true })).toBeDisabled();
});

test("accessory cache navigation preserves a single active chrome and overlay host", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(path);
  await page
    .locator("[data-products-nav]:visible")
    .getByRole("link", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true })
    .click();
  await expect(page).toHaveURL(/\/products$/);
  await page.goto("/products?catalog=all");
  await expect(page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goBack();
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
  await expect(page.getByRole("dialog", { name: title, exact: true })).toHaveCount(0);
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
    page.locator('[data-overview-category="accessories"]:visible #products-title'),
  ).toHaveText(label);
  await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
  expect(errors).toEqual([]);
});
