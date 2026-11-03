import { expect, test } from "@playwright/test";

// Historical Hero 3D interaction contract, explicitly replaced by the image studio.
test.skip(
  true,
  "Retired homepage 3D/bubbles/ribbon; replacement coverage: hero-scene.spec.ts and hero-header-scroll.spec.ts. Product-page 3D remains covered by product-model.spec.ts.",
);

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] } });

const highlights = {
  "ACS-30-JC21": [
    "ชั่งพร้อมคิดราคา สูงสุด 30 กก.",
    "รวมยอดหลายรายการและคำนวณเงินทอน",
    "จอสองด้าน ผู้ขายและลูกค้าอ่านค่าพร้อมกัน",
  ],
  FEH5KS: [
    "ชั่งสูงสุด 5 กก. ละเอียด 1 กรัม",
    "จานสแตนเลสถอดล้าง ทำความสะอาดง่าย",
    "ต่อเครื่องพิมพ์ RS232 และ SUNFORD CONNECT ผ่านอุปกรณ์ที่รองรับ",
  ],
  WPS10KS: [
    "กันน้ำและฝุ่นมาตรฐาน IP67",
    "ชั่งสูงสุด 10 กก. ละเอียด 0.5/1 กรัม",
    "นับจำนวน พร้อมเตือนน้ำหนักขาด–พอดี–เกิน",
  ],
};

