"use client";
import { useEffect, type RefObject } from "react";

const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

export function useContactMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const widget = root.current;
    if (!widget) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let scrollOffset = 0;
    let scrollY = window.scrollY;
    let nearControls = false;
    let settle: ReturnType<typeof setTimeout> | undefined;

    function draw() {
      frame = 0;
      const focused =
        widget!.contains(document.activeElement) &&
        document.activeElement?.matches(":focus-visible");
      const still = reducedMotion.matches || nearControls || focused;
      widget!.style.setProperty("--contact-drift-x", `${still ? 0 : pointerX}px`);
      widget!.style.setProperty(
        "--contact-drift-y",
        `${still ? 0 : clamp(pointerY + scrollOffset, 6)}px`,
      );
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(draw);
    }
    function pointer(event: PointerEvent) {
      if (event.pointerType !== "mouse" || reducedMotion.matches) return;
      const bounds = widget!.getBoundingClientRect();
      const panel = widget!
        .querySelector<HTMLElement>(".contact-actions[aria-hidden='false']")
        ?.getBoundingClientRect();
      // Settle before the pointer reaches a control so the target never dodges a click.
      nearControls =
        widget!.contains(event.target as Node) ||
        (event.clientX >= bounds.left - 72 &&
          event.clientX <= bounds.right + 72 &&
          event.clientY >= Math.min(bounds.top, panel?.top ?? bounds.top) - 72 &&
          event.clientY <= bounds.bottom + 72);
      pointerX = (event.clientX / window.innerWidth - 0.5) * 6;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 5;
      schedule();
    }
    function scroll() {
      const delta = window.scrollY - scrollY;
      scrollY = window.scrollY;
      if (reducedMotion.matches) return;
      scrollOffset = clamp(-delta * 0.12, 4);
      schedule();
      clearTimeout(settle);
      settle = setTimeout(() => {
        scrollOffset = 0;
        schedule();
      }, 240);
    }
    function reset() {
      pointerX = pointerY = scrollOffset = 0;
      nearControls = false;
      schedule();
    }
    function leave(event: PointerEvent) {
      if (!event.relatedTarget) reset();
    }
    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("pointerout", leave, { passive: true });
    window.addEventListener("blur", reset);
    reducedMotion.addEventListener("change", reset);
    return () => {
      window.removeEventListener("pointermove", pointer);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", reset);
      reducedMotion.removeEventListener("change", reset);
      cancelAnimationFrame(frame);
      clearTimeout(settle);
      widget.style.removeProperty("--contact-drift-x");
      widget.style.removeProperty("--contact-drift-y");
    };
  }, [root]);
}
