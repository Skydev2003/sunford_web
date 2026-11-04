"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { companyIntro } from "../data/brand";
import styles from "./hero-scene.module.css";

export function HeroScene({
  description,
  logo,
  showAnnouncement = false,
}: {
  description?: string;
  logo: ReactNode;
  showAnnouncement?: boolean;
}) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const revealPlayed = useRef(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (allowed) void element.play().catch(() => {});
    else element.pause();
  }, [allowed]);

  useEffect(() => {
    const scene = root.current;
    if (!scene) return;
    const header = document.querySelector<HTMLElement>(".site-header");
    const headerInner = header?.querySelector<HTMLElement>(".header-inner");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let backdropFrame = 0;
    scene.dataset.enhanced = "true";
    const sync = () => setAllowed(visible && !document.hidden && !reduced.matches);
    const syncBackdrop = () => {
      backdropFrame = 0;
      if (!header) return;
      const atTop = scene.getBoundingClientRect().top >= -1;
      if (!header.hasAttribute("data-hero-backdrop-tracked"))
        header.dataset.heroBackdropTracked = "";
      if (atTop && !header.hasAttribute("data-hero-backdrop")) header.dataset.heroBackdrop = "";
      else if (!atTop && header.hasAttribute("data-hero-backdrop"))
        delete header.dataset.heroBackdrop;
    };
    const requestBackdrop = () => {
      if (!backdropFrame) backdropFrame = requestAnimationFrame(syncBackdrop);
    };
    const measureHeader = () => {
      if (!header || !headerInner) return;
      const bounds = headerInner.getBoundingClientRect();
      const height = `${bounds.height}px`;
      if (scene.style.getPropertyValue("--hero-header-height") !== height)
        scene.style.setProperty("--hero-header-height", height);
      requestBackdrop();
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
    if (headerInner) resize.observe(headerInner);
    window.addEventListener("scroll", requestBackdrop, { passive: true });
    window.addEventListener("resize", measureHeader);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    measureHeader();
    sync();
    return () => {
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", requestBackdrop);
      window.removeEventListener("resize", measureHeader);
      cancelAnimationFrame(backdropFrame);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      delete scene.dataset.enhanced;
      if (header) {
        delete header.dataset.heroBackdrop;
        delete header.dataset.heroBackdropTracked;
      }
    };
  }, []);

  useEffect(() => {
    const next = root.current?.nextElementSibling as HTMLElement | null;
    const content = next?.firstElementChild as HTMLElement | null;
    if (!next || !content) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || reduced.matches || revealPlayed.current) return;
        revealPlayed.current = true;
        observer.unobserve(next);
        next.setAttribute("data-hero-scroll-reveal", "revealing");
        animation = content.animate(
          [
            { opacity: 0.65, transform: "translateY(24px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 750, easing: "cubic-bezier(0.22,1,0.36,1)" },
        );
        void animation.finished
          .then(() => {
            next.setAttribute("data-hero-scroll-reveal", "complete");
            animation = undefined;
          })
          .catch(() => {});
      },
      { threshold: 0.12 },
    );
    const sync = () => {
      animation?.cancel();
      animation = undefined;
      next.setAttribute(
        "data-hero-scroll-reveal",
        reduced.matches ? "reduced" : revealPlayed.current ? "complete" : "pending",
      );
      if (!reduced.matches && !revealPlayed.current) observer.observe(next);
      else observer.unobserve(next);
    };
    reduced.addEventListener("change", sync);
    sync();
    return () => {
      animation?.cancel();
      observer.disconnect();
      reduced.removeEventListener("change", sync);
      delete next.dataset.heroScrollReveal;
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
      <video
        ref={video}
        className={styles.video}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/sunford-poster.jpg"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src="/videos/sunford-web.mp4" type="video/mp4" />
      </video>
      <div className={styles.overlay} aria-hidden="true" />
      <div className={`hero-main ${styles.main}`}>
        <h1 id="hero-title" className={styles.heading}>
          <span>เครื่องชั่ง</span> <span>สำหรับธุรกิจของคุณ</span>
        </h1>
        <div className={styles.logoSpace} data-hero-logo-space="" aria-hidden="true">
          {logo}
        </div>
        <div className={styles.actions}>
          <Link className={styles.cta} href="/contact-us" prefetch={false}>
            ปรึกษาผู้เชี่ยวชาญ
          </Link>
          <p className={styles.description}>{description || companyIntro.description}</p>
        </div>
      </div>
    </section>
  );
}
