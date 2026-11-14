# อ่านข้อมูล Warehouse ผ่าน PostgreSQL RPC

กติกาปัจจุบัน: 12 พฤศจิกายน 2026

หน้าร้านและใบเสนอราคาอ่านสินค้า ราคา หน่วย รูป และสเปกที่ยืนยันแล้วจาก PostgreSQL/Storage ของ Warehouse โดยตรง ไม่ต้องเปิดแอป Warehouse หรือเรียก API ของแอปนั้น แต่ฐานข้อมูลและ Storage ต้องเชื่อมถึงได้

ตัวกรองเว็บไซต์เพิ่มเติม (14 พฤศจิกายน 2026): ใช้ `isPublicWarehouseItem` ร่วมกันในตัวอ่าน RPC, parser และ catalogue เพื่อซ่อนกลุ่มค่าบริการ/ขนส่ง/ส่วนลด/บัตรกำนัล/ถุงมือและอุปกรณ์ป้องกัน รวมชื่อสินค้าหรือชื่อย่อที่ระบุค่าบริการ ถุงมือ หรือด้าย รักษารายการ SKU ที่เจ้าของเลือกซ่อน ได้แก่ WEWEIGHT Subscription 4 รายการ หน้ากาก ผ้ากันเปื้อน และ DEVAPP (ค่าพัฒนาโปรแกรม) ต่อไป รายการที่ถูกซ่อนไม่ถูกส่งเป็นสินค้า facts components ของสินค้านั้น หรือ metadata รูป แม้เรียก SKU โดยตรง หน้ารายละเอียดเดิมจะไม่พบสินค้าหลัง cache รีเฟรช

ตัวกรองนี้ไม่เขียนหรือแก้ RPC/ข้อมูล Warehouse และไม่เปลี่ยนราคา/VAT/กติกา is_active/is_saleable/is_deleted เดิม เครื่องชั่งที่มีใบรับรอง calibration ฟรี อะไหล่ POS เครื่องพิมพ์ และวัสดุสิ้นเปลืองยังคงผ่านได้ตามข้อมูลจริง วัตถุดิบที่ไม่ใช่ด้ายและยังไม่ได้รับคำสั่งซ่อนยังคงอยู่ การเปิดใช้งาน is_saleable เพียงอย่างเดียวไม่สามารถข้ามตัวกรองเว็บไซต์นี้ได้

## แยกการเชื่อมต่อ

| ตัวแปร                                                                | ใช้สำหรับ                                                                 |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `WAREHOUSE_DATABASE_URL`                                              | PostgreSQL Warehouse ใช้บัญชีอ่านข้อมูล                                   |
| `WAREHOUSE_COMPANY_ID`                                                | บริษัทที่ต้องการอ่าน                                                      |
| `WAREHOUSE_S3_ENDPOINT`, `WAREHOUSE_S3_BUCKET`, `WAREHOUSE_S3_REGION` | Storage รูปสินค้าของ Warehouse                                            |
| `WAREHOUSE_S3_KEY`, `WAREHOUSE_S3_SECRET`                             | สิทธิ์อ่าน Storage ฝั่งเซิร์ฟเวอร์                                        |
| `QUOTATION_DATABASE_URL`                                              | การเชื่อมต่อเขียนเฉพาะทะเบียนเว็บ ecommerce.quotation_issues ใน Warehouse |

ตั้งค่าใน `.env.local` หรือ environment ของ deployment โดยใช้ `.env.example` เป็นแบบ ห้ามเติม `NEXT_PUBLIC_` หรือส่ง credentials ไปใน browser/log และห้ามรัน Prisma migration ของ CMS เดิมเข้า Warehouse

Production ต้องตั้ง `QUOTATION_DATABASE_URL` เป็น direct/session connection ของ Warehouse สำหรับตาราง `ecommerce.quotation_issues` เท่านั้น ใช้ `npm run db:deploy` เพื่อ setup/ตรวจตารางแบบ idempotent โดยไม่ล้างเลขและไม่รัน migration ของ CMS/auth เดิม PrismaPg กำหนด schema ecommerce และตัว allocator ระบุชื่อตารางพร้อม schema ทุกคำสั่ง แยกจาก pool สินค้าที่บังคับ read-only และจาก counter ของเอกสาร Warehouse

เครื่องพัฒนาที่ไม่ได้ตั้งทะเบียนใช้ SQLite ใน `.local/quotation-issues.sqlite` ซึ่งถูก ignore ส่วน production ไม่ fallback ไป SQLite หรือฐาน Supabase เดิม การย้าย/ลบ project เก่าต้องตรวจประวัติเลขและ deployment ก่อนตาม Spec/Plan

