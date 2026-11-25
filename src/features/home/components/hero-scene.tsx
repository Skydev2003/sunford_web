"use client";

import { contactPath } from "@/features/content/data/contact-route";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { companyIntro } from "../data/brand";
import styles from "./hero-scene.module.css";

export function HeroScene({
  description,
  logo,
  showAnnouncement = false,
}: {
  description?: ReactNode;
  logo: ReactNode;
  showAnnouncement?: boolean;
}) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (allowed) {
      if (!element.hasAttribute("src")) element.src = "/videos/sunford-web.mp4";
      void element.play().catch(() => {});
    } else {
      element.pause();
    }
  }, [allowed]);

  useEffect(() => {
    const scene = root.current;
    if (!scene || typeof IntersectionObserver === "undefined") return;
    const frame = scene.closest("[data-home-route]");
    let headerInner: HTMLElement | null | undefined;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    scene.dataset.enhanced = "true";
    const sync = () => setAllowed(visible && !document.hidden && !reduced.matches);
    const measureHeader = () => {
      if (!headerInner) return;
      const bounds = headerInner.getBoundingClientRect();
      const height = `${bounds.height}px`;
      if (scene.style.getPropertyValue("--hero-header-height") !== height)
        scene.style.setProperty("--hero-header-height", height);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    observer.observe(scene);
    const resize = new ResizeObserver(measureHeader);
    const connectHeader = () => {
      const header = frame?.querySelector(":scope > .site-header");
      headerInner = header?.querySelector<HTMLElement>(".header-inner");
      if (!headerInner) return;
      headerObserver.disconnect();
      resize.observe(headerInner);
      measureHeader();
    };
    const headerObserver = new MutationObserver(connectHeader);
    if (frame) headerObserver.observe(frame, { childList: true });
    connectHeader();
    window.addEventListener("resize", measureHeader);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    sync();
    return () => {
      observer.disconnect();
      resize.disconnect();
      headerObserver.disconnect();
      window.removeEventListener("resize", measureHeader);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      delete scene.dataset.enhanced;
    };
  }, []);

  return (
    <section
      ref={root}
      id="brand-film"
      className={`hero hero-cinematic hero-video-scene ${styles.scene}${showAnnouncement ? "" : " hero-no-announcement"}`}
      aria-labelledby="hero-title"
      data-hero-scene=""
      data-home-section="1"
      data-opening="false"
      data-ready="true"
      data-running={allowed}
    >
      <picture data-hero-poster="">
        <source
          type="image/webp"
          media="(max-aspect-ratio: 2/3)"
          srcSet="/videos/sunford-poster-portrait-480.webp 480w, /videos/sunford-poster-portrait-642.webp 642w"
          sizes="max(100vw, 75dvh)"
        />
        <source
          type="image/webp"
          srcSet="/videos/sunford-poster-960.webp 960w, /videos/sunford-poster-1440.webp 1440w, /videos/sunford-poster-1920.webp 1920w"
          sizes="max(100vw, 224.3dvh)"
        />
        <img
          className={styles.poster}
          src="/videos/sunford-poster.jpg"
          alt=""
          width={1920}
          height={856}
          fetchPriority="high"
        />
      </picture>
      <video
        ref={video}
        className={styles.video}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={(event) => {
          event.currentTarget.dataset.started = "";
        }}
        onError={(event) => {
          delete event.currentTarget.dataset.started;
        }}
      />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={`hero-main ${styles.main}`}>
        <h1 id="hero-title" className={styles.heading}>
          <span>เครื่องชั่ง</span> <span>สำหรับธุรกิจของคุณ</span>
        </h1>
        <div className={styles.logoSpace} data-hero-logo-space="" aria-hidden="true">
          {logo}
        </div>
        <div className={styles.actions}>
          <Link className={styles.cta} href={contactPath} prefetch={false}>
            ปรึกษาผู้เชี่ยวชาญ
          </Link>
          <p className={styles.description}>{description || companyIntro.description}</p>
        </div>
      </div>
    </section>
  );
}
