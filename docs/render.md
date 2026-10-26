# Deploy main บน Render Free

เว็บรันบน Render โดยไม่ต้องเปิดเครื่องพัฒนา ใช้ Next.js Node server และ Supabase project ปัจจุบันสำหรับ PostgreSQL, Auth และ Storage ไฟล์ `render.yaml` กำหนด Free instance ใน Singapore และ deploy branch `main` หลัง CI ผ่าน โดยคงชื่อ service `sunford-uat` เดิมไว้

## เตรียมโค้ดขึ้น GitHub

นำชุดไฟล์ deployment นี้เข้า branch `main` และ push ขึ้น GitHub ก่อนสร้าง Blueprint หากทำงานอยู่ branch อื่น ให้ commit ที่ branch นั้นแล้ว merge ผ่านขั้นตอนของทีมเข้า `main` ตามปกติ ห้าม commit `.env`

ชื่อ commit ที่แนะนำ: `chore: configure Render Free UAT deployment`

## สร้าง hosting ครั้งแรก

1. ล็อกอิน [Render Dashboard](https://dashboard.render.com/) ด้วย GitHub ที่เข้าถึง `Skydev2003/sunford_web` ได้
2. เลือก **New → Blueprint** แล้ว Connect repo นี้ ถ้าไม่เห็น repo ให้ Configure GitHub App และอนุญาตเฉพาะ repo นี้
3. เลือก branch **main** และ Blueprint Path **render.yaml** ชื่อ Blueprint เช่น `sunford-uat`
4. ตรวจ service เป็น **Web Service / Node / Free / Singapore** ค่าใช้จ่าย instance ต้องเป็น **$0** ไม่สร้าง Render Postgres เพิ่ม
5. กรอกค่าจาก `.env` ในเครื่องลงในช่อง Environment ของ Render ตามตารางด้านล่าง โดยใช้เฉพาะค่าภายในเครื่องหมายคำพูด ไม่ใส่ชื่อ key ซ้ำในช่อง value
6. กด **Deploy Blueprint** แล้วรอ service เปลี่ยนเป็น **Live** หากมีหน้าเสนอแพ็กเกจเสียเงินให้กลับมาตรวจว่า instance เป็น Free ก่อน
7. เปิด HTTPS URL ที่ Render แสดงจริง ชื่ออาจมี suffix จึงอย่าเดา URL จากชื่อ service เปิด `/api/health` ต้องได้ `status: ok`, `environment: production` และ revision ของ commit ที่ deploy
8. เปิด `/admin/login` ทดสอบบัญชีแอดมินเดิม ก่อนส่ง URL ให้ทีม เปลี่ยนรหัสแอดมินเดิมให้เดายากใน Supabase Dashboard → Authentication → Users → บัญชีแอดมิน

| Environment variable       | ใช้ค่าอะไร                                                     |
| -------------------------- | -------------------------------------------------------------- |
| `DATABASE_URL`             | ค่าใน `.env` เดิม: transaction pooler พอร์ต 6543               |
| `DIRECT_URL`               | ค่าใน `.env` เดิม: session pooler พอร์ต 5432 สำหรับ migrations |
| `SUPABASE_URL`             | URL ของ Supabase project ปัจจุบัน                              |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key ของ project เดียวกัน                           |

Blueprint กำหนด `NODE_ENV=production`, `APP_ENV=production`, `NEXT_TELEMETRY_DISABLED=1` ไว้แล้ว Node version อ่านจาก `.node-version` ไม่ต้องใส่ `PORT` เอง Render จัดการให้

ไม่ต้องนำ `SUPABASE_SECRET_KEY` หรือ `SUPABASE_SERVICE_ROLE_KEY` ขึ้น Render เพราะหน้าแอดมินใช้ user session และ Storage RLS ไม่ต้องเปลี่ยน Supabase redirect URL สำหรับการล็อกอินด้วยอีเมล/รหัสผ่านปัจจุบัน หากเพิ่ม OAuth หรือ email reset ภายหลังจึงตั้ง Site URL/Redirect URLs ให้ตรงกับ hosting

ถ้าสร้าง **New → Web Service** เองแทน Blueprint ให้กรอกเพิ่มเติม:

| Setting           | Value                                              |
| ----------------- | -------------------------------------------------- |
| Branch            | `main`                                             |
| Runtime           | `Node`                                             |
| Region            | `Singapore`                                        |
| Instance Type     | `Free`                                             |
| Build Command     | `npm ci --include=dev && npm run render:build`     |
| Start Command     | `npm run start -- --hostname 0.0.0.0 --port $PORT` |
| Health Check Path | `/api/health`                                      |
| Auto-Deploy       | `After CI Checks Pass`                             |

## อัปเดตหลัง merge

```text
ทีม push / merge เข้า main บน GitHub
→ GitHub Actions: UAT checks ผ่าน
→ Render migrations + นำเข้าสินค้าที่ขาด + build + deploy อัตโนมัติ
→ สถานะ Live → ทีมเปิด URL เดิมทดสอบ
```

สำหรับ Blueprint หลัก ต้อง push `main` ขึ้น GitHub เพื่อให้ Render เห็น commit:

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git push origin main
```

ไม่ต้องเปิด `npm run uat:local` หรือ SSH เพื่ออัปเดต cloud ตรวจหน้า Events/Deploys บน Render ว่า SHA ตรงกับ commit บน `main` ถ้า CI ล้มเหลวหรือไม่มี checks ให้แก้ CI ก่อน เมื่อจำเป็นสามารถใช้ **Manual Deploy → Deploy latest commit** บน Render ได้ Service ที่สร้างแบบ Web Service ด้วยมือ ต้องเปลี่ยน Branch เป็น `main` และ `APP_ENV=production` ใน Dashboard ให้ตรงกับ Blueprint ด้วย

Build รัน `prisma migrate deploy` แล้วนำเข้าเฉพาะสินค้าที่ขาดด้วย `db:seed` ก่อน `next build` เพราะ build อ่านสินค้าในฐานข้อมูล Seed เก็บข้อมูลเดิม การแก้ไข ฉบับร่าง และสินค้าที่ลบแล้วไว้ครบ และติดตั้ง dev dependencies เพื่อให้มี Prisma CLI ตรวจ SQL ใน migration ก่อน merge โดยเฉพาะ migration ที่เปลี่ยน/ลบข้อมูล เพราะใช้ Supabase เดิมและ migration อาจสำเร็จแม้ build ขั้นถัดไปล้มเหลว การ rollback เว็บไม่ rollback ฐานข้อมูล

ทดสอบรับงานตามตารางใน [uat.md](uat.md) โดยเฉพาะเพิ่ม draft, เผยแพร่, แก้ไข, อัปโหลดรูป, ลบสินค้าทดสอบ และออกจากระบบ การเปลี่ยนแปลงข้อมูล UAT เขียนลง Supabase project ปัจจุบันจริง

## ข้อจำกัดแผนฟรีและการแก้ปัญหา

- ไม่มี traffic 15 นาที service จะพัก การเข้าครั้งถัดไปอาจรอประมาณ 1 นาที มีโควตาชั่วโมง, bandwidth และ build pipeline รายเดือนตามบัญชี ไม่ตั้ง uptime bot เพื่อฝืนการพัก
- ไฟล์ในเครื่อง Render ไม่ถาวร แต่สินค้าและรูปของแอปอยู่ Supabase อยู่แล้ว จึงไม่ต้องซื้อ persistent disk
- Build ขึ้น `Configure ...`: ตรวจ Environment ให้ครบ 4 ตัว ไม่มีค่า placeholder และเลือก branch `main`
- Migration ต่อไม่ได้: ตรวจ `DIRECT_URL` ใช้ session pooler พอร์ต 5432 และตรวจว่า Supabase project ไม่ได้พักอยู่
- ถ้าแก้ Environment ให้ Save/Rebuild/Deploy ใหม่ เพราะ URL ของ Storage ถูกอ่านตอน build ด้วย อย่า paste connection URL หรือ log ที่มีรหัสผ่านใน issue สาธารณะ
- ถ้า free workspace ใช้โควตาหมด ให้รอ reset หรือตรวจ usage ก่อน ไม่อัปเกรดแผนโดยไม่ตั้งใจ

เอกสารต้นทาง: [Render Free](https://render.com/docs/free), [Next.js on Render](https://render.com/docs/deploy-nextjs-app), [Blueprint fields](https://render.com/docs/blueprint-spec), [Deploy after CI](https://render.com/docs/deploys)
