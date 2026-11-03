"use client";

import { useState } from "react";
import { ArrowUpRight, Play, X } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { DragScroll } from "@/components/ui/drag-scroll";
import type { ProductUsageVideo } from "../data/product-usage-videos";
import styles from "./product-usage-videos.module.css";

export function ProductUsageVideos({
  videos,
  productName,
  channelUrl,
}: {
  videos: ProductUsageVideo[];
  productName: string;
  channelUrl: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  if (!videos.length) {
    return (
      <div className={styles.channelLink} data-product-videos data-video-count={0}>
        <span>วิดีโอแนะนำและการใช้งาน</span>
        <a href={channelUrl} target="_blank" rel="noopener noreferrer">
          ดูวิดีโอจาก Sunfordthai <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
    );
  }
  return (
    <section
      className={styles.section}
      aria-label={`วิดีโอการใช้งาน ${productName}`}
      data-product-videos
      data-video-count={videos.length}
    >
      <div className={styles.heading}>
        <h3>วิดีโอแนะนำและการใช้งาน</h3>
        <a href={channelUrl} target="_blank" rel="noopener noreferrer">
          Sunfordthai <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
      <DragScroll className={styles.track} label={`เลือกวิดีโอ ${productName}`}>
        {videos.map((video) => (
          <div className={styles.card} key={video.id} data-video-id={video.id}>
            <div className={styles.media}>
              {active === video.id ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
                  title={video.title}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <button
                  type="button"
                  className={styles.poster}
                  onClick={() => setActive(video.id)}
                  aria-label={`เล่นวิดีโอ ${video.title}`}
                  data-short={video.kind === "short"}
                >
                  <ProductImage
                    src={video.image}
                    alt=""
                    fill
                    sizes="(max-width: 720px) 85vw, 440px"
                  />
                  <span className={styles.play}>
                    <Play size={21} fill="currentColor" aria-hidden="true" />
                  </span>
                  {video.duration != null && (
                    <span className={styles.duration}>
                      {Math.floor(video.duration / 60)}:
                      {String(video.duration % 60).padStart(2, "0")}
                    </span>
                  )}
                </button>
              )}
            </div>
            <strong className={styles.title}>{video.title}</strong>
            {video.note && <p className={styles.note}>{video.note}</p>}
            <div className={styles.actions}>
              <a href={video.url} target="_blank" rel="noopener noreferrer">
                ดูบน YouTube <ArrowUpRight size={14} aria-hidden="true" />
              </a>
              {active === video.id && (
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  aria-label={`ปิดวิดีโอ ${video.title}`}
                >
                  <X size={14} aria-hidden="true" /> ปิดวิดีโอ
                </button>
              )}
            </div>
          </div>
        ))}
      </DragScroll>
    </section>
  );
}
