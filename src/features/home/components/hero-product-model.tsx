"use client";

import { useEffect, useRef, useState } from "react";
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
  onSettled?: () => void;
  spinning?: boolean;
  onInspect?: () => void;
  motionSession?: number;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const viewer = useRef<ModelViewerElement>(null);
  const settledCallback = useRef(onSettled);
  const inspectCallback = useRef(onInspect);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [allowMotion, setAllowMotion] = useState(false);
  const [manualMotion, setManualMotion] = useState<number | null>(null);
  const moving =
    active &&
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
        // Let the renderer adapt during motion on slower GPUs; it restores full
        // resolution when motion stops, so product labels remain readable.
        ModelViewerElement.minimumRenderScale = 0.5;
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

  return (
    <>
      <div
        className={`hero-model-card ${active ? `hero-model-stage${featured ? " hero-model-stage--featured" : ""}` : "hero-model-standby"}`}
        ref={stage}
        data-hero-model={src}
        data-slot={slot}
        data-status={status}
        data-moving={moving}
        aria-hidden={!active}
        onPointerDownCapture={() => {
          if (!active) return;
          if (viewer.current) viewer.current.autoRotate = false;
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
            auto-rotate={moving ? "" : undefined}
            auto-rotate-delay="0"
            rotation-per-second="-6.428571deg"
            disable-pan=""
            disable-zoom=""
            disable-tap=""
            touch-action="pan-y"
            camera-orbit={featured ? "0deg 66deg 85%" : "0deg 66deg 90%"}
            min-camera-orbit="auto 20deg 85%"
            max-camera-orbit="auto 85deg 150%"
            field-of-view="30deg"
            interpolation-decay="40"
            environment-image="neutral"
            tone-mapping="neutral"
            shadow-intensity={active ? "0.85" : "0"}
            shadow-softness="0.8"
            interaction-prompt="none"
            loading="eager"
            exposure={featured ? "0.9" : "1"}
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
