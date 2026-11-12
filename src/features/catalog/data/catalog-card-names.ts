import type { Product } from "../types";

const sourceCardNames: Record<string, string> = {
  "10732": "LP53",
  "10733": "LP54",
  "10838": "PU30M16 สแตนเลส",
  "10839": "PU30M16 เหล็กขาว",
  "10840": "NY30M12",
  "10841": "PU20M08",
  "10842": "PU20M10",
  "10843": "NY20M12",
  "10844": "NY25M12",
  "FCS-150-SW31": "FCS-150-SW31",
  "TSS-150-SW31S": "TSS-150-SW31S",
  "CSS-150-SW31": "CSS-150-SW31",
  "TMS-30-AC31S": "TMS-30-AC31S",
  "ACS-30-JC21": "ACS-30-JC21",
  "ACS-30-JC81": "ACS-30-JC81",
  RLS1100: "RLS1100",
  "C1-Precision-Balance": "C1",
  FEH5KS: "FEH5KS",
  "LED-R5": "LED-R5",
  "LED-R3": "LED-R3",
  "LED-R1": "LED-R1",
  TMS: "TMS",
  "10624": "FD1000",
  "10646": "VB3000S",
  "10801": "P1W",
  "10802": "P1",
  "10805": "P4",
  "10730": "LP51",
  "10728": "LP50",
  "10723": "LED-R3",
  "10724": "LED-R5",
  "10725": "LED-R1",
  "10715": "RYG-POLE",
  "10716": "R-POLE",
  "10741": "DRW-350",
  "10737": "BSG-WL-1D",
  "10738": "สแกนเนอร์ 1D มีสาย",
  "10735": "ขาตั้งเครื่องพิมพ์",
  "10736": "คีย์บอร์ดและเมาส์ไร้สาย",
  Sticker_6040: "เลเบลกันน้ำ 4×6 ซม.",
  Sticker_5330: "เลเบล 3×5.3 ซม. / 5 ม้วน",
  Sticker_5320: "เลเบล 2×5.3 ซม. / 5 ม้วน",
  Sticker_5750: "กระดาษสลิป 5.7 ซม.",
  Sticker_8080: "กระดาษสลิป 8 ซม.",
  "10748": "เลเบล 20×60 มม. / 5 ม้วน",
  "10740": "เลเบลกันน้ำ 20×60 มม. / 1 ม้วน",
  "10749": "เลเบล 30×60 มม. / 5 ม้วน",
  "10750": "เลเบล 40×60 มม. / 5 ม้วน",
  "10747": "เลเบลกันน้ำ 40×60 มม. / 5 ม้วน",
  "10742": "เลเบลกันน้ำ 40×60 มม. / 2 ม้วน",
  "10744": "กระดาษสลิป 80×80 มม. / 10 ม้วน",
  "10743": "กระดาษสลิป 57×50 มม. / 10 ม้วน",
  "10745": "กระดาษสลิป 80×80 มม. / 20 ม้วน",
  "10746": "กระดาษสลิป 57×50 มม. / 20 ม้วน",
  "10810": "เลเบล 20×60 มม. / 50 ม้วน",
  "10809": "เลเบล 30×60 มม. / 50 ม้วน",
  "10812": "เลเบลกันน้ำ 40×60 มม. / 50 ม้วน",
  "10811": "เลเบล 40×60 มม. / 50 ม้วน",
  "10824": "กระดาษสลิป 80×80 มม. / 50 ม้วน",
};

export function catalogModelLabel(name: string) {
  if (name === "SUNFORD DRW-350 (DRW350-B / DRW350-W)") return "DRW-350";
  if (name === "VB3000S HiCoFE") return "VB3000S";
  if (name === "Fitdays Smart Scale - FD1000") return "FD1000";
  return name
    .replace(/^(?:SUNFORD|Indicator|Platform|RAMP)[\s-]+/i, "")
    .replace(/^(PCS-60-FC11)\s+\(SUS304 PAN\)$/i, "$1")
    .trim();
}

export function warehouseModelName(sku: string, name: string, mappedModel?: string): string {
  if (mappedModel === "SUNFORD DRW-350 (DRW350-B / DRW350-W)") {
    const variant = /DRW350-[BW]$/i.exec(sku);
    return variant?.[0] ?? "DRW-350";
  }
  if (mappedModel) return catalogModelLabel(mappedModel);
  // Remove supplier references before looking for a model in the item description.
  const title = name
    .trim()
    .replace(/^(?:\d{12,14}|(?:TF|MK)\d{5,})\s+/i, "")
    .replace(/^SUNFORD(?=[A-Z]+\d)/, "");
  if (/^SKU-/i.test(title)) return sku;
  const explicit = /(?:รุ่น|\bmodel)\s*[:：]?\s*([A-Z0-9][A-Z0-9._/-]*)/i.exec(title);
  if (explicit) return catalogModelLabel(explicit[1]);
  const platform = /\bPlatform\s+([A-Z]+\s+\d{4})\b/i.exec(title);
  if (platform) return platform[1];
  const software = /\b(Connect Driver|Connect POS\s*-\s*(?:Basic|Smart Retail))\b/i.exec(title);
  if (software) return software[1];
  const glove = /^TG\s+([A-Z]+KNIT)\b/.exec(title);
  if (glove) return glove[1];
  const tokens =
    title.replace(/\([^)]*\)/g, "").match(/[A-Za-z0-9]+(?:[-_/.][A-Za-z0-9]+)*/g) ?? [];
  const models = tokens.filter(
    (token) =>
      (/^[A-Z][A-Z0-9./_-]*\d[A-Z0-9./_-]*$/.test(token) ||
        /^\d+[A-Z]{1,3}$/.test(token) ||
        /^[A-Z]{2,}-[A-Z]+$/.test(token)) &&
      !/^\d+(?:D|V|G|KG|MM|CM|M)$/.test(token) &&
      !/^\d{8,}/.test(token),
  );
  if (models.length)
    return title.startsWith("จัดชุด") ? models.join(" + ") : catalogModelLabel(models[0]);
  return sku;
}

export function catalogCardName(
  product: Pick<Product, "name" | "sourceId"> &
    Partial<Pick<Product, "warehouseModelCodes" | "warehouseSku">>,
) {
  if (product.warehouseSku) return product.name;
  if (product.warehouseModelCodes?.[0])
    return catalogModelLabel(product.warehouseModelCodes[0].replace(/^Indicator-/, "Indicator "));
  return sourceCardNames[product.sourceId ?? ""] ?? catalogModelLabel(product.name);
}
