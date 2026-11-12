import { defaultSite } from "@/features/site/data/settings";
import type { SiteSettings } from "@/features/site/types";
import { cacheLife, cacheTag } from "next/cache";
import { getSettings } from "@/features/site/server/documents";
import { patchSection } from "@/features/site/server/section-tree";
import { ContactBannerVisibility } from "@/components/contact/contact-banner-visibility";
import { CustomerCoverage } from "@/features/customer-map/components/customer-coverage";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp, Globe, Mail, MapPin, Phone } from "lucide-react";

import { sunford } from "@/features/home/data/brand";

export function FooterTemplate(site: SiteSettings = defaultSite, customerMapEnabled = true) {
  return (
    <footer id="contact" className="site-footer">
      <ContactBannerVisibility>
        <div className="contact-banner">
          <div className="container contact-inner">
            <div>
              <p className="eyebrow">LET’S MOVE YOUR BUSINESS FORWARD</p>
              <h2>
                ความสำเร็จครั้งต่อไป
                <br />
                เริ่มต้นด้วยการเลือกที่ใช่
              </h2>
            </div>
            <a href={site.line} className="button button-white" target="_blank" rel="noreferrer">
              คุยกับผู้เชี่ยวชาญ
            </a>
          </div>
        </div>
      </ContactBannerVisibility>
      <div className="footer-surface">
        <div className="footer-scene" aria-hidden="true">
          <Image
            src="/images/home-categories/digital.webp"
            alt=""
            fill
            sizes="(max-width: 800px) 100vw, 25vw"
          />
        </div>
        <div className="container footer-main">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <Image src={site.logo} alt={site.name} width={210} height={43} />
            </Link>
            <p className="footer-tagline">
              <strong>ความเที่ยงตรง ที่คุณวางใจ</strong>
              <span>Precision you can trust.</span>
            </p>
            <div className="footer-contact-list">
              <a href={site.phoneHref} className="footer-contact-row">
                <span className="footer-contact-icon">
                  <Phone size={17} />
                </span>
                <span className="footer-contact-text">{site.phone}</span>
              </a>
              <a href={`mailto:${site.email}`} className="footer-contact-row">
                <span className="footer-contact-icon">
                  <Mail size={17} />
                </span>
                <span className="footer-contact-text">{site.email}</span>
              </a>
              <Link href={sunford.contact} className="footer-contact-row footer-address">
                <span className="footer-contact-icon">
                  <MapPin size={17} strokeWidth={1.8} />
                </span>
                <span className="footer-contact-text">
                  <strong>ศูนย์บริการลูกค้าซันฟอร์ด</strong>
                  <span>
                    99 หมู่ 9 ต.บางระกำ อ.บางเลน
                    <br />
                    จ.นครปฐม 73130
                  </span>
                </span>
              </Link>
            </div>
          </div>
          <nav className="footer-links" aria-label="ผลิตภัณฑ์ Sunford">
            <h3>ผลิตภัณฑ์</h3>
            <Link href="/products/category/scales">เครื่องชั่งดิจิทัล</Link>
            <Link href="/products/category/accessories">อุปกรณ์เสริม</Link>
            <Link href="/products/category/pos">ระบบ POS และอุปกรณ์</Link>
            <Link href={sunford.software}>แอปพลิเคชันและซอฟต์แวร์</Link>
          </nav>
          <nav className="footer-links" aria-label="เกี่ยวกับ Sunford">
            <h3>รู้จักซันฟอร์ด</h3>
            <Link href="/#story">เรื่องราวของเรา</Link>
            <Link href={sunford.erp}>ERP</Link>
            <Link href={sunford.mes}>MES</Link>
            <a href="https://www.sunford.co" target="_blank" rel="noreferrer">
              เว็บไซต์ Sunford
            </a>
          </nav>
          <div className="footer-links footer-care">
            <h3>พร้อมดูแลคุณ</h3>
            <Link href={sunford.service}>บริการหลังการขาย</Link>
            <Link href={sunford.warranty}>ลงทะเบียนรับประกัน</Link>
            <Link href={sunford.downloads}>ดาวน์โหลดซอฟต์แวร์</Link>
            <a href={site.line} target="_blank" rel="noreferrer">
              LINE @sunford
            </a>
            <div className="footer-socials" aria-label="ติดตาม Sunford">
              {site.messenger && (
                <a
                  href={site.messenger}
                  className="footer-social-facebook"
                  aria-label="Facebook Messenger Sunford"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M14 22v-9h3l.5-3.5H14V7.3c0-1 .3-1.8 1.8-1.8h1.9V2.4a25 25 0 0 0-2.8-.2c-2.8 0-4.7 1.7-4.7 4.8v2.5H7V13h3.2v9Z"
                    />
                  </svg>
                </a>
              )}
              <a
                href={site.line}
                className="footer-social-line"
                aria-label="LINE Sunford"
                target="_blank"
                rel="noreferrer"
              >
                <Image src="/images/brands/line-brand-icon.png" alt="" width={25} height={25} />
              </a>
              <a
                href="https://www.youtube.com/@sunfordthai1215"
                className="footer-social-youtube"
                aria-label="YouTube Sunford"
                target="_blank"
                rel="noreferrer"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M21.6 6.5a2.7 2.7 0 0 0-1.9-1.9C18 4.2 12 4.2 12 4.2s-6 0-7.7.4a2.7 2.7 0 0 0-1.9 1.9A28 28 0 0 0 2 12a28 28 0 0 0 .4 5.5 2.7 2.7 0 0 0 1.9 1.9c1.7.4 7.7.4 7.7.4s6 0 7.7-.4a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-5.5ZM10 15.4l5.7-3.4L10 8.6v6.8Z"
                  />
                </svg>
              </a>
              <a
                href={sunford.website}
                className="footer-social-website"
                aria-label="เว็บไซต์ Sunford"
                target="_blank"
                rel="noreferrer"
              >
                <Globe size={20} />
              </a>
            </div>
          </div>
          <CustomerCoverage enabled={customerMapEnabled}>
            <Image
              src="/images/footer/thailand.svg"
              alt="แผนที่ประเทศไทย"
              width={160}
              height={300}
            />
            <div>
              <h3>
                ครอบคลุม
                <br />
                ทั่วประเทศ
              </h3>
              <p>
                จัดส่งทั่วประเทศไทย
                <br />
                พร้อมทีมดูแล
                <br />
                และให้คำปรึกษา
              </p>
            </div>
          </CustomerCoverage>
        </div>
      </div>
      <div className="footer-bottom-bar">
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} SUNFORD. All rights reserved.</span>
          <span>Designed for precision. Built for possibility.</span>
          <a href="#main-content">
            กลับด้านบน <ArrowUp size={15} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export async function Footer() {
  "use cache";
  cacheLife("hours");
  cacheTag("cms");
  const site = await getSettings("site", defaultSite);
  const edits = await getSettings("section:footer", { customerMapEnabled: true });
  return patchSection(FooterTemplate(site, edits.customerMapEnabled), edits);
}
