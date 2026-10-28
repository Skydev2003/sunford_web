"use client";

import { useState, type ReactNode } from "react";

export function ShowcaseTile({ className, children }: { className: string; children: ReactNode }) {
  const [sweeping, setSweeping] = useState(false);

  const startSweep = () => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSweeping(true);
    }
  };

  return (
    <article
      className={className}
      data-light-sweeping={sweeping}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") startSweep();
      }}
      onFocus={startSweep}
      onAnimationEnd={(event) => {
        if (
          event.target === event.currentTarget &&
          event.animationName === "showcase-product-light"
        ) {
          setSweeping(false);
        }
      }}
    >
      {children}
    </article>
  );
}
