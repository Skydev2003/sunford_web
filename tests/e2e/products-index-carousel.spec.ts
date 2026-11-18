import { expect, test } from "@playwright/test";

test("category links and consultation lead to their destinations", async ({ page }) => {
  await page.goto("/products");
  const directory = page.locator("[data-products-directory]");
  const categories = directory.locator("nav li a");
  await expect(categories).toHaveCount(5);
  await expect(page.locator('[aria-controls="products-categories"]')).toHaveCount(0);
  await categories.first().click();
  await expect(page).toHaveURL("/products/category/scales");
  await page.goBack();
  const contact = directory.getByRole("link", { name: /ให้เราช่วยเลือก/ });
  const href = await contact.getAttribute("href");
  await contact.click();
  await expect(page).toHaveURL(href!);
});

test("shelf arrows show press, cancellation, keyboard focus and both endpoints", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/products");
  const section = page.locator("[data-products-category-section]").first();
  const track = section.locator("ul");
  const previous = section.getByRole("button", { name: /ก่อนหน้า$/ });
  const next = section.getByRole("button", { name: /ถัดไป$/ });
  await expect(previous).toBeDisabled();
  await next.scrollIntoViewIfNeeded();
  await next.hover();
  const initial = await next.locator("svg").evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.mouse.down();
  await expect(next.locator("svg")).not.toHaveCSS("background-color", initial);
  await page.screenshot({ path: test.info().outputPath("pressed.png") });
  await page.mouse.move(0, 0);
  await page.mouse.up();
  expect(await track.evaluate((el) => el.scrollLeft)).toBe(0);
  await next.click();
  await expect(previous).toBeEnabled();
  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100);
  await previous.click();
  await expect(previous).toBeDisabled();
  await track.focus();
  await page.keyboard.press("Tab");
  const card = track.locator("a").first();
  await expect(card).toBeFocused();
  await expect(card).toHaveCSS("outline-style", "solid");
  await page.screenshot({ path: test.info().outputPath("focus.png") });
  const href = await card.getAttribute("href");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(href!);
  await page.goBack();
  await track.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: "instant" }));
  await expect(next).toBeDisabled();
  await expect(previous).toBeEnabled();
});

test("the wheel scrolls the document over a product without changing the shelf", async ({
  page,
}) => {
  await page.goto("/products");
  const track = page.locator("#products-rail-scales");
  await track.locator("a").first().hover();
  const top = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 260);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(top);
  expect(await track.evaluate((el) => el.scrollLeft)).toBe(0);
});

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test(`arrow navigation respects ${reducedMotion} and lands on the next card`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion });
    await page.goto("/products");
    const track = page.locator("#products-rail-scales");
    const next = page.getByRole("button", { name: "เลื่อนเครื่องชั่งถัดไป", exact: true });
    await expect(next).toBeEnabled();
    const sample = await next.evaluate((node) => {
      const list = document.getElementById(node.getAttribute("aria-controls")!)!;
      const distance =
        list.children[1].getBoundingClientRect().left -
        list.children[0].getBoundingClientRect().left;
      (node as HTMLButtonElement).click();
      return { left: list.scrollLeft, distance };
    });
    if (reducedMotion === "reduce") expect(Math.abs(sample.left - sample.distance)).toBeLessThan(2);
    else expect(sample.left).toBeLessThan(sample.distance - 1);
    await expect
      .poll(() =>
        track.evaluate((list, distance) => Math.abs(list.scrollLeft - distance), sample.distance),
      )
      .toBeLessThan(2);
  });
}
