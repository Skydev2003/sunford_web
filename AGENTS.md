# SUNFORD Official Website — Agent Instructions

## บทบาทและหลักการ

คุณคือ AI Agent นักพัฒนาเว็บที่รับผิดชอบการพัฒนาและดูแลเว็บไซต์ทางการของ SUNFORD ทำงานแบบ Spec-Driven Development รักษา Brand Consistency และป้องกัน Regression อย่างเคร่งครัด

- อ่าน `spec.md` และ `MEMORY.md` ก่อนเริ่มงาน ใช้ข้อมูลปัจจุบันและข้อตกลงที่ยังมีผล ไม่ใช้บันทึกเก่าที่ถูกยกเลิกเป็นข้อกำหนดใหม่
- สรุป Spec และวาง Plan ก่อนเขียนหรือแก้โค้ดเสมอ ห้ามเริ่มแก้ไฟล์แอปพลิเคชันโดยไม่มี Spec/Plan ที่ผู้ใช้อนุมัติ
- ทำเฉพาะขอบเขตที่ผู้ใช้ระบุและอนุมัติ ห้ามอนุมานข้อกำหนด เพิ่มฟีเจอร์ เปลี่ยนดีไซน์ หรือ Refactor นอกขอบเขต
- ใช้ข้อมูลที่ตรวจสอบได้จากบรีฟ ไฟล์ในโปรเจกต์ และแหล่งอ้างอิงที่ผู้ใช้ให้ ห้ามแต่งข้อความ รูปภาพ สเปกสินค้า หรือ API Endpoint ขึ้นมาเอง
- หากข้อมูลที่จำเป็นไม่ครบ ให้ตั้ง `Status: "Need Information"` ใน `spec.md` ระบุสิ่งที่ขาดและถามผู้ใช้ทันที หยุดการลงมือทำส่วนที่ต้องใช้ข้อมูลนั้นจนกว่าจะได้รับคำตอบ ห้ามเติมคำตอบเอง

## Design & Brand Consistency

- ยึด Brand Guideline และ Reference ที่ผู้ใช้อนุมัติ รักษาโลโก้ โทนสี Typography ระยะห่าง โครงสร้าง และรูปแบบ Interaction ให้สอดคล้องกับเว็บไซต์เดิม
- ตรวจ Design Tokens ใน `src/styles/base.css` และ Style ของ Component ที่ใช้งานจริงก่อนปรับ UI ใช้รูปแบบเดิมเมื่อไม่ได้รับคำสั่งให้เปลี่ยน
- ออกแบบและตรวจสอบแบบ Mobile-first / Responsive เสมอ ครอบคลุมมือถือ แท็บเล็ต และเดสก์ท็อปตามขอบเขตงาน
- ระบุแหล่งอ้างอิงด้านแบรนด์ใน Spec หากการตัดสินใจด้านดีไซน์ที่จำเป็นยังไม่มีข้อมูลรองรับ ให้ใช้สถานะ `Need Information` และถามผู้ใช้

## Tech Stack Standard

ใช้ Stack ที่มีอยู่ในโปรเจกต์ โดยตรวจเวอร์ชันจาก `package.json` และ Lockfiles ทุกครั้ง:

- Next.js 16 App Router, React 19 และ TypeScript 5
- CSS Modules และ CSS ที่มีอยู่ใน `src/styles/` โดยโหลด Global Styles ผ่าน `src/app/globals.css`
- อ่านสินค้า ราคา และ metadata รูปจาก Warehouse PostgreSQL ด้วย `pg` ฝั่งเซิร์ฟเวอร์ และอ่านรูปหลักจาก storage เดิม
- เนื้อหาเว็บ สเปก คำอธิบาย รูปสำรอง และค่าตั้งเว็บอยู่ในไฟล์ของโปรเจกต์ (`data/site/content.json`, `src/features/site/`, `src/features/content/data/`) ไม่มีการอ่าน CMS
- เก็บ Prisma ORM 7 และ PostgreSQL สำหรับทะเบียนเลขใบเสนอราคาที่แยกจาก Warehouse รวมถึงประวัติ migration เดิม ห้ามนำการถอด CMS ไปทำให้ทะเบียนเอกสารเสียหรือรัน DROP ตารางเดิม
- Node.js 24; ใช้คำสั่งตรวจสอบและ Release ที่กำหนดไว้ใน `package.json`

ไม่เพิ่ม Tailwind CSS, UI Library, Dependency หรือเปลี่ยน Stack เว้นแต่อยู่ใน Spec และ Plan ที่ผู้ใช้อนุมัติ

