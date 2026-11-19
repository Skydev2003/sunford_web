import type { ClientProduct } from "../types";

const labels = {
  indicators: "หัวอ่านน้ำหนัก",
  platforms: "โครงสร้างแท่นชั่ง",
  accessories: "เครื่องพิมพ์",
} as const;

const selection = [
  {
    sku: "G107770",
    group: "indicators",
    background: "sc:bg-[#AFD39C]",
    tagline: "จอ LCD อ่านได้ไกล 4 เมตร",
  },
  {
    sku: "G107534",
    group: "platforms",
    background: "sc:bg-[#354C52]",
    surface: "sc:bg-[#809696] sc:h-[30%]",
    lightText: true,
    tagline: "โครงแท่นเหล็กคาร์บอน",
  },
  {
    sku: "G107268",
    group: "accessories",
    background: "sc:bg-[#F5A56F]",
    tagline: "เครื่องพิมพ์ประจำจุดขาย",
  },
  {
    sku: "G107787",
    group: "indicators",
    background: "sc:bg-[#BBC4EF]",
    surface: "sc:bg-[#706DA0] sc:h-[35%]",
    tagline: "จอ LED มองไกล 8 เมตร",
  },
  {
    sku: "G107589",
    group: "platforms",
    background: "sc:bg-[#AAD6E2]",
    surface: "sc:bg-[#508DA6] sc:h-[28%]",
    tagline: "แท่นชั่งพร้อมเสาติดหัวอ่าน",
  },
  {
    sku: "G107282",
    group: "accessories",
    background: "sc:bg-[#68344F]",
    lightText: true,
    tagline: "พิมพ์สติกเกอร์คู่กับ AW31",
  },
  {
    sku: "G107794",
    group: "indicators",
    background: "sc:bg-[#58B8A8]",
    tagline: "หัวอ่านกันน้ำกันฝุ่น IP67",
  },
  {
    sku: "G107305",
    group: "accessories",
    background: "sc:bg-[#EDD895]",
    surface: "sc:bg-[#CDA24F] sc:h-[34%]",
    tagline: "มีแบตในตัว ชาร์จไฟได้",
  },
] as const;

export function selectComponentShowcase(products: ClientProduct[]) {
  const bySku = new Map(products.map((product) => [product.warehouseSku, product]));
  return selection.flatMap(({ sku, group, ...presentation }) => {
    const product = bySku.get(sku);
    if (product?.warehouseCategoryId !== group) return [];
    if (group === "accessories" && product.warehouseGroup !== "เครื่องพิมพ์") return [];
    return [
      {
        product,
        group,
        label: labels[group],
        ...presentation,
        photo: `/images/products/component-showcase/${sku.toLowerCase()}-front-4k.webp`,
      },
    ];
  });
}
