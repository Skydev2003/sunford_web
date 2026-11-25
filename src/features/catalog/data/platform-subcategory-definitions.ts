export const platformPlacementDefinitions = [
  {
    id: "platform-floor",
    slug: "floor",
    label: "แท่นชั่งตั้งพื้น",
    collections: ["/collections/floor-platforms", "/collections/large-floor-platforms"],
  },
  {
    id: "platform-benchtop",
    slug: "benchtop",
    label: "แท่นชั่งตั้งโต๊ะ",
    collections: ["/collections/benchtop-platforms"],
  },
] as const;

export type PlatformPlacementId = (typeof platformPlacementDefinitions)[number]["id"];

export function isPlatformPlacementId(id: string): id is PlatformPlacementId {
  return platformPlacementDefinitions.some((placement) => placement.id === id);
}

type PlatformMaterial = {
  id: string;
  label: string;
  models: { model: string; sourceId?: string }[];
};

export const platformSubcategoryDefinitions: PlatformMaterial[] = [
  {
    id: "platform-carbon-steel",
    label: "แท่นเหล็กคาร์บอน",
    models: [
      { model: "TCS 4050", sourceId: "10755" },
      { model: "TCS 4560", sourceId: "10756" },
      { model: "TCS 5060", sourceId: "10761" },
      { model: "TCS 6080", sourceId: "10762" },
      { model: "FCS 3040", sourceId: "10752" },
      { model: "FCS 4050", sourceId: "10753" },
      { model: "FCS60100", sourceId: "10764" },
      { model: "FCS 4560", sourceId: "10754" },
      { model: "FCS100100", sourceId: "10774" },
      { model: "FCS120120", sourceId: "10775" },
      { model: "BCS100100", sourceId: "10770" },
      { model: "BCS120120", sourceId: "10771" },
    ],
  },
  {
    id: "platform-sus304",
    label: "สแตนเลส SUS304",
    models: [
      { model: "TMS 3040", sourceId: "10757" },
      { model: "TSS 3040", sourceId: "10758" },
      { model: "TSS 4050", sourceId: "10759" },
      { model: "TSS 5060", sourceId: "10760" },
      { model: "FSS100100", sourceId: "10766" },
      { model: "FSS120120", sourceId: "10767" },
      { model: "BSS100100", sourceId: "10772" },
      { model: "BSS120120", sourceId: "10773" },
      { model: "CSS 3838", sourceId: "10751" },
    ],
  },
  {
    id: "platform-sus201",
    label: "สแตนเลส SUS201",
    models: [
      { model: "VCS60100", sourceId: "10765" },
      { model: "TIS 3949", sourceId: "10763" },
    ],
  },
  {
    id: "platform-abs",
    label: "พลาสติก ABS",
    models: [{ model: "พลาสติก ABS เหนียวพิเศษ" }],
  },
];
