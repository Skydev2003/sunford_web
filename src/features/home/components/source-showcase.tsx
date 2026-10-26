import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { importedPages, getContentPage } from "@/features/content/server/content-repository";
import type { Product } from "@/features/catalog/types";
import { VideoGallery } from "@/features/content/components/video-gallery";
import { defaultHomeImages, type HomeImages } from "../data/image-slots";
import { resolveHomeLink, type HomeLinkTargets } from "../data/link-targets";

export function SourceShowcase({
  products,
  images = {},
  targets = {},
}: {
  products: Product[];
  images?: HomeImages;
  targets?: HomeLinkTargets;
}) {
  const defaults = defaultHomeImages(
    products,
    getContentPage("/applications-and-softwares")?.images[0],
  );
  const tiles = [
    {
      id: "digital",
      name: "เครื่องชั่งดิจิทัล",
      english: "DIGITAL SCALE",
      description: "ความแม่นยำที่พร้อมสำหรับทุกงาน ตั้งแต่บ้าน ร้านค้า ไปจนถึงโรงงาน",
      image: images.digital ?? defaults.digital,
    },
    {
      id: "smart",
      name: "เครื่องชั่งอัจฉริยะ",
      english: "SMART SCALE",
      description: "เชื่อมต่อข้อมูลและอุปกรณ์ ให้การทำงานในยุคดิจิทัลคล่องตัวยิ่งขึ้น",
      image: images.smart ?? defaults.smart,
    },
    {
      id: "accessories",
      name: "อุปกรณ์เสริม",
      english: "ACCESSORIES",
      description: "เครื่องพิมพ์ จอแสดงผล และระบบ POS ที่เติมเต็มงานชั่งของคุณ",
      image: images.accessories ?? defaults.accessories,
    },
    {
      id: "software",
      name: "แอปพลิเคชันและซอฟต์แวร์",
      english: "APPLICATIONS & SOFTWARE",
      description: "ติดตาม วิเคราะห์ และจัดการข้อมูล เพื่อการตัดสินใจที่แม่นยำ",
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
            alt={tile.name}
            fill
            sizes="(max-width: 720px) 90vw, 45vw"
          />
        );
        return (
          <article className="showcase-tile" key={tile.id}>
            <div className="showcase-tile-copy">
              <p className="eyebrow">{tile.english}</p>
              <h2>{tile.name}</h2>
              <p>{tile.description}</p>
              {href && (
                <Link className="text-link" href={href}>
                  ดูเพิ่มเติม <ChevronRight size={16} />
                </Link>
              )}
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

export function SunfordStories() {
  const articles = importedPages
    .filter((page) => page.kind === "article" && !page.path.startsWith("/business/"))
    .slice(0, 8);
  if (!articles.length) return null;
  return (
    <section className="stories-section">
      <div className="container section-heading">
        <div>
          <p className="eyebrow">SUNFORD STORIES</p>
          <h2>เรื่องราวของคนทำธุรกิจ.</h2>
        </div>
        <Link className="text-link" href="/news-and-activities">
          ดูเรื่องราวทั้งหมด <ChevronRight size={17} />
        </Link>
      </div>
      <div className="stories-track">
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
              <span>SUNFORD BIZ TALK</span>
              <h3>{article.title}</h3>
              <span className="text-link">
                อ่านเพิ่มเติม <ChevronRight size={15} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function SunfordVideos() {
  return <VideoGallery videos={getContentPage("/")?.videos ?? []} title="วิดีโอจาก Sunford" />;
}
