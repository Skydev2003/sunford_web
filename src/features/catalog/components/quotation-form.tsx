"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { PdfBuyer } from "../data/quotation-pdf";
import type { QuotationIssue } from "../data/quotation-issue";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ChevronDown, ImageIcon, Printer, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { productCategoryDefinitions } from "../data/mock-categories";
import { ProductImage } from "@/components/ui/product-image";
import { Modal } from "@/components/ui/modal";
import {
  quotationTotals,
  seller,
  selectedQuoteItems,
  type QuotePreset,
  type QuoteProduct,
} from "../data/quotation";
import styles from "./quotation-form.module.css";

const money = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const amount = (satang: number) => money.format(satang / 100);
const pickerCategories = [{ id: "all", label: "ผลิตภัณฑ์ทั้งหมด" }, ...productCategoryDefinitions];
type Selection = {
  key: number;
  id: string;
  quantity: string;
  bundle?: { kitKey: number; model: string };
};

function ModelThumbnail({ product }: { product?: QuoteProduct }) {
  return (
    <span className={styles.thumbnail} aria-hidden="true">
      {product?.image || product?.fallbackImage ? (
        <ProductImage
          src={product.image}
          fallbackSrc={product.fallbackImage}
          alt=""
          fill
          sizes="36px"
        />
      ) : (
        <ImageIcon size={18} />
      )}
    </span>
  );
}

function SellerDetails() {
  return (
    <div className={styles.seller}>
      <Image src="/images/sunford-logo.png" width={120} height={30} alt="SUNFORD" />
      <div>
        <strong>{seller.name}</strong>
        <p>{seller.address}</p>
        <p>เลขประจำตัวผู้เสียภาษี {seller.taxId} (สำนักงานใหญ่)</p>
        <p>
          {seller.phone} · {seller.email} · {seller.website}
        </p>
      </div>
    </div>
  );
}

function Totals({ total }: { total: NonNullable<ReturnType<typeof quotationTotals>> }) {
  return (
    <dl className={styles.totals}>
      <div>
        <dt>ยอดก่อนภาษี</dt>
        <dd>{amount(total.net)}</dd>
      </div>
      <div>
        <dt>VAT 7%</dt>
        <dd>{amount(total.vat)}</dd>
      </div>
      <div>
        <dt>ยอดรวมทั้งสิ้น (บาท)</dt>
        <dd>{amount(total.gross)}</dd>
      </div>
    </dl>
  );
}

export function QuotationFromSelection({
  products,
  presets,
}: {
  products: QuoteProduct[];
  presets: QuotePreset[];
}) {
  const models = useSearchParams().getAll("model");
  const initial = selectedQuoteItems(models, presets);
  return (
    <QuotationForm
      key={JSON.stringify(initial)}
      products={products}
      initial={initial}
      presets={presets}
    />
  );
}

