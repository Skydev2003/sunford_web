"use client";
import { useReturnState } from "@/features/site/history/return-state";

import { Suspense, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, GitCompareArrows, Package, Search } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { useScrollReveal } from "@/components/ui/scroll-reveal";
import { useCatalogStore } from "@/stores/catalog-store";
import type { ClientProduct } from "../types";
import { formatCatalogCardPrice } from "../data/price-format";
import { ProductCardHighlight } from "./product-card-highlight";
import { catalogImageLeadMargin, prepareCardImage } from "./catalog-image-preparation";
import type { ProductCategory } from "../data/mock-categories";
import { getProductSubcategoryPage } from "../data/product-subcategory-pages";
import { catalogModelLabel } from "../data/catalog-card-names";
import type { ProductListingFeature } from "../data/product-listing-features";
import { CatalogProductCard, catalogProductPhoto } from "./catalog-product-card";
import { CatalogSearchField } from "./catalog-search-field";
import { useListingSearch } from "./product-subcategory-shell";
import cardStyles from "./product-browser.module.css";
import styles from "./product-category-mock.module.css";
import { SegmentedFilter } from "./segmented-filter";

function CatalogCategoryUrlSync({
  categories,
  onSelect,
  categoryId,
  subcategoryId,
}: {
  categories: ProductCategory[];
  onSelect: (id: string, childId?: string) => void;
  categoryId?: string;
  subcategoryId?: string;
}) {
  const searchParams = useSearchParams();
  const requestedCategory = searchParams.get("category");
  const requestedSubcategory = searchParams.get("subcategory");
  useEffect(() => {
    const parent = categories.find((item) => item.id === (categoryId ?? requestedCategory));
    const child = parent?.subcategories.find(
      (item) => item.id === (subcategoryId ?? requestedSubcategory),
    );
    onSelect(parent?.id ?? "all", child?.id ?? "all");
  }, [requestedCategory, requestedSubcategory, categories, onSelect, categoryId, subcategoryId]);
  return null;
}

