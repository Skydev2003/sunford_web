# Sunford — Product Showcase

เว็บไซต์ Sunford ภาษาไทย จัดหน้าโดยอ้างอิง UX/UI ของ Apple ในธีมขาว แดง และดำ รองรับมือถือ เมนูขยายพร้อมฉากหลังเบลอไล่ระดับ การค้นหา กรองหมวดหมู่ เปรียบเทียบสินค้า และแกลเลอรีรูปสินค้า

นำเข้าข้อมูลสาธารณะจาก sunford.co เมื่อ 26 ตุลาคม 2026: 392 หน้า รวมหน้าสินค้า 150 รายการ หมวดสินค้า 112 หน้า รูป 909 ไฟล์ และการอ้างอิงวิดีโอ 20 รายการ เก็บรายละเอียดสินค้า ซอฟต์แวร์ บทความ บริการ และนโยบายไว้ในโปรเจกต์ รูปที่ต้นฉบับไม่พร้อมใช้งานแสดงช่องภาพว่าง

เว็บไซต์มีเฉพาะหน้าสาธารณะ นำระบบแอดมิน ล็อกอิน การแก้ไขข้อมูลและอัปโหลดรูปออกแล้ว เส้นทาง `/admin` และเส้นทางย่อยตอบ 404 ข้อมูลและรูปเดิมยังอ่านได้ตามปกติ

## เริ่มต้น

ใช้ Node.js 24 และตั้งค่า Warehouse ใน .env.local ตาม .env.example ก่อนเริ่มเว็บ

```bash
npm install
npm run dev
```

