"use client";
import { imageSizeError } from "@/features/admin/media-limits";
import { useCategories } from "@/features/cms/components/categories-provider";
import { useActionState, useId, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ImagePlus, Save, Upload, X } from "lucide-react";

import { saveProductAction } from "../server/product-actions";
import { discardProductImage, uploadProductImage } from "../server/media-actions";
import type { AdminProduct } from "../types";
import { ProductGalleryEditor } from "./product-gallery-editor";

export function ProductForm({ product }: { product?: AdminProduct }) {
  const categories = useCategories();
  const formId = useId();
  const [state, action, saving] = useActionState(saveProductAction, {});
  const [image, setImage] = useState(product?.image ?? "");
  const [gallery, setGallery] = useState(
    product?.gallery ?? (product?.image ? [product.image] : []),
  );
  const [galleryUploading, setGalleryUploading] = useState(false);
  const uploadedImages = useRef(new Set<string>());
  const [uploadedImage, setUploadedImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [cancelling, startCancel] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const busy = saving || uploading || galleryUploading || cancelling;
  async function upload(file?: File) {
    if (!file) return;
    const sizeError = imageSizeError(file);
    if (sizeError) {
      setImageError(sizeError);
      return;
    }
    setUploading(true);
    setImageError("");
    try {
      const data = new FormData();
      data.set("file", file);
      const result = await uploadProductImage(data);
      if (result.error || !result.url) setImageError(result.error ?? "อัปโหลดรูปไม่สำเร็จ");
      else {
        uploadedImages.current.add(result.url);
        setGallery((current) =>
          current.includes(image)
            ? current.map((entry) => (entry === image ? result.url! : entry))
            : [result.url!, ...current],
        );
        setImage(result.url);
        setUploadedImage(result.url);
      }
    } catch {
      setImageError("อัปโหลดรูปไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }
  function cancel() {
    startCancel(async () => {
      try {
        for (const uploaded of uploadedImages.current) await discardProductImage(uploaded);
      } finally {
        router.push("/admin/products");
      }
    });
  }
  const fields: Array<{
    name: "capacity" | "readability" | "connection";
    label: string;
    placeholder: string;
  }> = [
    { name: "capacity", label: "พิกัดน้ำหนัก", placeholder: "เช่น 10 กิโลกรัม" },
    { name: "readability", label: "ความละเอียด", placeholder: "เช่น 1 กรัม" },
    { name: "connection", label: "การเชื่อมต่อ", placeholder: "เช่น Wi-Fi / SUNFORD Connect" },
  ];
  function fieldError(name: string) {
    return state.fieldErrors?.[name]?.[0];
  }
  return (
    <>
      <button type="button" className="admin-back" disabled={busy} onClick={cancel}>
        <ArrowLeft size={15} /> กลับไปผลิตภัณฑ์
      </button>
      <form action={action} className="admin-product-form">
        <input type="hidden" name="image" value={image} />
        <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />
        {product && (
          <>
            <input type="hidden" name="id" value={product.id} />
            <input type="hidden" name="updatedAt" value={product.updatedAt} />
          </>
        )}
        <div className="admin-page-heading">
          <div>
            <span className="admin-eyebrow">
              {product ? "REFINE THE DETAILS" : "BUILD YOUR COLLECTION"}
            </span>
            <h1>
              {product ? "แก้ไขผลิตภัณฑ์" : "เพิ่มผลิตภัณฑ์ใหม่"}
              <span>.</span>
            </h1>
            <p>
              {product
                ? `ปรับปรุงข้อมูล ${product.name} ให้พร้อมสำหรับลูกค้า`
                : "เล่าเรื่องราวของสินค้า ด้วยข้อมูลและภาพที่ชัดเจน"}
            </p>
          </div>
          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-button-secondary"
              disabled={busy}
              onClick={cancel}
            >
              ยกเลิก
            </button>
            <button type="submit" className="button button-red" disabled={busy}>
              <Save size={16} />
              {saving ? "กำลังบันทึก…" : "บันทึกสินค้า"}
            </button>
          </div>
        </div>
        {state.error && (
          <div className="admin-alert error" role="alert">
            {state.error}
          </div>
        )}
        <div className="admin-editor-grid">
          <div className="admin-editor-main">
            <section className="admin-form-card">
              <div className="admin-card-heading">
                <span>01</span>
                <div>
                  <h2>ข้อมูลผลิตภัณฑ์</h2>
                  <p>ข้อมูลหลักที่ลูกค้าจะเห็นบนหน้าเว็บไซต์</p>
                </div>
              </div>
              <div className="admin-fields">
                <div className="admin-two-fields">
                  <FormField
                    label="ชื่อสินค้า"
                    name="name"
                    defaultValue={product?.name}
                    placeholder="เช่น WPS10KS"
                    error={fieldError("name")}
                    maxLength={300}
                    required
                    disabled={busy}
                  />
                  <FormField
                    label="URL สินค้า"
                    name="slug"
                    defaultValue={product?.slug}
                    placeholder="เช่น wps10ks"
                    error={fieldError("slug")}
                    maxLength={120}
                    required
                    disabled={busy}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor={`${formId}-category`}>
                    หมวดหมู่ <span>*</span>
                  </label>
                  <select
                    id={`${formId}-category`}
                    name="category"
                    defaultValue={product?.category ?? "food"}
                    disabled={busy}
                  >
                    {categories
                      .filter((c) => c.id !== "all")
                      .map((c) => (
                        <option value={c.id} key={c.id}>
                          {c.label}
                        </option>
                      ))}
                  </select>
                </div>
                <FormField
                  label="คำโปรยสินค้า"
                  name="subtitle"
                  defaultValue={product?.subtitle}
                  placeholder="ประโยคสั้น ๆ ที่บอกจุดเด่นของสินค้า"
                  error={fieldError("subtitle")}
                  required
                  maxLength={200}
                  disabled={busy}
                />
                <div className="admin-field">
                  <label htmlFor={`${formId}-description`}>
                    รายละเอียดสินค้า <span>*</span>
                  </label>
                  <textarea
                    id={`${formId}-description`}
                    name="description"
                    defaultValue={product?.description}
                    rows={6}
                    maxLength={5000}
                    required
                    disabled={busy}
                    placeholder="แนะนำสินค้า การใช้งาน และสิ่งที่ทำให้สินค้ารุ่นนี้แตกต่าง"
                    aria-invalid={Boolean(fieldError("description"))}
                    aria-describedby={
                      fieldError("description") ? `${formId}-description-error` : undefined
                    }
                  />
                  {fieldError("description") && (
                    <small id={`${formId}-description-error`} className="admin-field-error">
                      {fieldError("description")}
                    </small>
                  )}
                </div>
              </div>
            </section>
            <section className="admin-form-card">
              <div className="admin-card-heading">
                <span>02</span>
                <div>
                  <h2>รายละเอียดทางเทคนิค</h2>
                  <p>ช่วยให้ลูกค้าเลือกและเปรียบเทียบสินค้าได้ง่ายขึ้น</p>
                </div>
              </div>
              <div className="admin-fields">
                {fields.map((field) => (
                  <FormField
                    key={field.name}
                    {...field}
                    defaultValue={product?.[field.name]}
                    error={fieldError(field.name)}
                    required
                    maxLength={200}
                    disabled={busy}
                  />
                ))}
              </div>
            </section>
            <ProductGalleryEditor
              images={gallery}
              primaryImage={image}
              disabled={busy}
              onChange={setGallery}
              onPrimary={setImage}
              onBusy={setGalleryUploading}
              onUploaded={(image) => uploadedImages.current.add(image)}
            />
          </div>
          <aside className="admin-editor-aside">
            <section className="admin-form-card">
              <div className="admin-card-heading">
                <span>
                  <ImagePlus size={18} />
                </span>
                <div>
                  <h2>รูปผลิตภัณฑ์</h2>
                  <p>ภาพที่ใช่ ทำให้สินค้าชัดเจนขึ้น</p>
                </div>
              </div>
              <div className="admin-image-field">
                {image ? (
                  <div className="admin-image-preview">
                    <Image
                      src={image}
                      alt="ตัวอย่างรูปสินค้า"
                      fill
                      sizes="(max-width: 800px) 90vw, 320px"
                    />
                    <span className="admin-image-label">
                      {uploadedImage ? "อัปโหลดแล้ว" : "รูปปัจจุบัน"}
                    </span>
                  </div>
                ) : (
                  <button
                    className="admin-image-drop"
                    type="button"
                    disabled={busy}
                    onClick={() => inputRef.current?.click()}
                  >
                    <ImagePlus size={34} strokeWidth={1.2} />
                    <strong>เลือกรูปผลิตภัณฑ์</strong>
                    <span>JPG, PNG หรือ WebP · ไม่เกิน 4 MB</span>
                  </button>
                )}
                <input
                  ref={inputRef}
                  id={`${formId}-product-image-file`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => upload(e.target.files?.[0])}
                  disabled={busy}
                  aria-label="อัปโหลดรูปสินค้า"
                  className="admin-file-input"
                />
                <button
                  type="button"
                  className="admin-upload-button"
                  disabled={busy}
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload size={15} />
                  {uploading ? "กำลังอัปโหลด…" : image ? "เปลี่ยนรูปสินค้า" : "อัปโหลดรูปสินค้า"}
                </button>
                {(imageError || fieldError("image")) && (
                  <p role="alert" className="admin-field-error">
                    {imageError || fieldError("image")}
                  </p>
                )}
                <p className="admin-field-hint">
                  แนะนำภาพพื้นหลังเรียบ เห็นสินค้าครบทั้งชิ้น
                  <br />
                  รูปจะจัดเก็บใน Supabase Storage
                </p>
                <a className="admin-preview-link" href="#product-gallery">
                  จัดการรูปทั้งหมด ({gallery.length} รูป) <ArrowUpRight size={14} />
                </a>
              </div>
            </section>
            <section className="admin-form-card">
              <div className="admin-card-heading">
                <span>03</span>
                <div>
                  <h2>การแสดงผล</h2>
                  <p>เลือกตำแหน่งและสถานะของสินค้า</p>
                </div>
              </div>
              <div className="admin-fields">
                <label className="admin-check">
                  <input
                    type="checkbox"
                    name="published"
                    defaultChecked={product?.published ?? false}
                    disabled={busy}
                  />
                  <span>
                    <strong>เผยแพร่บนเว็บไซต์</strong>
                    <small>ปิดเพื่อบันทึกเป็นฉบับร่าง</small>
                  </span>
                </label>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={product?.featured ?? false}
                    disabled={busy}
                  />
                  <span>
                    <strong>สินค้าแนะนำ</strong>
                    <small>แสดงในส่วนสินค้าแนะนำหน้าแรก</small>
                  </span>
                </label>
                <div className="admin-two-fields compact">
                  <FormField
                    label="ป้ายสินค้า"
                    name="badge"
                    defaultValue={product?.badge ?? ""}
                    placeholder="เช่น ใหม่"
                    maxLength={50}
                    disabled={busy}
                  />
                  <FormField
                    label="ลำดับแสดงผล"
                    name="sortOrder"
                    type="number"
                    min={0}
                    max={99999}
                    defaultValue={product?.sortOrder ?? 0}
                    error={fieldError("sortOrder")}
                    required
                    disabled={busy}
                  />
                </div>
                <p className="admin-field-hint">
                  ลำดับน้อยจะแสดงก่อน · ฉบับร่างจะไม่ปรากฏบนเว็บไซต์
                </p>
                {product?.published && (
                  <Link
                    className="admin-preview-link"
                    href={`/products/${product.slug}`}
                    target="_blank"
                  >
                    ดูสินค้าบนเว็บไซต์ <ArrowUpRight size={14} />
                  </Link>
                )}
                {product && (
                  <Link
                    className="admin-preview-link"
                    href={`/admin/content/product-media:${product.id}`}
                  >
                    จัดการแกลเลอรี ราคา วิดีโอ และเนื้อหาเพิ่มเติม <ArrowUpRight size={14} />
                  </Link>
                )}
              </div>
            </section>
          </aside>
        </div>
        <div className="admin-form-bottom">
          <p>ตรวจสอบข้อมูลให้ครบก่อนบันทึก</p>
          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-button-secondary"
              disabled={busy}
              onClick={cancel}
            >
              <X size={15} /> ยกเลิก
            </button>
            <button type="submit" className="button button-red" disabled={busy}>
              <Save size={16} />
              {saving ? "กำลังบันทึก…" : "บันทึกสินค้า"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
function FormField({
  label,
  name,
  error,
  required,
  ...props
}: { label: string; name: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className="admin-field">
      <label htmlFor={id}>
        {label}
        {required && <span> *</span>}
      </label>
      <input
        {...props}
        id={id}
        name={name}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <small className="admin-field-error" id={`${id}-error`}>
          {error}
        </small>
      )}
      {name === "slug" && !error && (
        <small className="admin-field-hint">
          /products/your-product · ใช้ A-Z, a-z, 0-9 ขีดกลางหรือขีดล่าง
        </small>
      )}
    </div>
  );
}
