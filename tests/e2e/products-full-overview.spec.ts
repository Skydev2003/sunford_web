import { expect, test, type Page } from "@playwright/test";
import { recordStaggerMotion, type StaggerWindow } from "./helpers/stagger-motion";
import { selectScaleShowcase } from "../../src/features/catalog/data/scale-showcase";
import type { ClientProduct } from "../../src/features/catalog/types";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 768, 1440]) {
  test(`calibration examples close the directory and open both original documents at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/products#products-calibration");
    const directory = page.locator("[data-products-directory]");
    const section = directory.locator(":scope > section").last();
    await expect(section.locator("h2")).toHaveText("มาตรฐานการสอบเทียบ ตัวอย่างเอกสารจาก SUNFORD");
    await expect(directory.getByRole("heading", { name: "รายการอื่น ๆ" })).toHaveCount(0);
    await expect(directory.locator("#products-rail-uncategorized")).toHaveCount(0);
    const links = section.getByRole("link");
    const rail = section.getByRole("list");
    await expect(links).toHaveCount(2);
    await expect(links.nth(0)).toHaveAttribute("href", "/documents/scale-calibration-sample.pdf");
    await expect(links.nth(1)).toHaveAttribute(
      "href",
      "/images/imported/19d265ccc80f5feede0c.webp",
    );
    const [before, after] = [
      section.getByRole("button", { name: /ก่อนหน้า$/ }),
      section.getByRole("button", { name: /ถัดไป$/ }),
    ];
    if (width < 1440) {
      await after.click();
      await expect.poll(() => rail.evaluate((list) => list.scrollLeft)).toBeGreaterThan(0);
      await before.click();
      await expect.poll(() => rail.evaluate((list) => list.scrollLeft)).toBe(0);
    } else {
      await expect(section.getByRole("button")).toHaveCount(0);
    }
    const [report] = await Promise.all([
      page.waitForResponse((response) =>
        response.url().endsWith("/documents/scale-calibration-sample.pdf"),
      ),
      links.first().click(),
    ]);
    expect(report.ok()).toBe(true);
    expect(report.headers()["content-type"]).toContain("application/pdf");
    await page.goto("/products#products-calibration");
    await links.last().focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/19d265ccc80f5feede0c\.webp$/);
    await expect
      .poll(() => page.locator("img").evaluate((img) => (img as HTMLImageElement).naturalWidth))
      .toBe(3306);
  });
}

for (const width of [390, 768, 1440]) {
  test(`the illustrated builder menu opens the guide at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/products");
    const nav = page.getByRole("navigation", { name: "เลือกหมวดผลิตภัณฑ์" });
    const links = nav.getByRole("link");
    const builder = nav.getByRole("link", { name: "จัดสเปค", exact: true });
    const guide = "/guides/indicator-platform-compatibility";
    await expect(builder).toHaveAttribute("href", guide);
    await expect(links).toHaveCount(6);
    expect(
      await links.evaluateAll((items) => items.map((item) => item.getAttribute("href"))),
    ).toEqual([
      "/products/category/scales",
      "/products/category/indicators",
      "/products/category/platforms",
      "/products/category/pos",
      "/products/category/accessories",
      guide,
    ]);

    if (width < 1440) {
      await nav.getByRole("button", { name: "เลื่อนหมวดผลิตภัณฑ์ถัดไป" }).click();
      await expect
        .poll(() => nav.getByRole("list").evaluate((track) => track.scrollLeft))
        .toBeGreaterThan(0);
    }
    await links.nth(4).focus();
    await page.keyboard.press("Tab");
    await expect(builder).toBeFocused();
    const images = builder.locator("img");
    await expect(images).toHaveCount(2);
    await expect
      .poll(() =>
        images.evaluateAll((items) =>
          items.every(
            (item) => item instanceof HTMLImageElement && item.complete && item.naturalWidth > 0,
          ),
        ),
      )
      .toBe(true);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(guide);
    await page.goBack();
    await builder.click();
    await expect(page).toHaveURL(guide);
  });
}

async function openScalesMenu(page: Page) {
  await expect(page.locator("[data-products-header]:visible button:visible").first()).toBeEnabled();
  const trigger = page
    .locator("[data-products-nav]")
    .getByRole("link", { name: "เครื่องชั่ง", exact: true });
  await trigger.focus();
  await trigger.press("ArrowDown");
  await expect(trigger).toHaveAttribute("aria-expanded", "true", { timeout: 1_000 });
  return page.locator("#products-navigation-panel");
}

