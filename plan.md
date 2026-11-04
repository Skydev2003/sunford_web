# Plan: Central Z-Index Scale (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done"

## Files

- src/styles/base.css — กำหนด Tokens กลางและ Skip Link
- src/styles/header.css — Header/เมนู/Backdrop ตามบทบาท ไม่ใช้2001
- src/styles/tooltip.css — Tooltip200
- src/styles/overlays.css — Modal/Backdrop และ Compare Bar
- src/styles/customer-map.css — Native Dialog/Backdrop และ Controls ภายใน
- src/styles/floating-contact.css — ระดับ Critical ของ Widget เดิมที่ยังไม่ได้ Mount
- src/styles/hero-cinematic.css — Local Hero Layers และ Portal เดิมไม่ใช้2000
- src/styles/catalog.css — Product Card Controls
- src/styles/content.css — Showcase Copy/Effect ภายใน Context เดิม
- src/styles/footer.css — Background ของ Footer
- src/styles/hero.css — Spotlight Content
- src/styles/home-sections.css — Caption ภาพ
- src/styles/storefront.css — Copy/Comparison Controls
- src/components/contact/sunford-mascot.module.css — Widget เดิมและ Local Layers ไม่เพิ่ม Mount
- src/components/layout/site-background.module.css — หาก Regression ยืนยัน Context แม่ล็อก Header ไว้ใต้ Body Portal ให้เอาเฉพาะ isolation ของ Wrapper ออก รักษา Background/Geometry เดิม
- src/features/catalog/components/category-banner.module.css — Background และ Responsive auto เดิม
- src/features/catalog/components/product-browser.module.css — Banner Copy / Hover Card
- src/features/content/components/after-sales-page.module.css — Decoration
- src/features/content/components/contact-page.module.css — Background/Copy/Hover
- src/features/content/components/solutions-source.css — Wire/Badge Layers
- src/features/home/components/brand-opening.module.css — Logo Layer ใน Hero
- src/features/home/components/brand-story.module.css — Local Gallery / Captions
- src/features/home/components/business-solutions.module.css — Copy/Artwork
- src/features/home/components/hero-product-ribbon.module.css — Local Card/Rail/Drag Preview เดิม
- src/features/home/components/hero-scene.module.css — Video/Overlay ติดลบ
- src/features/home/components/hero-studio.module.css — Background เดิม
- src/features/home/components/stories-section.module.css — Badge
- src/features/home/components/hero-orbit.ts — ใช้ Token References ใน WAAPI zIndex เดิม
- src/features/home/components/hero-product-ribbon.tsx — ใช้ Token References ใน WAAPI zIndex เดิม
- tests/e2e/z-index-scale.spec.ts — Runtime Regression สำหรับ Navigation/Tooltip/Modal/Local Layers
- tests/home/hero-orbit.test.ts — ปรับ Assertion ของ Keyframe จากเลข Inline เป็น Token ตาม Contract ใหม่ รักษา Geometry/Depth Tests
- tests/e2e/hero-model-switcher.spec.ts — ปรับ Assertion เลเยอร์ของ Hero เก่าจากเลข4เป็น Token โดยคงการเทียบ Front/Rear ไม่ Mount Hero เดิมเพื่อทดสอบ
- tests/e2e/after-sales.spec.ts — ปรับชื่อเมนู/Viewport/การเปิดกลุ่มมือถือให้ตรง Navigation เดิมที่ตรวจ Source แล้ว ไม่แก้หน้าบริการ
- tests/e2e/tooltips.spec.ts — ตรวจ Compare บนหน้า Products จริง และ Bottom-edge Tooltip บน Compare Bar แทน Mascot ที่ไม่ได้ Mount โดยคง Coverage ของ Action/Description/Bounds
- spec.md / plan.md — ขอบเขต คำอนุมัติและผลตรวจ
- MEMORY.md — บันทึกสาเหตุ Outer Context แยก Header จาก Body Portal และวิธีตรวจป้องกัน
- output/z-index-scale-20261104/ — Backup/Inventory/Audit/ภาพ/รายงาน ไม่ใช่ Source Snapshot แบบแตกไฟล์ในโปรเจกต์

## Steps

