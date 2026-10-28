import { expect, test } from "@playwright/test";
import sourcePages from "../../src/features/content/data/pages.json";

test("story cards use supplied illustrations, original article facts and source images", async ({
  page,
}) => {
  await page.goto("/");
  const section = page.locator("#stories");
  const track = section.locator(".stories-track");
  const cards = track.locator(":scope > a");
  await section.scrollIntoViewIfNeeded();
  const articles = sourcePages
    .filter((article) => article.kind === "article" && !article.path.startsWith("/business/"))
    .slice(0, 8);
  await expect(cards).toHaveCount(8);
  for (const [index, article] of articles.entries()) {
    const card = cards.nth(index);
    await expect(card).toHaveAttribute("href", article.path);
    await expect(card.getByRole("heading", { level: 3 })).toHaveText(article.title);
    const image = card.getByRole("img");
    await expect(image).toHaveAttribute(
      "src",
      new RegExp(
        encodeURIComponent(index < 2 ? "/images/stories/reference-stories.png" : article.images[0]),
      ),
    );
  }
  // These are the publication dates in the original article records, not the
  // different sample dates printed in the supplied design reference.
  await expect(cards.nth(0).locator("time")).toHaveCount(0);
  await expect(cards.nth(1).locator("time")).toHaveAttribute("datetime", "2025-09-15");
  await expect(cards.nth(1).locator("time")).toHaveText("15 ก.ย. 2568");
  await expect(cards.nth(2).locator("time")).toHaveAttribute("datetime", "2025-10-13");
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
  const section = page.locator("#stories");
  const track = section.locator(".stories-track");
  const cards = track.locator(":scope > a");
  await track.scrollIntoViewIfNeeded();
  for (const index of [0, 1, 2]) {
    await expect
      .poll(async () => Number(await cards.nth(index).getAttribute("data-clarity")))
      .toBeGreaterThan(0.995);
  }
  const incomingBlur = () =>
    cards.nth(3).evaluate((element) => {
      return parseFloat(getComputedStyle(element).filter.match(/blur\(([\d.]+)px\)/)?.[1] ?? "0");
    });
  const originalBlur = await incomingBlur();
  expect(originalBlur).toBeGreaterThan(2.9);
  const layout = await track.evaluate((element) => {
    const view = element.getBoundingClientRect();
    const nodes = Array.from(element.children)
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
