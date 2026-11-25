const months = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];
const shortMonths = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

export function storyCardDate(text: string) {
  const match = text.trim().match(/^(\d{1,2})\s+(\S+)\s+(\d{4})/);
  if (!match) return undefined;
  const month = months.indexOf(match[2]);
  const year = Number(match[3]);
  if (month < 0 || year < 2400) return undefined;
  return {
    label: `${Number(match[1])} ${shortMonths[month]} ${year}`,
    iso: `${year - 543}-${String(month + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`,
  };
}
