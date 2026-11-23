const price = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const baht = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" });

export function formatPrice(value: number): string {
  return price.format(value);
}

export function formatBaht(value: number): string {
  return baht.format(value);
}

export function formatCatalogCardPrice(value?: number | null): string {
  return value != null && value > 0 ? formatBaht(value) : "สอบถามราคา";
}
