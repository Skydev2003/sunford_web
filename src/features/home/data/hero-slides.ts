import type { Product } from "@/features/catalog/types";
import type { HeroSettings } from "@/features/cms/types";

export type HeroSlide = {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  ribbonImage: string;
  href: string;
  model?: string;
};

const heroImages: Record<string, string> = {
  "acs30-jc21": "/images/products/acs30-jc21-cutout.png",
  wps10ks: "/images/products/wps10ks.png",
  feh5ks: "/images/products/feh5ks.png",
  rls1100: "/images/products/rls1100.png",
};
const heroRibbonImages: Record<string, string> = {
  "acs30-jc21": "/images/hero/acs30-jc21-carousel-cutout.png",
  feh5ks: "/images/hero/feh5ks-carousel-cutout.png",
  wps10ks: "/images/hero/wps10ks-carousel-cutout.png",
};
const heroModels: Record<string, string> = {
  "acs30-jc21": "/models/acs30-jc21.glb",
  wps10ks: "/models/wps10ks.glb",
  feh5ks: "/models/feh5ks.glb",
};

export function heroSlideData(products: Product[], slides: HeroSettings["slides"]): HeroSlide[] {
  return slides.flatMap((slide, index) => {
    const product = products.find((product) => product.id === slide.productId);
    if (slide.productId && !product) return [];
    return [
      {
        id: `${index}:${slide.productId}`,
        name: slide.title || product?.name || "SUNFORD",
        title: slide.title || `SUNFORD ${product?.name ?? "PRECISION"}`,
        description:
          slide.description || product?.subtitle || "เครื่องชั่งและโซลูชัน เพื่อทุกความเป็นไปได้",
        image:
          slide.image ||
          (product
            ? product.imageOverridden
              ? product.image
              : (heroImages[product.id] ?? product.image)
            : ""),
        ribbonImage:
          slide.image ||
          (product
            ? product.imageOverridden
              ? product.image
              : (heroRibbonImages[product.id] ?? product.image)
            : ""),
        href: slide.href || (product ? `/products/${product.slug}` : "/products"),
        model: product && !slide.image ? heroModels[product.id] : undefined,
      },
    ];
  });
}
