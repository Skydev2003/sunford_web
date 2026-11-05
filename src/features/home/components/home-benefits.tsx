import Link from "next/link";
import { GitCompareArrows, Headphones, ShieldCheck, Truck } from "lucide-react";
import styles from "./home-benefits.module.css";

const benefits = [
  { title: "จัดส่งถึงคุณ.", detail: "ครอบคลุมทั่วประเทศไทย", href: "/contact-us", icon: Truck },
  {
    title: "ปรึกษาผู้เชี่ยวชาญ.",
    detail: "เลือกให้ตรงกับงานของคุณ",
    href: "/contact-us",
    icon: Headphones,
  },
  {
    title: "ดูแลหลังการขาย.",
    detail: "พร้อมข้อมูลการรับประกัน",
    href: "/warranty/policy",
    icon: ShieldCheck,
  },
  {
    title: "เปรียบเทียบก่อนเลือก.",
    detail: "ดูรายละเอียดได้สูงสุด 3 รุ่น",
    href: "/products",
    icon: GitCompareArrows,
  },
];

export function HomeBenefits() {
  return (
    <section className={styles.section} aria-labelledby="home-benefits-heading">
      <div className={styles.inner}>
        <h2 id="home-benefits-heading" className={styles.heading}>
          เลือก Sunford. <span>พร้อมเคียงข้างทุกธุรกิจ</span>
        </h2>
        <div className={styles.grid}>
          {benefits.map(({ title, detail, href, icon: Icon }) => (
            <Link key={title} href={href} className={styles.card}>
              <Icon className={styles.icon} size={30} strokeWidth={1.6} aria-hidden="true" />
              <div className={styles.copy}>
                <h3>{title}</h3>
                <p>{detail}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
