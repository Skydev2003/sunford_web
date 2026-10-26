import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";
import { cacheLife } from "next/cache";

export async function Footer() {
  "use cache";
  cacheLife("days");
  return (
    <footer id="contact">
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
          <a
            href="https://line.me/R/ti/p/@sunford"
            className="button button-white"
            target="_blank"
            rel="noreferrer"
          >
            คุยกับผู้เชี่ยวชาญ <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
      <div className="container footer-main">
        <div className="footer-brand">
          <Link href="/">
            <Image src="/images/sunford-logo.png" alt="SUNFORD" width={151} height={31} />
          </Link>
          <p>
            ความเที่ยงตรง ที่คุณวางใจ
            <br />
            Precision you can trust.
          </p>
          <a href="tel:034276999">
            <Phone size={15} /> 034-276-999
          </a>
        </div>
        <div>
          <h3>ผลิตภัณฑ์</h3>
          <Link href="/products">เครื่องชั่งดิจิทัล</Link>
          <Link href="/products">เครื่องชั่งอุตสาหกรรม</Link>
          <Link href="/products">ระบบ POS และอุปกรณ์</Link>
        </div>
        <div>
          <h3>รู้จักซันฟอร์ด</h3>
          <Link href="/#story">เรื่องราวของเรา</Link>
          <Link href="/#solutions">โซลูชันธุรกิจ</Link>
          <a href="https://www.sunford.co" target="_blank" rel="noreferrer">
            เว็บไซต์ Sunford <ArrowUpRight size={12} />
          </a>
        </div>
        <div>
          <h3>พร้อมดูแลคุณ</h3>
          <Link href="/#support">บริการหลังการขาย</Link>
          <a href="https://line.me/R/ti/p/@sunford" target="_blank" rel="noreferrer">
            LINE @sunford <ArrowUpRight size={12} />
          </a>
          <p className="footer-address">
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
