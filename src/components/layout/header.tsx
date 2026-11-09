"use client";
import { Tooltip } from "@/components/ui/tooltip";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCatalogStore } from "@/stores/catalog-store";
import { useHeaderSurface } from "./use-header-surface";

import {
  defaultNavigation,
  defaultNavigationExtras,
  defaultNavigationGroups,
} from "@/features/cms/data/navigation";
import { defaultSite } from "@/features/cms/data/settings";
import { getPrimaryNavigationItems } from "@/features/cms/data/primary-navigation";
import type { NavigationItem, SiteSettings } from "@/features/cms/types";

function navigateSamePageHash(event: { preventDefault: () => void }, href: string) {
  const destination = new URL(href, window.location.href);
  if (
    destination.hash &&
    destination.origin === window.location.origin &&
    destination.pathname === window.location.pathname &&
    destination.search === window.location.search
  ) {
    event.preventDefault();
    window.location.hash = destination.hash;
  }
}

export function Header({
  items = defaultNavigation,
  site = defaultSite,
  extras = defaultNavigationExtras,
}: {
  items?: NavigationItem[];
  site?: SiteSettings;
  extras?: typeof defaultNavigationExtras;
}) {
  const navigation = useMemo(
    () =>
      getPrimaryNavigationItems(items).map((item) => {
        const groups =
          item.href === "/#support"
            ? [
                { label: extras.exploreLabel, links: extras.exploreLinks },
                { label: extras.helpLabel, links: extras.helpLinks },
              ]
            : (item.groups ?? defaultNavigationGroups[item.href] ?? []);
        return {
          ...item,
          links: item.links.map((link) => [link.label, link.href]),
          groups,
          hasSubmenu: item.links.length > 0 || groups.length > 0,
        };
      }),
    [items, extras],
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [displayMenu, setDisplayMenu] = useState(0);
  const [menuHeight, setMenuHeight] = useState(374);
  const [menuStart, setMenuStart] = useState(0);
  const [switchingMenu, setSwitchingMenu] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  useHeaderSurface(headerRef);
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
    const desktop = matchMedia("(min-width: 834px)");
    const closeOnLayoutChange = () => {
      closeDesktopMenu();
      setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDesktopMenu();
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    desktop.addEventListener("change", closeOnLayoutChange);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      desktop.removeEventListener("change", closeOnLayoutChange);
      clearTimers();
    };
  }, [clearTimers, closeDesktopMenu]);
  return (
    <>
      <header
        ref={headerRef}
        data-category-navigation={
          navigation.some((item) => item.href.startsWith("/products/category/")) || undefined
        }
        className={`site-header ${activeMenu !== null ? "is-menu-open" : ""} ${switchingMenu ? "is-menu-switching" : ""}`}
        style={menuStyle}
        onMouseEnter={() => {
          if (closeTimer.current) clearTimeout(closeTimer.current);
          closeTimer.current = null;
        }}
        onMouseLeave={scheduleClose}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            if (menuOpen)
              headerRef.current?.querySelector<HTMLButtonElement>(".menu-toggle")?.focus();
            else if (activeMenu !== null)
              headerRef.current
                ?.querySelectorAll<HTMLAnchorElement>(".desktop-nav a")
                [activeMenu]?.focus();
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
                onMouseEnter={() => (item.hasSubmenu ? scheduleOpen(index) : closeDesktopMenu())}
                onFocus={() => (item.hasSubmenu ? openDesktopMenu(index) : closeDesktopMenu())}
                onClick={closeDesktopMenu}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowDown" || !item.hasSubmenu) return;
                  event.preventDefault();
                  openDesktopMenu(index);
                  requestAnimationFrame(() => {
                    const links = panelRef.current?.querySelectorAll<HTMLAnchorElement>("a");
                    Array.from(links ?? [])
                      .find((link) => link.getClientRects().length > 0)
                      ?.focus();
                  });
                }}
                aria-expanded={item.hasSubmenu ? activeMenu === index : undefined}
                aria-controls={item.hasSubmenu ? "desktop-submenu" : undefined}
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
              <a
                className="icon-button header-shop"
                href="https://sunfordshop.com/"
                aria-label="ร้านค้า SUNFORD"
                onClick={closeDesktopMenu}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M8 6a4 4 0 0 1 8 0" />
                  <rect x="4" y="6" width="16" height="16" rx="2" />
                </svg>
              </a>
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
                className={`submenu-panel ${item.href === "/solutions" ? "submenu-panel--solutions" : ""} ${item.href === "/products" || item.href.startsWith("/products/category/") || item.href === "/applications-and-softwares" ? "submenu-panel--wide" : ""} ${displayMenu === index ? "is-active" : ""}`}
                aria-hidden={activeMenu === null || displayMenu !== index}
                inert={activeMenu === null || displayMenu !== index}
              >
                <div className="submenu-group submenu-group-primary">
                  <p className="submenu-item">
                    {item.href.startsWith("/products/category/")
                      ? item.submenuLabel
                      : `สำรวจ ${item.submenuLabel || item.label}`}
                  </p>
                  <div className="submenu-links">
                    {item.links.map(([label, href], linkIndex) => (
                      <Link
                        key={`${linkIndex}:${href}`}
                        className="submenu-item"
                        style={{ "--nav-item-index": linkIndex + 1 } as CSSProperties}
                        href={href}
                        prefetch={false}
                        onClick={closeDesktopMenu}
                        onNavigate={(event) => navigateSamePageHash(event, href)}
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
                        onNavigate={(event) => navigateSamePageHash(event, link.href)}
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
            {navigation.map((item, index) =>
              item.hasSubmenu ? (
                <div
                  key={`${index}:${item.href}`}
                  className={
                    item.href.startsWith("/products/category/") ? "mobile-nav-category" : undefined
                  }
                >
                  {item.href.startsWith("/products/category/") && (
                    <Link
                      className="mobile-nav-category-link"
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                  <details className="mobile-nav-group">
                    <summary
                      aria-label={
                        item.href.startsWith("/products/category/")
                          ? `เปิดเมนูย่อย${item.label}`
                          : undefined
                      }
                    >
                      {!item.href.startsWith("/products/category/") && item.label}
                      <ChevronDown size={17} aria-hidden="true" />
                    </summary>
                    <div className="mobile-nav-panel">
                      {item.links.map(([label, href]) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setMenuOpen(false)}
                          onNavigate={(event) => navigateSamePageHash(event, href)}
                        >
                          {label}
                        </Link>
                      ))}
                      {item.groups.map((group) => (
                        <div key={group.label} className="mobile-nav-section">
                          <p>{group.label}</p>
                          {group.links.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setMenuOpen(false)}
                              onNavigate={(event) => navigateSamePageHash(event, link.href)}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ) : (
                <Link
                  key={`${index}:${item.href}`}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ),
            )}
            {extras.mobileLinks.map((link, index) => (
              <Link key={index} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
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
