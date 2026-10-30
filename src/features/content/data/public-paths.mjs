const segments = {
  ห้องปฏิบัติการ: "laboratory",
  อุตสาหกรรม: "industrial",
  พาณิชยกรรมและบริการ: "commercial",
  ไลฟ์สไตล์: "lifestyle-scales",
  โครงสร้างแท่นชั่ง: "scale-platforms",
  อุปกรณ์ประกอบเครื่องชั่ง: "scale-accessories",
  อุปกรณ์ส่งข้อมูล: "data-interfaces",
  อุปกรณ์ต่อพ่วง: "scale-peripherals",
  ชิ้นส่วน: "parts",
  "POS-ระบบ-Windows": "pos-windows",
  แท่นชั่งจัดการข้อมูล: "data-management-platforms",
  ควบคุมชุดการผลิต: "batch-control",
  ควบคุมสูตรการผลิต: "formula-control",
  แท่นชั่งตั้งโต๊ะ: "benchtop-platforms",
  แท่นชั่งตั้งพืั้น: "floor-platforms",
  "การพิมพ์สติ๊กเกอร์น้ำหนัก-วันที่-เวลา-ภาพพื้นหลัง-บาร์โค้ด-คิวอาร์โค้ดจากเครื่องชั่ง":
    "scale-label-printing",
  การส่งข้อมูลน้ำหนักจากเครื่องชั่งไปยังคอมพิวตอร์: "scale-to-computer-data-transfer",
  "การส่งข้อมูลน้ำหนักจากเครื่องชั่งเพื่อบันทึกบน-USB-Driver": "scale-to-usb-data-recording",
  "ชิ้นส่วน Parts": "scale-parts",
  "ชิ้นส่วน-part-จอ": "display-parts",
  "ชิ้นส่วน-part-เสาสแตนเลส": "stainless-steel-columns",
  "ชิ้นส่วน-part-สติกเกอร์เลเบล": "label-sticker-parts",
  "มัลติฟังก์ชั่น ไม่เชื่อมต่อคลาวด์": "multifunction-offline",
  "มัลติฟังก์ชั่น เชื่อมต่อคลาวด์": "multifunction-cloud",
  เครื่องชั่งควบคุมและตรวจสอบคุณภาพ: "quality-control-scales",
  วิเคราะห์ผลสำหรับห้องปฏิบัติการ: "analytical-laboratory-scales",
  เครื่องชั่งนับจำนวน: "counting-scales",
  เครื่องชั่งน้ำหนัก: "weighing-scales",
  "เครื่องชั่งน้ำหนัก กันน้ำ": "waterproof-weighing-scales",
  อินดิเคเตอร์ประกอบแท่นชั่งน้ำหนัก: "platform-weighing-indicators",
  "อินดิเคเตอร์ประกอบแท่นชั่งน้ำหนัก กันน้ำ": "waterproof-platform-indicators",
  เครื่องชั่งน้ำหนักพัสดุและไปรษณีย์: "parcel-postal-scales",
  "เครื่องชั่งคำนวณราคา ฉีดล้างได้": "washdown-price-computing-scales",
  "เครื่องชั่งคำนวณราคา พิมพ์สลิปขาย": "receipt-printing-price-scales",
  เครื่องชั่งคำนวณราคา: "price-computing-scales",
  "เครื่องชั่งคำนวณราคา พิมพ์ฉลากสติ๊กเกอร์": "label-printing-price-scales",
  "ชั่งน้ำหนัก เชื่อมต่อ POS": "pos-connected-weighing",
  ชั่งกาแฟ: "coffee-scales",
  ชั่งประกอบอาหาร: "kitchen-scales",
  สุขภาพส่วนบุคคล: "personal-health-scales",
  สัตว์เลี้ยง: "pet-scales",
  โครงสร้างแท่นชั่งอัจฉริยะ: "smart-scale-platforms",
  วัสดุสิ้นเปลือง: "consumables",
  พรีเมี่ยม: "premium",
  แท่นเหล็กคาร์บอนสตีล: "carbon-steel-platforms",
  แท่นชั่งสแตนเลสสตีล: "stainless-steel-platforms",
  ไร้สายระยะใกล้: "short-range-wireless",
  ไร้สายระยะไกล: "long-range-wireless",
  เครื่องพิมพ์: "printers",
  จอแสดงผล: "displays",
  ไฟสัญญาณเตือน: "signal-lights",
  ลิ้นชักไฟฟ้า: "cash-drawers",
  สแกนเนอร์บาร์โค้ด: "barcode-scanners",
  กล้องถ่ายภาพ: "cameras",
  ขาตั้งอินดิเคเตอร์: "indicator-stands",
  แป้นรองเครื่องพิมพ์: "printer-mounts",
  แป้นรองเสาไฟสัญญาณเตือน: "signal-light-mounts",
  ทางลาดแท่นชั่ง: "platform-ramps",
  ม้วนสติ๊กเกอร์: "label-rolls",
  ม้วนกระดาษ: "paper-rolls",
  ระบบอัจฉริยะ: "smart-systems",
  "POS ระบบ Windows": "pos-windows",
  "POS ระบบ Android": "pos-android",
  "POS เชื่อมต่อเครื่องชั่ง": "pos-scale-integration",
  อินดิเคเตอร์นับจำนวน: "counting-indicators",
  อินดิเคเตอร์ชั่งน้ำหนัก: "weighing-indicators",
  อินดิเคเตอร์กันน้ำ: "waterproof-indicators",
  "แท่นชั่งตั้งพืั้น ขนาดใหญ่": "large-floor-platforms",
  อินดิเคเตอร์ห้องปฏิบัติการ: "laboratory-indicators",
  เครื่องชั่ง: "scales",
  อินดิเคเตอร์อุตสาหกรรม: "industrial-indicators",
  อินดิเคเตอร์พาณิชยกรรมและบริการ: "commercial-indicators",
  "อินดิเคเตอร์ชั่งน้ำหนัก-พาณิชยกรรมและบริการ": "commercial-weighing-indicators",
  ล้อแท่นชั่ง: "platform-wheels",
  "MES ควบคุมชุดการผลิต": "mes-batch-control",
  "MES ควบคุมสูตรการผลิต": "mes-formula-control",
  สายส่งข้อมูล: "data-cables",
  คีย์บอร์ดและเม้าส์: "keyboards-and-mice",
  "ม้วนสติ๊กเกอร์ กันน้ำ": "waterproof-label-rolls",
  เครื่องชั่งในบ้าน_จำเป็นแค่ไหน: "do-you-need-a-home-scale",
  จอ_LCD_และจอ_LED_แบบไหน_จะดีกว่ากัน: "lcd-vs-led-displays",
  เลขน้ำหนักมาได้ไง_ทั้งที่ไม่ได้ชั่ง: "why-scales-show-weight-without-a-load",
  ข้อควรทราบเกี่ยวกับการชาร์จแบตเตอรี่: "battery-charging-guide",
  เอกสารสอบเทียบเครื่องชั่ง_ISO_17025: "iso-17025-scale-calibration",
  มาตรฐานการป้องกันน้ำและฝุ่นละออง_IP_RATING: "ip-ratings-guide",
  เอกสารรับรองชั่งตวงวัด: "weights-and-measures-certification",
  ความปลอดภัยของวัสดุจานชั่งสแตนเลสของเครื่องชั่งสำหรับการสัมผัสอาหาร:
    "food-contact-stainless-steel-scale-pans",
  ข้อควรทราบก่อนการใช้งานเครื่องชั่งคำนวณราคา: "before-using-a-price-computing-scale",
  ชาร์จไฟไม่เข้า_ปลั๊กหาย_ปลั๊กเสีย_แบตเสื่อม: "scale-power-and-battery-troubleshooting",
  วิธีใช้งานเครื่องชั่งคำนวณราคาแบบรวดเร็ว: "price-computing-scale-quick-guide",
  การใช้สกรูป้องกันกระแทกบนเครื่องชั่งแบบแท่น_TCS: "tcs-platform-scale-transit-screws",
  ระบบชั่งควบคุมการผลิต: "production-weighing-systems",
  "pos-เชื่อมต่อเครื่องชั่ง": "pos-scale-integration",
};

