import { expect, test } from "@playwright/test";
import { featuredEditorialArticles } from "../../src/features/content/data/editorial-sections";

test("homepage stories show all nine Sunford articles in the dark focus carousel", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete", {
    timeout: 15000,
  });
  const section = page.locator("#stories");
  const track = section.locator(".stories-track");
  const cards = track.locator(':scope > a[data-focus-copy="1"]');
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await expect(section.getByRole("heading", { level: 2 })).toHaveText("บทความน่ารู้");
  await expect(track.getByText("บทความ", { exact: true })).toHaveCount(0);
  await expect(cards).toHaveCount(9);
  await expect(cards.first().locator("h3")).toHaveText(
    "การใช้สกรูป้องกันกระแทกบนเครื่องชั่งแบบแท่น TCS-AW31/TCS-SW31S",
  );
  await expect(cards.last().locator("h3")).toHaveText("เครื่องชั่งในบ้าน จำเป็นแค่ไหน?");
  await expect(cards.locator("time")).toHaveText([
    "7 มิ.ย. 2569",
    "7 มิ.ย. 2569",
    "5 มิ.ย. 2569",
    "5 มิ.ย. 2569",
    "3 เม.ย. 2569",
    "3 เม.ย. 2569",
    "3 เม.ย. 2569",
    "14 ต.ค. 2568",
    "15 ก.ย. 2568",
  ]);
  for (const [index, { path, cover }] of featuredEditorialArticles.entries()) {
    const card = cards.nth(index);
    await expect(card).toHaveAttribute("href", path);
    const image = card.locator("img");
    await expect(image).toHaveCSS("object-fit", "cover");
    expect(
      await image.evaluate((element) =>
        new URL((element as HTMLImageElement).src).searchParams.get("url"),
      ),
    ).toBe(cover);
    await expect(card).toContainText("อ่านเพิ่มเติม");
  }
  for (const width of [1440, 1024, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    await track.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const images = cards.first().locator("img");
    await expect
      .poll(() => images.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0))
      .toBe(true);
    await expect
      .poll(() =>
        track
          .locator("[data-clarity]")
          .evaluateAll(
            (nodes) =>
              nodes.filter((node) => Number(node.getAttribute("data-clarity")) > 0.995).length,
          ),
      )
      .toBe(width >= 768 ? 3 : 1);
    if (width === 1440) {
      await expect(cards.nth(1)).toHaveCSS("filter", "blur(0px)");
      await expect
        .poll(() =>
          cards
            .nth(3)
            .evaluate((card) =>
              parseFloat(getComputedStyle(card).getPropertyValue("--focus-blur")),
            ),
        )
        .toBeGreaterThan(2.9);
      await expect
        .poll(
          () =>
            cards.locator("img").evaluateAll((images) =>
              images.slice(0, 3).every((element) => {
                const image = element as HTMLImageElement;
                return image.complete && image.naturalWidth > 0;
              }),
            ),
          { timeout: 30_000 },
        )
        .toBe(true);
    }
    if (width === 1440 || width === 390) {
      await section.screenshot({
        path: test.info().outputPath(`stories-section-${width}.png`),
        animations: "disabled",
      });
    }
  }
});