- [x] อ่านกติกา/Spec/Memory/คู่มือ CSS ของ Next ที่ติดตั้ง ตรวจ Source/Stacking Context และบันทึกคำอนุมัติที่มีอยู่
- [x] สำรอง33ไฟล์และ Git Status ก่อนแก้ เตรียม QA Working Copy นอกโปรเจกต์ รวมงานที่ยังไม่ Commit ไม่คัดลอก Environment จริง
- [x] Build Baseline และตรวจ Regression ใหม่กับพฤติกรรมก่อนเปลี่ยน Tokens
- [x] เพิ่ม Scale กลางและย้าย Numeric Layers ตามบทบาท โดยคงสัมพันธ์ภายในแต่ละ Context ไม่เพิ่มระบบใหม่
- [x] Build QA หลังแก้ รัน Typecheck/Lint/Formatting และชุด Browser ที่เกี่ยวข้อง ตรวจภาพ/Hit Targets/Responsive และ Hash
- [x] อัปเดต AC/Checklist/ผลจริง/ข้อจำกัด/รายงาน และหยุดเฉพาะ QA3162/3163ที่เปิดเอง รักษา Dev3000 PID6824

## Impact / Rollback

- กระทบ CSS ส่วนกลางของทุกหน้าและค่า Layer ภายใน Feature ที่ระบุ ความเสี่ยงหลักคือเมนูคลิกไม่ได้ Tooltip ซ่อนใต้ Dialog หรือ Local Caption/Controls ถูกทับ จึงตรวจ Hit Target/Focus และภาพจริง
- รักษา Native Dialog Top Layer และ Tooltip Portal เดิม ไม่พยายามแก้ด้วย999999หรือเปลี่ยน DOM/Portal ทั้งเว็บ
- Outer Wrapper มี Context ที่อาจทำให้ Header40อยู่ใต้ Body Portal30 ต้องมี Red/Green จาก Hit Target ก่อนเอา isolation ออก ผลกระทบคือการรวมเลเยอร์ระดับหน้า จึงตรวจพื้นหลังภายใน Hero/Footer/About/Contact และ Negative Layers ที่ยังมี Context เฉพาะของตัวเอง
- QA อยู่ที่ C:/Users/cityc/.codex/tmp/sunford-z-index-20261104-01 เริ่มจาก Working Tree ทั้งหมด; ก่อนงานเก็บ output/z-index-scale-20261104/before-files.zip / baseline-source.json / baseline-status.txt
- หากมี Regression ให้ย้อนเฉพาะ Diff ของงานนี้จาก ZIP หลังตรวจงานทับซ้อน ไม่ Reset HEAD/คืนทั้ง Working Tree เพราะมีงานก่อนหน้า; Test ใหม่ย้อนเฉพาะส่วนที่เพิ่ม แล้วตรวจเมนู/Modal/Logo ซ้ำ ไม่ใช้ Database/Production Rollback

## Verification Results

- เพิ่ม23 Tokens / ย้าย CSS76จุด / WAAPI2 Expressions ไม่มี Numeric z-index นอก Token Definitions เก็บ auto ที่จำเป็นไว้
- Baseline Build และ Red7/7ตรงสาเหตุค่าเก่า Native Dialog/Dropdown; แก้ Test Assumptions หลังปิดเมนูและ Keyboard Modality แล้ว Green7/7 ภายหลังเพิ่ม Orbit Token และ Cross-context Test รวม Layer9/9ผ่าน
- Cross-context Red ยืนยัน Body Portal30ทับ Header40เพราะ Outer Wrapper isolation หลังเอาเฉพาะ isolation ออกแล้ว Hit Target ผ่าน Local Section Context/พื้นหลังเดิมยังอยู่
- Final Production Build webpack420หน้า / Typecheck / ESLint / Full Formattingผ่าน Orbit Unit4/4ผ่าน แก้ Test เดิมเฉพาะ Contract zIndex และ Locator/Target ที่ไม่ได้อยู่ใน UI แล้ว รักษา Failure Artifacts ทุกช่วง
- Browser ชุดสุดท้าย16ไฟล์102/103ผ่าน ข้อที่ไม่ผ่านคือ Search ไป FEH5KS: ข้อมูลเดิมมี Slug ต่างกันเฉพาะ Case2รายการ Manifestมี2แต่ Windowsเก็บ HTML/RSC ชุดเดียว Repeat Production3/3ยังไม่ผ่าน; Warm Dev1/1ผ่าน Cold Devรอ Compilation เกิน URL Assertion5วินาที ไม่อ้างว่าชุด Production ผ่านทั้งหมด และไม่แก้ Data/Route/Assertion นี้ภายใต้งานเลเยอร์
- ภาพ12ภาพ Hero/Menu/Search ที่1440/768/390/844 Landscape ไม่มี Page Errors/Overflow พร้อมตรวจภาพ Map และ Contact จาก Regression Source29ไฟล์ตรงกับ QA ทุก Hash
- Audit ยืนยันช่วงและ Reference23 Tokens, Non-layer CSSเดิม, เปลี่ยน Outer Contextเฉพาะ isolation, ประวัติ Spec/Plan/Memory เดิมและขอบเขต Dirty Paths สำรอง38ไฟล์ก่อนแก้รวม Dependent Tests
- ปิด QA3162/3163แล้ว Dev3000 PID6824เดิมยังอยู่ ไม่แก้ Data/Dependency/Media ไม่ Deploy/Commit; ไม่อ้าง Live Database หรือ E2E ของ Legacy UI ที่ไม่ได้ Mount
- หลักฐาน: output/z-index-scale-20261104/delivery.md / summary.json / scope-audit.json / source-hashes.json / visual-evidence.json / case-collision-evidence.json / before-files.zip
- Next.js reporting pass: CLI Protocol อ่านครบแล้ว เตรียม next-feedback-draft.json สำหรับ Case-only Static Params บน Windows; Automatic Approval Review ปฏิเสธคำสั่งเตรียมลิงก์เข้ารหัสด้วย “blocked by policy” จึงเก็บเฉพาะ JSON Draft ในเครื่อง ไม่เปิดฟอร์มและไม่ส่ง Feedback

