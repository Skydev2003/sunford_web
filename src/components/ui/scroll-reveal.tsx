"use client";

import { useEffect, useRef, type RefObject } from "react";
import styles from "./scroll-reveal.module.css";

const threshold = 0.1;
// Next can detach an Activity and later reattach the same elements on Back.
const seen = new WeakSet<Element>();

type Options = { selector?: string; grid?: boolean };

function observeReveal(root: HTMLElement | null, { selector, grid = false }: Options) {
  if (!root || typeof IntersectionObserver === "undefined" || !Element.prototype.animate) return;

  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const targets = selector ?? (grid ? ":scope > article" : "[data-scroll-reveal]");
  const observed = new Map<Element, { index: number; initial: boolean }>();
  const animations = new Map<Element, Animation>();
  const listeners = new AbortController();

  const complete = (element: Element) => {
    seen.add(element);
    element.classList.remove(styles.pending);
    observer.unobserve(element);
    observed.delete(element);
    animations.get(element)?.cancel();
    animations.delete(element);
  };

  const selected = (element: Element) => {
    const selection = window.getSelection();
    return selection && !selection.isCollapsed && selection.containsNode(element, true);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const element = entry.target;
        const target = observed.get(element);
        if (!target) continue;

        if (target.initial) {
          const bounds = entry.boundingClientRect;
          if (!bounds.width || !bounds.height) continue;
          target.initial = false;
          const viewportTop = entry.rootBounds?.top ?? 0;
          const viewportBottom = entry.rootBounds?.bottom ?? innerHeight;
          const possibleWidth = Math.min(bounds.width, entry.rootBounds?.width ?? innerWidth);
          const possibleHeight = Math.min(bounds.height, viewportBottom - viewportTop);
          // Anything already reached at hydration or insertion stays in place.
          if (
            (entry.isIntersecting && bounds.top < viewportBottom) ||
            bounds.bottom <= viewportTop ||
            possibleWidth * possibleHeight <= threshold * bounds.width * bounds.height ||
            element.contains(document.activeElement) ||
            selected(element)
          ) {
            complete(element);
            continue;
          }
          if (bounds.top >= viewportBottom) element.classList.add(styles.pending);
        }

        if (!entry.isIntersecting || entry.intersectionRatio < threshold) continue;
        complete(element);
        if (preference.matches || element.contains(document.activeElement) || selected(element))
          continue;

        const animation = element.animate(
          [
            { opacity: 0, translate: "0 24px" },
            { opacity: 1, translate: "0 0px" },
          ],
          {
            id: "sunford-scroll-reveal",
            duration: 700,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            delay: grid ? (target.index % 4) * 80 : 0,
            fill: "backwards",
          },
        );
        animations.set(element, animation);
        void animation.finished.then(
          () => animations.delete(element),
          () => {},
        );
      }
    },
    { threshold },
  );

  const scan = () => {
    if (preference.matches) return;
    for (const element of observed.keys()) {
      if (!root.contains(element)) {
        element.classList.remove(styles.pending);
        observer.unobserve(element);
        observed.delete(element);
      }
    }
    root.querySelectorAll(targets).forEach((element, index) => {
      if (seen.has(element)) return;
      const target = observed.get(element);
      if (target) {
        target.index = index;
      } else {
        observed.set(element, { index, initial: true });
        observer.observe(element);
      }
    });
  };

  const resetMotion = () => {
    for (const element of animations.keys()) complete(element);
    for (const element of observed.keys()) element.classList.remove(styles.pending);
  };
  const onRestore = () => {
    resetMotion();
    for (const [element, target] of observed) {
      target.initial = true;
      observer.unobserve(element);
      observer.observe(element);
    }
  };
  const onFocus = (event: FocusEvent) => {
    for (
      let element = event.target as Element | null;
      element && element !== root;
      element = element.parentElement
    ) {
      if (observed.has(element) || animations.has(element)) complete(element);
    }
  };
  const syncPreference = () => {
    root.dataset.scrollRevealMode = preference.matches ? "reduced" : "enabled";
    if (preference.matches) {
      resetMotion();
      observer.disconnect();
      observed.clear();
    } else {
      scan();
    }
  };

  const changes = new MutationObserver(scan);
  changes.observe(root, { childList: true, subtree: !grid || Boolean(selector) });
  const options = { signal: listeners.signal };
  preference.addEventListener("change", syncPreference, options);
  window.addEventListener("popstate", onRestore, options);
  window.addEventListener(
    "pageshow",
    (event) => {
      if (event.persisted) onRestore();
    },
    options,
  );
  document.addEventListener(
    "selectionchange",
    () => {
      for (const element of observed.keys()) if (selected(element)) complete(element);
      for (const element of animations.keys()) if (selected(element)) complete(element);
    },
    options,
  );
  root.addEventListener("focusin", onFocus, options);
  syncPreference();

  return () => {
    changes.disconnect();
    observer.disconnect();
    resetMotion();
    listeners.abort();
    delete root.dataset.scrollRevealMode;
  };
}

export function useScrollReveal(
  root: RefObject<HTMLElement | null>,
  { selector, grid }: Options = {},
) {
  useEffect(() => observeReveal(root.current, { selector, grid }), [root, selector, grid]);
}

export function ScrollReveal({ rootId, selector }: { rootId: string; selector?: string }) {
  const marker = useRef<HTMLTemplateElement>(null);
  useEffect(() => {
    const root = marker.current?.closest<HTMLElement>("#" + CSS.escape(rootId)) ?? null;
    return observeReveal(root, { selector });
  }, [rootId, selector]);
  return <template ref={marker} />;
}
