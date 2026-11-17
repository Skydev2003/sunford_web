import { expect, test, type Page } from "@playwright/test";
import { build } from "esbuild";
import catalog from "../../src/features/catalog/data/products-index-carousel.json";
import type { ClientProduct } from "../../src/features/catalog/types";

const label = "ยังไม่มีข้อมูลสินค้าเครื่องชั่ง";
const placeholder = "[data-product-image-placeholder]";
let script: string;
let css: string;

test.beforeAll(async () => {
  // Bundle the actual components into an intercepted browser-only document.
  // The image adapter isolates prop/error recovery; live-route tests cover Next's optimizer.
  const result = await build({
    stdin: {
      contents: `
        import React from 'react';
        import { createRoot } from 'react-dom/client';
        import { ProductImage } from './src/components/ui/product-image';
        import { ProductsIndexContent } from './src/features/catalog/components/products-index-content';
        import './src/styles/base.css';
        import './src/styles/content.css';
        const root = createRoot(document.getElementById('root'));
        window.addEventListener('fixture-props', ({ detail }) => {
          if (detail.products) {
            root.render(<ProductsIndexContent products={detail.products} categories={detail.categories ?? []} />);
          } else {
            const { boxWidth = 280, boxHeight = 220, background = '#fff', ...props } = detail;
            root.render(<div style={{position:'relative', width:boxWidth, height:boxHeight, background}}>
              <ProductImage placeholder="product" alt="สินค้าทดสอบ" fill {...props} />
            </div>);
          }
        });
      `,
      resolveDir: process.cwd(),
      loader: "tsx",
    },
    bundle: true,
    write: false,
    outdir: "browser-fixture",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [
      {
        name: "browser-image-adapter",
        setup(builder) {
          builder.onResolve({ filter: /^next\/(image|link)$/ }, ({ path }) => ({
            path,
            namespace: "browser-adapter",
          }));
          builder.onLoad({ filter: /.*/, namespace: "browser-adapter" }, ({ path }) => ({
            contents:
              path === "next/image"
                ? `import React from 'react'; export default function Image({fill, sizes, preload, unoptimized, ...props}) {
                    return React.createElement('img', {...props, style: fill ? {position:'absolute',inset:0,width:'100%',height:'100%'} : undefined});
                  }`
                : `import React from 'react'; export default function Link({prefetch, ...props}) {return React.createElement('a', props);}`,
            resolveDir: process.cwd(),
          }));
        },
      },
    ],
  });
  script = result.outputFiles.find((file) => file.path.endsWith(".js"))!.text;
  css = result.outputFiles.find((file) => file.path.endsWith(".css"))!.text;
});

async function harness(page: Page) {
  await page.route("**/__product-image-harness__", (route) =>
    route.fulfill({ contentType: "text/html", body: '<div id="root"></div>' }),
  );
  await page.goto("/__product-image-harness__");
  await page.addStyleTag({ content: css });
  await page.addScriptTag({ content: script });
  await page.emulateMedia({ reducedMotion: "reduce" });
}

async function render(page: Page, props: Record<string, unknown>) {
  await page.evaluate(
    (detail) => window.dispatchEvent(new CustomEvent("fixture-props", { detail })),
    props,
  );
}

async function sampleImages(page: Page) {
  const requests: string[] = [];
  await page.route("**/fixture-photo.svg?*", (route) => {
    const url = route.request().url();
    requests.push(url);
    return url.includes("v=bad")
      ? route.fulfill({ status: 404, body: "" })
      : route.fulfill({
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><circle cx="60" cy="60" r="40" fill="gray"/></svg>',
        });
  });
  return requests;
}

