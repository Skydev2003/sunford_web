import { expect, test } from "@playwright/test";

const coffeePath = "/products/category/scales/kitchen";
const marketPath = "/products/category/scales/applications/wholesale-markets";

for (const [width, reducedMotion] of [
  [390, "reduce"],
  [1440, "no-preference"],
] as const) {
  test(`Home & Retail coffee links directly to the kitchen category at ${width}px`, async ({
    page,
  }) => {
    test.slow();
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion });
    await page.goto("/products");
    const rail = page.locator("#products-rail-pos");
    const feature = rail.locator(":scope > li:first-child [data-retail-editorial='coffee']");
    await expect(feature.getByRole("heading", { level: 3 })).toHaveText("ชั่งให้พอดี");
    const trigger = feature.getByRole("link", { name: "ชั่งให้พอดี · ครัวและกาแฟ" });
    await expect(trigger).toHaveAttribute("href", coffeePath);
    await expect(feature.locator("dialog")).toHaveCount(0);
    const scene = feature.locator("div[aria-hidden='true']");
    const playState = () =>
      scene.evaluate((element) => getComputedStyle(element, "::before").animationPlayState);
    if (reducedMotion === "no-preference") await expect.poll(playState).toBe("paused");
    await trigger.scrollIntoViewIfNeeded();
    const image = scene.locator("img");
    await expect(image).toHaveCount(1);
    const source = await image.getAttribute("src");
    expect(new URL(source!, page.url()).searchParams.get("url")).toBe(
      "/images/products/home-retail-editorial.webp",
    );
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0);
    await expect(image).toHaveCSS("object-fit", "cover");
    expect(
      await image.evaluate((element) => {
        const image = element.getBoundingClientRect();
        const card = element.closest("[data-home-retail-feature]")!.getBoundingClientRect();
        return [
          image.x - card.x,
          image.y - card.y,
          image.width - card.width,
          image.height - card.height,
        ];
      }),
    ).toEqual([0, 0, 0, 0]);
    if (reducedMotion === "reduce") {
      expect(
        await scene.evaluate((element) => getComputedStyle(element, "::before").animationName),
      ).toBe("none");
    } else {
      await expect.poll(playState).toBe("running");
    }
    await expect(rail).toHaveAttribute("data-tab-focus-ready", "");
    await rail.focus();
    await page.keyboard.press("Tab");
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Tab");
    const nextCard = feature.locator("xpath=../following-sibling::li[1]");
    await expect(nextCard.getByRole("link")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(coffeePath, { timeout: 20_000 });
    await expect(page.getByRole("heading", { level: 1, name: /ครัวและกาแฟ/ })).toBeVisible();
    await page.goBack();
    await expect(trigger).toBeVisible();
  });

  test(`the market story follows VR5000 and opens the related scales at ${width}px`, async ({
    page,
  }) => {
    test.slow();
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion });
    let marketRequests = 0;
    page.on("request", (request) => {
      if (new URL(request.url()).pathname === marketPath) marketRequests++;
    });
    await page.goto("/products");
    const rail = page.locator("#products-rail-pos");
    const market = rail.locator("[data-retail-editorial='market']");
    const link = market.getByRole("link", { name: "ชั่งขายที่แผง · ค้าส่งและตลาดสด" });
    await expect(market.getByRole("heading")).toHaveText("ชั่งขายที่แผง");
    await expect(link).toHaveAttribute("href", marketPath);
    expect(
      await rail
        .locator(":scope > li")
        .evaluateAll((cards) =>
          cards
            .slice(0, 6)
            .map(
              (card) =>
                card.getAttribute("data-warehouse-sku") ??
                card
                  .querySelector("[data-retail-editorial]")
                  ?.getAttribute("data-retail-editorial"),
            ),
        ),
    ).toEqual(["coffee", "G106469", "G106186", "G106179", "market", "G106209"]);
    const metrics = await rail
      .locator("[data-retail-editorial]")
      .evaluateAll((cards) =>
        cards.map((card) => [
          card.clientWidth,
          card.clientHeight,
          getComputedStyle(card).borderRadius,
        ]),
      );
    expect(metrics[1]).toEqual(metrics[0]);
    await link.scrollIntoViewIfNeeded();
    const image = market.locator("img");
    const source = await image.getAttribute("src");
    expect(new URL(source!, page.url()).searchParams.get("url")).toBe(
      "/images/products/market-retail-editorial.webp",
    );
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
    await expect(image).toHaveCSS("object-fit", "cover");

    await expect(rail).toHaveAttribute("data-tab-focus-ready", "");
    await rail.locator(':scope > li[data-warehouse-sku="G106179"]').getByRole("link").focus();
    await page.keyboard.press("Tab");
    await expect(link).toBeFocused();
    await expect(link).toBeInViewport({ ratio: 0.95 });
    expect(marketRequests).toBe(0);
    if (width === 390) {
      await page.keyboard.press("Enter");
    } else {
      await link.click({ position: { x: 120, y: 250 } });
    }
    await expect(page).toHaveURL(marketPath, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "ค้าส่งและตลาดสด", level: 1 })).toBeVisible();
    const products = page.getByRole("list", { name: "เครื่องชั่งสำหรับงานนี้" });
    await expect(products.getByRole("link", { name: /\bJC21\b/ }).first()).toHaveAttribute(
      "href",
      /^\/products\/[^/]+$/,
    );
    await page.goBack();
    await expect(link).toBeInViewport({ ratio: 0.95 });
  });
}

test.describe("Home & Retail touch", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("tapping the coffee photo opens the kitchen category", async ({ page }) => {
    await page.goto("/products");
    const coffee = page.locator('[data-retail-editorial="coffee"]').getByRole("link");
    await coffee.tap({ position: { x: 140, y: 230 } });
    await expect(page).toHaveURL(coffeePath);
    await expect(page.getByRole("heading", { level: 1, name: /ครัวและกาแฟ/ })).toBeVisible();
  });

  for (const story of ["coffee", "market"]) {
    test(`a swipe starting on the ${story} image scrolls the rail without opening details`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/products", { waitUntil: "domcontentloaded" });
      const rail = page.locator("#products-rail-pos");
      const feature = rail.locator(`[data-retail-editorial="${story}"]`);
      const trigger = feature.getByRole("link");
      await trigger.scrollIntoViewIfNeeded();
      await expect(trigger).toBeInViewport({ ratio: 0.9 });
      const bounds = (await trigger.boundingBox())!;
      const before = await rail.evaluate((list) => list.scrollLeft);
      const touch = await page.context().newCDPSession(page);
      const y = bounds.y + 245;
      const x = bounds.x + 250;
      await touch.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
      });
      for (let delta = 25; delta <= 225; delta += 25) {
        await touch.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: x - delta, y }],
        });
      }
      await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await expect.poll(() => rail.evaluate((list) => list.scrollLeft)).toBeGreaterThan(before);
      await expect(page).toHaveURL("/products");
    });
  }
});

test.describe("Home & Retail without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("both editorial cards keep native links", async ({ page }) => {
    await page.goto("/products");
    const rail = page.locator("#products-rail-pos");
    await expect(
      rail.getByRole("link", { name: "ชั่งขายที่แผง · ค้าส่งและตลาดสด" }),
    ).toHaveAttribute("href", marketPath);
    const coffee = rail.getByRole("link", { name: "ชั่งให้พอดี · ครัวและกาแฟ" });
    await expect(coffee).toBeVisible();
    await coffee.click();
    await expect(page).toHaveURL(coffeePath);
  });
});
