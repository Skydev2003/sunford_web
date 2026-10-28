import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ChevronRight } from "lucide-react";
import { sunford } from "@/features/home/data/brand";
import styles from "./about-page.module.css";

// Copy and photographs from the imported /about-us page. Keep the original
// story intact, with paragraph breaks and descriptive headings for readability.
const principles = [
  {
    title: "คุณภาพที่เชื่อมั่นได้",
    text: "เครื่องชั่งดิจิทัลเทคโนโลยีทันสมัย มีคุณภาพมาตรฐาน เพื่อการทำงานของผู้ประกอบการ",
  },
  {
    title: "ใช้งานง่าย แข็งแรงทนทาน",
    text: "ให้ความสำคัญกับความทนทานและการใช้งานที่ไม่ซับซ้อน เพื่อให้ทุกคนได้ทำสิ่งที่ตัวเองรัก",
  },
  {
    title: "ดูแลต่อเนื่องหลังการขาย",
    text: "บริการหลังการขายที่มีประสิทธิภาพ พร้อมเป็นส่วนหนึ่งของโอกาสและการเติบโตของธุรกิจคุณ",
  },
];

export function AboutPage() {
  return (
    <main id="main-content" className={styles.page}>
      <div className={`container ${styles.container}`}>
        <nav className={styles.breadcrumb} aria-label="เส้นทางนำทาง">
          <Link href="/">หน้าแรก</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page">รู้จักซันฟอร์ด</span>
        </nav>

        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>ABOUT SUNFORD</p>
            <h1>
              แม่นยำในทุกน้ำหนัก<span>ใส่ใจในทุกการบริการ</span>
            </h1>
          </div>
          <div className={styles.heroCopy}>
            <p>
              เราคือพันธมิตรที่พร้อมเติบโต
              <br className={styles.desktopBreak} />
              ไปกับธุรกิจของคุณ
            </p>
            <a href="#our-story">
              รู้จักจุดเริ่มต้นของเรา <ArrowDown size={15} aria-hidden="true" />
            </a>
          </div>
        </header>

        <figure className={styles.company}>
          <div className={styles.companyImage}>
            <Image
              src="/images/imported/5699e0f3b495614d83a7.png"
              alt="อาคารซันฟอร์ดและรถขนส่งสินค้าที่ติดตรา SUNFORD"
              fill
              preload
              sizes="(max-width: 720px) 94vw, (max-width: 1200px) 92vw, 1100px"
            />
          </div>
          <figcaption>
            <span>SUNFORD</span>ภาพสถานที่และรถขนส่งของซันฟอร์ด
          </figcaption>
        </figure>

        <section id="our-story" className={styles.story} aria-labelledby="about-story-heading">
          <div className={styles.storyHeading}>
            <p className={styles.sectionLabel}>OUR BEGINNING</p>
            <h2 id="about-story-heading">จุดเริ่มต้นของเรา</h2>
            <span className={styles.shortRule} aria-hidden="true" />
          </div>
          <div className={styles.storyCopy}>
            <p className={styles.lead}>
              ซันฟอร์ด (SUNFORD) เกิดขึ้นจากความมุ่งมั่นตั้งใจ
              ที่ต้องการเป็นส่วนหนึ่งในการพัฒนาขีดความสามารถในการแข่งขันให้ผู้ประกอบการ โรงงาน
              ธุรกิจร้านค้า ร้านค้าปลีก และผู้ค้ารายย่อยทั่วโลก
            </p>
            <p>
              ด้วยสินค้าเครื่องชั่งดิจิทัลเทคโนโลยีทันสมัย มีคุณภาพมาตรฐาน แข็งแรงทนทาน ใช้งานง่าย
              และบริการหลังการขายที่มีประสิทธิภาพ
            </p>
            <p>
              เพื่อให้ทุกคนได้ทำสิ่งที่ตัวเองรัก ได้ภูมิใจในความสำเร็จ ได้พบโอกาสทางอาชีพใหม่ ๆ
              มีความหวังจากรายได้ที่เพิ่มขึ้น และมีความสุขกับชีวิตความเป็นอยู่ที่ดีขึ้น
            </p>
          </div>
        </section>

        <section className={styles.principles} aria-labelledby="about-principles-heading">
          <header className={styles.principlesHeading}>
            <p className={styles.sectionLabel}>WHAT MATTERS TO US</p>
            <h2 id="about-principles-heading">สิ่งที่เราให้ความสำคัญ</h2>
          </header>
          <div className={styles.principleGrid}>
            {principles.map((principle, index) => (
              <article key={principle.title}>
                <span className={styles.number} aria-hidden="true">
                  0{index + 1}
                </span>
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
                {index === 2 && (
                  <Link href={sunford.service}>
                    บริการหลังการขาย <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className={styles.nextStep} aria-labelledby="about-next-heading">
          <div>
            <p className={styles.sectionLabel}>GROW TOGETHER</p>
            <h2 id="about-next-heading">พร้อมเติบโตไปกับธุรกิจของคุณ</h2>
            <p>ค้นหาเครื่องชั่งที่เหมาะกับงาน หรือพูดคุยกับทีมซันฟอร์ด</p>
          </div>
          <div className={styles.actions}>
            <Link href="/products" className={styles.primary}>
              ดูผลิตภัณฑ์ <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href={sunford.contact} className={styles.secondary}>
              ติดต่อเรา <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
