import { expect, test } from "@playwright/test";
import type { Product } from "@/features/catalog/types";
import { relatedProducts } from "@/features/catalog/data/related-products";
import { catalogProductGroup } from "@/features/catalog/data/catalog-supplements";
import { buyingGuides } from "@/features/content/data/buying-guides";

test("inline specifications preserve Warehouse values and open one group at a time", async ({
  page,
  request,
}) => {
  const { products }: { products: Product[] } = await (await request.get("/api/products")).json();
  const p = products.find((p) => p.warehouseSku === "G106438")!;
  await page.goto(`/products/${p.slug}`, { waitUntil: "domcontentloaded" });
  const specs = page.locator("#product-specifications");
  const buttons = specs.locator("article > button");
  const visible = specs.locator("dl:visible");
  await expect(buttons.first()).toHaveAttribute("aria-expanded", "true");
  await expect(visible).toHaveCount(1);
  await expect(buttons.first()).toBeEnabled();
  const all = new Map<string, string>();
  for (const [index, button] of (await buttons.all()).entries()) {
    if (index > 0) await button.press("Enter");
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(visible).toHaveCount(1);
    for (const [key, value] of await visible
      .locator(":scope > div")
      .evaluateAll((rows) =>
        rows.map((row) => [
          row.querySelector("dt")!.textContent!.trim(),
          row.querySelector("dd")!.textContent!.trim(),
        ]),
      )) {
      expect(all.has(key)).toBe(false);
      all.set(key, value);
    }
  }
  const usage = specs.getByRole("button", { name: "คุณสมบัติและการใช้งาน", exact: true });
  await usage.click();
  await expect(usage).toHaveAttribute("aria-expanded", "true");
  const label = visible.locator("dt").first();
  const value = visible.locator("dd").first();
  const longValue = visible
    .locator(":scope > div")
    .filter({
      has: page.locator("dt", { hasText: "จุดเด่นสินค้า" }),
    })
    .locator(".product-plain-value");
  await expect(longValue).toBeVisible();

  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(usage).toHaveCSS("color", "rgb(29, 29, 31)");
    await expect(usage).toHaveCSS("font-size", "21px");
    await expect(usage).toHaveCSS("font-weight", "600");
    await expect(usage).toHaveCSS("line-height", "31px");
    await expect(label).toHaveCSS("color", "rgb(96, 96, 102)");
    await expect(label).toHaveCSS("font-size", "12px");
    await expect(label).toHaveCSS("line-height", "18px");
    await expect(label).toHaveCSS("font-weight", "400");
    await expect(value).toHaveCSS("color", "rgb(29, 29, 31)");
    await expect(value).toHaveCSS("font-size", "15px");
    await expect(value).toHaveCSS("font-weight", "400");
    await expect(value).toHaveCSS("margin-top", "2px");
    await expect(longValue).toHaveCSS("color", "rgb(29, 29, 31)");
    await expect(longValue).toHaveCSS("font-size", "15px");
    await expect(longValue).toHaveCSS("line-height", "22px");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await visible.locator("..").screenshot({
      path: test.info().outputPath(`spec-typography-${width}.png`),
      animations: "disabled",
    });
  }
  await usage.press("Space");
  await expect(usage).toBeFocused();
  await expect(visible).toHaveCount(0);
  await expect(specs.locator("dialog")).toHaveCount(0);
  for (const row of p.warehouseSpecifications ?? []) {
    if (/เอกสาร|ดาวน์โหลด/.test(row.label)) expect(all.has(row.label)).toBe(false);
    else
      expect(all.get(row.label)?.replace(/\s/g, ""), row.label).toContain(
        row.value.replace(/\s/g, ""),
      );
  }
});

test("each product group keeps its published related models and guide", async ({
  page,
  request,
}) => {
  const { products }: { products: Product[] } = await (await request.get("/api/products")).json();
  for (const family of new Set(products.map(catalogProductGroup))) {
    const p = products.find((p) => catalogProductGroup(p) === family)!;
    await page.goto(`/products/${p.slug}`);
    const main = page.locator("main.product-detail");
    await expect(main.getByRole("heading", { level: 1 })).toHaveText(p.name);
    const cards = main.locator(".related-products article");
    const expected = relatedProducts(p, products);
    await expect(cards).toHaveCount(expected.length);
    for (const [i, item] of expected.entries())
      await expect(cards.nth(i).getByRole("link")).toHaveAttribute(
        "href",
        `/products/${item.slug}`,
      );
    const guide = buyingGuides.find((g) => g.productHref === family);
    if (guide)
      await expect(main.getByRole("link", { name: "อ่านคู่มือ" })).toHaveAttribute(
        "href",
        `/guides/${guide.slug}`,
      );
    else await expect(main.getByRole("link", { name: "อ่านคู่มือ" })).toHaveCount(0);
    if (p.warehouseSku) await expect(main.locator("[data-product-videos]")).toHaveCount(0);
  }
});

test("long product names, sparse duplicate models and non-weighing products use only their own fields", async ({
  page,
  request,
}) => {
  const { products }: { products: Product[] } = await (await request.get("/api/products")).json();
  const longest = products.reduce((a, b) => (a.name.length > b.name.length ? a : b));
  const cases = [
    longest,
    ...products.filter((p) => ["G106005", "G106834", "G108012"].includes(p.warehouseSku ?? "")),
  ];
  for (const p of cases) {
    await page.goto(`/products/${p.slug}`);
    const main = page.locator("main.product-detail");
    await expect(main.locator("h1")).toHaveText(p.name);
    await expect(main.locator(".detail-copy")).toContainText(p.warehouseSku!);
    await expect(main.locator(".product-gallery")).toHaveCount(p.warehouseCard?.image ? 1 : 0);
    if (!p.warehouseCard?.capacity && !p.warehouseCard?.readability)
      await expect(main.getByRole("button", { name: "ค่าละเอียดคืออะไร" })).toHaveCount(0);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      const box = await main.locator(".detail-inquiry").boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
  }
});
