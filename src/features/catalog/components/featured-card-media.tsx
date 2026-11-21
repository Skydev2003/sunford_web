"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function FeaturedCardMedia({
  src,
  openingPoster,
  restorePosterOnEnd = false,
  replayOnHover = false,
  children,
}: {
  src: string;
  openingPoster?: { srcSet: string; sizes?: string };
  restorePosterOnEnd?: boolean;
  replayOnHover?: boolean;
  children: ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pictureRef = useRef<HTMLPictureElement>(null);
  const [prepareFinalPoster, setPrepareFinalPoster] = useState(false);
  const [openingUnavailable, setOpeningUnavailable] = useState(false);

  useEffect(() => {
    if (!openingPoster) return;
    const picture = pictureRef.current;
    const image = picture?.querySelector("img");
    if (!image || !picture) return;

    const switchToFinalPoster = () => {
      const source = picture.querySelector("source");
      if (source && matchMedia(source.media).matches) setOpeningUnavailable(true);
    };
    image.addEventListener("error", switchToFinalPoster);
    // The browser can reject an opening poster before the image's event handler is ready.
    if (image.currentSrc && image.complete && !image.naturalWidth)
      queueMicrotask(() => {
        if (image.isConnected && image.complete && !image.naturalWidth) switchToFinalPoster();
      });
    return () => image.removeEventListener("error", switchToFinalPoster);
  }, [openingPoster]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !("IntersectionObserver" in window)) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const hoverTarget = replayOnHover ? video.closest("a") : null;
    let visible = false;
    const play = () => {
      if (!video.hasAttribute("src")) video.src = src;
      void video.play().catch((error: DOMException) => {
        if (error.name === "NotAllowedError") {
          delete video.dataset.started;
          setOpeningUnavailable(true);
        }
      });
    };
    const syncPlayback = () => {
      if (!visible || document.hidden || reducedMotion.matches) {
        video.pause();
      } else if (!video.ended && !video.error) {
        play();
      }
    };
    const replayOnMouseEntry = (event: PointerEvent) => {
      if (
        event.pointerType === "mouse" &&
        video.ended &&
        !document.hidden &&
        !reducedMotion.matches
      ) {
        play();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible = entry.intersectionRatio >= 0.5 || (visible && entry.intersectionRatio > 0);
        }
        syncPlayback();
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(video.closest("li") ?? video);
    hoverTarget?.addEventListener("pointerenter", replayOnMouseEntry);
    reducedMotion.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      observer.disconnect();
      hoverTarget?.removeEventListener("pointerenter", replayOnMouseEntry);
      reducedMotion.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, [src, replayOnHover]);

  return (
    <>
      <picture ref={pictureRef}>
        {openingPoster && !openingUnavailable && !prepareFinalPoster && (
          <source
            media="(prefers-reduced-motion: no-preference) and (scripting: enabled)"
            srcSet={openingPoster.srcSet}
            sizes={openingPoster.sizes}
          />
        )}
        {children}
      </picture>
      <video
        ref={videoRef}
        aria-hidden="true"
        muted
        playsInline
        preload="none"
        onPlaying={(event) => {
          event.currentTarget.dataset.started = "";
          if (restorePosterOnEnd && openingPoster) setPrepareFinalPoster(true);
        }}
        onEnded={async (event) => {
          if (!restorePosterOnEnd) return;
          const video = event.currentTarget;
          if (openingPoster) {
            const poster = pictureRef.current?.querySelector("img");
            if (!poster) return;
            try {
              await poster.decode();
            } catch {
              return; // Keep the last video frame visible if the still fails to load.
            }
          }
          if (video.ended) delete video.dataset.started;
        }}
        onError={(event) => {
          delete event.currentTarget.dataset.started;
          setOpeningUnavailable(true);
        }}
      />
    </>
  );
}
