import { Hero } from "@/features/home/components/hero";
import { HomeMotion } from "@/features/home/components/home-motion";
import { ProductSpotlight } from "@/features/home/components/product-spotlight";
import { BrandFilm } from "@/features/home/components/brand-film";
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
import { defaultHero, catalogDefaults, defaultSite } from "@/features/cms/data/settings";
import { heroSlideData } from "@/features/home/data/hero-slides";
import { getClientProducts } from "@/features/catalog/server/client-products";

// Temporarily hide the homepage catalogue while keeping /products available.
const showHomepageCatalog = false;

export default async function Home() {
  const [products, images, targets, hero, catalog, site] = await Promise.all([
    getProducts(),
    getHomeImages(),
    getHomeLinkTargets(),
    getSettings("hero", defaultHero),
    getSettings("catalog", catalogDefaults),
    getSettings("site", defaultSite),
  ]);
  const { slides, ...heroCopy } = hero;
  const [featured] = heroSlideData(products, slides);
  return (
    <main id="main-content" data-background-start="solutions">
      <Hero
        brand={{ logo: site.logo, name: site.name }}
        product={
          featured && {
            name: featured.name,
            image: featured.image,
            href: featured.href,
            descriptionOverride: featured.descriptionOverride,
          }
        }
        showAnnouncement={false}
        settings={{
          ...heroCopy,
          secondaryHref:
            !showHomepageCatalog && hero.secondaryHref === "#products"
              ? "/products"
              : hero.secondaryHref,
        }}
      />
      <BrandFilm />
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
          <ProductCatalog products={await getClientProducts()} copy={catalog} />
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
