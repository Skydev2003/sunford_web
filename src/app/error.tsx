"use client";
export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <main className="container empty-state not-found">
      <h1>ไม่สามารถโหลดข้อมูลได้ในขณะนี้</h1>
      <p>กรุณาลองอีกครั้ง หรือติดต่อ Sunford โทร 034-276-999</p>
      <button onClick={retry} className="button button-red">
        ลองอีกครั้ง
      </button>
    </main>
  );
}
