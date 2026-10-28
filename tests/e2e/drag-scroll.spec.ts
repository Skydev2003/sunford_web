import { expect, test, type Locator, type Page } from "@playwright/test";

async function dragLeft(page: Page, track: Locator) {
  await track.scrollIntoViewIfNeeded();
  const bounds = (await track.boundingBox())!;
  const x = bounds.x + Math.min(bounds.width - 30, 350);
  const y = bounds.y + 100;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 280, y, { steps: 20 });
  await expect(track).toHaveClass(/is-dragging/);
  await page.mouse.up();
  await expect(track).not.toHaveClass(/is-dragging/);
  await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(150);
}

test("video strip drags without playing, hides its scrollbar and still opens on click", async ({
  page,
}) => {
  await page.goto("/");
  const track = page.locator(".video-track");
  await expect(track).toHaveCSS("scrollbar-width", "none");
  await dragLeft(page, track);
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page).toHaveURL(/\/$/);

  // A second drag back to the start must also suppress the release click.
  const bounds = (await track.boundingBox())!;
  await page.mouse.move(bounds.x + 80, bounds.y + 100);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width - 40, bounds.y + 100, { steps: 20 });
  await page.mouse.up();
  await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeLessThan(5);
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.route("https://www.youtube-nocookie.com/**", (route) => route.abort());
  await track.locator("button").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".video-player")).toHaveAttribute("src", /youtube-nocookie.com\/embed/);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("story strip drags without navigating and links remain keyboard accessible", async ({
  page,
}) => {
  await page.goto("/");
  const track = page.locator(".stories-track");
  await expect(track).toHaveCSS("scrollbar-width", "none");
  await dragLeft(page, track);
  await expect(page).toHaveURL(/\/$/);
  const link = track.locator("a").nth(1);
  const href = await link.getAttribute("href");
  await link.focus();
  await expect(link).toBeFocused();
  await page.keyboard.press("Enter");
  // The development server may compile this article on the first navigation.
  await expect(page).toHaveURL(new URL(href!, page.url()).href, { timeout: 15000 });
});

test("touch swipes still scroll both strips without opening cards or overflowing the page", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("/");
  const cdp = await context.newCDPSession(page);
  for (const selector of [".stories-track", ".video-track"]) {
    const track = page.locator(selector);
    await track.scrollIntoViewIfNeeded();
    const bounds = (await track.boundingBox())!;
    const y = bounds.y + 90;
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: 330, y }],
    });
    for (let x = 310; x >= 70; x -= 20) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(100);
    await expect(track).not.toHaveClass(/is-dragging/);
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});
