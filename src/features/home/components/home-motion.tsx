"use client";

import { useRef, type ReactNode } from "react";
import { useScrollReveal } from "@/components/ui/scroll-reveal";
import styles from "./home-motion.module.css";

export function HomeMotion({ children }: { children: ReactNode }) {
  const section = useRef<HTMLDivElement>(null);
  // Each streamed section can hydrate separately from the homepage shell.
  useScrollReveal(section, {
    selector: "[data-scroll-reveal], :is(h2, h3, p):not([data-scroll-reveal-grid] *)",
  });
  return (
    <div ref={section} className={styles.reveal} data-home-motion="reveal">
      <div>{children}</div>
    </div>
  );
}
