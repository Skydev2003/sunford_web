# SUNFORD — แผนงานที่ยังเปิด

## การ์ด VB3000S × JC81 บน `/products` (Apple Feature Card + Ambient Loop + `↗` Modal)

**รอเจ้าของอนุมัติก่อนแก้เว็บไซต์** ต้นแบบ Figma (`nodeId: 21:2` และ `nodeId: 21:34`) พร้อมไฟล์วิดีโอ Ambient Loop (`vb3000s-jc81-ambient.mp4`, `699,656 bytes`) และภาพนิ่ง (`vb3000s-jc81-ambient-poster.webp`, `53,096 bytes`) เตรียมไว้ใน `scratch/` แล้ว ดู [ข้อกำหนดและต้นแบบ](spec.md) การเผยแพร่ขึ้น Production ต้องมีคำสั่งแยก

- [x] สร้างภาพมุมหน้าตรงเกรดแสงสตูดิโอดำของ `VB3000S` (`G106469`) และ `ACS-30-JC81` (`G106186`) พร้อมออกแบบ Apple Feature Card (Eyebrow + Headline + Ambient Loop Video + ปุ่ม `↗`) และหน้าต่าง Detail Modal ในไฟล์ Figma เดิม (`TImCwzaDvOMRkGMalbzIcx`)
- [ ] เจ้าของตรวจภาพ ข้อความ ตำแหน่งหลัง VR5000 วิดีโอ Ambient Loop และหน้าต่าง Modal แล้วบันทึกผลตัดสินใจ
- [ ] เมื่ออนุมัติ ให้นำ `vb3000s-jc81-ambient.mp4` เข้า `public/videos/` และ `vb3000s-jc81-ambient-poster.webp` เข้า `public/images/products/`
- [ ] สร้าง/อัปเดตคอมโพเนนต์การ์ดและ `<dialog>` Modal ใน `src/features/catalog/components/equipment-video-card.tsx` (และสไตล์ใน `src/features/catalog/components/products-index-content.module.css`) แล้วแทรกหลัง `G106179` ใน `src/features/catalog/components/products-index-content.tsx`
- [ ] ตรวจ 320, 390, 737, 768 และ 1440 px ทั้ง motion ปกติและ reduced motion ตรวจการเล่นวนลูป การพักเมื่อพ้นจอ การคลิกปุ่ม `↗` เปิด/ปิด Modal ด้วย `×`, `Escape`, คลิกฉากหลัง และการคืนโฟกัส ปุ่มลูกศรเลื่อนราง ลำดับและลิงก์ของสินค้าเดิมทั้ง 8 ใบ จากนั้นรัน `bun run typecheck`, `bun run lint` และ `bun run format:check`

ย้อนกลับโดยคืนเฉพาะจุดแทรกการ์ด คอมโพเนนต์/สไตล์ที่แก้ และสื่อใหม่ทั้งสองไฟล์ ขอบเขตและเกณฑ์ภาพที่เสนออยู่ใน [ข้อกำหนดปัจจุบัน](spec.md) และ [แผนฉบับเต็ม](docs/archive/2026-11-21/plan.md)

## สถานะที่ต้องรู้ก่อนตรวจหรือส่งมอบต่อ

- **การ์ดเครื่องชั่ง 10 ใบจาก Warehouse** — ตรวจ draft/publish/restore ในฐานทดสอบแยกแล้ว บันทึกล่าสุดระบุว่ายังไม่ได้เปิดบน staging กลางหรือ Production ก่อนเปิดในสภาพแวดล้อมที่เจ้าของเลือก ต้องมี SQL และสิทธิ์อ่าน projection ฝั่ง Warehouse, บริษัทตรงกันทั้งสองระบบ, `FEATURED_SCALES_ENABLED` ฝั่งเว็บ และ URL/secret สำหรับ revalidation ตรงกัน มีรอบรีเฟรชสำรอง 60 วินาที
- **ใบเสนอราคา** — การลองออกเลขซ้ำและการดาวน์โหลดเมื่อ API ตอบผิดรูปแบบผ่านการทดสอบเฉพาะในเครื่อง ชุดทดสอบกว้างล่าสุดผ่าน 11/15 อีกสี่กรณีล้มก่อนเข้า issuance ในส่วนเลือกสินค้า รูปย่อมือถือ และเมนู Services ให้ตรวจผลล่าสุดก่อนสรุปความพร้อมของเส้นทางรวม
- **Responsive** — บันทึกการส่งมอบชุด mobile-first ระบุว่าการตรวจ responsive ที่กำหนดผ่านทั้ง dev และ production build ในเครื่อง ส่วนหกกรณีปิด JavaScript ยังพบปัญหากับการแสดงผล streamed markup ดูหัวข้อ “Sitewide Mobile-first responsive migration” ในประวัติเมื่อตรวจเส้นทางนี้อีกครั้ง

[ประวัติแผน เช็กลิสต์ และผลตรวจทั้งหมดก่อนย่อ 21 พ.ย. 2026](docs/archive/2026-11-21/plan.md)
