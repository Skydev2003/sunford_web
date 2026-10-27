import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/features/catalog/types";
import { resolveHomeLink, type HomeLinkTarget } from "../data/link-targets";
import { getSettings } from "@/features/cms/server/documents";
import { spotlightDefaults } from "@/features/cms/data/settings";
import { defaultSpotlightImage, defaultSpotlightProductId } from "../data/image-slots";

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
  const defaultProduct = products.find((item) => item.id === defaultSpotlightProductId);
  const product = target?.productId
    ? products.find((item) => item.id === target.productId)
    : defaultProduct;
  if (!product && !target?.pagePath) return null;
  const href = resolveHomeLink("spotlight", target, products);
  const visual = (
    <Image
      src={image ?? defaultSpotlightImage}
      alt={product ? `SUNFORD ${product.name}` : "เครื่องชั่ง Sunford JC21"}
      fill
      sizes="(max-width: 760px) 100vw, 1000px"
    />
  );
  return (
    <section className="product-spotlight" aria-labelledby="spotlight-title">
      <div className="container spotlight-inner">
        <div className="spotlight-copy">
          <h2 id="spotlight-title">{copy.title}</h2>
          <p className="spotlight-tagline">{copy.accent}</p>
          {copy.description && (
            <p className="spotlight-description" style={{ whiteSpace: "pre-line" }}>
              {copy.description}
            </p>
          )}
          <div className="spotlight-actions">
            {href && (
              <Link href={href} className="button button-red">
                {copy.primaryLabel}
              </Link>
            )}
            <a href={copy.secondaryHref} className="button spotlight-secondary-button">
              {copy.secondaryLabel}
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
