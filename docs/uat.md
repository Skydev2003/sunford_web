# UAT บนคลาวด์และ LAN

สำหรับ UAT ที่ไม่ต้องเปิดเครื่องตัวเอง ใช้ [Render Free ตามคู่มือนี้](render.md) โดย deploy จาก branch `uat` หลัง CI ผ่าน และใช้ Supabase project ปัจจุบัน ส่วนวิธี LAN ด้านล่างยังใช้ทดสอบชั่วคราวได้ ไฟล์ config เพียงอย่างเดียวยังไม่สร้าง hosting ต้องตั้งค่า Render ครั้งแรกด้วย

`nip.io` เป็น DNS ที่อ่าน IP จากชื่อโดเมน ไม่ได้ให้พื้นที่รัน Next.js ตัวอย่าง `64.176.22.9.nip.io` บนเว็บไซต์ nip.io เป็นเว็บของผู้ให้บริการเอง จึงใช้เป็นเซิร์ฟเวอร์ Sunford ไม่ได้

## เปิดให้ทีมใน LAN ทดสอบ

1. ให้เครื่องนี้กับเครื่องผู้ทดสอบอยู่ใน Wi-Fi/LAN ที่ติดต่อกันได้
2. หยุด `next dev` เดิมของโปรเจกต์ด้วย Ctrl+C เพราะ Next.js ไม่ให้เปิด dev server ของ checkout เดียวกันซ้ำ
3. จาก branch `uat` รัน:

   ```bash
   npm install
   npm run uat:local
   ```

4. เปิด URL ที่คำสั่งแสดง เช่น ถ้า IP เครื่องเป็น `192.168.0.24`:

   ```text
   http://uat.192.168.0.24.nip.io:3100
   http://uat.192.168.0.24.nip.io:3100/admin/login
   ```

คำสั่งตรวจ IP ของเครื่องจริงและเปิด Next.js ที่ `0.0.0.0:3100` โดยเพิ่มเฉพาะ hostname nip.io ที่ตรงกับ LAN IP เข้า `allowedDevOrigins` ไม่มี wildcard `*.nip.io` และไม่แก้กฎ origin ของ Server Actions

ตรวจ URL โดยไม่เปิด server:

```bash
npm run uat:local -- --check
```

เปลี่ยนพอร์ตหรือเลือก interface กรณีมี VPN/หลายเครือข่าย:

```bash
UAT_PORT=3200 npm run uat:local
UAT_IP=192.168.0.24 npm run uat:local
```

เครื่องนี้ต้องเปิดอยู่และรันคำสั่งค้างไว้ ถ้าปิด/พักเครื่องหรือกด Ctrl+C เว็บจะหยุด IP อาจเปลี่ยนเมื่อเปลี่ยน Wi-Fi ให้ดู URL ใหม่จากคำสั่งเสมอ ถ้า firewall ถาม ให้อนุญาต Node.js รับการเชื่อมต่อจากเครือข่ายทีม

หาก DNS/เราเตอร์บล็อกโดเมนที่ชี้เข้า private IP ให้ลอง URL แบบ IP ตรงที่คำสั่งแสดง เช่น `http://192.168.0.24:3100` เพื่อแยกว่าเป็นปัญหา DNS หรือ server/firewall

**ขอบเขต:** URL private-IP นี้ใช้จากอินเทอร์เน็ตทั่วไปไม่ได้ ทีมที่อยู่คนละเครือข่ายจะต้องมี VPN/tunnel หรือ hosting เพิ่มเติมในภายหลัง การใช้ nip.io ไม่ได้เปิดพอร์ตเราเตอร์หรือออก HTTPS ให้เอง ตอนนี้จึงใช้ HTTP ใน LAN และเป็นโหมดพัฒนาสำหรับทดสอบชั่วคราว ไม่ใช่ production deployment

## วิธีทำงานร่วมกันด้วย branch uat

```text
feature branch ของแต่ละคน → Pull Request เข้า uat → CI ผ่าน → merge
→ เครื่อง UAT pull branch uat → restart UAT → ทีมทดสอบ
```

ไฟล์ `.github/workflows/uat-ci.yml` ตรวจ PR ที่เข้า `uat`/`main` และ push เข้า `uat` โดยรัน lint, formatting, Prisma schema validation, LAN configuration tests, production build, TypeScript และ browser tests ของแคตตาล็อก โดย **ไม่ใช้ Supabase secrets และไม่รัน migration/seed** ใน GitHub Actions

GitHub Actions เปิด production server ชั่วคราวภายใน CI runner เพื่อทดสอบ แล้วจบลงพร้อม job ไม่มีการ deploy โค้ดมายังเครื่อง LAN ของคุณอัตโนมัติ

