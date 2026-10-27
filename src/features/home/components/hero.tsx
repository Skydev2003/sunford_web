"use client";
import { Tooltip } from "@/components/ui/tooltip";
import { useRef, useState } from "react";
import { ProductImage } from "@/components/ui/product-image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/features/catalog/types";
import { defaultHero } from "@/features/cms/data/settings";
import type { HeroSettings } from "@/features/cms/types";
import { HeroProductVideo } from "./hero-product-video";

const heroImages: Record<string, string> = {
  "acs30-jc21": "/images/products/acs30-jc21-cutout.png",
  wps10ks: "/images/products/wps10ks.png",
  feh5ks: "/images/products/feh5ks.png",
  rls1100: "/images/products/rls1100.png",
};

export function HeroAnnouncement({ settings = defaultHero }: { settings?: HeroSettings }) {
  return (
    <div className="announcement">
      <span>{settings.announcement}</span>
      <a href={settings.announcementHref}>
        {settings.announcementLabel} <ChevronRight size={14} />
      </a>
    </div>
  );
}

export function Hero({
  products,
  settings = defaultHero,
  showAnnouncement = true,
}: {
  products: Product[];
  settings?: HeroSettings;
  showAnnouncement?: boolean;
}) {
  const [active, setActive] = useState(0);
  const sceneRef = useRef<HTMLElement>(null);
  const slides = settings.slides.flatMap((slide, index) => {
    const product = products.find((product) => product.id === slide.productId);
    if (slide.productId && !product) return [];
    return [
      {
        id: `${index}:${slide.productId}`,
        name: slide.title || product?.name || "SUNFORD",
        title: slide.title || `SUNFORD ${product?.name ?? "PRECISION"}`,
        description:
          slide.description || product?.subtitle || "เครื่องชั่งและโซลูชัน เพื่อทุกความเป็นไปได้",
        image:
          slide.image ||
          (product
            ? product.imageOverridden
              ? product.image
              : (heroImages[product.id] ?? product.image)
            : ""),
        href: slide.href || (product ? `/products/${product.slug}` : "/products"),
        video:
          product?.id === "acs30-jc21" && !slide.image
            ? "/videos/sunford-homepage-16x9.webm?v=8fa57b120757"
            : undefined,
      },
    ];
  });
  const activeIndex = slides.length ? active % slides.length : 0;
  const product = slides[activeIndex];
  const brandedTitle = product?.title.startsWith("SUNFORD ");
  return (
    <>
      {showAnnouncement && <HeroAnnouncement settings={settings} />}
      <section
        ref={sceneRef}
        className={`hero hero-cinematic ${product?.video ? "hero-has-motion" : ""}`}
        aria-label="Sunford ความแม่นยำที่เรียบง่ายกว่า"
      >
        <div className="hero-scene-glow" aria-hidden="true" />
        <span className="hero-scene-wordmark" aria-hidden="true">
          PRECISION
        </span>
        <div className="container hero-main">
          <div className="hero-copy">
            <p className="hero-scene-eyebrow">
              <span /> PRECISION, IN EVERY DETAIL
            </p>
            <h1 className="hero-model">
              {brandedTitle ? (
                <>
                  <span className="hero-scene-brand">SUNFORD</span> {product.title.slice(8)}
                </>
              ) : (
                (product?.title ?? "SUNFORD PRECISION")
              )}
            </h1>
            <p className="hero-tagline">{settings.tagline}</p>
            <p className="hero-description">
              {product?.description ?? "เครื่องชั่งและโซลูชัน เพื่อทุกความเป็นไปได้"}
            </p>
            <div className="hero-buttons">
              <Link className="button button-red" href={product?.href ?? "/products"}>
                {settings.primaryLabel} <ArrowUpRight size={17} />
              </Link>
              <a className="button button-outline" href={settings.secondaryHref}>
                {settings.secondaryLabel} <ChevronRight size={16} />
              </a>
            </div>
          </div>
          <div className="hero-scene-caption" aria-hidden="true">
            <span>DESIGNED FOR YOUR EVERYDAY</span>
            <span>ทุกรายละเอียด เพื่อทุกวันของคุณ</span>
          </div>
          {product?.video ? (
            <HeroProductVideo
              key={product.id}
              src={product.video}
              poster={product.image}
              name={product.name}
              sceneRef={sceneRef}
            />
          ) : (
            product && (
              <Link
                className="hero-visual"
                href={product.href}
                aria-label={`ดูรายละเอียด ${product.name}`}
              >
                <ProductImage
                  key={product.id}
                  src={product.image}
                  alt={`เครื่องชั่ง SUNFORD ${product.name}`}
                  width={690}
                  height={440}
                  preload={active === 0}
                  sizes="(max-width: 720px) 90vw, 620px"
                  className="hero-product-image"
                />
              </Link>
            )
          )}
          {slides.length > 1 && (
            <div className="slide-controls" aria-label="เลือกสินค้าแนะนำ">
              <span className="hero-scene-counter">
                {String(activeIndex + 1).padStart(2, "0")}
                <span> / {String(slides.length).padStart(2, "0")}</span>
              </span>
              <Tooltip>
                <button
                  className="icon-button"
                  aria-label="สินค้าก่อนหน้า"
                  onClick={() => setActive((active + slides.length - 1) % slides.length)}
                >
                  <ChevronLeft size={18} />
                </button>
              </Tooltip>
              <div className="slide-progress">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    className={activeIndex === index ? "active" : ""}
                    aria-label={`แสดง ${slide.name}`}
                    aria-pressed={activeIndex === index}
                    onClick={() => setActive(index)}
                  />
                ))}
              </div>
              <Tooltip>
                <button
                  className="icon-button"
                  aria-label="สินค้าถัดไป"
                  onClick={() => setActive((active + 1) % slides.length)}
                >
                  <ChevronRight size={18} />
                </button>
              </Tooltip>
            </div>
          )}
          <button
            className="hero-scene-scroll"
            type="button"
            onClick={() => {
              sceneRef.current?.nextElementSibling?.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "instant"
                  : "smooth",
                block: "start",
              });
            }}
          >
            <ArrowDown size={15} />
            <span>เลื่อนเพื่อค้นพบ</span>
          </button>
        </div>
        {product?.video && (
          <div className="hero-scene-progress" aria-hidden="true">
            <span />
          </div>
        )}
      </section>
    </>
  );
}
