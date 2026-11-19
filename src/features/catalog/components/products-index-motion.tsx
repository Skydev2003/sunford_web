"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { createProductsGlass } from "./products-index-glass";
import styles from "./products-index-content.module.css";

const duration = 5000;
const glassDuration = 3000;
const logo = "/images/products/sunford-s-transparent.png";
const suffix = "/images/products/sunford-unford-transparent.png";
// Left edges in the 576-unit brand layout. Each sprite cell includes its italic overhang.
const letters = [
  ["U", 80],
  ["N", 161],
  ["F", 249],
  ["O", 323],
  ["R", 406],
  ["D", 488],
] as const;

export function ProductsIndexMotion() {
  const imageRef = useRef<HTMLImageElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const washRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const image = imageRef.current!;
    const slot = logoRef.current!;
    const mark = markRef.current!;
    delete slot.dataset.settled;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const canvas = document.createElement("canvas");
    const colors = washRef.current!.animate(
      [
        { offset: 0, backgroundColor: "#fde4ef" },
        { offset: 0.12667, backgroundColor: "#fde9de" },
        { offset: 0.36, backgroundColor: "#f7ffe1" },
        { offset: 0.65333, backgroundColor: "#d8f0fd" },
        { offset: 1, backgroundColor: "#f5f5f7" },
      ],
      { duration, fill: "both" },
    );
    colors.pause();
    const timeline = [colors];
    let glass: ReturnType<typeof createProductsGlass> = null;
    let initializing = false;
    let visible = false;
    let finished = false;
    let frame = 0;
    let elapsed = 0;
    let last: number | null = null;

    function pause() {
      cancelAnimationFrame(frame);
      frame = 0;
      last = null;
    }

    function finish() {
      finished = true;
      pause();
      delete slot.dataset.glass;
      slot.dataset.settled = "";
      timeline.forEach((animation) => animation.cancel());
      canvas.removeEventListener("webglcontextlost", finish);
      canvas.remove();
      glass?.dispose();
      glass = null;
    }

    function tick(now: number) {
      frame = 0;
      if (!glass) return;
      if (last !== null) elapsed += now - last;
      last = now;
      if (elapsed >= duration) return finish();
      if (elapsed < glassDuration) glass.draw(elapsed / glassDuration);
      for (const animation of timeline) animation.currentTime = elapsed;
      slot.dataset.glass = elapsed < glassDuration ? "playing" : "letters";
      frame = requestAnimationFrame(tick);
    }

    async function sync() {
      if (finished) return;
      if (reduced.matches && glass) return finish();
      if (!visible || document.hidden || reduced.matches) {
        pause();
        return;
      }
      if (!glass) {
        if (initializing) return;
        initializing = true;
        try {
          const atlas = new window.Image();
          atlas.src = suffix;
          const [module] = await Promise.all([
            import("./products-index-glass"),
            image.decode(),
            atlas.decode(),
          ]);
          if (finished || !visible || document.hidden || reduced.matches) return;
          mark.appendChild(canvas);
          canvas.addEventListener("webglcontextlost", finish);
          glass = module.createProductsGlass(canvas, image);
          if (!glass) return finish();
          const slide = mark.animate(
            [{ transform: "translateX(244%) scale(0.77)" }, { transform: "none" }],
            { delay: 2800, duration: 1050, easing: "cubic-bezier(0.45, 0, 0.18, 1)", fill: "both" },
          );
          slide.pause();
          timeline.push(slide);
          slot.querySelectorAll("[data-letter]").forEach((letter, index) => {
            const entrance = letter.animate(
              [
                { opacity: 0, transform: "translateX(-35%)" },
                { opacity: 1, transform: "none" },
              ],
              {
                delay: 3510 + index * 150,
                duration: 720,
                easing: "cubic-bezier(0.22, 0.65, 0.25, 1)",
                fill: "both",
              },
            );
            entrance.pause();
            timeline.push(entrance);
          });
        } catch {
          return finish();
        } finally {
          initializing = false;
        }
      }
      if (!frame) frame = requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      void sync();
    });
    observer.observe(slot);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      finish();
    };
  }, []);

  return (
    <>
      <span
        ref={washRef}
        className={styles.headerWash}
        data-products-header-wash=""
        aria-hidden="true"
      />
      <div ref={logoRef} className={styles.logoMotion} data-products-logo="" aria-hidden="true">
        <div className={styles.wordmark}>
          <span className={styles.initial} ref={markRef}>
            <Image
              ref={imageRef}
              src={logo}
              width={636}
              height={640}
              alt=""
              unoptimized
              loading="eager"
            />
          </span>
          {letters.map(([letter, left], index) => (
            <span
              key={letter}
              data-letter={letter}
              className={styles.letter}
              style={{
                left: `${(left / 576) * 100}%`,
                backgroundImage: `url("${suffix}")`,
                backgroundPositionX: `${index * 20}%`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
