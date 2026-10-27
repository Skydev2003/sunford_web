import { ProductImage } from "@/components/ui/product-image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/features/catalog/types";
import { resolveHomeLink, type HomeLinkTarget } from "../data/link-targets";
import { getSettings } from "@/features/cms/server/documents";
import { spotlightDefaults } from "@/features/cms/data/settings";
import { defaultSpotlightImage } from "../data/image-slots";

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
        src={image ?? defaultSpotlightImage}
        alt={product ? `SUNFORD ${product.name}` : "ผลิตภัณฑ์ Sunford"}
        width={1254}
        height={1254}
        sizes="(max-width: 760px) 370px, (max-width: 1000px) 45vw, 474px"
      />
      <span className="spotlight-image-caption">
        <strong>{product?.name ?? "SUNFORD"}</strong>
        <span>
          {product?.id === "rls1100"
            ? "Barcode Label Printing Scale"
            : (product?.subtitle ?? copy.title)}
        </span>
      </span>
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
