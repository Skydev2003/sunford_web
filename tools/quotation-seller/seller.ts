import { completeSellerPdf, downloadPdf } from "../../src/features/catalog/data/quotation-pdf";

const form = document.querySelector("form")!;
const status = form.querySelector("[role=status]")!;
form.onsubmit = async (event) => {
  event.preventDefault();
  const button = form.querySelector("button")!;
  if (button.disabled) return;
  status.textContent = "";
  button.disabled = true;
  const data = new FormData(form);
  const value = (name: string) => String(data.get(name) || "").trim();
  const file = (name: string) => data.get(name) as File;
  try {
    await document.fonts.load("12px Quotation", "สวัสดี");
    const pdf = await completeSellerPdf(
      await file("source").arrayBuffer(),
      {
        note: value("note"),
        signature: file("signature"),
        qr: file("qr"),
      },
      "Quotation, sans-serif",
    );
    downloadPdf(pdf.bytes);
    status.textContent = "ดาวน์โหลดใบเสนอราคาแล้ว";
  } catch (e) {
    status.textContent = e instanceof Error ? e.message : "สร้าง PDF ไม่สำเร็จ";
  } finally {
    button.disabled = false;
  }
};
