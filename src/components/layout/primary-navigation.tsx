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
  type CSSProperties,
  type MouseEvent,
} from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, Menu, X } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { ShopIcon } from "./shop-icon";
import { getPrimaryNavigationItems } from "@/features/site/data/primary-navigation";
import { catalogSubmenuDestination } from "@/features/catalog/data/catalog-submenu-destinations";
import type { NavigationItem, SiteSettings } from "@/features/site/types";
import { useCatalogStore } from "@/stores/catalog-store";
import styles from "@/features/catalog/components/products-overview.module.css";
const subscribe = () => () => {};
export function PrimaryNavigation({
  navigation,
  readySubcategoryHrefs,
  site,
  onOpenFinder,
  onMenuChange,
}: {
  navigation: NavigationItem[];
  readySubcategoryHrefs?: readonly string[];
  site: SiteSettings;
  onOpenFinder?: () => void;
  onMenuChange?: (open: boolean) => void;
}) {
  const headerNavigation = getPrimaryNavigationItems(navigation, readySubcategoryHrefs);

  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [mobileMenu, setMobileMenu] = useState(false);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [openedByHover, setOpenedByHover] = useState(false);
  const pathname = usePathname();
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setMobileMenu(false);
    setMenuIndex(null);
    setOpenedByHover(false);
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
  const setNavigationOpen = useCatalogStore((s) => s.setNavigationOpen);
  const closeMenu = useCallback(() => {
    clearHover();
    blockedTrigger.current =
      linksRef.current?.querySelector<HTMLElement>(":scope > :hover") ?? null;
    setMobileMenu(false);
    setMenuIndex(null);
    setOpenedByHover(false);
  }, [clearHover]);
  useLayoutEffect(() => {
    clearHover();
    blockedTrigger.current =
      linksRef.current?.querySelector<HTMLElement>(":scope > :hover") ?? null;
    return () => {
      clearHover();
      setMenuIndex(null);
      setMobileMenu(false);
    };
  }, [pathname, clearHover]);
  const scheduleOpen = (index: number, trigger: HTMLElement) => {
    if (hoveredTrigger.current === trigger) return;
    clearHover();
    hoveredTrigger.current = trigger;
    if (
      blockedTrigger.current === trigger ||
      !matchMedia("(min-width: 64rem) and (hover: hover) and (pointer: fine)").matches
    )
      return;
    hoverTimer.current = setTimeout(() => {
      hoverTimer.current = null;
      if (
        hoveredTrigger.current === trigger &&
        blockedTrigger.current !== trigger &&
        trigger.matches(":hover") &&
        trigger.getClientRects().length > 0
      ) {
        setOpenedByHover(true);
        setMenuIndex(index);
      }
    }, 600);
  };
  const leaveTrigger = (trigger: HTMLElement) => {
    clearHover();
    if (hoveredTrigger.current === trigger) hoveredTrigger.current = null;
    if (blockedTrigger.current === trigger) blockedTrigger.current = null;
  };
  const openWithKeyboard = (index: number) => {
    clearHover();
    setOpenedByHover(false);
    setMenuIndex(index);
    requestAnimationFrame(() => {
      navRef.current?.querySelector<HTMLAnchorElement>("#products-navigation-panel a")?.focus();
    });
  };
  useEffect(() => {
    onMenuChange?.(mobileMenu || menuIndex !== null);
  }, [mobileMenu, menuIndex, onMenuChange]);
  useEffect(() => {
    setNavigationOpen(mobileMenu);
    if (!mobileMenu) return;
    const elements = onMenuChange
      ? []
      : [
          ...document.querySelectorAll<HTMLElement>(
            "main:not([data-navigation-background]),footer:not([data-navigation-background])",
          ),
        ];
    const previous = elements.map((e) => e.inert);
    elements.forEach((e) => {
      e.inert = true;
    });
    return () => {
      setNavigationOpen(false);
      elements.forEach((e, i) => {
        e.inert = previous[i];
      });
    };
  }, [mobileMenu, onMenuChange, setNavigationOpen]);
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
    const query = window.matchMedia("(min-width: 64rem)");
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
  const link = (href: string, label: string, disabled = false) => {
    if (disabled) {
      return (
        <span
          key={`${href}:${label}`}
          className={styles.menuUnavailable}
          role="link"
          aria-disabled="true"
        >
          {label}
        </span>
      );
    }
    const destination = catalogSubmenuDestination(href);
    const sameCatalogPage = destination !== href && href.split(/[?#]/)[0] === pathname;
    return (
      <Link
        key={`${href}:${label}`}
        href={destination}
        scroll={sameCatalogPage ? false : undefined}
        onClick={(e) => activateLink(e, href)}
        onNavigate={
          sameCatalogPage
            ? () => {
                const anchor = destination.split("#")[1];
                requestAnimationFrame(() => {
                  document.getElementById(anchor)?.scrollIntoView({ block: "start" });
                });
              }
            : undefined
        }
      >
        {label}
      </Link>
    );
  };
  const activeMenu = menuIndex === null ? null : headerNavigation[menuIndex];
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
          if (window.matchMedia("(min-width: 64rem)").matches) closeMenu();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            if (mobileMenu) menuTrigger.current?.focus();
            else if (menuIndex !== null)
              (linksRef.current?.children[menuIndex] as HTMLElement | undefined)?.focus();
            closeMenu();
          }
        }}
      >
        <nav className={styles.nav} aria-label="เมนูหลัก SUNFORD" data-products-nav>
          <Link className={styles.logo} href="/" aria-label="SUNFORD หน้าแรก">
            <Image src={site.logo} alt={site.name} width={106} height={26} loading="eager" />
          </Link>
          <div ref={linksRef} className={styles.navLinks}>
            {headerNavigation.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onMouseMove={(event) => scheduleOpen(index, event.currentTarget)}
                onMouseLeave={(event) => leaveTrigger(event.currentTarget)}
                onFocus={(event) => {
                  if (event.currentTarget.matches(":focus-visible")) {
                    clearHover();
                    setOpenedByHover(false);
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
            ))}
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
            <Tooltip>
              <a href="https://sunfordshop.com/" aria-label="ร้านค้า SUNFORD" onClick={closeMenu}>
                <ShopIcon />
              </a>
            </Tooltip>
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
                {headerNavigation.map((item, index) => (
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
                ))}
              </div>
            ) : (
              activeMenu && (
                <div
                  key={activeMenu.href}
                  data-nav-hover-reveal={openedByHover && !mobileMenu ? "" : undefined}
                  onFocusCapture={openedByHover ? () => setOpenedByHover(false) : undefined}
                  data-all-products={activeMenu.href === "/products" || undefined}
                  data-nav-menu={activeMenu.href}
                  className={`${styles.menuContent} ${styles.productMenuContent}`}
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
                  <div className={styles.menuPrimary} data-nav-column="primary">
                    <p>{activeMenu.submenuLabel ?? activeMenu.label}</p>
                    {activeMenu.links.map((item, order) => (
                      <div
                        key={`${item.href}:${item.label}`}
                        data-nav-hover-item
                        style={{ "--nav-item-order": order } as CSSProperties}
                      >
                        {link(item.href, item.label, item.disabled)}
                      </div>
                    ))}
                  </div>
                  {activeMenu.groups?.map((group, groupIndex) => (
                    <div
                      key={group.label}
                      className={styles.menuGroup}
                      data-nav-column={groupIndex === 0 ? "uses" : "help"}
                    >
                      <p>{group.label}</p>
                      {group.links.map((item, order) => (
                        <div
                          key={`${item.href}:${item.label}`}
                          data-nav-hover-item
                          style={{ "--nav-item-order": order } as CSSProperties}
                        >
                          {link(item.href, item.label, item.disabled)}
                        </div>
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
