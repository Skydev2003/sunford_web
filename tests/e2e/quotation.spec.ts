import { downloadQuotation } from "./quotation-download";
import { expect, test } from "@playwright/test";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";

test("quotation picker filters by the catalog menu and searches within a category", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const { products } = await (await request.get("/api/products")).json();
  const catalog: { warehouseSku: string; warehouseCategoryId?: string; name: string }[] = products;
  await page.goto("/service/quotation");
  const trigger = page.getByRole("button", { name: /เลือกรุ่นสินค้ารายการที่ 1/ });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "เลือกรุ่นสินค้า" });
  const filter = dialog.getByRole("button", { name: "ฟิลเตอร์" });
  const results = dialog.getByRole("list").getByRole("button");
  const skus = () =>
    results.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("value")).sort());
  const all = await skus();
  await filter.click();
  const options = dialog.getByRole("group", { name: "หมวดสินค้า" });
  await expect(options.getByRole("button")).toHaveText([
    "ผลิตภัณฑ์ทั้งหมด",
    ...productCategoryDefinitions.map((c) => c.label),
  ]);
  for (const option of productCategoryDefinitions) {
    await options.getByRole("button", { name: option.label, exact: true }).click();
    const expected = catalog
      .filter((p) => p.warehouseCategoryId === option.id && all.includes(p.warehouseSku))
      .map((p) => p.warehouseSku)
      .sort();
    expect(await skus()).toEqual(expected);
  }
  const allOption = options.getByRole("button", { name: "ผลิตภัณฑ์ทั้งหมด" });
  await allOption.click();
  expect(await skus()).toEqual(all);
  const indicator = catalog.find(
    (p) => p.warehouseCategoryId === "indicators" && all.includes(p.warehouseSku),
  )!;
  await dialog.getByRole("searchbox").fill(indicator.warehouseSku);
  await options.getByRole("button", { name: "เครื่องชั่ง", exact: true }).click();
  await expect(dialog.getByTitle(indicator.warehouseSku, { exact: true })).toHaveCount(0);
  await options.getByRole("button", { name: "อินดิเคเตอร์แท่นชั่ง" }).click();
  await filter.click();
  await dialog.getByTitle(indicator.warehouseSku, { exact: true }).click();
  await expect(trigger).toHaveText(indicator.name);
  await trigger.click();
  await filter.click();
  await expect(allOption).toHaveAttribute("aria-pressed", "true");
  await options.getByRole("button", { name: "อินดิเคเตอร์แท่นชั่ง" }).click();
  await expect(dialog.getByTitle(indicator.warehouseSku, { exact: true })).toHaveCount(0);
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
});

