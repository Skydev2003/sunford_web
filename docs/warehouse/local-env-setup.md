# ตั้งค่า Warehouse API และฐานเว็บไซต์ใน .env.local

> อัปเดต 11 พฤศจิกายน 2026: ระบบเปลี่ยนเป็นอ่าน PostgreSQL ของ Warehouse โดยตรงอัตโนมัติแล้ว ใช้ `WAREHOUSE_DATABASE_URL` แยกจาก CMS `DATABASE_URL` และไม่ต้องรันแอป/API Warehouse ให้ใช้ [คู่มือตั้งค่าและผลตรวจ PostgreSQL โดยตรง](./direct-postgres.md) เป็นข้อมูลปัจจุบัน ส่วนเนื้อหาด้านล่างเก็บประวัติการเชื่อม API/การนำเข้าชุดข้อมูลก่อนเปลี่ยนระบบ

## ประวัติการตั้งค่าก่อนเปลี่ยนเป็น PostgreSQL โดยตรง

คู่มือนี้อิงโค้ดของโปรเจกต์ ณ วันที่ 10 พฤศจิกายน 2026 ใช้ Node.js 24 และ PowerShell ค่าตัวอย่างที่มีคำว่า `example`, `YOUR-PASSWORD` หรืออักษรตัวพิมพ์ใหญ่เป็นจุดให้แทนด้วยค่าจริง ไม่ใช่บริการที่ยืนยันว่ามีอยู่

## แยกสองการเชื่อมต่อ

หน้าสินค้าและใบเสนอราคาอ่าน SKU หน่วย และราคาก่อน VAT จาก `data/warehouse/products.json` และใช้รูป Warehouse ที่บันทึกใน `public/images/warehouse-cache/` เมื่อจะนำเข้าราคาใหม่ ให้เปิด Warehouse แล้วรัน `npm run warehouse:snapshot` จากนั้น deploy ไฟล์ที่อัปเดต วันที่ราคาบนใบเสนอราคามาจาก `capturedAt` ของชุดข้อมูลนี้

| ตัวแปร              | ต้องชี้ไปที่                                            | ใช้ทำอะไร                                               |
| ------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| `WAREHOUSE_API_URL` | URL หลักของบริการ Warehouse ที่มี `/api/store/products` | ใช้เฉพาะตอนนำเข้าสินค้า ราคา และรูปด้วยคำสั่ง snapshot  |
| `DATABASE_URL`      | PostgreSQL ของ **เว็บไซต์ SUNFORD/CMS เดิม**            | อ่านข้อมูล CMS การตั้งค่าและข้อมูลเว็บไซต์ที่ใช้ Prisma |
| `DIRECT_URL`        | การเชื่อมต่อฐานเว็บไซต์สำหรับ Prisma CLI                | ใช้เมื่อทำงานฐานข้อมูลภายหลัง ไม่ต้องมีเพื่อทดสอบ API   |
| `SUPABASE_URL`      | URL โปรเจกต์ Supabase เดิม ถ้ามีรูปจาก Storage          | คงไว้ตามการใช้งานเดิม                                   |

ทั้ง `WAREHOUSE_API_URL` และ `DATABASE_URL` เป็นตัวแปรฝั่งเซิร์ฟเวอร์ ไม่เติม `NEXT_PUBLIC_` ข้างหน้า

สถานะล่าสุดระหว่างจัดทำคู่มือนี้: ค่าใน `.env.local` อัปเดตแล้ว การเรียก API ผ่านตัวแปรปัจจุบันได้ HTTP 200 และสินค้า 380/380 รายการ ฐานเว็บไซต์ผ่านการตรวจขั้นต่ำ `public.products.slug` และ `public.cms_documents` แล้ว Agent ไม่ได้แก้ไฟล์ env ให้ คู่มือต่อไปนี้ใช้ตรวจซ้ำหรือย้ายเครื่องได้

ก่อนอัปเดตเคยพบ `DATABASE_URL` ชี้ Warehouse ซึ่งไม่มีคอลัมน์ของเว็บและทำให้ Prisma P2022 ต้องแยกสองการเชื่อมต่อตามตารางเสมอ การตรวจขั้นต่ำที่ผ่านยังไม่ใช่หลักฐานว่าการเชื่อมสินค้าครบทุกหน้าทำเสร็จแล้ว

## 1. เปิดไฟล์ให้ถูกตำแหน่ง

เปิด PowerShell แล้วไปที่โฟลเดอร์โปรเจกต์:

```powershell
cd 'C:\Users\cityc\Documents\Project\sunford_web'
notepad .env.local
```

ไฟล์อยู่ระดับเดียวกับ `package.json` ไม่ใช่ใน `src` สำรองค่าปัจจุบันไว้ในที่เก็บส่วนตัวในเครื่องก่อนแก้ และรักษาตัวแปรอื่นที่มีอยู่ ไม่คัดลอกทับทั้งไฟล์ด้วย `.env.example`

## 2. หาค่า WAREHOUSE_API_URL ที่ใช้งานได้

