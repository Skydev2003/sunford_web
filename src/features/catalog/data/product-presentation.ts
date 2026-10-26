import type { Product } from "../types";
import type { SourceProduct } from "@/features/content/types";

const overviewFields: {
  label: string;
  pattern: RegExp;
  fallback?: "capacity" | "readability" | "connection";
}[] = [
  {
    label: "น้ำหนัก",
    pattern: /^(น้ำหนัก|พิกัดน้ำหนัก|พิกัดน้ำหนักสูงสุด|น้ำหนักสูงสุด|capacity)$/i,
    fallback: "capacity",
  },
  {
    label: "ค่าละเอียด",
    pattern: /^(ค่าละเอียด|ค่าอ่านละเอียด|ความละเอียด|readability|resolution)$/i,
    fallback: "readability",
  },
  { label: "เหมาะสำหรับ", pattern: /^(เหมาะสำหรับ|การใช้งาน|เหมาะกับ|การใช้งานที่เหมาะสม)$/ },
  { label: "หน้าจอแสดงผล", pattern: /^(หน้าจอแสดงผล|จอแสดงผล|หน้าจอ|จอLCD|จอLED|display)$/i },
  { label: "หน่วยความจำ", pattern: /^(หน่วยความจำ|ความจุหน่วยความจำ|memory)$/i },
  { label: "การพิมพ์ฉลาก", pattern: /^(การพิมพ์ฉลาก|พิมพ์ฉลาก|การพิมพ์|การพิมพ์สติกเกอร์)$/ },
  {
    label: "การเชื่อมต่อระบบ",
    pattern: /^(การเชื่อมต่อระบบ|การเชื่อมต่อ|พอร์ต|พอร์ท|connection|interface)$/i,
    fallback: "connection",
  },
  { label: "วัสดุและความทนทาน", pattern: /^(วัสดุและความทนทาน|วัสดุ|วัสดุตัวเครื่อง|material)$/i },
];

export function productOverview(
  product: Product,
  specifications: { label: string; value: string }[],
) {
  const matches = (field: (typeof overviewFields)[number], label: string) =>
    field.pattern.test(label.replace(/[\s:：]/g, ""));
  return {
    specifications: overviewFields.map((field) => {
      const entry = specifications.find((spec) => matches(field, spec.label));
      const value = (entry ? entry.value : field.fallback ? product[field.fallback] : "").trim();
      return { label: field.label, value: !value || /^[-–—]+$/.test(value) ? "-" : value };
    }),
    additionalSpecifications: specifications.filter(
      (spec) => !overviewFields.some((field) => matches(field, spec.label)),
    ),
  };
}

export function productPresentation(product: Product, snapshot?: Product, source?: SourceProduct) {
  if (product.media)
    return {
      images: product.media.gallery.map((entry) => entry.image),
      descriptionHtml: product.media.descriptionHtml,
      specifications: product.media.specifications,
    };
  const images = source?.images ?? [];
  const imageChanged = snapshot && product.image !== snapshot.image;
  const specifications = [...(source?.specifications ?? [])];
  const fields = [
    { key: "capacity", label: "พิกัดน้ำหนัก", pattern: /พิกัดน้ำหนัก|น้ำหนักสูงสุด/ },
    { key: "readability", label: "ความละเอียด", pattern: /อ่านละเอียด|ความละเอียด|ค่าละเอียด/ },
    { key: "connection", label: "การเชื่อมต่อ", pattern: /การเชื่อมต่อ|พอร์ท|พอร์ต/ },
  ] as const;
  for (const field of fields) {
    if (snapshot && product[field.key] === snapshot[field.key]) continue;
    const index = specifications.findIndex((spec) => field.pattern.test(spec.label));
    const entry = { label: field.label, value: product[field.key] };
    if (index === -1) specifications.push(entry);
    else specifications[index] = { ...specifications[index], value: product[field.key] };
  }
  return {
    images: imageChanged
      ? [
          ...(product.image ? [product.image] : []),
          ...images.filter((image) => image !== product.image),
        ]
      : images.length
        ? images
        : product.image
          ? [product.image]
          : [],
    descriptionHtml:
      snapshot && product.description === snapshot.description
        ? source?.descriptionHtml
        : undefined,
    specifications,
  };
}
