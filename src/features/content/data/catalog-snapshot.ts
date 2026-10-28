import sourceProducts from "./products.json";
import type { SourceProduct } from "../types";
import type { Product } from "@/features/catalog/types";
import { products as curated } from "@/features/catalog/data/products";
import { productSources } from "@/features/catalog/data/product-sources";

const importedProducts = sourceProducts as SourceProduct[];

function inferCategory(product: SourceProduct): Product["category"] {
  // Exact source collections take precedence over words in descriptions, which
  // can mention compatible POS systems or other types of equipment.
  const sourceCategories = [
    ["POS เชื่อมต่อเครื่องชั่ง", "pos"],
    ["อุปกรณ์ประกอบเครื่องชั่ง", "accessories"],
    ["วัสดุสิ้นเปลือง", "accessories"],
    ["พรีเมี่ยม", "accessories"],
    ["ห้องปฏิบัติการ", "laboratory"],
    ["ไลฟ์สไตล์", "lifestyle"],
    ["พาณิชยกรรมและบริการ", "commercial"],
    ["อุตสาหกรรม", "industrial"],
  ];
  for (const [collection, category] of sourceCategories)
    if (product.collections?.some((item) => item.path === `/collections/${collection}`))
      return category;
  const text = `${product.name} ${product.description} ${product.collections?.map((item) => item.title).join(" ")}`;
  if (/POS|พอส/i.test(product.name)) return "pos";
  if (/RLS|smart|MES|อัจฉริยะ/i.test(text)) return "smart";
  if (
    /printer|เครื่องพิมพ์|^LP\d|sticker|สติ๊กเกอร์|กระดาษ|LED-R|อะไหล่|สายสัญญาณ|อุปกรณ์เสริม/i.test(
      product.name,
    )
  )
    return "accessories";
  if (
    /(?:^|\s)(?:C1|C5|R3|R6|S1|S2|S3)(?:\s|$)|laboratory|วิเคราะห์|ความละเอียดสูง/i.test(
      product.name,
    )
  )
    return "laboratory";
  if (/Fitdays|ครัวเรือน|สุขภาพ|Hi CoFE|WPK|KBS|VC5000|VR5000/i.test(text)) return "lifestyle";
  if (/คำนวณราคา|พาณิชย์|ACS.*JC|ACS.*JE/i.test(text)) return "commercial";
  return "industrial";
}

function fact(text: string, pattern: RegExp) {
  return text.match(pattern)?.[1]?.trim() || "—";
}

export function getSnapshotProducts(): Product[] {
  return importedProducts
    .map((source, index) => {
      const seed = curated.find((item) => productSources[item.id] === source.sourceUrl);
      const text = `${source.description}\n${source.details}`;
      const firstLine = source.description.split("\n").find((line) => line.trim()) || source.name;
      return {
        id: seed?.id ?? `sunford-${source.sourceId}`,
        slug: seed?.slug ?? source.sourceId,
        name: source.name.replace(/\s*\n\s*/g, " "),
        category: seed?.category ?? inferCategory(source),
        subtitle: firstLine.length > 110 ? `${firstLine.slice(0, 107)}…` : firstLine,
        description: source.description.slice(0, 1600) || source.details.slice(0, 1600),
        image: source.images[1] || source.images[0] || "",
        capacity:
          seed?.capacity ??
          fact(
            text,
            /(?:พิกัดน้ำหนักสูงสุด|พิกัดน้ำหนัก|ชั่งน้ำหนักสูงสุด|รองรับน้ำหนักชั่งสูงสุด)\s*([^\n]+)/,
          ),
        readability:
          seed?.readability ?? fact(text, /(?:ค่าอ่านละเอียด|ความละเอียด|ค่าละเอียด)\s*([^\n]+)/),
        connection: seed?.connection ?? fact(text, /(?:การเชื่อมต่อ|พอร์ท|พอร์ต)\s*([^\n]+)/),
        badge: seed?.badge ?? null,
        featured: seed?.featured ?? false,
        sortOrder: seed?.sortOrder ?? index + 6,
        sourceId: source.sourceId,
        sourceUrl: source.sourceUrl,
        price: source.price,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
