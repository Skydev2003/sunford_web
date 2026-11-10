"use client";

import { useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Printer, Plus, X } from "lucide-react";
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
type Selection = { key: number; id: string; quantity: string };
type Buyer = {
  name: string;
  address: string;
  tax: string;
  branch: string;
  contact: string;
  phone: string;
  email: string;
  date: string;
};

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
  return <QuotationForm key={JSON.stringify(initial)} products={products} initial={initial} />;
}

export function QuotationForm({
  products,
  initial = { ids: [], pending: [] },
}: {
  products: QuoteProduct[];
  initial?: ReturnType<typeof selectedQuoteItems>;
}) {
  const [rows, setRows] = useState<Selection[]>(() =>
    (initial.ids.length ? initial.ids : [""]).map((id, key) => ({ key, id, quantity: "1" })),
  );
  const [pending, setPending] = useState(initial.pending);
  const nextKey = useRef(rows.length);
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const byId = new Map(products.map((product) => [product.id, product]));
  const lines = rows.map((row) => {
    const product = byId.get(row.id);
    const qty = Number(row.quantity);
    return {
      product,
      qty,
      subtotal: product && Number.isSafeInteger(qty) && qty > 0 ? product.unitSatang * qty : 0,
    };
  });
  const total = quotationTotals(lines.reduce((sum, line) => sum + line.subtotal, 0));
  function change(key: number, value: Partial<Pick<Selection, "id" | "quantity">>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...value } : row)));
  }
  function print(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.length || !products.length || !total?.net) return;
    const form = new FormData(event.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "").trim();
    flushSync(() =>
      setBuyer({
        name: field("name"),
        address: field("address"),
        tax: field("tax"),
        branch: field("branch"),
        contact: field("contact"),
        phone: field("phone"),
        email: field("email"),
        date: new Intl.DateTimeFormat("th-TH-u-ca-gregory", {
          dateStyle: "long",
          timeZone: "Asia/Bangkok",
        }).format(new Date()),
      }),
    );
    window.print();
  }
  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.editor}>
        <div className={styles.heading}>
          <h1>ใบเสนอราคา</h1>
          <p>กรอกข้อมูลผู้ซื้อและเลือกสินค้า เพื่อพิมพ์ใบเสนอราคาหรือบันทึกเป็น PDF</p>
        </div>
        <SellerDetails />
        <form onSubmit={print} onChange={() => setBuyer(null)}>
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
                          setBuyer(null);
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
                    <select
                      value={row.id}
                      required
                      onChange={(e) => change(row.key, { id: e.target.value })}
                    >
                      <option value="">เลือกรุ่นสินค้า</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.id} · {product.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    จำนวน{lines[index].product && ` (${lines[index].product.unit})`}
                    <input
                      type="number"
                      min="1"
                      max="999999"
                      step="1"
                      required
                      value={row.quantity}
                      onChange={(e) => change(row.key, { quantity: e.target.value })}
                    />
                  </label>
                  <div>
                    <small>ราคา/หน่วย (ก่อน VAT)</small>
                    {lines[index].product ? amount(lines[index].product.unitSatang) : "—"}
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
                    onClick={() => {
                      setBuyer(null);
                      setRows(rows.filter((item) => item.key !== row.key));
                    }}
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
                setBuyer(null);
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
          <div className={styles.actions}>
            <button
              className={styles.printButton}
              disabled={pending.length > 0 || !products.length || !total}
            >
              <Printer size={18} />
              พิมพ์ / บันทึก PDF
            </button>
          </div>
        </form>
      </div>
      <article className={styles.sheet} aria-label="ใบเสนอราคาสำหรับพิมพ์">
        {buyer && total ? (
          <>
            <div className={styles.printTitle}>
              <h1>ใบเสนอราคา</h1>
              <p>วันที่ออก {buyer.date}</p>
            </div>
            <SellerDetails />
            <div className={styles.customer}>
              <h2>ลูกค้า</h2>
              <strong>{buyer.name}</strong>
              <p>{buyer.address}</p>
              {(buyer.tax || buyer.branch) && (
                <p>
                  {buyer.tax && `เลขประจำตัวผู้เสียภาษี ${buyer.tax}`} {buyer.branch}
                </p>
              )}
              {buyer.contact && <p>ผู้ติดต่อ {buyer.contact}</p>}
              {(buyer.phone || buyer.email) && (
                <p>{[buyer.phone, buyer.email].filter(Boolean).join(" · ")}</p>
              )}
            </div>
            <table>
              <thead>
                <tr>
                  <th>รายการสินค้า</th>
                  <th>จำนวน</th>
                  <th>ราคา/หน่วย¹</th>
                  <th>รวม (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {lines.map(({ product, qty, subtotal }, index) => (
                  <tr key={rows[index].key}>
                    <td>
                      {product?.id} · {product?.name}
                    </td>
                    <td>
                      {qty} {product?.unit}
                    </td>
                    <td>{product && amount(product.unitSatang)}</td>
                    <td>{amount(subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>¹ ราคาต่อหน่วยและยอดรายการเป็นราคาก่อน VAT 7%</p>
            <Totals total={total} />
            <div className={styles.payment}>
              <h2>ข้อมูลการชำระเงิน</h2>
              <p>{seller.bank}</p>
              <p>ชื่อบัญชี {seller.name}</p>
            </div>
          </>
        ) : (
          <p>กรอกข้อมูลและกด “พิมพ์ / บันทึก PDF” บนหน้าใบเสนอราคา</p>
        )}
      </article>
    </main>
  );
}
