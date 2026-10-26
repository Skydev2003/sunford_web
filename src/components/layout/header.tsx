"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { useCatalogStore } from "@/stores/catalog-store";

const navigation = [
  { label: "ผลิตภัณฑ์", href: "/#products" },
  { label: "โซลูชันสำหรับธุรกิจ", href: "/#solutions" },
  { label: "รู้จักซันฟอร์ด", href: "/#story" },
  { label: "บริการและการสนับสนุน", href: "/#support" },
];
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const setSearchOpen = useCatalogStore((state) => state.setSearchOpen);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" aria-label="Sunford หน้าหลัก" className="brand">
          <Image src="/images/sunford-logo.png" alt="SUNFORD" width={138} height={28} preload />
        </Link>
        <nav className="desktop-nav" aria-label="เมนูหลัก">
          {navigation.map((item, index) => (
            <Link key={item.href} href={item.href}>
              {item.label}
              {index === 0 && <ChevronDown size={12} />}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label="ค้นหาสินค้า"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={19} strokeWidth={1.6} />
          </button>
          <span className="header-divider" />
          <Link className="header-contact" href="/#contact">
            ติดต่อเรา <ArrowUpRight size={15} />
          </Link>
          <button
            className="icon-button menu-toggle"
            aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="mobile-nav" aria-label="เมนูมือถือ">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
              <ArrowUpRight size={15} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
