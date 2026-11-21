# Sunford — Product Showcase

เว็บไซต์ Sunford ภาษาไทย จัดหน้าโดยอ้างอิง UX/UI ของ Apple ในธีมขาว แดง และดำ รองรับมือถือ เมนูขยายพร้อมฉากหลังเบลอไล่ระดับ การค้นหา กรองหมวดหมู่ เปรียบเทียบสินค้า และแกลเลอรีรูปสินค้า

นำเข้าข้อมูลสาธารณะจาก sunford.co เมื่อ 26 ตุลาคม 2026: 392 หน้า รวมหน้าสินค้า 150 รายการ หมวดสินค้า 112 หน้า รูป 909 ไฟล์ และการอ้างอิงวิดีโอ 20 รายการ เก็บรายละเอียดสินค้า ซอฟต์แวร์ บทความ บริการ และนโยบายไว้ในโปรเจกต์ รูปที่ต้นฉบับไม่พร้อมใช้งานแสดงช่องภาพว่าง

เว็บไซต์มีเฉพาะหน้าสาธารณะ นำระบบแอดมิน ล็อกอิน การแก้ไขข้อมูลและอัปโหลดรูปออกแล้ว เส้นทาง `/admin` และเส้นทางย่อยตอบ 404 ข้อมูลและรูปเดิมยังอ่านได้ตามปกติ

## เริ่มต้น

ใช้ Node.js 24 และตั้งค่า Warehouse ใน .env.local ตาม .env.example ก่อนเริ่มเว็บ

```bash
npm install
npm run dev -- --port 3001
```

เปิดเว็บไซต์ที่ http://localhost:3001 ได้โดยตรง แม้แอป Warehouse บนพอร์ต 3000 จะปิดอยู่

## โครงสร้าง

เริ่มดูแลโปรเจกต์ด้วย [คู่มือหาไฟล์ใน VS Code](docs/project-guide.md): อธิบายหน้าที่แต่ละส่วน พร้อมตาราง “อยากแก้อะไร ให้เปิดไฟล์ไหน” และแหล่งค่ากลางที่มีให้ใช้แล้ว ดูรายละเอียดการจัด Explorer และโค้ดกลางใน [บันทึกงาน](docs/vscode-organization-proposal-20261117.md)

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
  lib/                       # Prisma สำหรับทะเบียนเลขใบเสนอราคาและ migration เดิม
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

ดู [กติกา Warehouse และใบเสนอราคา](spec.md#warehouse) สำหรับแหล่งข้อมูลสินค้า ราคา รูป และการออกเลข ส่วนตัวแปรเชื่อมต่อและการตรวจข้อมูลอยู่ใน [คู่มือเชื่อม Warehouse](docs/warehouse/direct-postgres.md)

- ค่าตั้งเว็บและเมนูอยู่ใน `data/site/content.json` โดยมีตัวอ่านใน `src/features/site/`
- ข้อมูลที่นำเข้าจากเว็บเดิมอยู่ใน `src/features/content/data/products.json` และ `pages.json` ในโฟลเดอร์เดียวกัน
- รูปอ้างอิง ภาพแคมเปญ และ cache รูปอยู่ใน `public/images/` ส่วน metadata ของ cache อยู่ใน `data/warehouse/images.json`

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

## ตรวจการใช้งานด้วยเบราว์เซอร์

```bash
npx playwright install chromium
# รัน dev server แยกอีก terminal
PLAYWRIGHT_BASE_URL=http://localhost:3001 npm run test:e2e
```

หากมี Chrome ในเครื่อง สามารถใช้ `PLAYWRIGHT_CHANNEL=chrome` แทนการติดตั้ง Chromium ค่าเริ่มต้นของ test config ใช้ URL `http://127.0.0.1:3001`; กำหนด `PLAYWRIGHT_BASE_URL` ให้ตรงกับ server ที่รัน

ครอบคลุม hero, category filters, search + empty results, product navigation, comparison, mobile navigation / overflow, catalogue API และ 404 ภาพหน้าจอสำหรับตรวจ UI จะถูกบันทึกลง `/tmp/sunford-*.png`

## Path ภายในเว็บไซต์

ชื่อไฟล์ โฟลเดอร์ และ URL ภายในต้องไม่มีภาษาไทย URL เดิมที่เป็นไทย redirect แบบ 308 ไปยังชื่ออังกฤษ เมนูและลิงก์ในเนื้อหาใช้ชื่ออังกฤษโดยตรง ข้อความภาษาไทยบนหน้าเว็บยังแสดงตามเดิม ส่วน `sourceUrl` และรายงานนำเข้าเก็บ URL ของเว็บต้นทางไว้เพื่ออ้างอิง

ตรวจด้วย `npm run paths:check` ซึ่งตรวจชื่อไฟล์ path ในโค้ด ข้อมูลนำเข้าและลิงก์ HTML และทำงานร่วมกับ `npm run test:uat`

## เนื้อหาและภาพ

แหล่งอ้างอิงของเนื้อหาที่นำเข้าคือเว็บไซต์ [Sunford](https://www.sunford.co) เก็บข้อมูลเต็มไว้ใน snapshot ส่วนภาพสินค้าแบบตัดพื้นหลังเดิมและภาพแบรนด์บางส่วนมาจาก [Sunford Shop](https://sunfordshop.com) ดูรายละเอียดต้นทางใน [docs/content-sources.md](docs/content-sources.md) ติดต่อสอบถามผ่าน LINE หรือโทรศัพท์จริงของ Sunford

ฟอนต์ Inter และ Noto Sans Thai ถูก self-host ด้วย `next/font/local` ดูใบอนุญาตใน `src/app/fonts` การติดตั้งและ build ไม่ต้องเรียก Google Fonts

## Deploy บน Vercel

ดู [คู่มือปล่อยรุ่นบน Vercel](docs/vercel.md) สำหรับการตั้งค่า Preview และ Production การปล่อยจาก `uat` และการตรวจ revision หลังปล่อย

## UAT บน LAN ชั่วคราว

หากต้องการทดสอบในเครื่องเพิ่มเติม ใช้เครื่องนี้เปิดเว็บให้ทีมใน Wi-Fi/LAN เดียวกันผ่าน nip.io ได้:

```bash
npm run uat:local -- --check
npm run uat:local
```

หยุด `next dev` เดิมก่อนเปิดคำสั่งนี้ ใช้ URL และพอร์ตที่คำสั่งแสดง ดูขั้นตอน branch, การอัปเดตเครื่อง UAT และกรณีทดสอบใน [docs/uat.md](docs/uat.md) nip.io เป็น DNS ไม่ใช่ hosting และ private-IP URL นี้ไม่เปิดให้ทีมต่างเครือข่ายเข้าถึงโดยอัตโนมัติ
