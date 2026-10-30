import { Hero } from "@/features/home/components/hero";
import { HomeMotion } from "@/features/home/components/home-motion";
import { ProductSpotlight } from "@/features/home/components/product-spotlight";
import {
  SourceShowcase,
  SunfordStories,
  SunfordVideos,
} from "@/features/home/components/source-showcase";
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
        showAnnouncement={false}
        settings={{
          ...hero,
          secondaryHref:
            !showHomepageCatalog && hero.secondaryHref === "#products"
              ? "/products"
              : hero.secondaryHref,
        }}
      />
      <HomeMotion>
        <div className="homepage-lead">
          <ProductSpotlight
            products={products}
            image={images.spotlight}
            target={targets.spotlight}
            leading
          />
        </div>
      </HomeMotion>
      <HomeMotion>
        <SourceShowcase products={products} images={images} targets={targets} />
      </HomeMotion>
      <HomeMotion>
        {showHomepageCatalog ? (
          <ProductCatalog products={products} copy={catalog} />
        ) : (
          <CategoryFeature products={products} targets={targets} />
        )}
      </HomeMotion>
      <HomeMotion>
        <BusinessSolutions />
      </HomeMotion>
      <HomeMotion>
        <BrandStory />
      </HomeMotion>
      <HomeMotion>
        <SunfordStories />
      </HomeMotion>
      <HomeMotion>
        <SunfordVideos />
      </HomeMotion>
      <HomeMotion>
        <SupportSection />
      </HomeMotion>
    </main>
  );
}
