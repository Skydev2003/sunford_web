import { expect, test } from "@playwright/test";

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] } });

for (const width of [1440, 390]) {
  test(`feature bubbles emerge from the scale at randomized angles at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator(".hero-model-stage")).toHaveAttribute("data-status", "ready", {
      timeout: 30000,
    });
    const select = page.getByRole("button", { name: "แสดง ACS-30-JC21", exact: true });
    const layer = page.locator(".hero-bubble-layer");
    let previous: Array<{ x: number; y: number }> | undefined;
    for (let pass = 0; pass < 2; pass++) {
      await select.click();
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await expect(layer.locator(".hero-feature-pop")).toHaveCount(width > 800 ? 4 : 3);
      const flight = await layer.evaluate((root) => {
        const model = document.querySelector(".hero-model-stage")!.getBoundingClientRect();
        const points = Array.from(root.querySelectorAll<HTMLElement>(".hero-feature-pop")).map(
          (pop) => {
            const animation = pop.getAnimations()[0];
            animation.pause();
            const timing = animation.effect!.getTiming();
            const sample = (progress: number) => {
              animation.currentTime = Number(timing.delay) + Number(timing.duration) * progress;
              const box = pop.getBoundingClientRect();
              return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
            };
            const start = sample(0);
            const early = sample(0.15);
            const middle = sample(0.5);
            const late = sample(0.85);
            const end = sample(1);
            animation.finish();
            return {
              start,
              early,
              middle,
              late,
              end,
              distance: Math.hypot(end.x - start.x, end.y - start.y),
            };
          },
        );
        return {
          model: { x: model.x, y: model.y, width: model.width, height: model.height },
          points,
        };
      });
      const origins = flight.points.map(({ start, early, middle, late, end, distance }) => {
        expect(start.x).toBeGreaterThan(flight.model.x + flight.model.width * 0.35);
        expect(start.x).toBeLessThan(flight.model.x + flight.model.width * 0.65);
        expect(start.y).toBeGreaterThan(flight.model.y + flight.model.height * 0.35);
        expect(start.y).toBeLessThan(flight.model.y + flight.model.height * 0.65);
        expect(distance).toBeGreaterThan(40);
        expect(Math.hypot(early.x - start.x, early.y - start.y) / distance).toBeLessThan(0.25);
        expect(Math.hypot(end.x - late.x, end.y - late.y)).toBeLessThan(
          Math.hypot(end.x - middle.x, end.y - middle.y) * 0.3,
        );
        const curve =
          Math.abs(
            (middle.x - start.x) * (end.y - start.y) - (middle.y - start.y) * (end.x - start.x),
          ) / distance;
        expect(curve).toBeGreaterThan(0.5);
        return start;
      });
      expect(
        new Set(origins.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)).size,
      ).toBe(origins.length);
      if (previous) expect(origins).not.toEqual(previous);
      previous = origins;
    }
    await select.click();
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await layer.locator(".hero-feature-pop").evaluateAll((pops) => {
      for (const pop of pops) {
        const animation = pop.getAnimations()[0];
        animation.pause();
        const timing = animation.effect!.getTiming();
        animation.currentTime = Number(timing.delay) + Number(timing.duration) * 0.28;
      }
    });
    await page.screenshot({ path: test.info().outputPath(`emerging-${width}.png`) });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(layer.locator(".hero-feature-pop").first()).toHaveCSS("animation-name", "none");
    await expect(layer.locator(".hero-feature-pop").first()).toHaveCSS("transform", "none");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