---

# Plan: Non-blocking SUNFORD logo animation (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done"

## Files

- src/features/home/components/brand-opening.tsx / brand-opening.module.css — ของตกแต่งในพื้นที่โลโก้ ไม่มีม่านเต็มจอหรือการล็อกหน้า
- src/features/home/components/hero.tsx — Server wrapper / Logo Slot แทน State ที่รอจบ Animation
- src/features/home/components/hero-scene.tsx / hero-scene.module.css — Slot ในพื้นที่เดิมและ Video/Ready ที่อิสระจากโลโก้
- tests/e2e/nonblocking-opening.spec.ts — การแสดงผลก่อน Hydration/ฟอนต์ และ Interaction ระหว่าง Animation
- tests/e2e/brand-opening.spec.ts / hero-scene.spec.ts — Contract ใหม่และกรณี Fallback/Navigation เดิม
- tests/e2e/catalog.spec.ts — ปรับ Contract พื้นที่โลโก้และ Assertion เก่าที่ไม่ตรง Baseline (Heading / Pagination24) ไม่เปลี่ยนโค้ดหรือข้อมูลแคตตาล็อก
- spec.md / plan.md; output/nonblocking-opening-20261104/ — เอกสารและหลักฐาน

## Steps

- [x] อ่าน AGENTS/Spec/Memory/Source และคู่มือ Next.js Server/Client Slot; บันทึกคำอนุมัติล่าสุด
- [x] สำรอง Working Tree ที่รวมงานค้างเดิมไว้นอก Source Tree และเก็บ before-files.zip / baseline-source.json สำหรับคืนเฉพาะส่วนต่าง
- [x] Build Baseline Production และวัด Cold/Warm Desktop/Mobile/CPU4 ก่อนแก้
- [x] เขียน Regression ที่แสดงว่า Hero ถูกซ่อนก่อน Hydration/เมื่อฟอนต์ช้า และเห็นความล้มเหลวกับ Baseline จริง
- [x] แยก Animation เป็นของตกแต่งที่ไม่บังหน้า เอา inert/overflow lock/Content Gate ออก ใส่ในช่องว่างเดิมและตัด State Coupling
- [x] ปรับ Assertions เฉพาะ Contract ที่เปลี่ยนโดยตั้งใจ รักษา Coverage เรื่องชื่อโลโก้ ขอบเขตตำแหน่ง Skip/Reload/Back/No-JS/Failure/Video/Navigation
- [x] Build/วัดหลังแก้ด้วยเงื่อนไขเดิม รัน Static/Unit/Browser Checks ตรวจภาพ Desktop/Tablet/Mobile และ Source Hash
- [x] อัปเดต AC/ผลตรวจ/รายงาน แล้วปิดเฉพาะ QA3160ที่เริ่มเอง ไม่มี QA3161 เก็บ Dev3000 PID6824ไว้

## Impact / Rollback

