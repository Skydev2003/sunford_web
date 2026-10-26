import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CircleCheck,
  Monitor,
  PackageCheck,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { sunford } from "@/features/home/data/brand";

export function BusinessSolutions() {
  return (
    <section id="solutions" className="solutions-section container">
      <div className="section-heading">
        <div>
          <p className="eyebrow">ONE CONNECTED ECOSYSTEM</p>
          <h2>
            เมื่อทุกอย่างเชื่อมถึงกัน
            <br />
            <span className="muted">ธุรกิจก็ไปได้ไกลขึ้น</span>
          </h2>
        </div>
        <p className="heading-description">
          เชื่อมต่อเครื่องชั่ง ข้อมูล และการทำงาน
          <br />
          ให้ทุกขั้นตอนของธุรกิจเป็นเรื่องง่าย
        </p>
      </div>
      <div className="solutions-grid">
        <div className="solution-feature">
          <div className="solution-feature-copy">
            <span className="mini-label">SUNFORD BUSINESS SOLUTIONS</span>
            <h3>
              จากหน้าร้าน
              <br />
              ถึงหลังบ้าน.
              <br />
              <span>ครบ จบ เชื่อมต่อกัน</span>
            </h3>
            <p>
              เครื่องชั่งและระบบ POS ที่ทำงานร่วมกัน
              <br />
              เพื่อให้คุณมีเวลาโฟกัสกับสิ่งที่สำคัญกว่า
            </p>
            <Link href="/products/pos1100" className="text-link">
              ค้นพบ SUNFORD POS <ArrowRight size={17} />
            </Link>
          </div>
          <div className="solution-image">
            <Image
              src="/images/products/pos1100.png"
              alt="ระบบขายหน้าร้านและเครื่องชั่ง SUNFORD POS"
              fill
              sizes="(max-width: 800px) 90vw, 50vw"
            />
          </div>
        </div>
        <div className="solution-small-cards">
          <a href={sunford.accessories} className="solution-small">
            <div className="solution-icon">
              <PackageCheck size={24} strokeWidth={1.4} />
              <ArrowUpRight size={19} />
            </div>
            <span>ACCESSORIES</span>
            <h3>อุปกรณ์เสริม</h3>
            <p>
              เครื่องพิมพ์ จอแสดงผล และอุปกรณ์ POS
              <br />
              เพื่อขยายการใช้งานให้เหมาะกับธุรกิจ
            </p>
          </a>
          <a href={sunford.software} className="solution-small">
            <div className="solution-icon">
              <Monitor size={24} strokeWidth={1.4} />
              <ArrowUpRight size={19} />
            </div>
            <span>SOFTWARE & APPLICATIONS</span>
            <h3>แอปพลิเคชันและซอฟต์แวร์</h3>
            <p>
              สำหรับงานค้าปลีก การผลิตอุตสาหกรรม
              <br />
              และการดูแลครัวเรือนกับสุขภาพ
            </p>
          </a>
        </div>
      </div>
      <div className="ecosystem-links">
        <span>เชื่อมต่อกับ Sunford</span>
        <a href={sunford.erp}>
          โซลูชัน ERP <ArrowUpRight size={15} />
        </a>
        <a href={sunford.mes}>
          โซลูชัน MES <ArrowUpRight size={15} />
        </a>
        <a href={sunford.downloads}>
          ดาวน์โหลดซอฟต์แวร์ <ArrowUpRight size={15} />
        </a>
      </div>
    </section>
  );
}

export function BrandStory() {
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

export function SupportSection() {
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
      href: sunford.contact,
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
