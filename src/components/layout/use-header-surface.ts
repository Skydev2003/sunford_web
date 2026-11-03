"use client";

import { useEffect, type RefObject } from "react";

function isLightSurface(element: Element | undefined) {
  let remaining = 1;
  const channels = [0, 0, 0];
  for (let node = element; node; node = node.parentElement ?? undefined) {
    const color = getComputedStyle(node).backgroundColor;
    if (!color.startsWith("rgb")) continue;
    const values = color.match(/[\d.]+/g)?.map(Number);
    if (!values || values.length < 3) continue;
    const alpha = values[3] ?? 1;
    channels.forEach((_, index) => (channels[index] += values[index] * alpha * remaining));
    remaining *= 1 - alpha;
    if (remaining < 0.01) break;
  }
  const [red, green, blue] = channels.map((value) => value + 255 * remaining);
  return red * 0.2126 + green * 0.7152 + blue * 0.0722 > 160;
}

export function useHeaderSurface(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const header = ref.current;
    const surface = header?.parentElement;
    if (!header || !surface) return;
    let frame = 0;
    let active = true;
    const update = () => {
      frame = 0;
      const top = header.querySelector(".header-inner")?.getBoundingClientRect();
      const y = (top?.height ?? 58) / 2;
      const lightSamples = [0.25, 0.5, 0.75].filter((fraction) => {
        const content = document
          .elementsFromPoint(innerWidth * fraction, y)
          .find((element) => element.closest("main, footer"));
        const section = content?.closest("section, article, main, footer") ?? content;
        return isLightSurface(section);
      }).length;
      const tone = lightSamples >= 2 ? "light" : "dark";
      if (header.dataset.navTone !== tone) header.dataset.navTone = tone;
    };
    const schedule = () => {
      if (active && !frame) frame = requestAnimationFrame(update);
    };
    // Route changes replace content beneath the persistent Header, even at scrollY 0.
    const content = new MutationObserver((records) => {
      if (records.some((record) => !header.contains(record.target))) schedule();
    });
    content.observe(surface, { childList: true, subtree: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(surface);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    void document.fonts.ready.then(schedule);
    update();
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      content.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
    };
  }, [ref]);
}
