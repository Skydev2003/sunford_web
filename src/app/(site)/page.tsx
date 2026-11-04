import { Hero } from "@/features/home/components/hero";
import { SectionTwoVideo } from "@/features/home/components/section-two-video";
import { HomeMotion } from "@/features/home/components/home-motion";
import { ProductSpotlight } from "@/features/home/components/product-spotlight";
import { SunfordStories, SunfordVideos } from "@/features/home/components/source-showcase";
import { ProductCatalog } from "@/features/catalog/components/product-catalog";
import { CategoryFeature } from "@/features/home/components/category-feature";
import { BrandStory } from "@/features/home/components/sections";
import { getProducts } from "@/features/catalog/server/product-repository";
import { getHomeImages, getHomeLinkTargets } from "@/features/home/server/home-images";
import { getSettings } from "@/features/cms/server/documents";
import { defaultHero, catalogDefaults, defaultSite } from "@/features/cms/data/settings";
import { heroSlideData } from "@/features/home/data/hero-slides";
import { getClientProducts } from "@/features/catalog/server/client-products";
import styles from "@/features/home/components/home-page.module.css";

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
    <main id="main-content" className={styles.page}>
      <Hero
        brand={{ logo: site.logo, name: site.name }}
        description={featured?.descriptionOverride}
        showAnnouncement={false}
        settings={{
          ...heroCopy,
          secondaryHref:
            !showHomepageCatalog && hero.secondaryHref === "#products"
              ? "/products"
              : hero.secondaryHref,
        }}
      />
      <SectionTwoVideo />
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
        {showHomepageCatalog ? (
          <ProductCatalog products={await getClientProducts()} copy={catalog} />
        ) : (
          <CategoryFeature products={products} images={images} />
        )}
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
    </main>
  );
}
