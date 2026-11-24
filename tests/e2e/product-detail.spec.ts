import { expect, test } from "@playwright/test";
import type { Product } from "@/features/catalog/types";
import { relatedProducts } from "@/features/catalog/data/related-products";
import { catalogProductGroup } from "@/features/catalog/data/catalog-supplements";
import { catalogFieldValue } from "@/features/catalog/data/catalog-decision-facts";
import { buyingGuideHref, buyingGuides } from "@/features/content/data/buying-guides";

test("non-scale specifications preserve Warehouse values and open one group at a time", async ({
  page,
  request,
}) => {
  const { products }: { products: Product[] } = await (await request.get("/api/products")).json();
  const p = products.find((p) => p.warehouseSku === "G107770")!;
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

test("scale specifications use page scrolling with a pinned photo and compact heading", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/products/warehouse-G106094");
  const main = page.locator("main.product-detail");
  const photo = main.locator(".detail-image");
  const panel = main.getByRole("region", { name: "รายละเอียดเครื่องชั่ง", exact: true });
  const specs = main.getByRole("region", { name: "สเปกสินค้า", exact: true });
  const compactLabel = panel.getByText("สเปกสินค้า", { exact: true });
  await expect(panel.getByRole("heading", { level: 1 })).toHaveText("ACS-30-JC21");
  await expect(compactLabel).toBeHidden();
  await expect(photo.locator("img")).toHaveAttribute("src", /acs30-jc21-pdp/);
  const before = await photo.boundingBox();
  expect(before).toEqual({ x: 64, y: 144, width: 688, height: 558 });
  expect(await photo.locator("img").evaluate((image) => image.getAnimations().length)).toBe(0);

  await expect(panel).toHaveCSS("overflow-y", "visible");
  await page.mouse.move(1100, 460);
  await page.mouse.wheel(0, 180);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await expect(compactLabel).toBeVisible();
  const compactHeader = compactLabel.locator("..");
  expect(await compactHeader.boundingBox()).toMatchObject({ y: 96, height: 56 });
  expect(await panel.evaluate((node) => node.scrollTop)).toBe(0);
  expect(await photo.boundingBox()).toEqual({ ...before, y: 96 });

  await main.getByRole("link", { name: "ดูสเปก", exact: true }).click();
  await expect(specs).toBeFocused();
  await expect.poll(async () => Math.round((await specs.boundingBox())!.y)).toBe(166);
  expect(await photo.boundingBox()).toEqual({ ...before, y: 96 });
  await expect(specs.getByText("200 กรัม", { exact: true })).toBeInViewport();
  await expect(specs.getByText("ละเอียด 5 กรัม", { exact: true })).toBeVisible();

  const related = main.getByRole("heading", { name: "สินค้าในหมวดเดียวกัน", exact: true });
  await page.mouse.move(1100, 460);
  await page.mouse.wheel(0, (await related.boundingBox())!.y - 100);
  await expect(related).toBeInViewport();
  expect((await photo.boundingBox())!.y).toBeLessThan(96);
  expect(await panel.evaluate((node) => node.scrollTop)).toBe(0);

  await page.setViewportSize({ width: 1440, height: 720 });
  await page.evaluate(() => window.scrollTo({ top: 130, behavior: "instant" }));
  expect((await photo.boundingBox())!.height).toBe(488);
  await expect(main.getByRole("link", { name: "การรับประกันและบริการ" })).toBeInViewport({
    ratio: 1,
  });

  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(compactLabel).toBeHidden();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const photoTop = (await photo.boundingBox())!.y;
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: "instant" }));
    expect((await photo.boundingBox())!.y).toBeCloseTo(photoTop - 300, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
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
    const model =
      family === "/products"
        ? catalogFieldValue(
            p.warehouseSpecifications?.find((row) => row.label === "รุ่นสินค้า")?.value,
          )
        : undefined;
    await expect(main.getByRole("heading", { level: 1 })).toHaveText(model ?? p.name);
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
        buyingGuideHref(guide.slug),
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
    const model =
      catalogProductGroup(p) === "/products"
        ? catalogFieldValue(
            p.warehouseSpecifications?.find((row) => row.label === "รุ่นสินค้า")?.value,
          )
        : undefined;
    await expect(main.locator("h1")).toHaveText(model ?? p.name);
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
