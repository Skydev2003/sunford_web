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
  await page.goto("/");
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete", {
    timeout: 10000,
  });
  await page.evaluate(() => {
    const heading = document.querySelector(".product-spotlight h2")!;
    scrollTo({ top: heading.getBoundingClientRect().top + scrollY - 180, behavior: "instant" });
  });
  await page.waitForFunction(() => {
    const animations = Array.from(
      document.querySelectorAll(".product-spotlight h2, .product-spotlight p"),
    )
      .flatMap((element) => element.getAnimations())
      .filter((animation) => animation.playState === "running");
    if (!animations.length) return false;
    // Hold a real reveal in progress so route-cache cleanup is exercised deterministically.
    animations.forEach((animation) => animation.pause());
    return true;
  });
  await page.locator(".product-spotlight .spotlight-visual").click();
  await expect(page).toHaveURL(/\/products\/acs30-jc21$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
  await expect(page.locator(".product-spotlight h2")).toHaveText("SUNFORD JC21");
  await expect(page.getByRole("heading", { name: "ไม่สามารถโหลดข้อมูลได้ในขณะนี้" })).toHaveCount(
    0,
  );
  expect(errors).toEqual([]);
});
