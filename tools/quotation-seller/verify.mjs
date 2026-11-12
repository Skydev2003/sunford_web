// Reconstruct the owner's reference for local QA only. Source data/images stay in output/.
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { chromium } from "@playwright/test";
import { build } from "esbuild";
import sharp from "sharp";
import { PDFDocument, PDFName, PDFNumber } from "pdf-lib";
import assert from "node:assert/strict";
const ref = process.argv[2];
const dir = "output/quotation";
const src = await fs.readFile(ref),
  offset = src.indexOf(Buffer.from("ffd8ff", "hex"));
const jpg = src.subarray(offset, src.indexOf(Buffer.from("ffd9", "hex"), offset) + 2);
const X = (v) => Math.round((v * 2382) / 840),
  Y = (v) => Math.round((v * 3483) / 1188);
async function crop(x, y, r, b) {
  return sharp(jpg)
    .extract({ left: X(x), top: Y(y), width: X(r) - X(x), height: Y(b) - Y(y) })
    .png()
    .toBuffer();
}
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage();
  await page.route("http://proof.local/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname === "/")
      return route.fulfill({
        contentType: "text/html",
        body: "<style>@font-face{font-family:Proof;src:url(/regular.ttf)}@font-face{font-family:Proof;src:url(/semibold.ttf);font-weight:600}form{font-family:Proof,sans-serif}</style><form></form>",
      });
    const assets = {
      "/images/quotation-template.png": "public/images/quotation-template.png",
      "/regular.ttf": "src/app/fonts/noto-thai-regular.ttf",
      "/semibold.ttf": "src/app/fonts/noto-thai-semibold.ttf",
    };
    if (!assets[pathname]) return route.abort();
    return route.fulfill({ path: assets[pathname] });
  });
  await page.goto("http://proof.local/");
  const fixture = await build({
    entryPoints: ["src/features/catalog/data/quotation-pdf.ts"],
    format: "iife",
    globalName: "quotation",
    bundle: true,
    write: false,
  });
  await page.addScriptTag({ content: fixture.outputFiles[0].text });
  const pdf = await page.evaluate(async () => {
    const family = getComputedStyle(document.querySelector("form")).fontFamily;
    await Promise.all([
      document.fonts.load("400 12px " + family, "ก"),
      document.fonts.load("600 12px " + family, "ก"),
    ]);
    const { bytes } = await quotation.createBuyerPdf(
      {
        name: "บริษัท อายิโนะโมะโต๊ะ โฟรเซ่นฟู้ดส์ (ประเทศไทย) จำกัด",
        address: "เลขที่ 487/1 ถนนศรีอยุธยา แขวงถนนพญาไท เขตราชเทวี กรุงเทพมหานคร 10400",
        tax: "0105533115772",
        branch: "สำนักงานใหญ่",
        phone: "",
        email: "",
        website: "",
        reference: "-",
        contact: "",
      },
      [
        {
          id: "G106698",
          name: "8858847106698 SUNFORD เครื่องชั่ง WPS10KS : WPS10KS",
          quantity: 2,
          unitSatang: 354206,
          details:
            "- ตั้งค่าพิกัดน้ำหนัก 3kg ความละเอียด 0.1g\n- ขนาดเครื่อง W20 * L27.5 * H11 cm\n- ขนาดจานชั่ง W20 * L16 cm\n- เพิ่มระบบบลูทูธ\n- เชื่อมต่อกับแอพ WeWeigh",
        },
        {
          id: "G108326",
          name: "8858847108326 SUNFORD ชิ้นส่วน - ส่วนขยายวงจร บลูทูธ BTB",
          quantity: 2,
          unitSatang: 93458,
          details: "",
        },
      ],
      family,
      () => Promise.resolve({ number: "00000001", createdAt: new Date().toISOString() }),
    );
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(new Blob([bytes]));
    });
  });
  const draft = path.resolve(dir, "reference-buyer.pdf");
  await fs.writeFile(draft, Buffer.from(pdf, "base64"));
  const longDraft = path.resolve(dir, "pagination-buyer.pdf");
  const longBytes = await page.evaluate(async () => {
    const items = Array.from({ length: 15 }, (_, i) => ({
      id: "TEST-" + (i + 1),
      name: "Model " + (i + 1),
      quantity: 1,
      unitSatang: 10000,
      details: "",
    }));
    const { bytes } = await quotation.createBuyerPdf(
      {
        name: "Layout test",
        address: "",
        tax: "",
        branch: "",
        phone: "",
        email: "",
        website: "",
        reference: "",
        contact: "",
      },
      items,
      "Proof",
      async () => ({ number: "00000001", createdAt: "2026-11-11T00:00:00Z" }),
    );
    return Array.from(bytes);
  });
  await fs.writeFile(longDraft, Buffer.from(longBytes));
  await page.goto(pathToFileURL(path.resolve(dir, "SUNFORD-seller.html")).href);
  await page.locator("[name=source]").setInputFiles(draft);
  for (const [name, value] of Object.entries({
    note: "รับประกัน 3 ปี ตามเงื่อนไขบริษัทฯ (ดูรายละเอียดการรับประกันได้ทางเว็บไซต์บริษัทฯ)",
  }))
    await page.locator("[name=" + name + "]").fill(value);
  for (const [name, box] of [
    ["signature", [351, 1044, 469, 1081]],
    ["qr", [134, 1036, 223, 1121]],
  ])
    await page
      .locator("[name=" + name + "]")
      .setInputFiles({ name: name + ".png", mimeType: "image/png", buffer: await crop(...box) });
  const [file] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "ดาวน์โหลดใบเสนอราคา PDF" }).click(),
  ]);
  const final = path.resolve(dir, "00000001-layout-proof.pdf");
  if (file.suggestedFilename() !== "SUNFORD.pdf")
    throw Error("Unexpected seller download filename");
  await file.saveAs(final);
  await page.locator("[name=source]").setInputFiles(longDraft);
  const [longFile] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "ดาวน์โหลดใบเสนอราคา PDF" }).click(),
  ]);
  const longFinal = path.resolve(dir, "pagination-proof.pdf");
  await longFile.saveAs(longFinal);
  const longDoc = await PDFDocument.load(await fs.readFile(longFinal));
  assert.equal(longDoc.getPageCount(), 2);
  const footerY = longDoc.catalog.lookup(PDFName.of("SunfordFooterTop"), PDFNumber).asNumber();
  assert.equal(footerY, 223); // Twelve rows on page one, three rows before the footer on page two.
  for (const [index, hasHeader, items] of [
    [1, true, 12],
    [2, false, 3],
  ]) {
    const prefix = path.join(dir, "pagination-page-" + index);
    execFileSync("pdftoppm", [
      "-f",
      String(index),
      "-l",
      String(index),
      "-scale-to-x",
      "840",
      "-scale-to-y",
      "1188",
      "-singlefile",
      "-png",
      longFinal,
      prefix,
    ]);
    const raster = await sharp(prefix + ".png")
      .removeAlpha()
      .raw()
      .toBuffer();
    const count = (x, y, w, h, match) => {
      let hits = 0;
      for (let j = y; j < y + h; j++)
        for (let i = x; i < x + w; i++) {
          const p = (j * 840 + i) * 3;
          if (match(raster[p], raster[p + 1], raster[p + 2])) hits++;
        }
      return hits;
    };
    const dark = (r, g, b) => Math.max(r, g, b) < 180;
    const red = (r, g, b) => r > 180 && g < 100 && b < 100;
    assert.equal(count(30, 35, 200, 66, red) > 100, hasHeader, "SUNFORD logo only on page one");
    for (let i = 0; i < items; i++) {
      const y = (hasHeader ? 409 : 40) + i * 61;
      assert.ok(count(65, y + 5, 120, 18, dark) > 20, "missing SKU on page " + index);
      assert.ok(count(65, y + 22, 120, 18, dark) > 15, "missing name on page " + index);
    }
    assert.equal(
      count(121, 0, 34, 1188, red) > (hasHeader ? count(121, 35, 34, 66, red) : 0),
      !hasHeader,
      "payment logo only on the final page",
    );
    if (!hasHeader) {
      const offset = footerY - 714;
      assert.ok(count(134, 1035 + offset, 89, 85, dark) > 500, "QR must follow the final block");
      assert.ok(
        count(350, 1044 + offset, 118, 37, dark) > 20,
        "signature must follow the final block",
      );
    }
  }
  const doc = await PDFDocument.load(await fs.readFile(final));
  if (
    doc.getPageCount() !== 1 ||
    doc.getTitle() !== "00000001" ||
    doc.getSubject() !== "SUNFORD quotation / issued"
  )
    throw Error("Invalid final PDF");
  for (const [file, label] of [
    [ref, "reference"],
    [draft, "buyer"],
    [final, "generated"],
  ])
    execFileSync("pdftoppm", [
      "-scale-to-x",
      "840",
      "-scale-to-y",
      "1188",
      "-singlefile",
      "-png",
      file,
      path.join(dir, label),
    ]);
  const raw = async (label) =>
    await sharp(path.join(dir, label + ".png"))
      .removeAlpha()
      .raw()
      .toBuffer();
  const a = await raw("reference"),
    b = await raw("generated"),
    overlay = Buffer.alloc(a.length);
  const buyerImage = await raw("buyer");
  if (!buyerImage.subarray(0, 840 * 364 * 3).equals(b.subarray(0, 840 * 364 * 3))) {
    throw Error("Seller completion changed the buyer document header");
  }
  let changed = 0,
    staticChanged = 0,
    staticCount = 0;
  for (let i = 0; i < a.length; i += 3) {
    const y = Math.floor(i / 3 / 840),
      delta = Math.max(...[0, 1, 2].map((k) => Math.abs(a[i + k] - b[i + k])));
    if (delta > 20) changed++;
    if (y < 120 || (y >= 365 && y < 406) || (y >= 853 && y < 950)) {
      staticCount++;
      if (delta > 20) staticChanged++;
    }
    for (let k = 0; k < 3; k++)
      overlay[i + k] =
        delta > 20 ? (k === 0 ? 220 : k === 1 ? 40 : 85) : Math.round(180 + 0.29 * b[i + k]);
  }
  await sharp(overlay, { raw: { width: 840, height: 1188, channels: 3 } })
    .png()
    .toFile(path.join(dir, "difference.png"));
  const boxes = {
    number: [648, 127, 785, 149],
    issued: [648, 149, 785, 169],
    expires: [648, 169, 785, 191],
    contact: [555, 252, 790, 282],
    buyer: [102, 248, 318, 284],
    address: [102, 284, 318, 335],
    tax: [102, 335, 318, 353],
    firstItem: [64, 432, 437, 452],
    secondItem: [64, 597, 440, 617],
    firstAmount: [635, 411, 711, 434],
    firstQty: [435, 411, 488, 434],
    firstPrice: [499, 411, 561, 434],
    firstDiscount: [565, 411, 622, 434],
    firstWht: [775, 411, 797, 434],
    secondQty: [435, 576, 488, 595],
    secondPrice: [499, 576, 561, 595],
    secondDiscount: [565, 576, 622, 595],
    secondAmount: [635, 576, 711, 595],
    secondWht: [775, 576, 797, 595],
    buyerPhone: [343, 248, 520, 270],
    buyerEmail: [343, 271, 520, 290],
    buyerWebsite: [343, 291, 520, 313],
    reference: [648, 190, 785, 212],
    detail: [64, 466, 438, 487],
    net: [415, 726, 500, 750],
    vat: [415, 751, 500, 772],
    words: [219, 774, 499, 795],
    gross: [643, 735, 760, 780],
    payable: [689, 819, 797, 845],
    note: [119, 953, 797, 988],
    qr: [124, 1034, 237, 1129],
    signature: [345, 1035, 475, 1089],
    signedDate: [350, 1098, 469, 1126],
  };
  const bounds = (pixels, [x, y, r, b], threshold) => {
    let l = r,
      t = b,
      right = x,
      bottom = y;
    for (let j = y; j < b; j++)
      for (let i = x; i < r; i++)
        if (pixels[(840 * j + i) * 3] < threshold) {
          l = Math.min(l, i);
          t = Math.min(t, j);
          right = Math.max(right, i);
          bottom = Math.max(bottom, j);
        }
    return [l, t, right, bottom];
  };
  const positions = {};
  for (const [field, box] of Object.entries(boxes)) {
    const threshold = ["buyerPhone", "detail"].includes(field) ? 180 : 150;
    const original = bounds(a, box, threshold),
      actual = bounds(b, box, threshold);
    const edge =
      /(?:Qty|Price|Amount|Discount|Wht)$/.test(field) ||
      ["net", "vat", "words", "gross", "payable"].includes(field)
        ? 2
        : 0;
    positions[field] = {
      original,
      actual,
      anchorDxMm: (actual[edge] - original[edge]) / 4,
      topDyMm: (actual[1] - original[1]) / 4,
    };
  }
  const report = {
    page: doc.getPage(0).getSize(),
    staticCount,
    staticChanged,
    changedPixels: changed,
    totalPixels: 840 * 1188,
    positions,
  };
  await fs.writeFile(path.join(dir, "comparison.json"), JSON.stringify(report, null, 2));
  console.log(report);
  if (
    staticChanged ||
    Object.values(positions).some((p) => Math.abs(p.anchorDxMm) >= 1 || Math.abs(p.topDyMm) >= 1)
  )
    throw Error("Reference layout changed by at least one mm, or the fixed artwork differs");
} finally {
  await browser.close();
}
