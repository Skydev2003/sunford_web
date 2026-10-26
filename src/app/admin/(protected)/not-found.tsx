import Link from "next/link";
export default function AdminNotFound() {
  return (
    <section className="admin-empty">
      <h1>ไม่พบผลิตภัณฑ์นี้</h1>
      <p>สินค้าอาจถูกลบไปแล้ว หรือ URL ไม่ถูกต้อง</p>
      <Link href="/admin/products" className="button button-red">
        กลับไปผลิตภัณฑ์
      </Link>
    </section>
  );
}
