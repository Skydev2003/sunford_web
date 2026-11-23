import { expect, test, type Locator } from "@playwright/test";

test("keyboard navigation reveals an offscreen product and restores its filtered rail on Back", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/products/category/scales");
  const track = page.locator("#products-lineup");
  const next = page.getByRole("button", { name: "เลื่อนผลิตภัณฑ์ถัดไป", exact: true });
  await next.click();
  await expect.poll(() => track.evaluate((list) => list.scrollLeft)).toBeGreaterThan(0);
  const group = page.getByRole("group", { name: "กรองผลิตภัณฑ์" });
  const industrial = group.getByRole("button", { name: "การผลิต", exact: true });
  await industrial.click();
  await expect(industrial).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => track.evaluate((list) => list.scrollLeft)).toBe(0);

  const cards = track.locator(":scope > li");
  const third = cards.nth(2);
  const details = third.getByRole("link");
  await expect(details).not.toBeInViewport();
  await cards.first().getByRole("link").first().focus();
  for (
    let i = 0;
    i < 9 && !(await details.evaluate((link) => link === document.activeElement));
    i++
  ) {
    await page.keyboard.press("Tab");
  }
  await expect(details).toBeFocused();
  await expect(details).toBeInViewport({ ratio: 1 });
  await page.keyboard.press("Tab");
  await expect(cards.nth(3).getByRole("link")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(details).toBeFocused();
  const href = await details.getAttribute("href");
  const saved = await track.evaluate((list) => list.scrollLeft);
  expect(saved).toBeGreaterThan(0);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new URL(href!, page.url()).href);
  await page.goBack();
  await expect(industrial).toHaveAttribute("aria-pressed", "true");
  await expect(details).toHaveAttribute("href", href!);
  await expect
    .poll(() => track.evaluate((list, left) => Math.abs(list.scrollLeft - left), saved))
    .toBeLessThan(2);

  const essentials = page.locator("#products-essentials li a");
  await essentials.first().focus();
  await page.keyboard.press("Tab");
  await expect(essentials.nth(1)).toBeFocused();
  await expect(essentials.nth(1)).toBeInViewport({ ratio: 1 });
  await page.keyboard.press("Shift+Tab");
  await expect(essentials.first()).toBeFocused();
  await expect(essentials.first()).toBeInViewport({ ratio: 1 });
});

function spacing(track: Locator) {
  return track.evaluate((list) => {
    const css = getComputedStyle(list);
    return [
      css.paddingInlineStart,
      css.paddingInlineEnd,
      css.columnGap,
      css.scrollPaddingInlineStart,
    ];
  });
}

function gapAfterShelf(track: Locator) {
  return track.evaluate((list) => {
    const section = list.closest("section")!;
    const nextHeading = section.nextElementSibling!.querySelector("h2")!.parentElement!;
    return (
      nextHeading.getBoundingClientRect().top -
      section.lastElementChild!.getBoundingClientRect().bottom
    );
  });
}

test("the directory keeps its card caption spacing when the category rails share its styles", async ({
  page,
}) => {
  await page.goto("/products");
  for (const [shelf, gap] of [
    ["indicators", 4],
    ["calibration", 8],
  ] as const) {
    const card = page.locator(`#products-rail-${shelf} li`).first();
    const label = card.locator("p").first();
    const heading = card.locator("h3").first();
    await expect(heading).toBeVisible();
    await expect(card.locator(":scope > a")).toHaveCSS("display", "flex");
    const [labelBox, headingBox] = await Promise.all([label.boundingBox(), heading.boundingBox()]);
    expect(headingBox!.y - labelBox!.y - labelBox!.height).toBeCloseTo(gap, 0);
  }
});

test("the scale lineup prepares offscreen images before advancing and keeps distant images lazy", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const release = Promise.withResolvers<void>();
  await page.route("**/_next/image?**", async (route) => {
    await release.promise;
    await route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"/>',
    });
  });
  try {
    await page.goto("/products/category/scales", { waitUntil: "domcontentloaded" });
    const track = page.locator("#products-lineup");
    const images = track.locator(":scope > li > a img");
    await expect(images.nth(0)).toHaveAttribute("loading", "eager");
    await expect(images.nth(1)).toHaveAttribute("loading", "eager");
    await expect(images.nth(2)).toHaveAttribute("loading", "eager");
    await expect(images.nth(3)).toHaveAttribute("loading", "eager");
    await expect(images.nth(4)).toHaveAttribute("loading", "lazy");
    await page.getByRole("button", { name: "เลื่อนผลิตภัณฑ์ถัดไป", exact: true }).click();
    await expect(images.nth(4)).toHaveAttribute("loading", "eager");
    await expect(images.last()).toHaveAttribute("loading", "lazy");
  } finally {
    release.resolve();
    await page.unrouteAll({ behavior: "wait" });
  }
});

