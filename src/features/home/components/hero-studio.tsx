"use client";

import { useEffect, useRef, type RefObject } from "react";
import styles from "./hero-studio.module.css";

/** Cached CSS surfaces move on the compositor; pointer input never renders React or the model. */
export function HeroStudio({
  sceneRef,
  paused,
}: {
  sceneRef: RefObject<HTMLElement | null>;
  paused: boolean;
}) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const syncRef = useRef<(() => void) | null>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
    syncRef.current?.();
  }, [paused]);

  useEffect(() => {
    const scene = sceneRef.current;
    const field = fieldRef.current;
    if (!scene || !field) return;
    const header = scene.classList.contains("hero-no-announcement")
      ? document.querySelector<HTMLElement>(".site-header")
      : null;
    const headerInner = header?.querySelector<HTMLElement>(".header-inner");
    const rings = field.querySelector<HTMLElement>("[data-studio-rings]")!;
    const light = field.querySelector<HTMLElement>("[data-studio-light]")!;
    const flow = field.querySelector<HTMLElement>("[data-studio-flow]")!;
    const cursor = field.querySelector<HTMLElement>("[data-studio-cursor]")!;
    const echo = field.querySelector<HTMLElement>("[data-studio-echo]")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let visible = false;
    let dragging = false;
    let bounds = field.getBoundingClientRect();
    let frame = 0;
    let previous = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let cursorX = bounds.width * 0.72;
    let cursorY = bounds.height * 0.6;
    let targetCursorX = cursorX;
    let targetCursorY = cursorY;
    let echoX = cursorX;
    let echoY = cursorY;
    let intensity = 0;
    let targetIntensity = 0;

    const paint = () => {
      rings.style.transform = `translate3d(${x * 22}px, ${y * 14}px, 0)`;
      light.style.transform = `translate3d(${x * 100}px, ${y * 65}px, 0)`;
      flow.style.transform = `translate3d(${x * 48}px, ${y * 32}px, 0) rotate(${x * 2}deg)`;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      cursor.style.opacity = String(intensity);
      echo.style.transform = `translate3d(${echoX}px, ${echoY}px, 0)`;
      echo.style.opacity = String(intensity * 0.55);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      field.dataset.pointer = "idle";
    };
    const canMove = () => visible && !document.hidden && !reduced.matches && !pausedRef.current;
    const sync = () => {
      field.dataset.running = String(canMove() && !dragging);
      if (!canMove() || dragging) {
        stop();
      }
      if (reduced.matches) {
        x = y = targetX = targetY = 0;
        intensity = targetIntensity = 0;
        paint();
      }
    };
    syncRef.current = sync;

    const animate = (now: number) => {
      // Exponential easing remains stable across long frames and must settle in wall time.
      const delta = Math.max(now - previous, 0);
      const ease = 1 - Math.exp(-delta / 85);
      previous = now;
      x += (targetX - x) * ease;
      y += (targetY - y) * ease;
      cursorX += (targetCursorX - cursorX) * ease;
      cursorY += (targetCursorY - cursorY) * ease;
      const trailEase = 1 - Math.exp(-delta / 180);
      echoX += (cursorX - echoX) * trailEase;
      echoY += (cursorY - echoY) * trailEase;
      intensity += (targetIntensity - intensity) * ease;
      paint();
      if (
        Math.abs(targetX - x) + Math.abs(targetY - y) + Math.abs(targetIntensity - intensity) >
          0.002 ||
        Math.abs(targetCursorX - cursorX) +
          Math.abs(targetCursorY - cursorY) +
          Math.abs(cursorX - echoX) +
          Math.abs(cursorY - echoY) >
          0.5
      ) {
        frame = requestAnimationFrame(animate);
      } else stop();
    };
    const schedule = () => {
      if (frame || !canMove() || dragging || !fine.matches) return;
      previous = performance.now();
      field.dataset.pointer = "moving";
      frame = requestAnimationFrame(animate);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || dragging) return;
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        if (targetIntensity) leave();
        return;
      }
      targetX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
      targetY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
      targetCursorX = event.clientX - bounds.left;
      targetCursorY = event.clientY - bounds.top;
      targetIntensity = 1;
      const focus = (event.target as Element).closest(".hero-model-stage") ? "model" : "scene";
      if (field.dataset.focus !== focus) field.dataset.focus = focus;
      schedule();
    };
    const leave = () => {
      targetX = targetY = 0;
      targetIntensity = 0;
      field.dataset.focus = "scene";
      schedule();
    };
    const leaveWindow = (event: PointerEvent) => {
      if (!event.relatedTarget) leave();
    };
    const down = (event: PointerEvent) => {
      if (!(event.target as Element).closest(".hero-model-stage")) return;
      dragging = true;
      sync();
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      // Keep the lighting still after dragging until the next mouse movement.
      targetX = x;
      targetY = y;
      sync();
    };
    const productDrag = (event: Event) => {
      dragging = Boolean((event as CustomEvent<boolean>).detail);
      sync();
    };
    const measure = () => {
      if (headerInner) {
        const height = `${headerInner.getBoundingClientRect().height}px`;
        if (scene.style.getPropertyValue("--hero-header-height") !== height)
          scene.style.setProperty("--hero-header-height", height);
      }
      bounds = field.getBoundingClientRect();
    };
    const blur = () => {
      dragging = false;
      stop();
      field.dataset.running = "false";
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (header) {
          header.dataset.heroBackdropTracked = "";
          if (visible) header.dataset.heroBackdrop = "";
          else delete header.dataset.heroBackdrop;
        }
        measure();
        sync();
      },
      { threshold: 0.1 },
    );
    const resize = new ResizeObserver(measure);
    observer.observe(scene);
    resize.observe(scene);
    if (headerInner) resize.observe(headerInner);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leaveWindow);
    scene.addEventListener("pointerdown", down, true);
    scene.addEventListener("hero-product-drag", productDrag);
    window.addEventListener("pointerup", up, true);
    window.addEventListener("pointercancel", up, true);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("blur", blur);
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    fine.addEventListener("change", sync);
    return () => {
      stop();
      syncRef.current = null;
      observer.disconnect();
      resize.disconnect();
      if (header) {
        delete header.dataset.heroBackdrop;
        // Keep the hydration marker: Next may retain a hidden homepage during navigation.
        header.dataset.heroBackdropTracked = "";
      }
      scene.style.removeProperty("--hero-header-height");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leaveWindow);
      scene.removeEventListener("pointerdown", down, true);
      scene.removeEventListener("hero-product-drag", productDrag);
      window.removeEventListener("pointerup", up, true);
      window.removeEventListener("pointercancel", up, true);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      fine.removeEventListener("change", sync);
    };
  }, [sceneRef]);

  return (
    <>
      <div
        ref={fieldRef}
        className={styles.studio}
        data-hero-studio=""
        data-running="false"
        data-pointer="idle"
        aria-hidden="true"
      >
        <div className={styles.rings} data-studio-rings="">
          <div className={styles.halo}>
            <i />
          </div>
        </div>
        <div className={styles.light} data-studio-light="" />
        <div className={styles.flow} data-studio-flow="">
          <div className={styles.ribbon} />
          <div className={styles.filament} />
        </div>
        <div className={styles.cursor} data-studio-cursor="" />
        <div className={styles.echo} data-studio-echo="" />
        <div className={styles.backdrop} data-studio-backdrop="" />
      </div>
    </>
  );
}
