"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./products-index-content.module.css";

const duration = 2200;
const logo = "/images/products/sunford-s-transparent.png";
const suffix = "/images/products/sunford-unford-transparent.svg";
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

  useEffect(() => {
    const image = imageRef.current!;
    const slot = logoRef.current!;
    const mark = markRef.current!;
    delete slot.dataset.settled;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const timeline: Animation[] = [];
    let ready = false;
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
      slot.dataset.settled = "";
      timeline.forEach((animation) => animation.cancel());
    }

    function tick(now: number) {
      if (last !== null) elapsed += now - last;
      last = now;
      if (elapsed >= duration) return finish();
      for (const animation of timeline) animation.currentTime = elapsed;
      frame = requestAnimationFrame(tick);
    }

    function sync() {
      if (finished || !ready) return;
      if (reduced.matches && timeline.length) return finish();
      if (!visible || document.hidden || reduced.matches) return pause();
      if (!timeline.length) {
        timeline.push(
          mark.animate([{ transform: "translateX(244%) scale(0.77)" }, { transform: "none" }], {
            duration: 1050,
            easing: "cubic-bezier(0.45, 0, 0.18, 1)",
            fill: "both",
          }),
        );
        slot.querySelectorAll("[data-letter]").forEach((letter, index) => {
          timeline.push(
            letter.animate(
              [
                { opacity: 0, transform: "translateX(-35%)" },
                { opacity: 1, transform: "none" },
              ],
              {
                delay: 710 + index * 150,
                duration: 720,
                easing: "cubic-bezier(0.22, 0.65, 0.25, 1)",
                fill: "both",
              },
            ),
          );
        });
        for (const animation of timeline) {
          animation.pause();
          animation.currentTime = 0;
        }
      }
      if (!frame) frame = requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(slot);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);

    const atlas = new window.Image();
    atlas.src = suffix;
    void Promise.all([image.decode(), atlas.decode()])
      .then(() => {
        ready = true;
        sync();
      })
      .catch(() => {
        if (!finished) finish();
      });

    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      finish();
    };
  }, []);

  return (
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
  );
}
