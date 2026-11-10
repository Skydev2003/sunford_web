import styles from "./product-detail.module.css";
import { Suspense } from "react";
import { ProductReturnLink } from "@/features/catalog/components/product-return-link";
import { relatedProducts } from "@/features/catalog/data/related-products";
import { catalogProductGroup } from "@/features/catalog/data/catalog-supplements";
import { productCategoryDefinitions } from "@/features/catalog/data/mock-categories";
import { buyingGuides } from "@/features/content/data/buying-guides";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleHelp } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { getProduct, getProducts } from "@/features/catalog/server/product-repository";
import { getSettings } from "@/features/cms/server/documents";
import { defaultSite } from "@/features/cms/data/settings";
import { CatalogProductCard } from "@/features/catalog/components/catalog-product-card";
import { productCardData } from "@/features/catalog/data/client-products";
import { catalogCardName } from "@/features/catalog/data/catalog-card-names";
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
import { ProductSpecificationDialogs } from "./product-specification-dialogs";

// Resolve the product before streaming so unknown URLs retain an HTTP 404.
// Catalogue reads remain cached; this route deliberately allows URL resolution.
export const instant = false;
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return {
    title: product ? `${product.name} — ${product.subtitle}` : "ไม่พบสินค้า",
    description: product?.description,
  };
}
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const site = await getSettings("site", defaultSite);
  const related = relatedProducts(product, await getProducts());
  const family = catalogProductGroup(product);
  const category = productCategoryDefinitions.find((item) => item.path === family);
  const guide = buyingGuides.find((item) => item.productHref === family);
  const source = getSourceProduct(product.sourceId ?? product.slug);
  const detailsHtml = product.media?.detailsHtml ?? source?.detailsHtml;
  const videos = getProductUsageVideos(product);
  const snapshot = getSnapshotProducts().find((row) => row.id === product.id);
  const presentation = productPresentation(product, snapshot, source);
  const summary = productSummary(product, presentation, detailsHtml);
  const descriptionRows = presentation.descriptionHtml
    ? productContentRows(presentation.descriptionHtml)
    : [];
  const technicalRows = detailsHtml ? productContentRows(detailsHtml, true) : [];
  const contentRows = mergeProductContentRows([
    ...(descriptionRows.length
      ? descriptionRows
      : [{ label: "รายละเอียดสินค้า", value: product.description || "-" }]),
    ...presentation.specifications,
    ...technicalRows,
  ]);
  const attributeRows = contentRows.filter((row) => row.label !== "รายละเอียดสินค้า");
  const detailGroups = groupProductDetails(attributeRows);
  return (
    <main id="main-content" className={`product-detail container ${styles.page}`}>
      <section id="product-overview" className="product-overview" aria-label="ภาพรวมสินค้า">
        <Suspense
          fallback={
            <Link href="/products" className="text-link back-link">
              <ArrowLeft size={16} /> ผลิตภัณฑ์ทั้งหมด
            </Link>
          }
        >
          <ProductReturnLink />
        </Suspense>
        <div className="detail-grid">
          <div className="detail-copy">
            {category && (
              <Link className={styles.category} href={category.path}>
                {category.label}
              </Link>
            )}
            <h1>{product.name}</h1>
            {summary.weighing && (
              <table className="detail-weighing" aria-label="พิกัดและค่าอ่านละเอียด">
                <thead>
                  <tr>
                    <th scope="col">พิกัดน้ำหนักสูงสุด</th>
                    <th scope="col">
                      ค่าอ่านละเอียด
                      <Tooltip content="ค่าละเอียด คือหน่วยย่อยที่สุดที่หน้าจอเครื่องชั่งแสดงได้ เช่น ค่าละเอียด 1 กรัม จะแสดงน้ำหนักเพิ่มหรือลดทีละ 1 กรัม">
                        <button type="button" className="spec-help" aria-label="ค่าละเอียดคืออะไร">
                          <CircleHelp size={16} aria-hidden="true" />
                        </button>
                      </Tooltip>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{summary.weighing.capacity}</td>
                    <td>{summary.weighing.readability}</td>
                  </tr>
                </tbody>
              </table>
            )}
            {product.price != null ? (
              <p className="detail-price">
                {new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(
                  product.price,
                )}
              </p>
            ) : null}
            <a
              href={site.line}
              target="_blank"
              rel="noreferrer"
              className="button button-red detail-inquiry"
            >
              สอบถามราคาและรายละเอียด
            </a>
            {summary.weighing && (
              <p className={styles.readabilityNote}>
                ค่าละเอียด คือหน่วยย่อยที่สุดที่หน้าจอเครื่องชั่งแสดงได้ เช่น ค่าละเอียด 1 กรัม
                จะแสดงน้ำหนักเพิ่มหรือลดทีละ 1 กรัม
              </p>
            )}
          </div>
          <ProductGallery
            key={`${product.id}:${product.image}`}
            images={presentation.images}
            primaryImage={product.image}
            preferFirst={Boolean(product.media)}
            name={product.name}
            model={
              product.id === "acs30-jc21" || product.sourceId === "10609"
                ? {
                    src: "/models/acs30-jc21.glb",
                    poster: "/images/products/acs30-jc21-cutout.png",
                  }
                : undefined
            }
          />
          {summary.highlights.length > 0 && (
            <ul className="detail-highlights" aria-label="จุดเด่นสินค้า">
              {summary.highlights.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <section
        id="product-specifications"
        className="product-information"
        aria-labelledby="product-information-title"
      >
        <div className="section-heading">
          <h2 id="product-information-title">รายละเอียดสินค้า</h2>
        </div>
        {detailGroups.length > 0 && <ProductSpecificationDialogs groups={detailGroups} />}
        <div id={videos.length ? "product-videos" : undefined} className={styles.videos}>
          <ProductUsageVideos
            videos={videos}
            productName={product.name}
            channelUrl={productVideoCatalog.channel.url}
          />
        </div>
      </section>
      {guide && (
        <aside className={styles.guide} aria-label="คู่มือเลือกสินค้าทั่วไป">
          <div>
            <p>คู่มือเลือกสินค้าทั่วไป</p>
            <h2>{guide.title}</h2>
          </div>
          <Link href={`/guides/${guide.slug}`} className="text-link">
            อ่านคู่มือ
          </Link>
        </aside>
      )}
      {related.length > 0 && (
        <section className="related-products" aria-label="สินค้าในหมวดเดียวกัน">
          <div className="section-heading">
            <h2>สินค้าในหมวดเดียวกัน</h2>
            <Link href={family!} className="text-link">
              ดูสินค้าในหมวดนี้
            </Link>
          </div>
          <div className={`product-grid ${styles.relatedGrid}`}>
            {related.map((p) => (
              <CatalogProductCard
                key={p.id}
                modelOnly
                product={{ ...productCardData(p), name: catalogCardName(p) }}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
