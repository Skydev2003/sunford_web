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
