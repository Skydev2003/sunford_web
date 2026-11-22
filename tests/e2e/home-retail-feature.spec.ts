import { expect, test } from "@playwright/test";

for (const [width, reducedMotion] of [
  [390, "reduce"],
  [1440, "no-preference"],
] as const) {
  test(`Home & Retail story opens its source categories at ${width}px`, async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion });
    await page.goto("/products");
    const feature = page.locator("#products-rail-pos [data-home-retail-feature]");
    await expect(feature.getByRole("heading", { level: 3 })).toHaveText("ชั่งให้พอดี");
    const previousCard = feature.locator("xpath=../preceding-sibling::li[1]");
    await expect(previousCard).toHaveAttribute("data-warehouse-sku", "G106179");
    const trigger = feature.getByRole("button", { name: /^ชั่งให้พอดี/ });
    const scene = feature.locator("div[aria-hidden='true']");
    const playState = () =>
      scene.evaluate((element) => getComputedStyle(element, "::before").animationPlayState);
    if (reducedMotion === "no-preference") await expect.poll(playState).toBe("paused");
    await trigger.scrollIntoViewIfNeeded();
    const image = scene.locator("img");
    await expect(image).toHaveCount(1);
    const source = await image.getAttribute("src");
    expect(new URL(source!, page.url()).searchParams.get("url")).toBe(
      "/images/products/home-retail-editorial.webp",
    );
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0);
    await expect(image).toHaveCSS("object-fit", "cover");
    expect(
      await image.evaluate((element) => {
        const image = element.getBoundingClientRect();
        const card = element.closest("[data-home-retail-feature]")!.getBoundingClientRect();
        return [
          image.x - card.x,
          image.y - card.y,
          image.width - card.width,
          image.height - card.height,
        ];
      }),
    ).toEqual([0, 0, 0, 0]);
    if (reducedMotion === "reduce") {
      expect(
        await scene.evaluate((element) => getComputedStyle(element, "::before").animationName),
      ).toBe("none");
    } else {
      await expect.poll(playState).toBe("running");
    }
    await previousCard.getByRole("link").focus();
    await page.keyboard.press("Tab");
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Tab");
    const nextCard = feature.locator("xpath=../following-sibling::li[1]");
    await expect(nextCard.getByRole("link")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Enter");
    const dialog = feature.getByRole("dialog", { name: "ครัวและกาแฟ · คำนวณราคา" });
    await expect(dialog).toBeVisible();
    const close = dialog.getByRole("button", { name: "ปิดหน้าต่างรายละเอียด" });
    await expect(close).toBeFocused();
    await expect(dialog.getByRole("link", { name: /ครัวและกาแฟ/ })).toHaveAttribute(
      "href",
      "/products/category/scales/kitchen",
    );
    await expect(dialog.getByRole("link", { name: /คำนวณราคา/ })).toHaveAttribute(
      "href",
      "/products/category/scales/price",
    );
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.press("Space");
    await close.click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click({ position: { x: 32, y: 58 } });
    await expect(dialog).toBeVisible();
    await page.mouse.click(2, 2);
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    const destination = reducedMotion === "reduce" ? "kitchen" : "price";
    await trigger.click({ position: { x: 132, y: 245 } });
    await dialog.locator(`a[href$="/${destination}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/products/category/scales/${destination}$`), {
      timeout: 20_000,
    });
    await expect(page.getByRole("heading", { level: 1, name: /ครัว|คำนวณราคา/ })).toBeVisible();
    await page.goBack();
    await expect(trigger).toBeVisible();
    await expect(dialog).toBeHidden();
  });
}

test.describe("Home & Retail touch", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("a swipe starting on the story image scrolls the rail without opening details", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    const rail = page.locator("#products-rail-pos");
    const feature = rail.locator("[data-home-retail-feature]");
    const trigger = feature.getByRole("button");
    await trigger.scrollIntoViewIfNeeded();
    await expect(trigger).toBeInViewport({ ratio: 0.9 });
    const bounds = (await trigger.boundingBox())!;
    const before = await rail.evaluate((list) => list.scrollLeft);
    const touch = await page.context().newCDPSession(page);
    const y = bounds.y + 245;
    const x = bounds.x + 250;
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (let delta = 25; delta <= 225; delta += 25) {
      await touch.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x - delta, y }],
      });
    }
    await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(() => rail.evaluate((list) => list.scrollLeft)).toBeGreaterThan(before);
    await expect(feature.getByRole("dialog")).toBeHidden();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
