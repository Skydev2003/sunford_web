"use client";
import { footerNavigation, footerLegalLinks } from "@/features/site/data/footer-navigation";
import { Globe, Mail, MapPin, Phone, ArrowUp } from "lucide-react";
import { useReturnState } from "@/features/site/history/return-state";
import { useCatalogStore } from "@/stores/catalog-store";
import { PrimaryNavigation } from "@/components/layout/primary-navigation";
import { getPrimaryNavigationItems } from "@/features/site/data/primary-navigation";

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
import { CatalogNavigationLink } from "./catalog-navigation-link";
import Image from "next/image";
import lcdArt from "../../../../public/images/category-chapters/indicators/lcd.webp";
import ledArt from "../../../../public/images/category-chapters/indicators/led.webp";
import carbonSteelArt from "../../../../public/images/category-chapters/platforms/carbon-steel.webp";
import sus201Art from "../../../../public/images/category-chapters/platforms/sus201.webp";
import sus304Art from "../../../../public/images/category-chapters/platforms/sus304.webp";
import androidArt from "../../../../public/images/category-chapters/pos/android.webp";
import windowsArt from "../../../../public/images/category-chapters/pos/windows.webp";
import analyticalArt from "../../../../public/images/category-chapters/scales/analytical.webp";
import industrialArt from "../../../../public/images/category-chapters/scales/industrial.webp";
import kitchenArt from "../../../../public/images/category-chapters/scales/kitchen.webp";
import priceArt from "../../../../public/images/category-chapters/scales/price.webp";
import { useRouter, useSearchParams } from "next/navigation";
import { resolveCategoryHref } from "../data/category-destinations";
import directoryStyles from "./product-directory.module.css";
import {
  getProductSubcategoryPage,
  getProductSubcategoryPageByHref,
} from "../data/product-subcategory-pages";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GitCompareArrows,
  FileText,
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
import { ScrollReveal } from "@/components/ui/scroll-reveal";
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
import { selectComponentShowcase } from "../data/component-showcase";
import { lineupSalesCopy } from "../data/lineup-sales-copy";
import { catalogProductPhoto } from "./catalog-product-card";
import { ProductCategoryMock } from "./product-category-mock";
import { SegmentedFilter } from "./segmented-filter";
import { ProductsIndexRail } from "./products-index-rail";
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
const categoryServiceIcons = new Map([
  ["/service/quotation", FileText],
  [sunford.contact, Headphones],
  [sunford.service, ShieldCheck],
  [sunford.warrantyPolicy, ShieldCheck],
  [sunford.warranty, ClipboardCheck],
  [sunford.software, Download],
  [sunford.downloads, Download],
]);
const lineupCategoryIds = new Set(["scales", "indicators", "platforms", "pos"]);
const chapterArtwork = new Map([
  ["/products/category/indicators/lcd", lcdArt.src],
  ["/products/category/indicators/led", ledArt.src],
  ["/products/category/platforms/carbon-steel", carbonSteelArt.src],
  ["/products/category/platforms/sus201", sus201Art.src],
  ["/products/category/platforms/sus304", sus304Art.src],
  ["/products/category/pos/android", androidArt.src],
  ["/products/category/pos/windows", windowsArt.src],
  ["/products/category/scales/analytical", analyticalArt.src],
  ["/products/category/scales/industrial", industrialArt.src],
  ["/products/category/scales/kitchen", kitchenArt.src],
  ["/products/category/scales/price", priceArt.src],
]);

type GalleryProps = {
  id: string;
  label: string;
  children: ReactNode;
  returnKey?: string;
  prepareImages?: boolean;
};

