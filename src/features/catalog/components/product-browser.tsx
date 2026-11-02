"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  FlaskConical,
  Grid2X2,
  GitCompareArrows,
  Headphones,
  List,
  Package,
  Scale,
  Search,
  Settings2,
  ShieldCheck,
  Star,
  Store,
  Warehouse,
} from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { CategoryBanner } from "./category-banner";
import { getBannerCategoryForPath, getCategoryBanner } from "../data/category-banners";
import { useCategories } from "@/features/cms/components/categories-provider";
import { useCatalogStore } from "@/stores/catalog-store";
import type { CatalogProduct, CatalogScope } from "../types";
import { CatalogProductCard, catalogProductPhoto } from "./catalog-product-card";
import { classifyProductTopics, topicGroups } from "../data/product-topics";
import styles from "./product-browser.module.css";

const categoryIcons = {
  commercial: Store,
  industrial: Warehouse,
  laboratory: FlaskConical,
  food: Scale,
  smart: Settings2,
};

export function ProductBrowser({
  products,
  scope,
}: {
  products: CatalogProduct[];
  scope?: CatalogScope;
}) {
  const categories = useCategories();
  const category = useCatalogStore((s) => s.category);
  const setCategory = useCatalogStore((s) => s.setCategory);
  const query = useCatalogStore((s) => s.query);
  const setQuery = useCatalogStore((s) => s.setQuery);
  const compareMode = useCatalogStore((s) => s.compareMode);
  const startCompare = useCatalogStore((s) => s.startCompare);
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("recommended");
  const [topic, setTopic] = useState("all");
  const [featured, setFeatured] = useState(false);
  const [limit, setLimit] = useState(24);
  const active = categories.find((c) => c.id === category);
  const inCategory = products.filter((p) => scope || category === "all" || p.category === category);
  const productTopics = new Map(products.map((p) => [p.id, p.topics ?? classifyProductTopics(p)]));
  const topicCounts = new Map(
    topicGroups.flatMap((group) =>
      group.topics.map(
        (item) =>
          [
            item.id,
            inCategory.filter(
              (p) => (!featured || p.featured) && productTopics.get(p.id)?.includes(item.id),
            ).length,
          ] as const,
      ),
    ),
  );
  const availableTopicGroups = topicGroups
    .map((group) => ({
      ...group,
      topics: group.topics.filter(
        (item) =>
          (!scope?.topicIds || scope.topicIds.includes(item.id)) &&
          (topicCounts.get(item.id) ?? 0) > 0,
      ),
    }))
    .filter((group) => group.topics.length > 0);
  const selectedTopic = availableTopicGroups.some((group) =>
    group.topics.some((item) => item.id === topic),
  )
    ? topic
    : "all";
  const activeTopic = availableTopicGroups
    .flatMap((group) => group.topics)
    .find((item) => item.id === selectedTopic);
  const matching = inCategory
    .filter(
      (p) =>
        (!featured || p.featured) &&
        (selectedTopic === "all" || productTopics.get(p.id)?.includes(selectedTopic)) &&
        `${p.name} ${p.subtitle} ${p.description}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name, "th", { numeric: true })
        : sort === "name-desc"
          ? b.name.localeCompare(a.name, "th", { numeric: true })
          : // The server supplies catalogue order; stable sorting preserves it within each group.
            Number(b.featured) - Number(a.featured),
    );
  const heroProduct =
    inCategory.find((p) => p.featured && p.image) ?? inCategory.find((p) => p.image);
  const title =
    scope?.title ??
    (category === "all" ? "ผลิตภัณฑ์ทั้งหมด" : (active?.label ?? "ผลิตภัณฑ์ทั้งหมด"));
  const bannerCategory = scope
    ? getBannerCategoryForPath(scope.currentPath)
    : category === "all"
      ? "commercial"
      : getCategoryBanner(category)?.category;
  const bannerBenefits = (
    <div className={styles.benefits}>
      <span>
        <ShieldCheck size={19} />
        {inCategory.length} ผลิตภัณฑ์
      </span>
      <span>
        <Settings2 size={19} />
        เปรียบเทียบได้ 3 รุ่น
      </span>
      <Link href="/service">
        <Headphones size={19} />
        บริการหลังการขาย
      </Link>
    </div>
  );
  const selectCategory = (id: string) => {
    setCategory(id);
    setFeatured(false);
    setTopic("all");
    setLimit(24);
  };
  return (
    <section
      className={styles.browser}
      id="products"
      data-page-surface="paper"
      aria-label="แคตตาล็อกสินค้า Sunford"
    >
      <aside className={styles.sidebar}>
        <nav className={styles.categories} aria-label="กรองหมวดหมู่สินค้า">
          {scope
            ? scope.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    link.href.toLowerCase() === scope.currentPath.toLowerCase() ? styles.active : ""
                  }
                  aria-current={
                    link.href.toLowerCase() === scope.currentPath.toLowerCase() ? "page" : undefined
                  }
                >
                  <Package size={14} />
                  <span>{link.label}</span>
                  <small>{link.count}</small>
                </Link>
              ))
            : categories
                .filter((c) => c.id !== "all")
                .map((c) => {
                  const Icon = categoryIcons[c.id as keyof typeof categoryIcons] ?? Package;
                  const count = products.filter((p) => p.category === c.id).length;
                  return (
                    <button
                      key={c.id}
                      className={category === c.id ? styles.active : ""}
                      aria-pressed={category === c.id}
                      onClick={() => selectCategory(c.id)}
                    >
                      <Icon size={18} strokeWidth={1.6} />
                      <span>{c.label}</span>
                      <small>{count}</small>
                    </button>
                  );
                })}
        </nav>
        <div className={styles.quickLinks}>
          {scope ? (
            <Link href={scope.rootHref}>
              <Grid2X2 size={16} />
              {scope.rootLabel}
            </Link>
          ) : (
            <button
              className={category === "all" && !featured ? styles.active : ""}
              aria-pressed={category === "all" && !featured}
              onClick={() => selectCategory("all")}
            >
              <Grid2X2 size={18} />
              สินค้าทั้งหมด<small>{products.length}</small>
            </button>
          )}
          <button
            className={featured ? styles.active : ""}
            aria-pressed={featured}
            onClick={() => {
              setFeatured(!featured);
              setLimit(24);
            }}
          >
            <Star size={18} />
            สินค้าแนะนำ
          </button>
          <button
            onClick={startCompare}
            aria-pressed={compareMode}
            className={compareMode ? styles.active : undefined}
          >
            <GitCompareArrows size={18} />
            เปรียบเทียบสินค้า
          </button>
        </div>
        <Link href="/contact-us" className={styles.promo}>
          <ProductImage
            src="/images/products/sunford-showroom-banner.png"
            alt="ผลิตภัณฑ์และโชว์รูม Sunford"
            fill
            sizes="240px"
          />
          <div>
            <strong>
              เครื่องชั่งที่ใช่
              <br />
              สำหรับธุรกิจของคุณ
            </strong>
            <span>ให้ทีม Sunford ช่วยคุณเลือก</span>
            <b>
              ดูเพิ่มเติม <ArrowRight size={15} />
            </b>
          </div>
        </Link>
        <Link className={styles.contact} href="/contact-us">
          <Headphones size={23} />
          <span>
            <strong>ติดต่อเรา</strong>
            <small>สอบถามสินค้า / ขอใบเสนอราคา</small>
          </span>
          <ArrowRight size={17} />
        </Link>
      </aside>
      <div className={styles.content}>
        {bannerCategory ? (
          <CategoryBanner
            category={bannerCategory}
            title={title}
            description={
              !scope && category === "all"
                ? "เครื่องชั่งดิจิทัลและโซลูชันธุรกิจ พร้อมบริการหลังการขาย"
                : heroProduct?.subtitle
            }
          >
            {bannerBenefits}
          </CategoryBanner>
        ) : (
          <header className={styles.banner}>
            <div className={styles.bannerCopy}>
              <span className={styles.brand}>SUNFORD</span>
              <h1>{title}</h1>
              <p>
                {!scope && category === "all"
                  ? "เครื่องชั่งดิจิทัลและโซลูชันธุรกิจ พร้อมบริการหลังการขาย"
                  : heroProduct?.subtitle}
              </p>
              {bannerBenefits}
            </div>
            {heroProduct && (
              <div className={styles.heroImage}>
                <ProductImage
                  src={catalogProductPhoto(heroProduct)}
                  alt={`SUNFORD ${heroProduct.name}`}
                  fill
                  sizes="(max-width: 600px) 40vw, 450px"
                />
              </div>
            )}
          </header>
        )}
        <div className={styles.toolbar}>
          <p aria-live="polite">{matching.length} รายการ</p>
          <label className={styles.search}>
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(24);
              }}
              placeholder="ค้นหารุ่นสินค้า"
              aria-label="ค้นหารุ่นสินค้า"
            />
          </label>
          <div className={styles.views}>
            <button
              aria-label="แสดงแบบตาราง"
              aria-pressed={mode === "grid"}
              onClick={() => setMode("grid")}
            >
              <Grid2X2 size={18} />
            </button>
            <button
              aria-label="แสดงแบบรายการ"
              aria-pressed={mode === "list"}
              onClick={() => setMode("list")}
            >
              <List size={19} />
            </button>
          </div>
          <select
            className={styles.topicSelect}
            aria-label="เลือกตามหัวข้อ"
            value={selectedTopic}
            onChange={(e) => {
              setTopic(e.target.value);
              setLimit(24);
            }}
          >
            <option value="all">
              {scope || category !== "all" ? "หัวข้อในหมวดนี้" : "หัวข้อทั้งหมด"}
            </option>
            {availableTopicGroups.map((group) => (
              <optgroup label={group.label} key={group.label}>
                {group.topics.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} ({topicCounts.get(item.id)})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <select
            aria-label="เรียงลำดับสินค้า"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recommended">เรียงตาม: แนะนำ</option>
            <option value="name">ชื่อรุ่น: A–Z</option>
            <option value="name-desc">ชื่อรุ่น: Z–A</option>
          </select>
        </div>
        {activeTopic && (
          <div className={styles.topicSummary}>
            <span>
              หัวข้อ: <strong>{activeTopic.label}</strong> · แสดงจากคุณสมบัติและหมวดสินค้าที่ระบุไว้
            </span>
            <Link href={activeTopic.href}>
              อ่านข้อมูลที่เกี่ยวข้อง <ArrowRight size={14} />
            </Link>
            <button
              onClick={() => {
                setTopic("all");
                setLimit(24);
              }}
            >
              ล้างหัวข้อ
            </button>
          </div>
        )}
        <div className={`${styles.grid} ${mode === "list" ? styles.list : ""}`} aria-live="polite">
          {matching.slice(0, limit).map((product) => (
            <CatalogProductCard
              key={product.id}
              product={product}
              categoryLabel={scope?.title}
              headingLevel={2}
            />
          ))}
        </div>
        {!matching.length && (
          <div className={styles.empty}>
            <Search size={30} />
            <h2>ยังไม่พบสินค้าที่คุณค้นหา</h2>
            <p>ลองค้นหาชื่อรุ่นอื่น หรือเลือกหมวดหมู่อื่น</p>
            <button
              onClick={() => {
                selectCategory("all");
                setQuery("");
                setTopic("all");
              }}
            >
              ดูสินค้าทั้งหมด
            </button>
          </div>
        )}
        {matching.length > limit && (
          <button className={styles.more} onClick={() => setLimit(limit + 24)}>
            ดูเพิ่มเติม ({Math.min(limit, matching.length)} / {matching.length})
          </button>
        )}
      </div>
    </section>
  );
}
