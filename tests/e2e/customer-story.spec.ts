import { expect, test } from "@playwright/test";
import { customerStoryPhotos } from "../../src/features/home/data/customer-story-photos";
import sourcePages from "../../src/features/content/data/pages.json";

test("real customer photographs support click, drag, keyboard and alternating card angles", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#story");
  const gallery = page.getByRole("region", { name: "ภาพการใช้งานจริงของลูกค้า Sunford" });
  const photo = gallery.getByRole("button", {
    name: "ดูภาพลูกค้าถัดไป คลิกหรือลากเพื่อเปลี่ยนภาพ",
    exact: true,
  });
  const current = gallery.locator('[aria-live="polite"]');
  const originalPhotos = sourcePages.find((p) => p.path === "/blogs/editorial")!.images;
  for (const item of customerStoryPhotos.slice(1)) expect(originalPhotos).toContain(item.src);

  async function selected(index: number, tilt: "left" | "right") {
    await expect(current).toHaveText(`${index + 1} / 4 · ${customerStoryPhotos[index].label}`);
    await expect(gallery).toHaveAttribute("data-tilt", tilt);
    const copy = customerStoryPhotos[index].cards;
    await expect(gallery.locator('[class*="quoteCard"] p')).toHaveText(copy.quote.join(""));
    const notes = gallery.locator('[class*="noteCard"] p');
    await expect(notes.nth(0)).toHaveText(copy.benefit.join(""));
    await expect(notes.nth(1)).toHaveText(copy.heart.join(""));
    const image = photo.getByRole("img");
    await expect(image).toHaveAttribute("alt", customerStoryPhotos[index].alt);
    await expect(image).toHaveAttribute(
      "src",
      new RegExp(encodeURIComponent(customerStoryPhotos[index].src)),
    );
    await expect
      .poll(() => image.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0))
      .toBe(true);
    const next = customerStoryPhotos[(index + 1) % customerStoryPhotos.length];
    const preview = gallery.locator("[data-next-photo]");
    await expect(preview).toHaveAttribute("data-next-photo", next.id);
    const previewImage = preview.locator('img:not([alt=""])');
    await expect(previewImage).toHaveAttribute("alt", next.alt);
    await expect(previewImage).toHaveAttribute("src", new RegExp(encodeURIComponent(next.src)));
    await expect
      .poll(() => previewImage.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0))
      .toBe(true);
  }

  await selected(0, "right");
  await photo.click();
  await selected(1, "left");

  // Real pointer input exercises pointer capture and suppresses the click after a swipe.
  await photo.scrollIntoViewIfNeeded();
  const box = (await photo.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.65);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.65 - 110, box.y + box.height * 0.65, { steps: 8 });
  await page.mouse.up();
  await selected(2, "right");

  await photo.focus();
  await page.keyboard.press("ArrowLeft");
  await selected(1, "left");
  await page.keyboard.press("ArrowLeft");
  await selected(0, "right");
  await page.keyboard.press("ArrowLeft");
  await selected(3, "left");
  await photo.click();
  await selected(0, "right");
  await expect(gallery.getByRole("button")).toHaveCount(1);
  await expect(current).toHaveCSS("width", "1px");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await photo.press("ArrowLeft");
  await selected(3, "left");
  await expect(photo).toHaveCSS("transition-duration", "0s");
  expect(errors).toEqual([]);
});

test("customer story cards remain inside the viewport and are usable on narrow screens", async ({
  page,
}) => {
  await page.goto("/#story");
  const story = page.locator("#story");
  const gallery = page.getByRole("region", { name: "ภาพการใช้งานจริงของลูกค้า Sunford" });
  const photo = gallery.getByRole("button", {
    name: "ดูภาพลูกค้าถัดไป คลิกหรือลากเพื่อเปลี่ยนภาพ",
    exact: true,
  });
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    await story.scrollIntoViewIfNeeded();
    await expect(photo).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const bounds = await gallery.evaluate((element) => {
      return Array.from(element.querySelectorAll('[class*="quoteCard"], [class*="noteCard"]')).map(
        (card) => {
          const b = card.getBoundingClientRect();
          return { x: b.x, right: b.right };
        },
      );
    });
    for (const box of bounds) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(width);
    }
    if (width === 1440 || width === 390) {
      await story.screenshot({
        path: test.info().outputPath(`customer-story-${width}.png`),
        animations: "disabled",
      });
    }
    await photo.click();
  }
  await expect(story.getByRole("link", { name: "รู้จักเรื่องราวของ Sunford" })).toHaveAttribute(
    "href",
    "/about-us",
  );
});
