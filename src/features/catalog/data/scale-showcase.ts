import type { ClientProduct } from "../types";

const groupLabels = {
  "scale-price": "คำนวณราคา",
  "scale-industrial": "อุตสาหกรรม",
  "scale-kitchen": "ครัวและเบเกอรี่",
  "scale-analytical": "งานวิเคราะห์ / ห้องแล็บ",
  "scale-water-dust": "กันน้ำ–กันฝุ่น",
} as const;

// The shelf is curated by Warehouse SKU. Its display categories and photos are local to these cards.
type FeaturedScale = {
  sku: string;
  group: keyof typeof groupLabels;
  imageMode?: "full-bottom" | "bleed";
  photoFile?: string;
  tagline: string;
  background: string;
  surface?: string;
  lightText?: boolean;
  // The name's advance in Sora determines how large it can fit inside the card's padding.
  lettering?: { ink: string; nameWidthEm: number };
};

const featuredScales: readonly FeaturedScale[] = [
  {
    sku: "G106094",
    lettering: { ink: "#69360C", nameWidthEm: 2.421 },
    photoFile: "g106094-front-hd.webp",
    background: "sc:bg-[#EEA03D]",
    group: "scale-price",
    imageMode: "full-bottom",
    tagline: "จอสู้แดด ชั่งได้ถึง 30 กก.",
  },
  {
    sku: "G106315",
    lettering: { ink: "#FFFFFF", nameWidthEm: 2.226 },
    background: "sc:bg-[#64213E]",
    surface: "sc:bg-[#E99F95] sc:h-[33%]",
    lightText: true,
    group: "scale-price",
    imageMode: "full-bottom",
    tagline: "ตัวเลขสีแดง อ่านได้ไกล 5 เมตร",
  },
  {
    sku: "G106193",
    lettering: { ink: "#234369", nameWidthEm: 2.481 },
    background: "sc:bg-[#AFC9E7]",
    surface: "sc:bg-[#274D87] sc:h-[27%]",
    group: "scale-price",
    imageMode: "full-bottom",
    tagline: "ต่อเครื่องพิมพ์และลิ้นชักเก็บเงิน",
  },
  {
    sku: "G106681",
    lettering: { ink: "#0D4035", nameWidthEm: 5.179 },
    background: "sc:bg-[#50B99C]",
    group: "scale-kitchen",
    imageMode: "bleed",
    tagline: "ล้างน้ำได้ ชั่งละเอียด 1 กรัม",
  },
  {
    sku: "G106131",
    lettering: { ink: "#43491A", nameWidthEm: 5.319 },
    background: "sc:bg-[#D4DC8A]",
    surface: "sc:bg-[#A9B248] sc:h-[40%]",
    group: "scale-industrial",
    imageMode: "full-bottom",
    tagline: "ถาดกว้าง จอแยก พิกัด 30 กก.",
  },
  {
    sku: "G106285",
    lettering: { ink: "#683529", nameWidthEm: 4.333 },
    background: "sc:bg-[#F2A68E]",
    group: "scale-kitchen",
    imageMode: "full-bottom",
    tagline: "ชั่งแป้ง ตวงนม ในชามเดียว",
  },
  {
    sku: "G106124",
    lettering: { ink: "#5D3D22", nameWidthEm: 6.829 },
    background: "sc:bg-[#DCB882]",
    surface: "sc:bg-[#AD794D] sc:h-[32%]",
    group: "scale-industrial",
    imageMode: "full-bottom",
    tagline: "ชั่งพัสดุถึง 30 กก. ปุ่มภาษาไทย",
  },
  {
    sku: "G106353",
    lettering: { ink: "#FFFFFF", nameWidthEm: 4.362 },
    background: "sc:bg-[#2A4054]",
    lightText: true,
    group: "scale-industrial",
    imageMode: "full-bottom",
    tagline: "ชั่งได้ถึง 10 กก. อ่านค่าทีละกรัม",
  },
  {
    sku: "G106377",
    lettering: { ink: "#2A5142", nameWidthEm: 3.834 },
    background: "sc:bg-[#A5CFB7]",
    surface: "sc:bg-[#477E67] sc:h-[41%]",
    group: "scale-industrial",
    imageMode: "full-bottom",
    tagline: "ต่อเครื่องพิมพ์ผ่านพอร์ต RS232",
  },
  {
    sku: "G106643",
    lettering: { ink: "#493C68", nameWidthEm: 1.185 },
    background: "sc:bg-[#C3B8E3]",
    surface: "sc:bg-[#8070A8] sc:h-[33%]",
    group: "scale-analytical",
    imageMode: "full-bottom",
    tagline: "ละเอียด 0.01 กรัม พร้อมตู้กันลม",
  },
];