for (const width of [390, 834, 1440]) {
  test(`search quotation models and see thumbnails at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/service/quotation");
    const trigger = page.getByRole("button", { name: /เลือกรุ่นสินค้ารายการที่ 1/ });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "เลือกรุ่นสินค้า" });
    const search = dialog.getByRole("searchbox");
    await expect(search).toBeFocused();
    const box = (await dialog.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(24);
    expect(box.width).toBeLessThanOrEqual(Math.min(380, width - 32));
    await search.fill("unknown-model-for-qa");
    await expect(dialog.getByRole("status")).toHaveText("ไม่พบรุ่นสินค้า");
    await search.fill("g106308");
    const result = dialog.getByRole("button", {
      name: "TMS-60-AW31",
      description: "G106308",
      exact: true,
    });
    await expect
      .poll(() => result.locator("img").evaluate((img) => (img as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await search.press("Enter");
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveText("TMS-60-AW31");
    await expect(trigger.locator("img")).toBeVisible();
    await trigger.click();
    await search.fill("tms-60-aw31");
    await expect(dialog.getByRole("list", { name: "รุ่นสินค้า" }).getByRole("button")).toHaveCount(
      0,
    );
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("value", "G106308");
  });
}

test("selected model and alternate SKUs become available again after replacement or removal", async ({
  page,
}) => {
  await page.goto("/service/quotation?model=G107770&model=G106308");
  const picker = page.getByRole("dialog", { name: "เลือกรุ่นสินค้า" });
  const search = picker.getByRole("searchbox");
  const add = page.getByRole("button", { name: "เพิ่มรายการสินค้า" });
  const third = page.getByRole("button", { name: /เลือกรุ่นสินค้ารายการที่ 3/ });
  await add.click();
  await third.click();
  for (const sku of ["G107770", "G106308"]) {
    await search.fill(sku);
    await expect(picker.getByTitle(sku, { exact: true })).toHaveCount(0);
  }
  await search.fill("G106698");
  await picker.getByRole("button", { name: "WPS10KS", exact: true }).click();
  await third.click();
  await search.fill("FEH5KS");
  await picker.getByRole("button", { name: "FEH5KS", exact: true }).first().click();
  await third.click();
  await search.fill("G106698");
  await expect(picker.getByRole("button", { name: "WPS10KS", exact: true })).toBeVisible();
  await picker.getByRole("button", { name: "ปิด", exact: true }).click();
  await page.getByRole("button", { name: "ลบรายการที่ 2" }).click();
  await add.click();
  await third.click();
  await search.fill("TMS-60-AW31");
  await expect(picker.getByTitle("G106308", { exact: true })).toBeVisible();
});

for (const width of [320, 768, 1440]) {
  test(`quotation quantity labels at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/service/quotation?model=G107770&model=G106346");
    const items = page.getByRole("group", { name: "รายการสินค้า" });
    await expect(items.getByRole("button", { name: /รายละเอียด/ })).toHaveCount(0);
    for (const unit of ["ชิ้น", "เครื่อง"]) {
      const caption = items.getByText(`จำนวน (${unit})`, { exact: true });
      await expect(caption).toBeVisible();
      const fits = await caption.evaluate((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        const bounds = element.parentElement!.getBoundingClientRect();
        const rects = Array.from(range.getClientRects());
        return rects.every((rect) => rect.top === rects[0].top && rect.right <= bounds.right + 1);
      });
      expect(fits).toBe(true);
    }
    await expect(items.getByRole("button", { name: "ลบรายการที่ 2" })).toBeEnabled();
    await items.getByRole("button", { name: "เพิ่มรายการสินค้า" }).click();
    await items.getByRole("button", { name: /เลือกรุ่นสินค้ารายการที่ 3/ }).click();
    const picker = page.getByRole("dialog", { name: "เลือกรุ่นสินค้า" });
    await picker.getByRole("searchbox").fill("TIS300");
    await picker.getByTitle("TIS300", { exact: true }).click();
    const quantity = items.getByRole("spinbutton", { name: "จำนวน", exact: true });
    await expect(quantity).toHaveCount(1);
    await expect(items).not.toContainText("ไม่ระบุหน่วย");
    const price = items.getByText("ราคา/หน่วย (ก่อน VAT)", { exact: true }).last().locator("..");
    const inputBox = (await quantity.boundingBox())!;
    const priceBox = (await price.boundingBox())!;
    expect(inputBox.x + inputBox.width).toBeLessThanOrEqual(priceBox.x);
    await quantity.fill("2");
    const unitPrice = Number((await price.innerText()).split("\n").at(-1)!.replaceAll(",", ""));
    expect(unitPrice).toBeGreaterThan(0);
    await expect(
      items.getByText("รวมก่อน VAT (บาท)", { exact: true }).last().locator(".."),
    ).toContainText((unitPrice * 2).toLocaleString("en-US", { minimumFractionDigits: 2 }));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await items.screenshot({ path: test.info().outputPath("quotation-lines.png") });
    if (width === 1440) {
      await page.getByLabel("ชื่อผู้ซื้อ / บริษัท").fill("ทดสอบ");
      await page.getByLabel("ที่อยู่", { exact: true }).fill("กรุงเทพฯ");
      await downloadQuotation(page, test.info().outputPath("quotation.pdf"));
    }
  });
}

