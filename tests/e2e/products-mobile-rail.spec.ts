import { expect, test, type Page } from "@playwright/test";
import catalog from "../../src/features/catalog/data/products-index-carousel.json";

test.use({
  viewport: { width: 393, height: 852 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 3,
});

async function visit(page: Page) {
  await page.goto("/products");
  const scene = page.locator("[data-products-index-carousel]");
  await expect(scene).toHaveAttribute("data-mobile-rail", "true");
  const rail = scene.locator("[data-products-mobile-rail]");
  await expect(rail).toBeVisible();
  return { scene, rail };
}

async function drag(page: Page, from: [number, number], to: [number, number]) {
  const session = await page.context().newCDPSession(page);
  try {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: from[0], y: from[1] }],
    });
    for (let step = 1; step <= 10; step++) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
          {
            x: from[0] + ((to[0] - from[0]) * step) / 10,
            y: from[1] + ((to[1] - from[1]) * step) / 10,
          },
        ],
      });
      await page.waitForTimeout(20);
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  } finally {
    await session.detach();
  }
}

test("native phone rail loads only nearby sharp product images", async ({ page, request }) => {
  const { scene, rail } = await visit(page);
  await expect(rail).toHaveCSS("scroll-snap-type", "x mandatory");
  const cards = rail.locator("[data-product-photo]");
  expect(await cards.count()).toBeGreaterThan(10);
  const ids = await cards.evaluateAll((elements) =>
    elements.map((el) => el.getAttribute("data-product-photo")),
  );
  expect(new Set(ids).size).toBe(ids.length);
  await expect.poll(() => rail.locator("img").count()).toBeGreaterThan(0);
  expect(await rail.locator("img").count()).toBeLessThan(10);
  await expect(cards.first()).toHaveCSS("filter", "none");
  const image = cards.first().locator("img");
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute("src", /\/_next\/image\?/);
  const source = new URL((await image.getAttribute("src"))!, "http://localhost").searchParams.get(
    "url",
  );
  const { products } = await (await request.get("/api/products")).json();
  const identity = catalog.products.find((product) => product.id === ids[0])!;
  const live = products.find(
    (product: { id: string; warehouseSku: string }) =>
      product.id === identity.id || product.warehouseSku === identity.warehouseSku,
  );
  expect(source).toBe(live.image);
  const sizes = await Promise.all([rail.boundingBox(), cards.first().boundingBox()]);
  expect(sizes[1]!.width / sizes[0]!.width).toBeCloseTo(0.78, 2);
  await expect(scene).toHaveAttribute("data-interactive", "true");
  await page.screenshot({ path: test.info().outputPath("phone-native-rail.png") });
});

test("native product swipes select without opening detail and vertical gestures scroll the page", async ({
  page,
}) => {
  const { rail } = await visit(page);
  const initial = await rail.locator('[aria-current="true"]').getAttribute("data-product-photo");
  const box = (await rail.boundingBox())!;
  const y = box.y + box.height / 2;
  await drag(page, [320, y], [70, y]);
  await expect(rail.locator('[aria-current="true"]')).not.toHaveAttribute(
    "data-product-photo",
    initial!,
  );
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await drag(page, [200, y], [200, y - 180]);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

test("native rail category controls, detail return and landscape preserve the selected product", async ({
  page,
}) => {
  const { scene, rail } = await visit(page);
  const trigger = scene.getByRole("button", { name: /^หมวดสินค้า:/ });
  await trigger.tap();
  await scene.getByRole("listbox").getByRole("option", { name: "อุปกรณ์เสริม", exact: true }).tap();
  const current = rail.locator('[data-product-photo][aria-current="true"]');
  await expect(trigger).toHaveAccessibleName(/อุปกรณ์เสริม/);
  await expect(current).toBeInViewport();
  const id = await current.getAttribute("data-product-photo");
  await current.tap();
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  await expect(modal.locator("article > p")).toHaveCount(0);
  await expect(modal.locator("[class*=zoom], [class*=trail]")).toHaveCount(0);
  await modal.getByRole("button", { name: "กลับไปเลือกสินค้า" }).tap();
  await expect(modal).not.toBeVisible();
  await expect(current).toBeFocused();
  await page.setViewportSize({ width: 852, height: 393 });
  await expect(scene).toHaveAttribute("data-mobile-rail", "true");
  await expect(rail.locator('[aria-current="true"]')).toHaveAttribute("data-product-photo", id!);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath("phone-landscape.png") });
  await page.setViewportSize({ width: 834, height: 1112 });
  await expect(rail).toHaveCount(0);
  await expect(scene.locator('[data-product-photo][aria-current="true"]')).toHaveAttribute(
    "data-product-photo",
    id!,
  );
  await page.setViewportSize({ width: 393, height: 852 });
  await expect(rail).toBeVisible();
  await expect(rail.locator('[aria-current="true"]')).toHaveAttribute("data-product-photo", id!);
});

