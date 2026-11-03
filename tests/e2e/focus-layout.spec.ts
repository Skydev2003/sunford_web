import { expect, test } from "@playwright/test";

test("focus carousels read card geometry before writing visual styles", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const owners = new WeakMap<CSSStyleDeclaration, HTMLElement>();
    const dirtyTracks = new Set<Element>();
    const style = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "style")!;
    const offset = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetLeft")!;
    const setProperty = CSSStyleDeclaration.prototype.setProperty;
    let readsAfterWrites = 0;
    Object.defineProperty(HTMLElement.prototype, "style", {
      ...style,
      get() {
        const value = style.get!.call(this);
        owners.set(value, this);
        return value;
      },
    });
    CSSStyleDeclaration.prototype.setProperty = function (name, value, priority) {
      const owner = owners.get(this);
      if (
        name.startsWith("--focus-") &&
        owner?.parentElement &&
        this.getPropertyValue(name) !== value
      ) {
        dirtyTracks.add(owner.parentElement);
        queueMicrotask(() => dirtyTracks.clear());
      }
      return setProperty.call(this, name, value, priority);
    };
    Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
      ...offset,
      get() {
        if (this.parentElement && dirtyTracks.has(this.parentElement)) {
          readsAfterWrites++;
          dirtyTracks.delete(this.parentElement);
        }
        return offset.get!.call(this);
      },
    });
    Object.assign(window, { focusLayoutReads: () => readsAfterWrites });
  });
  await page.goto("/");
  await expect(page.locator('[data-focus-ready="true"]')).toHaveCount(2);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  const reads = await page.evaluate(() =>
    (window as unknown as { focusLayoutReads: () => number }).focusLayoutReads(),
  );
  // Development effect replay may reconcile each track once, never once per card.
  expect(reads).toBeLessThanOrEqual(2);
});
