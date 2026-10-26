"use client";
import { useActionState, useId, useRef, useState } from "react";
import { Save, RotateCcw, Upload } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { saveHomeImageAction } from "../server/home-image-actions";
import { discardProductImage, uploadProductImage } from "../server/media-actions";
import type { HomeImageSlot } from "@/features/home/data/image-slots";

export function HomeImageEditor({
  slot,
  title,
  description,
  currentImage = "",
  defaultImage,
  updatedAt = "",
}: {
  slot: HomeImageSlot;
  title: string;
  description: string;
  currentImage?: string;
  defaultImage?: string;
  updatedAt?: string;
}) {
  const id = useId();
  const [state, action, saving] = useActionState(saveHomeImageAction, {});
  const [image, setImage] = useState(currentImage);
  const [uploadedImage, setUploadedImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const busy = saving || uploading;

  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("รูปภาพต้องมีขนาดไม่เกิน 5 MB");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
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
      action={action}
      className="admin-form-card admin-home-image-editor"
      aria-label={`เปลี่ยนรูป ${title}`}
    >
      <input type="hidden" name="slot" value={slot} />
      <input type="hidden" name="image" value={image} />
      <input type="hidden" name="updatedAt" value={updatedAt} />
      <div className="admin-home-image-heading">
        <h2>{title}</h2>
        <p>{description}</p>
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
        {image ? "ใช้รูปที่เลือกสำหรับตำแหน่งนี้" : "ใช้รูปเดิมของเว็บไซต์"} · JPG, PNG หรือ WebP
        ไม่เกิน 5 MB
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
          {saving ? "กำลังบันทึก…" : "บันทึกรูป"}
        </button>
      </div>
    </form>
  );
}
