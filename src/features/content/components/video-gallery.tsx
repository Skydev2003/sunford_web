"use client";
import { useState } from "react";
import { Play } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ProductImage } from "@/components/ui/product-image";
import { DragScroll } from "@/components/ui/drag-scroll";
import { FocusDragScroll } from "@/components/ui/focus-drag-scroll";
import focusStyles from "./video-focus.module.css";

export function VideoGallery({
  videos,
  title = "วิดีโอ Sunford",
  focusCarousel = false,
  openInYoutube = false,
}: {
  videos: { id: string; image: string; title?: string }[];
  title?: string;
  focusCarousel?: boolean;
  openInYoutube?: boolean;
}) {
  const [active, setActive] = useState<string | null>(null);
  if (!videos.length) return null;
  const Track = focusCarousel ? FocusDragScroll : DragScroll;
  const Card = openInYoutube ? "a" : "button";
  return (
    <section
      className={`video-gallery ${focusCarousel ? focusStyles.section : "container"}`}
      aria-label={title}
    >
      <div className={`section-heading ${focusCarousel ? focusStyles.heading : ""}`}>
        <div>
          <p className="eyebrow">WATCH & DISCOVER</p>
          <h2>{title}</h2>
        </div>
      </div>
      <Track className={`video-track ${focusCarousel ? focusStyles.track : ""}`} label={title}>
        {videos.map((video, index) => (
          <Card
            className={`video-card ${focusCarousel ? focusStyles.card : ""}`}
            key={video.id}
            {...(openInYoutube
              ? {
                  href: `https://www.youtube.com/watch?v=${video.id}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                }
              : { type: "button" as const, onClick: () => setActive(video.id) })}
            aria-label={
              openInYoutube
                ? `เปิด ${video.title ?? `${title} ${index + 1}`} บน YouTube (แท็บใหม่)`
                : `เล่น${title} ${index + 1}`
            }
          >
            <ProductImage
              src={video.image}
              alt={openInYoutube && video.title ? video.title : `${title} ${index + 1}`}
              fill
              sizes="(max-width: 720px) 85vw, 400px"
            />
            <span className="video-play">
              <Play size={20} fill="currentColor" />
            </span>
          </Card>
        ))}
      </Track>
      {!openInYoutube && (
        <Modal open={active !== null} onClose={() => setActive(null)} title={title} wide>
          {active && (
            <iframe
              className="video-player"
              src={`https://www.youtube-nocookie.com/embed/${active}?autoplay=1`}
              title={title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          )}
        </Modal>
      )}
    </section>
  );
}
