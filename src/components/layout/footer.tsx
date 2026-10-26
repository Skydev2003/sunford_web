import { defaultSite } from "@/features/cms/data/settings";
import type { SiteSettings } from "@/features/cms/types";
import { cacheLife, cacheTag } from "next/cache";
import { getSettings } from "@/features/cms/server/documents";
import { patchSection, sectionValue } from "@/features/cms/server/section-tree";
import { FloatingContact } from "@/components/contact/floating-contact";
import { ContactBannerVisibility } from "@/components/contact/contact-banner-visibility";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";

import { sunford } from "@/features/home/data/brand";

export function FooterTemplate(site: SiteSettings = defaultSite) {
  return (
    <footer id="contact">
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
              คุยกับผู้เชี่ยวชาญ <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </ContactBannerVisibility>
      <div className="container footer-main">
        <div className="footer-brand">
          <Link href="/">
            <Image src={site.logo} alt={site.name} width={151} height={31} />
          </Link>
          <p>
            ความเที่ยงตรง ที่คุณวางใจ
            <br />
            Precision you can trust.
          </p>
          <a href={site.phoneHref}>
            <Phone size={15} /> {site.phone}
          </a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <p className="footer-hours">
            {sunford.hours}
            <br />
            หยุดวันอาทิตย์และวันหยุดราชการ
          </p>
        </div>
        <div>
          <h3>ผลิตภัณฑ์</h3>
          <Link href="/products">เครื่องชั่งดิจิทัล</Link>
          <a href={sunford.accessories} target="_blank" rel="noreferrer">
            อุปกรณ์เสริม
          </a>
          <Link href="/products">ระบบ POS และอุปกรณ์</Link>
          <a href={sunford.software} target="_blank" rel="noreferrer">
            แอปพลิเคชันและซอฟต์แวร์
          </a>
        </div>
        <div>
          <h3>รู้จักซันฟอร์ด</h3>
          <Link href="/#story">เรื่องราวของเรา</Link>
          <Link href="/#solutions">โซลูชันธุรกิจ</Link>
          <a href={sunford.erp} target="_blank" rel="noreferrer">
            ERP
          </a>
          <a href={sunford.mes} target="_blank" rel="noreferrer">
            MES
          </a>
          <a href="https://www.sunford.co" target="_blank" rel="noreferrer">
            เว็บไซต์ Sunford <ArrowUpRight size={12} />
          </a>
        </div>
        <div>
          <h3>พร้อมดูแลคุณ</h3>
          <Link href="/#support">บริการหลังการขาย</Link>
          <a href={sunford.warranty} target="_blank" rel="noreferrer">
            ลงทะเบียนรับประกัน
          </a>
          <a href={sunford.downloads} target="_blank" rel="noreferrer">
            ดาวน์โหลดซอฟต์แวร์
          </a>
          <a href={site.line} target="_blank" rel="noreferrer">
            LINE @sunford <ArrowUpRight size={12} />
          </a>
          <p className="footer-address">
            ศูนย์บริการลูกค้าซันฟอร์ด
            <br />
            99 หมู่ 9 ต.บางระกำ อ.บางเลน
            <br />
            จ.นครปฐม 73130
          </p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} SUNFORD. All rights reserved.</span>
        <span>Designed for precision. Built for possibility.</span>
        <a href="#main-content">กลับด้านบน ↑</a>
      </div>
    </footer>
  );
}

export async function Footer() {
  "use cache";
  cacheLife("hours");
  cacheTag("cms");
  const site = await getSettings("site", defaultSite);
  const edits = await getSettings("section:footer", {});
  return (
    <>
      {patchSection(FooterTemplate(site), edits)}
      <FloatingContact
        site={site}
        expertLabel={sectionValue(edits, "text", "คุยกับผู้เชี่ยวชาญ ").trim()}
        expertHref={sectionValue(edits, "href", site.line)}
      />
    </>
  );
}
