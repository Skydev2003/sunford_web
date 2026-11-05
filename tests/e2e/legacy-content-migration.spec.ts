import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const output = "output/legacy-content-migration-20261105/browser";
const products = [
  ["10732", "LP53"],
  ["10733", "LP54"],
  ["10838", "PU30M16"],
  ["10839", "PU30M16"],
  ["10840", "NY30M12"],
  ["10841", "PU20M08"],
  ["10842", "PU20M10"],
  ["10843", "NY20M12"],
  ["10844", "NY25M12"],
];

test("the live catalogue exposes nine new products and preserves existing category labels", async ({
  page,
  request,
}) => {
  const response = await request.get("/api/products");
  expect(response.ok()).toBe(true);
  const { products: rows } = await response.json();
  expect(rows).toHaveLength(159);
  for (const [id] of products)
    expect(rows.some((row: { sourceId: string }) => row.sourceId === id)).toBe(true);
  await page.goto("/products?category=accessories");
  const catalogue = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  await expect(catalogue.getByRole("heading", { level: 2 })).toHaveText("อุปกรณ์เสริม");
  await expect(
    catalogue.getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true }).getByRole("button"),
  ).toHaveText([
    "เครื่องชั่ง",
    "อินดิเคเตอร์แท่นชั่ง",
    "โครงสร้างแท่นชั่ง",
    "ระบบ POS",
    "อุปกรณ์เสริม",
  ]);
  await expect(catalogue.getByRole("button", { name: "หมวดย่อย 01", exact: true })).toBeVisible();
  await expect(catalogue.getByRole("button", { name: "หมวดย่อย 02", exact: true })).toBeVisible();
  await catalogue.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("LP53");
  await expect(
    catalogue.locator('a[href="/products/10732"]').filter({ hasText: "LP53" }),
  ).toBeVisible();
});

for (const [id, model] of products) {
  test(`verified source product ${id} has real local imagery and complete detail content`, async ({
    page,
  }) => {
    await page.goto(`/products/${id}`);
    const main = page.locator("main");
    await expect(main.getByRole("heading", { level: 1 })).toContainText(model);
    await expect(main).toContainText("รายละเอียดสินค้า");
    const image = main.locator("img").first();
    await expect(image).toBeVisible();
    await expect
      .poll(() =>
        image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0),
      )
      .toBe(true);
    if (id === "10732" || id === "10733") {
      await expect(main).toContainText("203");
      await expect(main).toContainText("152");
    }
    if (id === "10838") await expect(main).not.toContainText("Nylon");
  });
}

for (const width of [320, 390, 768, 1440]) {
  test(`imported content fits existing layout at ${width}px`, async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const [name, path] of [
      ["lot", "/solutions/lot-serial"],
      ["pos", "/solutions/pos"],
      ["windows", "/solutions/windows"],
      ["driver", "/solutions/driver"],
      ["drv", "/software/download/sunford-drv"],
      ["article", "/blogs/editorial/before-using-a-price-computing-scale"],
      ["printer", "/products/10732"],
      ["wheel", "/products/10838"],
    ]) {
      await page.goto(path);
      const main = page.locator("main");
      await expect(main).toBeVisible();
      await expect(main).not.toContainText("หน้าเว็บต้นฉบับยังไม่มีรายละเอียดสำหรับหัวข้อนี้");
      await expect(main).not.toContainText("สอบถามรายละเอียดเพิ่มเติมจากทีม Sunford");
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true);
      await mkdir(output, { recursive: true });
      await page.screenshot({ path: `${output}/${name}-${width}.png`, animations: "disabled" });
    }
    expect(errors).toEqual([]);
  });
}

test("Biz Talk covers and existing Driver videos render in the current content templates", async ({
  page,
}) => {
  await page.goto("/news-and-activities");
  await page.getByRole("textbox", { name: "ค้นหาข้อมูล Sunford" }).fill("Passion");
  const card = page.locator('main a[href="/blogs/editorial/SUNFORD_BIZ_TALK_EP.27"]');
  await expect(card).toHaveCount(1);
  await expect(card.locator("img")).toBeVisible();
  await expect(card).not.toContainText("พื้นที่สำหรับรูปภาพ");
  await page.goto("/software/download/sunford-drv");
  await expect(page.locator("main iframe")).toHaveCount(2);
  await expect(page.locator("main")).toContainText("Excel / ERP / WMS");
});
