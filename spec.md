# Project state

## Task: Separate commits and push UAT (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

### Goal

แยกไฟล์ตามกลุ่มงานที่เสร็จแล้ว Commit และPushไปorigin/uatตามคำสั่งผู้ใช้

### Scope In

- 4กลุ่มCommitตามลำดับDependency: Homepage/categories/artwork/theme, Catalog/manifest/legacy retirement, Product navigation, Documentation
- รวมเฉพาะSource/Tests/Referenceและ2ภาพหน้าแรกที่ใช้งานจริง เก็บภาพทดลอง/ภาพโลโก้ที่ยังไม่ใช้ไว้Local
- ตรวจDiff/Formatting/Typecheck/Lint/UnitและสถานะRemote ก่อนStage/Commit/Pushตามรายการไฟล์ในPlan

### Scope Out

ไม่แก้ฟีเจอร์ ไม่รื้อCancellationงานOpening/Header logo ไม่รวมOutput/Secrets/Unused generated media ไม่Push main/Deploy/Force push

### UI/UX Brand Alignment

- Reference: งานที่อนุมัติและตรวจแล้วในTaskก่อนหน้า ไม่มีดีไซน์ใหม่ในงานGitนี้
- Design/Responsive: คงพฤติกรรมและผลตรวจเดิมทุกหน้า

### Input / Output

- Input: “แยกไไฟล์และคอมมิตพุท”
- Output: 4Commitsแยกกลุ่มพร้อมPush origin/uat และยืนยันRemote SHA
- Contract: ไม่มีApp/Data contractเปลี่ยนจากการจัดCommit

### Acceptance Criteria

- [x] จัดไฟล์4กลุ่มตรงManifest ไม่มีไฟล์ทดลอง/Secret/Cancelled codeปน
- [x] Formatting/Typecheck/Lint/Catalog+UAT unitผ่าน
- [ ] Pushแบบปกติไปorigin/uatและยืนยันRemote SHAตรงLocal (Receiptบันทึกในรายงานส่งมอบหลังPush)
- [x] บันทึกSource commit IDsและรายการไฟล์Localที่ไม่รวม

### Missing Information

ไม่มี BranchปัจจุบันคือuatและRemoteoriginตรวจจากGitแล้ว

### Approval Record

ผู้ใช้สั่งแยกไฟล์ Commit และPushโดยตรง ใช้uatที่กำลังทำงาน ไม่ถือว่าอนุมัติProduction release

### Current State

จัดกลุ่ม37Pathsเป็น4Commit groupsตามManifestแล้ว Source commitsคือ1e2243e(Home11ไฟล์),354538f(Catalog19ไฟล์),ffb6f7f(Navigation4ไฟล์) และกลุ่มDocumentation3ไฟล์ ครอบคลุมงานที่อนุมัติทั้งหมดโดยไม่รื้อCancellationของOpening/Header logo

Full formatting/Typecheck/Lintผ่าน Catalog unit60/60และUAT unit27/27ผ่านบนNode24 UATรอบแรก26/27เพราะAuditอ่านTracked deletionที่ยังไม่Stage หลังStageการลบตามCommitแล้วรันเต็ม27ผ่านโดยไม่แก้โค้ดใหม่ Browser evidenceจากTaskก่อนหน้าคงอยู่ งานGitนี้ไม่เปลี่ยนApp logic/ไม่Buildซ้ำ

เก็บUnused local media6ไฟล์นอกCommit:public/images/product-studio-20261104/5ไฟล์และpublic/videos/ChatGPT Image Nov 4, 2026, 02_14_56 PM.png ไม่มีApp references ไม่ลบไฟล์เหล่านี้ Raw patch/Untracked ZIP/Hashes/Groups/ผลตรวจอยู่output/commit-push-separated-20261104/ Push targetคือorigin/uatเท่านั้น การยืนยันRemote SHAและCommitเอกสารสุดท้ายบันทึกในdelivery.mdเมื่อส่งมอบ ไม่ทำProduction release Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

## Task: Remove parent category subtitles (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done — all five category subtitles removed and verified"

### Goal

ลบข้อความย่อยใต้ชื่อหมวดหลักทุกตัว เช่น “8 หมวดย่อย” ตามภาพ

### Scope In

ลบSubtitle spanทั้ง5ParentและCSSที่รองรับบรรทัดรอง จัดIcon/ชื่อให้อยู่กึ่งกลางแนวตั้งในปุ่มขนาดเดิม ปรับAssertionเดิมให้ตรวจข้อความเหลือชื่อหมวดเท่านั้น

### Scope Out

ไม่แก้ชื่อ/Icon/ขนาดปุ่ม/สี/การเลือก/Child controls/ข้อมูล/Mockรายสินค้า/Global styles/Routes

### UI/UX Brand Alignment

- Reference: ภาพ “8 หมวดย่อย” ล่าสุดและปุ่มหมวดจริงใน/products
- Design: เหลือIcon+ชื่อหมวด คงปุ่ม76px/Single row/สีเดิม
- Responsive: ชุดเดิม320/390/768/844/1440

### Input / Output

- Input: “ข้อความย่อยด้านล่างของแต่ละหมวดลบออกครับ”
- Output: ไม่มี “8 หมวดย่อย” หรือ “หมวดย่อยตัวอย่าง” ใต้ชื่อParent
- Contract: ไม่มีProps/State/Dataเปลี่ยน

### Acceptance Criteria

- [x] Parentทั้ง5ปุ่มมีเฉพาะIconและชื่อ ไม่มีข้อความรอง
- [x] ขนาด/Single row/Child scrolling/Selection/Functionalเดิมผ่านBrowser
- [x] Typecheck/Scoped Lint/Format/Diffผ่านและตรวจภาพจริง

### Missing Information

ไม่มี ผู้ใช้ระบุทุกหมวดและตำแหน่งข้อความชัดเจน

### Approval Record

คำสั่งล่าสุดอนุมัติลบข้อความรองใต้Parentทุกปุ่มตามภาพ รวมการจัดแนวเนื้อหาในพื้นที่เดิม

### Current State

ลบSubtitle spanทั้ง5ปุ่มและCSSบรรทัดรองแล้ว Icon/ชื่อCenteredแนวตั้งในปุ่ม76pxเดิม Chrome11/11ผ่านรวมTextเท่าชื่อหมวดเท่านั้นและResponsive5ขนาด/Child scrolling/Selection/Search/Sort/Compare ตรวจภาพDesktop1440/Mobile390แล้ว Typecheck/Scoped ESLint/Prettier/Whitespaceผ่าน ไม่มีData/Route/ชื่อหมวดเปลี่ยน หลักฐานZIP5ไฟล์/Browser/ภาพ/รายงานในoutput/remove-category-subtitles-20261104/ ไม่Build/Deploy Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

## Task: Supplied opening and navigation logos without glow (2026-11-04)

Status: "Ready to Code"
Approval: "Withdrawn — user asked to stop"
Progress: "Cancelled — application and test changes reverted"

### Cancellation Record

ผู้ใช้สั่ง “หยุดก่อนครับเอาส่วนเมื่อกี้ออกยังไม่ทำ” วันที่2026-11-04 จึงหยุดงานOpening/Header logoทั้งหมดและถอนการเปลี่ยนรอบนี้ ไม่ดำเนินต่อจนกว่าจะได้รับคำสั่งใหม่

### Current State / Verification

- คืนHeader,Hero,BrandOpening TSX/CSSและ2Test filesครบ6ไฟล์ตรงBytesก่อนงานตามbefore-files.zip/rollback-verification.json
- ลบเฉพาะ2ไฟล์UIใหม่brand-logo.tsxและbrand-logo.module.css ไม่มีImportเหลือ ไม่แก้ไฟล์PNGที่ผู้ใช้ให้
- ใช้Dev3000เดิม ไม่Restart/Commit/Deploy รักษาThemeหน้าแรกดำและงานเมนู/หมวด/การ์ดในChatอื่น ไม่คืนSpec/Planทั้งไฟล์
- เก็บCancelled codeในcancelled-work.zipเพื่อReviewโดยไม่ใส่ในApp source ผลทดสอบที่รันก่อนยกเลิกไม่ใช่ผลส่งมอบงานใหม่
- งานนี้ไม่อนุมัติให้ลงมือซ้ำอัตโนมัติ รอคำสั่งผู้ใช้ใหม่เท่านั้น Final Next feedbackไม่มีQualifying Framework Issueใหม่

## Task: Remove red product belt frames (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done — normal and hover frames removed and verified"

### Goal

เอากรอบสีแดงรอบรูปสินค้าในแถบเลื่อนหน้าแรกตามภาพออก

### Scope In

เปลี่ยนBorderสีแดงเป็นTransparentเพื่อคงขนาดรูป และลบเงาแดง/สีกรอบHoverเฉพาะ.category-feature-product คงHoverยกขึ้นและKeyboard focusเดิม

### Scope Out

ไม่แก้ภาพ/ขนาด/Link/หมวด/Animation/Background/Focus outline/Componentอื่น

### UI/UX Brand Alignment

- Reference: ภาพแถบรูปสินค้าบนพื้นดำล่าสุดและSelectorที่ใช้งานจริงในsrc/styles/category-feature.css
- Design: ไม่มีเส้นหรือเงาแดงรอบThumbnailในNormal/Hover คงขอบมนและพื้นที่เดิม
- Responsive: ตรวจDesktop1440/Mobile390และทั้ง4หมวด

### Input / Output

- Input: “เอากรอบสีแดงออกครับ” พร้อมภาพ
- Output: แถบรูปสินค้าไม่มีกรอบแดงในNormal/Hover
- Contract: CSSเฉพาะThumbnail ไม่มีProps/Dataเปลี่ยน

### Acceptance Criteria

- [x] Normal/Hoverไม่มีBorder/Shadowแดงทั้ง4หมวด
- [x] Thumbnail70px/ภาพ/Link/การเลื่อน/Keyboard focusเดิมคงอยู่ ไม่มีOverflow
- [x] Browserภาพจริง/Scoped regression/Format/WhitespaceและDiffผ่าน

### Missing Information

ไม่มี ภาพระบุกรอบThumbnailชัดเจน

### Approval Record

คำสั่งล่าสุดอนุมัติเอากรอบแดงของแถบสินค้าตามภาพออก รวมCSSในsrc/styles/category-feature.cssที่เป็นเจ้าของกรอบนั้น

### Current State

BorderThumbnailเป็นTransparentและลบShadowแดงNormal/Hoverแล้ว คง70x70/ขอบมน/Hoverยกขึ้น/Keyboard outlineเดิม Browser4หมวดที่1440/390รวม8กรณี Borderrgba0/Shadownoneทั้งNormal/Hover ภาพโหลด/Linkเดิมครบ Focus3px Solid ไม่มีOverflow/Page errors ตรวจภาพDesktop/Mobileแล้ว Scoped regression4/4ผ่านครอบคลุมAnimation/Hover pause/Keyboard/Moving links Desktop–Mobile Prettier/Whitespace/Diffผ่าน แก้เฉพาะ2Selectorใน1CSS หลักฐานoutput/remove-belt-border-20261104/ ไม่Build/Typecheck/DeployสำหรับCSS-only Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

## Task: Sync primary product navigation with catalog (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done — real category labels and selected destinations verified"

### Goal

ซิงค์รายการหลักในเมนูสินค้าตามภาพกับหมวดสินค้าจริง และให้ลิงก์เปิดหมวดที่เลือกใน `/products`

### Scope In

- ใช้ productCategoryDefinitions เป็นแหล่งชื่อ/ลำดับ/IDของ5หมวด รายการแรก “ผลิตภัณฑ์ทั้งหมด” ตรงหัวข้อหน้า /products
- ลิงก์หมวดใช้ /products?category=<IDจริง> แทนLegacy URLsที่Redirectไปสินค้ารวม
- SyncเฉพาะPrimary linksและsubmenuLabelของเมนู/products รวมSaved navigationปัจจุบันในRuntime ไม่แก้DB/คอลัมน์คู่มือ/เมนูอื่น
- Catalogอ่านcategoryผ่านตัวSyncขนาดเล็กใต้Suspense แยกจากSSRของรายการสินค้า Validationเฉพาะ5ID ค่าไม่รู้จักใช้All
- ปุ่มParentในCatalogอัปเดตQueryด้วยHistory replaceStateโดยไม่Reload เพื่อให้Nav/Refresh/Backตรงกับหมวดจริง ไม่เพิ่มHistoryทุกการกดปุ่มกรอง

### Scope Out

ไม่แก้Header markup/Shared styles/ดีไซน์/หมวดย่อย/ข้อมูลสินค้า/ตัวจัดMembership/เมนูคอลัมน์อื่น/Database/Deploy

### UI/UX Brand Alignment

- Reference: ภาพPrimary product submenuและ5หมวดจริงในCatalog
- Design: โครง/สี/ขนาด/การเปิดปิดเมนูเดิม เปลี่ยนชื่อให้ตรง “เครื่องชั่ง”, “อินดิเคเตอร์แท่นชั่ง”, “โครงสร้างแท่นชั่ง”, “ระบบ POS”, “อุปกรณ์เสริม”
- Responsive: Desktop1440/Mobile390และCatalog320/390/768/844/1440จากชุดเดิม

### Input / Output

- Input: “ซิงค์หมวดหมู่ nav ส่วนนี้จากรูปที่แนบ และปรับข้อความให้ตรงกับหมวดหมู่สินค้าจริง”
- Output: Nav6รายการตรงชื่อจริง คลิกแต่ละหมวดแล้วSelected/หัวข้อ/รายการสินค้าตรงกันทั้งจากหน้าอื่นและในหน้า/products
- Contract: URL categoryยอมรับ5IDจากDefinitions ค่าอื่น/ไม่มีค่าเป็นAll; การกรองเลือกหมวดต้องใช้JavaScriptตามCatalogเดิม SSRของรายการรวมยังอยู่ครบ

### Acceptance Criteria

- [x] ชื่อ/ลำดับ/Query linksตรงDefinitions และSaved primary navถูกSyncโดยไม่Mutateข้อมูลเดิม
- [x] Desktop/Mobileคลิกครบ5หมวดและAllได้ Selected/Headingตรง URL รวมSame-page/Refresh/Back/Invalid ID
- [x] Catalog/หมวดย่อย/Search/CompareเดิมและNo-JSสินค้ารวมยังผ่านRegression
- [x] Unit/Typecheck/Scoped Lint/Format/Browserและภาพจริงผ่าน

### Missing Information

ไม่มี ใช้ชื่อหมวดหลักและMembershipจริงที่มีอยู่

### Approval Record

คำสั่งล่าสุดอนุมัติSyncPrimary navตามภาพกับหมวดจริง รวมชื่อและการไปหมวดที่ตรงกัน ใช้ข้อมูลจริงจากDefinitions ไม่เปลี่ยนเมนูส่วนอื่น

### Current State

Primary navใช้ชื่อ/ลำดับ5หมวดจากDefinitionsและลิงก์/products?category=IDจริงแล้ว รายการAll/คำเกริ่นใช้ “ผลิตภัณฑ์ทั้งหมด” Saved navซิงค์เฉพาะPrimary links/submenuLabelโดยไม่แก้DBหรือGroupsอื่น CatalogรับQueryผ่านตัวSyncใต้Suspenseและปุ่มParentอัปเดตURLด้วยHistory replaceState คงSSRของรายการรวม

Unit60/60และChrome21/21ผ่าน รวมDesktop1440/Mobile390คลิกAll+5หมวด Direct/Refresh/Local change/Same-page/Back/Invalid IDและNo-JSรายการรวม ชุดCatalogเดิม11รายการยังผ่านครบรวมแถบหมวดย่อยเลื่อน Typecheck/Scoped ESLint/Prettier/Whitespaceผ่าน ภาพเมนูDesktop/MobileและSelected categoryตรวจแล้ว Scope auditเปลี่ยน2ไฟล์แอป+3TestตามPlan ไม่แก้Header markup/Styles/DefinitionsและประวัติDocsเดิมคงอยู่

รอบBrowserแรกหยุดหลังพบSelectorทดสอบหาulแต่Markupจริงเป็นdiv แก้เฉพาะHarnessแล้วรันครบ21ผ่าน เก็บArtifactsรอบเดิมไว้ หลักฐานoutput/sync-product-nav-20261104/ ZIP7ไฟล์ ไม่Production Build/Full E2E/Database/Deploy Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

## Task: Single-row scrollable catalog subcategories (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done — one row, arrow scrolling and keyboard behavior verified"

### Goal

หมวดย่อยใน `/products` เรียงแนวนอนแถวเดียว ห้ามWrap และกดปุ่มเลื่อนดูหมวดที่เกินพื้นที่ได้ตามภาพผู้ใช้

### Scope In

- Trackหมวดย่อยSingle row/nowrap/overflow-xเฉพาะTrack พร้อมปุ่มลูกศรซ้าย–ขวาเมื่อเลือกParentที่มีChild
- ใช้RefและscrollByในEventเท่านั้น ไม่เพิ่มEffect/Stateใหม่ รองรับReduced motion และResetตำแหน่งTrackเมื่อเปลี่ยนParentด้วยKey
- รักษาGroup/ปุ่มAll/ชื่อ/aria-pressedและการเลือกเดิม ปุ่มลูกศรอยู่นอกGroupหมวดย่อย

### Scope Out

ไม่แก้Parent row/การ์ดสินค้า/ข้อมูล/หมวด/Route/Shared styles/Dependencies/Database/Deploy

### UI/UX Brand Alignment

- Reference: ภาพหมวดย่อยIndicatorและScalesล่าสุด ปุ่ม/สี/FocusตามCSSเดิม
- Design: ชื่อหมวดย่อยบรรทัดเดียว ใช้ลูกศรLucideเดิมและTouch target44px Trackยืดหดในพื้นที่คงเหลือ
- Responsive: 320/390/768/844/1440 ต้องมีChildเพียงแถวเดียว ไม่มีDocument overflow จอเล็กวางTrackใต้HeadingตามPatternเดิม

### Input / Output

- Input: “หมวดย่อยให้เรียงไปข้างๆเลยครับห้ามล้นไปแถวอื่นให้กดเลื่อนเอา”
- Output: หมวดย่อยไม่ขึ้นแถวใหม่ ลูกศรกดเลื่อนได้ทั้ง2ทิศ มือถือปัดและKeyboardไปหมวดท้ายได้
- Contract: ไม่มีData/Propsเปลี่ยน การเลื่อนเป็นUI-only ไม่เปลี่ยนFilterจนกดเลือกหมวด

### Acceptance Criteria

- [x] ทุกขนาดChild9ปุ่มของScalesอยู่แถวเดียว ชื่อnowrapและDocumentไม่Overflow
- [x] ลูกศรขวาเลื่อนไปข้างหน้า ซ้ายเลื่อนกลับ และไม่เปลี่ยนSelectedเอง
- [x] Keyboardเข้าถึงChildท้ายและเลือกได้ เปลี่ยนParentเริ่มTrackใหม่ Reduced motionใช้Scrollทันที
- [x] ชุดBrowserเดิม11รายการ Typecheck/Scoped Lint/Formatและภาพจริงผ่าน

### Missing Information

ไม่มี ผู้ใช้ระบุการไม่Wrapและกดเลื่อนชัดเจน

### Approval Record

คำสั่งล่าสุดอนุมัติแถบหมวดย่อยแถวเดียวและปุ่มเลื่อนตามภาพ รวมResponsiveที่เกี่ยวข้อง

### Current State

หมวดย่อยเป็นTrackแถวเดียวแล้ว มีลูกศร44pxเลื่อน80%ของพื้นที่Trackต่อครั้ง เลื่อนแบบSmoothและInstantเมื่อReduced motion เปลี่ยนParentสร้างTrackใหม่เริ่มที่ซ้ายสุด โดยไม่เพิ่มEffect/Stateใหม่ Groupและการเลือกเดิมคงอยู่

Chrome11/11ผ่าน ตรวจ320/390/768/844/1440 Child9ปุ่มYเดียวกัน/nowrap/ไม่มีDocument overflow ลูกศรทั้ง2ทิศไม่เปลี่ยนSelected Keyboard8TabsถึงChildท้ายและEnterเลือกได้ Parent resetและReduced motionผ่าน ภาพ320/390/768/1440ตรวจแล้ว Typecheck/Scoped ESLint/Prettier/Whitespaceผ่าน งานนี้เปลี่ยน2ไฟล์แอป+1Test โดยAuditแยกการเปลี่ยนhome-page.module.cssจากงานหน้าแรกที่ดำเนินพร้อมกันและรักษาไว้ ประวัติDocsเดิมตรวจโดยแยกTaskหน้าแรกที่มีการอัปเดตคู่ขนาน หลักฐานoutput/single-row-subcategories-20261104/ ไม่Build/Deploy Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

## Task: Remove catalog explanatory notice (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done — notice removed and browser regressions verified"

### Goal

นำข้อความแจ้งเหนือแถบหมวดหลักตามภาพออกจาก `/products`

### Scope In

ลบParagraphแจ้งและข้อความสลับตามParentที่ตำแหน่งเดียวกัน พร้อมCSSเฉพาะnoticeที่ไม่มีผู้ใช้แล้ว ปรับAssertionเดิมให้ตรวจว่าไม่มีข้อความนี้

### Scope Out

ไม่แก้ป้ายMockรายสินค้า ข้อมูล หมวด ตัวกรอง สี ขนาดปุ่ม Global styles หรือRoutes

### UI/UX Brand Alignment

- Reference: ภาพข้อความ “จัดหมวดตามรายการรุ่นที่ยืนยัน รุ่นที่ยังไม่มีข้อมูลแสดงเป็น Mock” ล่าสุด
- Design: ใช้แถบหมวดเดิมหลังลบParagraph ไม่มีข้อความทดแทน
- Responsive: ตรวจBrowserเดิม320/390/768/844/1440

### Input / Output

- Input: “ข้อความนี้เอาออก” พร้อมภาพ
- Output: ไม่มีข้อความแจ้งเหนือแถบหมวดทุกParent; ป้ายMockบนสินค้าเดิมยังอยู่
- Contract: ไม่มีProps/State/Dataเปลี่ยน

### Acceptance Criteria

- [x] ไม่มีParagraphแจ้งและข้อความทั้ง3สถานะในตำแหน่งเดิม
- [x] Parent/Child/Mock/Search/Compare/Responsiveเดิมผ่านBrowser regression
- [x] Typecheck/Scoped Lint/FormatและตรวจSource diffผ่าน

### Missing Information

ไม่มี ภาพระบุข้อความและตำแหน่งชัดเจน

### Approval Record

คำสั่งล่าสุด “ข้อความนี้เอาออก” อนุมัติลบข้อความแจ้งในตำแหน่งที่ระบุและช่องว่างของParagraphนั้น

### Current State

ลบParagraphแจ้งเหนือหมวดทุกสถานะและ.notice CSSแล้ว ป้ายMockรายสินค้า/ข้อมูล/การเลือกเดิมคงอยู่ Chrome Regression11/11ผ่าน รวมParent5/Child8/Mock/Search/CompareและResponsive5ขนาด ตรวจภาพMobileไม่มีข้อความแล้ว Typecheck/Scoped ESLint/Format/Whitespaceผ่าน DiffเทียบBackupตรงเฉพาะParagraph/StyleและAssertion หลักฐานoutput/remove-catalog-notice-20261104/ ไม่Build/Deploy Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

## Task: Refined black background across homepage (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done — all homepage surfaces black with responsive and route checks"

### Goal

ปรับหน้าแรกทั้งหมดเป็นพื้นหลังดำเรียบหรูตามคำสั่งและภาพBrand Story ล่าสุด ให้ทุกSectionต่อเนื่องบนดำ ใช้ขาว/เทาอ่อนให้อ่านง่ายและสีแดงSUNFORDเป็นAccent

### Scope In

- Mainหน้าแรกใช้Page CSS Moduleเป็นTheme hook:พื้นดำ#000,ตัวอักษร#f5f5f7,ข้อความรอง#a1a1a6,เส้น#2a2a2a คงFont/Layout/ระยะ/Media/Interactions
- BrandStoryและStories CSS Modulesใช้เฉพาะหน้าแรก เปลี่ยนBackgroundชมพู/ขาวและCardsเป็นBlack/Charcoal ปรับตัวหนังสือ/เส้น/ป้าย/ไอคอนอ่านชัด ตัดPink decorative ring
- Page moduleScope Footerผ่านSibling selectorเฉพาะเมื่อMainหน้าแรกอยู่ เปลี่ยนFooter gray/red backgroundsเป็นBlack เส้นแบ่งเทา ปรับText/Links/Icon surfaces และซ่อนเฉพาะFooter sceneที่เป็นภาพพื้นหลังตกแต่ง ไม่แก้Footer component/Shared styles
- Hero/วิดีโอ/สินค้า/หมวดเดิมคงอยู่ Hero fallbackดำแทน#111 กรอบProduct beltเป็นCharcoal Headingวิดีโอขาว Headerใช้Surface samplerเดิมตรวจดำจริง ไม่แตะHeader logic

### Scope Out

ไม่เปลี่ยนเนื้อหา/ภาพ/วิดีโอ/ลิงก์/การจัดหมวด/จำนวน/ขนาดCard/แอนิเมชัน/Modal overlays/หน้าอื่น/Data/Dependencies/Database/Deployment ไม่ReviveHomepage catalogที่ปิดอยู่หรือHero3Dที่Retireแล้ว

### UI/UX Brand Alignment

- Reference: ภาพที่ผู้ใช้ให้ เน้นStory Section และคำสั่ง “ปรับหน้าแรกให้เป็นพื้นหลังดำเรียบหรูทั้งหมด”; Brandดำ/แดง/ขาวที่มีอยู่ในHeroและCategoryFeature
- Design: Base#000,Card#111,Text#f5f5f7,Muted#a1a1a6,Border#2a2a2a,Redเดิม ขจัดLarge pale surfaces/ชมพูไล่สี คงActual photo/video pixels
- Responsive:320/390/768/1440 ตรวจทุกSection/Story/Stories/Video/Footer คอนทราสต์ข้อความหลัก/รอง OverflowและHeader tone

### Input / Output

- Input: คำสั่งและภาพล่าสุด SourceComponents/CSSที่ใช้งานจริง
- Output: หน้าแรกดำต่อเนื่องตั้งแต่HeroถึงFooter Cardรองเข้มและข้อความชัด Footerของ/productsหรือ/contact-usยังStyleเดิม
- Contract: Home mainเพิ่มLocal classจากhome-page.module.css; selectorsที่มีผลFooter/Parentต้องมีLocal page classอยู่ ไม่เพิ่มJS/state/global theme providerและไม่เปลี่ยนHTML/data contracts

### Acceptance Criteria

- [x] ทุกHomepage SectionและFooter major surfaceเป็นดำ ไม่มีPink/White section backgroundที่สร้างจากCSS
- [x] Brand Story/Stories/Card overlays/Footerอ่านข้อความชัด รูป/เนื้อหา/Links/Interactionเดิมครบ
- [x] Header toneเป็นDarkเมื่อScrollSectionดำ และหน้า/productsกลับStyleเดิมเมื่อออกจากหน้าแรก ไม่มีTheme leak
- [x] Responsive4ขนาด ไม่มีOverflow ตรวจภาพจริงและContrastข้อความหลัก/รองบนDark surfaces
- [x] Typecheck/Scoped Lint/Format/Active homepage Browser36กรณี/Scope auditผ่าน พร้อมBackup/ผลจริงและรักษางานอื่น; ข้อจำกัดMap5กรณีที่CMSปิดบันทึกแยก

### Missing Information

ไม่มี ผู้ใช้กำหนดหน้าแรกทั้งหมดและโทนBlackเรียบหรูชัดเจน ไม่ตีความให้แก้หน้ารายละเอียดหรือMediaต้นฉบับ

### Approval Record

คำสั่งล่าสุด “ปรับหน้าแรกให้เป็นพื้นหลังดำเรียบหรูทั้งหมด” อนุมัติปรับThemeทั้งHomeรวมFooterเฉพาะHomeและสีตัวหนังสือที่จำเป็น ขอบเขตนี้ไม่แตะShared Header/Footer sourceหรือGlobal stylesheet

### Current State

เปลี่ยนMain/ทุกSection/Footer major surfacesเป็น#000ครบแล้ว BrandStory/Stories cardsเป็นCharcoal ข้อความขาว/เทาAccentแดง ตัดPink decorative ringและFooter backdrop sceneเฉพาะHome คงDOMเนื้อหา/Headings/Link/Image URLsตรงBaselineทุกตัว ไม่แตะMedia pixels/ข้อมูล/แอนิเมชัน

ตรวจ320/390/768/1440ทุกSectionไม่มีOverflow Header toneDarkบนStory ตรวจภาพStory/Stories/FooterDesktop/Mobileแล้ว Contrast86ตัวอย่างข้อความหลัก/รองขั้นต่ำ5.17:1 โหมดProductsRouteเมื่อออกจากHomeยังมีBackground/Color/Header/FooterตรงBaselineและกลับHomeยังดำ

จำกัดสีThemeบนSurfaceโดยไม่Override --ink/--muted/--lineที่สืบทอดเข้าLight Dialog และจำกัดVideo heading selectorเฉพาะSection heading ตรวจVideo Modalเปิดด้วยKeyboard/ปิดได้ สีพื้นWhiteกับText/Headingrgb(29,29,31)เดิมครบ

Typecheck/Scoped ESLint/Prettier/Whitespaceผ่าน ชุดActive Homepage Regression6ไฟล์36/36ผ่าน ไม่มีFlaky/Skipped รอบรวมแรก41กรณีผ่าน36และFail5เฉพาะCustomerMapเพราะCMSปัจจุบันแสดงFooter coverageเป็นDIVไม่มีปุ่มเปิดตามเงื่อนไขenabled=false เก็บFailureเดิม ไม่เปิดMap/เปลี่ยนDataเพื่อให้Testผ่าน ไม่อ้างAll41ผ่านหรือยืนยันMap flow

Own app4ไฟล์ตามPlan Source auditพบProductCategoryMock TSX/CSSเปลี่ยนคู่ขนานในงานอื่นจึงรักษาไว้ ไม่ทับหรืออ้างเป็นงานThemeนี้ BackupZIP5ไฟล์ก่อนแก้และหลักฐานoutput/homepage-black-20261104/delivery.md/summary.json/ผลจริง/ภาพ Screenshotsสุดท้ายซ่อนเฉพาะDev portalด้วยCapture option ไม่แก้UIแอป

ใช้Dev3000เดิม ไม่Restart/Production Build/Full E2E/Database/Commit/Deploy Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

## Task: Compact single-row catalog categories (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done — compact row and responsive keyboard scrolling verified"

### Goal

ย่อปุ่มหมวดหลักทั้ง5ใน `/products` และจัดแถวเดียวเพื่อลดพื้นที่แนวตั้งตามภาพผู้ใช้

### Scope In

- เปลี่ยนเฉพาะCSSของParent navigation เป็น5คอลัมน์แถวเดียว ปุ่มสูง76px ไอคอน24px ชื่อ14px ข้อความรอง11px ไอคอนซ้าย/ข้อความขวา
- Desktopแสดงครบ5ปุ่มเมื่อพื้นที่พอ จอแคบเลื่อนแนวนอนในแถวเดิม ปุ่มขั้นต่ำ190pxเพื่ออ่านชื่อครบและกดง่าย
- ปรับResponsive assertionsเดิมให้ตรวจSingle row/Compact height/Keyboard scroll แทนGrid2–4คอลัมน์

### Scope Out

ไม่เปลี่ยนข้อความ/ไอคอนต้นฉบับ/สี/หมวด/ข้อมูล/การ์ดสินค้า/ตัวกรอง/Global styles/Routes/Dependencies/Database/Deploy

### UI/UX Brand Alignment

- Reference: ภาพหมวดหลัก5ปุ่มล่าสุดและComponent/Brand tokensเดิมใน src/styles/base.css
- Design: เก็บสีขาว/เส้นขอบ/Selectedสีแดง/Focusเดิม ลดขนาดและระยะห่างเฉพาะหมวดหลัก
- Responsive: 320/390/768/844/1440; ทุกปุ่มอยู่แถวเดียว ไม่มีDocument overflow จอเล็กเลื่อนและใช้Keyboardไปปุ่มท้ายได้

### Input / Output

- Input: “ปรับให้เล็กลงและอยู่ในแถวเดียวกันจะได้ไม่กินพื้นที่เยอะ” พร้อมภาพหมวดหลัก
- Output: แถบหมวดหลักเตี้ยลง แสดงครบ5ปุ่มในDesktopและเลื่อนแถวเดียวในMobile/Tablet
- Contract: CSS-only ไม่มีState/Props/Data contractเปลี่ยน ปุ่มaria-pressed/aria-controlsและการเลือกเดิมคงอยู่

### Acceptance Criteria

- [x] 5ปุ่มมีตำแหน่งYเดียวกัน สูงไม่เกิน80px ไอคอน24px ชื่อครบไม่ถูกตัด
- [x] Desktop1440แสดงครบโดยไม่เลื่อน Mobile/Tabletเลื่อนได้เฉพาะแถบ ไม่มีDocument overflow และKeyboardไปปุ่มท้ายได้
- [x] เลือกParent/Child/Search/Sort/Compare/Grid/Listเดิมยังผ่านBrowser regression
- [x] Scoped Format/Lint/TypecheckและภาพDesktop/Mobile/Tabletตรวจผ่าน จำกัด1ไฟล์แอปและ1ไฟล์ทดสอบ

### Missing Information

ไม่มี ใช้การเลื่อนแนวนอนเป็นResponsiveของแถวเดียวโดยรักษาชื่อครบตามComponentเดิม

### Approval Record

คำสั่งล่าสุดอนุมัติย่อหมวดหลักและจัดแถวเดียวตามภาพ ขอบเขตCSSเฉพาะแถบหมวดและResponsiveที่เกี่ยวข้องครอบคลุมคำขอนี้

### Current State

Parent navigationเป็นแถวเดียว5ปุ่มแล้ว สูง76px ไอคอน24px ชื่อ14px/ข้อความรอง11px Desktop1440แสดงครบ จอ320/390/768/844เลื่อนเฉพาะแถบ ชื่อเต็มอ่านได้เมื่อเลื่อนถึงปุ่ม Keyboard Tabไปหมวดท้ายและกลับได้ Outlineไม่ถูกตัด

Chromeชุดเดิม11/11ผ่าน รวมFunctional5Parent/8Child/Search/Sort/CompareและResponsive5ขนาด ตรวจภาพจริง320/390/768/1440แล้ว ไม่มีDocument overflow/Page errors TypecheckและScoped ESLint/CSS+Test Prettierผ่าน Source auditเปลี่ยนเฉพาะ1CSS+1Testของงานนี้ งานหน้าแรกสีดำที่เริ่มพร้อมกันอยู่นอกขอบเขตและคงไว้

หลักฐานBackup4ไฟล์/Source hashes/Scope audit/ภาพ/รายงานอยู่ output/compact-categories-20261104/ ใช้Dev3000เดิม ไม่Restart/Production Build/Full E2E/Deploy Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

## Task: Short product card model names (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done — verified short model names and factual accessory labels"

### Goal

ย่อชื่อการ์ด/productsที่เป็นชื่อโฆษณา/คำบรรยายให้เหลือรุ่นจริง เช่นRLS1100/C1/FEH5KSตามภาพ รุ่นไม่มีรหัสใช้ชื่อสั้นพร้อมขนาด/แพ็กตามคำตอบล่าสุด

### Scope In

- เพิ่มCard name helperใช้Source ID/ชื่อ/รายละเอียดที่ตรวจจากSnapshot กำหนดExplicit labelsไม่เดาจากความจุหรือรหัสฐานข้อมูลตัวเลข ไม่จับรหัสคล้ายกันแทน
- 9Legacy Scaleชื่อยาวใช้รหัสSourceจริง C1-Precision-Balanceใช้C1 ตัดSUNFORD/Indicator/Platform/RAMP prefixออกจากชื่อรุ่นที่มีอยู่
- อุปกรณ์/วัสดุไม่มีรหัสใช้ชื่อสั้นและคงขนาด/Pack/กันน้ำที่จำแนกสินค้า Legacyที่มีหลายPackไม่เลือกPackใดเอง ScannerมีสายSource detailsปนรหัสWirelessจึงใช้ชื่อสั้นมีสายตามชื่อสินค้า ไม่เดารหัสใหม่
- Routeสร้างcardNames keyed by real Product IDจากSource IDฝั่งServer ส่งเฉพาะLabelให้Browserไม่ส่งRaw Source ใหม่ UIใช้LabelในAll/Parent/Child/Sort พร้อมSearchทั้งชื่อสั้นและชื่อเต็ม
- Membership8ChildยังตามManifest100% แยกDisplay labelจากDocument model:VB3000S HiCoFE→VB3000S,Fitdays Smart Scale - FD1000→FD1000 รุ่นอื่น/Mockคงรหัสตรงเดิม

### Scope Out

ไม่แก้Database/ชื่อจริง/Slug/รูป/รายละเอียด/Manifest membership/Shared Card/Header Search/หน้าอื่น/Styles/Dependencies/Deploy

### UI/UX Brand Alignment

- Reference: ภาพล่าสุดและsource products.json+Manifestที่ผู้ใช้ให้
- Design: รูปเดิม ชื่อกึ่งกลางเดิม ใช้เฉพาะLabelสั้น ไม่เพิ่มป้าย/คำบรรยายกลับ
- Responsive:320/390/768/1440 Grid/List ตรวจชื่อWrapและOverflow

### Input / Output

- Input: “แก้ไขตัวไหนที่มีชื่อยาวๆให้แก้เป็น ใช้แค่ชื่อรุ่นก็พอครับ” และคำตอบ “ใช้ชื่อสั้นพร้อมขนาด/แพ็ก” สำหรับรายการไม่มีรหัส
- Output: ทั้ง150Real cardsใช้Labelสั้นที่มีหลักฐาน Mock18ไม่ถูกเปลี่ยนเป็นสินค้าจริง
- Contract: ProductCategoryMock.cardNames:Record<string,string> keyed by Product IDเป็นDisplay-only; Sortใช้Displayed label Searchยังชื่อ/Subtitle/Descriptionเดิม URL/Compare IDคงอยู่ Catalog DTOไม่เปลี่ยน

### Acceptance Criteria

- [x] ชื่อยาวตามภาพทุกตัวเหลือรหัสจริง รวมTSS-150-SW31S/CSS-150-SW31/TMS-30-AC31S/ACS-30-JC21/RLS1100/C1/FEH5KS
- [x] Consumablesสั้นพร้อมขนาด/แพ็กที่ยืนยัน ไม่เอาNumeric Source ID/ความจุ/มาตรฐานเป็นModel ไม่รวมรายการซ้ำหรือแก้Suffix
- [x] All/5Parent/8Child/Search/Sort/Compareเดิมผ่าน Label aliases2ชื่อเปลี่ยนอย่างชัดเจนโดยMembershipคงเดิม
- [x] ตรวจResponsive/ภาพจริง Typecheck/Scoped Lint/Catalog Browser/Format/ScopeและประวัติDocsผ่าน

### Missing Information

ไม่มี ผู้ใช้ยืนยันหลักเกณฑ์ไม่มีรหัสแล้ว รหัสที่ข้อมูลปนกันใช้ชื่อสั้นตามข้อมูลที่ยืนยัน ไม่แต่งรหัส

### Approval Record

คำขอล่าสุดอนุมัติชื่อรุ่นสั้นบนการ์ด และคำตอบ “ใช้ชื่อสั้นพร้อมขนาด/แพ็ก” อนุมัติFallbackสำหรับสินค้าที่ไม่มีรหัส การเปลี่ยนนี้เป็นPresentationเฉพาะ/products

### Current State

ใช้Card name helper/Server mapping/UI displayแล้ว ย่อ83จาก150รายการที่ชื่อมีPrefix/รายละเอียด ชื่อยาวตามภาพทุกตัวเป็นรหัสตรงSource เช่นTSS-150-SW31S/CSS-150-SW31/TMS-30-AC31S/RLS1100/C1/FEH5KS ไม่มีการเปลี่ยนSuffix/รหัส/Slugจริง Consumablesใช้ขนาด/Pack/กันน้ำที่ยืนยันตามคำตอบผู้ใช้ ชื่อยาวสุด31ตัวอักษร ไม่แต่งModelให้รายการไม่มีรหัส

Browserตรวจ150Real cardsตรงName auditและURLเดิมครบ Searchชื่อเต็มยังพบรุ่นสั้น Grid/List320/390/768/1440ทั้ง8กรณีชื่อCentered ไม่มีClipping/Overflow ตรวจภาพDesktop/Mobile/Consumablesแล้ว MockVL15000Sเดิมยังอยู่ Membership8ChildเดิมและMock18ไม่เปลี่ยน ย่อเฉพาะDisplay aliases2ชื่อเป็นVB3000S/FD1000

Catalog Unit58/58ผ่าน Scoped Browser11/11ผ่านทั้งรอบแรกและรอบสุดท้าย ไม่มีFlaky/Skipped Typecheck/Scoped ESLint/Prettier/Whitespaceผ่าน มีงานConcurrent legacy cleanupแก้Catch-all/ProductCatalogและลบLegacy Browser/Bannerพร้อมปรับRoute regression ระหว่างงาน จึงรักษาการเปลี่ยนนั้น ไม่อ้างว่าเป็นงานตั้งชื่อรอบนี้ /Indicatorขณะนี้Redirect/productsตามงานนั้น

Exploratory captureแรกClipอยู่นอกViewportของGridยาว เปลี่ยนวิธีเป็นViewport captureแล้วPrimary checksครบ มีAssertionตรวจCardเก่าที่ล้าสมัยเพราะConcurrent redirectจึงTimeoutและเก็บFailureไว้ ยืนยันRedirectจริงด้วยHeading level1หลังแก้Locatorที่เดิมตรง2Heading ไม่แก้แอปเพราะปัญหาHarnessเหล่านี้

หลักฐานoutput/short-card-names-20261104/delivery.md, summary.json, name-audit.json, presentation.json, final-regression.json, catalog-unit.log, scope-audit.jsonและภาพ ใช้Dev3000เดิม ไม่Restart/Production Build/Full E2E/Database/Commit/Deploy Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

## Task: Remove unused legacy catalog structure (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done — old category structure removed and redirects verified"

### Goal

ลบโครงส่วนที่ไม่ได้ใช้ตามภาพหน้า `/Product/Digital-weighing` ที่ผู้ใช้ส่งมา

### Scope In

- หมวดสินค้าเดิมที่ไม่ใช่ CMS-managed และตรวจพบด้วย getProductSection รวม Product/Indicator/Collections เปลี่ยนไป `/products` ฝั่ง Server โดยไม่ Render โครงเก่า
- ลบ ProductBrowser และ CategoryBanner พร้อมทางเรียกเดิมใน Catch-all และ ProductCatalog; เก็บ product-browser.module.css ที่การ์ดหน้าใหม่ยังใช้
- ปรับ Regression ที่ตรวจ URL/โครงเก่าให้ตรงพฤติกรรมใหม่

### Scope Out

ไม่ลบข้อมูลสินค้า รูปภาพ หรือ Resolver ที่ `/products` ใช้ ไม่เปลี่ยนดีไซน์หน้าใหม่ Header/Global styles, Product detail, CMS-managed pages, Database หรือ Deploy

### UI/UX Brand Alignment

- Reference: ภาพหน้าจอ `/Product/Digital-weighing` จากผู้ใช้
- Design: ใช้หน้า `/products` ปัจจุบันแทน Sidebar/Banner/Toolbar หน้าเก่า
- Responsive: ตรวจหน้าเป้าหมายและ Redirect ที่ 390/768/1440 พร้อม Screenshot และไม่มี Overflow

### Input / Output

- Input: “ลบโครงส่วนนี้ออกให้หน่อยครับไม่ได้ใช้แล้ว” พร้อมภาพหน้าเก่า
- Output: URL หมวดเดิมไป `/products` แสดงหน้าใหม่ ข้อมูล/หมวด/รุ่นและลิงก์สินค้าเดิมยังอยู่
- Contract: getProductSection ใช้ระบุหน้าหมวดเดิม; redirect('/products') ก่อนดึงข้อมูลเพื่อ Render หมวดเก่า ไม่เปลี่ยน getCatalogPage ที่หน้าใหม่ยังใช้

### Acceptance Criteria

- [x] ผู้ใช้ยืนยันเลิกใช้โครงหน้าหมวดเก่าทั้งหมดและใช้ `/products` แทน
- [x] URL หมวด/Collection เดิมไปหน้าใหม่ และไม่มี ProductBrowser/CategoryBanner consumer เหลือ
- [x] หน้าใหม่ 5 หมวด/8 หมวดย่อย/ค้นหา/Compare/Responsive และ Product detail ยังผ่าน Regression
- [x] Typecheck, Scoped Lint/Format, Catalog unit และ Browser ผ่านตาม Plan พร้อมหลักฐาน

### Missing Information

ไม่มี ผู้ใช้ยืนยันขอบเขตและปลายทางแล้ว

### Approval Record

ผู้ใช้ตอบ “ลบโครงหน้าหมวดสินค้าเก่าทั้งหมด แล้วใช้ /products แทน” อนุมัติเลิกใช้โครงเก่าทุกหมวดและย้ายไปหน้าใหม่ รวมทางเรียกและ Regression ที่เกี่ยวข้องตาม Plan นี้

### Current State

ลบ ProductBrowser/CategoryBanner และ CSS ของ Banner แล้ว Catch-all Redirect หมวดที่ไม่ใช่ CMS-managed ไป `/products` ก่อน Render โครงเก่า ถอดทางเรียกจาก ProductCatalog เก็บ Shared card CSS, Data resolver, Manifest และรูปเดิมครบ

ตรวจครบ158 Source category/Collection เป็น307ไป `/products` Chrome Regression26/26ผ่าน รวม No JS, Responsive390/768/1440, หน้าใหม่5Parent/8Child/Search/Sort/Compare/Grid/List, Menu และ26หน้ารายละเอียด Platform/POSพร้อมGallery Catalog unit58/58, Typecheck/Scoped Lint/Format/Whitespaceผ่าน ตรวจภาพจริงทั้ง3ขนาดแล้ว

เพิ่ม output ใน tsconfig.exclude หลังพบไฟล์สำรองเก่าถูกCompileโดยRecursive include ไม่แก้หรือลบหลักฐานเก่า บันทึกบทเรียนในMEMORY หลักฐาน/ZIP14ไฟล์และรายงานอยู่ output/legacy-catalog-removal-20261104/ Source auditจำกัดตามPlanและประวัติDocsเดิมคงอยู่

รอบแรก Browser tests24รายการเริ่มไม่ได้เพราะไม่มีBundled Chromium จึงใช้Installed Chromeตรวจครบผ่าน ไม่Restart Dev3000 ไม่ทำProduction Build/Full E2E/Commit/Deploy Final Next feedback reviewไม่พบQualifying Framework Issueใหม่

## Task: Center model-only product card copy (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done — model-only cards and responsive behavior verified"

### Goal

หน้า/productsแสดงข้อความการ์ดสินค้าแต่ละตัวเฉพาะชื่อรุ่น จัดกึ่งกลางใต้รูป ตามภาพและคำสั่งล่าสุด

### Scope In

- คงรูป/Link/Compare ชื่อรุ่นเดิม แสดงชื่อรุ่นกึ่งกลาง นำBrand/SUNFORDที่เป็นข้อความUI,Subtitle,Capacity/Category/Badge tagsออกจากการแสดงผลการ์ดในหน้านี้ทั้งGrid/List
- CatalogProductCardเพิ่มmodelOnlyแบบOpt-in defaultfalse คงหน้าที่ใช้Cardเดิมนอก/products ไม่แก้Shared stylesheet; CSSเฉพาะProductCategoryMockจัดกึ่งกลางและให้ชื่อยาวWrapครบ
- Mock cardเหลือชื่อรุ่นกึ่งกลางใต้Placeholder เอาคำบรรยายออก ย้ายMock badgeเป็นOverlayในพื้นที่Placeholderเพื่อไม่สับสนกับสินค้าจริง

### Scope Out

ไม่แก้ภาพสินค้าหรือข้อความที่พิมพ์อยู่ในรูป ไม่แก้ชื่อรุ่น/Data/8Child/5Parent/Header/Detail/หน้าอื่น/Global styles/Dependencies/Database/Deployment

### UI/UX Brand Alignment

- Reference: ภาพหน้าการ์ดPlatformทั้ง2ภาพล่าสุดจากผู้ใช้และCardเดิม
- Design: รูปเดิม/ขนาดชื่อเดิม ใช้Centered textและCopyสั้นลงตามคำสั่ง ไม่มีBrandหรือคำบรรยายUIซ้ำ
- Responsive:320/390/768/1440 Grid/List ชื่อยาวต้องWrapไม่มีOverflow

### Input / Output

- Input: ผู้ใช้สั่ง “ปรับให้การ์ดทุกตัวของสินค้ามีแค่ชื่อรุ่นไว้ตรงกลาง” พร้อมภาพPlatform
- Output: ทุกCardในหน้า/productsแสดงข้อความหลักเฉพาะรุ่นและCentered; Mockมีป้ายที่Artเพื่อรักษาสถานะตัวอย่าง
- Contract: CatalogProductCard.modelOnly?:boolean defaultfalse; opt-inเพิ่มdata-model-onlyสำหรับCSSเฉพาะหน้านี้ ไม่แก้ProductDTO/Link/Compare IDs

### Acceptance Criteria

- [x] สินค้าจริงทุก5ParentและScales Childไม่มีBrand/Subtitle/TagsในCard DOM แต่รูป/รุ่น/Linkเดิมครบ
- [x] ชื่อGrid/Listกึ่งกลางและWrapได้ทุก4ขนาด Mockชื่อกึ่งกลางไม่มีคำบรรยายแต่ยังระบุMockในArt
- [x] Compare/Filter/Search/Sort/Paginationและชื่อรุ่นManifestยังผ่านBrowserเดิม หน้าCategoryเดิมยังใช้รายละเอียดเดิม
- [x] Typecheck/Scoped Lint/Format/Whitespace/Browserพร้อมภาพจริงผ่าน จำกัด3ไฟล์แอปและรักษางานเดิม

### Missing Information

ไม่มี ใช้ภาพระบุขอบเขตProductCategoryMock และคงรูปสินค้า

### Approval Record

คำสั่งล่าสุดอนุมัติปรับข้อความการ์ดสินค้าทั้งหน้า/productsให้เหลือชื่อรุ่นกึ่งกลาง การเพิ่มOpt-inในCardที่ใช้ร่วมกันเพื่อจำกัดผลอยู่ในขอบเขตนี้ ไม่เปลี่ยนConsumerอื่น

### Current State

หน้า/productsเปิดmodelOnlyทุกReal Cardแล้ว แสดงเฉพาะชื่อรุ่นกึ่งกลาง ไม่RenderBrand/Subtitle/TagsในCard DOM รูป/Link/Compareเดิม Mock titleกึ่งกลางและย้ายป้ายMockไปArt ไม่มีคำบรรยาย ตัวเลือกdefaultfalseคงCardในCategoryเดิม

Chromeตรวจ150Real/18Mockครบ5Parent จำนวน92/7/23/3/43เมื่อรวมScales Mock รูปแบบGrid/Listที่320/390/768/1440ชื่อCentered ไม่มีClipping/Overflow ตรวจภาพDesktop/Mobile/List/Mockแล้ว Page Error0 Category /IndicatorยังมีBrand/Subtitle/Tagsเดิม

Scoped Browser Regressionเดิม11/11ผ่าน ไม่มีFlaky/Skipped Typecheck/Scoped ESLint/Prettier/git diff --checkผ่าน Source auditพบเฉพาะ3ไฟล์แอปที่อยู่ในPlan ข้อมูล/ชื่อรุ่น/Manifest/ไอคอนเดิมคงอยู่ หลักฐานoutput/model-only-cards-20261104/delivery.md, presentation.json, regression.json, scope-audit.jsonและภาพ

ใช้Dev3000เดิม ไม่Restart/Production Build/Full E2E/Database/Commit/Deploy Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

## Task: Match product category icons to homepage (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done — icons and responsive browser checks verified"

### Goal

ปรับไอคอน5หมวดหลักหน้า/productsตามภาพผู้ใช้ ให้4หมวดใช้ไอคอนเดียวกับหน้าแรกและสร้างPOSที่ยังไม่มี

### Scope In

ใช้CategoryFeatureIconของScales/Indicators/Platforms/AccessoriesเดิมโดยImportมาใช้ ไม่แก้โมดูลหน้าแรก เพิ่มSVGจอPOSพร้อมเครื่องรับชำระเงินในComponentแคตตาล็อก ขนาด32/viewBox32/stroke1.75/currentColor/roundตรงต้นแบบ

### Scope Out

ไม่เปลี่ยนCards/CSS/สี/ข้อความ/Membership/8Child/Mock product placeholder/Shared files/Dependencies/Database/Deployment

### UI/UX Brand Alignment

- Reference: ภาพ2ภาพที่ผู้ใช้ให้และsrc/features/home/components/category-feature-icons.tsx
- Design: ไอคอนเส้น32pxและcurrentColorรับสีMuted/Redจากปุ่มเดิม POSเป็นสัญลักษณ์ทั่วไปไม่อ้างรูปร่างสินค้าจริง
- Responsive: ตรวจ320/390/768/1440และSelectedสีแดง Boundsเดิม

### Input / Output

- Input: ผู้ใช้สั่ง “ปรับไอคอนของหมวดหมู่ให้เหมือนกับไอคอนหน้าแรกและตัวที่ไม่มีให้สร้างขึ้น”
- Output: 5Parentมีไอคอนสื่อหมวดตรงกัน4ชุดเดิมและPOSใหม่ ไม่ใช้Packageเหมือนกันทั้งหมด
- Contract: ไอคอนตกแต่งaria-hidden/focusable=false ไม่แก้Props/Data contracts/Routes หน้าแรกและMock card Packageเดิม

### Acceptance Criteria

- [x] ไอคอน4หมวดตรงSVGหน้าแรก POSเป็นเส้นสไตล์เดียวกัน
- [x] ขนาด32x32และสีHover/Selectedเดิม ไม่มีAccessible nameซ้ำ
- [x] ตรวจBrowserResponsive/การเลือกหมวด/ภาพจริงและTypecheck/Scoped Lint/Formatผ่าน
- [x] เฉพาะ1ไฟล์แอปเปลี่ยนในรอบนี้ งานเดิม/หน้าแรกคงอยู่

### Missing Information

ไม่มี ผู้ใช้อนุญาตสร้างไอคอนที่ยังไม่มีโดยตรง

### Approval Record

คำสั่งล่าสุดพร้อมภาพอนุมัติให้แทนไอคอนทั้ง5หมวดและสร้างตัวที่ขาด ใช้ขอบเขตนี้โดยไม่ขยายไปเปลี่ยนดีไซน์หรือไฟล์ส่วนกลาง

### Current State

แทน5Parentด้วย4SVGหน้าแรกที่ImportโดยตรงและPOSใหม่แล้ว BrowserเทียบouterHTMLของ4SVGกับหน้าแรกจริงตรงกัน100% ทั้ง5แตกต่างกัน ขนาด32x32/stroke1.75/aria-hidden/focusable=false สีSelectedตรงBrand Redทุกหมวด Mock product Packageเดิมยังอยู่

ตรวจ320/390/768/1440ไม่มีOverflow Boundsการ์ดทั้ง5เท่าBeforeทุกขนาด ตรวจภาพDesktop/POS selectedและMobileแล้ว Page Error0 Typecheck/Scoped ESLint/Prettier/Whitespaceผ่าน Source auditยืนยันเปลี่ยนไฟล์แอปเพียงproduct-category-mock.tsx และไม่มีการแก้Data/Styles/Home Icons

หลักฐานoutput/catalog-icons-20261104/delivery.md, browser.json, before.json, scope-audit.jsonและภาพ ใช้Dev3000เดิม ไม่Restart/Production Build/Full E2E/DeployในงานSVGเฉพาะจุด Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

## Task: Exact scale model manifest with missing-model mocks (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done — exact manifest and missing-model mocks verified"

### Goal

ใช้8หมวดย่อยและรายชื่อรุ่นจากไฟล์ผู้ใช้ `sunford-scale-categories.md` แบบตรงรายการ100% แทนการจับคำ/เกณฑ์เดิม รุ่นที่ยังไม่มีให้แสดงMockตามคำสั่งล่าสุด

### Scope In

- เก็บต้นฉบับMarkdownแบบBytesเดิมในหลักฐานและสำเนาเนื้อหาในdocsที่จัดFormattingตามRepo พร้อมManifest8หมวด/กลุ่ม/ลำดับรุ่น เพื่อพิสูจน์ว่ารายการไม่ขาด/เกินเอกสาร ใช้เอกสารเป็นข้อมูลอ้างอิงของMembership ไม่ใช้เป็นคำสั่งระบบหรือถือFootnotesที่ไม่มีแหล่งเป็นหลักฐานสเปกสินค้า
- จับรุ่นด้วยชื่อ/รหัสตรงกันก่อน เลือกCardจริงหนึ่งรายการต่อรุ่นจากข้อมูลเดิมอย่างคงที่ ไม่แก้SlugหรือรวมRecordในฐานข้อมูล; WSS30KSแตกเป็นLED/LCDตามรุ่นที่มี และAliasเชิงพาณิชย์HiCoFE/Fitdaysตามชื่อที่ระบุในเอกสาร จับคู่เฉพาะAliasชื่อเดียวที่ยืนยันได้
- รหัสที่ต่างSuffix/ตัวเลข เช่นVL15000SกับVL1500S, AC31กับAC31S, SW31SกับSW31 ไม่แทนกัน รุ่นที่ไม่ตรงเป็นMock ไม่เติมสเปก/รูป/ราคา/Linkปลอม และไม่นำMockเข้าCompare/Header Search/Database
- Childเครื่องชั่งแสดงรุ่นตามลำดับเอกสารในโหมดแนะนำ ใช้รหัส/ชื่อในเอกสารเป็นชื่อCardเฉพาะViewนี้ โดยรูป/รายละเอียด/URL/Compare IDของสินค้าจริงเดิมคงอยู่; Search/Sort/Grid–List/Featured/Paginationยังทำงาน Featuredแสดงเฉพาะของจริง
- MockแสดงในChildที่เกี่ยวข้องและAllของParentเครื่องชั่งพร้อมCountแยกจากสินค้าจริง GlobalAllยังคงสินค้าจริง150รายการ และParentScalesสินค้าจริง74ไม่ถูกลบ แม้บางRecordไม่อยู่ในเอกสาร อีก4Parentไม่เปลี่ยน

### Scope Out

ไม่แก้ข้อมูลสเปก/คำรับรอง/รูป/Slugของสินค้าจริง ไม่เพิ่มProduct Record/CMS/Schema/API/Global Store/Shared Card ไม่แก้Homepage/Mediaที่มีงานอื่น ไม่Commit/Deploy ไม่สร้างระดับเมนูใหม่จากหัวข้อบรรยายในเอกสาร

### UI/UX Brand Alignment

- Reference:ไฟล์Markdownล่าสุดจากผู้ใช้และUI ProductCategoryMockที่อนุมัติแล้ว
- Design:8ชื่อไทยตามเอกสาร Styleเดิม MockมีPackage icon/ชื่อรุ่น/ป้ายMock/ข้อความว่ายังไม่มีข้อมูลจริง ไม่มีรูปสินค้าที่แต่งขึ้นหรือปุ่มไปหน้าที่ไม่มีจริง
- Responsive:320/390/768/844Landscape/1440 ตรวจชื่อยาว CardMockและViewรายการพร้อมKeyboard/Compare

### Input / Output

- Input:Markdownผู้ใช้ทั้งไฟล์, ProductsจริงจากgetCatalogPageเดิมและcachedClientProducts ไม่มีการใช้คำบรรยายเก่าจัดสมาชิกแทนรายการในไฟล์
- Output:8Childตรงรายการทุกรุ่น รุ่นจริงเชื่อมURLเดิม รุ่นไม่มีเป็นMockที่ระบุชัด
- Contract:Childมีmodel entries `{ model, documentModel, productId? }`;ไม่มีproductIdหมายถึงMockไม่ใช่Productจริง productIdsยังมีเฉพาะของจริง Parentทั้ง5ยัง150รายการ Membershipเดิมของ8Childถูกแทนด้วยManifestใหม่นี้ รวมFitdaysในKitchenตามไฟล์แม้เกณฑ์ก่อนหน้าไม่จัดเข้า
- English headings/กลุ่มรุ่นเก็บในManifestเพื่อTraceability UIยังใช้8ชื่อไทยและโครงสร้างเดิม ไม่คัดลอกข้อความสเปกจากเอกสารไปเขียนทับข้อมูลสินค้า

### Acceptance Criteria

- [x] ผู้ใช้สั่งใช้ไฟล์แบบ100%และอนุญาตMockกรณีไม่มีจริงอย่างชัดเจน
- [x] Manifestตรง8หัวข้อ/กลุ่ม/ลำดับรุ่นในMarkdownสำเนา ไม่มีการเดาเพิ่ม/แก้รหัสที่ต่างกัน
- [x] ทุกEntryเป็นรุ่นจริงที่จับตรง/มีAliasที่ระบุ หรือเป็นMockชัดเจน ไม่ขาดรายการเอกสาร ไม่ให้สินค้าที่ไม่ระบุเข้าChildด้วยKeywordเก่า
- [x] Mockไม่มีLink/รูปสเปกปลอม/Compare และCountแยกของจริง ParentScales74/Global150และอีก4Parentเดิมไม่หาย
- [x] Search/Sort/Featured/Grid–List/Pagination/Parent reset/Compareยังทำงาน และ8Childตรงไฟล์รวมMissing ModelsในBrowserทุกขนาด
- [x] Unit/Browser/Typecheck/Scoped Lint/Format/Buildผ่าน มีBackup/Hash/ภาพ/ผลจริง ปิดเฉพาะQAที่เปิดเอง

### Missing Information

ไม่มี รุ่นที่ไม่ตรงสามารถทำMockได้ตามคำสั่ง ไม่ตีความรหัสคล้ายกันเป็นรุ่นเดียว

### Approval Record

ผู้ใช้วันที่2026-11-04ให้ไฟล์และสั่ง “หมวดหมู่ย่อยเอา เครื่องชั่งเอาตามนี้แบบ 100% ครับ ถ้าตัวไหนไม่มีทำเป็นmockไว้ได้เลย” อนุมัติMembershipตามManifestและMockแทนรุ่นที่ไม่มี คำสั่งนี้แทนเกณฑ์จับคำเดิมเฉพาะ8Child โดยไม่ขยายไปแก้ข้อมูลสินค้าหรือDeployment

### Current State

ใช้Manifestครบ8หมวด/กลุ่ม/ลำดับตามเอกสารแล้ว Unitตรวจรายการทั้งหมดตรงMarkdownและHashต้นฉบับ/สำเนา รุ่นจริงจับExact name/sourceId/slug/bounded model token และAlias2รายการที่ระบุ WSS30KSแสดงLCD/LEDตามรุ่นจริง รหัสต่างSuffix/ตัวเลขไม่แทนกัน

จำนวนReal/MockรายChildตามลำดับ:18/5,15/6,9/0,6/1,8/4,37/1,12/14,11/3 มีMockไม่ซ้ำ18รุ่น แสดงเฉพาะScales/Childพร้อมป้ายและCountแยก ไม่มีLink/รูปสินค้าแต่ง/ราคา/Compare ตัวจริงParentScales74และGlobal150ยังครบ ไม่มีDB/Schema/API/Shared Card change

Production Browser13/13ผ่านไม่มีFlaky/Skipped; Catalog Unit58/58,Typecheck,Scoped ESLint,PrettierและNode24.22.1 webpack Build420หน้าผ่าน ตรวจResponsive5ขนาดรวม10Mock Grid/Listเพิ่มเติมและภาพDesktop/Mobile Sourceแอป6ไฟล์ตรงQAตามHash ใช้Snapshot fallbackในQA ไม่อ้างLive DBหรือFull E2E Suite

Devรอบแรก10/11เนื่องจากTestคาดว่าCompare barต้องไม่แสดง แต่พฤติกรรมเดิมแสดง0/3อย่างถูกต้อง แก้Testให้ตรวจ0/3/ปุ่มDisabled/ยกเลิกแล้วFocused1/1ผ่านและProductionครบ13/13ผ่าน เก็บFailureเดิม ไม่มีการเปลี่ยนแอปเพราะTest assumptionนี้

หลักฐานในoutput/scale-manifest-20261104/delivery.mdและsummary.json Backup10ไฟล์ก่อนแก้รวมMemory,ต้นฉบับBytesเดิม,Manifest audit,Resultsและภาพ ปิดQA3168 PID45504แล้ว Dev3000 PID15684เดิมยังทำงาน รักษางานHomepage/Mediaคู่ขนาน ไม่Commit/Deploy Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

## Task: Enlarge homepage platform and indicator artwork (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done — measured image enlargement and responsive verification"

### Goal

ขยายรูปใหญ่หมวดโครงสร้างแท่นชั่งและอินดิเคเตอร์แท่นชั่งขึ้นเล็กน้อยตามคำขอ ใช้ขนาดเพิ่ม20%จากปัจจุบันโดยคงกรอบเดิม

### Scope In

เพิ่มตัวระบุหมวดให้กรอบรูปและCSS scale1.2เฉพาะรูปใหญ่ของplatforms/indicatorsในStylesheetหมวดเดิม ตรวจว่าตัวสินค้ายังแสดงครบ พื้นที่ดำส่วนเกินอาจถูกกรอบตัดได้

### Scope Out

ไม่แก้ไฟล์PNG รูปเครื่องชั่ง/อุปกรณ์เสริม แถบสินค้า ลำดับหมวด ข้อความ สมาชิกกลุ่ม ขนาดกรอบ Layoutหน้าอื่น CMS DependenciesหรือDatabase

### UI/UX Brand Alignment

- Reference: ภาพPNGพื้นดำ2ไฟล์ที่ผู้ใช้ให้และขนาดปัจจุบันในหน้าแรก
- Design: ขยาย20%จากศูนย์กลางด้วยTransform ไม่เปลี่ยนสี/สัดส่วน/ภาพจริงหรือระยะห่างกรอบ
- Responsive: วัดก่อน/หลังที่390/1440 ตรวจภาพจริง320/390/768/1440และRegressionเดิม12ขนาด

### Input / Output

- Input: ผู้ใช้สั่ง “ขยายรูปแท่นกับอินดิเคเตอร์ให้ใหญ่ขึ้นอีกหน่อยครับ ตอนนี้ดูเล็กไป”
- Output: รูป2หมวดใหญ่ขึ้น20%โดยตัวสินค้าไม่ถูกตัดหรือทับเนื้อหา
- Contract: Category IDเดิมใช้เป็นCSS hook รูปอีก2หมวดและกรอบมีขนาดเท่าเดิม

### Acceptance Criteria

- [x] รูปเป้าหมายใหญ่ขึ้น20%จากBaselineทั้งDesktop/Mobile รูปอื่น/กรอบไม่เปลี่ยนขนาด
- [x] ตรวจภาพจริงว่าตัวสินค้ายังครบ ไม่มีOverflow/การทับเนื้อหาใหม่
- [x] Category RegressionเดิมและScoped Typecheck/Lint/Formattingผ่าน
- [x] เปลี่ยนเฉพาะไฟล์ที่ระบุและรักษาภาพต้นฉบับ/งานอื่น

### Missing Information

ไม่มี ใช้20%เป็นการปรับเล็กน้อยตามคำขอและตรวจภาพก่อนส่งมอบ

### Approval Record

ผู้ใช้ขอขยายเฉพาะรูปแท่น/อินดิเคเตอร์ในหน้าแรกวันที่2026-11-04ตามข้อความข้างต้น เป็นการอนุมัติปรับขนาด2รูปต่อจากงานภาพที่รับแล้ว ครอบคลุมCSSเฉพาะ2รูปใน `src/styles/category-feature.css` ไม่ขยายไปเปลี่ยนStyleส่วนอื่น

### Current State

เพิ่มdata-categoryในกรอบและCSS Ruleเฉพาะplatforms/indicatorsแล้ว วัดBefore/Afterที่390/1440ได้อัตราส่วนความกว้าง/สูง1.2ทั้ง2รูป รูปเครื่องชั่ง/อุปกรณ์เสริมและกรอบทุกรูปเท่าเดิม ตรวจภาพเป้าหมายDesktop/MobileและภาพResponsive320/390/768/1440แล้วเห็นสินค้าครบ ไม่ล้น/ไม่ทับเนื้อหา

Typecheck/Scoped ESLint/Prettierผ่าน Category Regressionรอบรวม10/11ผ่าน โดยEnterไปหน้าสินค้า1กรณีรอURLเกิน5วินาที; รันกรณีเดิมซ้ำโดยไม่แก้Source/Testแล้วผ่าน1/1 ไม่ยืนยันสาเหตุของTimeoutและเก็บผลล้มเหลวเดิมไว้ Responsive12ขนาดผ่าน ไม่มีPage Error/Overflowใหม่ ไม่เพิ่มหรือลดAssertion

Application Diffของงานนี้มีเพียงdata attribute1จุดและCSS Rule1ชุด งานScale Subcategoriesมีการแก้Source/Test/Planคู่ขนานจึงรักษาไว้ ไม่ทับหรืออ้างเป็นผลงานรอบนี้ ภาพต้นฉบับไม่แก้ Dev3000เดิมยังทำงาน ไม่เริ่ม/หยุดServerหรือBuildProductionซ้ำ หลักฐานใน `output/homepage-enlarge-images-20261104/` Next Feedbackรอบสุดท้ายไม่มีQualifying Framework Issueใหม่

## Media delivery: SUNFORD opening logo low-key image (2026-11-04)

- User directly requested the supplied red SUNFORD logo in the preceding premium dark-studio style for a website opening asset. Created `public/images/product-studio-20261104/sunford-logo-lowkey.png`,1254×1254 RGB, with centered legible red wordmark, black background and restrained upper-left lighting. No added slogan or graphics. This is AI-retouched raster artwork, not a replacement vector identity master.
- Visually reviewed the generated image; square dimensions and copied-master hash verified in `sunford-logo-lowkey-verification.json`. Source ERP logo and website opening implementation remain unchanged. Media generation only; no application integration/deployment or qualifying Next.js framework feedback.

## Task: Eight scale subcategories (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done"

### Goal

เปลี่ยนเฉพาะChildของParentเครื่องชั่งเป็น8ชื่อเรียงตามข้อความผู้ใช้ (จัดเลขซ้ำเป็น1–8และใช้ตัวสะกดตั้งโต๊ะ): เครื่องชั่งคำนวณราคาหน้าร้าน, เครื่องชั่งอุตสาหกรรมงานผลิต, เครื่องชั่งงานวิเคราะห์ความแม่นยำสูง, เครื่องชั่งงานครัวและกาแฟ, เครื่องชั่งกันน้ำและกันฝุ่น 100%, เครื่องชั่งตั้งโต๊ะ, เครื่องชั่งตั้งพื้น, เครื่องชั่งมีเสา

### Scope In

- จัดสมาชิกด้วยหมวดเดิมและข้อเท็จจริงในชื่อ/คำอธิบาย/สเปกที่ยืนยันได้ตามคำอนุมัติล่าสุด รุ่นเดียวอยู่หลายChildได้ รุ่นที่ข้อมูลไม่พออยู่ในAll ไม่บังคับให้8Childเป็นPartitionหรือครอบคลุมParentทั้งหมด
- คำนวณราคาใช้Topic priceเดิม; อุตสาหกรรม/วิเคราะห์ใช้Membershipอุตสาหกรรม/ห้องปฏิบัติการเดิม; ครัว/กาแฟใช้Collectionหรือข้อความการใช้งานที่ระบุชัด; รูปทรงใช้ข้อความยืนยันตั้งโต๊ะ/ตั้งพื้น/มีเสาเท่านั้น ไม่เดาจากรูปหรือพิกัด
- กันน้ำ/กันฝุ่นต้องมีข้อความยืนยันทั้ง2อย่างและไม่ถูกปฏิเสธ ไม่ใช้กันน้ำอย่างเดียวหรือIPอย่างเดียวแทนข้อความทั้ง2 ชื่อที่มี100%มาจากผู้ใช้ ไม่เพิ่มข้อความรับรองในหน้ารายละเอียดหรืออ้างว่าIPเท่ากับรับประกัน100%
- คง5Parent/สมาชิกเดิม All150/เครื่องชั่ง74 และอีก4ParentยังมีDemo01–02 คงSearch/Sort/Featured/Grid–List/Pagination/Compare/Parent–Child reset
- ปรับข้อความกำกับให้แยกChildจริงของเครื่องชั่งกับChildตัวอย่างของกลุ่มอื่น และรองรับชื่อปุ่มยาวในCSS Moduleเดิม

### Scope Out

ไม่แก้Membership5Parent/Classificationส่วนกลาง ข้อมูลหรือสเปกสินค้า รูป API/CMS/Database/Global Store/Shared Layout งานHomepage/Mediaที่ค้างอยู่ ไม่Commit/Deploy

### UI/UX Brand Alignment

- Reference:8ชื่อจากผู้ใช้และProductCategoryMock/CSSเดิม
- Design:ปุ่มChildแบบSingle-select/All สี ฟอนต์และLayoutเดิม Wrapชื่อยาว ไม่เพิ่มภาพหรือคำโฆษณา
- Responsive:320×800,390×844,768×1024,844×390,1440×1000 ตรวจชื่อยาว Focus/Hit Targets/Overflow

### Input / Output

- Input:Product IDsของเครื่องชั่งจากgetCatalogPageเดิม, Membershipindustrial/laboratoryเดิม, collections/source description/detailsและข้อมูลปัจจุบัน
- Output:8Childจริงเฉพาะเครื่องชั่ง พร้อมหลักฐานสมาชิกและNegative/Missing cases อีก4Parentเป็นDemoตามเดิม
- Contract:เพิ่มสถานะChildตัวอย่างต่อParent; Childเครื่องชั่งอาจOverlap/มีรุ่นไม่ถูกจัด Childได้ ส่วนParentทั้ง5ยังครอบคลุม150เหมือนเดิม ข้อความปฏิเสธมีผลเหนือข้อมูลบวก

### Acceptance Criteria

- [x] ผู้ใช้ยืนยันนโยบายข้อมูลเดิม/สเปกที่ยืนยันได้ Overlap และข้อมูลไม่พอคงAll
- [x] 8ชื่อและลำดับถูกต้องเฉพาะเครื่องชั่ง ไม่มีDemo01–02ในParentนี้ อีก4Parentเดิมไม่เปลี่ยน
- [x] ทุกChildเป็นSubsetของ74และมีหลักฐานตามเกณฑ์ ไม่ใช้Platform/อุปกรณ์เสามาจัดเป็นเครื่องชั่ง ไม่ใช้Negative factsเป็นPositive
- [x] All74/All150ยังครบ Product URLs/เนื้อหาเดิมไม่เปลี่ยน การเลือกParent/Child/Search/Sort/Pagination/Compareยังทำงาน
- [x] Catalog Unit/Browser/ชื่อยาวทั้ง5ขนาด/Typecheck/Scoped Lint/Format/Buildผ่าน เก็บผลและข้อจำกัดจริงก่อนส่งมอบ
- [x] Backup/Hash/Contractอัปเดต และปิดเฉพาะQAที่เริ่มเอง รักษางานอื่นที่ค้างอยู่

### Missing Information

ไม่มีข้อมูลจำเป็นที่ขาดหลังคำยืนยัน นโยบายข้อมูลไม่พอคงAllได้รับอนุมัติแล้ว จึงไม่อนุมานว่าSKUที่ไม่มีคำยืนยันรูปทรงต้องเข้ารูปทรงใด

### Approval Record

วันที่2026-11-04 ผู้ใช้ให้8ชื่อ แล้วตอบคำถามเรื่องMembershipชัดเจนว่า “ใช้เกณฑ์นี้ และให้สินค้าอยู่ได้หลายหมวด” หลังอธิบายว่าจะใช้หมวดเดิม/สเปกที่ยืนยันได้ ข้อมูลไม่พอคงAll และกันน้ำ/กันฝุ่นต้องยืนยันทั้ง2อย่าง ใช้เป็นคำอนุมัติขอบเขตที่เปลี่ยนนี้ ไม่รวมงานParentอื่น/Deployment

### Current State

เพิ่ม8ChildจริงเฉพาะScalesแล้ว Parent DTOมีsubcategoriesAreMock:Scalesเป็นfalse อีก4Parentเป็นtrue ไม่SerializeSource FactsหรือCheerioไปClient ใช้ข้อมูลที่Serverจับคู่แล้ว การWrapปุ่มยาวแก้เฉพาะCSS Moduleเดิม

- ผลตรวจMembershipจริงเรียง8หมวดได้23/36/8/22/7/1/4/2รายการ มีOverlapตามอนุมัติ รวมSKUที่เข้าอย่างน้อย1Child70รายการ; POS1100-A, รายการRLS1100ที่Slugเป็นตัวใหญ่, Fitdays, POS1100-Bอีก4รายการข้อมูลไม่พอตามเกณฑ์ จึงยังอยู่ในAll74 ไม่เดาจากชื่อรุ่นหรือรูป ภาพ/URL/All150ยังอยู่ครบ
- Devรอบแรก10/11ผ่าน พบFitdaysเข้าKitchenเพราะครัวตรงครอบครัวจริง ไม่ลดAssertion เพิ่มNegative Unitที่เห็นRedก่อนแก้ เปลี่ยนเป็นคำการใช้งานครัวที่ชัดเจน แล้วTargeted Dev1/1ผ่าน เก็บdev-tests.json/kitchen-red.log/dev-recheck.jsonครบ
- Final Production13/13ผ่าน ไม่มีFlaky/Skipped ในชุดเลือก ทั้ง8ชื่อ/Subset/Overlap/All74/150/เทียบIndustrialและAnalyticalกับหน้าเดิม/Parent reset/Search/Sort/Featured/Grid–List/Pagination/Compare3/Global Search/API/404/อีก4Demo และResponsive5ขนาด ไม่อ้างFull E2E Suiteผ่าน
- Catalog Unit57/57ผ่าน รวม7กรณีใหม่ Source Factsจริง/Water+Dustทั้ง2/Negative override/Form factorsไม่เดาภาพหรือพิกัด/Platform boundary/Family-health copy; Typecheck/Scoped ESLint/Formattingผ่าน Buildwebpack420หน้าบนNode24.22.1ผ่าน
- ตรวจภาพและBoundsที่320/390/768/844Landscape/1440 ปุ่มชื่อยาวไม่ล้นและHit Targets/Keyboard/Focusทำงาน ไม่มีPage Error/Overflowใหม่ Sourceแอป5ไฟล์ตรงHashกับQAที่ทดสอบ; Productionใช้Snapshot fallbackและPlaceholderเฉพาะProcess ไม่เขียนDB/Env
- เพิ่มMEMORYเรื่องThai usage phraseตามAGENTS Project Memory ไม่แตะHomepage/Media/Shared Sourceที่มีงานอื่นค้างอยู่ สำรอง7ไฟล์ก่อนแก้ในbefore-files.zipพร้อมbaseline-source.json; HelperและUnit Testเป็นไฟล์ใหม่
- หลักฐานอยู่output/scale-subcategories-20261104/: delivery.md, production-tests.json, dev-tests.json, dev-recheck.json, catalog-unit.log, kitchen-red.log, membership-audit.json, mobile-label-bounds.json, source-hashes.json, build.log และscales-desktop.png/scales-320.png/scales-390.png/scales-768.png/scales-844.png
- ปิดQA3167 PID33220ที่เริ่มเองแล้ว ตรวจไม่มีListener3167 Dev3000 PID15684เดิมยังอยู่ ไม่Commit/Push/Deploy Final Next feedback reviewไม่มีFramework candidateใหม่ ข้อจำกัดDetail1pxและCase-only Slugก่อนหน้ายังไม่ถูกแก้หรืออ้างว่าผ่าน

## Task: Supplied homepage platform and indicator images (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done — supplied images and responsive behavior verified"

### Goal

ใช้ภาพPNGสองไฟล์ที่ผู้ใช้ส่งแทนรูปใหญ่ของหมวดโครงสร้างแท่นชั่งและอินดิเคเตอร์แท่นชั่งบนหน้าแรก

### Scope In

- แท่นชั่ง: `/videos/ChatGPT Image Nov 4, 2026, 01_57_30 PM.png`
- อินดิเคเตอร์: `/videos/ChatGPT Image Nov 4, 2026, 01_57_44 PM.png`
- เปลี่ยนเฉพาะImage referencesของ2Card definitionsและExpected ImagesในRegressionเดิม ใช้ไฟล์ต้นฉบับโดยไม่แก้ภาพ

### Scope Out

ไม่เปลี่ยนลำดับหมวด เนื้อหา ไอคอน รูปเครื่องชั่ง/อุปกรณ์เสริม แถบสินค้า รูปในProduct Data Layout Styles CMS DependenciesหรือDatabase

### UI/UX Brand Alignment

- Reference: ภาพพื้นดำ2ไฟล์ที่ผู้ใช้ระบุโดยตรง คงกรอบ16:9และobject-fit containเดิมเพื่อไม่ตัดสินค้า
- Design: ไม่เพิ่มข้อความหรือปรับภาพ ใช้Next Imageผ่านProductImageเดิม
- Responsive: ตรวจรูป2หมวดและLayoutที่320/390/768/1440pxด้วยCategory Regressionเดิม

### Input / Output

- Input: คำขอ “นำสองรูปนี้ไปใส่ส่วนของแท่นและอินดิเคเตอร์” และไฟล์จริงใน `public/videos/`
- Output: เมื่อเลือกหมวดแท่นหรืออินดิเคเตอร์ แสดงภาพที่ผู้ใช้ให้ตรงหมวด
- Contract: เปลี่ยนเฉพาะภาพใหญ่ ไม่เปลี่ยนProduct IDsหรือภาพของสินค้ารายชิ้นในแถบ

### Acceptance Criteria

- [x] รูปใหญ่ทั้งสองตรงไฟล์ที่ส่งและโหลดสำเร็จเมื่อเลือกหมวด
- [x] ลำดับ4หมวดและสมาชิกสินค้า/ลิงก์เดิมคงอยู่ รูปอีก2หมวดไม่เปลี่ยน
- [x] Category Regression/ResponsiveและScoped Lint/Formatting/Typecheckผ่าน พร้อมภาพหลักฐาน
- [x] ไฟล์PNGต้นฉบับและSourceนอกขอบเขตไม่เปลี่ยน

### Missing Information

ไม่มี จับคู่ภาพแท่นและภาพอินดิเคเตอร์ได้ชัดเจนจากไฟล์ที่ผู้ใช้ส่ง

### Approval Record

ผู้ใช้รับงานหมวดหน้าแรกแล้ว และสั่งเปลี่ยนเฉพาะภาพ2หมวดด้วยคำขอข้างต้นวันที่2026-11-04 ใช้เป็นคำอนุมัติการแก้ไขเฉพาะภาพที่ระบุ ไม่ขยายงานออกแบบหรือสร้างภาพ

### Current State

ใช้2ภาพที่ผู้ใช้ส่งเป็นรูปใหญ่ของหมวดแท่น/อินดิเคเตอร์แล้ว โดยอ้างไฟล์PNGเดิมตรง ๆ ผ่านNext Image ไม่แก้Bytesต้นฉบับ คงContain/กรอบเดิม ลำดับ4หมวดและสมาชิก/รูปในแถบสินค้าไม่เปลี่ยน

Dev Chrome Category Regression11/11ผ่าน ไม่มีFlaky/Skipped รวมรูป2ไฟล์โหลดจริง ชื่อ/สมาชิก/ลิงก์ Keyboard Pointer TouchและResponsive12ขนาด320–1920px; ตรวจภาพจริง320/390/768/1440และภาพแยกแท่น/อินดิเคเตอร์Desktop/Mobileแล้ว ไม่มีPage Error/Overflowใหม่ Typecheck/Scoped ESLint/PrettierและWhitespace Checkผ่าน

AuditยืนยันApplication Diffมีเพียง2Image references และExpected ImagesในTest ภาพต้นฉบับ/Sourceอื่น/ประวัติSpec/Planก่อนงานไม่เปลี่ยน หลักฐานอยู่ใน `output/homepage-category-images-20261104/` ใช้Dev3000เดิม ไม่เริ่ม/หยุดServer ไม่เปลี่ยนEnv/DatabaseหรือBuildProductionซ้ำ ไม่มีNext.js issueใหม่ที่เข้าเกณฑ์Feedback

## Media delivery: indicator and platform low-key studio photographs (2026-11-04)

- User directly requested two reference-based premium studio images with centered front views, dark backgrounds, soft upper-left lighting and lower-body shadow falloff. Delivered separate AWS1 indicator and platform assembly images, without adding an indicator to the platform or promotional text. This authorizes media generation only; no website mounting, code, shared UI, CMS or database changes were made.
- Final RGB PNGs are1254×1254 in `public/images/product-studio-20261104/aws1-lowkey.png` and `platform-lowkey.png`. AI relighting/reconstruction was visually reviewed; square dimensions, hashes and corner pixel samples are recorded in the adjacent `verification.json`. Original references and generated masters are retained. No 4K or pixel-identical product reconstruction claim. No qualifying Next.js framework feedback for this media-only work.

## Task: Swap homepage indicator and accessory cards (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done — order and interactions verified on existing development server"

### Goal

สลับตำแหน่งอินดิเคเตอร์แท่นชั่งกับอุปกรณ์เสริมตามภาพที่ผู้ใช้ระบุ ลำดับใหม่คือ เครื่องชั่ง, อุปกรณ์เสริม, โครงสร้างแท่นชั่ง, อินดิเคเตอร์แท่นชั่ง โดยแทนลำดับงานหน้าแรกก่อนหน้าเฉพาะจุดนี้

### Scope In

ย้ายทั้งCard definitionในArrayเดิม รวมชื่อ คำอธิบาย รูป ไอคอน และกลุ่มสินค้าที่ผูกตามID ปรับExpected OrderและIndexที่ผูกกับอุปกรณ์เสริมในRegressionเดิมให้ตรงตำแหน่งใหม่

### Scope Out

ไม่เปลี่ยนเนื้อหา รูป สมาชิกกลุ่ม Layout Styles CMS หน้าProduct DependenciesหรือDatabase

### UI/UX Brand Alignment

- Reference: ภาพอินดิเคเตอร์/อุปกรณ์เสริมที่ผู้ใช้แนบและ4การ์ดหน้าแรกที่เพิ่งตรวจผ่าน
- Design: คงStyleและInteractionเดิม ย้ายขวาบนกับขวาล่างในGrid2×2
- Responsive: ตรวจDesktop/Tablet/Mobileด้วยRegressionเดิม รวมภาพ320/390/768/1440px

### Input / Output

- Input: คำสั่งผู้ใช้ “สองส่วนนี้สลับตำแหน่งกันครับ” พร้อมภาพสองการ์ดที่ระบุชัดเจน
- Output: อุปกรณ์เสริมเป็นการ์ด2 อินดิเคเตอร์เป็นการ์ด4 เครื่องชั่งและโครงสร้างแท่นอยู่ตำแหน่งเดิม
- Contract: เปลี่ยนเฉพาะลำดับ ไม่เปลี่ยนIDหรือสมาชิกกลุ่ม

### Acceptance Criteria

- [x] ลำดับ4ชื่อใหม่ตรงคำสั่งและเลือกทุกหมวดได้
- [x] รูป สมาชิกสินค้าและลิงก์ยังตรงหมวด อุปกรณ์เสริมมีภาพประกอบเดิมและPointer/Touchยังเปิดสินค้าได้
- [x] RegressionหมวดเดิมและResponsiveผ่าน พร้อมScoped Lint/Formatting/Typecheckตามความเหมาะสม
- [x] เปลี่ยนเฉพาะไฟล์ในPlanและรักษางานเดิมอื่น พร้อมผลตรวจจริง

### Missing Information

ไม่มี

### Approval Record

ผู้ใช้อนุมัติSpec/Planหน้าแรกและรับงานแล้ว จากนั้นสั่งแก้เฉพาะตำแหน่งของสองการ์ดชัดเจนว่า “สองส่วนนี้สลับตำแหน่งกันครับ” วันที่2026-11-04 ใช้คำสั่งแก้ไขนี้เป็นการอนุมัติขอบเขตเฉพาะการสลับ ไม่ขยายงานอื่น

### Current State

สลับทั้ง2Card definitionsแล้ว ลำดับปัจจุบันคือเครื่องชั่ง/อุปกรณ์เสริม/โครงสร้างแท่นชั่ง/อินดิเคเตอร์แท่นชั่ง แทนลำดับในงานหน้าแรกก่อนหน้าเฉพาะจุดนี้ ตรวจเทียบBackupแล้วเนื้อหา4การ์ดและโค้ดนอกArrayเหมือนเดิมทุกตัวอักษร รูป/สมาชิกผูกกับIDเดิม

Dev Chrome Category Regression11/11ผ่าน รวม12ขนาดหน้าจอ เลือกทุกหมวดที่320/390/768/1440 และตรวจภาพจริง4ขนาด ไม่มีPage Error/Overflowใหม่ Typecheck/Scoped ESLint/PrettierและWhitespace Checkผ่าน ผลตรวจใช้Dev3000ที่ผู้ใช้เปิดอยู่ ไม่รันProduction Buildซ้ำ ไม่เปลี่ยนEnvironmentหรือเริ่ม/หยุดServer หลักฐานอยู่ใน `output/homepage-category-swap-20261104/`

## Task: Homepage four product categories (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done — verified with isolated production snapshot"

### Goal

ปรับหมวดในหน้าแรกส่วน `#product-experience` ตามภาพผู้ใช้ ให้เรียงเป็น เครื่องชั่ง, อินดิเคเตอร์แท่นชั่ง, โครงสร้างแท่นชั่ง, อุปกรณ์เสริม

### Scope In

- เปลี่ยนชื่อและลำดับการ์ดทั้ง4ช่องตามคำขอ คงสีดำ/แดง Typography Layout และ Interaction เดิม
- รูปใหญ่และแถบสินค้าใช้สมาชิกจริงของ4กลุ่มจาก `getCatalogPage`: `/products`, `/Indicator`, `/product/scale-platforms`, `/product/scale-accessories` ไม่ใช้สินค้าของ Smart/Software ใต้ชื่อใหม่
- คงรูปเครื่องชั่งและอุปกรณ์เสริมเดิม รวมภาพประกอบ RYG-POLE; หมวดอินดิเคเตอร์/โครงสร้างแท่นใช้รูปสินค้ารายการแรกที่มีรูปในกลุ่มจริงจาก Server ไม่สร้างภาพใหม่
- คงคำอธิบายเครื่องชั่ง/อุปกรณ์เสริมที่มีอยู่; อินดิเคเตอร์ใช้ข้อความรายกลุ่มเดิม “ห้องปฏิบัติการ อุตสาหกรรม พาณิชยกรรมและบริการ”; โครงสร้างแท่นใช้ “แท่นชั่งตั้งโต๊ะ แท่นชั่งตั้งพื้น แท่นชั่งขนาดใหญ่” จาก `product-sections.ts` ไม่เพิ่มคำกล่าวอ้างสินค้า
- ปรับไอคอนเฉพาะ4การ์ดให้ตรงหมวด และแยกชนิดข้อมูลการ์ดออกจาก Legacy CMS image-slot IDs; ไม่ย้ายหรือเขียนทับข้อมูล CMS เก่า

### Scope Out

ไม่แก้หน้า `/products` ที่กำลังมีงาน5หมวด, Navbar/Footer/Global Styles, CMS forms/settings/schema, ข้อมูลสินค้า/Database, Software section อื่น, Dependencies, Commit/Push/Deploy

### UI/UX Brand Alignment

- Reference: ภาพที่ผู้ใช้แนบและส่วนปัจจุบัน `category-feature-panels.tsx`, `src/styles/category-feature.css`, `src/styles/base.css`
- Design: คงการ์ด2×2บนจอที่รองรับและResponsiveเดิม รูปจริง ไม่มีข้อความหรือภาพโฆษณาใหม่
- Responsive: ตรวจ320×800,390×844,768×1024,1440×900 ทั้งชื่อยาว การเลือก รูป และแถบสินค้า

### Input / Output

- Input:4ชื่อและลำดับจากข้อความผู้ใช้; ข้อมูลกลุ่มจริงจาก `catalog-page.ts`; คำอธิบายย่อยจาก `product-sections.ts`; รูปจากสินค้าเดิม
- Output: หน้าแรกมี4หมวดที่ชื่อ รูป และสินค้าตรงกัน โดยปุ่มเลือกและลิงก์สินค้าทำงานเดิม
- Contract:4หมวดของหน้าแรกใช้ IDsตรงความหมาย แยกจาก `HomeImageSlot` เก่า; Legacy Smart/Software targets/images ไม่ถูกนำมาติดชื่อใหม่ และยังเก็บอยู่ใน CMS เดิม; Spotlight และBusiness Solutions ไม่เปลี่ยน

### Acceptance Criteria

- [x] ชื่อ4หมวดและลำดับตรงคำขอ ไม่มีชื่อ Smart/Software ในการ์ดส่วนนี้
- [x] เลือกทุกหมวดแล้วรูปโหลดได้ แถบสินค้าตรงสมาชิกกลุ่มจริง ลิงก์ไปสินค้าจริง และมีหมวดที่เลือกเพียงหนึ่งรายการ
- [x] คงKeyboard/Pointer/Touch และแถบสินค้าต่อเนื่อง; อุปกรณ์เสริมเป็นการ์ดที่4และมีรูปประกอบเดิม
- [x] Browser/ภาพทั้ง4ขนาดไม่มีOverflowใหม่; Typecheck, Scoped ESLint/Prettier และRegressionที่เกี่ยวข้องผ่าน หรือรายงานข้อจำกัดพร้อมหลักฐาน
- [x] รักษางาน5หมวดหน้าProductและงานเดิมอื่นทั้งหมด อัปเดตผลตรวจจริงก่อนส่งมอบ

### Missing Information

ไม่มีข้อมูลจำเป็นที่ขาด ผู้ใช้อนุมัติSpec/Planนี้แล้ว

### Approval Record

ผู้ใช้ขอ “หน้าแรกหมวดหมู่ปรับให้เป็น 1.เครื่องชั่ง 2.อินดิเคเตอร์แท่นชั่ง 3.โครงสร้างแท่นชั่ง 4.อุปกรณ์เสริม” พร้อมภาพส่วนเป้าหมาย และอนุมัติSpec/Planนี้วันที่2026-11-04ว่า “อนุมัติ เริ่มแก้ไขตาม Spec และ Plan ได้เลย” ครอบคลุมชื่อ รูป สมาชิกสินค้าและการตรวจตามแผน

### Current State

หน้าแรกใช้4หมวดจริงแล้ว แถบสินค้าจากServerกลุ่มเดิมครบตามลำดับ74/7/23/43รายการในการตรวจSnapshot; อินดิเคเตอร์ใช้รูปAW31และโครงสร้างแท่นใช้รูปแรกในกลุ่ม ไม่ใช้ภาพSmart/Softwareเดิม ส่วนเครื่องชั่ง/อุปกรณ์เสริมคงImage Overridesเดิมได้ ชื่อหมวดทั้ง4ไม่อ่านLegacy showcase namesอีก Legacy targetsไม่ควบคุมแถบสินค้าส่วนนี้ Spotlightและข้อมูลCMSยังคงเดิม

Build Node24แบบwebpackผ่าน420หน้า Typecheck/Scoped ESLint/Prettierผ่าน Catalog Unit50/50และProduction Browser19/19ผ่าน รวมการเลือก สมาชิกครบ ลิงก์Enter/Pointer/Touch แถบต่อเนื่อง Reduced Motion ภาพเสีย No-JSและHero/Consultationเดิม Responsiveตรวจ12ขนาดระหว่าง320–1920px พร้อมเลือกทุกหมวดที่320/390/768/1440; ภาพจริง4ขนาดและภาพแยกหมวดDesktop/Mobileอยู่ใน `output/homepage-four-categories-20261104/`

ผลนี้ใช้SnapshotในQAแยก ไม่ได้ทดสอบLive Database; รอบแรก19กรณีเปิดBrowserไม่ได้เพราะไม่มีBundled Chromium จากนั้นใช้Chromeที่ติดตั้งและรันครบผ่าน เก็บFailureเดิมไว้ ไม่แก้Sourceเพื่อข้ามปัญหาเครื่องมือ Source5ไฟล์ตรงHashQAและตรวจแล้วเปลี่ยนเฉพาะ7ไฟล์ที่อยู่ในแผน Sourceงาน5หมวดหน้าProductคงเดิม และรักษาผลตรวจ/สถานะDoneที่งานอื่นอัปเดตในหัวข้องานนั้นระหว่างรอบนี้ ไม่ย้อนทับเอกสารร่วม ไม่มีFramework Feedback candidateใหม่

## Task: Five real product families (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done"

### Goal

เปลี่ยนหมวดหลักในหน้า `/products` เป็น5หมวดตามลำดับที่ผู้ใช้ระบุ: เครื่องชั่ง, อินดิเคเตอร์แท่นชั่ง, โครงสร้างแท่นชั่ง, ระบบ POS, อุปกรณ์เสริม และเชื่อมสินค้าตามกลุ่มจริงที่มีอยู่ในระบบ หมวดย่อยยังเป็นตัวอย่างจนกว่าจะได้ข้อมูลจากผู้ใช้

### Scope In

- แทน6หมวดสมมติด้วย5ชื่อจริงข้างต้น ใช้ Source `getCatalogPage` เดิมทั้ง5Root: `/products`, `/Indicator`, `/product/scale-platforms`, `/Product/POS`, `/product/scale-accessories`
- ขยาย Products input ของ `/products` จาก74เครื่องชั่งเป็นผลรวม5กลุ่ม โดยคง Product IDs/ข้อมูล/ลำดับของข้อมูล Server และ cached ClientProduct projection เดิม ไม่แก้ Classification Helpers หรือข้อมูลธุรกิจ
- ส่ง Parent IDs/ชื่อ/Product IDs จาก Server เข้า Component ให้กรองตามสมาชิกกลุ่มจริง แบ่งเฉพาะหมวดย่อย01–02เป็นตัวอย่างภายใน Parent ของตัวเอง ไม่จัดสินค้าข้ามกลุ่ม
- ปรับข้อความกำกับให้ระบุว่ายังรอเฉพาะหมวดย่อยจริง การ์ดไม่มีข้อความรอชื่อหมวดหลักอีก รักษา Search/Sort/Featured/Grid–List/Load more/Empty reset/Compare3รุ่นและ Parent–Child reset
- Layout และ Brand Tokens เดิม การ์ดหมวด4/3/2คอลัมน์ตามขนาดเดิม ไม่เปลี่ยนเป็น5คอลัมน์โดยไม่มีคำสั่ง; ตรวจชื่อยาวที่320px

### Scope Out

ไม่กำหนดชื่อหรือความหมายหมวดย่อยจริง ไม่แก้ Source Classification, Navbar/Footer/Global Styles, Shared Card/Global Store, Routes อื่น, Schema/Database/API/Dependencies ไม่ Commit/Deploy

### UI/UX Brand Alignment

- Reference: หน้า Product mock ที่อนุมัติแล้ว และ5ชื่อ/ลำดับจากผู้ใช้; คง `src/styles/base.css` และ CSS Module ของหน้านี้
- Design: ขาว/เทา/แดง SUNFORD ฟอนต์และรูปสินค้าเดิม ปรับเฉพาะเนื้อหาหมวดและการรองรับชื่อยาว ไม่เพิ่มรูป/สเปก/ไอคอนแทนหมวดที่ยังไม่มี Reference
- Responsive:320×800,390×844,768×1024,844×390,1440×1000 ตรวจชื่อหมวด Focus/Hit Targets และไม่มี Overflow

### Input / Output

- Input:5ชื่อจริงจากผู้ใช้และคำยืนยัน “เชื่อมสินค้าตาม 5 หมวดจริงด้วย”; Membershipจาก `getCatalogPage` ซึ่งมีอยู่แล้ว ไม่ใช้คำ Keyword จัดกลุ่มใหม่
- Output: หน้าเดียวเลือก5หมวดจริง ครอบคลุมสินค้าของทั้ง5กลุ่ม พร้อม2หมวดย่อยตัวอย่างต่อหมวด
- Contract: `ProductCategory { id, label, productIds, subcategories: { id, label, productIds }[] }`; Parent Membershipมาจาก Server, Child IDsใช้ `mock-*` เฉพาะการสาธิต ไม่ส่งเข้า Global Store/Database
- ตรวจ Source Snapshotก่อนแก้ได้150รายการ แบ่ง74/7/23/3/43ตามลำดับ5หมวด ไม่มี Unassigned; Runtimeจะใช้จำนวนจริงจาก Server ไม่ Hardcode Counts ใน UI

### Acceptance Criteria

- [x] ผู้ใช้ยืนยัน5ชื่อ/ลำดับและการขยายไปยังสินค้าจริงทั้ง5กลุ่ม
- [x] UIมี5หมวดตามลำดับและชื่อที่ระบุ ไม่มีหมวด06หรือข้อความรอชื่อหมวดหลัก
- [x] Product IDsแต่ละ Parentตรงกับกลุ่มเดิม; Allเป็นผลรวมครบ ไม่ซ้ำ/ไม่หาย และ Childrenเป็นส่วนย่อยของ Parentตนเอง
- [x] หมวดย่อยยังระบุว่าเป็นตัวอย่าง Parentเปลี่ยนแล้ว Child/Limitรีเซ็ต; Search/Sort/Load more/Compareยังทำงานกับข้อมูลชุดใหม่
- [x] ตรวจ Browser/ภาพ/ชื่อยาว/Keyboardทั้ง5ขนาด ไม่มี Page Error/Overflow ใหม่ พร้อม Typecheck/Scoped Lint/Format/Catalog Unit และ Buildแยกผ่าน
- [x] อัปเดตผลจริง/Hash/Backup และปิดเฉพาะ QAที่เริ่มเอง ไม่กระทบDevเดิม

### Missing Information

รอชื่อ/ลำดับ/การจัดกลุ่มหมวดย่อยจริงจากผู้ใช้ภายหลัง ไม่เป็นตัวขัดขวางรอบนี้ซึ่งคง Childเป็นDemo; ไม่มีข้อมูลจำเป็นอื่นที่ขาด

### Approval Record

ผู้ใช้วันที่2026-11-04แจ้งให้ปรับหมวดหลักเป็น5ชื่อข้างต้น และตอบคำถามขอบเขตอย่างชัดเจนว่า “เชื่อมสินค้าตาม 5 หมวดจริงด้วย” หลังอธิบายว่าจะขยาย `/products` จาก74รายการเป็นทั้ง5กลุ่ม ถือเป็นการอนุมัติส่วนที่เปลี่ยนตามคำขอนี้ ส่วนหมวดย่อยยังเป็นตัวอย่างตามขอบเขตเดิม

### Current State

สำรอง7ไฟล์ก่อนเริ่มไว้ใน `output/product-main-categories-20261104/before-files.zip` พร้อม SHA256; งานหน้าProductรอบก่อนและประวัติด้านล่างยังรักษาไว้ ผล74รายการ/6หมวดของงานก่อนถูกแทนเฉพาะขอบเขตที่ผู้ใช้ยืนยันในรอบนี้

- `/products` ใช้5ชื่อ/ลำดับที่ผู้ใช้ระบุแล้ว Membershipมาจาก getCatalogPageเดิมผ่านServer ไม่แบ่งหมวดหลักด้วยการวนสินค้าอีก; หน้าAllรวม150รายการ เริ่ม24และโหลดเพิ่มได้จนครบ
- ตรวจBrowser MembershipทุกParentกับClassificationเดิมจากAPIแล้วตรงกันทั้ง74/7/23/3/43รายการ ไม่มีซ้ำหรือหลุดกลุ่ม; Children01–02แบ่งเฉพาะProduct IDsในParentของตัวเองและมีข้อความกำกับเป็นตัวอย่าง
- Dev Regression10/10และProduction Regression12/12ผ่าน ไม่มีFlaky/Skipped รวม5ขนาด320/390/768/844Landscape/1440, Parent–Child reset/Search/Sort/Grid–List/Featured/Compare3/Global Search/Categoryเดิม/API/404 ที่เลือกตรวจ ไม่อ้างFull E2E Suiteผ่าน
- Build webpackผ่าน420หน้าบนNode24.22.1; Typecheck/Scoped ESLint/Formattingผ่าน Catalog Unit50/50ผ่าน Production QAใช้Snapshot FallbackและPlaceholderเฉพาะProcess ไม่แก้Env/Database
- ตรวจภาพDesktop1440×1300/Mobile390×844และผลResponsiveทั้ง5ขนาด ชื่อหมวดจริงแสดงครบ และPOSแสดง3เครื่องบันทึกเงินสดจริง Sourceแอป4ไฟล์ตรงHashกับQA
- หลักฐาน: `output/product-main-categories-20261104/delivery.md`, `dev-tests.json`, `production-tests.json`, `catalog-unit.log`, `build.log`, `observed-membership.json`, `source-hashes.json`, `categories-desktop.png`, `categories-mobile.png`, `pos-mobile.png` และภาพResponsiveในโฟลเดอร์ผลTest
- ปิดQA3166 PID45564ที่เริ่มเองแล้ว ยืนยันไม่มีListener3166 เก็บDev3000 PID15684เดิมไว้ ไม่มีCommit/Push/Deploy ไม่มีFramework issueใหม่ที่เข้าเกณฑ์Next feedback ข้อจำกัดDetail TestและCase-only Slugจากงานก่อนยังอยู่นอกScopeและไม่ได้อ้างว่าแก้แล้ว

## Task: HoN-inspired product category mock (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done — new page verified; pre-existing detail-layout test limitation documented"

### Goal

นำโครงสร้างการเลือกหมวดหลัก → หมวดย่อย → รายการจาก https://heroesofnewerth.com/learnatorium/heroes มาทำ mock สำหรับแทนหน้า `/products` ของ SUNFORD โดยผู้ใช้จะแจ้งหมวดหมู่และหมวดหมู่ย่อยจริงภายหลัง

### Scope In

- ตรวจหน้าอ้างอิงผ่าน Computer/Browser Use รวมการเปลี่ยนหมวดหลัก การเลือกหมวดย่อย ค้นหา ไม่พบผล ล้างคำค้น เปิดรายละเอียด/Back และรูปแบบ Responsive พร้อมหลักฐาน
- จัดทำภาพโครงร่างเพื่ออนุมัติใน `output/catalog-reference-20261104/` ภาพนี้เป็นข้อเสนอแบบนิ่ง ยังไม่ใช่ UI ที่ติดตั้งในแอป
- หลังอนุมัติ: แทน Sidebar/Banner การเลือกหมวดบน `/products` ด้วยหัวเรื่อง ช่องค้นหา การ์ดหมวดหลัก 6 ช่องตัวอย่าง ปุ่มหมวดย่อย และกริดสินค้าตามลำดับอ้างอิง
- ใช้ชื่อกลาง “หมวดหมู่ 01–06” / “หมวดย่อย 01–02” เฉพาะ mock จำนวนช่องเป็นตัวอย่างเลย์เอาต์ ไม่ใช่จำนวนหมวดจริงที่ตกลงแล้ว แสดงข้อความว่าการจัดกลุ่มเป็นตัวอย่าง
- แยก Fixture หมวดหลัก/ลูกและ Product IDs ตัวอย่างออกจากข้อมูลธุรกิจ ใช้สินค้าที่มีอยู่จริงเท่านั้น ไม่อนุมานประเภทใหม่จากชื่อ/ภาพสินค้า ตัวเลือกทั้งหมดแสดงรายการเดิมครบตาม Scope ที่ Server ส่งให้
- รักษาขอบเขตสินค้าของ `/products` ปัจจุบัน (Browser ตรวจพบ 74 รายการ ไม่ใช่สินค้าทั้งระบบ) พร้อมชื่อ รูป รายละเอียด ลำดับตั้งต้น Search/Sort/Grid–List/Featured/Load more และ Compare สูงสุด 3 รุ่น ย้าย Control เดิมให้อยู่ใต้การ์ดหมวดตามความเหมาะสม
- ใช้ Client Component เฉพาะการเลือก/ค้นหา/แสดงรายการ คงการโหลดข้อมูล Server และ ClientProduct projection เดิม

### Scope Out

ไม่กำหนด Taxonomy จริง ไม่บันทึก Fixture ลงฐานข้อมูล/CMS ไม่แก้ Schema/API/Store ส่วนกลาง ไม่เปลี่ยนหน้า Category อื่นหรือ `/products/[slug]` ไม่แก้ Navbar/Footer/Global CSS/Shared Product Card ไม่เพิ่ม Dependency ไม่เปลี่ยนภาพสินค้า ไม่ Commit/Push/Deploy

### UI/UX Brand Alignment

- Reference: หน้า HoN ที่ผู้ใช้เปิดและภาพแนบ ใช้โครงสร้างเลือกหมวด; Brand ใช้ `src/styles/base.css`, ฟอนต์ Noto Thai ที่โหลดใน `src/app/layout.tsx` และ Product Card ที่ใช้อยู่
- Design: SUNFORD red `#d7192d`, ink `#1d1d1f`, muted `#6e6e73`, paper `#f5f5f7`, line `#e5e5ea`, white `#ffffff`; คง Header/Footer และภาพสินค้าต้นฉบับ การ์ดเลือกมีกรอบ/พื้นแดงอ่อนและ Focus ที่มองเห็นได้
- Layout: หัวเรื่อง → ค้นหา → การ์ดหมวดหลัก → ชื่อหมวด/ปุ่มหมวดย่อย → Control/จำนวนรายการ → กริดสินค้า ไม่ใช้ Sidebar เดิมบนหน้านี้ การ์ดหมวดหลัก 4 คอลัมน์ Desktop / 3 Tablet / 2 Mobile; สินค้าใช้ 4/3/2 ตามความกว้างและไม่เกิด Horizontal Overflow ที่ 320px
- Responsive: หลังลงมือ ตรวจ 320/390/768/1440px และ Landscape844×390 รวมชื่อยาว การ Wrap หมวดย่อย เมนู Search/Compare และการกดบนมือถือ
- ข้อเสนอนี้ปรับ Search ให้ทำงานร่วมกับหมวดตัวอย่างที่เลือกตามรูปแบบ Catalog เดิม ไม่คัดลอก Global Search ข้ามประเภทเนื้อหาของ HoN เพราะรอบนี้เป็นหน้า Product mock

### Input / Output

- Input: คำขอผู้ใช้วันที่2026-11-04, HoN reference, Source และสินค้าที่ Server ของ `/products` ส่งอยู่แล้ว; หมวดจริงถูกเลื่อนออกจากรอบ mock ตามคำขอผู้ใช้
- Output: รอบเตรียมได้รายงาน/ภาพโครงร่าง/Spec/Plan; หลังอนุมัติได้ Interactive mock บน `/products` โดย URL รายละเอียดสินค้ายังคงเดิม
- Proposed local-only interface: `MockCategory { id, label, subcategories: { id, label, productIds: string[] }[] }`; IDs เป็น `mock-*` และไม่มีการส่งเข้า CategoryId/CMS/Database ตัวเลือก All ใช้ Products input เดิม การเปลี่ยนหมวด Reset หมวดย่อยและ Limit; Query/Sort/Featured ทำงานร่วมกับ Product IDs ของ Fixture และ Count คำนวณจากรายการจริง
- Plan จำกัดการสลับ Component ใน `src/app/(site)/products/page.tsx`; คง `ProductBrowser` เดิมสำหรับผู้เรียกอื่น จึงไม่เปลี่ยน Props/Contracts ของ Route อื่น

### Acceptance Criteria

- [x] ตรวจและบันทึกโครงสร้าง/Interaction อ้างอิงกับ Source เจ้าของหน้าเดิม โดยแยกข้อสังเกตจากข้อเสนอ SUNFORD
- [x] มีภาพโครงร่างแบบนิ่งให้ตรวจ พร้อมรายการไฟล์/ผลกระทบ/วิธีย้อนกลับก่อนแก้แอป
- [x] ผู้ใช้อนุมัติ Spec/Plan ฉบับนี้ก่อนแก้ไฟล์แอปพลิเคชัน
- [x] `/products` ใช้โครงสร้างใหม่และตัวอย่างหมวด/หมวดย่อย เลือกได้ทีละรายการ Reset Child เมื่อเปลี่ยน Parent และระบุชัดว่าการจัดกลุ่มยังเป็น mock
- [x] ทุก Product ID ใน Fixture มาจาก Products input จริง All แสดงชุดเดิมครบ ไม่แก้ข้อมูลหรือสร้างหมวดธุรกิจใหม่ ไม่มีสินค้าหายจาก All
- [x] Search/Sort/Featured/Grid–List/Load more/Empty reset และ Compare3รุ่น ทำงาน; ภาพ/ลิงก์สินค้าตรงข้อมูลเดิม Header Search/Compare ไม่ได้รับผลจาก Mock IDs
- [x] ตรวจ Keyboard/Focus/aria-pressed, Responsive และ Click Targets พร้อมภาพจริงตามขนาดที่ระบุ ไม่มี Overflow หรือ Page Error ใหม่
- [x] Typecheck/Lint/Formatting/Catalog Unit และ Browser Regression ของหน้าใหม่ผ่าน; Build แยกผ่าน420หน้า ชุดรวม14/15 มี Detail Test เดิม1กรณีที่ยืนยันล้มเหมือนก่อนแก้ตามผลด้านล่าง ไม่อ้างว่าชุดรวมผ่านทั้งหมด
- [x] อัปเดตผลจริงและ Source Hash ใน Spec/Plan เก็บ Rollback เฉพาะงานนี้และหยุดเฉพาะ QA Server ที่เริ่มเอง

### Missing Information

- สำหรับ mock: ไม่มีข้อมูลจำเป็นที่ขาด ป้ายและการจับกลุ่มตัวอย่างระบุเป็น Demo และผู้ใช้อนุมัติแนวทางแล้ว
- สำหรับ Taxonomy จริง: รอชื่อหมวดหลัก/ลูก ลำดับ ไอคอนหรือภาพถ้าต้องการ และความสัมพันธ์กับ Product IDs จากผู้ใช้ภายหลัง ไม่เป็นข้อกำหนดที่ Agent แต่งแทน
- ก่อนนำ Taxonomy จริงเข้าระบบต้องอัปเดต Spec/Plan และรับอนุมัติส่วนนั้นอีกครั้ง

### Approval Record

ผู้ใช้อนุมัติวันที่2026-11-04: “อนุมัติครับ ลงมือแทนหน้าโปรดักต์เดิมตาม Spec/Plan นี้ได้เลย ใช้หมวดหมู่ตัวอย่างไปก่อน เดี๋ยวผมแจ้งหมวดหลักและหมวดย่อยจริงภายหลังครับ” ครอบคลุมไฟล์และขอบเขตใน Plan นี้ รวมหมวดตัวอย่างแยกจากข้อมูลธุรกิจ ไม่รวม Taxonomy จริงหรือ Deployment

### Current State / Verification Results

- เปลี่ยน `/products` เป็น ProductCategoryMock แล้ว ใช้6หมวด/2หมวดย่อยต่อหมวดจาก Product IDs ที่ Server ส่งมา แบ่งวนตามลำดับ Input เพื่อสาธิตเท่านั้น ไม่มีความหมาย Taxonomy ธุรกิจ ไม่มี Persistence และไม่ส่ง Mock IDs เข้า Catalog Store ส่วนกลาง
- การเลือกหมวดหลักรีเซ็ตหมวดย่อย/Limit; การเปลี่ยนคำค้น/หมวดย่อย/Featured รีเซ็ต Pagination และ Query จาก Store ภายนอกมี Filter Key ป้องกันคง Limit ผิดชุด การเรียง/กริด–รายการ/เปรียบเทียบใช้ข้อมูลและ Shared Card เดิม
- ตัวเลือกทั้งหมดคง74รายการ เริ่ม24→48→72→74; Browser เปรียบเทียบ Baseline กับหน้าใหม่แล้วชื่อ/คำอธิบาย/ลิงก์/Alt และลำดับ74รายการตรงกันทุกจุด หมวดหลักทั้ง6เป็น Partition ของชุดเดิม และ Childrenทั้ง2เป็น Partition ของ Parent ทุกหมวด
- Dev Browser10/10ผ่าน; Production Snapshot Browser ชุด15กรณีได้14ผ่าน ไม่มี Flaky/Skip โดยหน้าใหม่10/10ผ่าน รวม Keyboard/Focus/Hit Targets/ไม่มี Overflow/Page Error ที่320×800,390×844,768×1024,844×390,1440×1000 และ Global Compare3รุ่น/Search/Navigation/API/404 ที่เลือกตรวจผ่าน
- ข้อจำกัดก่อนงาน: `product-overview.spec.ts` คาดจุดเริ่มส่วนรายละเอียด y≥767 แต่ได้766 ที่1366×768 ยืนยันล้มแบบเดียวกันบน Baseline Production ที่185/186 Application Filesตรงกับ Source ปัจจุบัน อีก1ไฟล์คือ Route `/products` ที่ตรง Backup ก่อนแก้ ไม่มีการแก้ Detail CSS หรือปรับ Assertion ให้ผ่าน
- Test เดิมใน `catalog.spec.ts` ที่เริ่มจาก Sidebar บน `/products` ไม่อยู่ในชุดเลือกตรวจของหน้าใหม่ เพราะ UI Contract นั้นถูกแทนตาม Spec นี้ Coverage การเลือก Parent/Child และการนำทางจาก Category เดิมกลับ `/products` อยู่ใน `product-category-mock.spec.ts`; ไม่แก้ Test เดิมนอก Files ที่อนุมัติ และไม่อ้างว่า Full E2E Suite ผ่าน
- Build webpackบน Node24.22.1ผ่าน420หน้า; Typecheck/Scoped ESLint/Formattingผ่าน และ Catalog Unit50/50ผ่าน Production QA ใช้ Snapshot Fallback โดยตั้ง Placeholder เฉพาะ Process ไม่มีการคัดลอก Env หรือเขียน Database; Source Application4ไฟล์ตรง Hash กับ QA Build
- ตรวจภาพจริงทั้ง5ขนาดจาก Production พร้อมภาพส่งมอบ Desktop1440×1400/Mobile390×844 ภาพแรกในส่วนนี้เป็นผล Implementation; `mock-proposal.png` ด้านล่างเป็นภาพข้อเสนอเก่า เก็บไว้เป็นประวัติ
- หลักฐานผลลงมือ: `output/catalog-reference-20261104/delivery.md`, `production-tests.json`, `dev-tests.json`, `dev-responsive.json`, `baseline-detail-tests.json`, `inventory-comparison.json`, `source-hashes.json`, `detail-baseline-source-check.json`, `build.log`, `catalog-desktop.png`, `catalog-mobile.png`, `catalog-mobile-results.png`; Backup Route อยู่ใน `before/products-page.tsx`
- ไม่มี Framework issue ใหม่จากงานนี้ที่เข้าเกณฑ์ Next.js feedback; ข้อจำกัด Case-only Slug ที่บันทึกไว้ก่อนหน้ายังไม่ถูกแก้หรือใช้เป็นผลผ่านของรอบนี้
- ปิด QA3164 PID4068 และ Baseline3165 PID35220 ที่เริ่มเองแล้ว ยืนยันไม่มี Listener ทั้งสอง Port; Dev3000 PID15684เดิมยังอยู่ เปิดแท็บ `/products` คืน All74รายการไว้ ไม่มี Commit/Push/Deploy
- บันทึกการตรวจอ้างอิงรอบเตรียมด้านล่างเก็บเป็นประวัติ ไม่ใช่สถานะรอ Implementation ปัจจุบัน
- ตรวจ HoN ผ่าน Browser จริง: หมวดหลักเป็น Link เปลี่ยน Path; หมวดย่อยเป็น Single-select Button ในหน้าเดิม; Heroes All มี110รายการ; Search พบ Arachna แม้เลือก Hard Support ที่ไม่มี Arachna และล้างคำค้นคืนรายการของตัวกรองเดิม; คำค้นไม่ตรงทำให้ Grid ว่าง ไม่มีข้อความอธิบายให้เห็นในบริเวณผลลัพธ์ที่ตรวจ
- ตรวจ Desktop1440×1000: การ์ดหมวดหลัก4คอลัมน์ และ Heroes Grid7คอลัมน์ gap24px; Mobile390×844: การ์ดหมวดหลัก2คอลัมน์ และ Heroes Grid1คอลัมน์ ปุ่มหมวดย่อย Wrap หลายแถว; Tablet ยังไม่มีหลักฐานขนาด768ที่ยืนยันได้ จึงไม่อ้างว่าตรวจครบ
- เปิด Arachna ได้หน้า Detail จริงและ Browser Back กลับ Heroes; ไม่ยืนยันการคง Filter ข้าม Back เพราะ Snapshot ไม่มี Active State ที่ชัดเจน
- ตรวจ `http://localhost:3000/products`: เครื่องชั่ง74รายการ มี24รายการเริ่มต้นและปุ่มดูเพิ่มเติม พร้อม Controls เดิม; Source ใช้ ProductBrowser ที่ถูกเรียกจาก Route อื่นด้วย จึงเสนอแยก Component ใหม่สำหรับหน้านี้
- ตรวจ Stack จาก package.json/package-lock.json/bun.lock: Next16.4.3 React19.3 Prisma7.10.1 TypeScript5 Node24; อ่านคู่มือ Next ที่ติดตั้งเกี่ยวกับ Server/Client Components สำหรับขอบเขตที่จะเสนอ
- ขณะเตรียมข้อเสนอแก้เฉพาะ Spec/Plan และสร้าง Design/Research artifacts ไม่มีการทดสอบแอปฉบับใหม่เพราะยังไม่ได้เขียน; ไม่เริ่ม/หยุด Dev Server ไม่เขียน Database
- Next.js feedback review: ไม่มี Framework issue ใหม่ที่ยืนยันได้จากงานตรวจอ้างอิงรอบนี้ ข้อจำกัด Case-only Slug จากงานก่อนหน้ายังอยู่นอก Scope

## Task: Central Z-Index Scale (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done"

### Goal

รวมค่าลำดับเลเยอร์เป็น CSS Custom Properties กลางตามช่วงที่ผู้ใช้กำหนด จัด Navbar/Dropdown/Tooltip/Modal ให้ตรงบทบาท รักษาลำดับของภาพ ข้อความ และปุ่มภายใน Stacking Context เดิม ไม่ใช้ตัวเลขสูงเพื่อข้ามกล่องแม่

### Scope In

- กำหนด Tokens ใน src/styles/base.css: Background -2 / Decoration -1 / Base0, Local/Layout10–50, Dropdown/Tooltip100–500, Modal1000–5000 และ Critical9999
- ย้าย z-index ทั้ง26ไฟล์ CSS และ zIndex ใน2ไฟล์ Animation เดิมมาใช้ Tokens ตามรายการใน plan.md รักษาลำดับสัมพันธ์ของ Local Layers รวมส่วนที่ยังไม่ได้ Mount โดยไม่เปิดใช้ฟีเจอร์เหล่านั้น
- ตรวจ Header กับ Body Portal จริง หาก Outer Site Wrapper แยก Context จน Layout30ทับ Header40 ให้ยกเลิกเฉพาะ isolation ของ Wrapper นั้น โดยรักษา Context และพื้นหลังของแต่ละ Section พร้อม Regression ก่อน/หลัง
- Navbar ปกติ40, Backdrop ของเมนู100, Header ขณะเปิดเมนู110ทั้ง Desktop/Mobile, Submenu120, Header Controls130 ภายใน Header, Tooltip200, Compare Bar50; ลด Hero Portal เดิม2000เป็น Layout30 และเลิก Header2001
- Modal / Customer Map Dialog ใช้1100และ ::backdrop1000 โดยคง showModal() / Native Top Layer และ Portal ของ Tooltip ภายใน Dialog; จอง Critical9999สำหรับ Skip Link/Contact Widget เดิม ไม่สร้าง Widget ใหม่
- ตรวจ Click/Hit Targets, Focus, Escape, Outside Click, Scroll, Responsive, Hero ไม่บังเนื้อหา และภาพส่วนที่ใช้ Local Layers

### Scope Out

ไม่เปลี่ยน Design/เนื้อหา/Routes/Data Contracts/Dependencies/Media/Animation Timing/Database ไม่เพิ่ม Portal/State/Stacking Context โดยไม่มีสาเหตุที่ตรวจพบ ไม่เพิ่ม Live Chat/Cookie/Loading UI และไม่ Deploy

### UI/UX Brand Alignment

- Reference: ช่วงเลเยอร์และ Best Practices ในคำสั่งผู้ใช้, CSS/Component ปัจจุบันและ Brand Tokens เดิม
- Design: สี Layout Typography Interaction เดิม เปลี่ยนเฉพาะลำดับเลเยอร์ตามบทบาท; Local Tokens เปรียบเทียบกันภายในกล่องแม่ ไม่ใช่ลำดับทั่วทั้ง Document
- Responsive: 320/390/768/1440px และ Landscape844×390 ตรวจ Navbar เปิด/ปิด Modal และภาพ Hero/Catalog/About/Contact ที่เกี่ยวข้อง

### Input / Output

- Input: คำสั่งล่าสุดและ Source Working Tree ที่มีงาน Non-blocking Logo ก่อนหน้า; Stack ตรวจจาก package.json/Lockfiles Next16.4.3 React19.3 TypeScript5 Node24
- Output: Source ใช้ Tokens กลาง พร้อม Regression/ภาพ/เอกสารแผนผังเลเยอร์และ Rollback ไม่มี Interface/Props/API Contract เปลี่ยน
- Native Dialog อยู่ใน Browser Top Layer ซึ่งแยกจาก Document z-index จึงคงอยู่เหนือ Critical9999 ของหน้าปกติ ไม่ทำให้แชททะลุ Modal ที่กำลังใช้งาน

### Target Files

รายการ Path ที่อนุญาตทั้งหมดอยู่ใน Files ของ Task ชื่อเดียวกันใน plan.md รวม26 CSS ที่เปลี่ยนเลข /1 Outer Context CSS /2 Animation Sources, Regression และ Test เดิมที่ปรับ Contract/Locator, spec.md/plan.md และหลักฐานใน output/z-index-scale-20261104/

### Acceptance Criteria

- [x] ค่าตัวเลขสำหรับ CSS z-index อยู่ใน Tokens กลางและช่วงที่กำหนด ทุก Reference รวม WAAPI มีตัวแปรรองรับ ไม่เหลือ2000/2001หรือเลข Inline ที่ไม่มีชื่อ
- [x] เนื้อหาทั่วไปใช้ auto/0 ตามเดิม Local10–50รักษาลำดับเดิม ภาพตกแต่งติดลบยังอยู่ภายในกล่องแม่ที่ตั้งไว้ ไม่ถูกยกขึ้นข้าม Navbar
- [x] Navbar/Backdrop/Submenu/Tooltip อยู่ในช่วงที่ถูกต้อง เมนูและ Header Controls คลิกได้จริงระหว่างเปิด/ปิด รวม Mobile และ Escape/Outside Click/Keyboard
- [x] Search/Compare/Video/Customer Map Dialog อยู่เหนือเนื้อหาและตัวอย่าง Critical9999, ::backdrop ทำงาน Focus/Escape/Close ถูกต้อง Tooltip ภายใน Dialog มองเห็นและไม่หลุดไปใต้ Dialog
- [x] โลโก้ไม่บัง/รอเนื้อหา ไม่ล็อก Scroll; Hero/Content/Catalog Controls ยังใช้งานได้และไม่มี Overflow ที่ขนาดตรวจ
- [x] Build/Typecheck/Lint/Formatting และ Regression ที่เกี่ยวข้องผ่าน ตรวจภาพจริงและ Source Hash ตรงกับ Production QA ที่ทดสอบ — Layer9/9ผ่าน; ชุดรวมมีข้อจำกัดข้อมูลสินค้าเดิม1กรณีตามรายละเอียดด้านล่าง ไม่อ้างว่าชุดรวมผ่านทั้งหมด
- [x] เก็บงานก่อนหน้าและประวัติเอกสารไว้ มีไฟล์ก่อนแก้/วิธีย้อนเฉพาะส่วนต่าง ปิดเฉพาะ QA ที่เปิดเอง ไม่กระทบ Dev3000เดิม

### Missing Information

ไม่มี ใช้ช่วงเลเยอร์จากคำสั่งผู้ใช้และบทบาทของ Component ที่ตรวจพบ การคง Native Top Layer เป็นเงื่อนไขของ Dialog ที่มีอยู่ ไม่เพิ่มระบบสำคัญใหม่

### Approval Record

ผู้ใช้อนุมัติวันที่2026-11-04: “เริ่มงานได้เลยตามหลักมาตรฐาน” พร้อม Z-Index Scale และ Stacking Context Best Practices ครอบคลุมการรวมตัวแปรและแก้ Shared Styles ที่กำหนดเลเยอร์ใน Plan นี้ เป็นคำอนุมัติสำหรับงานนี้ ไม่ใช่ Rebuild หรือ Deployment

### Current State / Verification Results

- มี23 Tokens ใน src/styles/base.css ย้ายค่า CSS76จุดและ WAAPI2 Expressions มาใช้ชื่อกลาง เพิ่ม Modal/Backdrop Tokens4จุด เนื้อหาทั่วไป auto/0 และลำดับ Local Layers เดิมยังอยู่; ไม่เหลือ Numeric z-index ใน Source CSS
- Regression พบ Outer Wrapper isolation ทำให้ Body Portal30ทับ Header40ได้จริง (context-red-tests.json) เอาเฉพาะ isolation ของ src/components/layout/site-background.module.css ออกแล้ว Test ผ่าน ไม่เพิ่ม Portal/State และไม่เปลี่ยน Context ของ Hero/Footer/Sections
- Production Layer Regression9/9ผ่าน รวมจอ320/390/768/844 Landscape/1440, Portal Hit Test, Native Modal เหนือ Critical9999, Tooltip ใน Dialog และการ Resolve Tokens ใน Orbit WAAPI จริง
- Production Browser ชุดสุดท้าย102/103ผ่านจาก16ไฟล์ รวม Hero/Logo/Navigation/Tooltip/Map/Compare/Contact/Stories/Video/After-sales; Orbit Unit4/4ผ่าน Build webpack420หน้าบน Node24.22.1 และ Typecheck/Lint/Formattingผ่าน
- ข้อจำกัดนอกงานเลเยอร์: Search → /products/feh5ks ได้ชื่อรายการตัวพิมพ์ใหญ่อีกตัวใน Production QA บน Windows ข้อมูลเดิมมีทั้ง Slug feh5ks และ FEH5KS; Prerender Manifest มี2เส้นทางแต่ไฟล์ HTML/RSC เหลือชุดเดียว ยืนยันผลซ้ำ3ครั้ง ไม่แก้ Route/ข้อมูลสินค้าและไม่ลด Assertion ของ catalog.spec.ts
- กรณี Search เดียวกันผ่านบน QA Development ที่ Warm แล้ว1/1 รอบ Cold ก่อนหน้ารอ Compilation เกิน URL Assertion5วินาที; ไม่ใช้ Dev Pass แทนผล Production ที่ยังไม่ผ่าน ข้อจำกัดนี้ต้องจัดการเรื่อง Canonical Slug เป็นงานแยก
- เก็บ Failure ทุกช่วง: Baseline Red7, Green รอบแรก4/7จาก Locator หลังปิด/Keyboard Modality ที่ Test ตั้งไม่ถูก แล้วแก้เฉพาะ Testเป็น7/7; ชุดรวมแรก99/102จาก Test อ้างเมนูเดิม/กริดหน้าแรก/Mascot ที่ถอดไปแล้ว ปรับ Testไปยัง Navigation/Products/Compare Bar จริงโดยไม่เปลี่ยน UI; Refined18/19ก่อนปรับ Tooltip Target สุดท้าย
- ตรวจ12ภาพ Hero/Menu/Search ที่1440/768/390/844 ไม่มี Page Errors/Overflow พร้อมภาพ Map/Contact จาก Regression; Source Application29ไฟล์ตรงกับ QA ทุก Hash ตัวแปรทุกชื่ออยู่ในช่วงที่กำหนด ประวัติ Spec/Plan และ Memory เดิมรักษาไว้
- QA3162/3163หยุดแล้ว Dev3000 PID6824เดิมยังอยู่ ไม่เปลี่ยน Data/Dependency/Media ไม่ Commit/Deploy; ส่วน UI เก่าไม่ได้ Mount เพื่อตรวจ มีเพียง Token/Source Audit และ Orbit Keyframe Test ไม่อ้าง E2E ของฟีเจอร์ที่ไม่ได้เปิดใช้
- หลักฐาน: output/z-index-scale-20261104/delivery.md, summary.json, scope-audit.json, source-hashes.json, visual-evidence.json และ before-files.zip; เตรียม Next.js feedback draft แบบไม่เปิดเผยข้อมูลโปรเจกต์สำหรับปัญหา Case-only Prerender บน Windows ไม่ส่งแทนผู้ใช้

## Task: Non-blocking SUNFORD logo animation (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done"

### Goal

ให้เนื้อหาและลิงก์หลักแสดงตั้งแต่ HTML ส่วนเมนู/วิดีโอพร้อมตาม Hydration ปกติโดยไม่รอโลโก้ SUNFORD ที่เล่นเป็นของตกแต่งในพื้นที่ว่างกลาง Hero ไม่ใช้ Opening เป็นเงื่อนไขรอการแสดงผลหรือ Scroll

### Scope In

- ย้าย S → SUNFORD ไปในช่อง data-hero-logo-space และจางออกเมื่อจบ ไม่เคลื่อนผ่าน Heading/CTA ไป Dock ใน Navbar อีก เพราะโลโก้ Navbar ต้องแสดงตลอด
- เอาม่านเต็มจอ การซ่อน Hero/Navbar, inert และการล็อก Scroll ของ Opening ออก รักษาโทนดำ–แดงที่เพิ่งอนุมัติเป็น Halo ภายในพื้นที่โลโก้เท่านั้น
- ตัด State/Callback ที่ผูกความพร้อมของ Hero และ Video กับโลโก้ ให้ Hero wrapper เป็น Server Component และส่ง Logo Animation ผ่าน ReactNode slot; HeroScene/BrandOpening ยังเป็น Client เฉพาะงานโต้ตอบ/Animation
- คงนโยบาย Reload / Back / Anchor / Reduced Motion / No-JS / Failure และหยุดของตกแต่งเมื่อผู้ใช้เริ่มใช้งาน เพื่อไม่ทิ้งผลกระทบระหว่างเปลี่ยนหน้า

### Scope Out

- ไม่เปลี่ยน Header/Footer, Routes, ข้อความ โลโก้ต้นฉบับ วิดีโอ ข้อมูลสินค้า Dependencies ฐานข้อมูล หรือ Deploy
- ไม่ย้อนงานลด Geometry Reads ของ Hero หรือสีดำ–แดงของงานก่อนหน้า ไม่เปลี่ยน spec-history / Plan เดิมที่เก็บไว้

### UI/UX Brand Alignment

Reference คือคำขอให้โลโก้ไม่บัง/หน่วงเนื้อหา โลโก้เดิมและช่องว่างสำหรับโลโก้ใน Hero เดิม จำกัดภาพและ Halo ให้อยู่ในช่องนั้นทุกเฟรม เมนูและโลโก้ Navbar แสดงตั้งแต่ Server HTML ตรวจ Desktop1440 / Tablet768 / Mobile390/320 และ Landscape844×390 ไม่บังชื่อเรื่อง ปุ่ม หรือข้อความ และไม่มี Overflow

### Input / Output

- Input: คำอนุมัติล่าสุด Source ปัจจุบันรวมงาน Performance และพื้นหลังดำที่ยังไม่ Commit
- Output: ข้อความ/ลิงก์ Hero ที่แสดงได้จาก HTML โดยไม่รอ Image Decode, Fonts, Hydration หรือจบโลโก้ ส่วน Client Interaction/Video ยังต้อง Hydrate ตามปกติ พร้อม Animation ที่ไม่จับ Pointer และข้อมูลก่อน/หลังจาก Production Snapshot
- Interface: HeroScene รับ Logo ReactNode แทน Opening State; Video ขึ้นกับ Visibility / Reduced Motion ไม่ขึ้นกับจังหวะโลโก้ ไม่มี Data/API Contract เปลี่ยน

### Target Files

- src/features/home/components/brand-opening.tsx / brand-opening.module.css — Animation และ Halo ที่อยู่ในช่องโลโก้ ไม่ล็อกหน้า
- src/features/home/components/hero.tsx — ตัด Opening State และส่ง Client Logo ผ่าน Slot จาก Server wrapper
- src/features/home/components/hero-scene.tsx / hero-scene.module.css — ใส่ Slot ในพื้นที่เดิม ให้ Video/Ready ทำงานอิสระ
- tests/e2e/nonblocking-opening.spec.ts — Regression ก่อน Hydration / ฟอนต์ช้า / การใช้งานระหว่าง Animation
- tests/e2e/brand-opening.spec.ts / hero-scene.spec.ts — ปรับ Contract ที่เปลี่ยนโดยตั้งใจจาก Fullscreen Dock เป็น Contained Decoration และ Hero Ready ทันที
- tests/e2e/catalog.spec.ts — ปรับ Assertion พื้นที่โลโก้ และ Assertion เก่าที่ไม่ตรง Baseline (Heading ภาษาไทย / Pagination24) โดยคง Filter/Search/Comparison Tests ไม่เปลี่ยนโค้ดแคตตาล็อก
- spec.md / plan.md — ขอบเขต คำอนุมัติ Checklist และผลตรวจ; หลักฐานอยู่ใน output/nonblocking-opening-20261104/

### Acceptance Criteria

- [x] เมื่อหน่วง JavaScript หรือฟอนต์ Hero Heading, คำอธิบาย, CTA และ Navbar ยังมองเห็นและไม่ถูกโลโก้บัง ไม่ต้องรอ CSS Fail-open
- [x] ระหว่างโลโก้ Pending/Playing ไม่มี inert / Scroll Lock จาก Opening, Pointer ไปถึงปุ่มจริงและเมนู/CTA/Scroll ใช้ได้
- [x] ทุกเฟรมที่ตรวจ โลโก้อยู่ภายในพื้นที่ว่างที่กำหนด ไม่ทับ Heading/CTA หรือบัง Navbar รองรับ Desktop/Tablet/Mobile/Landscape
- [x] Animation เล่น S → SUNFORD แล้วจางออก นโยบาย Back/Reload/Anchor/Reduced Motion/No-JS/Failure และ Cleanup ระหว่าง Navigation ยังถูกต้อง Video ไม่รอ Logo แต่ยัง Pause ตาม Visibility/Preference
- [x] มี Red/Green กับ Baseline เดิม Production ก่อน/หลังใช้ข้อมูล/วิธีวัดเดียวกัน บันทึก LCP/CLS/Errors/ข้อจำกัดและไม่อ้างผล Field Data
- [x] Build, Typecheck, Lint, Formatting และชุด Regression ที่เกี่ยวข้องผ่าน ตรวจภาพจริงและ Hash ของ Source ที่ทดสอบ ไม่รบกวน Dev3000เดิม

### Missing Information

ไม่มีสำหรับงานนี้ ใช้พื้นที่ว่างเดิมและการแสดงผลทันทีตามคำขอ การไม่ใช้ Fullscreen/Docking เป็นการเปลี่ยนพฤติกรรมที่ตั้งใจในงานนี้ แทน Contract Opening เดิมเฉพาะส่วนที่ขัดกัน

### Approval Record

ผู้ใช้อนุมัติวันที่2026-11-04: “งั้นช่วยปรับให้แอนิเมชันโลโก้ SUNFORD เล่นโดยไม่บังหรือหน่วงการแสดงเนื้อหาหลักได้เลยครับ” ครอบคลุมการเลิกบัง/ล็อกหน้าและการแยกจังหวะโลโก้จากเนื้อหา ไม่ครอบคลุม Rebuild / ข้อมูล / Deployment

### Current State / Verification Results

- Hero wrapper เป็น Server Component ส่ง Logo ผ่าน ReactNode slot; HeroScene มี data-ready=true ตั้งแต่ HTML และ Video ใช้ Visibility/Reduced Motion เท่านั้น ไม่รอ Callback จาก Logo
- BrandOpening อยู่ภายใน data-hero-logo-space แบบ absolute / pointer-events:none เล่น S → SUNFORD → Fade ใน1.85วินาที ไม่ซ่อน Header/Hero ไม่ตั้ง inert และไม่เปลี่ยน Overflow ของ Document; Interaction จบของตกแต่งได้ทันที
- Production Snapshot ก่อน/หลังใช้ Node24.22.1 / Next16.4.3 webpack / Chrome156 ข้อมูลเดียวกัน วัด3รอบต่อ Cold/Warm ใน1440×900,390×844 และ1440×900 CPU4 รวม36โหลด
- LCP กลาง Cold Desktop2444→192ms, Mobile2416→160ms, CPU4 3968→576ms; Warm2256→116 / 2240→112 / 3156→256ms ตามลำดับ ค่านี้เป็น Local Production ไม่มี Network Throttling ไม่ใช่ Field Data หรือผลบนมือถือจริง
- หลังแก้18โหลดไม่มี Page Errors/Overflow; CLS Cold สูงสุด0.00109834 (ก่อน0), Warm0 ไม่อ้างว่า CLS เป็น0ทั้งหมด; ช่วง Animation ที่ Active ไม่พบ Frame Gap>50ms สูงสุด34.6ms ไม่รวม Startup/Pending และไม่อ้าง INP/FPS ทั้งเว็บ
- Browser Regression77กรณีตรวจผ่าน: ชุดรวม76ผ่าน และ1กรณีมี Assertion เก่า20รายการที่ไม่ตรง Source เดิม24 แก้เฉพาะ Test แล้วรันกรณีนั้นซ้ำผ่าน ไม่ใช่การรันชุดเต็ม77ผ่านในครั้งเดียว เก็บหลักฐานรอบที่ล้มเหลวไว้
- มี6กรณีใหม่สำหรับ HTML ก่อน Hydration, Fonts ช้า, Search/CTA ระหว่าง Logo และ Header หลังเปลี่ยนหน้า; ก่อนแก้5กรณีแสดง Failure ของ Contract เดิม การรอ HTML/CSS ใน Test ถูกปรับเพื่อแยก Missing DOM ออกจาก Hidden Content
- Typecheck / ESLint / Full Prettier ผ่าน; Catalog Unit50และUAT27ผ่าน; Production Build420หน้า ผ่าน ตรวจภาพ12ภาพที่1440/768/390/844 Landscape และ Geometry ทุกเฟรมใน Regression; Hero Responsive รวม320pxผ่าน
- Application Source5ไฟล์ตรงกับ Production ที่ทดสอบทุก Hash ไม่มี Shared Header/Global Styles/Database/Dependency/Media เปลี่ยน เก็บงานค้างก่อนหน้าไว้ ปิดเฉพาะ QA3160 ส่วน Dev3000 PID6824เดิมยังอยู่ ไม่มี Commit/Deploy
- หลักฐานและข้อจำกัด: output/nonblocking-opening-20261104/delivery.md, summary.json, before.json, after.json, source-hashes.json และ before-files.zip สำหรับคืนเฉพาะส่วนต่างของงานนี้
- Final Next.js feedback reporting pass: ไม่พบปัญหา Framework ที่เข้าเกณฑ์รายงาน

## Task: Premium black brand opening (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done"

### Goal

เปลี่ยนพื้นหลัง Opening โลโก้ก่อนเข้า Hero จากขาวอมชมพูเป็นดำที่เข้ากับสีแดงและดูพรีเมียม ตามคำขอผู้ใช้

### Scope In

- ปรับเฉพาะ .backdrop ใน src/features/home/components/brand-opening.module.css เป็นดำลึก #050505 มีแสง charcoal นุ่มกลางภาพ และแดงเข้มจาง ๆ รอบจุดโฟกัส
- ใช้ CSS gradients เดิม ไม่เพิ่มไฟล์ภาพหรือภาระดาวน์โหลด

### Scope Out

- ไม่เปลี่ยนพื้นหลัง Hero หลัง Opening, โลโก้ สีแดงแบรนด์ #d7192d, ข้อความ, Layout, Timing, Navigation หรือไฟล์ส่วนกลาง

### UI/UX Brand Alignment

- Reference: คำขอผู้ใช้พื้นหลังดำเข้ากับแดงและดูแพง, โลโก้เดิม และ token ใน src/styles/base.css
- Design: ดำเป็นสีหลัก แสงแดงระดับต่ำเพื่อให้โลโก้เด่น ไม่เพิ่มลวดลายหรือข้อความ
- Responsive: ตรวจ Opening ที่ 390, 768 และ 1440px รวมช่วงเปลี่ยนเข้า Hero

### Input / Output

- Input: พื้นหลัง CSS ปัจจุบันใน BrandOpening และคำขอล่าสุด ตีความส่วนเปิดเป็น Opening โลโก้ก่อน Hero
- Output: Opening พื้นหลังดำพรีเมียม ไม่มีการเปลี่ยน Data Contracts

### Acceptance Criteria

- [x] Opening มีพื้นหลังดำเป็นหลักและโลโก้แดงชัดเจน พร้อมภาพ Desktop / Tablet / Mobile
- [x] Timing และตำแหน่ง Logo Docking, Skip, Reduced Motion และ Fail-open เดิมยังทำงาน
- [x] Formatting และ Regression ที่เกี่ยวข้องผ่าน ไม่มี Overflow หรือ Page Errors จากงานนี้

### Missing Information

ไม่มี ผู้ใช้อนุมัติ Spec/Plan แล้ว

### Approval Record

ผู้ใช้อนุมัติวันที่ 2026-11-04: “อนุมัติ แก้ไขพื้นหลังส่วนเปิดตามแผนได้เลย” ครอบคลุม CSS backdrop และการตรวจตามแผน

### Verification Results

- เปลี่ยนเฉพาะ background 2 gradients ใน CSS Module เป็นดำ #050505 / charcoal และสีแบรนด์แดง alpha 0d
- Browser Chrome บน localhost:3000: Opening Regression ผ่าน 12/12 รวม Docking, Delayed Font, Reload, Escape/Tab/Resize, Reduced Motion, No-JS, Anchor และ Hydration Fail-open
- ตรวจภาพ 390/768/1440px ที่ประมาณ 400/900/1450ms รวม 9 ภาพใน output/black-opening-20261104/ โลโก้ชัดและเปลี่ยนเข้า Hero ตามเดิม; Desktop/Mobile regression ยืนยันไม่มี Overflow / Page Errors
- Prettier ของ CSS/Spec/Plan และ git diff --check ผ่าน ไม่รัน Production Build สำหรับการแก้เฉพาะค่าสี CSS
- รอบแรกบน 127.0.0.1 ถูก Dev Origin Protection บล็อกและหยุดหลังพบปัญหา; เปลี่ยน URL ทดสอบเป็น localhost แล้วผ่าน ไม่แก้ Config หรือหยุดเซิร์ฟเวอร์ผู้ใช้
- Final Next.js feedback review: ไม่พบปัญหา Framework ที่เข้าเกณฑ์รายงาน; Dev Origin Protection ทำงานตามการตั้งค่า ไม่มี Commit / Push / Deploy

## Task: Homepage loading and motion performance (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done"

### Goal

ลดเวลาที่ผู้ใช้รอเนื้อหาหลักของหน้าแรกและลดงานที่ขวางเฟรม โดยเทียบ Production Baseline ก่อน/หลัง แยกงานนี้ออกจาก Rebuild plan-v2 ซึ่งยัง Need Information / Pending

### Scope In

- เก็บ LCP / CLS / Long Tasks / จังหวะเฟรมและ Opening บน Production Snapshot ที่ใช้ Node.js 24 และข้อมูล Snapshot เดิม
- แก้ Opening / Hero เฉพาะสาเหตุที่ยืนยันจากการวัด อนุญาตให้ลดช่วงรอและปรับจังหวะเผยเนื้อหาตามคำแนะนำ Performance ที่ผู้ใช้ให้เริ่มทำแล้ว โดยรักษารูปโลโก้ ทิศทางการเคลื่อนไหวและการ Dock ที่ถูกต้อง
- ลดการวัด Geometry / เขียน Style ระหว่าง Scroll หากยืนยันผลกระทบ เพิ่ม Behavioral Regression และทดสอบ Navigation / Responsive ที่เกี่ยวข้อง

### Scope Out

- ไม่ Rebuild หน้าอื่น ไม่เปลี่ยนข้อมูลบริษัท/สินค้า Routes, Database, Dependencies หรือ Deployment
- ไม่ถอด Navbar Glass หรือเปลี่ยนภาพ/วิดีโอตามการคาดเดา ไม่อ้างผลเครื่องจริงหรือผู้ใช้ทั้งหมดจาก Local Benchmark

### UI/UX Brand Alignment

คงธีม โลโก้ ข้อความ Hero และปลายทาง CTA เดิม ลดเวลารออย่างที่ผู้ใช้เห็นจริง รักษา Delayed-font Docking, Skip, Reload / Back, Reduced Motion, No-JS / Failure Fallback และ Video Pause เมื่อไม่อยู่ในจอ ตรวจ Desktop 1440px / Mobile 390px และ Responsive 320/768/1399/1400px ที่เกี่ยวข้อง

### Input / Output

- Input: ภาพ Local LCP4.26s / CLS0 / INP8ms, Source ปัจจุบัน, หลักฐาน Performance เดิม และคำอนุมัติให้เริ่มแก้ไข
- Output: การแก้ Homepage ที่พิสูจน์ด้วยค่า Production ก่อน/หลัง พร้อม Tests และรายงานใน output/homepage-performance-20261104/
- Backend / Data Contracts เดิมไม่เปลี่ยน การปรับ Server/Client อื่นหรือไฟล์ส่วนกลางต้องมีหลักฐานและบันทึกขอบเขตเพิ่มเติมก่อนลงมือ

### Target Files

- `src/features/home/components/brand-opening.tsx` — จังหวะ Opening / Reveal ตามผล Baseline
- `src/features/home/components/hero-scene.tsx` — งานวัดตำแหน่งและการอัปเดตระหว่าง Scroll
- `tests/e2e/home-performance.spec.ts` — Regression พฤติกรรมการรอเนื้อหา/Scroll ที่พิสูจน์สาเหตุ
- `tests/e2e/brand-opening.spec.ts` — ปรับกรณีตรวจจังหวะที่เปลี่ยนโดยตั้งใจ โดยคงการตรวจ Geometry และ Fallback
- `spec.md`, `plan.md` — ขอบเขต ขั้นตอน ผลตรวจและข้อจำกัด
- `MEMORY.md` — บันทึกวิธีแยกเจ้าของงานที่ตัวนับ Performance ตรวจพบ เพื่อไม่ตั้ง Regression Budget ผิดขอบเขต

### Acceptance Criteria

- [x] มี Production Baseline ก่อนแก้และผลหลังแก้ด้วยข้อมูล/เครื่องมือเดียวกันอย่างน้อย 3 รอบต่อกรณี Desktop / Mobile / Desktop CPU4 แยก Cold / Warm และช่วง Startup / Active Opening
- [x] ยืนยันสาเหตุก่อนแก้ มี Behavioral Regression ที่ล้มก่อนและผ่านหลังแก้ และ LCP กลางของกรณีเป้าหมายดีขึ้นจริงโดยไม่ทำให้เนื้อหามองไม่เห็นเพื่อแต่งตัวเลข
- [x] Logo Docking / Delayed Fonts, Skip / Reload / Back, Reduced Motion / No-JS / Fail-open และ Hero Video Behavior ที่เกี่ยวข้องยังผ่าน ไม่มี Page Errors / Overflow จากงานนี้
- [x] การลดงาน Scroll ไม่เปลี่ยนความสูง Hero หรือการเลือก Header Backdrop และไม่เพิ่ม Layout Read ต่อเฟรม
- [x] Production Build, Typecheck, Lint, Formatting และ Regression ที่เกี่ยวข้องผ่าน บันทึกกรณีไม่ผ่านหรือไม่ได้ตรวจตามจริง

### Verification Results

- ลด Opening จาก2850เป็น1850ms และเริ่ม Reveal จาก2350เป็น1350ms รักษา Logo Poses, Font Readiness และ Fail-open เดิม ไม่แก้ CSS, รูป/วิดีโอ, Navbar Glass หรือ Data Layer
- Hero วัดความสูง Header เฉพาะ Resize และรวม Scroll Backdrop Updates ภายใน requestAnimationFrame พร้อมเขียน Attributes เฉพาะค่าที่เปลี่ยน Regression แบบ Scroll ลง/กลับขึ้นลด Header Reads จาก4เหลือ2ครั้งที่ยังจำเป็นต่อ Header Surface Sampling
- Production Snapshot Node.js24 / Chrome156 วัดก่อน18และหลัง18โหลด (3รอบ × Desktop1440 / Mobile390 / DesktopCPU4 × Cold/Warm) LCP กลาง Cold: Desktop3500→2480ms, Mobile3472→2416ms, CPU4 5320→4072ms; Warm3276→2268 / 3364→2348 / 5148→4136ms ตามลำดับ
- CLS0และไม่มี Page Errors / Overflow ทุกโหลดหลังแก้ ช่วง Active Opening ไม่มี Frame Gap>50ms ทั้งก่อนและหลัง จึงไม่อ้างว่าแก้ FPS ทุกช่วงหรือทุกเครื่อง Startup Parsing / Hydration บน CPU4 ยังเป็นข้อจำกัด
- Production Build ผ่าน, Typecheck / Lint / Formatting ผ่าน, Catalog50 + UAT27 + Browser62กรณีผ่าน ภาพระหว่าง Opening และหน้าสุดท้าย Desktop/Mobile ตรวจแล้ว Sourceสองไฟล์ตรง Hash ของ QA ที่ Build และทดสอบ
- หลักฐานและรายงาน: output/homepage-performance-20261104/delivery.md พร้อม before.json, after.json, summary.json, final-tests.json และ source-hashes.json ใช้ Snapshot Data ไม่มีการยืนยันฐานข้อมูล/เครื่องจริงหรือ INP ภาคสนาม ไม่มี Commit / Push / Deploy และ QA3156/3157ปิดแล้ว Final Next.js feedback review: ไม่มีปัญหา Framework ที่เข้าเกณฑ์รายงาน

### Missing Information

ไม่มีข้อมูลที่ขวางงาน Performance เฉพาะขอบเขตนี้ ภาพไม่ได้ระบุ Dev/Production หรือเครื่องที่วัด จึงใช้ Baseline Production แยกใหม่และไม่อ้างว่าเป็นการทำซ้ำเครื่องผู้ใช้ เป้าหมาย LCP2.5s เป็นทิศทาง ไม่ใช่คำรับรองก่อนวัด

### Approval Record

ผู้ใช้กล่าว “เริ่มแก้ไขได้เลย” วันที่ 2026-11-04 หลังข้อเสนอให้ตรวจ Production Trace, ลดเวลารอเนื้อหา Opening และลดงาน Client/Scroll ตามหลักฐาน อนุมัติงาน Performance ตามขอบเขตนี้ ไม่มีการอนุมัติ Rebuild plan-v2, เปลี่ยนข้อมูล หรือ Deploy

## Task: Rebuild SUNFORD Official Website — plan-v2 (2026-11-04)

Status: "Need Information"
Approval: "Pending"
Documentation Approval: "Approved"
Documentation Progress: "Done"

Status / Approval ข้างต้นใช้กับการพัฒนาเว็บไซต์ ส่วนคำขอล่าสุดอนุญาตเฉพาะการปรับ Spec/Plan ก่อน ยังไม่แก้โค้ด หัวข้อนี้แทนร่างงานเว็บไซต์ที่ยังไม่มีบรีฟด้านล่าง โดยเก็บหัวข้อเดิมเป็นประวัติ ค่า Ready to Code ในไฟล์แนบไม่ใช่หลักฐานว่าข้อมูลหรือการอนุมัติครบแล้ว

### Goal

จัดทำข้อกำหนดและแผน Rebuild เว็บไซต์ทางการ SUNFORD จาก `C:/Users/cityc/Downloads/plan-v2.md` ให้ตรงโครงสร้างจริงและ AGENTS.md ครอบคลุมหน้าแรก สินค้า โซลูชัน ซอฟต์แวร์ บริการ เกี่ยวกับเรา ติดต่อเรา และ Navigation / Footer โดยยังไม่เริ่ม Implementation

### Scope In

- รอบเอกสารนี้: ปรับเฉพาะ spec.md / plan.md ตรวจเส้นทางจริงและสิ่งที่มีอยู่ แยกข้อกำหนดที่ยืนยันแล้ว ข้อเสนอจากแผน และข้อมูลที่ยังขาด
- ขอบเขตเว็บไซต์ที่เสนอให้พัฒนาในภายหลัง: หน้าแรก, /products, /products/[slug] และหก Canonical Routes คือ /products, /solutions, /applications-and-softwares, /service, /about-us, /contact-us พร้อม Header / Mega Menu / Footer ที่เกี่ยวข้อง
- ใช้ Stack เดิม: Next.js 16 App Router, React 19, TypeScript 5, CSS Modules และ CSS เดิม, Prisma ORM 7 / PostgreSQL, Node.js 24
- รักษา Brand Consistency ธีมดำ-ขาว-แดง ข้อมูลสินค้า รูปภาพ Routes และพฤติกรรมที่ยืนยันแล้ว ปรับเฉพาะส่วนต่างจากของเดิมที่ Spec/Plan ฉบับพร้อมอนุมัติระบุ

### Scope Out

- รอบนี้ไม่แก้ AGENTS.md, โค้ดเว็บไซต์, Stylesheets, Dependencies, ฐานข้อมูล หรือไฟล์ต้นฉบับ plan-v2.md
- ไม่เพิ่ม Tailwind CSS / UI Library ไม่สร้าง Admin, เปลี่ยน Schema, Migration, Seed หรือ Deploy จากแผนนี้
- ไม่สร้างหน้า Route แยกใหม่เพื่อแทน Catch-all ไม่ลบข้อมูลนำเข้า ไม่เปลี่ยน URL หรือรื้อ Component เดิมโดยไม่มีข้อกำหนดและการอนุมัติเฉพาะ
- ไม่แต่งข้อมูลรับประกัน ชื่อซอฟต์แวร์ Claim มาตรฐาน/การรับรอง รูปภาพ หรือ API และห้ามโฆษณาบริการรับสอบเทียบ (Calibration Service) เพราะ SUNFORD ไม่มีบริการนี้

### Current State / Verified Architecture

- หน้าแรก `src/app/(site)/page.tsx` และแคตตาล็อก `src/app/(site)/products/page.tsx` เป็น async Server Components อยู่แล้ว ใช้ Repository และ Settings ฝั่งเซิร์ฟเวอร์ ไม่จำเป็นต้องเริ่มทำ RSC / Prisma ใหม่ทั้งหมดจากข้อความในแผน
- `/solutions`, `/applications-and-softwares`, `/service`, `/about-us`, `/contact-us` ใช้ `src/app/(site)/[...path]/page.tsx` ซึ่งเลือก Component / Content ตาม Path; การแก้ไฟล์นี้อาจกระทบหน้าสาธารณะอื่นด้วย
- Header จริงคือ `src/components/layout/header.tsx` และ Footer คือ `src/components/layout/footer.tsx` ไม่ใช่ Header.tsx / Footer.tsx; Header รับ Settings ผ่าน SiteHeader และมีหก Canonical Routes ใน navigation.ts อยู่แล้ว
- Repository สินค้าใช้ Prisma ฝั่งเซิร์ฟเวอร์และมี Snapshot fallback เมื่อไม่ตั้งฐานข้อมูล ต้องรักษากฎไม่ดึงสินค้าที่ซ่อน/ลบกลับมาและการแชร์ข้อมูลระหว่าง Server/Client ตาม Contract เดิม
- พบสโลแกน “ความเที่ยงตรง ที่คุณวางใจ” ใน Footer เดิม ส่วนเนื้อหาใหม่และตำแหน่งที่ต้องการเพิ่มยังต้องกำหนด
- รอบนี้ยืนยันจาก Source เท่านั้น ยังไม่ได้ทดสอบ HTTP, ฐานข้อมูลจริง, Build หรือ Browser ของเว็บไซต์

### UI/UX Brand Alignment

- ใช้ Brand Guideline/Reference ที่ผู้ใช้อนุมัติและ Tokens ใน src/styles/base.css รักษาโลโก้ Typography ระยะห่าง รูปสินค้า และ Interaction เดิมจนกว่าจะมีดีไซน์ส่วนต่างที่ชัดเจน คำว่า Rebuild ไม่ใช่รายละเอียด Layout ใหม่
- Mobile-first / Responsive: อ่าน CSS ของ Component จริงก่อนแก้ รักษาความอ่านง่าย Contrast การใช้งานด้วย Keyboard และไม่มี Horizontal Overflow ในขนาดที่กำหนด
- Breakpoints ที่ตรวจพบ: Header เปลี่ยนที่ 1400px; responsive.css มี 1100/900/720/540/380px; About มี 1000/720px และ Contact มี 1100/900/720/600px ไม่ได้ถือว่าทุกหน้าต้องใช้ Breakpoints ชุดเดียวกัน
- ขนาด QA ที่เสนอคือ 320/390/768/1024/1440px และก่อน/หลัง Breakpoints ของ Component ที่เปลี่ยน รวมถึง 1399/1400px สำหรับ Header ขนาด QA เป็นเงื่อนไขตรวจ ไม่ใช่การเปลี่ยน Breakpoints ของดีไซน์
- ก่อน Ready to Code ต้องมีรายการ Section / Layout / Interaction ที่คงไว้และที่เปลี่ยนจริงต่อหน้า พร้อม Reference และข้อมูลประกอบ

### Input / Output

- Input ที่ยืนยันแล้ว: plan-v2.md, AGENTS.md ปัจจุบัน, Source/ข้อมูลที่มีอยู่ และคำยืนยันผู้ใช้ให้ปรับเฉพาะเอกสาร
- Input ที่ยังต้องยืนยันสำหรับเว็บไซต์: ดีไซน์ส่วนต่าง เนื้อหาต่อหน้า กลุ่มโซลูชัน ข้อมูลรับประกัน ชื่อและไฟล์ซอฟต์แวร์ Claim มาตรฐาน และ Contract ฟอร์มใบเสนอราคา
- Output รอบนี้: Spec สถานะ Need Information และ Plan ที่มีขั้นตอนพร้อมรายการตรวจ ยังไม่มี Output เป็นโค้ดหรือเว็บไซต์เวอร์ชันใหม่
- Output หลังอนุมัติในอนาคต: หน้า/พฤติกรรมตาม AC และไฟล์ที่อนุมัติเท่านั้น โดยคงการอ่านข้อมูลฝั่งเซิร์ฟเวอร์และ Client Component เฉพาะ Interactivity

### Target Files

ไฟล์ที่อนุญาตให้แก้ในรอบนี้มีเพียง `spec.md` และ `plan.md` ตารางต่อไปเป็นแผนที่ Source ที่ตรวจพบสำหรับจัดขอบเขตในอนาคต ไม่ใช่รายการอนุมัติแก้โค้ด:

| หน้า / ส่วน          | Source จริงที่เกี่ยวข้อง                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| หน้าแรก              | `src/app/(site)/page.tsx`, `src/features/home/components/hero.tsx` และ Home Components ที่หน้าแรก import                                    |
| แคตตาล็อก            | `src/app/(site)/products/page.tsx`, `src/features/catalog/components/product-browser.tsx`                                                   |
| รายละเอียดสินค้า     | `src/app/(site)/products/[slug]/page.tsx`                                                                                                   |
| Route เนื้อหาร่วม    | `src/app/(site)/[...path]/page.tsx`                                                                                                         |
| โซลูชัน              | `src/features/content/components/solutions-page.tsx`, `src/features/content/data/solutions.ts`                                              |
| ซอฟต์แวร์            | `src/features/content/components/software-catalog.tsx`, `src/features/content/server/content-repository.ts`                                 |
| บริการ               | `src/features/content/components/after-sales-page.tsx`                                                                                      |
| เกี่ยวกับเรา         | `src/features/content/components/about-page.tsx`                                                                                            |
| ติดต่อเรา            | `src/features/content/components/contact-page.tsx`                                                                                          |
| Navigation           | `src/components/layout/header.tsx`, `src/features/cms/components/site-header.tsx`, `src/features/cms/data/navigation.ts`                    |
| Footer               | `src/components/layout/footer.tsx`                                                                                                          |
| Data Layer ที่มีอยู่ | `src/features/catalog/server/product-repository.ts`, `src/lib/prisma.ts`                                                                    |
| Styles ที่มีอยู่     | `src/styles/base.css`, `src/styles/header.css`, `src/styles/footer.css`, `src/styles/responsive.css` และ CSS Modules ของ Component ที่เลือก |

ก่อนขออนุมัติ Implementation ต้องแจกแจงไฟล์ Component / CSS Modules ทุกไฟล์ที่จะเปลี่ยนพร้อมเหตุผล ห้ามใช้ `src/styles/` หรือ “CSS Modules ทั้งหมด” เป็นสิทธิแก้แบบเหมารวม Global Components, Layout และ Stylesheets ต้องได้รับอนุมัติเฉพาะรายการพร้อมผลกระทบ Regression / Rollback

CSS ที่ตรวจจาก Import ของ Component จริง ได้แก่ `src/features/catalog/components/product-browser.module.css`, `src/features/content/components/solutions-page.module.css`, `src/features/content/components/solutions-source.css`, `src/features/content/components/after-sales-page.module.css`, `src/features/content/components/about-page.module.css` และ `src/features/content/components/contact-page.module.css` เป็น Source Map เพิ่มเติม ยังไม่อนุญาตให้แก้ทั้งหมด

### Data Contracts / Interface Notes

- คงการอ่านสินค้าผ่าน Repository และ Prisma ฝั่งเซิร์ฟเวอร์ รักษาการกรองสินค้าที่ไม่เผยแพร่/ลบ การ Cache และข้อมูลที่ส่งให้ Client ไม่ย้าย Prisma ไป Client Component
- คง CMS Settings, Navigation Groups, Content Path / Redirect และ Software Catalog Contract เดิมจนกว่าจะมีข้อกำหนดเปลี่ยนที่อนุมัติ
- “สถานะการรับประกัน” ในแผนยังไม่มีนิยามว่าเป็นเงื่อนไขรายรุ่นหรือสถานะของสินค้าที่ลูกค้าซื้อ ต้องยืนยันความหมายและแหล่งข้อมูลก่อนกำหนด UI/Contract
- ฟอร์มขอใบเสนอราคายังไม่กำหนด Fields, ข้อมูลที่ต้องเก็บ, ผู้รับ, API/Server Action, Validation และผลสำเร็จ/ผิดพลาด ห้ามสร้าง Endpoint หรือจำลองการส่งสำเร็จเอง

### Acceptance Criteria

เอกสารรอบนี้:

- [x] Spec/Plan อ้างอิงแผนแนบ ชื่อ Task และสถานะตรงกัน แยกการอนุมัติเอกสารออกจากเว็บไซต์
- [x] ใช้ Source Path จริง แก้ความคลาดเคลื่อนเรื่อง Header/Footer และ Route ที่ใช้ Catch-all
- [x] ระบุ AC-W01–AC-W10, Regression RG-01–RG-09, Trigger / Baseline / ขั้นตอน Rollback และ Missing Information โดยไม่อ้างว่า Build หรือ Tests ผ่านโดยยังไม่รัน
- [x] AGENTS.md, plan-v2.md, ประวัติ Spec เดิมและโค้ดเว็บไซต์ไม่เปลี่ยน เอกสารผ่าน Prettier / Diff checks

เกณฑ์เว็บไซต์ที่เสนอให้ยืนยันและเติมรายละเอียดก่อนอนุมัติ ทั้งหมดด้านล่างยังไม่ใช่ผลทดสอบผ่าน:

- [ ] **AC-W01 Routes:** หน้าแรก หก Canonical Routes และ Product Slug ตัวอย่างจากข้อมูลจริงเปิดได้ด้วยสถานะ/ปลายทางที่กำหนด หน้าที่ไม่มีอยู่คืน 404; Catch-all และ Redirect เดิมนอกขอบเขตไม่เปลี่ยนจนกว่าจะได้รับอนุมัติ
- [ ] **AC-W02 Navigation / Footer:** Header มีหก Canonical Routes ลิงก์ Footer ไปปลายทางจริง มี Site Header / Footer อย่างละหนึ่งชุด Menu ใช้ Keyboard / Escape / Touch ได้ และเปลี่ยนโหมดที่ 1399/1400px ตามพฤติกรรมเดิม
- [ ] **AC-W03 Products:** Filter, Search, Empty Results และ Comparison ใช้ข้อมูลสินค้าจริงตรงกัน รูป/สเปกไม่หายหรือเปลี่ยนความหมาย สินค้าที่ซ่อน/ลบไม่กลับมาเพราะ Snapshot fallback
- [ ] **AC-W04 Software:** รายการซอฟต์แวร์และไฟล์ดาวน์โหลดตรงรายการที่ยืนยัน ลิงก์รายละเอียด/คู่มือ/วิดีโอเดิมใน Scope ใช้ได้ การเลือกหมวดจากเมนูและ Same-page Hash เปลี่ยน Filter จริง
- [ ] **AC-W05 Company / Service:** About / Service / Contact และกลุ่ม Solutions ตรงข้อมูลที่อนุมัติ ไม่มี Claim ISO / การรับรองที่ยังไม่มีหลักฐาน และไม่มีการโฆษณาบริการรับสอบเทียบ ไม่ลบคำแนะนำการสอบเทียบตัวสินค้าที่ไม่ใช่บริการบริษัทแบบเหมารวม
- [ ] **AC-W06 Brand / Responsive:** Layout / Section ตรง Reference ที่อนุมัติ ผ่านขนาด QA และขอบ Breakpoints ใน UI/UX Brand Alignment ไม่มี Horizontal Overflow และไม่มีเนื้อหา/ปุ่มที่จำเป็นถูกตัดหรือเข้าถึงไม่ได้
- [ ] **AC-W07 Server / Client:** Prisma และการอ่านข้อมูลอยู่ฝั่งเซิร์ฟเวอร์ผ่าน Contract ที่อนุมัติ ใช้ Client Component เฉพาะ Interactivity รักษาข้อมูล Search/Comparison และการแชร์ Payload เดิม ไม่มี Dependency ใหม่ที่ไม่ได้อนุมัติ
- [ ] **AC-W08 Motion / Navigation:** Opening / Logo Docking คงนโยบายเดิม รวม Delayed Fonts, Reload / Back, Reduced Motion และการออกจากหน้าระหว่าง Reveal ไม่มี Page Error หรือ Hydration Error จากการเปลี่ยนแปลง
- [ ] **AC-W09 Warranty / Quote:** ต้องกำหนดเพิ่มหลังตอบข้อ 5–6 ใน Missing Information ทั้งแหล่งข้อมูล Warranty, Fields/Validation, ผู้รับ/ปลายทาง, Success / Error และการรักษาข้อมูลที่กรอกเมื่อส่งไม่สำเร็จ ห้ามจำลองการส่งสำเร็จ; ข้อนี้ยังไม่พร้อมอนุมัติ
- [ ] **AC-W10 Verification:** ผ่าน Typecheck, Lint, Formatting, Tests ที่เกี่ยวข้อง และ Production Build บน Node.js 24 พร้อมหลักฐาน Browser ของหน้าที่เปลี่ยน ระบุ Revision / ข้อมูลที่ใช้ตรวจและข้อจำกัดของผลจริง

### Regression Matrix

รายการนี้อ้างอิงไฟล์ทดสอบที่มีอยู่และอ่านชื่อ/ขอบเขตแล้ว ยังไม่ได้รันในรอบเอกสาร เลือกเฉพาะชุดที่สัมพันธ์กับไฟล์ที่เปลี่ยนและ AC การมีไฟล์ทดสอบไม่ได้พิสูจน์ว่าครอบคลุมทุกเกณฑ์

| ID / AC                        | Trigger / สิ่งที่ต้องไม่ถดถอย                                                                                                       | ชุดทดสอบเดิมและการตรวจเพิ่ม                                                                                                                                                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RG-01 / AC-W01, AC-W02         | Header / Navigation: หก Routes, Keyboard / Escape, Touch, Header Tone และ 1399/1400px                                               | `tests/catalog/navigation.test.ts`, `tests/e2e/navigation.spec.ts`, `tests/e2e/navigation-accessibility.spec.ts`, `tests/e2e/adaptive-nav.spec.ts`                                                                                         |
| RG-02 / AC-W08                 | Home / Opening / Motion: Font Readiness, Docking, Reload / Back และออกจากหน้ากลาง Reveal                                            | `tests/e2e/brand-opening.spec.ts`, `tests/e2e/navigation-reload.spec.ts`, `tests/e2e/home-motion-cleanup.spec.ts`                                                                                                                          |
| RG-03 / AC-W03                 | Catalog / Product: Filter, Search, Empty Results, Comparison และรายละเอียดตามรุ่น                                                   | `tests/e2e/catalog.spec.ts`, `tests/e2e/product-detail.spec.ts`, `tests/e2e/product-overview.spec.ts`, `tests/catalog/catalog-pages.test.ts`; เพิ่มการยืนยัน Hidden / Deleted ตาม Repository จริง ไม่ถือว่าชุดเหล่านี้พิสูจน์กฎนั้นครบแล้ว |
| RG-04 / AC-W01, AC-W02, AC-W05 | Catch-all / Layout / Footer: หน้า About, Software และ Warranty เดิมเปิดได้ ไม่มี Header/Footer ซ้ำ และ Route / Redirect อื่นไม่เสีย | `tests/e2e/source-content.spec.ts`, `tests/e2e/route-isolation.spec.ts`, `tests/e2e/public-paths.spec.ts`; เลือกหน้า Catch-all นอกงานจากข้อมูลจริงมาเก็บ Baseline ด้วย                                                                     |
| RG-05 / AC-W04                 | Software: Download / Detail / Manual / Video และ Category Hash                                                                      | `tests/e2e/software-catalog.spec.ts`, `tests/e2e/navigation-accessibility.spec.ts`                                                                                                                                                         |
| RG-06 / AC-W05                 | Service / Contact: คำแนะนำบริการ Tabs / Keyboard ข้อมูลบริษัทและ Map Links                                                          | `tests/e2e/after-sales.spec.ts`, `tests/e2e/contact-locations.spec.ts`                                                                                                                                                                     |
| RG-07 / AC-W03, AC-W07         | Repository / Client Boundary: Payload ไม่ทำสำเนา Description เกินจำเป็น Search / Comparison และข้อมูล Client คงเดิม                 | `tests/catalog/client-payload.test.ts`, `tests/e2e/client-payload.spec.ts`; ตรวจ Data Flow ฝั่งเซิร์ฟเวอร์เพิ่มจาก Source/Build                                                                                                            |
| RG-08 / AC-W06                 | Shared CSS: Layout / Overflow / Focus ก่อนและหลัง Breakpoints                                                                       | ตรวจ Browser / Screenshot ตามขนาด QA และใช้ Case Responsive ของชุดที่เกี่ยวข้อง ห้ามถือว่าผ่านเพราะมี Screenshot เพียงขนาดเดียว                                                                                                            |
| RG-09 / AC-W09                 | Warranty / Quote Form ใหม่: Success, Error, Validation และผู้รับจริง                                                                | ยังไม่มี Contract และชุดทดสอบฟอร์มที่ยืนยันในรอบนี้ ต้องกำหนดกรณีทดสอบและไฟล์ที่จะแก้ใน Plan ก่อนอนุมัติส่วนนี้                                                                                                                            |

ก่อนใช้ชุดเดิมเป็นเกณฑ์ต้องตรวจความตรงกับ Spec ปัจจุบัน เช่น source-content.spec.ts มีชื่อ Case เรื่อง Curtain เดิม ต้องอ่าน Assertion และเทียบ Baseline ก่อนเลือกใช้ ห้ามแก้ Expectation เพื่อกลบ Regression หรือสรุปว่าทั้งไฟล์ใช้ได้โดยไม่ได้ตรวจ

### Impact / Rollback Requirements

- Blast radius ของงานเว็บไซต์รวม Catch-all, Header/Footer และ Global Styles ที่อาจกระทบหน้าสาธารณะนอกงาน จึงต้องมี Baseline ของหน้าตัวแทนก่อนเริ่มโค้ด
- ก่อน Implementation เก็บรายการไฟล์ สถานะ Git, ส่วนต่าง Staged/Unstaged, สำเนาต้นฉบับและ Hash รวมไฟล์ Untracked ที่เกี่ยวข้อง บันทึก Path สำรองจริงนอก Source Tree และ Revision ที่ใช้ ห้ามสำรอง Source ไว้ใต้โฟลเดอร์ที่ TypeScript นำไป Compile
- Trigger ย้อนกลับ: AC ที่อนุมัติไม่ผ่านเพราะงานครั้งนี้, Build ล้มจากการเปลี่ยนแปลง หรือ Shared Component / Route นอกงานถดถอยแล้วแก้เฉพาะจุดไม่ได้
- ย้อนเฉพาะส่วนต่างและไฟล์ที่สร้างโดยงานนี้จาก Baseline ก่อนเริ่มงาน ไม่ใช้ HEAD แทน Baseline เมื่อมีงานค้าง และไม่ใช้ git reset / git checkout ทั้งชุด หากไฟล์เดียวกันมีงานซ้อนให้เก็บงานนั้นก่อนคืนส่วนที่เกี่ยวข้อง
- หลังย้อนกลับ ตรวจ Diff เทียบ Baseline และรัน Checks / Regression ที่ตรงส่วนที่ย้อน พร้อมหลักฐานว่าพฤติกรรมเดิมกลับมา ไม่รวม Database / Production Rollback เพราะแผนนี้ไม่อนุมัติให้เปลี่ยนข้อมูลหรือ Deploy

### Missing Information

ไม่มีข้อมูลที่ขาดสำหรับการปรับเอกสารรอบนี้ แต่ก่อนพัฒนาเว็บไซต์ต้องยืนยัน:

1. Rebuild ต้องเปลี่ยน Section / Layout / Interaction ใดของแต่ละหน้า และส่วนใดต้องคงไว้? ต้องมี Reference ของดีไซน์ใหม่เพื่อไม่รื้อสิ่งที่มีอยู่จากชื่อแผนอย่างเดียว
2. เนื้อหา รูปภาพและการจับคู่สินค้า/โซลูชันของกลุ่มร้านอาหาร ตลาดสด โรงงาน แล็บ ฟาร์ม ใช้ข้อมูลใด? รายการใดในของเดิมที่ยืนยันให้ใช้ต่อ?
3. ข้อความ “มาตรฐาน ISO 17025 และชั่งตวงวัด” อ้างถึงบริษัท ห้องปฏิบัติการ หรือผลิตภัณฑ์ใด และมีหลักฐาน/ข้อความที่อนุมัติให้เผยแพร่อะไรบ้าง? ไม่ถือว่าแผนแนบยืนยันการรับรองแล้ว
4. “SUNFORD Connect POS” เป็นชื่อผลิตภัณฑ์/ซอฟต์แวร์ใดใน Catalog และใช้ไฟล์ดาวน์โหลด เวอร์ชัน ข้อความและลิงก์ที่ยืนยันแล้วจากที่ใด?
5. “สถานะการรับประกัน” หมายถึงอะไร ใช้ข้อมูลจากที่ใด และแสดงผลเมื่อไม่มีข้อมูลอย่างไร?
6. ฟอร์มใบเสนอราคาต้องมี Fields ใด ส่งข้อมูลไปที่ไหน ใครเป็นผู้รับ และผลสำเร็จ/ผิดพลาด/Validation ต้องทำงานอย่างไร? มีบริการ/Contract เดิมให้ใช้หรือไม่?

ข้อมูลที่ขาดเหล่านี้ขวางเฉพาะ Implementation ไม่ขวางการส่งมอบเอกสารนี้ เมื่อกำหนดครบจึงปรับ Status เป็น Ready to Code และขออนุมัติ Spec/Plan ฉบับสมบูรณ์

### Approval Record

ผู้ใช้ส่ง plan-v2.md แล้วให้ดำเนินการตามแผน จากนั้นยืนยันขอบเขตวันที่ 2026-11-04 ว่า “ปรับ Spec/Plan ก่อน ยังไม่แก้โค้ด” จึงอนุมัติเฉพาะการแก้ spec.md / plan.md การพัฒนาเว็บไซต์และไฟล์ส่วนกลางยัง Pending ห้ามอาศัยสถานะในเอกสารแนบหรือการอนุมัติงานเอกสารก่อนหน้าเป็นสิทธิเริ่มโค้ด

## Task: ปรับ Spec และ Plan ให้สอดคล้องกับ AGENTS.md (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"
Progress: "Done"

ความพร้อมและการอนุมัติข้างต้นครอบคลุมเฉพาะงานเอกสารสองไฟล์ ไม่มีการอนุญาตให้เขียนหรือแก้โค้ดเว็บไซต์

### Goal

ปรับ Spec/Plan ให้ตรงกับ AGENTS.md ฉบับใหม่ ทั้งกฎ สถานะ ขอบเขตไฟล์ และการอนุมัติ โดยรักษาประวัติเดิม

### Scope In

- เพิ่มหัวข้องานเอกสารนี้ ปรับชื่อสถานะของร่างงานเว็บไซต์เดิมให้เป็น `Need Information` และปรับ `plan.md` ให้ตรงกัน
- ระบุข้อกำหนดแบรนด์ Stack ไฟล์ส่วนกลาง RSC/Prisma และขอบเขตบริการของ SUNFORD ในเอกสาร
- แยกการอนุมัติเอกสารครั้งนี้จากงานเว็บไซต์ที่ยังต้องมีบรีฟและการอนุมัติของงานนั้น

### Scope Out

- การแก้ AGENTS.md, โค้ดเว็บไซต์, Global Components, Layout, Stylesheets, Dependencies, ฐานข้อมูล และการ Deploy
- การเพิ่มฟีเจอร์หรือเปลี่ยนดีไซน์ตามข้อความตัวอย่างจากบรีฟก่อนหน้า

### UI/UX Brand Alignment

งานนี้แก้เอกสาร จึงไม่มี Layout หรือ Responsive Breakpoints ใหม่ งาน UI ถัดไปต้องยึด Brand Guideline/Reference ที่ยืนยันแล้ว ตรวจ Tokens ใน `src/styles/base.css` และ Style ที่ใช้งานจริง รักษา Interaction เดิม และกำหนดการตรวจ Mobile-first / Responsive จากหน้าจริงก่อนอนุมัติ ห้ามเดาค่า Breakpoints

### Input / Output

- Input: AGENTS.md ปัจจุบัน, Spec/Plan เดิม, MEMORY.md และคำขอให้ปรับเฉพาะเอกสาร
- Output: เอกสารสองไฟล์ที่ตรงกับกฎปัจจุบัน พร้อม AC แผนและผลตรวจ โดยไม่เปลี่ยนพฤติกรรมเว็บไซต์

### ข้อกำหนดจาก AGENTS.md

- Stack: Next.js 16 App Router, React 19, TypeScript 5, CSS Modules / CSS ใน `src/styles/`, Global Styles ผ่าน `src/app/globals.css`, Prisma ORM 7 / PostgreSQL และ Node.js 24 ตรวจเวอร์ชันและสคริปต์จาก package.json / Lockfiles ก่อนงานโค้ด ห้ามเพิ่ม Tailwind CSS, UI Library หรือ Dependency นอก Spec/Plan ที่อนุมัติ
- Performance: ใช้ React Server Components (RSC) เป็นค่าเริ่มต้น ดึงข้อมูลผ่าน Prisma ฝั่งเซิร์ฟเวอร์ ใช้ Client Component (`"use client"`) เฉพาะส่วนที่มี Interactivity จริง
- Integrity: ระบุ Path ทุกไฟล์ใน Plan ก่อนแก้ไข ไฟล์ส่วนกลางที่ต้องอนุมัติเฉพาะรายการ ได้แก่ `src/components/layout/`, `src/components/ui/`, `src/app/layout.tsx`, `src/app/(site)/layout.tsx`, `src/app/globals.css` และ `src/styles/` หากขยายขอบเขตต้องระบุผลกระทบ Regression และ Rollback แล้วรับอนุมัติส่วนที่เพิ่ม
- Company scope: SUNFORD ไม่มีบริการรับสอบเทียบ (Calibration Service) ห้ามใส่ในเมนูหรือโฆษณาเป็นบริการของบริษัท
- Scope: ห้ามแต่งข้อความ รูปภาพ สเปกสินค้า API Endpoint เพิ่มฟีเจอร์ เปลี่ยนดีไซน์ หรือ Refactor นอกขอบเขต รักษา Props, Data Contracts, Routes และการเปลี่ยนแปลงของผู้ใช้
- Workflow: ข้อมูลจำเป็นไม่ครบให้ใช้ `Need Information` ระบุสิ่งที่ขาด ถามผู้ใช้ทันทีและหยุดส่วนที่ต้องใช้ข้อมูลนั้น เมื่อข้อมูลครบจึงใช้ `Ready to Code` ได้ แต่ยังต้องมีการอนุมัติจริงที่ครอบคลุม Spec/Plan ปัจจุบันและบันทึกใน Approval Record ห้ามอนุมัติตัวเองหรือถือความเงียบเป็นการอนุมัติ ใช้การอนุมัติเดิมที่ยังครอบคลุมงานได้โดยไม่ถามซ้ำ
- Verification: อ่านคู่มือ Next.js ที่เกี่ยวข้องก่อนเขียนโค้ด ตรวจตาม AC และความเสี่ยงด้วยสคริปต์โปรเจกต์ งาน UI ต้องมีหลักฐาน Browser / Screenshot ตาม Plan บันทึกผลและข้อจำกัดจริงก่อนส่งมอบ รวมถึงอัปเดต Current State / Data Contracts ที่ได้รับผลกระทบ

### Target Files

- `spec.md` — เพิ่มหัวข้องานเอกสารและปรับชื่อสถานะของร่างเดิม โดยรักษาประวัติส่วนอื่น
- `plan.md` — ปรับ Files, Steps, Impact / Rollback และ Verification Results ให้ตรงกับ Spec

ไม่มีไฟล์โค้ดที่อนุญาตให้แก้ในรอบนี้

### Acceptance Criteria

- [x] Spec ครบ Goal, Scope In/Out, UI/UX Brand Alignment, Input/Output, Target Files, AC, Missing Information และ Approval Record
- [x] ทั้งสองไฟล์ใช้ชื่อสถานะตรง AGENTS.md และแยกการอนุมัติเอกสารจากงานเว็บไซต์
- [x] ทั้งสองไฟล์ครอบคลุม Stack, RSC / Prisma ฝั่งเซิร์ฟเวอร์, Client Component เฉพาะ Interactivity, การคุ้มครองไฟล์ส่วนกลาง และข้อห้ามบริการสอบเทียบ
- [x] Plan มีไฟล์ ขั้นตอน วิธีตรวจ ผลกระทบและ Rollback โดยไม่มีขั้นตอนแก้โค้ดที่เริ่มได้จากคำขอนี้
- [x] ประวัติส่วนอื่นและ AGENTS.md ไม่เปลี่ยน ไม่มีการแก้โค้ดเว็บไซต์ และเอกสารผ่าน Prettier / Diff checks

### Missing Information

ไม่มีสำหรับงานเอกสารนี้ ร่างงานเว็บไซต์เดิมด้านล่างยังเป็น `Need Information` / `Pending` และไม่ขวางการส่งมอบงานเอกสารครั้งนี้

### Approval Record

คำขอผู้ใช้วันที่ 2026-11-04: “ช่วยปรับ spec.md และ plan.md ให้สอดคล้องกับ AGENTS.md ใหม่นี้ด้วยครับ โดยยังไม่ต้องแก้โค้ดเว็บไซต์” อนุญาตเฉพาะเอกสารตาม Target Files งานเว็บไซต์ต้องมี Spec/Plan ของงานนั้นที่ข้อมูลครบและได้รับอนุมัติจริงก่อนลงมือทำ

## Master System Prompt alignment (2026-11-04)

- Aligned `AGENTS.md` with the owner's supplied SUNFORD Master System Prompt. Explicitly require approved Spec/Plan before application edits and prohibit invented copy, imagery, product specifications or API endpoints.
- Added the confirmed company constraint that SUNFORD offers no calibration service; menus and marketing must not advertise one. Added the requested performance strategy: React Server Components by default, Prisma access on the server, and Client Components only for real interactivity.
- Retained the existing brand/mobile-first rules, stack restrictions, protected shared-file scope, Spec/Plan templates and user-approval record requirements, plus generated Next.js instructions, release flow and product-imagery rules.
- This request updates `AGENTS.md` and this project-state entry only. The earlier website-task draft in `plan.md` remains pending actual task details; this Master Prompt does not authorize a website feature or application-code change.

## Task: เตรียม Spec และ Plan สำหรับโจทย์เว็บไซต์ใหม่ (2026-11-04)

Status: "Need Information"
Approval: "Pending"

### Goal

จัดทำข้อกำหนดและแผนงานก่อนแก้เว็บไซต์ Official โดยแยกขอบเขต ไฟล์ที่อนุญาต และเกณฑ์ตรวจรับให้ชัดเจน ขณะนี้ยังไม่มีรายละเอียดงานเว็บไซต์จริง ข้อความใน `<...>` รวมถึงตัวอย่าง About Us / ทีมบริหาร / Download Company Profile เป็นตัวอย่างการกรอก ไม่ใช่ข้อกำหนดที่ยืนยันแล้ว

### Scope In

- เพิ่มหัวข้องานนี้ใน `spec.md` โดยเก็บสถานะและประวัติเดิมไว้
- สร้าง `plan.md` เพื่อแสดงลำดับการเก็บข้อมูล วิเคราะห์ไฟล์ ขออนุมัติ และตรวจรับ
- ระบุข้อมูลที่ยังขาด ก่อนกำหนดขอบเขตการแก้เว็บไซต์จริง

### Scope Out

- การเขียนหรือแก้โค้ดเว็บไซต์ การเปลี่ยนดีไซน์ หรือเพิ่ม Section ตามข้อความตัวอย่าง
- การแก้ Global Components, Shared UI, Layout, Global Styles, Dependencies, ฐานข้อมูล หรือการ Deploy
- การเปลี่ยน Stack หรือเพิ่ม Tailwind CSS จากข้อความตัวอย่าง

### UI/UX Brand Alignment / Requirements

- รักษา Style, Layout, Brand Tokens และ Interaction ของหน้าเดิมตามคำขอ
- การจัดวางส่วนที่จะเปลี่ยน: ยังระบุไม่ได้จนกว่าจะทราบหน้าที่ต้องแก้และเนื้อหาจริง
- Responsive Breakpoints: รอระบุหน้าที่เกี่ยวข้อง แล้วตรวจ Breakpoints จาก CSS ที่หน้านั้นใช้จริงก่อนเสนอค่าตัวเลข ห้ามกำหนดค่าใหม่จากการคาดเดา
- การตรวจ Responsive ต้องครอบคลุมมือถือ แท็บเล็ต เดสก์ท็อป และจุดเปลี่ยน Layout ที่เกี่ยวข้อง โดยระบุขนาดและผลที่คาดหวังใน Spec ฉบับพร้อมอนุมัติ

### Input / Output

- Input ที่ได้รับ: กระบวนการจัดทำ Spec/Plan, ข้อกำหนดให้รักษาหน้าเดิม และเงื่อนไขห้ามแก้โค้ดก่อนอนุมัติ
- Stack ที่ตรวจพบจากโปรเจกต์: Next.js 16 / React 19 / TypeScript 5, CSS Modules และ CSS เดิม ไม่พบ Tailwind CSS ใน `package.json`
- Input ที่ยังขาด: หน้า/ส่วนที่ต้องทำ รายละเอียดการเปลี่ยน ผลลัพธ์ที่ต้องการ และเนื้อหาหรือสื่อที่จำเป็นสำหรับงานนั้น
- Output รอบนี้: หัวข้องานสถานะ `Need Information` ใน `spec.md` และแผนรอข้อมูลใน `plan.md`
- Output ของเว็บไซต์: ยังไม่กำหนด เพราะไม่มีโจทย์จริงที่ยืนยันแล้ว

### Target Files

| ไฟล์      | การเปลี่ยนแปลงที่อนุญาตในรอบนี้                         |
| --------- | ------------------------------------------------------- |
| `spec.md` | เพิ่มหัวข้องาน ข้อมูลที่ขาด และสถานะ โดยรักษาข้อมูลเดิม |
| `plan.md` | สร้างแผนสำหรับงานนี้                                    |

ยังไม่มีไฟล์โค้ดที่อนุญาตให้แก้ ต้องตรวจเส้นทางหน้าและ Component หลังได้รับโจทย์จริง แล้วระบุ Path พร้อมเหตุผลใน Spec/Plan ก่อนขออนุมัติ

### Acceptance Criteria

เกณฑ์สำหรับเอกสารรอบนี้:

- [x] มี Goal, Scope In/Out, UI/UX Requirements, Input/Output, Target Files และคำถามสำหรับข้อมูลที่ขาด
- [x] แสดงสถานะ `Need Information` และ `Approval: "Pending"` โดยไม่ถือว่าข้อความตัวอย่างเป็นคำสั่งแก้เว็บไซต์
- [x] มี `plan.md` ที่ระบุขั้นตอนและเงื่อนไขการอนุมัติก่อนแก้โค้ด
- [x] ประวัติเดิมใน `spec.md` ยังอยู่ครบ และการเปลี่ยนรอบนี้จำกัดอยู่ที่เอกสารสองไฟล์

เกณฑ์ตรวจรับเว็บไซต์จริงยังจัดทำไม่ได้ ต้องได้รับรายละเอียดงานก่อน แล้วเขียนเป็นพฤติกรรมที่ตรวจสอบได้ รวมถึง Layout / Responsive และ Regression ที่เกี่ยวข้อง จึงเปลี่ยนสถานะเป็น `Ready to Code` ได้

### Missing Information

1. ต้องการทำหน้า/ส่วนใด และต้องเพิ่ม แก้ไข หรือลบอะไรบ้าง?
2. ผลลัพธ์ที่ต้องการคืออะไร และมี Reference สำหรับส่วนที่เปลี่ยนหรือไม่?
3. งานนั้นต้องใช้ข้อความ รูปภาพ ไฟล์ดาวน์โหลด ลิงก์ หรือ API ใดบ้าง และแหล่งข้อมูลที่ยืนยันแล้วอยู่ที่ไหน? รายการที่ไม่เกี่ยวข้องให้ระบุว่าไม่ใช้

### Approval Record

ผู้ใช้ขอให้จัดทำเอกสารก่อนเริ่มเขียนโค้ด ยังไม่มีการอนุมัติ Spec/Plan สำหรับการแก้เว็บไซต์จริง ห้ามเริ่ม Implementation จนกว่าข้อมูลครบและผู้ใช้อนุมัติเอกสารฉบับนั้น

## Official website agent workflow (2026-11-04)

- Updated `AGENTS.md` with the owner's Spec-Driven Development rules for the SUNFORD official website: brand consistency, mobile-first verification, approved file scope and protection for shared components/styles.
- Future code changes require a task section in this existing `spec.md`, a file-specific checklist in `plan.md`, `Status: "Ready to Code"` and recorded user approval covering the current Spec/Plan. Missing required inputs use `Status: "Need Information"` and block dependent implementation until the user answers. Readiness and approval are separate; existing explicit approval for the same scope remains valid.
- Included Spec/Plan templates and the existing repository stack: Next.js/React/TypeScript, CSS Modules/global CSS, Prisma/PostgreSQL and Node.js 24. Existing Next.js generated instructions, release rules and product-imagery requirements are retained.
- Scope is agent documentation and this project-state entry. No application code, global styles, dependencies, database records or deployment configuration changes are part of this task.
- Verified scoped Prettier and `git diff --check`; direct file checks confirm required template fields/statuses, existing shared paths, full preservation of the prior agent rules/project history, and changes limited to `AGENTS.md` and `spec.md`. No application tests or build were run for this documentation-only change. Final Next.js feedback review found no framework issue to report.

## Navbar cold-load stability and layer audit (2026-11-03)

- Confirmed one Header and one 58px nav glass surface with blur12px; the closed menu backdrop adds no blur. The opening is a separate intentional overlay. Disabling nav blur retained startup stalls, so no glass layer was removed.
- Fixed three measured issues: surface detection now uses the actual Hero during the blocking opening and resamples on phase changes; carousel measurement reads all card centers before writing visual styles; opening waits for logo decoding and Header font metrics before capturing its docking target. A delayed-font regression reproduced a5.25px final logo jump before the fix. Existing 6s release/7s CSS fail-open and reduced-motion/skip behavior remain.
- Final isolated Node24/webpack snapshot builds420pages. All32 Chrome checks pass (normal opening/tone, delayed fonts, menus/routes, carousel loops/drag/actions, Header scroll, skip/reload/reduced motion/noJS/failure fallback). Actual-write layout instrumentation falls from34 read-after-style-write boundaries in baseline production to≤2 allowed development reconciliations. TypeScript/scoped lint/format/diff pass; all3 application files hash-match tested QA; desktop/mobile screenshots reviewed.
- Lightweight cold-load frame probes at1440/390px and1440px CPU4 record no gap>50ms between active-animation frames (max34.8/7.7/34.7ms). This is a three-run local headless measurement, not a physical-device or universal frame-rate guarantee; initial parsing/hydration is excluded. Earlier geometry-reading probes themselves force layout and are retained as diagnostics, not evidence of overall FPS improvement.
- Evidence: `output/navbar-loading-stutter/`. Production QA uses database-free snapshot fallback; no deployed-site write, dependency/environment/CMS/business-data change or qualifying Next.js framework feedback. OwnedQA3152 stopped; user's dev server retained.

## Deployment formatting excludes browser snapshots (2026-11-03)

- Added `.playwright-cli` to `.prettierignore` after reproducing the release's three YAML formatting failures. The generated files remain unchanged; source formatting checks stay enabled.
- `bun run format:check` and `bun run lint` pass. Prettier's file-info API confirms all six existing browser artifacts are ignored while `package.json` remains included. No production build, commit or deployment was run for this formatter configuration change.

## Looping focus for stories and videos (2026-11-03)

- Both homepage FocusDragScroll collections now keep3central cards clear on desktop and1on mobile≤720px, following the user's correction. Outer previews blur/fade and click into the clear window; clear cards retain native story/video actions. Three copies and a settled-scroll rebase allow looping both directions. Dragging blocks rebasing until release; pointer/touch/keyboard region arrows and viewport/modal changes retain logical selection. Duplicate copies are aria-hidden/tabIndex-1 and hidden entirely withoutJS. Badge styles use logical indices, keeping copies visually consistent.
- Video focus cards override inherited button transform transitions to avoid a measured~6.5px copy-swap scale jump. Final native normal-motion probes cover4rebases at1440/390px: same visible logical items/badgecolors,0blurdelta,maxhorizontalgeometrydelta0.375CSSpx. This measures item continuity, not complete raster equality.
- Final isolated Node24/webpack420page build/typecheck passes. Clean final13Chromecases pass: looping/previews/actions, mouse/touch/keyboard, drag suppression, progressiveblur, data/images, modal retention and noJS. Six viewport widths × two carousels show desktop3/mobile1sharp, nooverflow/0pageerrors; screenshots reviewed. Four appfiles hash-match QA; staticchecks pass. Early tests needed Opening readiness and logical-copy selectors; an initial video action retry and failed probes are retained separately. ExternalYouTubestream playback not reverified; iframe/modal actions verified.
- Evidence/report: `output/looping-focus/`. Concurrent heading alignment preserved. Originaldev retained; ownedQA3144 stopped. No dependencies, storeddata, environment-file edits or deployment. Final Next.js feedback review found no qualifying framework issue; discontinuity was application CSS.

## Smooth opening logo departure into navigation (2026-11-03)

- Frame sampling confirmed the wordmark stayed stationary from 1700–1900ms before restarting with a steep docking ease. Removed that 200ms hold, begin docking at 1700ms and use the gentler existing 0.4/0/0.2/1 ease. Arrival remains 2750ms and completion 2850ms; real Header target, skip/reload policy and reduced-motion behavior remain.
- Eleven Chrome opening regressions pass against existing dev, plus four repeated desktop/mobile runs with new frame assertions proving upward movement/shrinking during the former hold and accurate final docking. TypeScript, scoped lint/format/diff pass; final desktop screenshot reviewed. Initial run could not launch the missing bundled browser; rerun used installed Chrome. No production build/deploy; owned inspection browser closed, user dev retained. Final feedback review: no qualifying Next.js issue.

## Navbar reorganized around real company destinations (2026-11-03)

- Reorganized the existing Header into six roots: สินค้า (`/products`), โซลูชันตามธุรกิจ (`/solutions`), ซอฟต์แวร์ (`/applications-and-softwares`), บริการ (`/service`), เกี่ยวกับเรา (`/about-us`) and ติดต่อเรา (`/contact-us`). The logo remains the homepage link. Products use a four-column mega menu covering scales, indicators/platforms, POS, accessories, consumables and existing guides. Business groups connect actual retail/coffee, production, laboratory, ERP/MES and weighing-data pages. Software uses the existing download catalogue and detail pages. No new landing routes, Top Bar, quote route or calibration service were added; the owner confirmed calibration is not offered.
- Reused the existing navigation item/group contract. Legacy saved menus that do not match the six canonical root paths/order fall back to the new defaults at render time; saved content with the current structure remains authoritative. CMS site/logo data remain in use and stored records were not edited. Duplicate flat mobile utility links are now represented within the relevant groups.
- Mobile uses native details/summary groups with a scrollable drawer and link-triggered dismissal. Desktop ArrowDown enters a submenu; Escape returns focus to the trigger. Contact navigates directly without an empty submenu. Search, comparison, the existing 1400px breakpoint and concurrent Header surface/contrast hook/styles were preserved. The black/red Hero navigation and adaptive internal-page presentation remain part of the existing theme.
- Same-page hash links use documented Link onNavigate cancellation plus a native fragment change, so the software catalogue's hashchange subscription updates its actual filter. Cross-page navigation remains client-side. A runtime regression proved the old stale-filter behavior and verifies all three categories plus Back after the fix.
- Navigation tests exposed a separate unfinished-reveal cleanup failure: Motion stop() tried commitStyles on connected but hidden route-cache nodes. HomeMotion now cancels/clears controls on cleanup and reduced motion. A deterministic paused-reveal navigation test fails before the fix and passes three repeated runs after it; the full suite also includes it.
- Final isolated Node24/webpack snapshot build passes 420 pages. Thirty distinct Chrome checks pass: Navbar/accessibility/real destinations/Header/Back/reload/cleanup (25), search/comparison/live reduced motion (3), and desktop/mobile opening-logo docking (2). Two legacy-menu unit checks also pass. All 67 distinct destination paths return HTTP 200 on the existing dev server and on the production snapshot; filter fragments and guide anchors are checked according to their actual behavior. Eleven widths 320–1920px have no document overflow; desktop/mobile and internal-page menu captures reviewed. TypeScript, scoped ESLint/Prettier and diff checks pass; the five edited application files plus the preserved Header surface dependency match the tested copy.
- Evidence/report: `output/navbar-real-company/`. Functional checks used database-free snapshot data; live dev verification audited read-only destination responses. The initial fragment assertion and a missing dependency in a refreshed QA copy were corrected; unsuccessful intermediate runs are retained as diagnostic evidence, not successful coverage. No CMS/environment-file/business-data writes, dependency changes, commit/push/deploy or user dev-server interruption. Final Next.js feedback review found no qualifying framework candidate.

## Stories and videos headings aligned left (2026-11-03)

- Both homepage heading blocks explicitly align text left and use the main 1180px content width instead of 1120px; existing tablet/mobile gutters remain 32px/20px. Carousel and card styling remain unchanged.
- Chrome checks at 1440/768/390px confirm both headings share left edges at 130/32/20px, computed left alignment and no horizontal overflow. Scoped Prettier/diff checks pass. No production build or interaction retest for this CSS-only change; no qualifying Next.js feedback candidate.

## Cancelled WPK5000 homepage video addition (2026-11-03)

- User cancelled the WPK5000 section added after JC21. Removed only its homepage mount/import, followup styles and generated poster, and restored the original single-spotlight test selectors. JC21 now directly precedes categories again. The supplied WPK5000 MP4 remains available in `public/videos/`.
- Actual Chrome checks at 1440/390px confirm zero WPK5000 mounts, one retained JC21 heading/video, no horizontal overflow and no pageerrors; screenshots reviewed. TypeScript, scoped ESLint/Prettier and diff checks pass. Evidence: `output/wpk-video-after-jc21/removal-verification.json`. Owned verification browser closed; existing dev server retained. No production deployment or qualifying Next.js feedback candidate.

## Homepage support cards removed (2026-11-03)

- Removed the pictured “ALWAYS BY YOUR SIDE / มากกว่าสินค้า คือการดูแลที่วางใจได้” SupportSection mount/import and its HomeMotion wrapper from the homepage, including the four E-Catalogue/customer service/order tracking/warranty cards. Five HomeMotion wrappers remain. The default announcement link now targets `/service` instead of the removed `#support`; dependent scroll/history/Opening tests use the retained `#stories` anchor. Reusable implementation, stored settings and service/warranty routes remain.
- Two actual Chrome SSR checks at1440/390px pass: no removed section/title/illustrations, retained spotlight/category/stories/footer and no horizontal overflow. TypeScript, scoped ESLint/Prettier and diff checks pass. Interaction and revised anchor/history suites were not rerun; no new production build was needed for this mount removal. Evidence: `output/remove-home-support/verification.json`. No new server, data/environment/dependency/deployment changes or qualifying Next.js framework-feedback candidate.

## Navigation glass adapts to light and dark surfaces (2026-11-03)

- Header now switches between white72% glass/dark text on light areas and the existing dark50% glass/light text on dark areas, retaining blur12px. Menus, hover/focus, dividers and shadows share scoped tone tokens; logo remains red. Theme transitions180ms respect reduced motion. Internal SSR defaults light; homepage Hero has a dark no-JS fallback.
- A small client hook samples CSS surface backgrounds at three points beneath the top navigation row, coalescing scroll/resize/route-content changes to animation frames. It ignores Header overlays, handles persistent-layout content replacement and pageshow, and cleans up listeners/observers. It does not analyze image/video pixels or change routing/history.
- Isolated Node24/webpack build420pages/typecheck passes. Twelve relevant production Chrome cases pass, including light/dark scroll handoffs, desktop/mobile expansion, route/history changes, no-JS, search/compare, keyboard/touch and internal-page cleanup. Six viewport widths × four routes produce24 expected tone states with no pageerrors/overflow; desktop/mobile screenshots reviewed. Static checks pass.
- Extra software hash-filter regression failed in the tested snapshot; the concurrent navbar task subsequently added separate same-page hash handling, which was preserved. Surface hook and CSS hash-match QA; current Header differs only by that concurrent handler/link wiring. No claim that its latest behavior was retested here. Evidence/report: `output/adaptive-nav/`. Original dev retained; ownedQA3142 stopped. No business-data/env-file/dependency/deployment changes or qualifying framework-feedback candidate.

## WPK5000, RLS1100 and C1 reference-style 4K videos (2026-11-03)

- Created the three separate clips and chrome model titles explicitly confirmed by the user: WPK5000, RLS1100 and C1. Final files are `C:/Users/cityc/Desktop/รูปเครื่องชั่ง/videos-4k/<model>-chrome-reference-4k.mp4`, each rendered directly at 3840 × 2160, 30fps, 300 frames/10 seconds, silent H.264 High/YUV420p/BT.709 with faststart. Existing source PNGs and website JC21 clip are unchanged.
- Reused the original Studio/ChromeType timing and lighting math from `scripts/render-product-light.py`, rather than inferring motion from prompts. Reference is `public/videos/jc21-panel-aligned-1080p.mp4`: 1920 × 1080, 30fps/10 seconds, locked view and light sweep. Reconstructing its unoccluded JC21 title at seven times gives RGB MAE 0.987–1.066/255. New products retain source alpha/viewpoints and a common ground at 14/15H; height is limited to .66H to preserve complete taller silhouettes. These changed products/titles/layout adaptations are not a 100% pixel-identical copy. Source product PNG detail remains limited by the prior retouch/upscale; typography and video frames are rendered at 4K.
- Decoded and verified all 900 exported frames, metadata, no audio, black outer borders, faststart order, checksums and seven raw-versus-encoded sample frames per clip. Maximum foreground RGB encoding MAE is 1.499/255. No hard cuts or abnormal loop-boundary jump; raw phase0 equals phase1. Exact first/last decoded deltas and comparison evidence are in `verification.json`; final contact sheet was visually inspected.
- Editable deterministic renderer, verifier, source checkpoint and measured style pack are under `output/reference-matched-product-videos-4k/`; delivery notes/receipts/contact sheet are also copied to the Desktop destination's `_reference-match/`. No application media integration, dependencies, environments, live data, commit or deployment changes. Final Next.js feedback review found no qualifying framework issue.

## Compact homepage sizing based on HoN (2026-11-03)

- Measured the live Thai HoN page at 1536×730 CSSpx/100% zoom: role cards roughly 272.5×145.6px, headings20px/body16px. SUNFORD's longer category descriptions made the section much taller despite similar horizontal geometry. Reduced real CSS dimensions and spacing across Hero, Section2, spotlight, category, story/video windows, active brand-story gallery/support artwork and desktop navigation; retained full content, original images/icons/routes/motion and mobile reading sizes. No browser zoom or whole-page transform.
- Category height at1536×730 is634.25px instead of862.59px (26.5%less); full homepage4844px instead of5499px (11.9%less). At1280×720 and1024×768 the category title/cards/artwork/belt also fit below navigation. Product frame retains16:9 and object-fit:contain; narrow/short screens retain natural scrolling without clipping. Hero still ends at the first viewport boundary.
- Final isolated Node24/webpack snapshot build420pages passes. 46distinct production Chrome cases pass (37main plus9motion/fallback after correcting stale photo-control/Opening test assumptions);8interactive layout widths and8latest-dev SSR widths have no horizontal overflow. TypeScript/scoped lint/format/diff checks pass. Eight CSS files match the final snapshot; concurrent navbar IA additions were preserved, while our Header base/glass/size rules match exactly. LatestSSR screenshots reflect the concurrent navigation; its new behavior belongs to its separate task.
- Evidence/report: `output/hon-page-density/`, including before/after/reference measurements, reproducible capture, desktop/mobile images and snapshot boundaries. Original dev retained; ownedQA stopped. No data/environment-file/dependency/deployment changes. Final Next.js feedback review found no qualifying framework issue; the trace-artifact failure belonged to verification tooling.

## HoN navigation backdrop blur fidelity (2026-11-03)

- Re-inspected live HoN desktop/scrolled/dropdown and 390px expanded mobile states: fixed navbar, rgba(17,17,17,.5), blur12px, 0 4px 10px rgba(0,0,0,.9) shadow. Mobile collapse is transparent; desktop dropdown is rgba(17,17,17,.97) with no blur. Reference has no full-page menu blur curtain.
- Supersedes the earlier opaque-base workaround below: removed the solid Header base and extra overlay, made Header fixed above actual content, shared its glass through mobile expansion and removed full-page menu tint/blur. SUNFORD branding, menu sizing, routes and breakpoint remain. Site surface reserves Header height on internal pages; homepage Hero cancels that reservation and extends video behind navigation while keeping foreground/consultation placement and the first-viewport section boundary.
- Isolated Node24/webpack snapshot build passes 420 pages. Final 24 Chrome Hero/Header/navigation cases, TypeScript/scoped lint/format/diff checks pass. Four application files hash-match the tested snapshot. Controlled same-backdrop comparisons at 1440/390px have maximum RGB difference 0 against the observed HoN glass rule; blur-disabled comparisons prove a visible effect. This measures compositing equality, not full-site raster equality. Internal spacing/no-overflow and natural desktop/mobile/menu/scroll screenshots verified. Initial stale Hero copy assertions and one timeout were resolved before the complete successful rerun.
- Evidence/report: `output/hon-nav-blur/`. No live DB/environment-file writes, dependency change or deployment. Final Next.js feedback review found no qualifying framework candidate. Original dev server retained; temporary reference tab closed and viewport reset.

## Additional C1 and black-scale transparent 4K assets (2026-11-03)

- Retouched two new user-supplied photographs with built-in `image_gen`, saving `C1_front_transparent-4k.png` and `SUNFORD_black_kitchen_scale_transparent-4k.png` in `C:/Users/cityc/Desktop/รูปเครื่องชั่ง/`. C1 retains its clear enclosure, pan, markings and `0.00 g` display while the backdrop seen through the enclosure is transparent. The black scale retains its blank top and UNIT/ZERO markings, with no invented model or display.
- Both are 4096 × 4096 RGBA PNGs enlarged with Lanczos3 from 1254px-square AI-retouched masters, with 128px transparent margins. Source copies, native masters, full prompts, manifest and handoff are in the destination's `_retouch-4k-c1-black/`. Handoff identifies AI reconstruction and upscaling rather than native 4K capture.
- Verified dimensions, alpha/margins, output/source-copy hashes and light/dark appearance including C1 enclosure transparency. Previous eight Desktop 4K output checksums are unchanged. No application integration/build/test changes for this media-only request; final Next.js feedback review found no qualifying issue.

## Navigation opening and refresh scroll policy (2026-11-03)

- Added a small root-layout script that runs before hydration. Initial direct homepage visits can play the opening; Back/Forward and client navigation to the homepage skip it. A document-scoped HTML marker also suppresses the pending overlay/header-hiding CSS before a returning Hero hydrates. Opening completion, popstate and pagehide release the opening without replay; the existing timing, skip controls and reduced-motion behavior remain.
- A browser reload temporarily disables native scroll restoration, removes only the URL fragment while preserving path/query, and resets scroll to the top before restoring the previous restoration setting after pageshow. Homepage reloads play the opening at Hero; all other refreshed routes start at their own top. Normal anchor visits and Back scroll restoration remain available. No persistent storage or router/history-state replacement scheme was added; existing history state is preserved when removing a refresh fragment.
- Isolated Node24/webpack snapshot build passes 420 pages. All 21 production Chrome checks pass: ten new navigation/reload checks (desktop/mobile Back and forward/home links, retained product-return position, deep/anchored homepage reload, four internal page reloads and document history traversal) plus eleven existing opening timing/skip/reduced-motion/no-JS/failure-fallback cases. New navigation checks record zero pageerrors/hydration errors. TypeScript, scoped ESLint/Prettier and diff checks pass; all four application files hash-match the tested snapshot.
- Evidence/report: `output/navigation-opening-reload/`. Testing uses the existing database-free snapshot fallback, not a live-database build. An initial baseline attempt used an incomplete older QA build and returned 500 because a required manifest was absent; those three failures are excluded from behavioral evidence. Successful checks ran in a fresh task-specific build. No environment-file/business-data writes, dependency changes or production deployment; owned QA servers stopped and the original dev server retained. Final Next.js feedback review found no qualifying framework candidate.

## Business solutions section removed from homepage (2026-11-03)

- Removed the pictured BusinessSolutions block (heading, POS feature and both accessory/software cards) and its HomeMotion wrapper from the homepage. CategoryFeature now directly precedes BrandStory; six HomeMotion wrappers remain. Removed the footer link to the missing `/#solutions` anchor. Stored section settings, reusable implementation and product/solution routes remain unchanged.
- Updated dependent browser checks to use the retained story section for scrolling and the new wrapper count. Two actual Chrome checks against dev-server SSR pass at 1440px/390px: no removed section/copy/CTA or dangling anchor, direct category-to-story adjacency, retained spotlight/category belt/stories/support and no horizontal overflow. TypeScript, scoped ESLint/Prettier and diff checks pass; other interaction suites were not rerun for this removal. Evidence: `output/remove-home-business-solutions/`. No new server/build/deploy or qualifying Next.js feedback candidate.

## Category card vector icons and more-link removal (2026-11-03)

- Removed the “ดูเพิ่มเติม” link from all four category cards and deleted its unused CSS and client `linkLabel`/photo-icon/href props. Server target resolution still controls the existing product/solution belt membership; product image links and their first-click behavior remain.
- Added four custom inline 32×32 SVG icons: digital scale, connected scale, accessory plug and software/code window. They use a consistent 1.75px rounded stroke, gray at rest and brighter red for the selected category. Decorative SVGs are hidden from accessibility traversal; buttons retain their category labels. Large category artwork and product-belt images remain real SUNFORD photos.
- TypeScript, scoped ESLint/Prettier/diff checks and isolated Node24/webpack production snapshot build (420 pages) pass. Eleven production Chrome cases pass: category selection, four distinct SVGs/no photo icons/no card links, image failure, first-click hardware/software navigation at desktop/mobile widths, touch emulation, Enter/focus/reduced motion, flow, responsive/no-JS and retained spotlight destination. Desktop/mobile card images reviewed.
- Independent product-belt border/radius/glow edits appeared in the working stylesheet after the snapshot and were preserved. The three changed component files and relevant category/icon CSS were verified against the tested snapshot; latest dev-server SSR/CSS checks at 1440/390px also confirm four SVGs, zero card anchors/photo icons, no horizontal overflow and the concurrent 12px belt radius. Evidence is `output/category-icons/`. No CMS/data/dependency/environment-file writes, commit/push/deploy or qualifying Next.js feedback candidate. Owned QA3100 stopped; user dev server retained.

## Category product belt soft red frames (2026-11-03)

- Gave each product thumbnail a thin translucent SUNFORD red border, 12px rounded corners and a gentle red shadow, with a softer red hover border/glow. Tile dimensions stay 70 × 70px; existing pointer/keyboard navigation and belt animation rules remain.
- Formatting/diff checks and actual Chrome computed-style checks at 1440px/390px pass; both native screenshots were visually reviewed. Verified red border, rounded clipping, retained tile size/destination and no horizontal overflow. Evidence: `output/category-belt-soft-red-frames/verification.json`. No JavaScript/build/deploy or qualifying Next.js feedback candidate.

## Dark section scroll handoff without a white seam (2026-11-03)

- The Hero handoff now animates Section 2's inner content rather than its full section. The black background stays opaque and stationary while retaining the existing 750ms content reveal, once-only gate and reduced-motion cancellation. Other section colors/layouts are unchanged.
- A real Chrome fixture mounting the actual HeroScene and SectionTwoVideo reproduced the original 24px gap and faded background at 1440px/390px. After the change, every sampled frame has zero gap, opacity 1 and no section transform; content still animates, completes once and supports reduced motion. Both fixture screenshots were reviewed. Only Next Link/Image elements are adapted in this isolated runtime; it is not a full Next production interaction test.
- Actual dev-server SSR geometry at six widths (320, 390, 768, 844, 1440, 1920px) confirms flush black Hero/video/spotlight/category boundaries and no horizontal overflow. TypeScript, scoped ESLint/Prettier and diff checks pass. Evidence: `output/homepage-section-seams/` (baseline, verification, screenshots and reproducible fixture script). Owned fixture browser/server and inspection tab closed; user dev server retained. No production build/deploy or qualifying Next.js feedback candidate.

## Category belt links activate on first click (2026-11-03)

- Fixed pointer clicks being consumed by the belt's accessibility layout change. The former `:focus-within` rule also matched mousedown, disabled the animation and moved the pressed image away before mouseup. Manual-scroll/static-track styling now only applies when a product link has keyboard-visible focus via `:has(.category-feature-product:focus-visible)`. Hover pause, reduced-motion behavior, native links and destinations remain.
- A real-pointer regression at a nonzero animation phase failed before the fix (homepage URL remained) and passes after it. Ten category Chrome cases pass against the isolated production snapshot, including first-click hardware/software navigation at 1440/390px, first touch tap, Enter activation, focus/reduced-motion, selection, image failure, flow/timeline, responsive and no-JS link availability. Touch coverage is browser emulation, not a physical-device test.
- Node24/webpack snapshot build passes 420 pages; TypeScript, scoped ESLint/Prettier/diff checks pass and shipped CSS matches the production snapshot hash. Evidence: `output/category-direct-links/`, with before/after traces and delivery notes. No app JavaScript, CMS data, schema, dependency or destination changes. Owned QA3100 stopped; user dev server retained. Final Next.js feedback review found no qualifying framework candidate; this was an application CSS event-order issue.

## Spotlight JC21 model color (2026-11-03)

- Colored only the standalone `JC21` in the CMS spotlight title with the shared SUNFORD red token. The remaining title and tagline retain their colors; stored copy and product media are unchanged.
- Scoped ESLint/Prettier and diff checks pass. Actual Chrome at 1440px and 390px confirms `SUNFORD JC21`, red model text (`#d7192d`), original near-white heading color and no horizontal overflow. No playback retest/build/deploy or qualifying Next.js feedback candidate.

## HoN navigation palette applied (2026-11-03)

- Read computed colors from the user's original Thai HoN tab: navbar rgba(17,17,17,.5), blur12px, #cfcfcf links, white hover, rgba(17,17,17,.97) dropdown and 0 4px 10px rgba(0,0,0,.9) shadow. Applied this palette to SUNFORD Header, desktop flyouts/mobile menu, icons, borders and dark curtain; amber focus/compare state follows the reference accent. The SUNFORD logo, navigation structure, sizing, routes and interactions remain.
- Retained the Hero-owned transparency lifecycle and solid #111 fallback for scrolled/internal/no-JS pages. Added a #111 Header base because this sticky layout occupies its own space instead of overlaying the Hero: copying the rgba value alone visibly composited onto white. The final base keeps the displayed nav dark in all states. Contrast-friendly submenu labels are #999; hover text is white.
- TypeScript, scoped ESLint/Prettier/diff checks and final isolated Node24/webpack snapshot build (420 pages) pass. Twelve distinct production browser cases pass: four Hero-scroll/header/search/compare cases, five navigation cases, two no-JS cases and keyboard consultation/internal-route cleanup. Eleven passed in the main run; the guide-link navigation case failed once then passed a targeted rerun, with no functional code changes. Final base-color adjustment was rebuilt and verified through the final production capture, not another full interaction run.
- Final production screenshots/computed-style checks confirm dark base, source palette, desktop/mobile dropdown colors and no pageerrors. Header CSS hash matches the tested final snapshot. Evidence is `output/hon-nav/`; desktop and mobile images reviewed. No new dependency, CMS/environment-file/database writes, commit/push/deploy. Owned QA3100 stopped; user dev server retained. Final framework feedback review found no newly verified qualifying Next.js issue; a single non-reproducing navigation-test failure was not attributed to the framework.

## Business solutions link strip removed (2026-11-03)

- Removed the pictured “เชื่อมต่อกับ Sunford / โซลูชัน ERP / โซลูชัน MES / ดาวน์โหลดซอฟต์แวร์” strip below the business solution cards, plus its unused Link2 import and desktop/mobile CSS. Existing POS, accessories and software cards remain.
- Actual dev-server HTML returns HTTP 200 with no strip or its labels inside `#solutions`, four retained images and all three original card destinations; the footer download link remains. TypeScript, scoped ESLint/Prettier and diff checks pass. Evidence: `output/remove-business-integration-strip/verification.json`. No client interaction or screenshot retest for this markup removal; no new server/build/deploy or qualifying Next.js feedback candidate.

## Category section black background (2026-11-03)

- Set the whole category section to black, with dark charcoal card surfaces, white headings and gray descriptions. Links/accent text use a brighter red for readable contrast; selected borders and existing hover behavior retain the SUNFORD red. Converted outer vertical margins to equal internal padding so the black surface includes spacing around content. Color tokens are scoped to this section; images, selection, belt and other sections are unchanged.
- Formatting/diff checks and actual Chrome SSR/CSS checks at 1440px and 390px pass. Verified black background, white heading, unchanged body ink token, four categories and no horizontal overflow. Gray-copy contrast is 6.70:1 and red-link contrast 5.29:1 against the lightest card tone. Desktop screenshot reviewed; evidence is `output/category-black/`. Checks used JavaScript-disabled markup on the existing dev server; interaction was not rerun for this CSS-only change. No new server/build/deployment or qualifying Next.js feedback candidate.

## Section 2 heading brand colors (2026-11-03)

- Styled the existing “แข็งแรงทนทาน ใช้งานง่าย มีประสิทธิภาพ” heading with white, silver and the shared SUNFORD red (`--red: #d7192d`) respectively. Each phrase stays intact when wrapping on narrow screens; wording, typography and video behavior remain.
- TypeScript, scoped ESLint/Prettier and diff checks pass. Chrome computed-style and bounds checks at 320, 390, 768 and 1440px confirm the three colors, complete text, retained video preview and no horizontal overflow. Screenshot capture did not complete, so visual screenshot review and playback were not reverified. No new server, build/deploy or qualifying Next.js feedback candidate.

## Consolidated category images; duplicate showcase removed (2026-11-03)

- Removed the four black SourceShowcase tiles from the homepage and their renderer, retaining the separate stories/videos exports. Homepage HomeMotion wrappers now total seven. The new category selector receives the existing `HomeImages` from the homepage: CMS slot override first, then the same WPS10KS/RLS1100/TRP-58B/app defaults formerly used by SourceShowcase. The accessories default includes its original RYG-POLE companion image; a CMS accessory image replaces the whole pair just as before.
- Category item contract now includes `image` and optional `companionImage`. The media and icons use the resolved category artwork; the panel remount key follows those resolved image URLs. Removed the unused old category-banner static import module, retaining all original public assets. A black media frame and object-fit:contain display the supplied product artwork without cropping; selection, links, product belt and responsive structure remain.
- TypeScript, scoped ESLint/format/diff checks and an isolated Node24/webpack production snapshot build (420 pages) pass. Twelve production Chrome checks pass: seven category cases, full homepage/images, Hero next-section reveal, original destinations, and two normal-scroll viewports. Verified all four original image URLs, the two-image accessory pair, zero duplicate showcase nodes, photo load/failure recovery and retained belt behavior. Eleven widths 320–1920px have no document horizontal overflow; desktop/accessory/mobile previews reviewed and capture has zero pageerrors/HoN requests. Five changed application files hash-match the tested snapshot.
- Evidence: `output/category-consolidation/`. Live CMS image override wiring was inspected but no live data was written; UI interaction was verified with the production snapshot rather than the existing dev server's pre-existing hydration limitation. The initial QA command briefly used the wrong working directory and was stopped before compilation; the user dev process remained running and returned HTTP200. Completed verification ran in the explicit isolated directory; owned QA3100 was stopped afterward. No environment-file/database edits, added dependencies, commit/push/deploy or qualifying Next.js framework feedback candidate.

## Spotlight action buttons removed (2026-11-03)

- Removed the pictured “ดูเพิ่มเติม” and “ปรึกษาผู้เชี่ยวชาญ” action row from ProductSpotlight and its unused desktop/leading/responsive styles. The title, tagline, description, product media/link and Hero consultation remain. CMS settings are retained for compatibility; no stored content changed.
- TypeScript, scoped ESLint/Prettier and diff checks pass. Chrome verified server-rendered markup on the existing dev server at 1440px and 390px with JavaScript disabled: zero spotlight copy actions, retained heading/tagline/product link and Hero consultation, no horizontal overflow. Mobile screenshot reviewed; evidence is `output/remove-spotlight-actions/`. Playback/hydration was not re-tested for this markup-only removal. No new server, production build/deploy or qualifying Next.js feedback candidate.

## SUNFORD category section adopts HoN role mock (2026-11-03)

- Applied the inspected structure/effects to `CategoryFeature`, retaining SUNFORD's four existing CMS category titles/descriptions, category artwork and destination overrides. Desktop uses a 5:7 choice/media split with bottom-aligned 16:9 media; below 992px media comes first. Cards stay in two columns, hide descriptions below 576px and use the reference's -4px hover lift, 0.3s border/glow transition and selected border, in the existing white/red SUNFORD palette.
- Added a masked 70px product/solution belt with 12px gaps, three repeated groups, the mock's translateX(-50%) linear loop and duration of two seconds per entry in a group. Small collections repeat their own entries to at least 20 slots before generating the three groups. Pointer hover pauses/resumes; selecting a category updates media/items without replacing the track. The source's loop reset geometry remains, so this does not promise a mathematically seamless seam.
- Server-side membership uses the existing `getCatalogPage` for digital/accessories and the dedicated `/product/smart-weighing` content page for the existing MES smart CTA. Explicit CMS product/page targets remain authoritative. Missing/deleted products are not restored from snapshots; only the currently supplied public products are projected as `{id,title,image,href}`. Software entries are extracted from the existing solution cards in the resolved content page. No new CMS fields or stored data changes. Snapshot verification found 74 digital products, 19 smart products, 43 accessories and three software solutions; live CMS counts may differ.
- Native button/Enter behavior and each category destination remain. Repeated belt copies are excluded from keyboard/accessibility traversal. Focus exposes a static horizontally scrollable track; live reduced-motion preference also disables the loop and hides duplicates. These deliberate accessibility adaptations differ from the original div-tabs. Main artwork and ProductImage failure fallback retain their 16:9 frame.
- Node24/webpack isolated production snapshot build passed 420 pages. Eleven membership/catalogue unit tests, ten distinct production Chrome browser cases (seven category, two Section 2 and one full-homepage regression), TypeScript, scoped ESLint, formatting and diff checks pass. Eleven measured widths 320–1920px have no horizontal document overflow. The canonical hardware belt names/images/links match the production `/api/products` data; actual product navigation, image failure recovery, hover/timeline, keyboard, reduced motion and no-JS destinations were exercised. Desktop/mobile images reviewed; no HoN asset requests or pageerrors in the capture.
- Evidence and delivery report: `output/category-hon/`. Existing user dev server on 3000 remains; its pre-existing lack of client interaction prevented dev-mode interaction verification, so the working production snapshot ran on a separate owned QA server. No live-database build, dependency addition, environment-file/database writes, commit/push/deploy. Agent-owned QA server stopped after verification. Final framework feedback review found no newly verified qualifying Next.js issue.

## HoN roles detailed reference mock (2026-11-03; research fixture)

- Inspected the user's live Thai HoN Roles section using Computer Use, REA complete DOM evidence and its observed public JS/CSS/data sources. Created a standalone reference mock under `output/hon-roles-mock/`, with a detailed Thai report and portable HTML/CSS/JS package. No SUNFORD application source, CMS contract or product mapping changed.
- Preserves the actual 5:7 layout at >=992px, media-first order below, two card columns, hidden descriptions below 576px, fixed background, card hover lift/glow, six remounted role videos and the continuous masked hero belt. Belt duplicates the role array three times, uses duration N×2 seconds and the published translate(-50%) keyframe; hover pauses and role changes keep its CSS timeline. Source keyboard/reduced-motion limitations and the inferred non-periodic loop seam are documented instead of silently corrected.
- Verified Thai geometry/font/display at ten widths 390–1920px, actual playback of all six clips, image counts/durations, flow pause/resume and retained timeline; no horizontal overflow or pageerror in the mock checks. Sampled geometry delta is <0.001 CSS px in a matching layout-rounding fixture, not universal raster parity. Portable file entry works. Desktop/mobile previews reviewed. Locale was explicitly verified before replacing the baseline after a test clone redirected to English.
- `report.md`, `README.md`, `manifest.json`, source snapshots/hashes, runtime observations and browser verification record define the evidence and limits. Online HoN artwork/video and full reference CSS are for study; production SUNFORD integration still requires its own content and scoped styles. No app build/deploy or business-data writes; final Next.js feedback review found no qualifying candidate.

## Section 2 external link removed (2026-11-03)

- Removed the pictured “ดูบน YouTube” link beneath section 2 and its unused CSS. Inline click-to-play video remains; preserved the user's current heading “แข็งแรงทนทาน ใช้งานง่าย มีประสิทธิภาพ”. Updated the two existing browser checks: responsive keyboard activation and no-JS preview both pass, with the external link absent. Scoped lint, formatting and diff checks pass. No production build/deploy for this narrow removal; no qualifying Next.js feedback candidate.

## Section 2 YouTube feature (2026-11-03)

- Added `SectionTwoVideo` immediately after the full-screen Hero, marked `data-home-section="2"`, before ProductSpotlight. Uses the supplied video ID `szRD6aOQL_Y`. Title/series were verified with YouTube oEmbed: “ผลไม้สดพรีเมี่ยม ส่งตรงถึงบ้านคุณ! | SUNFORD Biz Talk EP.16”. The separate component uses the HoN reference's centered heading, black section, 16:9 preview and click-to-load inline player; the video remains available at all mobile widths.
- One local boolean replaces the real YouTube thumbnail with the existing project pattern of a `youtube-nocookie.com` iframe only after activation. No player loads initially. Native external YouTube link remains available without JavaScript. No new dependency or CMS/schema change. Hero's next-section reveal now applies to section 2, while later HomeMotion wrappers remain unchanged.
- Verified actual external playback in Chrome (YouTube iframe video readyState 4, paused false, time advancing), four responsive widths down to 320px, keyboard activation, no-JS link, and section ordering. TypeScript, scoped ESLint/Prettier/diff pass; 17 development browser cases pass; the two new section cases also pass against an isolated Node24/webpack production snapshot build generating 420 pages. Previews and playback evidence are in `output/section-two-video/`. No commit/push/deploy, environment-file or database writes. Final Next.js feedback review: no qualifying candidate.

## Spotlight video playback button removed (2026-11-03)

- Removed the pictured circular pause/play button from SpotlightProductVideo, its manual-pause state/event handlers/icon imports and its now-unused CSS module. Automatic playback, poster/error fallback, product link and visibility/reduced-motion gates remain.
- TypeScript, scoped ESLint, formatting/diff checks and the updated Chrome playback regression pass. The browser check verifies looping beyond 35 media seconds, absence of the removed control, offscreen/hidden-document pause and reduced-motion pause/resume. No production build/deployment for this narrow control removal. Final Next.js feedback review: no qualifying candidate.

## Section 1 fits the initial viewport (2026-11-03)

- The video Hero is now designated `data-home-section="1"` and fills exactly `100dvh` minus the measured header height. Its heading and consultation/description remain fixed-size content within the section; the empty logo slot flexes to consume the available middle space instead of forcing a fixed aspect-ratio height. Short viewports use height-aware heading sizes, gaps and padding. CSS header-height fallbacks also match the mobile/tablet header without JavaScript.
- Verified 19 real Chrome Hero/Header cases on the development server, TypeScript, scoped ESLint and formatting/diff checks. Explicit measurements at 1920×900, 1440×900, 1536×730, 390×844 and 844×390 show the Hero bottom and next-section top exactly at viewport height, with CTA and description fully inside and no horizontal overflow; 320px, 768px, 1280px and 1920×1080 are covered by tests. Desktop/mobile screenshots were reviewed; evidence is `output/hero-section-one/`. No new production build was repeated for this CSS layout adjustment; prior video implementation build remains the last production build. No deployment or business-data writes; no qualifying Next.js feedback candidate.

## Video Hero with reserved logo space (2026-11-03)

- At the user's request, removed the foreground scale, its image fallback/product link, studio gradients, contact shadows and moving light layers from Hero. Moved the existing `/videos/sunford-web.mp4` and `/videos/sunford-poster.jpg` from the following BrandFilm section into Hero as one cover background, with a dark overlay for readable text. The separate BrandFilm mount/component/styles are removed; `#brand-film` now identifies the video Hero itself.
- Foreground follows HoN's ordering: two centered heading lines, a genuinely empty non-interactive logo space, consultation CTA, then the existing CMS-aware description. Reserved logo space uses 60% width capped at 620px, 90% at <=576px and the reference logo aspect ratio. No logo, replacement image, border or placeholder copy was inserted. BrandOpening and the Header/navigation remain; the existing one-time reveal now targets the following product spotlight wrapper.
- Hero/Scene interface now accepts only an optional `description` resolved from the first selected slide's `descriptionOverride`; removed product name/image/href props from the client projection. CMS storage/contracts remain unchanged. Video is muted/looping/inline, starts only after Opening, and pauses offscreen, while the document is hidden, or for live reduced-motion preference. Poster keeps static/no-JS/failed-video presentation readable.
- Verified TypeScript, scoped lint/format/diff, isolated Node24/webpack snapshot production build (420 pages) and 31 production browser cases covering seven viewport shapes, empty center/no Hero image, single film placement, Opening and failed hydration, actual playback and pause gates, native background-tab visibility, no-JS, video load failure, focus/CTA and Header/search/compare. Normal-motion playback evidence and desktop/mobile screenshots are under `output/hero-video/`. No commit, push, deployment, environment-file or database writes. Final feedback review found no qualifying Next.js framework issue.

## HoN report layout adaptation implemented (2026-11-03)

- Applied the inspected composition using SUNFORD's existing studio, copy, product artwork and CMS contracts. Hero now follows heading → product → description/consultation in one centered DOM at all widths. Artwork uses 60% width capped at 620px, 90% at <=576px; Hero has an 80svh minimum above 768px and natural content height below. Removed obsolete Hero layout/control CSS while retaining Opening, image fallback, product links and automatic lighting gates.
- Public navigation now switches at 1400px; crossing this breakpoint closes the old menu state. Existing sticky header, desktop submenus, mobile scrolling limit, search and comparison workflow are retained. CategoryFeature uses a 5:7 choice/media layout from 992px, with two readable choices per row and media first below 992px. Default selection is the first category; all descriptions/links remain readable without JavaScript. Current category artwork changes on explicit button selection. BusinessSolutions uses equal columns from 992px and one column below. Global containers and other homepage sections remain unchanged.
- TypeScript, scoped ESLint, production snapshot Node24/webpack build (420 pages), 42 production browser checks, plus a separate mobile-landscape case are verified. Ten viewport measurements show no document horizontal overflow. Browser checks cover Opening/hydration failure, menu boundary changes on three routes, search, explicit compare sessions, category image loading/selection, links/no-JS, image failure/delayed loading, motion and existing solutions. Some old tests expected the previous desktop breakpoint, removed category overlays, fixed wheel distance or an obsolete comparison action; assertions now follow the current user workflow.
- Evidence and previews: `output/hon-layout/`. Snapshot build is isolated outside the repo with the existing database-free fallback; live database production output and Lighthouse/real-device/actual browser-zoom behavior were not benchmarked. No new dependency, video, business-data write, commit/push/deploy. Final Next.js feedback review found no qualifying framework candidate; the first isolated build lacked recently added public manifests and passed after synchronizing its public directory.

## Heroes of Newerth layout inspection (2026-11-03; research only)

- Inspected the user's open English homepage through Computer Use and captured the same URL with REA in temporary Chrome profiles. Read published CSS and measured ten viewport widths: full navigation starts at 1400px, content columns at 992px, Hero min-height is removed at <=768px and logo width changes at <=576px. No document horizontal overflow in the measured cases; report records viewport rounding and capture limitations.
- Evidence, desktop/mobile screenshots, exact published CSS and a SUNFORD adaptation plan are under `output/hon-inspection/`, with `report.md` as the handoff. Verified screenshot dimensions/SHA-256 against REA and complete DOM capture. This is an investigation, not a homepage redesign or a claim of complete site/pixel parity. No application, dependency, database or deployment changes. Final framework feedback review found no qualifying Next.js issue.

## Floating mascot removed from public pages (2026-11-03)

- Removed the shared Footer's FloatingContact mount and its unused imports. Public pages no longer render the mascot, close button or mascot contact panel; regular footer contact links remain available. Unmounted mascot source/assets are retained.
- Verified TypeScript, scoped ESLint/Prettier and diff checks. Real Chrome checks at 1440px and 390px on `/`, `/products` and `/contact-us` returned HTTP 200 with the footer present and zero mascot/launcher elements. Final Next.js feedback review found no qualifying framework candidate. No commit, push or deployment.

## Older redundant skill cleanup (2026-11-03)

- Removed deprecated project aliases `prisma-database-setup` and `prisma-postgres`, plus their two `skills-lock.json` entries; retained `prisma-orm-setup`, `prisma-postgres-setup` and all other project skills.
- Archived three global/plugin skills: older custom `skill-creator`, `react-best-practices`, and deprecated ECC `continuous-learning` v1. Retained system `skill-creator`, ECC `react-performance`, and `continuous-learning-v2`. Other partial overlaps remain because their workflows differ or no old/new relationship was established.
- Recovery manifest, all 94 original files and the resulting project lockfile are under `C:/Users/cityc/.codex/skill-backups/dedup-2026-11-03/`. ECC update/repair may restore its bundled v1 entry. No application code, database, commit or deployment changes.

## Desktop scale-photo transparent 4K delivery (2026-11-03)

- Retouched eight supplied scale photographs and saved separate `<original-stem>_transparent-4k.png` files directly in the user-requested `C:/Users/cityc/Desktop/รูปเครื่องชั่ง/` directory. Original viewing angles retained; the FEH5000 foreground keeps its bowl/vegetables while the table and floating promotion are removed. Targeted revisions restored LCD `1170`, cleaned the bowl's outer alpha haze and corrected the JE21 model marking.
- All eight final files are 4096 × 4096 transparent PNG RGBA, enlarged with Lanczos3 from 1254 × 1254 AI-retouched masters with 128px transparent margins. AI reconstructs small details; these are upscaled retouches, not native 4K captures or pixel-identical reproductions. Native masters, exact prompts, manifest, handoff and light/dark review are under the destination's `_retouch-4k/` folder.
- Verified all eight output dimensions/alpha/margins, final SHA-256 checksums and unchanged original-source SHA-256 values; visually reviewed all outputs on light/dark surfaces. No application assets or behavior were changed for this Desktop-only media request. Final Next.js feedback pass found no qualifying framework issue; application build/tests were unnecessary for this asset-only task.

## Transparent food overlays for weighing trays (2026-11-03)

- Created three standalone photorealistic food groups with built-in `image_gen`: raw pork slices, fresh mixed vegetables and mixed fruit, saved as `public/images/scale-food-overlays-4k/pork.png`, `vegetables.png` and `fruits.png`. Front-centered, slightly elevated perspective and soft studio lighting follow the supplied silver tray reference; each group has a low/wide footprint, with no scale, tray or container baked into the asset.
- All three exports are 3840 × 2160 PNG RGBA, proportionally enlarged with Lanczos3 from native 1774 × 887 generated masters, with 96px transparent canvas margins. These are upscaled 4K exports, not native 4K generations. Native masters, exact prompts, supplied reference, manifest and report are retained under `output/scale-food-overlays-4k/`.
- Verified all three file dimensions, alpha, fully transparent margins, retained solid subject pixels and final SHA-256 values. Light/dark composite review is `output/scale-food-overlays-4k/review-light-dark.png`. Assets remain separate for later compositing; no website, existing scale image, package, business data, commit or deployment changes. Asset-only work did not require application build/tests. Final framework feedback review found no qualifying Next.js issue.

## Transparent category product assets (2026-11-03)

- Extracted the six user-supplied category banner subjects with built-in `image_gen`: food, industrial, laboratory, lifestyle, commercial and accessories. New transparent PNGs are saved at `public/images/category-products-4k/<category>.png`; existing banners and website consumers are unchanged. Accessories retain the printer, both paper rolls and USB cable; laboratory glass transmits the transparent backdrop.
- Every final PNG is 3840 × 2160 RGBA, proportionally enlarged with Lanczos3 from the tool's 1536–1774px-wide AI-retouched outputs, with a 96px transparent safety margin. These are upscaled retouches rather than native 4K captures; small printed details can be reconstructed by the image editor. Native retouched masters, all six exact prompts, checksums and a usage report are preserved in `output/category-product-cutouts-4k/`.
- Verified all six final dimensions, alpha channels, fully clear margins and retained subject pixels; inspected white/dark composites and enlarged critical edges. Original banner SHA-256 hashes match pre-edit values. Review evidence is `output/category-product-cutouts-4k/review-white-dark.png`, with per-file checks in `manifest.json`. No application code, page integration, package, business-data, commit or deployment changes; no application build was needed for this asset-only task. Feedback pass found no qualifying Next.js framework issue.

## Responsive illuminated studio Hero (2026-11-03)

- The latest confirmed ConSentinel brief supersedes the desktop-only/red-plane layout and retained mobile 3D Hero below. One H1 (`เครื่องชั่ง SUNFORD สำหรับธุรกิจของคุณ`), HTML company copy and `/contact-us` consultation CTA accompany a static real scale/contact shadow in a blue-white/silver CSS studio. Desktop is copy-left/product-right; tablet/mobile stack naturally. No copied sphere, cards, statistics or restored side panels.
- `Hero` retains unchanged BrandOpening/timing and announcement behavior, but accepts one optional `HeroProduct` projection (`name`, `image`, `href`, `descriptionOverride`) instead of all slides. The server resolves existing CMS image/link overrides and selects the first available configured product. Optional `HeroSlide.descriptionOverride` preserves explicit CMS description provenance; default copy uses `companyIntro.description`. No schema/stored values changed.
- `hero-scene.tsx`/CSS replace the earlier uncommitted `hero-desktop.*`. One discoverable/eager 800×521 WebP (53,834 bytes) serves all sizes; no background asset added. Hero no longer mounts 3D/studio/bubbles/ribbon; product-page 3D and dependencies remain intact. Header decoration follows Hero-owned active attributes and cleanup, excluding hidden DOM retained by client routing. Presence-based fallback applies only without scripting; partial scrolling restores opaque navigation.
- Only two slow CSS transform/opacity light layers move, with keyboard pause, document visibility, intersection and live reduced-motion gates. Product/base stay fixed. Static/no-JS content and native smooth scroll/once-only next-section reveal remain usable; BrandFilm and following sections retain their existing content/behavior.
- Verified 40 unique browser cases: combined 39-case run plus one native background-tab test without Playwright focus override; final affected 18 Hero/Header cases reran after the visibility adjustment. Includes 11 Opening cases, navigation/search/compare/contact, all five requested viewports plus 320px, delayed-image 800/801 resizing with stable bounds/one request, no-JS/error/CMS fixtures, and all three product-page 3D cases. Forty-four superseded homepage 3D/bubbles/ribbon cases remain explicitly retired/skipped, not counted as passes. Three SSR cases, TypeScript, scoped lint/format/diff and isolated Node24 webpack production snapshot build (420 pages) pass.
- Matched cold-browser production transfers: Desktop page JS 207,830→204,942 bytes (-1.39%); Mobile JS 517,907→202,441 (-60.91%). Three mobile GLBs previously transferred 987,097 bytes; new Hero requests none. JS includes shared scripts/headers; below-Hero video requests remain. No Lighthouse/SEO score claim. CTA contrast 5.16:1; muted copy against deepest studio palette stop 4.99:1.
- Delivery/screenshots/evidence: `output/hero-studio-responsive/`. Used existing snapshot fallback without live database/environment-file writes. Existing 3000 dev server did not hydrate during preflight and was preserved; only the owned QA server is closed on completion. No commit/push/deploy. Unrelated uncommitted work, including newly recorded category assets above, remains intact.

## Desktop Hero company-shop background theme (2026-11-02)

- Re-themed only the existing Desktop Hero surface from the dark reference landscape to a white/silver studio and angled lower red brand plane, following the user's SUNFORD Shop reference at `https://sunfordshop.com/หน้าหลัก`. The actual shop was opened and inspected: white canvas/header, red SUNFORD logo and horizontal brand strip, dark copy and neutral product surfaces. Active-navigation red was measured as `#d00b00`; the local Hero uses that accent without changing global website tokens.
- SUNFORD lettering is now solid red; scroll control is white with red lettering and a matching visible focus treatment. Product pixels, foreground geometry/font, Opening, native smooth-scroll/reveal and mobile are preserved. Removed side panels remain absent. This supersedes the dark landscape portion of the earlier implementation below.
- The background is CSS-only and no longer requests `reference-landscape.webp`; no media, dependency or JavaScript runtime was added. The retained main product image is the existing 53,834-byte front-view WebP. Contrast checks measured red/white 5.63:1, red against the darkest silver studio stop 4.86:1 and hover/white 8.86:1.
- Verified against the existing development server: 25 browser checks and two SSR checks pass, plus TypeScript, scoped lint/format/diff checks. Batched desktop/mobile inspection and one shadow refinement/confirmation stayed within two visual rounds. All five desktop sizes have reachable scroll links, in-bounds products, no overflow, no removed panels and no model/terrain requests. Impeccable's single mechanical scan returned `[]`. Evidence is in `output/desktop-hero-shop-theme/`; no production build repeat, commit, push, deployment or existing-server interruption.

## Desktop Hero supporting panels removed (2026-11-02)

- At the user's request, removed the entire lower-left information block (tagline, model label, company description and highlights) and lower-right product-detail card shown in their two screenshots. This supersedes those parts of the initial Desktop Hero composition below.
- Removed the panel-only CSS, card icon and duplicated thumbnail rendering. The SUNFORD heading, main product image/link, backdrop, Opening and smooth-scroll/reveal behavior retain their existing implementation and positions. Mobile is unchanged.
- Updated existing content, responsive and Opening regressions to use the remaining main product link and require both removed panels to be absent.
- Verified against the existing development server: all 25 browser checks and two SSR content checks pass, plus TypeScript, scoped ESLint/Prettier and diff checks. Inspected the updated Desktop screenshot at `output/desktop-hero-2026-11-02/desktop-panels-removed.png`. The user's development server was preserved; no production build was repeated for this markup/style-only removal, and no commit or push was made.

## Desktop Hero image composition and smooth handoff (2026-11-02)

- Implemented the user's authorized Desktop-only redesign above 800px, following the supplied clip: oversized SUNFORD type behind a real front-view product image, dark silver-lit landscape, verified information at the lower left and a linked model card at the lower right. The first configured slide supplies the name, destination and highlights; known default images use the existing compact front views, while custom images remain respected. No invented price, reviews or product facts were added.
- Desktop never mounts the mobile studio, bubbles, ribbon or model components. These now load dynamically only at the existing mobile breakpoint; the original mobile scene, product selection and 3D interactions remain. The shared Opening implementation and timing are unchanged. The Header structure and subsequent section content/styles are unchanged; BrandFilm only gains the stable `brand-film` anchor ID.
- The scroll link uses native browser smooth scrolling and a single 750ms transform/opacity reveal on the immediately following BrandFilm section. Normal wheel/keyboard scrolling remains native. Reduced motion shows static content and navigates immediately; no JavaScript leaves readable content and working native links. Product links disable speculative route prefetching. No dependency, global scroll controller, spacer or continuous JavaScript animation loop was added.
- The unbranded landscape was extracted from the supplied reference at approximately 2.733s, before its product rises. Desktop artwork totals 69,110 bytes: existing front-view WebP 53,834 plus landscape WebP 15,276. A fresh local production-browser measurement requested each once, with zero GLB/model-viewer requests or elements. Mobile requested neither desktop artwork asset. The same local run observed a largest 14ms frame gap and no long tasks in the first two seconds after Opening; these are local observations, not a Lighthouse score or a guarantee across devices.
- Verified the final 420-page production snapshot build, TypeScript, scoped ESLint/Prettier and diff checks; 25 production-browser checks and two SSR fallback/content checks pass. Browser coverage includes five desktop sizes, mobile isolation and selection, 800/801px resizing during delayed image loading, failed artwork, no JavaScript, reduced motion, keyboard smooth-scroll/reveal, all existing Opening lifecycle cases and unchanged lower-section contracts. A fresh review's image decode cancellation finding was reproduced RED, fixed and verified GREEN. The final visual pass moved the tagline clear of the product; its overlap regression also went RED→GREEN.
- Evidence, screenshots, measurements and the delivery report are under `output/desktop-hero-2026-11-02/`. Snapshot fallback was confined to QA process environment; no environment files, live database records, commit, push or deployment changed. No qualifying Next.js framework feedback candidate remained.

## Hero redesign reference review (2026-11-02; discussion only)

- The user wants to remove Hero 3D, minimize transferred data/client work, prioritize Inspect/Lighthouse Performance and retain the existing SUNFORD logo opening. They supplied `Video Project 1.mp4` as the desired visual reference and requested a detailed suitability assessment before implementation.
- Inspected all 173 frames of the 5.7667s, 1440×1080/30fps reference. Its key direction is one central product in a dark studio, oversized type behind the product, a foreground landscape, logo docking into navigation and progressively revealed supporting cards. A layered image/HTML composition is recommended; no implementation approval, replacement product choice or timing change is inferred from the reference.
- Main adaptations proposed: preserve the real front-view scale geometry/display, arrange mobile content independently, use verified product facts for supporting information and reveal primary content earlier than the reference's roughly 4–5s text/card completion. Current Opening begins reveal at 2.35s and finishes at 2.85s; retaining the identity does not yet authorize changing those timings.
- Assessment and frame evidence are under `output/hero-reference-2026-11-02/`. No application code, package, deployed page or business data changed. New-Hero payload and performance remain unmeasured until implementation.

## SUNFORD brand opening from the supplied reference (2026-10-31)

- Added a homepage-only opening using the same CMS logo/name as the header. The user approved cropping the real S from the existing SUNFORD wordmark, then revealing UNFORD, and replaying on every homepage load/reload. No new emblem, audio, dependency, navigation redesign or later Hero content was added.
- The supplied 30fps clip was inspected frame by frame: a centered symbol grows and holds, the name reveals left to right while the group recenters, then the combined logo shrinks and travels into navigation. Implementation reveals the name at 1.25s, starts docking at 1.90s, reveals the existing page from 2.35s and finishes at 2.85s. The red logo and white/silver/pink studio use the company's existing theme; docking follows the actual header logo bounds on each viewport.
- The opening sits above the body-level bubble portal. Hero motion, bubble emission, model cycling and 3D runtime activation wait for completion; existing product images remain available during the reveal. Deferring the 3D runtime prevents its measured startup stall from consuming the S hold. Existing bubble paths, dragging, menu, header and model behavior are preserved.
- No JavaScript and reduced motion expose the ordinary page. Anchor/restored-scroll visits skip playback; Tab, Escape, resize and live reduced motion finish it and restore prior inert/scroll settings. Unmount and failed image loading clean up; a bounded CSS fallback exposes the page if hydration never completes.
- The final 420-page snapshot production build (including TypeScript), scoped ESLint/Prettier and diff checks passed. All 19 distinct production-browser checks passed across the main run and final three-menu-check rerun: 11 opening checks plus existing feature emission, sticky header, menu/dragging and model autoplay/cycling. Menu regressions now wait for opening completion before their first interaction, avoiding an automation scroll while the page is inert. Desktop/mobile videos and the desktop sequence contact sheet were visually inspected under `output/brand-opening-reference/`; frame-by-frame analysis and both MP4 previews are there. Verification uses the existing snapshot fallback without changing environment files or live records. No commit or push.

## Feature bubbles launch from the scale (2026-10-31)

- The three product-summary bubbles and desktop profit badge start small at independently randomized points in the central 20% of the active scale stage, then travel along shallow cubic Bézier paths to their existing anchors. Each entrance takes 2.5–2.9 seconds, with a short initial breath, 90ms sibling staggering and small timing variation. Gentle acceleration and a long deceleration replace the previous fast 1.2-second launch. Scale grows from 0.32 to full size and a bounded 2.5px blur clears during the early reveal; the settled float is a quieter 5px over nine seconds.
- Random launch points, curve direction and timing are generated after hydration and remain stable until product reselection. Paths update through the existing scroll/resize geometry handler; CSS handles playback without a new state/effect, dependency or JavaScript frame loop.
- Dragging/return, menu-closure gating, scroll fade/reentry, shared pause and reduced-motion behavior retain their existing contracts. Server output remains static and readable. No decorative soap bubbles, new dependencies or product/model layout changes were added.
- Verified the refined motion with 11 production-browser checks, including randomized launch geometry and curved travel at 1440px/390px, restrained early speed, long final deceleration, drag/return, touch, menu timing, scroll reentry and reduced motion. The 420-page snapshot production build, TypeScript, scoped ESLint/Prettier, Impeccable detector and diff checks passed; desktop/mobile entrance screenshots were inspected under `test-results/hero-luxury-motion-final/`. No commit or push.

## NaThong integration into mainline (2026-10-30)

- Integrated the approved `NaThong` catalogue browser, source-based category membership and topic filters, category artwork, Solutions pages/navigation, homepage brand video and font updates. The merge retains the previous production revision as its first parent and includes the original source branch history; the existing Hero interaction and foreground/menu contracts remain in place.
- Updated catalogue browser regressions for the new category navigation and Solutions article renderer. Full-page image/screenshot checks receive a longer test budget. Applied the existing formatter to five incoming files and removed an unused importer import; no additional product features were added during integration.
- Verified a 420-page snapshot production build, 33 catalogue unit checks and 14 distinct browser checks, including search/comparison, client payload sharing, desktop/mobile navigation, sticky-header clipping and bubble/menu timing. All 13 Solutions routes and four category roots returned successful responses, and the local brand video supports byte-range playback. Production publication uses the clean, committed `uat` release workflow.

## Mainline history consolidation (2026-10-30)

- Consolidated the original `safe` history into the current production lineage with the previous `main` revision as the first merge parent. The pending reverse merge contained only the already-released formatter configuration and a documentation conflict; those versions were preserved, and application files remain identical to the approved production tree. Published history is retained.
- Release synchronization now rebases onto `origin/uat` or `origin/main` only when that remote tip is not already an ancestor. This preserves approved merge parents and prevents replaying historical commits already included in the release. All validation, clean-tree checks, concurrent-release detection and non-force production push safeguards remain mandatory.
- A regression reproduced the previous merge rewrite, then verified that the release preserves both merge parents, publishes the checked revision and remains unchanged on a repeated release. Existing divergent-branch and conflict cases retain their rebase behavior.

## Release formatting scope (2026-10-30)

- The production release formatting check excludes the three importer-generated JSON snapshots and local `.superpowers` brainstorm artifacts. The importer owns the snapshots' serialization; application source and maintained documentation remain checked. This makes the existing documented snapshot-format policy explicit without rewriting catalogue data or including local drafts in releases.
- The Hero release was prepared on `uat` through the required release workflow. Historical duplicate admin/path commits caused rebase conflicts; resolutions preserved the current path compatibility and screenshot helper behavior, and the resulting application tree was verified identical to `safe` before this formatting configuration change.

## Clear sticky navigation during Hero scrolling (2026-10-30)

- The homepage header shares the studio's transparent background only while the Hero remains at its initial position. The existing studio geometry handler restores the header's opaque surface as soon as content starts scrolling beneath it, and restores transparency at the top. This replaces the former rule that kept it transparent for the entire Hero intersection.
- While that opaque header is active, the foreground bubble portal is clipped below the measured header-inner bottom. Bubble paint and hit targets cannot overlap navigation even during dragging/return, while the remaining page keeps the original bubble layer and interactions. Header/menu/search layer ordering is unchanged; desktop menu completion and bubble scroll fade/reentry retain their existing gates.
- Verified the 407-page snapshot production build, TypeScript, scoped ESLint/Prettier and diff checks. Nine distinct browser checks passed, including navigation/background/clipping/hit-testing at 1900×540, 1440×900 and 390×844, restoration at scroll-top, studio motion/navigation cleanup, bubble scroll fade/reentry and desktop submenu timing. The short-viewport probe explicitly resets scroll after selecting an offscreen product control. Screenshots were inspected under `test-results/hero-header-scroll-final/`. No live database verification, commit or push.

## Hero bubble fade on scrolling away (2026-10-30)

- When less than 35% of the smaller of the Hero height and viewport height remains visible, all bubbles freeze at their current rendered viewport positions and fade out over 900ms. This includes a bubble mid-return after dragging; float/entrance motion pauses during the fade, and the layer becomes inert immediately so it cannot block the following section. Fully hidden bubbles remain hidden until the Hero returns.
- Returning to the Hero restores the original randomized anchors and replays the existing staggered upward entrance for all four bubbles. Quick scroll reversal cancels the exit naturally through CSS transitions; no delayed callback can hide the new entrance. The threshold permits scrolling within the tall mobile Hero without prematurely hiding its summaries. Existing submenu/backdrop completion remains a separate visibility gate, so scrolling back cannot reveal bubbles over a closing menu.
- Shared pause and reduced motion remove the fade/rise motion. No-JavaScript text remains in normal document content. Scroll measurement reuses the existing scheduled geometry handler; no dependency or continuous animation loop was added. The prior scroll-adjusted drag regression now stays within the Hero, while the new regression covers leaving it during a return.
- Verified the 407-page production build using the existing snapshot fallback, TypeScript, scoped ESLint/Prettier and diff checks. All 13 browser checks passed: fade opacity and frozen coordinates, interrupted return, quick reversal, mobile inner-Hero scrolling, menu timing, pointer/touch/keyboard behavior, pause/reduced motion, selection, no JavaScript and all three products across ten viewports. Screenshot evidence is under `test-results/hero-bubble-scroll/`. Live database availability was not tested; no commit or push.

## Hero bubbles wait for desktop menu closure (2026-10-30)

- All four portal bubbles remain hidden and inert while the desktop submenu is open or closing. Opening hides them immediately; closing waits for both the submenu and blurred backdrop's actual CSS animations, including delayed visibility transitions, to finish and become hidden. Only then does the existing staggered 1.2-second upward entrance replay, including on previously dragged bubbles. Original random anchors remain unchanged.
- Quick reopening invalidates pending reveals. A product change that remounts bubbles during closure also waits for the visible closing surfaces. Shared pause and reduced motion keep the reveal static; switching to mobile releases the desktop-only hiding state. Existing drag, return, selection and autoplay behavior is preserved. This supersedes the earlier immediate foreground restoration and blurred-but-visible bubbles during menu display.
- Verified the final 407-page production build with the existing snapshot fallback, TypeScript, scoped ESLint/Prettier and diff checks. Twelve distinct browser checks passed across the initial eleven-check suite and final three-check menu rerun: frame-by-frame closure/entrance, quick reopen, product changes during closure, stable origins, keyboard/touch dragging, pause/reduced motion, no JavaScript, ten responsive viewports and autoplay. Screenshot evidence is under `test-results/hero-menu-reveal-final/` and `test-results/hero-menu-reveal/`. Live database availability was not retested; no environment file changes, commit or push.

## Desktop submenu and backdrop above Hero bubbles (2026-10-30, superseded timing above)

- On desktop widths above 1100px, the open submenu header remains at z-index 2001. While its blurred backdrop is open, the bubble portal moves from 2000 to 38, below the backdrop at 39. This includes the lower bubble outside the submenu surface; it is blurred with the Hero instead of remaining sharp in front. Closing restores the bubble foreground layer. Mobile navigation and all other bubble interactions retain their existing behavior.
- Verified the 407-page build with the repository's existing snapshot fallback, TypeScript, formatting/diff checks and browser hit testing for all six menus at 1440/1920px. Lower bubbles are behind the backdrop; clicking that area closes the menu rather than dragging a bubble. Escape, keyboard opening, foreground restoration and unchanged mobile stacking pass. Screenshot evidence is under `output/hero-menu-backdrop/`. Two normal builds encountered external database connection timeouts, so live-database build verification remains unavailable; only the QA process environment selected the fallback, with no configuration or database changes. No commit or push.

## Selected Hero model label (2026-10-30)

- The selected model name is positioned independently below the introduction, centered at 20% from the left and 48.5% down the Hero on desktop, matching the latest arrow-tip reference. It remains theme red with a 700 weight and now uses 30–48px type. On mobile it stays centered in normal flow between the introduction and controls, enlarged to 24px. Only the model name is shown; selection behavior, bubble text and effects are unchanged.
- Verified the 407-page build using the existing snapshot fallback, TypeScript, scoped lint/format/diff checks, selection behavior and all three models at ten responsive viewport sizes. The existing collision checks now include the independently positioned name. At the reference viewport (1900×914), the name center is (380, 473) with 48px type. Desktop/mobile screenshots were inspected under `test-results/hero-name-position/` and `output/hero-name-position/`; live database verification was not repeated after the earlier connection timeouts. No commit or push.

## Smaller Hero bubbles with a floating return (2026-10-30)

- Reduced all bubble diameters, text and badge icon widths by 16% using one shared scale value, including compact and mobile variants. Full product summaries and the existing responsive anchors remain intact.
- All four bubbles, including the profit badge, now share the same upward entrance, gentle float, reflection and rotating rim. The entrance fades upward by 46px over 1.2 seconds with a gradual ease-out and 140ms stagger, without the previous bounce/overshoot. It runs on hydration and each product selection; no-JavaScript output remains readable and static.
- Releasing a mouse, pen or touch drag now floats the bubble back to its original randomized Hero anchor over 1.8 seconds; permanent viewport pinning from the earlier task is superseded. Scroll/resize updates the anchor without rerandomizing it. The profit badge's hidden measurement anchor is static, preventing decorative float from shifting its return target. Bubbles remain above page content during drag and return.
- A returning bubble can be caught again at its current rendered position without snapping. Arrow-key movement returns home on release; Escape, cancellation and lost capture restore home. Reduced motion and explicit pause disable the return transition. Existing product pinning on interaction, selection reset, motion gates and mobile profit-badge visibility remain unchanged; no new dependency, data field or continuous JavaScript animation loop.
- Verified the final 407-page production build, TypeScript, scoped ESLint/Prettier and diff checks. Nine distinct browser checks passed across the initial run and final seven-check rerun: all three products across ten viewports, full text containment, shared profit/feature effects, smooth return, catching a returning bubble, scroll-adjusted origins, touch cancellation, keyboard release, reduced motion, no JavaScript and existing model autoplay. Desktop/mobile screenshots were inspected; evidence is in `test-results/hero-bubble-return-final/` and `test-results/hero-bubble-return-initial/`. Earlier edits remain preserved; no commit or push.

## Freely draggable Hero bubbles (2026-10-30)

- The feature bubbles and profit badge now appear in a foreground portal outside the Hero clipping and stacking contexts. Their white/pink fills are opaque, so models, ribbons and navigation no longer show over or through the text. Initial desktop anchors follow the latest arrow directions; compact screens reserve extra space between the top summary and profit badge.
- Each product selection, including reselection, generates fresh small random offsets inside the existing responsive bubble areas after hydration and replays the popup. Sizes still follow full text length. Unmoved bubbles follow their Hero anchors when scrolling; dragging any bubble with mouse, pen or touch pins it at that viewport position, above page content, even while scrolling. Dragged bubbles are clamped inside the viewport and adjusted on resize. Dragging pins the selected product so autoplay cannot replace it during the interaction; selecting a product again resets the bubbles.
- Pointer capture keeps the gesture attached to the bubble. The dragged bubble comes to the front and does not replay its entrance on release. Escape, touch cancellation, lost capture, window blur, resize and reduced-motion changes cancel active gestures. Focused bubbles also move with arrow keys (10px, or 40px with Shift). Existing gentle float/reflection/rim effects resume after release; shared pause, document visibility and reduced-motion preferences remain authoritative. Only pinned bubbles continue floating when the Hero is offscreen. The empty overlay passes input through; only bubble buttons catch interaction.
- Existing server-resolved highlights and product/model/ribbon interfaces remain unchanged. Server markup still displays readable, static bubbles without JavaScript. Mobile retains three feature bubbles and the prior hidden profit badge. No dependency, database field, continuous JavaScript animation loop, commit or push was added.
- Verified the final production build (407 pages), TypeScript, scoped ESLint/Prettier and diff checks. All 35 distinct Hero browser checks passed across the broad run and final ten-check rerun: three products at ten viewport sizes, text/circle geometry, randomized respawn, pointer/touch/keyboard movement, cancellation, foreground hit testing above navigation and other bubbles, viewport pinning during scrolling, resize bounds, no JavaScript, motion preferences and existing model/ribbon/studio behavior. The broad run exposed an outdated pre-bubble model-width expectation and cramped compact badge spacing; both were corrected before the final passing rerun. Screenshots were visually inspected with normal motion, on mobile and at the compact breakpoint. Evidence is under `test-results/hero-bubble-drag-verified/` and `test-results/hero-bubble-drag-final/`. The agent-owned production verification server is stopped; the user's existing development server remains untouched.

## Hero bubble sizing and numbered layout (2026-10-30)

- Reduced the feature bubble diameters and made each vary continuously with its full text length through an inline CSS custom property. Short summaries get smaller circles; longer copy retains more room. The sizes are deterministic across server rendering, product selection and rerenders; no render-time random values, extra state, dependencies or data-contract changes were introduced.
- Desktop positions follow the annotated four-point reference: summary 1 lower left, summary 2 left above the model, summary 3 at the top, and the existing profit badge at position 4 upper right. The profit badge and its typography also shrink. Compact layouts shift the model right; short wide windows move the model lower and keep the first bubble above the ribbon. Mobile keeps all three summaries readable in its existing tall Hero, with the profit badge still hidden as before.
- Existing popup replay, floating/reflection/rim effects, playback/visibility/reduced-motion gates and pointer-through behavior remain. All summary text and the left Hero copy are preserved. Responsive collision checks use actual copy text bounds, rather than unused space inside the text container.
- Verified the final 407-page production build, TypeScript, scoped ESLint/Prettier/diff checks and 27 distinct browser checks. After correcting compact bubble spacing, six focused checks passed on the final build, covering all three products at ten viewport sizes (320–1920px), short wide windows, size ordering by text length, full text containment, numbered positions, popup replay and motion/no-JavaScript behavior. The initial broad run also passed the existing model/ribbon mouse/touch, cancellation, fallback and complete-turn regressions. Desktop, mobile and short-window screenshots were inspected; evidence is under `test-results/hero-bubble-sizing-final/` and `output/bubble-sizing/`. Previous work is preserved; no commit, push, deployment or business-data writes.

## Floating Hero feature bubbles (2026-10-30)

- The three selected-product highlights now appear in glossy circular bubbles matching the existing profit badge: white/pink radial fill, pink border, soft halo, reflection and rotating rim highlight. All connector SVGs/styles are removed. This presentation supersedes the rectangular callout cards below. All three original summaries, including the FEH connectivity qualifier, remain complete.
- Product selection increments a local presentation revision and remounts only the highlight list, so direct/ribbon/previous/next/autoplay selection and selecting the same product again replay the popup entrance. The CSS entrance lasts 650ms with 80ms stagger; a separate nested surface floats by 8px over six seconds. Existing server-resolved `HeroSlide.highlights` and model-selection contracts are unchanged; no new dependency, data field or continuous JavaScript animation loop was added.
- Bubble float, rim and reflection share the existing studio playback/visibility gate. Explicit pause displays newly selected points immediately; reduced motion removes all bubble animations. Initial server output remains readable and static without JavaScript. The decorative overlay passes pointer/touch input through, retaining model/ribbon interactions and stable control targets.
- Responsive circles reserve room for their full text and keep clear of copy, product centre and controls. Compact positions also keep text clear of the fixed contact launcher. Mobile Hero minimum height is 1100px (previously 950px), with the third bubble and ribbon reached through normal scrolling; the existing 44px controls remain above the fold.
- Verified the final 407-page production build, TypeScript, scoped ESLint/Prettier and diff checks, plus all 27 production-browser regressions. Coverage includes three summaries at eight viewport sizes, text containment, repeated-selection popup replay, live float/pause/resume/offscreen/reduced-motion checks, no JavaScript, model fallback and existing mouse/touch drag/ribbon behavior. Evidence and screenshots are under `test-results/hero-bubbles-final/`, including visually inspected full Hero screenshots of the longest FEH summary. Earlier uncommitted work is retained; no commit, push, deployment or business-data writes.

## Hero feature callouts (2026-10-30)

- Replaced the three-point block below the Hero description with three simultaneously visible numbered callout cards around the scale, following the supplied sketch. White/pink cards and red connector lines retain the existing Hero palette. The selected product name stays below the introduction; the earlier label and CTA removals remain in place. This presentation supersedes the inline-list layout described below.
- The same server-resolved `HeroSlide.highlights` tuple and existing selected-slide state supply the cards. Selection, ribbon gestures and autoplay still update all three together. The semantic live list remains server-rendered; decorative SVG lines are hidden from assistive technology. No new state, effect, dependency or data field was added. Lines point toward the product area at responsive positions; they do not track physical features as the 3D model turns.
- The model area is repositioned to make space, with separate desktop, compact and mobile callout arrangements. The entire callout overlay passes pointer/touch input through to the existing model and ribbon. Mobile retains its 950px minimum Hero height and visible 44px controls; changing models keeps control positions steady.
- Verified the final 407-page production build, TypeScript, scoped ESLint/Prettier and diff checks. All 26 production-browser regressions passed, including all three summaries at eight viewport sizes (320–1920px), callout bounds/collisions, selection/autoplay, no JavaScript, failed-model fallback, mouse/touch model drops, ribbon rotation/cancellation, pause, reduced motion and complete ribbon turns. Screenshots and traces are under `test-results/hero-callouts-final/`; desktop and mobile screenshots were inspected. Earlier work is preserved; no commit, push, deployment or business-data writes.

## Selected-model Hero highlights (2026-10-30)

- Hero displays the agreed three-point summary for ACS-30-JC21, WPS10KS and FEH5KS below its existing description, with the selected model name and a semantic list. The copy retains the IP67/range/readability facts, ACS pricing/totals/change/two-sided display, and FEH removable tray/RS232/CONNECT compatibility with supporting hardware. The removed eyebrow/About labels and CTA buttons remain absent.
- `HeroSlide.highlights` is an optional readonly three-string tuple resolved on the server by product ID. Only configured slide summaries cross the existing Hero boundary. The current selected slide supplies both the model and its list; direct selection, ribbon/drag selection and autoplay share existing state without a new effect, store, dependency or database/CMS field. Unknown or product-free slides receive no invented summary.
- Summary blocks reserve height so switching between these three models does not move controls. Mobile Hero minimum height grows from 850px to 950px and its model stage is positioned below the copy/controls; desktop composition stays in place. Text remains server-rendered and readable without JavaScript, including reduced motion. The FEH connectivity qualifier remains visible in the third point.
- Verified a 407-page production build, TypeScript, scoped ESLint/Prettier/diff checks and 24 catalogue unit checks. Twenty-two distinct browser checks passed across the highlight/autoplay and existing model/ribbon suites, with focused reruns after correcting test input coordinates. Responsive coverage checks all three summaries at 320/390/430/768/844/1024/1440/1920px, three-point text/selection, steady control positions, touch target sizes and no overflow/model overlap. Existing model drag, ribbon drag, pause, cancellation, reduced motion and no-JavaScript behavior remain verified.
- The taller mobile Hero places the ribbon below the initial viewport; touch tests now scroll the focused card into view before sending native touch coordinates. A probe verified the old test target was offscreen and the actual gesture worked after scrolling. Evidence is under `test-results/hero-highlights-initial/`, `hero-highlights-responsive/`, `hero-highlights-regressions/`, `hero-highlights-touch/` and `hero-highlights-drag-final/`. Earlier edits are preserved; no commit, push, deployment or business-data writes.

## Hero CTA removal (2026-10-30)

- Removed the two homepage Hero buttons for product details and catalogue discovery, including their wrapper and unused arrow import. The title, Thai copy, product model selection, draggable ribbon, floating badge and shared motion controls remain. Existing Hero tests now require the old CTA wrapper to be absent; the studio navigation-cleanup check uses the existing header link instead.
- The 407-page production build, TypeScript, scoped lint/format/diff checks pass. Browser evidence for the targeted desktop/mobile Hero, model fallback, ribbon selection and header navigation checks is under `test-results/hero-cta-removal/`. Previous uncommitted changes are preserved; no commit or push.

## Hero heading simplification (2026-10-30)

- Removed the decorative precision/reliability/business line and the small About label shown above the homepage title. The Hero H1 is now `SUNFORD`; the Thai tagline, description, buttons, product models, draggable ribbon and floating badge remain. Updated existing catalogue browser assertions to use the simplified H1 and require both removed labels to be absent.
- Production build generates 407 pages; scoped lint and formatting pass. Desktop/mobile browser verification is recorded under `test-results/hero-copy-removal/`. Existing uncommitted work is preserved; no commit or push.

## Floating Hero value badge (2026-10-30)

- The existing profit badge gently floats vertically by 8px over a six-second CSS loop. Its existing white reflection breathes through opacity/scale on the same timing, alongside the existing rotating border highlight. Copy, static tilt, size, placement and mobile visibility are unchanged; no JavaScript, dependencies or layout animation was added.
- All three badge animations use the existing studio `data-running` gate, so the shared Hero motion button, document visibility and viewport visibility pause/resume them. Live reduced motion removes all three animations and preserves the static design; no JavaScript leaves the badge visible and stationary.
- Verified the 407-page production build and scoped formatting/diff checks. A production-browser probe confirmed the exact 8px travel and loop seam at 1024/1280/1440/1920px with no header overlap, held phase under explicit pause, resume, hidden/offscreen pause, live reduced motion, unchanged mobile hiding, static no-JavaScript output and zero page errors. Evidence is under `output/badge-float/`. Earlier uncommitted ribbon changes are retained; no commit, push, deployment or data writes.

## Manual Hero ribbon rotation (2026-10-30)

- Dragging the product ribbon horizontally with a mouse, pen or touch now scrubs its existing shared WAAPI phase in either direction, including across the loop seam. Autoplay pauses during the gesture and resumes from the released phase only when the existing playback/visibility/preference gates allow it. An explicitly paused ribbon remains paused after manual rotation. No inertia, new dependencies or continuous JavaScript animation loop was added.
- Gesture direction is resolved after seven pixels: horizontal movement rotates; mouse vertical movement on a linked photo retains model drag-and-drop. Touch long-press retains the existing model drag. Rotation does not select the underlying card or show a model-drop preview. Tap/click selection, keyboard selection and reduced-motion static cards remain available. Rotation capture is released on pointer cancellation/loss, Escape, blur, resize and preference changes; a grabbing cursor and updated hint describe the interaction.
- Verified the 407-page production build, TypeScript, scoped ESLint/formatting/diff checks and 17 browser checks. These cover both rotation directions and wraparound, held/released phase, explicit pause, Escape, resize, touch end/cancel, no accidental selection/page scroll, static accessibility, existing model drops/touch holds, playback/visibility gates and 1,921 interpolated frame samples across each of five widths.
- Browser evidence is under `test-results/ribbon-drag-production/`. The existing development server returned HTML without hydration and had a failed HMR WebSocket handshake during the first attempt; successful verification used a separate production server instead. No changes were made to that existing server. No commit, push, deployment or data writes.

## Client payload and bundle optimization (2026-10-30)

- Public catalogue/search/storefront Client Components receive a typed projection containing only their shared display, filtering, comparison and image-override fields. Full descriptions remain for instant local search. `getClientProducts` uses request-scoped `React.cache` so the site layout, storefront and filtered category lists reuse the same product objects and retain RSC deduplication. Category membership still resolves from full server-side records; the public product API, database/cache contracts and stored data are unchanged.
- Related-product cards receive eight display fields. The homepage Server Component resolves configured Hero slides and sends three prepared slides in the default configuration (1,155 bytes JSON), preserving missing/hidden-product filtering, custom images, ribbon assets, destinations and models. The client Hero retains its existing interactions. Page-search props omit the unused `kind` field.
- Homepage reveals use `motion/react-mini` with native transform keyframes, retaining the same distance, duration, easing, stagger, final appearance, reduced-motion handling and cleanup. No dependencies or styles were added.
- Warm production baseline versus optimized HTML including inline RSC, raw decimal KB: homepage 885.7 → 830.2; products 544.2 → 487.9; detail 539.9 → 484.7; category 547.3 → 490.9; contact 504.8 → 448.5. Homepage script files referenced in initial HTML total 753.3 → 691.8 KB raw (239.3 → 217.5 KB deterministic gzip), including Next.js runtime/polyfill tags. Shared product JSON drops 296.2 → 254.7 KB. These are size measurements, not latency or Core Web Vitals claims; cold/resumed PPR responses are recorded separately.
- Verified: final 407-page production build, TypeScript, scoped ESLint/format/diff checks and 24 catalogue unit checks. Forty browser checks passed before the final category-object reuse adjustment, followed by seven focused interaction checks and one serialization regression (41 distinct checks). All main-content text, links and normalized image paths match on five routes; ten reduced-motion screenshots match within channel tolerance 8, with video/model regions masked. API data is byte-for-byte unchanged.
- Local measurement scripts, raw captures and report are under `output/client-payload/`, with the comparable datasets in `baseline-warm/` and `optimized/`. Browser evidence is under `test-results/client-payload-final/`, `test-results/client-payload-regressions/` and `test-results/client-payload-final-serialization/`. No commit, push, deployment or business-data writes.

## Homepage motion delivery (2026-10-30)

- Delivery scope on `safe`: mobile Hero controls, stable ribbon projection, one shared Hero motion control, gentle homepage reveals and continuous Spotlight playback with its own pause control. Both dependency lockfiles include Motion. The cancelled design sandbox and its assets/tests are absent.
- Pre-push validation: the final 407-page production build and TypeScript passed after sandbox removal. Existing targeted Hero/homepage browser acceptance results are recorded below. This request pushes the working branch; it does not run the production release flow.

## Removed homepage design sandbox (2026-10-30)

- The user cancelled the design experiment. Removed the standalone route, copied design components, experiment-only UI component, generated poster, browser tests and local render/performance artifacts. The public homepage work and original videos are retained. No commit or push.
- Verified no remaining experiment source references/targets, removed URL returns 404, public homepage returns 200, TypeScript and formatting/diff checks pass, and the production build generates 407 pages with no experiment route.

## Continuous homepage motion (2026-10-30)

- Current direction: gentle continuous motion, replacing the earlier cinematic treatment at the user's request. All eight content sections use normal document flow without sticky stages, extra viewport-height spacing or scroll-linked image movement. Spotlight uses its original responsive layout.
- Motion (`motion/react`, with both lockfiles synchronized) reveals headings and copy once: 12px travel, 550ms easing, opacity from 0.65 to 1, 60ms stagger capped at 180ms. Removed the cinematic wrapper option, scroll tracking and scene measurement.
- Motion is progressively enabled after hydration. Without JavaScript, all copy, links and video posters remain visible in normal flow. Live reduced-motion changes stop text motion and video/Hero autoplay without changing section geometry; no scroll interception or new routes/data contracts were added.
- Hero product cycling and scene motion are independent. Manual selection or dragging pins the selected product, but the model resumes after release unless explicitly paused. The single Hero control continues to pause/resume only its model, ribbon and studio; visibility gates apply consistently, and existing affine ribbon projection is retained.
- Spotlight video loops while at least 15% visible and the document is visible, with no cumulative 30-second cutoff. Its separate 44px control sits outside the product link at the lower left, clear of the chat button. Manual pause persists while leaving/re-entering the viewport and changing motion preference. Failed media retains its poster and destination.
- The previous cinematic implementation passed 42 browser checks and a 407-page production build. Its sticky-position checks are now replaced by normal-scroll/no-extra-spacing checks; existing Hero and continuous-video behavior remains the contract. No commit or push.
- Gentle-motion verification: 11 distinct browser checks passed, covering all six viewports, natural forward/reverse scroll, no added scene height, resize, reachable links/control centers, continuous video, manual Hero pause, reduced motion, no JavaScript and failed video. The multi-destination link test exceeded its 30-second budget once and passed unchanged on retry. TypeScript, scoped ESLint, formatting and diff checks passed; the production build was not rerun for this follow-up.

## Shared Hero motion control (2026-10-30)

- One visible 44px mobile motion button replaces the separate ribbon, studio and model controls. Its pressed state means all three are paused; playing resumes all three through parent-owned state. Product autoplay is also suspended while motion is paused, and its separate control still selects automatic versus pinned products.
- Pausing survives product changes, viewport changes and leaving/re-entering the viewport. Existing visibility and reduced-motion safeguards remain authoritative; reduced motion hides the shared control and keeps the scene still. Model loading failure does not remove the shared control for the remaining effects.
- Screenshot helpers and Hero browser checks use the shared control. Model rotation assertions observe the actual renderer turntable rather than the initial camera configuration.
- Verified 31 distinct browser checks after updating the former independent-control expectations, including simultaneous pause/resume, product autoplay, mobile touch targets, reduced motion, model fallback and full ribbon rotations. TypeScript, scoped ESLint, formatting and diff checks pass. Changes remain uncommitted and unpushed.

## Hero ribbon projection (2026-10-30)

- Cards follow the existing projected circular path using affine 2D tangent transforms. Removed the per-card projective matrix that distorted intermediate frames when a card reversed its face at the sides of the ring. Layer ordering, autoplay, selection and drag interactions retain their existing behavior.
- Full-turn browser regression samples 1,921 positions, including frames between the 480 animation keyframes, at 320, 390, 430, 768 and 1440px. It checks rendered card bounds rather than only animation configuration or selected angles.

## Mobile Hero controls (2026-10-30)

- At widths up to 800px, the product controls remain visible in normal flow below the Hero copy and primary links, within the initial viewport. Previous/next, product selectors and autoplay controls have 44px touch targets. The shared motion control also has a visible 44px target on mobile.
- The Hero heading introduces SUNFORD and stays unchanged when selecting a product. The active product is represented by `data-active-product`, its main model and the details-link destination. Manual selection pins the product; autoplay can be resumed with its existing control.
- Catalogue browser checks use this contract and pause autoplay/photo motion before screenshot image preloading. Screenshot evidence uses each test's output directory. Removed conflict markers that had been committed in the latest merge.
- Verified 20 distinct browser checks across the catalogue, Hero models, product ribbon and studio, including 320/390/768px touch controls, manual/automatic playback, dragging, reduced motion and model fallback. Updated old motion checks to inspect the actual turntable rotation. TypeScript, scoped ESLint, formatting and diff checks pass; no commit or push was performed.

## English-only internal paths (2026-10-29)

- All tracked file/folder names are free of Thai characters. Replaced 111 Thai public page paths with readable English paths, retaining all 392 imported page records and 150 products. Existing ASCII paths retain their spelling/case; translated names avoid collisions with existing ASCII destinations.
- Navigation, homepage links, category/guide/story links, imported HTML, product collection references and software destinations use the English paths. Imported source URLs and import-report diagnostics retain original external paths as provenance; Thai display text is unchanged.
- `publicPath` is the shared mapping for encoded/decoded paths. Proxy returns permanent 308 redirects for legacy Thai page requests before streaming, retaining query values. The removed admin namespace still returns 404. Unknown non-ASCII content segments receive bounded deterministic ASCII identifiers.
- CMS documents and saved homepage destinations normalize on read without database writes. Section patches retain their original hash identities through legacy path lookup. Targeted/full content imports normalize before merging/output, so refreshes do not reintroduce Thai public paths or duplicate existing pages. Old bounded internal content URLs remain readable.
- `npm run paths:check` audits repository filenames, source path literals, imported paths and HTML links; it also runs in the UAT test suite. Verified 1,353 filenames and 2,943 internal URL references with no Thai paths.
- Verified a Node.js 24 production build (407 generated pages), TypeScript, ESLint, 26 UAT tests, 20 catalogue tests and 29 distinct browser checks. Runtime auditing covered all 399 public routes and their rendered internal link/media paths, plus 111 single-hop 308 redirects with preserved queries and unchanged category product memberships. The final three browser checks passed after consolidating the exhaustive audit assertions and updating two stale UI expectations; application presentation was not changed.
- Deep comparison with the pre-change snapshots verified that only 491 scalar path references and URL attributes in 13 rich-content blocks changed; all other data, markup and Thai display text remain identical. Read-only inspection of five saved CMS documents found one legacy path; read normalization leaves zero Thai paths. Verified saved href patch hash compatibility.
- Generated catalogue JSON keeps the importer’s existing output style to minimize changes. The pre-existing full-repository formatting differences in the three imported JSON files remain; scoped formatting excludes these generated files.
- No commit, push, deployment, migration, seed or business-data write was run for this path change.

## Current decision: public website only (2026-10-28)

- Removed all admin routes, login/session handling, editor UI, write Server Actions, upload/provisioning scripts and admin-only dependencies/tests. A stateless proxy returns HTTP 404 for the reserved admin prefix before rendering, including paths that could otherwise resolve to a public product. It performs no authentication, cookie refresh or database access.
- Public products, CMS settings/documents, homepage images/targets and imported content retain their existing read paths and presentation. CMS now supplies stored content only; there is no website editing interface. Content changes use repository files or the team’s database process and become visible after cache expiry or rebuild/deployment.
- Deployment requires database credentials; Supabase Auth keys are no longer needed. Optional SUPABASE_URL remains for existing Storage image URLs. Both dependency lockfiles are updated.
- No database records, schema, migration history, Auth accounts or Storage objects were deleted. Legacy AdminUser/AuditLog models and migrations remain for compatibility and data retention. No production release was requested.
- Prior uncommitted edits and removed working files were backed up outside the repository at `C:/Users/cityc/.codex/backups/sunford_web-admin-removal-2026-10-28/` (original files, binary patch, revision and removal manifest).
- The earlier admin implementation and validation notes below are historical and superseded by this decision.
- Verified on Node.js 24: production build (407 generated pages), TypeScript, ESLint, schema validation, 22 UAT tests, 20 catalogue tests, 15 Chrome browser checks, both dependency lockfiles and scoped formatting/diff checks. Browser checks cover 12 former admin URLs returning 404, rejected POSTs, public search/filter/comparison, homepage links, product content and responsive layouts.
- The agent-started QA development server was stopped after the user encountered a duplicate-server lock; port 3000 is free for the user to run `bun dev`. Direct checks during QA returned 404 for admin/login/product management and 200 for the homepage, catalogue API and an existing product with its expected name. No commit, push, release, migration, seed or business-data write was performed for this task.
- The full-repository formatting check reports existing formatting differences in the three untouched imported content JSON files. Scoped formatting passes; no imported data was reformatted. The public screenshot helper now preloads visible images, avoiding timeouts on mounted hidden images.

## Deployment state

- Production releases run `bun run deploy` from a clean `uat` branch: fetch/sync, rebase onto `origin/main`, validate with fixtures, then fast-forward push the checked HEAD to remote `main` for Vercel Git deployment. The cloud build pipeline is separate in `scripts/vercel-build.mjs`.
- Content paths with URL-encoded segments over 200 bytes rewrite internally to stable SHA-256 paths to bound Vercel prerender and runtime-cache filenames, preserving public URLs and content.

- Hosting configuration now targets Vercel via `vercel.json` (Node.js 24, npm, Mumbai `bom1` near the existing Supabase database). Import the repository and configure environment variables using `docs/vercel.md`; a live Vercel deployment has not yet been verified.
- Production builds from `main` migrate and seed before building. Preview builds accept other branches and only build; use an independently prepared Supabase project for Preview. The website no longer includes admin editing or image uploads.
- The Render observations below are historical. The repository no longer contains a Render Blueprint; the previous service must be disabled manually after the Vercel cutover.

- The existing `sunford-uat` Render service at `https://sunford-uat.onrender.com` tracks `main` and uses `APP_ENV=production`, despite its UAT service name. Deploying this service requires merging into `main` and passing its CI checks.
- On 2026-10-26, PR #2 merged the navigation and tooltip changes from `uat` into `main` as `264b7194200a2c8e671ae422415b3f296588269c`. PR and main CI passed, Render reported success, and `/api/health` returned `status: ok` with revision `264b7194200a`. No database schema or deployment configuration changed.
- Eight browser checks passed against the deployed site, covering navigation, guides and tooltips. One initial check encountered a transient Render 502 on page load and passed when rerun.

## Navigation architecture

- The public layout renders `SiteHeader`, which loads CMS navigation settings and passes them to the client `Header`.
- Default menu labels, primary links and category-specific secondary columns live in `src/features/cms/data/navigation.ts`.
- Desktop flyouts use their content height and share one fixed starting corner: the first column starts at the logo's left edge for every active menu. Switching menus does not move that starting corner. Panels are constrained to the remaining viewport width. Text within all columns is left-aligned. Primary links remain large and bold; secondary category links use smaller text. Hover zoom expands from the left edge; keyboard dismissal and backdrop behavior are preserved.
- The mobile menu retains its existing flat list of primary links and additional mobile links.

## Data contract

- `NavigationItem.groups` is an optional array of up to two `{ label, links: [{ label, href }] }` columns, validated by `navigationSchema` and editable through the CMS navigation editor.
- For existing saved items without `groups`, both the header and editor fall back to default columns by the item's primary `href`. An explicit empty array disables category-specific secondary columns.
- The support item at `/#support` continues to use `exploreLabel`, `exploreLinks`, `helpLabel` and `helpLinks`. Those generic columns appear only in the support flyout.
- Buying guides are statically defined in `src/features/content/data/buying-guides.ts` and rendered at `/guides/[slug]`. Guide prose is maintained in the repository; secondary menu labels and destinations are CMS-editable.
- Guide slugs are `scales`, `indicators`, `platforms`, `pos` and `accessories`. Menu fragments must match the section IDs in the corresponding guide.

## Shared UI components

- `Tooltip` in `src/components/ui/tooltip.tsx` accepts one trigger element and optional `content`. The description defaults to the trigger's `aria-label`; existing props, refs and event handlers are preserved without adding a layout wrapper.
- Normalize tooltip children with `Children.toArray` and validate the single trigger before reading its props, including delayed children received from Server Components. Regression tests exercise delayed children with explicit/default descriptions and product client navigation/reloads.
- Verified this input handling with three render tests, seven tooltip browser checks, the existing 3D controls check, TypeScript, scoped ESLint and a production build.
- Tooltips appear after a short pointer hover or immediately on keyboard focus, remain hoverable, and dismiss on pointer exit, blur, click or Escape. Touch taps perform the original action without opening a tooltip. Disabled controls retain their native behavior.
- A visible tooltip uses `role="tooltip"` and adds its ID to the trigger's `aria-describedby`. Escape dismisses the tooltip before dismissing an underlying dialog.
- Tooltips are positioned within the viewport and follow resizing and scrolling. They render inside the nearest open native dialog, or in the document body, to avoid clipping and modal stacking issues.
- The shared tooltip is used for public icon controls in the header, modal close buttons, comparison controls, carousel arrows, product video playback, 3D controls and the contact launcher. Existing contact link labels and admin controls retain their current presentation.

## Product detail presentation

- All `/products/[slug]` pages use the shared reference layout: a rounded pale image panel on the left, and the product name, short subtitle, specification overview and red inquiry button on the right. Tablet layouts retain the two columns; screens up to 720px stack the gallery above the product information.
- Every overview has exactly eight rows in this order: น้ำหนัก, ค่าละเอียด, เหมาะสำหรับ, หน้าจอแสดงผล, หน่วยความจำ, การพิมพ์ฉลาก, การเชื่อมต่อระบบ, วัสดุและความทนทาน. `productOverview` maps existing specification labels and core capacity/readability/connection fields to these rows; missing or blank values appear as `-`. Unmatched specifications remain in the additional details table below the overview. No facts are inferred from descriptions or reference images.
- Overview labels use dark ink, semibold weight and a font size 1px larger than the row text: 14px on desktop and 13px on mobile. Specification values retain their existing typography.
- Values in the right column of the eight-row overview are left-aligned on desktop and mobile.
- The overview uses a 60% label / 40% value column ratio, retaining left alignment and responsive wrapping.
- Product images, gallery controls, the JC21 3D model, CMS specifications, prices when supplied and inquiry destinations retain their existing data and behavior.
- The ค่าละเอียด label includes a circled question-mark button using the shared `Tooltip` to explain display increments with a 1-gram example. It supports hover, keyboard focus and Escape without changing the product's displayed specification value.
- The readability help icon uses a muted gray resting color and darkens on hover or keyboard focus.
- Below the main overview, descriptions, additional specifications and technical details share one section headed รายละเอียดสินค้า. The merged รายละเอียดสินค้า content appears as a full-width introduction before the table, preserving its text, links and media without repeating it as a table row. Remaining attributes use a single bordered white table with thin row separators on desktop and mobile; no table is rendered when no attributes remain. Contact information follows; videos and related products retain their existing sections.
- The details table uses 50% for row labels and 50% for values on desktop and mobile, with left-aligned text and responsive wrapping.
- The introduction emphasizes its opening paragraph and arranges existing unordered feature lists in two columns above 720px, or one column on smaller screens. Subtle separators and consistent spacing guide reading without bullet markers; original wording and order remain intact.
- The contact/after-sales panel aligns to the details table width, grouping the phone, service note and confirmation text on the left with a Sunford Shop website link on the right; mobile layouts stack these groups. The website link on every product opens `https://sunfordshop.com/หน้าหลัก` in a new tab. Phone numbers and telephone destinations remain CMS-controlled.
- `productContentRows` uses the existing Cheerio dependency to read original HTML structure. Clear technical label/value pairs become table rows; complex paragraphs, lists, links and media retain their content in value cells. Existing section names such as เหมาะสำหรับ become row labels, and standalone labels without content show `-`. No facts are invented and stored CMS content is unchanged. Cheerio is now a runtime dependency; both lockfiles are synchronized.
- `mergeProductContentRows` combines rows with repeated labels across descriptions, additional specifications and technical content. รายละเอียด and รายละเอียดสินค้า share one row named รายละเอียดสินค้า. Exact duplicate statements are removed within each merged row, while distinct values, link targets and media are retained. Table labels are semibold and both labels and values use the dark ink color.
- Unordered lists inside detail table values display without bullet markers or left indentation; spacing between items and ordered list numbering are preserved.
- Technical label/value separation reads full paragraph text and matches reviewed field names before removing the prefix across DOM text nodes. It preserves complete numeric ranges, dimensions, units and Thai words even when source spans split them. Unfamiliar statements remain whole instead of being split at the first span or space; explicit balanced qualifiers remain intact.
- On 2026-10-27, audited all 150 source products and all 150 currently published product pages. Checked for dangling parentheses, numeric values in labels, truncated Thai labels and dimensions beginning mid-value. Real-source regression cases cover warranty/certification text, 0.000–5.000 kg, 6 kg capacity, 17.0 cm dimensions and 45 cm dimensions. All 150 rendered pages passed the automated audit; sixteen catalog tests, seven UI/audit checks, production build, TypeScript and scoped ESLint passed.
- Verified imported text preservation, thirteen catalog unit checks, six browser checks covering merged detail rows, dark text, the single detail heading, two-column table at 320/390/1440px, product categories, existing galleries/specifications and readability help, plus production build, TypeScript, scoped ESLint and formatting.
- Verified production build and TypeScript, scoped ESLint, and five browser checks covering every available product category, long names at 320/390/768/932/1440px, original specifications, gallery switching and 3D controls/fallback.

## Admin product list

- The product table fits its workspace with fixed column widths and wrapping product names/URLs. At viewport widths up to 850px, each product uses a two-column detail layout with its name across the top; category, status, sort order and all management actions remain available without horizontal scrolling.
- Product lists use client-side pagination with 50 items per page, previous/next controls, page counts and the displayed result range. Search and publication-status changes reset to page one. The current page is bounded when the product count decreases; filtering and summary counts still use the full catalogue.
- Verified three isolated browser regression checks covering pagination boundaries, search/filter resets, empty results, and long names at 320/390/650/768/850/900/982/1200/1440px. Also verified live catalogue pagination and search, TypeScript, scoped ESLint and the production build. No catalogue data changed.
- Category cards show the count of non-deleted products, including drafts, using the same resolved catalogue as the product list. Separate links open the category's products or its existing name editor.
- `/admin/products?category=<id>` scopes rows, summary counts, search, publication-status filtering and pagination to an existing category. The category survives reloads; a link clears it to show the full catalogue. Unknown or repeated category parameters use the full catalogue. Changing the category remounts the list so search, status and pagination begin at their defaults.
- Verified five isolated browser checks covering category filtering/reloads, drafts, empty and unknown categories, pagination and responsive table layouts, plus live category counts and industrial-category navigation/pagination. TypeScript, scoped ESLint and the production build passed.
- The previously failing food-category editor now opens through the detail panel and as a full page. The full-page route explicitly decodes its identifier before the existing CMS lookup and treats malformed encodings as not-found.

## Done

- On 2026-10-27, removed two confirmed leftover `inline-qa-` products through the existing admin deletion action. Both had matching placeholder introduction edits, empty galleries and no references from homepage slots or other CMS documents. Their product rows are retained with deletion timestamps and publication disabled; the catalogue now contains 150 active/published products. Verified no QA matches in the admin search or public API, both old product URLs return 404 with `noindex`, and WPS10KS still returns 200.

- Added category-specific selection links and buying advice to all five product menus, retaining the original primary categories and support columns.
- Added five complete buying guides for menu topics that lacked matching pages. Wet-work guidance requires checking the whole weighing assembly and does not infer waterproofing from stainless construction alone.
- Reduced flyout vertical padding while retaining content-driven sizing.
- Verified production build, TypeScript, scoped ESLint and formatting.
- Browser checks cover the three-column content, destinations and fragments, mobile navigation, the shared logo-aligned origin and zoom at 1126/1440/1920px, reduced motion, guide navigation and mobile guide layouts.
- Verified the CMS navigation editor preserves its data in the browser fixture and schema validation accepts legacy items while rejecting unsafe links and more than two secondary columns.
- Added reusable icon tooltips and verified production build, TypeScript, scoped ESLint and ten browser checks covering tooltip interactions plus existing navigation, comparison and 3D controls.

## Out of scope

- Public product filtering and mobile navigation redesign remain outside the admin changes.
- Guide pages are not added to the CMS page editor or search index in this change.

## Admin sidebar and homepage management

- Admin screens, including login, tables, drawers and form controls, use the existing local Noto Sans Thai regular/semibold fonts through an admin-only font variable. Public pages retain their existing font. Verified the rendered font in Chrome, control inheritance, public-page isolation, production build, TypeScript, scoped ESLint and formatting.
- Sidebar navigation groups existing destinations under แค็ตตาล็อก, เนื้อหาเว็บไซต์ and ตั้งค่าเว็บไซต์. Website navigation, brand/contact and footer settings open their existing editors directly; only the external website link has an outgoing arrow.
- `/admin/home-images` is now จัดการหน้าแรก, the shared entry point for all nine homepage sections in public-page order. Existing text/media editors remain available, and the five existing image/link forms are grouped beneath spotlight and showcase. Section anchors jump to each homepage area. Image save destinations and persistence remain unchanged.
- `/admin/content` lists content pages and articles separately from homepage and website settings. Homepage, category and product-media editors link back to their own module; website settings no longer link back to the content directory. Nested editor routes highlight only their owning sidebar item.
- On mobile, a native modal navigation drawer exposes every group, supports Escape/backdrop/link dismissal and closes when switching to desktop width. Desktop navigation stays visible and scrolls independently when necessary.
- Verified four browser checks covering active routes and return links, homepage section/image grouping and anchor navigation, widths from 320 to 1440px, mobile drawer behavior, and live anonymous access protection for content/settings routes. UI checks disable writes and use fixture data. TypeScript, scoped ESLint and the production build passed. Authenticated saving was not rerun for this navigation change.

## Admin data-loading performance

- `getAdminSession` uses React request memoization to deduplicate Supabase user validation and the admin membership lookup within a Server Component render. Each new request revalidates. Detail-loading Server Actions pass their verified session to internal readers; direct readers retain their authorization guard. Session or authorization results are not persisted across requests.
- CMS editors load product options only for hero/page editors, selecting id/name/published, and load category options only for category editors. Category counts read only classification fields while preserving legacy categories, custom category overrides, drafts and soft deletes.
- The product table receives `AdminProductSummary` (nine display/action fields), with full product data fetched when the editor opens. The server projection retains legacy presentation and optimistic-concurrency timestamps. Drawer links disable page prefetch because ordinary clicks use the detail Server Action.
- Measured ten authenticated full-document requests per route before and after on the local dev server, excluding warm-up. Median times: products 730→725 ms; categories 778→563 ms; content 804→696 ms; homepage 656→678.5 ms; site settings 997.5→516.5 ms; navigation 930→799 ms; footer 840→596 ms. Product response bytes fell about 46%. Products/homepage have no clear latency improvement in this sample. Measurements and limitations are in `docs/performance/admin-loading-2026-10-27.md` and its raw JSON file; these are not production timings.
- Verified six request/auth/query regression tests using React Server Component rendering, twelve browser fixture checks plus an isolated live anonymous-route check, live unchanged category counts and opening an existing product editor, production build, TypeScript and scoped ESLint. The anonymous browser check first timed out during concurrent build activity and passed in isolation. Existing catalog tests pass 17/18; the unchanged homepage-image expectation uses an older image filename than the current HEAD default. No catalog data or schema changed.

## Admin master-detail workspace

- Product-card edits and the short spotlight/stories text settings open a shared detail panel without navigating away from the master. Category creation/editing uses a compact modal. Product creation, full product details, pages/articles, galleries and complex homepage/settings editors open their full-page forms. Original URLs remain usable for direct access or opening a separate tab; the current pattern mapping is detailed below.
- Above 900px the panel and master remain visible side by side, with independent scrolling and the sidebar retained. Narrow screens show the panel in the workspace while keeping the mounted master state for closing. Closing restores focus to the opening link. Switching records ignores late responses from a previous selection, and closing/switching asks before discarding edits; saving/uploading prevents a switch.
- The detail loader requires an administrator session and accepts only product/content identities. Detail forms submit the existing validation/version checks with `detail=1`; a successful action returns `{ success: true }` instead of redirecting. The panel closes and refreshes the existing master after success. Full-page actions retain their existing redirects. Product save errors retain entered values.
- Admin spacing, summary cards, table rows and image thumbnails are compact. Category cards fit as many columns as the available width permits. Table headers and pagination stay visible around an independently scrolling list; narrow master panes wrap each product's details within the available width. Public layouts and database schemas are unchanged.
- Verified eighteen browser checks across product/category pagination, master/detail editing, unsaved edits, load/save failures, delayed responses, responsive layouts, sidebar/homepage navigation, CMS editor/gallery behavior and anonymous access protection. Five targeted layout/detail checks passed again after the final column adjustment. Live checks opened existing product/category records, preserved a product search after closing, and verified the full-page category fallback. UI save checks use isolated fixtures; no live content was saved. Production build, TypeScript, scoped ESLint and formatting passed.

## Admin table efficiency

- Product search and publication filters apply before pagination. The default sort is most recently edited, with display-order and Thai name alternatives. Each row shows its latest edit time in Asia/Bangkok plus publication and featured toggles. Numeric display-order editing is available in the full product form rather than a table column.
- Checkboxes select individual rows or the current page, retain selections across pages and can select all filtered results up to 5,000 records. Changing search, publication filter or sort clears the selection. The contextual bar offers hide, publish, category move and soft delete. A confirmation dialog snapshots the exact selected IDs/versions and shows the affected names; cancelling never writes.
- Drag handles and ArrowUp/ArrowDown reorder products in display-order mode with no search/publication filter. Category-scoped moves retain other categories' relative positions. Reordering submits the full active catalogue's IDs/versions and normalizes global display-order numbers to consecutive integers; partial or stale catalogue snapshots are rejected.
- `manageProductsAction` validates a strict command union and admin session, checks record versions and destination-category validity, and writes the entire operation in a serializable transaction using parameterized JSON record batches of 500. Legacy projected fields are materialized before taking ownership so quick edits preserve the existing presentation. Deleted rows retain their records/media. Shared invalidation refreshes product/public routes and category counts after commit; errors expose no raw database details.
- Verified twenty-four browser checks, the command-validation test, the real-database table-action transaction test and the existing full catalogue integration test. Database mutation tests roll back and compare products/CMS documents with their original snapshots. One initial anonymous navigation timed out while build/integration checks ran concurrently; all twenty-four browser checks passed when rerun after those jobs finished. The live UI verified sort/selection/confirmation without committing data. The public catalogue still has 150 published products and no active QA records. Production build, TypeScript, scoped ESLint and formatting passed.

## CMS visual mapping and field guidance

- Product and CMS forms expose an optional draft preview that updates from unsaved form state, with full-workspace and 390px mobile widths. Placement text names the destination on the public site; hero previews retain slide ordering, page previews show the first cover before rich content, and other documents show their structured blocks in editor order. These are content/block previews, not a complete rendering of the public site: referenced hero product media and unrelated page sections still come from the published site. The existing WYSIWYG/source editor remains available.
- Draft previews do not save content or call a draft API. Rich preview HTML uses a tag allowlist, removes all active attributes/links and non-approved images, and renders inside an iframe with an empty sandbox and restrictive CSP. Existing server validation/sanitization remains authoritative when saving. Product forms prevent automatic action resets in both full-page and detail modes so errors retain matching inputs, counters and previews.
- CMS `Field` props optionally include `maxLength`, `recommendedLength` and `imageSize` guidance. Text counters follow the existing server limits (including 150-character category labels and existing product field limits); 60-character headings and 160-character descriptions are recommendations with visible warnings, not new persistence constraints. HTML counters include markup and explicitly state that saving validates the limit. Existing product name/description and page title/content continue to supply SEO; no new SEO database fields were added.
- Shared image guidance names recommended pixel dimensions by purpose and the existing 4 MB per-file limit. Every image upload entry point (product primary/gallery, homepage slots, CMS image fields and rich text insertion) first opens a local crop dialog. It supports original/recommended/common aspect ratios, zoom and horizontal/vertical positioning, cancellation, or preserving the original file. Confirmed crops preserve transparency and encode WebP at up to 2048px per edge without upscaling; corrupt files, more than 40 million decoded pixels and oversized output cannot be submitted. Upload/save remain disabled while preparing an image; cancelling never uploads.
- Verified twenty-nine browser checks, including preview updates without saving, SEO counters, safe HTML preview, mobile layouts, crop cancellation, crop position pixels, actual WebP dimensions, corrupt/oversized rejection and existing gallery/CMS/table/drawer flows. Final focused reruns also passed three crop/gallery checks and three preview/error checks, including the added full-page save-error regression. Six server data-loading/auth regression tests, production build (416 routes), TypeScript, scoped ESLint and formatting passed. Live checks on the existing development server at port 3001 opened a real product preview and crop dialog, then cancelled without uploading or saving. The first test run used an inactive port; the rerun used the discovered server. Persistent catalogue/CMS data and the schema are unchanged. Authenticated storage writes were not repeated for this UI change.

## Admin deletion safeguards, recovery and audit

- This section records the destructive-action part of item 4. Draft revisions and scheduling remain deferred; the subsequently requested unsaved-change workflow is recorded below.
- Destructive buttons use a separate red danger style. Product-row and bulk-delete buttons have extra spacing from ordinary actions; row actions wrap within narrow cells. CMS entity deletion sits in its own danger section after the save form. Native confirmation dialogs identify the selected record, trap focus, support cancellation/Escape and prevent dismissal while a write is pending. Gallery-image and structured-array removals also require confirmation before changing unsaved form state.
- `/admin/trash` lists soft-deleted products, pages and categories with search and 20-row pagination. Restoration requires an admin session, a strict request schema and the exact deleted record version. Products return unpublished, keeping their original media; a currently valid category must be selected. Pages return unpublished, preserving their content and URL aliases. Older imported-page tombstones containing only a source path are hydrated from that exact imported page before restoration. Categories reject active name conflicts and return without automatically moving previously reassigned products back. No purge or permanent-delete action was added.
- Migration `20261028000000_admin_audit` adds only `audit_logs`, its indexes and restricted access: RLS is enabled and table privileges are revoked from browser roles `anon` and `authenticated`. It was applied to the configured database after confirming that it was the only pending migration; Prisma Client was regenerated. Existing product, CMS and homepage-image schemas and business rows are retained.
- Product saves/deletes, table/bulk actions, CMS saves/deletes, category product moves, homepage image/link saves/resets and restores insert audit events inside the same database transaction as their mutations. The actor ID/email comes from the verified server session, never form input. Events record entity identity, title, operation, relevant field names and database time; they are not full prior-content snapshots. An audit write failure aborts the business mutation. `/admin/audit` offers type/record filters and 25-row pagination, with actor and Asia/Bangkok times. Editor links open the record's filtered history separately. History starts when this feature is enabled; prior editors are not inferred.
- Verified a real PostgreSQL safety test with savepoints and an outer rollback: soft deletion, retained media, stale/invalid/unauthenticated restores, unpublished recovery, category conflicts and preserved reassignment, imported-page recovery, trusted audit actors, anonymous-table denial and rollback after simulated audit failure. Product/CMS/homepage/audit digests were unchanged after the test. Existing table-action and complete catalogue integration tests also passed with all writes rolled back, along with six auth/data-loading regressions.
- Thirty existing browser checks and five safety UI checks passed, covering confirmation cancellation, exact restore identity/version, error retention, narrow layouts, danger styling, category deletion, gallery removal and anonymous access protection. The final five safety checks passed after correcting the fixture's image-fill sizing; an earlier action-column overflow was fixed by wrapping controls. Production build generated 418 routes; TypeScript, scoped ESLint, formatting and Prisma validation passed. Live checks opened and cancelled an actual product deletion dialog and read the existing trash/audit pages at port 3000; no existing business record was deleted, restored or saved. No production release was run.

## Admin unsaved edits and persistent save controls

- Product forms, CMS editors (including categories, pages, product media and website settings) and the five homepage image/link forms share an admin-only dirty-state provider in the existing detail workspace. Named field snapshots include checkbox state and controlled hidden JSON for structured fields/media, ignore file-picker controls, and retain disabled fields while saving. Returning values or array order to their initial state clears the warning; opening preview/crop UI alone does not mark a form dirty.
- A fixed bottom save bar appears while an editor has unsaved changes and submits that exact form through native validation and its existing action. It remains visible at desktop/mobile widths and while either workspace or detail panel scrolls. Multiple dirty forms share one bar with a form selector. Save/upload activity disables saving; failures retain values and dirty state. Successful action results or the saved record version establish the next baseline. Existing server validation, permissions, concurrency checks, redirects and audit behavior are retained.
- Admin links, logout, drawer close/back/cancel, record switching and same-document browser history traversal ask through the shared HTML confirmation dialog. Cancelling, Escape or the close button retains edits. Modified clicks, new tabs and same-page section anchors do not discard edits. History uses the Navigation API where available and an indexed history fallback otherwise. Native `beforeunload` handles reloads, tab closure and full-document exits; warning text and availability are controlled by the browser host. Ordinary submits retain their original event; only saves with other dirty forms are paused for confirmation and replayed with their original submitter. No autosave or draft persistence was introduced.
- Verified thirty-five browser regressions with isolated write-disabled fixtures, including nine unsaved-state checks for reversible changes, sticky controls at 320/390/800/1440px, link/logout cancellation, array moves, back/forward including multi-entry fallback traversal, native reload cancellation, failed/pending/successful saves and independent homepage forms. The final nine checks passed again after submission/unmount cleanup. Six server auth/data-loading checks, TypeScript, scoped ESLint and formatting passed. The production build generated 418 routes.
- Live inspection at port 3000 verified the real category editor's dirty indicator and save bar without saving. Standard JavaScript confirmations were not observable in the embedded browser, so application navigation now uses the HTML dialog verified in the fixture suite. Chrome exposed the original native confirmation, but live computer control was then stopped because its current URL could not be established by the automation safety check. The final replacement dialog was therefore not rechecked through that live browser connection. No existing product/CMS/homepage record was saved, and no database schema or production deployment changed in this task.

## Admin editing patterns by workflow complexity

- `adminEditorPattern` maps category identities to a modal, the six/seven-field spotlight/stories text settings to a drawer, and all product creation/editing plus complex editors to full pages. Full-page links remain ordinary Next links, so they pass through the existing unsaved-navigation guard. Publication/featured toggles remain inline; numeric display-order editing stays in the full product form, with existing drag/keyboard reordering available in the table's display-order mode.
- Category modals show the existing two structured name fields, counters/help, a sticky save/cancel area and the existing audit link for saved/imported records. Creation hides deletion until a record exists. Existing category deletion stays in its separate danger section with its own confirmation and replacement-category choice. The shared dirty-state provider retains modal registrations but renders their status/save controls inside the modal, keeping save controls usable in the native dialog's focus trap. Escape, close and cancel all protect unsaved edits; cancelling restores focus to the opening link and preserves the master.
- The product drawer shows eight card fields: name, subtitle, description, category, primary image, publication, featured status and badge. URL, technical specifications, display order and the current gallery are retained in the submitted snapshot, including the original concurrency version. It uses the existing save action, media/crop/upload flow and error retention. A guarded link opens the full product form; gallery/media links open their full editor. Full-page forms retain all fields and the optional draft preview/WYSIWYG.
- Verified forty-seven distinct browser checks across the product list, modal/drawer/page routing, CMS models/previews, galleries/crops, deletion safeguards, responsive layouts and unsaved-state workflows. The initial run skipped eight CMS model checks because the process had not loaded the local environment; all eight passed when rerun with `.env.local`, using read-only model lookup and disabled business writes. Five focused pattern/save-error checks passed after the final compact-spacing adjustment. Six auth/data-loading checks, TypeScript, scoped ESLint, formatting and the production build (418 routes) passed.
- Live checks at port 3000 opened an existing category modal, displayed the actual unsaved HTML confirmation, cancelled it, reverted the temporary field edit and closed without saving. Also verified the product-card drawer, navigation to its full technical form, and category-delete confirmation cancellation. No browser console errors were observed. This completes the live HTML-confirmation check that was blocked in the preceding task. Screenshots are under `test-results/admin-pattern-evidence/`. No business record or database schema was changed, and no release was deployed.

## Nested CMS form spacing

- Recursive CMS arrays retain their data hierarchy without repeating a bordered/padded card at every depth. The outer row remains a card; nested groups use headings and separators, and nested row fields add no horizontal padding. Existing labels, helper text, counters, ordering, removal confirmation and save behavior are unchanged.
- Verified three existing browser checks for unchanged navigation/solution data on mobile, hero ordering/saving and product media editing through write-disabled fixtures. Live navigation-editor inspection confirmed zero left padding/border on nested sections and equal 285.8px input widths across submenu, secondary-column and nested-link groups at the observed viewport. The actual page screenshot is `test-results/cms-flat-evidence/navigation-flat.png`. Formatting and diff checks passed. This change is limited to admin CSS; no business data was saved.

## Collapsible navigation editor rows

- Only the `navigation` editor enables row accordions, recursively covering main menus, submenus, secondary columns and their links. Rows start collapsed with a name and optional destination summary. Opening one row closes its siblings in that group; clicking it again closes it. Each parent remains open while its child is edited. Adding a row opens it, and selection follows moves and index changes after deletion. Client-only row keys keep nested editing state attached to the same row during reordering and are never stored in CMS data.
- Collapsed fields stay mounted and the existing controlled JSON remains the save payload, so folding retains unsaved values and nested open state. Folding alone does not mark content dirty. Buttons expose `aria-expanded`/`aria-controls` and native Enter/Space interaction. Other CMS editors retain their expanded form layout, ordering and removal confirmations.
- Verified ten CMS browser checks and nine existing unsaved-state regressions using write-disabled fixtures. New checks cover exclusive expansion, keyboard operation, nested expansion, retained edits and complete save payloads, widths of 320/390/1440px, and adding/reordering/removing rows. The ten CMS checks and the unsaved array-reordering check passed again with stable row keys. TypeScript, scoped ESLint, formatting and the production build (418 routes) passed. Live checks switched between actual main menus and confirmed only the selected sibling was expanded, then collapsed it without editing or saving. Evidence is under `test-results/menu-accordion-evidence/`. No business record or schema was changed.

## SUNFORD admin color theme

- The admin palette now follows the public site's existing `--red: #d7192d`, white surfaces, `--ink: #1d1d1f` text and neutral gray backgrounds. Admin-only CSS variables centralize brand, neutral, focus and semantic colors. Sidebar selection, filters, selected rows, bulk controls, checkboxes, form focus and primary actions use the red/pale-red palette; olive decorative colors and green-tinted backgrounds are replaced across the admin, CMS and workspace styles. Product image previews retain a neutral background.
- Success/publication remains semantic green, unsaved warnings remain amber, and destructive actions keep their darker red outlined treatment. Key contrast checks measured 5.16:1 for white on brand red, 4.67:1 for red on the active pale-red background, and 4.85:1 for subtle text on the gray page background. These are selected palette checks, not a complete accessibility audit. Keyboard focus uses the brand red outline/ring.
- Verified twenty existing browser regressions for sidebar/mobile navigation, confirmation safeguards, CMS forms/previews/media and menu accordions through write-disabled fixtures. Formatting, diff checks and the production build with TypeScript (418 routes) passed. Live inspection confirmed exact computed brand colors on the active sidebar and save button, neutral page/text colors and the red form focus border/ring. Evidence is `test-results/admin-brand-evidence/navigation-theme.png`. Only admin CSS changed; public styling, business data and server behavior are retained.

## Local Prisma skills and admin commit verification

- Prisma AI skill directories under `.agents/skills/prisma-*`, `.claude/skills/prisma-*` and `.windsurf/skills/prisma-*`, plus the current Prisma-only `skills-lock.json`, are local tooling and ignored by Git. All 214 files remain available locally. The application's Prisma schema and migrations remain versioned with the admin feature.
- Before committing the accumulated admin changes, the production build generated 418 routes with TypeScript, six authentication/data-loading checks passed, and 49 browser checks passed using installed Chrome. Browser coverage includes product tables, editor patterns, deletion safeguards, sidebar navigation, unsaved changes, CMS previews/media and menu accordions. The default bundled Chromium was unavailable; rerunning with the existing `PLAYWRIGHT_CHANNEL=chrome` setting passed. Scoped ESLint, formatting, Prisma validation and diff checks passed. Database mutation integration tests were not rerun in this commit-only task.

## Admin decorative punctuation

- Admin page/editor headings and login branding omit decorative trailing dots. Category product links, CMS directory paths, website links, editor shortcuts, audit links, back links and login actions omit decorative arrows. Product-view links retain their accessible names and use an eye icon. Editor placement/help text uses plain separators in place of arrow chains. Reordering arrows and accordion chevrons remain functional controls; existing destinations, form payloads and editing behavior are retained.
- Audited all admin route files and shared admin/CMS components, including loading, error and not-found views. Live authenticated inspection covered 23 pages: all nine primary modules, new/existing products, an existing category and article, all nine homepage section editors and product media. No decorative link arrows, heading-dot spans or decorative arrow icons remained in these rendered pages. An anonymous HTTP check verified the login heading, back link and submit button. No business record was edited or saved. Live results and a screenshot are under `test-results/admin-all-decoration-evidence/`.
- Forty-nine existing browser checks passed for product tables, modal/drawer/full-page editors, deletion safeguards, sidebar/mobile navigation, unsaved changes, CMS preview/media and navigation accordions. TypeScript, scoped ESLint, formatting and diff checks passed. Existing heading/back-link selectors match the new text; the authenticated CRUD suite was not rerun.

## Product list page scrolling

- `/admin/products` shows up to 50 products per page. The list panel has no viewport height cap, including while bulk actions are visible, and the table wrapper no longer scrolls internally. Product rows extend naturally through the existing workspace scroll area; other admin editors and their scrolling retain their existing layout.
- The product fixture contains 105 records to cover pages of 50, 50 and 5 records. The concatenated IDs across all three pages must exactly match the original dataset in order, checking completeness and preventing repeated records. Twenty product-list browser regressions passed, including pagination boundaries, search/status resets, cross-page selection, bulk operations, last-page deletion, unclipped table height, workspace scrolling, responsive widths, detail editors and reordering. TypeScript, scoped ESLint, formatting and diff checks passed.
- The 50-row adjustment was verified with isolated browser fixtures that disable business writes. No product was saved or deleted. Earlier read-only live evidence for the previous 100-row setting remains under `test-results/admin-products-100-evidence/`.

## Product order column removal

- The table has four columns: product, category, publication status and management actions. Its numeric order field/save button and dedicated column styling are removed. The full product form retains the editable `sortOrder` field; compact product-card saves retain the original hidden value. Existing sorting and drag/keyboard reordering are unchanged.
- Duplicate numeric priorities remain allowed. Admin display-order sorting breaks ties by Thai product name; the public repository sorts by numeric priority without an added secondary key. This presentation-only change does not normalize priorities or modify the public sorting contract. An explicit reorder operation still assigns consecutive numeric priorities through the existing action.
- Twenty product-list browser regressions passed, covering the four table headers, retained/editable full-form priority and failed-save retention, compact-save preservation, responsive layouts, pagination completeness and drag/keyboard row movement. TypeScript, scoped ESLint, formatting and diff checks passed. Read-only public catalogue comparisons before and after matched all 150 ordered product IDs, slugs and `sortOrder` values. Live inspection verified the absent column and WPS10KS's original priority of 5 in its full form without saving. Evidence is under `test-results/admin-order-column/`.

## Product description formatting on save

- Product input normalizes CRLF/CR to LF. Description comparisons in the product save action and source-presentation fallback use normalized newlines, so browser line-ending conversion alone retains existing rich HTML. Actual plain-text description edits escape HTML, turn blank lines into paragraphs and single newlines into `<br>` elements. Existing CMS rich-text editing remains authoritative for richer formatting.
- Restored ACS-30-JC21EL (`sunford-10643`, `/products/10643`) through the authenticated CMS editor after confirming its current plain text matched the imported source under newline normalization. Its introduction again has four paragraphs and eight soft breaks. The normal CMS sanitizer canonicalized equivalent HTML syntax in introduction/details; the details' parsed structure/text, plain description and all other media fields remained unchanged. The public catalogue's 150 IDs, slugs and display-order values matched the pre-repair snapshot. Backup and verification evidence is under `test-results/product-description-repair/`.
- Twenty-one catalogue unit checks, the real-database catalogue integration check, TypeScript, scoped ESLint and formatting passed. Integration coverage verifies LF/CRLF saves preserve the whole rich media object, actual edits retain paragraphs/breaks and escape markup, and the database test rolls all mutations back. Live CMS confirmed the repair save, and the public product page renders its opening paragraph separately from eight feature items instead of one continuous bold paragraph.

## Product editor placement and wording

- The product form separates the top-of-page name/subtitle from the lower product introduction. Two location links show the unsaved name/subtitle and the public details heading, then jump to their corresponding form sections without discarding edits. Technical fields are grouped as the specification table beside the main image; publication/order controls remain separate.
- The subtitle label/help explicitly identifies the short text beneath the model name. The introduction section explains the plain-text replacement behavior and puts the existing rich-content editor shortcut beside the description, guarded by unsaved-navigation confirmation. New products explain that rich-content editing becomes available after their first save. Description counters retain the 5,000-character limit without suggesting that long product copy must fit a 160-character SEO recommendation. CMS introduction/table helper text uses the same public-page placement names.
- Product draft previews label the upper and lower regions and explicitly describe their plain-text scope; they do not claim to preview existing rich CMS formatting. Form field names, save actions and stored product/media contracts are unchanged. Product action buttons wrap within narrow form widths.
- Twenty-two distinct browser checks passed across product listing/editing and the CMS product-media workflow, including isolated subtitle edits, retained description payloads, same-page location links, guarded rich-editor navigation, failed-save retention and 320/390/1440px layouts. The final narrow-layout adjustment passed four focused regressions. Live authenticated inspection opened ACS-30-JC21EL's full form and location shortcut without saving any business data. Evidence is under `test-results/product-editor-design/`.

## Direct full-page product editing

- Product edit buttons, product-name/image links and creation links navigate directly to their existing full-page routes. Product editing no longer opens a second workspace column. Category modals, text-setting drawers, inline actions and the shared unsaved-navigation guard retain their existing behavior. The reusable compact product form remains in the code but is not opened by product links.
- Twenty-one browser checks passed with full-page navigation fixtures, covering the exact selected ID from a later filtered list page, complete form payloads, return to the list, cancelled/accepted unsaved warnings, draft previews, mobile layouts and unchanged table/category workflows. TypeScript, scoped ESLint, formatting and diff checks passed. A live click on ACS-30-JC21EL's edit button reached `/admin/products/sunford-10643/edit` with zero detail panels and zero product tables on that page; no business data was saved. Evidence is `test-results/product-full-page-evidence/product-edit.png`.

## Two main product editing sections

- The full product form follows the two public-page areas shown by the owner: section 1 contains the main image/gallery, name/subtitle, existing overview specification fields and existing publication/order controls; section 2 below contains the introduction/plain description and the existing shortcut for formatted introduction/tables. Primary section headings use H2; their existing field groups use H3. All controls remain mounted in one form with the same names and save payload.
- This is a layout regrouping ahead of point-by-point follow-up changes. It adds no data fields, merges no CMS/product records and retains the existing public rendering, validation and save actions. Six focused browser regressions passed for full-page entry/payloads, previews, section navigation, guarded CMS navigation, failed-save retention, unsaved warnings and mobile layouts, along with TypeScript and scoped ESLint. Live evidence is under `test-results/product-two-sections-evidence/`.

## Product editor header simplification

- Removed the two location/summary cards and the product draft-preview toolbar, button and iframe at the owner's request. The form now starts directly with its two editing sections beneath the existing heading/audit link. CMS document previews remain available. Product fields, counters, save payloads and unsaved-navigation protection are retained; product-only preview code and card styling are removed.
- Five focused browser checks passed for complete product saves, independent field edits/counters, guarded rich-editor navigation, failed-save retention and unsaved exit warnings. TypeScript, scoped ESLint, formatting and diff checks passed. Live inspection confirmed zero summary cards/previews and both editing sections present, without saving business data. Evidence is under `test-results/product-header-removal-evidence/`.

## Grouped product overview specification editor

- The upper product area has one editable two-column table containing the same eight rows, labels and order as the public overview: weight, readability, suitability, display, memory, label printing, connection and material/durability. All rows submit together with the existing product save. Empty values display as `-`; three existing comparison fields retain a 200-character limit, and the other five support 5,000 characters. The form remains usable at 320/390/1440px, with existing failed-save retention and unsaved-navigation warnings.
- `AdminProduct.overview` contains the resolved public values, including original specification aliases, instead of assuming the three raw product fields are the values currently shown. Inputs submit `overview.<key>` while legacy field names remain supported. The server validates optional overview values separately from the product row; omitted keys preserve existing data. Unchanged resolved values preserve the original raw fields and specification objects. Changed values replace matching alias entries or append their canonical labels, while unrelated specifications and all other media fields remain intact. Weight/readability/connection edits also update the original product fields. Clearing an existing value stores an explicit dash to prevent fallback values reappearing.
- These values use the existing product-media specification JSON, materialized from source defaults when needed, with no schema migration. Product changes, media changes and audit entries commit in the same optimistic-version transaction. Audit fields identify changed `overview.<key>` values; existing product/CMS cache invalidation refreshes public rendering. New-product saves support the same table.
- Twenty-two catalogue unit checks, twenty-one browser checks and the real-database catalogue integration check passed. Coverage includes all eight payload values, stored/public resolution, unchanged formatted-versus-raw values, alias updates, preservation of other media, stale/invalid/legacy submissions, clearing and creation. The final compact row spacing passed three focused browser regressions. Database test writes rolled back and original snapshots matched. Live read-only inspection of ACS-30-JC21EL confirmed all eight form values match the public table; its product record remained unchanged. Evidence is under `test-results/product-overview-table-evidence/`.

## Hero ambient-light control removal (2026-11-03)

- Removed the visible ambient-light pause/play button at the user's request, including its state and icon imports. Ambient lighting and existing automatic visibility/reduced-motion gates remain; other Hero content is unchanged. This supersedes the manual-control portion of the studio brief above.

## Hero scroll cue removal (2026-11-03)

- Removed the Hero scroll arrow/text link at the user's request. Normal page scrolling and the next-section reveal remain. Other content is unchanged.

## Mascot close button (2026-11-03)

- Added a visible top-right X button labeled `ปิดตัวละคร`. FloatingContact keeps dismissal in local React state and unmounts SunfordMascot, cleaning up its motion listeners and hiding the contact panel too. Reload restores the mascot; no storage added.
- TypeScript, scoped ESLint and Prettier passed. Isolated browser checks of the actual components passed at 1440px and 390px, including keyboard dismissal with the panel open, touch dismissal and reload reset (Next Image replaced with a plain image in the check). Full-page screenshots confirm placement; the existing dev server rendered the page but mascot hydration did not activate, so full-page interaction remains unverified. Existing server preserved. Final feedback review: no verified qualifying Next.js issue.

## Stationary mascot (2026-11-03)

- Supersedes automatic walking and dragging: mascot stays anchored at bottom-right using the existing sharp front-pose image. Removed canvas walking, sprite-sheet loading, pointer tilt/drag/inertia and play/pause control. Existing close button, invitation timing and contact links remain; resize positioning keeps the panel within the viewport, including short landscape screens.
- TypeScript and scoped ESLint passed. Browser checks of actual components at 1440x900, 390x844 and 640x360 confirmed identical bounds over time, contact opening, panel bounds, Escape and dismissal; mobile screenshot reviewed. Checks used an isolated React harness with Next Image substituted; integrated dev-server interaction was not reverified. No qualifying Next.js feedback candidate in the final reporting pass.

## Remove decorative particle background (2026-11-03)

- Deleted the global particle canvas implementation and its motion context, animation loop, observers/listeners and footer pause/play control. Site layout now renders the existing surface wrapper directly; retained white/paper surface colors and removed the unused homepage background-start marker. The surface stylesheet contains only base surface colors/layout.
- Replaced obsolete animation expectations with absence checks. Real Chrome/Playwright passed across homepage, products, contact and service at desktop 1440x900 and mobile 390x844: main content visible, no particle canvas/control and no horizontal overflow. TypeScript, scoped ESLint, formatting and diff checks passed. Final Next.js feedback review: no qualifying framework issue.


## Task: Legacy website content gap audit (2026-11-05)

Status: "Ready to Code"
Approval: "Approved for read-only audit/report only; implementation not approved"
Progress: "Done — source and local runtime verified"

### Goal / Scope

Inspect the public information on https://www.sunford.co/ using the user's Browser, compare with the current project, and deliver a list of missing/partial content, intentional exclusions and unavailable source material. No application edits, automatic import, business-data writes or deployment.

### Files / Plan

Read applicable instructions, spec/memory, snapshots, routes and renderers. Inspect source Sitemap/public pages and local runtime. Compare source URLs with imported records, validate existing content, and deliver `output/legacy-content-audit-20261105/report.md`, `inventory.json` and `source-sitemap.xml`. Append this task record and matching `plan.md` entry, retaining history.

### UI/UX Brand Alignment / Contracts

The old website is the factual content reference, not approval to restore its design. English paths, public-only scope, approved mocks, retired category routes and no-calibration-service rule remain in effect. No UI, props, routes or data contracts changed.

### Acceptance Criteria / Verification

- [x] Browser inspection covers all 412 public source Sitemap URLs out of 421 entries, plus additional menu links; nine account/transaction/search/test paths excluded. Retried incomplete loads and checked all five service tabs.
- [x] Read-only source URL comparison against 392 page records and 12 solutions identifies 15 unmapped URLs, classified by their actual current source contents in the report.
- [x] Local `/api/products` contains 150 products and none of missing SKUs 10732,10733,10838–10844. Report lists product identities and source URLs.
- [x] Verified missing live content for Lot/Serial, POS integration, Windows reporting, Driver and price-scale preparation information; distinguished forms, article covers, mock children/models and historical exclusions.
- [x] `npm run content:validate` passes:392 pages,150 products,834 sanitized blocks,909 local images,20 video references. Rechecked 20 historically missing image URLs with HEAD:15 returned404,five403; no claim of permanent loss or successful binary download.
- [x] Detailed report and complete Sitemap-to-import inventory written and inspected; no application files or business records changed.

### Missing Information / Approval Record

The user's request to inspect the entire old website and return a list authorizes this audit. No missing information blocks this report. Future implementation needs its own approved Spec/Plan; 18 exact-model mocks, blank source pages and form-processing contracts still need verified inputs for that future scope.

### Current State

Audit deliverables are under `output/legacy-content-audit-20261105/`. Existing imported content is substantial but incomplete against the live source. Findings do not authorize restoring retired category pages, account/checkout work, an import run or calibration-service advertising. Final Next.js feedback review found no qualifying framework issue during this read-only audit.


## Task: Legacy content migration preserving current design (2026-11-05)

Status: "Ready to Code"
Approval: "Approved — user authorized revised scope preserving all existing categories/design"
Progress: "Done — verified imported content, database preservation, responsive browser checks and production build"

### Goal

นำข้อมูลที่ยืนยันได้จากเว็บเดิมมาใส่โปรเจกต์ปัจจุบัน โดยรักษารูปแบบ สี ฟอนต์ โลโก้ Header/Footer, Hero/Opening, layout, CSS, animation และ responsive เดิม ใช้ผล audit 412 URLs ของวันที่2026-11-05เป็นรายการตั้งต้น

### Scope In

- เพิ่ม9SKUs 10732/10733/10838–10844 พร้อมภาพจริง/รายละเอียดที่ยืนยันได้; คง150productsเดิมและการจัดกลุ่มเดิม ไม่ merge collection records
- เติมLot/SerialและPOS integration; เพิ่มWindows/Driverในหน้ารวมโซลูชันเดิม; เติมDRVและบทความก่อนใช้เครื่องชั่งคำนวณราคา
- ผูกภาพปกBiz Talkที่ตรวจสอบได้ และกู้รูปที่ขาดเฉพาะเมื่อพบไฟล์จริง
- คงชื่อ/ID/ลำดับหมวดหลัก หมวดย่อย เมนู 4family mock children,8scale children,18exact-model mocks และการจัดกลุ่มสินค้าเดิม ผู้ใช้จะจัดหมวดใหม่เอง ข้อมูลหมวดต้นฉบับเก็บได้เฉพาะstaging; สินค้าใหม่ใช้เฉพาะหมวดหลักอุปกรณ์เสริมที่มีอยู่ตามsource ไม่สร้างหมวดย่อยใหม่
- สำรอง/เพิ่มเฉพาะ9missing productsผ่านPrismaเพื่อให้runtimeที่ใช้DBเห็นข้อมูล โดยไม่update/deleteข้อมูลเดิม ต้องตรวจtargetและdiffก่อนwriteตามPlan

### Scope Out

ไม่เปลี่ยนหมวดหลัก/หมวดย่อย/ลำดับ/ชื่อ/สมาชิกหมวดของสินค้าเดิม ไม่เปลี่ยนดีไซน์/CSS/Global components ไม่คืนLegacy category pages ไม่เพิ่มdependency/schema/บริการสอบเทียบ/ระบบบัญชี/Checkout/backendฟอร์ม/ตัวกรองข่าวใหม่ ไม่Commit/Push/Deploy ไม่แต่งข้อมูลสำหรับ18Mocksหรือหน้าต้นฉบับที่ว่าง และพักค่าสเปกต้นฉบับที่ขัดกันไว้ให้ยืนยัน

### UI/UX Brand Alignment

- Reference: current project Product detail, CatalogProductCard, ContentDirectory, SolutionsPage, src/styles/base.css และรูปก่อนงาน ไม่ใช้ดีไซน์ต้นฉบับแทน
- Design: ย้ายเฉพาะข้อมูลเข้าcomponents/typographyเดิม ห้ามคัดลอกCSS/fonts/scripts/widgetsของต้นฉบับ; จำนวนและเนื้อหาที่เพิ่มอาจเพิ่มความยาวหน้าได้
- Responsive: baseline/afterที่320/390/768/1440px ตรวจoverflow/รูป/ข้อความ/เมนู/ค้นหา/เลื่อนหมวด/Grid–List/Compare

### Input / Output / Contracts

Inputคือsource URLs/recordsที่ระบุในoutput/legacy-content-audit-20261105/report.md และsourceปัจจุบันที่ตรวจสอบซ้ำ Outputคือproducts/pages/solutions/ภาพจริง โดยคงcollection recordsและการจัดกลุ่มสินค้าเดิมที่ใช้public contractsเดิม พร้อมsource/asset manifestsและผลตรวจ ไม่เพิ่มsubmission APIหรือเปลี่ยนProps/APIเดิม

### Acceptance Criteria

- [x] บันทึกการอนุมัติจริงก่อนแก้แอป; แก้เฉพาะไฟล์ในPlan
- [x] 9productsใหม่เข้าถึงได้ในruntime/APIและหมวดถูกต้อง โดย150productsเดิม/hidden/deleted/CMS editsไม่ถูกทับหรือฟื้น
- [x] เนื้อหาเป้าหมาย/ภาพที่ยืนยันได้แสดงในรูปแบบเดิม ไม่มีexecutable markup/CSSจากsource; ไม่ทำdataนอกscopeหาย
- [x] Category definitions,collection records,4family mock children และการจัดกลุ่ม150productsเดิมตรงbaseline รักษาscale manifest18MocksและLegacy redirects
- [x] รูปก่อนหลัง/Browserresponsiveและtests/buildตามPlanผ่าน ไม่มีการอ้างruntimeสำเร็จจากsnapshotอย่างเดียว
- [x] มีbackup/receipt/source+asset manifests/diff auditและรายการข้อมูลที่ยังต้องยืนยัน

### Missing Information

ไม่มีข้อมูลที่ขวางการเริ่มงานเฉพาะverified-content scope; สเปกที่ขัดกัน/18Mocks/ไฟล์หาย/blank sourceและform contractsอยู่นอกส่วนที่จะเติมโดยการเดา รอข้อมูลยืนยันสำหรับส่วนนั้น Database targetต้องตรวจจากconfigurationและรายงานผลกระทบก่อนwriteตามPlan หากไม่ตรงscopeให้หยุดเฉพาะส่วนเขียนDB

### Approval Record / Current State

ผู้ใช้ถามให้ดึงข้อมูลมาใส่โปรเจกต์โดยรูปแบบไม่เสีย แผนimplementationฉบับนี้เพิ่งจัดทำ จึงยังไม่ถือว่าได้รับอนุมัติ รายละเอียดFile allowlist/ขั้นตอน/verification/R1 database impact/rollbackอยู่ในPlanท้ายplan.mdและoutput/legacy-content-migration-20261105/migration-plan.md ตรวจเฉพาะread-onlyและเขียนเอกสารแล้ว ยังไม่รันimporterหรือแก้application/data/DB Final Next.js feedback review: no qualifying framework issue during planning.

### Scope Revision — category changes deferred (2026-11-05)

ผู้ใช้ยืนยันให้คงหมวดหมู่เดิมไว้และจะจัดหมวดใหม่เอง จึงตัดงานเปลี่ยนหมวด/หมวดย่อย/การจัดกลุ่มสินค้าเดิมออกจากSpec/Plan คำสั่งนี้ยืนยันข้อจำกัดของงาน ไม่ถือเป็นการอนุมัติimplementationทั้งแผน ยังไม่มีการแก้แอป/ข้อมูลสินค้า/ฐานข้อมูล Final Next.js feedback review: no qualifying framework issue for this documentation-only scope revision.

### Implementation Approval Record (2026-11-05)

ผู้ใช้: “อนุมัติครับ เริ่มดึงข้อมูลมาใส่ตามแผนได้เลย โดยคงหมวดหมู่และรูปแบบของโปรเจกต์เดิมไว้ทั้งหมดครับ” อนุมัติแผนฉบับตัดงานเปลี่ยนหมวดออกแล้ว รวมการเพิ่มเฉพาะ9สินค้าใหม่ตามแผน ไม่ใช่การอนุมัติDeploy/Commit/Push

### Completed State / Contracts / Verification (2026-11-05)

นำเข้า9productsแล้ว:159published products,401page records,14solutions เติม4solutions/DRV/บทความเป้าหมาย/27Biz Talk covers ตรวจภาพจริง56ไฟล์ เพิ่มpublic47ไฟล์ คง150productsเดิม,112collections/สมาชิกหมวด,10solutionsนอกscopeและ295baseline filesนอกขอบเขตแก้ไขทุกค่า ไม่เปลี่ยนCSS/layout/navigation/category definitions/4family mock children/18model mocks API/Props/schemaเดิม สินค้าใหม่ใช้accessories familyที่มีอยู่เท่านั้น

ฐานข้อมูลเพิ่ม9IDsแบบinsert-only transaction:152→161total,150→159published ตรวจ152แถวเดิมเท่ากับbackupทั้งในtransactionและread-onlyหลังงาน ไม่update/delete ไม่มีDeploy/Commit/Push; local production previewที่http://localhost:3000 ใช้Node24.22.1

ผ่านcontent:validate,paths:check,TypeScript,ESLint,scopedPrettier,diffcheck,UAT27/27,Browser26/26และresponsive320/390/768/1440px รวมcatalog interactions/legacy redirects; layout metrics10กรณีเท่าbaseline Production buildผ่าน431/431static pages และHTTPsmoke10/10 API159products Catalogsuiteผ่าน65/65ในisolated current-code copyกับcanonical Git bytesของเอกสารหมวด ส่วนWindows worktreeเดิม64/65เพราะCRLF hashต่าง ไม่แก้เอกสาร/manifest/testหมวดนอกscope

พักรูปต้นฉบับ1รูปที่TLScertificateหมดอายุ และประโยคPU/NylonของSKU10838ที่ขัดกัน ไม่เดาข้อมูล ข้อจำกัด6URLs/20imagesและ18Mocksเดิมยังคงอยู่ รายละเอียดหลักฐาน/rollbackอยู่ในoutput/legacy-content-migration-20261105/delivery.md Final Next.js feedback reporting pass: no verified qualifying framework issue.

### Commit / Push Approval (2026-11-05)

ผู้ใช้: “สองจุดนี้พักไว้ก่อนครับ และ commit/push” อนุมัติให้commit/pushงานนำเข้าที่ตรวจแล้ว โดยพักรูปประกอบSUNFORD INDUSในหน้าWindowsและประโยคPU/Nylon/งานอาหารของSKU10838ไว้ตามเดิม เป้าหมายคือbranchปัจจุบัน `safe` → `origin/safe` ไม่รวมproduction release ไม่มีการเปลี่ยนapplication/dataเพิ่มเติมในขั้นตอนนี้

ผล: commit `a00afc2` นำเข้าข้อมูลพร้อมtests/ภาพ47ไฟล์ pushไป `origin/safe` สำเร็จ ตรวจremote hashตรงlocal HEADและworking treeสะอาดแล้ว ก่อนบันทึกผลเอกสารนี้ ไม่มีการเติมสองจุดที่พักไว้หรือสั่งproduction release
