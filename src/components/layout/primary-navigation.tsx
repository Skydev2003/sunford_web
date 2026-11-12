"use client";
import Link from "next/link";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
} from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, GitCompareArrows, Search, Menu, X } from "lucide-react";
import { getPrimaryNavigationItems } from "@/features/site/data/primary-navigation";
import type { NavigationItem, SiteSettings } from "@/features/site/types";
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
  const pathname = usePathname();
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setMobileMenu(false);
    setMenuIndex(null);
  }
  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveredTrigger = useRef<HTMLElement | null>(null);
  const blockedTrigger = useRef<HTMLElement | null>(null);
  const clearHover = useCallback(() => {
    if (hoverTimer.current !== null) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  }, []);
  const setSearchOpen = useCatalogStore((s) => s.setSearchOpen);
  const startCompare = useCatalogStore((s) => s.startCompare);
  const compareIds = useCatalogStore((s) => s.compareIds);
  const closeMenu = useCallback(() => {
    clearHover();
    blockedTrigger.current =
      linksRef.current?.querySelector<HTMLElement>(":scope > :hover") ?? null;
    setMobileMenu(false);
    setMenuIndex(null);
  }, [clearHover]);
  useLayoutEffect(() => {
    clearHover();
    blockedTrigger.current =
      linksRef.current?.querySelector<HTMLElement>(":scope > :hover") ?? null;
    return clearHover;
  }, [pathname, clearHover]);
  const scheduleOpen = (index: number, trigger: HTMLElement) => {
    clearHover();
    hoveredTrigger.current = trigger;
    if (
      blockedTrigger.current === trigger ||
      !matchMedia("(min-width: 834px) and (hover: hover) and (pointer: fine)").matches
    )
      return;
    hoverTimer.current = setTimeout(() => {
      hoverTimer.current = null;
      if (
        hoveredTrigger.current === trigger &&
        blockedTrigger.current !== trigger &&
        trigger.matches(":hover") &&
        trigger.getClientRects().length > 0
      )
        setMenuIndex(index);
    }, 300);
  };
  const leaveTrigger = (trigger: HTMLElement) => {
    clearHover();
    if (hoveredTrigger.current === trigger) hoveredTrigger.current = null;
    if (blockedTrigger.current === trigger) blockedTrigger.current = null;
  };
  const openWithKeyboard = (index: number) => {
    clearHover();
    setMenuIndex(index);
    requestAnimationFrame(() => {
      navRef.current?.querySelector<HTMLAnchorElement>("#products-navigation-panel a")?.focus();
    });
  };
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
    document.body.style.setProperty("overflow", "hidden");
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
      document.body.style.setProperty("overflow", previous);
      document.removeEventListener("keydown", keydown);
    };
  }, [mobileMenu, closeMenu]);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 834px)");
    const resize = () => closeMenu();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && query.matches) closeMenu();
    };
    query.addEventListener("change", resize);
    window.addEventListener("keydown", escape);
    return () => {
      query.removeEventListener("change", resize);
      window.removeEventListener("keydown", escape);
    };
  }, [closeMenu]);

  const activateLink = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(href, window.location.origin);
    if (onOpenFinder && url.pathname === "/products" && url.search) {
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
          if (window.matchMedia("(min-width: 834px)").matches) closeMenu();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            if (!mobileMenu && menuIndex !== null)
              (linksRef.current?.children[menuIndex] as HTMLElement | undefined)?.focus();
            closeMenu();
          }
        }}
      >
        <nav className={styles.nav} aria-label="เมนูหลัก SUNFORD" data-products-nav>
          <Link className={styles.logo} href="/" aria-label="SUNFORD หน้าแรก">
            <Image src={site.logo} alt={site.name} width={106} height={26} />
          </Link>
          <div ref={linksRef} className={styles.navLinks}>
            {headerNavigation.map((item, index) =>
              item.href === "/products" || item.href.startsWith("/products/category/") ? (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={(event) => scheduleOpen(index, event.currentTarget)}
                  onMouseLeave={(event) => leaveTrigger(event.currentTarget)}
                  onFocus={(event) => {
                    if (event.currentTarget.matches(":focus-visible")) {
                      clearHover();
                      setMenuIndex(index);
                    }
                  }}
                  aria-haspopup="true"
                  aria-expanded={menuIndex === index}
                  aria-controls="products-navigation-panel"
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      openWithKeyboard(index);
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
                  onMouseEnter={(event) => scheduleOpen(index, event.currentTarget)}
                  onMouseLeave={(event) => leaveTrigger(event.currentTarget)}
                  onClick={(event) => {
                    clearHover();
                    blockedTrigger.current = event.currentTarget;
                    setMenuIndex((current) => (current === index ? null : index));
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      openWithKeyboard(index);
                    }
                  }}
                >
                  {item.label}
                </button>
              ) : (
                <Link key={item.href} href={item.href} onMouseEnter={closeMenu} onClick={closeMenu}>
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
                  item.href === "/products" || item.href.startsWith("/products/category/") ? (
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
                  data-all-products={activeMenu.href === "/products" || undefined}
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
