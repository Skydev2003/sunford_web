"use client";
import { useCatalogStore } from "@/stores/catalog-store";
import { PrimaryNavigation } from "@/components/layout/primary-navigation";

import {
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { resolveCategoryHref } from "../data/category-destinations";
import {
  getProductSubcategoryPage,
  getProductSubcategoryPageByHref,
} from "../data/product-subcategory-pages";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GitCompareArrows,
  Headphones,
  Pause,
  Play,
  Plus,
  ShieldCheck,
  Truck,
  X,
  Download,
  ClipboardCheck,
} from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import type { NavigationItem, SiteSettings } from "@/features/site/types";
import type { ClientProduct } from "../types";
import type { ProductCategory } from "../data/mock-categories";
import { sunford } from "@/features/home/data/brand";
import { solutionImages } from "@/features/home/data/business-solutions";
import {
  defaultSpotlightProductId,
  defaultSpotlightVideo,
  defaultSpotlightPoster,
} from "@/features/home/data/image-slots";
import { catalogProductPhoto } from "./catalog-product-card";
import { ProductCategoryMock } from "./product-category-mock";
import { useCatalogOverlayHost } from "./catalog-route-frame";
import styles from "./products-overview.module.css";

type Story = {
  id: string;
  title: string;
  introduction: string;
  image: string;
  href: string;
  content: ReactNode;
};
type AccordionItem = { title: string; image: string; content: ReactNode };
type Service = { title: string; detail: string; href: string; content: ReactNode };

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const readMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const serverMotion = () => true;
const subscribeHydration = () => () => {};
const readHydration = () => true;
const serverHydration = () => false;
const useHydratedControls = () =>
  useSyncExternalStore(subscribeHydration, readHydration, serverHydration);
const serviceIcons = [Truck, Headphones, ShieldCheck, GitCompareArrows, ClipboardCheck, Download];