for (const route of ["/", "/contact-us"]) {
  test(`Services opens the quotation from ${route}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    if (route === "/")
      await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
    const nav = page.locator(route === "/" ? ".desktop-nav" : "[data-products-nav]");
    const services = nav.getByText("บริการ", { exact: true });
    await expect(services).toBeEnabled();
    await services.press("ArrowDown");
    await page.getByRole("link", { name: "ใบเสนอราคา", exact: true }).click();
    await expect(page).toHaveURL(/\/service\/quotation$/);
    await expect(page.getByRole("heading", { level: 1, name: "ใบเสนอราคา" })).toBeVisible({
      timeout: 20000,
    });
  });
}
test("mobile quotation shows a blank buyer and requires priced products", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/service/quotation");
  await expect(page.getByLabel("ชื่อผู้ซื้อ / บริษัท")).toHaveValue("");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const button = page.getByRole("button", { name: "พิมพ์ / บันทึก PDF" });
  if ((await page.getByRole("button", { name: /เลือกรุ่นสินค้ารายการที่/ }).count()) === 0) {
    await expect(button).toBeDisabled();
    await expect(page.getByRole("status")).toContainText("ยังไม่มีสินค้า");
  } else {
    await button.click();
    await expect(page.getByLabel("ชื่อผู้ซื้อ / บริษัท")).toBeFocused();
  }
});
test("Warehouse SKUs print the selected quantities plus VAT across A4 pages", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/service/quotation");
  const selects = page.getByRole("button", { name: /เลือกรุ่นสินค้ารายการที่/ });
  const firstModel = page.getByRole("list", { name: "รุ่นสินค้า" }).getByRole("button").first();
  await expect(selects.first()).toBeVisible();
  await page.getByLabel("ชื่อผู้ซื้อ / บริษัท").fill("ผู้ซื้อทดสอบ");
  await page.getByLabel("ที่อยู่", { exact: true }).fill("ที่อยู่สำหรับทดสอบ");
  await selects.first().click();
  await firstModel.click();
  await page.getByRole("spinbutton").first().fill("2");
  for (let i = 0; i < 34; i++) {
    await page.getByRole("button", { name: "เพิ่มรายการสินค้า" }).click();
    await selects.last().click();
    await firstModel.click();
  }
  const totals = await page.locator("form dd").allTextContents();
  const [net, vat, gross] = totals.map((text) =>
    Math.round(Number(text.replaceAll(",", "")) * 100),
  );
  const { products } = await (await page.request.get("/api/products")).json();
  const unitPrices = new Map<string, number>(
    products.map((product: { warehouseSku: string; warehouseNetUnitSatang: number }) => [
      product.warehouseSku,
      product.warehouseNetUnitSatang,
    ]),
  );
  const selectedIds = await selects.evaluateAll((buttons) =>
    buttons.map((button) => (button as HTMLButtonElement).value),
  );
  const selectedNames = await selects.allInnerTexts();
  expect(new Set(selectedNames).size).toBe(35);
  expect(net).toBe(
    selectedIds.reduce((sum, id, index) => sum + unitPrices.get(id)! * (index === 0 ? 2 : 1), 0),
  );
  expect(vat).toBe(Math.round((net * 7) / 100));
  expect(net + vat).toBe(gross);
  const pdf = await downloadQuotation(page, test.info().outputPath("quotation.pdf"));
  expect(pdf.getPageCount()).toBeGreaterThan(1);
});

test("legacy model codes remain pending instead of implying Warehouse compatibility", async ({
  page,
}) => {
  await page.goto("/service/quotation?model=Indicator-AW31");
  await expect(
    page.getByRole("button", { name: "นำ Indicator-AW31 ออก", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "พิมพ์ / บันทึก PDF" })).toBeDisabled();
});

test("unverified bundles price independent Warehouse SKU lines and replacements", async ({
  page,
  request,
}) => {
  const { products } = await (await request.get("/api/products")).json();
  const price = (sku: string) =>
    products.find((p: { warehouseSku: string }) => p.warehouseSku === sku).warehouseNetUnitSatang;
  await page.goto("/service/quotation?model=G107770&model=G106346");
  const items = page.getByRole("group", { name: "รายการสินค้า" });
  const first = items.getByRole("button", { name: /เลือกรุ่นสินค้ารายการที่ 1/ });
  await expect(first).toHaveAttribute("value", "G107770");
  await expect(items.getByRole("spinbutton")).toHaveCount(2);
  await expect(items).not.toContainText("รวมในราคาชุด");
  const net = async () =>
    Math.round(
      Number((await page.locator("form dd").first().innerText()).replaceAll(",", "")) * 100,
    );
  expect(await net()).toBe(price("G107770") + price("G106346"));
  await items.getByRole("spinbutton").nth(1).fill("2");
  expect(await net()).toBe(price("G107770") + price("G106346") * 2);
  await first.click();
  const picker = page.getByRole("dialog", { name: "เลือกรุ่นสินค้า" });
  await picker.getByRole("searchbox").fill("G106698");
  await picker.getByTitle("G106698", { exact: true }).click();
  await expect(first).toHaveText("WPS10KS");
  expect(await net()).toBe(price("G106698") + price("G106346") * 2);
  await items.getByRole("button", { name: "ลบรายการที่ 1" }).click();
  expect(await net()).toBe(price("G106346") * 2);
});
