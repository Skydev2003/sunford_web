"use client";
import { useState } from "react";
import { Play } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ProductImage } from "@/components/ui/product-image";
import { DragScroll } from "@/components/ui/drag-scroll";

export function VideoGallery({
  videos,
  title = "วิดีโอ Sunford",
}: {
  videos: { id: string; image: string }[];
  title?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  if (!videos.length) return null;
  return (
    <section className="video-gallery container" aria-label={title}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">WATCH & DISCOVER</p>
          <h2>{title}</h2>
        </div>
      </div>
      <DragScroll className="video-track" label={title}>
        {videos.map((video, index) => (
          <button
            className="video-card"
            key={video.id}
            onClick={() => setActive(video.id)}
            aria-label={`เล่น${title} ${index + 1}`}
          >
            <ProductImage
              src={video.image}
              alt={`${title} ${index + 1}`}
              fill
              sizes="(max-width: 720px) 85vw, 400px"
            />
            <span className="video-play">
              <Play size={20} fill="currentColor" />
            </span>
          </button>
        ))}
      </DragScroll>
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
    </section>
  );
}
