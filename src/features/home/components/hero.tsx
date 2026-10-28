"use client";
import { Tooltip } from "@/components/ui/tooltip";
import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import { ProductImage } from "@/components/ui/product-image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { Product } from "@/features/catalog/types";
import { defaultHero } from "@/features/cms/data/settings";
import type { HeroSettings } from "@/features/cms/types";
import { HeroStudio } from "./hero-studio";
import { createOrbitFrames, orbitCenter, rotateModelOrder, type OrbitPose } from "./hero-orbit";

const HeroProductModel = dynamic(
  () => import("./hero-product-model").then((module) => module.HeroProductModel),
  { ssr: false },
);

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

const heroModels: Record<string, string> = {
  "acs30-jc21": "/models/acs30-jc21.glb",
  wps10ks: "/models/wps10ks.glb",
  feh5ks: "/models/feh5ks.glb",
};

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
        model: product && !slide.image ? heroModels[product.id] : undefined,
      },
    ];
  });
  const activeIndex = slides.length ? active % slides.length : 0;
  const product = slides[activeIndex];
  const [modelOrder, setModelOrder] = useState(() => slides.map((slide) => slide.id));
  const [enabledModels, setEnabledModels] = useState<string[]>(() =>
    slides
      .filter((slide) => slide.model)
      .slice(0, 1)
      .map((slide) => slide.id),
  );
  const previousPoses = useRef(new Map<string, OrbitPose>());
  const orbitSteps = useRef(0);
  const swaps = useRef<Animation[]>([]);
  const orbitCleanups = useRef<Array<() => void>>([]);
  const focusMain = useRef(false);
  const [settledModels, setSettledModels] = useState<string[]>([]);
  const [cycleEnabled, setCycleEnabled] = useState(true);
  const [cycleAllowed, setCycleAllowed] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [motionSession, setMotionSession] = useState(0);
  const cycleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userPinned = useRef(false);
  const modelsSettled = slides
    .filter((slide) => slide.model)
    .every((slide) => settledModels.includes(slide.id));
  const spinning = cycleEnabled && cycleAllowed && modelsSettled;
  const cycling = spinning && !focusPaused && slides.length > 1;
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
      setMotionSession((current) => current + 1);
    }
    if (!slides.length) return;
    const next = (index + slides.length) % slides.length;
    if (next === activeIndex) return;
    previousPoses.current.clear();
    sceneRef.current?.querySelectorAll<HTMLElement>("[data-hero-model]").forEach((element) => {
      const surface = element.querySelector("model-viewer, .hero-model-fallback");
      previousPoses.current.set(element.dataset.heroModel!, {
        box: element.getBoundingClientRect(),
        slot: Number(element.dataset.slot),
        opacity: surface ? Number(getComputedStyle(surface).opacity) : 1,
      });
    });
    swaps.current.forEach((animation) => animation.cancel());
    orbitCleanups.current.forEach((cleanup) => cleanup());
    orbitCleanups.current = [];
    const orbit = rotateModelOrder(modelOrder, slides[next].id, automatic);
    orbitSteps.current = orbit.steps;
    setModelOrder(orbit.order);
    if (slides[next].model)
      setEnabledModels((current) =>
        current.includes(slides[next].id) ? current : [...current, slides[next].id],
      );
    setActive(next);
  };
  const advanceCycle = useEffectEvent(() => {
    const next = slides.findIndex((slide) => slide.id === modelOrder[1]);
    if (!userPinned.current && next >= 0) selectSlide(next, true);
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
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        sync();
      },
      { threshold: 0.35 },
    );
    observer.observe(scene);
    document.addEventListener("visibilitychange", sync);
    preference.addEventListener("change", sync);
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    return () => {
      observer.disconnect();
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
  useLayoutEffect(() => {
    if (focusMain.current) {
      sceneRef.current
        ?.querySelector<HTMLElement>(".hero-model-stage model-viewer")
        ?.focus({ preventScroll: true });
      focusMain.current = false;
    }
    if (!previousPoses.current.size) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      swaps.current = [];
      const cards = Array.from(
        sceneRef.current?.querySelectorAll<HTMLElement>("[data-hero-model]") ?? [],
      );
      const oldSeats = [0, 1, 2].map((slot) =>
        Array.from(previousPoses.current.values()).find((pose) => pose.slot === slot),
      );
      const canOrbit = modelOrder.length === 3 && oldSeats.every(Boolean);
      const newFront = cards.find((element) => element.dataset.slot === "0");
      const seats = oldSeats.map((pose) => (pose ? orbitCenter(pose.box) : { x: 0, y: 0 }));
      if (canOrbit && newFront) {
        const front = orbitCenter(newFront.getBoundingClientRect());
        seats[0] = { x: (seats[0].x + front.x) / 2, y: (seats[0].y + front.y) / 2 };
      }
      sceneRef.current?.querySelectorAll<HTMLElement>("[data-hero-model]").forEach((element) => {
        const pose = previousPoses.current.get(element.dataset.heroModel!);
        const before = pose?.box;
        const after = element.getBoundingClientRect();
        if (!pose || !before || !after.width || !after.height) return;
        const surface = element.querySelector<HTMLElement>("model-viewer, .hero-model-fallback");
        if (canOrbit && orbitSteps.current) {
          const opacity =
            element.dataset.slot === "0"
              ? 1
              : element.matches(":hover, :focus-within")
                ? 0.95
                : 0.5;
          let renderBox = after;
          let restore = () => {};
          if (pose.slot === 0 && element.dataset.slot !== "0") {
            // Keep the outgoing model sharp while its cached surface shrinks around the circle.
            const savedStyle = element.style.cssText;
            const parentBox = element.offsetParent?.getBoundingClientRect();
            if (parentBox) {
              element.style.width = `${before.width}px`;
              element.style.height = `${before.height}px`;
              element.style.left = `${after.x - parentBox.x}px`;
              element.style.top = `${after.y - parentBox.y}px`;
              element.style.right = "auto";
              element.style.bottom = "auto";
              renderBox = element.getBoundingClientRect();
              let restored = false;
              restore = () => {
                if (restored) return;
                restored = true;
                element.style.cssText = savedStyle;
              };
              orbitCleanups.current.push(restore);
            }
          }
          const frames = createOrbitFrames(
            pose,
            { box: after, slot: Number(element.dataset.slot), opacity },
            seats,
            orbitSteps.current,
            renderBox,
          );
          const options = { duration: 1600, easing: "cubic-bezier(.4,0,.2,1)" };
          const movement = element.animate(frames.layout, { ...options, fill: "both" });
          swaps.current.push(movement);
          movement.finished
            .then(() => {
              restore();
              movement.cancel();
            })
            .catch(restore);
          if (surface) swaps.current.push(surface.animate(frames.surface, options));
          const hint = element.querySelector(".hero-model-hint");
          if (hint)
            swaps.current.push(
              hint.animate(
                [
                  { opacity: 0, offset: 0 },
                  { opacity: 0, offset: 0.75 },
                  { opacity: 1, offset: 1 },
                ],
                options,
              ),
            );
          return;
        }
        if (
          Math.abs(before.x - after.x) +
            Math.abs(before.y - after.y) +
            Math.abs(before.width - after.width) +
            Math.abs(before.height - after.height) <
          0.5
        )
          return;
        const scale = Math.min(before.width / after.width, before.height / after.height);
        const dx = before.x + before.width / 2 - after.x - (after.width * scale) / 2;
        const dy = before.y + before.height / 2 - after.y - (after.height * scale) / 2;
        // Resize the WebGL surface once; animate only its cached compositor transform.
        swaps.current.push(
          element.animate(
            [
              {
                transform: `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`,
              },
              { transform: "none" },
            ],
            { duration: 650, easing: "cubic-bezier(.22,1,.36,1)" },
          ),
        );
      });
    }
    previousPoses.current.clear();
  }, [activeIndex, modelOrder]);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cancel = () => {
      if (preference.matches) {
        swaps.current.forEach((animation) => animation.cancel());
        orbitCleanups.current.forEach((cleanup) => cleanup());
      }
    };
    preference.addEventListener("change", cancel);
    return () => {
      preference.removeEventListener("change", cancel);
      swaps.current.forEach((animation) => animation.cancel());
      orbitCleanups.current.forEach((cleanup) => cleanup());
    };
  }, []);
  const brandedTitle = product?.title.startsWith("SUNFORD ");
  return (
    <>
      {showAnnouncement && <HeroAnnouncement settings={settings} />}
      <section
        ref={sceneRef}
        className={`hero hero-cinematic${showAnnouncement ? "" : " hero-no-announcement"}`}
        aria-label="Sunford ความแม่นยำที่เรียบง่ายกว่า"
        data-cycling={cycling}
        data-cycle-mode={cycleEnabled ? "auto" : "pinned"}
        onFocusCapture={(event) =>
          setFocusPaused(!(event.target as Element).closest("[data-cycle-toggle]"))
        }
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setFocusPaused(false);
        }}
      >
        <HeroStudio sceneRef={sceneRef} />
        <span className="hero-scene-wordmark" aria-hidden="true">
          PRECISION
        </span>
        <div className="container hero-main">
          <div className="hero-copy">
            <p className="hero-scene-eyebrow">
              <span /> PRECISION, IN EVERY DETAIL
            </p>
            <h1
              className="hero-model"
              aria-live={cycleEnabled ? "off" : "polite"}
              aria-atomic="true"
            >
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
          {slides
            .filter((slide) => slide.model)
            .map((slide) => (
              <HeroProductModel
                key={slide.id}
                src={slide.model!}
                poster={slide.image}
                name={slide.name}
                featured={slide.model === heroModels["acs30-jc21"]}
                active={slide.id === product?.id}
                enabled={enabledModels.includes(slide.id)}
                slot={Math.max(0, modelOrder.indexOf(slide.id))}
                spinning={spinning}
                motionSession={motionSession}
                onInspect={pinProduct}
                onSelect={(keyboard) => {
                  focusMain.current = Boolean(keyboard);
                  selectSlide(slides.indexOf(slide));
                }}
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
                      setMotionSession((current) => current + 1);
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
