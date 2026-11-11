# อ่านข้อมูล Warehouse โดยตรง

กติกาปัจจุบัน: 12 พฤศจิกายน 2026

หน้าร้านและใบเสนอราคาอ่านสินค้า ราคา หน่วย รูป และสเปกที่ยืนยันแล้วจาก PostgreSQL/Storage ของ Warehouse โดยตรง ไม่ต้องเปิดแอป Warehouse หรือเรียก API ของแอปนั้น แต่ฐานข้อมูลและ Storage ต้องเชื่อมถึงได้

## แยกการเชื่อมต่อ

| ตัวแปร                                                                | ใช้สำหรับ                                               |
| --------------------------------------------------------------------- | ------------------------------------------------------- |
| `WAREHOUSE_DATABASE_URL`                                              | PostgreSQL Warehouse ใช้บัญชีอ่านข้อมูล                 |
| `WAREHOUSE_COMPANY_ID`                                                | บริษัทที่ต้องการอ่าน                                    |
| `WAREHOUSE_S3_ENDPOINT`, `WAREHOUSE_S3_BUCKET`, `WAREHOUSE_S3_REGION` | Storage รูปสินค้าของ Warehouse                          |
| `WAREHOUSE_S3_KEY`, `WAREHOUSE_S3_SECRET`                             | สิทธิ์อ่าน Storage ฝั่งเซิร์ฟเวอร์                      |
| `DATABASE_URL`, `DIRECT_URL`                                          | ทะเบียนเลขใบเสนอราคาและ migration เดิม แยกจาก Warehouse |

ตั้งค่าใน `.env.local` หรือ environment ของ deployment โดยใช้ `.env.example` เป็นแบบ ห้ามเติม `NEXT_PUBLIC_` หรือส่ง credentials ไปใน browser/log และห้ามชี้ Prisma migration ไป Warehouse

Production ต้องมีฐานทะเบียนเลขใบเสนอราคาแยก เครื่องพัฒนาที่ไม่มีฐานทะเบียนใช้ SQLite ใน `.local/quotation-issues.sqlite` ซึ่งถูก ignore ส่วนข้อมูลสินค้าและราคายังอ่าน Warehouse เหมือนเดิม

## เส้นทางข้อมูล

1. `src/features/services/warehouse-postgres.ts` สร้าง connection pool และใช้ SQL แบบ parameterized อ่านสินค้า หน่วย กลุ่มสินค้า verified facts และ component rows
2. `src/features/catalog/server/product-repository.ts` รวมข้อมูลเป็น Product และใช้ `warehouseSiteProducts` ตัดข้อมูลสินค้าเดิมออกจากผลลัพธ์หน้าภายใน
3. Card/detail/search/comparison/Carousel ใช้ Warehouse projection เดียวกัน หน้าใบเสนอราคาเรียก `getCurrentProducts` เพื่ออ่านราคาปัจจุบันก่อนให้เลือกสินค้า
4. `src/app/api/products/[sku]/image/route.ts` อ่านรูปจาก Storage เมื่อ cache รูปเดิมใช้ไม่ได้

`master_data.master_item` และ `master_data.master_unit` เป็นแหล่งสินค้า/หน่วย สเปกใช้เฉพาะค่าที่ verified และไม่ขัดแย้งกัน การจับคู่หัวอ่าน/แท่นต้องมีหลักฐานใน verified facts หรือ `master_data.master_item_component_line` ชื่อรุ่นเพียงอย่างเดียวไม่ยืนยันว่าจับคู่กันได้

## กติกาการแสดงสินค้าและราคา

- อ่านเฉพาะบริษัทที่ตั้งไว้ สินค้า active/saleable/ไม่ถูกลบ หน่วยยังใช้งาน และราคาขายตั้งแต่ศูนย์ขึ้นไป ไม่มีเงื่อนไขสต็อก
- ตัด SKU ขึ้นต้น X และ4รหัสค่าสอบเทียบที่กำหนดให้ซ่อน ไม่โฆษณาบริการสอบเทียบของ SUNFORD
- ราคาศูนย์แสดง “สอบถามราคา” และค้นหาได้ การออกใบเสนอราคาอัตโนมัติเลือกเฉพาะ SKU ที่มีราคาก่อนภาษีมากกว่าศูนย์
- ราคาต้นทางเป็นก่อน VAT เก็บเป็นจำนวนสตางค์ ราคาหน้าร้านรวม VAT7% ส่วนใบเสนอราคารวมราคาก่อนภาษีตามจำนวนแล้วคำนวณ VAT7% ที่ยอดเอกสารครั้งเดียว
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

`warehouseNetUnitSatang` คือราคาก่อนภาษีเป็นสตางค์ `price` คือราคาขายรวม VAT เป็นบาทหรือ null เมื่อสอบถามราคา เปรียบเทียบ SKU กับค่าในฐานผ่านโค้ด SQL ของ `warehouse-postgres.ts` ฝั่งเซิร์ฟเวอร์ได้ ตรวจสุขภาพการเชื่อมต่อที่ `/api/health` โดยไม่แสดง connection string

## ประวัติการตรวจ

รายงานเดิมใน `output/warehouse-direct-postgres-20261111/`, `output/warehouse-image-only-20261111/`, `output/warehouse-primary-images-20261111/` และ `output/cms-removal-20261111/` บันทึกช่วงก่อนกติกา Warehouse-only ขยายครบหน้าภายใน ตัวเลข SKU และผลทดสอบ fallback ของช่วงนั้นเป็นประวัติ ไม่ใช่นโยบายปัจจุบัน

ผล Warehouse-only ล่าสุดและข้อยกเว้นหน้าแรกอยู่ใน Current architecture ของ `spec.md` การ push branch safe ไม่ใช่การปล่อย production ให้ใช้กระบวนการ `uat` และ `bun run deploy` ตามคู่มือเดิม
