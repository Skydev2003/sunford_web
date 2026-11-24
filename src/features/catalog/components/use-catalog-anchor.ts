"use client";

import { useEffect } from "react";

export function useCatalogAnchor(anchor: string | undefined) {
  useEffect(() => {
    if (!anchor || window.location.hash !== `#${anchor}`) return;
    // A streamed section may mount after Next has already looked for the anchor.
    const frame = requestAnimationFrame(() => {
      if (window.scrollY === 0 && window.location.hash === `#${anchor}`) {
        document.getElementById(anchor)?.scrollIntoView({ block: "start", behavior: "instant" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [anchor]);
}
