import { getSettings } from "@/features/cms/server/documents";
import { storiesDefaults } from "@/features/cms/data/settings";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { getContentPages } from "@/features/content/server/content-repository";
import { VideoGallery } from "@/features/content/components/video-gallery";
import { storyCardContent } from "../data/story-cards";
import storyStyles from "./stories-section.module.css";
import { FocusDragScroll } from "@/components/ui/focus-drag-scroll";
import { homepageYoutubeVideos } from "../data/youtube-video-links";

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
            <Link
              href={article.path}
              key={article.path}
              className={storyStyles.card}
              target="_blank"
              rel="noopener noreferrer"
            >
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
  const copy = await getSettings("stories", storiesDefaults);
  return (
    <VideoGallery
      videos={homepageYoutubeVideos}
      title={copy.videoTitle}
      focusCarousel
      openInYoutube
    />
  );
}
