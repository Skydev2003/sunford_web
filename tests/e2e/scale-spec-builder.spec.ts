import { expect, test } from "@playwright/test";
import { pricedProducts, quoteModelKey } from "../../src/features/catalog/data/quotation";
import { getWeighingOptions } from "../../src/features/content/data/weighing-options";

for (const width of [390, 1440]) {
  test(`Scales Navbar selects a scale and an accessory before opening the quote at ${width}px`, async ({
    page,
    request,
  }) => {
    const { products } = await (await request.get("/api/products")).json();
    const items = pricedProducts(products);
    const presetCodes = new Set(getWeighingOptions(products).map(({ code }) => code));
    const scale = items.find(
      ({ id, categoryId }) => categoryId === "scales" && !presetCodes.has(id),
    )!;
    const accessory = items.find(
      ({ name, categoryId }) =>
        categoryId === "accessories" && quoteModelKey(name) !== quoteModelKey(scale.name),
    )!;
    expect(scale).toBeDefined();
    expect(accessory).toBeDefined();

    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-enhanced", "true");
    const nav = page.locator(".site-header:visible");
    if (width < 1024) {
      await nav.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      await nav.getByRole("button", { name: "เปิดเมนูย่อยเครื่องชั่ง", exact: true }).click();
    } else {
      await nav.getByRole("link", { name: "เครื่องชั่ง", exact: true }).press("ArrowDown");
    }
    const panel = nav.locator('[data-nav-menu="/scales"]');
    const columns = panel.locator("[data-nav-column]");
    await expect(columns.locator(":scope > p")).toHaveText(["สินค้า", "คุณสมบัติ", "ช่วยเหลือ"]);
    await expect(
      columns.nth(0).getByRole("link", { name: "จัดสเปค", exact: true }),
    ).toHaveAttribute("href", "/scales/custom-spec");
    await expect(columns.nth(1).getByRole("link")).toHaveText([
      "เชื่อมต่ออุปกรณ์",
      "กันน้ำกันฝุ่น",
      "คำนวณราคา",
      "นับจำนวน",
      "เตือนน้ำหนักขาดเกิน",
    ]);
    await expect(
      columns.nth(2).getByRole("link", { name: "เลือกซื้อที่ร้านออนไลน์", exact: true }),
    ).toHaveAttribute("href", "https://sunfordshop.com/");
    await columns.nth(2).getByRole("link", { name: "ขอใบเสนอราคา", exact: true }).click();

    await expect(page).toHaveURL("/scales/custom-spec");
    const picker = page.getByRole("combobox", { name: "ประเภทสินค้า" });
    await expect(picker.getByRole("option")).toHaveText(["เครื่องชั่ง", "อุปกรณ์เสริม"]);
    const quote = page.getByRole("complementary", { name: "สินค้าที่เลือก" });
    await expect(quote.getByRole("button", { name: "ไปที่ใบเสนอราคา" })).toBeDisabled();
    const search = page.getByRole("searchbox", { name: "ค้นหาชื่อรุ่นหรือ SKU" });
    await search.fill(scale.id);
    await page.getByRole("button", { name: `เลือก ${scale.id}`, exact: true }).click();
    await expect(quote).toContainText("1 รายการ");
    await picker.selectOption("accessories");
    await search.fill(accessory.id);
    await page.getByRole("button", { name: `เลือก ${accessory.id}`, exact: true }).click();
    await expect(quote).toContainText("2 รายการ");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );

    await quote.getByRole("link", { name: "ไปที่ใบเสนอราคา" }).click();
    await expect(page).toHaveURL(/\/service\/quotation\?selection=/, { timeout: 20_000 });
    const quoteUrl = new URL(page.url());
    expect([...quoteUrl.searchParams.keys()]).toEqual(["selection"]);
    expect(quoteUrl.search).not.toContain(scale.id);
    expect(quoteUrl.search).not.toContain(accessory.id);
    const rows = page.getByRole("button", { name: /^เลือกรุ่นสินค้ารายการที่/ });
    await expect(rows).toHaveCount(2);
    expect(
      (await rows.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("value")))).sort(),
    ).toEqual([scale.id, accessory.id].sort());
    await page.goBack();
    await expect(quote).toContainText("2 รายการ");
  });
}
