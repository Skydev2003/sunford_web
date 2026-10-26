import { ProductImage } from "@/components/ui/product-image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/features/catalog/types";

export function ProductSpotlight({ products, image }: { products: Product[]; image?: string }) {
  const product = products.find((item) => item.id === "rls1100");
  if (!product) return null;
  return (
    <section className="product-spotlight" aria-labelledby="spotlight-title">
      <div className="container spotlight-inner">
        <div className="spotlight-copy">
          <p className="eyebrow">SUNFORD {product.name}</p>
          <h2 id="spotlight-title">
            ชั่ง. พิมพ์. จัดการ.
            <br />
            <span>ง่ายในเครื่องเดียว.</span>
          </h2>
          <p>
            เครื่องชั่งพิมพ์ฉลากบาร์โค้ด
            <br />
            ให้ทุกร้านค้า ทำงานได้เป็นระบบยิ่งขึ้น
          </p>
          <div className="spotlight-actions">
            <Link href={`/products/${product.slug}`} className="button button-red">
              ดูเพิ่มเติม
            </Link>
            <a href="#contact" className="text-link">
              ปรึกษาผู้เชี่ยวชาญ <ChevronRight size={17} />
            </a>
          </div>
        </div>
        <Link
          href={`/products/${product.slug}`}
          className="spotlight-visual"
          aria-label={`ดูรายละเอียด ${product.name}`}
        >
          <ProductImage
            src={
              image ?? (product.imageOverridden ? product.image : "/images/products/rls1100.png")
            }
            alt={`เครื่องชั่งพิมพ์ฉลาก SUNFORD ${product.name}`}
            width={614}
            height={614}
            sizes="(max-width: 720px) 85vw, 440px"
          />
          <span>{product.connection}</span>
        </Link>
      </div>
    </section>
  );
}
