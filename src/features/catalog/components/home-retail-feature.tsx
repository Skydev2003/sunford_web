"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode, type Ref } from "react";
import { ProductImage } from "@/components/ui/product-image";
import styles from "./home-retail-feature.module.css";

const featureTitle = "ชั่งให้พอดี";
const marketTitle = "ชั่งขายที่แผง";
const marketLabel = "ค้าส่งและตลาดสด";

function RetailEditorialCard({
  kind,
  heading,
  label,
  image,
  sizes,
  cardRef,
  children,
}: {
  kind: "coffee" | "market";
  heading: string;
  label: string;
  image: string;
  sizes: string;
  cardRef?: Ref<HTMLElement>;
  children: ReactNode;
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
      {children}
    </article>
  );
}

function EditorialArrow() {
  return (
    <span className={styles.triggerIcon}>
      <ArrowUpRight aria-hidden="true" />
    </span>
  );
}

export function MarketRetailFeature({ sizes }: { sizes: string }) {
  return (
    <RetailEditorialCard
      kind="market"
      heading={marketTitle}
      label={marketLabel}
      image="/images/products/market-retail-editorial.webp"
      sizes={sizes}
    >
      <Link
        href="/products/category/scales/applications/wholesale-markets"
        prefetch={false}
        className={styles.trigger}
        aria-label={`${marketTitle} · ${marketLabel}`}
      >
        <EditorialArrow />
      </Link>
    </RetailEditorialCard>
  );
}

export function HomeRetailFeature({
  topics,
  sizes,
}: {
  topics: { context: string; label: string; href: string; image?: string }[];
  sizes: string;
}) {
  const card = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);

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
      heading={featureTitle}
      label="ครัวและกาแฟ · คำนวณราคา"
      image="/images/products/home-retail-editorial.webp"
      sizes={sizes}
    >
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${featureTitle} · สำรวจครัวและกาแฟ และงานขายหน้าร้าน`}
        onClick={() => {
          dialog.current?.showModal();
          setOpen(true);
        }}
      >
        <EditorialArrow />
      </button>
      <noscript>
        <ul className={styles.directLinks}>
          {topics.map(({ label, href }) => (
            <li key={href}>
              <Link href={href}>{label}</Link>
            </li>
          ))}
        </ul>
      </noscript>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        className={styles.dialog}
        onClose={() => {
          setOpen(false);
          trigger.current?.focus({ preventScroll: true });
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className={styles.dialogContent}>
          <div className={styles.dialogHeading}>
            <h2 id={titleId}>ครัวและกาแฟ · คำนวณราคา</h2>
            <form method="dialog">
              <button type="submit" autoFocus aria-label="ปิดหน้าต่างรายละเอียด">
                <X aria-hidden="true" />
              </button>
            </form>
          </div>
          {open && (
            <ul className={styles.topicGrid}>
              {topics.map(({ context, label, href, image }) => (
                <li key={href}>
                  <Link href={href} onNavigate={() => dialog.current?.close()}>
                    {image && (
                      <div className={styles.topicArt}>
                        <ProductImage
                          src={image}
                          alt=""
                          fill
                          sizes="(max-width: 639px) 80vw, 260px"
                        />
                      </div>
                    )}
                    <p>{context}</p>
                    <h3>
                      {label}
                      <ChevronRight size={18} aria-hidden="true" />
                    </h3>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </RetailEditorialCard>
  );
}