export function ProductCategoryMock({
  products,
  categories,
  cardNames,
  presentation = "overview",
  categoryId,
  subcategoryId,
  imagePreviews,
  listingFeatures,
  initialFeature,
}: {
  products: ClientProduct[];
  categories: ProductCategory[];
  cardNames: Record<string, string>;
  presentation?: "overview" | "finder" | "category" | "listing";
  categoryId?: string;
  subcategoryId?: string;
  imagePreviews?: Record<string, string>;
  listingFeatures?: ProductListingFeature[];
  initialFeature?: string;
}) {
  const [savedCategory, setCategory] = useReturnState(
    "product-category-mock.category",
    categoryId ?? "all",
  );
  const [savedSubcategory, setSubcategory] = useReturnState(
    "product-category-mock.subcategory",
    subcategoryId ?? "all",
  );
  const category = categoryId ?? savedCategory;
  const subcategory = subcategoryId ?? savedSubcategory;
  const [pagination, setPagination] = useReturnState("product-category-mock.pagination", {
    key: "",
    limit: 24,
  });
  const subcategoryTrack = useRef<HTMLDivElement>(null);
  const categoryTrack = useRef<HTMLElement>(null);
  const showcaseTrack = useRef<HTMLUListElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const listing = useRef<HTMLElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const gridReveal = presentation === "listing" || presentation === "category";
  useScrollReveal(listing, { grid: true, selector: "#mock-product-results > article" });
  const subcategoryScrollTarget = useRef<{ track: HTMLDivElement; left: number } | null>(null);
  const catalogQuery = useCatalogStore((state) => state.query);
  const setCatalogQuery = useCatalogStore((state) => state.setQuery);
  const listingSearch = useListingSearch();
  const [selectedFeatures, setSelectedFeatures] = useReturnState<string[]>(
    "product-category-mock.listingFeatures",
    initialFeature ? [initialFeature] : [],
  );
  const activeFeatures = listingFeatures?.filter(({ id }) => selectedFeatures.includes(id)) ?? [];
  const clearLinkedFeature = () => {
    if (!initialFeature) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("feature") !== initialFeature) return;
    url.searchParams.delete("feature");
    window.history.replaceState(null, "", url);
  };
  const toggleListingFeature = ({ id, exclusive }: ProductListingFeature) => {
    if (selectedFeatures.includes(id)) {
      setSelectedFeatures(selectedFeatures.filter((feature) => feature !== id));
      if (id === initialFeature) clearLinkedFeature();
      return;
    }
    const retained = exclusive
      ? activeFeatures.filter((feature) => !feature.exclusive).map((feature) => feature.id)
      : selectedFeatures;
    setSelectedFeatures([...retained, id]);
  };
  const query = listingSearch?.query ?? catalogQuery;
  const setQuery = listingSearch?.setQuery ?? setCatalogQuery;
  const compareMode = useCatalogStore((state) => state.compareMode);
  const startCompare = useCatalogStore((state) => state.startCompare);
  const activeCategory = categories.find((item) => item.id === category);
  const activeSubcategory = activeCategory?.subcategories.find((item) => item.id === subcategory);
  const selectedIds = activeCategory
    ? new Set(activeSubcategory?.productIds ?? activeCategory.productIds)
    : undefined;
  const normalizedQuery = query.trim().toLowerCase();
  const productsById = new Map(products.map((product) => [product.id, product]));
  const showcaseProducts = products
    .filter((product) => product.featured && product.image)
    .slice(0, 2);
  const missingModels =
    !activeSubcategory &&
    (activeCategory?.id === "scales" ||
      activeCategory?.id === "platforms" ||
      activeCategory?.id === "indicators" ||
      activeCategory?.id === "accessories")
      ? [
          ...new Map(
            activeCategory.subcategories
              .flatMap((child) => child.entries ?? [])
              .filter((entry) => !entry.productId)
              .map((entry) => [entry.model, entry]),
          ).values(),
        ]
      : [];
  const entries: { model: string; product?: ClientProduct }[] = activeSubcategory?.entries
    ? activeSubcategory.entries.map((entry) => ({
        model: catalogModelLabel(entry.model),
        product: productsById.get(entry.productId ?? ""),
      }))
    : [
        ...products
          .filter((product) => !selectedIds || selectedIds.has(product.id))
          .map((product) => ({ model: cardNames[product.id] ?? product.name, product })),
        ...missingModels.map((entry) => ({ model: entry.model })),
      ];
  const matching = entries
    .filter(({ product }) =>
      activeFeatures.every(({ productIds }) => Boolean(product && productIds.includes(product.id))),
    )
    .filter(({ model, product }) =>
      `${model} ${product?.warehouseSku ?? ""} ${product?.name ?? ""} ${product?.warehouseName ?? ""} ${product?.subtitle ?? ""} ${product?.description ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery),
    )
    .sort((a, b) =>
      activeSubcategory?.entries
        ? 0
        : Number(Boolean(b.product?.featured)) - Number(Boolean(a.product?.featured)),
    );
  const realCount = matching.filter((entry) => entry.product).length;
  const mockCount = matching.length - realCount;
  const filterKey = `${category}:${subcategory}:${activeFeatures.map(({ id }) => id).join(",")}:${normalizedQuery}:${listingSearch?.revision ?? 0}`;
  const limit = pagination.key === filterKey ? pagination.limit : 24;
  useEffect(() => {
    const grid = results.current;
    if (!gridReveal || !grid || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (!isIntersecting) continue;
          prepareCardImage(target);
          observer.unobserve(target);
        }
      },
      { rootMargin: catalogImageLeadMargin() },
    );
    for (const card of grid.children) observer.observe(card);
    return () => observer.disconnect();
  }, [gridReveal, filterKey, limit, products]);
  const applyCategory = useCallback(
    (id: string, childId = "all") => {
      subcategoryScrollTarget.current = null;
      const parent = categoryId ?? id;
      const child = subcategoryId ?? childId;
      setCategory(parent);
      setSubcategory(child);
      setPagination((previous) =>
        previous.key.startsWith(`${parent}:${child}:`) ? previous : { key: "", limit: 24 },
      );
    },
    [categoryId, subcategoryId, setCategory, setSubcategory, setPagination],
  );
  const selectCategory = (id: string) => {
    applyCategory(id);
    const url = new URL(window.location.href);
    if (categoryId || id === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", id);
    url.searchParams.delete("subcategory");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };
  const selectSubcategory = (id: string) => {
    setSubcategory(id);
    setPagination({ key: "", limit: 24 });
    const url = new URL(window.location.href);
    if (id === "all") url.searchParams.delete("subcategory");
    else url.searchParams.set("subcategory", id);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };
  const scrollSubcategories = (direction: number) => {
    const track = subcategoryTrack.current;
    const buttons = [...(track?.querySelectorAll<HTMLButtonElement>("button[aria-pressed]") ?? [])];
    if (!track || !buttons.length) return;
    const sign = getComputedStyle(track).direction === "rtl" ? -1 : 1;
    const first = buttons[0];
    const origin = first.offsetLeft + (sign < 0 ? first.offsetWidth : 0);
    const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
    const positions = [
      ...new Set([
        0,
        ...buttons.map((button) => {
          const edge = button.offsetLeft + (sign < 0 ? button.offsetWidth : 0);
          return Math.min(maximum, Math.max(0, (edge - origin) * sign));
        }),
        maximum,
      ]),
    ];
    const pending = subcategoryScrollTarget.current;
    const current = Math.min(
      maximum,
      (pending?.track === track ? pending.left : track.scrollLeft) * sign,
    );
    const offset =
      direction * sign > 0
        ? (positions.find((position) => position > current + 1) ?? maximum)
        : (positions.findLast((position) => position < current - 1) ?? 0);
    const left = offset * sign;
    subcategoryScrollTarget.current = { track, left };
    track.scrollTo({
      left,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  const scrollGallery = (track: HTMLElement | null, direction: number) => {
    track?.scrollBy({
      left: direction * track.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  return (
    <section
      ref={gridReveal ? listing : undefined}
      data-scroll-reveal-listing={gridReveal ? "" : undefined}
      id="products"
      className={`${styles.browser} ${presentation === "finder" ? styles.embedded : ""} ${presentation === "category" ? styles.categoryPage : ""}`}
      data-page-surface={presentation === "overview" ? "paper" : undefined}
      aria-label="แคตตาล็อกสินค้า Sunford"
    >
      <Suspense fallback={null}>
        <CatalogCategoryUrlSync
          categories={categories}
          onSelect={applyCategory}
          categoryId={categoryId}
          subcategoryId={subcategoryId}
        />
      </Suspense>
      {presentation !== "finder" && presentation !== "listing" && (
        <header className={styles.heading}>
          <h1>{presentation === "category" ? activeCategory?.label : "ผลิตภัณฑ์ทั้งหมด"}</h1>
          {presentation === "category" ? (
            <Link href="/products?catalog=all" className={styles.all}>
              สินค้าทั้งหมด
            </Link>
          ) : (
            <a
              href="#catalog-search"
              className={styles.searchShortcut}
              onClick={(event) => {
                event.preventDefault();
                searchInput.current?.focus();
              }}
            >
              <Search size={19} aria-hidden="true" />
              ค้นหารุ่นสินค้า
            </a>
          )}
        </header>
      )}

      {presentation !== "listing" && (
        <CatalogSearchField
          inputRef={searchInput}
          value={query}
          onChange={(value) => {
            setQuery(value);
            setPagination({ key: "", limit: 24 });
          }}
        />
      )}

      {presentation !== "category" && presentation !== "listing" && (
        <div className={styles.categoryRail}>
          <p className={styles.selectionLabel}>ยังไม่ทราบรุ่น เลือกจากหมวดสินค้า</p>
          <nav
            ref={categoryTrack}
            id="catalog-categories"
            className={styles.categories}
            aria-label="หมวดหมู่สินค้า"
          >
            {categories.map((item) => {
              const members = item.productIds
                .map((id) => productsById.get(id))
                .filter((product) => product?.image);
              const photo = members.find((product) => product?.featured) ?? members[0];
              return (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={category === item.id}
                  aria-controls="mock-product-results"
                  aria-label={item.label}
                  onFocus={(event) => {
                    if (event.currentTarget.matches(":focus-visible")) {
                      event.currentTarget.scrollIntoView({
                        block: "nearest",
                        inline: "nearest",
                        behavior: "instant",
                      });
                    }
                  }}
                  onClick={() => selectCategory(item.id)}
                >
                  <span className={styles.categoryArt}>
                    <ProductImage
                      placeholder="product"
                      src={photo ? catalogProductPhoto(photo) : undefined}
                      fallbackSrc={photo?.fallbackImage}
                      alt=""
                      fill
                      sizes="160px"
                    />
                  </span>
                  <strong>{item.label}</strong>
                </button>
              );
            })}
          </nav>
          <div className={styles.categoryControls} role="group" aria-label="เลื่อนหมวดหมู่สินค้า">
            <button
              type="button"
              aria-label="หมวดหมู่สินค้าก่อนหน้า"
              aria-controls="catalog-categories"
              onClick={() => scrollGallery(categoryTrack.current, -1)}
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="หมวดหมู่สินค้าถัดไป"
              aria-controls="catalog-categories"
              onClick={() => scrollGallery(categoryTrack.current, 1)}
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {presentation === "overview" && showcaseProducts.length > 0 && (
        <div className={styles.showcase} role="group" aria-label="สินค้าเด่น">
          <ul ref={showcaseTrack} id="catalog-showcase" className={styles.showcaseTrack}>
            {showcaseProducts.map((product, index) => (
              <li key={product.id} className={styles.showcaseSlide}>
                <Link
                  href={`/products/${product.slug}`}
                  className={styles.showcaseCard}
                  aria-label={`ดูรายละเอียด ${cardNames[product.id] ?? product.name}`}
                >
                  <div className={styles.showcaseCopy}>
                    <p className={styles.showcaseName}>{cardNames[product.id] ?? product.name}</p>
                    <ProductCardHighlight text={product.highlight} />
                    <p>{formatCatalogCardPrice(product.price)}</p>
                  </div>
                  <div className={styles.showcaseArt}>
                    <ProductImage
                      placeholder="product"
                      src={catalogProductPhoto(product)}
                      fallbackSrc={product.fallbackImage}
                      alt={`SUNFORD ${cardNames[product.id] ?? product.name}`}
                      fill
                      preload={index === 0}
                      sizes="(width < 48rem) 80vw, (width < 80rem) 65vw, 700px"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {showcaseProducts.length > 1 && (
            <div className={styles.galleryControls} role="group" aria-label="เลื่อนสินค้าเด่น">
              <button
                type="button"
                aria-label="สินค้าเด่นก่อนหน้า"
                aria-controls="catalog-showcase"
                onClick={() => scrollGallery(showcaseTrack.current, -1)}
              >
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="สินค้าเด่นถัดไป"
                aria-controls="catalog-showcase"
                onClick={() => scrollGallery(showcaseTrack.current, 1)}
              >
                <ChevronRight size={22} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}

      <div id="catalog-finder" className={styles.finder}>
        {presentation !== "category" && presentation !== "listing" && (
          <div className={styles.finderHeading}>
            <h2>{activeCategory?.label ?? "ผลิตภัณฑ์ทั้งหมด"}</h2>
          </div>
        )}
        {presentation !== "listing" && (
          <>
            {activeCategory && <p className={styles.selectionLabel}>เลือกประเภทสินค้า</p>}
            <div className={styles.selection}>
              <div className={styles.subcategoryScroller}>
                {activeCategory && (
                  <button
                    type="button"
                    className={styles.subcategoryArrow}
                    aria-label="เลื่อนหมวดย่อยไปทางซ้าย"
                    aria-controls="catalog-subcategory-options"
                    onClick={() => scrollSubcategories(-1)}
                  >
                    <ChevronLeft size={20} aria-hidden="true" />
                  </button>
                )}
                <div
                  key={category}
                  ref={subcategoryTrack}
                  id="catalog-subcategory-options"
                  className={styles.subcategories}
                  role="group"
                  aria-label="หมวดหมู่ย่อยสินค้า"
                  onPointerDown={() => {
                    subcategoryScrollTarget.current = null;
                  }}
                  onWheel={() => {
                    subcategoryScrollTarget.current = null;
                  }}
                  onScroll={(event) => {
                    const track = event.currentTarget;
                    const pending = subcategoryScrollTarget.current;
                    if (pending?.track === track && Math.abs(track.scrollLeft - pending.left) < 1)
                      subcategoryScrollTarget.current = null;
                  }}
                >
                  <SegmentedFilter value={subcategory}>
                    <button
                      type="button"
                      aria-pressed={subcategory === "all"}
                      onClick={() => selectSubcategory("all")}
                    >
                      ทั้งหมด
                    </button>
                    {activeCategory?.subcategories.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        aria-pressed={subcategory === item.id}
                        onClick={() => selectSubcategory(item.id)}
                      >
                        {category === "scales"
                          ? item.label.replace(/^เครื่องชั่ง/, "")
                          : item.label}
                      </button>
                    ))}
                  </SegmentedFilter>
                </div>
                {activeCategory && (
                  <button
                    type="button"
                    className={styles.subcategoryArrow}
                    aria-label="เลื่อนหมวดย่อยไปทางขวา"
                    aria-controls="catalog-subcategory-options"
                    onClick={() => scrollSubcategories(1)}
                  >
                    <ChevronRight size={20} aria-hidden="true" />
                  </button>
                )}
              </div>
              {presentation !== "category" && (
                <button
                  type="button"
                  className={styles.all}
                  aria-pressed={category === "all"}
                  onClick={() => selectCategory("all")}
                >
                  ดูสินค้าทั้งหมด
                </button>
              )}
            </div>
          </>
        )}
        <div className={`${styles.toolbar} ${listingFeatures ? styles.toolbarWithFeatures : ""}`}>
          {!!listingFeatures?.length && (
            <div className={styles.featureFilters} role="group" aria-label="กรองตามคุณสมบัติ">
              {listingFeatures.map((feature) => (
                <button
                  key={feature.id}
                  type="button"
                  aria-pressed={selectedFeatures.includes(feature.id)}
                  onClick={() => toggleListingFeature(feature)}
                >
                  {feature.label}
                </button>
              ))}
            </div>
          )}
          <p role="status" className={listingFeatures ? styles.visuallyHiddenCount : styles.count}>
            {realCount} รายการ{mockCount > 0 && ` · ${mockCount} รุ่นตัวอย่าง (Mock)`}
          </p>
          <div className={styles.tools} role="group" aria-label="เครื่องมือรายการสินค้า">
            <button type="button" aria-pressed={compareMode} onClick={startCompare}>
              <GitCompareArrows size={17} aria-hidden="true" />
              เลือกสินค้าเพื่อเปรียบเทียบ
            </button>
          </div>
          {compareMode && (
            <p className={styles.compareHint}>เลือกได้สูงสุด 3 รุ่น จากนั้นกดดูการเปรียบเทียบ</p>
          )}
        </div>

        <div
          ref={results}
          id="mock-product-results"
          className={gridReveal ? styles.directoryGrid : styles.grid}
          aria-label="รายการสินค้า"
        >
          {matching.slice(0, limit).map(({ product, model }, index) =>
            product ? (
              <CatalogProductCard
                returnContext={
                  presentation === "listing"
                    ? getProductSubcategoryPage(subcategoryId, categoryId)?.returnContext
                    : undefined
                }
                key={`${product.id}:${model}`}
                categoryLift={gridReveal}
                directory={gridReveal}
                prioritizeImage={presentation === "listing" && index < 6}
                preloadImageMedia={
                  presentation === "listing" &&
                  subcategoryId === "scale-kitchen" &&
                  index === 0 &&
                  !normalizedQuery
                    ? "(min-width: 375px) and (min-height: 800px)"
                    : undefined
                }
                imageBlurDataURL={imagePreviews?.[product.image]}
                product={{ ...product, name: product.warehouseSku ? product.name : model }}
              />
            ) : (
              <article
                key={`mock:${model}`}
                className={`${cardStyles.card} ${styles.mockCard}`}
                data-mock-product="true"
              >
                <div className={styles.mockArt}>
                  <Package size={54} strokeWidth={1.2} aria-hidden="true" />
                  <span className={styles.mockBadge}>Mock</span>
                </div>
                <h3>{model}</h3>
              </article>
            ),
          )}
        </div>
        {!matching.length && (
          <div className={styles.empty}>
            <Search size={30} aria-hidden="true" />
            <h3>ยังไม่พบสินค้าที่คุณค้นหา</h3>
            <p>ลองค้นหาชื่อรุ่นอื่น หรือเลือกดูสินค้าทั้งหมด</p>
            <button
              type="button"
              onClick={() => {
                selectCategory("all");
                if (activeFeatures.length) {
                  setSelectedFeatures([]);
                  clearLinkedFeature();
                }
                setQuery("");
              }}
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
        {matching.length > limit && (
          <button
            type="button"
            className={styles.more}
            onClick={() => setPagination({ key: filterKey, limit: limit + 24 })}
          >
            ดูเพิ่มเติม ({Math.min(limit, matching.length)} / {matching.length})
          </button>
        )}
      </div>
    </section>
  );
}
