"use client";
import { Tooltip } from "@/components/ui/tooltip";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { ProductImage } from "@/components/ui/product-image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowDown, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { HeroSettings } from "@/features/cms/types";
import { HeroStudio } from "./hero-studio";
import { HeroProductRibbon } from "./hero-product-ribbon";
import { HeroBubbles } from "./hero-bubbles";
import { companyIntro } from "../data/brand";
import type { HeroSlide } from "../data/hero-slides";

const HeroProductModel = dynamic(
  () => import("./hero-product-model").then((module) => module.HeroProductModel),
  { ssr: false },
);

export function HeroAnnouncement({ settings }: { settings: Omit<HeroSettings, "slides"> }) {
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
  slides,
  settings,
  showAnnouncement = true,
}: {
  slides: HeroSlide[];
  settings: Omit<HeroSettings, "slides">;
  showAnnouncement?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [highlightRevision, setHighlightRevision] = useState(0);
  const sceneRef = useRef<HTMLElement>(null);
  const activeIndex = slides.length ? active % slides.length : 0;
  const product = slides[activeIndex];
  const [enabledModels, setEnabledModels] = useState<string[]>(() =>
    slides
      .filter((slide) => slide.model)
      .slice(0, 1)
      .map((slide) => slide.id),
  );
  const [settledModels, setSettledModels] = useState<string[]>([]);
  const [cycleEnabled, setCycleEnabled] = useState(true);
  const [cycleAllowed, setCycleAllowed] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [draggingProduct, setDraggingProduct] = useState(false);
  const cycleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userPinned = useRef(false);
  const modelsSettled = slides
    .filter((slide) => slide.model)
    .every((slide) => settledModels.includes(slide.id));
  const spinning = !motionPaused && cycleAllowed && modelsSettled && !draggingProduct;
  const cycling = spinning && cycleEnabled && !focusPaused && slides.length > 1;
  const pinProduct = () => {
    userPinned.current = true;
    if (cycleTimer.current) clearTimeout(cycleTimer.current);
    cycleTimer.current = null;
    setCycleEnabled(false);
  };
  const warmNextModel = () =>
    setEnabledModels((current) => {
      const next = slides.find((slide) => slide.model && !current.includes(slide.id));
      return next ? [...current, next.id] : current;
    });
  const selectSlide = (index: number, automatic = false) => {
    if (!automatic) {
      pinProduct();
    }
    if (!slides.length) return;
    setHighlightRevision((revision) => revision + 1);
    const next = (index + slides.length) % slides.length;
    if (next === activeIndex) return;
    if (slides[next].model)
      setEnabledModels((current) =>
        current.includes(slides[next].id) ? current : [...current, slides[next].id],
      );
    setActive(next);
  };
  const advanceCycle = useEffectEvent(() => {
    if (!userPinned.current) selectSlide(activeIndex + 1, true);
  });
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let focused = true;
    const sync = () =>
      setCycleAllowed(visible && focused && !document.hidden && !preference.matches);
    const blur = () => {
      focused = false;
      sync();
    };
    const focus = () => {
      focused = true;
      sync();
    };
    const productDrag = (event: Event) =>
      setDraggingProduct(Boolean((event as CustomEvent<boolean>).detail));
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        sync();
      },
      { threshold: 0.35 },
    );
    observer.observe(scene);
    scene.addEventListener("hero-product-drag", productDrag);
    document.addEventListener("visibilitychange", sync);
    preference.addEventListener("change", sync);
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    return () => {
      observer.disconnect();
      scene.removeEventListener("hero-product-drag", productDrag);
      document.removeEventListener("visibilitychange", sync);
      preference.removeEventListener("change", sync);
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
    };
  }, []);
  useEffect(() => {
    if (!cycling) return;
    cycleTimer.current = setTimeout(() => advanceCycle(), 7000);
    return () => {
      if (cycleTimer.current) clearTimeout(cycleTimer.current);
      cycleTimer.current = null;
    };
  }, [cycling, activeIndex]);
  const intro = companyIntro;
  return (
    <>
      {showAnnouncement && <HeroAnnouncement settings={settings} />}
      <section
        ref={sceneRef}
        className={`hero hero-cinematic hero-showroom${showAnnouncement ? "" : " hero-no-announcement"}${product?.highlights ? " hero-has-highlights" : ""}`}
        aria-label="Sunford ความแม่นยำที่เรียบง่ายกว่า"
        data-active-product={product?.name}
        data-cycling={cycling}
        data-cycle-mode={cycleEnabled ? "auto" : "pinned"}
        onFocusCapture={(event) =>
          setFocusPaused(
            !(event.target as Element).closest("[data-cycle-toggle], [data-hero-motion-toggle]"),
          )
        }
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setFocusPaused(false);
        }}
      >
        <HeroStudio sceneRef={sceneRef} paused={motionPaused || !cycleAllowed} />
        <div className="container hero-main">
          <div className="hero-copy">
            <h1 className="hero-model">{intro.title}</h1>
            <p className="hero-tagline">{intro.tagline}</p>
            <p className="hero-description">{intro.description}</p>
          </div>
          {product?.highlights && <p className="hero-product-name">{product.name}</p>}
          <HeroBubbles
            key={`${product?.id}-${highlightRevision}`}
            highlights={product?.highlights}
            name={product?.name ?? "SUNFORD"}
            paused={motionPaused}
            sceneRunning={cycleAllowed}
            sceneRef={sceneRef}
            onInteract={pinProduct}
          />
          <div className="hero-model-dropzone" data-hero-dropzone="" aria-hidden="true" />
          {slides
            .filter((slide) => slide.model)
            .map((slide) => (
              <HeroProductModel
                key={slide.id}
                src={slide.model!}
                poster={slide.image}
                name={slide.name}
                featured={slide.model === "/models/acs30-jc21.glb"}
                active={slide.id === product?.id}
                enabled={enabledModels.includes(slide.id)}
                slot={slide.id === product?.id ? 0 : 1}
                spinning={spinning}
                onInspect={pinProduct}
                onSettled={() => {
                  setSettledModels((current) =>
                    current.includes(slide.id) ? current : [...current, slide.id],
                  );
                  warmNextModel();
                }}
              />
            ))}
          {!product?.model && product && (
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
          )}
          {slides.length > 0 && (
            <HeroProductRibbon
              products={slides.map((slide) => ({ ...slide, image: slide.ribbonImage }))}
              activeId={product?.id}
              running={cycleAllowed && !motionPaused}
              onSelect={selectSlide}
            />
          )}
          <button
            type="button"
            className="hero-motion-toggle"
            data-hero-motion-toggle=""
            aria-label={motionPaused ? "เล่นการเคลื่อนไหวทั้งหมด" : "หยุดการเคลื่อนไหวทั้งหมด"}
            aria-pressed={motionPaused}
            onClick={() => {
              setMotionPaused(!motionPaused);
            }}
          >
            {motionPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          {slides.length > 1 && (
            <div className="slide-controls" aria-label="เลือกสินค้าแนะนำ">
              <Tooltip>
                <button
                  className="hero-cycle-toggle"
                  type="button"
                  data-cycle-toggle=""
                  aria-label={cycleEnabled ? "หยุดวนสินค้าอัตโนมัติ" : "เล่นวนสินค้าอัตโนมัติ"}
                  aria-pressed={cycleEnabled}
                  onClick={() => {
                    if (cycleEnabled) pinProduct();
                    else {
                      userPinned.current = false;
                      setFocusPaused(false);
                      setCycleEnabled(true);
                    }
                  }}
                >
                  {cycleEnabled ? <Pause size={12} /> : <Play size={12} />}
                  <span>วนอัตโนมัติ</span>
                </button>
              </Tooltip>
              <span className="hero-scene-counter">
                {String(activeIndex + 1).padStart(2, "0")}
                <span> / {String(slides.length).padStart(2, "0")}</span>
              </span>
              <Tooltip>
                <button
                  className="icon-button"
                  aria-label="สินค้าก่อนหน้า"
                  onClick={() => selectSlide(activeIndex - 1)}
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
                    onClick={() => selectSlide(index)}
                  />
                ))}
              </div>
              <Tooltip>
                <button
                  className="icon-button"
                  aria-label="สินค้าถัดไป"
                  onClick={() => selectSlide(activeIndex + 1)}
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
      </section>
    </>
  );
}
