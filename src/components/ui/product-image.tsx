"use client";
import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

export function ProductImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  preload = false,
  unoptimized = false,
  className,
}: {
  src?: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  preload?: boolean;
  unoptimized?: boolean;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src)
    return (
      <div
        className={`media-placeholder ${fill ? "media-placeholder-fill" : ""} ${className ?? ""}`}
        role="img"
        aria-label={`พื้นที่สำหรับรูปภาพ ${alt}`}
      >
        <ImageIcon size={28} strokeWidth={1} />
        <span>พื้นที่สำหรับรูปภาพ</span>
      </div>
    );
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      sizes={sizes}
      preload={preload}
      unoptimized={unoptimized}
      className={className}
      onError={() => setFailedSrc(src)}
    />
  );
}
