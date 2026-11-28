type SupportLink = { href: string; label: string };

type SoftwareSupportPage = {
  slug: string;
  title: string;
  standalone?: true;
  description?: string;
  guide?: SupportLink;
  videos?: SupportLink[];
};

const video = (id: string, label: string): SupportLink => ({
  href: `https://www.youtube.com/watch?v=${id}`,
  label,
});

export const softwareSupportPages: SoftwareSupportPage[] = [
  {
    slug: "sunford-pos-smart-android",
    title: "SUNFORD POS Smart Android",
    standalone: true,
    description:
      "ระบบจัดการร้านค้าปลีกบน Android ครอบคลุมงานขายหน้าร้าน สต็อก สมาชิก โปรโมชัน และรายงานหลังร้าน",
    videos: [
      video("9Yf5J6LnhLE", "วิดีโอสอนใช้งานระบบหน้าร้าน"),
      video("2D1kxUVyxF8", "วิดีโอสอนใช้งานระบบหลังร้าน"),
    ],
  },
  {
    slug: "sunford-pos-android",
    title: "SUNFORD POS ANDROID",
    description:
      "ระบบขายหน้าร้านบน Android รองรับการขายตามน้ำหนักและการสแกนบาร์โค้ด พร้อมรายงานสำหรับเจ้าของร้าน",
    videos: [
      video("k0-hlqHCNYI", "จัดการหลังร้านสำหรับเจ้าของกิจการ"),
      video("c32nf4m3gyE", "เรียกดูรายงาน"),
      video("9aaWVszYegg", "ต่ออุปกรณ์พ่วง"),
      video("zvRBxRZ2Wts", "ขายสินค้าตามน้ำหนัก"),
      video("bX52R3EKZ24", "ขายสินค้าด้วยบาร์โค้ด"),
    ],
  },
  {
    slug: "sunford-pos-basic",
    title: "SUNFORD POS Basic",
    description:
      "โปรแกรมขายหน้าร้านบน Windows สำหรับจัดการสินค้า สต็อก ใบเสร็จ รายงาน และสิทธิ์พนักงาน",
    videos: [
      video("SECGw6dYPks", "แนะนำโปรแกรม"),
      video("BXyWCqG9akM", "ขายสินค้า"),
      video("SOO6Tw7Az58", "สร้างสินค้าและจัดการสต็อก"),
      video("0SgwN-vjgvE", "เรียกดูใบเสร็จ"),
      video("Eid33j0guBQ", "เรียกดูรายงาน"),
    ],
  },
  {
    slug: "sunford-pos-smart-retail",
    title: "SUNFORD SmartRetail POS",
    guide: {
      href: "/service/technical-specification/guides/sql-server",
      label: "คู่มือติดตั้ง SQL Server",
    },
  },
  {
    slug: "sunford-rls1100",
    title: "SUNFORD RLS สำหรับรุ่น RLS1100",
    guide: {
      href: "/service/technical-specification/guides/rls1100",
      label: "คู่มือติดตั้ง RLS1100",
    },
  },
  {
    slug: "sunford-rls1800",
    title: "SUNFORD RLS สำหรับรุ่น RLS1800",
  },
  {
    slug: "sunford-we-weight",
    title: "SUNFORD WeWeigh",
  },
  {
    slug: "sunford-indus",
    title: "SUNFORD INDUS",
  },
  {
    slug: "sunford-drv",
    title: "SUNFORD DRV",
    description: "ไดรเวอร์สำหรับส่งค่าน้ำหนักจากเครื่องชั่ง SUNFORD ไปยังโปรแกรมบน Windows",
    videos: [
      video("x8j_dMU7NXc", "แนะนำ SUNFORD Connect Driver 1.0"),
      video("EJvS8_P3xQk", "ส่งค่าน้ำหนักเข้าโปรแกรมบน Windows"),
    ],
  },
  {
    slug: "sunford-lp50-label-printer",
    title: "SUNFORD LP50 Label Printer",
    guide: {
      href: "/service/technical-specification/guides/lp50",
      label: "คู่มือออกแบบฉลากและสลิป LP50",
    },
  },
  {
    slug: "fitdays",
    title: "SUNFORD FITDAYS",
  },
];

export function getSoftwareSupportPage(slug: string) {
  return softwareSupportPages.find((page) => page.slug === slug);
}
