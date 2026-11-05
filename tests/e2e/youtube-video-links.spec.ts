import { expect, test } from "@playwright/test";

const sourceIds = [
  "eQYuyBsOg4o",
  "FPjL35UtTkE",
  "lz2uSwP1rL0",
  "9uLj_GaV_rk",
  "gLw-dCK3gxw",
  "2Ru3Kr30P2U",
  "dj4BVEQNc_c",
  "DrC_ks8IkGU",
  "TuSXddCdONY",
  "Pk42Z_IC5O4",
  "JGVbrAWhhLU",
  "4i6jvk61w04",
];

for (const width of [320, 390, 768, 1440]) {
  test(`twelve source videos open YouTube in a new tab with the existing gallery at ${width}px`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width, height: 950 });
    await context.route("https://www.youtube.com/watch?*", (route) =>
      route.fulfill({ contentType: "text/html", body: "YouTube destination" }),
    );
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete", {
      timeout: 20000,
    });
    const gallery = page.locator(".video-gallery");
    await gallery.scrollIntoViewIfNeeded();
    const cards = gallery.locator('.video-track > a[data-focus-copy="1"]');
    await expect(cards).toHaveCount(12);
    const links = await cards.evaluateAll((elements) =>
      elements.map((element) => ({
        href: element.getAttribute("href"),
        target: element.getAttribute("target"),
        rel: element.getAttribute("rel"),
      })),
    );
    expect(links.map((link) => link.href)).toEqual(
      sourceIds.map((id) => `https://www.youtube.com/watch?v=${id}`),
    );
    expect(
      links.every((link) => link.target === "_blank" && link.rel === "noopener noreferrer"),
    ).toBe(true);
    await expect
      .poll(() =>
        cards
          .nth(1)
          .locator("img")
          .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
      )
      .toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const before = page.url();
    const opened = page.waitForEvent("popup");
    await cards.nth(1).click();
    const popup = await opened;
    await expect(popup).toHaveURL(`https://www.youtube.com/watch?v=${sourceIds[1]}`);
    expect(page.url()).toBe(before);
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(gallery.locator("iframe,dialog")).toHaveCount(0);
    await popup.close();
    await gallery.screenshot({ path: test.info().outputPath(`youtube-links-${width}.png`) });
  });
}

test("keyboard activation opens the source clip, and all twelve local thumbnail files load", async ({
  page,
  context,
  request,
}) => {
  await context.route("https://www.youtube.com/watch?*", (route) =>
    route.fulfill({ contentType: "text/html", body: "YouTube destination" }),
  );
  await page.goto("/");
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete", {
    timeout: 20000,
  });
  const card = page.locator('.video-track > a[data-focus-copy="1"]').nth(1);
  await card.focus();
  const opened = page.waitForEvent("popup");
  await page.keyboard.press("Enter");
  const popup = await opened;
  await expect(popup).toHaveURL(`https://www.youtube.com/watch?v=${sourceIds[1]}`);
  await popup.close();
  for (const id of sourceIds) {
    const response = await request.get(`/images/youtube/${id}.avif`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/avif");
  }
});

test("a non-homepage gallery keeps its existing embedded modal player", async ({ page }) => {
  await page.route("https://www.youtube-nocookie.com/**", (route) => route.abort());
  await page.goto("/software/download/sunford-pos-android", { waitUntil: "domcontentloaded" });
  const gallery = page.locator(".video-gallery");
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery.locator(".video-card").first()).toHaveJSProperty("tagName", "BUTTON");
  await gallery.locator(".video-card").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".video-player")).toHaveAttribute(
    "src",
    /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}\?autoplay=1$/,
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
