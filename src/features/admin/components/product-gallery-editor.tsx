"use client";
import { imageSizeError } from "@/features/admin/media-limits";
import { useId, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Images, Star, Trash2, Upload } from "lucide-react";
import { uploadProductImage } from "../server/media-actions";
import { useImageCropper } from "./image-cropper";
import { imageGuidelines, imageHint } from "../image-guidelines";
import { SafetyDialog } from "./safety-dialog";
export function ProductGalleryEditor({
  images,
  primaryImage,
  disabled,
  onChange,
  onPrimary,
  onBusy,
  onUploaded,
}: {
  images: string[];
  primaryImage: string;
  disabled: boolean;
  onChange: (images: string[]) => void;
  onPrimary: (image: string) => void;
  onBusy: (busy: boolean) => void;
  onUploaded: (image: string) => void;
}) {
  const id = useId();
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<number | null>(null);
  const { crop, cropper } = useImageCropper();
  async function upload(file?: File, index?: number) {
    if (!file) return;
    const sizeError = imageSizeError(file);
    if (sizeError) {
      setError(sizeError);
      return;
    }
    onBusy(true);
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
      onUploaded(result.url);
      if (index === undefined) onChange([...images, result.url]);
      else onChange(images.map((image, position) => (position === index ? result.url! : image)));
      if (!primaryImage || (index !== undefined && images[index] === primaryImage))
        onPrimary(result.url);
    } catch {
      setError("อัปโหลดรูปไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      onBusy(false);
    }
  }
  function remove(index: number) {
    const next = images.filter((_, position) => position !== index);
    onChange(next);
    if (images[index] === primaryImage) onPrimary(next[0] ?? "");
  }
  function move(index: number, step: number) {
    const next = [...images];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    onChange(next);
  }
  return (
    <section id="product-gallery" className="admin-form-card">
      <div className="admin-card-heading">
        <span>
          <Images size={18} />
        </span>
        <div>
          <h2>รูปภาพทั้งหมดของสินค้า</h2>
          <p>เปลี่ยนรูปแต่ละมุม เพิ่ม ลบ เรียงลำดับ และเลือกรูปหลักได้</p>
        </div>
      </div>
      <div className="admin-fields">
        <p className="admin-field-hint">
          แสดงในแกลเลอรีหน้ารายละเอียดสินค้า · การเปลี่ยนแปลงจะมีผลเมื่อกด “บันทึกสินค้า” เท่านั้น ·{" "}
          {imageHint(imageGuidelines.product)}
        </p>
        {error && (
          <p role="alert" className="admin-field-error">
            {error}
          </p>
        )}
        <div className="admin-gallery-grid">
          {images.map((image, index) => (
            <article key={`${index}:${image}`} className="admin-gallery-card">
              <div className="admin-gallery-preview">
                <Image
                  src={image}
                  alt={`รูปสินค้า ${index + 1}`}
                  fill
                  sizes="(max-width: 600px) 80vw, 240px"
                />
              </div>
              <div className="admin-gallery-label">
                <strong>รูปที่ {index + 1}</strong>
                {image === primaryImage && (
                  <span>
                    <Star size={12} />
                    รูปหลัก
                  </span>
                )}
              </div>
              <label htmlFor={`${id}-${index}`} className="admin-upload-button">
                <Upload size={14} />
                เปลี่ยนรูปนี้
                <input
                  id={`${id}-${index}`}
                  className="admin-file-input"
                  aria-label={`เปลี่ยนรูปที่ ${index + 1}`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={disabled}
                  onChange={(event) => {
                    void upload(event.target.files?.[0], index);
                    event.target.value = "";
                  }}
                />
              </label>
              <div className="admin-gallery-actions">
                <button
                  type="button"
                  disabled={disabled || image === primaryImage}
                  onClick={() => onPrimary(image)}
                  aria-label={`ใช้รูปที่ ${index + 1} เป็นรูปหลัก`}
                >
                  <Star size={15} />
                </button>
                <button
                  type="button"
                  disabled={disabled || index === 0}
                  onClick={() => move(index, -1)}
                  aria-label={`เลื่อนรูปที่ ${index + 1} ขึ้น`}
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  type="button"
                  disabled={disabled || index === images.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label={`เลื่อนรูปที่ ${index + 1} ลง`}
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  type="button"
                  className="admin-danger"
                  disabled={disabled}
                  onClick={() => setRemoving(index)}
                  aria-label={`นำรูปที่ ${index + 1} ออก`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
        {!images.length && <p>ยังไม่มีรูปในแกลเลอรี เพิ่มรูปแรกได้จากปุ่มด้านล่าง</p>}
        <label className="admin-upload-button" htmlFor={`${id}-add`}>
          <Upload size={15} />
          เพิ่มรูปสินค้า ({images.length}/50)
          <input
            id={`${id}-add`}
            className="admin-file-input"
            aria-label="เพิ่มรูปสินค้าในแกลเลอรี"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled || images.length >= 50}
            onChange={(event) => {
              void upload(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
      </div>
      {cropper}
      <SafetyDialog
        open={removing !== null}
        busy={disabled}
        title="ยืนยันนำรูปออกจากแกลเลอรี"
        onClose={() => setRemoving(null)}
      >
        <p>
          นำรูปที่ {removing === null ? "" : removing + 1} ออกจากรายการ
          รูปจะเปลี่ยนบนเว็บไซต์เมื่อกดบันทึกสินค้า
        </p>
        {removing !== null && images[removing] === primaryImage && (
          <p>รูปหลักจะเปลี่ยนเป็นรูปที่เหลือในแกลเลอรี</p>
        )}
        <div className="admin-modal-actions">
          <button
            type="button"
            className="admin-button-secondary"
            disabled={disabled}
            onClick={() => setRemoving(null)}
          >
            ยกเลิก
          </button>
          <button
            type="button"
            className="admin-button-danger"
            disabled={disabled}
            onClick={() => {
              if (removing !== null) remove(removing);
              setRemoving(null);
            }}
          >
            ยืนยันนำรูปออก
          </button>
        </div>
      </SafetyDialog>
    </section>
  );
}
