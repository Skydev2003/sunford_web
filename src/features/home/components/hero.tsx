"use client";
import { Tooltip } from "@/components/ui/tooltip";
import { useState } from "react";
import { ProductImage } from "@/components/ui/product-image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

export function Hero({
  products,
  settings = defaultHero,
}: {
  products: Product[];
  settings?: HeroSettings;
}) {
  const [active, setActive] = useState(0);
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
  const product = slides.length ? slides[active % slides.length] : undefined;
  return (
    <>
      <div className="announcement">
        <span>{settings.announcement}</span>
        <a href={settings.announcementHref}>
          {settings.announcementLabel} <ChevronRight size={14} />
        </a>
      </div>
      <section
        className={`hero ${product?.video ? "hero-has-motion" : ""}`}
        aria-label="Sunford ความแม่นยำที่เรียบง่ายกว่า"
      >
        <div className="container hero-main">
          <div className="hero-copy">
            <h1 className="hero-model">{product?.title ?? "SUNFORD PRECISION"}</h1>
            <p className="hero-tagline">{settings.tagline}</p>
            <p className="hero-description">
              {product?.description ?? "เครื่องชั่งและโซลูชัน เพื่อทุกความเป็นไปได้"}
            </p>
            <div className="hero-buttons">
              <Link className="button button-red" href={product?.href ?? "/products"}>
                {settings.primaryLabel}
              </Link>
              <a className="button button-outline" href={settings.secondaryHref}>
                {settings.secondaryLabel}
              </a>
            </div>
          </div>
          {product?.video ? (
            <HeroProductVideo
              key={product.id}
              src={product.video}
              poster={product.image}
              name={product.name}
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
                    className={active === index ? "active" : ""}
                    aria-label={`แสดง ${slide.name}`}
                    aria-pressed={active === index}
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
        </div>
      </section>
    </>
  );
}
