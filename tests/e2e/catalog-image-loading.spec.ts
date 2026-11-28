import { expect, test, type Locator } from "@playwright/test";
import { load } from "cheerio";

const listing = "/scales/kitchen";
const firstModel = "SUNFORD WPK5000";

function optimizedSource(url: URL) {
  return url.pathname === "/_next/image" ? (url.searchParams.get("url") ?? "") : url.pathname;
}

async function decoded(image: Locator) {
  await expect
    .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
}

test("the first listing image has a media-qualified SSR preload matching the rendered image", async ({
  request,
  page,
}) => {
  const response = await request.get(listing);
  expect(response.ok()).toBe(true);
  const $ = load(await response.text());
  const image = $('img[alt="' + firstModel + '"]').first();
  const hints = $('link[rel="preload"][as="image"][media]');
  const hint = hints.filter(
    (_, element) => $(element).attr("imagesrcset") === image.attr("srcset"),
  );
  expect(hint).toHaveLength(1);
  expect(hint.attr("imagesizes")).toBe(image.attr("sizes"));
  expect(hint.attr("fetchpriority")).toBe("high");
  expect(image.attr("loading")).toBe("lazy");
  expect(image.attr("style")).toContain("base64");
  expect(image.attr("data-product-image-fade")).toBeUndefined();

  const media = hint.attr("media")!;
  await page.setViewportSize({ width: 390, height: 844 });
  const requests: URL[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "image") requests.push(new URL(request.url()));
  });
  await page.goto(listing);
  const photo = page.getByRole("img", { name: firstModel, exact: true });
  await decoded(photo);
  const active = await page.evaluate((query) => matchMedia(query).matches, media);
  expect(active).toBe(true);
  const selected = await photo.evaluate((image: HTMLImageElement) => image.currentSrc);
  expect(requests.filter(({ href }) => href === selected)).toHaveLength(1);

  await page.setViewportSize({ width: 390, height: 635 });
  await page.goto(listing);
  expect(await page.evaluate((query) => matchMedia(query).matches, media)).toBe(false);
  await expect(photo).not.toHaveAttribute("fetchpriority", "high");
});

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(
    "a delayed Warehouse image keeps its frame and preview with " + reducedMotion,
    async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion });
      const delayedModel = "SUNFORD AVS-25-K1";
      const $ = load(await (await page.request.get(listing)).text());
      const match = $('img[alt="' + delayedModel + '"]')
        .first()
        .attr("src");
      expect(match).toBeTruthy();
      const expectedSource = optimizedSource(new URL(match!, "http://localhost"));
      let continueImage!: () => void;
      const pending = new Promise<void>((start) => {
        continueImage = start;
      });
      await page.route(
        (url) => optimizedSource(url) === expectedSource,
        async (route) => {
          await pending;
          await route.continue();
        },
      );
      try {
        await page.goto(listing, { waitUntil: "domcontentloaded" });
        const image = page.getByRole("img", { name: delayedModel, exact: true });
        await expect(image).toHaveAttribute("data-product-image-pending");
        expect(await image.evaluate((img) => img.style.backgroundImage)).toContain("base64");
        const before = await image.boundingBox();
        expect(before?.height).toBeGreaterThan(0);
        continueImage();
        await decoded(image);
        await expect(image).toHaveAttribute("data-product-image-fade");
        await expect(image).toHaveCSS(
          "animation-duration",
          reducedMotion === "reduce" ? "0s" : "0.5s",
        );
        await expect.poll(() => image.evaluate((img) => img.style.backgroundImage)).toBe("");
        expect(await image.boundingBox()).toEqual(before);
      } finally {
        continueImage();
      }
    },
  );
}

