"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ImageIcon, LayoutGrid, Package } from "lucide-react";

export function AdminNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="เมนูแอดมิน">
      {[
        { href: "/admin/products", label: "ผลิตภัณฑ์", icon: Package },
        { href: "/admin/home-images", label: "รูปภาพหน้าแรก", icon: ImageIcon },
      ].map(({ href, label, icon: Icon }) => (
        <Link
          href={href}
          key={href}
          className={pathname.startsWith(href) ? "active" : ""}
          aria-current={pathname.startsWith(href) ? "page" : undefined}
        >
          <Icon size={18} />
          {label}
          <ArrowUpRight size={13} />
        </Link>
      ))}
      <Link href="/" target="_blank">
        <LayoutGrid size={18} />
        ดูหน้าเว็บไซต์
        <ArrowUpRight size={13} />
      </Link>
    </nav>
  );
}
