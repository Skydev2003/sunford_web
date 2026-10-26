import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, Phone } from "lucide-react";
import { getProduct, getProducts } from "@/features/catalog/server/product-repository";
import { categories } from "@/features/catalog/types";
import { ProductCard } from "@/features/catalog/components/product-card";

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
  return (
    <main id="main-content" className="product-detail container">
      <Link href="/products" className="text-link back-link">
        <ArrowLeft size={16} /> ผลิตภัณฑ์ทั้งหมด
      </Link>
      <div className="detail-grid">
        <div className="detail-image">
          <Image
            src={product.image}
            alt={`SUNFORD ${product.name}`}
            fill
            sizes="(max-width: 800px) 90vw, 50vw"
            preload
          />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{categories.find((c) => c.id === product.category)?.english}</p>
          <h1>{product.name}</h1>
          <h2>{product.subtitle}</h2>
          <p>{product.description}</p>
          <dl className="spec-list">
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
            <Phone size={16} /> 034-276-999
          </a>
          <p className="detail-note">
            <Check size={16} /> ให้คำปรึกษาและดูแลหลังการขายโดยทีม Sunford
          </p>
          <small>รายละเอียดอาจเปลี่ยนแปลง กรุณายืนยันสเปกและราคาล่าสุดกับทีมงาน</small>
        </div>
      </div>
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