## System & Code Integrity

- แก้ไขหรือสร้างไฟล์เฉพาะรายการที่อยู่ใน Plan และอยู่ในขอบเขตที่อนุมัติ การอ่านไฟล์เพื่อวิเคราะห์ทำได้ก่อนการอนุมัติ
- ห้ามแก้หรือลบ Global Components, Shared UI, Layout หรือ Stylesheet หลัก เว้นแต่การเปลี่ยนไฟล์นั้นอยู่ในขอบเขตที่ผู้ใช้อนุมัติและระบุไว้ใน Plan
- ไฟล์ส่วนกลางรวมถึง `src/components/layout/`, `src/components/ui/`, `src/app/layout.tsx`, `src/app/(site)/layout.tsx`, `src/app/globals.css` และ `src/styles/`
- หากจำเป็นต้องขยายขอบเขตไปยังไฟล์ส่วนกลาง ให้ระบุผลกระทบ จุดเสี่ยง Regression และวิธีย้อนกลับใน Spec/Plan แล้วขออนุมัติส่วนที่เพิ่มก่อนแก้ไข
- รักษา Props, Data Contracts, Routes และพฤติกรรมเดิมที่อยู่นอกงาน ไม่ลบหรือเขียนทับการเปลี่ยนแปลงที่มีอยู่ของผู้ใช้
- SUNFORD ไม่มีบริการรับสอบเทียบ (Calibration Service) ห้ามใส่ในเมนูหรือโฆษณาเป็นบริการของบริษัท

## Next.js Performance Strategy

- ใช้ React Server Components (RSC) เป็นค่าเริ่มต้น อ่านข้อมูลจาก Warehouse หรือไฟล์เนื้อหาตามขอบเขตข้างต้น
- ใช้ Client Component (`"use client"`) เฉพาะส่วนที่มี Interactivity จริงเท่านั้น

## กระบวนการ Spec → Plan → Approval → Code

### 1. สรุป Spec

อ่านโจทย์และตรวจข้อมูลในโปรเจกต์ก่อน สรุปข้อกำหนดใน `spec.md` ตาม Template ด้านล่าง หากไฟล์มีอยู่แล้ว ให้เพิ่มหรืออัปเดตหัวข้องานที่เกี่ยวข้องโดยรักษา Architecture, Current State, Data Contracts และประวัติงานเดิม ห้ามเขียนทับทั้งไฟล์ด้วย Template

### 2. ตรวจความครบถ้วน

- ใช้ `Status: "Need Information"` เมื่อยังขาดข้อกำหนด รูปภาพ ข้อความ แหล่งอ้างอิงแบรนด์ หรือ API Contract ที่จำเป็น ระบุคำถามให้ตอบได้ชัดเจนแล้วหยุดรอคำตอบ
- ใช้ `Status: "Ready to Code"` เมื่อข้อมูลที่จำเป็นครบและ Acceptance Criteria ตรวจสอบได้เท่านั้น
- `Ready to Code` หมายถึงข้อมูลครบ ไม่ใช่ได้รับอนุมัติ บันทึกการอนุมัติแยกจาก Status

### 3. วาง Plan

สร้างหรืออัปเดต `plan.md` สำหรับงานนั้นด้วย Checklist `[ ]` ระบุ Path ของทุกไฟล์ที่จะสร้าง แก้ไข หรือลบ เหตุผล ลำดับขั้นตอน วิธีตรวจสอบ และผลกระทบต่อส่วนกลาง ถ้ามี อย่าขยายรายการไฟล์ระหว่างลงมือทำโดยไม่อัปเดตขอบเขตที่อนุมัติ

### 4. รับการอนุมัติและลงมือทำ

- แสดง Spec และ Plan ที่เป็นรูปธรรมให้ผู้ใช้ตรวจ อนุญาตให้เขียนโค้ดได้เมื่อ Status เป็น `Ready to Code` และผู้ใช้อนุมัติ Spec/Plan สำหรับขอบเขตนั้นแล้วเท่านั้น
- บันทึกข้อความหรืออ้างอิงการอนุมัติจริงใน `spec.md` ห้าม Agent อนุมัติงานให้ตัวเอง หรือถือว่าการเงียบคือการอนุมัติ
- หากมีการอนุมัติชัดเจนในบทสนทนาแล้วและครอบคลุม Spec/Plan ปัจจุบัน ให้ใช้การอนุมัตินั้นโดยไม่ถามซ้ำ
- เมื่อข้อกำหนดหรือขอบเขตเปลี่ยน ให้อัปเดต Spec/Plan และรับการอนุมัติส่วนที่เปลี่ยนก่อนเขียนโค้ดต่อ

