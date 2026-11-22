"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronRight, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { ProductImage } from "@/components/ui/product-image";
import styles from "./home-retail-feature.module.css";

export function HomeRetailFeature({
  topics,
}: {
  topics: { context: string; label: string; href: string; image?: string }[];
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
    <article ref={card} className={styles.card} data-home-retail-feature>
      <div className={styles.copy}>
        <p>ครัวและกาแฟ · คำนวณราคา</p>
        <h3>
          พิถีพิถันทุกแก้ว
          <br />
          แม่นยำทุกยอดขาย
        </h3>
      </div>
      <div className={styles.scene} aria-hidden="true">
        {topics.map(({ href, image }) =>
          image ? (
            <div className={styles.sceneImage} key={href}>
              <ProductImage src={image} alt="" fill sizes="(max-width: 736px) 155px, 200px" />
            </div>
          ) : null,
        )}
      </div>
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="สำรวจครัวและกาแฟ และงานขายหน้าร้าน"
        onClick={() => {
          dialog.current?.showModal();
          setOpen(true);
        }}
      >
        <ArrowUpRight aria-hidden="true" />
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
    </article>
  );
}
