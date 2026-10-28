// Existing photographs only. The additional images are the original customer
// story thumbnails in the imported /blogs/editorial index, not generated media.
export const customerStoryPhotos = [
  {
    id: "market",
    src: "/images/business-story.png",
    label: "ร้านค้าของผู้ประกอบการ",
    alt: "ผู้ประกอบการร้านค้ากับเครื่องชั่ง Sunford ในการทำงานจริง",
    cards: {
      quote: ["ชั่งง่าย", "ขายสบาย", "พร้อมทุกวัน"],
      benefit: ["คู่ใจร้านค้า", "ทุกการซื้อขาย"],
      heart: ["ทุกรอยยิ้ม", "คือแรงใจเรา"],
    },
  },
  {
    id: "heartyard",
    src: "/images/imported/c4318546491d30fed637.png",
    label: "Heartyard",
    alt: "การชั่งอาหารในร้าน Heartyard จากภาพเรื่องราวลูกค้า Sunford",
    cards: {
      quote: ["พอดีทุกส่วน", "ลงตัว", "ทุกจานโปรด"],
      benefit: ["ชั่งก่อนปรุง", "คุมส่วนผสม"],
      heart: ["ใส่ใจหลังครัว", "อร่อยถึงโต๊ะ"],
    },
  },
  {
    id: "kanom-thai",
    src: "/images/imported/e5fe81299783b0a5111a.png",
    label: "SPECIALTY COFFEE x KANOM THAI",
    alt: "การใช้เครื่องชั่งเตรียมขนมไทย จากภาพเรื่องราวลูกค้า Sunford",
    cards: {
      quote: ["ค่อย ๆ ชั่ง", "ค่อย ๆ ทำ", "ใส่ใจทุกชิ้น"],
      benefit: ["ส่วนผสมพอดี", "ขนมไทยลงตัว"],
      heart: ["เสน่ห์ขนมไทย", "จากใจคนทำ"],
    },
  },
  {
    id: "noodles",
    src: "/images/imported/62644bdc4b0749f7aad3.png",
    label: "ก๋วยจั๊บนายเล็กอ้วน เยาวราช",
    alt: "การชั่งวัตถุดิบจริงที่ร้านก๋วยจั๊บนายเล็กอ้วน เยาวราช",
    cards: {
      quote: ["ตักด้วยใจ", "ชั่งให้พอดี", "อร่อยทุกชาม"],
      benefit: ["ชั่งวัตถุดิบ", "เสิร์ฟได้คล่อง"],
      heart: ["จากใจคนปรุง", "ถึงคนรักเส้น"],
    },
  },
] as const;