function Gallery({ id, label, children, returnKey, prepareImages }: GalleryProps) {
  return (
    <div className={styles.gallery} role="group" aria-label={label}>
      {returnKey ? (
        <ProductsIndexRail
          id={id}
          label={label}
          returnKey={returnKey}
          trackClassName={styles.galleryTrack}
          controlsClassName={styles.galleryControls}
          controlLabels={{ previous: `${label}ก่อนหน้า`, next: `${label}ถัดไป` }}
          prepareImages={prepareImages}
          revealTabFocus
        >
          {children}
        </ProductsIndexRail>
      ) : (
        <LegacyGallery id={id} label={label}>
          {children}
        </LegacyGallery>
      )}
    </div>
  );
}

function LegacyGallery({ id, label, children }: GalleryProps) {
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
    <>
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
    </>
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
      data-return-scope={finder ? "catalog-finder" : title}
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
  onOpen?: () => void;
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
        onOpen?.();
      return;
    }
    if (category || subcategory || catalog === "all") onOpen?.();
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
  readySubcategoryHrefs,
  stories,
  services,
  accordion,
  categoryId,
  chapterPhotoIdByHref,
  indexContent,
  applications,
}: {
  products: ClientProduct[];
  categories: ProductCategory[];
  cardNames: Record<string, string>;
  site: SiteSettings;
  copyrightYear: number;
  navigation: NavigationItem[];
  readySubcategoryHrefs: readonly string[];
  stories: Story[];
  services: Service[];
  accordion: AccordionItem[];
  categoryId?: string;
  chapterPhotoIdByHref?: Record<string, string>;
  indexContent?: ReactNode;
  applications?: ReactNode;
}) {
  const router = useRouter();
  const activeCategory = categories.find((category) => category.id === categoryId);
  const scaleApplicationsHref =
    categoryId === "scales" ? "/products/category/scales/applications" : undefined;
  const categoryLineup = Boolean(categoryId && lineupCategoryIds.has(categoryId));
  const categoryEntrance = Boolean(indexContent) || categoryLineup || categoryId === "accessories";
  const categoryItems = activeCategory?.subcategories ?? categories;
  const categoryHref = categoryId ? `/products/category/${categoryId}` : undefined;
  const categoryMenu = categoryHref
    ? getPrimaryNavigationItems(navigation, readySubcategoryHrefs, "category-chapters").find(
        (item) => item.href === categoryHref,
      )
    : undefined;
  const additionalCategoryLinks = (categoryMenu?.groups?.[0]?.links ?? []).filter((item) => {
    const page = getProductSubcategoryPageByHref(item.href);
    return !item.disabled && page && "matches" in page;
  });
  const chapterItems = categoryMenu
    ? categoryMenu.links.map((link) => {
        const category = activeCategory?.subcategories.find(
          (item) => getProductSubcategoryPage(item.id)?.href === link.href,
        );
        return { ...link, id: category?.id ?? link.href, productIds: category?.productIds ?? [] };
      })
    : categoryItems.map((category) => ({
        ...category,
        href: getProductSubcategoryPage(category.id)?.href ?? `/products/category/${category.id}`,
        disabled: false,
      }));
  const [lineupSelection, setLineupSelection] = useReturnState<{
    id: string | null;
    revision: number;
  } | null>("products-overview.lineupSelection", null);
  const lineupFilter = lineupSelection?.id ?? null;
  const lineupRevision = lineupSelection?.revision ?? 0;
  const selectedGroup = categoryLineup
    ? chapterItems.find((item) => !item.disabled && item.id === lineupFilter)
    : undefined;
  const selectLineupFilter = (id: string | null) => {
    if (lineupFilter === id) return;
    setLineupSelection({ id, revision: lineupRevision + 1 });
  };
  const railScope = categoryLineup ? `products-overview.${categoryId}` : undefined;
  const [restoredFinderOpen, setFinderOpen] = useReturnState("products-overview.finderOpen", false);
  const finderOpen = !scaleApplicationsHref && restoredFinderOpen;
  const hydrated = useHydratedControls();
  const [story, setStory] = useReturnState<Story | null>("products-overview.story", null);
  const [service, setService] = useReturnState<Service | null>("products-overview.service", null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [accordionIndex, setAccordionIndex] = useReturnState("products-overview.accordionIndex", 0);
  const [heroIndex, setHeroIndex] = useReturnState("products-overview.heroIndex", 0);
  const [paused, setPaused] = useReturnState("products-overview.paused", false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [chapterEdges, setChapterEdges] = useState({ start: true, end: true });
  const heroTrack = useRef<HTMLUListElement>(null);
  const chapterTrack = useRef<HTMLUListElement>(null);
  const reducedMotion = useSyncExternalStore(subscribeMotion, readMotion, serverMotion);
  const overlayHost = useCatalogOverlayHost();
  const componentPhotos = new Map(
    (categoryId === "indicators" || categoryId === "platforms"
      ? selectComponentShowcase(products)
      : []
    ).map(({ product, photo }) => [product.id, photo]),
  );
  const hasLineupPhoto = (product: ClientProduct) =>
    Boolean(
      categoryLineup
        ? catalogProductPhoto(product) || product.fallbackImage || componentPhotos.has(product.id)
        : product.image,
    );
  const picturedProducts = products.filter(hasLineupPhoto);
  const featuredFirst = [
    ...picturedProducts.filter((product) => product.featured),
    ...picturedProducts.filter((product) => !product.featured),
  ];
  const lineup = categoryLineup
    ? [...featuredFirst, ...products.filter((product) => !hasLineupPhoto(product))]
    : featuredFirst.slice(0, 6);
  const groupProducts = selectedGroup ? new Set(selectedGroup.productIds) : null;
  const lineupProducts = groupProducts
    ? lineup.filter((product) => groupProducts.has(product.id))
    : lineup;
  const heroes = categoryLineup ? [] : featuredFirst.slice(0, 2);
  const playing =
    !indexContent &&
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
  const chapterImages = chapterItems.map((category) => {
    const members = category.productIds
      .map((id) => productsById.get(id))
      .filter((product) => product?.image);
    const fallbackId = chapterPhotoIdByHref?.[category.href];
    const photo =
      members.find((product) => product?.featured) ??
      members[0] ??
      (fallbackId ? productsById.get(fallbackId) : undefined);
    const memberPhoto = photo && catalogProductPhoto(photo);
    const artwork = chapterArtwork.get(category.href);
    return {
      src: artwork ?? memberPhoto,
      fallbackSrc: artwork ? memberPhoto || photo?.fallbackImage : photo?.fallbackImage,
      sizes: artwork ? "(min-width: 48rem) 100px, 90px" : "96px",
    };
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
    const track = chapterTrack.current;
    if (!track) return;
    const observer = new ResizeObserver(syncChapters);
    observer.observe(track);
    return () => observer.disconnect();
  }, [categoryLineup, syncChapters]);
  const openCategory = (id: string, href?: string) => {
    const page = activeCategory ? getProductSubcategoryPage(id, activeCategory.id) : undefined;
    const destination = href ?? page?.href;
    if (destination) {
      const current = new URL(window.location.href);
      ["category", "subcategory", "catalog"].forEach((key) => current.searchParams.delete(key));
      window.history.replaceState(null, "", `${current.pathname}${current.search}${current.hash}`);
      router.push(destination);
      return;
    }
    if (scaleApplicationsHref) return;
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
    if (
      scaleApplicationsHref ||
      event.button ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
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
  const showHero = useCallback(
    (index: number, manual = true) => {
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
    },
    [setHeroIndex, setPaused],
  );
  useEffect(() => {
    const track = heroTrack.current;
    if (!track) return;
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(track);
    const visibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [categoryLineup, indexContent]);
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
  const openDetails = (title: string, href: string, action: () => void) => {
    const label = `ดูเพิ่มเติม ${title}`;
    const icon = <Plus size={21} aria-hidden="true" />;
    if (categoryLineup && !hydrated) {
      return (
        <Link
          className={styles.cardOpen}
          href={href === categoryHref ? "#products-lineup" : href}
          aria-label={label}
          prefetch={false}
        >
          {icon}
        </Link>
      );
    }
    return (
      <button
        disabled={!hydrated}
        type="button"
        className={styles.cardOpen}
        aria-label={label}
        onClick={action}
      >
        {icon}
      </button>
    );
  };
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

  const chapterCards = chapterItems.map((category, index) => {
    const content = (
      <>
        <span className={styles.chapterArt}>
          <ProductImage placeholder="product" {...chapterImages[index]} alt="" fill />
        </span>
        <span>{category.label}</span>
      </>
    );
    return (
      <li
        key={category.id}
        style={categoryEntrance ? ({ "--chapter-index": index } as CSSProperties) : undefined}
      >
        {categoryLineup && !category.disabled ? (
          <CatalogNavigationLink
            href={category.href}
            prefetch={false}
            onNavigate={(event) => {
              event.preventDefault();
              openCategory(category.id, category.href);
            }}
          >
            {content}
          </CatalogNavigationLink>
        ) : (
          <button
            disabled={!hydrated || category.disabled}
            type="button"
            onClick={() => openCategory(category.id, category.href)}
          >
            {content}
          </button>
        )}
      </li>
    );
  });

  return (
    <div
      className={`${styles.overview} ${categoryEntrance ? styles.categoryEntrance : ""} ${categoryLineup ? styles.categoryLineup : ""}`}
      data-products-overview
      data-overview-category={categoryId}
      data-controls-ready={hydrated}
    >
      <Suspense fallback={null}>
        <FinderQuerySync
          onOpen={scaleApplicationsHref ? undefined : openFinder}
          onClose={indexContent ? closeFinder : undefined}
          categoryId={activeCategory?.id}
        />
      </Suspense>
      <PrimaryNavigation
        navigation={navigation}
        readySubcategoryHrefs={readySubcategoryHrefs}
        site={site}
        onOpenFinder={scaleApplicationsHref ? undefined : openFinder}
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
        {!indexContent && !categoryLineup && (
          <div className={styles.ribbon}>
            ปรึกษาผู้เชี่ยวชาญ เลือกให้ตรงกับงานของคุณ {link(sunford.contact, "ให้เราช่วยเลือก ›")}
          </div>
        )}
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
                {railScope ? (
                  <ProductsIndexRail
                    id="products-chapters"
                    label="หมวดหมู่สินค้า"
                    categoryRail
                    trackClassName={styles.chapterTrack}
                    controlsClassName=""
                    controlClassNames={{
                      previous: `${styles.chapterNext} ${styles.chapterPrevious}`,
                      next: styles.chapterNext,
                    }}
                    controlLabels={{
                      previous: "หมวดหมู่สินค้าก่อนหน้า",
                      next: "หมวดหมู่สินค้าถัดไป",
                    }}
                    controlIconSize={20}
                    hideUnavailableControls
                    revealTabFocus
                    returnKey={`${railScope}.chapters`}
                  >
                    {chapterCards}
                  </ProductsIndexRail>
                ) : (
                  <>
                    <ul
                      ref={chapterTrack}
                      className={styles.chapterTrack}
                      id="products-chapters"
                      onScroll={syncChapters}
                    >
                      {chapterCards}
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
                  </>
                )}
              </div>
            </section>

            {!categoryLineup && (
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
                            <Link
                              className={styles.primaryButton}
                              href={`/products/${product.slug}`}
                            >
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
                              placeholder="product"
                              progressive
                              src={catalogProductPhoto(product)}
                              fallbackSrc={product.fallbackImage}
                              alt={`SUNFORD ${cardNames[product.id] ?? product.name}`}
                              fill
                              preload={index === 0}
                              sizes="(width < 48rem) 82vw, 87.5vw"
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
                              : (heroIndex +
                                  (event.key === "ArrowRight" ? 1 : -1) +
                                  heroes.length) %
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
            )}

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
                {!scaleApplicationsHref && (
                  <button
                    disabled={!hydrated}
                    type="button"
                    className={styles.textLink}
                    onClick={() =>
                      activeCategory ? openCategory(activeCategory.id) : openFinder()
                    }
                  >
                    {activeCategory ? `ดู${activeCategory.label}ทั้งหมด` : "ดูสินค้าทั้งหมด"}{" "}
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
              {categoryLineup && (
                <div className={styles.lineupFilters} role="group" aria-label="กรองผลิตภัณฑ์">
                  <SegmentedFilter value={selectedGroup?.id ?? "all"}>
                    <button
                      type="button"
                      aria-pressed={!selectedGroup}
                      aria-controls="products-lineup"
                      disabled={!hydrated}
                      onClick={() => selectLineupFilter(null)}
                    >
                      ทุกผลิตภัณฑ์
                    </button>
                    {chapterItems.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        aria-pressed={selectedGroup?.id === item.id}
                        aria-controls="products-lineup"
                        disabled={!hydrated || item.disabled}
                        onClick={() => selectLineupFilter(item.id)}
                      >
                        {item.label}
                      </button>
                    ))}
                    {scaleApplicationsHref && (
                      <Link href={scaleApplicationsHref} prefetch={false}>
                        เลือกตามการใช้งาน
                      </Link>
                    )}
                  </SegmentedFilter>
                </div>
              )}
              {categoryLineup && (
                <p className={styles.lineupStatus} role="status">
                  {lineupProducts.length > 0
                    ? `${lineupProducts.length} รุ่น`
                    : "ยังไม่มีรุ่นสินค้าในกลุ่มนี้"}
                </p>
              )}
              <Gallery
                key={lineupRevision}
                id="products-lineup"
                label="เลื่อนผลิตภัณฑ์"
                returnKey={railScope && `${railScope}.lineup.${lineupRevision}`}
                prepareImages={categoryLineup}
              >
                {lineupProducts.length === 0 && categoryLineup && (
                  <li className={styles.lineupEmpty}>ยังไม่มีรุ่นสินค้าในกลุ่มนี้</li>
                )}
                {lineupProducts.map((product, index) => {
                  const componentPhoto = componentPhotos.get(product.id);
                  const photo = catalogProductPhoto(product) || componentPhoto;
                  const fallbackPhoto = componentPhoto || product.fallbackImage;
                  return (
                    <li key={product.id} className={styles.productTile}>
                      <Link
                        href={`/products/${product.slug}`}
                        className={styles.lineupArt}
                        aria-label={
                          categoryLineup
                            ? `ดูรายละเอียด ${cardNames[product.id] ?? product.name}`
                            : undefined
                        }
                      >
                        {categoryLineup && !photo && !fallbackPhoto ? (
                          <span className={styles.lineupPlaceholder}>ยังไม่มีภาพสินค้า</span>
                        ) : (
                          <>
                            <ProductImage
                              placeholder="product"
                              progressive
                              prioritize={lineupRevision === 0 && index < 6}
                              src={photo}
                              fallbackSrc={fallbackPhoto}
                              alt={`SUNFORD ${cardNames[product.id] ?? product.name}`}
                              fill
                              sizes="(max-width: 736px) min(calc(100vw - 60px), 309px), 313px"
                            />
                            {categoryLineup && (
                              <span className={`${styles.lineupPlaceholder} ${styles.lineupError}`}>
                                ยังไม่มีภาพสินค้า
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                      <div className={styles.lineupCopy}>
                        {product.badge && <p className={styles.productBadge}>{product.badge}</p>}
                        <h3>{cardNames[product.id] ?? product.name}</h3>
                        <p className={styles.lineupDescription}>{lineupSalesCopy(product)}</p>
                        {typeof product.price === "number" && product.price > 0 ? (
                          <p className={styles.price}>
                            {product.price.toLocaleString("th-TH")} บาท
                          </p>
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
                  );
                })}
              </Gallery>
            </section>

            {applications}

            <section
              className={`${styles.section} ${styles.paper} ${styles.services}`}
              aria-labelledby="products-services-title"
              data-overview-section="services"
            >
              <div className={styles.sectionHeading} data-scroll-reveal="">
                <h2 id="products-services-title">เลือก SUNFORD พร้อมเคียงข้างทุกธุรกิจ</h2>
                <Link className={styles.textLink} href={sunford.contact}>
                  ปรึกษาผู้เชี่ยวชาญ <ChevronRight size={16} aria-hidden="true" />
                </Link>
              </div>
              <Gallery
                id="products-services"
                label="เลื่อนบริการ"
                returnKey={railScope && `${railScope}.services`}
              >
                {services.map((item, index) => {
                  const href = item.href.split(/[?#]/)[0];
                  const Icon = categoryLineup
                    ? href === categoryHref
                      ? GitCompareArrows
                      : (categoryServiceIcons.get(href) ?? Headphones)
                    : (serviceIcons[index] ?? Headphones);
                  return (
                    <li key={item.title} className={styles.serviceCard}>
                      <Icon size={42} strokeWidth={1.5} aria-hidden="true" />
                      <h3>{item.title}</h3>
                      <p>{item.detail}</p>
                      {openDetails(item.title, item.href, () => setService(item))}
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
              <div className={styles.sectionHeading} data-scroll-reveal="">
                <h2 id="products-features-title">
                  {activeCategory
                    ? `รู้จัก${activeCategory.label} SUNFORD`
                    : "รู้จักผลิตภัณฑ์ SUNFORD"}
                </h2>
              </div>
              <Gallery
                id="products-features"
                label="เลื่อนเรื่องราวผลิตภัณฑ์"
                returnKey={railScope && `${railScope}.features`}
                prepareImages={categoryLineup}
              >
                {stories.map((item) => (
                  <li className={styles.storyCard} key={item.id}>
                    <div className={styles.storyCopy}>
                      {!categoryLineup && <p>SUNFORD</p>}
                      <h3>{item.title}</h3>
                      {categoryLineup && <p>{item.introduction}</p>}
                    </div>
                    <div className={styles.storyArt}>
                      <ProductImage
                        placeholder={categoryId ? "product" : "media"}
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(width < 48rem) 260px, 372px"
                      />
                    </div>
                    {openDetails(item.title, item.href, () => setStory(item))}
                  </li>
                ))}
              </Gallery>
            </section>

            {(!activeCategory || categoryLineup) && (
              <section
                className={`${styles.section} ${styles.essentials}`}
                aria-labelledby="products-essentials-title"
                data-overview-section="essentials"
              >
                <div className={styles.sectionHeading} data-scroll-reveal="">
                  <h2 id="products-essentials-title">สิ่งที่เติมเต็มการทำงาน</h2>
                  <Link href={sunford.accessories} className={styles.textLink}>
                    ดูอุปกรณ์เสริมทั้งหมด <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                </div>
                <Gallery
                  id="products-essentials"
                  label="เลื่อนอุปกรณ์และซอฟต์แวร์"
                  returnKey={railScope && `${railScope}.essentials`}
                  prepareImages={categoryLineup}
                >
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
                          sizes="(width < 48rem) 260px, 44vw"
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
              <div className={styles.sectionHeading} data-scroll-reveal="">
                <h2 id="products-accordion-title">
                  {activeCategory
                    ? `เลือก${activeCategory.label}ให้เหมาะกับงาน`
                    : "เมื่อทุกอย่างเชื่อมถึงกัน ธุรกิจก็ไปได้ไกลขึ้น"}
                </h2>
              </div>
              {categoryLineup ? (
                <div className={styles.ecosystem}>
                  {accordion.map((item, index) => (
                    <details
                      key={item.title}
                      name={`products-ecosystem-${categoryId}`}
                      open={index === 0}
                      data-return-scope={`products-ecosystem-${index}`}
                    >
                      <summary>
                        {item.title}
                        <ChevronDown size={22} aria-hidden="true" />
                      </summary>
                      <div className={styles.ecosystemContent}>
                        <div>{item.content}</div>
                        {item.image && (
                          <div className={styles.ecosystemArt}>
                            <ProductImage
                              src={item.image}
                              alt=""
                              fill
                              sizes="(width < 48rem) 80vw, 38vw"
                            />
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              ) : (
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
                            <ProductImage
                              placeholder={categoryId ? "product" : "media"}
                              src={item.image}
                              alt={item.title}
                              fill
                              sizes="80vw"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.accordionArt}>
                    <ProductImage
                      key={accordionIndex}
                      placeholder={categoryId ? "product" : "media"}
                      src={accordion[accordionIndex].image}
                      alt={accordion[accordionIndex].title}
                      fill
                      sizes="60vw"
                    />
                  </div>
                </div>
              )}
            </section>

            <section
              className={`${styles.section} ${styles.index}`}
              aria-labelledby="products-index-title"
              data-overview-section="index"
            >
              <div className={styles.sectionInner}>
                <h2 id="products-index-title" data-scroll-reveal="">
                  {activeCategory?.label ?? "ผลิตภัณฑ์"}
                </h2>
                <div className={styles.indexColumns}>
                  <div className={styles.indexPrimary}>
                    <p>{activeCategory ? `สำรวจ${activeCategory.label}` : "สำรวจผลิตภัณฑ์"}</p>
                    {scaleApplicationsHref ? (
                      <CatalogNavigationLink href={scaleApplicationsHref}>
                        เลือกเครื่องชั่งตามการใช้งาน
                      </CatalogNavigationLink>
                    ) : (
                      <button
                        disabled={!hydrated}
                        type="button"
                        onClick={() =>
                          activeCategory ? openCategory(activeCategory.id) : openFinder()
                        }
                      >
                        {activeCategory ? `ดู${activeCategory.label}ทั้งหมด` : "ดูสินค้าทั้งหมด"}
                      </button>
                    )}
                    {categoryLineup
                      ? chapterItems.map((item) =>
                          item.disabled ? (
                            <span key={item.id} aria-disabled="true">
                              {item.label}
                            </span>
                          ) : (
                            <Link
                              key={item.id}
                              href={item.href}
                              prefetch={false}
                              onNavigate={(event) => {
                                event.preventDefault();
                                openCategory(item.id, item.href);
                              }}
                            >
                              {item.label}
                            </Link>
                          ),
                        )
                      : categoryItems.map((category) => (
                          <button
                            disabled={!hydrated}
                            type="button"
                            key={category.id}
                            onClick={() => openCategory(category.id)}
                          >
                            {category.label}
                          </button>
                        ))}
                    {!scaleApplicationsHref && (
                      <button
                        disabled={!hydrated}
                        type="button"
                        className={styles.indexCompare}
                        onClick={compare}
                      >
                        เลือกสินค้าเพื่อเปรียบเทียบ
                      </button>
                    )}
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
        {additionalCategoryLinks.length > 0 && (
          <nav
            className={`${styles.sectionInner} ${directoryStyles.related}`}
            aria-label="หมวดสินค้าที่เกี่ยวข้อง"
          >
            {additionalCategoryLinks.map(({ href, label }) => link(href, label))}
          </nav>
        )}
        <ScrollReveal rootId="main-content" />
      </main>

      <footer id="contact" className="site-footer" data-products-footer inert={mobileMenu}>
        <div className="footer-surface">
          <div className="container footer-main">
            <div className="footer-brand">
              <Link href="/" className="footer-logo">
                <Image src={site.logo} alt={site.name} width={210} height={43} />
              </Link>
              <p className="footer-tagline">
                <strong>ความเที่ยงตรง ที่คุณวางใจ</strong>
                <span>Precision you can trust.</span>
              </p>
              <div className="footer-contact-list">
                <a href={site.phoneHref} className="footer-contact-row">
                  <span className="footer-contact-icon">
                    <Phone size={17} />
                  </span>
                  <span className="footer-contact-text">{site.phone}</span>
                </a>
                <a href={`mailto:${site.email}`} className="footer-contact-row">
                  <span className="footer-contact-icon">
                    <Mail size={17} />
                  </span>
                  <span className="footer-contact-text">{site.email}</span>
                </a>
                <Link href={sunford.contact} className="footer-contact-row footer-address">
                  <span className="footer-contact-icon">
                    <MapPin size={17} strokeWidth={1.8} />
                  </span>
                  <span className="footer-contact-text">
                    <strong>ศูนย์บริการลูกค้าซันฟอร์ด</strong>
                    <span>
                      99 หมู่ 9 ต.บางระกำ อ.บางเลน
                      <br />
                      จ.นครปฐม 73130
                    </span>
                  </span>
                </Link>
              </div>
              <nav className="footer-company" aria-label="SUNFORD">
                <Link href={sunford.about}>รู้จัก SUNFORD</Link>
                <Link href={sunford.contact}>ติดต่อเรา</Link>
              </nav>
              <div className="footer-socials" aria-label="ติดตาม Sunford">
                {site.messenger && (
                  <a
                    href={site.messenger}
                    className="footer-social-facebook"
                    aria-label="Facebook Messenger Sunford"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M14 22v-9h3l.5-3.5H14V7.3c0-1 .3-1.8 1.8-1.8h1.9V2.4a25 25 0 0 0-2.8-.2c-2.8 0-4.7 1.7-4.7 4.8v2.5H7V13h3.2v9Z"
                      />
                    </svg>
                  </a>
                )}
                <a
                  href={site.line}
                  className="footer-social-line"
                  aria-label="LINE Sunford"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Image src="/images/brands/line-brand-icon.png" alt="" width={25} height={25} />
                </a>
                <a
                  href="https://www.youtube.com/@sunfordthai1215"
                  className="footer-social-youtube"
                  aria-label="YouTube Sunford"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M21.6 6.5a2.7 2.7 0 0 0-1.9-1.9C18 4.2 12 4.2 12 4.2s-6 0-7.7.4a2.7 2.7 0 0 0-1.9 1.9A28 28 0 0 0 2 12a28 28 0 0 0 .4 5.5 2.7 2.7 0 0 0 1.9 1.9c1.7.4 7.7.4 7.7.4s6 0 7.7-.4a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-5.5ZM10 15.4l5.7-3.4L10 8.6v6.8Z"
                    />
                  </svg>
                </a>
                <a
                  href={sunford.website}
                  className="footer-social-website"
                  aria-label="เว็บไซต์ Sunford"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Globe size={20} />
                </a>
              </div>
            </div>
            {footerNavigation.map((group) => (
              <div className="footer-column" key={group.label}>
                <nav className="footer-links footer-desktop" aria-label={group.label}>
                  <h3>{group.label}</h3>
                  {group.links.map((entry) => (
                    <Link key={entry.href} href={entry.href}>
                      {entry.label}
                    </Link>
                  ))}
                </nav>
                <details className="footer-mobile" data-return-scope={`footer-${group.label}`}>
                  <summary>{group.label}</summary>
                  <nav className="footer-links" aria-label={group.label}>
                    {group.links.map((entry) => (
                      <Link key={entry.href} href={entry.href}>
                        {entry.label}
                      </Link>
                    ))}
                  </nav>
                </details>
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bottom-bar">
          <div className="container footer-bottom">
            <span>© {copyrightYear} SUNFORD. All rights reserved.</span>
            <nav className="footer-legal" aria-label="นโยบาย">
              {footerLegalLinks.map((entry) => (
                <Link key={entry.href} href={entry.href}>
                  {entry.label}
                </Link>
              ))}
            </nav>
            <a href="#main-content" data-back-to-top>
              กลับด้านบน <ArrowUp size={15} />
            </a>
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
              <ProductImage
                placeholder={categoryId ? "product" : "media"}
                src={story.image}
                alt={story.title}
                fill
                sizes="87vw"
              />
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
      {!scaleApplicationsHref && (
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
      )}
    </div>
  );
}
