"use client";

import { useLayoutEffect, type RefObject } from "react";

const targets =
  "h1, h2, h3, h4, p, li, figure, table, dl, a, button, summary, img, video, iframe, footer span";
const excluded =
  '[hidden], [inert], [aria-hidden="true"], dialog, [role="dialog"], [role="tooltip"], [role="tablist"], [data-focus-ready], model-viewer, [data-overview-section="index"], [data-products-footer], .site-footer';
const group = "ul, ol, section, header, article, nav, footer, main";
const animationId = "sunford-stagger-bounce";

export function useStaggerBounce(root: RefObject<HTMLDivElement | null>, pathname: string) {
  useLayoutEffect(() => {
    const host = root.current;
    if (!host || pathname === "/" || !Element.prototype.animate || !window.IntersectionObserver)
      return;

    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const managed = new Set<HTMLElement>();
    const seen = new WeakSet<HTMLElement>();
    const animations = new Map<HTMLElement, Animation>();
    let frame = 0;
    let closeFrame = 0;
    let disposed = false;
    let openingScanComplete = false;

    const visible = (element: HTMLElement) =>
      !element.closest(excluded) &&
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility === "visible";

    const inInitialViewport = (element: HTMLElement) => {
      const bounds = element.getBoundingClientRect();
      return (
        bounds.bottom > 0 &&
        bounds.right > 0 &&
        bounds.top < window.innerHeight &&
        bounds.left < window.innerWidth
      );
    };

    const complete = (element: HTMLElement) => {
      seen.add(element);
      animations.get(element)?.cancel();
      animations.delete(element);
    };

    const closeOpening = () => {
      closeFrame = 0;
      openingScanComplete = true;
    };

    const scheduleClose = () => {
      cancelAnimationFrame(closeFrame);
      closeFrame = requestAnimationFrame(() => {
        closeFrame = requestAnimationFrame(closeOpening);
      });
    };

    const start = (element: HTMLElement, index: number) => {
      seen.add(element);
      const animation = element.animate(
        [
          { opacity: 0.65, translate: "0 16px" },
          { opacity: 1, translate: "0 0px" },
        ],
        {
          id: animationId,
          duration: 650,
          delay: Math.min(index * 80, 320),
          easing: "ease-out",
          fill: "backwards",
        },
      );
      animations.set(element, animation);
      void animation.finished.then(
        () => {
          if (!disposed && animations.get(element) === animation) complete(element);
        },
        () => {},
      );
    };

    const scan = () => {
      frame = 0;
      if (disposed) return;
      host.setAttribute("data-stagger-bounce-root", preference.matches ? "reduced" : "enabled");
      const selected = new Set<HTMLElement>();
      const order = new Map<Element, number>();
      for (const scope of host.querySelectorAll<HTMLElement>("main, footer")) {
        if (!visible(scope)) continue;
        for (const element of scope.querySelectorAll<HTMLElement>(targets)) {
          if (
            !visible(element) ||
            element.closest("li[data-slide]") === element ||
            (element.tagName === "LI" && element.querySelector("section, article, ul, ol")) ||
            (!element.textContent?.trim() &&
              !element.matches("img, video, iframe") &&
              !element.querySelector("img, video")) ||
            ["fixed", "sticky"].includes(getComputedStyle(element).position)
          )
            continue;
          let ancestor = element.parentElement;
          while (ancestor && ancestor !== scope && !selected.has(ancestor))
            ancestor = ancestor.parentElement;
          if (ancestor && selected.has(ancestor)) continue;
          selected.add(element);
          if (managed.has(element)) {
            if (!seen.has(element) && openingScanComplete) complete(element);
            continue;
          }
          managed.add(element);
          if (
            preference.matches ||
            openingScanComplete ||
            !inInitialViewport(element) ||
            element.contains(document.activeElement)
          ) {
            complete(element);
            continue;
          }
          const parent = element.parentElement?.closest(group) ?? host;
          const index = order.get(parent) ?? 0;
          order.set(parent, index + 1);
          start(element, index);
        }
      }
      for (const element of managed) {
        if (selected.has(element)) continue;
        animations.get(element)?.cancel();
        animations.delete(element);
        managed.delete(element);
      }
      if (document.readyState === "complete") scheduleClose();
    };
    const requestScan = () => {
      if (!openingScanComplete) {
        cancelAnimationFrame(closeFrame);
        closeFrame = 0;
      }
      if (!frame) frame = requestAnimationFrame(scan);
    };
    const mutations = new MutationObserver(requestScan);
    mutations.observe(host, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden", "inert", "aria-hidden", "open"],
    });
    const sync = () => {
      if (preference.matches) for (const element of managed) complete(element);
      requestScan();
    };
    const focus = (event: FocusEvent) => {
      let element = event.target as HTMLElement | null;
      if (!element?.matches(":focus-visible")) return;
      while (element && element !== host && !managed.has(element)) element = element.parentElement;
      if (element && managed.has(element)) complete(element);
    };
    host.addEventListener("focusin", focus);
    preference.addEventListener("change", sync);
    window.addEventListener("load", scheduleClose, { once: true });
    window.addEventListener("scroll", closeOpening, { once: true, passive: true });
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(scan);
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(closeFrame);
      mutations.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      host.removeAttribute("data-stagger-bounce-root");
      host.removeEventListener("focusin", focus);
      preference.removeEventListener("change", sync);
      window.removeEventListener("load", scheduleClose);
      window.removeEventListener("scroll", closeOpening);
    };
  }, [root, pathname]);
}
