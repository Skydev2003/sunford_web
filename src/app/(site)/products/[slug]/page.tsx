import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, Phone } from "lucide-react";
import { getProduct, getProducts } from "@/features/catalog/server/product-repository";
import { getCategories } from "@/features/cms/server/categories";
import { getSettings } from "@/features/cms/server/documents";
import { defaultSite } from "@/features/cms/data/settings";
import { ProductCard } from "@/features/catalog/components/product-card";
import { productSources } from "@/features/catalog/data/product-sources";
import { getSourceProduct } from "@/features/content/server/content-repository";
import { ProductGallery } from "@/features/catalog/components/product-gallery";
import { getContentPage } from "@/features/content/server/content-repository";
import { VideoGallery } from "@/features/content/components/video-gallery";
import { getSnapshotProducts } from "@/features/content/data/catalog-snapshot";
import { productPresentation } from "@/features/catalog/data/product-presentation";

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
  const [categories, site] = await Promise.all([getCategories(), getSettings("site", defaultSite)]);
  const related = (await getProducts()).filter((p) => p.id !== product.id).slice(0, 3);
  const source = getSourceProduct(product.sourceId ?? product.slug);
  const sourcePage = source && (await getContentPage(source.path));
  const detailsHtml = product.media?.detailsHtml ?? source?.detailsHtml;
  const videos = product.media?.videos ?? sourcePage?.videos ?? [];
  const snapshot = getSnapshotProducts().find((row) => row.id === product.id);
  const presentation = productPresentation(product, snapshot, source);
  return (
    <main id="main-content" className="product-detail container">
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
          <p className="eyebrow">{categories.find((c) => c.id === product.category)?.english}</p>
          <h1>{product.name}</h1>
          <h2>{product.subtitle}</h2>
          {product.price != null ? (
            <p className="detail-price">
              {new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(
                product.price,
              )}
            </p>
          ) : null}
          {presentation.descriptionHtml ? (
            <div
              className="product-introduction source-prose"
              dangerouslySetInnerHTML={{ __html: presentation.descriptionHtml }}
            />
          ) : (
            <p>{product.description}</p>
          )}
          <dl className="spec-list">
            {presentation.specifications.length ? (
              presentation.specifications.map((spec, index) => (
                <div key={`${spec.label}-${index}`}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))
            ) : (
              <>
                <div>
                  <dt>พิกัดน้ำหนัก</dt>
                  <dd>{product.capacity}</dd>
                </div>
                <div>
                  <dt>ความละเอียด</dt>
                  <dd>{product.readability}</dd>
                </div>
                <div>
                  <dt>การเชื่อมต่อ</dt>
                  <dd>{product.connection}</dd>
                </div>
              </>
            )}
          </dl>
          <a href={site.line} target="_blank" rel="noreferrer" className="button button-red">
            สอบถามราคาและรายละเอียด <ArrowUpRight size={17} />
          </a>
          <a className="detail-phone" href={site.phoneHref}>
            <Phone size={16} /> {site.phone}
          </a>
          <p className="detail-note">
            <Check size={16} /> ให้คำปรึกษาและดูแลหลังการขายโดยทีม Sunford
          </p>
          <small>รายละเอียดอาจเปลี่ยนแปลง กรุณายืนยันสเปกและราคาล่าสุดกับทีมงาน</small>
          {(source?.sourceUrl || productSources[product.id]) && (
            <a
              className="text-link source-link"
              href={source?.sourceUrl || productSources[product.id]}
              target="_blank"
              rel="noreferrer"
            >
              ข้อมูลผลิตภัณฑ์จาก Sunford <ArrowUpRight size={15} />
            </a>
          )}
        </div>
      </div>
      {detailsHtml && (
        <section className="product-specifications" aria-labelledby="specifications-title">
          <div className="section-heading">
            <h2 id="specifications-title">รู้จักทุกรายละเอียด.</h2>
          </div>
          <div className="source-prose" dangerouslySetInnerHTML={{ __html: detailsHtml }} />
        </section>
      )}
      {videos.length ? (
        <VideoGallery videos={videos} title={`รู้จัก ${product.name} เพิ่มเติม`} />
      ) : null}
      <div className="related-products">
        <div className="section-heading">
          <h2>ค้นพบเพิ่มเติม</h2>
          <Link href="/products" className="text-link">
            ดูสินค้าทั้งหมด <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </main>
  );
}
