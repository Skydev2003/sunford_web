import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { getOfficialProducts } from "@/features/services/warehouse-product.server";
import { QuotationFromSelection } from "@/features/catalog/components/quotation-form";
import { getWeighingOptions } from "@/features/content/data/weighing-options";
import { pricedProducts } from "@/features/catalog/data/quotation";
import { getProducts } from "@/features/catalog/server/product-repository";
import { headPlatformPairs } from "@/features/content/data/indicator-platform-compatibility";

export const metadata: Metadata = { title: "ใบเสนอราคา" };

async function WarehouseQuotation() {
  await connection();
  let catalog;
  let products;
  let capturedAt;
  try {
    const [publishedCatalog, official] = await Promise.all([
      getProducts(),
      getOfficialProducts(true),
    ]);
    catalog = publishedCatalog;
    capturedAt = official.capturedAt;
    const published = new Set(catalog.map((product) => product.warehouseSku));
    products = pricedProducts(
      official.items.flatMap((item) =>
        published.has(item.sku) && typeof item.sale_price === "number" && item.sale_price > 0
          ? [{ ...item, sale_price: item.sale_price }]
          : [],
      ),
    );
  } catch {
    return (
      <main id="main-content">
        <h1>ใบเสนอราคา</h1>
        <p role="alert">โหลดรายการสินค้าและราคาจาก Warehouse ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</p>
      </main>
    );
  }
  const pricedIds = new Set(products.map((p) => p.id));
  const presets = getWeighingOptions(catalog).map((item) => ({
    code: item.code,
    pricedId: item.sku && pricedIds.has(item.sku) ? item.sku : undefined,
    label: item.kind === "platform" ? `เครื่องชั่งครบชุด ${item.code}` : item.code,
    includesCodes: item.includesHead
      ? Object.entries(headPlatformPairs)
          .filter(([, kits]) => kits.includes(item.code))
          .map(([head]) => head)
      : undefined,
  }));
  const priceNote = capturedAt
    ? "ใช้ราคาที่บันทึกไว้ ณ " +
      new Intl.DateTimeFormat("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Bangkok",
      }).format(new Date(capturedAt)) +
      " น."
    : undefined;
  return <QuotationFromSelection products={products} presets={presets} priceNote={priceNote} />;
}

export default function QuotationPage() {
  return (
    <Suspense fallback={<p>กำลังเตรียมใบเสนอราคา…</p>}>
      <WarehouseQuotation />
    </Suspense>
  );
}
