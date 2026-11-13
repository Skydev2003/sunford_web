import { test, expect } from "@playwright/test";
import catalog from "../../src/features/catalog/data/products-index-carousel.json";
import type { ClientProduct } from "../../src/features/catalog/types";

function photographedSelection(products: ClientProduct[]) {
  return catalog.products.filter((item) =>
    products.some(
      (product) =>
        (product.id === item.id ||
          (item.warehouseSku && product.warehouseSku === item.warehouseSku)) &&
        product.image.trim(),
    ),
  );
}

for (const width of [320, 390, 834, 1440, 1887]) {
  test(`model row stays contained and every label remains selectable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/products");
    const scene = page.locator("[data-products-index-carousel]");
    await expect(scene).toHaveAttribute("data-interactive", "true");
    const row = scene.locator(":scope > div").filter({ has: page.locator("button[aria-current]") });
    const bounds = (await row.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    await expect(row.getByRole("button").first()).toHaveCSS("white-space", "nowrap");
    const initial = await scene.locator("h2").first().innerText();
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.wheel(320, 0);
    await expect(row.getByRole("button")).toHaveCount(3);
    if (await row.evaluate((el) => el.scrollWidth > el.clientWidth))
      await expect.poll(() => row.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    await expect(scene.locator("h2").first()).toHaveText(initial);
    await row.evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
    });
    const last = row.getByRole("button").last();
    const model = await last.innerText();
    await last.click();
    await expect(scene.locator("h2").first()).toHaveText(model);
    await expect(last).toHaveAttribute("aria-current", "true");
    const pageY = await page.evaluate(() => scrollY);
    await scene.getByRole("button", { name: "สินค้ารุ่นถัดไป", exact: true }).click();
    await expect
      .poll(() =>
        row.locator('[aria-current="true"]').evaluate((el) => {
          const label = el.getBoundingClientRect();
          const group = el.parentElement!.getBoundingClientRect();
          return label.left >= group.left - 1 && label.right <= group.right + 1;
        }),
      )
      .toBe(true);
    expect(await page.evaluate(() => scrollY)).toBe(pageY);
    await page.screenshot({ path: test.info().outputPath(`model-row-${width}.png`) });
  });
}

test.describe("mobile carousel gestures", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("model labels scroll natively without changing the selected product", async ({
    page,
    context,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/products");
    const scene = page.locator("[data-products-index-carousel]");
    const row = scene.locator(":scope > div").filter({ has: page.locator("button[aria-current]") });
    const model = await scene.locator("h2").first().innerText();
    const bounds = (await row.boundingBox())!;
    const y = bounds.y + bounds.height / 2;
    const session = await context.newCDPSession(page);
    try {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: 320, y }],
      });
      for (let step = 1; step <= 8; step++)
        await session.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: 320 - step * 25, y }],
        });
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      if (await row.evaluate((el) => el.scrollWidth > el.clientWidth))
        await expect.poll(() => row.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
      await expect(scene.locator("h2").first()).toHaveText(model);
    } finally {
      await session.detach();
    }
  });
  for (const surface of ["background", "photo"] as const)
    test(`${surface} swipes select one model horizontally and scroll the page vertically`, async ({
      page,
      context,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/products");
      const scene = page.locator("[data-products-index-carousel]");
      const current = scene.locator("[data-product-photo][aria-current=true]");
      await expect(current.locator("img")).toHaveAttribute("data-ready", "true");
      const labels = await scene
        .locator("[data-product-photo]")
        .evaluateAll((photos) => photos.map((photo) => photo.getAttribute("aria-label") ?? ""));
      await page.bringToFront();
      const session = await context.newCDPSession(page);
      async function swipe(dx: number, dy: number) {
        const { x, y } = await scene.evaluate((el, surface) => {
          if (surface === "photo") {
            const photo = el.querySelector("[data-product-photo][aria-current=true]")!;
            const rect = photo.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            if (!photo.contains(document.elementFromPoint(x, y)))
              throw Error("Expected a visible product photo");
            return { x, y };
          }
          const r = el.getBoundingClientRect();
          for (
            let y = Math.max(90, r.top + 30);
            y < Math.min(innerHeight - 100, r.bottom - 30);
            y += 12
          ) {
            for (const x of [195, 150, 240, 135, 255]) {
              if (
                [-22, 0, 22].every((ox) =>
                  [-22, 0, 22].every((oy) => document.elementFromPoint(x + ox, y + oy) === el),
                )
              )
                return { x, y };
            }
          }
          throw Error("No visible carousel background found");
        }, surface);
        await session.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x, y }],
        });
        for (let step = 1; step <= 8; step++) {
          await session.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [{ x: x + (dx * step) / 8, y: y + (dy * step) / 8 }],
          });
        }
        if (Math.abs(dy) > Math.abs(dx)) await page.waitForTimeout(180); // Release after the drag, avoiding a kinetic fling.
        await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      }
      try {
        const initial = await page.evaluate(() => scrollY);
        await swipe(-120, 5);
        await expect(current).toHaveAttribute("aria-label", labels[1]);
        await swipe(120, -4);
        await expect(current).toHaveAttribute("aria-label", labels[0]);
        expect(await page.evaluate(() => scrollY)).toBe(initial);
        await expect(page.getByRole("dialog")).toHaveCount(0);
        if (surface === "background") await swipe(-12, 2);
        await expect(current).toHaveAttribute("aria-label", labels[0]);
        await swipe(8, -110);
        await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(initial + 30);
        await page.evaluate(() => window.scrollTo({ top: 180, behavior: "instant" }));
        await swipe(8, 110);
        await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(150);
        await expect(current).toHaveAttribute("aria-label", labels[0]);
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await current.tap();
        await expect(
          page.getByRole("dialog", { name: labels[0].replace(/^ดูรายละเอียด /, "") }),
        ).toBeVisible();
      } finally {
        await session.detach();
      }
    });
});

for (const width of [390, 1440]) {
  test(`name-only copy and reference dropdown work at ${width}px`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/products");
    const scene = page.locator("[data-products-index-carousel]");
    const copy = scene.locator("[data-products-carousel-copy]");
    const dropdown = scene.locator("[data-category-dropdown]");
    const trigger = dropdown.getByRole("button", { name: /^หมวดสินค้า:/ });
    const listbox = dropdown.getByRole("listbox", { name: "หมวดสินค้า" });
    const { products } = await (await request.get("/api/products")).json();
    const selection = photographedSelection(products);
    const selectedCategories = catalog.categories.filter((category) =>
      selection.some((product) => product.categoryId === category.id),
    );
    const accessory = selection.find((product) => product.categoryId === "accessories")!;

    await expect(copy.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(copy.locator(":scope > p, :scope > small")).toHaveCount(0);
    await expect(dropdown).toHaveAttribute("data-open", "false");
    await expect(trigger).toHaveCSS("border-top-width", "0px");
    await expect(trigger.locator("i")).toHaveCSS("color", "rgb(80, 74, 89)");
    await trigger.focus();
    await expect(trigger).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(trigger).toHaveCSS("box-shadow", "none");
    await expect(trigger.locator("span")).toHaveCSS("text-decoration-line", "underline");
    const alignment = await copy.evaluate((element) => {
      const dropdown = element.querySelector<HTMLElement>("[data-category-dropdown]")!;
      const heading = element.querySelector<HTMLElement>("h2")!;
      const text = dropdown.querySelector<HTMLElement>("button span")!;
      const chevron = dropdown.querySelector<HTMLElement>("button i")!;
      const dropdownBox = dropdown.getBoundingClientRect();
      const headingBox = heading.getBoundingClientRect();
      const textBox = text.getBoundingClientRect();
      const chevronBox = chevron.getBoundingClientRect();
      const headingCenter = headingBox.left + headingBox.width / 2;
      return {
        dropdownCenterDelta: Math.abs(dropdownBox.left + dropdownBox.width / 2 - headingCenter),
        controlCenterDelta: Math.abs((textBox.left + chevronBox.right) / 2 - headingCenter),
        textChevronGap: chevronBox.left - textBox.right,
      };
    });
    expect(alignment.dropdownCenterDelta).toBeLessThan(1);
    expect(alignment.controlCenterDelta).toBeLessThan(2);
    expect(alignment.textChevronGap).toBeGreaterThan(2);
    expect(alignment.textChevronGap).toBeLessThan(12);
    await page.screenshot({ path: test.info().outputPath(`category-trigger-closed-${width}.png`) });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(dropdown).toHaveAttribute("data-open", "true");
    await expect(listbox).toBeVisible();
    await expect(listbox.getByRole("option")).toHaveText(
      selectedCategories.map((item) => item.label),
    );
    await expect(listbox.getByRole("option", { selected: true })).toHaveCount(1);
    await expect(listbox.getByRole("option", { selected: true })).toHaveCSS(
      "background-color",
      "rgb(248, 217, 220)",
    );
    await expect(listbox).toHaveCSS("scrollbar-width", "none");
    expect(
      await listbox.evaluate((element) => getComputedStyle(element, "::-webkit-scrollbar").display),
    ).toBe("none");
    await page.screenshot({ path: test.info().outputPath(`category-dropdown-open-${width}.png`) });

    const listboxBounds = (await listbox.boundingBox())!;
    await page.mouse.move(
      listboxBounds.x + listboxBounds.width / 2,
      listboxBounds.y + listboxBounds.height / 2,
    );
    await page.mouse.wheel(0, 360);
    await expect.poll(() => listbox.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

    await page.keyboard.press("Escape");
    await expect(dropdown).toHaveAttribute("data-open", "false");
    await expect(trigger).toBeFocused();
    await trigger.press("ArrowDown");
    await expect(listbox).toBeVisible();
    await page.keyboard.press("End");
    const lastOption = listbox.getByRole("option").last();
    await expect(lastOption).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAccessibleName(/อุปกรณ์เสริม/);
    await expect(scene.locator("[data-product-photo][aria-current=true]")).toHaveAttribute(
      "data-product-photo",
      accessory.id,
    );
    await expect(trigger).toBeFocused();

    await trigger.click();
    const bounds = (await scene.boundingBox())!;
    await page.mouse.click(bounds.x + bounds.width - 8, bounds.y + 8);
    await expect(dropdown).toHaveAttribute("data-open", "false");
    await expect(scene.getByRole("link", { name: /ส่วนถัดไป/ })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

for (const width of [390, 834, 1440]) {
  test(`photographed carousel and detail return at ${width}px`, async ({ page, request }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const { products } = await (await request.get("/api/products")).json();
    const shown = photographedSelection(products);
    expect(shown.length).toBeGreaterThan(0);
    await page.goto("/products");
    const scene = page.locator("[data-products-index-carousel]");
    const current = scene.locator("[data-product-photo][aria-current=true]");
    await expect(scene.locator("[data-product-photo]")).toHaveCount(shown.length);
    await expect(scene.locator("[data-product-photo] img[data-ready=true]")).toHaveCount(
      shown.length,
      { timeout: 20000 },
    );
    expect(
      await scene.locator("[data-product-photo] img").evaluateAll(async (images) =>
        Promise.all(
          images.map(async (element) => {
            const image = element as HTMLImageElement;
            await image.decode();
            return image.naturalWidth > 0 && image.naturalHeight > 0;
          }),
        ),
      ),
    ).toEqual(shown.map(() => true));
    await expect(page.locator("[data-products-category-section] h2").first()).toHaveText(
      "เครื่องชั่ง",
    );
    for (const product of shown) {
      const live = products.find(
        (p: { id: string; warehouseSku: string }) =>
          p.id === product.id || (product.warehouseSku && p.warehouseSku === product.warehouseSku),
      );
      await expect(current).toHaveAttribute("data-product-photo", product.id);
      expect(await current.locator("img").getAttribute("src")).toBe(live?.image || null);
      await expect(scene.locator("h2").first()).toHaveText(live?.name ?? "");
      await expect(scene.locator("[data-equalizer] small").first()).toHaveText(
        `${String(shown.indexOf(product) + 1).padStart(2, "0")} / ${shown.length}`,
      );
      await current.click();
      await expect(
        page.getByRole("dialog").getByRole("link", { name: "ดูรายละเอียดทั้งหมด" }),
      ).toHaveAttribute("href", `/products/${live.slug}`);
      await page.keyboard.press("Escape");
      await scene.getByRole("button", { name: "สินค้ารุ่นถัดไป", exact: true }).click();
    }
    await expect(current).toHaveAttribute("data-product-photo", shown[0].id);
    await current.click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    const href = await modal
      .getByRole("link", { name: "ดูรายละเอียดทั้งหมด" })
      .getAttribute("href");
    expect(href).toBe("/products/warehouse-G106094");
    expect((await request.get(href!)).status()).toBe(200);
    await page.keyboard.press("Escape");
    await expect(current).toBeFocused();
    const categoryTrigger = scene.getByRole("button", { name: /^หมวดสินค้า:/ });
    await categoryTrigger.click();
    await scene
      .getByRole("listbox", { name: "หมวดสินค้า" })
      .getByRole("option", { name: "อุปกรณ์เสริม", exact: true })
      .click();
    const accessory = shown.find((p) => p.categoryId === "accessories")!;
    const liveAccessory = products.find(
      (p: { id: string; warehouseSku: string }) =>
        p.id === accessory.id ||
        (accessory.warehouseSku && p.warehouseSku === accessory.warehouseSku),
    );
    await expect(scene.locator("h2").first()).toHaveText(liveAccessory?.name ?? "");
    await page.screenshot({
      path: test.info().outputPath(`photographed-accessories-${width}.png`),
    });
    await expect(scene.getByRole("link", { name: /ส่วนถัดไป/ })).toHaveCount(0);
    const followingSection = page.locator("#products-category-scales");
    await followingSection.scrollIntoViewIfNeeded();
    await expect(followingSection).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
test("wheel advances real products and detail switches preserve photo identity", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/products");
  const scene = page.locator("[data-products-index-carousel]");
  const current = scene.locator("[data-product-photo][aria-current=true]");
  await expect(current.locator("img")).toHaveAttribute("data-ready", "true");
  const labels = await scene
    .locator("[data-product-photo]")
    .evaluateAll((photos) => photos.map((photo) => photo.getAttribute("aria-label") ?? ""));
  const blank = await scene.evaluate((element) => {
    const { left, top } = element.getBoundingClientRect();
    const x = left + 12,
      y = top + element.clientHeight / 2;
    if (document.elementFromPoint(x, y) !== element) throw Error("Expected scene background");
    return { x, y };
  });
  await page.mouse.move(blank.x, blank.y);
  const offset = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, -200);
  await expect(current).toHaveAttribute("aria-label", labels.at(-1)!);
  await page.mouse.wheel(0, 200);
  await expect(current).toHaveAttribute("aria-label", labels[0]);
  expect(await page.evaluate(() => scrollY)).toBe(offset);
  await current.hover();
  await page.mouse.wheel(0, 200);
  await expect(current).toHaveAttribute("aria-label", labels[1]);
  await current.click();
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  const next = modal.getByRole("button", { name: /ดูรายละเอียด/ }).first();
  const nextLabel = await next.getAttribute("aria-label");
  await next.click();
  await modal.getByRole("button", { name: /กลับไปเลือกสินค้า/ }).click();
  await expect(current).toHaveAttribute("aria-label", nextLabel!);
});
