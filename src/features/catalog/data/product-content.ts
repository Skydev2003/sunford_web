import sanitizeHtml from "sanitize-html";
import { load } from "cheerio";

const technicalLabels = [
  "หน่วยความจำ",
  "การเชื่อมต่อระบบ",
  "การเชื่อมต่อ",
  "การพิมพ์ฉลาก",
  "วัสดุและความทนทาน",
  "รุ่น",
  "รูปแบบ",
  "ระดับชั้นความละเอียด",
  "พิกัดน้ำหนักสูงสุด",
  "พิกัดน้ำหนัก",
  "ค่าน้ำหนัก",
  "ค่าอ่านละเอียด",
  "ค่าละเอียด",
  "ความละเอียด",
  "น้ำหนักชั่งขั้นต่ำ",
  "จอแสดงผล",
  "หน้าจอแสดงผล",
  "แสดงหน่วยปริมาตร",
  "แสดงหน่วยน้ำหนัก",
  "พลังงาน",
  "แบตเตอรี่",
  "บตเตอรี่",
  "วัสดุโครงสร้าง",
  "วัสดุจานชั่ง",
  "วัสดุโหลดเซลล์",
  "ขนาดจานชั่ง",
  "ขนาดเครื่องชั่งพร้อมใช้งาน",
  "ขนาดเครื่องชั่งขณะพับเก็บ",
  "ขนาดเครื่องชั่ง",
  "ขนาดบรรจุภัณฑ์",
  "ขนาดตัวเครื่อง",
  "ขนาดทางลาด",
  "ขนาดเครื่องพิมพ์",
  "ขนาดจอเสริม",
  "ขนาดหัวอินดิเคเตอร์ขณะประกอบฐานตั้งใช้งาน",
  "ขนาดหน้ากว้าง",
  "ชามชั่งขนาด",
  "ขนาด",
  "น้ำหนักสุทธิ",
  "น้ำหนักรวมบรรจุภัณฑ์",
  "น้ำหนักรวมกระเป๋าพลาสติก",
  "น้ำหนักสินค้า",
  "น้ำหนักจอเสริมรวมบรรจุภัณฑ์",
  "น้ำหนักจอเสริม",
  "น้ำหนักเครื่องชั่งรวมบรรจุภัณฑ์",
  "น้ำหนัก",
  "บาร์โค้ดผลิตภัณฑ์",
  "มาตรฐานกันน้ำ กันฝุ่น",
  "รับประกันคุณภาพ",
  "มีบริการหลังการขายตลอดอายุการใช้งาน",
  "บริการหลังการขายตลอดอายุการใช้งาน",
  "แสดงจำนวนนับชิ้นงาน",
  "ใช้อะแด๊ปเตอร์จ่ายไฟตรง",
  "ใช้ถ่านไฟฉาย",
  "คุณสมบัติเทียบเท่ามาตรฐาน",
  "ผ่านการตรวจรับรองจาก",
  "แสดงราคา",
  "แสดงจำนวนเงิน",
  "แสดงน้ำหนัก/ราคาต่อกิโลกรัม/จำนวนเงิน",
  "ปุ่มบันทึกราคาใช้บ่อย",
  "แสดงน้ำหนัก",
  "ระยะเวลาชาร์จรอบละ",
  "เตือนน้ำหนักขาด-พอดี-เกิน",
  "แสงพื้นหลังจอแสดงผลช่วยให้อ่านง่าย",
  "พร้อมเชื่อมต่อแอพพลิเคชั่น",
  "พร้อมส่งข้อมูลแบบใช้สาย ผ่านพอร์ท",
  "พร้อมส่งข้อมูลแบบไร้สาย",
  "เลือกส่งข้อมูลไปยังจอเสริม",
  "เลือกใช้ถ่านไฟฉาย ชนิด",
  "เลือกใช้ถ่านไฟฉาย",
  "สั่งเพิ่มอุปกรณ์ส่งข้อมูลไปยังแอพพลิเคชั่น",
  "เลือกส่งข้อมูลแบบใช้สาย ผ่านพอร์ท",
  "เลือกส่งข้อมูลแบบไร้สาย",
  "เลือกส่งข้อมูลไฟยังเสาไฟสัญญาณเตือนน้ำหนัก/จำนวนขาด-เกินแบบ",
  "บริการสอบเทียบมาตรฐาน",
  "เลือกปรับระดับความสว่างของจอได้",
  "จดจำรายการสินค้าได้สูงสุด",
  "ส่งข้อมูลและรับพลังงานผ่านสาย",
  "ใช้พลังงานไฟฟ้าโดยตรงจากคอมพิวเตอร์ ผ่านสายสัญญาณ",
  "ผลิตภัณฑ์",
  "ลักษณะ",
  "Indicator",
  "Platform",
  "DPI",
  "ถ่าน",
  "ไฟเตือน",
  "เครื่องบันทึกเงินสดระบวินโดวส์รุ่น",
  "เครื่องบันทึกเงินสดระบบแอนดรอยด์รุ่น",
  "เครื่องบันทึกเงินสด",
  "เครื่องอ่านบาร์โค้ดไร้สาย",
  "เครื่องอ่านบาร์โค้ดมีสาย",
  "คีย์บอร์ดและเม้าส์",
  "ลิ้นชักไฟฟ้า",
  "บรรจุในกล่อง",
  "บรรจุ",
  "จำนวน",
  "เหมาะสำหรับ",
];
const technicalLabelPattern = new RegExp(
  `^\\s*(${technicalLabels
    .sort((a, b) => b.length - a.length)
    .map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"))
    .join("|")})(\\s*[:：])?\\s*`,
  "i",
);

