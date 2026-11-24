import Image from "next/image";
import { ArrowRight, ArrowUpRight, Mail, Phone } from "lucide-react";
import { defaultSite } from "@/features/site/data/settings";
import { getSettings } from "@/features/site/server/documents";
import { contactLocations } from "../data/contact-locations";
import styles from "./contact-page.module.css";
import { ContactMap } from "./contact-map";

const bangLen = contactLocations.find((location) => location.id === "service")!;
const facebookHref = "https://www.facebook.com/sunfordthai";

export async function ContactChannels() {
  const site = await getSettings("site", defaultSite);

  return (
    <div className={styles.contactPanel}>
      <section className={styles.channels} aria-label="ช่องทางติดต่อซันฟอร์ด">
        <a
          className={`${styles.channel} ${styles.facebookChannel}`}
          href={facebookHref}
          target="_blank"
          rel="noreferrer"
        >
          <span className={styles.icon}>
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M14 22v-9h3l.5-3.5H14V7.3c0-1 .3-1.8 1.8-1.8h1.9V2.4a25 25 0 0 0-2.8-.2c-2.8 0-4.7 1.7-4.7 4.8v2.5H7V13h3.2v9Z"
              />
            </svg>
          </span>
          <span className={styles.channelCopy}>
            <span className={styles.channelLabel}>Facebook</span>
            <strong>@sunfordthai</strong>
            <span className={styles.channelNote}>ติดตามข่าวสารจากซันฟอร์ด</span>
          </span>
          <span className={styles.channelArrow}>
            <ArrowUpRight size={18} aria-hidden="true" />
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
        <a className={`${styles.channel} ${styles.phoneChannel}`} href={site.phoneHref}>
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
        <a className={`${styles.channel} ${styles.emailChannel}`} href={`mailto:${site.email}`}>
          <span className={styles.icon}>
            <Mail size={24} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <span className={styles.channelCopy}>
            <span className={styles.channelLabel}>อีเมลสอบถาม</span>
            <strong className={styles.email}>{site.email}</strong>
            <span className={styles.channelNote}>เขียนอีเมลถึงทีมงาน</span>
          </span>
          <span className={styles.channelArrow}>
            <ArrowRight size={18} aria-hidden="true" />
          </span>
        </a>
        <div className={styles.mapChannel}>
          <a
            className={`${styles.channel} ${styles.mapDetails}`}
            href={bangLen.map}
            target="_blank"
            rel="noreferrer"
          >
            <span className={styles.icon}>
              <Image src="/images/brands/google-maps-icon.png" alt="" width={32} height={32} />
            </span>
            <span className={styles.channelCopy}>
              <span className={styles.channelLabel} translate="no">
                Google Maps
              </span>
              <strong>สำนักงานบางเลน</strong>
              <span className={styles.channelNote}>ต.บางระกำ จ.นครปฐม</span>
            </span>
            <span className={styles.channelArrow}>
              <ArrowUpRight size={18} aria-hidden="true" />
            </span>
          </a>
          <ContactMap src={bangLen.satelliteMap} />
        </div>
      </section>
    </div>
  );
}
