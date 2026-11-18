"use client";
import { useReturnState } from "@/features/site/history/return-state";
import { ProductImage } from "@/components/ui/product-image";
import { useRef, useState } from "react";
import { Box, X } from "lucide-react";
import { ProductModelViewer } from "./product-model-viewer";

export function ProductGallery({
  images,
  name,
  primaryImage,
  fallbackImage,
  preferFirst = false,
  model,
}: {
  images: string[];
  name: string;
  primaryImage?: string;
  fallbackImage?: string;
  preferFirst?: boolean;
  model?: { src: string; poster: string };
}) {
  const initial = primaryImage ? images.indexOf(primaryImage) : -1;
  const [active, setActive] = useReturnState(
    "product-gallery.active",
    initial >= 0 ? initial : !preferFirst && images.length > 1 ? 1 : 0,
  );
  const [showModel, setShowModel] = useReturnState("product-gallery.showModel", Boolean(model));
  const zoom = useRef<HTMLDialogElement>(null);
  const [zoomOpened, setZoomOpened] = useState(false);
  const photo = images[active] || images[0];
  if (!photo && !model) return null;
  return (
    <div className="product-gallery">
      <div className="detail-image">
        {showModel && model ? (
          <ProductModelViewer src={model.src} name={name} poster={model.poster} />
        ) : (
          <>
            <ProductImage
              placeholder="product"
              src={images[active] || images[0]}
              fallbackSrc={
                (images[active] || images[0]) === primaryImage ? fallbackImage : undefined
              }
              alt={name}
              fill
              sizes="(width < 64rem) 90vw, 50vw"
              preload
            />
            <button
              className="gallery-zoom"
              type="button"
              aria-label={`ขยายรูป ${name}`}
              aria-haspopup="dialog"
              onClick={() => {
                setZoomOpened(true);
                zoom.current?.showModal();
              }}
            />
          </>
        )}
      </div>
      <dialog
        ref={zoom}
        className="gallery-dialog"
        aria-label={`ภาพขยาย ${name}`}
        onClose={() => setZoomOpened(false)}
      >
        <div>
          <strong>{name}</strong>
          <button type="button" onClick={() => zoom.current?.close()} aria-label="ปิด">
            <X size={20} />
          </button>
        </div>
        {zoomOpened && (
          <ProductImage
            src={photo}
            fallbackSrc={photo === primaryImage ? fallbackImage : undefined}
            alt={name}
            width={900}
            height={700}
          />
        )}
      </dialog>
      {(images.length > 1 || model) && (
        <div className="gallery-thumbnails" aria-label="เลือกรูปสินค้า">
          {model && (
            <button
              type="button"
              className={`gallery-model-thumbnail ${showModel ? "active" : ""}`}
              onClick={() => setShowModel(true)}
              aria-label={`ดูโมเดล 3 มิติ ${name}`}
              aria-pressed={showModel}
            >
              <Box size={26} strokeWidth={1.4} />
              <span>ดู 3 มิติ</span>
            </button>
          )}
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              className={!showModel && index === active ? "active" : ""}
              onClick={() => {
                setShowModel(false);
                setActive(index);
              }}
              aria-label={`ดูรูป ${name} มุมที่ ${index + 1}`}
              aria-pressed={!showModel && index === active}
            >
              <ProductImage
                placeholder="product"
                src={src}
                fallbackSrc={src === primaryImage ? fallbackImage : undefined}
                alt={`${name} มุมที่ ${index + 1}`}
                width={76}
                height={76}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