## เส้นทางข้อมูล

1. `src/features/services/warehouse-postgres.ts` สร้าง connection pool และเรียก `ecommerce.get_website_products($1::bigint, $2::text[])` ด้วย parameters ที่ bind ไว้ การ join ตารางสินค้า หน่วย กลุ่ม verified facts และ component rows อยู่ในฟังก์ชันฐานข้อมูล
2. `src/features/catalog/server/product-repository.ts` รวมสินค้า facts และ components จาก RPC ครั้งเดียวเป็น Product และใช้ `warehouseSiteProducts` ตัดข้อมูลสินค้าเดิมออกจากผลลัพธ์หน้าภายใน
3. Card/detail/search/comparison/Carousel ใช้ Warehouse projection เดียวกัน หน้าใบเสนอราคาเรียก `getCurrentProducts` เพื่ออ่านราคาปัจจุบันก่อนให้เลือกสินค้า
4. `src/app/api/products/[sku]/image/route.ts` อ่านรูปจาก Storage เมื่อ cache รูปเดิมใช้ไม่ได้

`master_data.master_item` และ `master_data.master_unit` เป็นแหล่งสินค้า/หน่วย สเปกใช้เฉพาะค่าที่ verified และไม่ขัดแย้งกัน การจับคู่หัวอ่าน/แท่นต้องมีหลักฐานใน verified facts หรือ `master_data.master_item_component_line` ชื่อรุ่นเพียงอย่างเดียวไม่ยืนยันว่าจับคู่กันได้

หมวดสินค้าอ่านผ่าน `warehouse-classification.ts` โดยใช้ชื่อ คำอธิบาย กลุ่ม และ verified facts จาก RPC เท่านั้น อุปกรณ์ไร้สายทั้งเครื่องจะจัดตามประเภทอุปกรณ์ วัสดุจานหรือเสาไม่ใช้ยืนยันเกรดโครงแท่น และระบบ POS ต้องระบุ OS ก่อนเข้าหมวดย่อย ผลตรวจวันที่12พฤศจิกายน2569ครอบคลุม485SKU อยู่ใน [ตารางผลตรวจ](./category-audit-485.md) และ [คำถามราย SKU](./category-review-485.md) จำนวนนี้เป็นค่าขณะตรวจ ข้อมูลสดอาจเปลี่ยนภายหลัง

## สัญญา RPC และการติดตั้ง

นิยามที่ตรวจแล้วอยู่ใน `docs/warehouse/get-website-products.sql` ใช้กับ `warehouse_db` เท่านั้น เปิดไฟล์นี้ใน SQL client ของฐาน Warehouse แล้ว execute ภายใน transaction ด้วย role เจ้าของฟังก์ชัน หลังตรวจว่าชื่อฟังก์ชันยังไม่ชนกับของระบบอื่น การติดตั้งแก้เฉพาะฟังก์ชัน comment และ execution ACL ของฟังก์ชันนี้ ไม่รัน Prisma migration หรือแก้ตาราง/ข้อมูลสินค้า

```sql
-- อ่านครบทั้งบริษัท ไม่มี LIMIT แฝง
SELECT * FROM ecommerce.get_website_products(1);

-- กรอง SKU แบบ exact; ส่งผ่าน bound parameter ในโค้ดเว็บ
SELECT * FROM ecommerce.get_website_products(1, ARRAY['G106698']);

-- อาร์เรย์ว่างหมายถึงไม่เลือกรายการใด ต่างจาก NULL ที่อ่านครบ
SELECT * FROM ecommerce.get_website_products(1, ARRAY[]::text[]);
```

เลขบริษัทในตัวอย่างคือบริษัทที่ตรวจพบปัจจุบัน ตัวฟังก์ชันรับ `p_master_company_id` จริงจาก environment ไม่ได้กำหนดบริษัทไว้ตายตัว

หนึ่งแถวต่อสินค้าคืน `product_name=item_name` แบบเต็ม, `product_short_name` จาก `item_short_name` แบบ trim หรือ `NULL` เมื่อว่าง, คำอธิบาย หน่วย กลุ่ม usage family ราคาก่อน VAT เป็น text, `master_item_id` เป็น text, metadata รูป/version, `read_at` และอาร์เรย์ JSONB สองชุด: `specifications` มี verified attributes พร้อม text/numeric/options/unit; `components` มี SKU/quantity ของส่วนประกอบ อาร์เรย์ไม่มีข้อมูลคืน `[]` เว็บยังใช้กติกาเดิมในการละค่าของสเปกที่ขัดแย้งกัน

