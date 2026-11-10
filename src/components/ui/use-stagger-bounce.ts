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
    let disposed = false;

    const visible = (element: HTMLElement) =>
      !element.closest(excluded) &&
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility === "visible";

    const complete = (element: HTMLElement) => {
      seen.add(element);
      observer.unobserve(element);
      animations.get(element)?.cancel();
      animations.delete(element);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (disposed) return;
        const order = new Map<Element, number>();
        const entering = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) =>
            a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
          );
        for (const element of entering) {
          if (!managed.has(element) || seen.has(element) || !visible(element)) continue;
          if (preference.matches || element.contains(document.activeElement)) {
            complete(element);
            continue;
          }
          const parent = element.parentElement?.closest(group) ?? host;
          const index = order.get(parent) ?? 0;
          order.set(parent, index + 1);
          seen.add(element);
          observer.unobserve(element);
          const animation = element.animate(
            [
              { opacity: 0, translate: "0 40px", scale: 0.8 },
              { opacity: 1, translate: "0 0px", scale: 1 },
            ],
            {
              id: animationId,
              duration: 800,
              delay: 100 + index * 150,
              easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
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
        }
      },
      { threshold: 0 },
    );

    const scan = () => {
      frame = 0;
      if (disposed) return;
      host.setAttribute("data-stagger-bounce-root", preference.matches ? "reduced" : "enabled");
      const selected = new Set<HTMLElement>();
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
            if (!seen.has(element)) {
              observer.unobserve(element);
              observer.observe(element);
            }
            continue;
          }
          managed.add(element);
          if (preference.matches || seen.has(element)) complete(element);
          else observer.observe(element);
        }
      }
      for (const element of managed) {
        if (selected.has(element)) continue;
        observer.unobserve(element);
        animations.get(element)?.cancel();
        animations.delete(element);
        managed.delete(element);
      }
    };
    const requestScan = () => {
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
    scan();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      mutations.disconnect();
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      host.removeAttribute("data-stagger-bounce-root");
      host.removeEventListener("focusin", focus);
      preference.removeEventListener("change", sync);
    };
  }, [root, pathname]);
}
