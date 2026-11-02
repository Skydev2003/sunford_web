import { expect, test } from "@playwright/test";
import type { Product } from "@/features/catalog/types";

test("detail rows combine repeated labels and use dark text", async ({ page }) => {
  for (const slug of ["10639", "feh5ks"]) {
    await page.goto(`/products/${slug}`);
    for (const summary of await page.locator(".product-spec-group > summary").all())
      await summary.click();
    const table = page.locator(".product-attributes > table");
    await expect(
      table.getByRole("rowheader", { name: "รายละเอียดสินค้า", exact: true }),
    ).toHaveCount(0);
    await expect(table.getByRole("rowheader", { name: "รายละเอียด", exact: true })).toHaveCount(0);
    await expect(page.locator(".product-introduction")).toHaveCount(0);
    await expect(page.getByRole("list", { name: "จุดเด่นสินค้า" })).toBeVisible();
    const labels = await table.getByRole("rowheader").allTextContents();
    expect(new Set(labels.map((label) => label.trim())).size).toBe(labels.length);
    await expect(table.getByRole("cell").first()).toHaveCSS("color", "rgb(29, 29, 31)");
    await expect(table.getByRole("rowheader").first()).toHaveCSS("font-weight", "600");
    if (slug === "10639") {
      const display = table
        .getByRole("row")
        .filter({ has: page.getByRole("rowheader", { name: "จอแสดงผล", exact: true }) });
      await expect(display).toHaveCount(1);
      await expect(display).toContainText("2 ด้าน");
      await expect(display).toContainText("LCD");
    }
    if (slug === "feh5ks") {
      const units = table
        .getByRole("row")
        .filter({ has: page.getByRole("rowheader", { name: "แสดงหน่วยน้ำหนัก", exact: true }) });
      await expect(units).toHaveCount(1);
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(units.getByRole("cell")).toHaveText(/^\(g,\s*Kg\)\s*$/);
        await expect(units.getByRole("rowheader")).not.toContainText("(");
        await units.screenshot({ path: test.info().outputPath(`weight-units-${width}.png`) });
      }
    }
  }
});

test("product content groups complete specifications into expandable two-column tables", async ({
  page,
}) => {
  await page.goto("/products/10639");
  const details = page.locator(".product-information");
  await expect(details.locator(":scope > .section-heading > h2")).toHaveText("รายละเอียดสินค้า");
  await expect(page.getByRole("heading", { name: "ข้อมูลทางเทคนิค", exact: true })).toHaveCount(0);
  const groups = details.locator(".product-spec-group");
  expect(await groups.count()).toBeGreaterThan(3);
  await expect(details.locator(".product-spec-group[open]")).toHaveCount(0);
  for (const summary of await groups.locator("summary").all()) await summary.click();
  const table = details.locator(".product-spec-groups");
  expect(await table.locator("table > tbody > tr").count()).toBeGreaterThan(20);
  await expect(table.getByRole("rowheader", { name: "เหมาะสำหรับ", exact: true })).toBeVisible();
  await expect(table.getByRole("row").filter({ hasText: "พิกัดน้ำหนักสูงสุด" })).toContainText(
    "30kg",
  );
  await expect(table).toContainText("10,000");
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const label = (await table.getByRole("rowheader").first().boundingBox())!;
    const value = (await table.getByRole("cell").first().boundingBox())!;
    expect(label.x + label.width).toBeLessThanOrEqual(value.x + 1);
    expect(label.width / (label.width + value.width)).toBeCloseTo(width <= 720 ? 0.38 : 0.34, 2);
    await expect(details.locator(".product-introduction")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    if (width !== 320) {
      await details.screenshot({ path: test.info().outputPath(`details-table-${width}.png`) });
    }
  }
});

