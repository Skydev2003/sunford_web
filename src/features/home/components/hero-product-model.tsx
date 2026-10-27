"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ModelViewerElement } from "@google/model-viewer";
import { Pause, Play } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";

export function HeroProductModel({
  src,
  poster,
  name,
}: {
  src: string;
  poster: string;
  name: string;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const viewer = useRef<ModelViewerElement>(null);
  const hintId = useId();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [allowMotion, setAllowMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const moving = status === "ready" && visible && !hidden && allowMotion && !paused;

  useEffect(() => {
    const element = viewer.current;
    const container = stage.current;
    if (!element || !container) return;
    let disposed = false;
    const loaded = () => {
      if (!disposed) setStatus("ready");
    };
    const failed = () => {
      if (!disposed) setStatus("error");
    };
    const interaction = (event: Event) => {
      if ((event as CustomEvent<{ source: string }>).detail.source === "user-interaction")
        setPaused(true);
    };
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preferenceChanged = () => setAllowMotion(!preference.matches);
    const visibilityChanged = () => setHidden(document.hidden);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(container);
    preferenceChanged();
    visibilityChanged();
    preference.addEventListener("change", preferenceChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    element.addEventListener("load", loaded);
    element.addEventListener("error", failed);
    element.addEventListener("camera-change", interaction);

    // The viewer library and GLB are only loaded for the selected 3D slide.
    import("@google/model-viewer")
      .then(() => {
        if (element.loaded) loaded();
      })
      .catch(failed);
    return () => {
      disposed = true;
      observer.disconnect();
      preference.removeEventListener("change", preferenceChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
      element.removeEventListener("load", loaded);
      element.removeEventListener("error", failed);
      element.removeEventListener("camera-change", interaction);
    };
  }, [src]);

  useEffect(() => {
    const element = viewer.current;
    if (!element || !moving) return;
    const start = element.getCameraOrbit();
    let frame = 0;
    let previous = performance.now();
    let elapsed = 0;
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      if (now - previous < 1000 / 30) return;
      elapsed += Math.min((now - previous) / 1000, 0.1);
      previous = now;
      const theta = start.theta + Math.sin(elapsed * 0.18) * 0.6;
      const phi = Math.max(0.35, Math.min(1.45, start.phi + Math.sin(elapsed * 0.15) * 0.075));
      const radius = start.radius * (1 + (1 - Math.cos(elapsed * 0.2)) * 0.035);
      // Move the camera without React renders, timers, or animated text.
      element.cameraOrbit = `${theta}rad ${phi}rad ${radius}m`;
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [moving]);

  return (
    <>
      <div
        className="hero-model-stage"
        ref={stage}
        data-status={status}
        data-moving={moving}
        onPointerDownCapture={() => setPaused(true)}
      >
        {status !== "error" && (
          <model-viewer
            ref={viewer}
            src={src}
            alt={`โมเดล 3 มิติ SUNFORD ${name}`}
            camera-controls=""
            disable-pan=""
            disable-zoom=""
            disable-tap=""
            touch-action="pan-y"
            camera-orbit="-25deg 65deg 90%"
            min-camera-orbit="auto 20deg 85%"
            max-camera-orbit="auto 85deg 150%"
            field-of-view="30deg"
            interpolation-decay="100"
            environment-image="neutral"
            tone-mapping="neutral"
            shadow-intensity="0.6"
            shadow-softness="1"
            interaction-prompt="none"
            aria-describedby={hintId}
            loading="eager"
            exposure="1.1"
          >
            <span slot="pan-target" aria-hidden="true" style={{ display: "none" }} />
          </model-viewer>
        )}
        {status !== "ready" && (
          <div className="hero-model-fallback">
            <ProductImage
              src={poster}
              alt={`เครื่องชั่ง SUNFORD ${name}`}
              fill
              sizes="(max-width: 800px) 90vw, 55vw"
            />
          </div>
        )}
        <span className="hero-model-hint" id={hintId}>
          {status === "ready" ? "3D · ลากเพื่อหมุน" : status === "loading" ? "กำลังโหลด 3D…" : ""}
        </span>
      </div>
      {status === "ready" && (
        <button
          type="button"
          className="hero-motion-toggle"
          aria-label={moving ? "หยุดมุมกล้องอัตโนมัติ" : "เล่นมุมกล้องอัตโนมัติ"}
          onClick={() => {
            if (moving) setPaused(true);
            else {
              setAllowMotion(true);
              setPaused(false);
            }
          }}
        >
          {moving ? (
            <Pause size={12} fill="currentColor" />
          ) : (
            <Play size={12} fill="currentColor" />
          )}
        </button>
      )}
    </>
  );
}
