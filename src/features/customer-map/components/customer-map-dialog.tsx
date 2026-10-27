"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, ChevronRight, MapPin, Search, X } from "lucide-react";
import {
  areaCustomerCount,
  countLabel,
  customerCounts,
  nationwideCustomerCount,
} from "../data/customer-counts";
import { useMapLayer } from "../hooks/use-map-layer";
import type { MapArea } from "../types";
import { MapCanvas } from "./map-canvas";

const EMPTY_AREAS: MapArea[] = [];

export default function CustomerMapDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const [province, setProvince] = useState<MapArea>();
  const [district, setDistrict] = useState<MapArea>();
  const [subdistrict, setSubdistrict] = useState<MapArea>();
  const [search, setSearch] = useState("");
  const national = useMapLayer("provinces");
  const districts = useMapLayer(province ? `districts/${province.id}` : null);
  const subdistricts = useMapLayer(province && district ? `subdistricts/${province.id}` : null);

  useEffect(() => {
    const element = dialog.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  function selectProvince(area?: MapArea) {
    setProvince(area);
    setDistrict(undefined);
    setSubdistrict(undefined);
    setSearch("");
  }
  function selectDistrict(area?: MapArea) {
    setDistrict(area);
    setSubdistrict(undefined);
    setSearch("");
  }
  function selectArea(area: MapArea, parentDistrict?: MapArea) {
    if (area.level === "province") {
      selectProvince(area);
      return;
    }
    const provinceId = area.level === "district" ? area.parentId : area.parentId?.slice(0, 2);
    const parentProvince = national.layer?.areas.find((item) => item.id === provinceId);
    if (parentProvince) setProvince(parentProvince);
    if (area.level === "district") selectDistrict(area);
    else {
      if (parentDistrict) setDistrict(parentDistrict);
      setSubdistrict(area);
      setSearch("");
    }
  }

  const districtWord = province?.id === "10" ? "เขต" : "อำเภอ";
  const subdistrictWord = province?.id === "10" ? "แขวง" : "ตำบล";
  const areaWord = district ? subdistrictWord : province ? districtWord : "จังหวัด";
  const currentLoad = district ? subdistricts : province ? districts : national;
  const areas = district
    ? (subdistricts.layer?.areas.filter((area) => area.parentId === district.id) ?? EMPTY_AREAS)
    : province
      ? (districts.layer?.areas ?? EMPTY_AREAS)
      : (national.layer?.areas ?? EMPTY_AREAS);
  const filtered = areas
    .filter((area) => `${area.name} ${area.id}`.includes(search.trim()))
    .sort(
      (a, b) =>
        (areaCustomerCount(b) ?? -1) - (areaCustomerCount(a) ?? -1) ||
        a.name.localeCompare(b.name, "th"),
    );
  const selected = subdistrict ?? district ?? province;
  const selectedCount = selected
    ? areaCustomerCount(selected)
    : nationwideCustomerCount(national.layer?.areas ?? EMPTY_AREAS);

  return (
    <dialog
      ref={dialog}
      className="customer-map-dialog"
      aria-labelledby={headingId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="customer-map-shell">
        <header className="customer-map-header">
          <div>
            <p className="eyebrow">SUNFORD CUSTOMER NETWORK</p>
            <h2 id={headingId}>ครอบคลุมทั่วประเทศ</h2>
            <p>สำรวจลูกค้าในแต่ละพื้นที่ ตั้งแต่จังหวัด อำเภอ ไปจนถึงตำบล</p>
          </div>
          <button
            type="button"
            className="customer-map-icon"
            onClick={onClose}
            aria-label="ปิดแผนที่"
          >
            <X size={21} />
          </button>
        </header>
        <div className="customer-map-layout">
          <section className="customer-map-main" aria-label="สำรวจพื้นที่บนแผนที่">
            <nav className="customer-map-breadcrumb" aria-label="ตำแหน่งบนแผนที่">
              <button type="button" onClick={() => selectProvince()} disabled={!province}>
                ประเทศไทย
              </button>
              {province && (
                <>
                  <ChevronRight size={14} />
                  <button type="button" onClick={() => selectDistrict()}>
                    {province.name}
                  </button>
                </>
              )}
              {district && (
                <>
                  <ChevronRight size={14} />
                  <button
                    type="button"
                    onClick={() => {
                      setSubdistrict(undefined);
                      setSearch("");
                    }}
                  >
                    {district.name}
                  </button>
                </>
              )}
              {subdistrict && (
                <>
                  <ChevronRight size={14} />
                  <span>{subdistrict.name}</span>
                </>
              )}
            </nav>
            <MapCanvas
              provinces={national.layer?.areas ?? EMPTY_AREAS}
              outline={district ?? province}
              selected={subdistrict}
              onSelect={selectArea}
              loading={!currentLoad.layer}
              error={currentLoad.error}
              retry={currentLoad.retry}
            />
          </section>
          <aside className="customer-map-sidebar" aria-label="ข้อมูลลูกค้าตามพื้นที่">
            <label className="customer-map-field">
              เลือกจังหวัด
              <select
                aria-label="เลือกจังหวัด"
                value={province?.id ?? ""}
                onChange={(event) =>
                  selectProvince(
                    national.layer?.areas.find((area) => area.id === event.target.value),
                  )
                }
              >
                <option value="">ประเทศไทย · ทุกจังหวัด</option>
                {national.layer?.areas.map((area) => (
                  <option value={area.id} key={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </label>
            {province && (
              <label className="customer-map-field customer-map-district-select">
                เลือก{districtWord}
                <select
                  aria-label={`เลือก${districtWord}`}
                  value={district?.id ?? ""}
                  onChange={(event) =>
                    selectDistrict(
                      districts.layer?.areas.find((area) => area.id === event.target.value),
                    )
                  }
                >
                  <option value="">
                    ทุก{districtWord}ใน{province.name}
                  </option>
                  {districts.layer?.areas.map((area) => (
                    <option value={area.id} key={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="customer-map-summary" aria-live="polite">
              <span>
                <MapPin size={15} />
                {subdistrict
                  ? subdistrictWord
                  : district
                    ? districtWord
                    : province
                      ? "จังหวัด"
                      : "ทั่วประเทศ"}
              </span>
              <h3>{selected?.name ?? "ประเทศไทย"}</h3>
              <p>{selected ? "จำนวนลูกค้า" : "ลูกค้าทั้งทะเบียน"}</p>
              <strong>{countLabel(selectedCount)}</strong>
              <small>
                {district
                  ? "รวมเฉพาะรายชื่อที่ระบุตำบลได้"
                  : province
                    ? `ยังไม่ระบุตำบล ${(customerCounts.unallocatedByProvince?.[province.id] ?? 0).toLocaleString("th-TH")} รายชื่อ`
                    : "รายชื่อในทะเบียน อาจซ้ำบุคคลได้"}
              </small>
              {!province && customerCounts.summary && (
                <dl className="customer-map-totals">
                  <div>
                    <dt>ระบุจังหวัดได้</dt>
                    <dd>{customerCounts.summary.located.toLocaleString("th-TH")}</dd>
                  </div>
                  <div>
                    <dt>ยังไม่ทราบจังหวัด</dt>
                    <dd>{customerCounts.summary.unknownProvince.toLocaleString("th-TH")}</dd>
                  </div>
                  <div>
                    <dt>ต่างประเทศ</dt>
                    <dd>{customerCounts.summary.foreign.toLocaleString("th-TH")}</dd>
                  </div>
                </dl>
              )}
            </div>
            <div className="customer-map-list-heading">
              <h3>
                {selected ? `${areaWord}ใน${(district ?? province)?.name}` : "จังหวัดทั้งหมด"}
              </h3>
              <span>
                {areas.length} {areaWord}
              </span>
            </div>
            {province && (
              <button
                type="button"
                className="customer-map-back"
                onClick={() => (district ? selectDistrict() : selectProvince())}
              >
                <ArrowLeft size={14} />
                {district ? `กลับไปดูทุก${districtWord}` : "กลับไปดูทุกจังหวัด"}
              </button>
            )}
            <label className="customer-map-search">
              <Search size={16} />
              <input
                aria-label={`ค้นหา${areaWord}`}
                placeholder={`ค้นหาชื่อ${areaWord}`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button type="button" aria-label="ล้างคำค้นหา" onClick={() => setSearch("")}>
                  <X size={14} />
                </button>
              )}
            </label>
            <div className="customer-map-area-list" aria-label={`รายชื่อ${areaWord}`}>
              {filtered.map((area) => (
                <button
                  type="button"
                  key={area.id}
                  aria-label={`เลือก${areaWord}${area.name}`}
                  aria-pressed={subdistrict?.id === area.id}
                  onClick={() => selectArea(area)}
                >
                  <span>{area.name}</span>
                  <small>{countLabel(areaCustomerCount(area))}</small>
                  <ChevronRight size={13} />
                </button>
              ))}
              {currentLoad.layer && !filtered.length && (
                <p className="customer-map-no-results">ไม่พบพื้นที่ที่ค้นหา</p>
              )}
            </div>
          </aside>
        </div>
        <footer className="customer-map-credit">
          <span>
            ขอบเขตอ้างอิง COD-AB ·{" "}
            <a
              href="https://github.com/DevelopedbyWill/thailand-canonical-admin-names"
              target="_blank"
              rel="noreferrer"
            >
              Thailand Admin Reference
            </a>{" "}
            ·{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
              CC BY 4.0
            </a>{" "}
            /{" "}
            <a
              href="https://creativecommons.org/licenses/by/3.0/igo/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY 3.0 IGO <ArrowUpRight size={11} />
            </a>
          </span>
          <span>
            {customerCounts.updatedAt
              ? `ข้อมูล ณ ${new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(new Date(customerCounts.updatedAt))}`
              : "รอข้อมูลลูกค้า"}{" "}
            · หน่วย: รายชื่อ
          </span>
        </footer>
      </div>
    </dialog>
  );
}
