# Plan: Rebuild SUNFORD Official Website — plan-v2 (2026-11-04)

อ้างอิง Task ชื่อเดียวกันใน spec.md และแผนต้นทาง C:/Users/cityc/Downloads/plan-v2.md

Status: "Need Information"
Approval: "Pending"
Documentation Approval: "Approved"
Documentation Progress: "Done"

ผู้ใช้ยืนยันให้ปรับ Spec/Plan ก่อน ยังไม่แก้โค้ด สถานะข้างต้นหมายถึงการพัฒนาเว็บไซต์ที่ยังรอข้อมูลและการอนุมัติ ไม่ใช่การอนุมัติจากค่า Ready to Code ในไฟล์แนบ ร่างแผนเอกสารก่อนหน้านี้ส่งมอบแล้วและเก็บสถานะในประวัติ spec.md

## Files

ไฟล์ที่อนุญาตในรอบนี้:

| ไฟล์      | การเปลี่ยนแปลงและเหตุผล                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| `spec.md` | เพิ่มข้อกำหนดจาก plan-v2, Current State, Source Map, AC, ข้อมูลที่ขาดและขอบเขตการอนุมัติ โดยรักษาประวัติเดิม |
| `plan.md` | ปรับแผนงานตามไฟล์แนบให้ตรงโครงสร้างจริงและสถานะการพัฒนา                                                      |

Source สำหรับวางขอบเขต Implementation ในอนาคต ยังไม่ใช่รายการอนุญาตแก้โค้ด:

| ส่วน              | ไฟล์ที่ตรวจพบ                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| หน้าแรก / สินค้า  | `src/app/(site)/page.tsx`, `src/app/(site)/products/page.tsx`, `src/app/(site)/products/[slug]/page.tsx`                       |
| Route เนื้อหาร่วม | `src/app/(site)/[...path]/page.tsx`                                                                                            |
| โซลูชัน           | `src/features/content/components/solutions-page.tsx`                                                                           |
| ซอฟต์แวร์         | `src/features/content/components/software-catalog.tsx`                                                                         |
| บริการ            | `src/features/content/components/after-sales-page.tsx`                                                                         |
| เกี่ยวกับเรา      | `src/features/content/components/about-page.tsx`                                                                               |
| ติดต่อเรา         | `src/features/content/components/contact-page.tsx`                                                                             |
| Navigation        | `src/components/layout/header.tsx`, `src/features/cms/components/site-header.tsx`, `src/features/cms/data/navigation.ts`       |
| Footer            | `src/components/layout/footer.tsx`                                                                                             |
| Data / Styles     | ใช้ Source Map และ CSS Import ที่ระบุ Path เต็มใน Spec แล้วเลือกทุกไฟล์ที่จะเปลี่ยนก่อนอนุมัติ ไม่อนุญาตทั้งโฟลเดอร์แบบเหมารวม |

Header.tsx / Footer.tsx ในแผนต้นทางแก้เป็นชื่อไฟล์ตัวพิมพ์เล็กจริง หน้า /solutions, /applications-and-softwares, /service, /about-us, /contact-us ใช้ Catch-all ไม่สร้าง page.tsx แยกใหม่โดยอัตโนมัติ

## Steps

### รอบปัจจุบัน: จัดทำเอกสารเท่านั้น

- [x] อ่านแผนแนบและรับคำยืนยันขอบเขตเฉพาะ Spec/Plan
- [x] ตรวจ AGENTS.md, Spec/Plan เดิม, Source Routes, Components, Repository และ CSS ที่เกี่ยวข้อง
- [x] แยกสิ่งที่มีอยู่แล้ว เช่น RSC / Prisma / หก Canonical Routes ออกจากส่วนที่ยังต้องกำหนด
- [x] แก้ Source Paths และเพิ่มข้อกำหนด ข้อมูลที่ขาด AC และ Approval Record ใน Spec
- [x] ปรับแผนตามขอบเขต Rebuild โดยยังไม่เปิดให้เริ่ม Implementation
- [x] เพิ่ม AC-W01–AC-W10, Regression RG-01–RG-09 และขั้นตอน Rollback ที่รักษางานก่อนหน้า
- [x] ตรวจชื่อ Task, Status / Approval, Source Map และการคงข้อมูลเดิม
- [x] ตรวจ Prettier เฉพาะสองไฟล์และ git diff --check แล้วบันทึกผลเอกสาร

### 1. เตรียมความพร้อมและยืนยันข้อกำหนดเว็บไซต์ — รอข้อมูล

