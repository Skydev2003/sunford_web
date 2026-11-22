import type { Metadata } from "next";
import Link from "next/link";
import { sunford } from "@/features/home/data/brand";

export const metadata: Metadata = { title: "ลงทะเบียนรับประกัน" };

export default function WarrantyRegistrationPage() {
  return (
    <main id="main-content" className="source-content-page">
      <header className="content-heading container">
        <h1>ลงทะเบียนรับประกัน</h1>
        <p>ขณะนี้เว็บไซต์ยังไม่มีแบบฟอร์มลงทะเบียนรับประกันที่ยืนยันแล้ว</p>
        <p>ติดต่อฝ่ายบริการซันฟอร์ดเพื่อสอบถามช่องทางลงทะเบียนสำหรับสินค้าของคุณ</p>
      </header>
      <nav className="container source-section-links" aria-label="ข้อมูลการรับประกัน">
        <Link href={sunford.contact} className="button button-red">
          ติดต่อฝ่ายบริการ
        </Link>
        <Link href={sunford.warrantyPolicy}>อ่านนโยบายการรับประกัน</Link>
      </nav>
    </main>
  );
}