- ขอบเขตเปลี่ยนเฉพาะตำแหน่งและการรอ Opening หน้าแรก ไม่มีม่านทับเนื้อหา ไม่มีการบินผ่านเนื้อหาไป Navbar; Header Logo แสดงตลอด และสีดำ–แดงยังอยู่ใน Halo เฉพาะช่องโลโก้
- ความเสี่ยงคือพื้นที่โลโก้เล็กใน Landscape/มือถือ การนำทางระหว่าง Animation และ Client/Server Slot จึงมีกรณีทดสอบเฉพาะก่อนส่งมอบ
- QA Working Copy อยู่ที่ C:/Users/cityc/.codex/tmp/sunford-nonblocking-20261104-01 เริ่มจาก Working Tree เดิมและอัปเดตเป็น Source หลังแก้เพื่อทดสอบแล้ว; สำเนาก่อนงานที่ใช้ย้อนกลับจริงคือ output/nonblocking-opening-20261104/before-files.zip พร้อม baseline-source.json รักษางานที่ยังไม่ Commit ทั้งหมด
- หาก Contract ใหม่ไม่ผ่าน ให้คืนเฉพาะการเปลี่ยนแปลงรอบนี้จาก Backup ห้ามคืนทั้งไฟล์ไป HEAD เพราะมีงาน Performance/พื้นหลังดำเดิมอยู่แล้ว ไม่ใช้ Database/Production Rollback
- Test แคตตาล็อกเดิมซึ่ง Clean ก่อนงานเก็บแยกใน output/nonblocking-opening-20261104/baseline-catalog.spec.ts พร้อม Revision/Hash; Test nonblocking-opening.spec.ts เป็นไฟล์ใหม่ ให้ย้อนเฉพาะส่วนที่เพิ่มในงานนี้หลังตรวจว่าไม่มีงานใหม่ทับซ้อน

## Verification Results

- Build ก่อน/หลังบน Node24.22.1: next build --webpack ผ่าน420หน้า; Typecheck, ESLint และ Full format:check ผ่าน Catalog Unit50 / UAT27ผ่าน
- Baseline Red5กรณียืนยัน Hero เดิมซ่อน/รอ Opening; Test ก่อน Hydration ต้องรอ HTML/CSS Attached ก่อนเช็ก Hidden ไม่ใช้ Missing DOM เป็นหลักฐาน และพบ Catalog Heading SUNFORD ที่เก่าเทียบกับ Heading ภาษาไทยเดิม จึงปรับ Assertion ตาม Source จริง
- Regression ใหม่6กรณีผ่าน; ชุดรวม77กรณีได้76ผ่านและ1 Failure ที่ Assertion เก่า20รายการ ขณะที่ ProductBrowser เดิมกำหนด24 (Source ไม่ได้เปลี่ยน) แก้เฉพาะ Assertion และ Targeted Rerun1/1ผ่าน เก็บ final-tests.json รอบล้มเหลวกับ catalog-pagination-recheck.json ไว้
- Production Measurement ก่อน/หลัง36โหลด (3รอบ/Cache/Profile): Cold Desktop2444→192ms, Mobile2416→160ms, CPU4 3968→576ms; Warm2256→116 / 2240→112 / 3156→256ms หลังแก้ไม่มี Page Errors/Overflow
- CLS Cold สูงสุด0.00109834 (ก่อน0), Warm0; Active Logo Max Frame Gap34.6ms ไม่มี>50ms การวัดไม่รวม Startup/Pending และไม่มี Network Throttling ไม่ใช่ Field Data / Physical Mobile / INP
- ตรวจ12ภาพจริงที่1440/768/390/844 Landscape: ชื่อเรื่องและปุ่มอยู่เหนือ/ใต้ช่องโลโก้ Navbar แสดงตลอด ไม่มีม่านทับหน้า; Source5ไฟล์ตรงกับ QA Build ทุก Hash
- ปิด QA3160ที่เริ่มเอง ไม่มี QA3161 Dev3000 PID6824เดิมยังอยู่ ไม่ Deploy/Commit/แก้ Database/Dependencies/Shared Header/Global CSS
- หลักฐาน: output/nonblocking-opening-20261104/delivery.md / summary.json / source-hashes.json / visual-samples.json / before-files.zip นโยบายใหม่นี้แทน Contract Fullscreen/Dock เดิมเฉพาะงานนี้ แผนก่อนหน้าเก็บด้านล่างเป็นประวัติ
- Final Next.js feedback reporting pass: ไม่พบ qualifying Framework issue

