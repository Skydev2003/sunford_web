import { expect, test } from "@playwright/test";

test("matching product videos sit above contact information and only load on demand", async ({
  page,
}) => {
  await page.route("https://www.youtube-nocookie.com/**", (route) => route.abort());
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
    const contact = (await page.locator(".detail-service").boundingBox())!;
    expect(media.y + media.height).toBeLessThan(contact.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  }
  const first = videos.locator('[data-video-id="idpv9oLyQ4w"]');
  await first.getByRole("button", { name: /^เล่นวิดีโอ/ }).click();
  await expect(videos.locator("iframe")).toHaveCount(1);
  await expect(videos.locator("iframe")).toHaveAttribute("src", /\/embed\/idpv9oLyQ4w\?/);
  const second = videos.locator('[data-video-id="sxB0Yz08Thk"]');
  await second.getByRole("button", { name: /^เล่นวิดีโอ/ }).click();
  await expect(videos.locator("iframe")).toHaveCount(1);
  await expect(videos.locator("iframe")).toHaveAttribute("src", /\/embed\/sxB0Yz08Thk\?/);
  await second.getByRole("button", { name: /^ปิดวิดีโอ/ }).click();
  await expect(videos.locator("iframe")).toHaveCount(0);
  await first.getByRole("button", { name: /^เล่นวิดีโอ/ }).focus();
  await page.keyboard.press("Enter");
  await expect(videos.locator("iframe")).toHaveAttribute("src", /\/embed\/idpv9oLyQ4w\?/);
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
