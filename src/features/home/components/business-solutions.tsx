import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Link2, Monitor, PackageCheck } from "lucide-react";
import { sunford } from "@/features/home/data/brand";
import { solutionImages } from "../data/business-solutions";
import styles from "./business-solutions.module.css";

export function BusinessSolutionsTemplate() {
  return (
    <section
      id="solutions"
      className={`${styles.section} container`}
      aria-labelledby="solutions-heading"
    >
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>ONE CONNECTED ECOSYSTEM</p>
          <h2 id="solutions-heading">
            เมื่อทุกอย่างเชื่อมถึงกัน
            <span>ธุรกิจก็ไปได้ไกลขึ้น</span>
          </h2>
        </div>
        <p className={styles.introduction}>
          เชื่อมต่อเครื่องชั่ง ข้อมูล และการทำงาน
          <br />
          ให้ทุกขั้นตอนของธุรกิจเป็นเรื่องง่าย
        </p>
      </header>

      <div className={styles.grid}>
        <article className={styles.feature}>
          <Image
            className={styles.featureImage}
            src={solutionImages.feature}
            alt="เครื่องชั่ง SUNFORD POS บนเคาน์เตอร์ร้านค้า"
            fill
            sizes="(max-width: 720px) 94vw, (max-width: 1280px) 54vw, 658px"
          />
          <div className={styles.featureCopy}>
            <p className={styles.featureEyebrow}>SUNFORD BUSINESS SOLUTIONS</p>
            <h3>
              จากหน้าร้าน<span>ถึงหลังบ้าน.</span>
            </h3>
            <p className={styles.featureTagline}>ครบ จบ เชื่อมต่อกัน</p>
            <p className={styles.featureDescription}>
              เครื่องชั่งและระบบ POS ที่ทำงานร่วมกัน
              <br />
              เพื่อให้คุณมีเวลาโฟกัสกับสิ่งที่สำคัญกว่า
            </p>
            <Link href="/products/pos1100" className={styles.featureButton}>
              ค้นพบ SUNFORD POS <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <Image
            className={styles.connections}
            src={solutionImages.connections}
            alt=""
            aria-hidden="true"
            width={144}
            height={204}
          />
        </article>

        <div className={styles.cards}>
          <Link href={sunford.accessories} className={styles.card}>
            <div className={styles.cardCopy}>
              <span className={styles.cardIcon}>
                <PackageCheck size={23} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <p className={styles.cardEyebrow}>ACCESSORIES</p>
              <h3>อุปกรณ์เสริม</h3>
              <p className={styles.cardDescription}>
                เครื่องพิมพ์ จอแสดงผล และอุปกรณ์ POS <br />
                เพื่อขยายการใช้งานให้เหมาะกับธุรกิจ
              </p>
            </div>
            <div className={styles.cardArtwork}>
              <Image
                src={solutionImages.accessories}
                alt="เครื่องพิมพ์ จอแสดงผล และอุปกรณ์ POS ซันฟอร์ด"
                fill
                sizes="(max-width: 720px) 44vw, 245px"
              />
            </div>
          </Link>
          <Link href={sunford.software} className={`${styles.card} ${styles.software}`}>
            <div className={styles.cardCopy}>
              <span className={styles.cardIcon}>
                <Monitor size={23} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <p className={styles.cardEyebrow}>SOFTWARE & APPLICATIONS</p>
              <h3>แอปพลิเคชันและซอฟต์แวร์</h3>
              <p className={styles.cardDescription}>
                สำหรับงานค้าปลีก การผลิตอุตสาหกรรม
                <br />
                และการดูแลครัวเรือนกับสุขภาพ
              </p>
            </div>
            <div className={styles.cardArtwork}>
              <Image
                src={solutionImages.software}
                alt="ภาพประกอบการจัดการข้อมูลผ่านแท็บเล็ตและโทรศัพท์"
                fill
                sizes="(max-width: 720px) 44vw, 245px"
              />
            </div>
          </Link>
        </div>
      </div>

      <nav className={styles.links} aria-label="โซลูชันและซอฟต์แวร์ที่เกี่ยวข้อง">
        <span>
          <Link2 size={17} aria-hidden="true" />
          เชื่อมต่อกับ Sunford
        </span>
        <Link href={sunford.erp}>
          โซลูชัน ERP <ArrowRight size={14} aria-hidden="true" />
        </Link>
        <Link href={sunford.mes}>
          โซลูชัน MES <ArrowRight size={14} aria-hidden="true" />
        </Link>
        <Link href={sunford.downloads}>
          ดาวน์โหลดซอฟต์แวร์ <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </nav>
    </section>
  );
}