test("Hero highlights follow direct, previous/next and ribbon selections", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  for (const [name, points] of Object.entries(highlights)) {
    await page.getByRole("button", { name: `แสดง ${name}`, exact: true }).click();
    await expect(
      page.getByRole("list", { name: `จุดเด่น ${name}`, exact: true }).getByRole("listitem"),
    ).toHaveText(points);
    await expect(page.locator(".hero-product-name")).toHaveText(name);
    await expect(page.getByRole("list", { name: `จุดเด่น ${name}`, exact: true })).toHaveAttribute(
      "data-popup",
      "true",
    );
  }
  await page.getByRole("button", { name: "สินค้าถัดไป", exact: true }).click();
  await expect(
    page.getByRole("list", { name: "จุดเด่น ACS-30-JC21", exact: true }).getByRole("listitem"),
  ).toHaveText(highlights["ACS-30-JC21"]);
  await page.getByRole("button", { name: "เลือกชม FEH5KS", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("list", { name: "จุดเด่น FEH5KS", exact: true }).getByRole("listitem"),
  ).toHaveText(highlights.FEH5KS);
  await expect(page.locator(".hero-buttons, .hero-scene-eyebrow, .hero-scene-brand")).toHaveCount(
    0,
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("SUNFORD");
  expect(errors).toEqual([]);
});

test("callouts surround the model without covering copy or controls across responsive layouts", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  for (const viewport of [
    { width: 320, height: 667 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 844, height: 390 },
    { width: 1024, height: 768 },
    { width: 1201, height: 500 },
    { width: 1280, height: 600 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    const positions: number[] = [];
    for (const name of Object.keys(highlights)) {
      await page.getByRole("button", { name: `แสดง ${name}`, exact: true }).click();
      const list = page.getByRole("list", { name: `จุดเด่น ${name}`, exact: true });
      await expect(list).toBeVisible();
      await expect(list.getByRole("listitem")).toHaveCount(3);
      const copy = (await page.locator(".hero-copy").boundingBox())!;
      const copyText = await page
        .locator(".hero-copy > *, .hero-product-name")
        .evaluateAll((elements) =>
          elements.map((child) => {
            const range = document.createRange();
            range.selectNodeContents(child);
            const box = range.getBoundingClientRect();
            return { x: box.x, y: box.y, width: box.width, height: box.height };
          }),
        );
      const control = (await page.locator(".slide-controls").boundingBox())!;
      const stage = (await page.locator(".hero-model-stage").boundingBox())!;
      const scene = (await page.locator(".hero-showroom").boundingBox())!;
      positions.push(control.y - scene.y);
      const callouts = await Promise.all(
        (await list.getByRole("listitem").all()).map((item) => item.boundingBox()),
      );
      const overlaps = (a: NonNullable<typeof copy>, b: NonNullable<typeof copy>) =>
        a.x < b.x + b.width - 1 &&
        a.x + a.width > b.x + 1 &&
        a.y < b.y + b.height - 1 &&
        a.y + a.height > b.y + 1;
      for (const [index, callout] of callouts.entries()) {
        expect(callout).not.toBeNull();
        const bounds = callout!;
        expect(bounds.x).toBeGreaterThanOrEqual(scene.x);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(scene.x + scene.width + 1);
        expect(bounds.y).toBeGreaterThanOrEqual(scene.y);
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(scene.y + scene.height + 1);
        expect(
          copyText.some((text) => overlaps(bounds, text)),
          `${viewport.width} ${name}: callout ${index + 1} covers copy`,
        ).toBe(false);
        expect(
          overlaps(bounds, control),
          `${viewport.width} ${name}: callout ${index + 1} covers controls`,
        ).toBe(false);
        const badgeNode = page.locator(".hero-floating-value");
        const badge = (await badgeNode.count()) ? await badgeNode.boundingBox() : null;
        for (const other of [...callouts.slice(index + 1), ...(badge ? [badge] : [])]) {
          const distance = Math.hypot(
            bounds.x + bounds.width / 2 - other!.x - other!.width / 2,
            bounds.y + bounds.height / 2 - other!.y - other!.height / 2,
          );
          expect(distance, `${viewport.width} ${name}: bubbles overlap`).toBeGreaterThan(
            (bounds.width + other!.width) / 2,
          );
        }
        const centre = { x: stage.x + stage.width / 2, y: stage.y + stage.height / 2 };
        expect(
          centre.x > bounds.x &&
            centre.x < bounds.x + bounds.width &&
            centre.y > bounds.y &&
            centre.y < bounds.y + bounds.height,
        ).toBe(false);
      }
      const sizes = callouts.map((box) => box!.width);
      const points = highlights[name as keyof typeof highlights];
      for (let index = 0; index < points.length; index++) {
        for (let other = index + 1; other < points.length; other++) {
          if (points[index].length < points[other].length)
            expect(sizes[index]).toBeLessThan(sizes[other]);
          if (points[index].length > points[other].length)
            expect(sizes[index]).toBeGreaterThan(sizes[other]);
        }
      }
      if (viewport.width > 800) {
        const [one, two, three] = callouts.map((box) => box!);
        const four = (await page.locator(".hero-bubble-layer .hero-value-badge").boundingBox())!;
        expect(one.y + one.height / 2).toBeGreaterThan(two.y + two.height / 2);
        expect(two.x).toBeLessThan(three.x);
        expect(three.y + three.height / 2).toBeLessThan(two.y + two.height / 2);
        expect(four.x).toBeGreaterThan(three.x + three.width);
      }
      await expect(page.locator(".hero-callout-lines")).toHaveCount(0);
      for (const item of await list.getByRole("listitem").all()) {
        const bubble = item.locator(".hero-feature-bubble");
        await expect(bubble).toHaveCSS("border-radius", "50%");
        const fits = await bubble.evaluate((element) => {
          const box = element.getBoundingClientRect();
          const text = element.querySelector(".hero-feature-text")!.getBoundingClientRect();
          return (
            Math.abs(element.clientWidth - element.clientHeight) <= 1 &&
            text.top >= box.top + 10 &&
            text.bottom <= box.bottom - 10 &&
            text.left >= box.left + 10 &&
            text.right <= box.right - 10
          );
        });
        expect(fits, `${viewport.width} ${name}: bubble text fits its circle`).toBe(true);
        const text = (await item.locator(".hero-feature-text").boundingBox())!;
        const chat = await page.locator(".contact-launcher").boundingBox();
        if (chat) expect(overlaps(text, chat), "feature text stays clear of chat").toBe(false);
      }
      await expect(page.locator(".hero-bubble-layer")).toHaveCSS("pointer-events", "none");
      if (viewport.width <= 800) {
        expect(copy.y + copy.height).toBeLessThanOrEqual(control.y);
        expect(control.y + control.height).toBeLessThanOrEqual(stage.y + 1);
        for (const button of await page.locator(".slide-controls button").all()) {
          if (!(await button.isVisible())) continue;
          const box = (await button.boundingBox())!;
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (name === "FEH5KS" && (viewport.width === 390 || viewport.width === 1440)) {
        await page.locator(".hero-showroom").screenshot({
          path: test.info().outputPath(`bubbles-feh-${viewport.width}.png`),
        });
      }
    }
    expect(Math.max(...positions) - Math.min(...positions)).toBeLessThanOrEqual(1);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: test.info().outputPath(`highlights-${viewport.width}.png`) });
  }
});

test("initial highlights are readable without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const list = page.getByRole("list", { name: "จุดเด่น ACS-30-JC21", exact: true });
    await expect(list).toBeVisible();
    await expect(list.getByRole("listitem")).toHaveText(highlights["ACS-30-JC21"]);
    await expect(list.locator(".hero-feature-pop").first()).toHaveCSS("opacity", "1");
    await expect(list.locator(".hero-feature-bubble").first()).toHaveCSS(
      "animation-play-state",
      "paused",
    );
  } finally {
    await context.close();
  }
});

