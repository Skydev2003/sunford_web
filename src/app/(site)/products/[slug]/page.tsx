import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, Phone } from "lucide-react";
import { getProduct, getProducts } from "@/features/catalog/server/product-repository";
import { categories } from "@/features/catalog/types";
import { ProductCard } from "@/features/catalog/components/product-card";
import { productSources } from "@/features/catalog/data/product-sources";
import { getSourceProduct } from "@/features/content/server/content-repository";
import { ProductGallery } from "@/features/catalog/components/product-gallery";
import { getContentPage } from "@/features/content/server/content-repository";
import { VideoGallery } from "@/features/content/components/video-gallery";

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
  const related = (await getProducts()).filter((p) => p.id !== product.id).slice(0, 3);
  const source = getSourceProduct(product.sourceId ?? product.slug);
  const sourcePage = source && getContentPage(source.path);
  return (
    <main id="main-content" className="product-detail container">
      <Link href="/products" className="text-link back-link">
        <ArrowLeft size={16} /> ผลิตภัณฑ์ทั้งหมด
      </Link>
      <div className="detail-grid">
        <ProductGallery
          key={product.id}
          images={source?.images.length ? source.images : product.image ? [product.image] : []}
          name={product.name}
        />
        <div className="detail-copy">
          <p className="eyebrow">{categories.find((c) => c.id === product.category)?.english}</p>
          <h1>{product.name}</h1>
          <h2>{product.subtitle}</h2>
          {product.price ? (
            <p className="detail-price">
              {new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(
                product.price,
              )}
            </p>
          ) : null}
          {source?.descriptionHtml ? (
            <div
              className="product-introduction source-prose"
              dangerouslySetInnerHTML={{ __html: source.descriptionHtml }}
            />
          ) : (
            <p>{product.description}</p>
          )}
          <dl className="spec-list">
            {source?.specifications?.length ? (
              source.specifications.map((spec, index) => (
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
          <a
            href="https://line.me/R/ti/p/@sunford"
            target="_blank"
            rel="noreferrer"
            className="button button-red"
          >
            สอบถามราคาและรายละเอียด <ArrowUpRight size={17} />
          </a>
          <a className="detail-phone" href="tel:034276999">
            <Phone size={16} /> 03-427-6999
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
      {source?.detailsHtml && (
        <section className="product-specifications" aria-labelledby="specifications-title">
          <div className="section-heading">
            <h2 id="specifications-title">รู้จักทุกรายละเอียด.</h2>
          </div>
          <div className="source-prose" dangerouslySetInnerHTML={{ __html: source.detailsHtml }} />
        </section>
      )}
      {sourcePage?.videos?.length ? (
        <VideoGallery videos={sourcePage.videos} title={`รู้จัก ${product.name} เพิ่มเติม`} />
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
