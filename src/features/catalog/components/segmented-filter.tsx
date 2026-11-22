"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import styles from "./segmented-filter.module.css";

export function SegmentedFilter({ value, children }: { value: string; children: ReactNode }) {
  const tray = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const previous = useRef<{ button: HTMLElement; left: number; width: number }>(null);
  const requested = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const track = tray.current;
    const layer = indicator.current;
    if (!track || !layer) return;

    const place = (animate: boolean) => {
      const button = track.querySelector<HTMLElement>(':scope > button[aria-pressed="true"]');
      if (!button?.offsetWidth) {
        previous.current = null;
        delete track.dataset.segmentedReady;
        return;
      }

      const left = button.offsetLeft;
      const width = button.offsetWidth;
      const prior = previous.current;
      if (prior?.button === button && prior.left === left && prior.width === width) return;

      track.toggleAttribute(
        "data-segmented-animate",
        Boolean(
          animate &&
          requested.current === button &&
          prior &&
          prior.button !== button &&
          track.contains(prior.button),
        ),
      );
      layer.style.width = `${width}px`;
      layer.style.transform = `translate3d(${left}px, 0, 0)`;
      track.dataset.segmentedReady = "";
      previous.current = { button, left, width };
    };

    place(true);
    requested.current = null;
    const realign = () => place(false);
    // A button can change width after a font loads even if the outer scroll area is unchanged.
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
        const button =
          event.target instanceof Element
            ? event.target.closest<HTMLButtonElement>('button[aria-pressed="false"]:enabled')
            : null;
        requested.current = button?.parentElement === event.currentTarget ? button : null;
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