---

# Plan: Premium black brand opening (2026-11-04)

## Files

- `src/features/home/components/brand-opening.module.css` — แก้เฉพาะพื้นหลัง .backdrop
- `spec.md`, `plan.md` — บันทึกขอบเขต การอนุมัติ และผลตรวจ
- `output/black-opening-20261104/` — ภาพหลักฐานและผลตรวจ Browser

## Steps

- [x] อ่านกติกา Spec/Memory และตรวจ CSS กับสีแบรนด์ที่ใช้งานจริง
- [x] ผู้ใช้อนุมัติ Spec/Plan: ดำลึก แสง charcoal และแดงเข้มจาง ๆ สำหรับ Opening โลโก้
- [x] ปรับเฉพาะ gradients ของ .backdrop โดยเก็บค่าก่อนแก้เพื่อย้อนกลับ
- [x] ตรวจ Browser 390/768/1440px ระหว่าง Opening และช่วงส่งต่อ Hero พร้อมภาพหลักฐาน
- [x] รัน Opening Regression ที่เกี่ยวข้อง ตรวจ Formatting และ Diff
- [x] อัปเดตผลตรวจและสถานะใน spec.md / plan.md

## Impact / Rollback

- กระทบเฉพาะสีพื้นหลัง Opening หน้าแรก ความเสี่ยงคือแสงแดงกลืนโลโก้หรือรอยต่อเข้า Hero จึงตรวจภาพระหว่างเคลื่อนไหวจริง
- ย้อนกลับเฉพาะค่า background ของ .backdrop ที่แก้ในงานนี้ รักษางาน Performance และการเปลี่ยนแปลงเดิมทั้งหมด

## Verification Results

- ตรวจ Source แล้ว: พื้นหลังเดิมเป็น gradients ขาว/ชมพูใน CSS Module ไม่ใช่รูปภาพ
- ปรับเฉพาะ CSS background แล้ว; Chrome Opening Regression 12/12 ผ่านบน localhost:3000
- ตรวจ 9 ภาพที่ 390/768/1440px ช่วง symbol/name/reveal พร้อม visual-samples.json ใน output/black-opening-20261104/
- Prettier CSS/Spec/Plan และ git diff --check ผ่าน ไม่รัน Production Build
- รอบแรก 127.0.0.1 ถูก Dev Origin Protection บล็อก; localhost ผ่าน ไม่มีการแก้ Config หรือหยุดเซิร์ฟเวอร์เดิม
- Next.js feedback review ไม่มี qualifying candidate; ไม่มี Commit / Push / Deploy

---

# Plan: Homepage loading and motion performance (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done"

อ้างอิง Task ชื่อเดียวกันและ Approval Record ใน spec.md คำอนุมัติครอบคลุม Performance หน้าแรก แผน Rebuild ก่อนหน้ายังเก็บใน Spec และไม่เริ่มจากงานนี้

## Files

- src/features/home/components/brand-opening.tsx — จังหวะ Opening / Reveal ที่พิสูจน์จาก Baseline
- src/features/home/components/hero-scene.tsx — Geometry / Style ระหว่าง Scroll
- tests/e2e/home-performance.spec.ts — Behavioral Regression ใหม่
- tests/e2e/brand-opening.spec.ts — ตรวจจังหวะที่ปรับโดยยังคง Geometry / Fallback
- spec.md / plan.md — ขอบเขต ขั้นตอน ผลตรวจและข้อจำกัด
- MEMORY.md — บันทึกการแยก Call Stack ของตัวนับ Performance ตามเจ้าของงาน
- output/homepage-performance-20261104/ — Probe, Measurements, Screenshots และรายงาน ไม่ใช่ Application Code

## Steps

