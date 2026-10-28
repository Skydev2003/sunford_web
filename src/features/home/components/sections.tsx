import { getSettings } from "@/features/cms/server/documents";
import { patchSection } from "@/features/cms/server/section-tree";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  CircleCheck,
  PackageCheck,
  ShieldCheck,
  UsersRound,
  Settings2,
  Wrench,
} from "lucide-react";
import { sunford } from "@/features/home/data/brand";
import { BusinessSolutionsTemplate } from "./business-solutions";
import { CustomerStoryGallery } from "./customer-story-gallery";
import { customerStoryPhotos } from "../data/customer-story-photos";
import storyStyles from "./brand-story.module.css";

export { BusinessSolutionsTemplate } from "./business-solutions";

export function BrandStoryTemplate() {
  return (
    <section id="story" className={storyStyles.section}>
      <div className={`container ${storyStyles.layout}`}>
        <CustomerStoryGallery>
          {customerStoryPhotos.map((photo) => (
            <span key={photo.id} className={storyStyles.photoContent}>
              {photo.id !== "market" && (
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  sizes="(max-width: 480px) 80vw, (max-width: 800px) 440px, 40vw"
                  className={storyStyles.sceneBackdrop}
                  draggable={false}
                />
              )}
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 480px) 80vw, (max-width: 800px) 440px, 40vw"
                className={photo.id === "market" ? undefined : storyStyles.scenePhoto}
                draggable={false}
              />
            </span>
          ))}
        </CustomerStoryGallery>
        <div className={storyStyles.copy}>
          <p className="eyebrow">BEHIND EVERY MEASUREMENT</p>
          <h2>
            เบื้องหลังทุกตัวเลข
            <br />
            คือ<span>ความตั้งใจของคุณ</span>
          </h2>
          <p>
            Sunford เริ่มต้นจากความตั้งใจที่จะช่วยให้ผู้ประกอบการ โรงงาน ร้านค้าปลีก
            และผู้ค้ารายย่อย พัฒนาธุรกิจด้วยเทคโนโลยีเครื่องชั่งดิจิทัล
          </p>
          <p>
            เราให้ความสำคัญกับคุณภาพ ความทนทาน การใช้งานที่ไม่ซับซ้อน และบริการหลังการขาย
            เพื่อเป็นส่วนหนึ่งของโอกาสและการเติบโตของคุณ
          </p>
          <div className={storyStyles.values}>
            <div className={storyStyles.value}>
              <span>
                <ShieldCheck size={27} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <strong>เชื่อถือได้</strong>
              <p>ใช้ได้ทุกวัน</p>
            </div>
            <div className={storyStyles.value}>
              <span>
                <UsersRound size={27} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <strong>ดูแลโดยทีมงาน</strong>
              <p>มืออาชีพ</p>
            </div>
            <div className={storyStyles.value}>
              <span>
                <Settings2 size={27} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <strong>พัฒนาอย่างต่อเนื่อง</strong>
              <p>เพื่อธุรกิจของคุณ</p>
            </div>
          </div>
          <div className={storyStyles.actions}>
            <a className={storyStyles.storyLink} href={sunford.about}>
              รู้จักเรื่องราวของ Sunford <ArrowRight size={18} aria-hidden="true" />
            </a>
            <div className={storyStyles.signature}>
              <strong>SUNFORD</strong>
              <span>Precision you can trust.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SupportSectionTemplate() {
  const services = [
    {
      icon: BookOpen,
      title: "E-Catalogue",
      description: "สำรวจรุ่นสินค้าและรายละเอียดจากแคตตาล็อก Sunford",
      href: sunford.catalogue,
    },
    {
      icon: Wrench,
      title: "ศูนย์บริการลูกค้า",
      description: "ติดต่อทีม Sunford สำหรับคำปรึกษาและบริการหลังการขาย",
      href: sunford.service,
    },
    {
      icon: PackageCheck,
      title: "ส่งถึงธุรกิจคุณ",
      description: "บริการจัดส่งสินค้า ครอบคลุมทั่วประเทศไทย",
      href: sunford.contact,
    },
    {
      icon: ShieldCheck,
      title: "ลงทะเบียนรับประกัน",
      description: "ลงทะเบียนผลิตภัณฑ์และตรวจเงื่อนไขการรับประกัน",
      href: sunford.warranty,
    },
  ];
  return (
    <section id="support" className="support-section container">
      <div className="support-heading">
        <p className="eyebrow">ALWAYS BY YOUR SIDE</p>
        <h2>
          <span>
            มากกว่าสินค้า <span className="support-heading-tail">คือการดูแลที่วางใจได้</span>
          </span>
          <CircleCheck size={23} strokeWidth={1.4} />
        </h2>
      </div>
      <div className="support-grid">
        {services.map(({ icon: Icon, title, description, href }) => (
          <a href={href} key={title}>
            <Icon size={30} strokeWidth={1.2} />
            <h3>{title}</h3>
            <p>{description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

export async function BusinessSolutions() {
  return patchSection(BusinessSolutionsTemplate(), await getSettings("section:solutions", {}));
}

export async function BrandStory() {
  return patchSection(BrandStoryTemplate(), await getSettings("section:story", {}));
}

export async function SupportSection() {
  return patchSection(SupportSectionTemplate(), await getSettings("section:support", {}));
}