- [ ] รับคำตอบ Missing Information ใน Spec: ดีไซน์/ส่วนต่างต่อหน้า เนื้อหาและรูป กลุ่มโซลูชัน Claim ISO 17025 / ชั่งตวงวัด ชื่อ/ไฟล์ซอฟต์แวร์ การรับประกัน และ Contract ฟอร์มใบเสนอราคา
- [ ] ระบุ Layout, Section, Interaction, Input/Output และ AC ของแต่ละหน้าจากข้อมูลที่ยืนยัน ห้ามใช้คำว่า Rebuild แทนรายละเอียดดีไซน์
- [ ] ใช้ Stack เดิม Next.js 16 App Router / React 19 / TypeScript 5 / CSS Modules และ src/styles/ / Prisma ORM 7 / PostgreSQL / Node.js 24 ตรวจ package.json และ Lockfiles ห้ามเพิ่ม Tailwind CSS, UI Library หรือ Dependency นอกที่อนุมัติ
- [ ] แจกแจงไฟล์ Component / CSS Modules ทุกไฟล์ที่จะสร้าง แก้หรือลบ รวมไฟล์ส่วนกลาง พร้อมผลกระทบ Regression และ Rollback ห้ามใช้ src/styles/ เป็นสิทธิแก้ทุกไฟล์
- [ ] เมื่อข้อมูลครบเท่านั้น เปลี่ยน Status เป็น Ready to Code และให้ผู้ใช้ตรวจ Spec/Plan ฉบับสมบูรณ์ บันทึกการอนุมัติจริงที่ครอบคลุมงานนั้นก่อนเริ่มโค้ด ห้ามถือความเงียบหรือการอนุญาตเอกสารเป็นการอนุมัติ Implementation

### 2. Layout / Components — หลังอนุมัติเท่านั้น

- [ ] อ่านคู่มือ Next.js ที่เกี่ยวข้องใน node_modules/next/dist/docs/ ก่อนเขียนโค้ด
- [ ] ตรวจ Baseline เดิมและจัดเก็บหลักฐาน/ส่วนต่างของไฟล์ที่จะเปลี่ยน รวมงานที่ยังไม่ Commit โดยไม่รบกวน Dev Server ของผู้ใช้
- [ ] ปรับเฉพาะส่วนต่างของ Header / Mega Menu / Footer ที่อนุมัติ รักษาหก Canonical Routes: /products, /solutions, /applications-and-softwares, /service, /about-us, /contact-us
- [ ] รักษา Brand Tokens โลโก้ ธีมดำ-ขาว-แดง Typography และ Interaction ตาม Reference ที่อนุมัติ ตรวจ Header ที่ขอบ 1399/1400px ตาม Breakpoint เดิม
- [ ] ไม่โฆษณาบริการรับสอบเทียบ (Calibration Service); ไม่ลบคำแนะนำการสอบเทียบตัวสินค้าที่ไม่ใช่บริการบริษัทแบบเหมารวม

### 3. Pages / Data — หลังอนุมัติเท่านั้น

- [ ] หน้าแรก: ปรับเฉพาะ Section / Layout ที่อนุมัติ ใช้สโลแกน “ความเที่ยงตรง ที่คุณวางใจ” ตามตำแหน่งที่ยืนยัน รักษา Opening / Motion และพฤติกรรมเดิมตามขอบเขต Regression
- [ ] สินค้า: ปรับ /products และ /products/[slug] ผ่าน Repository เดิม รักษา Prisma ฝั่งเซิร์ฟเวอร์ Snapshot fallback / Cache และการไม่คืนสินค้าที่ซ่อนหรือลบ เพิ่มข้อมูลรับประกันเฉพาะ Contract ที่ยืนยัน
- [ ] โซลูชัน / ซอฟต์แวร์: ปรับ Component ผ่าน Catch-all เดิม ใช้กลุ่มธุรกิจ ข้อมูล ชื่อซอฟต์แวร์ และไฟล์ดาวน์โหลดที่ยืนยันแล้ว
- [ ] บริการ / เกี่ยวกับเรา / ติดต่อเรา: ปรับ Component ที่มีอยู่ เผยแพร่ Claim มาตรฐานและข้อมูลรับประกันเฉพาะที่มีหลักฐานและข้อความอนุมัติ ฟอร์มใบเสนอราคาใช้ Fields / ปลายทาง / Validation / ผลสำเร็จและผิดพลาดตาม Contract จริง
- [ ] ใช้ React Server Components (RSC) เป็นค่าเริ่มต้น ดึงข้อมูลผ่าน Prisma ฝั่งเซิร์ฟเวอร์ ใช้ Client Component ("use client") เฉพาะ Interactivity เช่น Drawer, Filter State หรือ Form Interaction ไม่ย้าย Prisma ไป Client และไม่เปลี่ยน Page เป็น Client โดยไม่มีเหตุผล
- [ ] รักษา Props, Data Contracts, CMS Settings, Navigation Groups, Routes / Redirect และงานผู้ใช้ที่อยู่นอกขอบเขต หากขอบเขตเปลี่ยน อัปเดต Spec/Plan และขออนุมัติส่วนที่เปลี่ยนก่อน

