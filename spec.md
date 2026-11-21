# SUNFORD — ข้อตกลงที่ใช้งาน

## เว็บไซต์และแหล่งข้อมูล

- ขอบเขตเว็บคือแค็ตตาล็อกสินค้า การติดต่อฝ่ายขาย และใบเสนอราคา การเปิดขายผ่านตะกร้าและชำระเงินออนไลน์ต้องมีขอบเขตใหม่ ดู [แผนเปิดเว็บไซต์ของบริษัท](docs/launch-plan-18-working-days.md) เมื่อต้องกำหนดรอบตรวจรับ
- เว็บไซต์สาธารณะใช้ Next.js App Router, React และ TypeScript บน Node.js 24 อ่านข้อมูลฝั่งเซิร์ฟเวอร์ ใช้ Client Components เฉพาะส่วนโต้ตอบ ค่าตั้งเว็บและเมนูมาจาก `data/site/content.json` เนื้อหาทั่วไปอยู่ในไฟล์ของโปรเจกต์ ดู [โครงสร้างและคำสั่งพัฒนา](README.md)

### Warehouse

- หน้าสินค้าและใบเสนอราคาอ่านสินค้า ราคา หน่วย สเปก และ metadata รูปจาก Warehouse PostgreSQL ฝั่งเซิร์ฟเวอร์ผ่าน `pg` และ `ecommerce.get_website_products(bigint,text[])` ตามบริษัทและ SKU ข้อมูลอัปเดตตามรอบแค็ตตาล็อกโดยไม่ต้องรันคำสั่งนำเข้าจากเว็บเดิม รูปใช้ storage ของ Warehouse และคงเวอร์ชันใน URL เมื่อข้อมูลขาดให้เว้นช่องนั้น ข้อมูลจาก CMS เดิมเก็บไว้อ้างอิง ส่วนหน้าแรกและ Hero คงสื่อและเนื้อหาที่เจ้าของอนุมัติ ดู [รายละเอียดการเชื่อมต่อและตรวจข้อมูล](docs/warehouse/direct-postgres.md)
- หน้าร้านแสดง `standard_sale_price` ก่อน VAT ตามต้นทาง ราคาศูนย์ให้แสดง “สอบถามราคา” ใบเสนอราคาอัตโนมัติใช้เฉพาะราคาสุทธิที่มากกว่าศูนย์ รวมราคาตามจำนวนก่อนคิด VAT 7% ที่ยอดเอกสารครั้งเดียว
- สินค้าและสต็อกใช้บัญชีอ่านอย่างเดียว เว็บเขียนได้เฉพาะทะเบียนเลขใบเสนอราคา `warehouse_db.ecommerce.quotation_issues` ผ่าน Prisma และ `QUOTATION_DATABASE_URL` แยกจากเลขเอกสารภายใน Warehouse การลองออกเลขอีกครั้งสำหรับร่างเดิมต้องส่ง `Idempotency-Key` เดิม
- Production ต้องตั้ง `QUOTATION_DATABASE_URL` เฉพาะการพัฒนาในเครื่องนอก Vercel จึงใช้ SQLite ที่ `.local/quotation-issues.sqlite` ได้เมื่อไม่ได้ตั้งค่าทะเบียน
- ใช้ `npm run db:deploy` ตั้งค่าและตรวจเฉพาะทะเบียน รันซ้ำได้โดยรักษาเลขเดิม หาก schema ไม่ตรงให้หยุดตรวจ ห้ามรีเซ็ตเลข ลบตารางที่ออกเลขแล้ว หรือรัน migration ของ CMS/auth เดิมเข้า Warehouse ค่าฐาน CMS เดิมใน `DATABASE_URL` หรือ `DIRECT_URL` ไม่ใช่แหล่งข้อมูล runtime ของเว็บ เก็บประวัติ schema และ migration รวมถึง Supabase project เดิมไว้ตามคำสั่งเจ้าของ
- การ์ดเครื่องชั่งแนะนำบน `/products` ใช้ร่างและชุดเผยแพร่แยกกันใน Warehouse เมื่อเปิดฟีเจอร์ เว็บอ่านเฉพาะชุดเผยแพร่ผ่าน `ecommerce.get_website_featured_scales(bigint)` จับคู่ SKU ตามบริษัท การพักทุกใบซ่อนเฉพาะแถวเครื่องชั่ง ดูเงื่อนไขเปิดใช้และ UAT ใน [แผนปัจจุบัน](plan.md)

