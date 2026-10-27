import { Hero } from "@/features/home/components/hero";
import { ProductSpotlight } from "@/features/home/components/product-spotlight";
import {
  SourceShowcase,
  SunfordStories,
  SunfordVideos,
} from "@/features/home/components/source-showcase";
import { CategoryNavigation } from "@/features/catalog/components/category-navigation";
import { ProductCatalog } from "@/features/catalog/components/product-catalog";
import { CategoryFeature } from "@/features/home/components/category-feature";
import { BrandStory, BusinessSolutions, SupportSection } from "@/features/home/components/sections";
import { getProducts } from "@/features/catalog/server/product-repository";
import { getHomeImages, getHomeLinkTargets } from "@/features/home/server/home-images";
import { getSettings } from "@/features/cms/server/documents";
import { defaultHero, catalogDefaults } from "@/features/cms/data/settings";

// Temporarily hide the homepage catalogue while keeping /products available.
const showHomepageCatalog = false;

export default async function Home() {
  const [products, images, targets, hero, catalog] = await Promise.all([
    getProducts(),
    getHomeImages(),
    getHomeLinkTargets(),
    getSettings("hero", defaultHero),
    getSettings("catalog", catalogDefaults),
  ]);
  return (
    <main id="main-content">
      <Hero
        products={products}
        settings={{
          ...hero,
          secondaryHref:
            !showHomepageCatalog && hero.secondaryHref === "#products"
              ? "/products"
              : hero.secondaryHref,
        }}
      />
      <ProductSpotlight products={products} image={images.spotlight} target={targets.spotlight} />
      <SourceShowcase products={products} images={images} targets={targets} />
      <CategoryNavigation
        copy={catalog}
        catalogHref={showHomepageCatalog ? "#products" : "/products"}
      />
      {showHomepageCatalog ? (
        <ProductCatalog products={products} copy={catalog} />
      ) : (
        <CategoryFeature products={products} targets={targets} />
      )}
      <BusinessSolutions />
      <BrandStory />
      <SunfordStories />
      <SunfordVideos />
      <SupportSection />
    </main>
  );
}
