import { expect, test } from "@playwright/test";

const scales = "/products/category/scales";

test("catalog chapters show the directory press and hover feedback and keep keyboard navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 920 });
  await page.goto("/products");
  const directory = page
    .locator("#products-categories")
    .getByRole("link", { name: "เครื่องชั่ง", exact: true });
  await directory.hover();
  await expect(directory.locator(":scope > :first-child")).toHaveCSS(
    "transform",
    "matrix(1.01, 0, 0, 1.01, 0, -2)",
  );
  await page.mouse.down();
  await expect(directory).toHaveCSS("background-color", "rgb(234, 234, 236)");
  await page.mouse.up();
  await expect(page).toHaveURL(scales);

  const chapter = page
    .locator("#products-chapters")
    .getByRole("link", { name: "ครัวเรือนและบุคคล", exact: true });
  await chapter.hover();
  await expect(chapter.locator(":scope > :first-child")).toHaveCSS(
    "transform",
    "matrix(1.01, 0, 0, 1.01, 0, -2)",
  );
  await page.mouse.down();
  await expect(chapter).toHaveCSS("background-color", "rgb(234, 234, 236)");
  await page.mouse.move(2, 2);
  await page.mouse.up();

  await page.locator("#products-chapters").focus();
  await page.keyboard.press("Tab");
  await expect(chapter).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(scales + "/kitchen");
  await page.goBack();
  await expect(chapter).toBeVisible();
});

test.describe("mobile catalog menus", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("a touch press gives feedback without moving the image in reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(scales);
    await expect(page.locator('[data-controls-ready="true"]')).toBeVisible();
    const chapter = page
      .locator("#products-chapters")
      .getByRole("link", { name: "ครัวเรือนและบุคคล", exact: true });
    await chapter.scrollIntoViewIfNeeded();
    const bounds = await chapter.boundingBox();
    if (!bounds) throw new Error("The kitchen chapter is not visible");
    const touch = await page.context().newCDPSession(page);
    const press = () =>
      touch.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }],
      });
    await press();
    await expect(chapter).toHaveCSS("background-color", "rgb(234, 234, 236)");
    await expect(chapter).toHaveCSS("transition-duration", "0s");
    await expect(chapter.locator(":scope > :first-child")).toHaveCSS("transform", "none");
    await touch.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
    await expect(chapter).not.toHaveAttribute("data-touch-pressed");
    await expect(page).toHaveURL(scales);

    await press();
    await expect(chapter).toHaveAttribute("data-touch-pressed");
    await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(page).toHaveURL(scales + "/kitchen");
  });
});