test("the lineup shows the WPS10KS model, photo, highlight and price in one product link", async ({
  page,
}) => {
  await page.goto("/products/category/scales");
  const product = page.locator("#products-lineup > li").filter({
    has: page.getByRole("heading", { name: "WPS10KS", exact: true }),
  });
  await expect(product.getByRole("img", { name: "SUNFORD WPS10KS" })).toBeVisible();
  await expect(product.locator("h3 + [data-product-highlight]")).toHaveText(
    "ชาร์จได้ ไม่ต้องซื้อถ่าน",
  );
  await expect(product.locator("[data-product-highlight] + p")).toHaveText(
    /^(?:฿[\d,.]+|สอบถามราคา)$/,
  );
  await expect(product.getByRole("link", { name: "ดูรายละเอียด WPS10KS" })).toHaveAttribute(
    "href",
    /^\/products\/[^/?#]+$/,
  );
});

type CardLayout = { width: number; height: number; background: string; radius: string };

async function expectProductCardLayout(cards: Locator, reference: CardLayout, scope: string) {
  await expect(cards.first()).toBeVisible();
  const issues = await cards.evaluateAll((items, { width, height, background, radius }) => {
    return items.flatMap((item) => {
      const card = item.getBoundingClientRect();
      const style = getComputedStyle(item);
      const links = [...item.querySelectorAll<HTMLAnchorElement>("a[href]")];
      const [link] = links;
      const image = link?.querySelector("img");
      const name = link?.querySelector("h3");
      const highlight = link?.querySelector("h3 + [data-product-highlight]");
      const price = highlight?.nextElementSibling;
      const invalid =
        Math.round(card.width) !== width ||
        Math.round(card.height) !== height ||
        style.backgroundColor !== background ||
        style.borderRadius !== radius ||
        (image && getComputedStyle(image).objectFit !== "contain") ||
        links.length !== 1 ||
        !link?.getAttribute("href")?.startsWith("/products/") ||
        !name ||
        !highlight?.textContent?.trim() ||
        !/^(?:฿[\d,.]+|สอบถามราคา)$/.test(price?.textContent ?? "") ||
        links.some((link) => {
          const box = link.getBoundingClientRect();
          return box.right > card.right + 1 || box.bottom > card.bottom + 1;
        });
      return invalid
        ? [
            {
              model: item.querySelector("h3")?.textContent,
              width: card.width,
              height: card.height,
            },
          ]
        : [];
    });
  }, reference);
  expect(issues, scope).toEqual([]);
}

for (const width of [390, 834, 1440]) {
  test(`category rails match the product directory spacing and paging at ${width}px`, async ({
    page,
  }) => {
    test.slow();
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/products");
    const firstShelf = page.locator("#products-rail-scales");
    await expect(firstShelf).toHaveCSS("display", "flex");
    await expect.poll(() => gapAfterShelf(firstShelf)).toBeGreaterThan(0);
    const chapters = await spacing(page.locator("#products-categories"));
    const shelf = await spacing(firstShelf);
    const sectionGap = await gapAfterShelf(firstShelf);
    const reference = page.locator(
      '#products-rail-indicators > li[data-warehouse-sku="G107770"] > a',
    );
    await expect(reference).toBeVisible();
    const referenceLayout = await reference.evaluate((card) => {
      const style = getComputedStyle(card);
      const rect = card.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        background: style.backgroundColor,
        radius: style.borderRadius,
      };
    });

    for (const category of ["scales", "indicators", "platforms", "pos"]) {
      await page.goto(`/products/category/${category}`);
      await expect(page.locator("#products-title")).toBeVisible();
      expect(await spacing(page.locator("#products-chapters"))).toEqual(chapters);
      for (const id of ["lineup", "services", "features", "essentials"]) {
        const rail = page.locator(`#products-${id}`);
        expect(await spacing(rail), `${category}/${id}`).toEqual(shelf);
        if (id !== "essentials") {
          expect(await gapAfterShelf(rail), `${category}/${id} to next shelf`).toBeCloseTo(
            sectionGap,
            0,
          );
        }
      }

      const track = page.locator("#products-lineup");
      const buttons = page.locator('button[aria-controls="products-lineup"]:not([aria-pressed])');
      const previous = buttons.first();
      const next = buttons.last();
      await expect(previous).toBeDisabled();
      await expect(next).toBeEnabled();
      const target = await track.evaluate((list) => {
        const css = getComputedStyle(list);
        const pitch =
          list.children[1].getBoundingClientRect().left -
          list.children[0].getBoundingClientRect().left;
        const room = list.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight);
        const count =
          innerWidth >= 1024
            ? 1
            : Math.max(1, Math.floor((room + parseFloat(css.columnGap)) / pitch));
        return (
          list.children[count].getBoundingClientRect().left -
          list.children[0].getBoundingClientRect().left
        );
      });
      await next.press("Enter");
      await expect.poll(() => track.evaluate((list) => list.scrollLeft)).toBeCloseTo(target, 0);
      await previous.click();
      await expect(previous).toBeDisabled();
      await track.evaluate((list) =>
        list.scrollTo({ left: list.scrollWidth, behavior: "instant" }),
      );
      await expect(next).toBeDisabled();
      const trailingSpace = await track.evaluate(
        (list) =>
          list.getBoundingClientRect().right - list.lastElementChild!.getBoundingClientRect().right,
      );
      expect(trailingSpace).toBeCloseTo(parseFloat(shelf[1]), 0);
      await previous.press("Enter");
      await expect(next).toBeEnabled();

      const filters = page.getByRole("group", { name: "กรองผลิตภัณฑ์" });
      for (const filter of await filters.locator("button:enabled").all()) {
        await filter.press("Enter");
        await expect(filter).toHaveAttribute("aria-pressed", "true");
        const cards = track.locator(":scope > li:has(h3)");
        if (!(await cards.count())) {
          await expect(
            page
              .getByRole("status", { name: "" })
              .filter({ hasText: "ยังไม่มีรุ่นสินค้าในกลุ่มนี้" }),
          ).toHaveCount(1);
          continue;
        }
        await expectProductCardLayout(
          cards,
          referenceLayout,
          [category, await filter.innerText()].join(" / "),
        );
      }
    }
    await page.goto("/products/category/accessories");
    await expect(page.locator('[data-overview-section="hero"]')).toBeVisible();
    await expectProductCardLayout(
      page.locator("#products-lineup > li:has(h3)"),
      referenceLayout,
      "accessories",
    );
  });
}