for (const width of [320, 390, 834, 1440]) {
  test(`transparent icon and captions fit cards and thumbnails at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await harness(page);
    for (const size of [36, 48, 65, 76, 96, 280]) {
      await render(page, { boxWidth: size, boxHeight: size, background: "rgb(242, 243, 244)" });
      const fallback = page.locator(placeholder);
      await expect(fallback).toHaveAccessibleName(`${label}: สินค้าทดสอบ`);
      await expect(fallback).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      const bounds = (await fallback.boundingBox())!;
      expect(bounds.width).toBe(size);
      expect(bounds.height).toBe(size);
      await expect(fallback.locator("span")).toBeVisible({ visible: size >= 140 });
      await expect
        .poll(() =>
          fallback
            .locator("img")
            .evaluate(
              (img) =>
                (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0,
            ),
        )
        .toBe(true);
      const alpha = await fallback.locator("img").evaluate((node) => {
        const image = node as HTMLImageElement;
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d")!;
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, 1, 1).data[3];
      });
      expect(alpha).toBe(0);
      const overflow = await fallback.evaluate(
        (node) => node.scrollWidth > node.clientWidth || node.scrollHeight > node.clientHeight,
      );
      expect(overflow).toBe(false);
    }
    await page.screenshot({ path: test.info().outputPath(`transparent-placeholder-${width}.png`) });
  });
}

test("mounted product image recovers on the next version and generic media stays unchanged", async ({
  page,
}) => {
  await harness(page);
  const requests = await sampleImages(page);
  await render(page, {});
  await expect(page.locator(placeholder)).toBeVisible();
  await render(page, { src: "/fixture-photo.svg?v=1" });
  const image = page.locator("#root img");
  await expect(image).toHaveAttribute("src", "/fixture-photo.svg?v=1");
  await expect(page.locator(placeholder)).toHaveCount(0);
  await render(page, {
    src: "/fixture-photo.svg?v=bad",
    fallbackSrc: "/fixture-photo.svg?v=bad-fallback",
  });
  await expect(page.locator(placeholder)).toBeVisible();
  await render(page, { src: "/fixture-photo.svg?v=2" });
  await expect(image).toHaveAttribute("src", "/fixture-photo.svg?v=2");
  await expect
    .poll(() =>
      image.evaluate(
        (img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0,
      ),
    )
    .toBe(true);
  await expect(page.locator(placeholder)).toHaveCount(0);
  await render(page, { src: "/fixture-photo.svg?v=bad" });
  await expect(page.locator(placeholder)).toBeVisible();
  expect(requests.filter((url) => url.endsWith("v=bad"))).toHaveLength(1);
  await render(page, { placeholder: "media" });
  await expect(page.locator(".media-placeholder")).toHaveText("พื้นที่สำหรับรูปภาพ");
  await expect(page.locator(placeholder)).toHaveCount(0);
});

for (const width of [390, 834, 1440]) {
  test(`real curated product without a photo remains in directory and carousel at ${width}px`, async ({
    page,
    request,
  }) => {
    const { products } = await (await request.get("/api/products")).json();
    const item = catalog.products[0];
    const product = (products as ClientProduct[]).find(
      (product) => product.id === item.id || product.warehouseSku === item.warehouseSku,
    )!;
    expect(product).toBeTruthy();
    const missing = { ...product, image: "", fallbackImage: undefined };
    const categories = [
      { id: item.categoryId, label: item.categoryLabel, productIds: [product.id] },
    ];
    await page.setViewportSize({ width, height: 900 });
    await harness(page);
    await sampleImages(page);
    await render(page, { products: [missing], categories });
    const scene = page.locator("[data-products-index-carousel]");
    await expect(scene).toHaveAttribute("data-interactive", "true");
    const selected = scene.locator('[data-product-photo][aria-current="true"]');
    await expect(selected.locator(placeholder)).toBeVisible();
    const card = page.locator("[data-products-category-section] li");
    await expect(card.locator(placeholder)).toBeVisible();
    await expect(card.locator("a").first()).toHaveAttribute("href", `/products/${product.slug}`);
    await selected.click();
    await expect(page.getByRole("dialog").locator(placeholder).first()).toBeVisible();
    await page.getByRole("button", { name: "กลับไปเลือกสินค้า" }).click();
    await render(page, {
      products: [{ ...missing, image: "/fixture-photo.svg?v=bad" }],
      categories,
    });
    await expect(selected.locator(placeholder)).toBeVisible();
    await render(page, { products: [{ ...missing, image: "/fixture-photo.svg?v=2" }], categories });
    await expect(selected.locator("img")).toHaveAttribute("src", "/fixture-photo.svg?v=2");
    await expect(selected.locator(placeholder)).toHaveCount(0);
    await expect(card.locator(placeholder)).toHaveCount(0);
  });
}

test("live directory and product detail use the new icon with Warehouse-only data", async ({
  page,
  request,
}) => {
  const { products } = await (await request.get("/api/products")).json();
  const missing = products.find(
    (product: { warehouseCard?: { image?: string }; slug: string }) =>
      product.warehouseCard && !product.warehouseCard.image,
  );
  expect(missing).toBeTruthy();
  await page.goto("/products");
  const card = page.locator(`[data-warehouse-sku="${missing.warehouseSku}"]`).first();
  await expect(card.locator(placeholder)).toBeVisible();
  await card.locator("a").first().click();
  await expect(page.locator(".detail-image").locator(placeholder)).toBeVisible();
  await expect(page.locator(".detail-image").locator(placeholder)).toHaveAccessibleName(
    new RegExp(label),
  );
  await page.screenshot({ path: test.info().outputPath("live-product-without-photo.png") });
});

for (const width of [390, 1440]) {
  test(`live search, comparison, builder and quotation use product placeholders at ${width}px`, async ({
    page,
    request,
  }) => {
    test.setTimeout(120_000);
    const { products } = await (await request.get("/api/products")).json();
    const missing = products.find(
      (product: { warehouseCard?: { image?: string }; warehouseSku?: string }) =>
        product.warehouseCard && !product.warehouseCard.image && product.warehouseSku,
    );
    expect(missing).toBeTruthy();
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route(/\/_next\/image\?/, (route) => route.abort());
    await page.route("**/api/quotations/issue", (route) => route.abort());
    await page.goto("/");
    await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
    await page.locator("#category-feature-media").scrollIntoViewIfNeeded();
    await expect(page.locator(`#category-feature-media ${placeholder}`).first()).toBeVisible();
    await page.getByRole("button", { name: "ค้นหาสินค้า", exact: true }).click();
    await page.getByRole("textbox", { name: "ค้นหาสินค้า Sunford" }).fill(missing.warehouseSku);
    await expect(
      page.locator(`.search-results a[href="/products/${missing.slug}"]`).locator(placeholder),
    ).toBeVisible();
    await page.keyboard.press("Escape");

    await page.goto("/products?catalog=all");
    const finder = page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true });
    await finder.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill(missing.warehouseSku);
    const result = finder.locator("#mock-product-results article").first();
    await expect(result.locator(placeholder)).toBeVisible();
    await finder.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
    await result.getByRole("button", { name: /เพิ่มเพื่อเปรียบเทียบ/ }).click();
    await page.getByRole("button", { name: "ดูการเปรียบเทียบ" }).click();
    await expect(
      page.getByRole("dialog", { name: "เปรียบเทียบสินค้า", exact: true }).locator(placeholder),
    ).toBeVisible();

    await page.goto("/guides/indicator-platform-compatibility");
    const builder = page.getByRole("region", { name: "เลือกอุปกรณ์จัดชุด" });
    await expect(builder.locator("article").first().locator(placeholder)).toBeVisible();
    const selectable = builder.locator("article button:enabled");
    if (!(await selectable.count()))
      await builder.getByRole("button", { name: "แท่นชั่ง", exact: true }).click();
    if (await selectable.count()) {
      await selectable.first().click();
      await expect(
        builder.getByRole("complementary", { name: "ชุดที่เลือก" }).locator(placeholder).first(),
      ).toBeVisible();
    } else {
      test.info().annotations.push({
        type: "coverage",
        description:
          "Current Warehouse options have no selectable compatible pair; selected-item thumbnails are not rendered.",
      });
    }

    await page.goto("/service/quotation");
    const trigger = page.getByRole("button", { name: /เลือกรุ่นสินค้ารายการที่ 1/ });
    await trigger.click();
    const picker = page.getByRole("dialog", { name: "เลือกรุ่นสินค้า" });
    const choice = picker.getByRole("list", { name: "รุ่นสินค้า" }).getByRole("button").first();
    await expect(choice.locator(placeholder)).toBeVisible();
    await choice.click();
    await expect(trigger.locator(placeholder)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: test.info().outputPath(`quotation-product-placeholder-${width}.png`),
    });
  });

  test(`live categories, subcategory and solutions preserve missing-image layout at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route(/\/_next\/image\?/, (route) =>
      new URL(route.request().url()).searchParams.get("url")?.includes("logo")
        ? route.continue()
        : route.abort(),
    );
    for (const path of [
      "/products/category/scales",
      "/products/category/indicators",
      "/products/category/platforms",
      "/products/category/pos",
      "/products/category/accessories",
      "/products/category/scales/industrial",
      "/solutions",
    ]) {
      await page.goto(path);
      const fallback = page.locator(`${placeholder}:visible`).first();
      await expect(fallback).toBeVisible();
      await expect(
        page.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true }),
      ).toBeEnabled();
      await expect
        .poll(() =>
          page.locator("main img").evaluateAll(
            (nodes) =>
              nodes.filter((node) => {
                const image = node as HTMLImageElement;
                return image.complete && image.naturalWidth === 0;
              }).length,
          ),
        )
        .toBe(0);
      expect((await fallback.boundingBox())!.height).toBeGreaterThan(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({
        path: test.info().outputPath(`${path.replaceAll("/", "-")}-${width}.png`),
      });
    }
  });
}
