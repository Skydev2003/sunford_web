"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useAnimate } from "motion/react";
import styles from "./home-motion.module.css";

const motionTokens = {
  duration: 0.55,
  stagger: 0.06,
  maxDelay: 0.18,
  distance: 12,
  ease: [0.22, 1, 0.36, 1] as const,
};

/** Server-rendered content stays visible until motion is progressively enabled. */
export function HomeMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [stage, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    const element = root.current;
    const content = stage.current;
    if (!element || !content) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const targets = Array.from(content.querySelectorAll<HTMLElement>("h2, h3, p"));
    const seen = new Set<Element>();
    const animations = new Set<ReturnType<typeof animate>>();
    const sync = () => {
      element.dataset.motionEnabled = String(!preference.matches);
      if (preference.matches) {
        animations.forEach((animation) => animation.stop());
        targets.forEach((target) => {
          target.style.opacity = "1";
          target.style.transform = "none";
        });
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        let order = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting || seen.has(entry.target)) continue;
          seen.add(entry.target);
          observer.unobserve(entry.target);
          if (preference.matches) continue;
          const animation = animate(
            entry.target,
            {
              opacity: [0.65, 1],
              y: [motionTokens.distance, 0],
            },
            {
              duration: motionTokens.duration,
              delay: Math.min(order++ * motionTokens.stagger, motionTokens.maxDelay),
              ease: motionTokens.ease,
            },
          );
          animations.add(animation);
          void animation.then(() => animations.delete(animation));
        }
      },
      { threshold: 0.15 },
    );
    targets.forEach((target) => observer.observe(target));
    preference.addEventListener("change", sync);
    sync();
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.stop());
      preference.removeEventListener("change", sync);
    };
  }, [animate, stage]);

  return (
    <div ref={root} className={styles.reveal} data-home-motion="reveal">
      <div ref={stage}>{children}</div>
    </div>
  );
}
