"use client";

import { useEffect, useRef } from "react";
import { ProductImage } from "@/components/ui/product-image";
import styles from "./hero-product-ribbon.module.css";

type RibbonProduct = { id: string; name: string; image: string; model?: string };

/** Precomputed compositor animations: no animation loop, layout reads or React renders per frame. */
export function HeroProductRibbon({
  products,
  activeId,
  running,
  onSelect,
}: {
  products: RibbonProduct[];
  activeId?: string;
  running: boolean;
  onSelect: (index: number) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLDivElement>(null);
  const announcement = useRef<HTMLSpanElement>(null);
  const selectCallback = useRef(onSelect);
  const motion = useRef<Animation[]>([]);
  const syncMotion = useRef<(() => void) | null>(null);
  const centerCard = useRef<((index: number) => void) | null>(null);
  const allowedRef = useRef(running);
  const poolSize = Math.max(72, products.length);
  const productKey = products.map((product) => product.id).join("|");

  useEffect(() => {
    const element = root.current;
    if (!element || !products.length) return;
    const cards = Array.from(element.querySelectorAll<HTMLElement>("[data-ribbon-card]"));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let duration = 1;
    let width = 0;
    let height = 0;
    let focusedWindow = true;
    let dragging = false;
    let rotating = false;
    const sync = () => {
      const play =
        allowedRef.current && !document.hidden && focusedWindow && !reduced.matches && !rotating;
      element.dataset.running = String(play);
      motion.current.forEach((animation) => {
        if (play && animation.playState !== "running") animation.play();
        else if (!play && animation.playState !== "paused") animation.pause();
      });
    };
    syncMotion.current = sync;
    const measure = () => {
      const nextWidth = element.clientWidth;
      const nextHeight = element.clientHeight;
      if (
        !nextWidth ||
        (nextWidth === width &&
          nextHeight === height &&
          element.dataset.static === String(reduced.matches))
      )
        return;
      if (gesture) finish(false);
      const oldPhase = motion.current.length
        ? Number(motion.current[0].currentTime ?? 0) / duration
        : 0;
      motion.current.forEach((animation) => animation.cancel());
      motion.current = [];
      width = nextWidth;
      height = nextHeight;
      element.dataset.static = String(reduced.matches);
      const mobile = width < 801;
      const radius = width * (mobile ? 1.02 : 1.3);
      const perspective = width * 0.9;
      const targetWidth = mobile
        ? Math.min(156, width / 3)
        : Math.min(width / 5.8, (height - 30) / 0.78);
      const desiredCount = Math.ceil((2 * Math.PI * radius) / (targetWidth + 8));
      const count = Math.min(
        cards.length,
        Math.max(products.length, Math.ceil(desiredCount / products.length) * products.length),
      );
      const cardGap = mobile ? 10 : 18;
      const cardWidth = (2 * Math.PI * radius) / count - cardGap;
      const cardHeight = cardWidth * 0.78;
      const sceneHeight = element.closest<HTMLElement>(".hero-main")?.clientHeight ?? height;
      const frontY = height - cardHeight / 2 - 18;
      const travel = mobile ? Math.min(180, sceneHeight * 0.22) : sceneHeight * 0.5;
      const rearScale = perspective / (perspective + 2 * radius);
      const rise = travel / (2 * rearScale);
      const copy = element
        .closest(".hero-main")
        ?.querySelector(".hero-copy")
        ?.getBoundingClientRect();
      const viewport = element.getBoundingClientRect();
      // Project one cylinder for the photos and their silver rail, so every surface shares an arc.
      const pose = (angle: number) => {
        const depth = (Math.sin(angle) + 1) / 2;
        const distance = perspective + 2 * radius * (1 - depth);
        const scale = perspective / distance;
        const worldX = Math.cos(angle) * radius;
        const worldY = -2 * rise * (1 - depth);
        return {
          depth,
          distance,
          scale,
          worldX,
          worldY,
          x: width / 2 + worldX * scale,
          y: frontY + worldY * scale,
        };
      };
      const tangent = Math.asin(radius / (perspective + radius));
      for (const layer of ["front", "rear"] as const) {
        const start = layer === "front" ? tangent : Math.PI - tangent;
        const end = layer === "front" ? Math.PI - tangent : Math.PI * 2 + tangent;
        const arc = Array.from({ length: 97 }, (_, i) => pose(start + ((end - start) * i) / 96));
        const edge = (side: number) =>
          arc.map(
            (point) =>
              `${point.x.toFixed(2)},${(point.y + side * (cardHeight / 2 + 8) * point.scale).toFixed(2)}`,
          );
        const top = edge(-1);
        const bottom = edge(1);
        const rail = element.parentElement!.querySelector<SVGSVGElement>(
          `[data-ribbon-rail="${layer}"]`,
        )!;
        rail.setAttribute("viewBox", `0 0 ${width} ${height}`);
        rail.style.display = reduced.matches ? "none" : "block";
        rail
          .querySelector("[data-ring-surface]")!
          .setAttribute("d", `M${top.join(" L")} L${bottom.toReversed().join(" L")} Z`);
        rail.querySelector("[data-ring-top]")!.setAttribute("d", `M${top.join(" L")}`);
        rail.querySelector("[data-ring-bottom]")!.setAttribute("d", `M${bottom.join(" L")}`);
      }
      duration = mobile ? 252000 : 360000;
      element.style.setProperty("--ribbon-card-width", `${cardWidth}px`);
      // Finer samples soften changes in the projected curve while the browser
      // interpolates continuously at the display refresh rate.
      const samples = 480;
      const frames = Array.from({ length: samples + 1 }, (_, step) => {
        const progress = step / samples;
        const angle = Math.PI / 2 + progress * Math.PI * 2;
        const { depth, distance, scale, worldX, worldY, x: centerX, y: centerY } = pose(angle);
        const x = centerX - cardWidth / 2;
        const y = centerY - cardHeight / 2;
        const front = Math.sin(angle) > radius / (perspective + radius);
        // Project the tangent plane with the same camera as the band. Reverse the rear
        // face so its contents stay readable, without adding a second local camera.
        const face = front ? 1 : -1;
        const tangentX = Math.sin(angle) * face;
        const tangentZ = -Math.cos(angle) * face;
        // The ring rises toward the rear. Its tangent therefore has a vertical
        // component as well as depth; omitting it leaves cards upright across the rim.
        const tangentY = (rise / radius) * tangentZ;
        const horizontal = scale * (tangentX + (worldX * tangentZ) / distance);
        const shear = scale * (tangentY + (worldY * tangentZ) / distance);
        // Keep the returning products out of the reading area while they pass behind it.
        const copyClearance =
          !mobile && copy
            ? Math.max(
                x + cardWidth / 2 - (cardWidth * scale) / 2 - (copy.right - viewport.left),
                y + cardHeight / 2 - (cardHeight * scale) / 2 - (copy.bottom - viewport.top),
              )
            : 80;
        const visibility = Math.min(1, Math.max(0, 1 + copyClearance / 50));
        return {
          // Depth is already projected above. A 2D tangent avoids singular projective
          // matrix interpolation when the card turns edge-on and reverses its face.
          transform: `translate(${x}px, ${y}px) matrix(${horizontal},${shear},0,${scale},0,0)`,
          opacity: (0.94 + depth * 0.06) * visibility,
          zIndex: front ? "var(--z-local-front)" : "var(--z-local-raised)",
        };
      });
      cards.forEach((card, index) => {
        const shown = index < (reduced.matches ? products.length : count);
        card.hidden = !shown;
        if (!shown || reduced.matches) return;
        const animation = card.animate(frames, {
          duration,
          iterations: Infinity,
          easing: "linear",
          delay: (-index * duration) / count,
        });
        animation.currentTime = oldPhase * duration;
        motion.current.push(animation);
      });
      sync();
    };
    centerCard.current = (index) => {
      if (reduced.matches || !motion.current[index]) return;
      const phase = (((-index / motion.current.length) % 1) + 1) % 1;
      motion.current.forEach((animation) => {
        animation.currentTime = phase * duration;
      });
    };
    const focus = (event: FocusEvent) => {
      const target = (event.target as Element).closest<HTMLElement>("[data-ribbon-card]");
      if (target?.matches(":focus-visible"))
        centerCard.current?.(Number(target.dataset.ribbonCard));
    };
    const windowBlur = () => {
      focusedWindow = false;
      sync();
    };
    const windowFocus = () => {
      focusedWindow = true;
      sync();
    };
    const scene = element.closest<HTMLElement>(".hero-showroom");
    const ribbon = element.parentElement!;
    const preview = ghost.current!;
    let gesture: {
      id: number;
      card: HTMLElement;
      index: number;
      x: number;
      y: number;
      pointer: string;
      model: boolean;
    } | null = null;
    let hold: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    let latestX = 0;
    let latestY = 0;
    let zone: DOMRect | undefined;
    let suppressClickUntil = 0;
    let flight: Animation | undefined;
    let rotationTime = 0;
    let rotationX = 0;
    let rotationScroll = 0;
    const paintRotation = () => {
      frame = 0;
      const distance = latestX - rotationX;
      if (reduced.matches) {
        element.scrollLeft = rotationScroll - distance;
        return;
      }
      const circumference = 2 * Math.PI * width * (width < 801 ? 1.02 : 1.3);
      const time = rotationTime - (distance / circumference) * duration;
      const wrapped = ((time % duration) + duration) % duration;
      motion.current.forEach((animation) => {
        animation.currentTime = wrapped;
      });
    };
    const beginRotation = () => {
      if (!gesture) return;
      clearTimeout(hold);
      rotating = true;
      rotationX = gesture.x;
      rotationTime = Number(motion.current[0]?.currentTime ?? 0);
      rotationScroll = element.scrollLeft;
      gesture.card.setPointerCapture(gesture.id);
      element.dataset.rotating = "true";
      scene?.dispatchEvent(new CustomEvent("hero-product-drag", { detail: true }));
      sync();
    };
    const isOver = () =>
      Boolean(
        zone &&
        latestX >= zone.left &&
        latestX <= zone.right &&
        latestY >= zone.top &&
        latestY <= zone.bottom,
      );
    const paintDrag = () => {
      frame = 0;
      preview.style.transform = `translate3d(${latestX - 70}px, ${latestY - 65}px, 0)`;
      if (scene) scene.dataset.productDrop = String(isOver());
    };
    const beginDrag = () => {
      if (!gesture?.model || rotating) return;
      flight?.cancel();
      dragging = true;
      gesture.card.setPointerCapture(gesture.id);
      zone = scene?.querySelector("[data-hero-dropzone]")?.getBoundingClientRect();
      const photo = gesture.card.querySelector(`.${styles.photo}`)?.cloneNode(true);
      preview.replaceChildren(...(photo ? [photo] : []));
      preview.style.opacity = "1";
      ribbon.dataset.dragging = "true";
      if (scene) {
        scene.dataset.productDrag = "true";
        scene.dispatchEvent(new CustomEvent("hero-product-drag", { detail: true }));
      }
      paintDrag();
      sync();
    };
    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || gesture) return;
      const card = (event.target as Element).closest<HTMLElement>("[data-ribbon-card]");
      gesture = {
        id: event.pointerId,
        card: card ?? element,
        index: card ? Number(card.dataset.ribbonCard) % products.length : -1,
        x: event.clientX,
        y: event.clientY,
        pointer: event.pointerType,
        model: Boolean(card?.dataset.modelSrc),
      };
      latestX = event.clientX;
      latestY = event.clientY;
      if (gesture.model && event.pointerType !== "mouse") hold = setTimeout(beginDrag, 200);
    };
    const move = (event: PointerEvent) => {
      if (!gesture || gesture.id !== event.pointerId) return;
      latestX = event.clientX;
      latestY = event.clientY;
      const dx = latestX - gesture.x;
      const dy = latestY - gesture.y;
      if (!dragging && !rotating && Math.hypot(dx, dy) > 7) {
        if (Math.abs(dx) > Math.abs(dy)) {
          beginRotation();
        } else if (gesture.model && gesture.pointer === "mouse") {
          beginDrag();
        } else {
          clearTimeout(hold);
          gesture = null;
          return;
        }
      }
      if (!dragging && !rotating) return;
      event.preventDefault();
      if (!frame) frame = requestAnimationFrame(rotating ? paintRotation : paintDrag);
    };
    const finish = (accept: boolean) => {
      clearTimeout(hold);
      if (!gesture) return;
      const current = gesture;
      gesture = null;
      if (current.card.hasPointerCapture(current.id))
        current.card.releasePointerCapture(current.id);
      if (rotating) {
        cancelAnimationFrame(frame);
        paintRotation();
        rotating = false;
        delete element.dataset.rotating;
        suppressClickUntil = performance.now() + 500;
        scene?.dispatchEvent(new CustomEvent("hero-product-drag", { detail: false }));
        sync();
        return;
      }
      if (!dragging) return;
      cancelAnimationFrame(frame);
      frame = 0;
      paintDrag();
      const dropped = accept && isOver();
      dragging = false;
      suppressClickUntil = performance.now() + 500;
      if (scene) {
        delete scene.dataset.productDrag;
        delete scene.dataset.productDrop;
        scene.dispatchEvent(new CustomEvent("hero-product-drag", { detail: false }));
      }
      const start = preview.style.transform;
      const destination =
        dropped && zone
          ? `translate3d(${zone.x + zone.width / 2 - 70}px, ${zone.y + zone.height / 2 - 65}px, 0) scale(.6)`
          : `${start} scale(.85)`;
      if (dropped) {
        selectCallback.current(current.index);
        if (announcement.current)
          announcement.current.textContent = `แสดงโมเดล ${products[current.index].name} แล้ว`;
      }
      if (!reduced.matches) {
        flight = preview.animate(
          [
            { transform: start, opacity: 1 },
            { transform: destination, opacity: 0 },
          ],
          { duration: dropped ? 380 : 180, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" },
        );
        const settling = flight;
        settling.finished
          .then(() => {
            if (flight !== settling) return;
            preview.style.opacity = "0";
            delete ribbon.dataset.dragging;
            settling.cancel();
          })
          .catch(() => {});
      } else {
        preview.style.opacity = "0";
        delete ribbon.dataset.dragging;
      }
      sync();
    };
    const up = (event: PointerEvent) => {
      if (gesture?.id === event.pointerId) {
        latestX = event.clientX;
        latestY = event.clientY;
        if (!dragging && !rotating && gesture.index >= 0 && gesture.pointer !== "mouse") {
          selectCallback.current(gesture.index);
          suppressClickUntil = performance.now() + 500;
        }
        finish(true);
      }
    };
    const cancel = () => finish(false);
    const lostCapture = (event: PointerEvent) => {
      if (gesture?.id === event.pointerId) finish(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish(false);
    };
    const click = (event: MouseEvent) => {
      if (event.detail !== 0 && performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const preventImageDrag = (event: Event) => event.preventDefault();
    const touch = (event: TouchEvent) => {
      if (dragging || rotating) event.preventDefault();
    };
    const touchStart = (event: TouchEvent) => {
      // Reserve touches on linked photos for tap/hold; scrolling remains available outside them.
      if ((event.target as Element).closest("[data-model-src]")) event.preventDefault();
    };
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    measure();
    reduced.addEventListener("change", measure);
    element.addEventListener("focusin", focus);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("blur", windowBlur);
    window.addEventListener("focus", windowFocus);
    element.addEventListener("pointerdown", down);
    element.addEventListener("lostpointercapture", lostCapture);
    element.addEventListener("click", click, true);
    element.addEventListener("dragstart", preventImageDrag);
    element.addEventListener("contextmenu", preventImageDrag);
    element.addEventListener("touchmove", touch, { passive: false });
    element.addEventListener("touchstart", touchStart, { passive: false });
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("keydown", escape);
    window.addEventListener("blur", cancel);
    return () => {
      finish(false);
      flight?.cancel();
      cancelAnimationFrame(frame);
      preview.style.opacity = "0";
      delete ribbon.dataset.dragging;
      resize.disconnect();
      motion.current.forEach((animation) => animation.cancel());
      syncMotion.current = centerCard.current = null;
      reduced.removeEventListener("change", measure);
      element.removeEventListener("focusin", focus);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("blur", windowBlur);
      window.removeEventListener("focus", windowFocus);
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("lostpointercapture", lostCapture);
      element.removeEventListener("click", click, true);
      element.removeEventListener("dragstart", preventImageDrag);
      element.removeEventListener("contextmenu", preventImageDrag);
      element.removeEventListener("touchmove", touch);
      element.removeEventListener("touchstart", touchStart);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("keydown", escape);
      window.removeEventListener("blur", cancel);
    };
    // Image/content edits don't restart the conveyor; its geometry depends on product identities.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productKey, poolSize]);

  useEffect(() => {
    allowedRef.current = running;
    selectCallback.current = onSelect;
    syncMotion.current?.();
  }, [running, onSelect]);

  if (!products.length) return null;
  return (
    <div className={styles.ribbon} aria-label="ภาพสินค้า Sunford เลือกเพื่อชมโมเดล">
      {(["rear", "front"] as const).map((layer) => (
        <svg
          key={layer}
          className={layer === "front" ? styles.rail : styles.rearRail}
          data-ribbon-rail={layer}
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path data-ring-surface="" fill="none" />
          <path data-ring-top="" className={styles.rimTop} />
          <path data-ring-bottom="" className={styles.rimBottom} />
        </svg>
      ))}
      <div ref={root} className={styles.viewport} data-hero-ribbon="" data-running="false">
        {Array.from({ length: poolSize }, (_, index) => {
          const productIndex = index % products.length;
          const product = products[productIndex];
          const duplicate = index >= products.length;
          return (
            <button
              key={`${product.id}:${index}`}
              type="button"
              className={styles.card}
              data-ribbon-card={index}
              data-selected={product.id === activeId}
              data-model-src={product.model}
              aria-label={`เลือกชม ${product.name}`}
              aria-pressed={product.id === activeId}
              aria-hidden={duplicate || undefined}
              tabIndex={duplicate ? -1 : 0}
              onPointerDown={(event) => {
                if (duplicate) event.preventDefault();
              }}
              onClick={() => onSelect(productIndex)}
            >
              <span className={styles.photo}>
                <ProductImage
                  src={product.image}
                  alt=""
                  fill
                  sizes="(max-width: 800px) 176px, 320px"
                />
              </span>
              <span className={styles.reflection} aria-hidden="true">
                <ProductImage
                  src={product.image}
                  alt=""
                  fill
                  sizes="(max-width: 800px) 176px, 320px"
                />
              </span>
              <span className={styles.caption} aria-hidden="true">
                <span className={styles.brand}>SUNFORD</span>
                <span className={styles.model}>{product.name.replace(/^SUNFORD\s+/i, "")}</span>
              </span>
              <span className={styles.glint} data-ribbon-glint="" aria-hidden="true" />
            </button>
          );
        })}
      </div>
      <div ref={ghost} className={styles.ghost} aria-hidden="true" />
      <p className={styles.instruction}>
        {products.some((product) => product.model)
          ? "ลากซ้าย–ขวาเพื่อหมุน · เลือกสินค้า หรือลากขึ้นเพื่อชมโมเดล"
          : "ลากซ้าย–ขวาเพื่อหมุน · เลือกสินค้าเพื่อดูรายละเอียด"}
      </p>
      <span ref={announcement} className={styles.srOnly} role="status" aria-live="polite" />
    </div>
  );
}
