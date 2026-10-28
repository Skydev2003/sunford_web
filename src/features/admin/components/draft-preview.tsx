"use client";
import { useState } from "react";
import type { CmsData, Field } from "@/features/cms/types";
import { editorPlacement } from "@/features/cms/data/editor-guidance";

const escape = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const storageOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "";
function safeImage(value: string) {
  return (
    (/^\/images\/[\w/.-]+$/.test(value) && !value.split("/").includes("..")) ||
    Boolean(storageOrigin && value.startsWith(`${storageOrigin}/storage/v1/object/public/`))
  );
}
function picture(value: unknown) {
  return typeof value === "string" && safeImage(value)
    ? `<img src="${escape(value)}" alt="ตัวอย่างรูปที่เลือก">`
    : "";
}
function rich(value: unknown) {
  const document = new DOMParser().parseFromString(String(value ?? ""), "text/html");
  const allowed = new Set(
    "P DIV SPAN STRONG B EM I U BR H1 H2 H3 H4 H5 H6 UL OL LI TABLE TBODY THEAD TR TH TD BLOCKQUOTE A IMG FIGURE FIGCAPTION DETAILS SUMMARY".split(
      " ",
    ),
  );
  for (const element of [...document.body.querySelectorAll("*")]) {
    if (!allowed.has(element.tagName)) {
      element.remove();
      continue;
    }
    const source = element.getAttribute("src") ?? "";
    const alt = element.getAttribute("alt") ?? "";
    for (const attribute of [...element.attributes]) element.removeAttribute(attribute.name);
    if (element.tagName === "IMG") {
      if (!safeImage(source)) {
        element.remove();
        continue;
      }
      element.setAttribute("src", source);
      element.setAttribute("alt", alt);
    }
  }
  return document.body.innerHTML;
}

function blocks(fields: Field[], data: CmsData): string {
  return fields
    .map((field) => {
      const value = data[field.key];
      if (field.type === "array")
        return `<section><h3>${escape(field.label)}</h3>${((value ?? []) as CmsData[]).map((row, index) => `<article><small>รายการ ${index + 1}</small>${blocks(field.fields ?? [], row)}</article>`).join("")}</section>`;
      if (field.type === "html")
        return `<section><h3>${escape(field.label)}</h3>${rich(value)}</section>`;
      if (field.type === "image")
        return `<figure><figcaption>${escape(field.label)}</figcaption>${picture(value)}</figure>`;
      if (field.type === "boolean")
        return `<p>${escape(field.label)}: ${value ? "เปิด" : "ปิด"}</p>`;
      const text =
        field.type === "select"
          ? (field.options?.find((option) => option.value === String(value))?.label ?? value)
          : value;
      return `<div class="mapped"><small>${escape(field.label)}</small><p>${escape(text).replaceAll("\n", "<br>") || "—"}</p></div>`;
    })
    .join("");
}

function documentBody(id: string, kind: string, fields: Field[], data: CmsData) {
  if (kind === "page") {
    const html = rich(data.html);
    const text =
      new DOMParser()
        .parseFromString(html, "text/html")
        .body.textContent?.replace(/\s+/g, " ")
        .trim() ?? "";
    const cover = ((data.images ?? []) as CmsData[])[0]?.image;
    return `<header><small>${escape(data.kind)}</small><h1>${escape(data.title)}</h1><p class="path">${escape(data.path)}</p></header>${picture(cover)}<section>${html}</section>${blocks(
      fields.filter((field) => ["productIds", "videos"].includes(field.key)),
      data,
    )}<section><small>ข้อมูล SEO · คำอธิบายมาจากข้อความต้นเนื้อหาไม่เกิน 160 ตัวอักษร</small><h3>${escape(data.title)} | SUNFORD</h3><p>${escape(text.slice(0, 160))}</p></section>`;
  }
  if (id === "hero") {
    const slides = (data.slides ?? []) as CmsData[];
    const options = fields
      .find((field) => field.key === "slides")
      ?.fields?.find((field) => field.key === "productId")?.options;
    return `<aside>${escape(data.announcement)} · ${escape(data.announcementLabel)}</aside>${slides.map((slide, index) => `<section class="hero"><small>สไลด์ ${index + 1}</small><div class="columns"><div><h1>${escape(slide.title || options?.find((option) => option.value === slide.productId)?.label || "SUNFORD")}</h1><h2>${escape(data.tagline)}</h2><p>${escape(slide.description || "ใช้คำโปรยจากสินค้าที่อ้างอิง")}</p><span class="cta">${escape(data.primaryLabel)}</span> <span class="cta secondary">${escape(data.secondaryLabel)}</span></div>${picture(slide.image) || "<p>ใช้รูปหรือวิดีโอจากสินค้าที่อ้างอิง</p>"}</div></section>`).join("")}`;
  }
  return blocks(fields, data);
}

