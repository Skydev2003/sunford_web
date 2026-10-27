import { useId, useMemo, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { areaCustomerCount, countColor, countLabel } from "../data/customer-counts";
import { useMapCamera } from "../hooks/use-map-camera";
import { useVisibleLayers } from "../hooks/use-visible-layers";
import type { MapArea } from "../types";

type Props = {
  provinces: MapArea[];
  outline?: MapArea;
  selected?: MapArea;
  onSelect: (area: MapArea, parentDistrict?: MapArea) => void;
  loading: boolean;
  error: boolean | undefined;
  retry: () => void;
};

export function MapCanvas({
  provinces,
  outline,
  selected,
  onSelect,
  loading,
  error,
  retry,
}: Props) {
  const {
    svg: svgRef,
    view,
    pixelScale,
    viewport,
    smooth,
    zoom,
    reset,
    handlers,
    canSelect,
    isPointerActive,
  } = useMapCamera(selected ?? outline);
  const detail = useVisibleLayers(
    provinces,
    view,
    viewport,
    outline?.level === "district" ? outline.id : undefined,
  );
  const areaWordByLevel = { province: "จังหวัด", district: "อำเภอ/เขต", subdistrict: "ตำบล/แขวง" };
  const bounds = {
    x0: (400 - viewport.width / 2 - view.x) / view.k,
    y0: (400 - viewport.height / 2 - view.y) / view.k,
    x1: (400 + viewport.width / 2 - view.x) / view.k,
    y1: (400 + viewport.height / 2 - view.y) / view.k,
  };
  const areas = detail.areas.filter(
    (area) =>
      area.bounds[0] <= bounds.x1 &&
      area.bounds[2] >= bounds.x0 &&
      area.bounds[1] <= bounds.y1 &&
      area.bounds[3] >= bounds.y0,
  );
  const [hovered, setHovered] = useState<MapArea>();
  const helpId = useId();
  const active =
    hovered && areas.some((area) => area.id === hovered.id) ? hovered : (selected ?? outline);

  const labelled = useMemo(() => {
    const occupied: [number, number, number, number][] = [];
    return areas
      .filter((area) => area.geometryAvailable !== false)
      .sort((a, b) => {
        if (a.id === selected?.id) return -1;
        if (b.id === selected?.id) return 1;
        return b.bounds[2] - b.bounds[0] - (a.bounds[2] - a.bounds[0]);
      })
      .filter((area) => {
        const x = (area.center[0] * view.k + view.x) * pixelScale;
        const y = (area.center[1] * view.k + view.y) * pixelScale;
        const left = (400 - viewport.width / 2) * pixelScale;
        const top = (400 - viewport.height / 2) * pixelScale;
        if (
          x < left ||
          y < top ||
          x > left + viewport.width * pixelScale ||
          y > top + viewport.height * pixelScale
        )
          return false;
        const halfWidth = Math.max(54, area.name.length * 3.5);
        const box: [number, number, number, number] = [
          x - halfWidth,
          y - 10,
          x + halfWidth,
          y + 32,
        ];
        if (
          occupied.some(
            ([x0, y0, x1, y1]) => box[0] < x1 && box[2] > x0 && box[1] < y1 && box[3] > y0,
          )
        )
          return false;
        occupied.push(box);
        return true;
      });
  }, [areas, selected?.id, pixelScale, view, viewport]);

  return (
    <>
      <div className="customer-map-canvas" data-detail-level={detail.level}>
        <output
          className="customer-map-level"
          aria-label="ระดับรายละเอียดแผนที่"
          aria-live="polite"
        >
          แสดง{areaWordByLevel[detail.level]}
        </output>
        <div className="customer-map-tools">
          <button
            className="customer-map-icon"
            type="button"
            aria-label="ซูมเข้า"
            onClick={() => zoom(1.5)}
            disabled={view.k >= 8000}
          >
            <Plus size={18} />
          </button>
          <button
            className="customer-map-icon"
            type="button"
            aria-label="ซูมออก"
            onClick={() => zoom(1 / 1.5)}
            disabled={view.k <= 1}
          >
            <Minus size={18} />
          </button>
          <button
            className="customer-map-icon"
            type="button"
            aria-label="จัดแผนที่ให้พอดี"
            onClick={reset}
          >
            <RotateCcw size={17} />
          </button>
        </div>
        {active && (
          <div className="customer-map-tooltip" aria-hidden="true">
            <strong>{active.name}</strong>
            <span>ลูกค้า · {countLabel(areaCustomerCount(active))}</span>
          </div>
        )}
        {selected?.geometryAvailable === false && (
          <p className="customer-map-boundary-notice" role="status">
            แสดงยอดลูกค้าของ{selected.name}แล้ว · ยังไม่มีขอบเขตพื้นที่นี้ในชุดแผนที่อ้างอิง
          </p>
        )}
        <svg
          ref={svgRef}
          viewBox="0 0 800 800"
          className={`customer-map-svg${smooth ? " is-smooth" : ""}`}
          role="group"
          aria-label={`แผนที่${areaWordByLevel[detail.level]}ของประเทศไทย`}
          aria-describedby={helpId}
          tabIndex={0}
          {...handlers}
          onPointerLeave={() => setHovered(undefined)}
          onClick={(event) => {
            if (!canSelect()) return;
            const target = (event.target as Element).closest("[data-area-id]");
            const area = areas.find((item) => item.id === target?.getAttribute("data-area-id"));
            if (area) {
              setHovered(undefined);
              onSelect(
                area,
                detail.districts.find((district) => district.id === area.parentId),
              );
            }
          }}
        >
          <g
            className="customer-map-geography"
            style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}
          >
            {detail.level !== "province" &&
              provinces.map((province) => (
                <path
                  key={province.id}
                  className="customer-map-context"
                  d={province.path}
                  fill={countColor(areaCustomerCount(province))}
                  fillRule="evenodd"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            {outline && (
              <path
                className="customer-map-outline"
                d={outline.path}
                fill="none"
                stroke="#d7dbe2"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {detail.level === "subdistrict" &&
              detail.districts.map((district) => (
                <path
                  key={district.id}
                  className="customer-map-context"
                  d={district.path}
                  fill={countColor(areaCustomerCount(district))}
                  fillRule="evenodd"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            {areas.map((area) => (
              <path
                key={area.id}
                data-area-id={area.id}
                data-area-level={area.level}
                aria-label={`${areaWordByLevel[area.level]}${area.name}`}
                className={`customer-map-area${selected?.id === area.id ? " is-selected" : ""}`}
                d={area.path}
                fill={countColor(areaCustomerCount(area))}
                fillRule="evenodd"
                vectorEffect="non-scaling-stroke"
                onPointerEnter={() => {
                  if (!isPointerActive()) setHovered(area);
                }}
              >
                <title>
                  {area.name} · ลูกค้า {countLabel(areaCustomerCount(area))}
                </title>
              </path>
            ))}
            {labelled.map((area) => (
              <text
                key={area.id}
                data-label-id={area.id}
                data-label-level={area.level}
                x={area.center[0]}
                y={area.center[1]}
                fontSize={13 / (view.k * pixelScale)}
                strokeWidth={3 / (view.k * pixelScale)}
                className="customer-map-label"
              >
                <tspan x={area.center[0]}>{area.name}</tspan>
                <tspan
                  x={area.center[0]}
                  dy={18 / (view.k * pixelScale)}
                  fontSize={11 / (view.k * pixelScale)}
                >
                  {countLabel(areaCustomerCount(area))}
                </tspan>
              </text>
            ))}
          </g>
        </svg>
        {loading && !provinces.length && (
          <div className="customer-map-loading" role={error ? "alert" : "status"}>
            {error ? (
              <>
                <p>โหลดแผนที่ไม่สำเร็จ</p>
                <button type="button" onClick={retry}>
                  ลองอีกครั้ง
                </button>
              </>
            ) : (
              <>
                <span className="customer-map-spinner" />
                <p>กำลังโหลดแผนที่…</p>
              </>
            )}
          </div>
        )}
        {provinces.length > 0 && error && (
          <div className="customer-map-detail-loading" role="alert">
            โหลดรายการพื้นที่ไม่สำเร็จ{" "}
            <button type="button" onClick={retry}>
              ลองอีกครั้ง
            </button>
          </div>
        )}
        {!error && detail.loading && (
          <div className="customer-map-detail-loading" role="status">
            กำลังโหลดขอบเขต{areaWordByLevel[detail.level]}…
          </div>
        )}
        {detail.error && (
          <div className="customer-map-detail-loading" role="alert">
            โหลดขอบเขตบางพื้นที่ไม่สำเร็จ{" "}
            <button type="button" onClick={detail.retry}>
              โหลดรายละเอียดใหม่
            </button>
          </div>
        )}
        <p className="customer-map-help" id={helpId}>
          ซูมเพื่อดูอำเภอ · คลิกอำเภอเพื่อดูตำบล · ลากเพื่อเลื่อนแผนที่
        </p>
      </div>
      <div className="customer-map-legend">
        <span>
          <i style={{ background: countColor(null) }} />
          ยังไม่มีข้อมูล
        </span>
        {[0, 1, 100, 500, 1000, 5000].map((count, index) => (
          <span key={count}>
            <i style={{ background: countColor(count) }} />
            {["0", "1–99", "100–499", "500–999", "1,000–4,999", "5,000+"][index]}
          </span>
        ))}
        <span>รายชื่อ</span>
      </div>
    </>
  );
}
