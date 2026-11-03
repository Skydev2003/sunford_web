"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./brand-opening.module.css";

// Measured against the supplied 30fps reference. The S is cropped from the real wordmark.
const timing = { name: 1250, dock: 1700, reveal: 2350, end: 2850 };
const symbolCenter = 95 / 690;

export function BrandOpening({
  logo,
  name,
  onReveal,
}: {
  logo: string;
  name: string;
  onReveal: () => void;
}) {
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
    const previousOverflow = document.documentElement.style.overflow;
    const blocked = new Map<HTMLElement, boolean>();
    let disposed = false;
    let revealed = false;
    let completed = false;

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      onReveal();
    };
    const restore = () => {
      timers.forEach(clearTimeout);
      animations.forEach((animation) => animation.cancel());
      blocked.forEach((wasInert, element) => (element.inert = wasInert));
      blocked.clear();
      document.documentElement.style.overflow = previousOverflow;
    };
    const finish = () => {
      if (completed || disposed) return;
      completed = true;
      document.documentElement.dataset.homeOpening = "skip";
      root.dataset.phase = "complete";
      restore();
      reveal();
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab") finish();
    };
    const reduce = () => {
      if (preference.matches) finish();
    };
    const resize = () => finish();
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
      // Only block interaction after JavaScript has committed to playing the opening.
      document.documentElement.style.overflow = "hidden";
      for (const element of document.querySelectorAll<HTMLElement>(
        ".site-header, #main-content > :not([data-brand-opening]), footer, [data-shop-mascot]",
      )) {
        blocked.set(element, element.inert);
        element.inert = true;
      }
      timers.push(setTimeout(finish, 6000));
      try {
        await image.decode();
      } catch {
        if (!disposed) finish();
        return;
      }
      if (disposed || root.dataset.phase === "complete") return;
      const target = document.querySelector<HTMLImageElement>(".site-header .brand img");
      if (!target) {
        finish();
        return;
      }
      const destination = target.getBoundingClientRect();
      const width = logoNode.getBoundingClientRect().width;
      const height = (width * 141) / 690;
      const centerX = innerWidth / 2;
      const centerY = innerHeight / 2;
      const pose = (scale: number, centered = false) =>
        `translate3d(${centerX - width * (centered ? 0.5 : symbolCenter) * scale}px, ${centerY - (height * scale) / 2}px, 0) scale(${scale})`;
      const dock = `translate3d(${destination.x}px, ${destination.y}px, 0) scale(${destination.width / width})`;
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
          { transform: pose(1), offset: 550 / timing.end },
          {
            transform: pose(1),
            offset: timing.name / timing.end,
            easing: "cubic-bezier(0.4,0,0.2,1)",
          },
          {
            transform: pose(1, true),
            offset: timing.dock / timing.end,
            easing: "cubic-bezier(0.4,0,0.2,1)",
          },
          { transform: dock, offset: 2750 / timing.end },
          { transform: dock, opacity: 1, offset: 1 },
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
        { delay: timing.name, duration: 450, easing: "cubic-bezier(0.25,0.1,0.25,1)" },
      );
      animate(backdrop, [{ opacity: 1 }, { opacity: 0 }], {
        delay: 2050,
        duration: 800,
        easing: "cubic-bezier(0.4,0,0.2,1)",
      });
      for (const [phase, delay] of [
        ["name", timing.name],
        ["docking", timing.dock],
        ["reveal", timing.reveal],
      ] as const) {
        timers.push(
          setTimeout(() => {
            root.dataset.phase = phase;
          }, delay),
        );
      }
    };
    window.addEventListener("keydown", key);
    window.addEventListener("resize", resize);
    window.addEventListener("popstate", finish);
    window.addEventListener("pagehide", finish);
    preference.addEventListener("change", reduce);
    void start();
    return () => {
      disposed = true;
      if (!completed) restore();
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", resize);
      window.removeEventListener("popstate", finish);
      window.removeEventListener("pagehide", finish);
      preference.removeEventListener("change", reduce);
    };
  }, [onReveal]);

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