export function DraftPreview({
  id,
  kind,
  title,
  data,
  fields,
}: {
  id: string;
  kind: string;
  title: string;
  data: CmsData;
  fields: Field[];
}) {
  return (
    <PreviewFrame
      title={title}
      placement={editorPlacement(id, kind)}
      body={() => documentBody(id, kind, fields, data)}
    />
  );
}

export function ProductDraftPreview({
  data,
  image,
}: {
  data: Record<string, string>;
  image: string;
}) {
  return (
    <PreviewFrame
      title="ข้อมูลสินค้า"
      placement="การ์ดสินค้าและหน้ารายละเอียด / รูปหลัก / ชื่อและคำโปรย / ข้อมูลทางเทคนิค · ชื่อและรายละเอียดใช้ใน SEO ด้วย"
      body={() =>
        `<div class="columns"><div>${picture(image)}</div><div><h1>${escape(data.name)}</h1><p>${escape(data.subtitle)}</p><table><tbody>${[
          ["น้ำหนัก", data.capacity],
          ["ค่าละเอียด", data.readability],
          ["การเชื่อมต่อระบบ", data.connection],
        ]
          .map(([label, value]) => `<tr><th>${label}</th><td>${escape(value || "—")}</td></tr>`)
          .join(
            "",
          )}</tbody></table></div></div><h2>รายละเอียดสินค้า</h2><p>${escape(data.description).replaceAll("\n", "<br>")}</p><section><small>ตัวอย่างข้อมูล SEO · การตัดข้อความขึ้นอยู่กับเครื่องมือค้นหา</small><h3>${escape(data.name)} | SUNFORD</h3><p class="path">/products/${escape(data.slug)}</p><p>${escape(data.description)}</p></section>`
      }
    />
  );
}

function PreviewFrame({
  title,
  placement,
  body,
}: {
  title: string;
  placement: string;
  body: () => string;
}) {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  return (
    <section className="admin-draft-preview" aria-label={`ตัวอย่างฉบับร่าง ${title}`}>
      <p className="admin-field-hint">ตำแหน่งบนเว็บไซต์: {placement}</p>
      <button
        type="button"
        className="admin-button-secondary"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? "ซ่อนตัวอย่างฉบับร่าง" : "ดูตัวอย่างฉบับร่าง"}
      </button>
      {open && (
        <>
          <div className="admin-preview-toolbar">
            <strong>ตัวอย่างเนื้อหา · ยังไม่บันทึก</strong>
            <button
              type="button"
              className="admin-button-secondary"
              aria-pressed={mobile}
              onClick={() => setMobile(!mobile)}
            >
              {mobile ? "ขนาดเต็มพื้นที่" : "ขนาดมือถือ 390px"}
            </button>
          </div>
          <p className="admin-field-hint">
            อัปเดตตามช่องกรอกทันที เป็นตัวอย่างเนื้อหาและลำดับบล็อก
            รูปแบบหน้าเว็บจริงรวมส่วนอื่นของเว็บไซต์และข้อมูลสินค้าที่อ้างอิงด้วย
          </p>
          <iframe
            title={`ตัวอย่างฉบับร่าง ${title}`}
            sandbox=""
            className={mobile ? "is-mobile" : ""}
            srcDoc={`<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' ${storageOrigin}; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><style>*{box-sizing:border-box}body{margin:0;padding:24px;font:15px/1.7 sans-serif;color:#202720;overflow-wrap:anywhere;background:white}h1{font-size:30px;line-height:1.3}h2{font-size:23px}h3{font-size:18px}small,figcaption,.path{color:#687268;font-size:12px}p{white-space:pre-wrap}img{display:block;max-width:100%;max-height:350px;object-fit:contain;margin:auto}section,article{border-bottom:1px solid #e6e9e4;padding:16px 0}article{padding:12px}figure{margin:16px 0}.mapped{margin:12px 0}.mapped p{margin:4px 0}.columns{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center}aside{padding:12px;background:#f3f5f1}.cta{display:inline-block;background:#e92629;color:white;padding:10px 16px;border-radius:6px}.secondary{background:#f0f1ef;color:#222}table{width:100%;border-collapse:collapse}th,td{text-align:left;border-bottom:1px solid #eee;padding:10px}a{pointer-events:none}@media(max-width:600px){body{padding:16px}.columns{grid-template-columns:1fr}h1{font-size:25px}}</style></head><body>${body()}</body></html>`}
          />
        </>
      )}
    </section>
  );
}
