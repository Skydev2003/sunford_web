# Sunford Admin

เข้าใช้งานที่ `/admin/login` ระบบใช้ Supabase Auth แบบอีเมล/รหัสผ่าน และใช้ตาราง `public.admin_users` เป็นแหล่งสิทธิ์แอดมิน ไม่มีหน้าสมัครแอดมินแบบสาธารณะ

## ตั้งค่า

`.env` ต้องมี `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` โดยเป็น Supabase project เดียวกันทั้งหมด

```bash
npm install
npm run db:deploy
npm run admin:create -- admin@example.com
```

คำสั่งสร้างบัญชีต้องมี `SUPABASE_SECRET_KEY` หรือ `SUPABASE_SERVICE_ROLE_KEY` ใน `.env` และจะถามรหัสผ่านแบบไม่แสดงตัวอักษร ไม่ส่งรหัสผ่านเป็น command argument ไม่เก็บไว้ใน source code ถ้าอีเมลมีอยู่แล้ว คำสั่งจะเพิ่มสิทธิ์แอดมินให้โดยไม่เปลี่ยนรหัสผ่าน บัญชีใหม่สร้างผ่าน Supabase Auth Admin API และยืนยันอีเมลผ่าน API นี้โดยไม่ส่งอีเมลออกไป

คีย์ secret/service-role ใช้เฉพาะเครื่องมือ provisioning และการทดสอบ ไม่จำเป็นสำหรับ runtime ของหน้าแอดมิน และห้ามใช้ชื่อ environment ที่ขึ้นต้นด้วย `NEXT_PUBLIC_` สำหรับคีย์นี้

การถอนสิทธิ์ให้ลบแถว `admin_users` ที่ตรงกับ user id ผ่านเครื่องมือฐานข้อมูลที่เชื่อถือได้ ไม่ต้องลบบัญชี Auth ผู้ใช้จะไม่ผ่านการตรวจสิทธิ์ในคำขอถัดไป

## โครงสร้างและสิทธิ์

- `src/app/(site)` คือหน้าเว็บสาธารณะ URL เดิมยังเหมือนเดิม
- `src/app/admin/login` คือหน้าเข้าสู่ระบบ
- `src/app/admin/(protected)` คือหน้าแอดมินที่มี layout ตรวจสิทธิ์
- `src/features/admin/server/auth.ts` ตรวจตัวตนด้วย `supabase.auth.getUser()` และตรวจ membership จาก PostgreSQL ไม่มีการเชื่อ session cookie ที่ยังไม่ได้ตรวจสอบหรือ `user_metadata` เพื่อให้สิทธิ์
- ทุก Server Action ที่แก้สินค้า อัปโหลด หรือทิ้งรูป ตรวจสิทธิ์ซ้ำ ไม่พึ่งการซ่อนปุ่มหรือ redirect ใน layout
- `src/proxy.ts` refresh session เฉพาะ `/admin/*` และส่ง `Cache-Control: private, no-store` ใช้ cookie แบบ HttpOnly, SameSite=Lax และ Secure เมื่อรัน production ผ่าน HTTPS
- หน้าสินค้าแอดมินอ่านข้อมูลสดครบ 150 รายการที่นำเข้า รวมสินค้าใหม่และฉบับร่าง ส่วนหน้าสาธารณะอ่านเฉพาะ `published=true` และ `deletedAt=null`
- รองรับครบ 8 หมวด: พาณิชย์ อุตสาหกรรม อาหาร อัจฉริยะ POS ห้องปฏิบัติการ อุปกรณ์เสริม และไลฟ์สไตล์/สุขภาพ
- ใช้ `npm run db:deploy` แล้ว `npm run db:seed` ในแต่ละ environment เพื่อเพิ่ม schema และนำเข้าสินค้าที่ขาด คำสั่ง seed สำรองตารางสินค้าในโฟลเดอร์ Sunford/backups ใต้ LOCALAPPDATA (หรือ home directory) ก่อนนำเข้า และเพิ่มเฉพาะ ID ที่ยังไม่มี ไม่เขียนทับสินค้าเดิม ฉบับร่าง หรือสินค้าที่ลบแล้ว
- ข้อมูล 6 รุ่นเดิมเก็บค่าในฐานข้อมูลเดิมไว้ครบ ใช้ snapshot สำหรับการแสดงผลก่อนแก้ครั้งแรก เมื่อกดบันทึกจากแอดมินจะตั้ง `catalogManaged=true` และใช้ค่าที่บันทึก การเปลี่ยนชื่อ คำโปรย รูป หมวด สเปกย่อ และสถานะจึงมีผลจริง โดยคง source ID ราคา แกลเลอรี และรายละเอียดต้นฉบับไว้
- URL เดิมที่มีตัวพิมพ์ใหญ่/เล็กและขีดล่างยังใช้ได้ หลังเปลี่ยน slug ของสินค้านำเข้า URL เดิมกับ source ID ยังอ้างอิงสินค้าตัวเดิม
- ลบสินค้าใช้ `deletedAt` เพื่อนำออกจากเว็บและรายการแอดมิน โดยเก็บข้อมูลและรูปไว้ภายใน ไม่ลบไฟล์ต้นฉบับ และไม่ถูก seed เพิ่มกลับมาเอง การซ่อนใช้การยกเลิก “เผยแพร่บนเว็บไซต์” แล้วบันทึก จึงยังแก้และเผยแพร่ใหม่ได้
- บันทึก/ลบแล้ว invalidate tag `products` และหน้าที่เกี่ยวข้อง เพื่อให้แคตตาล็อกอัปเดตทันที
- ฟอร์มตรวจข้อมูลด้วย Zod และตรวจ `updatedAt` ตอนแก้/ลบ เพื่อไม่ทับข้อมูลที่ถูกแก้จากอีกหน้า
- `products` ไม่เปิด Data API writes ให้ anonymous/authenticated users การแก้ไขผ่าน Prisma หลังตรวจแอดมินฝั่งเซิร์ฟเวอร์เท่านั้น