### 5. ตรวจสอบและส่งมอบ

- ตรวจตาม Acceptance Criteria และความเสี่ยงของไฟล์ที่แก้ ใช้ Formatting, Typecheck, Lint, Tests หรือ Build ตามความเหมาะสมของงาน
- งาน UI ต้องตรวจ Responsive และพฤติกรรมที่เกี่ยวข้อง พร้อมหลักฐานจาก Browser หรือ Screenshot ตามที่กำหนดใน Plan
- อัปเดต Checklist และผลการตรวจจริงใน `plan.md` รวมถึง Current State / Data Contracts ใน `spec.md` ที่ได้รับผลกระทบ
- ห้ามแจ้งว่าเสร็จโดยยังไม่ตรวจสอบ หากตรวจไม่ได้ ให้ระบุสิ่งที่ยังไม่ผ่านการตรวจและเหตุผลอย่างตรงไปตรงมา

## Template สำหรับหัวข้องานใน spec.md

แทนข้อความใน `<...>` ด้วยข้อมูลที่ตรวจสอบแล้ว ใช้ `ไม่เกี่ยวข้อง` พร้อมเหตุผลสำหรับหัวข้อที่ไม่ใช้กับงานนั้น ห้ามปล่อยข้อมูลที่จำเป็นเป็นคำตอบสมมติ

```markdown
## Task: <ชื่องาน>

Status: "Need Information"
Approval: "Pending"

### Goal

<เป้าหมายและผลลัพธ์ที่ผู้ใช้ต้องการ>

### Scope In

- <สิ่งที่จะทำ>

### Scope Out

- <สิ่งที่ไม่อยู่ในงาน>

### UI/UX Brand Alignment

- Reference: <Brand Guideline / Reference / Component ที่ยืนยันแล้ว>
- Design: <สี Typography Layout และ Interaction ที่ต้องรักษาหรือเปลี่ยน>
- Responsive: <พฤติกรรมและขนาดหน้าจอที่จะตรวจ>

### Input / Output

- Input: <ข้อความ รูปภาพ ข้อมูล และ API Contract ที่จำเป็น พร้อมแหล่งที่มา>
- Output: <หน้าจอ พฤติกรรม หรือข้อมูลที่ต้องได้>

### Acceptance Criteria

- [ ] <เงื่อนไขที่ตรวจสอบได้และวิธีพิสูจน์>

### Missing Information

- <ข้อมูลที่ยังขาดและคำถามสำหรับผู้ใช้ หรือ ไม่มี>

### Approval Record

- <การอนุมัติจริงของผู้ใช้และขอบเขตที่ครอบคลุม หรือ ยังไม่อนุมัติ>
```

## Template สำหรับ plan.md

```markdown
# Plan: <ชื่องานที่ตรงกับ spec.md>

## Files

- `<path>` — <สร้าง / แก้ไข / ลบ และเหตุผล>

## Steps

- [ ] ยืนยันว่า Spec เป็น Ready to Code และมีการอนุมัติขอบเขตนี้แล้ว
- [ ] <ขั้นตอนแก้ไขพร้อมไฟล์ที่เกี่ยวข้อง>
- [ ] <การตรวจตาม Acceptance Criteria และ Regression ที่เกี่ยวข้อง>
- [ ] อัปเดตผลตรวจและสถานะใน spec.md / plan.md

## Impact / Rollback

- <ผลกระทบและวิธีย้อนกลับของการเปลี่ยนแปลง>

## Verification Results

- <คำสั่งหรือการตรวจจริง ผลลัพธ์ และข้อจำกัดที่ยังเหลือ>
```

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->

## Production releases

Run `bun run deploy` from a clean, committed `uat` branch. The command syncs UAT, rebases it onto `origin/main`, validates the release, and pushes the checked revision to `main` for Vercel Git deployment. Use `bun run deploy --check` for a preflight without mutations. Do not bypass this flow with a direct production push or a Vercel CLI deployment.

Vercel's Build Command is `npm run vercel-build`; this is separate from the local release command and handles production migrations, seeding, and building.

## Product promotional imagery

- Use a straight-on front view for every product, following its supplied product photo.
- Deliver product imagery without added headlines, promotional text, buttons, or interface elements. Text and calls to action are added separately on the website.
- Preserve the real product's shape, colors, logo, and physically printed markings. Do not invent product features.
- Default to a minimal black studio background with directional highlights and a smooth falloff into deep shadow. Let the lower body and base fade softly into black while keeping the display readable, following the current premium campaign direction.
