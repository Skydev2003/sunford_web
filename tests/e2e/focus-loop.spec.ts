import { expect, test, type Locator, type Page } from "@playwright/test";

async function centered(track: Locator, index: number, width: number) {
  await expect
    .poll(() =>
      track.evaluate((element) => {
        const cards = Array.from(element.children) as HTMLElement[];
        const middle = element.scrollLeft + element.clientWidth / 2;
        const center = cards.reduce((a, b) =>
          Math.abs(a.offsetLeft + a.offsetWidth / 2 - middle) <
          Math.abs(b.offsetLeft + b.offsetWidth / 2 - middle)
            ? a
            : b,
        );
        return {
          index: Number(center.dataset.focusIndex),
          copy: Number(center.dataset.focusCopy),
          sharp: cards.filter((card) => Number(card.dataset.clarity) > 0.995).length,
        };
      }),
    )
    .toEqual({ index, copy: 1, sharp: width > 720 ? 3 : 1 });
}

async function clickPreview(
  page: Page,
  track: Locator,
  direction: number,
  width: number,
  touch: boolean,
) {
  const delta = direction * (width > 720 ? 2 : 1);
  const point = await track.evaluate((element, delta) => {
    const cards = Array.from(element.children) as HTMLElement[];
    const middle = element.scrollLeft + element.clientWidth / 2;
    const center = cards.reduce(
      (best, card, index) =>
        Math.abs(card.offsetLeft + card.offsetWidth / 2 - middle) <
        Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - middle)
          ? index
          : best,
      0,
    );
    const card = cards[center + delta],
      bounds = card.getBoundingClientRect(),
      viewport = element.getBoundingClientRect();
    return {
      x: (Math.max(viewport.left, bounds.left) + Math.min(viewport.right, bounds.right)) / 2,
      y: bounds.y + bounds.height / 2,
      blur: Number.parseFloat(
        getComputedStyle(card).filter.match(/blur\(([\d.]+)px\)/)?.[1] ?? "0",
      ),
    };
  }, delta);
  expect(point.blur).toBeGreaterThan(2.9);
  if (touch) await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
  return delta;
}

for (const width of [1440, 390]) {
  test.describe(`looping focus previews at ${width}px`, () => {
    test.use({ viewport: { width, height: 950 }, hasTouch: width === 390 });
    for (const selector of [".video-track", ".stories-track"]) {
      test(`${selector} keeps the clear window and loops clickable blurred previews both ways`, async ({
        page,
      }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto("/");
        await expect(page.locator("[data-brand-opening]")).toHaveAttribute(
          "data-phase",
          "complete",
        );
        const track = page.locator(selector);
        await track.scrollIntoViewIfNeeded();
        const count = await track.locator('[data-focus-copy="1"]').count();
        expect(count).toBeGreaterThan(2);
        await expect(track.locator("[data-focus-clone]")).toHaveCount(count * 2);
        expect(
          await track
            .locator("[data-focus-clone]")
            .evaluateAll((nodes) =>
              nodes.every(
                (node) =>
                  node.getAttribute("tabindex") === "-1" &&
                  node.getAttribute("aria-hidden") === "true",
              ),
            ),
        ).toBe(true);
        let current = 1;
        await centered(track, current, width);
        for (const direction of [-1, 1]) {
          for (let step = 0; step < count + 1; step++) {
            const delta = await clickPreview(page, track, direction, width, width === 390);
            current = (current + delta + count) % count;
            await centered(track, current, width);
            await expect(page).toHaveURL(/\/$/);
            await expect(page.getByRole("dialog")).toBeHidden();
          }
        }
        await track.screenshot({ path: test.info().outputPath(`focus-${width}.png`) });
        // Every logical item remains reachable one step at a time with the keyboard.
        await track.focus();
        for (let step = 0; step < count + 1; step++) {
          await page.keyboard.press("ArrowRight");
          current = (current + 1) % count;
          await centered(track, current, width);
        }
        const clearCard = track.locator(`[data-focus-copy="1"][data-focus-index="${current}"]`);
        if (selector === ".video-track") {
          await page.route("https://www.youtube-nocookie.com/**", (route) => route.abort());
          await clearCard.click();
          await expect(page.getByRole("dialog")).toBeVisible();
          await expect(page.locator(".video-player")).toHaveAttribute(
            "src",
            /youtube-nocookie.com\/embed\/.+autoplay=1/,
          );
          await page.keyboard.press("Escape");
          await centered(track, current, width);
        } else {
          const href = await clearCard.getAttribute("href");
          await clearCard.focus();
          await page.keyboard.press("Enter");
          await expect(page).toHaveURL(new URL(href!, page.url()).href);
        }
      });
    }
  });
}

test("without JavaScript carousel originals stay visible and clones stay hidden", async ({
  browser,
  baseURL,
}) => {
  const page = await browser.newPage({ baseURL, javaScriptEnabled: false });
  await page.goto("/");
  for (const selector of [".stories-track", ".video-track"]) {
    const track = page.locator(selector);
    expect(await track.locator('[data-focus-copy="1"]').count()).toBeGreaterThan(0);
    for (const clone of await track.locator("[data-focus-clone]").all())
      await expect(clone).toBeHidden();
  }
  await expect(page.locator('.stories-track [data-focus-copy="1"]').first()).toHaveAttribute(
    "href",
    /^\//,
  );
  await page.close();
});
