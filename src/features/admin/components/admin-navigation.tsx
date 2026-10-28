"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  House,
  LayoutGrid,
  Package,
  FileText,
  Tags,
  Menu,
  Contact,
  PanelBottom,
  History,
  Trash2,
} from "lucide-react";
import { homeSettingCards, siteSettingCards } from "@/features/cms/data/admin-sections";

const groups = [
  {
    label: "แค็ตตาล็อก",
    links: [
      { href: "/admin/products", label: "ผลิตภัณฑ์", icon: Package },
      { href: "/admin/categories", label: "หมวดหมู่สินค้า", icon: Tags },
    ],
  },
  {
    label: "เนื้อหาเว็บไซต์",
    links: [
      { href: "/admin/home-images", label: "จัดการหน้าแรก", icon: House },
      { href: "/admin/content", label: "หน้าข้อมูลและบทความ", icon: FileText },
    ],
  },
  {
    label: "ตั้งค่าเว็บไซต์",
    links: [
      { href: "/admin/content/navigation", label: "เมนูนำทาง", icon: Menu },
      { href: "/admin/content/site", label: "โลโก้และข้อมูลติดต่อ", icon: Contact },
      { href: "/admin/content/section%3Afooter", label: "ส่วนท้ายเว็บไซต์", icon: PanelBottom },
    ],
  },
  {
    label: "ตรวจสอบและกู้คืน",
    links: [
      { href: "/admin/trash", label: "ถังขยะ", icon: Trash2 },
      { href: "/admin/audit", label: "ประวัติการแก้ไข", icon: History },
    ],
  },
];

export function AdminNavigation() {
  const pathname = usePathname();
  const editorId = pathname.startsWith("/admin/content/")
    ? decodeURIComponent(pathname.slice("/admin/content/".length))
    : "";
  const activeHref = editorId
    ? homeSettingCards.some((card) => card.id === editorId)
      ? "/admin/home-images"
      : siteSettingCards.some((card) => card.id === editorId)
        ? `/admin/content/${encodeURIComponent(editorId)}`
        : editorId.startsWith("category:")
          ? "/admin/categories"
          : editorId.startsWith("product-media:")
            ? "/admin/products"
            : "/admin/content"
    : groups
        .flatMap((group) => group.links)
        .find(({ href }) => pathname === href || pathname.startsWith(`${href}/`))?.href;
  return (
    <nav aria-label="เมนูแอดมิน">
      {groups.map((group) => (
        <div className="admin-nav-group" key={group.label}>
          <div className="admin-nav-label">{group.label}</div>
          {group.links.map(({ href, label, icon: Icon }) => (
            <Link
              href={href}
              key={href}
              className={activeHref === href ? "active" : ""}
              aria-current={activeHref === href ? "page" : undefined}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>
      ))}
      <Link href="/" target="_blank" rel="noopener noreferrer" className="admin-view-site">
        <LayoutGrid size={18} />
        ดูหน้าเว็บไซต์
        <ArrowUpRight size={13} />
      </Link>
    </nav>
  );
}