RPC คืน metadata ของรูปหลักเท่านั้น ไฟล์รูปจริงยังอ่านจาก Spaces/cache เดิม ไม่คืน S3 credentials หรือ URL ที่สมมติขึ้น การค้น metadata ของรูปก็ใช้ RPC โดยส่งอาร์เรย์ SKU เดียว

ฟังก์ชันเป็น SQL `STABLE`, `SECURITY INVOKER` และกำหนด `search_path=pg_catalog` โดยระบุตารางพร้อม schema ครบ Role เจ้าของที่ตั้งค่าไว้เรียกได้ ส่วน `PUBLIC` ไม่มี EXECUTE หากเปลี่ยนไปใช้ role อ่านข้อมูลเฉพาะ ต้องให้ USAGE/SELECT/EXECUTE ตาม scope จริงแยกต่างหาก ไม่มีการ grant ให้ anonymous/API role และยังไม่ได้เปิดเส้น HTTP/PostgREST

ถ้า RPC ไม่มี สิทธิ์ไม่พอ หรือผลลัพธ์ผิดสัญญา เว็บจะแสดงข้อผิดพลาดตามกติกาเดิม ไม่ย้อนกลับไป query ตารางตรง คำสั่ง rollback ฟังก์ชันอยู่ท้ายไฟล์ SQL เป็น comment ให้คืนโค้ด caller เดิมก่อน แล้วจึงลบเฉพาะ signature นี้เมื่อไม่มีผู้ใช้งานเหลือ

## กติกาการแสดงสินค้าและราคา

- อ่านเฉพาะบริษัทที่ตั้งไว้ สินค้า active/saleable/ไม่ถูกลบ หน่วยยังใช้งาน และราคาขายตั้งแต่ศูนย์ขึ้นไป ไม่มีเงื่อนไขสต็อก
- ตัด SKU ขึ้นต้น X และ4รหัสค่าสอบเทียบที่กำหนดให้ซ่อน ไม่โฆษณาบริการสอบเทียบของ SUNFORD
- ราคาศูนย์แสดง “สอบถามราคา” และค้นหาได้ การออกใบเสนอราคาอัตโนมัติเลือกเฉพาะ SKU ที่มีราคาก่อนภาษีมากกว่าศูนย์
- ราคาต้นทาง `standard_sale_price` เป็นก่อน VAT เก็บเป็นจำนวนสตางค์ ราคาหน้าร้านแสดงค่าตรงตามต้นทางโดยไม่บวก VAT ตามการอนุมัติวันที่13พฤศจิกายน2026 ส่วนใบเสนอราคารวมราคาก่อนภาษีตามจำนวนแล้วคำนวณ VAT7% ที่ยอดเอกสารครั้งเดียว
- รูป สเปก คำอธิบาย หรือ compatibility ที่ Warehouse ไม่มีให้เว้นไว้ ไม่เติมด้วยข้อมูลสินค้าเดิม
- หน้าแรก/Hero เป็นข้อยกเว้นที่คงภาพ วิดีโอ และข้อความเดิมผ่าน `getHomeProducts` และ `getHomeContentPages` หมวด/Carousel ภายในใช้ข้อมูล Warehouse โดยคงลำดับ36ช่องของ Carousel
- จำนวน SKU เปลี่ยนตามฐาน ตรวจจำนวนปัจจุบันจาก API แทนการยึดจำนวนในรายงานเก่า

## เวลาอัปเดตและเมื่อเชื่อมต่อไม่ได้

Catalog ใช้ stale30วินาที เริ่ม revalidate หลัง60วินาทีเมื่อมีคำขอ และ expire300วินาที ระหว่าง revalidate อาจเห็นค่าที่ cache ไว้ หน้าเปิดค้างไม่มี push ให้รีเฟรชหรือเปิดใหม่ ใบเสนอราคาอ่านข้อมูลปัจจุบันตอนเปิด/รีเฟรชหน้า และไม่ได้แสดงวันที่บันทึก snapshot สินค้า เพราะไม่มี snapshot ราคาที่ใช้งานแล้ว

Pool แยกจาก Prisma จำกัด3connection, connection timeout5วินาที, statement timeout10วินาที และ `default_transaction_read_only=on` อ่านซ้ำได้อีก1ครั้งเฉพาะการหลุดชั่วคราว ข้อผิดพลาด schema/data ไม่ถูกซ่อน

