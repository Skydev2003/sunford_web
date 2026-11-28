import { expect, test, type Locator } from "@playwright/test";

test("keyboard navigation reveals an offscreen product and restores its filtered rail on Back", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/scales");
  const track = page.locator("#products-lineup");
  const next = page.getByRole("button", { name: "เลื่อนผลิตภัณฑ์ถัดไป", exact: true });
  await next.click();
  await expect.poll(() => track.evaluate((list) => list.scrollLeft)).toBeGreaterThan(0);
  const group = page.getByRole("group", { name: "กรองผลิตภัณฑ์" });
  const industrial = group.getByRole("button", { name: "อุตสาหกรรม", exact: true });
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
  await expect(essentials.first()).toHaveAccessibleName("ดูอุปกรณ์เสริม");
  await expect(essentials.first()).toHaveAttribute("href", "/accessories");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/accessories");
  await expect(page.getByRole("heading", { level: 1, name: "อุปกรณ์เสริม" })).toBeVisible();
});

function railGap(track: Locator) {
  return track.evaluate((list) => getComputedStyle(list).columnGap);
}

function overviewGutter(width: number) {
  const pageGutter = width >= 1280 ? 48 : width >= 768 ? 32 : 20;
  return Math.max(pageGutter, width / 16);
}

async function expectCategoryAlignment(track: Locator, category: string, width: number) {
  const layout = await track.evaluate((list, categoryId) => {
    const hero = '[data-overview-section="hero"] > ul > li';
    const selectors = [
      "#products-title",
      "#products-chapters > li",
      "#products-lineup-title",
      "#products-lineup > li",
      "#products-services-title",
      "#products-services > li",
      "#products-accordion-title",
      '[data-overview-section="accordion"] > :last-child',
      "#products-index-title",
      "[data-segmented-filter]",
      "#products-essentials-title",
      "#products-essentials > li",
    ];
    if (categoryId === "scales") selectors.push(hero);
    const viewportRight = list.getBoundingClientRect().right;
    const cardsVisible = [...list.children].reduce((count, card) => {
      const rect = card.getBoundingClientRect();
      return count + Math.max(0, Math.min(rect.width, viewportRight - rect.left)) / rect.width;
    }, 0);
    return {
      viewportRight,
      starts: selectors.map(
        (selector) =>
          [selector, document.querySelector(selector)!.getBoundingClientRect().left] as const,
      ),
      cardsVisible,
    };
  }, category);
  const inset = category === "accessories" || width >= 768 ? overviewGutter(width) : 24;
  for (const [selector, left] of layout.starts) {
    expect(left, `${category}/${selector}`).toBeCloseTo(inset, 0);
  }
  expect(layout.viewportRight).toBeCloseTo(width, 0);
  if (width >= 1024) {
    expect(layout.cardsVisible).toBeGreaterThanOrEqual(3.5);
    expect(layout.cardsVisible).toBeLessThanOrEqual(4);
  }
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
    await page.goto("/scales", { waitUntil: "domcontentloaded" });
    const track = page.locator("#products-lineup");
    const images = track.locator(":scope > li > a img");
    for (const icon of await page.locator("#products-chapters img").all()) {
      await expect(icon).toHaveAttribute("loading", "eager");
      await expect(icon).toHaveAttribute("fetchpriority", "high");
    }
    await expect(images.nth(0)).toHaveAttribute("loading", "eager");
    await expect(images.nth(1)).toHaveAttribute("loading", "eager");
    await expect(images.nth(2)).toHaveAttribute("loading", "eager");
    await expect(images.nth(3)).toHaveAttribute("loading", "eager");
    await expect(images.nth(3)).toHaveAttribute("fetchpriority", "high");
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
  await page.goto("/scales");
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

async function expectProductCardLayout(cards: Locator, scope: string) {
  await expect(cards.first()).toBeVisible();
  const issues = await cards.evaluateAll((items) => {
    const dimensions = items[0].getBoundingClientRect();
    return items.flatMap((item) => {
      const card = item.getBoundingClientRect();
      const links = [...item.querySelectorAll<HTMLAnchorElement>("a[href]")];
      const [link] = links;
      const style = getComputedStyle(link ?? item);
      const image = link?.querySelector("img");
      const imageBox = image?.parentElement?.getBoundingClientRect();
      const name = link?.querySelector("h3");
      const highlight = link?.querySelector("h3 + [data-product-highlight]");
      const price = highlight?.nextElementSibling;
      const caption = name?.parentElement;
      const invalid =
        Math.round(card.width) !== Math.round(dimensions.width) ||
        Math.round(card.height) !== Math.round(dimensions.height) ||
        style.backgroundColor !== "rgb(255, 255, 255)" ||
        style.borderRadius !== "24px" ||
        (image && getComputedStyle(image).objectFit !== "contain") ||
        (imageBox && Math.abs(imageBox.width - imageBox.height) > 1) ||
        (caption && getComputedStyle(caption).textAlign !== "center") ||
        (name && getComputedStyle(name).fontSize !== "18px") ||
        (highlight && getComputedStyle(highlight).fontSize !== "14px") ||
        (price && getComputedStyle(price).fontSize !== "16px") ||
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
  });
  expect(issues, scope).toEqual([]);
}

for (const [width, categorySectionGap] of [
  [390, 32],
  [834, 40],
  [1440, 48],
] as const) {
  test(`category rails keep alignment, section spacing and paging at ${width}px`, async ({
    page,
  }) => {
    test.slow();
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/products");
    const firstShelf = page.locator("#products-rail-scales");
    await expect(firstShelf).toHaveCSS("display", "flex");
    await expect.poll(() => gapAfterShelf(firstShelf)).toBeGreaterThan(0);
    const chapterGap = await railGap(page.locator("#products-categories"));
    const shelfGap = await railGap(firstShelf);

    for (const category of ["scales", "indicators", "platforms", "pos", "accessories"]) {
      await page.goto(`/${category}`);
      await expect(page.locator(`[data-overview-category="${category}"]:visible`)).toHaveAttribute(
        "data-controls-ready",
        "true",
        { timeout: 15_000 },
      );
      await expect(page.locator("#products-title")).toBeVisible();
      const scales = category === "scales";
      await expect(page.locator('[data-overview-section="hero"]')).toHaveCount(scales ? 1 : 0);
      await expectCategoryAlignment(page.locator("#products-lineup"), category, width);
      expect(await railGap(page.locator("#products-chapters"))).toEqual(chapterGap);
      const sectionGap = category === "accessories" ? (width >= 768 ? 32 : 24) : categorySectionGap;
      for (const id of ["lineup", "services", "essentials"]) {
        const rail = page.locator(`#products-${id}`);
        expect(await railGap(rail), `${category}/${id}`).toEqual(shelfGap);
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
      const trailingGutter = category === "accessories" ? overviewGutter(width) : 24;
      expect(Math.abs(trailingSpace - trailingGutter)).toBeLessThanOrEqual(1);
      await previous.press("Enter");
      await expect(next).toBeEnabled();

      const indicators = category === "indicators";
      const filters = indicators
        ? page.getByRole("navigation", { name: "คุณสมบัติอินดิเคเตอร์" })
        : page.getByRole("group", {
            name: category === "platforms" ? "กรองตามวัสดุ" : "กรองผลิตภัณฑ์",
          });
      for (const filter of await filters.locator(indicators ? "a[href]" : "button:enabled").all()) {
        await filter.press("Enter");
        await expect(filter).toHaveAttribute(indicators ? "aria-current" : "aria-pressed", "true");
        const cards = track.locator(":scope > li:has(h3)");
        if (!(await cards.count())) {
          await expect(
            page
              .getByRole("status", { name: "" })
              .filter({ hasText: "ยังไม่มีรุ่นสินค้าในกลุ่มนี้" }),
          ).toHaveCount(1);
          continue;
        }
        await expectProductCardLayout(cards, [category, await filter.innerText()].join(" / "));
      }
    }
  });
}

test("the scales overview restores the featured carousel between the chapters and the lineup", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/scales");

  const gallery = page.getByRole("region", { name: "สินค้าเด่น SUNFORD" });
  await expect(gallery.locator("xpath=preceding-sibling::*[1]")).toHaveAttribute(
    "data-overview-section",
    "chapters",
  );
  await expect(gallery.locator("xpath=following-sibling::*[1]")).toHaveAttribute(
    "data-overview-section",
    "lineup",
  );
  const slides = gallery.locator("li[data-slide]");
  await expect(slides).toHaveCount(2);
  const titles = await slides.getByRole("heading").allTextContents();
  for (const [index, slide] of (await slides.all()).entries()) {
    const details = slide.getByRole("link", { name: "ดูรายละเอียดรุ่น" });
    const href = await details.getAttribute("href");
    expect(href).toMatch(/^\/products\/[^/]+$/);
    const lineupDetails = page.locator("#products-lineup > li > a").nth(index);
    await expect(lineupDetails).toHaveAttribute("href", href!);
    await expect(lineupDetails).toHaveAccessibleName(`ดูรายละเอียด ${titles[index]}`);
  }
  const tabs = gallery.getByRole("tablist").getByRole("tab");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await expect(tabs.first()).toBeEnabled();
  await expect(gallery.getByRole("button", { name: "เล่นแกลเลอรีสินค้าเด่น" })).toBeVisible();
  await tabs.first().press("ArrowRight");
  await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
  await expect
    .poll(() => slides.last().evaluate((slide) => Math.round(slide.getBoundingClientRect().left)))
    .toBe(24);
});
