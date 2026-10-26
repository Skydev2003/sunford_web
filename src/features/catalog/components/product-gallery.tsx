"use client";
import { useState } from "react";
import { ProductImage } from "@/components/ui/product-image";

export function ProductGallery({
  images,
  name,
  primaryImage,
}: {
  images: string[];
  name: string;
  primaryImage?: string;
}) {
  const initial = primaryImage ? images.indexOf(primaryImage) : -1;
  const [active, setActive] = useState(initial >= 0 ? initial : images.length > 1 ? 1 : 0);
  return (
    <div className="product-gallery">
      <div className="detail-image">
        <ProductImage
          src={images[active] || images[0]}
          alt={name}
          fill
          sizes="(max-width: 900px) 90vw, 50vw"
          preload
        />
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbnails" aria-label="เลือกรูปสินค้า">
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              className={index === active ? "active" : ""}
              onClick={() => setActive(index)}
              aria-label={`ดูรูป ${name} มุมที่ ${index + 1}`}
              aria-pressed={index === active}
            >
              <ProductImage src={src} alt={`${name} มุมที่ ${index + 1}`} width={76} height={76} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
