import { expect, test } from "@playwright/test";

test.describe("mobile centered previews", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  for (const selector of [".video-track", ".stories-track"]) {
    test(`${selector} focuses side previews before opening them`, async ({ page }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      const track = page.locator(selector);
      const cards = track.locator(":scope > *");
      await track.scrollIntoViewIfNeeded();

      async function expectFocused(index: number) {
        await expect
          .poll(() =>
            cards.evaluateAll((elements) =>
              elements.flatMap((element, i) =>
                Number((element as HTMLElement).dataset.clarity) > 0.995 ? [i] : [],
              ),
            ),
          )
          .toEqual([index]);
        const offset = await cards.nth(index).evaluate((element) => {
          const card = element as HTMLElement;
          const parent = card.parentElement!;
          return Math.abs(
            card.offsetLeft + card.offsetWidth / 2 - parent.scrollLeft - parent.clientWidth / 2,
          );
        });
        expect(offset).toBeLessThan(2);
      }

      async function tapPreview(index: number) {
        const card = cards.nth(index);
        const bounds = (await card.boundingBox())!;
        const x = (Math.max(0, bounds.x) + Math.min(390, bounds.x + bounds.width)) / 2;
        expect(x).toBeGreaterThan(0);
        expect(x).toBeLessThan(390);
        await page.touchscreen.tap(x, bounds.y + bounds.height / 2);
        await expectFocused(index);
        await expect(page).toHaveURL(/\/$/);
        await expect(page.getByRole("dialog")).toBeHidden();
      }

      await expectFocused(1);
      for (const index of [0, 2]) {
        await expect
          .poll(async () => Number(await cards.nth(index).getAttribute("data-clarity")))
          .toBeLessThan(0.01);
      }
      await tapPreview(0);
      await tapPreview(1);
      await tapPreview(2);
      await track.screenshot({ path: test.info().outputPath("mobile-centered.jpg") });

      if (selector === ".video-track") {
        await page.route("https://www.youtube-nocookie.com/**", (route) => route.abort());
        await cards.nth(2).tap();
        await expect(page.getByRole("dialog")).toBeVisible();
      } else {
        const href = await cards.nth(2).getAttribute("href");
        await cards.nth(2).tap();
        await expect(page).toHaveURL(new URL(href!, page.url()).href);
      }
    });
  }
});

test("three videos stay sharp and the next video becomes gradually clearer without playing on drag", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto("/");
  const track = page.locator(".video-track");
  const cards = track.locator(":scope > button");
  await track.scrollIntoViewIfNeeded();
  for (const index of [0, 1, 2]) {
    await expect
      .poll(async () => Number(await cards.nth(index).getAttribute("data-clarity")))
      .toBeGreaterThan(0.995);
  }
  const blur = () =>
    cards
      .nth(3)
      .evaluate((element) =>
        parseFloat(getComputedStyle(element).filter.match(/blur\(([\d.]+)px\)/)?.[1] ?? "0"),
      );
  expect(await blur()).toBeGreaterThan(2.9);
  const before = await track.evaluate((element) => element.scrollLeft);
  const bounds = (await track.boundingBox())!;
  const x = bounds.x + bounds.width / 2;
  const y = bounds.y + 100;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 110, y, { steps: 10 });
  await expect.poll(blur).toBeLessThan(2.6);
  const earlyBlur = await blur();
  expect(earlyBlur).toBeGreaterThan(0.5);
  await page.mouse.move(x - 230, y, { steps: 10 });
  await expect.poll(blur).toBeLessThan(earlyBlur - 0.4);
  expect(await blur()).toBeGreaterThan(0.3);
  await page.mouse.move(x - 390, y, { steps: 15 });
  await page.mouse.up();
  await expect.poll(blur).toBeLessThan(0.1);
  expect(await track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(before + 200);
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page).toHaveURL(/\/$/);
  await page
    .locator(".video-gallery")
    .screenshot({ path: test.info().outputPath("videos-three-clear.png"), animations: "disabled" });

  await page.route("https://www.youtube-nocookie.com/**", (route) => route.abort());
  await cards.nth(3).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".video-player")).toHaveAttribute(
    "src",
    /youtube-nocookie.com\/embed\/.+\?autoplay=1/,
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
