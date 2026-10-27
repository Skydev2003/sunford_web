export type MapArea = {
  id: string;
  level: "province" | "district" | "subdistrict";
  name: string;
  path: string;
  center: [number, number];
  bounds: [number, number, number, number];
  parentId?: string;
  childIds?: string[];
  geometryAvailable?: boolean;
};
export type MapLayer = { parentId?: string; areas: MapArea[] };
export type MapView = { x: number; y: number; k: number };

/** Only approved aggregate counts belong in the public website. */
export type CustomerCounts = {
  updatedAt: string | null;
  areas: Readonly<Record<string, number | null>>;
  summary?: {
    total: number;
    located: number;
    unknownProvince: number;
    foreign: number;
    unknownSubdistrict: number;
  };
  unallocatedByProvince?: Readonly<Record<string, number>>;
};
