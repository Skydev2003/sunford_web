"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { DragScroll } from "./drag-scroll";
import styles from "./focus-drag-scroll.module.css";

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
  const selected = useRef(1);
  const pointerDown = useRef(false);
  const settle = useRef(() => {});
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<
    HTMLAttributes<HTMLElement>
  >[];
  const count = items.length;
  const loop = count > 1;

  function centerCard(card: HTMLElement) {
    const track = card.parentElement!;
    track.scrollTo({
      left: card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  function focusPreview(event: MouseEvent<HTMLDivElement>) {
    if (
      event.defaultPrevented ||
      event.detail === 0 ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const track = event.currentTarget;
    const card = Array.from(track.children).find((child) =>
      child.contains(event.target as Node),
    ) as HTMLElement | undefined;
    if (!card) return;
    const left = card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2;
    const cards = Array.from(track.children) as HTMLElement[];
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 0;
    const clearRadius = matchMedia("(min-width: 721px)").matches ? step : 0;
    if (Math.abs(left - track.scrollLeft) <= clearRadius + 2) return;
    event.preventDefault();
    event.stopPropagation();
    centerCard(card);
  }

  useEffect(() => {
    const viewport = host.current;
    const track = viewport?.firstElementChild as HTMLDivElement | undefined;
    if (!viewport || !track || !count) return;
    viewport.dataset.focusReady = "true";
    const cards = Array.from(track.children) as HTMLElement[];
    let frame = 0;
    let timer: ReturnType<typeof setTimeout>;
    let closest = (loop ? count : 0) + Math.min(selected.current, count - 1);

    function measure() {
      const middle = track!.scrollLeft + track!.clientWidth / 2;
      const step = count > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth;
      const clearRadius = matchMedia("(min-width: 721px)").matches ? step : 0;
      const centers = cards.map((card) => card.offsetLeft + card.offsetWidth / 2);
      let distance = Infinity;
      cards.forEach((card, index) => {
        const delta = Math.abs(centers[index] - middle);
        const fade = Math.max(0, Math.min(1, (delta - clearRadius) / Math.max(1, step)));
        card.style.setProperty("--focus-blur", `${(fade * 3).toFixed(3)}px`);
        card.style.setProperty("--focus-opacity", (1 - fade * 0.38).toFixed(3));
        card.style.setProperty("--focus-scale", (1 - fade * 0.04).toFixed(3));
        card.dataset.clarity = (1 - fade).toFixed(3);
        if (delta < distance) {
          closest = index;
          distance = delta;
        }
      });
      selected.current = closest % count;
      track!.dataset.activeIndex = String(selected.current);
    }

    function normalize() {
      if (!loop || pointerDown.current || track!.classList.contains("is-dragging")) return;
      measure();
      const copy = Math.floor(closest / count);
      if (copy === 1) return;
      const cycle = cards[count].offsetLeft - cards[0].offsetLeft;
      track!.scrollTo({ left: track!.scrollLeft + (1 - copy) * cycle, behavior: "instant" });
      measure();
    }
    function onSettled() {
      clearTimeout(timer);
      timer = setTimeout(normalize, 160);
    }
    settle.current = onSettled;
    function center() {
      const card = cards[(loop ? count : 0) + Math.min(selected.current, count - 1)];
      track!.scrollTo({
        left: card.offsetLeft + card.offsetWidth / 2 - track!.clientWidth / 2,
        behavior: "instant",
      });
      measure();
    }
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
      onSettled();
    }
    center();
    const observer = new ResizeObserver(center);
    observer.observe(track);
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      settle.current = () => {};
      observer.disconnect();
      track.removeEventListener("scroll", onScroll);
    };
  }, [children, count, loop]);

  return (
    <div
      ref={host}
      className={styles.viewport}
      onPointerDownCapture={() => {
        pointerDown.current = true;
      }}
      onPointerUpCapture={() => {
        pointerDown.current = false;
        settle.current();
      }}
      onPointerCancelCapture={() => {
        pointerDown.current = false;
        settle.current();
      }}
      onPointerLeave={() => {
        pointerDown.current = false;
        settle.current();
      }}
      onFocusCapture={(event) => {
        const card = (event.target as HTMLElement).closest<HTMLElement>("[data-focus-index]");
        if (card?.matches(":focus-visible")) centerCard(card);
      }}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        const track = host.current!.firstElementChild as HTMLElement;
        const cards = Array.from(track.children) as HTMLElement[];
        const middle = track.scrollLeft + track.clientWidth / 2;
        const closest = cards.reduce(
          (best, card, index) =>
            Math.abs(card.offsetLeft + card.offsetWidth / 2 - middle) <
            Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - middle)
              ? index
              : best,
          0,
        );
        const next = cards[closest + (event.key === "ArrowRight" ? 1 : -1)];
        if (next) {
          event.preventDefault();
          centerCard(next);
        }
      }}
    >
      <DragScroll className={className} label={label} onClickCapture={focusPreview}>
        {(loop ? [0, 1, 2] : [1]).flatMap((copy) =>
          items.map((item, index) =>
            cloneElement(item, {
              key: `${copy}:${item.key ?? index}`,
              tabIndex: copy === 1 ? item.props.tabIndex : -1,
              "aria-hidden": copy === 1 ? item.props["aria-hidden"] : true,
              ...{
                "data-focus-index": index,
                "data-focus-copy": copy,
                "data-focus-clone": copy === 1 ? undefined : "true",
                "data-focus-accent": index % 3 === 2 ? "true" : undefined,
              },
            }),
          ),
        )}
      </DragScroll>
    </div>
  );
}
