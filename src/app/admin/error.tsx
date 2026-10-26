"use client";
import Link from "next/link";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main className="admin-loading">
      <h1>โหลดข้อมูลไม่สำเร็จ</h1>
      <p>กรุณาลองอีกครั้ง หรือตรวจสอบการเชื่อมต่อ</p>
      <button className="button button-red" onClick={reset}>
        ลองอีกครั้ง
      </button>
      <Link href="/admin/login">กลับไปเข้าสู่ระบบ</Link>
    </main>
  );
}
