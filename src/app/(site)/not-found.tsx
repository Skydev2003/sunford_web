import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="container empty-state not-found">
      <p className="eyebrow">404 — NOT FOUND</p>
      <h1>ยังไม่พบหน้าที่คุณกำลังมองหา</h1>
      <p>ค้นพบเครื่องชั่งและโซลูชันอื่น ๆ ของ Sunford</p>
      <Link href="/products" className="button button-red">
        สำรวจผลิตภัณฑ์
      </Link>
    </main>
  );
}
