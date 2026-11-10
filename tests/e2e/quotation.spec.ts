import { expect, test } from "@playwright/test";

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
  if ((await page.getByRole("combobox").count()) === 0) {
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
  const selects = page.getByRole("combobox");
  await expect(selects.first()).toBeVisible();
  await page.getByLabel("ชื่อผู้ซื้อ / บริษัท").fill("ผู้ซื้อทดสอบ");
  await page.getByLabel("ที่อยู่", { exact: true }).fill("ที่อยู่สำหรับทดสอบ");
  await selects.first().selectOption({ index: 1 });
  await page.getByRole("spinbutton").first().fill("2");
  const unit = Number(
    (await page.locator("form small").first().locator("..").innerText())
      .split("\n")
      .at(-1)
      ?.replaceAll(",", ""),
  );
  for (let i = 0; i < 34; i++) {
    await page.getByRole("button", { name: "เพิ่มรายการสินค้า" }).click();
    await selects.last().selectOption({ index: 1 });
  }
  await page.evaluate(() => {
    window.print = () => {
      document.documentElement.dataset.printed = "true";
    };
  });
  await page.getByRole("button", { name: "พิมพ์ / บันทึก PDF" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-printed", "true");
  await page.emulateMedia({ media: "print" });
  const sheet = page.getByRole("article", { name: "ใบเสนอราคาสำหรับพิมพ์" });
  await expect(sheet).toContainText("ผู้ซื้อทดสอบ");
  await expect(sheet.locator("tbody tr")).toHaveCount(35);
  const totals = await sheet.locator("dd").allTextContents();
  const [net, vat, gross] = totals.map((text) =>
    Math.round(Number(text.replaceAll(",", "")) * 100),
  );
  expect(net).toBe(36 * Math.round(unit * 100));
  expect(vat).toBe(Math.round((net * 7) / 100));
  expect(net + vat).toBe(gross);
  await expect(page.locator("form")).toBeHidden();
  await expect(page.locator("header:visible, footer:visible")).toHaveCount(0);
  const pdf = await page.pdf({
    path: test.info().outputPath("quotation.pdf"),
    preferCSSPageSize: true,
    printBackground: true,
  });
  expect(pdf.toString("latin1").match(/\/Type\s*\/Page\b/g)?.length).toBeGreaterThan(1);
});
for (const platformFirst of [false, true]) {
  test(`quotation requires both components and accessories are optional (platform first: ${platformFirst})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: platformFirst ? 390 : 1440, height: 900 });
    await page.goto("/guides/indicator-platform-compatibility");
    const summary = page.locator("main aside");
    const disabled = summary.getByRole("button", { name: "ทำใบเสนอราคา", exact: true });
    const link = summary.getByRole("link", { name: /ทำใบเสนอราคา/ });
    const models = platformFirst
      ? ["TMS-60-AW31", "Indicator-AW31"]
      : ["Indicator-AW31", "TMS-60-AW31"];
    await expect(disabled).toBeDisabled();
    if (platformFirst) await summary.getByRole("button", { name: "แท่นชั่ง", exact: true }).click();
    await page.getByRole("button", { name: `เลือก ${models[0]}`, exact: true }).click();
    await expect(disabled).toBeDisabled();
    await expect(link).toHaveCount(0);
    await page.getByRole("button", { name: `เลือก ${models[1]}`, exact: true }).click();
    const popup = page.waitForEvent("popup");
    await link.click();
    const quote = await popup;
    await expect(quote.getByRole("heading", { name: "ใบเสนอราคา", exact: true })).toBeVisible({
      timeout: 20000,
    });
    expect(new URL(quote.url()).searchParams.getAll("model")).toEqual(models);
    await quote.close();
    await summary.getByRole("button", { name: `นำ ${models[0]} ออกจากชุด`, exact: true }).click();
    await expect(disabled).toBeDisabled();
    await expect(link).toHaveCount(0);
  });
}
test("builder quotation opens with the current selection and preserves the set", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/guides/indicator-platform-compatibility");
  const summary = page.locator("main aside");
  const cta = summary.getByRole("link", { name: /ทำใบเสนอราคา/ });
  await expect(cta).toHaveCount(0);
  for (const code of ["Indicator-AW31", "TMS-60-AW31", "LoadcellCable", "RS2321M2F"]) {
    await page.getByRole("button", { name: `เลือก ${code}`, exact: true }).click();
  }
  await summary.getByRole("button", { name: "นำ RS2321M2F ออกจากชุด", exact: true }).click();
  const opened = page.waitForEvent("popup");
  await cta.click();
  const quote = await opened;
  await expect(quote.getByRole("heading", { name: "ใบเสนอราคา", exact: true })).toBeVisible({
    timeout: 20000,
  });
  expect(new URL(quote.url()).searchParams.getAll("model")).toEqual([
    "Indicator-AW31",
    "TMS-60-AW31",
    "LoadcellCable",
  ]);
  await expect(quote.locator("fieldset").last()).toContainText("G106308");
  const selectedLabels = await quote
    .locator("form li span, form select option:checked")
    .allTextContents();
  expect(selectedLabels.join(" ")).toContain("TMS-60-AW31");
  expect(selectedLabels.join(" ")).toMatch(/Loadcell Cable/i);
  expect(selectedLabels.join(" ")).not.toContain("G107770");
  await expect(quote.getByRole("button", { name: "พิมพ์ / บันทึก PDF" })).toBeEnabled();
  await expect(quote.getByLabel("ชื่อผู้ซื้อ / บริษัท")).toHaveValue("");
  await quote.close();
  await expect(summary).toContainText("TMS-60-AW31");
});
