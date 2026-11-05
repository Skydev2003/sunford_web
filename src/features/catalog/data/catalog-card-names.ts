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
  if (name === "VB3000S HiCoFE") return "VB3000S";
  if (name === "Fitdays Smart Scale - FD1000") return "FD1000";
  return name
    .replace(/^(?:SUNFORD|Indicator|Platform|RAMP)\s+/i, "")
    .replace(/^(PCS-60-FC11)\s+\(SUS304 PAN\)$/i, "$1")
    .trim();
}

export function catalogCardName(product: Pick<Product, "name" | "sourceId">) {
  return sourceCardNames[product.sourceId ?? ""] ?? catalogModelLabel(product.name);
}
