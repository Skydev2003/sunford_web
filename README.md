# Sunford — Product Showcase

เว็บไซต์ Sunford ภาษาไทย จัดหน้าโดยอ้างอิง UX/UI ของ Apple ในธีมขาว แดง และดำ รองรับมือถือ เมนูขยายพร้อมฉากหลังเบลอไล่ระดับ การค้นหา กรองหมวดหมู่ เปรียบเทียบสินค้า และแกลเลอรีรูปสินค้า

นำเข้าข้อมูลสาธารณะจาก sunford.co เมื่อ 26 ตุลาคม 2026: 392 หน้า รวมหน้าสินค้า 150 รายการ หมวดสินค้า 112 หน้า รูป 909 ไฟล์ และการอ้างอิงวิดีโอ 20 รายการ เก็บรายละเอียดสินค้า ซอฟต์แวร์ บทความ บริการ และนโยบายไว้ในโปรเจกต์ รูปที่ต้นฉบับไม่พร้อมใช้งานแสดงช่องภาพว่าง

มีหน้าแอดมินเพิ่ม/แก้ไข/ลบสินค้า ล็อกอินด้วย Supabase Auth และอัปโหลดรูปผ่าน Supabase Storage โดยแยก layout จากหน้าเว็บสาธารณะ

## เริ่มต้น

ใช้ Node.js 20.19+ หรือ 22.12+ (พัฒนาและตรวจด้วย Node.js 24)

```bash
npm install
npm run dev
```