export function mergeProductContentRows(
  rows: ({ label: string; html: string } | { label: string; value: string })[],
) {
  const groups = new Map<string, { label: string; fragments: string[]; seen: Set<string> }>();
  const normalize = (value: string) => value.normalize("NFKC").replace(/\s+/g, " ").trim();
  const signature = (html: string) => {
    const $ = load(html, undefined, false);
    const media = $("a, img, video, iframe, source")
      .map((_, node) =>
        [
          node.tagName,
          ...["href", "src", "srcset", "poster", "alt"].map((key) => $(node).attr(key) ?? ""),
        ].join("|"),
      )
      .get()
      .join(";");
    const text = normalize($.root().text());
    return !media && (!text || /^[-–—]$/.test(text)) ? "" : `${text}\u0000${media}`;
  };
  for (const row of rows) {
    const key = normalize(row.label)
      .replace(/\s+/g, "")
      .replace(/[:：]+$/, "")
      .toLowerCase();
    const label = ["รายละเอียด", "รายละเอียดสินค้า"].includes(key)
      ? "รายละเอียดสินค้า"
      : row.label.trim();
    const groupKey = label === "รายละเอียดสินค้า" ? label : key;
    let group = groups.get(groupKey);
    if (!group) {
      group = { label, fragments: [], seen: new Set() };
      groups.set(groupKey, group);
    }
    const html =
      "html" in row
        ? row.html
        : `<span class="product-plain-value">${load("<span></span>")("span").text(row.value).html() ?? ""}</span>`;
    const contentKey = signature(html);
    if (contentKey && !group.seen.has(contentKey)) {
      group.fragments.push(`<div class="product-value">${html}</div>`);
      group.seen.add(contentKey);
    }
  }
  return [...groups.values()].map((group) => {
    const $ = load(group.fragments.join(""), undefined, false);
    const seen = new Set<string>();
    $("p, li").each((_, node) => {
      const element = $(node);
      if (element.find("p, li").length) return;
      const key = signature($.html(node));
      if (key && seen.has(key)) element.remove();
      else if (key) seen.add(key);
    });
    $("ul, ol, .product-value")
      .toArray()
      .reverse()
      .forEach((node) => {
        if (!signature($.html(node))) $(node).remove();
      });
    return { label: group.label, html: $.root().html() || "-" };
  });
}

