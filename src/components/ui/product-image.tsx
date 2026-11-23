"use client";
import Image, { getImageProps } from "next/image";
import { preload as preloadImage } from "react-dom";
import { useCallback, useState } from "react";
import { ImageIcon } from "lucide-react";
import styles from "./product-image.module.css";

export const PRODUCT_IMAGE_PLACEHOLDER = "/images/product-image-placeholder.svg";
export const PRODUCT_IMAGE_PLACEHOLDER_LABEL = "ยังไม่มีข้อมูลสินค้าเครื่องชั่ง";

// The neutral preview covers new versions until a matching preview is available.
const neutralPreview =
  "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 8 8%27%3E%3Cellipse cx=%274%27 cy=%274%27 rx=%273%27 ry=%272%27 fill=%27%23dedee3%27/%3E%3C/svg%3E";
function warehousePreview(src: string) {
  return /^\/(?:api\/products\/[^/]+\/image(?:\?|$)|images\/warehouse-cache\/)/.test(src)
    ? neutralPreview
    : undefined;
}

function isInViewport(image: HTMLImageElement) {
  const bounds = image.getBoundingClientRect();
  let left = Math.max(0, bounds.left);
  let top = Math.max(0, bounds.top);
  let right = Math.min(document.documentElement.clientWidth, bounds.right);
  let bottom = Math.min(window.innerHeight, bounds.bottom);
  for (
    let parent = image.parentElement;
    parent && right > left && bottom > top;
    parent = parent.parentElement
  ) {
    const { overflowX, overflowY } = getComputedStyle(parent);
    if (overflowX === "visible" && overflowY === "visible") continue;
    const clip = parent.getBoundingClientRect();
    if (overflowX !== "visible") {
      left = Math.max(left, clip.left);
      right = Math.min(right, clip.right);
    }
    if (overflowY !== "visible") {
      top = Math.max(top, clip.top);
      bottom = Math.min(bottom, clip.bottom);
    }
  }
  return right > left && bottom > top;
}

export function ProductImage({
  src,
  fallbackSrc,
  alt,
  fill,
  width,
  height,
  sizes,
  fallbackSizes = sizes,
  preload = false,
  preloadMedia,
  prioritize = false,
  eager = false,
  progressive = false,
  blurDataURL,
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
  fallbackSizes?: string;
  preload?: boolean;
  preloadMedia?: string;
  prioritize?: boolean;
  eager?: boolean;
  progressive?: boolean;
  blurDataURL?: string;
  unoptimized?: boolean;
  className?: string;
  placeholder?: "media" | "product";
}) {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const fade = progressive && !preload && !preloadMedia;
  const trackImage = useCallback(
    (image: HTMLImageElement | null) => {
      if (!image) return;
      if (fade && !image.complete) image.dataset.productImagePending = "";
      const frame =
        prioritize && !preload
          ? requestAnimationFrame(() => {
              if (!image.isConnected || image.complete || !isInViewport(image)) return;
              image.fetchPriority = "high";
              image.loading = "eager";
            })
          : undefined;
      return () => {
        if (frame !== undefined) cancelAnimationFrame(frame);
        delete image.dataset.productImagePending;
      };
    },
    [fade, preload, prioritize],
  );
  const primary = src && !failedSources.includes(src);
  const displayed = primary
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
  const preview =
    (primary ? blurDataURL : undefined) ?? (progressive ? warehousePreview(displayed) : undefined);
  const source = {
    src: displayed,
    fill,
    width,
    height,
    sizes: primary ? sizes : fallbackSizes,
    unoptimized,
  };
  if (preloadMedia && (primary || !src) && !preload) {
    const { props } = getImageProps({ ...source, alt });
    preloadImage(props.src, {
      as: "image",
      media: preloadMedia,
      fetchPriority: "high",
      imageSrcSet: props.srcSet,
      imageSizes: props.sizes,
    });
  }
  return (
    <Image
      key={displayed}
      ref={prioritize || fade ? trackImage : undefined}
      {...source}
      alt={alt}
      preload={preload}
      loading={eager && !preload ? "eager" : undefined}
      fetchPriority={eager && !preload ? "high" : undefined}
      className={fade ? [className, styles.fadeIn].filter(Boolean).join(" ") : className}
      placeholder={preview ? "blur" : undefined}
      blurDataURL={preview}
      onLoad={
        fade
          ? (event) => {
              const image = event.currentTarget;
              if (!image.hasAttribute("data-product-image-pending")) return;
              delete image.dataset.productImagePending;
              image.dataset.productImageFade = "";
            }
          : undefined
      }
      onError={() =>
        setFailedSources((previous) =>
          previous.includes(displayed) ? previous : [...previous, displayed],
        )
      }
    />
  );
}
