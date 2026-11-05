import { expect, test, type Locator } from "@playwright/test";
import { catalogProductGroup } from "../../src/features/catalog/data/catalog-supplements";
import type { Product } from "../../src/features/catalog/types";
import manifest from "../../src/features/catalog/data/scale-category-models.json";

const categories = [
  { label: "เครื่องชั่ง", path: "/products" },
  { label: "อินดิเคเตอร์แท่นชั่ง", path: "/Indicator" },
  { label: "โครงสร้างแท่นชั่ง", path: "/product/scale-platforms" },
  { label: "ระบบ POS", path: "/Product/POS" },
  { label: "อุปกรณ์เสริม", path: "/product/scale-accessories" },
];
const categoryName = (index: number) => categories[index - 1].label;
const scaleNames = [
  "เครื่องชั่งคำนวณราคาหน้าร้าน",
  "เครื่องชั่งอุตสาหกรรมงานผลิต",
  "เครื่องชั่งงานวิเคราะห์ความแม่นยำสูง",
  "เครื่องชั่งงานครัวและกาแฟ",
  "เครื่องชั่งกันน้ำและกันฝุ่น 100%",
  "เครื่องชั่งตั้งโต๊ะ",
  "เครื่องชั่งตั้งพื้น",
  "เครื่องชั่งมีเสา",
];
const hrefs = (region: Locator) =>
  region
    .locator("article > a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));

async function loadAll(region: Locator) {
  const more = region.getByRole("button", { name: /ดูเพิ่มเติม/ });
  while (await more.count()) {
    const count = await region.locator("article").count();
    await more.click();
    await expect.poll(() => region.locator("article").count()).toBeGreaterThan(count);
  }
}

test("five real families remain complete and eight children reproduce every document model", async ({
  page,
  request,
}) => {
  test.slow();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/products");
  const response = await request.get("/api/products");
  expect(response.ok()).toBe(true);
  const { products } = (await response.json()) as { products: Product[] };
  const published = products.filter((product) => catalogProductGroup(product));
  const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  await expect(region.getByRole("heading", { level: 1 })).toHaveText("ผลิตภัณฑ์ทั้งหมด");
  await expect(region.getByText("หมวดหมู่ย่อยบางหมวดยังเป็นตัวอย่าง")).toHaveCount(0);
  const navigation = region.getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true });
  await expect(navigation.getByRole("button")).toHaveText(categories.map((item) => item.label));
  expect(
    await navigation
      .getByRole("button")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("aria-label"))),
  ).toEqual(categories.map((item) => item.label));
  await expect(region.getByText("รอชื่อหมวดหมู่", { exact: true })).toHaveCount(0);
  await expect(region.getByRole("status")).toHaveText(`${published.length} รายการ`);
  await expect(region.locator("article")).toHaveCount(24);
  await region.getByRole("button", { name: /ดูเพิ่มเติม/ }).click();
  await expect(region.locator("article")).toHaveCount(48);
  await loadAll(region);
  const all = await hrefs(region);
  expect(new Set(all).size).toBe(published.length);
  expect([...all].sort()).toEqual(published.map((product) => `/products/${product.slug}`).sort());
  const parents: (string | null)[] = [];
  for (let index = 1; index <= 5; index++) {
    await region.getByRole("button", { name: categoryName(index), exact: true }).click();
    await expect(region.getByRole("heading", { level: 2 })).toHaveText(categoryName(index));
    await expect(
      region.getByText(/จัดหมวดตามรายการรุ่นที่ยืนยัน|หมวดหมู่ย่อยเป็นตัวอย่าง —/),
    ).toHaveCount(0);
    await loadAll(region);
    const parent = await hrefs(region);
    const expected = products.filter(
      (product) => catalogProductGroup(product) === categories[index - 1].path,
    );
    expect([...parent].sort()).toEqual(
      expected.map((product) => `/products/${product.slug}`).sort(),
    );
    await expect(region.getByRole("status")).toHaveText(
      new RegExp(`^${expected.length} รายการ(?: · .*)?$`),
    );
    parents.push(...parent);
    const children: (string | null)[] = [];
    const childNames = index === 1 ? scaleNames : ["หมวดย่อย 01", "หมวดย่อย 02"];
    await expect(
      region.getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" }).getByRole("button"),
    ).toHaveText(["ทั้งหมด", ...childNames]);
    for (const name of childNames) {
      const child = region.getByRole("button", { name, exact: true });
      await child.click();
      await expect(child).toHaveAttribute("aria-pressed", "true");
      await loadAll(region);
      const childHrefs = await hrefs(region);
      expect(childHrefs.every((href) => parent.includes(href))).toBe(true);
      if (index === 1) {
        const definition = manifest.categories.find((item) => item.label === name)!;
        const expectedModels = definition.groups
          .flatMap((group) => group.models)
          .flatMap((model) => (model === "WSS30KS" ? ["WSS30KS-LCD", "WSS30KS-LED"] : [model]))
          .map((model) =>
            model === "VB3000S HiCoFE"
              ? "VB3000S"
              : model === "Fitdays Smart Scale - FD1000"
                ? "FD1000"
                : model,
          );
        expect(await region.locator("article h3").allTextContents()).toEqual(expectedModels);
        const mocks = region.locator('article[data-mock-product="true"]');
        await expect(mocks.locator("a, button, img")).toHaveCount(0);
        for (const mock of await mocks.all())
          await expect(mock.getByText("Mock", { exact: true })).toBeVisible();
      }
      if (name === scaleNames[4]) {
        expect(childHrefs).toContain("/products/wps10ks");
        expect(childHrefs).not.toContain("/products/feh5ks");
        expect(childHrefs).not.toContain("/products/TSS-150-SW31S");
      }
      children.push(...childHrefs);
    }
    if (index === 1) {
      expect(children.length).toBeGreaterThan(new Set(children).size);
      expect(children).toContain("/products/10624");
      expect(parent).toContain("/products/10624");
    } else {
      expect(children.sort()).toEqual([...parent].sort());
      expect(new Set(children).size).toBe(parent.length);
    }
    expect(new URL(page.url()).pathname).toBe("/products");
  }
  expect(parents.sort()).toEqual([...all].sort());
  await region.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).click();
  await expect(region.locator("article")).toHaveCount(24);
  await expect(region.getByRole("button", { name: "ทั้งหมด", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(errors).toEqual([]);
});

test("parent changes reset children and search intersects with the selected demo group", async ({
  page,
  request,
}) => {
  await page.goto("/products");
  const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  await region.getByRole("button", { name: categoryName(1), exact: true }).click();
  await region.getByRole("button", { name: scaleNames[0], exact: true }).click();
  await loadAll(region);
  const childNames = await region.locator("article h3").allTextContents();
  const selectedName = childNames[0];
  await region.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill(selectedName);
  const matchingNames = await region.locator("article h3").allTextContents();
  expect(matchingNames).toContain(selectedName);
  expect(matchingNames.every((name) => childNames.includes(name))).toBe(true);
  await region.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("");
  await region.getByRole("button", { name: categoryName(2), exact: true }).click();
  await expect(region.getByRole("button", { name: "ทั้งหมด", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(region.getByRole("button", { name: "หมวดย่อย 01", exact: true })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await region.getByRole("button", { name: "สินค้าแนะนำ", exact: true }).click();
  await region.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("zzzz-no-product");
  await expect(region.getByRole("status")).toHaveText("0 รายการ");
  await expect(region.getByRole("heading", { name: "ยังไม่พบสินค้าที่คุณค้นหา" })).toBeVisible();
  await region.getByRole("button", { name: "ล้างตัวกรองทั้งหมด" }).click();
  await expect(region.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" })).toHaveValue("");
  await expect(region.getByRole("button", { name: "สินค้าแนะนำ", exact: true })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  const { products } = (await (await request.get("/api/products")).json()) as {
    products: Product[];
  };
  await expect(region.getByRole("status")).toHaveText(
    `${products.filter((product) => catalogProductGroup(product)).length} รายการ`,
  );
  await expect(region.locator("article")).toHaveCount(24);
  await region.getByRole("button", { name: /ดูเพิ่มเติม/ }).click();
  await region.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill(" ");
  await expect(region.locator("article")).toHaveCount(24);
  await region.getByRole("button", { name: categoryName(1), exact: true }).click();
  await region.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).click();
  await expect(region.locator("article")).toHaveCount(24);
});

test("missing document models are explicit mocks with no product links or comparison actions", async ({
  page,
}) => {
  await page.goto("/products");
  const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  await region.getByRole("button", { name: "เครื่องชั่ง", exact: true }).click();
  await region.getByRole("button", { name: scaleNames[3], exact: true }).click();
  await region.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("VL15000S");
  await expect(region.getByRole("status")).toHaveText("0 รายการ · 1 รุ่นตัวอย่าง (Mock)");
  const mock = region.locator('article[data-mock-product="true"]');
  await expect(mock.getByRole("heading", { name: "VL15000S", exact: true })).toBeVisible();
  await expect(mock.locator("a, button, img")).toHaveCount(0);
  await region.getByRole("button", { name: "เปรียบเทียบสินค้า", exact: true }).click();
  await expect(mock.locator("button")).toHaveCount(0);
  await expect(page.locator(".compare-bar strong")).toHaveText("0/3");
  await expect(page.getByRole("button", { name: "ดูการเปรียบเทียบ", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "ยกเลิกการเปรียบเทียบ", exact: true }).click();
  await region.getByRole("button", { name: "สินค้าแนะนำ", exact: true }).click();
  await expect(region.locator("article")).toHaveCount(0);
  await expect(region.getByRole("status")).toHaveText("0 รายการ");
  await region.getByRole("button", { name: "ล้างตัวกรองทั้งหมด" }).click();
  await expect(region.getByRole("status")).toHaveText("159 รายการ");
  await expect(region.locator('article[data-mock-product="true"]')).toHaveCount(0);
});

test("sorting, featured filtering and list view retain real product data", async ({ page }) => {
  await page.goto("/products");
  const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  await region.getByRole("button", { name: "สินค้าแนะนำ", exact: true }).click();
  const featured = await region.locator("article h3").allTextContents();
  expect(featured.length).toBeGreaterThan(0);
  expect(featured.length).toBeLessThan(24);
  expect(featured).toContain("WPS10KS");
  await region.getByRole("button", { name: "สินค้าแนะนำ", exact: true }).click();
  await region.getByRole("combobox", { name: "เรียงลำดับสินค้า" }).selectOption("name");
  const names = await region.locator("article h3").allTextContents();
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "th", { numeric: true })));
  await region.getByRole("combobox", { name: "เรียงลำดับสินค้า" }).selectOption("name-desc");
  const descending = await region.locator("article h3").allTextContents();
  expect(descending).toEqual(
    [...descending].sort((a, b) => b.localeCompare(a, "th", { numeric: true })),
  );
  expect(descending).not.toEqual(names);
  await region.getByRole("button", { name: "แสดงแบบรายการ" }).click();
  await expect(region.getByRole("button", { name: "แสดงแบบรายการ" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(
    await region
      .locator("#mock-product-results")
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length),
  ).toBe(1);
  await region.getByRole("button", { name: "แสดงแบบตาราง" }).click();
  expect(
    await region
      .locator("#mock-product-results")
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length),
  ).toBe(4);
});

test("comparison remains global across demo groups and enforces three products", async ({
  page,
}) => {
  await page.goto("/products");
  const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  await region.getByRole("button", { name: "เปรียบเทียบสินค้า", exact: true }).click();
  const add = region.getByRole("button", { name: /^เพิ่มเพื่อเปรียบเทียบ/ });
  for (let index = 0; index < 3; index++) await add.first().click();
  await expect(add.first()).toBeDisabled();
  await region.getByRole("button", { name: categoryName(5), exact: true }).click();
  await expect(
    region.getByRole("button", { name: /^เพิ่มเพื่อเปรียบเทียบ/ }).first(),
  ).toBeDisabled();
  await page.getByRole("button", { name: "ดูการเปรียบเทียบ", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "เปรียบเทียบสิ่งที่ใช่" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("table")).toContainText("WPS10KS");
  await expect(dialog.getByRole("table")).toContainText("ACS-30-JC21");
  await dialog.getByRole("button", { name: "ปิด", exact: true }).click();
  await expect(page.locator(".compare-bar")).toHaveCount(0);
  await region.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).click();
  await page.getByRole("button", { name: "ค้นหาสินค้า", exact: true }).click();
  const search = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" });
  await expect(search).toBeVisible();
  await search.getByRole("textbox").fill("WPS10KS");
  const link = search.locator(".search-results a").first();
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("WPS10KS");
});

test("existing category routes redirect to the replacement catalog", async ({ page }) => {
  await page.goto("/product/industrial");
  await expect(page).toHaveURL(/\/products$/);
  const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  await expect(region.getByRole("heading", { level: 1 })).toHaveText("ผลิตภัณฑ์ทั้งหมด");
  await expect(region.getByRole("combobox", { name: "เลือกตามหัวข้อ" })).toHaveCount(0);
  await expect(
    region.getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true }),
  ).toBeVisible();
});

for (const viewport of [
  { width: 320, height: 800, products: 2 },
  { width: 390, height: 844, products: 2 },
  { width: 768, height: 1024, products: 3 },
  { width: 844, height: 390, products: 3 },
  { width: 1440, height: 1000, products: 4 },
]) {
  test(`responsive controls, focus and product grid at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/products");
    await page.evaluate(() => document.fonts.ready);
    const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
    const categories = region.getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true });
    const first = categories.getByRole("button", { name: categoryName(1), exact: true });
    await first.focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("aria-pressed", "true");
    await expect(first).toBeFocused();
    expect(await first.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("solid");
    const geometry = await categories.evaluate((element) => {
      const buttons = [...element.querySelectorAll("button")];
      return {
        rows: new Set(buttons.map((button) => Math.round(button.getBoundingClientRect().y))).size,
        compact: buttons.every((button) => button.getBoundingClientRect().height <= 80),
        readable: buttons.every((button) => {
          const name = button.querySelector("strong")!;
          return name.scrollWidth <= name.clientWidth + 1;
        }),
        icons: buttons.every(
          (button) => button.querySelector("svg")!.getBoundingClientRect().width === 24,
        ),
        scrollable: element.scrollWidth > element.clientWidth + 1,
      };
    });
    expect(geometry).toEqual({
      rows: 1,
      compact: true,
      readable: true,
      icons: true,
      scrollable: viewport.width < 1100,
    });
    for (let index = 0; index < 4; index++) await page.keyboard.press("Tab");
    const last = categories.getByRole("button").last();
    await expect(last).toBeFocused();
    expect(
      await last.evaluate((element) => {
        const button = element.getBoundingClientRect();
        const nav = element.closest("nav")!.getBoundingClientRect();
        return button.left >= nav.left && button.right <= nav.right;
      }),
    ).toBe(true);
    await first.focus();
    const children = region.getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" });
    const childGeometry = await children.evaluate((element) => {
      const buttons = [...element.querySelectorAll("button")];
      return {
        count: buttons.length,
        rows: new Set(buttons.map((button) => Math.round(button.getBoundingClientRect().top))).size,
        singleLine: buttons.every((button) => getComputedStyle(button).whiteSpace === "nowrap"),
      };
    });
    expect(childGeometry).toEqual({ count: 9, rows: 1, singleLine: true });
    const forward = region.getByRole("button", { name: "เลื่อนหมวดย่อยไปทางขวา", exact: true });
    const backward = region.getByRole("button", { name: "เลื่อนหมวดย่อยไปทางซ้าย", exact: true });
    await forward.click();
    await expect.poll(() => children.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    await expect(children.getByRole("button", { name: "ทั้งหมด", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await backward.click();
    await expect.poll(() => children.evaluate((element) => element.scrollLeft)).toBe(0);
    const lastChild = children.getByRole("button").last();
    await children.getByRole("button").first().focus();
    for (let index = 0; index < 8; index++) await page.keyboard.press("Tab");
    await expect(lastChild).toBeFocused();
    expect(
      await lastChild.evaluate((element) => {
        const button = element.getBoundingClientRect();
        const track = element.parentElement!.getBoundingClientRect();
        return button.left >= track.left && button.right <= track.right;
      }),
    ).toBe(true);
    await page.keyboard.press("Enter");
    await expect(lastChild).toHaveAttribute("aria-pressed", "true");
    await region.getByRole("button", { name: categoryName(2), exact: true }).click();
    expect(await children.evaluate((element) => element.scrollLeft)).toBe(0);
    await first.click();
    expect(await children.evaluate((element) => element.scrollLeft)).toBe(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await forward.click();
    expect(await children.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    await backward.click();
    expect(await children.evaluate((element) => element.scrollLeft)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(
      await region
        .locator("#mock-product-results")
        .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length),
    ).toBe(viewport.products);
    await page.screenshot({
      path: test.info().outputPath(`catalog-${viewport.width}-top.png`),
    });
    const child = region.getByRole("button", { name: scaleNames[2], exact: true });
    await child.click();
    await expect(child).toHaveAttribute("aria-pressed", "true");
    await region.locator("article").first().scrollIntoViewIfNeeded();
    const image = region.locator("article img").first();
    await expect
      .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await page.screenshot({
      path: test.info().outputPath(`catalog-${viewport.width}-results.png`),
    });
    await region.getByRole("button", { name: "แสดงแบบรายการ" }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    for (const button of [first, child]) {
      await button.scrollIntoViewIfNeeded();
      expect(
        await button.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return element.contains(
            document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2),
          );
        }),
      ).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}
