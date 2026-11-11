"use client";
import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

export function ProductImage({
  src,
  fallbackSrc,
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
  fallbackSrc?: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  preload?: boolean;
  unoptimized?: boolean;
  className?: string;
}) {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const displayed =
    src && !failedSources.includes(src)
      ? src
      : fallbackSrc && !failedSources.includes(fallbackSrc)
        ? fallbackSrc
        : undefined;
  if (!displayed)
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
      src={displayed}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      sizes={sizes}
      preload={preload}
      unoptimized={unoptimized}
      className={className}
      onError={() =>
        setFailedSources((previous) =>
          previous.includes(displayed) ? previous : [...previous, displayed],
        )
      }
    />
  );
}
