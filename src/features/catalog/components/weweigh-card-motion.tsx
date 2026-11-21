"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./products-index-content.module.css";

const size = 512;
// Pixel bounds in the 512-unit logo grid, followed by the Lottie entrance offsets.
const pieces = [
  [97, 55, 246, 267, -54, -58, -14, 0, 82],
  [257, 58, 412, 266, 61, -43, 13, 4, 86],
  [47, 321, 132, 434, -34, 77, -16, 4, 78],
  [134, 360, 182, 434, -35, 36, 13, 7, 82],
  [184, 320, 270, 434, -47, 68, -19, 0, 85],
  [271, 360, 320, 434, 21, 58, 17, 5, 81],
  [328, 333, 348, 434, 31, 86, -10, 1, 85],
  [355, 360, 405, 459, 51, 42, 17, 6, 84],
  [413, 322, 464, 434, 39, 73, 14, 2, 88],
] as const;

const percent = (value: number, total: number) => `${(value / total) * 100}%`;
const frameTime = (frames: number) => (frames * 1000) / 60;
const easing = "cubic-bezier(0.22, 0.04, 0.25, 1)";

export function WeWeighCardMotion({ src, children }: { src: string; children: ReactNode }) {
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mark = markRef.current;
    const link = mark?.closest("a");
    const image = mark?.querySelector("img");
    const lettering = mark?.querySelectorAll<HTMLElement>("[data-weweigh-piece]");
    const copy = link?.querySelectorAll<HTMLElement>("[data-weweigh-copy] > p");
    if (!link || !mark || !image || !lettering || !copy || !("IntersectionObserver" in window))
      return;
    if (typeof mark.animate !== "function") return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let animations: Animation[] = [];
    let ready = false;
    let visible = false;
    let completed = false;
    let disposed = false;

    const sync = () => {
      if (!ready || completed || disposed) return;
      if (reducedMotion.matches) {
        if (animations.length) {
          animations.forEach((animation) => animation.cancel());
          completed = true;
          link.dataset.weweighMotion = "complete";
        }
        return;
      }
      if (!animations.length) {
        animations = [...lettering].map((element, index) => {
          const [left, top, right, bottom, x, y, angle, start, end] = pieces[index];
          const dx = percent(x, ((right - left) / size) * 344);
          const dy = percent(y, ((bottom - top) / size) * 344);
          return element.animate(
            [
              { transform: `translate(${dx}, ${dy}) rotate(${angle}deg)` },
              { transform: "translate(0, 0) rotate(0deg)" },
            ],
            { duration: frameTime(end - start), delay: frameTime(start), easing, fill: "both" },
          );
        });
        for (const [index, paragraph] of [...copy].entries()) {
          animations.push(
            paragraph.animate(
              [
                { opacity: 0, transform: "translateY(-3rem)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              { duration: 570, delay: frameTime(98) + index * 115, easing, fill: "both" },
            ),
          );
        }
        for (const animation of animations) {
          animation.pause();
          animation.currentTime = 0;
        }
        link.dataset.weweighMotion = "active";
        void Promise.all(animations.map((animation) => animation.finished)).then(
          () => {
            completed = true;
            link.dataset.weweighMotion = "complete";
            animations.forEach((animation) => animation.cancel());
          },
          () => {},
        );
      }
      const play = visible && !document.hidden;
      for (const animation of animations) {
        if (play && animation.playState === "paused") animation.play();
        else if (!play && animation.playState === "running") animation.pause();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          visible = entry.intersectionRatio >= 0.5 || (visible && entry.intersectionRatio > 0);
        sync();
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(link);
    reducedMotion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    const prepare = () => {
      void image.decode().then(
        () => {
          ready = true;
          sync();
        },
        () => {},
      );
    };
    image.addEventListener("load", prepare);
    if (image.complete && image.naturalWidth) prepare();
    return () => {
      disposed = true;
      observer.disconnect();
      reducedMotion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      image.removeEventListener("load", prepare);
      for (const animation of animations) animation.cancel();
      delete link.dataset.weweighMotion;
    };
  }, [src]);

  return (
    <div ref={markRef} className={styles.softwareMark}>
      {children}
      <div aria-hidden="true" className={styles.softwarePieces}>
        {pieces.map(([left, top, right, bottom]) => (
          <span
            key={left}
            data-weweigh-piece
            style={{
              left: percent(left, size),
              top: percent(top, size),
              width: percent(right - left, size),
              height: percent(bottom - top, size),
            }}
          >
            <span
              style={{
                backgroundImage: `url("${src}")`,
                left: percent(-left, right - left),
                top: percent(-top, bottom - top),
                width: percent(size, right - left),
                height: percent(size, bottom - top),
              }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
