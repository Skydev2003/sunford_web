import { getSettings } from "@/features/cms/server/documents";
import { showcaseDefaults, storiesDefaults } from "@/features/cms/data/settings";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { getContentPages, getContentPage } from "@/features/content/server/content-repository";
import type { Product } from "@/features/catalog/types";
import { VideoGallery } from "@/features/content/components/video-gallery";
import { defaultHomeImages, type HomeImages } from "../data/image-slots";
import { resolveHomeLink, type HomeLinkTargets } from "../data/link-targets";
import { ShowcaseTile } from "./showcase-tile";
import { storyCardContent } from "../data/story-cards";
import storyStyles from "./stories-section.module.css";
import { FocusDragScroll } from "@/components/ui/focus-drag-scroll";

export async function SourceShowcase({
  products,
  images = {},
  targets = {},
}: {
  products: Product[];
  images?: HomeImages;
  targets?: HomeLinkTargets;
}) {
  const copy = await getSettings("showcase", showcaseDefaults);
  const digitalProduct = products.find((product) => product.id === "wps10ks");
  const smartProduct = products.find((product) => product.id === "rls1100");
  const defaults = defaultHomeImages();
  const tiles = [
    {
      id: "digital",
      name: copy.digitalName,
      english: copy.digitalEnglish,
      description: copy.digitalDescription,
      image: images.digital ?? defaults.digital,
    },
    {
      id: "accessories",
      name: copy.accessoriesName,
      english: copy.accessoriesEnglish,
      description: copy.accessoriesDescription,
      image: images.accessories ?? defaults.accessories,
    },
    {
      id: "smart",
      name: copy.smartName,
      english: copy.smartEnglish,
      description: copy.smartDescription,
      image: images.smart ?? defaults.smart,
    },
    {
      id: "software",
      name: copy.softwareName,
      english: copy.softwareEnglish,
      description: copy.softwareDescription,
      image: images.software ?? defaults.software,
    },
  ] as const;
  return (
    <section className="source-showcase" aria-label="ผลิตภัณฑ์และเทคโนโลยี Sunford">
      {tiles.map((tile) => {
        const href = resolveHomeLink(tile.id, targets[tile.id], products);
        const featuredProduct =
          tile.id === "digital" ? digitalProduct : tile.id === "smart" ? smartProduct : undefined;
        const visual =
          tile.id === "accessories" && !images.accessories ? (
            <div className="showcase-accessory-pair">
              <div className="showcase-accessory-pole">
                <ProductImage
                  src="/images/pd/RYG-POLE.png"
                  alt="ไฟสัญญาณสามสี SUNFORD RYG-POLE"
                  fill
                  sizes="(max-width: 720px) 38vw, 18vw"
                />
              </div>
              <div className="showcase-accessory-printer">
                <ProductImage
                  src={tile.image}
                  alt="เครื่องพิมพ์ใบเสร็จ SUNFORD TRP-58B"
                  fill
                  sizes="(max-width: 720px) 65vw, 32vw"
                />
              </div>
            </div>
          ) : (
            <ProductImage
              src={tile.image}
              alt={featuredProduct ? `${tile.name} SUNFORD ${featuredProduct.name}` : tile.name}
              fill
              sizes="(max-width: 720px) 90vw, 45vw"
            />
          );
        return (
          <ShowcaseTile
            className={`showcase-tile showcase-tile-${tile.id} showcase-tile-dark`}
            key={tile.id}
          >
            <div className="showcase-tile-copy">
              <p className="eyebrow">{tile.english}</p>
              <h2>{tile.name}</h2>
              <p>{tile.description}</p>
              <div className="showcase-tile-actions">
                {href && (
                  <Link className="button button-red" href={href}>
                    {copy.linkLabel}
                  </Link>
                )}
                {featuredProduct && (
                  <Link
                    className="button button-outline"
                    href={`/products/${featuredProduct.slug}`}
                  >
                    ดูรุ่น {featuredProduct.name}
                  </Link>
                )}
              </div>
            </div>
            {href ? (
              <Link className="showcase-tile-image" href={href} aria-label={tile.name}>
                {visual}
              </Link>
            ) : (
              <div className="showcase-tile-image">{visual}</div>
            )}
          </ShowcaseTile>
        );
      })}
    </section>
  );
}

export async function SunfordStories() {
  const copy = await getSettings("stories", storiesDefaults);
  const articles = (await getContentPages())
    .filter((page) => page.kind === "article" && !page.path.startsWith("/business/"))
    .slice(0, 8);
  if (!articles.length) return null;
  return (
    <section id="stories" className={storyStyles.section} aria-labelledby="stories-heading">
      <div className={storyStyles.heading}>
        <div>
          <p className={storyStyles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="stories-heading">
            {copy.title === storiesDefaults.title ? (
              <>
                เรื่องราวของ<span>คนทำธุรกิจ.</span>
              </>
            ) : (
              copy.title
            )}
          </h2>
          <p className={storyStyles.intro}>{copy.description}</p>
        </div>
        <Link className={storyStyles.allStories} href={copy.href}>
          {copy.linkLabel} <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <FocusDragScroll label={copy.title} className={`stories-track ${storyStyles.track}`}>
        {articles.map((article, index) => {
          const content = storyCardContent(article);
          const crop = [
            { x: 30, y: 180, width: 314, height: 206 },
            { x: 360, y: 180, width: 304, height: 206 },
          ][index];
          return (
            <Link href={article.path} key={article.path} className={storyStyles.card}>
              <div className={storyStyles.photo}>
                {crop ? (
                  <span
                    className={storyStyles.referenceCrop}
                    style={{ aspectRatio: `${crop.width}/${crop.height}` }}
                  >
                    <Image
                      src="/images/stories/reference-stories.png"
                      alt={
                        index === 0
                          ? "ภาพประกอบการชั่งส่วนผสมอาหารจากภาพที่แนบ"
                          : "ภาพประกอบเครื่องชั่งกับผักสดจากภาพที่แนบ"
                      }
                      width={1339}
                      height={568}
                      sizes="1400px"
                      style={{
                        width: `${(1339 / crop.width) * 100}%`,
                        left: `${(-crop.x / crop.width) * 100}%`,
                        top: `${(-crop.y / crop.height) * 100}%`,
                      }}
                    />
                  </span>
                ) : (
                  <ProductImage
                    src={article.images[0]}
                    alt={article.title}
                    fill
                    sizes="(max-width: 720px) 82vw, 300px"
                  />
                )}
                <span className={storyStyles.badge}>{content.category}</span>
              </div>
              <div className={storyStyles.body}>
                {content.date ? (
                  <time className={storyStyles.date} dateTime={content.date.iso}>
                    {content.date.label}
                  </time>
                ) : (
                  <span className={storyStyles.date}>Sunford Stories</span>
                )}
                <h3>{article.title}</h3>
                <p className={storyStyles.description}>{content.description}</p>
                <span className={storyStyles.readMore}>
                  {copy.readLabel}{" "}
                  <span>
                    <ChevronRight size={14} aria-hidden="true" />
                  </span>
                </span>
              </div>
            </Link>
          );
        })}
      </FocusDragScroll>
    </section>
  );
}

export async function SunfordVideos() {
  const settings = await getSettings("videos", {
    videos: (await getContentPage("/"))?.videos ?? [],
  });
  const copy = await getSettings("stories", storiesDefaults);
  return <VideoGallery videos={settings.videos} title={copy.videoTitle} />;
}
