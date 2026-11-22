"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cubicBezier } from "motion";
import { useReturnState } from "@/features/site/history/return-state";
import styles from "./products-index-content.module.css";

const shelfEase = cubicBezier(0.25, 0.1, 0.25, 0.9);
const imageLeadViewports = 1.25;

function prepareCardImage(card: Element | undefined) {
  const image = card?.querySelector<HTMLImageElement>('img[loading="lazy"]');
  if (image && !(image.complete && image.naturalWidth)) image.loading = "eager";
}

function firstCardIndex(length: number, matches: (index: number) => boolean) {
  let start = 0;
  let end = length;
  while (start < end) {
    const middle = Math.floor((start + end) / 2);
    if (matches(middle)) end = middle;
    else start = middle + 1;
  }
  return start;
}

function prepareRailImages(list: HTMLUListElement) {
  if (typeof IntersectionObserver === "undefined") return;

  let nearViewport = false;
  let previousLeft = 0;
  let frame = 0;
  const cards = list.children;
  const bounds = (index: number) => cards[index].getBoundingClientRect();
  // Clamp the scroll position so overscroll bounce does not reverse the detected direction.
  const scrollPosition = () =>
    Math.max(0, Math.min(list.scrollLeft, list.scrollWidth - list.clientWidth));

  const prepareNext = () => {
    frame = 0;
    const left = scrollPosition();
    const delta = left - previousLeft;
    if (!nearViewport || Math.abs(delta) < 1) return;
    previousLeft = left;
    const count = cards.length;
    if (!count) return;
    const viewport = list.getBoundingClientRect();
    // Inline padding and snap inset are equal. DOM order is the physical order
    // on this track, so look up each edge without measuring every card on a scroll frame.
    const snapStart = bounds(0).left + list.scrollLeft;
    const forward = delta > 0;
    const target = forward
      ? firstCardIndex(count, (index) => bounds(index).left >= snapStart - 1)
      : firstCardIndex(count, (index) => bounds(index).left > snapStart + 1) - 1;
    if (target < 0 || target >= count) return;
    const travel = bounds(target).left - snapStart;
    const upcoming = forward
      ? firstCardIndex(
          count,
          (index) => index > target && bounds(index).right > viewport.right + travel,
        )
      : firstCardIndex(
          count,
          (index) => index >= target || bounds(index).left >= viewport.left + travel,
        ) - 1;
    prepareCardImage(cards[upcoming]);
  };

  const onScroll = () => {
    if (nearViewport && !frame) frame = requestAnimationFrame(prepareNext);
  };

  const observeViewport = () => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        nearViewport = entry.isIntersecting;
        if (!nearViewport) return;
        previousLeft = scrollPosition();
        if (!cards.length) return;
        const snapStart = bounds(0).left + list.scrollLeft;
        const start = firstCardIndex(cards.length, (index) => bounds(index).right > snapStart + 1);
        prepareCardImage(cards[start]);
        prepareCardImage(cards[start + 1]);
      },
      { rootMargin: `${Math.round(innerHeight * imageLeadViewports)}px 0px` },
    );
    observer.observe(list);
    return observer;
  };
  let observer = observeViewport();
  const onResize = () => {
    observer.disconnect();
    observer = observeViewport();
  };
  window.addEventListener("resize", onResize);
  list.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    observer.disconnect();
    window.removeEventListener("resize", onResize);
    list.removeEventListener("scroll", onScroll);
    cancelAnimationFrame(frame);
  };
}