ต้องได้ URL ของบริการ API จากผู้ดูแล Warehouse หรือการตั้งค่า deployment เดิม โดยโค้ดปัจจุบันต่อเส้นทาง `/api/store/products` ให้เอง จึงใส่เฉพาะ origin ซึ่งประกอบด้วย protocol, hostname และ port ถ้ามี ไม่ใส่เส้นทาง API ซ้ำ

**ผลทดสอบ URL ที่ได้รับ:**

```text
GET https://www.sunford.co/api/store/products → 404 (HTML)
GET https://sunford.co/api/store/products → redirect ไป www แล้ว 404 (HTML)
```

จึงยังไม่สามารถยืนยัน `https://www.sunford.co` เป็นค่า API ที่ใช้ได้ ไม่ต้องเปลี่ยน DNS หรือเดา port เพื่อแก้ผลนี้ หาก Warehouse มี endpoint คนละรูปแบบ ให้ขอ URL/contract ที่ถูกต้องก่อนเปลี่ยนโค้ด

เมื่อได้ origin ที่ยืนยันแล้ว เพิ่มหนึ่งบรรทัด เช่นตัวอย่างรูปแบบนี้:

```dotenv
# แทนที่ด้วย origin จริงของบริการที่ทดสอบแล้ว
WAREHOUSE_API_URL="https://warehouse-api.example"
```

สคริปต์นำเข้าเรียก `/api/store/products` และอ่าน JSON ที่มี `total_count`, `items` โดยแต่ละรายการมี `sku`, `product_name`, `unit`, `sale_price`, `image_url`

## 3. นำ DATABASE_URL ของเว็บไซต์เดิมกลับมา

ใช้ connection string ของฐานเว็บเดิมที่มี Prisma schema ของโปรเจกต์ ไม่ใช่ฐานที่ใช้เก็บ master item ของ Warehouse

หากใช้ Supabase ตาม `.env.example` ของโปรเจกต์:

1. เปิด Supabase Dashboard และเลือก **โปรเจกต์ฐานเว็บไซต์เดิม**
2. กด **Connect** แล้วเลือก connection string แบบ transaction pooler สำหรับ `DATABASE_URL` รูปแบบในโปรเจกต์นี้ใช้ port 6543
3. คัดลอก string มาใส่ `.env.local` แทนบรรทัด `DATABASE_URL` เดิม แล้วแทน `[YOUR-PASSWORD]` ด้วยรหัสผ่านฐานข้อมูลของโปรเจกต์นั้น
4. หากต้องเก็บค่า CLI ด้วย ให้ใช้ connection string แบบ session pooler ที่ port 5432 เป็น `DIRECT_URL` ของฐานเว็บเดียวกัน คัดลอกจาก Dashboard; อย่าเปลี่ยนเพียงเลข port โดยไม่ได้ตรวจ connection method

ตัวอย่างโครงสร้างเท่านั้น:

```dotenv
DATABASE_URL="postgresql://postgres.PROJECT_REF:ENCODED_PASSWORD@POOLER_HOST:6543/postgres"
DIRECT_URL="postgresql://postgres.PROJECT_REF:ENCODED_PASSWORD@POOLER_HOST:5432/postgres"
```

หากไม่ได้ใช้ Supabase ให้ใช้ PostgreSQL connection string จากผู้ดูแลฐานเว็บไซต์เดิมตามจริง พอร์ตและชื่อฐานอาจต่างจากตัวอย่างนี้ หากยังไม่พบฐานเว็บเดิม ให้คงขั้นตอนนี้เป็นยังไม่พร้อม แทนการชี้ Prisma ไปยัง Warehouse

รหัสผ่านที่มีอักขระสงวน เช่น `@`, `#`, `%`, `?`, `$` ต้องถูก percent-encode ในส่วน password เช่น `@` เป็น `%40` และ `#` เป็น `%23` วิธีนี้ยังป้องกัน `$` ถูกตีความเป็นการอ้างอิงตัวแปรในไฟล์ env ของ Next.js อย่าใช้เว็บภายนอกเพื่อแปลงรหัสผ่าน และอย่าส่ง connection string ที่มีรหัสผ่านในแชต

`SUPABASE_URL` แบบ HTTPS และ API key ของ Supabase ใช้แทน PostgreSQL `DATABASE_URL` ไม่ได้

## 4. บันทึกแล้วตรวจการเชื่อมต่อแบบอ่านอย่างเดียว

ตรวจว่า Git ไม่ติดตามไฟล์ secret:

```powershell
git check-ignore .env.local
```

ผลที่ต้องได้คือ `.env.local` ซึ่งตรวจผ่านแล้วในโปรเจกต์นี้

ทดสอบ API โดยไม่พิมพ์ URL, token หรือชื่อสินค้าทั้งชุดออกมา:

```powershell
node --env-file=.env.local -e 'const base=process.env.WAREHOUSE_API_URL; if(!base){console.error("WAREHOUSE_API_URL missing");process.exit(1)} (async()=>{const r=await fetch(new URL("/api/store/products",base),{headers:{accept:"application/json"},signal:AbortSignal.timeout(10000)});const type=r.headers.get("content-type")||"";const data=type.includes("application/json")?await r.json():null;console.log({status:r.status,json:!!data,total_count:data?.total_count,items:Array.isArray(data?.items)?data.items.length:null});if(!r.ok||!Array.isArray(data?.items))process.exitCode=1})().catch(e=>{console.error({error:e.name,code:e.cause?.code});process.exitCode=1})'
```

