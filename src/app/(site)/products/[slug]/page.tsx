import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ChevronDown, CircleHelp } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { getProduct, getProducts } from "@/features/catalog/server/product-repository";
import { getSettings } from "@/features/cms/server/documents";
import { defaultSite } from "@/features/cms/data/settings";
import { CatalogProductCard } from "@/features/catalog/components/catalog-product-card";
import { productCardData } from "@/features/catalog/data/client-products";
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

// Resolve the product before streaming so unknown URLs retain an HTTP 404.
// Catalogue reads remain cached; this route deliberately allows URL resolution.
export const instant = false;

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
  const related = (await getProducts()).filter((p) => p.id !== product.id).slice(0, 3);
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
    <main id="main-content" className="product-detail container">
      <section className="product-overview" aria-label="ภาพรวมสินค้า">
        <Link href="/products" className="text-link back-link">
          <ArrowLeft size={16} /> ผลิตภัณฑ์ทั้งหมด
        </Link>
        <div className="detail-grid">
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
          <div className="detail-copy">
            <h1>{product.name}</h1>
            {summary.highlights.length > 0 && (
              <ul className="detail-highlights" aria-label="จุดเด่นสินค้า">
                {summary.highlights.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            )}
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
          </div>
        </div>
      </section>
      <section className="product-information" aria-labelledby="product-information-title">
        <div className="section-heading">
          <h2 id="product-information-title">รายละเอียดสินค้า</h2>
        </div>
        {detailGroups.length > 0 && (
          <div className="product-spec-groups">
            {detailGroups.map((group) => (
              <details className="product-spec-group" key={group.id}>
                <summary>
                  <span>{group.title}</span>
                  <ChevronDown size={18} aria-hidden="true" />
                </summary>
                <div className="product-attributes">
                  <table aria-label={group.title}>
                    <tbody>
                      {group.rows.map((row) => (
                        <tr key={row.label}>
                          <th scope="row">{row.label}</th>
                          <td
                            className="product-attribute-content"
                            dangerouslySetInnerHTML={{ __html: row.html }}
                          />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
        )}
        <ProductUsageVideos
          videos={videos}
          productName={product.name}
          channelUrl={productVideoCatalog.channel.url}
        />
      </section>
      <div className="related-products">
        <div className="section-heading">
          <h2>ค้นพบเพิ่มเติม</h2>
          <Link href="/products" className="text-link">
            ดูสินค้าทั้งหมด <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {related.map((p) => (
            <CatalogProductCard key={p.id} product={productCardData(p)} />
          ))}
        </div>
      </div>
    </main>
  );
}
