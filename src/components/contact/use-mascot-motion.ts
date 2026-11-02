"use client";

import {
  useEffect,
  useRef,
  type PointerEvent,
  type FocusEvent,
  type MouseEvent,
  type RefObject,
  type DragEvent as ReactDragEvent,
} from "react";
import { MASCOT_WALK_SHEETS } from "./mascot-assets";
import { createMascotPainter } from "./mascot-painter";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const WALK_CYCLE_SECONDS = 3.2;
type DragEvent = PointerEvent<HTMLButtonElement>;
type Controller = {
  down: (event: DragEvent) => void;
  move: (event: DragEvent) => void;
  up: (event: DragEvent, cancelled?: boolean) => void;
  click: (event: MouseEvent<HTMLButtonElement>) => void;
  hover: (value: boolean) => void;
  focus: (value: boolean) => void;
  pause: (value: boolean) => void;
};

export function useMascotMotion(root: RefObject<HTMLElement | null>, paused: boolean) {
  const controller = useRef<Controller | null>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const canvas = element.querySelector<HTMLCanvasElement>("[data-mascot-canvas]");
    const painter = canvas ? createMascotPainter(canvas) : null;
    let x = 16;
    let y = 0;
    let width = 0;
    let height = 0;
    let viewportWidth = document.documentElement.clientWidth;
    let viewportHeight = innerHeight;
    let frame = 0;
    let previous = 0;
    let direction = -1;
    let hovered = false;
    let focused = false;
    let userPaused = false;
    let draggedClick = false;
    let vx = 0;
    let vy = 0;
    let drag: {
      id: number;
      startX: number;
      startY: number;
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      time: number;
      moved: boolean;
      distance: number;
    } | null = null;
    const maxX = () => Math.max(16, viewportWidth - width - 16);
    const maxY = () => Math.max(0, viewportHeight - height - 14);
    let panelHeight = 270;
    let panelWidth = 300;
    let bubbleWidth = 276;
    let bubbleHeight = 56;
    let framesReady = false;
    let disposed = false;
    let walkTime = 0;
    let lastDebugFrame = -1;
    const idle = () =>
      !framesReady || userPaused || document.hidden || reduced.matches || hovered || focused;

    function renderFrame(pose: number) {
      const phase = Math.floor(pose) % 32;
      const index = (direction > 0 ? 0 : 32) + phase;
      const localFrame = phase % 8;
      if (lastDebugFrame !== index) {
        lastDebugFrame = index;
        element!.style.setProperty("--walk-frame-x", `${((localFrame % 4) * 100) / 3}%`);
        element!.style.setProperty("--walk-frame-y", `${Math.floor(localFrame / 4) * 100}%`);
      }
      return painter?.paint(pose, direction) ?? false;
    }

    function draw() {
      element!.style.setProperty("--pet-x", `${x.toFixed(2)}px`);
      element!.style.setProperty("--pet-y", `${y.toFixed(2)}px`);
      // Keep the bubble inside the viewport even after dropping the pet at an edge.
      element!.style.setProperty(
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
      element!.style.setProperty("--bubble-y", `${bubbleY}px`);
      element!.dataset.bubbleBelow = String(bubbleY > 0);
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
      element!.style.setProperty("--panel-x", `${panelX}px`);
      element!.style.setProperty("--panel-y", `${panelY}px`);
      element!.dataset.walking = String(!drag && !idle() && Math.abs(vx) < 2 && Math.abs(vy) < 2);
      element!.dataset.suspended = String(document.hidden || reduced.matches);
      element!.dataset.facing = direction > 0 ? "right" : "left";
    }
    function schedule() {
      if (!frame) {
        previous = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }
    function tick(now: number) {
      frame = 0;
      const dt = Math.min((now - previous) / 1000, 0.1);
      previous = now;
      if (drag) {
        // A short exponential follow removes pointer jitter without a long trailing lag.
        const follow = 1 - Math.exp(-45 * dt);
        x += (drag.targetX - x) * follow;
        y += (drag.targetY - y) * follow;
        renderFrame((drag.distance / 2) % 32);
      } else if (!idle()) {
        if (Math.abs(vx) > 2 || Math.abs(vy) > 2) {
          x = clamp(x + vx * dt, 16, maxX());
          y = clamp(y + vy * dt, 0, maxY());
          const decay = Math.exp(-10 * dt);
          vx *= decay;
          vy *= decay;
        } else {
          const edge = maxX();
          if (x >= edge) direction = -1;
          else if (x <= 16) direction = 1;
          x = clamp(x + direction * 8 * dt, 16, maxX());
          walkTime = (walkTime + dt) % WALK_CYCLE_SECONDS;
          renderFrame((walkTime / WALK_CYCLE_SECONDS) * 32);
        }
      }
      draw();
      if (drag || !idle()) frame = requestAnimationFrame(tick);
    }
    function resize(initial = false) {
      viewportWidth = document.documentElement.clientWidth;
      viewportHeight = innerHeight;
      element!.style.setProperty("--contact-viewport-width", `${viewportWidth}px`);
      width = element!.offsetWidth;
      height = element!.offsetHeight;
      const character = element!.querySelector<HTMLElement>("[data-mascot-launcher]");
      if (character) painter?.resize(character.offsetWidth, character.offsetHeight);
      const panel = element!.querySelector<HTMLElement>("[data-mascot-contact]");
      panelHeight = panel?.offsetHeight || 270;
      panelWidth = panel?.offsetWidth || 300;
      const invitation = element!.querySelector<HTMLElement>("[data-mascot-invitation]");
      bubbleWidth = invitation?.offsetWidth || 276;
      bubbleHeight = invitation?.offsetHeight || 56;
      x = initial ? Math.max(16, maxX() - 8) : clamp(x, 16, maxX());
      y = initial ? maxY() : clamp(y, 0, maxY());
      draw();
      schedule();
    }
    function resetLook() {
      element!.style.removeProperty("--look-x");
      element!.style.removeProperty("--look-y");
    }
    const api: Controller = {
      down(event) {
        if (event.button !== 0 || !event.isPrimary) return;
        draggedClick = false;
        vx = vy = 0;
        drag = {
          id: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          x,
          y,
          targetX: x,
          targetY: y,
          time: event.timeStamp,
          moved: false,
          distance: 0,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
        schedule();
      },
      move(event) {
        if (drag && drag.id === event.pointerId) {
          const dx = event.clientX - drag.startX;
          const dy = event.clientY - drag.startY;
          if (!drag.moved && Math.hypot(dx, dy) < 7) return;
          drag.moved = true;
          event.preventDefault();
          const targetX = clamp(drag.x + dx, 16, maxX());
          const targetY = clamp(drag.y + dy, 0, maxY());
          const elapsed = Math.max(16, event.timeStamp - drag.time) / 1000;
          const horizontalMove = targetX - drag.targetX;
          drag.distance += Math.hypot(targetX - drag.targetX, targetY - drag.targetY);
          vx = clamp(((targetX - drag.targetX) / elapsed) * 0.25, -160, 160);
          vy = clamp(((targetY - drag.targetY) / elapsed) * 0.25, -160, 160);
          drag.targetX = targetX;
          drag.targetY = targetY;
          drag.time = event.timeStamp;
          if (Math.abs(horizontalMove) > 0.2) direction = horizontalMove > 0 ? 1 : -1;
          const step = (drag.distance / 2) % 32;
          renderFrame(step);
          element!.dataset.dragging = "true";
          resetLook();
          schedule();
        } else if (event.pointerType === "mouse") {
          const bounds = event.currentTarget.getBoundingClientRect();
          element!.style.setProperty(
            "--look-x",
            `${clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1) * 9}deg`,
          );
          element!.style.setProperty(
            "--look-y",
            `${clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1, -1, 1) * -6}deg`,
          );
        }
      },
      up(event, cancelled = false) {
        if (!drag || drag.id !== event.pointerId) return;
        draggedClick = drag.moved || cancelled;
        // Finish at the pointer before easing out the small release velocity.
        if (drag.moved) {
          x = drag.targetX;
          y = drag.targetY;
        }
        drag = null;
        element!.dataset.dragging = "false";
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          event.currentTarget.releasePointerCapture(event.pointerId);
        if (cancelled) vx = vy = 0;
        draw();
        schedule();
      },
      click(event) {
        if (draggedClick && event.detail !== 0) {
          event.preventDefault();
          event.stopPropagation();
        }
        draggedClick = false;
      },
      hover(value) {
        hovered = value;
        if (!value) resetLook();
        draw();
        schedule();
      },
      focus(value) {
        focused = value;
        draw();
        schedule();
      },
      pause(value) {
        userPaused = value;
        vx = vy = 0;
        draw();
        schedule();
      },
    };
    controller.current = api;
    const onResize = () => resize();
    const onVisibility = () => {
      if (document.hidden) {
        drag = null;
        vx = vy = 0;
        element.dataset.dragging = "false";
        resetLook();
      }
      previous = 0;
      draw();
      schedule();
    };
    resize(true);
    const panelObserver = new ResizeObserver(() => resize());
    const contactPanel = element.querySelector<HTMLElement>("[data-mascot-contact]");
    if (contactPanel) panelObserver.observe(contactPanel);
    const images = MASCOT_WALK_SHEETS.map((src) => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
      return image;
    });
    void Promise.all(images.map((image) => image.decode()))
      .then(() => {
        if (disposed) return;
        painter?.setImages(images);
        if (!renderFrame(0)) {
          element.dataset.framesReady = "false";
          return;
        }
        framesReady = true;
        element.dataset.framesReady = "true";
        draw();
        schedule();
      })
      .catch(() => {
        // Keep the sharp front pose and contact button usable if a file cannot load.
        element.dataset.framesReady = "false";
      });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", onVisibility);
    return () => {
      disposed = true;
      panelObserver.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onVisibility);
      controller.current = null;
    };
  }, [root]);

  useEffect(() => {
    controller.current?.pause(paused);
  }, [paused]);

  return {
    characterEvents: {
      onPointerDown: (event: DragEvent) => controller.current?.down(event),
      onPointerMove: (event: DragEvent) => controller.current?.move(event),
      onPointerUp: (event: DragEvent) => controller.current?.up(event),
      onPointerCancel: (event: DragEvent) => controller.current?.up(event, true),
      onLostPointerCapture: (event: DragEvent) => controller.current?.up(event, true),
      onClick: (event: MouseEvent<HTMLButtonElement>) => controller.current?.click(event),
      onDragStart: (event: ReactDragEvent<HTMLButtonElement>) => event.preventDefault(),
    },
    rootEvents: {
      onPointerEnter: () => controller.current?.hover(true),
      onPointerLeave: () => controller.current?.hover(false),
      onFocusCapture: (event: FocusEvent<HTMLElement>) => {
        if ((event.target as HTMLElement).matches(":focus-visible"))
          controller.current?.focus(true);
      },
      onBlurCapture: (event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          controller.current?.focus(false);
      },
    },
  };
}
