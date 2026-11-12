import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Mail, Phone, Printer } from "lucide-react";
import { defaultSite } from "@/features/site/data/settings";
import { getSettings } from "@/features/site/server/documents";
import { sunford } from "@/features/home/data/brand";
import { defaultContactLocationImages } from "../data/contact-locations";
import { ContactLocations } from "./contact-locations";
import styles from "./contact-page.module.css";

export async function ContactPage() {
  const [site, locationImages] = await Promise.all([
    getSettings("site", defaultSite),
    getSettings("contact-locations", defaultContactLocationImages),
  ]);

  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.contactIntro}>
        <div className={styles.heroContainer}>
          <nav className={styles.breadcrumb} aria-label="เส้นทางนำทาง">
            <Link href="/">หน้าแรก</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">ติดต่อเรา</span>
          </nav>

          <header className={styles.hero}>
            <div className={styles.introduction}>
              <p className={`eyebrow ${styles.eyebrow}`}>CONTACT US</p>
              <h1>
                ติดต่อเรา<span>พร้อมดูแลคุณในทุกการใช้งาน</span>
              </h1>
              <p className={styles.description}>
                สอบถามข้อมูลสินค้า รับคำปรึกษา หรือต้องการความช่วยเหลือ
                <br className={styles.desktopBreak} /> ทีมงานของเราพร้อมให้บริการอย่างรวดเร็ว
              </p>
            </div>
            <div className={styles.heroVisual}>
              <Image
                className={styles.representative}
                src="/images/contact/support-representative.webp"
                alt=""
                fill
                sizes="(max-width: 600px) 210px, 300px"
                preload
              />
            </div>
          </header>

          <section className={styles.channels} aria-label="ช่องทางติดต่อซันฟอร์ด">
            <a className={styles.channel} href={site.phoneHref}>
              <span className={styles.icon}>
                <Phone size={24} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span className={styles.channelCopy}>
                <span className={styles.channelLabel}>โทรศัพท์</span>
                <strong>{site.phone}</strong>
                <span className={styles.channelNote}>สอบถามข้อมูล / บริการหลังการขาย</span>
              </span>
              <span className={styles.channelArrow}>
                <ArrowRight size={18} aria-hidden="true" />
              </span>
            </a>
            <a
              className={`${styles.channel} ${styles.lineChannel}`}
              href={site.line}
              target="_blank"
              rel="noreferrer"
            >
              <span className={styles.lineIcon}>
                <Image src="/images/brands/line-brand-icon.png" alt="" width={44} height={44} />
              </span>
              <span className={styles.channelCopy}>
                <span className={styles.channelLabel}>LINE OFFICIAL</span>
                <strong>@sunford</strong>
                <span className={styles.channelNote}>แชทกับทีมงานได้ทันที</span>
              </span>
              <span className={styles.channelArrow}>
                <ArrowRight size={18} aria-hidden="true" />
              </span>
            </a>
            <a className={styles.channel} href={`mailto:${site.email}`}>
              <span className={styles.icon}>
                <Mail size={24} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span className={styles.channelCopy}>
                <span className={styles.channelLabel}>อีเมลสอบถาม</span>
                <strong className={styles.email}>{site.email}</strong>
                <span className={styles.channelNote}>ส่งรายละเอียดมาได้ตลอด 24 ชั่วโมง</span>
              </span>
              <span className={styles.channelArrow}>
                <ArrowRight size={18} aria-hidden="true" />
              </span>
            </a>
            <div className={`${styles.channel} ${styles.hours}`}>
              <span className={styles.icon}>
                <Clock3 size={24} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div className={styles.channelCopy}>
                <h2>เวลาทำการ</h2>
                <p className={styles.schedule}>{sunford.hours}</p>
                <p className={styles.holiday}>หยุดวันอาทิตย์และวันหยุดราชการ</p>
              </div>
            </div>
          </section>
          <p className={styles.fax}>
            <Printer size={15} aria-hidden="true" /> โทรสาร 03-427-6998
          </p>
        </div>
      </div>

      <ContactLocations images={locationImages} />
    </main>
  );
}