## ข้อตกลงหน้าเว็บและการส่งมอบ

- รักษาแบรนด์ CSS และ component ที่ใช้งานจริง อ้างอิงค่าออกแบบตาม [กติกาโปรเจกต์](AGENTS.md) เว็บไซต์ใช้ mobile-first โดย Header เปลี่ยนเป็นเดสก์ท็อปที่ 64rem เมนูที่มีปลายทางพร้อมใช้เป็นลิงก์จริง รายการที่รอข้อมูลแสดงจางและกดไม่ได้
- รูปโปรโมตยึดภาพสินค้าจริง มุมหน้าตรง เก็บโลโก้และรายละเอียดที่พิมพ์บนตัวสินค้า แยกข้อความบนหน้าเว็บออกจากภาพสินค้า SUNFORD ไม่มีบริการรับสอบเทียบ
- เว็บพัฒนาสาธารณะใช้พอร์ต 3001 ตาม README ให้ตรวจ origin และชนิดข้อมูลก่อนทดสอบ API เมื่อทำงานคู่กับ Warehouse แยกสถานะตรวจในเครื่อง UAT และ Production ตรวจการปล่อย Production ตาม [คู่มือปล่อยรุ่นบน Vercel](docs/vercel.md)
- Client modules for catalog navigation and return links use shared route definitions. Legacy CMS snapshots stay in server-side product grouping and content processing.
- โปสเตอร์ Hero ใช้ภาพเดิมครอปกึ่งกลาง ให้เบราว์เซอร์เลือก WebP จาก HTML และแสดงภาพได้เมื่อปิด JavaScript หรือเลือกให้ลดการเคลื่อนไหว รักษา `object-fit: cover` และตำแหน่งกึ่งกลางตามแบบเดิม อ้างอิง Tailwind CSS Docs v4.3 เมื่อ 21 พ.ย. 2026 [Object fit](https://tailwindcss.com/docs/object-fit) · [Object position](https://tailwindcss.com/docs/object-position)
- หน้า `/products` ให้เบราว์เซอร์เลือกรูปตามขนาดที่แสดงจริงในแถวสินค้า 5 แถว โหลดรูปเปิดแถวเครื่องชั่งล่วงหน้าและใช้ความสำคัญต่ำกับการโหลดรูปแรกใน Home & Retail รูปอื่นใช้การโหลดแบบ lazy ของเบราว์เซอร์ โปสเตอร์ AW31/LP50 เลือกขนาดตามจอ และแอนิเมชัน WeWeigh ใช้ไฟล์เดียวกับรูปที่แสดง

- หน้า `/service` แสดงขั้นตอนซ่อมบำรุง เปลี่ยน เคลม คืน และรับสินค้าที่โรงงานจาก `src/features/content/data/after-sales.ts` เมื่อปิด JavaScript ลิงก์ในหน้าต้องพาไปอ่านได้ครบทั้งห้าบริการ เมื่อเปิด JavaScript ให้ใช้แท็บด้วยคีย์บอร์ดได้และรักษาบริการที่เลือกเมื่อกดย้อนกลับหรือเปิดลิงก์ตรงไปยังขั้นตอน
- หน้าบริการใช้ breakpoint หน่วย rem ตามเนื้อหา และใช้ระยะขอบการ์ดของ SUNFORD ที่ 1 และ 1.5rem เพื่อให้ขั้นตอนอ่านง่ายบนมือถือและยังพอดีจอ 1280×720 ภาพเจ้าหน้าที่ใช้ `object-fit: contain` เพื่อแสดงภาพเต็ม อ้างอิง Tailwind CSS Docs v4.3 เมื่อ 21 พ.ย. 2026 [Responsive design](https://tailwindcss.com/docs/responsive-design) · [Padding](https://tailwindcss.com/docs/padding) · [Object fit](https://tailwindcss.com/docs/object-fit)

## งานที่รอเจ้าของตัดสินใจ

**การ์ดแนะนำแถว Home & Retail (Apple-style Feature Card + Ambient Loop + `↗` Modal — ไม่ใช้รูปเครื่องชั่ง)** — ข้อมูลพร้อม (`Status: "Ready to Code"`) เจ้าของอนุมัติการทำต้นแบบแล้ว การนำภาพ ข้อความ ตำแหน่ง วิดีโอ และ Modal ขึ้นเว็บยังรออนุมัติ (`Approval: "Pending"`)

- เก็บสินค้าเดิม 8 ใบและลิงก์ตามลำดับเดิม แทรกการ์ดแนวตั้งมุมโค้ง (`border-radius: 28px`) หลัง VR5000 (`G106179`) ใน `#products-rail-pos` โดยใช้ภาพถ่ายสตูดิโอวัตถุมุมหน้าตรงที่ไม่ใช่เครื่องชั่ง (ชุดดริปกาแฟแก้วใสกับดริปเปอร์เซรามิกสีดำคู่กับโถบรรจุภัณฑ์ไทเทเนียมและป้ายบาร์โค้ดหน้าร้าน บนพื้นดำสตูดิโอ `#000000`) ตาม [ต้นแบบ Apple Feature Card & Modal Flow](https://www.figma.com/design/TImCwzaDvOMRkGMalbzIcx) (`nodeId: 21:2` และ `nodeId: 21:34`)
- ด้านบนการ์ดแสดง HTML Eyebrow `ครัวและกาแฟ · คำนวณราคา` (`#98989D`) และ Headline สั้น `พิถีพิถันทุกแก้ว` / `แม่นยำทุกยอดขาย` (`#F5F5F7`) ด้านล่างเป็น Ambient Loop Video (`home-retail-ambient.mp4`, 4.0 วินาที, `1200 × 1500 px`, 60 fps, Seamless Loop) เล่นวนลูปเบา ๆ เมื่อเห็นอย่างน้อย 50% พักเมื่อพ้นจอหรือลดการเคลื่อนไหว (`prefers-reduced-motion: reduce` แสดงภาพนิ่ง `home-retail-ambient-poster.webp`)
- มุมขวาล่างของการ์ดมีปุ่มลูกศรวงกลม `↗` (`ArrowUpRight`, `36 × 36 px`) เมื่อคลิกหรือกด `Enter` / `Space` จะเปิด Native `<dialog>` Modal สไตล์ Apple พร้อมฉากหลังเบลอ ปุ่มปิด `×` และการ์ดแนะนำสองหมวด (`งานบ้านและคาเฟ่ — ครัวและกาแฟ` ลิงก์ไป `/products/category/scales/kitchen` และ `งานขายหน้าร้าน — คำนวณราคา` ลิงก์ไป `/products/category/scales/price`) อ้างอิง Tailwind CSS Docs v4.3 (ตรวจ 21 พ.ย. 2026: [Flex Basis](https://tailwindcss.com/docs/flex-basis), [Object Fit](https://tailwindcss.com/docs/object-fit), [Motion preferences](https://tailwindcss.com/docs/hover-focus-and-other-states#prefers-reduced-motion))

**รายการที่ยังมีเงื่อนไขก่อนเปิดงาน** — Navbar เฟส B/C ต้องตรวจสมาชิก SKU และปลายทางที่พร้อมก่อนเปิดรายการ ส่วน [ข้อเสนอปรับหน้า Solutions](docs/solutions-ui-audit-20261117.md) เฟส A ยังรออนุมัติ และเฟส B รอเนื้อหา ภาพ และผู้ตรวจรับจากเจ้าของ

## ประวัติ

[Spec ฉบับเต็มก่อนย่อ 21 พ.ย. 2026](docs/archive/2026-11-21/spec.md) เก็บข้อกำหนด การอนุมัติ และหลักฐานเดิมครบ ค้นตามชื่อหัวข้องาน พาธในบันทึกเดิมอ้างจากรากโปรเจกต์
