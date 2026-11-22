# SUNFORD Official Website — Agent Instructions

## เลือกวิธีทำงานตามผลกระทบ

- **งานเล็กที่โจทย์ชัดและย้อนกลับง่าย** เช่น เปลี่ยนข้อความ รูป หรือระยะห่างเฉพาะจุด ให้ถือคำขอเป็นการอนุมัติ ลงมือ ตรวจผล และรายงานในแชต
- **งานหลายไฟล์ที่ขอบเขตชัด** เช่น ปรับเมนูทั้งมือถือและเดสก์ท็อป ให้สรุปแผนสั้น ๆ ในแชตก่อนแก้ ระบุไฟล์หรือส่วนที่กระทบกับวิธีตรวจ แล้วดำเนินงานต่อได้ภายในขอบเขตที่ขอ
- **งานเสี่ยง แม้แก้เพียงไฟล์เดียว** เช่น เปลี่ยนราคา VAT การออกเลขใบเสนอราคา สิทธิ์เขียน Warehouse สัญญาระหว่างระบบ migration หรือการเปลี่ยนส่วนกลางที่กระทบทั่วเว็บ ให้เขียนข้อกำหนดใน `spec.md` และแผนใน `plan.md` ก่อน ระบุขอบเขต เกณฑ์รับงาน ผลกระทบ วิธีตรวจและย้อนกลับ รอเจ้าของอนุมัติก่อนแก้ระบบ การอนุมัติเดิมใช้ได้เมื่อครอบคลุมขอบเขตปัจจุบัน
- เมื่อข้อมูลที่จำเป็นขาด ให้ถามเฉพาะจุดและพักส่วนที่ต้องใช้คำตอบ ถ้าพบว่าต้องขยายขอบเขต ให้แจ้งผลกระทบและขออนุมัติส่วนที่เพิ่ม งานที่เจ้าของกำหนดให้รอตรวจต้นแบบหรืออนุมัติแยก ให้ยึดเงื่อนไขนั้น
- ยึดข้อความ รูป สเปกสินค้า และ API ที่ตรวจสอบได้จากบรีฟและแหล่งข้อมูลของโปรเจกต์ รักษางานเดิมของผู้ใช้และขอบเขตที่อนุมัติ

## การทำงานพร้อมกันหลายแชต

- เมื่อ Javis (แชตคุมงาน) รับโจทย์หน้าเว็บ ให้แยกขอบเขตและมอบหมายให้ Javis1 (branch `Javis1`), Javis2 (branch `Javis2`) หรือ Javis3 (branch `Javis3`) ตามงาน ส่งงานเล็กให้แชตเดียว ส่งงานที่ทำได้อิสระให้ทำคู่ขนาน และกำหนดให้มีผู้รับผิดชอบแก้ไฟล์ส่วนกลางเพียงรายเดียว
- สำหรับโปรเจกต์นี้ Javis1, Javis2 และ Javis3 ใช้ GPT‑6.2 Sol (`gpt-6.2-sol`) ให้ Javis เลือกระดับ `effort` ของงานที่มอบหมายตามความซับซ้อนและความเสี่ยง ส่วน Javis ในแชตคุมงานใช้ GPT‑6.2 Astra (`gpt-6.2-astra`) และใช้ระดับ `effort` ที่เจ้าของเลือกไว้ในแชตนั้น งานเสี่ยงยังต้องรออนุมัติตามหัวข้อเลือกวิธีทำงานตามผลกระทบ
- ให้ Javis1, Javis2 และ Javis3 ใช้ Git worktree เดิมของตนเมื่อมีอยู่ แชตที่ต้องแก้โค้ดพร้อมกันและยังไม่มี worktree ให้แยก worktree ก่อนเริ่มแก้ โดยใช้ branch `codex/<ชื่องาน>` จาก `Javis1` เมื่อต้องสร้าง branch สำหรับงานเพิ่ม ส่วนงานอ่านหรือตรวจทานใช้โฟลเดอร์เดิมได้
- **Javis2 และ Javis3** ก่อนเริ่มงานใหม่ ให้รัน `git fetch origin` ใน worktree ของตน แล้วตรวจ `git log --oneline HEAD..origin/Javis1` ถ้ามีรายการให้รัน `git rebase origin/Javis1` ถ้าไม่มีให้เริ่มงานได้ทันที เมื่อทดสอบงานแล้วให้ commit และ push เฉพาะ branch ของตน แล้วส่งชื่อ branch, commit และผลตรวจให้ Javis
- **Javis1** เป็นผู้รวมงานบน branch `Javis1` เมื่อรับงานจาก Javis2 หรือ Javis3 ให้ merge งานที่พร้อม ตรวจผลหลังรวม แล้ว `git push origin Javis1` เพื่อให้ทุกแชตมีฐานล่าสุดสำหรับงานถัดไป
- **Javis** ติดตามงานจนทราบผล ตรวจหลักฐาน และสรุปให้เจ้าของในแชตคุมงาน ระบุ branch ที่เกี่ยวข้อง ผลตรวจ สถานะการรวม และข้อค้าง

