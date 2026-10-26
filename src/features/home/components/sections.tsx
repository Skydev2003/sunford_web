import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CircleCheck,
  Headphones,
  Monitor,
  PackageCheck,
  ShieldCheck,
  Wrench,
} from "lucide-react";

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
          <span className="solution-watermark" aria-hidden="true">
            connected.
          </span>
        </div>
        <div className="solution-small-cards">
          <a href="#contact" className="solution-small">
            <div className="solution-icon">
              <Boxes size={24} strokeWidth={1.4} />
              <ArrowUpRight size={19} />
            </div>
            <span>FOR YOUR PRODUCTION</span>
            <h3>งานผลิตที่คล่องตัวกว่า</h3>
            <p>
              จัดการข้อมูลการชั่งและกระบวนการผลิต
              <br />
              ด้วยโซลูชันที่เหมาะกับโรงงานของคุณ
            </p>
          </a>
          <a href="#contact" className="solution-small">
            <div className="solution-icon">
              <Monitor size={24} strokeWidth={1.4} />
              <ArrowUpRight size={19} />
            </div>
            <span>SOFTWARE & APPLICATIONS</span>
            <h3>ข้อมูลที่พร้อมให้คุณตัดสินใจ</h3>
            <p>
              เชื่อมต่อข้อมูล สู่การจัดการที่ง่ายขึ้น
              <br />
              ด้วยแอปพลิเคชันและซอฟต์แวร์ Sunford
            </p>
          </a>
        </div>
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
            เราเชื่อว่าความแม่นยำเล็ก ๆ สร้างโอกาสที่ยิ่งใหญ่ได้ ตั้งแต่ส่วนผสมจานแรก
            ยอดขายในแต่ละวัน ไปจนถึงสายการผลิตที่เติบโต
          </p>
          <p>
            Sunford จึงพัฒนาเครื่องชั่งและโซลูชันที่ใช้งานง่าย
            เพื่อให้ผู้ประกอบการได้ทำสิ่งที่รักอย่างมั่นใจ และก้าวต่อไปได้ในทุกวัน
          </p>
          <a className="text-link" href="https://www.sunford.co" target="_blank" rel="noreferrer">
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
      icon: ShieldCheck,
      title: "มั่นใจในคุณภาพ",
      description: "เลือกสินค้าที่เหมาะกับงาน พร้อมคำแนะนำจากทีมงาน",
    },
    {
      icon: Wrench,
      title: "ดูแลตลอดการใช้งาน",
      description: "บริการหลังการขายและทีมช่างของ Sunford",
    },
    {
      icon: PackageCheck,
      title: "ส่งถึงธุรกิจคุณ",
      description: "บริการจัดส่งสินค้า ครอบคลุมทั่วประเทศไทย",
    },
    {
      icon: Headphones,
      title: "ผู้เชี่ยวชาญที่พร้อมช่วย",
      description: "ให้คำปรึกษา เลือกเครื่องชั่งและโซลูชันที่ใช่",
    },
  ];
  return (
    <section id="support" className="support-section container">
      <div className="support-heading">
        <p className="eyebrow">ALWAYS BY YOUR SIDE</p>
        <h2>
          มากกว่าสินค้า คือการดูแลที่วางใจได้ <CircleCheck size={23} strokeWidth={1.4} />
        </h2>
      </div>
      <div className="support-grid">
        {services.map(({ icon: Icon, title, description }) => (
          <a href="#contact" key={title}>
            <Icon size={30} strokeWidth={1.2} />
            <h3>{title}</h3>
            <p>{description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
