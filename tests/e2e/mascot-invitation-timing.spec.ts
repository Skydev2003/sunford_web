import { expect, test } from "@playwright/test";

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`invitation appears for two seconds every fifteen seconds (${reducedMotion})`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/contact-us", { waitUntil: "domcontentloaded" });
    const invitation = page.locator("[data-mascot-invitation]");
    await expect(invitation).toBeAttached();
    const states = await invitation.evaluate((element) => {
      const animation = element.getAnimations()[0];
      if (!animation) return [];
      animation.pause();
      return [14999, 15001, 16999, 17001, 29999, 30001, 31999, 32001].map((time) => {
        animation.currentTime = time;
        return getComputedStyle(element).visibility;
      });
    });
    expect(states).toEqual([
      "hidden",
      "visible",
      "visible",
      "hidden",
      "hidden",
      "visible",
      "visible",
      "hidden",
    ]);
    const sizes = await page.locator("[data-shop-mascot]").evaluate((element) => {
      const bubble = element.querySelector("[data-mascot-invitation]")!;
      const bounds = bubble.getBoundingClientRect();
      return Array.from(element.querySelectorAll("[data-mascot-contact] a")).map((link) => {
        const card = link.getBoundingClientRect();
        const copy = link.querySelector("strong")!.parentElement!;
        return {
          sameSize:
            Math.abs(card.width - bounds.width) < 0.5 &&
            Math.abs(card.height - bounds.height) < 0.5,
          divider: getComputedStyle(copy).borderLeftWidth,
        };
      });
    });
    expect(sizes).toEqual(Array.from({ length: 4 }, () => ({ sameSize: true, divider: "0px" })));
  });
}
