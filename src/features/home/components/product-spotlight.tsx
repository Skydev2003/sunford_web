import { ProductImage } from "@/components/ui/product-image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/features/catalog/types";
import { resolveHomeLink, type HomeLinkTarget } from "../data/link-targets";
import { getSettings } from "@/features/cms/server/documents";
import { spotlightDefaults } from "@/features/cms/data/settings";

export async function ProductSpotlight({
  products,
  image,
  target,
}: {
  products: Product[];
  image?: string;
  target?: HomeLinkTarget;
}) {
  const copy = await getSettings("spotlight", spotlightDefaults);
  const defaultProduct = products.find((item) => item.id === "rls1100");
  const product = target?.productId
    ? products.find((item) => item.id === target.productId)
    : defaultProduct;
  if (!product && !target?.pagePath) return null;
  const href = resolveHomeLink("spotlight", target, products);
  const visual = (
    <>
      <ProductImage
        src={
          image ??
          (defaultProduct?.imageOverridden ? defaultProduct.image : "/images/products/rls1100.png")
        }
        alt={product ? `SUNFORD ${product.name}` : "ผลิตภัณฑ์ Sunford"}
        width={614}
        height={614}
        sizes="(max-width: 720px) 85vw, 440px"
      />
      <span>{product?.connection ?? "ดูรายละเอียดเพิ่มเติม"}</span>
    </>
  );
  return (
    <section className="product-spotlight" aria-labelledby="spotlight-title">
      <div className="container spotlight-inner">
        <div className="spotlight-copy">
          <p className="eyebrow">SUNFORD {product?.name}</p>
          <h2 id="spotlight-title">
            {copy.title}
            <br />
            <span>{copy.accent}</span>
          </h2>
          <p style={{ whiteSpace: "pre-line" }}>{copy.description}</p>
          <div className="spotlight-actions">
            {href && (
              <Link href={href} className="button button-red">
                {copy.primaryLabel}
              </Link>
            )}
            <a href={copy.secondaryHref} className="text-link">
              {copy.secondaryLabel} <ChevronRight size={17} />
            </a>
          </div>
        </div>
        {href ? (
          <Link
            href={href}
            className="spotlight-visual"
            aria-label={product ? `ดูรายละเอียด ${product.name}` : "ดูข้อมูลเพิ่มเติม"}
          >
            {visual}
          </Link>
        ) : (
          <div className="spotlight-visual">{visual}</div>
        )}
      </div>
    </section>
  );
}