### 4. Quality / Verification — หลังแก้โค้ดที่อนุมัติแล้ว

เลือก RG และ AC ตามหัวข้อ Regression / Matrix ใน Spec บันทึก Baseline ก่อนรัน เปรียบเทียบผลจาก Revision และชุดข้อมูลเดียวกัน

- [ ] รัน bun run typecheck, bun run lint และ bun run format:check
- [ ] รัน Tests ที่เกี่ยวข้องกับส่วนที่เปลี่ยน เช่น Catalog และ Browser Navigation / Header / Product / Content / Form ตาม AC
- [ ] ตรวจ Mobile-first / Responsive และไม่มี Horizontal Overflow ที่ขนาด QA ที่เสนอ 320/390/768/1024/1440px และก่อน/หลัง Breakpoints จริงของ Component ที่เปลี่ยน ตรวจ Keyboard / Focus / Contrast และ Reduced Motion ตามขอบเขต
- [ ] ตรวจหก Canonical Routes, Footer, ข้อมูลสินค้า/รูป/สเปก/การรับประกัน, Software Download, Form Validation / Success / Error ตาม Contract พร้อมหลักฐาน Browser / Screenshot
- [ ] รัน bun run build บน Node.js 24 และยืนยัน Build สำเร็จก่อนใช้ผลเป็นหลักฐาน Production QA
- [ ] บันทึกผลจริงพร้อมข้อจำกัด ห้ามทำเครื่องหมายผ่านล่วงหน้าหรือใช้ผลจากเอกสารเป็นหลักฐาน Runtime

### 5. ส่งมอบ

- [ ] อัปเดต AC, Checklist, Verification Results, Current State และ Data Contracts ที่ได้รับผลกระทบใน Spec/Plan
- [ ] สรุปสิ่งที่เปลี่ยน หลักฐานตรวจ และรายการที่ยังไม่ตรวจ ไม่มี Commit / Push / Deploy ในขอบเขตแผนนี้

## Regression

- ใช้ Regression Matrix ใน Spec เป็นแหล่งอ้างอิง RG-01 ถึง RG-09 ที่ผูกกับ AC-W01 ถึง AC-W09 ส่วน AC-W10 เป็นเกณฑ์ยืนยันผลรวม
- เมื่อเปลี่ยน Header / Footer / Catch-all / Global CSS ต้องเลือก RG-01, RG-04 และ RG-08 ตามผลกระทบ พร้อมหน้าตัวแทนนอก Scope ที่ใช้โครงสร้างร่วม
- Home / Motion ใช้ RG-02; Catalog / Repository ใช้ RG-03 และ RG-07; Software ใช้ RG-05; Service / Contact ใช้ RG-06; Warranty / Quote ใหม่ใช้ RG-09 หลังมี Contract และไฟล์ทดสอบที่อนุมัติ
- ตรวจ Assertion เดิมเทียบ Spec / Baseline ก่อนรัน โดยเฉพาะ Case เก่าที่กล่าวถึง Curtain ห้ามปรับ Test เพื่อกลบข้อผิดพลาดของงานใหม่ กรณีไม่มี Coverage ให้ระบุ Gap และวิธีตรวจเพิ่มก่อนส่งมอบ
- ใช้ bun run test:catalog และ bun run test:e2e โดยเลือกไฟล์/Case ตาม Matrix ตรวจ Browser ที่มีจริงและ Base URL ที่ตั้งใน playwright.config.ts ก่อนเริ่ม ห้ามรบกวน Dev Server เดิม ใช้ผล Build ที่สมบูรณ์สำหรับ Production QA
- แต่ละรันต้องมี Output Directory ของตัวเอง หรือรันตามลำดับ ไม่ใช้โฟลเดอร์ Artifact ร่วมกันระหว่างกระบวนการที่รันซ้อน
- บันทึกต่อ RG ว่า Not Run / Passed / Failed พร้อมคำสั่ง Revision ชุดข้อมูล ขนาดหน้าจอ ผลจริงและ Path หลักฐาน การมี Test File หรือ Screenshot อย่างเดียวไม่ถือว่าผ่าน

## Impact / Rollback

