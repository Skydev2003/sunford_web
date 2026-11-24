"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import styles from "./scale-product-detail.module.css";

function showSpecifications(event: MouseEvent<HTMLAnchorElement>) {
  if (event.button || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const target = document.getElementById("product-specifications");
  if (!target) return;

  event.preventDefault();
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "instant"
    : "smooth";
  target.scrollIntoView({ block: "start", behavior });
  target.focus({ preventScroll: true });
}

export function ScaleSpecificationsLink() {
  return (
    <a href="#product-specifications" className={styles.specLink} onClick={showSpecifications}>
      ดูสเปก
    </a>
  );
}

export function ScaleCompactHeading({ name }: { name: string }) {
  const header = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const heading = header.current;
    const title = heading?.parentElement?.querySelector("h1");
    if (!heading || !title) return;

    let observer: IntersectionObserver | undefined;
    const observeTitle = () => {
      observer?.disconnect();
      const inset = Number.parseFloat(getComputedStyle(heading).top);
      if (!Number.isFinite(inset)) return;

      observer = new IntersectionObserver(
        ([entry]) => {
          setVisible(!entry.isIntersecting && entry.boundingClientRect.bottom <= inset);
        },
        { rootMargin: `-${inset}px 0px 0px` },
      );
      observer.observe(title);
    };

    observeTitle();
    window.addEventListener("resize", observeTitle);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", observeTitle);
    };
  }, [name]);

  return (
    <div ref={header} className={styles.compactHeading} aria-hidden="true" data-visible={visible}>
      <span>{name}</span>
      <span>สเปกสินค้า</span>
    </div>
  );
}
