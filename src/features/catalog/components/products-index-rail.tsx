"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
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

function prepareRailImages(list: HTMLUListElement) {
  if (typeof IntersectionObserver === "undefined") return;

  let nearViewport = false;
  let previousLeft = 0;
  let frame = 0;
  // Clamp the scroll position so overscroll bounce does not reverse the detected direction.
  const scrollPosition = () =>
    Math.max(0, Math.min(list.scrollLeft, list.scrollWidth - list.clientWidth));

  const prepareNext = () => {
    frame = 0;
    const left = scrollPosition();
    const delta = left - previousLeft;
    if (!nearViewport || Math.abs(delta) < 1) return;
    previousLeft = left;
    const viewport = list.getBoundingClientRect();
    const cards = Array.from(list.children, (card) => ({
      card,
      bounds: card.getBoundingClientRect(),
    }));
    if (!cards.length) return;
    // The track's inline padding and snap inset are equal.
    const snapStart = cards[0].bounds.left + list.scrollLeft;
    // Lead the next snap position as soon as scrolling starts, including when the
    // currently clipped card is one of the two images we already prepared.
    const forward = delta > 0;
    const target = forward
      ? cards.findIndex(({ bounds }) => bounds.left >= snapStart - 1)
      : cards.findLastIndex(({ bounds }) => bounds.left <= snapStart + 1);
    if (target < 0) return;
    const travel = cards[target].bounds.left - snapStart;
    const upcoming = forward
      ? cards.find(({ bounds }, index) => index > target && bounds.right > viewport.right + travel)
      : cards.findLast(
          ({ bounds }, index) => index < target && bounds.left < viewport.left + travel,
        );
    prepareCardImage(upcoming?.card);
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
        const cards = Array.from(list.children);
        if (!cards.length) return;
        const snapStart = cards[0].getBoundingClientRect().left + list.scrollLeft;
        const start = cards.findIndex((card) => card.getBoundingClientRect().right > snapStart + 1);
        if (start < 0) return;
        for (const card of cards.slice(start, start + 2)) prepareCardImage(card);
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
  children,
}: {
  id: string;
  label: string;
  categoryRail?: boolean;
  prepareImages?: boolean;
  children: ReactNode;
}) {
  const track = useRef<HTMLUListElement>(null);
  const motion = useRef<{ frame: number; target: number } | null>(null);
  const [savedLeft, saveLeft] = useReturnState<number | null>(`storefront.${id}.left`, null);
  const [edges, setEdges] = useState({ previous: false, next: false });

  function stopMotion() {
    if (!motion.current) return;
    cancelAnimationFrame(motion.current.frame);
    motion.current = null;
    if (track.current) delete track.current.dataset.stepping;
  }

  useEffect(() => stopMotion, []);

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
        className={styles.track}
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
        <div className={styles.controls}>
          <button
            type="button"
            aria-controls={id}
            aria-label={`เลื่อน${label}ก่อนหน้า`}
            disabled={!edges.previous}
            onClick={() => advance(-1)}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-controls={id}
            aria-label={`เลื่อน${label}ถัดไป`}
            disabled={!edges.next}
            onClick={() => advance(1)}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}
