import { expect, test, type Locator } from "@playwright/test";
import { catalogProductGroup } from "../../src/features/catalog/data/catalog-supplements";
import type { Product } from "../../src/features/catalog/types";
import manifest from "../../src/features/catalog/data/scale-category-models.json";
import { platformSubcategoryDefinitions } from "../../src/features/catalog/data/platform-subcategories";
import { deduplicateConsumableSizes } from "../../src/features/catalog/data/consumable-sizes";
import { accessorySubcategoryDefinitions } from "../../src/features/catalog/data/accessory-subcategories";
import { buyingGuides } from "../../src/features/content/data/buying-guides";

const materialNames = platformSubcategoryDefinitions.map(({ label }) => label);
const accessoryNames = accessorySubcategoryDefinitions.map(({ label }) => label);

for (const width of [320, 390, 768, 1440]) {
  test(`five accessory subcategories retain seven consumable sizes and explicit Mock models at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/products?category=accessories");
    const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
    const track = region.getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" });
    await expect(track.getByRole("button")).toHaveText(["ทั้งหมด", ...accessoryNames]);
    await expect(region.getByRole("status")).toHaveText("39 รายการ · 7 รุ่นตัวอย่าง (Mock)");
    const stops = await subcategoryStops(track);
    await region.getByRole("button", { name: "เลื่อนหมวดย่อยไปทางขวา", exact: true }).click();
    await expectSubcategoryPosition(track, stops[1] ?? 0);
    await region.getByRole("button", { name: "เลื่อนหมวดย่อยไปทางซ้าย", exact: true }).click();
    await expectSubcategoryPosition(track, 0);
    await loadAll(region);
    const allLinks = await hrefs(region);
    expect(new Set(allLinks).size).toBe(39);
    expect(allLinks).toContain("/products/TMS");
    const allMockNames = await region
      .locator('article[data-mock-product="true"] h3')
      .allTextContents();
    expect([...allMockNames].sort()).toEqual(
      [
        "LCDC1C5",
        "RS2321M2F",
        "LoadcellCable",
        "CableConnector",
        "PU20M12",
        "PU25M12",
        "LP42",
      ].sort(),
    );
    for (const [index, name] of accessoryNames.entries()) {
      const child = track.getByRole("button", { name, exact: true });
      await child.focus();
      await page.keyboard.press("Enter");
      await expect(child).toHaveAttribute("aria-pressed", "true");
      const real = [3, 0, 2, 4, 7][index];
      const mocks = [1, 3, 2, 1, 0][index];
      await expect(region.getByRole("status")).toHaveText(
        `${real} รายการ${mocks ? ` · ${mocks} รุ่นตัวอย่าง (Mock)` : ""}`,
      );
      if (index < 4)
        await expect(region.locator("article h3")).toHaveText(
          accessorySubcategoryDefinitions[index].models.map(({ model }) => model),
        );
      expect((await hrefs(region)).every((href) => allLinks.includes(href))).toBe(true);
      await expect(region.locator('article[data-mock-product="true"]')).toHaveCount(mocks);
      await expect(
        region.locator('article[data-mock-product="true"]').locator("a, button, img"),
      ).toHaveCount(0);
      if (index === 1) {
        await region
          .getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true })
          .click();
        await expect(region.locator("article button")).toHaveCount(0);
        await expect(page.locator(".compare-bar strong")).toHaveText("0/3");
        await page.getByRole("button", { name: "ยกเลิกการเปรียบเทียบ", exact: true }).click();
      }
      if (index === 2) {
        await region.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("PU20M12");
        await expect(region.locator("article h3")).toHaveText(["PU20M12"]);
        await expect(region.locator('article[data-mock-product="true"]')).toHaveCount(1);
        await region.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("");
      }
      if (index === 3)
        await region.screenshot({ path: test.info().outputPath(`accessories-${width}.png`) });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await region.getByRole("button", { name: "แสดงแบบรายการ", exact: true }).click();
    await expect(region.locator("article")).toHaveCount(7);
    await region.getByRole("button", { name: "แสดงแบบตาราง", exact: true }).click();
    await region.getByRole("button", { name: "ระบบ POS", exact: true }).click();
    await region.getByRole("button", { name: "อุปกรณ์เสริม", exact: true }).click();
    await expect(track.getByRole("button", { name: "ทั้งหมด", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(region.getByRole("status")).toHaveText("39 รายการ · 7 รุ่นตัวอย่าง (Mock)");
    expect(await track.evaluate((element) => getComputedStyle(element).overflowX)).toBe("hidden");
  });
}

for (const width of [320, 390, 768, 1440]) {
  test(`consumables show one card per size while original variants remain at ${width}px`, async ({
    page,
    request,
  }) => {
    const { products } = (await (await request.get("/api/products")).json()) as {
      products: Product[];
    };
    expect(products).toHaveLength(159);
    const consumableSources = [
      "Sticker_6040",
      "Sticker_5330",
      "Sticker_5320",
      "Sticker_5750",
      "Sticker_8080",
      "10748",
      "10740",
      "10749",
      "10750",
      "10747",
      "10742",
      "10744",
      "10743",
      "10745",
      "10746",
      "10810",
      "10809",
      "10812",
      "10811",
      "10824",
    ];
    const representativeSources = [
      "Sticker_6040",
      "Sticker_5330",
      "Sticker_5320",
      "Sticker_5750",
      "Sticker_8080",
      "10748",
      "10749",
    ];
    const pathsFor = (sources: string[]) =>
      products
        .filter((product) => sources.includes(product.sourceId ?? ""))
        .map((product) => `/products/${product.slug}`);
    const originalPaths = pathsFor(consumableSources);
    const representatives = pathsFor(representativeSources);
    expect(originalPaths).toHaveLength(20);
    expect(representatives).toHaveLength(7);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/products?category=accessories");
    const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
    const track = region.getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" });
    await expect(region.getByRole("heading", { level: 2 })).toHaveText("อุปกรณ์เสริม");
    await loadAll(region);
    const sizeLinks = async () =>
      (await hrefs(region)).filter((href) => originalPaths.includes(href ?? ""));
    expect((await sizeLinks()).sort()).toEqual([...representatives].sort());
    const childLinks: (string | null)[] = [];
    for (const name of accessoryNames) {
      await track.getByRole("button", { name, exact: true }).focus();
      await page.keyboard.press("Enter");
      await loadAll(region);
      childLinks.push(...(await sizeLinks()));
    }
    expect(childLinks.sort()).toEqual([...representatives].sort());
    await track.getByRole("button", { name: "ทั้งหมด", exact: true }).click();
    await region.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("เลเบล");
    await loadAll(region);
    expect((await sizeLinks()).sort()).toEqual([...representatives].sort());
    await region.getByRole("button", { name: "แสดงแบบรายการ", exact: true }).click();
    expect((await sizeLinks()).sort()).toEqual([...representatives].sort());
    await region.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
    expect(new Set(await sizeLinks()).size).toBe(7);
    await page.getByRole("button", { name: "ยกเลิกการเปรียบเทียบ", exact: true }).click();
    await region.getByRole("button", { name: "แสดงแบบตาราง", exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await region.screenshot({ path: test.info().outputPath(`consumable-sizes-${width}.png`) });
    await region.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("");
    await region.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).click();
    await expect(region.getByRole("status")).toHaveText("146 รายการ");
    await loadAll(region);
    expect((await sizeLinks()).sort()).toEqual([...representatives].sort());
    if (width === 1440) {
      const retainedOriginal = await request.get("/products/10746");
      expect(retainedOriginal.ok()).toBe(true);
    }
  });
}

for (const width of [320, 390, 768, 1440]) {
  test(`indicator display and overlapping waterproof filters at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/products?category=indicators");
    const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
    const track = region.getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" });
    await expect(track.getByRole("button")).toHaveText(["ทั้งหมด", "LCD", "LED", "กันน้ำ"]);
    await expect(region.getByRole("status")).toHaveText("10 รายการ · 2 รุ่นตัวอย่าง (Mock)");
    const allLinks = await hrefs(region);
    expect(new Set(allLinks).size).toBe(10);
    await expect(region.locator("article h3")).toContainText(["AC31S"]);
    await expect(region.locator('article[data-mock-product="true"]')).toHaveCount(2);
    for (const [name, models] of [
      ["LCD", ["AW31", "AC31P", "SW31F", "WP31C", "LCDC1C5"]],
      ["LED", ["SW31", "WP31E", "WP31EUSB", "LED-R1", "LED-R3", "LED-R5"]],
      ["กันน้ำ", ["WP31C", "WP31E", "WP31EUSB"]],
    ] as const) {
      const button = track.getByRole("button", { name, exact: true });
      await button.focus();
      await page.keyboard.press("Enter");
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(region.getByRole("status")).toHaveText(
        `${models.length - 1} รายการ · 1 รุ่นตัวอย่าง (Mock)`,
      );
      await expect(region.locator("article h3")).toHaveText([...models]);
      expect((await hrefs(region)).every((href) => allLinks.includes(href))).toBe(true);
      const mock = region.locator('article[data-mock-product="true"]');
      await expect(mock).toHaveCount(1);
      await expect(mock.getByRole("heading")).toHaveText(name === "LCD" ? "LCDC1C5" : "WP31EUSB");
      await expect(mock.getByText("Mock", { exact: true })).toBeVisible();
      await expect(mock.locator("a, button, img")).toHaveCount(0);
      if (name === "LED") {
        const links = await hrefs(region);
        for (const model of ["LED-R1", "LED-R3", "LED-R5"])
          expect(links.filter((href) => href === `/products/${model}`)).toHaveLength(1);
        await region.screenshot({ path: test.info().outputPath(`indicators-led-${width}.png`) });
      }
    }
    await region.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
    await expect(
      region.locator('article[data-mock-product="true"]').locator("a, button, img"),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "ยกเลิกการเปรียบเทียบ", exact: true }).click();
    await region.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("WP31C");
    await expect(region.locator("article h3")).toHaveText(["WP31C"]);
    await region.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("");
    await track.getByRole("button", { name: "ทั้งหมด", exact: true }).click();
    expect((await hrefs(region)).sort()).toEqual([...allLinks].sort());
    await region.getByRole("button", { name: "แสดงแบบรายการ" }).click();
    await expect(region.locator("article")).toHaveCount(12);
    await region.getByRole("button", { name: "แสดงแบบตาราง" }).click();
    expect(await track.evaluate((element) => getComputedStyle(element).overflowX)).toBe("hidden");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await track.scrollIntoViewIfNeeded();
    await track
      .locator("..")
      .screenshot({ path: test.info().outputPath(`indicators-${width}.png`) });
    await region.getByRole("button", { name: "ระบบ POS", exact: true }).click();
    await region.getByRole("button", { name: "อินดิเคเตอร์แท่นชั่ง", exact: true }).click();
    await expect(track.getByRole("button", { name: "ทั้งหมด", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(region.locator("article")).toHaveCount(12);
  });
}

for (const width of [320, 390, 768, 1440]) {
  test(`platform material subcategories retain real products and ABS mock at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/products?category=platforms");
    const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
    const track = region.getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" });
    await expect(track.getByRole("button")).toHaveText(["ทั้งหมด", ...materialNames]);
    await expect(region.getByRole("status")).toHaveText("23 รายการ · 1 รุ่นตัวอย่าง (Mock)");
    const allLinks = await hrefs(region);
    expect(new Set(allLinks).size).toBe(23);
    for (const [index, name] of materialNames.entries()) {
      const child = track.getByRole("button", { name, exact: true });
      await child.focus();
      await page.keyboard.press("Enter");
      await expect(child).toHaveAttribute("aria-pressed", "true");
      await expect(region.getByRole("status")).toHaveText(
        index === 3 ? "0 รายการ · 1 รุ่นตัวอย่าง (Mock)" : `${[12, 9, 2][index]} รายการ`,
      );
      expect((await hrefs(region)).every((href) => allLinks.includes(href))).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    const mock = region.locator('article[data-mock-product="true"]');
    await expect(mock).toHaveCount(1);
    await expect(mock.getByRole("heading")).toHaveText(materialNames[3]);
    await expect(mock.getByText("Mock", { exact: true })).toBeVisible();
    await expect(mock.locator("a, button, img")).toHaveCount(0);
    await region.getByRole("button", { name: "แสดงแบบรายการ" }).click();
    await expect(mock).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await region.getByRole("button", { name: "แสดงแบบตาราง" }).click();
    await region.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("ABS");
    await expect(mock).toHaveCount(1);
    await region.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
    await expect(mock.locator("button")).toHaveCount(0);
    await expect(page.locator(".compare-bar strong")).toHaveText("0/3");
    await page.getByRole("button", { name: "ยกเลิกการเปรียบเทียบ", exact: true }).click();
    await region.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("");
    await track.getByRole("button", { name: "ทั้งหมด", exact: true }).click();
    await track.getByRole("button").first().focus();
    await expect(track.getByRole("button").first()).toHaveAttribute("aria-pressed", "true");
    await page.screenshot({
      path: test.info().outputPath(`platform-materials-${width}.png`),
      fullPage: true,
    });
  });
}

const categories = [
  { label: "เครื่องชั่ง", path: "/products" },
  { label: "อินดิเคเตอร์แท่นชั่ง", path: "/Indicator" },
  { label: "โครงสร้างแท่นชั่ง", path: "/product/scale-platforms" },
  { label: "ระบบ POS", path: "/Product/POS" },
  { label: "อุปกรณ์เสริม", path: "/product/scale-accessories" },
];
const categoryName = (index: number) => categories[index - 1].label;
const scaleNames = [
  "คำนวณราคาหน้าร้าน",
  "อุตสาหกรรมงานผลิต",
  "งานวิเคราะห์ความแม่นยำสูง",
  "งานครัวและกาแฟ",
  "กันน้ำและกันฝุ่น 100%",
  "ตั้งโต๊ะ",
  "ตั้งพื้น",
  "มีเสา",
];
const hrefs = (region: Locator) =>
  region
    .locator("article > a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));

async function subcategoryStops(track: Locator) {
  return track.evaluate((element) => {
    const buttons = [...element.querySelectorAll("button")];
    const maximum = element.scrollWidth - element.clientWidth;
    return [
      ...new Set([
        0,
        ...buttons.map((button) =>
          Math.min(
            maximum,
            button.getBoundingClientRect().left - buttons[0].getBoundingClientRect().left,
          ),
        ),
        maximum,
      ]),
    ];
  });
}

async function expectSubcategoryPosition(track: Locator, target: number) {
  await expect
    .poll(() => track.evaluate((element, left) => Math.abs(element.scrollLeft - left), target))
    .toBeLessThan(1);
}

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
  await page.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).first().click();
  const response = await request.get("/api/products");
  expect(response.ok()).toBe(true);
  const { products } = (await response.json()) as { products: Product[] };
  const visibleProducts = deduplicateConsumableSizes(products);
  const published = visibleProducts.filter((product) => catalogProductGroup(product));
  const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  await expect(region.getByRole("heading", { level: 2 })).toHaveText("ผลิตภัณฑ์ทั้งหมด");
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
    const expected = visibleProducts.filter(
      (product) =>
        catalogProductGroup(product) === categories[index - 1].path ||
        (index === 2 && ["LED-R1", "LED-R3", "LED-R5"].includes(product.sourceId ?? "")),
    );
    expect([...parent].sort()).toEqual(
      expected.map((product) => `/products/${product.slug}`).sort(),
    );
    await expect(region.getByRole("status")).toHaveText(
      new RegExp(`^${expected.length} รายการ(?: · .*)?$`),
    );
    parents.push(...parent);
    const children: (string | null)[] = [];
    const childNames =
      index === 1
        ? scaleNames
        : index === 2
          ? ["LCD", "LED", "กันน้ำ"]
          : index === 3
            ? materialNames
            : index === 4
              ? ["iOS", "Android", "Windows"]
              : accessoryNames;
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
      if (index === 3) {
        const definition = platformSubcategoryDefinitions.find(({ label }) => label === name)!;
        expect(await region.locator("article h3").allTextContents()).toEqual(
          definition.models.map(({ model }) => model),
        );
        const mocks = region.locator('article[data-mock-product="true"]');
        await expect(mocks.locator("a, button, img")).toHaveCount(0);
        await expect(mocks).toHaveCount(name === materialNames[3] ? 1 : 0);
        if (name === materialNames[3])
          await expect(mocks.getByText("Mock", { exact: true })).toBeVisible();
      }
      if (index === 4) {
        const expectedModels =
          name === "Android" ? ["P1", "P4"] : name === "Windows" ? ["P1W"] : [];
        expect((await region.locator("article h3").allTextContents()).sort()).toEqual(
          expectedModels,
        );
        if (name === "iOS")
          await expect(
            region.getByRole("heading", { name: "ยังไม่พบสินค้าที่คุณค้นหา", exact: true }),
          ).toBeVisible();
      }
      if (index === 1) {
        const definition = manifest.categories.find(
          (item) => item.label.replace(/^เครื่องชั่ง/, "") === name,
        )!;
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
    } else if (index === 2) {
      expect(children.length).toBe(11);
      expect([...new Set(children)].sort()).toEqual(
        parent.filter((href) => href !== "/products/10776").sort(),
      );
    } else if (index === 5) {
      expect(children.length).toBe(16);
      expect(new Set(children).size).toBe(16);
    } else {
      expect(children.sort()).toEqual([...parent].sort());
      expect(new Set(children).size).toBe(parent.length);
    }
    expect(new URL(page.url()).pathname).toBe("/products");
  }
  expect([...new Set(parents)].sort()).toEqual([...all].sort());
  expect(parents.length).toBe(all.length + 3);
  for (const model of ["LED-R1", "LED-R3", "LED-R5"])
    expect(parents.filter((href) => href === `/products/${model}`)).toHaveLength(2);
  await region.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).click();
  await expect(region.locator("article")).toHaveCount(24);
  await expect(region.getByRole("button", { name: "ทั้งหมด", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(errors).toEqual([]);
});

test("subcategory arrows advance one button even during rapid clicks, stop at edges and preserve selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 950 });
  await page.goto("/products?category=scales");
  const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  const track = region.getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" });
  await expect(track.getByRole("button")).toHaveText(["ทั้งหมด", ...scaleNames]);
  const originalResults = await region.getByRole("status").textContent();
  const stops = await subcategoryStops(track);
  expect(stops.length).toBeGreaterThan(3);
  expect(stops[2] - stops[1]).not.toBeCloseTo(stops[1] - stops[0], 0);
  const forward = region.getByRole("button", { name: "เลื่อนหมวดย่อยไปทางขวา", exact: true });
  const backward = region.getByRole("button", { name: "เลื่อนหมวดย่อยไปทางซ้าย", exact: true });
  await forward.dblclick({ delay: 30 });
  await expectSubcategoryPosition(track, stops[2]);
  await backward.dblclick({ delay: 30 });
  await expectSubcategoryPosition(track, 0);
  for (const target of stops.slice(1)) {
    await forward.click();
    await expectSubcategoryPosition(track, target);
  }
  await forward.click();
  await expectSubcategoryPosition(track, stops.at(-1)!);
  await expect(track.getByRole("button", { name: "ทั้งหมด", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(region.getByRole("status")).toHaveText(originalResults!);
  for (const target of stops.slice(0, -1).reverse()) {
    await backward.click();
    await expectSubcategoryPosition(track, target);
  }
  await backward.click();
  await expectSubcategoryPosition(track, 0);
  await forward.click();
  await expectSubcategoryPosition(track, stops[1]);
  await page.setViewportSize({ width: 768, height: 950 });
  const resizedStops = await subcategoryStops(track);
  const current = await track.evaluate((element) => element.scrollLeft);
  const previous = resizedStops.filter((left) => left < current - 1).at(-1) ?? 0;
  await backward.click();
  await expectSubcategoryPosition(track, previous);
});

test.describe("subcategory arrow-only touch navigation", () => {
  test.use({ viewport: { width: 390, height: 950 }, hasTouch: true, isMobile: true });
  test("horizontal wheel and swipe do not move the strip; vertical page scrolling remains available", async ({
    page,
    context,
  }) => {
    await page.goto("/products?category=scales");
    const track = page.getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" });
    await expect(track.getByRole("button")).toHaveText(["ทั้งหมด", ...scaleNames]);
    await track.scrollIntoViewIfNeeded();
    expect(await track.evaluate((element) => getComputedStyle(element).overflowX)).toBe("hidden");
    expect(await track.evaluate((element) => getComputedStyle(element).touchAction)).toBe("pan-y");
    await page.bringToFront();
    const session = await context.newCDPSession(page);
    async function swipe(dx: number, dy: number) {
      const bounds = (await track.boundingBox())!;
      const x = bounds.x + bounds.width / 2;
      const y = bounds.y + bounds.height / 2;
      await session.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
      });
      for (let step = 1; step <= 8; step++) {
        await session.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: x + (dx * step) / 8, y: y + (dy * step) / 8 }],
        });
        await page.waitForTimeout(16);
      }
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(250);
    }
    const before = await track.evaluate((element) => element.closest("dialog")!.scrollTop);
    await swipe(0, -120);
    await expect
      .poll(() => track.evaluate((element) => element.closest("dialog")!.scrollTop))
      .toBeGreaterThan(before);
    await swipe(-120, 0);
    expect(await track.evaluate((element) => element.scrollLeft)).toBe(0);
    await track.hover();
    await page.mouse.wheel(250, 0);
    await page.waitForTimeout(200);
    expect(await track.evaluate((element) => element.scrollLeft)).toBe(0);
    await session.detach();
  });
});

test("parent changes reset children and search intersects with the selected demo group", async ({
  page,
  request,
}) => {
  await page.goto("/products");
  await page.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).first().click();
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
  await expect(region.getByRole("button", { name: "LCD", exact: true })).toHaveAttribute(
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
    `${deduplicateConsumableSizes(products).filter((product) => catalogProductGroup(product)).length} รายการ`,
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
  await page.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).first().click();
  const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  await region.getByRole("button", { name: "เครื่องชั่ง", exact: true }).click();
  await region.getByRole("button", { name: scaleNames[3], exact: true }).click();
  await region.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("VL15000S");
  await expect(region.getByRole("status")).toHaveText("0 รายการ · 1 รุ่นตัวอย่าง (Mock)");
  const mock = region.locator('article[data-mock-product="true"]');
  await expect(mock.getByRole("heading", { name: "VL15000S", exact: true })).toBeVisible();
  await expect(mock.locator("a, button, img")).toHaveCount(0);
  await region.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
  await expect(mock.locator("button")).toHaveCount(0);
  await expect(page.locator(".compare-bar strong")).toHaveText("0/3");
  await expect(page.getByRole("button", { name: "ดูการเปรียบเทียบ", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "ยกเลิกการเปรียบเทียบ", exact: true }).click();
  await region.getByRole("button", { name: "สินค้าแนะนำ", exact: true }).click();
  await expect(region.locator("article")).toHaveCount(0);
  await expect(region.getByRole("status")).toHaveText("0 รายการ");
  await region.getByRole("button", { name: "ล้างตัวกรองทั้งหมด" }).click();
  await expect(region.getByRole("status")).toHaveText("146 รายการ");
  await expect(region.locator('article[data-mock-product="true"]')).toHaveCount(0);
});

test("default order, featured filtering and list view retain real product data without a sort control", async ({
  page,
}) => {
  await page.goto("/products");
  await page.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).first().click();
  const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  await expect(region.getByRole("combobox", { name: "เรียงลำดับสินค้า" })).toHaveCount(0);
  const recommended = await region.locator("article h3").allTextContents();
  await region.getByRole("button", { name: "สินค้าแนะนำ", exact: true }).click();
  const featured = await region.locator("article h3").allTextContents();
  expect(featured.length).toBeGreaterThan(0);
  expect(featured.length).toBeLessThan(24);
  expect(featured).toContain("WPS10KS");
  await region.getByRole("button", { name: "สินค้าแนะนำ", exact: true }).click();
  await expect(region.locator("article h3")).toHaveText(recommended);
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
  await page.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).first().click();
  const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  await region.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
  const add = region.getByRole("button", { name: /^เพิ่มเพื่อเปรียบเทียบ/ });
  for (let index = 0; index < 3; index++) await add.first().click();
  await expect(add.first()).toBeDisabled();
  await region.getByRole("button", { name: categoryName(5), exact: true }).click();
  await expect(
    region.getByRole("button", { name: /^เพิ่มเพื่อเปรียบเทียบ/ }).first(),
  ).toBeDisabled();
  await page.getByRole("button", { name: "ดูการเปรียบเทียบ", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "เปรียบเทียบสินค้า" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("table")).toContainText("WPS10KS");
  await expect(dialog.getByRole("table")).toContainText("ACS-30-JC21");
  await dialog.getByRole("button", { name: "ปิด", exact: true }).click();
  await expect(page.locator(".compare-bar")).toHaveCount(0);
  await region.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).click();
  await page.getByRole("button", { name: "ปิดแคตตาล็อกสินค้า", exact: true }).click();
  await page.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true }).click();
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
  await page.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).first().click();
  const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  await expect(region.getByRole("heading", { level: 2 })).toHaveText("ผลิตภัณฑ์ทั้งหมด");
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
  { width: 1024, height: 900, products: 3 },
  { width: 1440, height: 1000, products: 4 },
  { width: 1920, height: 1080, products: 4 },
]) {
  test(`responsive controls, focus and product grid at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/products");
    await page.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).first().click();
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
        targets: buttons.every((button) => button.getBoundingClientRect().height >= 44),
        readable: buttons.every((button) => {
          const name = button.querySelector("strong")!;
          return name.scrollWidth <= name.clientWidth + 1;
        }),
        compact: buttons.every(
          (button) => getComputedStyle(button.querySelector("span")!).display === "none",
        ),
        scrollable: element.scrollWidth > element.clientWidth + 1,
      };
    });
    expect(geometry).toEqual({
      rows: 1,
      targets: true,
      readable: true,
      compact: true,
      scrollable: viewport.width < 1024,
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
    expect(await children.evaluate((element) => getComputedStyle(element).overflowX)).toBe(
      "hidden",
    );
    const firstStep = await children.evaluate((element) => {
      const [first, second] = Array.from(element.children) as HTMLElement[];
      return Math.min(
        element.scrollWidth - element.clientWidth,
        second.offsetLeft - first.offsetLeft,
      );
    });
    const forward = region.getByRole("button", { name: "เลื่อนหมวดย่อยไปทางขวา", exact: true });
    const backward = region.getByRole("button", { name: "เลื่อนหมวดย่อยไปทางซ้าย", exact: true });
    await forward.click();
    await expect
      .poll(() =>
        children.evaluate((element, step) => Math.abs(element.scrollLeft - step), firstStep),
      )
      .toBeLessThan(1);
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
    await expectSubcategoryPosition(children, firstStep);
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
    await region.getByRole("button", { name: "ระบบ POS", exact: true }).click();
    await expect(children.getByRole("button")).toHaveText(["ทั้งหมด", "iOS", "Android", "Windows"]);
    await expect(region.locator("article")).toHaveCount(3);
    await children.getByRole("button", { name: "iOS", exact: true }).click();
    await expect(region.locator("article")).toHaveCount(0);
    await expect(
      region.getByRole("heading", { name: "ยังไม่พบสินค้าที่คุณค้นหา", exact: true }),
    ).toBeVisible();
    await children.getByRole("button", { name: "Android", exact: true }).click();
    expect((await region.locator("article h3").allTextContents()).sort()).toEqual(["P1", "P4"]);
    await children.getByRole("button", { name: "Windows", exact: true }).click();
    await expect(region.locator("article h3")).toHaveText(["P1W"]);
    await children.getByRole("button", { name: "ทั้งหมด", exact: true }).click();
    await expect(region.locator("article")).toHaveCount(3);
    expect(await children.evaluate((element) => getComputedStyle(element).overflowX)).toBe(
      "hidden",
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await first.click();
    await region.getByRole("button", { name: "ระบบ POS", exact: true }).click();
    await expect(children.getByRole("button", { name: "ทั้งหมด", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(region.locator("article")).toHaveCount(3);
    await children.scrollIntoViewIfNeeded();
    await children
      .locator("..")
      .screenshot({ path: test.info().outputPath(`pos-platforms-${viewport.width}.png`) });
    expect(errors).toEqual([]);
  });
}

test("featured hero uses existing records, tabs and original product destinations", async ({
  page,
  request,
}) => {
  const { products } = (await (await request.get("/api/products")).json()) as {
    products: Product[];
  };
  const expected = deduplicateConsumableSizes(products)
    .filter((product) => catalogProductGroup(product) && product.featured && product.image)
    .slice(0, 2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products");
  const hero = page.locator('[data-overview-section="hero"]');
  await expect(hero.locator("li")).toHaveCount(expected.length);
  expect(
    await hero
      .locator('li a[href^="/products/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
  ).toEqual(expected.map((product) => `/products/${product.slug}`));
  for (const [index, product] of expected.entries())
    await expect(hero.locator("li").nth(index)).toContainText(product.subtitle);
  const tabs = hero.getByRole("tab");
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect
    .poll(() => hero.locator("ul").evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  await tabs.first().click();
  await expect.poll(() => hero.locator("ul").evaluate((element) => element.scrollLeft)).toBe(0);
  await page.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).first().click();
  const finder = page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true });
  const search = finder.getByRole("textbox", { name: "ค้นหารุ่นสินค้า", exact: true });
  await search.fill("WPS10KS");
  await expect(finder.locator("#mock-product-results article h3")).toHaveText(["WPS10KS"]);
  await finder.getByRole("button", { name: "ปิดแคตตาล็อกสินค้า" }).click();
  await hero.locator('li a[href^="/products/"]').first().focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`/products/${expected[0].slug}$`));
});

test("all five server-rendered buying guides retain complete content in feature popups", async ({
  page,
  request,
}) => {
  const html = await (await request.get("/products")).text();
  expect(html).toContain('id="products-features-title"');
  await page.goto("/products");
  const gallery = page.locator("#products-features");
  await expect(gallery.locator("li")).toHaveCount(6);
  for (const [index, guide] of buyingGuides.entries()) {
    expect(html).toContain(guide.introduction);
    expect(html).toContain(`href="/guides/${guide.slug}"`);
    const card = gallery.locator("li").nth(index);
    await expect(card.getByRole("heading", { level: 3 })).toHaveText(guide.title);
    await card.getByRole("button").click();
    const modal = page.getByRole("dialog", { name: guide.title, exact: true });
    await expect(modal).toBeVisible();
    await expect(modal.getByText(guide.introduction, { exact: true })).toBeVisible();
    for (const section of guide.sections) {
      await expect(modal.getByRole("heading", { name: section.title, exact: true })).toBeVisible();
      for (const paragraph of section.paragraphs)
        await expect(modal.getByText(paragraph, { exact: true })).toHaveCount(1);
    }
    if (index === buyingGuides.length - 1) {
      await modal.getByRole("link", { name: "ดูเพิ่มเติม", exact: true }).click();
      await expect(page).toHaveURL(/\/guides\/accessories$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(guide.title);
    } else await page.keyboard.press("Escape");
  }
});

test("hero stays usable during slow images and mobile tablet desktop resizing", async ({
  page,
}) => {
  let releaseImages!: () => void;
  const imagesReady = new Promise<void>((resolve) => {
    releaseImages = resolve;
  });
  await page.route("**/_next/image?*", async (route) => {
    await imagesReady;
    await route.continue();
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    for (const width of [390, 768, 1440, 320, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const card = page.locator('[data-overview-section="hero"] li').first();
      await expect(card).toBeVisible();
      expect(
        await card.evaluate((element) => {
          const r = element.getBoundingClientRect();
          return r.height >= 440 && r.width >= 240 && r.width < innerWidth;
        }),
      ).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  } finally {
    releaseImages();
  }
  const image = page.locator('[data-overview-section="hero"] img').first();
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
