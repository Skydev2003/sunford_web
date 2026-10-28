"use client";

import { Children, useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { DragScroll } from "./drag-scroll";
import styles from "./focus-drag-scroll.module.css";

// Stories and videos share the continuous focus effect. On phones, tapping a
// side preview centers it before allowing its link or play action.
export function FocusDragScroll({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label: string;
  className: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const count = Children.count(children);

  function focusMobilePreview(event: MouseEvent<HTMLDivElement>) {
    if (
      !window.matchMedia("(max-width: 720px)").matches ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const track = event.currentTarget;
    const card = Array.from(track.children).find((child) =>
      child.contains(event.target as Node),
    ) as HTMLElement | undefined;
    if (!card) return;
    const left = card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2;
    if (Math.abs(left - track.scrollLeft) < 2) return;

    event.preventDefault();
    event.stopPropagation();
    track.scrollTo({
      left,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  useEffect(() => {
    const track = host.current?.firstElementChild as HTMLDivElement | undefined;
    if (!track) return;
    let selected = Math.max(0, Math.min(1, count - 1));
    let frame = 0;
    const cards = Array.from(track.children) as HTMLElement[];

    function center() {
      const card = cards[selected];
      if (!card) return;
      track!.scrollLeft = card.offsetLeft + card.offsetWidth / 2 - track!.clientWidth / 2;
      measure();
    }

    function measure() {
      const middle = track!.scrollLeft + track!.clientWidth / 2;
      let distance = Infinity;
      let closest = selected;
      const step =
        cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : (cards[0]?.offsetWidth ?? 1);
      const clearRadius = window.matchMedia("(min-width: 721px)").matches ? step : 0;
      cards.forEach((card, index) => {
        const delta = Math.abs(card.offsetLeft + card.offsetWidth / 2 - middle);
        const fade = Math.max(0, Math.min(1, (delta - clearRadius) / step));
        card.style.setProperty("--focus-blur", `${(fade * 3).toFixed(3)}px`);
        card.style.setProperty("--focus-opacity", (1 - fade * 0.38).toFixed(3));
        card.style.setProperty("--focus-scale", (1 - fade * 0.04).toFixed(3));
        card.dataset.clarity = (1 - fade).toFixed(3);
        if (delta < distance) {
          distance = delta;
          closest = index;
        }
      });
      selected = closest;
    }

    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }

    center();
    const observer = new ResizeObserver(center);
    observer.observe(track);
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      track.removeEventListener("scroll", onScroll);
    };
  }, [count]);

  return (
    <div ref={host} className={styles.viewport}>
      <DragScroll className={className} label={label} onClickCapture={focusMobilePreview}>
        {children}
      </DragScroll>
    </div>
  );
}
