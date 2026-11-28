import styles from "./product-detail.module.css";
import { Suspense } from "react";
import { ProductReturnLink } from "@/features/catalog/components/product-return-link";
import { relatedProducts } from "@/features/catalog/data/related-products";
import { catalogProductGroup } from "@/features/catalog/data/catalog-supplements";
import { productCategoryDefinitions } from "@/features/catalog/data/mock-categories";
import { productCategorySlugs } from "@/features/catalog/data/category-paths";
import { findCatalogProduct, productPrimaryCategory } from "@/features/catalog/data/product-lookup";
import { mesSlug } from "@/features/content/data/mes-paths";
import { buyingGuideHref, buyingGuides } from "@/features/content/data/buying-guides";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { ProductDetailCompare, ReadabilityHelp } from "./product-detail-compare";
import { clientProductData, productCardData } from "@/features/catalog/data/client-products";
import { pricedProducts } from "@/features/catalog/data/quotation";
import { catalogFieldValue } from "@/features/catalog/data/catalog-decision-facts";
import { ProductImage } from "@/components/ui/product-image";
import {
  getProduct,
  getProducts,
  getStorefrontProducts,
} from "@/features/catalog/server/product-repository";
import { getSettings } from "@/features/site/server/documents";
import { defaultSite } from "@/features/site/data/settings";
import { catalogCardName } from "@/features/catalog/data/catalog-card-names";
import { formatBaht } from "@/features/catalog/data/price-format";
import { ProductCardCaption } from "@/features/catalog/components/product-card-caption";
import { getSourceProduct } from "@/features/content/server/content-repository";
import { ProductGallery } from "@/features/catalog/components/product-gallery";
import { getSnapshotProducts } from "@/features/content/data/catalog-snapshot";
import { productPresentation } from "@/features/catalog/data/product-presentation";
import {
  mergeProductContentRows,
  productContentRows,
} from "@/features/catalog/data/product-content";
import { groupProductDetails } from "@/features/catalog/data/product-detail-groups";
import { productSummary } from "@/features/catalog/data/product-summary";
import {
  getProductUsageVideos,
  productVideoCatalog,
} from "@/features/catalog/data/product-usage-videos";
import { ProductUsageVideos } from "@/features/catalog/components/product-usage-videos";
import { ProductSpecifications } from "./product-specifications";
import { ScaleProductDetail } from "./scale-product-detail";
import { scaleDetailSpecifications } from "./scale-detail-specifications";
import scaleStyles from "./scale-product-detail.module.css";
import { catalogPageTitle } from "@/features/site/data/site-menu-labels";

const siteOrigin = "https://sunford-web.vercel.app";

function canonicalProductUrl(slug: string) {
  return `${siteOrigin}/products/${encodeURIComponent(slug)}`;
}

// Resolve the product before streaming so unknown URLs retain an HTTP 404.
// Catalogue reads remain cached; this route deliberately allows URL resolution.
export const instant = false;
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const products = await getProducts();
  const conflict = [...productCategorySlugs, mesSlug].find((slug) =>
    findCatalogProduct(products, slug),
  );
  if (conflict) throw new Error(`A catalog item uses the reserved URL /products/${conflict}`);
  return [...new Set(products.map(({ slug }) => slug).filter(Boolean))].map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return getProductMetadata(slug);
}