for (const width of [320, 430]) {
  test(`native rail stays contained with clear neighbors at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 932 });
    const { scene, rail } = await visit(page);
    const bounds = (await scene.boundingBox())!;
    expect(Math.abs(bounds.y + bounds.height - (width === 320 ? 568 : 932))).toBeLessThan(1);
    const next = scene.getByRole("button", { name: "สินค้ารุ่นถัดไป", exact: true });
    await next.tap();
    const current = rail.locator('[aria-current="true"]');
    await expect(current).not.toHaveAttribute("data-rail-index", "0");
    const boxes = await rail.locator("[data-product-photo]").evaluateAll((cards) =>
      cards.map((card) => {
        const rect = card.getBoundingClientRect();
        return { x: rect.x, right: rect.right };
      }),
    );
    expect(boxes.filter((box) => box.right > 0 && box.x < width).length).toBeGreaterThanOrEqual(3);
    const models = (await scene.locator("[data-products-models]").boundingBox())!;
    const progress = (await scene.locator("[data-equalizer]").boundingBox())!;
    expect(models.y + models.height).toBeLessThanOrEqual(progress.y - 4);
    await expect
      .poll(
        () =>
          rail.locator("img").evaluateAll(
            (images) =>
              images.filter((element) => {
                const image = element as HTMLImageElement;
                if (!image.complete || !image.naturalWidth) return false;
                const box = image.getBoundingClientRect();
                const scale = Math.min(
                  box.width / image.naturalWidth,
                  box.height / image.naturalHeight,
                );
                const left = box.left + (box.width - image.naturalWidth * scale) / 2;
                const right = left + image.naturalWidth * scale;
                return Math.min(innerWidth, right) - Math.max(0, left) > 4;
              }).length,
          ),
        { timeout: 15_000 },
      )
      .toBeGreaterThanOrEqual(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath(`native-phone-${width}.png`) });
  });
}

test("a missing mobile product image preserves card geometry and navigation", async ({
  page,
  request,
}) => {
  const { products } = await (await request.get("/api/products")).json();
  const first = products.find(
    (product: { warehouseSku: string }) =>
      product.warehouseSku === catalog.products[0].warehouseSku,
  );
  await page.route(/\/_next\/image\?/, async (route) => {
    if (new URL(route.request().url()).searchParams.get("url") === first.image) await route.abort();
    else await route.continue();
  });
  const { scene, rail } = await visit(page);
  const card = rail.locator("[data-product-photo]").first();
  await expect(card.getByRole("img", { name: /^ยังไม่มีข้อมูลสินค้าเครื่องชั่ง/ })).toBeVisible();
  const bounds = (await card.boundingBox())!;
  expect(bounds.width).toBeCloseTo(393 * 0.78, 0);
  await scene.getByRole("button", { name: "สินค้ารุ่นถัดไป", exact: true }).tap();
  await expect(rail.locator('[aria-current="true"]')).not.toHaveAttribute("data-rail-index", "0");
});

test("diagonal gestures scroll vertically and rail endpoints do not clone products", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const { rail, scene } = await visit(page);
  const first = rail.locator("[data-product-photo]").first();
  const count = await rail.locator("[data-product-photo]").count();
  await first.press("End");
  await expect(rail.locator('[aria-current="true"]')).toHaveAttribute(
    "data-rail-index",
    String(count - 1),
  );
  await scene.getByRole("button", { name: "สินค้ารุ่นถัดไป", exact: true }).tap();
  await expect(first).toHaveAttribute("aria-current", "true");
  expect(await rail.locator("[data-product-photo]").count()).toBe(count);
  const box = (await rail.boundingBox())!;
  await drag(
    page,
    [220, box.y + box.height / 2],
    [180, Math.max(80, box.y + box.height / 2 - 150)],
  );
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("a delayed image does not block native product dragging", async ({ page, request }) => {
  const { products } = await (await request.get("/api/products")).json();
  const first = products.find(
    (product: { warehouseSku: string }) =>
      product.warehouseSku === catalog.products[0].warehouseSku,
  );
  let release!: () => void;
  let waiting = false;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/\/_next\/image\?/, async (route) => {
    if (new URL(route.request().url()).searchParams.get("url") === first.image) {
      waiting = true;
      await gate;
    }
    await route.continue().catch(() => {});
  });
  try {
    const { rail } = await visit(page);
    await expect.poll(() => waiting).toBe(true);
    const box = (await rail.boundingBox())!;
    const y = box.y + box.height / 2;
    await drag(page, [320, y], [70, y]);
    await expect(rail.locator('[aria-current="true"]')).not.toHaveAttribute("data-rail-index", "0");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  } finally {
    release();
  }
});

test("native scrolling after a non-drag tap still updates product selection", async ({ page }) => {
  const { rail } = await visit(page);
  const first = (await rail.locator("[data-product-photo]").first().boundingBox())!;
  const bounds = (await rail.boundingBox())!;
  await page.mouse.click(first.x + first.width + 8, bounds.y + bounds.height / 2);
  await page.mouse.wheel(280, 0);
  await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBeGreaterThan(50);
  await expect(rail.locator('[aria-current="true"]')).not.toHaveAttribute("data-rail-index", "0");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
