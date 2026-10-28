import { expect, test } from "@playwright/test";

test("homepage images and detail buttons open the same original destinations", async ({ page }) => {
  await page.goto("/");
  const spotlight = page.locator(".product-spotlight");
  const spotlightHref = await spotlight.locator(".spotlight-visual").getAttribute("href");
  await expect(spotlight.locator("h2")).toHaveText("SUNFORD JC21");
  expect(spotlightHref).toBe("/products/acs30-jc21");
  await expect(spotlight.getByRole("link", { name: "ดูเพิ่มเติม", exact: true })).toHaveAttribute(
    "href",
    spotlightHref!,
  );
  await spotlight.locator(".spotlight-visual").click();
  await expect(page).toHaveURL(new RegExp(`${spotlightHref}$`));
  await expect(page.getByRole("heading", { level: 1 })).toContainText("JC21");
  const destinations = [
    "/Product/Digital-weighing",
    "/product/scale-accessories",
    "/Product/MES",
    "/applications-and-softwares",
  ];
  for (const [index, href] of destinations.entries()) {
    await page.goto("/");
    const tile = page.locator(".showcase-tile").nth(index);
    await expect(tile.locator(".showcase-tile-image")).toHaveAttribute("href", href);
    await expect(tile.getByRole("link", { name: "ดูเพิ่มเติม", exact: true })).toHaveAttribute(
      "href",
      href,
    );
    await tile.locator(".showcase-tile-image").click();
    await expect
      .poll(() => new URL(page.url()).pathname.split("/").map(decodeURIComponent).join("/"))
      .toBe(href);
    await expect(page.locator(".source-content-page > .content-heading h1")).toBeVisible();
  }
});
