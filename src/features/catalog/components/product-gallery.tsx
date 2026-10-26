"use client";
import { useState } from "react";
import { ProductImage } from "@/components/ui/product-image";
import { Box } from "lucide-react";
import { ProductModelViewer } from "./product-model-viewer";

export function ProductGallery({
  images,
  name,
  primaryImage,
  preferFirst = false,
  model,
}: {
  images: string[];
  name: string;
  primaryImage?: string;
  preferFirst?: boolean;
  model?: { src: string; poster: string };
}) {
  const initial = primaryImage ? images.indexOf(primaryImage) : -1;
  const [active, setActive] = useState(
    initial >= 0 ? initial : !preferFirst && images.length > 1 ? 1 : 0,
  );
  const [showModel, setShowModel] = useState(Boolean(model));
  return (
    <div className="product-gallery">
      <div className="detail-image">
        {showModel && model ? (
          <ProductModelViewer src={model.src} name={name} poster={model.poster} />
        ) : (
          <ProductImage
            src={images[active] || images[0]}
            alt={name}
            fill
            sizes="(max-width: 900px) 90vw, 50vw"
            preload
          />
        )}
      </div>
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
              <ProductImage src={src} alt={`${name} มุมที่ ${index + 1}`} width={76} height={76} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
