import { expect, test } from "@playwright/test";

const workflows = [
  ["batch-control", "ควบคุมชุดการผลิต"],
  ["formula-control", "ควบคุมสูตรการผลิต"],
] as const;

test("the Navbar main pages all have a single-segment URL that serves content directly", async ({
  page,
}) => {
  await page.goto("/");
  const links = page.locator(".site-header .desktop-nav").getByRole("link");
  const expected = [
    "/products",
    "/scales",
    "/platforms",
    "/software",
    "/accessories",
    "/pos",
    "/mes",
    "/solutions",
    "/service",
  ];
  await expect(links).toHaveCount(expected.length);
  expect(
    await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href"))),
  ).toEqual(expected);
  for (const path of expected) {
    const response = await page.request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(200);
  }
  for (const path of [
    "/products/wps10ks",
    "/scales/industrial",
    "/software/download/sunford-pos-android",
  ]) {
    const response = await page.request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(200);
  }
});

test("child pages use their owner's URL and accept links to the former URLs", async ({
  request,
}) => {
  const routes = [
    ["/products/category/scales/industrial", "/scales/industrial"],
    ["/products/category/scales/applications", "/scales"],
    [
      "/products/category/scales/applications/mobile-vendors",
      "/scales/applications/mobile-vendors",
    ],
    ["/products/category/platforms/benchtop", "/platforms/benchtop"],
    ["/products/category/indicators/rs232", "/indicators/rs232"],
    ["/products/category/accessories/printers", "/accessories/printers"],
    ["/products/category/pos/android", "/pos/android"],
    ["/technical-specification", "/service/technical-specification"],
    [
      "/technical-specification/guides/basic-usage",
      "/service/technical-specification/guides/basic-usage",
    ],
    ["/warranty/register", "/service/warranty/register"],
    ["/warranty/policy", "/service/warranty/policy"],
    ["/cancel-and-return/policy", "/service/cancel-and-return/policy"],
    ["/support/technical-assistance", "/service/technical-assistance"],
    ["/business/blogs/editorial", "/service/articles"],
    ["/blogs/editorial/ip-ratings-guide", "/service/articles/ip-ratings-guide"],
    ["/solution/erp", "/solutions/erp"],
  ];
  for (const [from, to] of routes) {
    const original = await request.get(`${from}?ref=route-check`, { maxRedirects: 0 });
    expect(original.status(), from).toBe(308);
    const target = new URL(original.headers().location, original.url());
    expect(`${target.pathname}${target.search}`).toBe(`${to}?ref=route-check`);
    const canonical = await request.get(to, { maxRedirects: 0 });
    expect(canonical.status(), to).toBe(200);
  }
});

test("previous URLs go straight to the new main pages and keep query strings", async ({
  request,
}) => {
  const redirects = [
    ...["scales", "platforms", "indicators", "accessories", "pos"].flatMap((id) => [
      [`/products/${id}`, id === "indicators" ? "/platforms/indicators" : `/${id}`],
      [`/products/category/${id}`, id === "indicators" ? "/platforms/indicators" : `/${id}`],
    ]),
    ["/Indicator", "/platforms/indicators"],
    ["/software/download", "/software"],
    ["/guides/indicator-platform-compatibility", "/platforms/custom-spec"],
    ...["/products/mes", "/solution/mes"].flatMap((prefix) => [
      [prefix, "/mes"],
      ...workflows.map(([id]) => [`${prefix}/${id}`, `/mes/${id}`]),
    ]),
    ["/product/mes", "/mes"],
    ["/product/mes/batch", "/mes/batch-control"],
    ["/product/mes/formula", "/mes/formula-control"],
  ];

  for (const [from, to] of redirects) {
    const response = await request.get(`${from}?trace=keep`, { maxRedirects: 0 });
    expect(response.status(), from).toBe(308);
    const target = new URL(response.headers().location, response.url());
    const [pathname, hash] = to.split("#");
    expect(target.pathname).toBe(pathname);
    expect(target.search).toBe("?trace=keep");
    expect(target.hash).toBe(hash ? `#${hash}` : "");
  }
});

for (const width of [390, 1440]) {
  test(`MES navigation opens both dedicated workflows at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-enhanced", "true");
    const header = page.locator(".site-header:visible");
    if (width < 1024) {
      await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      await header.getByRole("button", { name: "เปิดเมนูย่อยMES", exact: true }).click();
    } else {
      await header.getByRole("link", { name: "MES", exact: true }).press("ArrowDown");
    }
    const [firstId, firstTitle] = workflows[0];
    const menu = header.locator('[data-nav-menu="/mes"]');
    const productColumn = menu.locator('[data-nav-column="primary"]');
    const headingStyle = await productColumn.locator("p").evaluate((element) => {
      const { color, fontSize } = getComputedStyle(element);
      return { color, fontSize };
    });
    for (const [name, title] of [
      ["Batch MES", "ควบคุมชุดการผลิต"],
      ["Batch formula MES", "ควบคุมสูตรการผลิต"],
    ]) {
      const item = productColumn.getByRole("link", { name: `${name} ${title}`, exact: true });
      const subtitle = item.getByText(title, { exact: true });
      await expect(subtitle).toHaveCSS("font-size", headingStyle.fontSize);
      await expect(subtitle).toHaveCSS("color", headingStyle.color);
      await expect(subtitle).toHaveCSS("display", "block");
    }
    const help = menu.getByRole("link", { name: "ทดลองใช้งานจริง", exact: true });
    await expect(help).toHaveAttribute("href", "/service?section=contact");
    await menu.getByRole("link", { name: `Batch MES ${firstTitle}`, exact: true }).click();
    const main = page.getByRole("main");
    await expect(page).toHaveURL(`/mes/${firstId}`);
    await expect(main.getByRole("heading", { level: 1 })).toHaveText(firstTitle);

    const [secondId, secondTitle] = workflows[1];
    await main
      .getByRole("navigation", { name: "เส้นทางหน้า" })
      .getByRole("link", { name: "ระบบ MES", exact: true })
      .click();
    await expect(page).toHaveURL("/mes");
    await main.getByRole("link", { name: secondTitle, exact: true }).click();
    await expect(page).toHaveURL(`/mes/${secondId}`);
    await expect(main.getByRole("heading", { level: 1 })).toHaveText(secondTitle);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://sunford-web.vercel.app/mes/${secondId}`,
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
