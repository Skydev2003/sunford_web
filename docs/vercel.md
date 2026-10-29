# Deploy บน Vercel

ใช้ Vercel สำหรับ Next.js และใช้ Supabase เดิมสำหรับ PostgreSQL และรูป Storage เดิม ไม่ต้องย้ายข้อมูลหรือรูปสินค้า ไฟล์ `vercel.json` กำหนด npm, build pipeline และ Function Region เป็น Mumbai (`bom1`) ใกล้ฐานข้อมูลปัจจุบันใน `ap-south-1` หากเปลี่ยน region ของ Supabase ให้ปรับ region นี้ตาม

## ตั้งค่าครั้งแรก

1. นำการเปลี่ยนแปลงนี้เข้า GitHub แล้วเปิด [Vercel New Project](https://vercel.com/new) → Import repository `Skydev2003/sunford_web`
2. เลือก Framework Preset **Next.js**, Root Directory เป็นราก repo และ Node.js **24.x** (`package.json` กำหนดไว้แล้ว)
3. ตรวจ Install Command เป็น `npm ci --include=dev`, Build Command เป็น `npm run vercel-build` ตาม `vercel.json` ใช้ Output Directory ค่าเริ่มต้นของ Next.js และไม่ต้องตั้ง Start Command หรือ `PORT`
4. เพิ่ม Environment Variables ตามตารางด้านล่าง เลือก scope **Production** และ **Preview** ให้ตรงฐานข้อมูล ห้ามนำ `.env` เข้า Git
5. เปิด **Enable access to System Environment Variables** เพื่อให้สคริปต์อ่าน `VERCEL`, `VERCEL_ENV`, `VERCEL_GIT_COMMIT_REF` และ health check อ่าน `VERCEL_GIT_COMMIT_SHA` อย่าตั้งตัวแปรเหล่านี้เอง
6. กด Deploy แล้วตรวจ Production Branch เป็น **main** ใน Settings ของ environment Production ถ้า import จาก branch อื่นให้ตั้ง `main` และ redeploy จาก commit บน `main`
7. เปิด HTTPS URL ที่ Vercel แสดงจริง ตรวจ `/api/health` ต้องได้ `status: ok`, `environment: production` และ `revision` ตรงกับ commit 12 ตัวแรก
8. ทดสอบหน้าเว็บ แคตตาล็อก รายละเอียดสินค้า และตรวจว่า URL แอดมินเดิมตอบ 404 ตาม [UAT](uat.md)

## Environment Variables

| Variable                  | Production                                                           | Preview                              |
| ------------------------- | -------------------------------------------------------------------- | ------------------------------------ |
| `DATABASE_URL`            | Supabase ปัจจุบัน: transaction pooler พอร์ต 6543                     | transaction pooler ของ project ทดสอบ |
| `DIRECT_URL`              | session pooler พอร์ต 5432 หรือ direct endpoint สำหรับ migration/seed | ไม่จำเป็นสำหรับ build                |
| `SUPABASE_URL`            | ตัวเลือกสำหรับรูปเดิมจาก Storage                                     | ตัวเลือกสำหรับรูปจาก Storage ทดสอบ   |
| `APP_ENV`                 | ไม่ต้องตั้ง; ถ้าตั้งให้เป็น `production`                             | ไม่ต้องตั้ง; ถ้าตั้งให้เป็น `uat`    |
| `NEXT_TELEMETRY_DISABLED` | `1` (เลือกตั้งได้)                                                   | `1` (เลือกตั้งได้)                   |

คัดลอกเฉพาะ value จาก `.env` ไม่ใส่ชื่อ key ซ้ำหรือเครื่องหมายคำพูดครอบ แอปไม่ใช้ Supabase Auth หรือคีย์สำหรับอัปโหลดแล้ว หากมีรูปเดิมใน Storage ให้ตั้ง `SUPABASE_URL` ให้ตรงกับ project ของรูป การเปลี่ยน environment ต้อง redeploy เพราะ config รูปอ่าน URL ตอน build ด้วย

`APP_ENV` ที่สคริปต์อนุมานมีผลกับ process ที่ build เท่านั้น health check จึงอ่าน `VERCEL_ENV` ที่ runtime ด้วย Production จะแสดง `production` และ Preview จะแสดง `uat`

## Production และ Preview

| Target     | Branch                       | ขั้นตอน build                                   |
| ---------- | ---------------------------- | ----------------------------------------------- |
| Production | `main`                       | ตรวจ config → `db:deploy` → `db:seed` → `build` |
| Preview    | `uat`, feature branch และ PR | ตรวจ config → `build`                           |

Production ปฏิเสธ branch อื่นและ Environment ที่ไม่ตรงกันก่อนแตะฐานข้อมูล Seed เพิ่มเฉพาะสินค้านำเข้าที่ยังขาด ไม่เขียนทับข้อมูลเดิม สำรอง JSON ชั่วคราวไว้ใน build directory ใต้ `/tmp` บน Vercel ไฟล์นี้หายได้หลัง build; ใช้ backup ของ Supabase สำหรับการกู้คืนถาวร การ rollback deployment ไม่ rollback migration ที่รันสำเร็จแล้ว

Preview ไม่รัน migration หรือ seed อัตโนมัติ ก่อนใช้ project ทดสอบครั้งแรก ต้องเตรียม schema และ catalogue ให้ครบ โดยชี้ `.env` ในเครื่องไป project ทดสอบ แล้วรัน `npm run db:deploy` และ `npm run db:seed` การเพิ่ม migration ใหม่ต้อง apply ที่ project ทดสอบก่อน build Preview เช่นกัน

เก็บ project ทดสอบแยกจาก Production สำหรับการเตรียม schema และข้อมูล ไม่มีการแก้ข้อมูลผ่านหน้าแอดมินบนเว็บไซต์แล้ว

Vercel Git integration สร้าง deployment เมื่อ push ตามการตั้งค่า project โดย CI เดิมยังทำงานอยู่ แต่ไม่ได้รอ GitHub Actions ผ่านเหมือน Render โดยอัตโนมัติ หากต้องการ gate ก่อน promote ให้ตั้ง [Deployment Checks](https://vercel.com/docs/deployment-checks) ที่บัญชีรองรับ และคง branch protection ให้ PR ผ่าน CI ก่อน merge เข้า `main`

## ปล่อย Production จาก uat

commit งานทั้งหมดบน `uat` ให้เรียบร้อย แล้วใช้คำสั่งเดียว:

```bash
git switch uat
bun run deploy
```

สคริปต์ทำตามลำดับนี้:

1. ตรวจว่าอยู่ branch `uat`, working tree สะอาด และไม่มี rebase/merge ค้าง
2. `git fetch origin` แล้ว rebase บน `origin/uat` เพื่อรับงานทีม จากนั้น `git rebase origin/main`
3. รัน lint, format check, schema validation, UAT/catalogue tests, build และ typecheck ด้วย Bun โดยใช้ catalogue fixtures และปิดค่า Supabase ใน environment ของ process ตรวจงาน จึงไม่อ่านหรือเขียนฐานข้อมูล production จากเครื่อง
4. ตรวจว่าระหว่าง build ไม่มีไฟล์หรือ commit เปลี่ยน และ fetch `main` อีกครั้ง ถ้า `main` มีงานใหม่ที่ยังไม่อยู่ใน revision ที่ตรวจจะหยุด ให้รันใหม่เพื่อ rebase และตรวจอีกครั้ง
5. `git push origin HEAD:refs/heads/main` จาก `uat` เพื่อให้ Vercel Git integration deploy Production จาก commit ที่ผ่านการตรวจแล้ว

ไม่มีการ force-push, auto-commit หรือ auto-stash ไม่เขียนทับ local branch `main` และไม่ rewrite remote `uat` หากมี rebase conflict ให้แก้ไฟล์แล้ว `git add` และ `git rebase --continue` หรือยกเลิกด้วย `git rebase --abort` จากนั้นรัน `bun run deploy` ใหม่ หากตรวจงานไม่ผ่านจะไม่ push Production หาก branch protection ไม่อนุญาต push ตรง ให้ส่ง PR จาก `uat` เข้า `main` ตามกติกา repository

ตรวจความพร้อมโดยไม่ fetch/rebase/build/push ด้วย:

```bash
bun run deploy --check
```

ผลลัพธ์ push สำเร็จแปลว่าส่ง commit เข้า GitHub แล้ว ต้องรอ Vercel build สำเร็จและตรวจ `/api/health` ว่า revision ตรงกันก่อนถือว่าเว็บ live

Build Command บน Vercel ยังคงเป็น `npm run vercel-build` ตาม `vercel.json` ซึ่งเรียก `scripts/vercel-build.mjs` เพื่อ validate environment, migrate/seed เฉพาะ Production และ build อย่าเปลี่ยนเป็น `bun run deploy` เพราะคำสั่งนั้นใช้จัดการ Git ในเครื่อง

## URL ภาษาอังกฤษและขนาดชื่อไฟล์

URL ภายในใช้ path ภาษาอังกฤษ ลิงก์จาก URL ภาษาไทยเดิม redirect แบบ 308 ผ่าน Proxy ไปยัง URL อังกฤษ โดยรักษา query string ไว้ ข้อมูลและลิงก์ในเนื้อหาที่แสดงบนเว็บไซต์ใช้ชื่ออังกฤษโดยตรง

หาก segment ของ path ภาษาอังกฤษยาวเกิน 200 bytes ระบบยังใช้เส้นทางภายในแบบ `/_content/<sha256>` เพื่อเว้นที่สำหรับ prerender sidecars และ runtime cache เส้นทางภายในจาก URL เดิมยังอ่านเนื้อหาเดิมได้

## ย้าย URL จาก Render

1. รอ Vercel deployment พร้อมและทดสอบหน้าเว็บ/แคตตาล็อก/รูปเดิมก่อน
2. ถ้ามี custom domain ให้เพิ่มใน Vercel → Settings → Domains แล้วเปลี่ยน DNS ตามค่าที่ Vercel แสดง ตรวจ HTTPS และ `/api/health` ที่ domain จริง
3. ตรวจรูปเดิมจาก Supabase Storage ที่ domain ใหม่
4. เมื่อยืนยันว่า traffic ใช้งาน Vercel แล้ว ให้ปิด auto-deploy และหยุด service เดิมบน Render ด้วยตนเอง เพื่อไม่ให้ deploy สองระบบเขียน migration ไปฐานข้อมูลพร้อมกัน URL `onrender.com` เป็นของ Render ต้องแจก URL Vercel ใหม่หากไม่ได้ใช้ custom domain

การปรับ repo นี้ยังไม่ได้สร้าง Vercel project, เปลี่ยน DNS หรือหยุด service Render จริง

## รูปเดิมและการแก้ปัญหา

- รูปเดิมใน `public/images` และ Supabase Storage ยังเปิดได้ ไม่มีหน้าหรือคำสั่งอัปโหลดรูปจากเว็บไซต์แล้ว
- Migration ต่อไม่ได้: ตรวจ `DIRECT_URL` เป็น session pooler พอร์ต 5432 หรือ direct endpoint ไม่ใช้ transaction pooler 6543 และตรวจว่า Supabase ไม่พักอยู่
- Build Preview แจ้งตาราง/คอลัมน์ไม่มี: apply migration ของ branch นี้ที่ฐานข้อมูล Preview ก่อน redeploy
- Build แจ้ง branch/config: ตรวจ Production Branch, scope ของ `APP_ENV` และ System Environment Variables อย่าใส่ `APP_ENV=production` ครอบทุก target
- `/api/health` ได้ 503: ตรวจ runtime `DATABASE_URL` และการเชื่อมต่อ Supabase; ไม่เผย credentials ใน log

อ้างอิง: [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json), [System environment variables](https://vercel.com/docs/environment-variables/system-environment-variables), [Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [Function limits](https://vercel.com/docs/functions/limitations)