ครั้งแรกที่นำชุดไฟล์นี้ขึ้น GitHub:

```bash
git switch uat
git add .github/workflows/uat-ci.yml .node-version package.json package-lock.json playwright.config.ts next.config.ts scripts/uat-local.mjs scripts/lib/lan-uat.mjs tests/uat/lan-uat.test.mjs tests/e2e/catalog.spec.ts docs/uat.md README.md
git commit -m "Set up LAN UAT and branch checks"
git push -u origin uat
```

แต่ละคนเริ่มงานใหม่จาก `uat` แล้วสร้าง branch ของตัวเอง เช่น:

```bash
git fetch origin
git switch -c feature/product-description origin/uat
# แก้โค้ด, commit, push branch นี้ และเปิด PR โดยเลือก base เป็น uat
```

อัปเดตเครื่อง UAT หลัง merge:

```bash
# หยุด dev server ด้วย Ctrl+C ก่อน
git switch uat
git pull --ff-only origin uat
npm ci
# ถ้า commit มี migration ใหม่: ตรวจ SQL ก่อน แล้วค่อยรัน npm run db:deploy
npm run uat:local
```

ถ้ามีงานที่ยังไม่ commit อย่าใช้ reset/clean เพื่อดึงโค้ดทับงาน ให้บันทึกงานบน branch ของตัวเองก่อนแล้วค่อยกลับมา `uat` โดยตรวจ `git status` ก่อนทุกครั้ง

หากแผน GitHub ของ repository รองรับ branch protection ให้ตั้ง `uat` ให้ merge ผ่าน PR และต้องผ่าน status check `uat-checks` ห้าม force push เป็นนโยบายทีม แม้ยังไม่ได้ตั้ง protection

## ทดสอบรับงาน UAT

ใช้บัญชีแอดมินที่สร้างไว้ใน Supabase Auth ของ project ปัจจุบัน รหัสผ่านไม่เก็บในเอกสารหรือ workflow การแก้สินค้าผ่าน UAT เปลี่ยนข้อมูลใน project นี้จริง เพราะยังไม่ได้แยกฐานข้อมูล

| กรณี            | วิธีทดสอบ                                                         | ผลที่ต้องได้                                   |
| --------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| หน้าเว็บ/มือถือ | เปิดหน้าแรก แคตตาล็อก และรายละเอียดบนคอมและมือถือ                 | ภาพและข้อมูลครบ เมนู/ค้นหา/ตัวกรองทำงาน        |
| ตรวจสิทธิ์      | เปิด `/admin/products` ก่อนล็อกอิน                                | ไปหน้าเข้าสู่ระบบ ไม่แสดงข้อมูลแอดมิน          |
| สร้างฉบับร่าง   | เพิ่มสินค้าชื่อ `UAT TEST ...` พร้อมรูป JPG/PNG/WebP ไม่เกิน 5 MB | บันทึกในแอดมินได้ แต่ไม่แสดงบนหน้าสาธารณะ      |
| เผยแพร่/แก้ไข   | เผยแพร่สินค้าทดสอบ แล้วแก้คำโปรย                                  | แคตตาล็อก/รายละเอียดแสดงข้อมูลล่าสุดหลังบันทึก |
| ไฟล์ไม่รองรับ   | เลือก SVG หรือไฟล์ที่ปลอมชื่อเป็น PNG                             | ระบบปฏิเสธและแสดงข้อความ                       |
| ยืนยันลบ        | ลบเฉพาะสินค้าทดสอบที่เพิ่งสร้าง                                   | มีการยืนยันก่อนลบ และสินค้าหายจากเว็บไซต์      |
| ออกจากระบบ      | ออกจากระบบ แล้วเปิด URL แอดมินอีกครั้ง                            | ต้องล็อกอินใหม่                                |

บันทึก commit SHA, ผู้ทดสอบ, วันที่, อุปกรณ์/เบราว์เซอร์, ผล Pass/Fail และภาพปัญหาใน PR/issue ของทีม หลังทดสอบให้ลบเฉพาะข้อมูลที่สร้างสำหรับการทดสอบ อย่ารัน seed ทุกครั้งที่อัปเดตโค้ด เพราะจะเขียนทับรายละเอียดสินค้าเดิมตามไฟล์ seed

## Hosting บนคลาวด์

`render.yaml` ใช้ branch `uat` และ CI เดิมต่อได้ พร้อม HTTPS URL ของ Render ดูการตั้งค่า Environment และ auto-deploy ใน [render.md](render.md) ระบบล็อกอิน production ใช้ Secure cookies จึงต้องเปิดผ่าน HTTPS

ดูพฤติกรรม DNS และข้อกำหนดการออก TLS ได้จาก [nip.io](https://nip.io/) และ [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting)