async function getProductMetadata(slug: string): Promise<Metadata> {
  "use cache";

  const product = await getProduct(slug);
  if (!product || !product.slug) return { title: "ไม่พบสินค้า" };
  if (product.slug !== slug) return { title: product.name };
  const title = [product.name, product.subtitle].filter(Boolean).join(" — ");
  const description =
    product.description || `ข้อมูลและรายละเอียดสินค้า ${product.name} จาก SUNFORD`;
  const canonical = canonicalProductUrl(product.slug);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      ...(product.image && { images: [new URL(product.image, siteOrigin).href] }),
    },
  };
}
export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || !product.slug) notFound();
  if (product.slug !== slug) {
    const query = new URLSearchParams();
    for (const [key, values] of Object.entries(await searchParams)) {
      for (const value of [values ?? []].flat()) query.append(key, value);
    }
    permanentRedirect(
      `/products/${encodeURIComponent(product.slug)}${query.size ? `?${query}` : ""}`,
    );
  }
  const [site, storefront] = await Promise.all([
    getSettings("site", defaultSite),
    getStorefrontProducts(),
  ]);
  const related = relatedProducts(product, storefront);
  const family = catalogProductGroup(product);
  const primaryCategory = productPrimaryCategory(product);
  const category = productCategoryDefinitions.find((item) => item.id === primaryCategory);
  const categoryPath =
    primaryCategory === "indicators" ? "/platforms/indicators" : `/${primaryCategory}`;
  const breadcrumbLabel = catalogPageTitle(categoryPath, category?.label ?? "ร้าน");
  const isScale = category?.id === "scales";
  const guide = buyingGuides.find((item) => item.productHref === family);
  const source = product.warehouseSku
    ? undefined
    : getSourceProduct(product.sourceId ?? product.slug);
  const detailsHtml = product.media?.detailsHtml ?? source?.detailsHtml;
  const videos = product.warehouseSku ? [] : getProductUsageVideos(product);
  const snapshot = product.warehouseSku
    ? undefined
    : getSnapshotProducts().find(
        (row) => row.id === product.id || (product.sourceId && row.sourceId === product.sourceId),
      );
  const presentation = productPresentation(product, snapshot, source);
  const summary = productSummary(product, presentation, detailsHtml);
  const descriptionRows = presentation.descriptionHtml
    ? productContentRows(presentation.descriptionHtml)
    : [];
  const technicalRows = detailsHtml ? productContentRows(detailsHtml, true) : [];
  const contentRows = mergeProductContentRows([
    ...(descriptionRows.length
      ? descriptionRows
      : product.description
        ? [{ label: "รายละเอียดสินค้า", value: product.description }]
        : []),
    ...presentation.specifications,
    ...technicalRows,
  ]);
  const rows = contentRows.filter(
    (row) =>
      !/เอกสาร|ดาวน์โหลด|download|data\s*sheet/i.test(row.label) &&
      (product.warehouseSku || row.label !== "รายละเอียดสินค้า") &&
      !(row.label === "รายละเอียดสินค้า" && product.description.trim() === product.name.trim()),
  );
  const fact = (label: string) =>
    catalogFieldValue(presentation.specifications.find((row) => row.label === label)?.value);
  const brand = fact("แบรนด์");
  const capacity = catalogFieldValue(product.capacity) ?? summary.weighing?.capacity;
  const grams = capacity?.match(/^(\d+)\s*g$/i);
  const displayCapacity =
    grams &&
    Number.isSafeInteger(Number(grams[1])) &&
    Number(grams[1]) >= 1000 &&
    Number(grams[1]) % 1000 === 0
      ? `${Number(grams[1]) / 1000} kg`
      : capacity;
  const readability = catalogFieldValue(product.readability) ?? summary.weighing?.readability;
  const display = fact("ชนิดหน้าจอ");
  const fields = ["capacity", "readability", "connection"] as const;
  const candidates = storefront.some((item) => item.id === product.id)
    ? related
        .map(clientProductData)
        .filter((other) =>
          fields.some((key) => catalogFieldValue(product[key]) && catalogFieldValue(other[key])),
        )
        .map(({ id, name, warehouseSku }) => ({ id, name, sku: warehouseSku }))
    : [];
  const canQuote = pricedProducts([product]).length > 0;
  const keyFeatures = presentation.specifications
    .filter(
      (row) =>
        row.value === "รองรับ" && /^(คำนวณราคาสินค้า|คำนวณเงินรับและเงินทอน)$/.test(row.label),
    )
    .map((row) => row.label);
  const leadFeatures = keyFeatures.length === 2 ? ["คำนวณราคาและเงินทอน"] : keyFeatures;
  const [lead, ...highlights] = [...new Set([...leadFeatures, ...summary.highlights])].filter(
    (text) => text !== product.name,
  );
  const categoryName =
    (isScale || product.category === "scales") && keyFeatures.includes("คำนวณราคาสินค้า")
      ? "เครื่องชั่งคำนวณราคา"
      : category?.label;
  const facts = [
    { label: "พิกัดน้ำหนักสูงสุด", value: displayCapacity },
    { label: "ค่าอ่านละเอียด", value: readability },
    { label: "ชนิดหน้าจอ", value: display },
  ].filter((row) => row.value);
  const scaleDescription = [product.subtitle, fact("จุดเด่นสินค้า")].filter(Boolean).join("\n");
  const shortSubtitle = product.subtitle?.replace(/\s+/g, " ").trim();
  const scaleSubtitle = /ร้านค้าปลีก[^\n]*ตลาดสด/.test(scaleDescription)
    ? "สำหรับร้านค้าปลีกและตลาดสด"
    : shortSubtitle && shortSubtitle.length <= 140 && shortSubtitle !== product.name
      ? shortSubtitle
      : undefined;
  const groups = isScale ? [] : groupProductDetails(rows);
  const approvedPhoto =
    isScale && product.warehouseSku === "G106094" && presentation.images.length > 0
      ? "/images/products/acs30-jc21-pdp.webp"
      : undefined;
  const gallery = (
    <ProductGallery
      key={`${product.id}:${product.image}`}
      images={approvedPhoto ? [approvedPhoto] : presentation.images}
      primaryImage={approvedPhoto ?? product.image}
      fallbackImage={approvedPhoto ? product.image : product.fallbackImage}
      preferFirst={isScale || Boolean(product.media)}
      name={product.name}
      model={
        !isScale &&
        !product.warehouseSku &&
        (product.id === "acs30-jc21" || product.sourceId === "10609")
          ? {
              src: "/models/acs30-jc21.glb",
              poster: "/images/products/acs30-jc21-cutout.png",
            }
          : undefined
      }
    />
  );
  const actions = (canQuote || candidates.length > 0) && (
    <div className={styles.actions}>
      {candidates.length > 0 && (
        <ProductDetailCompare
          currentId={product.id}
          candidates={candidates}
          waitForHydration={isScale}
        />
      )}
      {canQuote && (
        <Link href="/service/quotation">
          ขอใบเสนอราคา <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
  const guideCard = guide && (
    <aside className={styles.extra} aria-label="คู่มือเลือกสินค้าทั่วไป">
      <p>คู่มือเลือกสินค้าทั่วไป</p>
      <h2>{guide.title}</h2>
      <Link href={buyingGuideHref(guide.slug)}>อ่านคู่มือ</Link>
    </aside>
  );
  const canonical = canonicalProductUrl(product.slug);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: isScale ? (fact("รุ่นสินค้า") ?? product.name) : product.name,
        url: canonical,
        ...(product.description && { description: product.description }),
        ...(product.image && { image: new URL(product.image, siteOrigin).href }),
        ...(brand && { brand: { "@type": "Brand", name: brand } }),
        ...(product.price != null &&
          product.price > 0 && {
            offers: {
              "@type": "Offer",
              priceCurrency: "THB",
              price: product.price,
              url: canonical,
            },
          }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: breadcrumbLabel,
            item: `${siteOrigin}${categoryPath}`,
          },
          { "@type": "ListItem", position: 2, name: product.name, item: canonical },
        ],
      },
    ],
  };

  return (
    <main
      id="main-content"
      className={`product-detail ${styles.page}${isScale ? ` ${scaleStyles.page}` : ""}`}
      data-scroll-reveal={isScale ? "static" : undefined}
      data-primary-category={primaryCategory}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <nav aria-label="เส้นทางสินค้า" className="container">
        <Link href={categoryPath} className="text-link back-link">
          {breadcrumbLabel}
        </Link>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">{product.name}</span>
      </nav>
      {isScale ? (
        <ScaleProductDetail
          name={fact("รุ่นสินค้า") ?? product.name}
          category={categoryName}
          subtitle={scaleSubtitle}
          capacity={displayCapacity}
          sku={product.warehouseSku}
          price={product.price}
          inquiryHref={site.line}
          gallery={gallery}
          actions={actions}
          groups={scaleDetailSpecifications(
            rows,
            presentation.specifications,
            scaleDescription,
            displayCapacity,
          )}
        />
      ) : (
        <section id="product-overview" className={styles.overview} aria-label="ภาพรวมสินค้า">
          <Suspense
            fallback={
              <Link href="/products" className="text-link back-link">
                <ArrowLeft size={16} /> ผลิตภัณฑ์ทั้งหมด
              </Link>
            }
          >
            <ProductReturnLink />
          </Suspense>
          <div className={styles.identity}>
            {brand && <p className={styles.brand}>{brand}</p>}
            <h1>{product.name}</h1>
          </div>
          <div className={styles.hero}>
            {gallery}
            <div className={`detail-copy ${styles.copy}`}>
              {categoryName && category && (
                <Link href={categoryPath} className={styles.category}>
                  {categoryName}
                </Link>
              )}
              {product.warehouseSku && (
                <p className={styles.sku}>รหัสสินค้า {product.warehouseSku}</p>
              )}
              <p className="detail-price">
                {product.price != null && product.price > 0
                  ? formatBaht(product.price)
                  : "สอบถามราคา"}
              </p>
              <a
                href={site.line}
                target="_blank"
                rel="noreferrer"
                className={`button button-red detail-inquiry ${styles.inquiry}`}
              >
                สอบถามราคาและรายละเอียด
              </a>
              {actions}
            </div>
          </div>
          {facts.length > 0 && (
            <dl className={styles.facts} aria-label="ข้อมูลผลิตภัณฑ์">
              {facts.map(({ label, value }) => (
                <div key={label}>
                  <dt>
                    {label}
                    {label === "ค่าอ่านละเอียด" && <ReadabilityHelp />}
                  </dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {lead && (
            <div className={styles.highlights}>
              <p>จุดเด่นสินค้า</p>
              <h2>{lead}</h2>
              {highlights.length > 0 && (
                <ul>
                  {highlights.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      )}
      {groups.length > 0 && (
        <section
          id="product-specifications"
          className={`product-information ${styles.details}`}
          aria-labelledby="product-information-title"
        >
          <div>
            <h2 id="product-information-title">รายละเอียดสินค้า</h2>
            <p className={styles.sku}>{product.name}</p>
          </div>
          <ProductSpecifications groups={groups} />
        </section>
      )}
      {videos.length > 0 && (
        <section id="product-videos" className={styles.extra}>
          <ProductUsageVideos
            videos={videos}
            productName={product.name}
            channelUrl={productVideoCatalog.channel.url}
          />
        </section>
      )}
      {!isScale && guideCard}
      {related.length > 0 && family && (
        <section className={`related-products ${styles.related}`} aria-label="สินค้าในหมวดเดียวกัน">
          <div className={styles.sectionTitle}>
            <h2>สินค้าในหมวดเดียวกัน</h2>
            <Link href={family}>
              ดูสินค้าในหมวดนี้ <ChevronRight size={14} />
            </Link>
          </div>
          <div className={styles.cards}>
            {related.map((item) => {
              const card = productCardData(item);
              const name = catalogCardName(item);
              return (
                <article key={item.id}>
                  <Link className={styles.cardLink} href={`/products/${item.slug}`}>
                    <span className={styles.cardPhoto}>
                      {card.image ? (
                        <ProductImage
                          src={card.image}
                          fallbackSrc={card.fallbackImage}
                          alt=""
                          fill
                          sizes="(min-width: 48rem) 25vw, 80px"
                        />
                      ) : (
                        <span>ยังไม่มีรูปสินค้า</span>
                      )}
                    </span>
                    <ProductCardCaption
                      className={styles.cardCopy}
                      name={name}
                      highlight={card.highlight}
                      price={card.price}
                    />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      )}
      {isScale && guideCard}
    </main>
  );
}
