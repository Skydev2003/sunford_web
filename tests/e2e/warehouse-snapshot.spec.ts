import { expect, test } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import {
  readWarehouseProducts,
  closeWarehousePool,
} from "../../src/features/services/warehouse-postgres";
import { isPublicWarehouseSku } from "../../src/features/catalog/data/warehouse-products";

loadEnvConfig(process.cwd(), true);
test.afterAll(() => closeWarehousePool());

test("direct PostgreSQL supplies current catalog, image and fresh dated quotation without Warehouse API", async ({
  page,
  request,
}) => {
  const current = await readWarehouseProducts();
  const items = current.items.filter((item) => isPublicWarehouseSku(item.sku));
  const response = await request.get("/api/products");
  expect(response.ok()).toBe(true);
  const { products } = await response.json();
  expect(products.map((p: { warehouseSku: string }) => p.warehouseSku).sort()).toEqual(
    items.map((i) => i.sku).sort(),
  );
  const image = items.find((item) => item.image_url)!;
  const picture = await request.get("/api/products/" + encodeURIComponent(image.sku) + "/image");
  expect(picture.ok()).toBe(true);
  expect(picture.headers()["content-type"]).toMatch(/^image\//);
  const item = items.find((i) => i.sku === "G-SET03")!;
  expect(
    products.find((p: { warehouseSku: string }) => p.warehouseSku === item.sku).warehouseCategoryId,
  ).toBe("scales");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/service/quotation");
  await expect(page.getByLabel("ชื่อผู้ซื้อ / บริษัท")).toBeVisible();
  await expect(
    page.getByText(/ราคาจาก Warehouse อัปเดต ณ|กรอกข้อมูลของคุณและเลือกสินค้า/),
  ).toHaveCount(0);
  await page.getByLabel("ชื่อผู้ซื้อ / บริษัท").fill("ทดสอบข้อมูลที่บันทึก");
  await page.getByLabel("ที่อยู่", { exact: true }).fill("ที่อยู่ทดสอบ");
  await page.locator("form select").first().selectOption(item.sku);
  await expect(page.locator("form dd").first()).toHaveText(
    item.sale_price!.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  );
  await page.evaluate(() => {
    window.print = () => {
      document.documentElement.dataset.printed = "true";
    };
  });
  await page.getByRole("button", { name: "พิมพ์ / บันทึก PDF" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-printed", "true");
});
