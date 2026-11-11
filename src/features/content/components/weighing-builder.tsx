"use client";

import { useRef, useState } from "react";
import { Monitor, Layers, Cable, Search, Check, Plus, X } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import styles from "./weighing-builder.module.css";
import { quotationTotals } from "@/features/catalog/data/quotation";

import type { WeighingOption } from "../data/weighing-options";
const categories = [
  { kind: "head", label: "หัวอ่าน", icon: Monitor },
  { kind: "platform", label: "แท่นชั่ง", icon: Layers },
  { kind: "accessory", label: "อุปกรณ์เสริม", icon: Cable },
] as const;
const baht = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" });

function optionName(option: WeighingOption) {
  if (option.displayName) return option.displayName;
  if (option.kind !== "platform") return option.code;
  const [series, capacity] = option.code.split("-");
  return `${series} · ${capacity} กก.`;
}

export function WeighingBuilder({ options }: { options: WeighingOption[] }) {
  const [kind, setKind] = useState<WeighingOption["kind"]>("head");
  const heading = useRef<HTMLHeadingElement>(null);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("");
  const [selected, setSelected] = useState<WeighingOption[]>([]);
  const head = selected.find((o) => o.kind === "head");
  const platform = selected.find((o) => o.kind === "platform");
  const first = selected[0];
  const headPlatformPairs = Object.fromEntries(
    options.filter((o) => o.kind === "head").map((o) => [o.code, o.compatibleCodes ?? []]),
  );
  const pairedPlatforms = new Set(Object.values(headPlatformPairs).flat());
  const groups = [...new Set(options.map((o) => o.group).filter(Boolean))];
  const visible = options.filter(
    (o) =>
      o.kind === kind &&
      (kind !== "accessory" || !head || Boolean(o.compatibleCodes?.includes(head.code))) &&
      (kind === "accessory" || !group || o.group === group) &&
      (kind !== "head" ||
        first?.kind !== "platform" ||
        headPlatformPairs[o.code]?.includes(first.code)) &&
      (kind !== "platform" ||
        (first?.kind === "head"
          ? headPlatformPairs[first.code]?.includes(o.code)
          : pairedPlatforms.has(o.code))) &&
      [o.code, o.description, o.group].join(" ").toLowerCase().includes(query.trim().toLowerCase()),
  );
  function openStep(next: WeighingOption["kind"]) {
    setKind(next);
    setQuery("");
    setGroup("");
    heading.current?.focus();
  }
  function remove(option: WeighingOption) {
    if (option.kind === "accessory") {
      setSelected((previous) => previous.filter((o) => o.code !== option.code));
    } else {
      setSelected((previous) =>
        previous.filter((o) => o.kind !== "accessory" && o.kind !== option.kind),
      );
      openStep(option.kind);
    }
  }
  function choose(option: WeighingOption) {
    if (option.kind !== "accessory") {
      if (!first || first.kind === option.kind) {
        if (first?.code !== option.code) setSelected([option]);
        openStep(option.kind === "head" ? "platform" : "head");
      } else {
        const headCode = option.kind === "head" ? option.code : first.code;
        const platformCode = option.kind === "platform" ? option.code : first.code;
        if (!headPlatformPairs[headCode]?.includes(platformCode)) return;
        if (selected[1]?.code !== option.code) setSelected([first, option]);
        openStep("accessory");
      }
    } else if (head && platform) {
      setSelected((previous) =>
        previous.some((o) => o.code === option.code)
          ? previous.filter((o) => o.code !== option.code)
          : [...previous, option],
      );
    }
  }
  const pricedSelection = platform?.includesHead
    ? selected.filter((option) => option.kind !== "head")
    : selected;
  const priced =
    pricedSelection.length > 0 && pricedSelection.every((o) => o.price !== null && o.price > 0);
  const sourceNet = pricedSelection.every((option) => typeof option.netUnitSatang === "number")
    ? pricedSelection.reduce((sum, option) => sum + (option.netUnitSatang ?? 0), 0)
    : null;
  const totalPrice =
    sourceNet === null
      ? pricedSelection.reduce((sum, option) => sum + (option.price ?? 0), 0)
      : (quotationTotals(sourceNet)?.gross ?? 0) / 100;
  return (
    <section className={styles.layout} aria-label="เลือกอุปกรณ์จัดชุด">
      <aside className={styles.sidebar} aria-label="ชุดที่เลือก">
        <header className={styles.total} aria-live="polite" aria-atomic="true">
          <h2>ยอดรวมทั้งสิ้น</h2>
          <div>
            {priced || !selected.length ? (
              <>
                <strong>{baht.format(totalPrice)}</strong>
                <small>รวม VAT</small>
              </>
            ) : (
              <small>ติดต่อ SUNFORD เพื่อยืนยันราคา</small>
            )}
          </div>
        </header>
        <div className={styles.steps}>
          {categories.map(({ kind: tab, label, icon: Icon }) => (
            <button
              key={tab}
              type="button"
              aria-pressed={tab === kind}
              disabled={tab === "accessory" && !(head && platform)}
              onClick={() => openStep(tab)}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        <div className={styles.selection} aria-live="polite">
          {selected.length === 0 ? (
            <p>ยังไม่ได้เลือกรุ่น</p>
          ) : (
            <ul>
              {selected.map((o) => (
                <li key={o.code}>
                  <span>
                    {categories.find((item) => item.kind === o.kind)?.label} · {optionName(o)}
                    {o.kind === "platform" && (
                      <small className={styles.reference}>รหัสชุด {o.code}</small>
                    )}
                  </span>
                  <button aria-label={`นำ ${o.code} ออกจากชุด`} onClick={() => remove(o)}>
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selected.length > 0 && (
            <p>
              {priced
                ? `ยอดรวม ${baht.format(totalPrice)} (รวม VAT)`
                : "ติดต่อ SUNFORD เพื่อยืนยันราคาและชุดที่เลือก"}
            </p>
          )}
          {head && platform ? (
            <a
              className={styles.quoteLink}
              href={`/service/quotation?${new URLSearchParams(selected.map((item) => ["model", item.code]))}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              ทำใบเสนอราคา ↗
            </a>
          ) : (
            <button
              type="button"
              className={styles.quoteLink}
              disabled
              title="เลือกหัวอ่านและแท่นชั่งให้ครบก่อน"
            >
              ทำใบเสนอราคา
            </button>
          )}
        </div>
      </aside>
      <div className={styles.content}>
        <div className={styles.toolbar}>
          <h2 ref={heading} tabIndex={-1}>
            {kind === "platform" && first?.kind === "head"
              ? `แท่นชั่งสำหรับ ${first.displayName ?? first.code}`
              : kind === "head" && first?.kind === "platform"
                ? `หัวอ่านสำหรับ ${first.displayName ?? first.code}`
                : categories.find((tab) => tab.kind === kind)?.label}
          </h2>
          <div className={styles.fields}>
            <label className={styles.search}>
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                aria-label="ค้นหารุ่น"
                placeholder="ค้นหารุ่นหรือประเภท"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            {kind !== "accessory" && (!first || first.kind === kind) && (
              <select
                aria-label="ลักษณะงาน"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              >
                <option value="">ทุกลักษณะงาน</option>
                {groups.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
        <p className={styles.count} aria-live="polite">
          {visible.length} รุ่น
        </p>
        <div className={styles.cards}>
          {visible.map((o) => {
            const active = selected.some((item) => item.code === o.code);
            const pending = o.kind === "head" && !headPlatformPairs[o.code]?.length;
            const newTab = o.detailHref.startsWith("/products/");
            return (
              <article key={o.code}>
                {o.image && (
                  <div className={styles.photo}>
                    <ProductImage
                      src={o.image}
                      fallbackSrc={o.fallbackImage}
                      alt={o.kind === "platform" ? `ภาพชุดอ้างอิง ${o.code}` : o.code}
                      fill
                      sizes="(max-width:600px) 90vw, (max-width:1000px) 40vw, 240px"
                    />
                  </div>
                )}
                <div className={styles.copy}>
                  <h3>
                    <a
                      className={styles.cardLink}
                      href={o.detailHref}
                      target={newTab ? "_blank" : undefined}
                      rel={newTab ? "noopener noreferrer" : undefined}
                      aria-label={`ดูรายละเอียด ${o.code}${newTab ? " (เปิดแท็บใหม่)" : ""}`}
                    >
                      {optionName(o)}
                    </a>
                  </h3>
                  {o.kind === "platform" && <small>รหัสชุด {o.code}</small>}
                  <p>{o.description}</p>
                  {o.kind === "platform" &&
                    head &&
                    headPlatformPairs[head.code]?.includes(o.code) && (
                      <a
                        className={`${styles.guideLink} ${styles.headLink}`}
                        href={head.detailHref}
                        target={head.detailHref.startsWith("/") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        aria-label={`ดูรายละเอียด ${head.code}${head.detailHref.startsWith("/") ? " (เปิดแท็บใหม่)" : ""}`}
                      >
                        ดูหัวอ่าน {head.displayName ?? head.code}
                      </a>
                    )}
                  <span>
                    {o.price !== null && o.price > 0 ? baht.format(o.price) : "สอบถามราคา"}
                  </span>
                </div>
                <button
                  aria-label={pending ? `${o.code} รอยืนยันรุ่นแท่นชั่ง` : `เลือก ${o.code}`}
                  disabled={pending}
                  aria-pressed={active}
                  onClick={() => choose(o)}
                >
                  {pending ? (
                    "รอยืนยันรุ่นแท่นชั่ง"
                  ) : (
                    <>
                      {active ? <Check size={15} /> : <Plus size={15} />}{" "}
                      {active ? "เลือกแล้ว" : "เลือกเข้าชุด"}
                    </>
                  )}
                </button>
              </article>
            );
          })}
        </div>
        {!visible.length && (
          <p>
            ไม่พบรุ่นที่ตรงกับการค้นหา{" "}
            <button
              onClick={() => {
                setQuery("");
                setGroup("");
              }}
            >
              ล้างตัวกรอง
            </button>
          </p>
        )}
      </div>
    </section>
  );
}
