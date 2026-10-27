import { expect, test } from "@playwright/test";
import { load } from "cheerio";
import type { Product } from "@/features/catalog/types";
import sourceProducts from "../../src/features/content/data/products.json";

test("every published product renders complete specification labels and values", async ({
  request,
}, testInfo) => {
  test.setTimeout(180000);
  const response = await request.get("/api/products");
  expect(response.ok()).toBe(true);
  const { products } = (await response.json()) as { products: Product[] };
  expect(products.length).toBeGreaterThan(0);
  const failures: string[] = [];
  let rowsChecked = 0;
  for (let start = 0; start < products.length; start += 4) {
    await Promise.all(
      products.slice(start, start + 4).map(async (product) => {
        const path = `/products/${encodeURIComponent(product.slug)}`;
        const page = await request.get(path);
        if (page.status() !== 200) {
          failures.push(`${path}: HTTP ${page.status()}`);
          return;
        }
        const $ = load(await page.text());
        const table = $(".product-attributes > table");
        if (table.length > 1) failures.push(`${path}: expected at most one details table`);
        if (!table.length) {
          // Some original products supply prose only. Verify those facts in full
          // rather than requiring a fabricated technical specification table.
          const source = sourceProducts.find((item) => item.sourceId === product.sourceId);
          const expected = load(
            product.media?.descriptionHtml ?? source?.descriptionHtml ?? product.description,
          )
            .text()
            .replace(/\s+/g, "");
          const actual = $(".product-information .product-introduction").text().replace(/\s+/g, "");
          if (!expected || !actual.includes(expected))
            failures.push(`${path}: incomplete source description`);
        }
        if ($(".product-information h2").text().trim() !== "รายละเอียดสินค้า")
          failures.push(`${path}: missing details heading`);
        table.find("> tbody > tr").each((_, row) => {
          const label = $(row).children("th").text().trim();
          const value = $(row).children("td").text().trim();
          rowsChecked++;
          if (
            !label ||
            /\d/.test(label) ||
            ["ร", "รับ", "ผ", "รับประกันคุณ", "รับประกัน", "เหมาะสำหรับใ"].includes(label)
          )
            failures.push(`${path}: incomplete label ${label}`);
          if ((label.match(/\(/g) ?? []).length !== (label.match(/\)/g) ?? []).length)
            failures.push(`${path}: split parentheses ${label}`);
          if (
            /^(ค่าน้ำหนัก|พิกัดน้ำหนักสูงสุด|ขนาด)/.test(label) &&
            /^(x|×|kg\b|กิโลกรัม)/i.test(value)
          )
            failures.push(`${path}: split numeric value ${label}: ${value}`);
        });
      }),
    );
    if ((start + 4) % 40 === 0 || start + 4 >= products.length)
      console.log(
        `Checked ${Math.min(start + 4, products.length)}/${products.length} product pages`,
      );
  }
  await testInfo.attach("catalogue-audit.json", {
    body: JSON.stringify({ productsChecked: products.length, rowsChecked, failures }, null, 2),
    contentType: "application/json",
  });
  expect(failures).toEqual([]);
});
