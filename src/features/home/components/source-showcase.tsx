import { getSettings } from "@/features/cms/server/documents";
import { showcaseDefaults, storiesDefaults } from "@/features/cms/data/settings";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { DragScroll } from "@/components/ui/drag-scroll";
import { getContentPages, getContentPage } from "@/features/content/server/content-repository";
import type { Product } from "@/features/catalog/types";
import { VideoGallery } from "@/features/content/components/video-gallery";
import { defaultHomeImages, type HomeImages } from "../data/image-slots";
import { resolveHomeLink, type HomeLinkTargets } from "../data/link-targets";

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
  const defaults = defaultHomeImages(
    products,
    (await getContentPage("/applications-and-softwares"))?.images[0],
  );
  const tiles = [
    {
      id: "digital",
      name: copy.digitalName,
      english: copy.digitalEnglish,
      description: copy.digitalDescription,
      image: images.digital ?? defaults.digital,
    },
    {
      id: "smart",
      name: copy.smartName,
      english: copy.smartEnglish,
      description: copy.smartDescription,
      image: images.smart ?? defaults.smart,
    },
    {
      id: "accessories",
      name: copy.accessoriesName,
      english: copy.accessoriesEnglish,
      description: copy.accessoriesDescription,
      image: images.accessories ?? defaults.accessories,
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
        const visual = (
          <ProductImage
            src={tile.image}
            alt={tile.id === "digital" ? "เครื่องชั่งดิจิทัล SUNFORD WPS10KS" : tile.name}
            fill
            sizes="(max-width: 720px) 90vw, 45vw"
          />
        );
        return (
          <article
            className={`showcase-tile${tile.id === "digital" ? " showcase-tile-dark" : ""}`}
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
                {tile.id === "digital" && digitalProduct && (
                  <Link className="button button-outline" href={`/products/${digitalProduct.slug}`}>
                    ดูรุ่น {digitalProduct.name}
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
          </article>
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
    <section className="stories-section">
      <div className="container section-heading">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
        </div>
        <Link className="text-link" href={copy.href}>
          {copy.linkLabel} <ChevronRight size={17} />
        </Link>
      </div>
      <DragScroll className="stories-track" label={copy.title}>
        {articles.map((article) => (
          <Link href={article.path} key={article.path} className="story-card">
            <div className="story-card-image">
              <ProductImage
                src={article.images[0]}
                alt={article.title}
                fill
                sizes="(max-width: 720px) 85vw, 450px"
              />
            </div>
            <div>
              <span>{copy.cardLabel}</span>
              <h3>{article.title}</h3>
              <span className="text-link">
                {copy.readLabel} <ChevronRight size={15} />
              </span>
            </div>
          </Link>
        ))}
      </DragScroll>
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
