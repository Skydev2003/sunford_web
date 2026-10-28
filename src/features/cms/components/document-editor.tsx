"use client";
/* eslint-disable @next/next/no-img-element -- The admin previews local and uploaded CMS images directly. */
import { imageSizeError } from "@/features/admin/media-limits";
import {
  useActionState,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronRight, Plus, Save, Trash2, Upload } from "lucide-react";
import { saveDocumentAction, deleteDocumentAction } from "../server/actions";
import { uploadProductImage } from "@/features/admin/server/media-actions";
import type { CmsData, CmsValue, Field } from "../types";
import { editorParent } from "../data/admin-sections";
import type { AdminDetailHandle } from "@/features/admin/detail-types";
import { CharacterCount } from "@/features/admin/components/character-count";
import { DraftPreview } from "@/features/admin/components/draft-preview";
import { useImageCropper } from "@/features/admin/components/image-cropper";
import { imageGuidelines, imageHint } from "@/features/admin/image-guidelines";
import { SafetyDialog } from "@/features/admin/components/safety-dialog";
import { useUnsavedForm } from "@/features/admin/components/unsaved-changes";

export function DocumentEditor({
  id,
  kind,
  title,
  data: initial,
  fields,
  version,
  productVersion,
  categories = [],
  saved = false,
  detailRef,
  onClose,
  onSaved,
  onBusyChange,
  onDirty,
  compact = false,
}: {
  id: string;
  kind: string;
  title: string;
  data: CmsData;
  fields: Field[];
  version: string;
  productVersion?: string;
  categories?: { id: string; label: string }[];
  saved?: boolean;
  detailRef?: Ref<AdminDetailHandle>;
  onClose?: () => void;
  onSaved?: () => void;
  onBusyChange?: (busy: boolean) => void;
  onDirty?: (dirty: boolean) => void;
  compact?: boolean;
}) {
  const [data, setData] = useState(initial);
  const [state, action, saving] = useActionState(saveDocumentAction, {});
  const [deleteState, deleteAction, deleting] = useActionState(deleteDocumentAction, {});
  const [uploads, setUploads] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const busy = saving || deleting || uploads > 0;
  const {
    discard,
    bindings: unsaved,
    dirty,
  } = useUnsavedForm({
    title,
    busy,
    saving: saving || deleting,
    success: state.success ? state : deleteState.success ? deleteState : undefined,
    resetKey: version,
    onDirty,
  });
  async function cancel() {
    if (!(await discard())) return false;
    onClose?.();
    return true;
  }
  useImperativeHandle(detailRef, () => ({
    cancel,
  }));
  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
  useEffect(() => {
    if (state.success || deleteState.success) onSaved?.();
  }, [state.success, deleteState.success, onSaved]);
  const parent = editorParent(id, kind);
  function uploadState(busy: boolean) {
    setUploads((count) => count + (busy ? 1 : -1));
  }
  return (
    <>
      {!compact &&
        (onClose ? (
          <button type="button" className="admin-back" disabled={busy} onClick={cancel}>
            กลับไปรายการ
          </button>
        ) : (
          parent && (
            <Link href={parent.href} className="admin-back">
              กลับไป{parent.label}
            </Link>
          )
        ))}
      <form
        {...unsaved}
        action={action}
        className="cms-editor"
        onReset={(event) => event.preventDefault()}
      >
        {onSaved && <input type="hidden" name="detail" value="1" />}
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="version" value={version} />
        <input type="hidden" name="productVersion" value={productVersion ?? ""} />
        <input type="hidden" name="data" value={JSON.stringify(data)} />
        {!compact && (
          <div className="admin-page-heading">
            <div>
              <span className="admin-eyebrow">{parent ? parent.label : "ตั้งค่าเว็บไซต์"}</span>
              <h1>{title}</h1>
              <p>
                บันทึกแล้วจะแสดงบนเว็บไซต์ทันที
                รูปและปุ่มที่อ้างอิงสินค้าจะเชื่อมไปยังหน้าสินค้านั้น
              </p>
            </div>
            <button className="button button-red" disabled={busy}>
              <Save size={16} />
              {saving ? "กำลังบันทึก…" : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </div>
        )}
        {saved && (
          <p className="admin-alert" role="status">
            บันทึกเรียบร้อยแล้ว
          </p>
        )}
        {state.error && (
          <p className="admin-alert error" style={{ whiteSpace: "pre-line" }} role="alert">
            {state.error}
          </p>
        )}
        {(!compact || !!version || !!initial.label) && (
          <p className="admin-field-hint">
            <Link
              href={`/admin/audit?type=${encodeURIComponent(kind)}&id=${encodeURIComponent(id)}`}
              target="_blank"
              rel="noreferrer"
            >
              ดูประวัติการแก้ไขและผู้ทำรายการ
            </Link>
          </p>
        )}
        {!compact && <DraftPreview id={id} kind={kind} title={title} data={data} fields={fields} />}
        <fieldset disabled={busy} className="cms-fieldset">
          <Fields
            fields={fields}
            data={data}
            onChange={setData}
            onUpload={uploadState}
            collapsible={id === "navigation"}
          />
        </fieldset>
        <div className="admin-form-bottom">
          <p role={dirty ? "status" : undefined}>
            {dirty ? "มีการแก้ไขที่ยังไม่ได้บันทึก" : "การบันทึกแก้ไขเฉพาะส่วนนี้"}
          </p>
          {compact && (
            <button
              type="button"
              className="admin-button-secondary"
              onClick={cancel}
              disabled={busy}
            >
              ยกเลิก
            </button>
          )}
          <button className="button button-red" disabled={busy}>
            <Save size={16} />
            {saving ? "กำลังบันทึก…" : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </form>
      {["page", "category"].includes(kind) && (!compact || !!version || !!initial.label) && (
        <section className="admin-form-card cms-delete">
          <h2>ลบ{kind === "page" ? "หน้าข้อมูล" : "หมวดหมู่"}</h2>
          <p>รายการจะไม่แสดงบนเว็บไซต์ โดยยังเก็บข้อมูลเดิมไว้ในถังขยะเพื่อกู้คืนได้</p>
          <button
            type="button"
            className="admin-button-danger"
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
          >
            ลบรายการนี้
          </button>
          <Link href="/admin/trash" className="admin-trash-link">
            เปิดถังขยะ
          </Link>
          <SafetyDialog
            open={confirmDelete}
            busy={busy}
            onClose={() => setConfirmDelete(false)}
            title={`ยืนยันลบ${kind === "page" ? "หน้าข้อมูล" : "หมวดหมู่"}`}
          >
            <p>
              ย้าย <strong>{String(initial.title ?? initial.label ?? title)}</strong> ไปถังขยะ
            </p>
            <p>ข้อมูลจะถูกซ่อนจากเว็บไซต์และกู้คืนได้จากหน้าถังขยะ</p>
            <form
              action={deleteAction}
              data-unsaved-form="confirmed-delete"
              onSubmit={unsaved.onSubmit}
            >
              {onSaved && <input type="hidden" name="detail" value="1" />}
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="kind" value={kind} />
              <input type="hidden" name="version" value={version} />
              <input type="hidden" name="sourcePath" value={String(data.sourcePath ?? "")} />
              {kind === "category" && (
                <label className="admin-field">
                  ย้ายสินค้าไปหมวดหมู่
                  <select name="replacement" required defaultValue="" disabled={busy}>
                    <option value="" disabled>
                      เลือกหมวดหมู่ปลายทาง
                    </option>
                    {categories
                      .filter(
                        (category) => category.id !== "all" && `category:${category.id}` !== id,
                      )
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                  </select>
                  <small>สินค้าทั้งหมดในหมวดนี้จะถูกย้ายก่อนลบ</small>
                </label>
              )}
              {deleteState.error && (
                <p role="alert" className="admin-alert error">
                  {deleteState.error}
                </p>
              )}
              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-button-secondary"
                  onClick={() => setConfirmDelete(false)}
                  disabled={busy}
                >
                  ยกเลิก
                </button>
                <button className="admin-button-danger" disabled={busy}>
                  <Trash2 size={16} />
                  ยืนยันการลบ
                </button>
              </div>
            </form>
          </SafetyDialog>
        </section>
      )}
    </>
  );
}
function Fields({
  fields,
  data,
  onChange,
  onUpload,
  collapsible = false,
  hidden = false,
  id,
}: {
  fields: Field[];
  data: CmsData;
  onChange: (value: CmsData) => void;
  onUpload: (busy: boolean) => void;
  collapsible?: boolean;
  hidden?: boolean;
  id?: string;
}) {
  return (
    <div className="cms-fields" hidden={hidden} id={id}>
      {fields.map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          value={data[field.key]}
          onChange={(value) => onChange({ ...data, [field.key]: value })}
          onUpload={onUpload}
          collapsible={collapsible}
        />
      ))}
    </div>
  );
}
function FieldInput({
  field,
  value,
  onChange,
  onUpload,
  collapsible = false,
}: {
  field: Field;
  value: CmsValue | undefined;
  onChange: (value: CmsValue) => void;
  onUpload: (busy: boolean) => void;
  collapsible?: boolean;
}) {
  const id = useId();
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [rowKeys, setRowKeys] = useState(() =>
    Array.isArray(value) ? value.map((_, index) => `${id}-item-${index}`) : [],
  );
  const { crop, cropper } = useImageCropper();
  async function upload(file?: File) {
    if (!file) return;
    const sizeError = imageSizeError(file);
    if (sizeError) {
      setError(sizeError);
      return;
    }
    onUpload(true);
    setError("");
    try {
      const prepared = await crop(file, field.imageSize ?? imageGuidelines.product);
      if (!prepared) return;
      const form = new FormData();
      form.set("file", prepared);
      const result = await uploadProductImage(form);
      if (result.error || !result.url) setError(result.error ?? "อัปโหลดไม่สำเร็จ");
      else onChange(result.url);
    } catch {
      setError("อัปโหลดไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      onUpload(false);
    }
  }
  if (field.type === "array") {
    const rows = (value ?? []) as CmsData[];
    function move(index: number, direction: number) {
      const next = [...rows];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      setRowKeys((current) => {
        const keys = [...current];
        [keys[index], keys[index + direction]] = [keys[index + direction], keys[index]];
        return keys;
      });
      setExpanded((current) =>
        current === index ? index + direction : current === index + direction ? index : current,
      );
      onChange(next);
    }
    return (
      <section className="admin-form-card cms-array">
        <h2>{field.label}</h2>
        {field.hint && <p>{field.hint}</p>}
        {rows.map((row, index) => {
          const summary = String(row.label || row.title || `รายการ ${index + 1}`);
          return (
            <div className="cms-array-row" key={rowKeys[index]}>
              <div className="cms-row-actions">
                {collapsible ? (
                  <button
                    type="button"
                    className="cms-array-toggle"
                    aria-label={`${field.label}: ${summary}`}
                    aria-expanded={expanded === index}
                    aria-controls={`${id}-row-${index}`}
                    onClick={() => setExpanded(expanded === index ? null : index)}
                  >
                    <ChevronRight size={16} />
                    <span>
                      <strong>{summary}</strong>
                      {typeof row.href === "string" && row.href && <small>{row.href}</small>}
                    </span>
                  </button>
                ) : (
                  <strong>รายการ {index + 1}</strong>
                )}
                <button
                  type="button"
                  aria-label={`เลื่อนรายการ ${index + 1} ขึ้น`}
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  aria-label={`เลื่อนรายการ ${index + 1} ลง`}
                  onClick={() => move(index, 1)}
                  disabled={index === rows.length - 1}
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  className="admin-danger"
                  aria-label={`นำรายการ ${index + 1} ออก`}
                  onClick={() => setRemoving(index)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <Fields
                fields={field.fields ?? []}
                data={row}
                onChange={(data) =>
                  onChange(rows.map((current, i) => (i === index ? data : current)))
                }
                onUpload={onUpload}
                collapsible={collapsible}
                hidden={collapsible && expanded !== index}
                id={`${id}-row-${index}`}
              />
            </div>
          );
        })}
        <button
          type="button"
          className="admin-button-secondary"
          onClick={() => {
            onChange([...rows, { ...field.initial }]);
            setRowKeys((current) => [...current, crypto.randomUUID()]);
            setExpanded(rows.length);
          }}
        >
          <Plus size={16} />
          เพิ่มรายการ
        </button>
        <SafetyDialog
          open={removing !== null}
          title="ยืนยันนำรายการออก"
          onClose={() => setRemoving(null)}
        >
          <p>
            นำรายการที่ {removing === null ? "" : removing + 1} และข้อมูลภายในออกจาก {field.label}{" "}
            การเปลี่ยนแปลงจะมีผลเมื่อบันทึกฟอร์ม
          </p>
          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-button-secondary"
              onClick={() => setRemoving(null)}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              className="admin-button-danger"
              onClick={() => {
                if (removing === null) return;
                setRowKeys((current) => current.filter((_, index) => index !== removing));
                setExpanded((current) =>
                  current === removing
                    ? null
                    : current !== null && current > removing
                      ? current - 1
                      : current,
                );
                onChange(rows.filter((_, index) => index !== removing));
                setRemoving(null);
              }}
            >
              ยืนยันนำรายการออก
            </button>
          </div>
        </SafetyDialog>
      </section>
    );
  }
  if (field.type === "html")
    return (
      <div className="admin-field cms-wide">
        <label id={`${id}-label`} htmlFor={id}>
          {field.label}
        </label>
        <RichText id={id} value={String(value ?? "")} onChange={onChange} onUpload={onUpload} />
        {field.maxLength && (
          <>
            <CharacterCount value={String(value ?? "")} max={field.maxLength} />
            <small>นับรวมแท็ก HTML · ระบบตรวจความยาวอีกครั้งเมื่อบันทึก</small>
          </>
        )}
        {field.hint && <small>{field.hint}</small>}
      </div>
    );
  return (
    <div className={`admin-field ${field.type === "textarea" ? "cms-wide" : ""}`}>
      <label htmlFor={id}>{field.label}</label>
      {field.type === "boolean" ? (
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
      ) : field.type === "select" ? (
        <select
          id={id}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          id={id}
          rows={4}
          maxLength={field.maxLength}
          aria-describedby={`${id}-help ${id}-count`}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : field.type === "image" ? (
        <>
          <div className="cms-image-preview">
            {value ? <img src={String(value)} alt={field.label} /> : <span>ยังไม่ได้เลือกรูป</span>}
          </div>
          <label className="admin-upload-button" htmlFor={id}>
            <Upload size={16} />
            เลือกรูปใหม่
            <input
              id={id}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                void upload(event.target.files?.[0]);
                event.target.value = "";
              }}
              className="admin-file-input"
            />
          </label>
          {value && (
            <button type="button" className="admin-button-secondary" onClick={() => onChange("")}>
              นำรูปออก
            </button>
          )}
          <small>{imageHint(field.imageSize ?? imageGuidelines.product)}</small>
          {cropper}
          {error && (
            <p role="alert" className="admin-field-error">
              {error}
            </p>
          )}
        </>
      ) : (
        <input
          id={id}
          type={field.type === "number" ? "number" : "text"}
          maxLength={field.maxLength}
          aria-describedby={`${id}-help ${id}-count`}
          min={field.type === "number" ? 0 : undefined}
          step={field.type === "number" ? "any" : undefined}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {field.hint && (
        <small id={`${id}-help`} className="admin-field-hint">
          {field.hint}
        </small>
      )}
      {(!field.type || ["text", "textarea"].includes(field.type)) && field.maxLength && (
        <CharacterCount
          id={`${id}-count`}
          value={String(value ?? "")}
          max={field.maxLength}
          recommended={field.recommendedLength}
        />
      )}
    </div>
  );
}
function RichText({
  id,
  value,
  onChange,
  onUpload,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (busy: boolean) => void;
}) {
  const editor = useRef<HTMLDivElement>(null);
  const [initial] = useState(value);
  const range = useRef<Range | null>(null);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [source, setSource] = useState(false);
  const { crop, cropper } = useImageCropper();
  function remember() {
    const selection = window.getSelection();
    if (selection?.rangeCount && editor.current?.contains(selection.anchorNode))
      range.current = selection.getRangeAt(0).cloneRange();
  }
  function command(name: string, value?: string) {
    editor.current?.focus();
    const selection = window.getSelection();
    if (range.current && editor.current?.contains(range.current.startContainer)) {
      selection?.removeAllRanges();
      selection?.addRange(range.current);
    }
    document.execCommand(name, false, value);
    onChange(editor.current?.innerHTML ?? "");
    remember();
  }
  async function upload(file?: File) {
    if (!file) return;
    const sizeError = imageSizeError(file);
    if (sizeError) {
      setError(sizeError);
      return;
    }
    onUpload(true);
    setError("");
    try {
      const prepared = await crop(file, imageGuidelines.cover);
      if (!prepared) return;
      const form = new FormData();
      form.set("file", prepared);
      const result = await uploadProductImage(form);
      if (result.url) command("insertImage", result.url);
      else setError(result.error ?? "อัปโหลดไม่สำเร็จ");
    } catch {
      setError("อัปโหลดไม่สำเร็จ");
    } finally {
      onUpload(false);
    }
  }
  return (
    <div className="cms-rich-editor">
      <div className="cms-toolbar">
        <button type="button" onClick={() => command("bold")} disabled={source}>
          <b>B</b>
        </button>
        <button type="button" onClick={() => command("italic")} disabled={source}>
          <i>I</i>
        </button>
        <button type="button" onClick={() => command("formatBlock", "h2")} disabled={source}>
          หัวข้อ
        </button>
        <button type="button" onClick={() => command("formatBlock", "p")} disabled={source}>
          ย่อหน้า
        </button>
        <button type="button" onClick={() => command("insertUnorderedList")} disabled={source}>
          รายการ
        </button>
        <button type="button" onClick={() => command("unlink")} disabled={source}>
          เอาลิงก์ออก
        </button>
        <button
          type="button"
          onClick={() => {
            if (source && editor.current) editor.current.innerHTML = value;
            setSource(!source);
          }}
        >
          {" "}
          {source ? "แสดงตัวอย่าง" : "แก้ไข HTML"}
        </button>
      </div>
      <div className="cms-toolbar">
        <input
          type="text"
          aria-label="URL สำหรับแทรกลิงก์"
          placeholder="/path หรือ https://"
          value={link}
          onChange={(event) => setLink(event.target.value)}
        />
        <button
          type="button"
          disabled={source || !link}
          onClick={() => command("createLink", link)}
        >
          ใส่ลิงก์
        </button>
        <label className="admin-upload-button">
          แทรกรูป
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="admin-file-input"
            disabled={source}
            onChange={(event) => {
              void upload(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
      </div>
      <div
        id={id}
        ref={editor}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-labelledby={`${id}-label`}
        className="cms-rich-content source-prose"
        hidden={source}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        onKeyUp={remember}
        onMouseUp={remember}
        dangerouslySetInnerHTML={{ __html: initial }}
      />
      {source && (
        <textarea
          rows={18}
          aria-label="เนื้อหา HTML"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {error && (
        <p role="alert" className="admin-field-error">
          {error}
        </p>
      )}
      <small className="admin-field-hint">รูปในเนื้อหา: {imageHint(imageGuidelines.cover)}</small>
      {cropper}
    </div>
  );
}