function Gallery({
  id,
  label,
  children,
  className = "",
}: {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const track = useRef<HTMLUListElement>(null);
  const hydrated = useHydratedControls();
  const [edges, setEdges] = useState({ start: true, end: false });
  const updateEdges = useCallback(() => {
    const element = track.current;
    if (element)
      setEdges({
        start: element.scrollLeft <= 1,
        end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      });
  }, []);
  useEffect(() => {
    const observer = new ResizeObserver(updateEdges);
    if (track.current) observer.observe(track.current);
    return () => observer.disconnect();
  }, [updateEdges]);
  const move = (direction: number) => {
    const element = track.current;
    if (!element) return;
    const first = element.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
    element.scrollBy({
      left: direction * ((first?.offsetWidth ?? element.clientWidth) + gap),
      behavior: readMotion() ? "instant" : "smooth",
    });
  };
  return (
    <div className={`${styles.gallery} ${className}`} role="group" aria-label={label}>
      <ul
        id={id}
        className={styles.galleryTrack}
        ref={track}
        onScroll={updateEdges}
        onFocus={(event) => {
          if ((event.target as HTMLElement).matches(":focus-visible"))
            (event.target as HTMLElement).scrollIntoView({
              block: "nearest",
              inline: "nearest",
              behavior: "instant",
            });
        }}
      >
        {children}
      </ul>
      <div className={styles.galleryControls}>
        <button
          type="button"
          aria-label={`${label}ก่อนหน้า`}
          aria-controls={id}
          disabled={!hydrated || edges.start}
          onClick={() => move(-1)}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`${label}ถัดไป`}
          aria-controls={id}
          disabled={!hydrated || edges.end}
          onClick={() => move(1)}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function ReferenceModal({
  open,
  onClose,
  title,
  children,
  large = false,
  finder = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  large?: boolean;
  finder?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!element || !open) return;
    const trigger = document.activeElement as HTMLElement | null;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = previous;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [open]);
  return (
    <dialog
      ref={dialog}
      className={styles.modal}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.modalPanel} ${large ? styles.modalLarge : ""} ${finder ? styles.finderPanel : ""}`}
      >
        <div className={styles.modalClose}>
          <button
            type="button"
            aria-label={`ปิด${finder ? "แคตตาล็อกสินค้า" : "หน้าต่างรายละเอียด"}`}
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <div className={styles.modalBody}>
          <h2 id={titleId}>{title}</h2>
          {children}
        </div>
      </div>
    </dialog>
  );
}

function FinderQuerySync({
  onOpen,
  onClose,
  categoryId,
}: {
  onOpen: () => void;
  onClose?: () => void;
  categoryId?: string;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const checkedNavigation = useRef(false);
  const category = params.get("category");
  const subcategory = params.get("subcategory");
  const catalog = params.get("catalog");
  useEffect(() => {
    const current = new URL(window.location.href);
    const destination = resolveCategoryHref(`${current.pathname}${current.search}${current.hash}`);
    if (
      destination !== `${current.pathname}${current.search}${current.hash}` &&
      getProductSubcategoryPageByHref(destination)
    ) {
      router.replace(destination);
      return;
    }
    if (categoryId) {
      const url = new URL(window.location.href);
      if (url.pathname !== `/products/category/${categoryId}`) return;
      if (!checkedNavigation.current) {
        checkedNavigation.current = true;
        const navigation = performance.getEntriesByType("navigation")[0] as
          PerformanceNavigationTiming | undefined;
        if (navigation?.type === "reload") {
          const initialUrl = new URL(navigation.name);
          if (initialUrl.pathname === url.pathname && initialUrl.search === url.search) {
            url.searchParams.delete("category");
            url.searchParams.delete("subcategory");
            if (url.searchParams.get("catalog") === "all") url.searchParams.delete("catalog");
            window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
            return;
          }
        }
      }
      if (
        url.searchParams.get("category") ||
        url.searchParams.get("subcategory") ||
        url.searchParams.get("catalog") === "all"
      )
        onOpen();
      return;
    }
    if (category || subcategory || catalog === "all") onOpen();
    else onClose?.();
  }, [category, subcategory, catalog, onOpen, onClose, categoryId, router]);
  return null;
}

export function ProductsOverview({
  products,
  categories,
  cardNames,
  site,
  copyrightYear,
  navigation,
  stories,
  services,
  accordion,
  categoryId,
  indexContent,
}: {
  products: ClientProduct[];
  categories: ProductCategory[];
  cardNames: Record<string, string>;
  site: SiteSettings;
  copyrightYear: number;
  navigation: NavigationItem[];
  stories: Story[];
  services: Service[];
  accordion: AccordionItem[];
  categoryId?: string;
  indexContent?: ReactNode;
}) {
  const router = useRouter();
  const activeCategory = categories.find((category) => category.id === categoryId);
  const categoryEntrance =
    Boolean(indexContent) ||
    categoryId === "scales" ||
    categoryId === "indicators" ||
    categoryId === "platforms" ||
    categoryId === "pos" ||
    categoryId === "accessories";
  const chapterItems = activeCategory?.subcategories ?? categories;
  const [finderOpen, setFinderOpen] = useState(false);
  const hydrated = useHydratedControls();
  const [story, setStory] = useState<Story | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [accordionIndex, setAccordionIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [chapterEdges, setChapterEdges] = useState({ start: true, end: true });
  const heroTrack = useRef<HTMLUListElement>(null);
  const chapterTrack = useRef<HTMLUListElement>(null);
  const reducedMotion = useSyncExternalStore(subscribeMotion, readMotion, serverMotion);
  const overlayHost = useCatalogOverlayHost();
  const lineup = [
    ...products.filter((product) => product.featured && product.image),
    ...products.filter((product) => !product.featured && product.image),
  ].slice(0, 6);
  const heroes = lineup.slice(0, 2);
  const playing =
    !paused &&
    (!reducedMotion || motionEnabled) &&
    heroVisible &&
    pageVisible &&
    !finderOpen &&
    !service &&
    !story &&
    !mobileMenu &&
    heroes.length > 1;
  const productsById = new Map(products.map((product) => [product.id, product]));
  const categoryPhotos = chapterItems.map((category) => {
    const members = category.productIds
      .map((id) => productsById.get(id))
      .filter((product) => product?.image);
    return members.find((product) => product?.featured) ?? members[0];
  });
  const startCompare = useCatalogStore((state) => state.startCompare);
  const compare = () => {
    startCompare();
    setFinderOpen(true);
  };
  const openFinder = useCallback(() => setFinderOpen(true), [setFinderOpen]);
  const closeFinder = useCallback(() => setFinderOpen(false), [setFinderOpen]);
  const syncChapters = useCallback(() => {
    const track = chapterTrack.current;
    if (track)
      setChapterEdges({
        start: track.scrollLeft <= 1,
        end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 2,
      });
  }, []);
  useEffect(() => {
    const observer = new ResizeObserver(syncChapters);
    if (chapterTrack.current) observer.observe(chapterTrack.current);
    return () => observer.disconnect();
  }, [syncChapters]);
  const openCategory = (id: string) => {
    const page = activeCategory ? getProductSubcategoryPage(id, activeCategory.id) : undefined;
    if (page) {
      const current = new URL(window.location.href);
      ["category", "subcategory", "catalog"].forEach((key) => current.searchParams.delete(key));
      window.history.replaceState(null, "", `${current.pathname}${current.search}${current.hash}`);
      router.push(page.href);
      return;
    }
    const url = new URL(window.location.href);
    if (activeCategory) {
      url.searchParams.delete("category");
      if (id === activeCategory.id) url.searchParams.delete("subcategory");
      else url.searchParams.set("subcategory", id);
    } else {
      url.searchParams.set("category", id);
      url.searchParams.delete("subcategory");
    }
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    openFinder();
  };
  const activateLink = (event: MouseEvent<HTMLElement>, href: string) => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(href, window.location.origin);
    if (activeCategory && url.pathname === `/products/category/${activeCategory.id}`) {
      event.preventDefault();
      if (`${url.search}${url.hash}` !== `${window.location.search}${window.location.hash}`)
        window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
      openFinder();
    } else if (!activeCategory && url.pathname === "/products" && (!indexContent || url.search)) {
      event.preventDefault();
      if (
        url.search &&
        `${url.search}${url.hash}` !== `${window.location.search}${window.location.hash}`
      )
        window.history[indexContent ? "replaceState" : "pushState"](
          null,
          "",
          `${url.pathname}${url.search}${url.hash}`,
        );
      openFinder();
    }
  };
  const showHero = useCallback((index: number, manual = true) => {
    if (manual) setPaused(true);
    const track = heroTrack.current;
    const card = track?.children[index] as HTMLElement | undefined;
    const first = track?.firstElementChild as HTMLElement | null;
    if (track && card && first)
      track.scrollTo({
        left: card.offsetLeft - first.offsetLeft,
        behavior: readMotion() ? "instant" : "smooth",
      });
    setHeroIndex(index);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), {
      threshold: 0.15,
    });
    if (heroTrack.current) observer.observe(heroTrack.current);
    const visibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => showHero((heroIndex + 1) % heroes.length, false), 8000);
    return () => window.clearInterval(timer);
  }, [playing, heroIndex, heroes.length, showHero]);
  useEffect(() => {
    heroTrack.current?.querySelectorAll("video").forEach((video) => {
      if (playing && video.closest("li")?.getAttribute("data-slide") === String(heroIndex))
        void video.play().catch(() => {});
      else video.pause();
    });
  }, [heroIndex, playing]);
  const link = (href: string, label: string, className?: string) => (
    <Link
      key={href}
      href={href}
      className={className}
      onClick={(event) => activateLink(event, href)}
    >
      {label}
    </Link>
  );

  return (
    <div
      className={`${styles.overview} ${categoryEntrance ? styles.categoryEntrance : ""}`}
      data-products-overview
      data-overview-category={categoryId}
      data-controls-ready={hydrated}
    >
      <Suspense fallback={null}>
        <FinderQuerySync
          onOpen={openFinder}
          onClose={indexContent ? closeFinder : undefined}
          categoryId={activeCategory?.id}
        />
      </Suspense>
      <PrimaryNavigation
        navigation={navigation}
        site={site}
        onOpenFinder={openFinder}
        onMenuChange={setMobileMenu}
      />
      <main
        id="main-content"
        inert={mobileMenu}
        onClick={
          indexContent
            ? (event) => {
                const anchor = (event.target as HTMLElement).closest("a[href]");
                const href = anchor?.getAttribute("href");
                if (href) activateLink(event, href);
              }
            : undefined
        }
      >
        <div className={styles.ribbon}>
          ปรึกษาผู้เชี่ยวชาญ เลือกให้ตรงกับงานของคุณ {link(sunford.contact, "ให้เราช่วยเลือก ›")}
        </div>
        {indexContent ?? (
          <>
            <section
              className={styles.chapters}
              aria-labelledby="products-title"
              data-overview-section="chapters"
            >
              <div
                className={`${styles.sectionInner} ${activeCategory ? styles.categoryHeading : ""}`}
              >
                <h1 id="products-title">{activeCategory?.label ?? "ผลิตภัณฑ์"}</h1>
                {activeCategory && <Link href="/products">สินค้าทั้งหมด</Link>}
              </div>
              <div className={styles.chapterRail}>
                <ul
                  ref={chapterTrack}
                  className={styles.chapterTrack}
                  id="products-chapters"
                  onScroll={syncChapters}
                >
                  {chapterItems.map((category, index) => (
                    <li
                      key={category.id}
                      style={
                        categoryEntrance
                          ? ({ "--chapter-index": index } as CSSProperties)
                          : undefined
                      }
                    >
                      <button
                        disabled={!hydrated}
                        type="button"
                        onClick={() => openCategory(category.id)}
                      >
                        <span className={styles.chapterArt}>
                          {categoryPhotos[index] && (
                            <ProductImage
                              src={catalogProductPhoto(categoryPhotos[index])}
                              fallbackSrc={categoryPhotos[index].fallbackImage}
                              alt=""
                              fill
                              sizes="96px"
                            />
                          )}
                        </span>
                        <span>{category.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                {!chapterEdges.start && (
                  <button
                    disabled={!hydrated}
                    type="button"
                    className={`${styles.chapterNext} ${styles.chapterPrevious}`}
                    aria-label="หมวดหมู่สินค้าก่อนหน้า"
                    aria-controls="products-chapters"
                    onClick={() =>
                      chapterTrack.current?.scrollBy({
                        left: -220,
                        behavior: reducedMotion ? "instant" : "smooth",
                      })
                    }
                  >
                    <ChevronLeft size={20} aria-hidden="true" />
                  </button>
                )}
                {!chapterEdges.end && (
                  <button
                    disabled={!hydrated}
                    type="button"
                    className={styles.chapterNext}
                    aria-label="หมวดหมู่สินค้าถัดไป"
                    aria-controls="products-chapters"
                    onClick={() =>
                      chapterTrack.current?.scrollBy({
                        left: 220,
                        behavior: reducedMotion ? "instant" : "smooth",
                      })
                    }
                  >
                    <ChevronRight size={20} aria-hidden="true" />
                  </button>
                )}
              </div>
            </section>

            <section
              className={styles.priority}
              aria-label="สินค้าเด่น SUNFORD"
              data-overview-section="hero"
            >
              <ul
                ref={heroTrack}
                className={styles.heroTrack}
                onPointerDown={() => setPaused(true)}
                onWheel={(event) => {
                  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) setPaused(true);
                }}
                onScroll={(event) => {
                  const track = event.currentTarget;
                  const first = track.children[0] as HTMLElement | undefined;
                  const second = track.children[1] as HTMLElement | undefined;
                  if (first && second)
                    setHeroIndex(
                      Math.max(
                        0,
                        Math.min(
                          heroes.length - 1,
                          Math.round(track.scrollLeft / (second.offsetLeft - first.offsetLeft)),
                        ),
                      ),
                    );
                }}
              >
                {heroes.map((product, index) => {
                  const video = product.id === defaultSpotlightProductId;
                  return (
                    <li
                      key={product.id}
                      id={`products-hero-${index}`}
                      data-slide={index}
                      className={`${styles.heroSlide} ${video ? styles.heroDark : ""}`}
                    >
                      <div className={styles.heroCopy}>
                        <div>
                          <h2>{cardNames[product.id] ?? product.name}</h2>
                        </div>
                        <div className={styles.heroActions}>
                          <Link className={styles.primaryButton} href={`/products/${product.slug}`}>
                            ดูรายละเอียดรุ่น
                          </Link>
                          <Link
                            className={styles.textLink}
                            href={sunford.contact}
                            aria-label={`สอบถามสินค้า ${cardNames[product.id] ?? product.name}`}
                          >
                            สอบถาม <ChevronRight size={15} aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                      <div className={styles.heroArt}>
                        {video ? (
                          <video
                            src={defaultSpotlightVideo}
                            poster={defaultSpotlightPoster}
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            aria-label={`SUNFORD ${cardNames[product.id] ?? product.name}`}
                          />
                        ) : (
                          <ProductImage
                            src={catalogProductPhoto(product)}
                            fallbackSrc={product.fallbackImage}
                            alt={`SUNFORD ${cardNames[product.id] ?? product.name}`}
                            fill
                            preload={index === 0}
                            sizes="(max-width: 734px) 82vw, 87.5vw"
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {heroes.length > 1 && (
                <div className={styles.heroPlayback} data-playing={playing}>
                  <div
                    className={styles.heroTabs}
                    role="tablist"
                    aria-label="เลือกสินค้าเด่น"
                    onKeyDown={(event) => {
                      const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
                      if (!keys.includes(event.key)) return;
                      event.preventDefault();
                      const index =
                        event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? heroes.length - 1
                            : (heroIndex + (event.key === "ArrowRight" ? 1 : -1) + heroes.length) %
                              heroes.length;
                      showHero(index);
                      (event.currentTarget.children[index] as HTMLButtonElement)?.focus();
                    }}
                  >
                    {heroes.map((product, index) => (
                      <button
                        disabled={!hydrated}
                        type="button"
                        role="tab"
                        key={product.id}
                        aria-label={cardNames[product.id] ?? product.name}
                        aria-selected={heroIndex === index}
                        tabIndex={heroIndex === index ? 0 : -1}
                        aria-controls={`products-hero-${index}`}
                        onClick={() => showHero(index)}
                      >
                        <span />
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={!hydrated}
                    type="button"
                    className={styles.playButton}
                    aria-label={playing ? "หยุดแกลเลอรีสินค้าเด่น" : "เล่นแกลเลอรีสินค้าเด่น"}
                    onClick={() => {
                      if (playing) setPaused(true);
                      else {
                        setPaused(false);
                        setMotionEnabled(true);
                      }
                    }}
                  >
                    {playing ? (
                      <Pause fill="currentColor" size={21} aria-hidden="true" />
                    ) : (
                      <Play fill="currentColor" size={21} aria-hidden="true" />
                    )}
                  </button>
                </div>
              )}
            </section>

            <section
              className={`${styles.section} ${styles.paper} ${styles.lineup}`}
              aria-labelledby="products-lineup-title"
              data-overview-section="lineup"
            >
              <div className={styles.sectionHeading}>
                <h2 id="products-lineup-title">
                  {activeCategory
                    ? `ดูข้อมูล${activeCategory.label}`
                    : "ดูข้อมูลผลิตภัณฑ์ตระกูลนี้"}
                </h2>
                <button
                  disabled={!hydrated}
                  type="button"
                  className={styles.textLink}
                  onClick={() => (activeCategory ? openCategory(activeCategory.id) : openFinder())}
                >
                  {activeCategory ? `ดู${activeCategory.label}ทั้งหมด` : "ดูสินค้าทั้งหมด"}{" "}
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
              <Gallery id="products-lineup" label="เลื่อนผลิตภัณฑ์">
                {lineup.map((product) => (
                  <li key={product.id} className={styles.productTile}>
                    <Link href={`/products/${product.slug}`} className={styles.lineupArt}>
                      <ProductImage
                        src={catalogProductPhoto(product)}
                        fallbackSrc={product.fallbackImage}
                        alt={`SUNFORD ${cardNames[product.id] ?? product.name}`}
                        fill
                        sizes="(max-width: 734px) 260px, 372px"
                      />
                    </Link>
                    <div className={styles.lineupCopy}>
                      {product.badge && <p className={styles.productBadge}>{product.badge}</p>}
                      <h3>{cardNames[product.id] ?? product.name}</h3>
                      {typeof product.price === "number" && product.price > 0 ? (
                        <p className={styles.price}>{product.price.toLocaleString("th-TH")} บาท</p>
                      ) : product.warehouseSku ? (
                        <p className={styles.price}>สอบถามราคา</p>
                      ) : null}
                      <div className={styles.tileActions}>
                        <Link href={`/products/${product.slug}`} className={styles.primaryButton}>
                          ดูรายละเอียดรุ่น
                        </Link>
                        <Link
                          href={sunford.contact}
                          className={styles.textLink}
                          aria-label={`สอบถามสินค้า ${cardNames[product.id] ?? product.name}`}
                        >
                          สอบถาม <ChevronRight size={15} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </Gallery>
            </section>

            <section
              className={`${styles.section} ${styles.paper} ${styles.services}`}
              aria-labelledby="products-services-title"
              data-overview-section="services"
            >
              <div className={styles.sectionHeading}>
                <h2 id="products-services-title">เลือก SUNFORD พร้อมเคียงข้างทุกธุรกิจ</h2>
                <Link className={styles.textLink} href={sunford.contact}>
                  ปรึกษาผู้เชี่ยวชาญ <ChevronRight size={16} aria-hidden="true" />
                </Link>
              </div>
              <Gallery id="products-services" label="เลื่อนบริการ">
                {services.map((item, index) => {
                  const Icon = serviceIcons[index];
                  return (
                    <li key={item.title} className={styles.serviceCard}>
                      <Icon size={42} strokeWidth={1.5} aria-hidden="true" />
                      <h3>{item.title}</h3>
                      <p>{item.detail}</p>
                      <button
                        disabled={!hydrated}
                        type="button"
                        className={styles.cardOpen}
                        aria-label={`ดูเพิ่มเติม ${item.title}`}
                        onClick={() => setService(item)}
                      >
                        <Plus size={21} aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </Gallery>
            </section>

            <section
              className={`${styles.section} ${styles.features}`}
              aria-labelledby="products-features-title"
              data-overview-section="features"
            >
              <div className={styles.sectionHeading}>
                <h2 id="products-features-title">
                  {activeCategory
                    ? `รู้จัก${activeCategory.label} SUNFORD`
                    : "รู้จักผลิตภัณฑ์ SUNFORD"}
                </h2>
              </div>
              <Gallery id="products-features" label="เลื่อนเรื่องราวผลิตภัณฑ์">
                {stories.map((item) => (
                  <li className={styles.storyCard} key={item.id}>
                    <div className={styles.storyCopy}>
                      <p>SUNFORD</p>
                      <h3>{item.title}</h3>
                    </div>
                    <div className={styles.storyArt}>
                      <ProductImage
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 734px) 260px, 372px"
                      />
                    </div>
                    <button
                      disabled={!hydrated}
                      type="button"
                      className={styles.cardOpen}
                      aria-label={`ดูเพิ่มเติม ${item.title}`}
                      onClick={() => setStory(item)}
                    >
                      <Plus size={21} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </Gallery>
            </section>

            {!activeCategory && (
              <section
                className={`${styles.section} ${styles.essentials}`}
                aria-labelledby="products-essentials-title"
                data-overview-section="essentials"
              >
                <div className={styles.sectionHeading}>
                  <h2 id="products-essentials-title">สิ่งที่เติมเต็มการทำงาน</h2>
                  <Link href={sunford.accessories} className={styles.textLink}>
                    ดูอุปกรณ์เสริมทั้งหมด <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                </div>
                <Gallery id="products-essentials" label="เลื่อนอุปกรณ์และซอฟต์แวร์">
                  {[
                    {
                      title: "อุปกรณ์เสริม",
                      detail:
                        "เครื่องพิมพ์ จอแสดงผล และอุปกรณ์ POS เพื่อขยายการใช้งานให้เหมาะกับธุรกิจ",
                      image: solutionImages.accessories,
                      href: sunford.accessories,
                    },
                    {
                      title: "แอปพลิเคชันและซอฟต์แวร์",
                      detail: "สำหรับงานค้าปลีก การผลิตอุตสาหกรรม และการดูแลครัวเรือนกับสุขภาพ",
                      image: solutionImages.software,
                      href: sunford.software,
                    },
                  ].map((item) => (
                    <li key={item.title} className={styles.essentialCard}>
                      <div className={styles.essentialCopy}>
                        <h3>{item.title}</h3>
                        <p>{item.detail}</p>
                        <Link href={item.href} className={styles.textLink}>
                          ดูเพิ่มเติม <ChevronRight size={16} aria-hidden="true" />
                        </Link>
                      </div>
                      <div className={styles.essentialArt}>
                        <ProductImage
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 734px) 260px, 44vw"
                        />
                      </div>
                    </li>
                  ))}
                </Gallery>
              </section>
            )}

            <section
              className={`${styles.section} ${styles.accordionSection}`}
              aria-labelledby="products-accordion-title"
              data-overview-section="accordion"
            >
              <div className={styles.sectionHeading}>
                <h2 id="products-accordion-title">
                  {activeCategory
                    ? `เลือก${activeCategory.label}ให้เหมาะกับงาน`
                    : "เมื่อทุกอย่างเชื่อมถึงกัน ธุรกิจก็ไปได้ไกลขึ้น"}
                </h2>
              </div>
              <div className={styles.accordionCard}>
                <div className={styles.accordionRows}>
                  {accordion.map((item, index) => (
                    <div className={styles.accordionRow} key={item.title}>
                      <h3>
                        <button
                          disabled={!hydrated}
                          id={`products-accordion-button-${index}`}
                          type="button"
                          aria-expanded={accordionIndex === index}
                          aria-controls={`products-accordion-panel-${index}`}
                          onClick={() => setAccordionIndex(index)}
                        >
                          {item.title}
                          <ChevronDown
                            className={accordionIndex === index ? styles.chevronOpen : ""}
                            size={22}
                            aria-hidden="true"
                          />
                        </button>
                      </h3>
                      <div
                        id={`products-accordion-panel-${index}`}
                        role="region"
                        aria-labelledby={`products-accordion-button-${index}`}
                        hidden={accordionIndex !== index}
                      >
                        {item.content}
                        <div className={styles.mobileAccordionArt}>
                          <ProductImage src={item.image} alt={item.title} fill sizes="80vw" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.accordionArt}>
                  <ProductImage
                    key={accordionIndex}
                    src={accordion[accordionIndex].image}
                    alt={accordion[accordionIndex].title}
                    fill
                    sizes="60vw"
                  />
                </div>
              </div>
            </section>

            <section
              className={`${styles.section} ${styles.index}`}
              aria-labelledby="products-index-title"
              data-overview-section="index"
            >
              <div className={styles.sectionInner}>
                <h2 id="products-index-title">{activeCategory?.label ?? "ผลิตภัณฑ์"}</h2>
                <div className={styles.indexColumns}>
                  <div className={styles.indexPrimary}>
                    <p>{activeCategory ? `สำรวจ${activeCategory.label}` : "สำรวจผลิตภัณฑ์"}</p>
                    <button
                      disabled={!hydrated}
                      type="button"
                      onClick={() =>
                        activeCategory ? openCategory(activeCategory.id) : openFinder()
                      }
                    >
                      {activeCategory ? `ดู${activeCategory.label}ทั้งหมด` : "ดูสินค้าทั้งหมด"}
                    </button>
                    {chapterItems.map((category) => (
                      <button
                        disabled={!hydrated}
                        type="button"
                        key={category.id}
                        onClick={() => openCategory(category.id)}
                      >
                        {category.label}
                      </button>
                    ))}
                    <button
                      disabled={!hydrated}
                      type="button"
                      className={styles.indexCompare}
                      onClick={compare}
                    >
                      เลือกสินค้าเพื่อเปรียบเทียบ
                    </button>
                  </div>
                  <div>
                    <p>เลือกให้ตรงกับงาน</p>
                    {stories.map((item) => (
                      <div key={item.id}>{link(item.href, item.title)}</div>
                    ))}
                    {!activeCategory && link(sunford.accessories, "อุปกรณ์เสริม")}
                    {!activeCategory && link(sunford.software, "แอปพลิเคชันและซอฟต์แวร์")}
                  </div>
                  <div>
                    <p>พร้อมดูแลคุณ</p>
                    {link(sunford.service, "บริการหลังการขาย")}
                    {link(sunford.warranty, "ลงทะเบียนรับประกัน")}
                    {link(sunford.warrantyPolicy, "นโยบายการรับประกัน")}
                    {!activeCategory && link(sunford.downloads, "ดาวน์โหลดซอฟต์แวร์")}
                    {link(sunford.contact, "ติดต่อเรา")}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className={styles.footer} data-products-footer inert={mobileMenu}>
        <div className={styles.footerInner}>
          <div className={styles.footnotes}>
            {activeCategory ? (
              <>
                <p>{stories[0]?.introduction}</p>
                <p>{stories[1]?.introduction}</p>
              </>
            ) : (
              <>
                <p>เลือกอุปกรณ์จากรุ่นเครื่องหลัก งานที่ต้องการเพิ่ม และข้อกำหนดการใช้งานร่วมกัน</p>
                <p>
                  การมีช่องต่อที่มีรูปร่างเหมือนกันยังไม่เพียงพอสำหรับยืนยันการใช้งานร่วมกัน
                  ควรตรวจการตั้งค่าและข้อกำหนดของซอฟต์แวร์ปลายทางด้วย
                </p>
              </>
            )}
            <p>
              {link(sunford.warrantyPolicy, "นโยบายการรับประกัน")} ·{" "}
              {link(sunford.contact, "ปรึกษาผู้เชี่ยวชาญ")}
            </p>
          </div>
          <nav className={styles.breadcrumb} aria-label="เส้นทางนำทาง">
            <Link href="/" aria-label="SUNFORD หน้าแรก">
              <Image src={site.logo} alt={site.name} width={82} height={20} />
            </Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span>{activeCategory?.label ?? "ผลิตภัณฑ์"}</span>
          </nav>
          <div className={styles.footerColumns}>
            {navigation
              .filter((item) => item.links.length)
              .map((item) => (
                <div key={item.href} className={styles.footerColumn}>
                  <div className={styles.footerDesktop}>
                    <h3>{item.label}</h3>
                    {item.links.map((entry) => (
                      <div key={entry.href}>{link(entry.href, entry.label)}</div>
                    ))}
                  </div>
                  <details>
                    <summary>
                      {item.label}
                      <Plus size={14} aria-hidden="true" />
                    </summary>
                    <div>
                      {item.links.map((entry) => (
                        <div key={entry.href}>{link(entry.href, entry.label)}</div>
                      ))}
                    </div>
                  </details>
                </div>
              ))}
          </div>
          <p className={styles.footerContact}>
            ให้เราช่วยเลือก: <a href={site.phoneHref}>{site.phone}</a> หรือ{" "}
            <a href={site.line} target="_blank" rel="noreferrer">
              ติดต่อ SUNFORD ผ่าน LINE
            </a>
          </p>
          <div className={styles.footerBottom}>
            <span>© {copyrightYear} SUNFORD. All rights reserved.</span>
            <div>
              {link(sunford.warrantyPolicy, "นโยบายการรับประกัน")}
              {link("/cancel-and-return/policy", "การยกเลิกและคืนสินค้า")}
              {link(sunford.contact, "ติดต่อเรา")}
            </div>
            <span>ประเทศไทย</span>
          </div>
        </div>
      </footer>

      <ReferenceModal
        open={Boolean(service)}
        onClose={() => setService(null)}
        title={service?.title ?? "บริการ SUNFORD"}
      >
        {service && (
          <>
            <p className={styles.serviceDetail}>{service.detail}</p>
            {service.content}
            <Link
              className={styles.textLink}
              href={service.href}
              onClick={(event) => {
                if (
                  service.href === "/products" ||
                  (activeCategory && service.href === `/products/category/${activeCategory.id}`)
                ) {
                  activateLink(event, service.href);
                  setService(null);
                }
              }}
            >
              ดูเพิ่มเติม <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </>
        )}
      </ReferenceModal>
      <ReferenceModal
        open={Boolean(story)}
        onClose={() => setStory(null)}
        title={story?.title ?? "รู้จักผลิตภัณฑ์ SUNFORD"}
        large
      >
        {story && (
          <>
            <p className={styles.storyIntroduction}>{story.introduction}</p>
            <div className={styles.storyModalArt}>
              <ProductImage src={story.image} alt={story.title} fill sizes="87vw" />
            </div>
            {activeCategory ? (
              <div
                onClick={(event) => {
                  const anchor = (event.target as HTMLElement).closest("a[href]");
                  const href = anchor?.getAttribute("href");
                  if (!href) return;
                  activateLink(event, href);
                  if (event.defaultPrevented) setStory(null);
                }}
              >
                {story.content}
              </div>
            ) : (
              story.content
            )}
            <Link className={styles.textLink} href={story.href}>
              ดูเพิ่มเติม <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </>
        )}
      </ReferenceModal>
      <ReferenceModal
        open={finderOpen}
        onClose={closeFinder}
        title={activeCategory ? `ดู${activeCategory.label}ทั้งหมด` : "ดูสินค้าทั้งหมด"}
        large
        finder
      >
        <ProductCategoryMock
          products={products}
          categories={categories}
          cardNames={cardNames}
          presentation="finder"
          categoryId={activeCategory?.id}
        />
        {finderOpen && <div ref={overlayHost} />}
      </ReferenceModal>
    </div>
  );
}
