import type { Metadata } from "next";
import { Suspense } from "react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Hero } from "@/features/home/components/hero";
import { SectionTwoVideo } from "@/features/home/components/section-two-video";
import { HomeMotion } from "@/features/home/components/home-motion";
import { ProductSpotlight } from "@/features/home/components/product-spotlight";
import { SunfordStories, SunfordVideos } from "@/features/home/components/source-showcase";
import { ProductCatalog } from "@/features/catalog/components/product-catalog";
import { CategoryFeature } from "@/features/home/components/category-feature";
import { BrandStory } from "@/features/home/components/sections";
import { getHomeProducts } from "@/features/home/server/home-products";
import { getHomeImages, getHomeLinkTargets } from "@/features/home/server/home-images";
import { getSettings } from "@/features/site/server/documents";
import { defaultHero, catalogDefaults } from "@/features/site/data/settings";
import { heroSlideData } from "@/features/home/data/hero-slides";
import { companyIntro } from "@/features/home/data/brand";
import { getClientProducts } from "@/features/catalog/server/client-products";
import styles from "@/features/home/components/home-page.module.css";

// Temporarily hide the homepage catalogue while keeping /products available.
const showHomepageCatalog = false;

const homeTitle = "SUNFORD เครื่องชั่งดิจิทัลและโซลูชันการชั่ง";
const homeDescription =
  "เลือกเครื่องชั่งดิจิทัล เครื่องชั่งอุตสาหกรรม อินดิเคเตอร์และแท่นชั่ง พร้อมโซลูชันเชื่อมต่อข้อมูล ระบบ POS และบริการหลังการขายจาก SUNFORD";
const homeUrl = "https://sunford-web.vercel.app/";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  alternates: { canonical: homeUrl },
  openGraph: {
    type: "website",
    title: homeTitle,
    description: homeDescription,
    url: homeUrl,
    images: [
      {
        url: `${homeUrl}videos/sunford-poster-1920.webp`,
        alt: "SUNFORD เครื่องชั่งสำหรับธุรกิจของคุณ",
      },
    ],
  },
};

export default async function Home() {
  const hero = await getSettings("hero", defaultHero);
  const { slides, ...heroCopy } = hero;
  return (
    <main id="main-content" className={styles.page}>
      <Hero
        description={
          slides.some((slide) => slide.description) ? (
            <Suspense fallback={companyIntro.description}>
              <HomeHeroDescription slides={slides} />
            </Suspense>
          ) : undefined
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
      <SectionTwoVideo />
      <Suspense fallback={null}>
        <HomeProducts />
      </Suspense>
      <Suspense fallback={null}>
        <HomeMotion>
          <BrandStory />
        </HomeMotion>
        <HomeMotion>
          <SunfordStories />
        </HomeMotion>
        <HomeMotion>
          <SunfordVideos />
        </HomeMotion>
      </Suspense>
      <ScrollReveal rootId="main-content" selector="#section-two-title" />
    </main>
  );
}

async function HomeHeroDescription({ slides }: { slides: typeof defaultHero.slides }) {
  const [featured] = heroSlideData(await getHomeProducts(), slides);
  return featured?.descriptionOverride || companyIntro.description;
}

async function HomeProducts() {
  const [products, images, targets] = await Promise.all([
    getHomeProducts(),
    getHomeImages(),
    getHomeLinkTargets(),
  ]);
  return (
    <>
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
          <ProductCatalog
            products={await getClientProducts()}
            copy={await getSettings("catalog", catalogDefaults)}
          />
        ) : (
          <CategoryFeature products={products} images={images} />
        )}
      </HomeMotion>
    </>
  );
}