test("each product category uses its own content in the shared detail layout", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const response = await request.get("/api/products");
  expect(response.ok()).toBe(true);
  const { products } = (await response.json()) as { products: Product[] };
  const representatives = [
    ...new Map(products.map((product) => [product.category, product])).values(),
  ];
  for (const product of representatives) {
    await page.goto(`/products/${encodeURIComponent(product.slug)}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(product.name);
    const highlights = page.getByRole("list", { name: "จุดเด่นสินค้า" }).getByRole("listitem");
    expect(await highlights.count()).toBeLessThanOrEqual(6);
    if (product.subtitle.length <= 160)
      await expect(highlights.first()).toHaveText(product.subtitle);
    await expect(page.locator(".spec-list")).toHaveCount(0);
    for (const value of await page.locator(".detail-weighing td").allTextContents()) {
      expect(value.trim()).not.toMatch(/^[-–—]?$|^ไม่ระบุ$/);
    }
    const image = (await page.locator(".detail-image").boundingBox())!;
    const copy = (await page.locator(".detail-copy").boundingBox())!;
    expect(image.x + image.width).toBeLessThan(copy.x);
    expect(Math.abs(image.y - copy.y)).toBeLessThan(1);
    const inquiry = page.getByRole("link", { name: "สอบถามราคาและรายละเอียด", exact: true });
    await expect(inquiry).toBeVisible();
    expect(await inquiry.getAttribute("href")).toMatch(/^https:\/\//);
    await expect(page.locator(".detail-service")).toHaveCount(0);
    await expect(page.locator(".product-introduction")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "รายละเอียดสินค้า", exact: true }),
    ).toBeVisible();
    if (product.price != null) {
      await expect(page.locator(".detail-price")).toContainText(
        new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(
          product.price,
        ),
      );
    }
  }
});

test("concise product preview shows source features and real capacity without empty rows", async ({
  page,
}) => {
  await page.goto("/products/10639");
  const preview = page.locator(".detail-copy");
  await expect(preview).toHaveCSS("background-color", "rgb(255, 255, 255)");
  const highlights = preview.getByRole("list", { name: "จุดเด่นสินค้า" });
  await expect(highlights).toContainText("10,000");
  await expect(highlights).toContainText("LCD");
  await expect(highlights).toContainText("2 ด้าน");
  await expect(highlights).not.toContainText("IP68");
  const table = preview.getByRole("table", { name: "พิกัดและค่าอ่านละเอียด" });
  await expect(table.locator("tbody tr")).toHaveCount(1);
  await expect(table.getByRole("cell")).toHaveText(["30 กิโลกรัม", "5/10 กรัม"]);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const cells = await table.getByRole("cell").all();
    const left = (await cells[0].boundingBox())!;
    const right = (await cells[1].boundingBox())!;
    expect(Math.abs(left.width - right.width)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    if (width !== 320)
      await preview.screenshot({ path: test.info().outputPath(`product-preview-${width}.png`) });
  }
  await page.goto("/products/10792");
  await expect(page.locator(".detail-weighing")).toHaveCount(0);
});

test("the reference product and long product names fit desktop, tablet and mobile", async ({
  page,
  request,
}) => {
  const { products } = (await (await request.get("/api/products")).json()) as {
    products: Product[];
  };
  const longest = products.reduce((current, product) =>
    product.name.length > current.name.length ? product : current,
  );
  for (const slug of ["10639", longest.slug]) {
    await page.goto(`/products/${encodeURIComponent(slug)}`);
    for (const width of [320, 390, 768, 932, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => document.fonts.ready);
      const image = (await page.locator(".detail-image").boundingBox())!;
      const copy = (await page.locator(".detail-copy").boundingBox())!;
      if (width <= 720) expect(copy.y).toBeGreaterThan(image.y + image.height);
      else expect(copy.x).toBeGreaterThan(image.x + image.width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      const inquiry = (await page.locator(".detail-inquiry").boundingBox())!;
      expect(inquiry.x).toBeGreaterThanOrEqual(0);
      expect(inquiry.x + inquiry.width).toBeLessThanOrEqual(width);
      if (slug === "10639" && [390, 932].includes(width)) {
        const main = (await page.locator(".product-detail").boundingBox())!;
        const grid = (await page.locator(".detail-grid").boundingBox())!;
        await page.screenshot({
          clip: { x: 0, y: main.y, width, height: grid.y + grid.height - main.y + 20 },
          path: test.info().outputPath(`product-detail-${width}.png`),
          animations: "disabled",
        });
      }
    }
  }
});
