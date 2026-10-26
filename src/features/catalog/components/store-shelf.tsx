"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function StoreShelf({
  id,
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  id: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(false);
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      setCanPrevious(element.scrollLeft > 8);
      setCanNext(element.scrollLeft + element.clientWidth < element.scrollWidth - 8);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [children]);
  const move = (direction: number) => {
    const element = track.current;
    if (!element) return;
    const card = element.firstElementChild;
    const distance = (card?.getBoundingClientRect().width ?? 400) + 20;
    element.scrollBy({
      left: direction * distance,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };
  return (
    <section className={`store-shelf ${className}`} aria-label={title ?? "เลือกประเภทผลิตภัณฑ์"}>
      {title && (
        <div className="store-shelf-heading">
          <h2>
            {title}
            {subtitle && <span> {subtitle}</span>}
          </h2>
          {action}
        </div>
      )}
      <div className="store-shelf-track" id={id} ref={track}>
        {children}
      </div>
      <div className="store-shelf-controls">
        <button
          className="store-arrow"
          aria-label={`ก่อนหน้า - ${title ?? "หมวดสินค้า"}`}
          aria-controls={id}
          disabled={!canPrevious}
          onClick={() => move(-1)}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className="store-arrow"
          aria-label={`ถัดไป - ${title ?? "หมวดสินค้า"}`}
          aria-controls={id}
          disabled={!canNext}
          onClick={() => move(1)}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}
