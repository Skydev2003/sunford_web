// Public company details and map links from the imported Sunford /contact-us page.
// Keep these independent of the reference artwork, which is only a layout reference.
export const contactLocations = [
  {
    id: "service",
    imageKey: "serviceImage",
    title: "ศูนย์บริการลูกค้าซันฟอร์ด",
    label: "CUSTOMER SERVICE",
    company: "สอบถามข้อมูลผลิตภัณฑ์และบริการหลังการขาย",
    address: "เลขที่ 99 หมู่ 9 ตำบลบางระกำ อำเภอบางเลน จังหวัดนครปฐม 73130",
    map: "https://maps.app.goo.gl/oo6XjvRCyU6Xp4Kv5",
  },
  {
    id: "office",
    imageKey: "officeImage",
    title: "สำนักงานใหญ่",
    label: "HEAD OFFICE",
    company: "บริษัท ไทยโกลบอล ธุรกิจพัฒนา จำกัด (สำนักงานใหญ่)",
    address: "เลขที่ 554, 554/1 ถนนเอกชัย แขวงคลองบางพราน เขตบางบอน กรุงเทพฯ 10150",
    map: "https://maps.app.goo.gl/aVNJPVeYr2oC8yqf9",
  },
  {
    id: "warehouse",
    imageKey: "warehouseImage",
    title: "โรงงานและคลังสินค้า",
    label: "FACTORY & WAREHOUSE",
    company: "บริษัท ไทยโกลบอล ธุรกิจพัฒนา จำกัด (สาขาบางเลน)",
    address: "เลขที่ 99 หมู่ 9 ตำบลบางระกำ อำเภอบางเลน จังหวัดนครปฐม 73130",
    map: "https://maps.app.goo.gl/uBffjvcbcDk9Sbjd6",
  },
] as const;

export type ContactLocationKind = (typeof contactLocations)[number]["id"];
export type ContactLocationImages = Record<(typeof contactLocations)[number]["imageKey"], string>;

export const defaultContactLocationImages: ContactLocationImages = {
  serviceImage: "",
  officeImage: "",
  warehouseImage: "",
};
