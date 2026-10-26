"use client";
/* eslint-disable @next/next/no-img-element -- The admin previews local and uploaded CMS images directly. */
import { useActionState, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Plus, Save, Trash2, Upload } from "lucide-react";
import { saveDocumentAction, deleteDocumentAction } from "../server/actions";
import { uploadProductImage } from "@/features/admin/server/media-actions";
import type { CmsData, CmsValue, Field } from "../types";

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
}) {
  const [data, setData] = useState(initial);
  const [state, action, saving] = useActionState(saveDocumentAction, {});
  const [deleteState, deleteAction, deleting] = useActionState(deleteDocumentAction, {});
  const [uploads, setUploads] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const busy = saving || deleting || uploads > 0;
  function uploadState(busy: boolean) {
    setUploads((count) => count + (busy ? 1 : -1));
  }
  return (
    <>
      <Link
        href={kind === "category" ? "/admin/categories" : "/admin/content"}
        className="admin-back"
      >
        ← กลับไปจัดการเนื้อหา
      </Link>
      <form action={action} className="cms-editor">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="version" value={version} />
        <input type="hidden" name="productVersion" value={productVersion ?? ""} />
        <input type="hidden" name="data" value={JSON.stringify(data)} />
        <div className="admin-page-heading">
          <div>
            <span className="admin-eyebrow">WEBSITE CONTENT</span>
            <h1>
              {title}
              <span>.</span>
            </h1>
            <p>
              บันทึกแล้วจะแสดงบนเว็บไซต์ทันที รูปและปุ่มที่อ้างอิงสินค้าจะเชื่อมไปยังหน้าสินค้านั้น
            </p>
          </div>
          <button className="button button-red" disabled={busy}>
            <Save size={16} />
            {saving ? "กำลังบันทึก…" : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
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
        <fieldset disabled={busy} className="cms-fieldset">
          <Fields fields={fields} data={data} onChange={setData} onUpload={uploadState} />
        </fieldset>
        <div className="admin-form-bottom">
          <p>การบันทึกแก้ไขเฉพาะส่วนนี้</p>
          <button className="button button-red" disabled={busy}>
            <Save size={16} />
            {saving ? "กำลังบันทึก…" : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </form>
      {["page", "category"].includes(kind) && (
        <section className="admin-form-card cms-delete">
          <h2>ลบ{kind === "page" ? "หน้าข้อมูล" : "หมวดหมู่"}</h2>
          <p>รายการจะไม่แสดงบนเว็บไซต์ โดยยังเก็บข้อมูลเดิมไว้ในระบบ</p>
          {!confirmDelete ? (
            <button
              type="button"
              className="admin-button-secondary"
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
            >
              ลบรายการนี้
            </button>
          ) : (
            <form action={deleteAction}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="kind" value={kind} />
              <input type="hidden" name="version" value={version} />
              <input type="hidden" name="sourcePath" value={String(data.sourcePath ?? "")} />
              {kind === "category" && (
                <label className="admin-field">
                  ย้ายสินค้าไปหมวดหมู่
                  <select name="replacement" required defaultValue="">
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
                <button className="button button-red" disabled={busy}>
                  <Trash2 size={16} />
                  ยืนยันการลบ
                </button>
              </div>
            </form>
          )}
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
}: {
  fields: Field[];
  data: CmsData;
  onChange: (value: CmsData) => void;
  onUpload: (busy: boolean) => void;
}) {
  return (
    <div className="cms-fields">
      {fields.map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          value={data[field.key]}
          onChange={(value) => onChange({ ...data, [field.key]: value })}
          onUpload={onUpload}
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
}: {
  field: Field;
  value: CmsValue | undefined;
  onChange: (value: CmsValue) => void;
  onUpload: (busy: boolean) => void;
}) {
  const id = useId();
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    onUpload(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
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
      onChange(next);
    }
    return (
      <section className="admin-form-card cms-array">
        <h2>{field.label}</h2>
        {field.hint && <p>{field.hint}</p>}
        {rows.map((row, index) => (
          <div className="cms-array-row" key={index}>
            <div className="cms-row-actions">
              <strong>รายการ {index + 1}</strong>
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
                aria-label={`นำรายการ ${index + 1} ออก`}
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
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
            />
          </div>
        ))}
        <button
          type="button"
          className="admin-button-secondary"
          onClick={() => onChange([...rows, { ...field.initial }])}
        >
          <Plus size={16} />
          เพิ่มรายการ
        </button>
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
          <small>JPG, PNG หรือ WebP ไม่เกิน 5 MB</small>
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
          min={field.type === "number" ? 0 : undefined}
          step={field.type === "number" ? "any" : undefined}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {field.hint && <small className="admin-field-hint">{field.hint}</small>}
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
    onUpload(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
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
    </div>
  );
}
