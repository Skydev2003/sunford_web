import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/features/catalog/types";
import { resolveHomeLink, type HomeLinkTarget } from "../data/link-targets";
import { getSettings } from "@/features/cms/server/documents";
import { spotlightDefaults } from "@/features/cms/data/settings";
import {
  defaultSpotlightImage,
  defaultSpotlightProductId,
  defaultSpotlightVideo,
  defaultSpotlightPoster,
} from "../data/image-slots";
import { SpotlightProductVideo } from "./spotlight-product-video";

export async function ProductSpotlight({
  products,
  image,
  target,
  leading = false,
}: {
  products: Product[];
  image?: string;
  target?: HomeLinkTarget;
  leading?: boolean;
}) {
  const copy = await getSettings("spotlight", spotlightDefaults);
  const defaultProduct = products.find((item) => item.id === defaultSpotlightProductId);
  const product = target?.productId
    ? products.find((item) => item.id === target.productId)
    : defaultProduct;
  if (!product && !target?.pagePath) return null;
  const href = resolveHomeLink("spotlight", target, products);
  const showVideo =
    product?.id === defaultSpotlightProductId && (!image || image === defaultSpotlightImage);
  const visual = (
    <Image
      src={image ?? defaultSpotlightImage}
      alt={product ? `SUNFORD ${product.name}` : "เครื่องชั่ง Sunford JC21"}
      fill
      sizes="(max-width: 760px) 100vw, 1000px"
    />
  );
  return (
    <section
      className={leading ? "product-spotlight spotlight-leading" : "product-spotlight"}
      aria-labelledby="spotlight-title"
    >
      <div className="container spotlight-inner">
        <div className="spotlight-copy">
          <h2 id="spotlight-title">
            {copy.title.split(/(\bJC21\b)/).map((part, index) =>
              part === "JC21" ? (
                <span key={index} className="spotlight-model">
                  {part}
                </span>
              ) : (
                part
              ),
            )}
          </h2>
          <p className="spotlight-tagline">{copy.accent}</p>
          {copy.description && (
            <p className="spotlight-description" style={{ whiteSpace: "pre-line" }}>
              {copy.description}
            </p>
          )}
        </div>
        {showVideo ? (
          <SpotlightProductVideo
            src={defaultSpotlightVideo}
            poster={defaultSpotlightPoster}
            name={product.name}
            href={href}
          />
        ) : href ? (
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
