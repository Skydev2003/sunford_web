import type { Product } from "../types";
import { warehouseDetailProduct } from "./warehouse-detail-data";

export function warehouseFact(product: Product, label: string): string {
  return product.warehouseSpecifications?.find((row) => row.label === label)?.value ?? "";
}

function productCategory(product: Product): string | undefined {
  const name = product.warehouseName ?? "";
  const group = product.warehouseGroup ?? "";
  if (/Indicator|หัวอ่าน|อินดิเคเตอร์/i.test(name)) return "indicators";
  if (/\bPlatform\b|โครงสร้างแท่นชั่ง|แท่นเปล่า/i.test(name)) return "platforms";
  if (/เครื่องชั่ง/.test(group) || /เครื่องชั่ง/.test(name)) return "scales";
  if (/ระบบขาย|เวิร์กสเตชัน|โปรแกรม|สิทธิ์ใช้งาน/.test(group)) return "pos";
  if (/ชิ้นส่วน|อุปกรณ์|วัสดุ|เครื่องพิมพ์|ถุงมือ|ลูกตุ้ม/.test(group)) return "accessories";
  return undefined;
}

function subcategories(product: Product, category: string | undefined): string[] {
  const name = product.warehouseName ?? "";
  const facts = (product.warehouseSpecifications ?? [])
    .map((r) => r.label + " " + r.value)
    .join(" ");
  const ids: string[] = [];
  if (category === "scales") {
    if (/คำนวณราคา/.test(name)) ids.push("scale-price");
    if (/อุตสาหกรรม/.test(name)) ids.push("scale-industrial");
    if (/ห้องปฏิบัติการ|วิเคราะห์/.test(name)) ids.push("scale-analytical");
    if (/งานครัว|กาแฟ|เบเกอรี่/.test(name)) ids.push("scale-kitchen");
    if (/กันน้ำ/.test(name) || /IP6[5-9]|IP7\d/.test(facts)) ids.push("scale-water-dust");
    if (/ตั้งโต๊ะ/.test(name)) ids.push("scale-benchtop");
    if (/ตั้งพื้น/.test(name)) ids.push("scale-floor");
    if (/มีเสา|พร้อมเสา/.test(name)) ids.push("scale-pole");
  }
  if (category === "indicators") {
    const display = warehouseFact(product, "ชนิดหน้าจอ");
    if (/LCD/i.test(display)) ids.push("indicator-lcd");
    if (/LED/i.test(display)) ids.push("indicator-led");
    if (/กันน้ำ/.test(name) || /IP6[5-9]|IP7\d/.test(facts)) ids.push("indicator-waterproof");
  }
  if (category === "platforms") {
    const material = warehouseFact(product, "วัสดุโครงสร้าง");
    if (/Carbon Steel|เหล็กคาร์บอน/i.test(material)) ids.push("platform-carbon-steel");
    if (/SUS304/i.test(material)) ids.push("platform-sus304");
    if (/SUS201/i.test(material)) ids.push("platform-sus201");
  }
  if (category === "pos") {
    const os = warehouseFact(product, "ระบบปฏิบัติการและเวอร์ชัน");
    if (/Android/i.test(os + " " + name)) ids.push("pos-android");
    if (/Windows/i.test(os + " " + name)) ids.push("pos-windows");
    if (/เชื่อมต่อเครื่องชั่ง/.test(name)) ids.push("pos-scale-integration");
  }
  if (category === "accessories") {
    if (/จอแสดง|ไฟเตือน|ไฟสัญญาณ/.test(name)) ids.push("accessory-displays");
    if (/สาย|หัวต่อ|Connector|Cable/i.test(name)) ids.push("accessory-cables");
    if (/ล้อ|โครง|จานชั่ง/.test(name)) ids.push("accessory-mechanical");
    if (/เครื่องพิมพ์|ลิ้นชัก|สแกน/.test(name)) ids.push("accessory-pos");
    if (/วัสดุสิ้นเปลือง/.test(product.warehouseGroup ?? "")) ids.push("accessory-consumables");
  }
  return ids;
}

export function warehouseSiteProducts(
  products: Product[],
  components: { root_sku: string; sku: string; quantity: string }[] = [],
): Product[] {
  return products.map((raw, index) => {
    const product = warehouseDetailProduct(raw);
    const category = productCategory(product);
    return {
      ...product,
      category: category ?? "uncategorized",
      sortOrder: index,
      warehouseCategoryId: category,
      warehouseComponents: components
        .filter((row) => row.root_sku === product.warehouseSku)
        .map((row) => ({ sku: row.sku, quantity: Number(row.quantity) })),
      warehouseSubcategoryIds: subcategories(product, category),
      warehouseModelCodes: [warehouseFact(product, "รุ่นสินค้า") || product.name],
    };
  });
}
