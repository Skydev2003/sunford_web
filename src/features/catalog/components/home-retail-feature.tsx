"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, type Ref } from "react";
import styles from "./home-retail-feature.module.css";

function RetailEditorialCard({
  kind,
  heading,
  label,
  image,
  sizes,
  cardRef,
  href,
}: {
  kind: "coffee" | "market";
  heading: string;
  label: string;
  image: string;
  sizes: string;
  cardRef?: Ref<HTMLElement>;
  href: string;
}) {
  return (
    <article
      ref={cardRef}
      className={styles.card}
      data-home-retail-feature={kind === "coffee" ? true : undefined}
      data-retail-editorial={kind}
    >
      <div className={styles.copy}>
        <p>{label}</p>
        <h3>{heading}</h3>
      </div>
      <div className={styles.scene} aria-hidden="true">
        <div className={styles.sceneArtwork}>
          <Image src={image} alt="" fill sizes={sizes} />
        </div>
      </div>
      <Link
        href={href}
        prefetch={false}
        className={styles.trigger}
        aria-label={`${heading} · ${label}`}
      >
        <span className={styles.triggerIcon}>
          <ArrowUpRight aria-hidden="true" />
        </span>
      </Link>
    </article>
  );
}

export function MarketRetailFeature({ sizes }: { sizes: string }) {
  return (
    <RetailEditorialCard
      kind="market"
      heading="ชั่งขายหน้าร้าน"
      label="ค้าส่งและตลาดสด"
      image="/images/products/market-retail-editorial.webp"
      href="/scales/applications/wholesale-markets"
      sizes={sizes}
    />
  );
}

export function HomeRetailFeature({ sizes }: { sizes: string }) {
  const card = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = card.current;
    if (!element || !("IntersectionObserver" in window)) return;
    let visible = false;
    const sync = () => {
      element.toggleAttribute("data-ambient-visible", visible && !document.hidden);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.intersectionRatio >= 0.5;
        sync();
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <RetailEditorialCard
      kind="coffee"
      cardRef={card}
      heading="ชั่งให้พอดี"
      label="ครัวและกาแฟ"
      image="/images/products/home-retail-editorial.webp"
      href="/scales/household"
      sizes={sizes}
    />
  );
}
