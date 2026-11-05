import { expect, test } from "@playwright/test";

test("matching product videos open their YouTube links in new tabs", async ({ page }) => {
  await page
    .context()
    .route("https://www.youtube.com/**", (route) => route.fulfill({ body: "YouTube destination" }));
  await page.goto("/products/feh5ks");
  const videos = page.locator("[data-product-videos]");
  await expect(videos).toHaveAttribute("data-video-count", "2");
  await expect(videos.locator("iframe")).toHaveCount(0);
  expect(
    await videos
      .locator("[data-video-id]")
      .evaluateAll((cards) => cards.map((card) => card.getAttribute("data-video-id"))),
  ).toEqual(["idpv9oLyQ4w", "sxB0Yz08Thk"]);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const media = (await videos.boundingBox())!;
    const contact = (await page.locator("footer").boundingBox())!;
    expect(media.y + media.height).toBeLessThan(contact.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  }
  for (const id of ["idpv9oLyQ4w", "sxB0Yz08Thk"]) {
    const poster = videos
      .locator(`[data-video-id="${id}"]`)
      .getByRole("link", { name: /^เล่นวิดีโอ/ });
    await expect(poster).toHaveAttribute("target", "_blank");
    await expect(poster).toHaveAttribute("rel", "noopener noreferrer");
    const destination = await poster.getAttribute("href");
    const opened = page.waitForEvent("popup");
    await poster.click();
    const tab = await opened;
    await expect(tab).toHaveURL(destination!);
    expect(await tab.evaluate(() => window.opener === null)).toBe(true);
    await tab.close();
  }
  const first = videos
    .locator('[data-video-id="idpv9oLyQ4w"]')
    .getByRole("link", { name: /^เล่นวิดีโอ/ });
  await first.focus();
  const opened = page.waitForEvent("popup");
  await page.keyboard.press("Enter");
  const tab = await opened;
  await expect(tab).toHaveURL((await first.getAttribute("href"))!);
  await tab.close();
  await expect(videos.locator("iframe, button")).toHaveCount(0);
  await first.scrollIntoViewIfNeeded();
  const posterBox = (await first.boundingBox())!;
  const pagesBeforeDrag = page.context().pages().length;
  await page.mouse.move(posterBox.x + posterBox.width - 25, posterBox.y + posterBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(posterBox.x + 25, posterBox.y + posterBox.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  expect(page.context().pages()).toHaveLength(pagesBeforeDrag);
});

test("similar model names and unmatched products never receive another model's video", async ({
  page,
}) => {
  for (const [slug, expected, excluded] of [
    ["acs30-jc21", "da7xfrccHfI", "xCXRmF-_bX4"],
    ["10621", "xCXRmF-_bX4", "da7xfrccHfI"],
    ["wps10ks", "cRkWLAhAVRU", "TktAbjKUlDY"],
  ]) {
    await page.goto(`/products/${slug}`);
    await expect(page.locator(`[data-video-id="${expected}"]`)).toHaveCount(1);
    await expect(page.locator(`[data-video-id="${excluded}"]`)).toHaveCount(0);
  }
  await page.goto("/products/10792");
  const videos = page.locator("[data-product-videos]");
  await expect(videos).toHaveAttribute("data-video-count", "0");
  await expect(videos.locator("iframe, [data-video-id]")).toHaveCount(0);
  await expect(videos.getByRole("link")).toHaveAttribute(
    "href",
    "https://www.youtube.com/@sunfordthai1215/videos",
  );
});