หากอ่าน Warehouse ไม่ได้ API ที่ไม่มี cache ตอบ503ด้วยข้อความทั่วไป ใบเสนอราคาแสดงข้อผิดพลาดและไม่มีฟอร์มพิมพ์ ไม่มีการนำราคาเก่าจากไฟล์มาแทน ส่วน cached catalog อาจยังให้บริการได้ตามอายุ cache

## Cache รูปและไฟล์อ้างอิง

`data/warehouse/images.json` เก็บเพียง `sku`, `master_item_id`, `updated_at`, `local_image` ไม่มีชื่อหรือราคา รูปจริงอยู่ใน `public/images/warehouse-cache/` ใช้ได้เมื่อ item/version ตรงกับฐานปัจจุบัน หาก Warehouse ไม่มีรูป จะไม่ดึงรูปสินค้าเดิมมาเติม

URL รูปมี `?v=<updated_at>` เมื่อ metadata เปลี่ยน การอ่านรอบใหม่จึงใช้ cache คนละเวอร์ชัน รูปใหม่อ่านจาก Storage โดยจำกัดชนิดไฟล์และขนาด10MB การเขียน Storage โดยไม่เปลี่ยน metadata จะไม่มีเวอร์ชันใหม่ให้เว็บตรวจจับ

อัปเดตเฉพาะ cache รูป:

```powershell
bun run warehouse:images
```

สคริปต์อยู่ที่ `scripts/cache-warehouse-images.ts` อ่าน PostgreSQL/Storage และเขียน manifest หลังดาวน์โหลดสำเร็จ ไม่อัปเดตรายชื่อหรือราคา ไม่มี `warehouse:snapshot` และไม่มี `data/warehouse/products.json` ที่ใช้เป็นราคาสำรอง

`src/features/content/data/products.json`, `pages.json` และรูป imported เก็บเป็นข้อมูลอ้างอิง/ข้อยกเว้นหน้าแรกเท่านั้น ค่าตั้งเว็บและเมนูอยู่ใน `data/site/content.json` และ `src/features/site/` ไม่มีการอ่าน CMS

## ตรวจแบบง่าย

เปิดเว็บด้วย Node24 และ `bun run dev` แล้วใช้ PowerShell:

```powershell
$catalog = Invoke-RestMethod 'http://localhost:3000/api/products'
$catalog.products.Count
$catalog.products |
  Select-Object warehouseSku, name, warehouseUnit, warehouseNetUnitSatang, price, image |
  Format-Table -AutoSize
```

`warehouseNetUnitSatang` คือราคาก่อนภาษีเป็นสตางค์ `price` คือ `standard_sale_price` ก่อน VAT เป็นบาทหรือ null เมื่อสอบถามราคา เปรียบเทียบ SKU กับค่าในฐานผ่านโค้ด SQL ของ `warehouse-postgres.ts` ฝั่งเซิร์ฟเวอร์ได้ ตรวจสุขภาพการเชื่อมต่อที่ `/api/health` โดยไม่แสดง connection string

## ประวัติการตรวจ

รายงานเดิมใน `output/warehouse-direct-postgres-20261111/`, `output/warehouse-image-only-20261111/`, `output/warehouse-primary-images-20261111/` และ `output/cms-removal-20261111/` บันทึกช่วงก่อนกติกา Warehouse-only ขยายครบหน้าภายใน ตัวเลข SKU และผลทดสอบ fallback ของช่วงนั้นเป็นประวัติ ไม่ใช่นโยบายปัจจุบัน

ผล Warehouse-only ล่าสุดและข้อยกเว้นหน้าแรกอยู่ใน Current architecture ของ `spec.md` การ push branch safe ไม่ใช่การปล่อย production ให้ใช้กระบวนการ `uat` และ `bun run deploy` ตามคู่มือเดิม

## หน้าร้านครบจาก RPC และชื่อจาก Warehouse (2026-11-13)

`src/features/catalog/data/warehouse-storefront-selection.json` เก็บ company, ที่มาของไฟล์, SHA256, รายชื่อชีต และ `masterItemId`/`sku`/`name`/`categoryId` ที่เลือกจาก Excel ไม่ใช่สำเนาราคา รูป หรือสเปกสินค้า ฟิลด์ `name` ใน manifest เป็นประวัติการนำเข้าและไม่ใช้ override ชื่อที่แสดงแล้ว; runtime ใช้ manifest เฉพาะหมวดหลักที่ตรงกับ SKU/ID ปัจจุบัน

