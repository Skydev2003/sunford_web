"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import styles from "./segmented-filter.module.css";

export function SegmentedFilter({ value, children }: { value: string; children: ReactNode }) {
  const tray = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const previous = useRef<{ segment: HTMLElement; left: number; width: number }>(null);
  const requested = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const track = tray.current;
    const layer = indicator.current;
    if (!track || !layer) return;

    const place = (animate: boolean) => {
      const segment = track.querySelector<HTMLElement>(
        ':scope > :is(button[aria-pressed="true"], a[aria-current="true"])',
      );
      if (!segment?.offsetWidth) {
        previous.current = null;
        delete track.dataset.segmentedReady;
        return;
      }

      const left = segment.offsetLeft;
      const width = segment.offsetWidth;
      const prior = previous.current;
      if (prior?.segment === segment && prior.left === left && prior.width === width) return;

      track.toggleAttribute(
        "data-segmented-animate",
        Boolean(
          animate &&
          requested.current === segment &&
          prior &&
          prior.segment !== segment &&
          track.contains(prior.segment),
        ),
      );
      layer.style.width = `${width}px`;
      layer.style.transform = `translate3d(${left}px, 0, 0)`;
      track.dataset.segmentedReady = "";
      previous.current = { segment, left, width };
    };

    place(true);
    requested.current = null;
    const realign = () => place(false);
    // A segment can change width after a font loads even if the outer scroll area is unchanged.
    const observer = new ResizeObserver(realign);
    observer.observe(track);
    for (const segment of track.querySelectorAll(":scope > :is(button, a)")) {
      observer.observe(segment);
    }
    document.fonts.addEventListener("loadingdone", realign);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", realign);
    };
  }, [value]);

  return (
    <div
      ref={tray}
      className={styles.tray}
      data-segmented-filter
      onClickCapture={(event) => {
        const segment =
          event.target instanceof Element
            ? event.target.closest<HTMLElement>(
                ':is(button[aria-pressed="false"]:enabled, a[href]:not([aria-current="true"]))',
              )
            : null;
        requested.current = segment?.parentElement === event.currentTarget ? segment : null;
      }}
      onFocusCapture={(event) => {
        if (event.target.matches(":focus-visible")) {
          event.target.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
        }
      }}
    >
      <span
        ref={indicator}
        className={styles.indicator}
        data-segmented-indicator
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
