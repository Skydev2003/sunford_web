import { expect, test } from "@playwright/test";
import type { Product } from "@/features/catalog/types";

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
