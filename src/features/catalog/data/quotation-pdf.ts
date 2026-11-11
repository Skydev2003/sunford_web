import {
  PDFDocument,
  PDFName,
  PDFNumber,
  type PDFPage,
  pushGraphicsState,
  popGraphicsState,
  rectangle,
  clip,
  endPath,
} from "pdf-lib";
import { quotationTotals } from "./quotation";
import { quotationContact, quotationDates, type QuotationIssue } from "./quotation-issue";

export type PdfBuyer = {
  name: string;
  address: string;
  tax: string;
  branch: string;
  contact: string;
  phone: string;
  email: string;
  website: string;
  reference: string;
};
export type PdfItem = {
  id: string;
  name: string;
  quantity: number;
  unitSatang: number;
  details: string;
};
export type SellerInput = {
  note: string;
  signature: File;
  qr: File;
};
const pageSize: [number, number] = [595.28, 841.89];
const width = 840,
  height = 1188;
const currency = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const amount = (n: number) => currency.format(n / 100);

export function bahtText(satang: number) {
  const digits = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const places = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"];
  function spell(n: number, leading = false): string {
    if (n >= 1000000) return spell(Math.floor(n / 1000000)) + "ล้าน" + spell(n % 1000000, true);
    return String(n)
      .split("")
      .map((v, i, s) => {
        const d = Number(v),
          pos = s.length - i - 1;
        if (!d) return "";
        if (!pos && d === 1 && (i > 0 || leading)) return "เอ็ด";
        return (pos === 1 && d <= 2 ? (d === 2 ? "ยี่" : "") : digits[d]) + places[pos];
      })
      .join("");
  }
  const whole = Math.floor(satang / 100),
    remainder = satang % 100;
  return (
    (whole || !remainder ? (spell(whole) || "ศูนย์") + "บาท" : "") +
    (remainder ? spell(remainder) + "สตางค์" : "ถ้วน")
  );
}

// Positions correspond to the 840 × 1188 proof of the source PDF (4 units per mm).
function layer(family: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 2382;
  canvas.height = 3483;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(canvas.width / width, canvas.height / height);
  ctx.fillStyle = "#202020";
  function font(size = 12.2, bold = false) {
    ctx.font = (bold ? "600 " : "400 ") + size + "px " + family;
  }
  font();
  function text(
    value: string,
    x: number,
    baseline: number,
    max: number,
    align: CanvasTextAlign = "left",
  ) {
    ctx.textAlign = align;
    ctx.fillText(value, x, baseline, max);
  }
  function wrap(value: string, max: number) {
    const segments = new Intl.Segmenter("th", { granularity: "word" });
    const rows: string[] = [];
    for (const paragraph of value.split(/\r?\n/)) {
      let row = "";
      for (const { segment } of segments.segment(paragraph)) {
        if (ctx.measureText(row + segment).width > max && row.trim()) {
          rows.push(row.trim());
          row = "";
        }
        for (const char of Array.from(segment)) {
          if (ctx.measureText(row + char).width > max && row) {
            rows.push(row.trim());
            row = "";
          }
          row += char;
        }
      }
      if (row.trim()) rows.push(row.trim());
    }
    return rows;
  }
  function block(
    value: string,
    x: number,
    baseline: number,
    max: number,
    available: number,
    bold = false,
  ) {
    for (let size = 12; size >= 7; size -= 0.5) {
      font(size, bold);
      const rows = wrap(value, max),
        step = size * 1.34;
      if (rows.length * step <= available + 1) {
        rows.forEach((row, i) => text(row, x, baseline + i * step, max));
        font();
        return;
      }
    }
    throw new Error("ข้อความยาวเกินช่องในใบเสนอราคา กรุณาย่อข้อมูลแล้วลองอีกครั้ง");
  }
  async function png() {
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("สร้างภาพเอกสารไม่สำเร็จ"))),
        "image/png",
      ),
    );
    return blob.arrayBuffer();
  }
  return { ctx, font, text, wrap, block, png };
}
const size = { x: 0, y: 0, width: pageSize[0], height: pageSize[1] };
const firstRow = 409,
  pageMargin = 40,
  bodyBottom = height - pageMargin;
const footerStart = 714,
  footerEnd = 1132;
