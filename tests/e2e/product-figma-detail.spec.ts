import { expect, test } from "@playwright/test";
import { load } from "cheerio";
import type { Product } from "@/features/catalog/types";
import { formatBaht } from "@/features/catalog/data/price-format";
import { pricedProducts } from "@/features/catalog/data/quotation";
import { catalogProductGroup } from "@/features/catalog/data/catalog-supplements";
import { catalogFieldValue } from "@/features/catalog/data/catalog-decision-facts";

test("every catalog SKU resolves to its own official product main", async ({ request }) => {
  test.setTimeout(12 * 60_000);
  const { products }: { products: Product[] } = await (await request.get("/api/products")).json();
  expect(products.length).toBeGreaterThan(0);
  for (let i = 0; i < products.length; i += 4) {
    await Promise.all(
      products.slice(i, i + 4).map(async (product) => {
        const response = await request.get(`/products/${encodeURIComponent(product.slug)}`);
        try {
          expect(response.status(), product.slug).toBe(200);
          const $ = load(await response.text());
          const main = $("main#main-content.product-detail");
          expect(main.length, product.slug).toBe(1);
          const scale = catalogProductGroup(product) === "/products";
          const model = scale
            ? catalogFieldValue(
                product.warehouseSpecifications?.find((row) => row.label === "รุ่นสินค้า")?.value,
              )
            : undefined;
          expect(main.find("h1").text(), product.slug).toBe(model ?? product.name);
          expect(main.find("#scale-detail-scroll").length, product.slug).toBe(scale ? 1 : 0);
          expect(main.find(".detail-copy").text()).toContain(product.warehouseSku);
          expect(main.find(".detail-price").text()).toBe(
            product.price && product.price > 0 ? formatBaht(product.price) : "สอบถามราคา",
          );
          expect(main.find(".detail-inquiry").attr("href")).toMatch(
            /^https:\/\/(?:line\.me|lin\.ee)\//,
          );
          expect(main.find('a[href="/service/quotation"]').length).toBe(
            pricedProducts([product]).length,
          );
          expect(main.find(".product-gallery").length, product.slug).toBe(
            product.warehouseCard?.image ? 1 : 0,
          );
          expect(main.find('a[download], a[href*=".pdf" i], input[type="number"]').length).toBe(0);
          expect(main.text()).not.toMatch(
            /เพิ่มสินค้าในตะกร้า|ดาวน์โหลดเอกสาร|เอกสารและเวอร์ชันอ้างอิง/,
          );
          expect($("title").text()).toContain(product.name);
        } finally {
          await response.dispose();
        }
      }),
    );
  }
  expect((await request.get("/products/sunford-test-missing-pdp-42001")).status()).toBe(404);
  console.log(`Checked ${products.length} product routes`);
});

test("compare the current SKU with a related SKU and keep the existing quotation destination", async ({
  page,
}) => {
  await page.goto("/products/10643");
  const main = page.locator("main.product-detail");
  const current = await main.locator("h1").innerText();
  await main.getByRole("button", { name: "เปรียบเทียบสินค้า", exact: true }).click();
  const chooser = page.getByRole("dialog", { name: "เลือกรุ่นเพื่อเปรียบเทียบ" });
  const entry = chooser.getByRole("button").nth(1);
  const candidate = (await entry.innerText()).split("\n")[0];
  await entry.click();
  const table = page.getByRole("dialog", { name: "เปรียบเทียบสินค้า", exact: true });
  await expect(table.getByRole("columnheader").filter({ hasText: current })).toHaveCount(1);
  await expect(table.getByRole("columnheader").filter({ hasText: candidate })).toHaveCount(1);
  await page.keyboard.press("Escape");
  await main.getByRole("link", { name: "ขอใบเสนอราคา" }).click();
  await expect(page).toHaveURL(/\/service\/quotation$/);
  await page.goBack();
  await expect(main.locator("h1")).toHaveText(current);
});

test("an unavailable Warehouse photo collapses the gallery and disables zoom", async ({
  page,
  request,
}) => {
  const { products }: { products: Product[] } = await (await request.get("/api/products")).json();
  const item = products.find((p) => p.warehouseSku === "G106438")!;
  const photo = item.warehouseCard?.image;
  expect(photo).toBeTruthy();
  await page.route("**/_next/image?**", async (route) => {
    const url = new URL(route.request().url()).searchParams.get("url") ?? "";
    if (url === photo) await route.fulfill({ status: 404, body: "Missing photo" });
    else await route.continue();
  });
  await page.goto(`/products/${item.slug}`);
  const image = page.locator(".detail-image");
  await expect(image.locator("[data-product-image-placeholder]")).toBeVisible();
  await expect(page.getByRole("button", { name: /^ขยายรูป/ })).toHaveCount(0);
  expect((await image.boundingBox())!.height).toBeLessThanOrEqual(100);
});