Migration แอดมินใช้ schema `auth` และ `storage` ของ Supabase โดยตรง หากสร้าง shadow database สำหรับ `migrate dev` ต้องใช้สภาพแวดล้อม Supabase ที่มี schema เหล่านี้ ห้าม reset ฐานข้อมูลใช้งานจริงเพื่อทดลอง migration

## รูปภาพหน้าแรก

เปิดเมนู **รูปภาพหน้าแรก** หรือ `/admin/home-images` เพื่อเปลี่ยนรูป 5 ตำแหน่งแยกกัน: สินค้าเด่นบนพื้นดำ เครื่องชั่งดิจิทัล เครื่องชั่งอัจฉริยะ อุปกรณ์เสริม และแอปพลิเคชัน/ซอฟต์แวร์

กด **เลือกรูปใหม่** เลือก JPG/PNG/WebP ไม่เกิน 5 MB แล้วกด **บันทึกรูป** ในช่องนั้น หน้าแรกอัปเดตหลังบันทึก โดยไม่เปลี่ยนข้อมูลหรือรูปสินค้า กด **ใช้รูปเดิม** แล้วบันทึกเพื่อกลับไปใช้รูปตามค่าเริ่มต้นของช่องนั้น

Migration `homepage_images` เพิ่มตารางแยกและเปิด RLS ไม่แก้ข้อมูลสินค้า รูปเดิมแสดงเหมือนเดิมเมื่อยังไม่มีการตั้งค่า Server Actions ตรวจสิทธิ์แอดมินและเวอร์ชันก่อนบันทึก พร้อม invalidate tag `home-images` รูปใน Storage ที่หน้าแรกยังอ้างอิงจะไม่ถูก product cleanup ลบ การยกเลิกโดยปิดแท็บหลังอัปโหลดอาจเหลือไฟล์ที่ยังไม่ถูกอ้างอิงเช่นเดียวกับฟอร์มสินค้า

## รูปสินค้า