ชื่อที่แสดงเลือก `product_short_name` ก่อน ถ้าไม่มีจึงเลือก `product_name` แบบเต็ม จากนั้นใช้ตัวตัดรุ่นเดิมเพื่อแสดงเฉพาะชื่อเครื่อง/รุ่นเมื่อระบุได้อย่างปลอดภัย ถ้าตัดไม่ได้จะคงข้อความต้นทางที่เลือกไว้เต็ม ๆ ไม่เปลี่ยนเป็น SKU และไม่สร้างชื่อขึ้นเอง `warehouseName` ยังคง `item_name` เต็มสำหรับค้นหาชื่อเต็ม ตรวจที่มา และบรรทัดเอกสารใบเสนอราคา

เส้นทางปัจจุบัน: `get_website_products` → `getCurrentProducts` ประกอบข้อมูลจริงและ resolve ชื่อจาก short/full source หนึ่งครั้ง → `getProducts` ใช้ manifest เฉพาะหมวดเมื่อมี แต่แสดงสินค้าจริงครบจาก RPC → การ์ด รายละเอียด `/api/products` Navbar search, catalogue finder, comparison และตัวเลือกใบเสนอราคาใช้ชื่อเดียวกัน ไม่สร้างสินค้าที่ RPC ไม่ส่งกลับ

คำสั่งล่าสุดของเจ้าของยกเลิกการจำกัดสินค้าเฉพาะ5ชีตแล้ว โดยคงเงื่อนไข `is_active=true AND is_saleable=true`, ไม่ถูกลบ, หน่วยใช้ได้ และราคาไม่ติดลบใน RPC เดิม ไม่มีการแก้ SQL หรือสถานะสินค้า ยังคงซ่อน SKU ขึ้นต้น X และค่าสอบเทียบ4รหัส (`72`, `Calibration Fee Type 2`, `S000005`, `S000006`) ตามเดิม ชุดตรวจปัจจุบันมี516แถวจาก RPC เหลือ486รายการสาธารณะ เทียบกับ375รายการในช่วงจำกัดด้วย Excel จึงเพิ่ม111รายการจริงนอกชีต

ประวัติรอบตรวจแรก:547รายการใน Excel ตรงกับ RPC375รายการ (เครื่องชั่ง192, อินดิเคเตอร์13, โครงสร้างแท่น34, POS40, อุปกรณ์เสริม96) อีก172รายการไม่ผ่านเงื่อนไข RPC ตัวเลขเหล่านี้ไม่ใช่จำนวนที่กำหนดตายตัวของเว็บแล้ว สินค้าราคา0ยังใช้ข้อความ “สอบถามราคา” และข้อมูลที่ไม่มีรวมถึงรูปยังเว้นว่างตามเดิม รายการถูกซ่อน/ไม่ผ่าน RPC เปิด URL รายละเอียดแล้วแสดงหน้าไม่พบข้อมูลพร้อม `noindex` (parent Suspense เดิมอาจเริ่ม stream ด้วย HTTP200ก่อน `notFound`)

หน้าแรก/Hero ใช้ `getHomeProducts` เดิม ส่วนใบเสนอราคาใช้ `getCurrentProducts` เดิมและยังเลือกได้เฉพาะสินค้าราคาบวก `item_code` เดินทางเป็น RPC `sku` → `warehouseSku` และเป็น `id` ในตัวเลือกใบเสนอราคา จึงค้นได้แบบไม่สนตัวพิมพ์ทั้ง Navbar, catalogue/finder/category และ quotation picker พร้อมยังค้นชื่อที่แสดงและ `item_name` เต็มได้

เมื่อแก้หมวดใน Excel เพิ่มเติม ต้องบันทึกไฟล์แล้วนำเข้า5ชีตใหม่: ตรวจชื่อคอลัมน์และ SKU/ID ไม่ซ้ำ, เทียบ SKU/ID กับ RPC ของ company เดียวกัน, บันทึก hash/ชื่อชีตและ metadata ต่อรายการลง manifest, ตรวจหมวด/การค้นหา แล้ว build/deployตามขั้นตอนปกติ การแก้ชื่อในไฟล์ Desktop ไม่เปลี่ยนชื่อบนเว็บ เพราะไม่มีการอ่าน Excel ที่ runtime และชื่อมาจาก Warehouse การลบแถวออกจาก manifest หมายถึงเลิกใช้หมวดที่ override ไม่ใช่ซ่อนสินค้าจากเว็บ สินค้าที่เพิ่มใน Warehouse และผ่าน RPC จะแสดงได้โดยไม่ต้องเพิ่มลง Excel ก่อน ห้ามนำราคา/รูป/สเปกเก่าจาก Excel มาเติมกรณีฐานไม่ส่งข้อมูล
