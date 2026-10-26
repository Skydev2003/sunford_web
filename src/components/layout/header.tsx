"use client";
import { Tooltip } from "@/components/ui/tooltip";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, GitCompareArrows, Menu, Search, X } from "lucide-react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useCatalogStore } from "@/stores/catalog-store";

import {
  defaultNavigation,
  defaultNavigationExtras,
  defaultNavigationGroups,
} from "@/features/cms/data/navigation";
import { defaultSite } from "@/features/cms/data/settings";
import type { NavigationItem, SiteSettings } from "@/features/cms/types";

export function Header({
  items = defaultNavigation,
  site = defaultSite,
  extras = defaultNavigationExtras,
}: {
  items?: NavigationItem[];
  site?: SiteSettings;
  extras?: typeof defaultNavigationExtras;
}) {
  const navigation = items.map((item) => ({
    ...item,
    links: item.links.map((link) => [link.label, link.href]),
    groups:
      item.href === "/#support"
        ? [
            { label: extras.exploreLabel, links: extras.exploreLinks },
            { label: extras.helpLabel, links: extras.helpLinks },
          ]
        : (item.groups ?? defaultNavigationGroups[item.href] ?? []),
  }));
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [displayMenu, setDisplayMenu] = useState(0);
  const [menuHeight, setMenuHeight] = useState(374);
  const [menuStart, setMenuStart] = useState(0);
  const [switchingMenu, setSwitchingMenu] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
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
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const header = headerRef.current;
    if (!panel || !header) return;
    const measureMenu = () => {
      const panelBounds = panel.getBoundingClientRect();
      const headerBounds = header.getBoundingClientRect();
      const brandBounds = brandRef.current?.getBoundingClientRect();
      setMenuHeight(Math.ceil(panelBounds.height));
      setMenuStart((brandBounds?.left ?? headerBounds.left) - headerBounds.left);
    };
    measureMenu();
    const observer = new ResizeObserver(measureMenu);
    observer.observe(panel);
    observer.observe(header);
    return () => observer.disconnect();
  }, [displayMenu]);
  const menuStyle = {
    "--desktop-menu-height": `${menuHeight}px`,
    "--desktop-menu-start": `${menuStart}px`,
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
        ref={headerRef}
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
          <Link
            ref={brandRef}
            href="/"
            aria-label="Sunford หน้าหลัก"
            className="brand"
            onFocus={closeDesktopMenu}
          >
            <Image src={site.logo} alt={site.name} width={138} height={28} preload />
          </Link>
          <nav className="desktop-nav" aria-label="เมนูหลัก">
            {navigation.map((item, index) => (
              <Link
                key={`${index}:${item.href}`}
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
            <Tooltip>
              <button
                className="icon-button"
                aria-label="ค้นหาสินค้า"
                onClick={() => {
                  setSearchOpen(true);
                  closeDesktopMenu();
                }}
              >
                <Search size={22} strokeWidth={1.5} />
              </button>
            </Tooltip>
            <Tooltip>
              <button
                className="icon-button header-compare"
                aria-label="เปรียบเทียบสินค้า"
                onClick={() => {
                  setCompareOpen(true);
                  closeDesktopMenu();
                }}
              >
                <GitCompareArrows size={22} strokeWidth={1.5} />
                {compareCount > 0 && <span>{compareCount}</span>}
              </button>
            </Tooltip>
            <Tooltip>
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
            </Tooltip>
          </div>
        </div>
        <nav
          id="desktop-submenu"
          className={`desktop-submenu ${activeMenu !== null ? "is-open" : ""}`}
          aria-label={`สำรวจ${navigation[displayMenu]?.label ?? "Sunford"}`}
          aria-hidden={activeMenu === null}
          inert={activeMenu === null}
        >
          <div className="container submenu-stage">
            {navigation.map((item, index) => (
              <div
                key={`${index}:${item.href}`}
                ref={displayMenu === index ? panelRef : undefined}
                className={`submenu-panel ${displayMenu === index ? "is-active" : ""}`}
                aria-hidden={activeMenu === null || displayMenu !== index}
                inert={activeMenu === null || displayMenu !== index}
              >
                <div className="submenu-group submenu-group-primary">
                  <p className="submenu-item">สำรวจ {item.submenuLabel || item.label}</p>
                  <div className="submenu-links">
                    {item.links.map(([label, href], linkIndex) => (
                      <Link
                        key={`${linkIndex}:${href}`}
                        className="submenu-item"
                        style={{ "--nav-item-index": linkIndex + 1 } as CSSProperties}
                        href={href}
                        prefetch={false}
                        onClick={closeDesktopMenu}
                      >
                        <span>{label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                {item.groups.map((group, groupIndex) => (
                  <div
                    key={group.label}
                    className={`submenu-group ${item.href === "/#support" ? "" : "submenu-group-secondary"}`}
                    style={{ "--nav-group-index": groupIndex + 1 } as CSSProperties}
                  >
                    <p className="submenu-item">{group.label}</p>
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        className="submenu-item"
                        href={link.href}
                        prefetch={false}
                        onClick={closeDesktopMenu}
                      >
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </nav>
        {menuOpen && (
          <nav id="mobile-navigation" className="mobile-nav" aria-label="เมนูมือถือ">
            {navigation.map((item, index) => (
              <Link
                key={`${index}:${item.href}`}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
                <ArrowUpRight size={15} />
              </Link>
            ))}
            {extras.mobileLinks.map((link, index) => (
              <Link key={index} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
                <ArrowUpRight size={15} />
              </Link>
            ))}
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
