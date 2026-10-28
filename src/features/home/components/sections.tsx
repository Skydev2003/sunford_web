import { getSettings } from "@/features/cms/server/documents";
import { patchSection } from "@/features/cms/server/section-tree";
import Image from "next/image";
import {
  ArrowUpRight,
  BookOpen,
  CircleCheck,
  PackageCheck,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { sunford } from "@/features/home/data/brand";
import { BusinessSolutionsTemplate } from "./business-solutions";

export { BusinessSolutionsTemplate } from "./business-solutions";

export function BrandStoryTemplate() {
  return (
    <section id="story" className="story-section">
      <div className="container story-grid">
        <div className="story-image">
          <Image
            src="/images/business-story.png"
            alt="ผู้ประกอบการร้านค้ากับเครื่องชั่ง Sunford ในการทำงานจริง"
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
          />
          <span className="story-image-label">REAL PEOPLE. REAL POSSIBILITIES.</span>
        </div>
        <div className="story-copy">
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
          <a className="text-link" href={sunford.about}>
            รู้จักเรื่องราวของ Sunford <ArrowUpRight size={17} />
          </a>
          <div className="story-signature">
            SUNFORD<span>Precision you can trust.</span>
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