const footerKey = PDFName.of("SunfordFooterTop");
export async function createBuyerPdf(
  buyer: PdfBuyer,
  items: PdfItem[],
  family: string,
  allocate: () => Promise<QuotationIssue>,
) {
  const total = quotationTotals(items.reduce((sum, i) => sum + i.unitSatang * i.quantity, 0));
  if (!items.length || !total) throw new Error("กรุณาตรวจสอบรายการสินค้า");
  const doc = await PDFDocument.create();
  doc.setTitle("SUNFORD ใบเสนอราคา");
  const response = await fetch("/images/quotation-template.png");
  if (!response.ok) throw new Error("โหลดแม่แบบไม่สำเร็จ");
  const template = await doc.embedPng(await response.arrayBuffer());
  let draw = layer(family),
    top = firstRow;
  function templateBand(page: PDFPage, start: number, end: number, at: number) {
    const scale = size.height / height;
    page.pushOperators(
      pushGraphicsState(),
      rectangle(0, (height - at - end + start) * scale, size.width, (end - start) * scale),
      clip(),
      endPath(),
    );
    page.drawImage(template, { ...size, y: (start - at) * scale });
    page.pushOperators(popGraphicsState());
  }
  function header() {
    draw.block(buyer.name.replace(/\s+\((?=[^)]*\)\s*จำกัด$)/u, "\n("), 105, 262, 212, 33, true);
    draw.block(buyer.address.replace(/\s+(\d{5})$/u, "\n$1"), 105, 297, 212, 49);
    draw.text(
      [buyer.tax, buyer.branch && "(" + buyer.branch + ")"].filter(Boolean).join(" "),
      105,
      345,
      212,
    );
    draw.text([buyer.phone, buyer.contact].filter(Boolean).join(" · ") || "-", 347, 262, 177);
    draw.text(buyer.email || "-", 347, 283, 177);
    draw.text(buyer.website || "-", 347, 304, 177);
    draw.text(buyer.reference || "-", 651, 203, 139);
  }
  async function finish(footerTop?: number) {
    const first = doc.getPageCount() === 0;
    const page = doc.addPage(pageSize);
    if (first && footerTop === footerStart) page.drawImage(template, size);
    else {
      if (first) templateBand(page, 0, firstRow, 0);
      if (footerTop !== undefined) templateBand(page, footerStart, footerEnd, footerTop);
    }
    if (footerTop !== undefined) {
      draw.ctx.save();
      draw.ctx.translate(0, footerTop - footerStart);
      draw.text(amount(total!.net) + " บาท", 498, 745, 100, "right");
      draw.text(amount(total!.vat) + " บาท", 498, 766, 100, "right");
      draw.text(bahtText(total!.gross), 496, 787, 280, "right");
      draw.ctx.fillStyle = "#48497e";
      draw.font(18.7, true);
      draw.text(amount(total!.gross), 759, 765, 125, "right");
      draw.font();
      draw.ctx.fillStyle = "#202020";
      draw.text(amount(total!.gross) + " บาท", 795, 835, 105, "right");
      draw.ctx.restore();
    }
    page.drawImage(await doc.embedPng(await draw.png()), size);
  }
  async function pageBreak() {
    await finish();
    draw = layer(family);
    top = pageMargin;
  }
  function divider(y: number) {
    draw.ctx.fillStyle = "#bbb";
    draw.ctx.fillRect(40, y, 760, 0.9);
    draw.ctx.fillStyle = "#202020";
  }
  header();
  for (const [i, item] of items.entries()) {
    const names = draw.wrap(item.name, 367),
      details = draw.wrap(item.details, 367);
    if (top + 40 > bodyBottom) await pageBreak();
    draw.text(String(i + 1) + ".", 49, top + 18, 20);
    draw.text("(" + item.id + ")", 69, top + 18, 345);
    for (const [x, value] of [
      [484, currency.format(item.quantity)],
      [558, amount(item.unitSatang)],
      [616, "0.00"],
      [706, amount(item.unitSatang * item.quantity)],
    ] as const)
      draw.text(value, x, top + 18, 70, "right");
    draw.text("-", 791, top + 17, 20, "right");
    top += 36;
    for (const name of names) {
      if (top + 4 > bodyBottom) {
        await pageBreak();
        top += 18;
      }
      draw.text(name, 65, top, 367);
      top += 18;
    }
    if ((details.length || i < items.length - 1) && top - 4 < bodyBottom) divider(top - 5);
    for (const detail of details) {
      if (top + 22 > bodyBottom) await pageBreak();
      draw.text(detail, 65, top + 18, 367);
      top += 18;
    }
    if (details.length && i < items.length - 1 && top + 16 < bodyBottom) divider(top + 15);
    top += details.length ? 19.5 : 7;
  }
  let footerTop = doc.getPageCount() === 0 ? Math.max(footerStart, top) : top;
  if (footerTop + footerEnd - footerStart > bodyBottom) {
    await pageBreak();
    footerTop = pageMargin;
  }
  await finish(footerTop);
  if (footerTop !== footerStart) doc.catalog.set(footerKey, PDFNumber.of(footerTop));
  return numberDocument(doc, family, allocate, true);
}

