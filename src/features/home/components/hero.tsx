"use client";
import { useState } from "react";
import { ProductImage } from "@/components/ui/product-image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/features/catalog/types";

export function Hero({ products }: { products: Product[] }) {
  const [active, setActive] = useState(0);
  const preferred = ["wps10ks", "feh5ks", "rls1100"].flatMap((id) =>
    products.filter((product) => product.id === id),
  );
  const slides = preferred.length ? preferred : products.slice(0, 3);
  const product = slides.length ? slides[active % slides.length] : undefined;
  return (
    <>
      <div className="announcement">
        <span>เทคโนโลยีการชั่งและระบบจัดการข้อมูล เพื่อธุรกิจของคุณ</span>
        <a href="#support">
          ให้เราช่วยเลือก <ChevronRight size={14} />
        </a>
      </div>
      <section className="hero" aria-label="Sunford ความแม่นยำที่เรียบง่ายกว่า">
        <div className="container hero-main">
          <div className="hero-copy">
            <h1 className="hero-model">SUNFORD {product?.name ?? "PRECISION"}</h1>
            <p className="hero-tagline">ความแม่นยำ ที่เรียบง่ายกว่า.</p>
            <p className="hero-description">
              {product?.subtitle ?? "เครื่องชั่งและโซลูชัน เพื่อทุกความเป็นไปได้"}
            </p>
            <div className="hero-buttons">
              <Link
                className="button button-red"
                href={product ? `/products/${product.slug}` : "/products"}
              >
                ดูเพิ่มเติม
              </Link>
              <a className="button button-outline" href="#products">
                ค้นพบผลิตภัณฑ์
              </a>
            </div>
          </div>
          {product && (
            <Link
              className="hero-visual"
              href={`/products/${product.slug}`}
              aria-label={`ดูรายละเอียด ${product.name}`}
            >
              <ProductImage
                key={product.id}
                src={
                  !product.imageOverridden && ["wps10ks", "feh5ks", "rls1100"].includes(product.id)
                    ? `/images/products/${product.id}.png`
                    : product.image
                }
                alt={`เครื่องชั่ง SUNFORD ${product.name}`}
                width={690}
                height={440}
                preload={active === 0}
                sizes="(max-width: 720px) 90vw, 620px"
                className="hero-product-image"
              />
            </Link>
          )}
          {slides.length > 1 && (
            <div className="slide-controls" aria-label="เลือกสินค้าแนะนำ">
              <button
                className="icon-button"
                aria-label="สินค้าก่อนหน้า"
                onClick={() => setActive((active + slides.length - 1) % slides.length)}
              >
                <ChevronLeft size={18} />
              </button>
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
              <button
                className="icon-button"
                aria-label="สินค้าถัดไป"
                onClick={() => setActive((active + 1) % slides.length)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