ต้องได้ `status: 200`, `json: true` และ `items` เป็นตัวเลข หากได้ 404 เหมือน URL ปัจจุบัน ให้ตรวจ origin/endpoint กับผู้ดูแล API; การเปลี่ยน `DATABASE_URL` ไม่ได้แก้ 404 ของ API

ตรวจฐานเว็บด้วย SELECT โดยไม่แสดงข้อมูลการเชื่อมต่อ:

```powershell
node --env-file=.env.local -e 'const {Client}=require("pg");if(!process.env.DATABASE_URL){console.error("DATABASE_URL missing");process.exit(1)}const c=new Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:5000});c.connect().then(()=>c.query("select exists(select 1 from information_schema.columns where table_schema=$$public$$ and table_name=$$products$$ and column_name=$$slug$$) as has_product_slug, to_regclass($$public.cms_documents$$) is not null as has_cms_documents")).then(r=>{console.log(r.rows[0]);if(!r.rows[0].has_product_slug||!r.rows[0].has_cms_documents)process.exitCode=1}).catch(e=>{console.error({code:e.code||e.name});process.exitCode=1}).finally(()=>c.end())'
```

ต้องได้ `has_product_slug: true` และ `has_cms_documents: true` เป็นการตรวจขั้นต่ำว่าเป็น schema ของเว็บ ยังไม่ใช่การยืนยันทุกคอลัมน์หรือการทำงานครบทุกหน้า ห้ามรัน `db:migrate`, `db:deploy`, `db:seed` หรือ `prisma db push` เพื่อบังคับให้ฐาน Warehouse ผ่านการตรวจนี้

## 5. เริ่มเว็บใหม่หลังตั้งค่าถูกต้อง

ใน terminal ที่เปิด dev server ของคุณอยู่ กด `Ctrl+C` แล้วเริ่มใหม่จากโฟลเดอร์เดิม:

```powershell
bun run dev
```

ใช้ URL localhost ที่คำสั่งแสดงจริง เพราะ port อาจเปลี่ยนเมื่อมี server อื่นทำงานอยู่ แล้วเปิด `/warehouse-products-test` เพื่อตรวจรายการที่เชื่อมกับเว็บไซต์ หน้านี้ใช้ catalog ที่ผ่านการจับคู่และเผยแพร่ชุดเดียวกับเว็บ จึงไม่จำเป็นต้องมีจำนวนเท่า 380 รายการดิบของ API คำสั่งตรวจในข้อ 4 ยังคงใช้ตรวจ API เต็มชุดได้

อย่าพิมพ์ `DATABASE_URL` หรือเนื้อหา `.env.local` เต็มไฟล์ใน terminal ที่จะนำภาพหรือ log มาแชร์ หากคำสั่งตรวจยังไม่ผ่าน ส่งได้เฉพาะ status/error code ที่ไม่มีรหัสผ่าน

## 6. เงื่อนไขพร้อมเชื่อมสินค้าทั้งเว็บ

- API ตรวจผ่าน HTTP 200 และรูปแบบ JSON ถูกต้อง
- ฐานเว็บตรวจ schema ขั้นต่ำผ่าน และหน้า CMS/เว็บไซต์เดิมเปิดได้
- เทียบ SKU จาก API ครบกับตาราง mapping; รายการซ้ำ variant และชุดอุปกรณ์มีคำตอบชัดเจน
- เมื่อครบแล้วจึงใช้แผนทั้งเว็บที่อนุมัติไว้เปลี่ยน repository จุดกลางและตรวจทุก consumer

การตั้งค่าในเครื่องและการเชื่อมทั้งเว็บไซต์ผ่านการตรวจแล้ว ใช้ 89 SKU กลุ่ม G ที่จับคู่ชัดเจน และพัก 291 SKU ตามคำสั่งผู้ใช้ ไม่ต้องส่ง URL ที่มีรหัสผ่านหรือ connection string ให้ agent ผลตรวจอยู่ใน [runtime-integration-delivery.md](./runtime-integration-delivery.md) รายการที่พักจะยังไม่ถูกเพิ่มบนเว็บจนกว่าจะมีข้อมูลจับคู่ชัดเจน

## แหล่งอ้างอิง

- โค้ดจริง: `src/features/services/warehouse-product.server.ts`, `src/lib/prisma.ts`, `prisma.config.ts`, `prisma/schema.prisma`, `.env.example`
- คู่มือ Next.js เวอร์ชันที่ติดตั้ง: `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md` — ตำแหน่ง env, การอ่านฝั่งเซิร์ฟเวอร์ และลำดับค่าที่มีผล
- [Supabase: Connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres) — Connect dialog และ connection modes
- [Supabase: Password special symbols](https://supabase.com/docs/guides/database/postgres/roles#special-symbols-in-passwords) — percent-encoding รหัสผ่าน