async function numberDocument(
  doc: PDFDocument,
  family: string,
  allocate: () => Promise<QuotationIssue>,
  firstPageOnly = false,
) {
  const issue = await allocate();
  const dates = quotationDates(issue.createdAt);
  const header = layer(family);
  header.text(issue.number, 651, 144, 139);
  header.text(dates.issued, 652, 164, 139);
  header.text(dates.expires, 651, 183, 139);
  header.text(quotationContact, 558, 272, 235);
  const overlay = await doc.embedPng(await header.png());
  for (const page of firstPageOnly ? [doc.getPage(0)] : doc.getPages())
    page.drawImage(overlay, size);
  doc.setSubject(
    doc.catalog.has(footerKey) ? "SUNFORD quotation / buyer v3" : "SUNFORD quotation / buyer v2",
  );
  doc.setTitle(issue.number);
  doc.setCreationDate(new Date(issue.createdAt));
  return { bytes: await doc.save(), number: issue.number };
}

export async function numberLegacyPdf(
  source: ArrayBuffer,
  family: string,
  allocate: () => Promise<QuotationIssue>,
) {
  const doc = await PDFDocument.load(source);
  if (doc.getSubject() !== "SUNFORD quotation / buyer v1")
    throw new Error("เลือก PDF ใบเดิมที่ยังไม่มีเลขเอกสาร");
  return numberDocument(doc, family, allocate);
}

export async function completeSellerPdf(source: ArrayBuffer, seller: SellerInput, family: string) {
  const doc = await PDFDocument.load(source);
  const number = doc.getTitle() ?? "";
  const version = doc.getSubject();
  const footerTop =
    version === "SUNFORD quotation / buyer v3"
      ? doc.catalog.lookupMaybe(footerKey, PDFNumber)?.asNumber()
      : footerStart;
  if (
    (version !== "SUNFORD quotation / buyer v2" && version !== "SUNFORD quotation / buyer v3") ||
    !/^\d{8}$/.test(number) ||
    footerTop === undefined ||
    !Number.isFinite(footerTop) ||
    footerTop < pageMargin ||
    footerTop + footerEnd - footerStart > bodyBottom
  )
    throw new Error(
      "เลือกใบเสนอราคาที่มีเลขเอกสารจากหน้าลูกค้า หากเป็น PDF รุ่นเดิม ให้นำไปออกเลขที่หน้าใบเสนอราคาก่อน",
    );
  const pages = doc.getPages();
  const signature = await createImageBitmap(seller.signature);
  const qr = await createImageBitmap(seller.qr);
  function fit(
    ctx: CanvasRenderingContext2D,
    img: ImageBitmap,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    // The source raster has different horizontal and vertical pixel densities.
    const naturalW = (img.width * width) / 2382,
      naturalH = (img.height * height) / 3483;
    const scale = Math.min(w / naturalW, h / naturalH);
    ctx.drawImage(
      img,
      x + (w - naturalW * scale) / 2,
      y + (h - naturalH * scale) / 2,
      naturalW * scale,
      naturalH * scale,
    );
  }
  try {
    const foot = layer(family);
    foot.ctx.translate(0, footerTop - footerStart);
    foot.block(seller.note, 124, 976, 665, 36);
    fit(foot.ctx, qr, 134, 1035, 89, 85);
    fit(foot.ctx, signature, 350, 1044, 118, 37);
    foot.text(
      quotationDates(doc.getCreationDate()!.toISOString()).issued,
      411,
      1113,
      105,
      "center",
    );
    pages[pages.length - 1].drawImage(await doc.embedPng(await foot.png()), size);
    doc.setSubject("SUNFORD quotation / issued");
    return { bytes: await doc.save(), number };
  } finally {
    signature.close();
    qr.close();
  }
}

export function downloadPdf(bytes: Uint8Array) {
  const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "SUNFORD.pdf";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