export function QuotationForm({
  products,
  initial = { items: [], pending: [] },
  presets = [],
}: {
  products: QuoteProduct[];
  initial?: ReturnType<typeof selectedQuoteItems>;
  presets?: QuotePreset[];
}) {
  const byId = new Map(products.map((product) => [product.id, product]));
  function modelKey(id: string) {
    return (byId.get(id)?.name ?? id).trim().toLowerCase();
  }
  const [rows, setRows] = useState<Selection[]>(() => {
    if (!initial.items.length) return [{ key: 0, id: "", quantity: "1" }];
    const seen = new Set<string>();
    const items = initial.items.filter((item) => {
      const model = modelKey(item.id);
      if (seen.has(model)) return false;
      seen.add(model);
      return true;
    });
    return items.map((item, key) => ({
      key,
      id: item.id,
      quantity: "1",
      bundle:
        item.includedIn && item.model
          ? {
              kitKey: items.findIndex((kit) => !kit.includedIn && kit.id === item.includedIn),
              model: item.model,
            }
          : undefined,
    }));
  });
  const [pending, setPending] = useState(initial.pending);
  const [pickerKey, setPickerKey] = useState<number | null>(null);
  const [modelQuery, setModelQuery] = useState("");
  const [category, setCategory] = useState(pickerCategories[0]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const firstResult = useRef<HTMLButtonElement>(null);
  const modelSearch = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (pickerKey !== null) modelSearch.current?.focus();
  }, [pickerKey]);
  const picking = rows.find((row) => row.key === pickerKey);
  const selectedModels = new Set(rows.filter((row) => row.id).map((row) => modelKey(row.id)));
  const searchTerm = modelQuery.trim().toLowerCase();
  const matches = picking
    ? products.filter(
        (product) =>
          !selectedModels.has(modelKey(product.id)) &&
          (category.id === "all" || product.categoryId === category.id) &&
          (product.name.toLowerCase().includes(searchTerm) ||
            product.id.toLowerCase().includes(searchTerm)),
      )
    : [];
  function openPicker(key: number) {
    setCategory(pickerCategories[0]);
    setFiltersOpen(false);
    setModelQuery("");
    setPickerKey(key);
  }
  const nextKey = useRef(rows.length);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pendingIssue = useRef<{ draft: string | File; key: string } | null>(null);
  const working = useRef(false);
  const lines = rows.map((row) => {
    const catalogProduct = byId.get(row.id);
    const product: QuoteProduct | undefined = row.bundle
      ? { id: row.id, name: row.bundle.model, unit: catalogProduct?.unit ?? "", unitSatang: 0 }
      : catalogProduct;
    const kit = row.bundle && rows.find((other) => other.key === row.bundle?.kitKey);
    const quantity = kit?.quantity ?? row.quantity;
    const qty = Number(quantity);
    const unit = product?.unit.trim();
    return {
      product,
      quantity,
      quantityLabel: unit ? `จำนวน (${unit})` : "จำนวน",
      qty,
      subtotal: product && Number.isSafeInteger(qty) && qty > 0 ? product.unitSatang * qty : 0,
    };
  });
  const total = quotationTotals(lines.reduce((sum, line) => sum + line.subtotal, 0));
  function changeQuantity(key: number, quantity: string) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, quantity } : row)));
  }
  function editProduct(edited: Selection, replacement?: string) {
    if (replacement && selectedModels.has(modelKey(replacement))) return;
    const nextKit = replacement && presets.find((preset) => preset.pricedId === replacement);
    const includedCode =
      replacement &&
      presets.find(
        (preset) => preset.pricedId && modelKey(preset.pricedId) === modelKey(replacement),
      )?.code;
    const includingKit =
      includedCode &&
      rows.find(
        (row) =>
          row.key !== edited.key &&
          !row.bundle &&
          presets.some(
            (preset) => preset.pricedId === row.id && preset.includesCodes?.includes(includedCode),
          ),
      );
    const previousKit = edited.bundle && rows.find((row) => row.key === edited.bundle?.kitKey);
    const nextRows: Selection[] = [];
    const unpriced: string[] = [];
    for (const row of rows) {
      if (row.key === edited.key) {
        if (replacement !== undefined)
          nextRows.push({
            key: row.key,
            id: replacement,
            quantity: previousKit?.quantity ?? row.quantity,
            bundle:
              includingKit && includedCode
                ? { kitKey: includingKit.key, model: includedCode }
                : undefined,
          });
      } else if (
        row.bundle?.kitKey === edited.key &&
        !(nextKit && nextKit.includesCodes?.includes(row.bundle.model))
      ) {
        if (byId.has(row.id))
          nextRows.push({ ...row, bundle: undefined, quantity: edited.quantity });
        else unpriced.push(row.bundle.model);
      } else nextRows.push(row);
    }
    if (unpriced.length) setPending((current) => [...new Set([...current, ...unpriced])]);
    setRows(nextRows.length ? nextRows : [{ key: nextKey.current++, id: "", quantity: "1" }]);
  }
  async function allocate(draft: string | File): Promise<QuotationIssue> {
    if (pendingIssue.current?.draft !== draft) {
      const key = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
      pendingIssue.current = { draft, key };
    }
    const response = await fetch("/api/quotations/issue", {
      method: "POST",
      headers: { "Idempotency-Key": pendingIssue.current.key },
    });
    if (!response.ok) throw new Error("ออกเลขเอกสารไม่ได้ในขณะนี้ กรุณาลองอีกครั้ง");
    return response.json();
  }
  async function print(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (working.current || pending.length) return;
    const missing = rows.find((row) => !row.id);
    if (missing) {
      openPicker(missing.key);
      return;
    }
    if (!total?.net) return;
    const form = new FormData(event.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "").trim();
    const buyer: PdfBuyer = {
      name: field("name"),
      address: field("address"),
      tax: field("tax"),
      branch: field("branch"),
      contact: field("contact"),
      phone: field("phone"),
      email: field("email"),
      website: "",
      reference: "",
    };
    setError("");
    working.current = true;
    setBusy(true);
    try {
      const { createBuyerPdf, downloadPdf } = await import("../data/quotation-pdf");
      const family = getComputedStyle(event.target as HTMLFormElement).fontFamily;
      await Promise.all([
        document.fonts.load("400 12px " + family, "สวัสดี"),
        document.fonts.load("600 12px " + family, "สวัสดี"),
      ]);
      const items = lines.map(({ product, qty }, index) => ({
        id: product!.id,
        name: product!.documentName ?? product!.name,
        quantity: qty,
        unitSatang: product!.unitSatang,
        details: rows[index].bundle ? "รวมในราคาชุด" : "",
      }));
      const pdf = await createBuyerPdf(buyer, items, family, () =>
        allocate(JSON.stringify([buyer, items])),
      );
      downloadPdf(pdf.bytes);
      pendingIssue.current = null;
    } catch (e) {
      setError(e instanceof Error ? e.message : "สร้าง PDF ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.editor}>
        <div className={styles.heading}>
          <h1>ใบเสนอราคา</h1>
        </div>
        <SellerDetails />
        <form onSubmit={print}>
          <fieldset>
            <legend>ข้อมูลลูกค้า</legend>
            <div className={styles.fields}>
              <label>
                ชื่อผู้ซื้อ / บริษัท
                <input
                  name="name"
                  autoComplete="organization"
                  required
                  maxLength={200}
                  pattern={".*\\S.*"}
                />
              </label>
              <label>
                เลขประจำตัวผู้เสียภาษี
                <input
                  name="tax"
                  inputMode="numeric"
                  pattern="[0-9]{13}"
                  maxLength={13}
                  title="ตัวเลข 13 หลัก"
                />
              </label>
              <label>
                สำนักงานใหญ่ / สาขา
                <input name="branch" maxLength={100} />
              </label>
              <label>
                ผู้ติดต่อ
                <input name="contact" autoComplete="name" maxLength={160} />
              </label>
              <label className={styles.full}>
                ที่อยู่
                <textarea
                  name="address"
                  autoComplete="street-address"
                  required
                  maxLength={600}
                  rows={2}
                />
              </label>
              <label>
                โทรศัพท์
                <input name="phone" type="tel" autoComplete="tel" maxLength={40} />
              </label>
              <label>
                อีเมล
                <input name="email" type="email" autoComplete="email" maxLength={200} />
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>รายการสินค้า</legend>
            {pending.length > 0 && (
              <div className={styles.pending}>
                <h2>รายการรอยืนยันราคา</h2>
                <p>
                  ติดต่อฝ่ายขายที่ {seller.phone} เพื่อยืนยันราคา
                  หรือเอารายการเหล่านี้ออกเพื่อออกใบเสนอราคาเฉพาะสินค้าที่มีราคาแล้ว
                </p>
                <ul>
                  {pending.map((label) => (
                    <li key={label}>
                      <span>{label} · 1 ชิ้น</span>
                      <button
                        type="button"
                        aria-label={`นำ ${label} ออก`}
                        onClick={() => {
                          setPending((current) => current.filter((item) => item !== label));
                        }}
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {products.length === 0 && !pending.length && (
              <p role="status">
                ยังไม่มีสินค้าที่ระบุราคาสำหรับออกใบเสนอราคา ติดต่อฝ่ายขายได้ที่ {seller.phone}
              </p>
            )}
            {products.length > 0 &&
              rows.map((row, index) => (
                <div key={row.key} className={styles.line}>
                  <label>
                    สินค้า
                    <button
                      type="button"
                      className={styles.modelTrigger}
                      aria-haspopup="dialog"
                      aria-label={`เลือกรุ่นสินค้ารายการที่ ${index + 1}${row.id ? ` · ${byId.get(row.id)?.name ?? row.bundle?.model ?? row.id}` : ""}`}
                      value={row.id}
                      onClick={() => openPicker(row.key)}
                    >
                      {row.id && <ModelThumbnail product={byId.get(row.id)} />}
                      <span>
                        {byId.get(row.id)?.name ?? row.bundle?.model ?? "เลือกรุ่นสินค้า"}
                      </span>
                      <ChevronDown size={16} aria-hidden="true" />
                    </button>
                  </label>
                  <label className={styles.quantityField}>
                    <span className={styles.quantityLabel} title={lines[index].quantityLabel}>
                      {lines[index].quantityLabel}
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="999999"
                      step="1"
                      required
                      readOnly={Boolean(row.bundle)}
                      value={lines[index].quantity}
                      onChange={(e) => changeQuantity(row.key, e.target.value)}
                    />
                  </label>
                  <div>
                    <small>ราคา/หน่วย (ก่อน VAT)</small>
                    {row.bundle
                      ? "รวมในราคาชุด"
                      : lines[index].product
                        ? amount(lines[index].product.unitSatang)
                        : "—"}
                  </div>
                  <div>
                    <small>รวมก่อน VAT (บาท)</small>
                    {lines[index].product ? amount(lines[index].subtotal) : "—"}
                  </div>
                  <button
                    className={styles.remove}
                    type="button"
                    aria-label={`ลบรายการที่ ${index + 1}`}
                    disabled={rows.length === 1}
                    onClick={() => editProduct(row)}
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            <button
              type="button"
              className={styles.add}
              disabled={!products.length}
              onClick={() => {
                setRows([...rows, { key: nextKey.current++, id: "", quantity: "1" }]);
              }}
            >
              <Plus size={16} />
              เพิ่มรายการสินค้า
            </button>
          </fieldset>
          {pending.length ? (
            <p>ยอดรวมจะคำนวณเมื่อทุกรายการมีราคา</p>
          ) : total ? (
            <Totals total={total} />
          ) : (
            <p role="alert">ยอดรวมสูงเกินช่วงที่รองรับ กรุณาตรวจสอบจำนวนสินค้า</p>
          )}
          {error && <p role="alert">{error}</p>}
          <div className={styles.actions}>
            <button
              className={styles.printButton}
              disabled={busy || pending.length > 0 || !products.length || !total}
            >
              <Printer size={18} />
              พิมพ์ / บันทึก PDF
            </button>
          </div>
        </form>
        <div className={styles.picker}>
          <Modal open={Boolean(picking)} onClose={() => setPickerKey(null)} title="เลือกรุ่นสินค้า">
            {picking && (
              <>
                <div className={styles.pickerTools}>
                  <div className={styles.modelSearch}>
                    <Search size={16} aria-hidden="true" />
                    <input
                      type="search"
                      ref={modelSearch}
                      aria-label="ค้นหาชื่อรุ่นหรือ SKU"
                      placeholder="ค้นหาชื่อรุ่นหรือ SKU"
                      value={modelQuery}
                      onChange={(event) => setModelQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          firstResult.current?.focus();
                        } else if (
                          event.key === "Enter" &&
                          matches.length === 1 &&
                          !event.nativeEvent.isComposing
                        ) {
                          event.preventDefault();
                          firstResult.current?.click();
                        }
                      }}
                    />
                  </div>
                  <button
                    className={styles.filterButton}
                    type="button"
                    aria-expanded={filtersOpen}
                    aria-controls="quotation-category-options"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                  >
                    <SlidersHorizontal size={16} aria-hidden="true" />
                    ฟิลเตอร์
                  </button>
                </div>
                <div
                  id="quotation-category-options"
                  role="group"
                  aria-label="หมวดสินค้า"
                  className={styles.categoryOptions}
                  hidden={!filtersOpen}
                >
                  {pickerCategories.map((option) => (
                    <button
                      type="button"
                      key={option.id}
                      aria-pressed={option.id === category.id}
                      onClick={() => setCategory(option)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {!filtersOpen && category.id !== "all" && <small>{category.label}</small>}
                <ul className={styles.modelList} aria-label="รุ่นสินค้า">
                  {matches.map((product, index) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        ref={index === 0 ? firstResult : undefined}
                        value={product.id}
                        title={product.id}
                        aria-label={product.name}
                        onClick={() => {
                          editProduct(picking, product.id);
                          setPickerKey(null);
                        }}
                      >
                        <ModelThumbnail product={product} />
                        <span>{product.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                {!matches.length && <p role="status">ไม่พบรุ่นสินค้า</p>}
              </>
            )}
          </Modal>
        </div>
        <details>
          <summary>ออกเลขให้ PDF รุ่นเดิมที่ยังไม่มีเลขเอกสาร</summary>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (working.current) return;
              const form = event.currentTarget;
              const file = (form.elements.namedItem("legacy") as HTMLInputElement).files?.[0];
              if (!file) return;
              working.current = true;
              setBusy(true);
              setError("");
              try {
                const { numberLegacyPdf, downloadPdf } = await import("../data/quotation-pdf");
                const family = getComputedStyle(form).fontFamily;
                await document.fonts.load("400 12px " + family, "กำไลพลอย");
                const pdf = await numberLegacyPdf(await file.arrayBuffer(), family, () =>
                  allocate(file),
                );
                downloadPdf(pdf.bytes);
                pendingIssue.current = null;
                form.reset();
              } catch (e) {
                setError(e instanceof Error ? e.message : "ออกเลขเอกสารไม่สำเร็จ");
              } finally {
                working.current = false;
                setBusy(false);
              }
            }}
          >
            <label>
              ไฟล์ใบเสนอราคาเดิม
              <input required type="file" name="legacy" accept="application/pdf" />
            </label>
            <button disabled={busy}>ออกเลขและดาวน์โหลด</button>
          </form>
        </details>
      </div>
    </main>
  );
}
