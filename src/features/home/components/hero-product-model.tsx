"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ModelViewerElement } from "@google/model-viewer";
import { Pause, Play } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";

export function HeroProductModel({
  src,
  poster,
  name,
  featured = false,
  active = true,
  enabled = true,
  slot = 0,
  onSelect,
  onSettled,
  spinning = true,
  onInspect,
  motionSession = 0,
}: {
  src: string;
  poster: string;
  name: string;
  featured?: boolean;
  active?: boolean;
  enabled?: boolean;
  slot?: number;
  onSelect?: (keyboard?: boolean) => void;
  onSettled?: () => void;
  spinning?: boolean;
  onInspect?: () => void;
  motionSession?: number;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const viewer = useRef<ModelViewerElement>(null);
  const cameraFrame = useRef(0);
  const settledCallback = useRef(onSettled);
  const inspectCallback = useRef(onInspect);
  const hintId = useId();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [allowMotion, setAllowMotion] = useState(false);
  const [manualMotion, setManualMotion] = useState<number | null>(null);
  const moving =
    (spinning || (active && manualMotion === motionSession)) &&
    status === "ready" &&
    visible &&
    !hidden &&
    allowMotion;

  useEffect(() => {
    settledCallback.current = onSettled;
    inspectCallback.current = onInspect;
  }, [onSettled, onInspect]);

  useEffect(() => {
    const element = viewer.current;
    const container = stage.current;
    if (!element || !container || !enabled) return;
    let disposed = false;
    let notified = false;
    const settled = () => {
      if (notified) return;
      notified = true;
      settledCallback.current?.();
    };
    const loaded = () => {
      if (!disposed) {
        setStatus("ready");
        settled();
      }
    };
    const failed = () => {
      if (!disposed) {
        setStatus("error");
        settled();
      }
    };
    const interaction = (event: Event) => {
      if ((event as CustomEvent<{ source: string }>).detail.source === "user-interaction") {
        setManualMotion(null);
        inspectCallback.current?.();
      }
    };
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preferenceChanged = () => setAllowMotion(!preference.matches);
    const visibilityChanged = () => setHidden(document.hidden);
    const blur = () => setHidden(true);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(container);
    preferenceChanged();
    visibilityChanged();
    preference.addEventListener("change", preferenceChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    window.addEventListener("blur", blur);
    window.addEventListener("focus", visibilityChanged);
    element.addEventListener("load", loaded);
    element.addEventListener("error", failed);
    element.addEventListener("camera-change", interaction);

    // All viewers share the renderer and parsed-model cache.
    import("@google/model-viewer")
      .then(({ ModelViewerElement }) => {
        // Keep fine labels readable while allowing a modest quality reduction on slower GPUs.
        ModelViewerElement.minimumRenderScale = 0.75;
        ModelViewerElement.modelCacheSize = 3;
        if (element.loaded) loaded();
      })
      .catch(failed);
    return () => {
      disposed = true;
      observer.disconnect();
      preference.removeEventListener("change", preferenceChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", visibilityChanged);
      element.removeEventListener("load", loaded);
      element.removeEventListener("error", failed);
      element.removeEventListener("camera-change", interaction);
    };
  }, [src, enabled]);

  useEffect(() => {
    const element = viewer.current;
    if (!element || !moving) return;
    const start = element.getCameraOrbit();
    let previous = performance.now();
    let elapsed = 0;
    const animate = (now: number) => {
      cameraFrame.current = requestAnimationFrame(animate);
      if (now - previous < 1000 / (active ? 30 : 10)) return;
      elapsed += Math.min((now - previous) / 1000, 0.1);
      previous = now;
      const theta = start.theta + elapsed * ((Math.PI * 2) / 28);
      // Move the camera without React renders, timers, or animated text.
      element.cameraOrbit = `${theta}rad ${start.phi}rad ${start.radius}m`;
    };
    cameraFrame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(cameraFrame.current);
  }, [moving, active]);

  return (
    <>
      <div
        className={`hero-model-card ${active ? `hero-model-stage${featured ? " hero-model-stage--featured" : ""}` : "hero-model-preview"}`}
        ref={stage}
        data-hero-model={src}
        data-slot={slot}
        data-status={status}
        data-moving={moving}
        onPointerDownCapture={() => {
          if (!active) return;
          cancelAnimationFrame(cameraFrame.current);
          setManualMotion(null);
          onInspect?.();
        }}
      >
        {enabled && status !== "error" && (
          <model-viewer
            ref={viewer}
            src={src}
            alt={`โมเดล 3 มิติ SUNFORD ${name}`}
            aria-hidden={!active}
            tabIndex={active ? 0 : -1}
            camera-controls={active ? "" : undefined}
            disable-pan=""
            disable-zoom=""
            disable-tap=""
            touch-action="pan-y"
            camera-orbit={featured ? "-10deg 66deg 85%" : "-25deg 65deg 90%"}
            min-camera-orbit="auto 20deg 85%"
            max-camera-orbit="auto 85deg 150%"
            field-of-view="30deg"
            interpolation-decay="40"
            environment-image="neutral"
            tone-mapping="neutral"
            shadow-intensity={active ? "0.6" : "0"}
            shadow-softness="1"
            interaction-prompt="none"
            aria-describedby={active ? hintId : undefined}
            loading="eager"
            exposure={featured ? "0.9" : "1.1"}
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
              preload={featured}
              sizes="(max-width: 800px) 90vw, 55vw"
            />
          </div>
        )}
        {active ? (
          <span className="hero-model-hint" id={hintId}>
            {status === "ready" ? "3D · ลากเพื่อหมุน" : status === "loading" ? "กำลังโหลด 3D…" : ""}
          </span>
        ) : (
          <button
            className="hero-model-preview-select"
            type="button"
            aria-label={`แสดงโมเดล ${name} เป็นตัวหลัก`}
            onClick={(event) => onSelect?.(event.detail === 0)}
          />
        )}
      </div>
      {active && status === "ready" && (
        <button
          type="button"
          className="hero-motion-toggle"
          aria-label={moving ? "หยุดมุมกล้องอัตโนมัติ" : "เล่นมุมกล้องอัตโนมัติ"}
          onClick={() => {
            onInspect?.();
            if (moving) setManualMotion(null);
            else {
              setAllowMotion(true);
              setManualMotion(motionSession);
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
