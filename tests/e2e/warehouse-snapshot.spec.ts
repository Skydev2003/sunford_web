import { expect, test } from "@playwright/test";
import snapshot from "../../data/warehouse/products.json";
import { isPublicWarehouseSku } from "../../src/features/catalog/data/warehouse-products";

test("offline Warehouse supplies the directory, image and printable dated quotation", async ({
  page,
  request,
}) => {
  test.skip(
    process.env.WAREHOUSE_OFFLINE_QA !== "1",
    "Start the website with an unreachable Warehouse origin for this test",
  );
  const items = snapshot.items.filter((item) => isPublicWarehouseSku(item.sku));
  const response = await request.get("/api/products");
  expect(response.ok()).toBe(true);
  const { products } = await response.json();
  expect(products.map((p: { warehouseSku: string }) => p.warehouseSku).sort()).toEqual(
    items.map((i) => i.sku).sort(),
  );
  const image = items.find((item) => item.localImage)!;
  const picture = await request.get("/api/products/" + encodeURIComponent(image.sku) + "/image");
  expect(picture.ok()).toBe(true);
  expect(picture.headers()["content-type"]).toMatch(/^image\//);
  const item = items.find((i) => i.sku === "G-SET03")!;
  expect(
    products.find((p: { warehouseSku: string }) => p.warehouseSku === item.sku).warehouseCategoryId,
  ).toBe("scales");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/service/quotation");
  await expect(page.getByRole("status")).toContainText("ใช้ราคาที่บันทึกไว้");
  await page.getByLabel("ชื่อผู้ซื้อ / บริษัท").fill("ทดสอบข้อมูลที่บันทึก");
  await page.getByLabel("ที่อยู่", { exact: true }).fill("ที่อยู่ทดสอบ");
  await page.getByRole("combobox").first().selectOption(item.sku);
  await page.evaluate(() => {
    window.print = () => {};
  });
  await page.getByRole("button", { name: "พิมพ์ / บันทึก PDF" }).click();
  await page.emulateMedia({ media: "print" });
  const sheet = page.getByRole("article", { name: "ใบเสนอราคาสำหรับพิมพ์" });
  await expect(sheet).toContainText(item.sku);
  await expect(sheet).toContainText("ใช้ราคาที่บันทึกไว้");
  await expect(sheet.locator("dd").first()).toHaveText(
    item.sale_price!.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  );
  await page.pdf({ path: test.info().outputPath("saved-quotation.pdf"), preferCSSPageSize: true });
});