เปิด URL ที่ Next.js แสดงใน terminal (ปกติ http://localhost:3000) แคตตาล็อกที่นำเข้าทั้งหมดแสดงได้โดยไม่ต้องตั้งค่าฐานข้อมูล หากตั้งค่าฐานข้อมูลจะรวมสินค้าที่ดูแลเพิ่มในฐานข้อมูลเข้ากับข้อมูลต้นฉบับ โดยไม่สร้างรายการซ้ำสำหรับสินค้าแนะนำเดิม

## โครงสร้าง

```text
src/
  app/                       # Route composition, metadata, error boundaries, API
    (site)/                  # หน้าเว็บสาธารณะ + products/[slug] (URL เดิม)
    admin/                   # Login และ protected product management
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
    admin/                   # Admin UI, validation, auth guards, Server Actions
  stores/                    # Zustand: filter, search, comparison UI state
  lib/                       # Server-only Prisma / Supabase integrations
  proxy.ts                   # Auth session refresh เฉพาะเส้นทางแอดมิน
  styles/                    # Design tokens และ CSS แยกตามส่วน
  generated/prisma/          # สร้างด้วย prisma generate ไม่ commit
prisma/
  schema.prisma              # PostgreSQL schema + indexes
  migrations/                # Initial migration + RLS
  seed.ts                    # Idempotent upsert catalogue
tests/e2e/                  # Playwright user journeys
public/
  images/                   # รูปที่เว็บใช้งาน
  models/                   # โมเดล GLB และไฟล์ต้นฉบับประกอบโมเดล
  videos/                   # วิดีโอ WebM และไฟล์ต้นฉบับแอนิเมชัน
```

หลักการ: `app → features → repository → Prisma → Supabase PostgreSQL` โดย Client Components รับเฉพาะข้อมูลสินค้าสาธารณะ ส่วน credentials และ database client อยู่ฝั่งเซิร์ฟเวอร์ Zustand เก็บเฉพาะสถานะ UI; ข้อมูลสินค้าอยู่ใน Server Components ไม่เก็บสำเนาใน global store

หน้าแรกเล่นวิดีโอต้นฉบับ `public/videos/sunford-homepage-16x9.webm` โดยตรง ไม่สร้างรูปทีละเฟรมขณะใช้งานเว็บ ข้อความอยู่นิ่ง และวิดีโอหยุดเมื่อเลื่อนพ้นจอหรือซ่อนแท็บ ไฟล์ใน `output/`, `outputs/` และ `work/` เป็นงานทดลอง ภาพเรนเดอร์ และ log เฉพาะเครื่อง จึงไม่นำเข้า Git หรือใช้ในการ build เว็บไซต์

## เชื่อม Supabase PostgreSQL

1. คัดลอกไฟล์ตัวอย่างและแก้ในเครื่องเท่านั้น:

   ```bash
   cp .env.example .env
   ```

2. ใส่รหัสผ่านฐานข้อมูลที่ URL-encode แล้วแทน `YOUR-PASSWORD` และตรวจ endpoint ใน Supabase Dashboard → Connect:
   - `DATABASE_URL`: transaction pooler พอร์ต `6543` สำหรับ runtime
   - `DIRECT_URL`: session pooler พอร์ต `5432` สำหรับ Prisma CLI / migrations (หรือ direct endpoint ที่เข้าถึงได้)
3. เมื่อตรวจแล้วว่าเป็นฐานข้อมูลที่ต้องการ ให้รัน:

   ```bash
   npm run db:deploy
   npm run db:seed
   npm run dev
   ```

Initial migration สร้างตาราง `products`, enum และ indexes เปิด RLS โดยไม่มี anonymous policies เพราะอ่านผ่าน Prisma ฝั่งเซิร์ฟเวอร์ด้วย role ที่มีสิทธิ์เหมาะสม คำสั่ง `npm run db:seed` สำรองตารางสินค้าและเพิ่มเฉพาะสินค้านำเข้าที่ยังขาดให้ครบ 150 รายการ ไม่เขียนทับข้อมูลเดิม การแก้ไข ฉบับร่าง หรือสินค้าที่ลบแล้ว

เมื่อมี `DATABASE_URL` จริง repository ใช้ PostgreSQL เป็นรายการสินค้าหลัก อ่านเฉพาะ `published=true` และ `deletedAt=null` โดยแอดมินเพิ่ม แก้ไข ซ่อน และลบสินค้าได้ครบทั้ง 8 หมวด ข้อมูลนำเข้าใช้รักษารายละเอียด รูป และ URL เดิม ไม่เพิ่มสินค้าที่ถูกซ่อนหรือลบกลับมา หากไม่มีฐานข้อมูลยังดู snapshot ได้ หากตั้งค่าฐานข้อมูลแล้วเชื่อมต่อล้มเหลวจะแสดง error state

ข้อมูลสินค้าสาธารณะถูก cache 1 ชั่วโมงด้วย Next.js Cache Components การแก้ผ่านหน้าแอดมิน invalidate tag และหน้าที่เกี่ยวข้องทันที หากแก้ฐานข้อมูลโดยตรงให้รอ cache หมดอายุหรือ deploy ใหม่ หลังเปลี่ยน environment ให้ restart dev server หรือ build/deploy ใหม่

`SUPABASE_URL` และ `SUPABASE_PUBLISHABLE_KEY` ใช้สำหรับ Supabase Auth และการอัปโหลด Storage แบบมีสิทธิ์ผู้ใช้ รูปสินค้าเดิมยังอยู่ใน `public/images` ส่วนรูปใหม่จากแอดมินเก็บใน bucket `product-images`

**สถานะตรวจสอบล่าสุด:** รัน migration และนำเข้าสินค้าครบ 150 รายการแล้ว ตรวจว่าข้อมูลทุกช่องและ timestamps ของ 6 รายการเดิมไม่เปลี่ยน และข้อมูลสาธารณะของทั้ง 150 รายการยังตรงกับต้นฉบับ ทดสอบ CRUD ครบ 8 หมวดใน transaction ที่ rollback ทั้งหมดแล้ว การเชื่อมต่อต้องอาศัยค่าที่ถูกต้องใน `.env` ของแต่ละเครื่องหรือ deployment

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

## เนื้อหาและภาพ

แหล่งข้อมูลหลักคือเว็บไซต์ [Sunford](https://www.sunford.co) เก็บข้อมูลเต็มไว้ใน snapshot ส่วนภาพสินค้าแบบตัดพื้นหลังเดิมและภาพแบรนด์บางส่วนมาจาก [Sunford Shop](https://sunfordshop.com) ดูรายละเอียดต้นทางใน [docs/content-sources.md](docs/content-sources.md) แสดงราคาเฉพาะรายการที่เว็บไซต์ต้นฉบับเปิดเผยราคา ติดต่อสอบถามผ่าน LINE หรือโทรศัพท์จริงของ Sunford

ฟอนต์ Inter และ Noto Sans Thai ถูก self-host ด้วย `next/font/local` ดูใบอนุญาตใน `src/app/fonts` การติดตั้งและ build ไม่ต้องเรียก Google Fonts

## หน้าแอดมิน

เปิด `/admin/login` ด้วยบัญชี Supabase Auth ที่มี membership ใน `admin_users` ดูวิธีสร้าง/ถอนสิทธิ์แอดมิน การตั้งค่า Storage และการทดสอบใน [docs/admin.md](docs/admin.md)

```bash
npm run admin:create -- admin@example.com
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:admin -- admin@example.com
```

ทั้งสองคำสั่งถามรหัสผ่านแบบซ่อน ไม่ใส่รหัสผ่านลง command arguments หรือ source code คีย์ secret/service-role ใช้เฉพาะเครื่องมือ provisioning/การทดสอบและห้ามส่งไปเบราว์เซอร์ หน้าแอดมิน runtime ไม่จำเป็นต้องใช้คีย์นี้

## Deploy บน Vercel

ใช้ `vercel.json` สำหรับ Next.js บน Node.js 24 โดยติดตั้งด้วย npm และ build ผ่าน `npm run vercel-build` ใช้ Supabase เดิมสำหรับฐานข้อมูล Auth และ Storage ฟังก์ชันรันที่ Mumbai (`bom1`) ใกล้ฐานข้อมูลปัจจุบันใน `ap-south-1`

Production จาก branch `main` รัน migration → เติมสินค้าที่ขาด → build ส่วน Preview ของ `uat` และ branch อื่นรันเฉพาะ build ไม่ migrate หรือ seed อัตโนมัติ ตั้ง Environment Variables แยก Production/Preview และใช้ Supabase สำหรับทดสอบแยกจาก production ดูขั้นตอน import repo, ตั้งค่า และย้าย URL ใน [docs/vercel.md](docs/vercel.md)

ปล่อย Production จาก branch `uat` ด้วย `bun run deploy`: commit งานให้ครบก่อน แล้วสคริปต์จะ fetch, sync `uat`, rebase บน `origin/main`, ตรวจ lint/format/tests/build ด้วยข้อมูลจำลอง แล้ว push revision ที่ตรวจแล้วเข้า `main` ให้ Vercel deploy อัตโนมัติ ไม่ force-push และไม่รัน migration/seed ในเครื่อง ใช้ `bun run deploy --check` เพื่อตรวจความพร้อมโดยไม่เปลี่ยน Git หรือ push

ขั้นตอน migration/seed/build บน Vercel แยกอยู่ใน `bun run vercel-build` อย่าตั้ง Vercel Build Command เป็น `bun run deploy`

## UAT บน LAN ชั่วคราว

หากต้องการทดสอบในเครื่องเพิ่มเติม ใช้เครื่องนี้เปิดเว็บให้ทีมใน Wi-Fi/LAN เดียวกันผ่าน nip.io ได้:

```bash
npm run uat:local -- --check
npm run uat:local
```

หยุด `next dev` เดิมก่อนเปิดคำสั่งนี้ ใช้ URL และพอร์ตที่คำสั่งแสดง ดูขั้นตอน branch, การอัปเดตเครื่อง UAT และกรณีทดสอบใน [docs/uat.md](docs/uat.md) nip.io เป็น DNS ไม่ใช่ hosting และ private-IP URL นี้ไม่เปิดให้ทีมต่างเครือข่ายเข้าถึงโดยอัตโนมัติ
