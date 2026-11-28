const commonWeighingFeatures = [
  ["waterproof", "กันน้ำกันฝุ่น"],
  ["price-computing", "คำนวณราคา"],
  ["counting", "นับจำนวน"],
  ["checkweighing", "เตือนน้ำหนักขาดเกิน"],
] as const;

export const scaleOverviewFeatures = [
  ["device-connection", "เชื่อมต่ออุปกรณ์"],
  ...commonWeighingFeatures,
] as const;

export const platformIndicatorsPath = "/platforms/indicators";
export const platformStructuresPath = "/platforms/structures";

export const indicatorOverviewFeatures = [
  ["connectivity", "เชื่อมต่ออุปกรณ์"],
  ...commonWeighingFeatures,
] as const;

export const platformStructureTypes = [
  {
    id: "bench-top",
    label: "Bench-top",
    description: "แท่นชั่งตั้งบนโต๊ะหรือเคาน์เตอร์ เหมาะกับงานตรวจน้ำหนักและคัดแยกชิ้นงาน",
  },
  {
    id: "mini-floor",
    label: "Mini-floor",
    description: "แท่นตั้งพื้นขนาดกะทัดรัดสำหรับพื้นที่จำกัด เช่น จุดชั่งกล่องหรือภาชนะขนาดเล็ก",
  },
  {
    id: "standard-floor",
    label: "Standard-floor",
    description: "แท่นตั้งพื้นสำหรับชั่งกล่อง ภาชนะ หรือวัตถุดิบในจุดรับของและพื้นที่ผลิต",
  },
  {
    id: "high-leg",
    label: "High-Leg",
    description: "โครงสร้างขายกสูงสำหรับจุดที่ต้องการระยะใต้แท่นหรือระดับชั่งที่สูงขึ้น",
  },
  {
    id: "weighing-desk",
    label: "Weighing desk",
    description: "โครงสร้างแบบโต๊ะชั่งสำหรับจุดที่ต้องชั่งและจัดการชิ้นงานบนโต๊ะเดียวกัน",
  },
] as const;

export function legacyPlatformFilterHref(search: string) {
  const query = new URLSearchParams(search);
  const [feature, duplicate] = query.getAll("feature");
  if (!feature || duplicate !== undefined) return;
  const indicatorFeature = feature === "device-connection" ? "connectivity" : feature;
  const structureType = feature === "benchtop" ? "bench-top" : feature;
  if (indicatorOverviewFeatures.some(([id]) => id === indicatorFeature)) {
    query.set("feature", indicatorFeature);
    return `${platformIndicatorsPath}?${query}`;
  }
  if (platformStructureTypes.some(({ id }) => id === structureType)) {
    query.delete("feature");
    query.set("type", structureType);
    return `${platformStructuresPath}?${query}`;
  }
}

export type OverviewRequest = Promise<{
  feature?: string | string[];
  type?: string | string[];
  group?: string | string[];
}>;

export type OverviewFeature = {
  id: string;
  label: string;
  productIds: string[];
};
