"use client";
import { imageSizeError } from "@/features/admin/media-limits";
import { useCategories } from "@/features/cms/components/categories-provider";
import {
  useActionState,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ImagePlus, Save, Upload, X } from "lucide-react";

import { saveProductAction } from "../server/product-actions";
import { discardProductImage, uploadProductImage } from "../server/media-actions";
import type { AdminProduct } from "../types";
import { ProductGalleryEditor } from "./product-gallery-editor";
import type { AdminDetailHandle } from "../detail-types";
import { AdminDetailLink } from "./admin-detail-link";
import { CharacterCount } from "./character-count";
import { ProductDraftPreview } from "./draft-preview";
import { useImageCropper } from "./image-cropper";
import { imageGuidelines, imageHint } from "../image-guidelines";
import { useUnsavedForm } from "./unsaved-changes";

export function ProductForm({
  product,
  detailRef,
  onClose,
  onSaved,
  onBusyChange,
  onDirty,
  compact = false,
}: {
  product?: AdminProduct;
  detailRef?: Ref<AdminDetailHandle>;
  onClose?: () => void;
  onSaved?: () => void;
  onBusyChange?: (busy: boolean) => void;
  onDirty?: (dirty: boolean) => void;
  compact?: boolean;
}) {
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
  const { crop, cropper } = useImageCropper();
  const [draft, setDraft] = useState<Record<string, string>>({
    name: product?.name ?? "",
    subtitle: product?.subtitle ?? "",
    description: product?.description ?? "",
    slug: product?.slug ?? "",
    capacity: product?.capacity ?? "",
    readability: product?.readability ?? "",
    connection: product?.connection ?? "",
  });
  const [cancelling, setCancelling] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const busy = saving || uploading || galleryUploading || cancelling;
  const { discard, bindings: unsaved } = useUnsavedForm({
    title: product?.name ?? "สินค้าใหม่",
    busy,
    saving,
    success: state.success && state,
    onDirty,
  });
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
      const prepared = await crop(file, imageGuidelines.product);
      if (!prepared) return;
      const data = new FormData();
      data.set("file", prepared);
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
  async function cancel() {
    if (!(await discard())) return false;
    setCancelling(true);
    try {
      for (const uploaded of uploadedImages.current) await discardProductImage(uploaded);
    } finally {
      if (onClose) onClose();
      else router.push("/admin/products");
      setCancelling(false);
    }
    return true;
  }
  useImperativeHandle(detailRef, () => ({ cancel }));
  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
  useEffect(() => {
    if (state.success) onSaved?.();
  }, [state.success, onSaved]);
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
      <form
        {...unsaved}
        action={action}
        className={`admin-product-form${compact ? " admin-product-card-form" : ""}`}
        onInput={(event) => {
          unsaved.onInput();
          const target = event.target;
          if (
            (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) &&
            target.name in draft
          )
            setDraft((current) => ({ ...current, [target.name]: target.value }));
        }}
        onReset={(event) => {
          event.preventDefault();
        }}
      >
        {onSaved && <input type="hidden" name="detail" value="1" />}
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
            {compact && product && (
              <Link
                className="admin-button-secondary"
                href={`/admin/products/${encodeURIComponent(product.id)}/edit`}
              >
                แก้ไขรายละเอียดทั้งหมด <ArrowUpRight size={15} />
              </Link>
            )}
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
        {product && (
          <p className="admin-field-hint">
            <Link
              href={`/admin/audit?type=product&id=${encodeURIComponent(product.id)}`}
              target="_blank"
              rel="noreferrer"
            >
              ดูประวัติการแก้ไขและผู้ทำรายการ ↗
            </Link>
          </p>
        )}
        <ProductDraftPreview data={draft} image={image} />
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
                    hint="หัวข้อบนการ์ดและหน้ารายละเอียด และชื่อ SEO ของหน้าสินค้า"
                    recommendedLength={60}
                    required
                    disabled={busy}
                  />
                  <FormField
                    label="URL สินค้า"
                    name="slug"
                    type={compact ? "hidden" : undefined}
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
                  hint="แสดงใต้ชื่อสินค้าในหน้ารายละเอียด และในสไลด์ที่อ้างอิงสินค้านี้"
                  recommendedLength={160}
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
                    aria-describedby={`${formId}-description-hint ${formId}-description-count${fieldError("description") ? ` ${formId}-description-error` : ""}`}
                  />
                  <small id={`${formId}-description-hint`} className="admin-field-hint">
                    ใช้เป็นรายละเอียดพื้นฐานและคำอธิบาย SEO ·
                    หน้าเนื้อหาที่มีรายละเอียดเพิ่มเติมจะใช้เนื้อหาจาก CMS ด้วย
                  </small>
                  <CharacterCount
                    id={`${formId}-description-count`}
                    value={draft.description}
                    max={5000}
                    recommended={160}
                  />
                  {fieldError("description") && (
                    <small id={`${formId}-description-error`} className="admin-field-error">
                      {fieldError("description")}
                    </small>
                  )}
                </div>
              </div>
            </section>
            <section className="admin-form-card" hidden={compact}>
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
                    type={compact ? "hidden" : undefined}
                    defaultValue={product?.[field.name]}
                    error={fieldError(field.name)}
                    required
                    maxLength={200}
                    hint="แสดงในตารางภาพรวมหน้ารายละเอียดและข้อมูลเปรียบเทียบสินค้า"
                    disabled={busy}
                  />
                ))}
              </div>
            </section>
            {!compact && (
              <ProductGalleryEditor
                images={gallery}
                primaryImage={image}
                disabled={busy}
                onChange={setGallery}
                onPrimary={setImage}
                onBusy={setGalleryUploading}
                onUploaded={(image) => uploadedImages.current.add(image)}
              />
            )}
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
                  แสดงบนการ์ดสินค้าและเป็นรูปหลักหน้ารายละเอียด · แนะนำภาพพื้นหลังเรียบ
                  เห็นสินค้าครบทั้งชิ้น · {imageHint(imageGuidelines.product)}
                </p>
                <a
                  className="admin-preview-link"
                  href={
                    compact && product
                      ? `/admin/products/${encodeURIComponent(product.id)}/edit#product-gallery`
                      : "#product-gallery"
                  }
                >
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
                    type={compact ? "hidden" : "number"}
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
                  <AdminDetailLink
                    className="admin-preview-link"
                    href={`/admin/content/product-media:${product.id}`}
                    kind="content"
                    recordId={`product-media:${product.id}`}
                    detailTitle={`รูปและเนื้อหา: ${product.name}`}
                  >
                    จัดการแกลเลอรี ราคา วิดีโอ และเนื้อหาเพิ่มเติม <ArrowUpRight size={14} />
                  </AdminDetailLink>
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
      {cropper}
    </>
  );
}
function FormField({
  label,
  name,
  error,
  required,
  hint,
  recommendedLength,
  ...props
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  recommendedLength?: number;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const [value, setValue] = useState(String(props.defaultValue ?? ""));
  if (props.type === "hidden") return <input {...props} name={name} />;
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
        aria-describedby={
          [
            error ? `${id}-error` : "",
            hint || name === "slug" ? `${id}-hint` : "",
            props.maxLength ? `${id}-count` : "",
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
        onChange={(event) => {
          setValue(event.target.value);
          props.onChange?.(event);
        }}
      />
      {error && (
        <small className="admin-field-error" id={`${id}-error`}>
          {error}
        </small>
      )}
      {name === "slug" && !error && (
        <small id={`${id}-hint`} className="admin-field-hint">
          /products/your-product · ใช้ A-Z, a-z, 0-9 ขีดกลางหรือขีดล่าง
        </small>
      )}
      {hint && (
        <small id={`${id}-hint`} className="admin-field-hint">
          {hint}
        </small>
      )}
      {props.maxLength && (
        <CharacterCount
          id={`${id}-count`}
          value={value}
          max={props.maxLength}
          recommended={recommendedLength}
        />
      )}
    </div>
  );
}
