"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ProductImage } from "@/components/ui/product-image";
import type { CarouselControls, CarouselProduct } from "./products-index-carousel";
import styles from "./products-mobile-rail.module.css";

export function MobileProductsRail({
  products,
  activeIndex,
  onActiveChange,
  onOpen,
  controlsRef,
}: {
  products: CarouselProduct[];
  activeIndex: number;
  onActiveChange: (index: number) => void;
  onOpen: (index: number) => void;
  controlsRef: RefObject<CarouselControls | null>;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const cards = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = useRef(activeIndex);
  const gesture = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const [nearby, setNearby] = useState(() => new Set([activeIndex]));

  useEffect(() => {
    const track = rail.current!;
    const intersecting = new Set<number>();
    let pending: number | null = null;
    let timer: ReturnType<typeof setTimeout>;
    const wrap = (index: number) => ((index % products.length) + products.length) % products.length;
    function updateImages() {
      const next = new Set(intersecting);
      for (const center of [selected.current, pending]) {
        if (center === null) continue;
        for (let index = center - 1; index <= center + 1; index++)
          if (index >= 0 && index < products.length) next.add(index);
      }
      setNearby((previous) =>
        previous.size === next.size && [...next].every((index) => previous.has(index))
          ? previous
          : next,
      );
    }
    function leftFor(index: number) {
      const card = cards.current[index]!;
      return card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2;
    }
    function settle() {
      clearTimeout(timer);
      let closest = selected.current;
      let distance = Infinity;
      cards.current.forEach((card, index) => {
        if (!card) return;
        const delta = Math.abs(leftFor(index) - track.scrollLeft);
        if (delta < distance) {
          distance = delta;
          closest = index;
        }
      });
      selected.current = closest;
      pending = null;
      updateImages();
      onActiveChange(closest);
    }
    function select(index: number, immediate = false) {
      const next = wrap(index);
      const instant =
        immediate ||
        Math.abs(next - selected.current) > 1 ||
        matchMedia("(prefers-reduced-motion: reduce)").matches;
      pending = next;
      gesture.current = null;
      updateImages();
      track.scrollTo({ left: leftFor(next), behavior: instant ? "instant" : "smooth" });
      if (instant || Math.abs(track.scrollLeft - leftFor(next)) < 1) settle();
    }
    const controls: CarouselControls = {
      select,
      move: (steps) => select((pending ?? selected.current) + steps),
    };
    controlsRef.current = controls;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(settle, 160);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.railIndex);
          if (entry.isIntersecting) intersecting.add(index);
          else intersecting.delete(index);
        }
        updateImages();
      },
      { root: track, rootMargin: "0px 100%" },
    );
    for (const card of cards.current) if (card) observer.observe(card);
    const resize = new ResizeObserver(() => {
      clearTimeout(timer);
      track.scrollTo({ left: leftFor(selected.current), behavior: "instant" });
    });
    resize.observe(track);
    track.scrollTo({ left: leftFor(selected.current), behavior: "instant" });
    updateImages();
    track.addEventListener("scroll", onScroll, { passive: true });
    track.addEventListener("scrollend", settle);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      resize.disconnect();
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("scrollend", settle);
      if (controlsRef.current === controls) controlsRef.current = null;
    };
  }, [products, onActiveChange, controlsRef]);

  return (
    <div
      ref={rail}
      className={styles.rail}
      data-products-mobile-rail
      role="group"
      aria-label="เลื่อนเลือกสินค้า"
      onPointerDown={(event) => {
        gesture.current = { x: event.clientX, y: event.clientY, moved: false };
      }}
      onPointerMove={(event) => {
        const start = gesture.current;
        if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8)
          start.moved = true;
      }}
      onPointerCancel={() => {
        if (gesture.current) gesture.current.moved = true;
      }}
      onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? products.length - 1
              : (selected.current + (event.key === "ArrowRight" ? 1 : -1) + products.length) %
                products.length;
        controlsRef.current?.select(next);
        cards.current[next]?.focus({ preventScroll: true });
      }}
    >
      {products.map((product, index) => (
        <button
          key={product.id}
          ref={(node) => {
            cards.current[index] = node;
          }}
          className={styles.card}
          type="button"
          data-rail-index={index}
          data-product-photo={product.id}
          aria-label={`ดูรายละเอียด ${product.model}`}
          aria-current={index === activeIndex}
          tabIndex={index === activeIndex ? 0 : -1}
          onClick={(event) => {
            if (event.detail !== 0 && gesture.current?.moved) {
              event.preventDefault();
              return;
            }
            onOpen(index);
          }}
        >
          {nearby.has(index) && (
            <ProductImage
              src={product.image}
              fallbackSrc={product.fallbackImage}
              alt={product.model}
              fill
              sizes="(orientation: landscape) and (max-height: 500px) 38vw, (max-height: 700px) 64vw, 78vw"
              className={styles.image}
            />
          )}
        </button>
      ))}
    </div>
  );
}