const translations = new Map(
  Object.entries(segments).map(([key, value]) => [key.toLowerCase(), value]),
);

function fallbackSegment(value) {
  let hash = 14695981039346656037n;
  for (const character of value) {
    hash ^= BigInt(character.codePointAt(0));
    hash = BigInt.asUintN(64, hash * 1099511628211n);
  }
  return `content-${hash.toString(16).padStart(16, "0")}`;
}

export function publicPath(value) {
  if (!value.startsWith("/") || value.startsWith("//")) return value;
  const [, pathname, suffix] = value.match(/^([^?#]*)(.*)$/s);
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return value;
  }
  const path = decoded
    .split("/")
    .map((segment) => {
      if (!/[^\x00-\x7f]/.test(segment)) return segment;
      return translations.get(segment.toLowerCase()) ?? fallbackSegment(segment);
    })
    .join("/");
  return `${path}${suffix}`;
}

export function legacyPathCandidates(value) {
  if (!value.startsWith("/") || value.startsWith("//")) return [];
  const [, pathname, suffix] = value.match(/^([^?#]*)(.*)$/s);
  const candidates = pathname.split("/").reduce(
    (paths, segment) => {
      const originals = Object.entries(segments)
        .filter(([, translated]) => translated === segment)
        .map(([original]) => original);
      return paths.flatMap((path) =>
        (originals.length ? originals : [segment]).map((original) => `${path}/${original}`),
      );
    },
    [""],
  );
  return candidates.map((path) => `${path.slice(1)}${suffix}`).filter((path) => path !== value);
}

export function publicContent(value) {
  if (typeof value === "string") {
    if (value.startsWith("/") && !value.includes("<")) return publicPath(value);
    return value.replace(
      /\b(href|src|action|poster)=(['"])(.*?)\2/gi,
      (attribute, name, quote, url) => {
        const path = publicPath(url);
        return path === url ? attribute : `${name}=${quote}${path}${quote}`;
      },
    );
  }
  if (Array.isArray(value)) return value.map(publicContent);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [publicPath(key), publicContent(entry)]),
    );
  return value;
}