test("feature bubbles replay on selection, float and obey shared playback and reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  const studio = page.locator("[data-hero-studio]");
  await expect(studio).toHaveAttribute("data-running", "true");
  await page.getByRole("button", { name: "แสดง FEH5KS", exact: true }).click();
  const list = page.getByRole("list", { name: "จุดเด่น FEH5KS", exact: true });
  await expect(list).toHaveAttribute("data-popup", "true");
  const entering = () =>
    list.locator(".hero-feature-pop").evaluateAll((elements) =>
      elements.map((element) => {
        const animation = element.getAnimations()[0] as CSSAnimation | undefined;
        return { name: animation?.animationName, state: animation?.playState };
      }),
    );
  await expect.poll(entering).toEqual([
    { name: "hero-feature-pop", state: "finished" },
    { name: "hero-feature-pop", state: "finished" },
    { name: "hero-feature-pop", state: "finished" },
  ]);
  const oldList = await list.elementHandle();
  await page.getByRole("button", { name: "แสดง FEH5KS", exact: true }).click();
  expect(await oldList!.evaluate((element) => element.isConnected)).toBe(false);
  expect((await entering()).some((animation) => animation.state === "running")).toBe(true);

  const bubble = page.locator(".hero-feature-bubble").first();
  const transform = await bubble.evaluate((element) => getComputedStyle(element).transform);
  await expect
    .poll(() => bubble.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(transform);
  await page.getByRole("button", { name: "หยุดการเคลื่อนไหวทั้งหมด", exact: true }).click();
  const timelines = () =>
    page.locator(".hero-feature-bubble").evaluateAll((elements) =>
      elements.flatMap((element) =>
        element.getAnimations({ subtree: true }).map((animation) => ({
          state: animation.playState,
          time: animation.currentTime,
        })),
      ),
    );
  await expect.poll(async () => (await timelines()).every((a) => a.state === "paused")).toBe(true);
  const held = await timelines();
  expect(held).toHaveLength(9);
  await page.waitForTimeout(250);
  expect(await timelines()).toEqual(held);
  await page.getByRole("button", { name: "แสดง WPS10KS", exact: true }).click();
  await expect(page.getByRole("list", { name: "จุดเด่น WPS10KS", exact: true })).toHaveAttribute(
    "data-popup",
    "false",
  );
  await expect(page.locator(".hero-feature-pop").first()).toHaveCSS("opacity", "1");
  await page.getByRole("button", { name: "เล่นการเคลื่อนไหวทั้งหมด", exact: true }).click();
  await expect.poll(async () => (await timelines()).every((a) => a.state === "running")).toBe(true);
  await page.locator("#solutions").scrollIntoViewIfNeeded();
  await expect(studio).toHaveAttribute("data-running", "false");
  await expect.poll(async () => (await timelines()).every((a) => a.state === "paused")).toBe(true);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(studio).toHaveAttribute("data-running", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(bubble).toHaveCSS("animation-name", "none");
  await expect(page.locator(".hero-feature-pop").first()).toHaveCSS("animation-name", "none");
  await expect.poll(async () => (await timelines()).length).toBe(0);
  await expect(page.locator(".hero-feature-pop").first()).toHaveCSS("opacity", "1");
});
