"use client";
import Link from "next/link";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
} from "react";
import { ChevronLeft, ChevronRight, GitCompareArrows, Search, Menu, X } from "lucide-react";
import { getPrimaryNavigationItems } from "@/features/cms/data/primary-navigation";
import type { NavigationItem, SiteSettings } from "@/features/cms/types";
import { useCatalogStore } from "@/stores/catalog-store";
import styles from "@/features/catalog/components/products-overview.module.css";
const subscribe = () => () => {};
export function PrimaryNavigation({
  navigation,
  site,
  onOpenFinder,
  onMenuChange,
}: {
  navigation: NavigationItem[];
  site: SiteSettings;
  onOpenFinder?: () => void;
  onMenuChange?: (open: boolean) => void;
}) {
  const headerNavigation = getPrimaryNavigationItems(navigation);

  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [mobileMenu, setMobileMenu] = useState(false);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const setSearchOpen = useCatalogStore((s) => s.setSearchOpen);
  const startCompare = useCatalogStore((s) => s.startCompare);
  const compareIds = useCatalogStore((s) => s.compareIds);
  const closeMenu = useCallback(() => {
    setMobileMenu(false);
    setMenuIndex(null);
  }, []);
  useEffect(() => {
    onMenuChange?.(mobileMenu || menuIndex !== null);
  }, [mobileMenu, menuIndex, onMenuChange]);
  useEffect(() => {
    if (!mobileMenu) return;
    const elements = [...document.querySelectorAll<HTMLElement>("main,footer")];
    const previous = elements.map((e) => e.inert);
    elements.forEach((e) => {
      e.inert = true;
    });
    return () =>
      elements.forEach((e, i) => {
        e.inert = previous[i];
      });
  }, [mobileMenu]);
  useEffect(() => {
    if (!mobileMenu) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const header = navRef.current;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        menuTrigger.current?.focus();
      }
      if (event.key !== "Tab") return;
      const controls = Array.from(
        header?.querySelectorAll<HTMLElement>("a[href],button") ?? [],
      ).filter(
        (element) =>
          element.getBoundingClientRect().width > 0 &&
          getComputedStyle(element).visibility !== "hidden",
      );
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", keydown);
    };
  }, [mobileMenu, closeMenu]);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 834px)");
    const resize = () => closeMenu();
    query.addEventListener("change", resize);
    return () => query.removeEventListener("change", resize);
  }, [closeMenu]);

  const activateLink = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(href, window.location.origin);
    if (onOpenFinder && url.pathname === "/products") {
      event.preventDefault();
      if (url.search && url.search !== window.location.search)
        window.history.pushState(null, "", url.pathname + url.search + url.hash);
      onOpenFinder();
    }
    closeMenu();
  };
  const link = (href: string, label: string) => (
    <Link key={href} href={href} onClick={(e) => activateLink(e, href)}>
      {label}
    </Link>
  );
  const activeMenu = menuIndex === null ? null : headerNavigation[menuIndex];
  const compare = () => {
    startCompare();
    onOpenFinder?.();
    closeMenu();
  };
  return (
    <div className={styles.overview} style={{ display: "contents" }}>
      <header
        ref={navRef}
        role={mobileMenu ? "dialog" : undefined}
        aria-modal={mobileMenu || undefined}
        aria-label={mobileMenu ? "เมนูนำทาง SUNFORD" : undefined}
        className={`${styles.header} ${mobileMenu || activeMenu ? styles.headerOpen : ""}`}
        data-products-header
        onMouseLeave={() => {
          if (window.matchMedia("(min-width: 834px)").matches) setMenuIndex(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") closeMenu();
        }}
      >
        <nav className={styles.nav} aria-label="เมนูหลัก SUNFORD" data-products-nav>
          <Link className={styles.logo} href="/" aria-label="SUNFORD หน้าแรก">
            <Image src={site.logo} alt={site.name} width={106} height={26} />
          </Link>
          <div className={styles.navLinks}>
            {headerNavigation.map((item, index) =>
              item.href.startsWith("/products/category/") ? (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setMenuIndex(index)}
                  onFocus={() => setMenuIndex(index)}
                  aria-haspopup="true"
                  aria-expanded={menuIndex === index}
                  aria-controls="products-navigation-panel"
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      setMenuIndex(index);
                      requestAnimationFrame(() => {
                        navRef.current
                          ?.querySelector<HTMLAnchorElement>("#products-navigation-panel a")
                          ?.focus();
                      });
                    }
                  }}
                  onClick={(event) => activateLink(event, item.href)}
                >
                  {item.label}
                </Link>
              ) : item.links.length ? (
                <button
                  disabled={!hydrated}
                  type="button"
                  key={item.href}
                  aria-expanded={menuIndex === index}
                  aria-controls="products-navigation-panel"
                  onMouseEnter={() => setMenuIndex(index)}
                  onClick={() => setMenuIndex(index)}
                >
                  {item.label}
                </button>
              ) : (
                <Link key={item.href} href={item.href} onMouseEnter={() => setMenuIndex(null)}>
                  {item.label}
                </Link>
              ),
            )}
          </div>
          <div className={styles.navTools}>
            <button
              disabled={!hydrated}
              type="button"
              aria-label="ค้นหาสินค้าและข้อมูล"
              onClick={() => {
                closeMenu();
                setSearchOpen(true);
              }}
            >
              <Search aria-hidden="true" />
            </button>
            <button
              disabled={!hydrated}
              type="button"
              aria-label="เลือกสินค้าเพื่อเปรียบเทียบ"
              onClick={compare}
            >
              <GitCompareArrows aria-hidden="true" />
              {compareIds.length > 0 && (
                <span className={styles.compareCount}>{compareIds.length}</span>
              )}
            </button>
            <button
              disabled={!hydrated}
              ref={menuTrigger}
              type="button"
              className={styles.menuTrigger}
              aria-label={mobileMenu ? "ปิดเมนู" : "เปิดเมนู"}
              aria-expanded={mobileMenu}
              aria-controls="products-navigation-panel"
              onClick={() => {
                setMobileMenu(!mobileMenu);
                setMenuIndex(null);
              }}
            >
              {mobileMenu ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </nav>
        {(activeMenu || mobileMenu) && (
          <div id="products-navigation-panel" className={styles.navMenu}>
            {mobileMenu && !activeMenu ? (
              <div className={styles.mobileMenuItems}>
                {headerNavigation.map((item, index) =>
                  item.href.startsWith("/products/category/") ? (
                    <div key={item.href} className={styles.mobileCategoryRow}>
                      {link(item.href, item.label)}
                      <button
                        disabled={!hydrated}
                        type="button"
                        aria-label={`เปิดเมนูย่อย${item.label}`}
                        aria-expanded={menuIndex === index}
                        aria-controls="products-navigation-panel"
                        onClick={() => setMenuIndex(index)}
                      >
                        <ChevronRight aria-hidden="true" />
                      </button>
                    </div>
                  ) : item.links.length ? (
                    <button
                      disabled={!hydrated}
                      type="button"
                      key={item.href}
                      onClick={() => setMenuIndex(index)}
                    >
                      {item.label}
                      <ChevronRight aria-hidden="true" />
                    </button>
                  ) : (
                    link(item.href, item.label)
                  ),
                )}
              </div>
            ) : (
              activeMenu && (
                <div
                  className={`${styles.menuContent} ${activeMenu.href.startsWith("/products/category/") ? styles.productMenuContent : ""}`}
                >
                  {mobileMenu && (
                    <button
                      disabled={!hydrated}
                      type="button"
                      className={styles.menuBack}
                      onClick={() => setMenuIndex(null)}
                    >
                      <ChevronLeft size={18} aria-hidden="true" />
                      เมนูหลัก
                    </button>
                  )}
                  <div className={styles.menuPrimary}>
                    <p>{activeMenu.submenuLabel ?? activeMenu.label}</p>
                    {activeMenu.links.map((item) => (
                      <div key={item.href}>{link(item.href, item.label)}</div>
                    ))}
                  </div>
                  {activeMenu.groups?.map((group) => (
                    <div key={group.label} className={styles.menuGroup}>
                      <p>{group.label}</p>
                      {group.links.map((item) => (
                        <div key={item.href}>{link(item.href, item.label)}</div>
                      ))}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </header>
      {activeMenu && !mobileMenu && (
        <button
          disabled={!hydrated}
          type="button"
          className={styles.navScrim}
          aria-label="ปิดเมนูนำทาง"
          onClick={closeMenu}
        />
      )}
    </div>
  );
}