## เอกสารที่ใช้ทำงาน

- อ่านข้อตกลงที่เกี่ยวข้องใน `spec.md` ค้น `MEMORY.md` ตามเรื่องที่กำลังทำ และเปิดเอกสารย้อนหลังเมื่อต้องการที่มาของการตัดสินใจ
- ใช้แชตบันทึกแผนและผลตรวจของงานทั่วไป อัปเดต `spec.md` เมื่อข้อตกลงถาวรหรือสถานะที่คนถัดไปต้องใช้เปลี่ยนไป ใช้ `plan.md` สำหรับงานเสี่ยงที่ยังเปิด โดยแยกสิ่งที่ต้องทำออกจากผลที่ตรวจแล้ว
- สำหรับงานเสี่ยงให้แยกความพร้อมของข้อมูลออกจากการอนุมัติ บันทึกคำอนุมัติจริงพร้อมขอบเขต เมื่อปิดงานให้ย้ายรายละเอียดที่จบแล้วไป `docs/archive/` และเก็บเฉพาะข้อสรุปที่ยังใช้ในไฟล์หลัก
- ก่อนส่งมอบ ให้เลือกการตรวจตามผลกระทบ เช่น typecheck, lint, tests หรือ build งาน UI ให้ตรวจหน้าและพฤติกรรมจริงตามขนาดจอที่เกี่ยวข้อง รายงานสิ่งที่ตรวจผ่านและสิ่งที่ยังติดขัด

## Design & Brand Consistency

