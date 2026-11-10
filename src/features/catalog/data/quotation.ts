export const seller = {
  name: "บริษัท ไทยโกลบอล ธุรกิจพัฒนา จำกัด",
  address: "เลขที่ 554, 554/1 ถนนเอกชัย แขวงคลองบางพราน เขตบางบอน กรุงเทพมหานคร 10150",
  taxId: "0105544085926",
  phone: "034-276999 (4 คู่สาย)",
  email: "mail@sunfordthai.com",
  website: "www.sunfordthai.com",
  bank: "ธนาคารกสิกรไทย · ออมทรัพย์ 035-8-53065-6",
};

export type QuoteProduct = { id: string; name: string; unit: string; unitSatang: number };

export function pricedProducts(
  products: { sku: string; product_name: string; unit: string; sale_price: number }[],
): QuoteProduct[] {
  return products.map(({ sku, product_name, unit, sale_price }) => {
    const unitSatang = Math.round(sale_price * 100);
    if (!Number.isSafeInteger(unitSatang) || unitSatang <= 0 || unitSatang / 100 !== sale_price)
      throw new RangeError("Invalid Warehouse unit price");
    return { id: sku, name: product_name, unit, unitSatang };
  });
}

export function quotationTotals(net: number) {
  if (!Number.isSafeInteger(net) || net < 0) return null;
  const vat = Number((BigInt(net) * BigInt(7) + BigInt(50)) / BigInt(100));
  const gross = net + vat;
  return Number.isSafeInteger(gross) ? { net, vat, gross } : null;
}
export type QuotePreset = {
  code: string;
  pricedId?: string;
  label: string;
  includesCodes?: string[];
};

export function selectedQuoteItems(models: string[], presets: QuotePreset[]) {
  const byCode = new Map(presets.map((item) => [item.code, item]));
  const ids: string[] = [];
  const pending: string[] = [];
  const selected = new Set(models);
  const included = new Set(
    presets
      .filter((item) => selected.has(item.code) && item.pricedId)
      .flatMap((item) => item.includesCodes ?? []),
  );
  for (const code of new Set(models)) {
    const item = byCode.get(code);
    if (included.has(code)) continue;
    if (!item) {
      pending.push(code);
      continue;
    }
    if (item.pricedId) {
      if (!ids.includes(item.pricedId)) ids.push(item.pricedId);
    } else pending.push(item.label);
  }
  return { ids, pending };
}