export function productContentRows(html: string, splitLabels = false) {
  const $ = load(html, undefined, false);
  const rows: { label: string; html: string }[] = [];
  let section = splitLabels ? "คุณสมบัติ" : "รายละเอียด";
  const addRow = (row: (typeof rows)[number]) => {
    const previous = rows.at(-1);
    if (previous?.label === row.label && previous.html === "-") previous.html = row.html;
    else rows.push(row);
  };
  const walk = (parent: ReturnType<typeof $>) => {
    parent.contents().each((_, node) => {
      if (node.type === "comment") return;
      const element = $(node);
      const tag = "name" in node ? node.name : "";
      const text = element.text().trim();
      if (["div", "section", "article"].includes(tag)) {
        walk(element);
        return;
      }
      if (
        !text &&
        !element.is("img, video, iframe") &&
        !element.find("img, video, iframe").length
      ) {
        return;
      }
      if (/^(เหมาะสำหรับ|คุณสมบัติ|คุณสมบัติของเครื่องชั่ง|จุดเด่น|การใช้งาน)$/.test(text)) {
        section = text;
        rows.push({ label: section, html: "-" });
        return;
      }
      if (splitLabels && tag === "p" && !element.find("br").length) {
        const fullText = element.text();
        const match = fullText.match(technicalLabelPattern);
        if (match && fullText.slice(match[0].length).trim()) {
          const copy = element.clone();
          let remaining = match[0].length;
          const removePrefix = (parent: ReturnType<typeof $>) => {
            parent.contents().each((_, child) => {
              if (!remaining) return;
              if (child.type === "text") {
                const length = Math.min(remaining, child.data.length);
                child.data = child.data.slice(length);
                remaining -= length;
              } else if ("children" in child) removePrefix($(child));
            });
          };
          removePrefix(copy);
          if (!remaining) {
            addRow({ label: match[1] + (match[2] ?? ""), html: copy.html() ?? "" });
            return;
          }
        }
        const copy = element.clone();
        const first = copy
          .contents()
          .filter((_, child) => child.type !== "text" || Boolean($(child).text().trim()))
          .first();
        if (
          first.is("span") &&
          /^[^()]+\([^()]+\)$/.test(first.text().trim()) &&
          first.nextAll().length
        ) {
          const label = first.text().trim();
          first.remove();
          if (copy.text().trim()) {
            addRow({ label, html: copy.html() ?? "" });
            return;
          }
        }
      }
      const content = /^h[1-6]$/.test(tag)
        ? `<p><strong>${element.html() ?? ""}</strong></p>`
        : $.html(node);
      addRow({ label: section, html: formatProductContent(content) });
    });
  };
  walk($.root());
  return rows;
}

export function formatProductContent(html: string, listParagraphs = false) {
  return html.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (paragraph, content: string) => {
    if (/<(?:img|video|iframe|table|ul|ol|figure)\b/i.test(content)) return paragraph;
    const text = content
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
    if (!text) return "";
    if (/^(เหมาะสำหรับ|คุณสมบัติ|คุณสมบัติของเครื่องชั่ง|จุดเด่น|การใช้งาน)$/.test(text)) {
      return `<h3>${content}</h3>`;
    }
    const lines = content.split(/<br\s*\/?\s*>/i).filter((line) =>
      line
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim(),
    );
    if (!listParagraphs && lines.length < 2) return paragraph;
    return `<ul class="product-points">${lines
      .map(
        (line) =>
          `<li>${sanitizeHtml(line, {
            allowedTags: [...sanitizeHtml.defaults.allowedTags, "span"],
            allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, "*": ["class"] },
          })}</li>`,
      )
      .join("")}</ul>`;
  });
}