const industrialAndLab: readonly FeaturedScale[] = [
  {
    sku: "G106742",
    group: "scale-industrial",
    tagline: "เตือนเมื่อชั่งขาดหรือเกิน",
    background: "sc:bg-[#BED0D6]",
    surface: "sc:bg-[#6D929F] sc:h-[31%]",
  },
  {
    sku: "G106650",
    group: "scale-analytical",
    tagline: "นับชิ้นงาน ส่งค่าผ่าน RS232",
    background: "sc:bg-[#B7AED7]",
  },
  {
    sku: "G106537",
    group: "scale-industrial",
    tagline: "จอแยก วางได้ตามหน้างาน",
    background: "sc:bg-[#384E61]",
    lightText: true,
  },
  {
    sku: "G106803",
    group: "scale-analytical",
    tagline: "ชั่งได้ 3 กก. ละเอียด 0.01 กรัม",
    background: "sc:bg-[#CDDDD0]",
    surface: "sc:bg-[#819E8E] sc:h-[37%]",
  },
  {
    sku: "G106308",
    group: "scale-industrial",
    tagline: "ชั่งบนแท่นได้ถึง 60 กก.",
    background: "sc:bg-[#C5D8AC]",
  },
  {
    sku: "G106810",
    group: "scale-analytical",
    tagline: "อ่านละเอียดถึง 0.01 กรัม",
    background: "sc:bg-[#AAC4DC]",
    surface: "sc:bg-[#7897B2] sc:h-[29%]",
  },
  {
    sku: "G106322",
    group: "scale-industrial",
    tagline: "ชั่งบนโต๊ะได้ถึง 30 กก.",
    background: "sc:bg-[#E8B7B2]",
    surface: "sc:bg-[#B87880] sc:h-[33%]",
  },
  {
    sku: "G106674",
    group: "scale-analytical",
    tagline: "จานกลม ชั่งละเอียด 0.01 กรัม",
    background: "sc:bg-[#DCBE88]",
  },
];

const homeAndRetail: readonly FeaturedScale[] = [
  {
    sku: "G106469",
    group: "scale-kitchen",
    tagline: "ชั่งกาแฟพร้อมจับเวลา",
    background: "sc:bg-[#E2B58E]",
    surface: "sc:bg-[#B97954] sc:h-[32%]",
  },
  {
    sku: "G106186",
    group: "scale-price",
    tagline: "ชั่งแล้วคิดราคาหน้าร้าน",
    background: "sc:bg-[#793D51]",
    lightText: true,
  },
  {
    sku: "G106179",
    group: "scale-kitchen",
    tagline: "ชั่งส่วนผสมได้ถึง 5 กก.",
    background: "sc:bg-[#B6CFAE]",
  },
  {
    sku: "G106209",
    group: "scale-price",
    tagline: "คำนวณราคาบนแท่น 60 กก.",
    background: "sc:bg-[#B9CCE3]",
    surface: "sc:bg-[#6E91B6] sc:h-[35%]",
  },
  {
    sku: "G106254",
    group: "scale-kitchen",
    tagline: "ชั่งส่วนผสมทีละ 0.1 กรัม",
    background: "sc:bg-[#E9D596]",
  },
  {
    sku: "G106216",
    group: "scale-price",
    tagline: "จอบนเสา เห็นราคาฝั่งลูกค้า",
    background: "sc:bg-[#CCC0E3]",
    surface: "sc:bg-[#9D88B7] sc:h-[30%]",
  },
  {
    sku: "G106292",
    group: "scale-kitchen",
    tagline: "ชั่งวัตถุดิบได้ถึง 15 กก.",
    background: "sc:bg-[#A7D0CB]",
  },
  {
    sku: "G108562",
    group: "scale-price",
    tagline: "จอสองด้าน เห็นราคาทั้งคู่",
    background: "sc:bg-[#384D69]",
    surface: "sc:bg-[#667C92] sc:h-[34%]",
    lightText: true,
  },
];

const scaleShelves = { scales: featuredScales, pos: homeAndRetail, accessories: industrialAndLab };

export type PublishedScaleCard = { sku: string; tagline: string; visible: boolean };

export function parsePublishedScales(value: unknown): PublishedScaleCard[] {
  const remaining = new Set(featuredScales.map((item) => item.sku));
  if (!Array.isArray(value) || value.length !== remaining.size)
    throw new Error("Invalid featured scales response");
  for (const card of value) {
    if (
      !card ||
      !remaining.delete(card.sku) ||
      typeof card.tagline !== "string" ||
      typeof card.visible !== "boolean"
    )
      throw new Error("Invalid featured scale card");
  }
  return value;
}

export function selectScaleShowcase(
  members: ClientProduct[],
  shelf: keyof typeof scaleShelves = "scales",
  published?: PublishedScaleCard[],
) {
  const bySku = new Map(members.map((product) => [product.warehouseSku, product]));
  const directory = shelf === "scales" ? "scale-showcase/framed" : "specialty-scales";
  const entries =
    shelf === "scales" && published
      ? published.flatMap((card) => {
          const artwork = featuredScales.find((item) => item.sku === card.sku);
          return artwork && card.visible ? [{ ...artwork, tagline: card.tagline }] : [];
        })
      : scaleShelves[shelf];
  return entries.flatMap(
    ({
      sku,
      group,
      photoFile = `${sku.toLowerCase()}-front-4k.webp`,
      imageMode = "full-bottom",
      ...presentation
    }) => {
      const product = bySku.get(sku);
      if (
        !product ||
        product.warehouseCategoryId !== "scales" ||
        (shelf !== "scales" && !product.image)
      )
        return [];
      return [
        {
          ...presentation,
          product,
          imageMode,
          group,
          label: group === "scale-kitchen" && shelf === "pos" ? "ครัวและกาแฟ" : groupLabels[group],
          photo: `/images/products/${directory}/${photoFile}`,
        },
      ];
    },
  );
}

export type ScaleShowcaseItem = ReturnType<typeof selectScaleShowcase>[number];
