export type QuotationIssue = { number: string; createdAt: string };
export const quotationContact = "กำไลพลอย ศรีพุ่มไข่";

export function quotationDates(createdAt: string) {
  const localDay = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(createdAt));
  const end = new Date(localDay + "T00:00:00Z");
  end.setUTCDate(end.getUTCDate() + 14);
  const display = (day: string) => day.split("-").reverse().join("/");
  return { issued: display(localDay), expires: display(end.toISOString().slice(0, 10)) };
}