test("a product grid starts a lower row before it scrolls into view", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  const release = Promise.withResolvers<void>();
  await page.route("**/_next/image?**", async (route) => {
    await release.promise;
    await route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"/>',
    });
  });
  try {
    await page.goto("/scales/industrial", { waitUntil: "domcontentloaded" });
    const photo = page.locator("#mock-product-results article a img").last();
    await expect(photo).toHaveAttribute("loading", "lazy");
    await photo.evaluate((image) => {
      window.scrollBy({
        top: image.getBoundingClientRect().top - innerHeight - 450,
        behavior: "instant",
      });
    });
    await expect(photo).not.toBeInViewport();
    await expect(photo).toHaveAttribute("loading", "eager");
  } finally {
    release.resolve();
    await page.unrouteAll({ behavior: "wait" });
  }
});

test("a failed primary and fallback image leave the reserved placeholder visible", async ({
  page,
}) => {
  const rejected: string[] = [];
  await page.route(
    (url) => {
      const source = optimizedSource(url);
      return (
        source.includes("g106094-front-hd.webp") || source.startsWith("/api/products/G106094/image")
      );
    },
    async (route) => {
      rejected.push(optimizedSource(new URL(route.request().url())));
      await route.fulfill({ status: 404, body: "" });
    },
  );
  await page.goto("/products", { waitUntil: "domcontentloaded" });
  const card = page.locator('#products-rail-scales [data-warehouse-sku="G106094"]');
  await card.scrollIntoViewIfNeeded();
  const placeholder = card.locator("[data-product-image-placeholder]");
  await expect(placeholder).toBeVisible();
  expect((await placeholder.boundingBox())?.height).toBeGreaterThan(0);
  expect(rejected.some((url) => url.includes("g106094-front-hd.webp"))).toBe(true);
  expect(rejected.some((url) => url.startsWith("/api/products/G106094/image"))).toBe(true);
});

test("the first scale showcase has one responsive preload and skips the fade", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "image") requests.push(request.url());
  });
  await page.goto("/products");
  const card = page.locator('#products-rail-scales [data-warehouse-sku="G106094"]');
  const photo = card.getByRole("img");
  await decoded(photo);
  const selected = await photo.evaluate((image: HTMLImageElement) => image.currentSrc);
  const hints = await page.locator('link[rel="preload"][as="image"][media]').evaluateAll(
    (links, current) =>
      links.filter((link) => {
        const set = link.getAttribute("imagesrcset") ?? "";
        return (
          set.includes(new URL(current).pathname + new URL(current).search) &&
          matchMedia(link.getAttribute("media")!).matches
        );
      }).length,
    selected,
  );
  expect(hints).toBe(1);
  expect(requests.filter((url) => url === selected)).toHaveLength(1);
  await expect(photo).not.toHaveAttribute("data-product-image-fade");
  await expect(photo).toHaveCSS("opacity", "1");
});

test("the optimizer prefers AVIF, with WebP for clients that only accept WebP", async ({
  request,
}) => {
  const url = "/_next/image?url=%2Fimages%2Fproducts%2Fcategory-families%2Fscales.webp&w=128&q=75";
  for (const [accept, type] of [
    ["image/webp, image/avif", "image/avif"],
    ["image/webp", "image/webp"],
  ]) {
    const response = await request.get(url, { headers: { Accept: accept } });
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toBe(type);
    expect(response.headers().vary?.toLowerCase()).toContain("accept");
  }
});

test("the home video thumbnail stays lazy and fades only after it decodes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const thumb = "https://i.ytimg.com/vi/UF7QJSq4Qw4/maxresdefault.jpg";
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(thumb, async (route) => {
    await pending;
    await route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9"><rect width="16" height="9"/></svg>',
    });
  });
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const poster = page.locator('#sunford-biz-talk img[src="' + thumb + '"]');
    await expect(poster).toHaveAttribute("loading", "lazy");
    await expect(poster).not.toHaveAttribute("fetchpriority", "high");
    await poster.scrollIntoViewIfNeeded();
    await expect(poster).toHaveAttribute("data-product-image-pending");
    release();
    await decoded(poster);
    await expect(poster).toHaveAttribute("data-product-image-fade");
    await expect(poster).toHaveCSS("animation-duration", "0.5s");
  } finally {
    release();
  }
});