- ยึด Brand Guideline และ Reference ที่ผู้ใช้อนุมัติ รักษาโลโก้ โทนสี Typography ระยะห่าง โครงสร้าง และรูปแบบ Interaction ให้สอดคล้องกับเว็บไซต์เดิม
- ตรวจ Design Tokens ใน `src/styles/base.css` และ Style ของ Component ที่ใช้งานจริงก่อนปรับ UI ใช้รูปแบบเดิมเมื่อไม่ได้รับคำสั่งให้เปลี่ยน
- ใช้ [Tailwind CSS Docs](https://tailwindcss.com/docs) เป็นแหล่งอ้างอิงหลักด้านเทคนิคทุกครั้งที่ต้องใช้ข้อมูลในการออกแบบหรือกำหนด/ปรับค่ากลาง เช่น Spacing, Sizing, Typography, Colors, Breakpoints, Border Radius, Shadows และ Interaction States เปิดอ่านหัวข้อที่เกี่ยวข้องฉบับปัจจุบันก่อนตัดสินใจ ไม่จำกัดเฉพาะ Responsive
- อ้างอิง Core Concepts ตามความเกี่ยวข้อง: Styling with utility classes, Hover/focus/other states, Responsive design, Dark mode, Theme variables, Colors, Adding custom styles, Detecting classes in source files และ Functions/directives ประยุกต์หลักการกับ CSS Modules/CSS เดิมของโปรเจกต์
- บันทึก URL หัวข้อที่ใช้ วันที่ตรวจ เวอร์ชันเอกสารที่แสดง ค่ากลาง/หน่วยที่เลือก และเหตุผลการประยุกต์ในแชตสำหรับงานทั่วไป หรือใน Spec สำหรับงานเสี่ยง แยกค่าเริ่มต้นของ Tailwind ออกจาก Design Tokens ของ SUNFORD ให้ชัดเจน หากเอกสารไม่แสดงเวอร์ชันให้ระบุตามจริง
- รักษา Brand Guideline และค่าที่เจ้าของอนุมัติไว้ หากค่าอ้างอิงต่างจากค่าปัจจุบัน ให้บันทึกเหตุผลและเสนอการเปลี่ยนตามระดับผลกระทบก่อนแก้ การอ้างอิงเอกสารนี้ไม่ใช่การอนุมัติติดตั้ง Tailwind เปลี่ยน Stack หรือแทนค่ากลางทั้งเว็บโดยอัตโนมัติ
- ออกแบบและตรวจสอบแบบ Mobile-first / Responsive เสมอ ครอบคลุมมือถือ แท็บเล็ต และเดสก์ท็อปตามขอบเขตงาน
- อ้างอิงแบรนด์ในช่องทางที่ใช้วางแผนของงานนั้น เมื่อขาดข้อมูลที่จำเป็นต่อการตัดสินใจด้านดีไซน์ ให้ถามเจ้าของ

## Tech Stack Standard

ใช้ Stack ที่มีอยู่ในโปรเจกต์ โดยตรวจเวอร์ชันจาก `package.json` และ Lockfiles ทุกครั้ง:

- Next.js 16 App Router, React 19 และ TypeScript 5
- CSS Modules และ CSS ที่มีอยู่ใน `src/styles/` โดยโหลด Global Styles ผ่าน `src/app/globals.css`
- ใช้ `pg` และ Prisma ORM 7 ตาม [กติกา Warehouse และใบเสนอราคา](spec.md#warehouse)
- Node.js 24; ใช้คำสั่งตรวจสอบและ Release ที่กำหนดไว้ใน `package.json`

ไม่เพิ่ม Tailwind CSS, UI Library, Dependency หรือเปลี่ยน Stack เว้นแต่อยู่ใน Spec และ Plan ที่ผู้ใช้อนุมัติ

## System & Code Integrity

- แก้หรือสร้างไฟล์ภายในขอบเขตที่เจ้าของขอ ตรวจไฟล์ที่เกี่ยวข้องเพื่อประเมินผลกระทบได้ทันที
- เมื่อแตะ Global Components, Shared UI, Layout หรือ Stylesheet หลัก ให้ตรวจผู้ใช้งานร่วมและเส้นทางที่ต้องทดสอบ เลือกวิธีทำงานตามผลกระทบจริง
- ไฟล์ส่วนกลางรวมถึง `src/components/layout/`, `src/components/ui/`, `src/app/layout.tsx`, `src/app/(site)/layout.tsx`, `src/app/globals.css` และ `src/styles/`
- หากจำเป็นต้องขยายขอบเขตไปยังไฟล์ส่วนกลาง ให้ระบุผลกระทบ จุดเสี่ยง Regression และวิธีย้อนกลับ แล้วขออนุมัติส่วนที่เพิ่มก่อนแก้ไข
- รักษา Props, Data Contracts, Routes และพฤติกรรมเดิมที่อยู่นอกงาน ไม่ลบหรือเขียนทับการเปลี่ยนแปลงที่มีอยู่ของผู้ใช้
- SUNFORD ไม่มีบริการรับสอบเทียบ (Calibration Service) ห้ามใส่ในเมนูหรือโฆษณาเป็นบริการของบริษัท

## Next.js Performance Strategy

- ใช้ React Server Components (RSC) เป็นค่าเริ่มต้นสำหรับการอ่านข้อมูลฝั่งเซิร์ฟเวอร์
- ใช้ Client Component (`"use client"`) เฉพาะส่วนที่มี Interactivity จริงเท่านั้น

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

Javis1 เป็นผู้ปล่อย Production เพียงคนเดียว เมื่อเจ้าของสั่งให้ปล่อยรุ่น ให้รัน `bun run deploy` จาก branch `Javis1` สคริปต์จะส่ง revision ที่ตรวจผ่านเข้า `main` เพื่อให้ Vercel deploy จากนั้นยืนยัน revision บนเว็บจริงตาม [คู่มือปล่อยรุ่นบน Vercel](docs/vercel.md)

## Product promotional imagery

- Use a straight-on front view for every product, following its supplied product photo.
- Deliver product imagery without added headlines, promotional text, buttons, or interface elements. Text and calls to action are added separately on the website.
- Preserve the real product's shape, colors, logo, and physically printed markings. Do not invent product features.
- Default to a minimal black studio background with directional highlights and a smooth falloff into deep shadow. Let the lower body and base fade softly into black while keeping the display readable, following the current premium campaign direction.