เปิด URL ที่ Next.js แสดงใน terminal (ปกติ http://localhost:3000) สินค้า ราคา หน่วย และรูปหลักอ่านจาก Warehouse PostgreSQL/storage โดยตรง ไม่ต้องเปิดแอป Warehouse ส่วนหน้าสินค้าและใบเสนอราคาใช้ข้อมูล Warehouse เท่านั้น ช่องที่ไม่มีข้อมูลเว้นว่าง ส่วนหน้าแรก/Hero คงภาพและเนื้อหาเดิมจากไฟล์โปรเจกต์ ไม่มีการอ่านฐาน CMS

## โครงสร้าง

```text
src/
  app/                       # Route composition, metadata, error boundaries, API
    (site)/                  # หน้าเว็บสาธารณะ + products/[slug] (URL เดิม)
    api/products/            # Read-only catalogue endpoint
  components/
    layout/                  # Header, Footer
    ui/                      # Native accessible dialog
  features/
    content/                 # Imported public pages, full product details, search and videos
    catalog/
      components/            # Catalogue, cards, search, comparison
      data/                  # Curated initial catalogue
      server/                # Repository: จุดเดียวที่อ่านข้อมูลสินค้า
      types.ts               # Domain model และหมวดหมู่
    home/components/         # Hero, solutions, brand story, support
    site/                    # Local settings, navigation and content readers
  stores/                    # Zustand: filter, search, comparison UI state
  lib/                       # Prisma และประวัติ migration เดิม
  styles/                    # Design tokens และ CSS แยกตามส่วน
  generated/prisma/          # สร้างด้วย prisma generate ไม่ commit
prisma/
  schema.prisma              # ทะเบียนเลขใบเสนอราคาและ schema เดิมที่คงไว้
  migrations/                # ประวัติ migration; ไม่ลบตาราง CMS จริง
tests/e2e/                  # Playwright user journeys
public/
  images/                   # รูปที่เว็บใช้งาน
  models/                   # โมเดล GLB และไฟล์ต้นฉบับประกอบโมเดล
  videos/                   # วิดีโอ WebM ของหน้าแรก
```

หลักการ: `app → features → repository → Warehouse PostgreSQL + local content` โดย Client Components รับเฉพาะข้อมูลสินค้าสาธารณะ ส่วน credentials และ database client อยู่ฝั่งเซิร์ฟเวอร์ Zustand เก็บเฉพาะสถานะ UI; ข้อมูลสินค้าอยู่ใน Server Components ไม่เก็บสำเนาใน global store

สไลด์ ACS-30-JC21, WPS10KS และ FEH5KS ใช้โมเดล GLB จาก `public/models/` และเรนเดอร์ 3D ตามขนาดจอจริง จึงแสดงภาพใหญ่บนจอ Retina ได้โดยไม่ขยายวิดีโอ 1080p เฉพาะสไลด์ที่เลือกเท่านั้นที่มี viewer อยู่บนหน้า โมเดล ACS ใช้ฉากขนาดใหญ่พร้อมกล้องเคลื่อนช้า ๆ ส่วนข้อความอยู่นิ่ง การลากหมุนจะพักกล้องอัตโนมัติและกดเล่นต่อได้

การเคลื่อนกล้องจำกัดที่ 30 ครั้งต่อวินาที หยุดเมื่อเลื่อนพ้นจอหรือซ่อนแท็บ และเคารพการตั้งค่าลดการเคลื่อนไหวของอุปกรณ์ ตัวเรนเดอร์ปรับคุณภาพตาม GPU โดยคง render scale อย่างน้อย 0.75 เพื่อรักษารายละเอียดหน้าปัด หากอุปกรณ์โหลด 3D ไม่สำเร็จจะแสดงภาพสินค้าสำรอง วิดีโอ WebM ต้นฉบับยังเก็บไว้ แต่ Hero ไม่ดาวน์โหลดหรือใช้เล่นแล้ว

ไฟล์ใน `output/`, `outputs/` และ `work/` เป็นงานทดลอง ภาพเรนเดอร์ และ log เฉพาะเครื่อง จึงไม่นำเข้า Git หรือใช้ในการ build เว็บไซต์

## แหล่งข้อมูลหลังถอด CMS

- `WAREHOUSE_DATABASE_URL` และ `WAREHOUSE_COMPANY_ID` ใช้อ่านสินค้า/ราคาจาก PostgreSQL แบบ read-only ส่วน `WAREHOUSE_S3_*` ใช้อ่านรูปใหม่หรือรูปที่เปลี่ยน ดู [คู่มือ Warehouse](docs/warehouse/direct-postgres.md)
- `data/site/content.json` เก็บค่าตั้งเว็บและเมนู ตัวอ่านอยู่ใน `src/features/site/`
- `src/features/content/data/products.json` เก็บสเปก คำอธิบาย แกลเลอรี และข้อมูลอ้างอิงสินค้าเดิม159รายการ ส่วน `pages.json` เก็บหน้าเนื้อหาเดิม401หน้า ไฟล์เหล่านี้ไม่ใช่แหล่งราคาปัจจุบัน
- `public/images/` เก็บรูปสำรองและภาพเดิม ส่วน `data/warehouse/images.json` เก็บ metadata ของ cache รูป Warehouse
- `DATABASE_URL` และ `DIRECT_URL` แยกจาก Warehouse และเก็บไว้สำหรับ Prisma/migration เดิม ไม่ใช้ดึงสินค้า/เนื้อหา CMS และห้ามชี้ Prisma ไป Warehouse
- เก็บ Prisma/client/schema และประวัติ migration เดิม แต่ถอด seed/import สินค้า CMS และคำสั่ง `db:seed` แล้ว งานนี้ไม่ลบตารางหรือข้อมูลจริงในฐานเดิม

สินค้า/ราคาและรูป Warehouse อัปเดตตามรอบ catalog เดิมโดยไม่ต้องรันคำสั่งนำเข้า รูปมีเวอร์ชันใน URL ส่วนหน้าภายในเว้นรูปว่างเมื่อ Warehouse ไม่มีรูป การแก้เนื้อหาในไฟล์โปรเจกต์ให้ตรวจและ build/deploy ตามกระบวนการเดิม

## คำสั่งพัฒนา

อัปเดตและตรวจสอบข้อมูลจากเว็บไซต์ต้นฉบับ:

```bash
npm run content:import
npm run content:validate
```

ตัวนำเข้าอ่าน sitemap และลิงก์สาธารณะ เก็บรายละเอียดและรูปในเครื่อง ลบสคริปต์และ event handlers จาก HTML และบันทึกข้อจำกัดที่ `src/features/content/data/import-report.json` ดูรายละเอียดที่ `docs/content-import.md`

แบบฟอร์มลงทะเบียนรับประกันและคำขอบริการมีปุ่มเปิดระบบต้นฉบับจริง การแสดงเนื้อหาในเว็บนี้ไม่ได้ส่งแบบฟอร์มหรือสร้างรายการบริการแทนผู้ใช้

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run start
npm run db:validate
```

สร้าง migration ใหม่ระหว่างพัฒนา: `npm run db:migrate -- --name descriptive_name` โดยต้องตั้งค่า `DIRECT_URL` และ shadow database ให้เหมาะกับสภาพแวดล้อมก่อน ไม่ควรใช้ `migrate dev` กับฐานข้อมูล production

## ตรวจการใช้งานด้วยเบราว์เซอร์

```bash
npx playwright install chromium
# รัน dev server แยกอีก terminal
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

หากมี Chrome ในเครื่อง สามารถใช้ `PLAYWRIGHT_CHANNEL=chrome` แทนการติดตั้ง Chromium ค่าเริ่มต้นของ test config ใช้ URL `http://127.0.0.1:3001`; กำหนด `PLAYWRIGHT_BASE_URL` ให้ตรงกับ server ที่รัน

ครอบคลุม hero, category filters, search + empty results, product navigation, comparison, mobile navigation / overflow, catalogue API และ 404 ภาพหน้าจอสำหรับตรวจ UI จะถูกบันทึกลง `/tmp/sunford-*.png`

## Path ภายในเว็บไซต์

ชื่อไฟล์ โฟลเดอร์ และ URL ภายในต้องไม่มีภาษาไทย URL เดิมที่เป็นไทย redirect แบบ 308 ไปยังชื่ออังกฤษ เมนูและลิงก์ในเนื้อหาใช้ชื่ออังกฤษโดยตรง ข้อความภาษาไทยบนหน้าเว็บยังแสดงตามเดิม ส่วน `sourceUrl` และรายงานนำเข้าเก็บ URL ของเว็บต้นทางไว้เพื่ออ้างอิง

ตรวจด้วย `npm run paths:check` ซึ่งตรวจชื่อไฟล์ path ในโค้ด ข้อมูลนำเข้าและลิงก์ HTML และทำงานร่วมกับ `npm run test:uat`

## เนื้อหาและภาพ

แหล่งข้อมูลหลักคือเว็บไซต์ [Sunford](https://www.sunford.co) เก็บข้อมูลเต็มไว้ใน snapshot ส่วนภาพสินค้าแบบตัดพื้นหลังเดิมและภาพแบรนด์บางส่วนมาจาก [Sunford Shop](https://sunfordshop.com) ดูรายละเอียดต้นทางใน [docs/content-sources.md](docs/content-sources.md) แสดงราคาจาก Warehouse ตามกติกาที่อนุมัติ ติดต่อสอบถามผ่าน LINE หรือโทรศัพท์จริงของ Sunford

ฟอนต์ Inter และ Noto Sans Thai ถูก self-host ด้วย `next/font/local` ดูใบอนุญาตใน `src/app/fonts` การติดตั้งและ build ไม่ต้องเรียก Google Fonts

## การดูแลเนื้อหา

ดูแลเนื้อหาเว็บผ่านไฟล์ใน repository ไม่มีระบบ CMS หรือหน้าจัดการเนื้อหา สเปก/คำอธิบาย/รูปสำรองอยู่ครบ การตั้ง DATABASE_URL เก่าจะไม่เปิดการอ่าน CMS กลับมา ประวัติ schema/migrations ยังเก็บไว้เพื่อรักษาทะเบียนเอกสารและฐานเดิม โดยไม่มีการลบข้อมูลจริง

## Deploy บน Vercel

ใช้ `vercel.json` สำหรับ Next.js บน Node.js 24 โดยติดตั้งด้วย npm และ build ผ่าน `npm run vercel-build` ใช้ Warehouse PostgreSQL/storage สำหรับสินค้า และฐานแยกสำหรับทะเบียนเลขใบเสนอราคา ฟังก์ชันรันที่ Mumbai (`bom1`) ใกล้ฐานข้อมูลปัจจุบันใน `ap-south-1`

Production จาก branch `main` รัน migration ทะเบียนเอกสาร → build ส่วน Preview รันเฉพาะ build ไม่มี CMS seed ตั้งค่า Warehouse และทะเบียนเอกสารแยก Production/Preview ดูขั้นตอน import repo, ตั้งค่า และย้าย URL ใน [docs/vercel.md](docs/vercel.md)

ปล่อย Production จาก branch `uat` ด้วย `bun run deploy`: commit งานให้ครบก่อน แล้วสคริปต์จะ fetch, sync `uat`, rebase บน `origin/main`, ตรวจ lint/format/tests/build ด้วยข้อมูลจำลอง แล้ว push revision ที่ตรวจแล้วเข้า `main` ให้ Vercel deploy อัตโนมัติ ไม่ force-push และไม่รัน migration/seed ในเครื่อง ใช้ `bun run deploy --check` เพื่อตรวจความพร้อมโดยไม่เปลี่ยน Git หรือ push

ขั้นตอน migration ทะเบียนเอกสารและ build บน Vercel แยกอยู่ใน `bun run vercel-build` อย่าตั้ง Vercel Build Command เป็น `bun run deploy`

## UAT บน LAN ชั่วคราว

หากต้องการทดสอบในเครื่องเพิ่มเติม ใช้เครื่องนี้เปิดเว็บให้ทีมใน Wi-Fi/LAN เดียวกันผ่าน nip.io ได้:

```bash
npm run uat:local -- --check
npm run uat:local
```

หยุด `next dev` เดิมก่อนเปิดคำสั่งนี้ ใช้ URL และพอร์ตที่คำสั่งแสดง ดูขั้นตอน branch, การอัปเดตเครื่อง UAT และกรณีทดสอบใน [docs/uat.md](docs/uat.md) nip.io เป็น DNS ไม่ใช่ hosting และ private-IP URL นี้ไม่เปิดให้ทีมต่างเครือข่ายเข้าถึงโดยอัตโนมัติ
