"use client";

import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  GitCompareArrows,
  Grid2X2,
  List,
  Package,
  Search,
  Star,
} from "lucide-react";
import { CategoryFeatureIcon } from "@/features/home/components/category-feature-icons";
import { ProductImage } from "@/components/ui/product-image";
import { useCatalogStore } from "@/stores/catalog-store";
import type { ClientProduct } from "../types";
import { getCatalogDecisionFacts } from "../data/catalog-decision-facts";
import type { ProductCategory } from "../data/mock-categories";
import { getProductSubcategoryPage } from "../data/product-subcategory-pages";
import { catalogModelLabel } from "../data/catalog-card-names";
import { CatalogProductCard, catalogProductPhoto } from "./catalog-product-card";
import cardStyles from "./product-browser.module.css";
import styles from "./product-category-mock.module.css";

const categoryIcons: Record<string, ReactNode> = {
  scales: <CategoryFeatureIcon category="scales" />,
  indicators: <CategoryFeatureIcon category="indicators" />,
  platforms: <CategoryFeatureIcon category="platforms" />,
  accessories: <CategoryFeatureIcon category="accessories" />,
  pos: (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="4" width="20" height="15" rx="2" />
      <path d="M7 8h12v7H7zM12 19v5l-4 4h13M17 19l3 9" />
      <rect x="24" y="17" width="5" height="11" rx="1" />
      <path d="M26 20h1m-1 4h1" />
    </svg>
  ),
};

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
}: {
  products: ClientProduct[];
  categories: ProductCategory[];
  cardNames: Record<string, string>;
  presentation?: "overview" | "finder" | "category" | "listing";
  categoryId?: string;
  subcategoryId?: string;
}) {
  const [category, setCategory] = useState(categoryId ?? "all");
  const [subcategory, setSubcategory] = useState(subcategoryId ?? "all");
  const [featured, setFeatured] = useState(false);
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const [pagination, setPagination] = useState({ key: "", limit: 24 });
  const subcategoryTrack = useRef<HTMLDivElement>(null);
  const categoryTrack = useRef<HTMLElement>(null);
  const showcaseTrack = useRef<HTMLUListElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const subcategoryScrollTarget = useRef<{ track: HTMLDivElement; left: number } | null>(null);
  const catalogQuery = useCatalogStore((state) => state.query);
  const setCatalogQuery = useCatalogStore((state) => state.setQuery);
  const [listingQuery, setListingQuery] = useState("");
  const query = presentation === "listing" ? listingQuery : catalogQuery;
  const setQuery = presentation === "listing" ? setListingQuery : setCatalogQuery;
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
    .filter(
      ({ model, product }) =>
        (!featured || product?.featured) &&
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
  const filterKey = `${category}:${subcategory}:${normalizedQuery}:${featured}`;
  const limit = pagination.key === filterKey ? pagination.limit : 24;
  const applyCategory = useCallback(
    (id: string, childId = "all") => {
      subcategoryScrollTarget.current = null;
      setCategory(categoryId ?? id);
      setSubcategory(subcategoryId ?? childId);
      setPagination({ key: "", limit: 24 });
    },
    [categoryId, subcategoryId],
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
    if (!track) return;
    const buttons = Array.from(track.children) as HTMLElement[];
    const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
    const positions = [
      ...new Set([
        0,
        ...buttons.map((button) => Math.min(maximum, button.offsetLeft - buttons[0].offsetLeft)),
        maximum,
      ]),
    ];
    const pending = subcategoryScrollTarget.current;
    const current = Math.min(maximum, pending?.track === track ? pending.left : track.scrollLeft);
    const left =
      direction > 0
        ? (positions.find((position) => position > current + 1) ?? maximum)
        : (positions.findLast((position) => position < current - 1) ?? 0);
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

      <div className={styles.entrySearch}>
        <label className={styles.searchField}>
          <span className={styles.selectionLabel}>ค้นหารุ่นสินค้า</span>
          <span className={styles.search}>
            <Search size={21} aria-hidden="true" />
            <input
              ref={searchInput}
              id="catalog-search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPagination({ key: "", limit: 24 });
              }}
              placeholder="พิมพ์ชื่อรุ่นที่ต้องการ"
              aria-label="ค้นหารุ่นสินค้า"
            />
          </span>
        </label>
      </div>

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
                    {photo ? (
                      <ProductImage
                        src={catalogProductPhoto(photo)}
                        fallbackSrc={photo.fallbackImage}
                        alt=""
                        fill
                        sizes="160px"
                      />
                    ) : (
                      (categoryIcons[item.id] ?? (
                        <Package size={32} strokeWidth={1.4} aria-hidden="true" />
                      ))
                    )}
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
                    <span className={styles.showcaseCta}>ดูรายละเอียด</span>
                  </div>
                  <div className={styles.showcaseArt}>
                    <ProductImage
                      src={catalogProductPhoto(product)}
                      fallbackSrc={product.fallbackImage}
                      alt={`SUNFORD ${cardNames[product.id] ?? product.name}`}
                      fill
                      preload={index === 0}
                      sizes="(max-width: 699px) 80vw, (max-width: 1099px) 65vw, 700px"
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
                  onScroll={(event) => {
                    const track = event.currentTarget;
                    const pending = subcategoryScrollTarget.current;
                    if (pending?.track === track && Math.abs(track.scrollLeft - pending.left) < 1)
                      subcategoryScrollTarget.current = null;
                  }}
                >
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
                      {category === "scales" ? item.label.replace(/^เครื่องชั่ง/, "") : item.label}
                    </button>
                  ))}
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
        <div className={styles.toolbar}>
          <p role="status" className={styles.count}>
            {realCount} รายการ{mockCount > 0 && ` · ${mockCount} รุ่นตัวอย่าง (Mock)`}
          </p>
          <div className={styles.tools} role="group" aria-label="เครื่องมือรายการสินค้า">
            <button
              type="button"
              aria-pressed={featured}
              onClick={() => {
                setFeatured(!featured);
                setPagination({ key: "", limit: 24 });
              }}
            >
              <Star size={17} aria-hidden="true" />
              สินค้าแนะนำ
            </button>
            <button type="button" aria-pressed={compareMode} onClick={startCompare}>
              <GitCompareArrows size={17} aria-hidden="true" />
              เลือกสินค้าเพื่อเปรียบเทียบ
            </button>
            <div className={styles.views} role="group" aria-label="รูปแบบรายการสินค้า">
              <button
                type="button"
                aria-label="แสดงแบบตาราง"
                aria-pressed={mode === "grid"}
                onClick={() => setMode("grid")}
              >
                <Grid2X2 size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="แสดงแบบรายการ"
                aria-pressed={mode === "list"}
                onClick={() => setMode("list")}
              >
                <List size={19} aria-hidden="true" />
              </button>
            </div>
          </div>
          {compareMode && (
            <p className={styles.compareHint}>เลือกได้สูงสุด 3 รุ่น จากนั้นกดดูการเปรียบเทียบ</p>
          )}
        </div>

        <div
          id="mock-product-results"
          className={`${styles.grid} ${mode === "list" ? `${styles.list} ${cardStyles.list}` : ""}`}
          aria-label="รายการสินค้า"
        >
          {matching.slice(0, limit).map(({ product, model }) =>
            product ? (
              <CatalogProductCard
                returnContext={
                  presentation === "listing"
                    ? getProductSubcategoryPage(subcategoryId, categoryId)?.returnContext
                    : undefined
                }
                key={`${product.id}:${model}`}
                modelOnly
                product={{ ...product, name: product.warehouseSku ? product.name : model }}
                decisionFacts={getCatalogDecisionFacts(
                  product,
                  activeCategory ?? categories.find((item) => item.productIds.includes(product.id)),
                )}
                categoryLabel={
                  activeCategory?.label ??
                  categories.find((item) => item.productIds.includes(product.id))?.label
                }
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
                setQuery("");
                setFeatured(false);
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
