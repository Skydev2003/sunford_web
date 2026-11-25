import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { FocusDragScroll } from "@/components/ui/focus-drag-scroll";
import { editorialArticlesPath } from "@/features/content/data/editorial-sections";
import { getFeaturedEditorialArticles } from "@/features/content/server/content-repository";
import { getSettings } from "@/features/site/server/documents";
import { storiesDefaults } from "@/features/site/data/settings";
import { VideoGallery } from "@/features/content/components/video-gallery";
import { storyCardDate } from "../data/story-cards";
import { homepageYoutubeVideos } from "../data/youtube-video-links";
import storyStyles from "./stories-section.module.css";

export async function SunfordStories() {
  const [copy, articles] = await Promise.all([
    getSettings("stories", storiesDefaults),
    getFeaturedEditorialArticles(),
  ]);
  if (!articles.length) return null;
  return (
    <section id="stories" className={storyStyles.section} aria-labelledby="stories-heading">
      <div className={storyStyles.heading}>
        <div>
          <p className={storyStyles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="stories-heading">{copy.title}</h2>
        </div>
        <Link className={storyStyles.allStories} href={editorialArticlesPath}>
          {copy.linkLabel} <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <FocusDragScroll label={copy.title} className={`stories-track ${storyStyles.track}`}>
        {articles.map(({ title, path, cover, summary, text }) => {
          const date = storyCardDate(text);
          return (
            <Link
              href={path}
              key={path}
              className={storyStyles.card}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={storyStyles.photo}>
                <Image src={cover} alt="" fill sizes="(width < 48rem) 74vw, 320px" />
              </div>
              <div className={storyStyles.body}>
                {date && (
                  <time className={storyStyles.date} dateTime={date.iso}>
                    {date.label}
                  </time>
                )}
                <h3>{title}</h3>
                <p className={storyStyles.description}>{summary}</p>
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
