import { expect, test } from "@playwright/test";

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
