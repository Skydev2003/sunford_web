"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Pause, Play } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";

export function HeroProductVideo({
  src,
  poster,
  name,
  sceneRef,
}: {
  src: string;
  poster: string;
  name: string;
  sceneRef?: RefObject<HTMLElement | null>;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const userStarted = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element || failed) return;
    // A failed metadata request may finish before React hydrates the video.
    if (element.error) {
      setFailed(true);
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const syncPlayback = () => {
      if (
        visible &&
        !document.hidden &&
        !userPaused.current &&
        (!reduceMotion.matches || userStarted.current)
      ) {
        element.play().catch(() => {
          /* A play button remains available if autoplay is blocked. */
        });
      } else {
        element.pause();
      }
    };
    const preferenceChanged = () => {
      userStarted.current = false;
      syncPlayback();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", syncPlayback);
    reduceMotion.addEventListener("change", preferenceChanged);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      reduceMotion.removeEventListener("change", preferenceChanged);
      element.pause();
    };
  }, [src, failed]);

  useEffect(() => {
    const element = video.current;
    const scene = sceneRef?.current;
    if (!element || !scene || failed) return;
    const updateProgress = () => {
      const progress =
        Number.isFinite(element.duration) && element.duration > 0
          ? (element.currentTime % element.duration) / element.duration
          : 0;
      scene.style.setProperty("--hero-progress", String(progress));
    };
    // Only the small progress rail follows playback; the text stays stationary.
    element.addEventListener("timeupdate", updateProgress);
    element.addEventListener("seeked", updateProgress);
    element.addEventListener("loadedmetadata", updateProgress);
    updateProgress();
    return () => {
      element.removeEventListener("timeupdate", updateProgress);
      element.removeEventListener("seeked", updateProgress);
      element.removeEventListener("loadedmetadata", updateProgress);
      scene.style.removeProperty("--hero-progress");
    };
  }, [src, failed, sceneRef]);

  const togglePlayback = () => {
    const element = video.current;
    if (!element) return;
    if (element.paused) {
      userPaused.current = false;
      userStarted.current = true;
      element.play().catch(() => {
        /* Keep the poster visible if playback is unavailable. */
      });
    } else {
      userPaused.current = true;
      element.pause();
    }
  };

  return (
    <>
      <div className="hero-motion">
        {failed ? (
          <ProductImage
            src={poster}
            alt={`เครื่องชั่ง SUNFORD ${name}`}
            width={1280}
            height={720}
            className="hero-motion-fallback"
            preload
          />
        ) : (
          <video
            ref={video}
            className="hero-product-video"
            src={src}
            poster={poster}
            width={1280}
            height={720}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={`แอนิเมชันสินค้า ${name}`}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      {!failed && (
        <button
          type="button"
          className="hero-motion-toggle"
          onClick={togglePlayback}
          aria-label={playing ? "หยุดแอนิเมชันสินค้า" : "เล่นแอนิเมชันสินค้า"}
        >
          {playing ? (
            <Pause size={12} fill="currentColor" />
          ) : (
            <Play size={12} fill="currentColor" />
          )}
        </button>
      )}
    </>
  );
}
