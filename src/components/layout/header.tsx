"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, GitCompareArrows, Menu, Search, X } from "lucide-react";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { useCatalogStore } from "@/stores/catalog-store";

const navigation = [
  {
    label: "ผลิตภัณฑ์",
    href: "/products",
    links: [
      ["สำรวจผลิตภัณฑ์ทั้งหมด", "/products"],
      ["เครื่องชั่งดิจิทัล", "/Product/Digital-weighing"],
      ["ห้องปฏิบัติการ", "/product/ห้องปฏิบัติการ"],
      ["อุตสาหกรรม", "/product/อุตสาหกรรม"],
      ["พาณิชยกรรมและบริการ", "/product/พาณิชยกรรมและบริการ"],
      ["ไลฟ์สไตล์", "/product/ไลฟ์สไตล์"],
    ],
  },
  {
    label: "เครื่องชั่งอัจฉริยะ",
    href: "/Product/MES",
    links: [
      ["ระบบ MES ชั่งน้ำหนักเพื่อการผลิต", "/Product/MES"],
      ["ระบบ POS ชั่งน้ำหนักเพื่อการขาย", "/Product/POS"],
      ["Smart weighing", "/collections/Smart weighing"],
      ["เครื่องชั่งเชื่อมต่อแบบมีสาย", "/product/wired-smart-scale"],
      ["เครื่องชั่งเชื่อมต่อไร้สาย", "/product/wireless-smart-scale"],
    ],
  },
  {
    label: "อุปกรณ์เสริม",
    href: "/product/อุปกรณ์ประกอบเครื่องชั่ง",
    links: [
      ["อุปกรณ์และวัสดุเสริมทั้งหมด", "/product/อุปกรณ์ประกอบเครื่องชั่ง"],
      ["อุปกรณ์ส่งข้อมูล", "/product/อุปกรณ์ส่งข้อมูล"],
      ["อุปกรณ์ต่อพ่วง", "/product/อุปกรณ์ต่อพ่วง"],
      ["อินดิเคเตอร์แท่นชั่ง", "/Indicator"],
      ["โครงสร้างแท่นชั่ง", "/product/โครงสร้างแท่นชั่ง"],
    ],
  },
  {
    label: "ซอฟต์แวร์",
    href: "/applications-and-softwares",
    links: [
      ["แอปพลิเคชันและซอฟต์แวร์", "/applications-and-softwares"],
      ["ดาวน์โหลดซอฟต์แวร์", "/software/download"],
      ["SUNFORD POS Android", "/software/download/sunford-pos-android"],
      ["SUNFORD POS Basic", "/software/download/sunford-pos-basic"],
      ["SUNFORD INDUS", "/software/download/sunford-indus"],
    ],
  },
  {
    label: "โซลูชันสำหรับธุรกิจ",
    href: "/#solutions",
    links: [
      ["โซลูชันทั้งหมด", "/#solutions"],
      ["โซลูชัน ERP", "/solution/erp"],
      ["โซลูชัน MES", "/solution/mes"],
    ],
  },
  {
    label: "รู้จักซันฟอร์ด",
    href: "/about-us",
    links: [
      ["เรื่องราวของเรา", "/about-us"],
      ["ข่าวสารและกิจกรรม", "/news-and-activities"],
      ["สำรวจข้อมูลทั้งหมด", "/explore"],
    ],
  },
  {
    label: "บริการและการสนับสนุน",
    href: "/#support",
    links: [
      ["บริการและการสนับสนุน", "/#support"],
      ["ลงทะเบียนรับประกัน", "/warranty/register"],
      ["นโยบายการรับประกันสินค้า", "/warranty/policy"],
      ["การยกเลิกและคืนสินค้า", "/cancel-and-return/policy"],
      ["Technical Specification", "/technical-specification"],
      ["ติดต่อเรา", "/contact-us"],
    ],
  },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [displayMenu, setDisplayMenu] = useState(0);
  const [menuHeight, setMenuHeight] = useState(374);
  const [switchingMenu, setSwitchingMenu] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);
  const closeDesktopMenu = useCallback(() => {
    clearTimers();
    setActiveMenu(null);
  }, [clearTimers]);
  const openDesktopMenu = useCallback(
    (index: number) => {
      clearTimers();
      setSwitchingMenu(activeMenu !== null);
      setDisplayMenu(index);
      setActiveMenu(index);
    },
    [activeMenu, clearTimers],
  );
  const scheduleOpen = (index: number) => {
    clearTimers();
    if (activeMenu === index) return;
    openTimer.current = setTimeout(() => openDesktopMenu(index), 80);
  };
  const scheduleClose = () => {
    clearTimers();
    closeTimer.current = setTimeout(closeDesktopMenu, 120);
  };
  const setSearchOpen = useCatalogStore((state) => state.setSearchOpen);
  const setCompareOpen = useCatalogStore((state) => state.setCompareOpen);
  const compareCount = useCatalogStore((state) => state.compareIds.length);
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const observer = new ResizeObserver(([entry]) => {
      setMenuHeight(Math.ceil(entry.borderBoxSize[0].blockSize));
    });
    observer.observe(panel);
    return () => observer.disconnect();
  }, [displayMenu]);
  const menuStyle = {
    "--desktop-menu-height": `${menuHeight}px`,
    // Apple's flyout expands at 0.5 ms per pixel of content height.
    "--nav-flyout-duration": `${Math.round(menuHeight * 0.5)}ms`,
  } as CSSProperties;
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDesktopMenu();
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      clearTimers();
    };
  }, [clearTimers, closeDesktopMenu]);
  return (
    <>
      <header
        className={`site-header ${activeMenu !== null ? "is-menu-open" : ""} ${switchingMenu ? "is-menu-switching" : ""}`}
        style={menuStyle}
        onMouseEnter={() => {
          if (closeTimer.current) clearTimeout(closeTimer.current);
          closeTimer.current = null;
        }}
        onMouseLeave={scheduleClose}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeDesktopMenu();
            setMenuOpen(false);
          }
        }}
      >
        <div className="nav-glass" aria-hidden="true" />
        <div className="container header-inner">
          <Link href="/" aria-label="Sunford หน้าหลัก" className="brand" onFocus={closeDesktopMenu}>
            <Image src="/images/sunford-logo.png" alt="SUNFORD" width={138} height={28} preload />
          </Link>
          <nav className="desktop-nav" aria-label="เมนูหลัก">
            {navigation.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => scheduleOpen(index)}
                onFocus={() => openDesktopMenu(index)}
                onClick={closeDesktopMenu}
                aria-expanded={activeMenu === index}
                aria-controls={activeMenu === index ? "desktop-submenu" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions" onMouseEnter={scheduleClose}>
            <button
              className="icon-button"
              aria-label="ค้นหาสินค้า"
              onClick={() => {
                setSearchOpen(true);
                closeDesktopMenu();
              }}
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <button
              className="icon-button header-compare"
              aria-label="เปรียบเทียบสินค้า"
              onClick={() => {
                setCompareOpen(true);
                closeDesktopMenu();
              }}
            >
              <GitCompareArrows size={18} strokeWidth={1.5} />
              {compareCount > 0 && <span>{compareCount}</span>}
            </button>
            <button
              className="icon-button menu-toggle"
              aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => {
                setMenuOpen(!menuOpen);
                closeDesktopMenu();
              }}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        <nav
          id="desktop-submenu"
          className={`desktop-submenu ${activeMenu !== null ? "is-open" : ""}`}
          aria-label={`สำรวจ${navigation[displayMenu].label}`}
          aria-hidden={activeMenu === null}
          inert={activeMenu === null}
        >
          <div className="container submenu-stage">
            {navigation.map((item, index) => (
              <div
                key={item.href}
                ref={displayMenu === index ? panelRef : undefined}
                className={`submenu-panel ${displayMenu === index ? "is-active" : ""}`}
                aria-hidden={activeMenu === null || displayMenu !== index}
                inert={activeMenu === null || displayMenu !== index}
              >
                <div className="submenu-group submenu-group-primary">
                  <p className="submenu-item">สำรวจ {item.label}</p>
                  <div className="submenu-links">
                    {item.links.map(([label, href], linkIndex) => (
                      <Link
                        key={href}
                        className="submenu-item"
                        style={{ "--nav-item-index": linkIndex + 1 } as CSSProperties}
                        href={href}
                        prefetch={false}
                        onClick={closeDesktopMenu}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="submenu-group" style={{ "--nav-group-index": 1 } as CSSProperties}>
                  <p className="submenu-item">สำรวจเพิ่มเติม</p>
                  <Link
                    className="submenu-item"
                    href="/explore"
                    prefetch={false}
                    onClick={closeDesktopMenu}
                  >
                    ทุกเรื่องของ Sunford
                  </Link>
                  <Link
                    className="submenu-item"
                    href="/about-us"
                    prefetch={false}
                    onClick={closeDesktopMenu}
                  >
                    รู้จักซันฟอร์ด
                  </Link>
                  <Link
                    className="submenu-item"
                    href="/news-and-activities"
                    prefetch={false}
                    onClick={closeDesktopMenu}
                  >
                    ข่าวสารและกิจกรรม
                  </Link>
                </div>
                <div className="submenu-group" style={{ "--nav-group-index": 2 } as CSSProperties}>
                  <p className="submenu-item">ให้เราช่วยคุณ</p>
                  <Link
                    className="submenu-item"
                    href="/contact-us"
                    prefetch={false}
                    onClick={closeDesktopMenu}
                  >
                    ติดต่อเรา
                  </Link>
                  <Link
                    className="submenu-item"
                    href="/warranty/register"
                    prefetch={false}
                    onClick={closeDesktopMenu}
                  >
                    ลงทะเบียนรับประกัน
                  </Link>
                  <Link
                    className="submenu-item"
                    href="/technical-specification"
                    prefetch={false}
                    onClick={closeDesktopMenu}
                  >
                    ข้อมูลทางเทคนิค
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </nav>
        {menuOpen && (
          <nav id="mobile-navigation" className="mobile-nav" aria-label="เมนูมือถือ">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
                <ArrowUpRight size={15} />
              </Link>
            ))}
            <Link href="/explore" onClick={() => setMenuOpen(false)}>
              สำรวจข้อมูลทั้งหมด
              <ArrowUpRight size={15} />
            </Link>
            <Link href="/contact-us" onClick={() => setMenuOpen(false)}>
              ติดต่อเรา
              <ArrowUpRight size={15} />
            </Link>
          </nav>
        )}
      </header>
      <button
        type="button"
        className={`nav-backdrop ${activeMenu !== null ? "is-open" : ""}`}
        tabIndex={-1}
        aria-label="ปิดเมนูย่อย"
        aria-hidden={activeMenu === null}
        onClick={closeDesktopMenu}
      />
    </>
  );
}
