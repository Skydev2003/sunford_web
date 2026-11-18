"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cubicBezier } from "motion";
import { useReturnState } from "@/features/site/history/return-state";
import styles from "./products-index-content.module.css";

const shelfEase = cubicBezier(0.25, 0.1, 0.25, 0.9);

export function ProductsIndexRail({
  id,
  label,
  categoryRail = false,
  children,
}: {
  id: string;
  label: string;
  categoryRail?: boolean;
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

  function advance(direction: number) {
    const list = track.current;
    const first = list?.firstElementChild;
    if (!list || !first) return;
    const css = getComputedStyle(list);
    const step = first.getBoundingClientRect().width + parseFloat(css.columnGap);
    const space = list.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight);
    const desktop = matchMedia("(min-width: 64rem)").matches;
    const count =
      !categoryRail && desktop
        ? 1
        : Math.max(1, Math.floor((space + parseFloat(css.columnGap)) / step));
    const distance = direction * count * step;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (categoryRail) {
      list.scrollBy({ left: distance, behavior: reduced.matches ? "instant" : "smooth" });
      return;
    }

    const start = list.scrollLeft;
    const target = Math.max(
      0,
      Math.min(list.scrollWidth - list.clientWidth, (motion.current?.target ?? start) + distance),
    );
    if (reduced.matches || target === start) {
      stopMotion();
      list.scrollTo({ left: target, behavior: "instant" });
      return;
    }

    if (motion.current) cancelAnimationFrame(motion.current.frame);
    list.dataset.stepping = "";
    const duration = desktop ? 465 : 478;
    const started = performance.now();
    const animation = { frame: 0, target };
    motion.current = animation;
    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - started) / duration));
      if (progress === 1 || reduced.matches) {
        stopMotion();
        list.scrollTo({ left: target, behavior: "instant" });
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
