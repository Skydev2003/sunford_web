import { expect, test, type Page } from "@playwright/test";

test.use({
  viewport: { width: 393, height: 852 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 3,
});

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

test("a horizontal swipe browses the shelf and a vertical swipe scrolls the page", async ({
  page,
}) => {
  await page.goto("/products");
  const track = page.locator("#products-rail-scales");
  await track.scrollIntoViewIfNeeded();
  const box = (await track.boundingBox())!;
  const y = box.y + box.height / 2;
  await drag(page, [320, y], [80, y]);
  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(40);
  await expect(page).toHaveURL("/products");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const top = await page.evaluate(() => scrollY);
  await drag(page, [190, y], [190, y - 140]);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(top);
});

test("touch category selection and product taps open the linked pages", async ({ page }) => {
  await page.goto("/products");
  const category = page.locator("#products-categories a").last();
  await category.tap();
  await expect(page).toHaveURL("/products/category/accessories");
  await page.goBack();
  const link = page.locator("#products-rail-scales a").first();
  const href = await link.getAttribute("href");
  await link.tap();
  await expect(page).toHaveURL(href!);
});
