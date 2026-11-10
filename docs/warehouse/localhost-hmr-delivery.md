# แก้ HMR และรีสตาร์ท localhost:3000

วันที่: 10 พฤศจิกายน 2026

แก้ `allowedDevOrigins` ใน `next.config.ts` โดยเพิ่มเฉพาะ `127.0.0.1` และรักษารายการ LAN/UAT เดิม รีสตาร์ท dev server ของโปรเจกต์ที่พอร์ต 3000 ด้วย Node **24.22.1** / Next.js **16.4.3 Turbopack** แล้ว ไม่ต้องเปลี่ยนเป็น Webpack หรือล้าง cache

## สาเหตุที่ตรวจพบ

Next.js ยอมรับ `localhost` อยู่แล้ว แต่ไม่ได้ยอมรับชื่อเรียก `127.0.0.1` อัตโนมัติ log ระบุชัดว่าบล็อก origin นี้ การตรวจ WebSocket ก่อนแก้ได้ `localhost HMR OPEN` แต่ `127.0.0.1` เป็น invalid HTTP response และ browser regression ได้ `connected = false` จริง จึงไม่ใช่หลักฐานว่าหน้า `localhost` ใช้งานไม่ได้ทั้งหมด เพราะเลือกหัวอ่านบน `localhost` ก่อนแก้ได้

dev process เดิมใช้ Node 22.14.0 ขณะที่โปรเจกต์กำหนด 24.x จึงเริ่มใหม่ด้วย Node 24 โดยหยุดเฉพาะ CLI/child ที่ตรวจเส้นทางโปรเจกต์และเจ้าของพอร์ต 3000 ตรงกัน Config save ทำให้ child PID เปลี่ยนครั้งหนึ่ง; ตรวจตัวตนใหม่ก่อนหยุด ไม่มีการปิด node process อื่นหรือเซิร์ฟเวอร์ Warehouse

## หลักฐานหลังแก้

- HMR browser regression ผ่าน **3/3**: ทั้ง localhost/127.0.0.1 เชื่อม WebSocket ได้และปุ่มจัดสเปคทำงาน
- แก้ข้อความใน source ของ builder ชั่วคราว: browser อัปเดตโดยไม่ reload และยังเก็บหัวอ่านที่เลือกไว้ คืน source แล้ว browser อัปเดตกลับโดยรักษาตัวเลือกไว้ ไฟล์คืนตรงกับก่อนทดสอบทุก byte
- origin ภายนอกที่ไม่ได้อนุญาตยังถูกปฏิเสธ ไม่ได้เปิด wildcard
- Browser Warehouse ผ่าน **5/5** บน `http://localhost:3000`: Home ค้นหา/เปรียบเทียบ, หมวดจริงทั้ง 5 พร้อมรายละเอียด/ค้นหาที่ 390/834/1440px และจัดสเปค → ใบเสนอราคา → PDF
- Carousel ผ่าน **6/6**: swipe บนรูป/พื้นหลัง, เปลี่ยนครบทุกรุ่นที่ 390/834/1440px, wheel และเปิด/กลับจากรายละเอียด รวม browser ทั้งหมด **14/14** กรณี
- ตรวจ console/page error เพิ่มทั้งหน้าสินค้าและจัดสเปคที่ 390/1440px ได้ **0 errors** และเปิดตรวจ screenshot แล้ว
- API สินค้าตอบ 200 จำนวน **89 SKU**; image proxy `G106292` ตอบ 200 `image/webp`
- TypeScript, scoped ESLint และ catalog unit tests **134/134** ผ่าน

หลักฐานอยู่ใน `output/localhost-hmr-20261110/` มี failure ก่อนแก้, HMR หลังแก้, screenshot responsive และ PDF จากข้อมูลจริง การทดสอบ HMR ที่แก้ source ต้องเปิด `LOCALHOST_DEV_QA=1` กับ `LOCALHOST_HMR_MUTATION=1` อย่างชัดเจน และคืนไฟล์ผ่าน `finally`; ไม่ทำงานในการทดสอบ production ปกติ

## เปิดใช้งาน

- [หน้าสินค้า](http://localhost:3000/products)
- [จัดสเปค](http://localhost:3000/guides/indicator-platform-compatibility)
- [ใบเสนอราคา](http://localhost:3000/service/quotation)

dev server ถูกเปิดทิ้งไว้ให้ใช้งาน หากเริ่มใหม่เอง ให้เลือก Node 24 ใน PATH แล้วใช้ `bun run dev` ตามปกติ ไม่ต้องใส่ `--webpack` config รองรับ localhost และ 127.0.0.1 แล้ว

## ขอบเขตและย้อนกลับ

ไม่มีการเปลี่ยน UI, ราคาหรือ mapping สินค้า, `.env.local`, ฐานข้อมูล, dependency หรือ deploy ส่วน application source ที่ใช้ probe ถูกคืนครบ การย้อนกลับ config คือเอา `127.0.0.1` ออกจาก allowlist และ restart แต่จะทำให้ HMR ผ่านชื่อนี้ถูกปฏิเสธอีก
