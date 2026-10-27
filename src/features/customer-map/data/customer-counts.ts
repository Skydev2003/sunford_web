import type { CustomerCounts, MapArea } from "../types";
import snapshot from "./customer-counts.json";

// Approved aggregate counts imported from the owner's workbook.
// Keys: province 2 digits, district 4 digits, subdistrict 6 digits.
// Missing/null = unknown. Zero is reserved for a verified zero customer count.
export const customerCounts: CustomerCounts = snapshot;

function knownCount(id: string, counts: CustomerCounts): number | null {
  const value = counts.areas[id];
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

export function areaCustomerCount(area: MapArea, counts = customerCounts): number | null {
  const direct = knownCount(area.id, counts);
  if (direct !== null) return direct;
  if (!area.childIds?.length) return null;
  const children = area.childIds.map((id) => knownCount(id, counts));
  if (children.some((count) => count === null)) return null;
  return children.reduce<number>((sum, count) => sum + count!, 0);
}

export function nationwideCustomerCount(
  provinces: MapArea[],
  counts = customerCounts,
): number | null {
  if (counts.summary) return counts.summary.total;
  if (provinces.length !== 77) return null;
  const values = provinces.map((area) => areaCustomerCount(area, counts));
  return values.some((count) => count === null)
    ? null
    : values.reduce<number>((sum, count) => sum + count!, 0);
}

export function countLabel(count: number | null): string {
  return count === null ? "ยังไม่มีข้อมูล" : `${count.toLocaleString("th-TH")} รายชื่อ`;
}

export function countColor(count: number | null): string {
  if (count === null) return "#e4e7ec";
  if (count === 0) return "#f1f2f5";
  if (count < 100) return "#ffdce0";
  if (count < 500) return "#ffa2ae";
  if (count < 1000) return "#f55c72";
  if (count < 5000) return "#d7192d";
  return "#841427";
}

const percentageFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** All areas use the same register total, including unlocated and foreign records. */
export function customerShare(
  count: number | null,
  total: number | null = customerCounts.summary?.total ?? null,
): number | null {
  if (count === null || total === null || total <= 0 || count < 0) return null;
  if (!Number.isFinite(count) || !Number.isFinite(total) || count > total) return null;
  return (count / total) * 100;
}

export function customerShareLabel(count: number | null, total?: number | null): string {
  const share = customerShare(count, total);
  if (share === null) return "ยังไม่มีข้อมูล";
  if (share > 0 && share < 0.01) return "<0.01%";
  return `${percentageFormatter.format(share)}%`;
}

export function percentageColor(share: number | null): string {
  if (share === null) return "#e4e7ec";
  if (share === 0) return "#f1f2f5";
  if (share < 0.1) return "#ffdce0";
  if (share < 0.5) return "#ffa2ae";
  if (share < 1) return "#f55c72";
  if (share < 5) return "#d7192d";
  return "#841427";
}

export const customerShareLegend = [
  { value: null, label: "ยังไม่มีข้อมูล" },
  { value: 0, label: "0%" },
  { value: 0.05, label: "<0.1%" },
  { value: 0.1, label: "0.1–<0.5%" },
  { value: 0.5, label: "0.5–<1%" },
  { value: 1, label: "1–<5%" },
  { value: 5, label: "5% ขึ้นไป" },
] as const;
