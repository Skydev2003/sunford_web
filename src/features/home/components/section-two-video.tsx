"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import styles from "./section-two-video.module.css";

const title = "แข็งแรงทนทาน ใช้งานง่าย มีประสิทธิภาพ";
const videoTitle = `${title} | SUNFORD Biz Talk EP.16`;

export function SectionTwoVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <section
      id="sunford-biz-talk"
      className={styles.section}
      data-home-section="2"
      aria-labelledby="section-two-title"
    >
      <div className={styles.inner}>
        <h2 id="section-two-title">
          <span className={styles.phrase}>แข็งแรงทนทาน</span>{" "}
          <span className={`${styles.phrase} ${styles.silver}`}>ใช้งานง่าย</span>{" "}
          <span className={`${styles.phrase} ${styles.accent}`}>มีประสิทธิภาพ</span>
        </h2>
        <div className={styles.media}>
          {playing ? (
            <iframe
              src="https://www.youtube-nocookie.com/embed/szRD6aOQL_Y?autoplay=1&rel=0"
              title={videoTitle}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <button
              type="button"
              className={styles.poster}
              aria-label={`เล่นวิดีโอ ${videoTitle}`}
              onClick={() => setPlaying(true)}
            >
              <ProductImage
                src="https://i.ytimg.com/vi/szRD6aOQL_Y/maxresdefault.jpg"
                alt=""
                fill
                unoptimized
                sizes="(max-width: 1056px) 100vw, 1000px"
              />
              <span className={styles.play} aria-hidden="true">
                <Play size={26} fill="currentColor" />
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
