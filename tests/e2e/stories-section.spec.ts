import { expect, test } from "@playwright/test";

test("story cards link photographed Warehouse application groups without publication dates", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete", {
    timeout: 15000,
  });
  const section = page.locator("#stories");
  const track = section.locator(".stories-track");
  const cards = track.locator(':scope > a[data-focus-copy="1"]');
  await section.scrollIntoViewIfNeeded();
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(8);
  for (const card of await cards.all()) {
    await expect(card).toHaveAttribute(
      "href",
      /^\/products\/category\/scales\/applications\/[^/]+$/,
    );
    await expect(card.getByRole("heading", { level: 3 })).not.toBeEmpty();
    await expect(card.getByRole("img")).toHaveAttribute("alt", /\S/);
    await expect(card.locator("time")).toHaveCount(0);
  }
  for (const width of [1440, 1024, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    await section.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const images = cards.nth(0).getByRole("img");
    await expect
      .poll(() => images.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0))
      .toBe(true);
    if (width === 1440) {
      await expect
        .poll(
          () =>
            cards.locator("img").evaluateAll((images) =>
              images.every((element) => {
                const image = element as HTMLImageElement;
                return image.complete && image.naturalWidth > 0;
              }),
            ),
          { timeout: 30_000 },
        )
        .toBe(true);
    }
    if (width === 1440 || width === 390) {
      await section.screenshot({
        path: test.info().outputPath(`stories-section-${width}.png`),
        animations: "disabled",
      });
    }
  }
});

test("three centered story cards stay clear while outer cards become progressively sharper during a drag", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto("/");
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete", {
    timeout: 15000,
  });
  const section = page.locator("#stories");
  const track = section.locator(".stories-track");
  const cards = track.locator(':scope > a[data-focus-copy="1"]');
  await track.scrollIntoViewIfNeeded();
  for (const index of [0, 1, 2]) {
    await expect
      .poll(async () => Number(await cards.nth(index).getAttribute("data-clarity")))
      .toBeGreaterThan(0.995);
  }
  const incomingBlur = () =>
    cards
      .nth(2)
      .locator("xpath=following-sibling::*[1]")
      .evaluate((element) => {
        return parseFloat(getComputedStyle(element).filter.match(/blur\(([\d.]+)px\)/)?.[1] ?? "0");
      });
  const originalBlur = await incomingBlur();
  expect(originalBlur).toBeGreaterThan(2.9);
  const layout = await track.evaluate((element) => {
    const view = element.getBoundingClientRect();
    const nodes = Array.from(element.querySelectorAll('[data-focus-copy="1"]'))
      .slice(0, 3)
      .map((card) => card.getBoundingClientRect());
    return {
      middle: view.x + view.width / 2,
      center: nodes[1].x + nodes[1].width / 2,
      left: nodes[0].left,
      right: nodes[2].right,
      viewLeft: view.left,
      viewRight: view.right,
    };
  });
  expect(Math.abs(layout.middle - layout.center)).toBeLessThan(1);
  expect(layout.left).toBeGreaterThanOrEqual(layout.viewLeft);
  expect(layout.right).toBeLessThanOrEqual(layout.viewRight);
  const before = await track.evaluate((element) => element.scrollLeft);
  const bounds = (await track.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 100);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 - 110, bounds.y + 100, { steps: 10 });
  await expect.poll(incomingBlur).toBeLessThan(originalBlur - 0.4);
  const earlyBlur = await incomingBlur();
  expect(earlyBlur).toBeGreaterThan(0.5);
  await page.mouse.move(bounds.x + bounds.width / 2 - 230, bounds.y + 100, { steps: 10 });
  await expect.poll(incomingBlur).toBeLessThan(earlyBlur - 0.4);
  expect(await incomingBlur()).toBeGreaterThan(0.3);
  await page.mouse.move(bounds.x + bounds.width / 2 - 390, bounds.y + 100, { steps: 20 });
  await page.mouse.up();
  await expect
    .poll(() => track.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(before + 200);
  await expect.poll(incomingBlur).toBeLessThan(0.1);
  await expect(cards.nth(2)).toHaveCSS("filter", "blur(0px)");
  await expect
    .poll(async () => Number(await cards.nth(0).getAttribute("data-clarity")))
    .toBeLessThan(0.01);
  await expect(page).toHaveURL(/\/$/);
  await section.screenshot({
    path: test.info().outputPath("stories-focus-desktop.png"),
    animations: "disabled",
  });
});