export function ProductsIndexRail({
  id,
  label,
  categoryRail = false,
  prepareImages = false,
  trackClassName = styles.track,
  controlsClassName = styles.controls,
  controlClassNames,
  controlLabels,
  controlIconSize,
  hideUnavailableControls = false,
  revealTabFocus = false,
  returnKey = id,
  children,
}: {
  id: string;
  label: string;
  categoryRail?: boolean;
  prepareImages?: boolean;
  trackClassName?: string;
  controlsClassName?: string;
  controlClassNames?: { previous: string; next: string };
  controlLabels?: { previous: string; next: string };
  controlIconSize?: number;
  hideUnavailableControls?: boolean;
  revealTabFocus?: boolean;
  returnKey?: string;
  children: ReactNode;
}) {
  const track = useRef<HTMLUListElement>(null);
  const motion = useRef<{ frame: number; target: number } | null>(null);
  const [savedLeft, saveLeft] = useReturnState<number | null>(`storefront.${returnKey}.left`, null);
  const [edges, setEdges] = useState({ previous: false, next: false });

  const stopMotion = useCallback(() => {
    if (!motion.current) return;
    cancelAnimationFrame(motion.current.frame);
    motion.current = null;
    if (track.current) delete track.current.dataset.stepping;
  }, []);

  useEffect(() => stopMotion, [stopMotion]);

  useEffect(() => {
    if (!revealTabFocus) return;
    let frame = 0;
    const onTab = (event: KeyboardEvent) => {
      if (!event.isTrusted || event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey)
        return;
      const previousFocus = document.activeElement;
      if (previousFocus?.closest("dialog[open]")) return;
      cancelAnimationFrame(frame);
      // Wait for native Tab navigation; focus restored by a dialog or history should not scroll.
      frame = requestAnimationFrame(() => {
        const list = track.current;
        const focused = document.activeElement;
        if (
          event.defaultPrevented ||
          !list ||
          !(focused instanceof HTMLElement) ||
          focused === previousFocus ||
          focused === list ||
          !list.contains(focused) ||
          !focused.matches(":focus-visible")
        )
          return;
        const left = list.getBoundingClientRect().left + list.clientLeft;
        const isClipped = () => {
          const target = focused.getBoundingClientRect();
          return target.left < left || target.right > left + list.clientWidth;
        };
        if (!isClipped()) return;
        stopMotion();
        focused.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
        if (isClipped()) {
          // A short nearest adjustment can snap back to the current card.
          const card = focused.closest("li");
          const first = list.firstElementChild;
          if (card?.parentElement === list && first) {
            list.scrollTo({
              left: card.getBoundingClientRect().left - first.getBoundingClientRect().left,
              behavior: "instant",
            });
          }
        }
        // A pending scrollend update can still hold the previous card during rapid Tab presses.
        saveLeft(list.scrollLeft);
      });
    };
    document.addEventListener("keydown", onTab, true);
    return () => {
      document.removeEventListener("keydown", onTab, true);
      cancelAnimationFrame(frame);
    };
  }, [revealTabFocus, saveLeft, stopMotion]);

  useLayoutEffect(() => {
    const list = track.current;
    if (savedLeft !== null && list?.clientWidth && Math.abs(list.scrollLeft - savedLeft) > 1) {
      list.scrollTo({ left: savedLeft, behavior: "instant" });
    }
  }, [savedLeft]);

  useEffect(() => {
    const list = track.current;
    if (!list) return;
    const measure = () => {
      const previous = list.scrollLeft > 1;
      const next = list.scrollWidth - list.clientWidth - list.scrollLeft > 1;
      setEdges((old) =>
        old.previous === previous && old.next === next ? old : { previous, next },
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    measure();
    list.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      list.removeEventListener("scroll", measure);
    };
  }, [children]);

  useEffect(() => {
    const list = track.current;
    if (prepareImages && list) return prepareRailImages(list);
  }, [children, prepareImages]);

  function advance(direction: number) {
    const list = track.current;
    const first = list?.firstElementChild;
    if (!list || !first) return;
    const css = getComputedStyle(list);
    const firstCard = first.getBoundingClientRect();
    const gap = parseFloat(css.columnGap);
    const step = firstCard.width + gap;
    const space = list.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight);
    const desktop = matchMedia("(min-width: 64rem)").matches;
    const count = !categoryRail && desktop ? 1 : Math.max(1, Math.floor((space + gap) / step));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (categoryRail) {
      list.scrollBy({
        left: direction * count * step,
        behavior: reduced.matches ? "instant" : "smooth",
      });
      return;
    }

    const start = list.scrollLeft;
    const end = list.scrollWidth - list.clientWidth;
    // The track uses the same inline inset for its padding and snap alignment.
    const cardStarts = Array.from(
      list.children,
      (card) => card.getBoundingClientRect().left - firstCard.left,
    );
    const stops = [0, ...cardStarts.filter((left) => left > 0 && left < end), end];
    const origin = motion.current?.target ?? start;
    const currentIndex = stops.reduce(
      (closest, left, index) =>
        Math.abs(left - origin) < Math.abs(stops[closest] - origin) ? index : closest,
      0,
    );
    const targetIndex = Math.max(0, Math.min(stops.length - 1, currentIndex + direction * count));
    const target = stops[targetIndex];
    if (reduced.matches || target === start) {
      stopMotion();
      list.scrollTo({ left: target, behavior: "instant" });
      return;
    }
    if (motion.current?.target === target) return;

    if (motion.current) cancelAnimationFrame(motion.current.frame);
    list.dataset.stepping = "";
    const duration = desktop ? 465 : 478;
    const started = performance.now();
    const animation = { frame: 0, target };
    motion.current = animation;
    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - started) / duration));
      if (progress === 1 || reduced.matches) {
        list.scrollTo({ left: target, behavior: "instant" });
        stopMotion();
        saveLeft(list.scrollLeft);
        return;
      }
      const eased = shelfEase(progress);
      list.scrollTo({ left: start + (target - start) * eased, behavior: "instant" });
      animation.frame = requestAnimationFrame(tick);
    };
    animation.frame = requestAnimationFrame(tick);
  }

  return (
    <>
      <ul
        ref={track}
        id={id}
        className={trackClassName}
        tabIndex={0}
        aria-label={label}
        onPointerDown={stopMotion}
        onWheel={stopMotion}
        onKeyDown={stopMotion}
        onScrollEnd={(event) => {
          if (!motion.current && event.currentTarget.clientWidth)
            saveLeft(event.currentTarget.scrollLeft);
        }}
        onClickCapture={(event) => saveLeft(event.currentTarget.scrollLeft)}
      >
        {children}
      </ul>
      {(edges.previous || edges.next) && (
        <div className={controlsClassName}>
          {!hideUnavailableControls || edges.previous ? (
            <button
              className={controlClassNames?.previous}
              type="button"
              aria-controls={id}
              aria-label={controlLabels?.previous ?? `เลื่อน${label}ก่อนหน้า`}
              disabled={!edges.previous}
              onClick={() => advance(-1)}
            >
              <ChevronLeft size={controlIconSize} aria-hidden="true" />
            </button>
          ) : null}
          {!hideUnavailableControls || edges.next ? (
            <button
              className={controlClassNames?.next}
              type="button"
              aria-controls={id}
              aria-label={controlLabels?.next ?? `เลื่อน${label}ถัดไป`}
              disabled={!edges.next}
              onClick={() => advance(1)}
            >
              <ChevronRight size={controlIconSize} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      )}
    </>
  );
}
