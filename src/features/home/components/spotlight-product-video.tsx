"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const playbackLimitSeconds = 30;

export function SpotlightProductVideo({
  src,
  poster,
  name,
  href,
}: {
  src: string;
  poster: string;
  name: string;
  href?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element || failed) return;
    if (element.error) {
      setFailed(true);
      return;
    }
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let completed = false;
    let playedSeconds = 0;
    let previousTime = element.currentTime;
    const sync = () => {
      if (visible && !document.hidden && !preference.matches && !completed) {
        element.play().catch(() => {
          // Keep the sharp poster visible if the browser blocks autoplay.
        });
      } else element.pause();
    };
    const updatePlayback = () => {
      const currentTime = element.currentTime;
      let elapsed = currentTime - previousTime;
      if (elapsed < 0 && Number.isFinite(element.duration)) elapsed += element.duration;
      previousTime = currentTime;
      playedSeconds += Math.max(0, elapsed);
      if (playedSeconds >= playbackLimitSeconds) {
        completed = true;
        element.pause();
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
    element.addEventListener("timeupdate", updatePlayback);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      element.removeEventListener("timeupdate", updatePlayback);
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      element.pause();
    };
  }, [src, failed]);

  const media = failed ? (
    <Image src={poster} alt={`SUNFORD ${name}`} fill unoptimized />
  ) : (
    <video
      ref={video}
      className="spotlight-product-video"
      src={src}
      poster={poster}
      width={1920}
      height={1080}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={`วิดีโอสินค้า SUNFORD ${name}`}
      onError={() => setFailed(true)}
    />
  );

  return (
    <div className="spotlight-motion">
      {href ? (
        <Link
          href={href}
          className="spotlight-visual spotlight-visual-motion"
          aria-label={`ดูรายละเอียด ${name}`}
        >
          {media}
        </Link>
      ) : (
        <div className="spotlight-visual spotlight-visual-motion">{media}</div>
      )}
    </div>
  );
}
