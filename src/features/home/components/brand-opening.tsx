"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./brand-opening.module.css";

const timing = { grow: 450, name: 550, settled: 950, fade: 1550, end: 1850 };
const symbolCenter = 95 / 690;

export function BrandOpening({ logo, name }: { logo: string; name: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.dataset.phase = "pending";
    const logoNode = root.querySelector<HTMLElement>("[data-brand-opening-logo]")!;
    const word = root.querySelector<HTMLElement>("[data-brand-opening-word]")!;
    const backdrop = root.querySelector<HTMLElement>("[data-brand-opening-backdrop]")!;
    const image = root.querySelector<HTMLImageElement>("img")!;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const animations: Animation[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    let disposed = false;
    let completed = false;

    const cancel = () => {
      timers.forEach(clearTimeout);
      animations.forEach((animation) => animation.cancel());
    };
    const finish = () => {
      if (completed || disposed) return;
      completed = true;
      document.documentElement.dataset.homeOpening = "skip";
      root.dataset.phase = "complete";
      cancel();
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab") finish();
    };
    const reduce = () => {
      if (preference.matches) finish();
    };
    const scroll = () => {
      if (scrollY > 0) finish();
    };
    const start = async () => {
      if (
        document.documentElement.dataset.homeOpening === "skip" ||
        preference.matches ||
        location.hash ||
        scrollY > 0
      ) {
        finish();
        return;
      }
      timers.push(setTimeout(finish, 6000));
      try {
        await Promise.all([image.decode(), document.fonts.ready]);
      } catch {
        finish();
        return;
      }
      if (disposed || completed) return;
      const bounds = root.getBoundingClientRect();
      const width = Math.min(440, bounds.width * 0.56, bounds.height * 0.85 * (690 / 141));
      if (width < 1) {
        finish();
        return;
      }
      logoNode.style.width = `${width}px`;
      const height = (width * 141) / 690;
      const pose = (scale: number, centered = false) =>
        `translate3d(${bounds.width / 2 - width * (centered ? 0.5 : symbolCenter) * scale}px, ${(bounds.height - height * scale) / 2}px, 0) scale(${scale})`;
      const animate = (
        node: HTMLElement,
        frames: Keyframe[],
        options: KeyframeAnimationOptions,
      ) => {
        const animation = node.animate(frames, { fill: "both", ...options });
        animations.push(animation);
        return animation;
      };
      root.dataset.phase = "symbol";
      animate(
        logoNode,
        [
          { transform: pose(0.24), opacity: 0, offset: 0 },
          {
            transform: pose(0.5),
            opacity: 1,
            offset: 150 / timing.end,
            easing: "cubic-bezier(0.16,1,0.3,1)",
          },
          { transform: pose(1), offset: timing.grow / timing.end },
          {
            transform: pose(1),
            offset: timing.name / timing.end,
            easing: "cubic-bezier(0.4,0,0.2,1)",
          },
          { transform: pose(1, true), offset: timing.settled / timing.end },
          { transform: pose(1, true), opacity: 1, offset: timing.fade / timing.end },
          { transform: pose(1, true), opacity: 0, offset: 1 },
        ],
        { duration: timing.end },
      )
        .finished.then(finish)
        .catch(() => {});
      animate(
        word,
        [
          { clipPath: "inset(0 79.7% 0 20.3%)", opacity: 0, filter: "blur(2px)" },
          { clipPath: "inset(0 0% 0 20.3%)", opacity: 1, filter: "blur(0px)" },
        ],
        {
          delay: timing.name,
          duration: timing.settled - timing.name,
          easing: "cubic-bezier(0.25,0.1,0.25,1)",
        },
      );
      animate(
        backdrop,
        [
          { opacity: 0 },
          { opacity: 1, offset: 150 / timing.end },
          { opacity: 1, offset: timing.fade / timing.end },
          { opacity: 0 },
        ],
        { duration: timing.end },
      );
      for (const [phase, delay] of [
        ["name", timing.name],
        ["settled", timing.settled],
      ] as const) {
        timers.push(
          setTimeout(() => {
            root.dataset.phase = phase;
          }, delay),
        );
      }
    };
    window.addEventListener("keydown", key);
    window.addEventListener("resize", finish);
    window.addEventListener("pointerdown", finish, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("popstate", finish);
    window.addEventListener("pagehide", finish);
    preference.addEventListener("change", reduce);
    void start();
    return () => {
      disposed = true;
      cancel();
      root.dataset.phase = "complete";
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", finish);
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("popstate", finish);
      window.removeEventListener("pagehide", finish);
      preference.removeEventListener("change", reduce);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={styles.opening}
      data-brand-opening={name}
      data-phase="pending"
      aria-hidden="true"
    >
      <div className={styles.backdrop} data-brand-opening-backdrop="" />
      <div className={styles.logo} data-brand-opening-logo="">
        <div className={styles.symbol} data-brand-opening-symbol="">
          <Image src={logo} alt="" width={690} height={141} preload unoptimized draggable={false} />
        </div>
        <div className={styles.word} data-brand-opening-word="">
          <Image src={logo} alt="" width={690} height={141} unoptimized draggable={false} />
        </div>
      </div>
    </div>
  );
}
