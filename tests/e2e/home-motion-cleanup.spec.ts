import { expect, test } from "@playwright/test";

test("leaving an in-progress section reveal and going Back does not crash the cached homepage", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /commitStyles|hydrat/i.test(message.text()))
      errors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const native = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      const animation = native.call(this, frames, options);
      if (this.closest("#stories")) {
        animation.pause();
        animation.currentTime = 100;
        document.documentElement.dataset.homeRevealPaused = "true";
      }
      return animation;
    };
  });
  await page.goto("/");
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete", {
    timeout: 10000,
  });
  await page.evaluate(() => {
    const heading = document.querySelector("#stories-heading")!;
    scrollTo({ top: heading.getBoundingClientRect().top + scrollY - 180, behavior: "instant" });
  });
  await expect(page.locator("html")).toHaveAttribute("data-home-reveal-paused", "true");
  await page
    .locator(".site-header")
    .getByRole("link", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true })
    .click();
  await expect(page).toHaveURL(/\/products$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
  await expect(page.locator("#stories-heading")).not.toBeEmpty();
  await expect(page.getByRole("heading", { name: "ไม่สามารถโหลดข้อมูลได้ในขณะนี้" })).toHaveCount(
    0,
  );
  expect(errors).toEqual([]);
});
