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
    await expect(feature.locator("xpath=../preceding-sibling::li[1]")).toHaveAttribute(
      "data-warehouse-sku",
      "G106179",
    );
    const trigger = feature.getByRole("button", { name: "สำรวจครัวและกาแฟ และงานขายหน้าร้าน" });
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
    expect(await image.boundingBox()).toEqual(await feature.boundingBox());
    if (reducedMotion === "reduce") {
      expect(
        await scene.evaluate((element) => getComputedStyle(element, "::before").animationName),
      ).toBe("none");
    } else {
      await expect.poll(playState).toBe("running");
    }
    await trigger.press("Enter");
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

    await trigger.click();
    await page.mouse.click(2, 2);
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    const destination = reducedMotion === "reduce" ? "kitchen" : "price";
    await trigger.click();
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
