import { expect, test } from "@playwright/test";

test("homepage preserves Hero media and existing campaign destinations", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.locator(
      'video[src="/videos/sunford-web.mp4"],video source[src="/videos/sunford-web.mp4"]',
    ),
  ).toHaveCount(1);
  await expect(page.locator("#stories-heading")).not.toBeEmpty();
  const spotlight = page.locator(".product-spotlight");
  if (await spotlight.count()) {
    const href = await spotlight.locator(".spotlight-visual").getAttribute("href");
    expect(href).toMatch(/^\/products\//);
    expect((await request.get(href!)).status()).toBe(200);
    await expect(spotlight.locator("h2")).not.toBeEmpty();
  }
});
