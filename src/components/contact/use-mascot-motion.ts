"use client";

import { useEffect, type RefObject } from "react";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function useMascotMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const resize = () => positionMascot(element);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    const panel = element.querySelector<HTMLElement>("[data-mascot-contact]");
    if (panel) observer.observe(panel);
    window.addEventListener("resize", resize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [root]);
}

function positionMascot(element: HTMLElement) {
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = innerHeight;
  element.style.setProperty("--contact-viewport-width", `${viewportWidth}px`);
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  const x = Math.max(16, viewportWidth - width - 24);
  const y = Math.max(0, viewportHeight - height - 14);
  const panel = element.querySelector<HTMLElement>("[data-mascot-contact]");
  const invitation = element.querySelector<HTMLElement>("[data-mascot-invitation]");
  const panelHeight = panel?.offsetHeight || 270;
  const panelWidth = panel?.offsetWidth || 300;
  const bubbleWidth = invitation?.offsetWidth || 276;
  const bubbleHeight = invitation?.offsetHeight || 56;
  element.style.setProperty("--pet-x", `${x}px`);
  element.style.setProperty("--pet-y", `${y}px`);
  // Keep the bubble inside the viewport even after dropping the pet at an edge.
  element.style.setProperty(
    "--bubble-x",
    `${clamp(12, 12 - x, viewportWidth - bubbleWidth - 12 - x)}px`,
  );
  let panelX = clamp(12, 12 - x, viewportWidth - panelWidth - 12 - x);
  const below = y < bubbleHeight + 16 && y + height + bubbleHeight + 16 < viewportHeight;
  const bubbleY = clamp(
    below ? height + 8 : -bubbleHeight + 8,
    8 - y,
    viewportHeight - bubbleHeight - 8 - y,
  );
  element.style.setProperty("--bubble-y", `${bubbleY}px`);
  element.dataset.bubbleBelow = String(bubbleY > 0);
  let panelY = clamp(
    y < panelHeight + 16 ? height + 8 : -panelHeight - 8,
    8 - y,
    viewportHeight - panelHeight - 8 - y,
  );
  // In short landscape windows, put the menu beside the pet so it cannot cover its toggle.
  if (y < panelHeight + 12 && viewportHeight - y - height < panelHeight + 12) {
    if (x >= panelWidth + 24) panelX = -panelWidth - 12;
    else if (viewportWidth - x - width >= panelWidth + 24) panelX = width + 12;
    if (panelX === -panelWidth - 12 || panelX === width + 12)
      panelY = clamp((height - panelHeight) / 2, 8 - y, viewportHeight - panelHeight - 8 - y);
  }
  element.style.setProperty("--panel-x", `${panelX}px`);
  element.style.setProperty("--panel-y", `${panelY}px`);
}
