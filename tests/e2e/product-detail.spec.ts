import { expect, test } from "@playwright/test";
import type { Product } from "@/features/catalog/types";

test("detail rows combine repeated labels and use dark text", async ({ page }) => {
  for (const slug of ["10639", "feh5ks"]) {
    await page.goto(`/products/${slug}`);
    const table = page.locator(".product-attributes > table");
    await expect(
      table.getByRole("rowheader", { name: "รายละเอียดสินค้า", exact: true }),
    ).toHaveCount(0);
    await expect(table.getByRole("rowheader", { name: "รายละเอียด", exact: true })).toHaveCount(0);
    const introduction = page.locator(".product-introduction");
    await expect(introduction).toBeVisible();
    await expect(introduction).toHaveCSS("color", "rgb(29, 29, 31)");
    if (slug === "feh5ks") {
      await expect(introduction).toContainText("เบสเซลเลอร์สำหรับครัวร้านอาหารและเบเกอรี่!");
      await expect(introduction).toContainText("SUNFORD CONNECT");
      await expect(introduction).toContainText("จอแสดงผล LCD ขนาดใหญ่ อ่านง่าย");
    }
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

test("product content uses one detail heading and a two-column attribute table", async ({
  page,
}) => {
  await page.goto("/products/10639");
  const details = page.locator(".product-information");
  await expect(details.getByRole("heading")).toHaveText(["รายละเอียดสินค้า"]);
  await expect(page.getByRole("heading", { name: "ข้อมูลทางเทคนิค", exact: true })).toHaveCount(0);
  const table = details.getByRole("table", { name: "รายละเอียดสินค้า", exact: true });
  expect(await table.locator(":scope > tbody > tr").count()).toBeGreaterThan(20);
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
    expect(label.width / (label.width + value.width)).toBeCloseTo(0.5, 2);
    const introduction = (await details.locator(".product-introduction").boundingBox())!;
    const tableBounds = (await table.boundingBox())!;
    expect(introduction.y + introduction.height).toBeLessThan(tableBounds.y);
    expect(introduction.width).toBeGreaterThanOrEqual(tableBounds.width);
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
    await expect(page.locator(".detail-subtitle")).toHaveText(product.subtitle);
    await expect(page.locator(".spec-list dt")).toHaveText([
      "น้ำหนัก",
      "ค่าละเอียด",
      "เหมาะสำหรับ",
      "หน้าจอแสดงผล",
      "หน่วยความจำ",
      "การพิมพ์ฉลาก",
      "การเชื่อมต่อระบบ",
      "วัสดุและความทนทาน",
    ]);
    for (const value of await page.locator(".spec-list dd").allTextContents()) {
      expect(value.trim()).not.toBe("");
    }
    const image = (await page.locator(".detail-image").boundingBox())!;
    const copy = (await page.locator(".detail-copy").boundingBox())!;
    expect(image.x + image.width).toBeLessThan(copy.x);
    expect(Math.abs(image.y - copy.y)).toBeLessThan(1);
    const inquiry = page.getByRole("link", { name: "สอบถามราคาและรายละเอียด", exact: true });
    await expect(inquiry).toBeVisible();
    expect(await inquiry.getAttribute("href")).toMatch(/^https:\/\//);
    const website = page.locator(".detail-service .source-link");
    await expect(website).toHaveAttribute(
      "href",
      "https://sunfordshop.com/%E0%B8%AB%E0%B8%99%E0%B9%89%E0%B8%B2%E0%B8%AB%E0%B8%A5%E0%B8%B1%E0%B8%81",
    );
    await expect(website).toHaveAttribute("target", "_blank");
    await expect(page.locator(".detail-copy .product-introduction")).toHaveCount(0);
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
      if (slug === "10639" && [390, 1440].includes(width)) {
        await page.locator(".detail-service").screenshot({
          path: test.info().outputPath(`product-contact-${width}.png`),
          animations: "disabled",
        });
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      }
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
