"use client";

import { useEffect } from "react";

export function GuidebookFragment() {
  useEffect(() => {
    const hash = window.location.hash;
    const target = document.getElementById(hash.slice(1));
    if (!target?.closest("#guide-content")) return;

    // The browser can look for the fragment before the streamed chapter is visible.
    const frame = requestAnimationFrame(() => {
      if (window.scrollY === 0 && window.location.hash === hash) {
        target.scrollIntoView({ block: "start", behavior: "instant" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return null;
}
