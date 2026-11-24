import { expect, test } from "@playwright/test";

for (const [width, inset, gapAbove, cardHeight, imageSize] of [
  [320, 24, 32, 480, 228],
  [390, 24, 32, 480, 232],
  [834, 52.125, 40, 576, 476],
  [1440, 90, 48, 612, 512],
] as const) {
  test(`scale featured gallery preserves its spacing and controls at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1218 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/products/category/scales");
    const hero = page.locator('[data-overview-section="hero"]');
    const tabs = hero.getByRole("tab");
    await expect(tabs).toHaveCount(2);
    await expect(tabs.first()).toBeEnabled();
    const firstCard = hero.locator('[data-slide="0"]');
    const firstPhoto = firstCard.locator("img");
    await firstPhoto.evaluate((image: HTMLImageElement) => image.decode());
    const geometry = await firstCard.evaluate((card) => {
      const rect = card.getBoundingClientRect();
      const image = card.querySelector("img")!;
      const style = getComputedStyle(image);
      const objectScale = Math.min(
        (image.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)) /
          image.naturalWidth,
        (image.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)) /
          image.naturalHeight,
      );
      const chapters = document.querySelector("#products-chapters")!.getBoundingClientRect();
      const lineup = document.querySelector("#products-lineup-title")!.getBoundingClientRect();
      const heading = document.querySelector("#products-title")!.getBoundingClientRect();
      const controls = card
        .closest("section")!
        .querySelector('[role="tablist"]')!
        .parentElement!.getBoundingClientRect();
      return {
        left: rect.left,
        right: innerWidth - rect.right,
        chapterInset: parseFloat(
          getComputedStyle(document.querySelector("#products-chapters")!).paddingLeft,
        ),
        headingInset: heading.left,
        lineupInset: lineup.left,
        gapAbove: rect.top - chapters.bottom,
        cardHeight: rect.height,
        imageWidth: image.naturalWidth * objectScale,
        controlsInside: controls.top > rect.top && controls.bottom < rect.bottom,
        documentFits: document.documentElement.scrollWidth <= innerWidth,
      };
    });
    for (const actual of [
      geometry.left,
      geometry.right,
      geometry.chapterInset,
      geometry.headingInset,
      geometry.lineupInset,
    ])
      expect(actual).toBeCloseTo(inset, 0);
    expect(geometry.gapAbove).toBeCloseTo(gapAbove, 0);
    expect(geometry.cardHeight).toBe(cardHeight);
    expect(geometry.imageWidth).toBeCloseTo(imageSize, 0);
    expect(geometry.controlsInside).toBe(true);
    expect(geometry.documentFits).toBe(true);
    if (width === 1440)
      await firstCard.screenshot({ path: test.info().outputPath("first-slide.png") });

    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(hero.locator('[data-slide="1"]')).toBeInViewport({ ratio: 0.99 });
    if (width === 1440) {
      const secondCard = hero.locator('[data-slide="1"]');
      await secondCard.locator("img").evaluate((image: HTMLImageElement) => image.decode());
      await secondCard.screenshot({ path: test.info().outputPath("second-slide.png") });
    }
    const play = hero.getByRole("button", { name: "เล่นแกลเลอรีสินค้าเด่น", exact: true });
    await play.click();
    const pause = hero.getByRole("button", { name: "หยุดแกลเลอรีสินค้าเด่น", exact: true });
    await pause.click();
    await expect(play).toBeVisible();
  });
}