- [x] ตรวจ AGENTS.md, Spec, Memory, Source และหลักฐาน Performance เดิม อ่านคู่มือ Next.js ที่เกี่ยวข้อง
- [x] บันทึก Spec/Plan และคำอนุมัติผู้ใช้สำหรับงาน Performance แยกจาก Rebuild
- [x] เตรียม Source Baseline จาก HEAD d3c4408 นอก Source Tree พร้อม Node.js 24 โดยไม่ใช้ Environment / Database จริง
- [x] Build และ Smoke-test Production Baseline ก่อนเริ่ม Probe
- [x] วัด Cold/Warm อย่างน้อย 3 รอบต่อ Desktop1440 / Mobile390 / DesktopCPU4 เก็บ LCP/CLS/Long Tasks และเฟรมโดยไม่อ่าน Geometry ทุกเฟรม
- [x] ระบุ Hypothesis จากผลวัด เขียน Behavioral Test แล้วเห็นความล้มเหลวที่ตรงสาเหตุก่อนแก้ Source
- [x] แก้ทีละสาเหตุใน Opening / Hero ตามไฟล์ที่ระบุ เก็บการแก้ที่มีผลและรักษาการใช้งานเดิม
- [x] ทดสอบ Regression ใหม่และ Opening / Hero / Navigation ที่เกี่ยวข้องบน Production หลังแก้
- [x] Build หลังแก้และวัดซ้ำด้วยเงื่อนไขเดียวกัน ตรวจภาพจริง Desktop/Mobile และ Hash ของ Source ที่ทดสอบ
- [x] รัน Typecheck, Lint, Formatting และ Tests ที่เหมาะกับผลกระทบ รายงานความล้มเหลวทุกกรณีที่พบ
- [x] อัปเดต AC / Checklist / ผลตรวจ จัดทำรายงาน เปรียบเทียบก่อน/หลัง และหยุดเฉพาะ QA Server ที่เริ่มเอง

## Impact / Rollback

- กระทบจังหวะ Opening / การเผย Hero และงาน Scroll ภายในหน้าแรก ไม่เปลี่ยน Source Logo, Theme, Product Data หรือ Routes
- Baseline แยกไว้ที่ C:/Users/cityc/.codex/tmp/sunford-home-perf-20261104-01 พร้อม Archive จาก Revision ก่อนเริ่ม ก่อนแก้ตรวจว่าไฟล์ที่จะเปลี่ยนตรงกับ Baseline และรักษางานที่มีอยู่
- หาก LCP ไม่ดีขึ้น หรือ Geometry / Navigation / Fallback ถดถอย ให้คืนเฉพาะส่วนต่างที่ทำในงานนี้และวัดซ้ำ ห้ามคืนทั้ง Working Tree หรือแก้ Database / Deploy เพื่อแก้ผลทดสอบ
- การเปลี่ยนแปลงส่วนกลางนอก Target Files ต้องระบุหลักฐานและอัปเดตขอบเขตก่อนทำ

## Verification Results

- Production Before/After: LCP กลาง Cold Desktop3500→2480ms, Mobile3472→2416ms, CPU4 5320→4072ms; Warm3276→2268 / 3364→2348 / 5148→4136ms ตามลำดับ วัด3รอบต่อกรณี รวม36โหลดด้วย Snapshot Data
- CLS0, Page Errors0และไม่มี Overflow ในทุกโหลดหลังแก้ ไม่มี Active Opening Gap>50ms ทั้งก่อนและหลัง; ไม่อ้างผล FPS ทุกช่วงหรือ INP ภาคสนาม CPU4ยังมี Startup Cost ที่ไม่ได้แก้ทั้งหมด
- Red/Green: การรอเนื้อหา2กรณีและ Header Reads ล้มกับ Baseline ก่อนแก้ ผ่านหลังแก้ Counter ตั้งต้นที่หวัง0 reads ถูกปรับหลัง Call Stack ยืนยันว่ามี2readsที่จำเป็นจาก Header Surface; Budget ที่แก้แล้วยังล้มกับ Baseline4และผ่านโค้ดใหม่2 ไม่ได้แก้ Shared Header เพื่อให้ Test ผ่าน
- Production Build Node.js24ผ่าน, Typecheck / Lint / Full Formatting ผ่าน, Catalog50 / UAT27 / Production Browser62กรณีผ่าน ไม่มี Flaky หรือ Skipped ในชุด Browser ที่เลือก
- ตรวจภาพจริงทั้งช่วง Opening และหลังเปิดหน้า Desktop/Mobile Sourceสองไฟล์ตรง Hash QA ตาม source-hashes.json ไม่มีการแก้ CSS / Media / Database / Dependency / Routes
- หลักฐาน: output/homepage-performance-20261104/delivery.md, summary.json, before.json, after.json, final-tests.json และ Test Traces ของรอบ Red / Green
- QA3156/3157หยุดแล้ว ไม่มี Commit / Push / Deploy Final Next.js feedback review: ไม่มีปัญหา Framework ที่เข้าเกณฑ์รายงาน
