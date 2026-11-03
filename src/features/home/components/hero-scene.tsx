"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { companyIntro } from "../data/brand";
import type { HeroSlide } from "../data/hero-slides";
import styles from "./hero-scene.module.css";

const frontViews: Record<string, string> = {
  "/images/products/acs30-jc21-cutout.png": "/images/hero/acs30-jc21-front.webp",
  "/images/products/wps10ks.png": "/images/hero/wps10ks-front.webp",
  "/images/products/feh5ks.png": "/images/hero/feh5ks-front.webp",
};

export type HeroProduct = Pick<HeroSlide, "name" | "image" | "href" | "descriptionOverride">;

export function HeroScene({
  product,
  opening,
  showAnnouncement = false,
}: {
  product?: HeroProduct;
  opening: boolean;
  showAnnouncement?: boolean;
}) {
  const root = useRef<HTMLElement>(null);
  const artwork = useRef<HTMLImageElement>(null);
  const revealPlayed = useRef(false);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const [allowed, setAllowed] = useState(false);
  const image = product?.image ? (frontViews[product.image] ?? product.image) : "";
  const href = product?.href || "/products";
  const imageVisible = Boolean(image && image !== failedImage);

  useEffect(() => {
    const node = artwork.current;
    if (!node || !image || !node.complete || node.naturalWidth > 0) return;
    const failedSource = node.currentSrc;
    let disposed = false;
    void node.decode().catch(() => {
      if (!disposed && node.complete && node.naturalWidth === 0 && node.currentSrc === failedSource)
        setFailedImage(image);
    });
    return () => {
      disposed = true;
    };
  }, [image]);

  useEffect(() => {
    const scene = root.current;
    if (!scene) return;
    const header = document.querySelector<HTMLElement>(".site-header");
    const headerInner = header?.querySelector<HTMLElement>(".header-inner");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    scene.dataset.enhanced = "true";
    const sync = () => setAllowed(visible && !document.hidden && !reduced.matches);
    const measureHeader = () => {
      if (!header || !headerInner) return;
      const bounds = headerInner.getBoundingClientRect();
      const height = `${bounds.height}px`;
      if (scene.style.getPropertyValue("--hero-header-height") !== height)
        scene.style.setProperty("--hero-header-height", height);
      header.dataset.heroBackdropTracked = "";
      if (scene.getBoundingClientRect().top >= bounds.bottom - 1) header.dataset.heroBackdrop = "";
      else delete header.dataset.heroBackdrop;
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
    window.addEventListener("scroll", measureHeader, { passive: true });
    window.addEventListener("resize", measureHeader);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    measureHeader();
    sync();
    return () => {
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", measureHeader);
      window.removeEventListener("resize", measureHeader);
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
    if (!next) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || reduced.matches || revealPlayed.current) return;
        revealPlayed.current = true;
        observer.unobserve(next);
        next.setAttribute("data-hero-scroll-reveal", "revealing");
        animation = next.animate(
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
      className={`hero hero-cinematic hero-studio-scene ${styles.scene}${showAnnouncement ? "" : " hero-no-announcement"}`}
      aria-labelledby="hero-title"
      data-hero-scene=""
      data-active-product={product?.name}
      data-opening={opening}
      data-ready={!opening}
      data-running={!opening && allowed}
    >
      <div className={styles.lighting} aria-hidden="true">
        <div className={styles.light} />
        <div className={`${styles.light} ${styles.reflectedLight}`} />
      </div>
      <div className={`hero-main ${styles.main}`}>
        <div className={styles.copy}>
          <h1 id="hero-title" className={styles.heading}>
            <span>เครื่องชั่ง SUNFORD</span> <span>สำหรับธุรกิจของคุณ</span>
          </h1>
          <p className={styles.description}>
            {product?.descriptionOverride || companyIntro.description}
          </p>
          <Link className={styles.cta} href="/contact-us" prefetch={false}>
            ปรึกษาผู้เชี่ยวชาญ
          </Link>
        </div>
        <Link
          className={styles.product}
          href={href}
          prefetch={false}
          data-hero-product=""
          aria-label={`ดูรายละเอียด ${product?.name ?? "สินค้า SUNFORD"}`}
        >
          {imageVisible ? (
            <span className={styles.object} data-hero-object="">
              {/* The same compact source serves every viewport without a second download. */}
              {/* eslint-disable-next-line @next/next/no-img-element -- Already optimized WebP; retain one discoverable source at all sizes. */}
              <img
                ref={artwork}
                src={image}
                alt={`เครื่องชั่ง SUNFORD ${product?.name ?? ""}`.trim()}
                width={800}
                height={521}
                fetchPriority="high"
                onError={() => setFailedImage(image)}
              />
            </span>
          ) : (
            <span className={styles.imageFallback}>
              <span>{product?.name ?? "SUNFORD"}</span>
              {image ? "ไม่สามารถแสดงภาพสินค้าได้" : "ค้นพบเครื่องชั่งสำหรับธุรกิจของคุณ"}
              <span>
                ดูรายละเอียดสินค้า <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </span>
          )}
        </Link>
      </div>
    </section>
  );
}
