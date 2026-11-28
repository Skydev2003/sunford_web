"use client";
import { useReturnState } from "@/features/site/history/return-state";

import { useRef, type SetStateAction } from "react";
import { Monitor, Layers, Cable, Search, Check, Plus, ChevronRight, Trash2 } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import styles from "./weighing-builder.module.css";
import { quotationTotals } from "@/features/catalog/data/quotation";
import { QuoteSelectionLink } from "@/features/catalog/components/quote-selection-link";
import { formatBaht } from "@/features/catalog/data/price-format";
import { contactPath } from "../data/contact-route";

import type { WeighingOption } from "../data/weighing-options";
const categories = [
  { kind: "platform", label: "แท่นชั่ง", icon: Layers },
  { kind: "head", label: "อินดิเคเตอร์", icon: Monitor },
  { kind: "accessory", label: "อุปกรณ์เสริม", icon: Cable },
] as const;

function optionName(option: WeighingOption) {
  if (option.displayName) return option.displayName;
  if (option.kind !== "platform") return option.code;
  const [series, capacity] = option.code.split("-");
  return `${series} · ${capacity} กก.`;
}

export function WeighingBuilder({ options }: { options: WeighingOption[] }) {
  const [kind, setKind] = useReturnState<WeighingOption["kind"]>(
    "weighing-builder.kind",
    "platform",
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const [query, setQuery] = useReturnState("weighing-builder.query", "");
  const [group, setGroup] = useReturnState("weighing-builder.group", "");
  const [selectedCodes, setSelectedCodes] = useReturnState<string[]>(
    "weighing-builder.selected",
    [],
  );
  const selected = selectedCodes.flatMap(
    (code) => options.find((option) => option.code === code) ?? [],
  );
  const setSelected = (next: SetStateAction<WeighingOption[]>) =>
    setSelectedCodes((previous) => {
      const current = previous.flatMap(
        (code) => options.find((option) => option.code === code) ?? [],
      );
      return (typeof next === "function" ? next(current) : next).map((option) => option.code);
    });
  const head = selected.find((o) => o.kind === "head");
  const platform = selected.find((o) => o.kind === "platform");
  const hasCompatibleAccessories = (headCode: string) =>
    options.some(
      (option) => option.kind === "accessory" && option.compatibleCodes?.includes(headCode),
    );
  const first = selected[0];
  const headPlatformPairs = Object.fromEntries(
    options.filter((o) => o.kind === "head").map((o) => [o.code, o.compatibleCodes ?? []]),
  );
  const pairedPlatforms = new Set(Object.values(headPlatformPairs).flat());
  const confirmedPair = Boolean(
    head && platform && headPlatformPairs[head.code]?.includes(platform.code),
  );
  const groups = [
    ...new Set(
      options
        .filter((o) => o.kind === kind)
        .map((o) => o.group)
        .filter(Boolean),
    ),
  ];
  const visible = options.filter(
    (o) =>
      o.kind === kind &&
      (kind !== "accessory" || !head || Boolean(o.compatibleCodes?.includes(head.code))) &&
      (kind === "accessory" || !group || o.group === group) &&
      (kind !== "head" ||
        first?.kind !== "platform" ||
        headPlatformPairs[o.code]?.includes(first.code)) &&
      (kind !== "platform" ||
        first?.kind !== "head" ||
        headPlatformPairs[first.code]?.includes(o.code)) &&
      [o.code, o.displayName, o.description, o.group]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
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
        if (hasCompatibleAccessories(headCode)) openStep("accessory");
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
    <section
      id="build-your-set"
      className={styles.layout}
      aria-label="เลือกอุปกรณ์จัดชุด"
      tabIndex={-1}
    >
      <aside className={styles.sidebar} aria-label="ชุดที่เลือก">
        <header className={styles.total} aria-live="polite" aria-atomic="true">
          <h2>ยอดรวมทั้งสิ้น</h2>
          <div>
            {priced || !selected.length ? (
              <>
                <strong>{formatBaht(totalPrice)}</strong>
                <small>รวม VAT</small>
              </>
            ) : (
              <small>ติดต่อ SUNFORD เพื่อยืนยันราคา</small>
            )}
          </div>
        </header>
        <div className={styles.steps}>
          {categories.map(({ kind: tab, label, icon: Icon }) => (
            <section key={tab} className={styles.slot} aria-label={label}>
              <button
                type="button"
                className={styles.category}
                aria-pressed={tab === kind}
                disabled={
                  tab === "accessory" && !(head && platform && hasCompatibleAccessories(head.code))
                }
                onClick={() => openStep(tab)}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
                <ChevronRight size={16} aria-hidden="true" />
              </button>
              {selected
                .filter((item) => item.kind === tab)
                .map((item) => (
                  <div key={item.code} className={styles.item}>
                    <div className={styles.thumb} aria-hidden="true">
                      <ProductImage
                        placeholder="product"
                        src={item.image}
                        fallbackSrc={item.fallbackImage}
                        alt=""
                        fill
                        sizes="48px"
                      />
                    </div>
                    <div className={styles.itemInfo}>
                      <strong>{item.displayName ?? item.code}</strong>
                      <span>
                        {item.kind === "head" && platform?.includesHead
                          ? "รวมในราคาแท่นชั่งแล้ว"
                          : item.price !== null && item.price > 0
                            ? formatBaht(item.price)
                            : "สอบถามราคา"}
                      </span>
                      <a
                        href={item.detailHref}
                        target={item.detailHref.startsWith("/") ? "_blank" : undefined}
                        rel={item.detailHref.startsWith("/") ? "noopener noreferrer" : undefined}
                        aria-label={`ดูสเปค ${item.code}`}
                      >
                        ดูสเปค
                      </a>
                    </div>
                    <button
                      type="button"
                      className={styles.remove}
                      aria-label={`นำ ${item.code} ออกจากชุด`}
                      onClick={() => remove(item)}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                ))}
            </section>
          ))}
        </div>
        <div className={styles.selection}>
          {confirmedPair ? (
            <QuoteSelectionLink
              className={styles.quoteLink}
              models={selected.map((item) => item.code)}
              newTab
            >
              ทำใบเสนอราคา ↗
            </QuoteSelectionLink>
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
                ? `อินดิเคเตอร์สำหรับ ${first.displayName ?? first.code}`
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
            const pending =
              o.kind === "head"
                ? !headPlatformPairs[o.code]?.length
                : o.kind === "platform" && !pairedPlatforms.has(o.code);
            const pendingLabel =
              o.kind === "platform" ? "รอยืนยันรุ่นอินดิเคเตอร์" : "รอยืนยันรุ่นแท่นชั่ง";
            const newTab = o.detailHref.startsWith("/products/");
            return (
              <article key={o.code}>
                <div className={styles.photo}>
                  <ProductImage
                    placeholder="product"
                    src={o.image}
                    fallbackSrc={o.fallbackImage}
                    alt={o.kind === "platform" ? `ภาพชุดอ้างอิง ${o.code}` : o.code}
                    fill
                    sizes="(width < 40rem) 90vw, (width < 64rem) 40vw, 240px"
                  />
                </div>
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
                    {o.price !== null && o.price > 0 ? formatBaht(o.price) : "สอบถามราคา"}
                  </span>
                </div>
                <button
                  aria-label={pending ? `${o.code} ${pendingLabel}` : `เลือก ${o.code}`}
                  disabled={pending}
                  aria-pressed={active}
                  onClick={() => choose(o)}
                >
                  {pending ? (
                    pendingLabel
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
        {kind === "platform" && !pairedPlatforms.size ? (
          <p>
            ยังไม่มีข้อมูลยืนยันคู่หัวอ่านและแท่นชั่งในแค็ตตาล็อก ลองดู{" "}
            <a className={styles.guideLink} href="#recommended-sets">
              ชุดสำเร็จที่แนะนำ
            </a>{" "}
            หรือ{" "}
            <a className={styles.guideLink} href={contactPath}>
              ปรึกษา SUNFORD
            </a>
          </p>
        ) : !visible.length ? (
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
        ) : null}
      </div>
    </section>
  );
}