- รอบเอกสารกระทบเฉพาะ spec.md / plan.md งานเว็บไซต์ยัง Need Information / Pending และยังไม่มีการสร้าง Backup หรือ Rollback Runtime ในรอบนี้
- หากอนุมัติ Rebuild ผลกระทบรวมหน้าสาธารณะ Header / Footer / Styles และ Catch-all ซึ่งให้บริการหน้าอื่นนอกหก Routes ต้องเก็บ Baseline ตัวแทนทุกส่วนที่ใช้ร่วมก่อนเปลี่ยน
- Trigger: AC ที่อนุมัติไม่ผ่านจากงานนี้, Build ล้มจากการแก้ หรือ Regression ต่อ Shared Component / Route นอกงานที่แก้เฉพาะจุดไม่ได้

ขั้นตอนก่อนแก้โค้ดและเมื่อจำเป็นต้องย้อน:

1. บันทึก Revision, Git Status และรายการไฟล์ที่อนุมัติ เก็บส่วนต่าง Staged/Unstaged รวมสำเนาและ Hash ของไฟล์ Untracked ที่เกี่ยวข้อง ระบุไฟล์ที่จะสร้างใหม่แยกจากไฟล์เดิม
2. สำรองไฟล์ต้นฉบับที่ได้รับผลกระทบนอก Source Tree บันทึก Path จริงและตรวจ Hash ก่อนเริ่ม Implementation อย่าเก็บ Source Copy ในที่ซึ่ง tsconfig นำไป Compile
3. เมื่อ Trigger เกิด ให้เก็บผลล้มเหลว/หลักฐานและส่วนต่างปัจจุบันก่อน แล้วคืนเฉพาะ Hunk / ไฟล์ของงานนี้จาก Baseline ในข้อ 1–2 ไม่คืนทั้งโครงการไป Commit ล่าสุด ไม่ล้างงานที่ยังไม่ Commit และไม่ใช้ git reset / git checkout ทั้งชุด
4. จัดการเฉพาะไฟล์ใหม่ตามรายการงานครั้งนี้หลังตรวจผู้สร้างและเนื้อหา หากมีงานผู้ใช้หรือกระบวนการอื่นซ้อนในไฟล์เดียวกัน ให้รักษางานนั้นและคืนเฉพาะส่วนที่แยกได้
5. ตรวจ Diff / Hash กับ Baseline เพื่อยืนยันว่างานเดิมยังอยู่ รัน Formatting / Typecheck / Build และ RG ที่เกี่ยวข้องตามผลกระทบ บันทึกว่าพฤติกรรมเดิมกลับมาพร้อมข้อจำกัดที่ยังเหลือ
6. อัปเดต Spec/Plan ด้วยเหตุที่ย้อน สถานะงานและหลักฐาน ขอบเขตนี้ไม่มี Database / Production Rollback เพราะไม่อนุมัติ Migration, Seed หรือ Deploy

Rollback เอกสารรอบนี้ให้คืนเฉพาะ AC / Regression / Source Map / Rollback ที่ปรับเพิ่ม โดยรักษาหัวข้อประวัติอื่นและไฟล์แนบต้นฉบับไว้

## Verification Results

### รอบเอกสารปัจจุบัน

- Prettier เฉพาะ spec.md / plan.md และ git diff --check ผ่าน
- ตรวจหัวข้อ Template ชื่อ Task สถานะและขอบเขตการอนุมัติตรงกัน มี Website AC 10 ข้อที่ยังไม่ทำเครื่องหมายผ่าน Regression 9 กลุ่ม และคำถามก่อนพัฒนา 6 ประเด็น ตรวจ Source / Test Paths ที่อ้างอิง 49 รายการแล้วมีอยู่จริง
- Hash ของ AGENTS.md, plan-v2.md ต้นฉบับ และเนื้อหา Spec ทั้งหมดก่อนเพิ่มหัวข้องานนี้ตรงกับก่อนเริ่มงาน
- ไม่มีการแก้โค้ดเว็บไซต์หรือเพิ่มไฟล์อื่นในรอบนี้ ข้อมูล Source Map ยืนยันจากไฟล์ ไม่ใช่ผลทดสอบ HTTP / ฐานข้อมูลจริง / Browser
- ตรวจรอบรายงาน Next.js แล้ว ไม่มีปัญหา Framework ที่เข้าเกณฑ์รายงานในงานเอกสารนี้

### ผล Implementation

ยังไม่รัน Typecheck, Lint, Build, Catalog Tests หรือ Browser QA ในรอบนี้ เพราะผู้ใช้อนุญาตเฉพาะเอกสาร ช่องตรวจในขั้นที่ 4 เป็นแผนตรวจในอนาคต ไม่ใช่ผลผ่านแล้ว
