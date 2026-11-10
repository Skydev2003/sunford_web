import { expect, type Locator, type Page } from "@playwright/test";

export type StaggerWindow = Window & { staggerAnimations: Animation[] };

export async function recordStaggerMotion(page: Page, freeze = false) {
  await page.addInitScript((paused) => {
    const state = window as unknown as StaggerWindow;
    state.staggerAnimations = [];
    const native = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      const animation = native.call(this, frames, options);
      if (typeof options === "object" && options.id === "sunford-stagger-bounce") {
        state.staggerAnimations.push(animation);
        if (paused) {
          animation.pause();
          animation.currentTime = 0;
        }
      }
      return animation;
    };
  }, freeze);
}

export async function staggerCount(target: Locator) {
  return target.evaluate(
    (element) =>
      (window as unknown as StaggerWindow).staggerAnimations.filter(
        (animation) => (animation.effect as KeyframeEffect).target === element,
      ).length,
  );
}

export async function expectStaggerMotion(target: Locator, count = 1) {
  await expect.poll(() => staggerCount(target)).toBe(count);
}

export async function activeStaggerCount(target: Locator) {
  return target.evaluate(
    (element) => element.getAnimations().filter((a) => a.id === "sunford-stagger-bounce").length,
  );
}