for (const width of [320, 390, 736, 737, 768, 834, 1024, 1068, 1440, 1521, 1920, 2540]) {
  test(`storefront and five actual product categories and existing chrome remain contained at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/products");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("เครื่องชั่งน้ำหนักล้ำสมัย");
    const directory = page.locator("[data-products-directory]");
    const sections = directory.locator("[data-products-category-section]");
    await expect(sections).toHaveCount(5);
    await expect(sections.first().locator("h2 + span")).toHaveCount(0);
    await expect(sections.first().locator("ul")).toHaveCSS("scrollbar-width", "none");
    await expect(sections.locator("h2")).toHaveText([
      "เครื่องชั่งมาตรฐานที่ไว้วางใจ",
      "เลือกออกแบบได้ด้วยตัวคุณเอง",
      "ระบบอัจฉริยะ ยกระดับงานชั่ง",
      "งานบ้านก็สบาย งานขายก็หายห่วง",
      "เที่ยงตรงทั้งอุตสาหกรรมและงานวิเคราะห์",
    ]);
    const response = await page.request.get("/api/products");
    expect(response.ok()).toBe(true);
    const { products } = await response.json();
    const actual = await sections.evaluateAll((nodes) =>
      nodes.map((section) =>
        [...section.querySelectorAll("[data-warehouse-sku]")].map((card) => ({
          sku: card.getAttribute("data-warehouse-sku"),
          href: card.querySelector("a")?.getAttribute("href"),
          specs: [...card.querySelectorAll("[data-product-spec]")].map((item) => item.textContent),
        })),
      ),
    );
    expect(actual[2]).toHaveLength(0);
    await expect(sections.nth(2).locator("li[data-software]")).toHaveCount(7);
    expect(actual[1]).toHaveLength(8);
    expect(actual[3]).toHaveLength(8);
    expect(actual[4]).toHaveLength(8);
    expect(actual[0]).toHaveLength(10);
    expect(new Set(actual[0].map((card) => card.sku)).size).toBe(10);
    const styles = await sections
      .first()
      .locator("li")
      .evaluateAll((cards) => cards.map((card) => card.getAttribute("data-design")));
    expect(styles).not.toContain(null);
    expect(new Set(styles).size).toBe(10);
    const eligible = products.filter(
      (p: { warehouseCategoryId?: string; image?: string }) =>
        p.warehouseCategoryId === "scales" && p.image,
    );
    for (const card of actual[0])
      expect(eligible).toContainEqual(expect.objectContaining({ warehouseSku: card.sku }));
    await expect(directory.locator("[data-warehouse-sku]")).toHaveCount(34);
    await expect(
      directory.locator('[data-warehouse-sku] > a svg.lucide-chevron-right[aria-hidden="true"]'),
    ).toHaveCount(34);
    await expect(directory).not.toContainText("Mock");
    await expect(
      directory.getByRole("link", { name: "ดูรุ่นสินค้าทั้งหมด", exact: true }),
    ).toHaveCount(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
    await expect(page.locator("[data-products-footer]:visible")).toHaveCount(1);
    const expectedLeft = Math.round((await directory.locator("h1").boundingBox())!.x);
    const leftEdges = await directory.evaluate((element) => {
      const selectors = ["[data-products-category-section] h2", "[data-warehouse-sku]"];
      return selectors.map((selector) =>
        Math.round(element.querySelector(selector)!.getBoundingClientRect().left),
      );
    });
    expect(leftEdges).toEqual(Array.from({ length: 2 }, () => expectedLeft));
    const geometry = await sections.first().evaluate((section) => {
      const heading = section.firstElementChild!.getBoundingClientRect();
      const rail = section.querySelector("ul")!;
      const card = rail.querySelector("li > a")!;
      const box = card.getBoundingClientRect();
      const chevron = card.querySelector("svg")!.getBoundingClientRect();
      return {
        chevron: [
          chevron.width,
          Math.round(box.right - chevron.right),
          Math.round(box.bottom - chevron.bottom),
        ],
        gap: getComputedStyle(rail).columnGap,
        padding: getComputedStyle(card.querySelector("h3")!.parentElement!).padding,
        width: box.width,
        height: box.height,
        headingGap:
          box.top -
          heading.bottom +
          parseFloat(getComputedStyle(section.firstElementChild!).paddingBottom),
      };
    });
    expect(geometry.gap).toBe("20px");
    expect(geometry.chevron).toEqual(width >= 1024 ? [36, 20, 20] : [36, 16, 16]);
    expect(geometry.padding).toBe(width >= 768 ? "28px" : "24px");
    expect(geometry.width).toBeCloseTo(width > 736 ? 400 : Math.min(width - 60, 309), 0);
    expect(geometry.height).toBeCloseTo(width >= 737 ? 500 : 450, 0);
    expect(expectedLeft).toBe(Math.min(140, Math.max(22, Math.round((width - 1160) / 2))));
    if (width < 1024) {
      await expect(directory.locator("h1")).toHaveCSS("font-size", width > 736 ? "80px" : "48px");
    } else {
      const logo = (await directory.locator("[data-products-logo]").boundingBox())!;
      const title = (await directory.locator("h1").boundingBox())!;
      const next = (await sections.first().locator("button").last().boundingBox())!;
      expect(logo.x + logo.width / 2).toBeCloseTo(width / 2, 0);
      expect(title.x + title.width).toBeLessThan(logo.x);
      expect(width - next.x - next.width).toBeCloseTo(expectedLeft, 0);
    }
    expect(geometry.headingGap).toBe(width >= 1024 ? 24 : 16);
    expect(
      await sections
        .first()
        .locator("ul")
        .evaluate((element) => element.scrollWidth > element.clientWidth),
    ).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: test.info().outputPath(`products-store-${width}.png`) });
    expect(errors).toEqual([]);
  });
}

test("the featured scales keep their lineup on reload and in a fresh session", async ({
  page,
  browser,
}) => {
  const lineup = async (view: Page) => {
    const cards = view.locator("#products-rail-scales li");
    await expect(cards).toHaveCount(10);
    return cards.evaluateAll((nodes) =>
      nodes.map((card) => [
        card.getAttribute("data-warehouse-sku"),
        card.getAttribute("data-design"),
        card.querySelector("a")?.getAttribute("href"),
        card.getAttribute("data-scale-group"),
      ]),
    );
  };
  await page.goto("/products");
  const original = await lineup(page);
  const scales = page.locator("#products-rail-scales");
  await expect(scales.locator('[data-image-mode="full-bottom"]')).toHaveCount(9);
  await expect(scales.locator('[data-image-mode="bleed"] h3')).toHaveText("WPK5000");
  await expect(scales.locator("h3 + p")).toHaveCount(10);
  await expect(scales.locator("h3 + p").first()).toHaveText("จอสู้แดด ชั่งได้ถึง 30 กก.");
  await expect(scales.locator("h3 + p + *")).toHaveCount(0);
  await expect(scales.locator("p:has(+ h3)")).toHaveText([
    "คำนวณราคา",
    "คำนวณราคา",
    "คำนวณราคา",
    "ครัวและเบเกอรี่",
    "อุตสาหกรรม",
    "ครัวและเบเกอรี่",
    "อุตสาหกรรม",
    "อุตสาหกรรม",
    "อุตสาหกรรม",
    "งานวิเคราะห์ / ห้องแล็บ",
  ]);
  await expect(
    scales.getByRole("link", { name: "AVS-25-K1", exact: true }),
  ).toHaveAccessibleDescription("ถาดกว้าง จอแยก พิกัด 30 กก.");
  await expect(
    scales.getByRole("link", { name: "FEH5KS", exact: true }),
  ).toHaveAccessibleDescription("ต่อเครื่องพิมพ์ผ่านพอร์ต RS232");
  expect(original.map(([sku]) => sku)).toEqual([
    "G106094",
    "G106315",
    "G106193",
    "G106681",
    "G106131",
    "G106285",
    "G106124",
    "G106353",
    "G106377",
    "G106643",
  ]);
  const { products } = await (await page.request.get("/api/products")).json();
  for (const [sku, , href] of original) {
    const product = products.find((entry: { warehouseSku: string }) => entry.warehouseSku === sku);
    expect(product.warehouseCategoryId).toBe("scales");
    expect(href).toBe(`/products/${product.slug}`);
  }
  await page.reload();
  expect(await lineup(page)).toEqual(original);
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  try {
    const fresh = await mobile.newPage();
    await fresh.goto(new URL("/products", page.url()).href);
    expect(await lineup(fresh)).toEqual(original);
  } finally {
    await mobile.close();
  }
});

test("showcase taglines fit on one line at mobile, tablet and desktop sizes", async ({ page }) => {
  await page.goto("/products");
  const taglines = page.locator("#products-rail-scales [data-warehouse-sku] h3 + p");
  await expect(taglines).toHaveCount(10);
  for (const width of [320, 390, 736, 737, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.fonts.ready);
    const overflowing = await taglines.evaluateAll((lines) =>
      lines
        .filter(
          (line) =>
            line.scrollWidth > line.clientWidth ||
            line.scrollHeight > Math.ceil(parseFloat(getComputedStyle(line).lineHeight)),
        )
        .map((line) => line.textContent),
    );
    expect(overflowing, `Clipped or wrapping showcase taglines at ${width}px`).toEqual([]);
    const layout = await taglines.evaluateAll((lines) =>
      lines.map((line) => {
        const card = line.closest("a")!;
        const image = card.querySelector("img")!;
        const text = document.createRange();
        text.selectNodeContents(line);
        const content = text.getBoundingClientRect();
        const bounds = card.getBoundingClientRect();
        return {
          height: bounds.height,
          weight: getComputedStyle(line).fontWeight,
          readable:
            content.width > 0 && content.left >= bounds.left && content.right <= bounds.right,
          clearOfPhoto: content.bottom <= image.getBoundingClientRect().top,
          described: card.getAttribute("aria-describedby") === line.id,
        };
      }),
    );
    expect(layout).toEqual(
      Array(10).fill({
        height: width >= 737 ? 500 : 450,
        weight: "400",
        readable: true,
        clearOfPhoto: true,
        described: true,
      }),
    );
  }
});

test("the products index renders five shelves and loads all first-shelf product images", async ({
  page,
}) => {
  await page.goto("/products");
  const shelves = page.locator("[data-products-category-section]");
  await expect(shelves).toHaveCount(5);

  const cards = shelves.first().locator("#products-rail-scales li[data-warehouse-sku]");
  await expect(cards).toHaveCount(10);
  for (const card of await cards.all()) {
    const sku = (await card.getAttribute("data-warehouse-sku"))!;
    const image = card.locator("img");
    await card.scrollIntoViewIfNeeded();
    const source = await image.evaluate(async (img: HTMLImageElement) => {
      await img.decode();
      return decodeURIComponent(img.currentSrc || img.src);
    });
    expect(source).toContain(
      `/images/products/scale-showcase/framed/${sku.toLowerCase()}-front-4k.webp`,
    );
  }
});

test("each scale keeps its solid or split background and matching text color", async ({ page }) => {
  await page.goto("/products");
  const cards = page.locator("#products-rail-scales li");
  const palette: Record<
    string,
    { top: string; bottom?: string; height?: number; whiteText?: boolean }
  > = {
    G106094: { top: "rgb(238, 160, 61)" },
    G106315: { top: "rgb(100, 33, 62)", bottom: "rgb(233, 159, 149)", height: 33, whiteText: true },
    G106193: { top: "rgb(175, 201, 231)", bottom: "rgb(39, 77, 135)", height: 27 },
    G106681: { top: "rgb(80, 185, 156)" },
    G106131: { top: "rgb(212, 220, 138)", bottom: "rgb(169, 178, 72)", height: 40 },
    G106285: { top: "rgb(242, 166, 142)" },
    G106124: { top: "rgb(220, 184, 130)", bottom: "rgb(173, 121, 77)", height: 32 },
    G106353: { top: "rgb(42, 64, 84)", whiteText: true },
    G106377: { top: "rgb(165, 207, 183)", bottom: "rgb(71, 126, 103)", height: 41 },
    G106643: { top: "rgb(195, 184, 227)", bottom: "rgb(128, 112, 168)", height: 33 },
  };
  await expect(cards).toHaveCount(10);
  await expect(cards.locator("[data-scale-surface]")).toHaveCount(6);
  for (const item of await cards.all()) {
    const sku = (await item.getAttribute("data-warehouse-sku"))!;
    const { top, bottom, height, whiteText } = palette[sku];
    const card = item.getByRole("link");
    await expect(card).toHaveCSS("background-color", top);
    await expect(card.locator("h3")).toHaveCSS(
      "color",
      whiteText ? "rgb(255, 255, 255)" : "rgb(29, 29, 31)",
    );
    const surface = card.locator("[data-scale-surface]");
    if (!bottom || height === undefined) {
      await expect(surface).toHaveCount(0);
      continue;
    }
    await expect(surface).toHaveCSS("background-color", bottom);
    await expect(surface).toHaveCSS("pointer-events", "none");
    const fraction = await surface.evaluate(
      (el) => el.getBoundingClientRect().height / el.parentElement!.getBoundingClientRect().height,
    );
    expect(fraction * 100).toBeCloseTo(height, 1);
  }
  const { products }: { products: ClientProduct[] } = await (
    await page.request.get("/api/products")
  ).json();
  for (const item of selectScaleShowcase(products)) {
    const [alone] = selectScaleShowcase([item.product]);
    expect(alone.background).toBe(item.background);
    expect(alone.surface).toBe(item.surface);
    expect(alone.lightText).toBe(item.lightText);
  }
});

test("the two dedicated scale shelves each have four pictured models per use with no repeats", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products");
  const products: ClientProduct[] = (await (await page.request.get("/api/products")).json())
    .products;
  const directory = page.locator("[data-products-directory]");
  const destinations = await directory
    .locator("ul li > a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  for (const shelf of [
    {
      title: "เที่ยงตรงทั้งอุตสาหกรรมและงานวิเคราะห์",
      groups: ["scale-industrial", "scale-analytical"],
      skus: [
        "G106742",
        "G106650",
        "G106537",
        "G106803",
        "G106308",
        "G106810",
        "G106322",
        "G106674",
      ],
    },
    {
      title: "งานบ้านก็สบาย งานขายก็หายห่วง",
      groups: ["scale-kitchen", "scale-price"],
      skus: [
        "G106469",
        "G106186",
        "G106179",
        "G106209",
        "G106254",
        "G106216",
        "G106292",
        "G108562",
      ],
    },
  ]) {
    const rail = directory.getByRole("list", { name: shelf.title, exact: true });
    const cards = rail.getByRole("listitem");
    await expect(directory.getByRole("heading", { name: shelf.title, exact: true })).toBeVisible();
    await expect(cards).toHaveCount(8);
    for (const group of shelf.groups)
      await expect(rail.locator(`[data-scale-group="${group}"]`)).toHaveCount(4);
    for (const [index, sku] of shelf.skus.entries()) {
      const product = products.find((entry) => entry.warehouseSku === sku)!;
      const card = cards.nth(index);
      const href = `/products/${product.slug}`;
      await expect(card).toHaveAttribute("data-warehouse-sku", sku);
      await expect(card.getByRole("link")).toHaveAttribute("href", href);
      expect(destinations.filter((url) => url === href)).toHaveLength(1);
      const image = card.getByRole("img");
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
        .toBeGreaterThan(0);
      expect(decodeURIComponent((await image.getAttribute("src"))!)).toContain(
        `/specialty-scales/${sku.toLowerCase()}-front-4k.webp`,
      );
    }
  }
});

test("smart system showcase opens seven featured systems in order and keeps platform navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products");
  const rail = page.getByRole("list", { name: "ระบบอัจฉริยะ ยกระดับงานชั่ง", exact: true });
  const destinations = [
    ["P1W", "/products/10801"],
    ["P1", "/products/10802"],
    ["P4", "/products/10805"],
    ["P3", "/products/warehouse-G108043"],
    ["WeWeigh2", "https://weweigh.app/"],
    ["RLS1800", "/products/warehouse-G106827"],
    ["LP50", "/products/warehouse-G107282"],
  ];
  await expect(rail.getByRole("heading")).toHaveText(destinations.map(([name]) => name));
  const posSellingPoints = [
    ["P1W", "Windows 10 Pro พร้อมจอคู่ 15.6 นิ้ว"],
    ["P1", "Android พร้อมจอสัมผัส 15.6 นิ้ว"],
    ["P4", "POS ขนาดกะทัดรัด จอสัมผัส 12.5 นิ้ว"],
    ["P3", "จอสัมผัส 14 นิ้ว พิมพ์สลิป 80 มม."],
  ];
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const [name, sellingPoint] of posSellingPoints) {
      const link = rail.getByRole("link", { name, exact: true });
      await expect(link).toHaveAccessibleDescription(sellingPoint);
      await expect(link).not.toContainText(/ก่อน VAT|สอบถามราคา/);
      const caption = link.getByText(sellingPoint, { exact: true });
      await link.scrollIntoViewIfNeeded();
      await expect(caption).toBeInViewport();
      expect(
        await caption.evaluate((el) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          return range.getClientRects().length;
        }),
      ).toBe(1);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await rail.evaluate((el) => (el.scrollLeft = 0));
  await page.getByRole("button", { name: "เลื่อนระบบอัจฉริยะ ยกระดับงานชั่งถัดไป" }).click();
  await expect.poll(() => rail.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  for (const [name, href] of destinations) {
    const link = rail.getByRole("link", { name, exact: true });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAccessibleDescription(/\S/);
    expect(decodeURIComponent((await link.locator("img").getAttribute("src"))!)).toContain(
      name === "WeWeigh2" ? "/weweigh2-home-front-4k.webp" : "-front-4k.webp",
    );
    await link.scrollIntoViewIfNeeded();
    await expect
      .poll(() => link.locator("img").evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
  }
  await expect(
    page.locator("#products-categories").getByRole("link", { name: "โครงสร้างแท่นชั่ง" }),
  ).toHaveAttribute("href", "/products/category/platforms");
  await rail.getByRole("link", { name: "LP50", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/products\/warehouse-G107282$/);
});

test("component showcase links eight pictured parts to their own products", async ({ page }) => {
  await page.goto("/products");
  const section = page.locator('[aria-labelledby="products-category-indicators"]');
  const heading = section.getByRole("heading", {
    level: 2,
    name: "เลือกออกแบบได้ด้วยตัวคุณเอง",
    exact: true,
  });
  await expect(heading.locator("span")).toHaveText(["เลือกออกแบบ", "ได้ด้วยตัวคุณเอง"]);
  await expect(heading.locator("span").first()).toHaveCSS("color", "rgb(215, 25, 45)");
  await expect(heading.locator("span").last()).toHaveCSS("color", "rgb(110, 110, 115)");
  const shelfItems = section.getByRole("listitem");
  await expect(shelfItems).toHaveCount(9);
  const aboutCard = shelfItems.first().getByRole("link");
  await expect(aboutCard).toHaveAttribute("href", "/about-us");
  await expect(aboutCard.getByRole("heading", { level: 3 })).toHaveText("แม่นยำในทุกน้ำหนัก");
  await expect(section.getByRole("link", { name: /จัดสเปค/ })).toHaveCount(0);
  const cards = section.locator("li[data-warehouse-sku]");
  const skus = [
    "G107770",
    "G107534",
    "G107268",
    "G107787",
    "G107589",
    "G107282",
    "G107794",
    "G107305",
  ];
  await expect(cards).toHaveCount(skus.length);
  const { products } = await (await page.request.get("/api/products")).json();
  for (const [index, sku] of skus.entries()) {
    const product = products.find((entry: { warehouseSku: string }) => entry.warehouseSku === sku);
    const card = cards.nth(index);
    await expect(card).toHaveAttribute("data-warehouse-sku", sku);
    await expect(card.locator("a")).toHaveAttribute("href", `/products/${product.slug}`);
    const titleId = await card.locator("h3").getAttribute("id");
    await expect(page.locator(`[id="${titleId}"]`)).toHaveCount(1);
  }
  await aboutCard.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/about-us$/);
  await expect(page.getByRole("heading", { level: 1, name: /แม่นยำในทุกน้ำหนัก/ })).toBeVisible();
});

test("product photos lead later shelves while the first shelf and non-product cards keep their layout", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/products");
  const directory = page.locator("[data-products-directory]");
  const products = directory.locator("a[data-product-card-photo-first]");
  const excluded = directory.locator(
    "#products-rail-scales > li > a, #products-rail-indicators a[href='/about-us'], [data-software='weweigh2'] > a",
  );
  await expect(excluded).toHaveCount(12);
  await expect(products.first()).toHaveCSS("display", "grid");
  for (const width of [320, 390, 768, 1326, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.fonts.ready);
    const result = await directory.evaluate((index) => {
      const productLinks = [...index.querySelectorAll("ul[id^='products-rail-'] > li > a")].filter(
        (link) =>
          link.getAttribute("href")?.startsWith("/products/") &&
          !link.closest("#products-rail-scales"),
      );
      const invalid = productLinks.flatMap((link) => {
        const image = link.querySelector("img")!;
        const imageBounds = image.getBoundingClientRect();
        const title = link.querySelector("h3")!.getBoundingClientRect();
        const caption = link.querySelector("h3 + p")?.getBoundingClientRect();
        const arrow = link.querySelector("svg.lucide-chevron-right")!.getBoundingClientRect();
        const card = link.getBoundingClientRect();
        const photo = image.closest("[data-product-image-placeholder]") ?? image;
        const correctLayout =
          link.hasAttribute("data-product-card-photo-first") &&
          imageBounds.width > 0 &&
          imageBounds.top >= card.top &&
          imageBounds.bottom < title.top &&
          imageBounds.left >= card.left &&
          imageBounds.right <= card.right &&
          getComputedStyle(image).objectFit === "contain" &&
          title.bottom <= arrow.top &&
          (!caption || caption.top - title.bottom === 4) &&
          card.width === (innerWidth >= 737 ? 313 : Math.min(innerWidth - 60, 309)) &&
          card.height === (innerWidth >= 737 ? 500 : 450) &&
          getComputedStyle(link.firstElementChild!).backgroundColor === "rgba(0, 0, 0, 0)" &&
          link.querySelectorAll("button, [role='radio']").length === 0 &&
          arrow.right <= card.right &&
          arrow.bottom <= card.bottom &&
          photo.getBoundingClientRect().bottom <= title.top &&
          getComputedStyle(link).backgroundColor === "rgb(255, 255, 255)";
        return correctLayout ? [] : [link.getAttribute("href")];
      });
      return {
        count: productLinks.length,
        invalid,
        fitsViewport: document.documentElement.scrollWidth <= innerWidth,
      };
    });
    expect(result.count).toBeGreaterThanOrEqual(30);
    expect(result.invalid, `Card layout at ${width}px`).toEqual([]);
    expect(result.fitsViewport).toBe(true);
    await expect(products).toHaveCount(result.count);
    const systems = page.locator('[aria-labelledby="products-category-platforms"]');
    const rail = systems.getByRole("list");
    await rail.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        rail.evaluate((track) => {
          const bounds = track.getBoundingClientRect();
          const visible = [...track.querySelectorAll("img")].filter((image) => {
            const box = image.getBoundingClientRect();
            return box.left < bounds.right && box.right > bounds.left;
          });
          return visible.length > 0 && visible.every((image) => image.naturalWidth > 0);
        }),
      )
      .toBe(true);
    await systems.screenshot({ path: testInfo.outputPath(`product-cards-${width}.png`) });
  }
  await expect(excluded.and(products)).toHaveCount(0);

  const card = page.locator("#products-rail-indicators a[data-product-card-photo-first]").first();
  const destination = await card.getAttribute("href");
  await card.scrollIntoViewIfNeeded();
  const hitTargets = await card.evaluate((link) =>
    ["img", "h3", "svg"].map((selector) => {
      const { x, y, width, height } = link.querySelector(selector)!.getBoundingClientRect();
      const hit = document.elementFromPoint(x + width / 2, y + height / 2);
      return hit?.closest("a") === link && getComputedStyle(hit).cursor === "pointer";
    }),
  );
  expect(hitTargets).toEqual([true, true, true]);
  await card.hover();
  await expect(card.locator("svg")).toHaveCSS("color", "rgb(29, 29, 31)");
  const arrow = (await card.locator("svg").boundingBox())!;
  await page.mouse.click(arrow.x + arrow.width / 2, arrow.y + arrow.height / 2);
  await expect(page).toHaveURL((url) => url.pathname === destination);
  await page.goBack();
  await card.focus();
  await card.press("Enter");
  await expect(page).toHaveURL((url) => url.pathname === destination);
});

test("whole product card and corner chevron open the same SKU", async ({ page }) => {
  await page.goto("/products");
  const card = page.locator("#products-rail-scales [data-warehouse-sku='G106315'] > a");
  const href = await card.getAttribute("href");
  await card.scrollIntoViewIfNeeded();
  const hits = await card.evaluate((link) => {
    const box = link.getBoundingClientRect();
    const samples = ["h3", "img", "svg"].map((selector) => {
      const rect = link.querySelector(selector)!.getBoundingClientRect();
      return [
        (Math.max(rect.left, box.left) + Math.min(rect.right, box.right)) / 2,
        (Math.max(rect.top, box.top) + Math.min(rect.bottom, box.bottom)) / 2,
      ];
    });
    samples.push([box.left + 24, box.top + 10]);
    return samples.map(([x, y]) => {
      const hit = document.elementFromPoint(x, y);
      return hit?.closest("a") === link && getComputedStyle(hit).cursor === "pointer";
    });
  });
  expect(hits).toEqual([true, true, true, true]);
  await card.hover();
  await expect(card).toHaveCSS("translate", "none");
  await expect(card.locator("img")).toHaveCSS("scale", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(card).toHaveCSS("translate", "0px -4px");
  await expect(card.locator("img")).toHaveCSS("scale", "1.05");
  await expect(card.locator("svg")).toHaveCSS("scale", "1.1");
  const box = (await card.boundingBox())!;
  await expect
    .poll(async () => (await card.locator("[data-scale-surface]").boundingBox())?.height)
    .toBeCloseTo(box.height * 0.48, 1);
  const arrow = (await card.locator("svg").boundingBox())!;
  await page.mouse.click(arrow.x + arrow.width / 2, arrow.y + arrow.height / 2);
  await expect(page).toHaveURL((url) => url.pathname === href);
  await page.goBack();
  await card.focus();
  await card.press("Enter");
  await expect(page).toHaveURL((url) => url.pathname === href);
});

test("direct all-model finder keeps search and legacy query entry", async ({ page }) => {
  await page.goto("/products?catalog=all");
  const finder = page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true });
  await expect(finder).toBeVisible();
  await expect(
    finder.getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true }).getByRole("button"),
  ).toHaveCount(5);
  await finder.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("WPS10KS");
  await expect(
    finder.getByRole("heading", { level: 3, name: "WPS10KS", exact: true }).first(),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(finder).not.toBeVisible();
  await page.goto("/products?category=scales&subcategory=scale-kitchen");
  await expect(page).toHaveURL(/\/products\/category\/scales\/kitchen$/);
  await expect(page.locator('[data-scale-subcategory-page="scale-kitchen"]')).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Navbar category/industrial navigation retains one active header/footer through history", async ({
  page,
}) => {
  await page.goto("/products");
  for (const [name, href] of [
    ["เครื่องชั่ง", "/products/category/scales"],
    ["อุตสาหกรรม", "/products/category/scales/industrial"],
  ]) {
    const panel = await openScalesMenu(page);
    if (name === "เครื่องชั่ง")
      await page.locator("[data-products-nav]").getByRole("link", { name, exact: true }).click();
    else await panel.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(href + "$"));
    await expect(page.locator(":is([data-products-header], .site-header):visible")).toHaveCount(1);
    await expect(page.locator(":is([data-products-footer], .site-footer):visible")).toHaveCount(1);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.goBack();
    await expect(page.locator("[data-products-directory]")).toBeVisible();
    await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
    await expect(page.locator("[data-products-footer]:visible")).toHaveCount(1);
  }
});

test("Navbar hover reveals each submenu and honors reduced motion and keyboard input", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/products");
  await expect(page.locator('[data-products-overview][data-controls-ready="true"]')).toBeVisible();
  const nav = page.locator("[data-products-nav]");
  const scales = nav.getByRole("link", { name: "เครื่องชั่ง", exact: true });
  const indicators = nav.getByRole("link", { name: "อินดิเคเตอร์แท่นชั่ง", exact: true });
  const panel = page.locator("#products-navigation-panel");
  await scales.hover();
  await page.mouse.move(10, 400);
  await page.waitForTimeout(350);
  await expect(panel).toHaveCount(0);

  for (const [trigger, category] of [
    [scales, "scales"],
    [indicators, "indicators"],
  ] as const) {
    await trigger.hover();
    const menu = panel.locator(`[data-nav-menu="/products/category/${category}"]`);
    await expect(menu).toHaveAttribute("data-nav-hover-reveal");
    const entries = menu.locator('[data-nav-column="primary"] [data-nav-hover-item]');
    await expect(entries.first()).toHaveCSS("animation-duration", "0.32s");
    await expect(entries.first()).toHaveCSS(
      "animation-timing-function",
      "cubic-bezier(0.4, 0, 0.6, 1)",
    );
    await expect(entries.nth(1)).toHaveCSS("animation-delay", "0.02s");
    await expect(panel.locator("[data-nav-menu]")).toHaveCount(1);
  }
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await scales.press("ArrowDown");
  await expect(panel.locator("[data-nav-hover-item]").first()).toHaveCSS("animation-name", "none");
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.mouse.move(10, 400);
  await indicators.hover();
  await expect(panel.locator("[data-nav-hover-item]").first()).toHaveCSS("animation-name", "none");

  await page.goto("/products/category/scales");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("[data-products-header] button:visible").first()).toBeEnabled();
  await page.mouse.move(10, 400);
  await scales.hover();
  await expect(panel.locator("[data-nav-hover-item]").first()).toHaveCSS(
    "animation-name",
    "navHoverReveal",
  );
});

test("Navbar flyout on touch widths opens by tapping without hover animation", async ({
  browser,
  baseURL,
}) => {
  for (const width of [768, 390]) {
    const page = await browser.newPage({
      baseURL,
      viewport: { width, height: 900 },
      hasTouch: true,
    });
    try {
      await page.goto("/products");
      await page.getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
      await page.getByRole("button", { name: "เปิดเมนูย่อยเครื่องชั่ง", exact: true }).tap();
      await expect(page.locator("[data-nav-menu]")).toHaveCSS("animation-name", "none");
    } finally {
      await page.close();
    }
  }
});

test("storefront products are readable immediately in both motion modes", async ({ page }) => {
  await recordStaggerMotion(page);
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/products");
    const directory = page.locator("[data-products-directory]");
    await expect(directory.getByRole("heading", { level: 1 })).toBeInViewport();
    await directory.locator("[data-warehouse-sku]").last().scrollIntoViewIfNeeded();
    expect(
      await directory.evaluate(
        (root) =>
          (window as unknown as StaggerWindow).staggerAnimations.filter((animation) =>
            root.contains((animation.effect as KeyframeEffect).target),
          ).length,
      ),
    ).toBe(0);
  }
});

test("mobile product rail supports native horizontal keyboard scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products");
  const rail = page.locator("[data-products-category-section]").first().locator("ul");
  await rail.focus();
  await expect(rail).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBeGreaterThan(100);
  await page.keyboard.press("ArrowLeft");
  await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBe(0);
  await expect(rail).toHaveCSS("scroll-snap-type", /x mandatory|inline mandatory/);
});

test("server response contains actual category products without motion hiding", async ({
  request,
}) => {
  const response = await request.get("/products");
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain("ผลิตภัณฑ์ทั้งหมด");
  expect(html).not.toContain("data-products-index-carousel");
  expect(html).toContain('id="products-categories"');
  for (const category of [
    "เครื่องชั่ง",
    "อินดิเคเตอร์แท่นชั่ง",
    "โครงสร้างแท่นชั่ง",
    "ระบบ POS",
    "อุปกรณ์เสริม",
  ])
    expect(html).toContain(category);
  expect(html).toContain("เครื่องชั่งมาตรฐานที่ไว้วางใจ");
  expect(html.match(/data-design="/g)).toHaveLength(34);
  expect(html).not.toContain("รอเพิ่มเนื้อหาหลัก");
  expect(html).toContain("data-products-category-section");
  expect(html).toContain('id="products-calibration"');
  expect(html).not.toContain('id="products-rail-uncategorized"');
  expect(html).toContain("data-warehouse-sku");
  expect(html).not.toContain("data-stagger-bounce=");
});

test("shared scales hero pauses for reduced motion, supports keyboard tabs, play and offscreen pause", async ({
  page,
}) => {
  await page.goto("/products/category/scales");
  const hero = page.locator('[data-overview-section="hero"]');
  const tabs = hero.getByRole("tab");
  await expect(
    hero.getByRole("button", { name: "เล่นแกลเลอรีสินค้าเด่น", exact: true }),
  ).toBeVisible();
  await expect(tabs.first()).toBeEnabled();
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await hero.getByRole("button", { name: "เล่นแกลเลอรีสินค้าเด่น", exact: true }).click();
  await expect(
    hero.getByRole("button", { name: "หยุดแกลเลอรีสินค้าเด่น", exact: true }),
  ).toBeVisible();
  await page.locator("[data-products-footer]").scrollIntoViewIfNeeded();
  await expect(
    hero.getByRole("button", { name: "เล่นแกลเลอรีสินค้าเด่น", exact: true }),
  ).toHaveCount(1);
});

test.describe("shared scales gallery touch gestures", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("native swipe moves the hero while vertical page scrolling remains available", async ({
    page,
    context,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/products/category/scales");
    const track = page.locator('[data-overview-section="hero"] ul');
    await track.scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("button", { name: "หยุดแกลเลอรีสินค้าเด่น", exact: true }),
    ).toBeVisible();
    await page.bringToFront();
    const session = await context.newCDPSession(page);
    const swipe = async (dx: number, dy: number) => {
      const bounds = (await track.boundingBox())!;
      const x = dx ? 300 : 195;
      const y = Math.max(100, Math.min(700, bounds.y + bounds.height / 2));
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
    };
    await swipe(-240, 0);
    await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(100);
    await expect(
      page.getByRole("button", { name: "เล่นแกลเลอรีสินค้าเด่น", exact: true }),
    ).toBeVisible();
    await track.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => scrollY);
    await swipe(0, -120);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath("native-touch-gallery.png") });
    await session.detach();
  });
});