Bucket: `product-images` เปิด public read สำหรับรูปบนเว็บไซต์ จำกัด 5 MB และ MIME `image/jpeg`, `image/png`, `image/webp` การอัปโหลดใช้ JWT ของผู้ใช้และ RLS ไม่ใช้ service-role key ข้ามสิทธิ์

- INSERT: ต้องเป็นแอดมินและ path เริ่มด้วย user id ของตัวเอง
- SELECT/DELETE: ต้องเป็นแอดมิน
- ไม่มี UPDATE policy; ใช้ชื่อไฟล์ UUID ใหม่ทุกครั้งเพื่อเลี่ยงการเขียนทับและปัญหา cache
- Server Action ตรวจชนิดจาก bytes จริงด้วย `file-type` ปฏิเสธ SVG/ไฟล์ที่ปลอมชื่อเป็นภาพ
- ฟอร์มยอมรับภาพเดิมใน `/images/products` และ `/images/imported` รวม AVIF เดิม หรือ URL ที่สร้างจาก bucket ของ project นี้เท่านั้น สินค้าที่ยังไม่มีรูปสามารถบันทึกได้
- เมื่อเปลี่ยนรูป จะพยายามลบรูปอัปโหลดเก่าที่ไม่มีสินค้าอื่นอ้างอิงหลังบันทึกสำเร็จ แต่การลบสินค้าเก็บรูปไว้สำหรับกู้คืน ความล้มเหลวของ Storage cleanup จะไม่ย้อนการบันทึกสินค้า
- ปุ่มยกเลิก/กลับจากฟอร์มพยายามลบรูปที่เพิ่งอัปโหลดและยังไม่ได้ใช้ หากปิดแท็บทันทีหรือเน็ตหลุด อาจมีไฟล์ที่ไม่ถูกอ้างอิงเหลือใน bucket ต้องตรวจผ่านเครื่องมือ Storage ก่อนลบ ไม่ลบไฟล์จาก `storage.objects` ด้วย SQL
- Public images may remain cached by a CDN/browser for their cache lifetime after deletion. Deleting a product removes it from the catalogue immediately; images are public marketing assets, not private documents.

## ทดสอบ

ตรวจแบบไม่ใช้บัญชีแอดมิน:

```bash
npm run test:catalog
npm run test:catalog:integration
```

Integration test ใช้ฐานข้อมูลจริงและ transaction ที่ rollback ทั้งหมด โดยจำลองเฉพาะ session ที่ผ่านการตรวจและ Next.js cache context ตรวจ CRUD ครบ 8 หมวด สินค้าเดิม/สินค้านำเข้า การชนกันของเวอร์ชัน และ seed ซ้ำแล้วไม่เขียนทับข้อมูล ไม่ส่งอีเมลหรือแก้ข้อมูลจริงค้างไว้

เปิด dev server แล้วรัน:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e -- tests/e2e/catalog.spec.ts
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:admin -- admin@example.com
```

หากใช้ Chrome ที่ติดตั้งในเครื่อง ให้เพิ่ม `PLAYWRIGHT_CHANNEL=chrome` คำสั่งทดสอบแอดมินถามรหัสผ่านแบบซ่อน ใช้ environment ใน process เท่านั้น ไม่มี trace/video ของการเข้าสู่ระบบ

การทดสอบแอดมินใช้ Supabase จริง: สร้างสินค้าชั่วคราวที่มี slug `qa-<UUID>`, อัปโหลดรูป, บันทึกฉบับร่าง, เผยแพร่, แก้ไข และลบ พร้อมทดสอบบัญชี Auth ชั่วคราวที่ไม่มีสิทธิ์ ข้อมูลทดสอบและไฟล์จะถูกลบใน `finally` โดยไม่แก้สินค้าจริง ถ้ากระบวนการทดสอบถูก kill ควรตรวจเฉพาะ `qa-*` และไฟล์ที่เพิ่งอัปโหลดก่อนทำความสะอาด

## เอกสารอ้างอิง

- [Supabase SSR และ Next.js session refresh](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs)
- [Supabase Storage access policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Auth Admin createUser](https://supabase.com/docs/reference/javascript/auth-admin-createuser)
