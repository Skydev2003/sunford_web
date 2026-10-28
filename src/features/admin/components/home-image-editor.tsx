"use client";
import { imageSizeError } from "@/features/admin/media-limits";
import { useActionState, useId, useRef, useState } from "react";
import { Save, RotateCcw, Upload } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { saveHomeImageAction } from "../server/home-image-actions";
import { discardProductImage, uploadProductImage } from "../server/media-actions";
import type { HomeImageSlot } from "@/features/home/data/image-slots";
import type { HomePageOption, HomeProductOption } from "@/features/home/data/link-targets";
import { useImageCropper } from "./image-cropper";
import { imageGuidelines, imageHint } from "../image-guidelines";
import { useUnsavedForm } from "./unsaved-changes";

export function HomeImageEditor({
  slot,
  title,
  description,
  currentImage = "",
  defaultImage,
  updatedAt = "",
  currentProductId,
  currentPagePath,
  defaultHref,
  products,
  pages,
}: {
  slot: HomeImageSlot;
  title: string;
  description: string;
  currentImage?: string;
  defaultImage?: string;
  updatedAt?: string;
  currentProductId?: string | null;
  currentPagePath?: string | null;
  defaultHref?: string;
  products: HomeProductOption[];
  pages: HomePageOption[];
}) {
  const id = useId();
  const [state, action, saving] = useActionState(saveHomeImageAction, {});
  const [image, setImage] = useState(currentImage);
  const [uploadedImage, setUploadedImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const { crop, cropper } = useImageCropper();
  const [targetType, setTargetType] = useState(
    currentProductId ? "product" : currentPagePath ? "page" : "default",
  );
  const [productId, setProductId] = useState(currentProductId ?? "");
  const [pagePath, setPagePath] = useState(currentPagePath ?? "");
  const href =
    targetType === "product"
      ? products.find((product) => product.id === productId)?.href
      : targetType === "page"
        ? pages.find((page) => page.path === pagePath)?.path
        : defaultHref;
  const input = useRef<HTMLInputElement>(null);
  const busy = saving || uploading;
  const { bindings: unsaved } = useUnsavedForm({
    title,
    busy,
    saving,
    resetKey: updatedAt,
  });

  async function upload(file?: File) {
    if (!file) return;
    const sizeError = imageSizeError(file);
    if (sizeError) {
      setError(sizeError);
      return;
    }
    setUploading(true);
    setError("");
    try {
      const prepared = await crop(file, imageGuidelines.product);
      if (!prepared) return;
      const form = new FormData();
      form.set("file", prepared);
      const result = await uploadProductImage(form);
      if (!result.url || result.error) {
        setError(result.error ?? "อัปโหลดรูปไม่สำเร็จ");
        return;
      }
      const previous = uploadedImage;
      setImage(result.url);
      setUploadedImage(result.url);
      if (previous) {
        try {
          await discardProductImage(previous);
        } catch {
          /* Keep the new image. */
        }
      }
    } catch {
      setError("อัปโหลดรูปไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  }

  async function reset() {
    setImage("");
    setError("");
    if (!uploadedImage) return;
    setUploading(true);
    try {
      await discardProductImage(uploadedImage);
    } catch {
      /* Cleanup can be retried later; the original preview is restored. */
    } finally {
      setUploadedImage("");
      setUploading(false);
    }
  }

  return (
    <form
      {...unsaved}
      action={action}
      onReset={(event) => event.preventDefault()}
      className="admin-form-card admin-home-image-editor"
      aria-label={`เปลี่ยนรูป ${title}`}
    >
      <input type="hidden" name="slot" value={slot} />
      <input type="hidden" name="image" value={image} />
      <input type="hidden" name="updatedAt" value={updatedAt} />
      <div className="admin-home-image-heading">
        <h2>{title}</h2>
        <p>{description}</p>
        <a
          className="admin-field-hint"
          href={`/admin/audit?type=home-image&id=${encodeURIComponent(slot)}`}
          target="_blank"
          rel="noreferrer"
        >
          ประวัติการแก้ไขและผู้ทำรายการ ↗
        </a>
      </div>
      <div className="admin-home-image-preview">
        <ProductImage
          key={image || defaultImage}
          src={image || defaultImage}
          alt={`ตัวอย่าง ${title}`}
          fill
          sizes="(max-width: 800px) 90vw, 480px"
        />
      </div>
      <p className="admin-field-hint" aria-live="polite">
        {image ? "ใช้รูปที่เลือกสำหรับตำแหน่งนี้" : "ใช้รูปเดิมของเว็บไซต์"} ·{" "}
        {imageHint(imageGuidelines.product)}
      </p>
      <label className="admin-file-input" htmlFor={id}>
        อัปโหลดรูป {title}
      </label>
      <input
        id={id}
        className="admin-file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        ref={input}
        disabled={busy}
        onChange={(event) => upload(event.target.files?.[0])}
      />
      {(error || state.error) && (
        <p className="admin-alert error" role="alert">
          {error || state.error}
        </p>
      )}
      <div className="admin-home-link-fields admin-fields">
        <div className="admin-field">
          <label htmlFor={`${id}-target-type`}>เมื่อคลิกรูปภาพหรือปุ่มดูเพิ่มเติม</label>
          <select
            id={`${id}-target-type`}
            name="targetType"
            value={targetType}
            onChange={(event) => setTargetType(event.target.value)}
            disabled={busy}
          >
            <option value="default">ใช้ปลายทางเดิมของตำแหน่งนี้</option>
            <option value="product">ไปหน้ารายละเอียดสินค้า</option>
            <option value="page">ไปหน้าข้อมูลในเว็บไซต์</option>
          </select>
        </div>
        {targetType === "product" && (
          <div className="admin-field">
            <label htmlFor={`${id}-product`}>สินค้าที่ต้องการอ้างอิง</label>
            <select
              id={`${id}-product`}
              name="targetProductId"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              disabled={busy}
              required
            >
              <option value="">เลือกสินค้า</option>
              {productId && !products.some((product) => product.id === productId) && (
                <option value={productId} disabled>
                  สินค้าที่เลือกถูกซ่อนหรือถูกลบ กรุณาเลือกใหม่
                </option>
              )}
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} — {product.href}
                </option>
              ))}
            </select>
            <p className="admin-field-hint">
              ลิงก์จะตามสินค้าตัวนี้ แม้เปลี่ยนชื่อหรือ URL ภายหลัง
            </p>
          </div>
        )}
        {targetType === "page" && (
          <div className="admin-field">
            <label htmlFor={`${id}-page`}>หน้าข้อมูลที่ต้องการอ้างอิง</label>
            <select
              id={`${id}-page`}
              name="targetPagePath"
              value={pagePath}
              onChange={(event) => setPagePath(event.target.value)}
              disabled={busy}
              required
            >
              <option value="">เลือกหน้าข้อมูล</option>
              {pages.map((page) => (
                <option key={page.path} value={page.path}>
                  {page.title} — {page.path}
                </option>
              ))}
            </select>
          </div>
        )}
        <p className="admin-field-hint">
          ปลายทาง:{" "}
          {href ? (
            <a href={href} target="_blank" rel="noreferrer" className="text-link">
              {href} ↗
            </a>
          ) : (
            "ยังไม่มีปลายทางที่เปิดดูได้ กรุณาเลือกรายการ"
          )}
        </p>
      </div>
      {cropper}
      <div className="admin-home-image-actions">
        <button
          className="admin-button-secondary"
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          <Upload size={15} />
          {uploading ? "กำลังอัปโหลด…" : "เลือกรูปใหม่"}
        </button>
        <button
          className="admin-button-secondary"
          type="button"
          disabled={busy || !image}
          onClick={reset}
        >
          <RotateCcw size={15} />
          ใช้รูปเดิม
        </button>
        <button className="button button-red" type="submit" disabled={busy}>
          <Save size={15} />
          {saving ? "กำลังบันทึก…" : "บันทึกรูปและลิงก์"}
        </button>
      </div>
    </form>
  );
}
