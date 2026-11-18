"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReturnState } from "@/features/site/history/return-state";
import styles from "./products-index-content.module.css";

export function ProductsIndexRail({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [savedLeft, saveLeft] = useReturnState<number | null>(`storefront.${id}.left`, null);
  const [edges, setEdges] = useState({ previous: false, next: false });

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
    const count = Math.max(1, Math.floor((space + parseFloat(css.columnGap)) / step));
    list.scrollBy({
      left: direction * count * step,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  return (
    <>
      <ul
        ref={track}
        id={id}
        className={styles.track}
        tabIndex={0}
        aria-label={label}
        onScrollEnd={(event) => {
          if (event.currentTarget.clientWidth) saveLeft(event.currentTarget.scrollLeft);
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
