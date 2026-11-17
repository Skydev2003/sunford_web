"use client";
import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";
import styles from "./product-image.module.css";

export const PRODUCT_IMAGE_PLACEHOLDER = "/images/product-image-placeholder.svg";
export const PRODUCT_IMAGE_PLACEHOLDER_LABEL = "ยังไม่มีข้อมูลสินค้าเครื่องชั่ง";

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
  placeholder = "media",
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
  placeholder?: "media" | "product";
}) {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const displayed =
    src && !failedSources.includes(src)
      ? src
      : fallbackSrc && !failedSources.includes(fallbackSrc)
        ? fallbackSrc
        : undefined;
  if (!displayed && placeholder === "product")
    return (
      <div
        className={`${styles.placeholder} ${fill ? styles.fill : ""} ${className ?? ""}`}
        style={fill ? undefined : { width, height }}
        data-product-image-placeholder
        role={alt ? "img" : undefined}
        aria-label={alt ? `${PRODUCT_IMAGE_PLACEHOLDER_LABEL}: ${alt}` : undefined}
        aria-hidden={alt ? undefined : true}
      >
        <Image
          src={PRODUCT_IMAGE_PLACEHOLDER}
          alt=""
          width={240}
          height={180}
          className={styles.icon}
          unoptimized
        />
        <span className={styles.caption} aria-hidden="true">
          {PRODUCT_IMAGE_PLACEHOLDER_LABEL}
        </span>
      </div>
    );
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
