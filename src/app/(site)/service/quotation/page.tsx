import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteLoading } from "@/features/site/components/site-loading";
import { connection } from "next/server";
import { QuotationFromSelection } from "@/features/catalog/components/quotation-form";
import { getWeighingOptions } from "@/features/content/data/weighing-options";
import { pricedProducts } from "@/features/catalog/data/quotation";
import { getCurrentProducts } from "@/features/catalog/server/product-repository";
import { siteMenuLink } from "@/features/site/data/site-menu-labels";

const title = siteMenuLink("/service/quotation").label;
export const metadata: Metadata = { title };

async function WarehouseQuotation() {
  await connection();
  let catalog;
  let products;
  try {
    const current = await getCurrentProducts();
    catalog = current.products;
    products = pricedProducts(catalog);
  } catch {
    return (
      <main id="main-content">
        <h1>{title}</h1>
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
      ? getWeighingOptions(catalog)
          .filter((head) => head.kind === "head" && item.compatibleCodes?.includes(head.code))
          .map((head) => head.code)
      : undefined,
  }));
  return <QuotationFromSelection products={products} presets={presets} />;
}

export default function QuotationPage() {
  return (
    <Suspense fallback={<SiteLoading label="กำลังเตรียมใบเสนอราคา…" />}>
      <WarehouseQuotation />
    </Suspense>
  );
}
