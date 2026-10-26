"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import type { Product } from "@/features/catalog/types";

export function Hero({ products }: { products: Product[] }) {
  const [active, setActive] = useState(0);
  const preferred = ["wps10ks", "feh5ks", "rls1100"].flatMap((id) =>
    products.filter((p) => p.id === id),
  );
  const slides = preferred.length ? preferred : products.slice(0, 3);
  const product = slides[active];
  return (
    <>
      <div className="announcement">
        ความเที่ยงตรง ที่คุณวางใจ พร้อมเคียงข้างทุกการเติบโตของธุรกิจ{" "}
        <a href="#story">
          รู้จัก Sunford <ChevronRight size={13} />
        </a>
      </div>
      <section className="hero" aria-label="Sunford ความแม่นยำที่พาคุณไปได้ไกลกว่า">
        <div className="hero-word" aria-hidden="true">
          precision.
        </div>
        <div className="container hero-main">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="red-line" /> PRECISION. FOR EVERY POSSIBILITY.
            </p>
            <h1>
              ความแม่นยำ
              <br />
              ที่พาคุณไปได้<span>ไกลกว่า.</span>
            </h1>
            <p className="hero-description">
              มากกว่าเครื่องชั่ง คือความมั่นใจในทุกการตัดสินใจ
              <br className="desktop-break" /> ค้นพบเทคโนโลยีการชั่งและโซลูชันที่เติบโตไปพร้อมคุณ
            </p>
            <div className="hero-buttons">
              <a className="button button-red" href="#products">
                ค้นพบผลิตภัณฑ์ <ArrowRight size={17} />
              </a>
              <a className="text-link" href="#solutions">
                โซลูชันสำหรับธุรกิจ <ChevronRight size={16} />
              </a>
            </div>
            <div className="hero-trust">
              <ShieldCheck size={19} strokeWidth={1.5} />
              <span>ใส่ใจทุกความแม่นยำ ดูแลตลอดการใช้งาน</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-orbit" aria-hidden="true" />
            <div className="hero-product-label">
              <span className="status-dot" /> ENGINEERED FOR YOUR EVERYDAY
            </div>
            {product && (
              <div key={product.id} className={`hero-product hero-product-${product.id}`}>
                <Image
                  src={product.image}
                  alt={`เครื่องชั่ง SUNFORD ${product.name}`}
                  width={690}
                  height={490}
                  preload={active === 0}
                  className="hero-product-image"
                />
              </div>
            )}
            <div className="product-pedestal" aria-hidden="true" />
            {product && (
              <Link href={`/products/${product.slug}`} className="hero-model">
                <div>
                  <span>PROFESSIONAL SCALE</span>
                  <strong>SUNFORD {product.name}</strong>
                </div>
                <span className="circle-arrow">
                  <ArrowRight size={18} />
                </span>
              </Link>
            )}
          </div>
        </div>
        <div className="container hero-bottom">
          <a href="#products" className="scroll-cue">
            <ArrowDown size={14} /> เลื่อนเพื่อค้นพบสิ่งที่ใช่
          </a>
          <div className="slide-controls" aria-label="เลือกสินค้าแนะนำ">
            <span className="slide-number">
              0{active + 1}
              <span> / 0{slides.length}</span>
            </span>
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
              aria-label="สินค้าก่อนหน้า"
              disabled={!slides.length}
              onClick={() => setActive((active + slides.length - 1) % slides.length)}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              className="icon-button"
              aria-label="สินค้าถัดไป"
              disabled={!slides.length}
              onClick={() => setActive((active + 1) % slides.length)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
