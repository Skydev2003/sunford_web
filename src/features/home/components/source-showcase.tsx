import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { FocusDragScroll } from "@/components/ui/focus-drag-scroll";
import { getScaleApplications } from "@/features/catalog/server/scale-applications";
import { warehouseBlurDataURL } from "@/features/catalog/server/warehouse-image-previews";
import { getSettings } from "@/features/site/server/documents";
import { storiesDefaults } from "@/features/site/data/settings";
import { VideoGallery } from "@/features/content/components/video-gallery";
import { homepageYoutubeVideos } from "../data/youtube-video-links";
import storyStyles from "./stories-section.module.css";

export async function SunfordStories() {
  const applications = await getScaleApplications();
  const cards = applications
    .flatMap(({ slug, label, products }) => {
      const photo = products.find(({ image }) => image);
      return photo ? [{ slug, label, photo, count: products.length }] : [];
    })
    .slice(0, 8);
  const label = "เลือกเครื่องชั่งให้ตรงกับงาน";
  const href = "/products/category/scales/applications";
  return (
    <section id="stories" className={storyStyles.section} aria-labelledby="stories-heading">
      <div className={storyStyles.heading}>
        <div>
          <p className={storyStyles.eyebrow}>SUNFORD</p>
          <h2 id="stories-heading">
            เลือกเครื่องชั่ง<span>ให้ตรงกับงาน</span>
          </h2>
          <p className={storyStyles.intro}>สำรวจรุ่นเครื่องชั่งตามประเภทงานและธุรกิจของคุณ</p>
        </div>
        <Link className={storyStyles.allStories} href={href}>
          ดูงานทุกประเภท <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      {cards.length > 0 && (
        <FocusDragScroll label={label} className={`stories-track ${storyStyles.track}`}>
          {cards.map(({ slug, label, photo, count }, index) => (
            <Link
              href={`${href}/${slug}`}
              key={slug}
              className={storyStyles.card}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={storyStyles.photo}>
                <ProductImage
                  progressive
                  blurDataURL={index < 3 ? warehouseBlurDataURL(photo.image) : undefined}
                  src={photo.image}
                  alt={photo.name}
                  fill
                  sizes="(width < 48rem) 82vw, 300px"
                />
                <span className={storyStyles.badge}>เลือกตามการใช้งาน</span>
              </div>
              <div className={storyStyles.body}>
                <h3>{label}</h3>
                <p className={storyStyles.description}>
                  ดูข้อมูลเครื่องชั่งที่เกี่ยวข้อง {count} รุ่น
                </p>
                <span className={storyStyles.readMore}>
                  ดูรุ่นที่เกี่ยวข้อง{" "}
                  <span>
                    <ChevronRight size={14} aria-hidden="true" />
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </FocusDragScroll>
      )}
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
