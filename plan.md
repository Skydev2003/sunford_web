# Plan: Separate commits and push UAT (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files / Commit Groups

- Homepage: `src/app/(site)/page.tsx`; `src/features/home/components/brand-story.module.css`, `category-feature-icons.tsx`, `category-feature-panels.tsx`, `category-feature.tsx`, `home-page.module.css`, `stories-section.module.css`; `src/styles/category-feature.css`; `tests/e2e/category-feature.spec.ts`; `public/videos/ChatGPT Image Nov 4, 2026, 01_57_30 PM.png`, `public/videos/ChatGPT Image Nov 4, 2026, 01_57_44 PM.png`
- Catalog: `docs/sunford-scale-categories.md`; `src/app/(site)/[...path]/page.tsx`, `src/app/(site)/products/page.tsx`; `src/features/catalog/components/catalog-product-card.tsx`, `product-catalog.tsx`, `product-category-mock.tsx`, `product-category-mock.module.css`; deletions of `product-browser.tsx`, `category-banner.tsx`, `category-banner.module.css` in the same directory; `src/features/catalog/data/catalog-card-names.ts`, `mock-categories.ts`, `scale-category-models.json`, `scale-subcategories.ts`; `tests/catalog/scale-subcategories.test.ts`; `tests/e2e/catalog-category-audit.spec.ts`, `product-sections.spec.ts`, `product-category-mock.spec.ts`; `tsconfig.json`
- Navigation: `src/features/cms/data/navigation.ts`; `tests/catalog/navigation.test.ts`; `tests/e2e/navigation.spec.ts`, `hero-studio.spec.ts`
- Documentation: `MEMORY.md`, `spec.md`, `plan.md` (FormattingและผลGitเท่านั้น)
- Local evidence only: `output/commit-push-separated-20261104/` — Git patch/Untracked source backup/Manifest/Hashes/Checks/Commit report
- Excluded local media: `public/images/product-studio-20261104/` และ `public/videos/ChatGPT Image Nov 4, 2026, 02_14_56 PM.png` ยังไม่มีApp referencesและไม่เกี่ยวกับการทำงานปัจจุบัน

## Steps

- [x] ตรวจBranch/Remote/Changed files/งานDoneและCancellation พร้อมFetch origin
- [x] สำรองDiff/Untracked sourceและHashก่อนStage ตรวจรายการไฟล์ตามกลุ่ม
- [x] รันFormatting/Typecheck/Lint/Catalog+UAT unitตามScriptsและตรวจScope
- [x] StageแบบระบุPath ตรวจStaged diffและจัดCommitตามกลุ่ม
- [ ] Push origin/uatแบบปกติ ยืนยันSHAและสรุปไฟล์ที่คงLocalในรายงานส่งมอบ

## Impact / Rollback

R2สำหรับLocal commits; Pushจะเผยแพร่Revisionบนuatตามคำสั่ง ไม่แตะmainหรือProduction หากต้องย้อนหลังPushให้RevertเฉพาะCommit ห้ามRewrite shared history เก็บRaw patch/Untracked backupและHashesเพื่อป้องกันงานซ้อนระหว่างStage

## Verification Results

- Source commits:1e2243e(Home11ไฟล์),354538f(Catalog19ไฟล์),ffb6f7f(Navigation4ไฟล์) ตามด้วยDocumentation3ไฟล์ รวม37Pathsไม่ซ้ำกัน
- Full prettier/typecheck/eslintผ่าน Catalog60/60และUAT27/27ผ่านบนNode24 Initial UAT26/27มีAuditที่อ่านTracked deletionก่อนStage หลังStageรันเต็ม27ผ่านโดยไม่แก้ScriptหรือAppเพิ่ม
- Raw patch/Untracked ZIP18ไฟล์/Hashes/Groups manifestตรวจไว้ก่อนStage Source contenthashesตรงBaselineก่อนCommitแต่ละกลุ่ม Staged path setและWhitespaceตรวจตรงScope
- ไม่มีภาพUnused/Cancelled logo/Output/.env/DependenciesในStaging เหลือLocal media6ไฟล์ตามExcluded listด้านบน ไม่ลบ/แก้ไฟล์เหล่านี้
- งานนี้ไม่เปลี่ยนApp logic/ไม่Restart Dev/ไม่Production BuildหรือFull Browserซ้ำ ใช้ผลBrowserที่บันทึกในTaskก่อนหน้า ReceiptของPushและRemote SHAสุดท้ายอยู่output/commit-push-separated-20261104/delivery.mdหลังส่งมอบ ไม่ทำProduction release Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

---

# Plan: Supplied opening and navigation logos without glow (2026-11-04)

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

---

# Plan: Remove parent category subtitles (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `src/features/catalog/components/product-category-mock.tsx` — ลบParent subtitle spanทุกปุ่ม
- `src/features/catalog/components/product-category-mock.module.css` — ลบSubtitle style/2-row icon span คงขนาดปุ่มเดิม
- `tests/e2e/product-category-mock.spec.ts` — เพิ่มText assertionในTestเดิมว่าปุ่มเหลือชื่อเท่านั้น
- `spec.md`, `plan.md` — Scope/Approval/ผลจริง รักษาประวัติ
- `output/remove-category-subtitles-20261104/` — Backup5ไฟล์/ภาพ/รายงาน

## Steps

- [x] ตรวจคำสั่ง/Component/CSS ยืนยันScopeและApproval
- [x] สำรอง5ไฟล์ ลบSubtitle/StyleและปรับAssertion
- [x] รันBrowserเดิม11รายการ Typecheck/Scoped Lint/Format/Whitespaceและตรวจภาพ
- [x] อัปเดตผลในSpec/Plan

## Impact / Rollback

R2: ลบCopyรองและจัดแนวIcon/ชื่อในปุ่มขนาดเดิม ไม่มีData/Filter/Routeเปลี่ยน ย้อนเฉพาะDiffจากZIPโดยรักษางานอื่น

## Verification Results

Chrome11/11ผ่าน Text5ปุ่มเท่าชื่อหมวด ไม่มีSubtitle และResponsive320/390/768/844/1440คงปุ่ม76px/แถวเดียว/Child scrolling/Functionalเดิม ตรวจภาพDesktop1440/Mobile390แล้ว Typecheck/Scoped ESLint/Prettier/Whitespaceผ่าน DiffจำกัดParent spanและStyleรองพร้อมAssertionเดิม Backup5ไฟล์ตรวจIntegrityแล้ว หลักฐานoutput/remove-category-subtitles-20261104/ ใช้Dev3000เดิม ไม่Restart/BuildProduction/Deploy Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

---

# Plan: Remove red product belt frames (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `src/styles/category-feature.css` — Normal Border transparent/ลบShadowแดงและกรอบHoverเฉพาะThumbnail
- `spec.md`, `plan.md` — Scope/Approval/ผลตรวจ รักษางานเดิม
- `output/remove-belt-border-20261104/` — Backup3ไฟล์/Browser audit/ภาพ/รายงาน ไม่มีTestถาวรใหม่สำหรับCSSเฉพาะจุด

## Steps

- [x] ตรวจStyle owner/ภาพ/คำสั่งผู้ใช้ ยืนยันReady to Code/Approval
- [x] สำรอง3ไฟล์และแก้เฉพาะกรอบ/เงาในSelectorThumbnail
- [x] BrowserตรวจNormal/Hoverทั้ง4หมวด1440/390 ขนาดเดิม/ภาพ/Link/Keyboard focusและScreenshot
- [x] รันScoped belt animation/keyboard/moving-link regressionเดิม Format/Whitespace/Diffและอัปเดตผล

## Impact / Rollback

R2: Shared stylesheetแต่Diffจำกัด2Selectorของแถบที่ผู้ใช้ระบุ Border1pxยังคงพื้นที่เดิมแต่โปร่งใส คงKeyboard outlineและHover transform ย้อนเฉพาะDiffCSSจากZIP ไม่Resetงานเดิม

## Verification Results

Browser4หมวด1440/390รวม8กรณี Normal/HoverBorderโปร่งใส Shadownone ขนาด70x70 รูปโหลดและLinkอยู่ครบ Focus3px Solid ไม่มีOverflow/Page errors ตรวจภาพจริงDesktop/Mobileแล้ว Existing scoped belt regression4/4ผ่าน Animation/Hover pause/KeyboardและMoving linksทั้งDesktop/Mobile Prettier/WhitespaceและDiffเทียบZIPผ่าน เปลี่ยนเพียง2Selectorใน1CSS Backup3ไฟล์ตรวจIntegrityแล้ว หลักฐานbrowser.json/ภาพ/รายงานในoutput/remove-belt-border-20261104/ ใช้Dev3000เดิม ไม่Restart/TypecheckหรือBuildซ้ำสำหรับCSS-only/Deploy Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

---

# Plan: Sync primary product navigation with catalog (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `src/features/cms/data/navigation.ts` — สร้างPrimary linksจากDefinitions SyncRuntimeของSaved navเฉพาะเมนู/productsและsubmenuLabel
- `src/features/catalog/components/product-category-mock.tsx` — Query sync componentใต้Suspense/Valid ID/Stable selection callback/History replaceStateในParent events
- `tests/catalog/navigation.test.ts` — ตรวจชื่อ/URL/SyncSaved/No mutation/คงเมนูและGroupsอื่น
- `tests/e2e/navigation.spec.ts` — ปรับชื่อและURLที่เปลี่ยน เพิ่มDesktop/Mobileทั้ง5หมวด/All/Direct query/Refresh/Back/Invalid/Same-page
- `tests/e2e/hero-studio.spec.ts` — ปรับExpected Indicator URLเป็นQueryตรงหมวด
- `spec.md`, `plan.md` — Scope/Approval/Contract/ผลจริง รักษางานอื่น
- `output/sync-product-nav-20261104/` — Backup7ไฟล์/Source baseline/Browser screenshots/รายงาน

## Steps

- [x] ตรวจSource Header/CMS resolver/Catalog Definitions/Next Cache ComponentsและURL docs บันทึกScope/Approval
- [x] สำรองไฟล์ เพิ่มDerived navและQuery selectionตามFiles
- [x] เพิ่มUnit/Browser assertionsและตรวจNav Desktop/Mobile/No-JSรายการรวม/All/5Parent/Invalid/Back/Refresh/Local selection
- [x] รันCatalog unit/Navigation+Catalog browser/Typecheck/Scoped Lint/Format ตรวจภาพและScope
- [x] อัปเดตSpec/Planและผลจริง

## Impact / Rollback

R2: ชื่อและลิงก์Primary navมีผลทุกหน้าที่ใช้Header แต่ไม่แก้Header/Styles/คอลัมน์รอง Saved primary linksถูกแทนเฉพาะRuntimeตามคำสั่ง ไม่เขียนDB Query syncอยู่ใต้Suspenseเฉพาะตัวที่ไม่RenderUIเพื่อคงSSRสินค้า ปุ่มกรองใช้Replace history และไม่Reload ย้อนเฉพาะDiff7ไฟล์จากZIPหลังตรวจงานซ้อน

## Verification Results

- Catalog unit60/60ผ่าน รวมDerived labels/ID linksและSaved nav sync/No mutation/คงGroupsและเมนูอื่น
- Chrome21/21ผ่าน (Navigation10+Catalog11) Desktop1440/Mobile390ตรวจAll+5Parentตรงชื่อ/URL/Selected/Heading Direct Query/Refresh/Local parent/Same-page/Back/Invalid fallbackและNo-JSรายการรวม24การ์ดผ่าน ไม่มีPage errors/Overflow
- ชุดCatalogเดิมตรวจMembership/8Child/Mock/Search/Sort/Compare/Grid–ListและแถบChildเลื่อนResponsive5ขนาดยังผ่านครบ ภาพNav Desktop/MobileและSelectedตรวจแล้ว
- Typecheck/Scoped ESLint/Prettier/Whitespaceผ่าน Scope auditตรง2ไฟล์แอป+3TestตามPlan Header markup/Styles/Data definitionsและประวัติDocsเดิมคงอยู่
- รอบแรกทดสอบDesktopติดSelectorulผิดจากMarkupdiv จึงหยุดรอบนั้น แก้Harnessแล้วรันเต็ม21ผ่าน เก็บรอบก่อนในbrowser/และรอบสำเร็จในbrowser-final/
- ZIP7ไฟล์ตรวจIntegrityแล้ว หลักฐานdelivery.md/scope-audit.json/ภาพในoutput/sync-product-nav-20261104/ ใช้Dev3000เดิม ไม่Restart/Production Build/Full E2E/Database/Deploy ไม่รันHero studio suiteทั้งชุด;ปรับเพียงURL assertionตามContractใหม่โดยMenu routeเดียวกันตรวจผ่านNavigation Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

---

# Plan: Single-row scrollable catalog subcategories (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `src/features/catalog/components/product-category-mock.tsx` — Ref/Scroll event/ลูกศร/Track wrapperและKeyตามParent คงFilterเดิม
- `src/features/catalog/components/product-category-mock.module.css` — Tracknowrap/overflow-x ลูกศร44pxและResponsivewrapper
- `tests/e2e/product-category-mock.spec.ts` — เพิ่มAssertionsในResponsive testsเดิมสำหรับRow/Arrow/Keyboard/Parent reset รักษาFunctionalเดิม
- `spec.md`, `plan.md` — Scope/Approval/ผลจริง รักษางานเดิม
- `output/single-row-subcategories-20261104/` — Backup5ไฟล์/Source baseline/Browser screenshots/รายงาน

## Steps

- [x] ตรวจComponent/CSS/คำสั่งผู้ใช้ ยืนยันReady to CodeและApprovalตามScope
- [x] สำรองไฟล์และเพิ่มTrackแถวเดียวพร้อมลูกศรตามรายการFiles
- [x] รันChromeBrowserเดิม11รายการ ตรวจRow/No overflow/สองทิศ/Selected/Keyboard/Parent reset/Reduced motionและภาพ320/390/768/1440
- [x] Typecheck/Scoped Lint/Format/Whitespace/Diff auditและอัปเดตผลจริง

## Impact / Rollback

R2: UIเฉพาะChild navigation ลูกศรเลื่อนโดยไม่เลือกหมวด Trackใหม่เมื่อParentเปลี่ยน ปุ่มหมวดยาวคงชื่อเต็มและเลื่อนดูได้ ไม่มีGlobal styles/Dataเปลี่ยน ย้อนเฉพาะDiffจากZIPหลังตรวจงานซ้อน

## Verification Results

- Chrome11/11ผ่าน ไม่มีSkipped/Flaky รวมParent/Child/Search/Sort/Mock/Compare/Grid–Listเดิม
- Responsive320/390/768/844/1440: Child9ปุ่มอยู่แถวเดียว ชื่อnowrap ไม่มีDocument overflow ลูกศรขวาเพิ่มscrollLeft ซ้ายกลับ0 โดยAllยังSelectedเดิม Keyboard8TabsไปChildท้ายและEnterเลือกได้ Parentเปลี่ยนแล้วscrollLeft0 Reduced motionเลื่อนInstantผ่าน
- ตรวจภาพ320/390/768/1440แล้ว Typecheck/Scoped ESLint/Prettier/Whitespaceผ่าน Scope auditแยก2ไฟล์แอป+1Testของงานนี้จากConcurrent home-page.module.cssที่รักษาไว้ ประวัติDocsเดิมตรวจโดยแยกTaskหน้าแรกที่อัปเดตคู่ขนาน
- BackupZIP5ไฟล์ตรวจIntegrityแล้ว หลักฐานScope audit/Browser/ภาพ/รายงานอยู่output/single-row-subcategories-20261104/ ใช้Dev3000เดิม ไม่Restart/Production Build/Full E2E/Deploy Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

---

# Plan: Remove catalog explanatory notice (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `src/features/catalog/components/product-category-mock.tsx` — ลบParagraphแจ้งเหนือแถบหมวดทุกสถานะ
- `src/features/catalog/components/product-category-mock.module.css` — ลบ.noticeที่ไม่ใช้แล้ว
- `tests/e2e/product-category-mock.spec.ts` — ปรับAssertionว่าข้อความแจ้งไม่มีและคงFunctional checks
- `spec.md`, `plan.md` — Scope/Approval/ผลจริง รักษางานอื่น
- `output/remove-catalog-notice-20261104/` — Backup5ไฟล์และรายงาน

## Steps

- [x] ตรวจข้อความจริงและคำสั่งผู้ใช้ ยืนยันReady to Code/Approvalตามขอบเขตภาพ
- [x] สำรองไฟล์ ลบParagraph/StyleเฉพาะจุดและปรับAssertion
- [x] รันBrowserเดิม11รายการ Typecheck/Scoped Lint/Format/WhitespaceและตรวจDiff
- [x] อัปเดตผลในSpec/Plan

## Impact / Rollback

R2เฉพาะข้อความแจ้งและพื้นที่Paragraph ไม่มีป้ายMockสินค้า/State/Dataเปลี่ยน ย้อนเฉพาะDiffจากBackupโดยรักษางานอื่น

## Verification Results

ลบเฉพาะParagraphแจ้งทุกสถานะและCSS.notice ปรับAssertionไม่มีข้อความโดยคงMock card checks Browser11/11ผ่านรวมResponsive320/390/768/844/1440และFunctionalเดิม Typecheck/Scoped ESLint/Format/Whitespaceผ่าน ตรวจDiffเทียบBackup5ไฟล์และภาพMobileแล้ว หลักฐานoutput/remove-catalog-notice-20261104/ ใช้Dev3000เดิม ไม่Restart/BuildProduction/Deploy Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

---

# Plan: Refined black background across homepage (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `src/app/(site)/page.tsx` — ImportPage CSS Moduleและเพิ่มClassให้Home main ไม่เปลี่ยนSections/data
- `src/features/home/components/home-page.module.css` — สร้างLocal Home theme/Video title/Hero fallback/Belt/Footer sibling scope ไม่แก้Global CSS
- `src/features/home/components/brand-story.module.css` — เปลี่ยนพื้น/เส้น/Overlay cards/ข้อความจากPaleเป็นBlack/Charcoal/WhiteเฉพาะComponentที่ใช้หน้าแรก
- `src/features/home/components/stories-section.module.css` — เปลี่ยนSection/Article Card/Button/Textให้Dark ใช้เฉพาะหน้าแรก
- `spec.md`, `plan.md` — ขอบเขต/Approval/Contract/ผลจริง รักษาประวัติ
- `output/homepage-black-20261104/` — ZIP5ไฟล์เดิม Source baseline/Before–After screenshots/Contrast/Browser/Scope/รายงาน

## Steps

- [x] ตรวจSpec/Memory/Live page/Actual consumers/Styles/Next guide/Versions ยืนยันคำสั่งและสำรองก่อนแก้
- [ ] เก็บBeforeภาพStory/Footer/HomeและBaselineProducts style/Content/Links
- [ ] ปรับ4ไฟล์แอปตามFiles ไม่แตะHeader/Footer sourceหรือShared CSS
- [ ] ตรวจทุกSection/Desktop/Mobile/Tablet/Contrast/ไม่มีOverflow/Header tone/Route theme leakและภาพจริง
- [ ] รันTypecheck/Scoped Lint/Format/Browser regressionเดิมที่เกี่ยวข้อง:Hero/Header/Category/CustomerStory/Stories–Video/Links/Footer map
- [ ] บันทึกผล/Scope/ประวัติDocs/Next Feedbackและส่งมอบ ไม่Deploy

## Impact / Rollback

R2:เปลี่ยนเฉพาะCSSสีและPage hook ความเสี่ยงอ่านไม่ชัด/Theme leak/Footerตัวหนังสือเดิมดำบนดำ ใช้Local sibling selectorsไม่แตะRoot tokens และตรวจ/productsกับInternal page Headerจริง คืนเฉพาะ4ไฟล์ DiffจากZIP+ลบModuleใหม่หลังตรวจงานซ้อน ไม่Reset Dirty tree ไม่ย้อนCatalog work

## Verification Results

รอผลรอบนี้ ใช้Dev3000เดิม ไม่Restart/Deploy ไม่อ้างFull E2E หรือField performance

---

# Plan: Compact single-row catalog categories (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `src/features/catalog/components/product-category-mock.module.css` — ย่อแถบหมวดหลัก แถวเดียว/Overflowในแถบ ถอดMedia rulesที่เคยทำ2–4คอลัมน์เฉพาะหมวด
- `tests/e2e/product-category-mock.spec.ts` — ปรับResponsive assertionsเดิมให้ตรวจแถวเดียว/ขนาด/Keyboard scroll รักษาProduct gridและFunctional assertions
- `spec.md`, `plan.md` — Scope/Approval/ผลตรวจ รักษาประวัติเดิม
- `output/compact-categories-20261104/` — Backup4ไฟล์/Source hashes/Browser screenshots/รายงาน

## Steps

- [x] อ่านSpec/Memory/Component/Active CSS/Tokens ยืนยันคำสั่งผู้ใช้และบันทึกขอบเขต
- [x] สำรองไฟล์และแก้CSSเฉพาะหมวดหลักตามSpec
- [x] ปรับResponsive assertionsเดิมและรันชุดProductCategoryMock11รายการด้วยInstalled ChromeบนDev3000
- [x] ตรวจภาพ320/390/768/1440และKeyboard/Selected/Overflow พร้อมTypecheck/Scoped Lint/Format/Scope audit
- [x] อัปเดตผลจริงในSpec/Planและส่งมอบ

## Impact / Rollback

R2: เปลี่ยนเฉพาะขนาดและLayoutของแถบหมวดหลัก Desktopลดจาก2แถวเป็น1แถว จอเล็กต้องเลื่อนดูหมวดท้าย เก็บFocus outlineและชื่อเต็ม ปุ่มสูง76px คงTouch target; ไม่มีShared files/Data/Stateเปลี่ยน ย้อนเฉพาะDiffจากZIPโดยรักษางานเดิม

## Verification Results

- Chrome11/11ผ่าน ไม่มีSkipped/Flaky ตรวจ5Parent/8Child/Mock/Search/Sort/Compare/Grid–ListและResponsive320/390/768/844/1440
- ทุกขนาด5ปุ่มอยู่แถวเดียว สูงไม่เกิน80px (CSS76px) SVG24px ชื่อไม่Clipในปุ่ม Desktopไม่ต้องScroll จอแคบScrollเฉพาะNav ไม่มีDocument overflow Keyboard4Tabsไปหมวดท้ายและเลื่อนเข้ามาให้เห็นครบ Focus outlineยังอยู่
- ตรวจภาพ320/390/768/1440แล้ว Typecheck/Scoped ESLintและCSS+Test Prettierผ่าน git diff --checkผ่าน
- ZIP4ไฟล์ตรวจIntegrityแล้ว Scope auditก่อนงานHome blackเริ่มพบเฉพาะ1CSS+1Testของงานนี้ ประวัติDocsจากShort model namesลงไปคงอยู่ งานHome blackที่เพิ่มคู่ขนานรักษาไว้และไม่รวมในScopeอ้างงานนี้
- Spec/Planทั้งไฟล์มีFormatting warningsจากส่วนHome blackที่เพิ่มพร้อมกัน จึงตรวจFormatเฉพาะส่วนงานนี้และคงส่วนงานอื่นตามเดิม
- หลักฐานoutput/compact-categories-20261104/ ใช้Dev3000เดิม ไม่Restart/Production Build/Full E2E/Deploy Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

---

# Plan: Short product card model names (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `src/features/catalog/data/catalog-card-names.ts` — สร้างExplicit verified labels/Prefix cleanup/2Manifest display aliases ไม่แก้ข้อมูลจริง
- `src/app/(site)/products/page.tsx` — ส่งRecord Product ID→Card labelจากProduct source metadata
- `src/features/catalog/components/product-category-mock.tsx` — ใช้Short labelในAll/Parent/Child/Sort/Search/render โดยเก็บข้อมูลเดิม
- `tests/e2e/product-category-mock.spec.ts` — ปรับExpected displayเฉพาะ2ชื่อAliasตามคำสั่งใหม่ ไม่ลดMembership/Count/Link assertions
- `spec.md`, `plan.md` — Spec/Approval/Contract/ผลตรวจ
- `output/short-card-names-20261104/` — ZIP5ไฟล์เดิม Source audit/Mapping/Browser/ภาพ/รายงาน

## Steps

- [x] อ่านSpec/Memory/Source names/รายละเอียด ยืนยันFallbackจากผู้ใช้และสำรองไฟล์ก่อนแก้
- [x] เพิ่มName helper/Server mapping/Client presentationตามFiles ไม่แตะData/Styles
- [x] ปรับ2Alias display expectationsและรันScoped Browserเดิม พร้อมTypecheck/Lint/Format/Catalog unit
- [x] Browserตรวจชื่อยาวตามภาพ/150จริง/Mock18/ไม่มีข้อมูลเสีย/Responsive4ขนาด/Grid–List และSource mapping traceability
- [x] อัปเดตผลจริง/Scope/ประวัติDocs/Next feedback ส่งมอบไม่Deploy

## Impact / Rollback

R2 Display-only Route propใหม่และSortเปลี่ยนตามชื่อสั้น ห้ามใช้Labelsไปเปลี่ยนMembershipหรือDB ชื่อเต็มยังใช้Search/Detail/Compare sourceเดิม ย้อนDiffตามZIPและลบเฉพาะHelperใหม่เมื่อจำเป็น ตรวจงานซ้อนก่อนคืน ห้ามResetต้นไม้ทั้งชุด

## Verification Results

- Name audit150รายการ ย่อ83ชื่อ ชื่อยาวสุด31ตัวอักษร 8รุ่นLegacyตามภาพเป็นรหัสตรงSource ไม่เดารหัสจากความจุ/มาตรฐาน/Numeric ID Consumablesมีขนาด/Packที่ยืนยันและแยกกันน้ำ
- Browser150Card names/LinksตรงAuditครบ Searchชื่อเต็มยังทำงาน Grid/List4ขนาดรวม8กรณีCentered/No clipping/No overflow ตรวจภาพDesktop/Mobile/Consumablesแล้ว Page Error0 Mock18เดิมคงอยู่
- Catalog Unit58/58ผ่าน Browser11/11ผ่านทั้งรอบแรกและFinal run ไม่มีFlaky/Skipped Typecheck/Scoped ESLint/Prettier/Whitespaceผ่าน Final runทำหลังพบConcurrent route cleanup
- Applicationงานนี้มีHelperใหม่+Route+Client mapping ไม่มีStyle/Data/Shared Card change ส่วนCatch-all/ProductCatalog/Legacy Browser+Banners removalและRoute regressionเป็นงานConcurrentที่รักษาไว้ ไม่อ้างเป็นงานรอบนี้ /IndicatorปัจจุบันRedirect/productsตามCleanupนั้น
- เก็บExploratory failuresจริง:ครั้งแรกScreenshot clipนอกImageจึงเปลี่ยนวิธีCapture;ครั้งต่อมาPrimary150/8Layoutsผ่านแต่AssertionLegacy cardTimeoutเพราะRouteRedirectของงานซ้อน ยืนยันRedirectด้วยHeading level1แทนLocatorที่ตรงทั้งh1/h2 ไม่มีApp changeจากHarness assumptionsเหล่านี้
- ZIP5ไฟล์ก่อนแก้ Source auditแยกงานตนเอง/Concurrent ประวัติDocsเดิมรวมTaskCleanupที่เพิ่มคู่ขนานรักษาไว้ หลักฐานdelivery.md/summary.jsonและผลจริงในoutput/short-card-names-20261104/ ใช้Dev3000เดิม ไม่Restart/Production Build/Full E2E/Database/Commit/Deploy Final Next feedback reviewไม่มีFramework candidateใหม่

---

# Plan: Remove unused legacy catalog structure (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `src/app/(site)/[...path]/page.tsx` — Redirect หมวดเก่าที่ไม่ใช่ CMS-managed ไป /products และถอดทาง Render Browser/Banner เก่า
- `src/features/catalog/components/product-catalog.tsx` — ถอด Import/ทางเรียก ProductBrowser; คง Catalog ส่วนหน้าแรก/Managed เดิม
- `src/features/catalog/components/product-browser.tsx` — ลบ Component หน้าเก่า
- `src/features/catalog/components/category-banner.tsx`, `src/features/catalog/components/category-banner.module.css` — ลบ Banner ที่ใช้เฉพาะหน้าเก่า
- `tests/e2e/catalog-category-audit.spec.ts` — เปลี่ยน Audit หน้าเก่าเป็น Redirect ทุกหมวดและตรวจหน้าใหม่ Responsive/No JS/Noncatalog
- `tests/e2e/product-sections.spec.ts` — เปลี่ยนการตรวจ Landing เป็น Redirect คง Product detail/gallery assertions เดิม
- `tests/e2e/product-category-mock.spec.ts` — เปลี่ยนเฉพาะ Regression หน้าหมวดเดิมเป็น Redirect รักษางาน Expected ชื่อรุ่นที่แก้พร้อมกัน
- `tests/e2e/navigation.spec.ts`, `tests/e2e/hero-studio.spec.ts` — ปรับ Expected URL หลังคลิกลิงก์หมวดเก่าเป็น /products
- `tsconfig.json` — เพิ่ม output ใน exclude เพราะ Typecheck พบไฟล์สำรองเก่านำเข้า Component ที่ลบแล้ว; ไม่เปลี่ยน Compiler options ของแอป
- `MEMORY.md` — บันทึกให้แยกไฟล์หลักฐานออกจาก TypeScript compilation ป้องกันนำ Snapshot เก่ากลับมาเป็น App dependency
- `spec.md`, `plan.md` — บันทึก Scope/Approval/Contract/ผลจริง
- `output/legacy-catalog-removal-20261104/` — BackupZIP, Hash baseline, Browser artifacts และรายงาน

## Steps

- [x] ตรวจภาพ Spec/Memory และเส้นทางที่เรียกโครงหน้าเก่า
- [x] รับคำตอบเรื่องขอบเขตและพฤติกรรม URL แล้วปรับ Spec/Plan ให้พร้อมตรวจ
- [x] ยืนยันว่า Spec เป็น Ready to Code และมีการอนุมัติขอบเขตนี้แล้ว
- [x] สำรองไฟล์ที่เกี่ยวข้องโดยรักษางานที่ยังไม่ Commit แล้วแก้เฉพาะรายการที่อนุมัติ
- [x] ตรวจ Redirect ทุก Source category/Collection, Browser 390/768/1440 และ No JS, Product detail/gallery, หน้าใหม่ 5Parent/8Child/Search/Compare และ Menu navigation ที่เกี่ยวข้อง
- [x] รัน Typecheck/Scoped Lint/Format/Catalog unit พร้อมตรวจ Scope และภาพจริง
- [x] อัปเดตผลตรวจและสถานะใน spec.md / plan.md

## Impact / Rollback

R2: เปลี่ยน URL หมวดเก่าทุกหน้าตามคำยืนยัน ผู้เปิดลิงก์เดิมจะเห็นรายการรวมใน /products ไม่คงตัวกรองหมวดเดิม; ไม่แก้ Shared styles/Header/Data resolver และไม่ลบรูป CSS ของการ์ดใหม่ยังต้องอยู่ ย้อนเฉพาะ Diff ของงานนี้จาก ZIP หลังตรวจงานซ้อน ห้าม Reset Dirty tree

## Verification Results

- Source inspection ยืนยัน `ProductBrowser` ถูกเรียกใน Catch-all route เมื่อ `getCatalogPage` คืนหมวดสินค้า และ resolver รองรับหลายกลุ่ม
- ลบ3ไฟล์Component/Banner style และถอดConsumerจากCatch-all/ProductCatalog; Shared card CSS/Resolver/Manifest Hashเท่าBaseline
- Source category/Collection158เส้นทางตอบ307 Location=/products ครบ Browser390/768/1440และNo JSไปหน้าใหม่ ไม่มีBanner/Sidebarเก่า ภาพทั้ง3ขนาดตรวจแล้ว ไม่มีOverflow/Page errors
- Installed Chrome suite26/26ผ่าน (catalog-category-audit6, navigation7, product-category-mock11, product-sections2) รวม26Product detail/galleryเดิม และSearch/Sort/Compare/5Parent/8Child/Grid/List/Responsive5ขนาด
- Catalog unit58/58ผ่าน Typecheck/Scoped ESLint/Prettier/git diff --checkผ่าน TypecheckรอบแรกพบArchived TSXในoutputจึงExcludeเฉพาะoutputพร้อมคงหลักฐานเดิม
- Browserรอบแรก24รายการเริ่มไม่ได้เพราะBundled Chromiumไม่มีในเครื่อง Request tests2รายการผ่าน รักษาFailure artifactsไว้แล้วรันInstalled Chromeครบ26ผ่าน
- BackupZIP14ไฟล์ตรวจIntegrityแล้ว Source-before284ไฟล์/Delta auditและประวัติSpec/Planก่อนงานเดิมตรวจผ่าน หลักฐานและdelivery.mdในoutput/legacy-catalog-removal-20261104/
- ใช้Dev3000เดิม ไม่Restart/Production Build/Full E2E/Database/Commit/Deploy ไม่รันHero studio suiteทั้งชุด; URL assertionปรับตามContractใหม่และเส้นทางMenuเดียวกันตรวจผ่านNavigation suite Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

---

# Plan: Center model-only product card copy (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `src/features/catalog/components/catalog-product-card.tsx` — เพิ่มmodelOnly opt-in defaultfalse ไม่RenderBrand/Subtitle/Tagsในโหมดนี้ คงPhoto/Links/Compare
- `src/features/catalog/components/product-category-mock.tsx` — เปิดmodelOnlyทุกReal Card ปรับMockให้Titleอย่างเดียวพร้อมMock overlayในArt
- `src/features/catalog/components/product-category-mock.module.css` — จัดกึ่งกลางTitle/CopyแบบScoped Grid/List/Mock ไม่แก้Shared CSS
- `spec.md`, `plan.md` — ขอบเขต/Approval/Contracts/ผลตรวจ
- `output/model-only-cards-20261104/` — Backup5ไฟล์/Source audit/Browser results/ภาพ/รายงาน

## Steps

- [x] ตรวจSpec/Memory/Card consumer/Stylesและคำสั่งล่าสุด บันทึกApproval/สำรองก่อนแก้
- [x] แก้3ไฟล์แอปตามขอบเขต โดยCard consumerอื่นdefaultfalse
- [x] BrowserตรวจReal5Parent/Mock/Grid–List/ชื่อยาว/Responsive4ขนาด และCategoryเดิมไม่เปลี่ยน
- [x] รันScoped Catalog Browser Regressionเดิม Typecheck/Lint/Format/Whitespaceและตรวจภาพจริง
- [x] ตรวจScope/ประวัติDocs อัปเดตผลจริง/Next Feedback ส่งมอบโดยไม่Deploy

## Impact / Rollback

R2: CatalogProductCardใช้ร่วมกันจึงdefaultfalseและตรวจCategoryเดิมให้ยังมีBrand/Subtitle/Tags ส่วนชื่อกึ่งกลางจำกัดด้วยSelectorในProductCategoryMock ไม่แตะGlobal styles คืนเฉพาะDiff3ไฟล์จากZIPหลังตรวจงานซ้อน ห้ามReset Dirty tree

## Verification Results

- ตรวจครบ150Real/18Mockใน5Parent (92/7/23/3/43รวมMock) ทุกReal Card textเท่าชื่อรุ่นเพียงอย่างเดียว ไม่มีp/span Brand/Tags รูปและ2Linkเดิมครบ Mockเหลือรุ่นกับป้ายในArt ไม่มีAction
- Grid/List320/390/768/1440 ทั้ง8กรณีชื่อCentered ไม่มีClipping/Overflow ตรวจภาพPlatform Desktop/Mobile/ListและMockแล้ว Page Error0
- Category /Indicatorใช้defaultfalseยังมีBrand/Subtitle/Tagsเดิม Browser Regressionเดิม11/11ผ่าน ไม่มีFlaky/Skipped ครอบคลุมMembership/Search/Sort/Featured/Pagination/Parent reset/Compare/Responsive
- Typecheck/Scoped ESLint/Prettier/Whitespaceผ่าน Source baseline auditพบต่างเฉพาะ3ไฟล์แอปในPlan ประวัติSpec/Planเดิมคงอยู่ ไม่แก้Shared CSS/Data/Database
- หลักฐานdelivery.md/presentation.json/regression.json/scope-audit.jsonและภาพในoutput/model-only-cards-20261104/ ZIP5ไฟล์ก่อนแก้ ใช้Dev3000เดิม ไม่Restart/เพิ่มTestถาวร/Production Buildซ้ำ/Full E2E/Commit/Deploy Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

---

# Plan: Match product category icons to homepage (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `src/features/catalog/components/product-category-mock.tsx` — Import4ไอคอนหน้าแรกและสร้างPOSเฉพาะหน้าแทนParent Package
- `spec.md`, `plan.md` — ขอบเขต/คำอนุมัติ/ผลตรวจ รักษาประวัติเดิม
- `output/catalog-icons-20261104/` — BackupZIP/Before–After bounds/Screenshots/รายงาน ไม่เพิ่มTestถาวรสำหรับการเปลี่ยนไอคอน

## Steps

- [x] อ่านSpec/Memory/Icons/Styles/Next guide/Versionsและยืนยันคำสั่งผู้ใช้
- [x] สำรอง3ไฟล์ก่อนแก้และบันทึกScope/Approval
- [x] เก็บBaseline BrowserGeometry แล้วแทน5Parentไอคอนในไฟล์เดียว
- [x] ตรวจ4SVGตรงHome/POSแตกต่างจากPackage/ขนาด/สี/Accessible label/Category selectionที่320/390/768/1440และภาพจริง
- [x] Typecheck/Scoped Lint/Format/Scope check พร้อมอัปเดตผลจริง

## Impact / Rollback

R2กระทบIcon markupเฉพาะหมวดหลัก ไม่เพิ่มState/Data/CSS/Shared module changes ย้อนเฉพาะImport/Icon mapและการแสดงผล1จุดจากZIP รักษางานเดิมในDirty tree

## Verification Results

- Browserจริงเทียบ4SVGกับหน้าแรกouterHTMLตรงกัน ทั้ง5Iconแตกต่างกัน POSสร้างใหม่ขนาด32/viewBox32/stroke1.75/currentColor/roundตรงต้นแบบ
- 320/390/768/1440: Card boundsเท่าBaselineทุกตัว Icon32x32 ไม่มีDocument Overflow ภาพDesktop/MobileและPOS selectedตรวจแล้ว
- เลือกทั้ง5หมวดได้ aria-pressed=true และSVGสีrgb(215,25,45) Mock Product Packageยังstroke1.2เดิม Page Error0 ไม่เพิ่มState/แก้Data/Styles
- Typecheck/Scoped ESLint/Prettier/git diff --checkผ่าน Scope auditทุกไฟล์ในsrcพบต่างเพียงproduct-category-mock.tsx; ตรวจย้อนDiffตรงเฉพาะIcon imports/map/renderและประวัติSpec/Planเดิมคงอยู่
- BackupZIP3ไฟล์ Before geometryและภาพ/Browser results/รายงานในoutput/catalog-icons-20261104/ ไม่เพิ่มTestถาวรหรือBuildProductionซ้ำสำหรับR2เฉพาะSVG ไม่อ้างFull E2E ใช้Dev3000เดิม ไม่Restart/Commit/Deploy Final Next feedback reviewไม่มีQualifying Framework Issueใหม่

---

# Plan: Exact scale model manifest with missing-model mocks (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `docs/sunford-scale-categories.md` — สำเนาเนื้อหาไฟล์ผู้ใช้ที่จัดFormattingตามRepoเพื่อTraceability ต้นฉบับBytesเดิมเก็บในoutputพร้อมHash ไม่เป็นคำสั่งAgent
- `src/features/catalog/data/scale-category-models.json` — Manifest8หัวข้อ/กลุ่ม/รุ่นตามเอกสาร
- `src/features/catalog/data/scale-subcategories.ts` — แทนKeyword matcherด้วยModel resolver/Explicit aliases/Mockเมื่อไม่พบ ไม่แก้Sourceธุรกิจ
- `src/features/catalog/data/mock-categories.ts` — ขยายChild DTOด้วยModel entries/Mockที่ไม่เป็นProduct ID
- `src/app/(site)/products/page.tsx` — ส่งModel manifestที่Resolveแล้วเฉพาะParentScales ไม่ใช้Legacy industrial/laboratoryจัด8Childอีก
- `src/features/catalog/components/product-category-mock.tsx` — รวมReal/Mock view entries เฉพาะScales แยกCount/Disable CompareสำหรับMock รักษาControlsเดิม
- `src/features/catalog/components/product-category-mock.module.css` — Mock card/list responsiveตามBrandเดิม ไม่ใช้Shared Stylesใหม่
- `tests/catalog/scale-subcategories.test.ts` — ตรวจเอกสารเทียบManifest100%, Exact codes/Aliases/Variants/Missing/No keyword fallback/Parent boundary
- `tests/e2e/product-category-mock.spec.ts` — ปรับContractเป็นManifest เพิ่มMock safety/Search/Featured/Pagination/Real CompareและCoverageเดิม
- `MEMORY.md` — บันทึกว่ารายการรุ่นที่ผู้ใช้ยืนยันแทนเกณฑ์Keywordเก่าเฉพาะ8Child ป้องกันคืนFitdays exclusionโดยผิดขอบเขต
- `spec.md`, `plan.md` — ขอบเขต/คำอนุมัติ/Contract/ผลจริง รักษาประวัติและงานอื่น
- `output/scale-manifest-20261104/` — Backup ZIP/Source Hash/Matching audit/Results/Screenshots

## Steps

- [x] อ่านไฟล์ล่าสุด/Spec/Memory/Sourceและตรวจชื่อรุ่นจริง ยืนยันคำสั่งที่อนุญาตMock ไม่เดารหัสที่ใกล้กัน
- [x] Backupไฟล์เดิมและHashก่อนMutation เก็บสำเนาเอกสาร/Manifestตรงกัน
- [x] ปรับResolver/DTO/Route/UIตามFiles ไม่เขียนDatabaseหรือShared Components
- [x] ตรวจUnit ManifestตรงMD/รหัส/Variant/Alias/Mock และBrowser8ChildครบทุกEntry/Root74/150/อีก4Demoเดิม
- [x] ตรวจSearch/Sort/Featured/Pagination/Grid–List/Compare/Mockไม่มีLink ที่320/390/768/844Landscape/1440 พร้อมภาพจริง
- [x] รันTypecheck/Scoped Lint/Format/Unit/BuildในQAแยก ตรวจHashและอัปเดตผลจริง/Next feedbackก่อนปิดQA

## Impact / Rollback

เปลี่ยนรายการChildเป็นรายการที่ผู้ใช้ระบุ ผลการจัดกลุ่มก่อนหน้าไม่ใช่ข้อกำหนดใหม่ในรอบนี้ ความเสี่ยงคือรหัสคล้ายกันจับผิดหรือMockถูกเข้าใจเป็นสินค้าจริง จึงExact match/Explicit aliasesและป้ายMockชัด ไม่มีURL/Compare/ข้อมูลกายภาพปลอม GlobalAllไม่เพิ่มMockเป็นสินค้าจริง คืนเฉพาะDiffจากBackupZIPหลังตรวจงานซ้อน ไม่Reset HEAD/แก้DB/Deploy

## Verification Results

- Manifestเทียบ8หัวข้อ/กลุ่ม/ทุกรุ่นกับMarkdownผ่าน ต้นฉบับBytesเดิมและสำเนาจัดFormattingมีHashแยก ตรวจWSS30KSแตกLCD/LEDและAlias2รายการ ไม่จับรหัสต่างSuffix/ตัวเลขแทนกัน
- AuditReal/MockรายChild18/5,15/6,9/0,6/1,8/4,37/1,12/14,11/3 Mockไม่ซ้ำ18รุ่น ParentScalesยัง74จริง Global150จริง อีก4Parent/2Demoเดิม ไม่เขียนDB/Schema/API
- Catalog Unit58/58ผ่าน Typecheck/Scoped ESLint/Prettier/Whitespaceผ่าน Node24.22.1 webpack Build420หน้าผ่านในQAแยก Sourceแอป6ไฟล์HashตรงWorkspace/QA
- ProductionBrowser13/13ผ่าน ไม่มีFlaky/Skipped ครอบคลุม8Childพร้อมรายการครบและMock safety/Search/Sort/Featured/Grid–List/Pagination/Parent reset/Compareและ5Responsive sizes เพิ่มMock Grid/List10กรณีไม่มีAction/Link/รูปปลอม/Overflow ตรวจภาพDesktop/Mobileแล้ว
- Devแรก10/11:Testคาดว่าCompare barไม่มีเมื่อไม่มีSelection แต่UIเดิมแสดง0/3 ปรับAssertionให้ตรวจ0/3/ปุ่มDisabledและCancelตามพฤติกรรมจริง Focused1/1และProductionครบ13/13ผ่าน เก็บdev-tests.json/dev-recheck.json ไม่อ้างรอบแรกผ่านหรือเปลี่ยนAppเพื่อผลนี้
- ใช้Snapshot fallbackในQA ไม่ตรวจLive DB ไม่รันFull E2E Suiteและไม่อ้างแก้Detail baseline/Windows case-only slugจากงานก่อน งานHomepage/Mediaคู่ขนานยังอยู่ BackupZIP10ไฟล์รวมMemoryและRaw referenceแยก
- หยุดเฉพาะQA3168 PID45504 ไม่มีListener3168 Dev3000 PID15684เดิมยังทำงาน ไม่มีCommit/Deploy Final Next feedback reviewไม่มีQualifying Framework Issueใหม่ หลักฐานdelivery.md/summary.jsonในoutput/scale-manifest-20261104/

---

# Plan: Enlarge homepage platform and indicator artwork (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `src/features/home/components/category-feature-panels.tsx` — เพิ่มdata-categoryให้กรอบรูปตามselected IDเดิมเพื่อScopeการขยาย
- `src/styles/category-feature.css` — เพิ่มSelectorเฉพาะDirect imgของplatforms/indicatorsและscale1.2ในกรอบเดิม เป็นStylesheetส่วนกลางที่จำกัดผลเฉพาะ2รูปตามคำขอ
- `spec.md`, `plan.md` — ขอบเขต คำสั่งแก้ขนาดและผลตรวจจริง รักษางานอื่น
- `output/homepage-enlarge-images-20261104/` — Backup/Before–After Geometry/Screenshots/Results/รายงาน

## Steps

- [x] ตรวจSource/Style/Spec/Memoryและคำขอ สำรอง4ไฟล์พร้อมHashก่อนแก้
- [x] วัดรูปทั้ง4หมวดที่390/1440ก่อนแก้และเก็บภาพเป้าหมาย
- [x] เพิ่มCSS hookและscaleเฉพาะ2รูปตามFiles
- [x] วัดหลังแก้เทียบBefore ตรวจรูปเป้าหมายใหญ่20%และกรอบ/อีก2รูปเดิม ตรวจภาพไม่ตัดสินค้า
- [x] รันChrome Category RegressionเดิมรวมResponsive12ขนาด ตรวจภาพ320/390/768/1440และTypecheck/Scoped Lint/Format ไม่เพิ่มTestที่จำลองCSSหรือProduction Buildซ้ำ
- [x] ตรวจScope/รักษางานคู่ขนาน บันทึกผล/Next Feedbackและส่งมอบ

## Impact / Rollback

Stylesheetส่วนกลางเพิ่มRuleที่มีCategory Selectorเฉพาะ2รูป ไม่เปลี่ยนRuleเดิม ความเสี่ยงคือตัดตัวสินค้าเมื่อขยาย จึงคงoverflow hiddenและตรวจภาพจริงทุกขนาด ย้อนเฉพาะRuleใหม่และdata attributeหลังตรวจงานซ้อน ไม่คืนStylesheetทั้งไฟล์หรือแก้Global Tokens

## Verification Results

- Before/Afterที่390/1440ยืนยัน2รูปขยาย20%ทั้งความกว้าง/สูง รูปอื่นและกรอบเดิมไม่เปลี่ยนตาม `comparison.json` ไม่มีDocument Overflow
- ตรวจภาพจริงBefore/Afterเป้าหมายทั้ง2หมวดและภาพResponsive320/390/768/1440 ตัวสินค้ายังครบ ไม่ทับเนื้อหา Responsive Regression12ขนาดผ่าน ไม่มีPage Errorใหม่
- Typecheck/Scoped ESLint/PrettierและWhitespace Checkผ่าน Testเดิมไม่เปลี่ยน รอบรวม10/11ผ่านและEnter navigation1กรณีรอURLเกิน5วินาที; Targeted rerunเดิม1/1ผ่านโดยไม่เปลี่ยนSource/Test เก็บ `browser-tests.json` และ `keyboard-recheck.json` แยก ไม่อ้างว่ารอบรวมผ่าน11/11หรือยืนยันสาเหตุTimeout
- Scope auditตรวจเทียบZIPยืนยันงานนี้เพิ่มเพียงdata attributeและCSS Rule ส่วนScale SubcategoriesมีSource/Test/Planอัปเดตคู่ขนาน รักษางานเหล่านั้นไว้ ไม่แก้หรือย้อนทับ
- หลักฐาน: `output/homepage-enlarge-images-20261104/delivery.md`, `before.json`, `after.json`, `comparison.json`, `scope-audit.json`, Browser ResultsและภาพBefore/After
- ใช้Dev3000เดิม ไม่เริ่ม/หยุดServer ไม่แก้PNG/Database/Dependency ไม่BuildProductionซ้ำหรือDeploy Next Feedbackไม่มีQualifying Framework Issueใหม่

---

# Plan: Eight scale subcategories (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `src/features/catalog/data/scale-subcategories.ts` — สร้าง8นิยาม/เกณฑ์และจับคู่เฉพาะหลักฐานจริงของParentเครื่องชั่ง
- `src/app/(site)/products/page.tsx` — ใช้8Childใหม่เฉพาะScales ดึงMembershipindustrial/laboratoryเดิม คงอีก4Parent
- `src/features/catalog/data/mock-categories.ts` — เพิ่มสถานะChildตัวอย่างต่อParent ไม่เปลี่ยน5Parentเดิม
- `src/features/catalog/components/product-category-mock.tsx` — ปรับข้อความกำกับและAccessible groupตามChildจริง/ตัวอย่าง คงControlsเดิม
- `src/features/catalog/components/product-category-mock.module.css` — จำกัดความกว้าง/Wrapชื่อChildยาวในStyleเฉพาะหน้านี้
- `tests/catalog/scale-subcategories.test.ts` — เพิ่มReal source/Overlap/Negative/Missing/Parent boundaryและWater+Dustทั้ง2อย่าง
- `tests/e2e/product-category-mock.spec.ts` — ตรวจ8ChildและนโยบายOverlapแทนPartitionเฉพาะScales คง5Parent150/อีก4DemoและControls/Responsive
- `MEMORY.md` — ตามคำสั่งProject MemoryในAGENTS บันทึกข้อผิดพลาดการใช้คำย่อยครัวที่ไปตรงครอบครัวและวิธีตรวจRegression ไม่เปลี่ยนSkillหรือขอบเขตUI
- `spec.md`, `plan.md` — คำอนุมัติ/Contract/ผลจริง รักษาประวัติและงานอื่น
- `output/scale-subcategories-20261104/` — Backup ZIP/Hash ผลตรวจ ภาพและรายงาน ไม่เก็บSourceดิบที่TSCจะอ่านซ้ำ

## Steps

- [x] อ่านSpec/Memory/Sourceและสำรวจหลักฐานเดิม ไม่ปนScalesกับPlatform/Accessories
- [x] ผู้ใช้ยืนยัน8ชื่อและนโยบายMembership/Overlap/All/Water+Dust บันทึกSpec/Planก่อนแก้แอป
- [x] Backupเฉพาะไฟล์ในPlanและตรวจHashก่อนMutation รักษางานHome/Mediaที่มีอยู่
- [x] เพิ่มHelper/DTO/Server membership/ข้อความและWrapตามFiles
- [x] ตรวจUnitจริง/Negative/MissingและBrowserAll74/150/8Child/Controls/อีก4Parentเดิม
- [x] ตรวจ5ขนาดและภาพชื่อยาว พร้อมTypecheck/Scoped Lint/Format/Catalog Unit/BuildแยกและSource Hash
- [x] บันทึกผลจริง/ข้อจำกัด ตรวจNext feedbackและหยุดเฉพาะQAที่เริ่มเอง

## Impact / Rollback

กระทบChildของเครื่องชั่งและข้อความDemoเท่านั้น Membershipผิดอาจทำให้ผู้ใช้เลือกสินค้าไม่ตรงคุณสมบัติ จึงใช้หลักฐานเชิงบวกและให้Negativeมีผลเหนือข้อมูลเก่า รุ่นไม่ทราบคงAll คืนเฉพาะDiffจากBackupZIPหลังตรวจงานซ้อน ไม่Reset HEAD/แก้Database/Deploy

## Verification Results

- Production Browser13/13ผ่านหลังแก้ Family/Kitchen false positive ไม่มีFlaky/Skipped; Devก่อนแก้10/11และTargetedหลังแก้1/1 เก็บFailure/Redจริงไว้ ไม่ลดAssertion
- Unit57/57ผ่านรวม7ใหม่ Typecheck/Scoped ESLint/Formattingผ่าน Build420หน้าผ่านNode24.22.1/webpack; QAคัดSourceปัจจุบันไปแยก ไม่แก้หรือคืนงานHome/Mediaอื่น
- Membershipของ8Child23/36/8/22/7/1/4/2 และ4รายการยังAllตามนโยบายที่อนุมัติ เทียบIndustrial/Analyticalกับหน้าเดิมตรงกัน ทุกChildอยู่ในParent74 All150ไม่เปลี่ยน อีก4ParentยังมีDemoเดิม
- ตรวจ5ขนาด320/390/768/844Landscape/1440 ทั้งภาพ Bounds ชื่อยาว Keyboard/Focus/Hit Targets/Page Error/Overflow; Source5ไฟล์ตรงกับQAตามsource-hashes.json
- รักษาSource Facts/สินค้า/Schema/Env/API/Global Storeเดิม ไม่มีDB write Production QAใช้Snapshot fallback ไม่อ้างFull E2E Suiteหรือข้อจำกัดDetail Test/Case-only Slugจากงานก่อนว่าผ่าน
- ปิดQA3167 PID33220แล้ว ไม่มีListener3167 เก็บDev3000 PID15684เดิมไว้ ไม่Commit/Deploy Next feedbackไม่มีFramework candidateใหม่

---

# Plan: Supplied homepage platform and indicator images (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `src/features/home/components/category-feature.tsx` — ใช้URLภาพPNGที่ผู้ใช้ส่งกับ2หมวดที่ตรงกัน
- `tests/e2e/category-feature.spec.ts` — เปลี่ยนExpected Imagesของแท่น/อินดิเคเตอร์ คงAssertionsสมาชิก/ลิงก์/Responsiveเดิม
- `spec.md`, `plan.md` — บันทึกการเปลี่ยนภาพตามคำสั่งและผลตรวจ ไม่ทับประวัติ
- `output/homepage-category-images-20261104/` — Backup/Hash/Results/Screenshots/รายงาน

## Steps

- [x] ตรวจคำขอ ไฟล์จริง Spec/MemoryและSource สำรอง4ไฟล์และHashภาพต้นฉบับ
- [x] เปลี่ยน2Image referencesและExpected ImagesโดยคงLayout/Order/Data
- [x] รันChrome Category RegressionบนDev3000เดิม ตรวจภาพ320/390/768/1440 พร้อมScoped Typecheck/Lint/Format ไม่ต้องProduction Buildซ้ำสำหรับเปลี่ยนรูปStatic
- [x] ตรวจHashภาพต้นฉบับ/Scope/ประวัติ บันทึกผลจริงและNext Feedbackก่อนส่งมอบ

## Impact / Rollback

กระทบเฉพาะรูปใหญ่2หมวด มีความเสี่ยงโหลดไฟล์ชื่อมีSpaceหรือภาพSquareในกรอบWide จึงตรวจHTTP/Next Imageและภาพจริง ใช้containเดิมไม่Crop ย้อนเฉพาะ2Image referencesกับExpected ImagesจากBackup ไม่แก้หรือลบไฟล์รูปของผู้ใช้ ไม่หยุดDevเดิม

## Verification Results

- Dev Chrome Category11/11ผ่าน ไม่มีFlaky/Skipped รูปใหม่โหลดจริงผ่านNext Image ชื่อไฟล์ที่มีSpaceไม่เป็นปัญหา รูปอีก2หมวด/ลำดับ/สมาชิก/ลิงก์ตรงเดิม
- Responsive12ขนาด320–1920pxผ่าน ตรวจภาพจริง320/390/768/1440และภาพแยก2หมวดที่390/1440แล้ว คงcontainไม่ตัดสินค้า ไม่มีPage Error/Overflowใหม่
- Typecheck/Scoped ESLint/Prettierและ `git diff --check` ผ่าน ไม่รันProduction Buildซ้ำ ใช้Dev3000เดิม ไม่เริ่ม/หยุดServer
- `scope-audit.json` ยืนยันApplication Diffแค่2Image references, PNGเดิมตรงHashและSourceอื่น/ประวัติSpec/Planก่อนงานคงเดิม
- หลักฐาน: `output/homepage-category-images-20261104/delivery.md`, `browser-tests.json`, `scope-audit.json`, `before-files.zip`, ภาพแยกหมวดและภาพใน `browser-results/`
- Next Feedbackรอบสุดท้ายไม่มีQualifying Framework Issue ไม่แก้Environment/Database/DependencyหรือCommit/Deploy

---

# Plan: Swap homepage indicator and accessory cards (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `src/features/home/components/category-feature.tsx` — สลับCard definitionอินดิเคเตอร์กับอุปกรณ์เสริมทั้งรายการ
- `tests/e2e/category-feature.spec.ts` — ปรับExpected Order/รูป/CompanionและPointer/Touchให้ติดตามหมวดเดิมที่ตำแหน่งใหม่
- `spec.md`, `plan.md` — บันทึกคำสั่งเปลี่ยนเฉพาะลำดับและผลตรวจ โดยรักษาประวัติ
- `output/homepage-category-swap-20261104/` — Backup/Hash ผลตรวจภาพและรายงานเฉพาะงานนี้

## Steps

- [x] ตรวจSource/Spec/Memoryและคำสั่งแก้ไขล่าสุด บันทึกขอบเขตที่ผู้ใช้อนุมัติ
- [x] สำรอง4ไฟล์พร้อมตรวจBytesก่อนแก้
- [x] สลับ2Card definitionsและปรับRegressionที่อ้างIndex/Order
- [x] รันCategory Regressionเดิมด้วยChromeบนDevที่มีอยู่ ตรวจResponsive/ภาพและScoped Lint/Format/Typecheck ไม่ต้องBuildProductionซ้ำสำหรับการย้ายArrayโดยไม่เปลี่ยนLogic
- [x] ตรวจScope/ประวัติเดิม อัปเดตผลจริงและตรวจNext Feedbackก่อนส่งมอบ

## Impact / Rollback

กระทบเฉพาะลำดับ4หมวดหน้าแรกและลำดับKeyboardตามDOM ข้อมูล/Styles/IDเดิมทั้งหมด ย้อนเฉพาะDiffของงานนี้จากBackupหลังตรวจงานซ้อน ไม่คืนไฟล์ทั้งก้อนหรือหยุดDevของผู้ใช้

## Verification Results

- ChromeบนDev3000: Category Regression11/11ผ่าน ไม่มีFlaky/Skipped รวมชื่อ/ลำดับ รูป สมาชิกครบ/ลิงก์จริง แถบเคลื่อนไหว Keyboard Pointer Touch ภาพเสีย Reduced Motion และNo-JS
- Responsive12ขนาด320–1920pxผ่าน เลือกทุกหมวดและตรวจภาพ320/390/768/1440แล้ว ไม่มีPage Error/Overflowใหม่
- Typecheck/Scoped ESLint/Prettierและ `git diff --check` ผ่าน ไม่รันProduction BuildสำหรับการสลับArrayอย่างเดียว
- `order-proof.json` ยืนยัน4Card definitionsและโค้ดนอกArrayเดิมทุกตัวอักษร เปลี่ยนเฉพาะOrder; Backup4ไฟล์ตรวจBytesก่อนงานแล้ว
- ใช้Dev3000 PID15684เดิม ไม่เปลี่ยนEnv/Database ไม่เริ่มหรือหยุดServer ไม่มีNext.js issueใหม่ที่เข้าเกณฑ์Feedbackรอบสุดท้าย
- หลักฐาน: `output/homepage-category-swap-20261104/delivery.md`, `browser-tests.json`, `order-proof.json` และภาพใน `browser-results/`

---

# Plan: Homepage four product categories (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `src/app/(site)/page.tsx` — เอาเฉพาะLegacy targets propออกจากCategoryFeature โดยคงSpotlightและส่วนอื่น
- `src/features/home/components/category-feature.tsx` — กำหนด4ชื่อ/ลำดับและอ่านกลุ่มจริงจากServer เลือกรูปที่ตรงหมวด คงรูปเครื่องชั่ง/อุปกรณ์เสริมเดิมและคำอธิบายที่ตรวจสอบแหล่งแล้ว
- `src/features/home/components/category-feature-panels.tsx` — ใช้ชนิดIDหมวดจริงแทนHomeImageSlotเก่า โดยคงโครงสร้างและInteraction
- `src/features/home/components/category-feature-icons.tsx` — ให้ไอคอนตรง4หมวดใหม่ในรูปแบบเส้นเดิม
- `tests/e2e/category-feature.spec.ts` — ปรับContractชื่อ/รูป/สมาชิก/ลิงก์ให้ตรงหมวดจริงและอุปกรณ์เสริมลำดับ4 รักษาCoverageการเลือก Keyboard Pointer Touch และResponsiveเดิม
- `spec.md`, `plan.md` — เพิ่มงานนี้และผลตรวจโดยรักษาประวัติ/งานอื่น
- `output/homepage-four-categories-20261104/` — Backup/Hash/ภาพและผลตรวจเฉพาะงานนี้

## Steps

- [x] อ่านกติกาSpec/Memory ตรวจSource/Styles/Stackและคู่มือNextที่เกี่ยวข้อง ระบุงานเดิมที่ต้องรักษา
- [x] จัดทำSpec/Planที่เป็นรูปธรรมสำหรับ4หมวดหน้าแรก แยกจากงาน5หมวดหน้าProduct
- [x] ผู้ใช้อนุมัติSpec/Planนี้และบันทึกคำอนุมัติจริงก่อนแก้Application Code
- [x] สำรอง/ตรวจHashไฟล์เป้าหมายก่อนแก้ และรักษาWorking Treeเดิมทั้งหมด
- [x] ปรับ4หมวด รูป/สมาชิกจริง และไอคอนตามFiles ไม่แก้Global/CMS/Database
- [x] ปรับRegressionเฉพาะContractที่เปลี่ยน ตรวจชื่อ/สมาชิก/ลิงก์/การเลือกและInteractionเดิม
- [x] ตรวจBrowserพร้อมภาพที่320/390/768/1440px รันTypecheck/Scoped Lint/FormatและRegressionที่เกี่ยวข้อง; BuildในQAแยกเพื่อไม่กระทบDevเดิม
- [x] บันทึกผลจริงและข้อจำกัด ตรวจNext feedback ปิดเฉพาะQAที่เริ่มเอง แล้วส่งมอบ

## Impact / Rollback

- กระทบเฉพาะหมวดหน้าแรกและสินค้าที่เลือก ไม่เปลี่ยนหน้าProduct5หมวดหรือข้อมูลธุรกิจ หากผิดจะจับคู่ภาพ/สินค้าผิดจึงตรวจเทียบMembershipจริง
- Legacy Smart/Software image/target settingsยังอยู่ในCMSแต่ไม่ควบคุม2หมวดใหม่; ไม่ย้ายข้อมูลหรือใช้ภาพเดิมผิดกลุ่มโดยอัตโนมัติ ผู้ใช้อนุมัติขอบเขตนี้แล้ว
- ไม่แก้Stylesheetส่วนกลาง ใช้Responsiveเดิม; ย้อนเฉพาะDiffรอบนี้จากBackupหลังตรวจงานซ้อน ห้ามResetทั้งไฟล์หรือทั้งWorking Tree

## Verification Results

- ตรวจแล้วทั้ง4กลุ่มมีResolverใน `src/features/catalog/server/catalog-page.ts`; คำบรรยายย่อยอ้างอิง `src/features/content/data/product-sections.ts`
- สำรอง7ไฟล์ก่อนงานใน `before-files.zip` และตรวจBytesตรงต้นฉบับ เก็บBaseline Hash287ไฟล์; หลังแก้เปลี่ยนเฉพาะ7ไฟล์ที่อยู่ในแผน และSource/Test5ไฟล์ตรงQAตาม `source-hashes.json`
- `bun run typecheck`, Scoped ESLint/Prettierและ `git diff --check` ผ่าน Catalog Unit50/50ผ่าน; Node24.22.1 `next build --webpack` ในQAแยกผ่าน420หน้า ไม่ใช้Env/Databaseจริงของผู้ใช้
- Production Browser19/19ผ่าน: Category11, Business Solutions2และNonblocking Opening6 ไม่มีFlaky/Skipped; สมาชิก4กลุ่มตรงAPI/Classificationเดิมครบ74/7/23/43และลำดับตรง รูป/ลิงก์สินค้าเดิมครบ ไม่มีสินค้าข้ามหมวด
- Responsive12ขนาดตั้งแต่320ถึง1920pxผ่าน พร้อมเลือกทุกหมวดและตรวจรูป/ชื่อยาวที่320/390/768/1440; ตรวจภาพจริง4ขนาดและภาพแยกหมวดDesktop/Mobile ไม่มีPage Error/Overflowใหม่ การWrapชื่อยาวและการซ่อนคำอธิบายบนมือถือเป็นStyleเดิม
- รอบแรก19กรณีล้มก่อนAssertionเพราะBundled Chromiumไม่มีในเครื่อง เก็บ `initial-browser-launch-failure.json` แล้วรันทั้งหมดด้วย `PLAYWRIGHT_CHANNEL=chrome` ผ่าน ไม่แก้Application Codeเพื่อแก้เครื่องมือ
- QAใช้Snapshot ไม่ใช่ผลLive Database; Warningเรื่องLockfileในHome Directoryไม่กระทบBuild ผลตรวจNext Feedbackรอบสุดท้ายไม่มีQualifying Framework Issueใหม่
- หลักฐาน: `output/homepage-four-categories-20261104/delivery.md`, `production-tests.json`, `visual-samples.json`, `source-hashes.json`, `scope-audit.json` และภาพPNG
- ปิดเฉพาะQA3168 PID17248ของงานนี้แล้ว ยืนยันไม่มีListener3168 และDev3000 PID15684เดิมยังทำงาน ไม่หยุดServerที่งานอื่นเริ่ม ไม่มีCommit/Push/Deploy
- Auditท้ายงาน: หัวข้อFive real product familiesในSpec/Planถูกอัปเดตเป็นDoneพร้อมผลตรวจจากงานอื่นระหว่างรอบนี้ จึงรักษาข้อความใหม่นั้นไว้; Sourceทั้งหมดนอก5ไฟล์ของงานหน้าแรกตรงBaseline และประวัติตั้งแต่HoN-inspiredลงไปตรงBackup ไม่อ้างว่าเอกสารร่วมทั้งไฟล์ไม่เปลี่ยน

---

# Plan: Five real product families (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

- `src/app/(site)/products/page.tsx` — ดึง Membershipจริงทั้ง5กลุ่มด้วย getCatalogPageเดิม ส่ง Parent/Childและ ClientProduct objectsเดิมโดยไม่Cloneข้อมูลสินค้า
- `src/features/catalog/data/mock-categories.ts` — กำหนด5ชื่อ/Rootตามระบบเดิม และHelperแบ่งเฉพาะChildตัวอย่างภายในProduct IDsของแต่ละParent
- `src/features/catalog/components/product-category-mock.tsx` — รับ Parentจาก Server แทนแบ่งหมวดหลักแบบวน, แสดง5ชื่อจริงและข้อความรอเฉพาะหมวดย่อย พร้อมป้ายชนิดสินค้าตามParent
- `src/features/catalog/components/product-category-mock.module.css` — รองรับชื่อหมวดหลักยาวบนการ์ดเดิม ไม่เปลี่ยนจำนวนคอลัมน์หรือStyleส่วนกลาง
- `tests/e2e/product-category-mock.spec.ts` — ตรวจ5ชื่อ/ลำดับ Membershipจริง Allครบ Childไม่ข้ามParent และControls/Responsiveเดิมด้วยจำนวนข้อมูลใหม่
- `spec.md`, `plan.md` — บันทึกคำอนุมัติ ขอบเขตใหม่และผลตรวจ โดยคงประวัติงานก่อน
- `output/product-main-categories-20261104/` — Backup ZIP/Hash, Results, Screenshotsและรายงานรอบนี้ ไม่มีSource Snapshotที่TSCจะอ่านซ้ำ

## Steps

- [x] ตรวจSpec/Memory/Sourceและจับคู่5ชื่อกับRootเดิม ยืนยันขอบเขตกับผู้ใช้แล้วว่าให้รวมสินค้าจริงทั้ง5กลุ่ม
- [x] สำรอง7ไฟล์และตรวจHashก่อนแก้ อัปเดตSpec/Planโดยใช้คำอนุมัติจริงล่าสุด
- [x] ปรับ DTO/Fixture/Route/Component/CSS ตามFilesข้างต้น ไม่แก้ Classification Helpers/ข้อมูลสินค้า
- [x] ปรับRegressionให้ตรวจชื่อและMembershipจริงจากข้อมูลที่ตรวจสอบได้ รวมPaginationของParentที่มีมากกว่า24รายการ
- [x] ตรวจDev/Production QA, ภาพจริงที่320/390/768/844Landscape/1440 และพฤติกรรม Search/Sort/Compare/Backไป Categoryเดิม
- [x] รันTypecheck/Scoped Lint/Format/Catalog UnitและBuildแยก เก็บHashตรง Sourceที่ทดสอบ
- [x] อัปเดตผลจริง/ข้อจำกัด ตรวจNext feedback และหยุดเฉพาะQAที่เริ่มเอง

## Impact / Rollback

- กระทบจำนวนสินค้าและการเลือกกลุ่มบน `/products` เท่านั้น จาก74เครื่องชั่งเป็นทั้ง5กลุ่มที่ผู้ใช้ยืนยันแล้ว ความเสี่ยงคือแสดงสินค้าผิดหมวดหรือรายการตกหล่น จึงเทียบ Product IDsของแต่ละParentและผลรวมกับClassificationเดิมโดยตรง
- ค่าParentมาจากServer ไม่รับข้อมูลสำคัญจากClient; Childยังเป็นDemoที่ไม่Persist ไม่ใช้ชื่อหลักจริงกับการแบ่งสินค้าวนโดยไม่มีความหมายอีก
- คงShared Card/Store/Navigation/Category Routesและ Product Detailเดิม รวมข้อจำกัดDetail Test1pxและCase-only Slugที่ทราบอยู่แล้ว ไม่แก้นอกงาน
- คืนเฉพาะDiffของ7ไฟล์จาก `before-files.zip` หลังตรวจงานที่ซ้อนอยู่ ห้ามReset HEADเพราะงานรอบก่อนยังไม่Commit ไม่มีDatabase/Production Rollback

## Verification Results

- ก่อนลงมือ: Source Snapshot150รายการ แบ่ง74เครื่องชั่ง/7อินดิเคเตอร์/23โครงสร้างแท่น/3POS/43อุปกรณ์เสริม ไม่มีUnassigned; ตัวเลขUIจะคำนวณจากDataจริง
- Dev Browser10/10ผ่าน; Production Browser12/12ผ่าน ไม่มีFlaky/Skipped ในชุดเลือกที่เกี่ยวข้อง ไม่อ้างFull E2E Suiteผ่าน และไม่รันDetail Testที่ยืนยันBaseline Failureไว้ก่อนหน้าเพื่ออ้างว่าแก้แล้ว
- MembershipของUIตรงข้อมูลเดิมทั้ง5กลุ่ม All150รายการครบ Parent74/7/23/3/43 ไม่มีซ้ำ/หลุด Childไม่ออกนอกParent ตามRegressionและ `observed-membership.json`
- ตรวจ5ขนาด320×800,390×844,768×1024,844×390,1440×1000 รวมKeyboard/Focus/Click Targets/ชื่อยาวและOverflow/Page Error พร้อมภาพจริง Desktop/Mobile/POS3รายการ
- Build webpack420หน้าผ่านบนNode24.22.1; Typecheck/Scoped Lint/Formattingผ่าน Catalog Unit50/50ผ่าน Sourceแอป4ไฟล์ตรงกับQAที่ทดสอบ
- QAใช้ `C:/Users/cityc/.codex/tmp/sunford-catalog-mock-20261104-02` แยกจากDev ไม่มีEnvจริง/Database write; ปิด3166 PID45564แล้ว ตรวจว่าไม่มีListener3166 และDev3000 PID15684ยังอยู่
- Backupและรายงานรอบนี้อยู่ `output/product-main-categories-20261104/` ไม่ทับหลักฐาน74รายการ/6หมวดรอบก่อน; Next feedbackไม่มีFramework candidateใหม่ ไม่Commit/Push/Deploy

---

# Plan: HoN-inspired product category mock (2026-11-04)

Status: "Ready to Code"
Approval: "Approved"

## Files

รอบเตรียมข้อเสนอที่ผู้ใช้ร้องขอ:

- `spec.md`, `plan.md` — เพิ่มหัวข้องานนี้ รักษางาน/ประวัติเดิม และบันทึกผลตรวจ/คำอนุมัติจริง
- `output/catalog-reference-20261104/` — รายงานอ้างอิง ภาพ Browser ภาพโครงร่าง SVG/PNG และหลักฐานการตรวจ ไม่ใช่ Source แอป

ไฟล์แอป/การทดสอบที่จะเริ่มหลังอนุมัติ Spec/Plan นี้เท่านั้น:

- `src/app/(site)/products/page.tsx` — สลับจาก ProductBrowser เป็น ProductCategoryMock โดยรักษาการโหลด Products/Scope/ClientProduct projection เดิม
- `src/features/catalog/components/product-category-mock.tsx` — สร้าง UI การ์ดหมวด ปุ่มลูก Search/Sort/Grid–List/Featured/Pagination/Compare โดยใช้สินค้าและ Product Card เดิม ใช้ Local Mock IDs ไม่เขียน Global Category Store
- `src/features/catalog/components/product-category-mock.module.css` — สร้าง Style เฉพาะหน้านี้จาก Brand Tokens เดิม ไม่แก้ Global Styles/Shared Components
- `src/features/catalog/data/mock-categories.ts` — สร้าง Fixture หมวด01–06/ลูก01–02 พร้อม Product IDs ตัวอย่างที่ตรวจว่ามีอยู่จริง แยกจาก Taxonomy ธุรกิจและไม่ Persist
- `tests/e2e/product-category-mock.spec.ts` — สร้าง Behavioral Regression ที่ตรวจ Parent/Child reset, Search intersection, Empty reset, All completeness, Pagination และ Compare พร้อม Keyboard/Responsive/Route อื่นที่ใช้ ProductBrowser

ไม่มีการลบไฟล์ ไม่แก้ ProductBrowser/CatalogProductCard เดิม ไม่มี Shared/Layout/Database/Dependency ในรายการแก้

## Steps

- [x] อ่าน AGENTS/Spec/Memory/Task Observer และ Source/Styles/Stack/คู่มือ Next ที่เกี่ยวข้อง
- [x] ตรวจอ้างอิงผ่าน Browser จริง: หมวดหลัก/ลูก Search/Empty/Clear/Detail/Back และ Desktop/Mobile; บันทึกข้อจำกัด Tablet โดยไม่อ้างผลที่ไม่ได้ยืนยัน
- [x] ตรวจ `/products` เดิมจริงและเส้นทางเรียก ProductBrowser; สรุปข้อมูลที่ต้องรักษา
- [x] จัดทำ Spec/Plan ภาพโครงร่าง และรายงานเพื่อขออนุมัติ
- [x] ผู้ใช้อนุมัติขอบเขต/Brand/Layout/Fixture ตัวอย่างใน Spec นี้ แล้วบันทึกข้อความจริงใน Approval Record
- [x] ตรวจ Working Tree อีกครั้ง สำรองเฉพาะไฟล์เดิมที่จะเปลี่ยนก่อน Mutation และตรวจ Hash สำเนา ไม่คืนงานอื่นไป HEAD
- [x] สร้าง Fixture/Component/CSS Module และสลับ Route ตาม Files โดยรักษา Scope สินค้าและ Global Controls เดิม
- [x] รัน Behavioral Regression ใหม่และ Catalog/Category/Product Detail/Navigation/Compare ที่เกี่ยวข้อง ตรวจ Parent/Child/Query/Counts กับ Fixture จริง ไม่ลด Coverage เพื่อให้ผ่าน — Detail Test เดิม1กรณีล้มเหมือน Baseline แยกหลักฐานไว้
- [x] ตรวจภาพ/Click Targets/Keyboard ที่320/390/768/1440และ844×390; ตรวจ All IDs เทียบก่อนแก้ และ Route อื่นที่ใช้ ProductBrowser เดิม
- [x] รัน Typecheck, scoped ESLint/Prettier, Catalog Unit และ Build ใน QA แยก พร้อม Snapshot fallback ตาม MEMORY ถ้า Live Database ไม่พร้อม ไม่แก้ Env ของผู้ใช้
- [x] อัปเดต Acceptance/Verification/Source Hash ใน Spec/Plan รายงานข้อจำกัดจริง ตรวจ Next feedback และปิดเฉพาะ QA ที่เริ่มเอง

## Impact / Rollback

- กระทบการค้นหา/เลือกสินค้าเฉพาะ `/products` ซึ่งมี74รายการในตอนตรวจ หากผิดพลาดผู้ใช้จะกรองผิดหรือพบสินค้าลดลง จึงตรวจ All completeness, Parent–Child reset, Search และ Pagination โดยตรง
- สมมติฐานที่เสนอให้อนุมัติ: ใช้ SUNFORD ขาว/เทา/แดงเดิม นำเฉพาะโครงสร้างการเลือกหมวดมาใช้; ช่องหมวดตัวอย่าง6ช่องไม่ใช่ Taxonomy จริง ไม่ขยาย `/products` เป็นสินค้าทั้ง150รายการของระบบ
- Fixture เป็น Demo เท่านั้น ต้องไม่เขียนทับ Product.category/Topics/CMS และไม่ส่ง Mock IDs เข้า Global Store; สิ่งที่ยังรอคือรายชื่อ/ลำดับ/การจับกลุ่มจริงจากผู้ใช้
- Shared Header/Footer/Global Search/Compare และ Category/Detail Routes คง Source เดิม ความเสี่ยงจาก ProductBrowser ที่ใช้ร่วมกันลดด้วยการไม่แก้ Component นั้น
- ย้อนกลับโดยคืนเฉพาะ Import/Render ของ `src/app/(site)/products/page.tsx` จาก Backup ของงานนี้ และถอน3ไฟล์ Mock ใหม่หลังตรวจว่าไม่มีงานต่อเนื่องพึ่งพา ไม่มี Database/Production rollback

## Verification Results

- รอบ Research/Proposal ก่อนอนุมัติยังไม่มี Build/Test ของ UI ใหม่ ผล Implementation ที่อนุมัติแล้วอยู่ด้านล่าง
- Browser reference: ตรวจหมวด Heroes/Items, Carry/Hard Support/All, คำค้น arachna และ zzzz-no-match, Clear, Detail/Browser Back; Desktop1440และMobile390ยืนยันขนาดจริงจาก DOM ไม่อ้างผล768ที่ยืนยันไม่ได้
- Browser เดิม: `/products` แสดง74รายการ เริ่ม24รายการ มี Search/Sort/Grid–List/Topic/Featured/Compare; ภาพเดิมบันทึกที่1280×720 ไม่ใช่ Mobile
- รายงาน: `output/catalog-reference-20261104/reference-audit.md`; ภาพโครงร่าง `mock-proposal.png`; ภาพอ้างอิง Desktop/Mobile/หน้าเดิมเก็บในโฟลเดอร์เดียวกัน
- ไม่มี Framework issue ใหม่ที่เข้าเกณฑ์ Next.js feedback จากรอบนี้ ไม่ Commit/Push/Deploy/แก้ Database และไม่เริ่ม Dev Server ใหม่
- ตรวจ `mock-proposal.png` จริงแล้ว ขนาด1600×1400 มี Desktop/Mobile ใช้รูปสินค้าที่มีอยู่4รุ่น ป้ายระบุเป็นภาพข้อเสนอแบบนิ่ง ภาพนี้ยังไม่มี Interactive Behavior
- Prettier ของ Spec/Plan ผ่าน และ `git diff --check` ผ่าน; Git แสดงการเปลี่ยนแปลงเฉพาะ `spec.md`/`plan.md` ส่วนหลักฐานอยู่ใน ignored `output/` ไม่มีไฟล์แอปเปลี่ยน
- หลังอนุมัติ: ลงมือครบตาม Files ทั้ง4ไฟล์แอปและ1ไฟล์ Test ใหม่ ไม่มีการแก้ Shared Source; สำรอง Route ก่อนแก้และตรวจ SHA256 ตรงกัน
- Dev Behavioral5/5 + Responsive5/5ผ่าน Production ชุดเลือก15กรณีได้14ผ่าน/1Failureที่ Detail เดิม โดย Mock10/10ผ่านทั้งหมด ไม่อ้าง Full E2E Suite ผ่าน
- Baseline ยืนยัน Detail Failure เดียวกัน y766แทน≥767; ตรวจ Shared Application185ไฟล์และ Route Backup ตรงกับ Baseline มี Manifestครบและ HTTP200ก่อนใช้ ไม่แก้หรือลด Assertion
- ไม่รัน Sidebar-entry Test เดิมที่ Contract ถูกแทนบน `/products`; ใหม่ตรวจ Parent/Child/All และ Category Route กลับหน้าใหม่แทนโดยไม่แก้ Test เดิมนอก Files ที่อนุมัติ
- เปรียบเทียบ Browser Baseline/หน้าใหม่ครบ74รายการแล้วลำดับ/ชื่อ/คำอธิบาย/ลิงก์/Altตรงกัน ตาม `inventory-comparison.json`; Source4ไฟล์ตรง QA Hash
- Production Build420หน้าผ่าน Node24.22.1, Typecheck/Scoped ESLint/Prettierผ่าน Catalog Unit50/50ผ่าน; Productionใช้ Snapshot ไม่เขียน DB/Env
- หลักฐานภาพจริง: `catalog-desktop.png`, `catalog-mobile.png`, `catalog-mobile-results.png` และ10ภาพจาก Responsive Regression ใน `production-tests/` ตรวจภาพครบ320/390/768/844Landscape/1440 ไม่มี Page Error/Overflow ใหม่
- Next.js feedback reporting pass: ไม่มี Framework candidate ใหม่ที่ยืนยันได้จากงานนี้ ไม่ Commit/Push/Deploy
- ปิด QA3164/Baseline3165 ที่เริ่มเองแล้ว ตรวจ Listener ไม่เหลือทั้งสอง Port เก็บ Dev3000 PID15684เดิมไว้ และคืนแท็บหน้าใหม่เป็น All74รายการ

---

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


---

# Plan: Legacy website content gap audit (2026-11-05)

Approval: "User requested read-only audit and list; no implementation approval"

## Files

- `output/legacy-content-audit-20261105/report.md` — detailed Thai gap list, source/local evidence, priorities and limitations.
- `output/legacy-content-audit-20261105/inventory.json` — complete source Sitemap comparison and historical missing-image HEAD recheck.
- `output/legacy-content-audit-20261105/source-sitemap.xml` — source inventory observed during the audit.
- `spec.md`, `plan.md` — append audit scope and verified outcome, retaining prior history.
- Application files, imported business content and database — read only.

## Steps

- [x] Read applicable instructions/task-observer context and project spec/memory; inspect repository and runtime data paths.
- [x] Inspect all412 public Sitemap URLs in Browser, additional menu links, live source forms, service tabs and unavailable content; exclude nine account/transaction/search/test URLs.
- [x] Compare source URL inventory with392 imported pages/12 solutions and150 products; inspect local running pages/API and catalog mocks.
- [x] Run existing content validator and recheck historical missing image URL statuses; classify verified gaps versus intentional exclusions/source gaps.
- [x] Write/read report and inventory; update spec/plan and verify only documentation changed.

## Impact / Rollback

R2 documentation and ignored output artifacts only. No application/content/database writes, commit, push or deployment. Reversal removes only this audit's appended documentation and generated report folder if explicitly requested, preserving all previous work.

## Verification Results

Browser coverage412/412 public Sitemap URLs; live source product URLs160 including one unavailable FCS and nine products absent locally. Local API150 products, missing9confirmed. Source-to-import comparison15missing URLs includes9valid products,2populated solution pages,2blank solution pages,1empty collection and1unavailable product. Existing content validator passed. HEAD20historical missing images:15HTTP404,5HTTP403. Report distinguishes previously empty Lot/Serial/POS/article content now populated in source, incomplete DRV content, approved mocks and forms. No assertion of every-word equivalence, binary download/install success, private account migration or production deployment. Final Next.js feedback review: no qualifying framework issue.


---

# Plan: Legacy content migration preserving current design (2026-11-05)

วันที่ 5 พฤศจิกายน 2026

Scope revision: ผู้ใช้สั่งให้คงหมวดหมู่เดิมไว้ทั้งหมด และจะจัดหมวดใหม่เอง การแก้เอกสารครั้งนี้ไม่ใช่การอนุมัติ implementation

Status: "Ready to Code — verified-content scope only"
Approval: "Approved — revised category-preserving scope"

## เป้าหมายและข้อกำหนดที่รับจากผู้ใช้

ดึงข้อมูลที่ตรวจพบว่ายังขาดจากเว็บ SUNFORD เดิม มาใช้ในโปรเจกต์นี้ โดยรักษาหน้าตาและพฤติกรรมของโปรเจกต์ปัจจุบัน ไม่เปลี่ยนดีไซน์ให้เป็นเว็บเดิม

สมมติฐานที่ใช้เสนอแผน: “รูปแบบไม่เสีย” หมายถึงรักษาสี ฟอนต์ โลโก้ Header/Footer, Hero/Opening, layout, card styles, animation และ responsive ปัจจุบัน จำนวนสินค้า/ข้อความ/รูปในพื้นที่เนื้อหาสามารถเพิ่มตามข้อมูลที่นำเข้าได้ ไม่ได้หมายถึงภาพทุก pixel ต้องเหมือนก่อนเพิ่มข้อมูล

## ขอบเขตรอบที่ขออนุมัติ

1. เพิ่มสินค้า 9 SKU: `10732`, `10733`, `10838`, `10839`, `10840`, `10841`, `10842`, `10843`, `10844` พร้อมรูปจริง แกลเลอรีและรายละเอียดที่ตรวจสอบกับต้นฉบับได้ แยก PU30M16 สอง SKU แม้ชื่อซ้ำ
2. คงชื่อ/ID/ลำดับหมวดหลัก หมวดย่อย เมนู การจัดกลุ่มสินค้าเดิม และ mock children ทั้งหมด ไม่ refresh collection records หรือจัดหมวดใหม่จากเว็บเดิม ผู้ใช้จะจัดหมวดใหม่เองภายหลัง
3. เติม `/solutions/lot-serial`, `/solutions/pos`; เพิ่ม `/solutions/windows` และ `/solutions/driver` ในหน้ารวมโซลูชันเดิม รักษาเนื้อหา/ปลายทางของโซลูชันอื่น
4. เติมเนื้อหา `/software/download/sunford-drv` และ `/blogs/editorial/before-using-a-price-computing-scale` โดยเก็บวิดีโอเดิมและแหล่งอ้างอิง
5. ผูกภาพปก Biz Talk กับ records ที่ยืนยันภาพได้จากต้นฉบับ รวม EP.1–27 เป็นเป้าหมายค้นหา; แก้รูปเดิมที่ขาดเฉพาะเมื่อหาไฟล์จริงที่ตรวจสอบได้ ไม่รับประกันว่าจะกู้ทุกไฟล์ที่ต้นฉบับตอบ 403/404 ได้
6. ข้อมูลหมวดจากต้นฉบับเก็บได้เฉพาะหลักฐานใน staging เพื่อให้ผู้ใช้จัดหมวดภายหลัง ไม่ merge เข้าหมวดที่ใช้งานอยู่ สินค้าใหม่ใช้ได้เฉพาะหมวดหลักเดิมที่มีอยู่และตรงข้อมูลอุปกรณ์เสริม โดยไม่สร้าง/ตั้งชื่อ/จัดหมวดย่อยใหม่หรือย้ายสินค้าเดิม
7. ทำให้สินค้าใหม่แสดงใน runtime ที่ใช้ฐานข้อมูลด้วย: เพิ่มเฉพาะ 9 SKU ที่ขาดผ่าน Prisma หลังสำรองและตรวจ target configuration จริง รายการเดิม รวม drafts/deleted/CMS edits ต้องไม่ถูกเขียนทับหรือคืนสถานะ

## ข้อมูลที่ยังไม่พร้อมและไม่รวมในรอบนี้

- การสร้าง เปลี่ยนชื่อ เรียงใหม่ ย้าย ยุบ หรือเปลี่ยนสมาชิกหมวดของสินค้าเดิมทั้งหมด อยู่นอก scope รวมการแทน mock children 01/02 ด้วยหมวดจริง
- 18 exact-model mocks คงไว้จนมีรูป/สเปกตรงรุ่นที่ยืนยันได้ ไม่ใช้รุ่นใกล้เคียงแทน
- ERP/MES/คู่มือ/Android ขั้นสูง/พารามิเตอร์ที่ต้นฉบับยังว่าง ไม่แต่งข้อมูลเติม
- ค่ารายละเอียดของ PU30M16 ที่ต้นฉบับขัดกันเก็บเป็นรายการรอยืนยัน ไม่ตีความหรือสร้างค่า structured specification แทน จะนำเข้าเฉพาะข้อมูลที่ยืนยันได้และรายงานส่วนที่พักไว้
- ไม่เพิ่ม backend ฟอร์มรับประกัน/ติดต่อ บัญชี ตะกร้า ชำระเงิน หรือบริการสอบเทียบ; ฟอร์มต้องมี contract การรับ/จัดเก็บ/แจ้งทีมงานก่อน
- ไม่เพิ่มตัวกรองข่าวหรือระบบจัดหมวดบทความใหม่ในรอบนำเข้าข้อมูลนี้ การแก้ภาพปกไม่เปลี่ยน layout ข่าว
- ไม่ deploy, commit, push หรือ migrate schema และไม่เพิ่ม dependency

## วิธีรักษารูปแบบ

- แยกข้อมูลกับการแสดงผล: ดึงข้อความ รูป วิดีโอ ตาราง และลิงก์ โดยไม่เปลี่ยนหมวดที่ใช้งานอยู่ ไม่คัดลอก CSS, fonts, navigation, script, event handler หรือ widget ของเว็บเดิมมาทับโปรเจกต์
- ใช้ Product detail, CatalogProductCard, ContentDirectory และ typography เนื้อหาที่มีอยู่แล้ว โซลูชันที่เติมใช้ prose styling เดิมของโปรเจกต์เฉพาะเนื้อหาใหม่ ไม่เปลี่ยน stylesheet ของโซลูชันที่มีอยู่
- ไม่แก้ `src/components/layout/`, `src/components/ui/`, layout ของ App/Site, `src/app/globals.css`, `src/styles/`, CSS Modules ปัจจุบัน หรือ `solutions-source.css`
- เก็บชื่อ/ข้อความ/รูปจริงและ source URL; ไม่ย่อรายละเอียดจนข้อมูลหาย และไม่ทำให้ข้อมูลเก่าอื่นถูกแทนด้วยผล import ที่ว่าง

## รายการไฟล์ที่อยู่ในแผน

### ตัวนำเข้าและข้อมูล

- `scripts/import-sunford.mjs` — รองรับ targeted staging/merge ของสินค้า บทความ และภาพปก โดยไม่ merge collection records หรือแก้การจัดหมวดเดิม; แยก content จริงออกจาก shared page chrome; ห้าม refresh ทั้งเว็บไซต์ทับ snapshot เดิม
- `scripts/import-solutions.mjs` — targeted staging/merge ของ 4 โซลูชัน; รักษา dynamic content ที่ตรวจใน Browser แล้ว; โหมดนี้ไม่สร้าง/เขียน CSS ต้นฉบับ
- `scripts/solution-sources.mjs` — เพิ่มแหล่ง Windows/Driver และ English destinations สองรายการ
- `scripts/import-legacy-products.ts` — สคริปต์เฉพาะงานเพิ่ม 9 SKU ผ่าน Prisma แบบ transaction, allowlist, backup/preflight/readback; ใช้ schema/client ปัจจุบัน
- `src/features/content/data/products.json` — เพิ่ม 9 records โดยไม่แก้ 150 records เดิม
- `src/features/content/data/pages.json` — เพิ่มเฉพาะ product page records, DRV, บทความเป้าหมายและภาพปกที่ยืนยันได้; collection records/สมาชิกหมวดเดิมต้องตรง baseline
- `src/features/content/data/import-report.json` — อัปเดตยอดและ provenance ของ targeted import; เก็บรายการปัญหาที่ยังไม่หาย
- `src/features/content/data/solutions.json`, `solution-links.json`, `solutions-import-report.json` — เติมสองหน้าเดิม เพิ่มสองหน้าใหม่ และผลตรวจ; ไม่เขียนทับโซลูชันอื่น
- `src/features/catalog/data/catalog-card-names.ts` — ชื่อสั้น LP53/LP54 และล้อ โดยรักษาความต่างสอง SKU
- `src/features/catalog/data/catalog-supplements.ts` — หากจำเป็นเฉพาะ 9 SKU ใหม่ ให้ใช้ family อุปกรณ์เสริมที่มีอยู่แล้วตามข้อมูลต้นฉบับ โดยไม่แก้ชื่อ/ID/ลำดับหมวดหรือการจัดกลุ่มของ 150 สินค้าเดิม
- `src/features/content/components/solutions-page.tsx` — หากต้องเพิ่ม wrapper ให้เนื้อหาที่เติม ใช้ prose classes ที่มีอยู่แล้วเฉพาะเป้าหมาย ไม่แก้ layout ของหน้าเดิม
- `src/features/content/data/public-paths.mjs` — mapping แหล่งใหม่เฉพาะเมื่อจำเป็นต่อ legacy alias/English paths; ไม่เปลี่ยน mapping เดิม
- `public/images/imported/` — เฉพาะไฟล์จากสินค้า 9 SKU/ภาพบทความที่อยู่ใน scope โดยใช้ชื่อ hash ตาม URL เดิม ก่อนคัดลอกเข้า public ต้องบันทึก source→destination→hash ของทุกไฟล์ลง `asset-manifest.json` และรายการ Assets ของ plan ไม่มีการลบหรือทับภาพที่มีอยู่

### Verification และเอกสาร

- `tests/catalog/management.test.ts` — อัปเดตยอดสินค้าที่คาดหวัง และตรวจว่า records เดิม/slug/สถานะยังอยู่ครบ
- `tests/e2e/product-category-mock.spec.ts` — อัปเดตเฉพาะยอดรวมเมื่อเพิ่มสินค้าใหม่ คง assertions หมวดเดิมและหมวดย่อย 01/02 พร้อม tests การเลื่อน ค้นหา Grid/List และ Compare
- `tests/catalog/legacy-content-migration.test.ts` — เพิ่ม meaningful regression ของ scoped merge, collection records/การจัดกลุ่มสินค้าเดิมต้องไม่เปลี่ยน, ไม่ทำข้อมูลเดิมหาย, source identity และการไม่คัดลอก executable markup/CSS
- `tests/e2e/legacy-content-migration.spec.ts` — ตรวจ 9 detail pages, หน้าเนื้อหาเป้าหมาย, ภาพจริง, legacy links, การเข้าถึงใน catalog/search และ responsive
- `spec.md`, `plan.md` — บันทึก approval จริงก่อน implementation และอัปเดตผลตรวจ/contract notes โดยรักษาประวัติ
- `output/legacy-content-migration-20261105/` — แผน, backup/hash baseline, staged content, `asset-manifest.json`, source/merge manifests, screenshots, ผลตรวจ, receipt และรายการรอยืนยัน ห้ามนำ output backups มาเป็น app imports

ไฟล์/ขอบเขตอื่นนอกเหนือรายการนี้ต้องอัปเดตแผนและขออนุมัติส่วนที่เพิ่มก่อนแก้ ไม่ใช้คำขอรักษารูปแบบเป็นเหตุ refactor ส่วนกลาง

## ลำดับดำเนินการและจุดตรวจ

- [x] ตรวจรายงานและเส้นทางข้อมูลจริง: snapshot, renderer, category resolver, Prisma import และพฤติกรรมคัดลอก CSS ของตัวนำเข้า
- [x] ระบุเป้าหมายและข้อจำกัด พร้อมแผนไฟล์/ผลกระทบที่ตรวจได้
- [x] รับการอนุมัติ Spec/Plan ฉบับนี้ บันทึกข้อความจริงก่อนแก้แอป
- [x] สำรองไฟล์และ hash; เก็บภาพ baseline หน้า Home/Catalog/สินค้าเดิม/บทความ/โซลูชัน พร้อมตรวจสภาพ DB แบบอ่านอย่างเดียว
- [x] ตรวจข้อกำหนด Next.js ใน `node_modules/next/dist/docs/` และ Prisma skill ที่ตรงกับการเพิ่มข้อมูล ก่อนเขียน implementation
- [x] ดึงข้อมูลเป้าหมายแบบสดลง staging ตรวจ dynamic DOM กับข้อมูลที่สกัด; ทำ manifest ทุก record/asset ก่อน merge
- [x] ตรวจ source conflict/ไฟล์ขาด แยกข้อมูลที่ยืนยันไม่ได้ แล้ว merge เฉพาะ allowlist
- [x] เติมเฉพาะ prose wrapper/เนื้อหาโดยไม่แก้ CSS/ส่วนกลาง; ยืนยัน category definitions, collection records, mock children, การจัดกลุ่ม 150 products เดิม และโซลูชันนอก scope มีค่าเดิม
- [x] ตรวจ target database จาก configuration; สำรองและเพิ่มเฉพาะ 9 IDs ที่ยังไม่มี ไม่ update/delete แถวเดิม ถ้า target/diff ไม่ตรงแผนให้หยุดส่วนเขียน DB แล้วรายงาน
- [x] ตรวจ `content:validate`, `paths:check`, `typecheck`, scoped lint/format, `test:catalog`, `test:uat` และ build ตาม scripts ของโปรเจกต์
- [x] Browser ตรวจ 320/390/768/1440px: ไม่มี overflow/ข้อความหรือภาพตัดผิด; Header/Hero/Footer/สี/ฟอนต์/พื้นที่เดิมยังเหมือน baseline; catalog scrolling/search/Grid/List/Compare ยังทำงาน
- [x] ตรวจ 9 products ใน runtime/API ที่ใช้ข้อมูลจริง เทียบรูปและ details กับ staging; เป้าหมาย159 products เมื่อ baseline150และเพิ่ม9ครบ ห้ามอ้างความสำเร็จจาก snapshot อย่างเดียว
- [x] ตรวจ diff/รูปก่อนหลัง อัปเดตผลจริงและรายการที่พักไว้ แล้วส่งมอบ local preview โดยยังไม่ deploy

## ผลกระทบและการย้อนกลับ

- ข้อมูลสินค้าเป็นส่วนกลางของ Home/Search/Catalog/Compare จำนวนและรายการสินค้าใหม่อาจเพิ่มขึ้น แต่ taxonomy/หมวดย่อย/การจัดกลุ่มสินค้าเดิมต้องไม่เปลี่ยน ต้องตรวจทุก consumer เหล่านี้แม้ไม่แก้ UI
- การเพิ่มข้อมูลผ่านฐานข้อมูลอาจมองเห็นในทุก runtime ที่ใช้ฐานข้อมูลเดียวกันหลัง cache หมด เป็น R1; ต้องแจ้ง target ที่ตรวจได้ก่อนเขียนและไม่ถือว่าคำอนุมัติรอบนี้เป็น production release
- งานไฟล์ย้อนกลับด้วยเฉพาะ diff/backup ของงานนี้ ไม่ reset working tree และไม่ทับงานผู้ใช้
- DB เก็บ receipt ของ IDs ที่สร้างใน transaction และสำรองก่อนเปลี่ยน หากต้องถอนข้อมูลให้เสนอรายการเจาะจงก่อนดำเนินการที่อาจกระทบการแก้ภายหลัง ห้ามลบแถวแบบกว้าง
- ไม่รับประกันความตรง pixel ทุกตำแหน่งเมื่อข้อมูลเพิ่ม แต่ต้องมีหลักฐานว่า design tokens, CSS/ส่วนกลาง และ interaction เดิมไม่ถูกเปลี่ยน

## สถานะปัจจุบัน

เสร็จแล้วตามการอนุมัติด้านล่าง: เพิ่ม9products/4solutions/2content pages/27covers โดยรักษาหมวดและรูปแบบเดิม หลักฐานและผลตรวจจริงอยู่ในหัวข้อส่งมอบท้ายไฟล์และ `output/legacy-content-migration-20261105/delivery.md` ไม่มีDeploy/Commit/Push

## บันทึกการแก้ขอบเขต

ผู้ใช้: “แก้ไขหมวดหมู่เดิมยังไม่ต้องเปลี่ยนนะครับผมจะจัดหมวดหมู่ใหม่” — ตัดงานเปลี่ยน taxonomy/หมวดย่อย/collection membership เดิมออกจากแผน และถอน category resolver/page files ที่ไม่จำเป็นออกจาก allowlist คงงานนำเข้าข้อความ รูป วิดีโอ และสินค้าใหม่ ไม่มีการแก้แอปหรือจัดหมวดในรอบนี้ สถานะอนุมัติ implementation ยังคง Pending

### Implementation Approval Record (2026-11-05)

ผู้ใช้: “อนุมัติครับ เริ่มดึงข้อมูลมาใส่ตามแผนได้เลย โดยคงหมวดหมู่และรูปแบบของโปรเจกต์เดิมไว้ทั้งหมดครับ” อนุมัติแผนฉบับตัดงานเปลี่ยนหมวดออกแล้ว รวมการเพิ่มเฉพาะ9สินค้าใหม่ตามแผน ไม่ใช่การอนุมัติDeploy/Commit/Push


## Approved-scope asset manifest (implementation)

Only these verified source assets may be added; existing same-hash files are retained.

- `public/images/imported/9e4efc3814af8de93c76.png`
- `public/images/imported/fecfd81b02530b678bea.jpeg`
- `public/images/imported/5b5c06463c124780e375.jpeg`
- `public/images/imported/1f42dcb175b211a5e5a0.jpeg`
- `public/images/imported/f5221c4dabdfbb896521.jpeg`
- `public/images/imported/fcc2261c57419939a6bc.jpeg`
- `public/images/imported/6a68fcd23e2e0ae847fa.jpeg`
- `public/images/imported/9ef35f092a9f37f3d2b2.png`
- `public/images/imported/b94646bfa790187c7408.jpeg`
- `public/images/imported/d0c9bc7f327caeb9e315.jpeg`
- `public/images/imported/905ae1755bfa6797e436.jpeg`
- `public/images/imported/687dd522eb20364194a1.jpeg`
- `public/images/imported/591472e226128954c500.jpeg`
- `public/images/imported/7eca4a1b9c513e467206.jpeg`
- `public/images/imported/d1ffef32058244994c21.png`
- `public/images/imported/571ae179cc51c3d199d6.jpeg`
- `public/images/imported/15f2a43578e4ba567269.png`
- `public/images/imported/075589e73bce31f63486.jpeg`
- `public/images/imported/85e77a12707e0a83210a.png`
- `public/images/imported/b049f793084caca70df7.jpeg`
- `public/images/imported/147e9d451f3595e95a19.png`
- `public/images/imported/f4dbc64bf3e48e014031.jpeg`
- `public/images/imported/70523b62719b969c772f.png`
- `public/images/imported/1e5f0488fd49ae368b6e.jpeg`
- `public/images/imported/9130315b99dac74c03ce.png`
- `public/images/imported/d617f054cc9fbdbf81c7.jpeg`
- `public/images/imported/e75aa9daf108b92efc49.png`
- `public/images/imported/ad56db83c5d9a6e56e17.jpeg`
- `public/images/imported/d38b0590612131d939cb.png`
- `public/images/imported/cb67cd0bfeb3931d92e0.png`
- `public/images/imported/fcf37c1b9275c5a5fa00.png`
- `public/images/imported/941e52ff7b59ac2cdb05.png`
- `public/images/imported/f091f57be797a460f58e.png`
- `public/images/imported/fdd01b3c94f28fbf4678.png`
- `public/images/imported/1e686d7bff927cb1997e.png`
- `public/images/imported/cbdd5326c0274a7470ef.png`
- `public/images/imported/3da21dd2d0c0d9c3d7ee.png`
- `public/images/imported/0a74d7a11d8462312c9b.png`
- `public/images/imported/212c2fc63d7672a5d15c.png`
- `public/images/imported/667252ef8c3960d2fb89.png`
- `public/images/imported/98fe946718550cdb767d.png`
- `public/images/imported/3640acdc7d6ec67afb1e.png`
- `public/images/imported/adeb77d27b3198a9f1d0.png`
- `public/images/imported/5ed48aaa0bf0d7e6a0bb.png`
- `public/images/imported/e486815c184870d3dcb4.png`
- `public/images/imported/eb7327f044184ebc605d.png`
- `public/images/imported/a22c69d9d7729868d083.png`
- `public/images/imported/78b2983ec86cce9dd8c3.png`
- `public/images/imported/12e1ceea776c7788d14a.png`
- `public/images/imported/e80426487f4fc1e3a53e.png`
- `public/images/imported/c4318546491d30fed637.png`
- `public/images/imported/b6d2ff935221e6a463fb.png`
- `public/images/imported/e5fe81299783b0a5111a.png`
- `public/images/imported/62644bdc4b0749f7aad3.png`
- `public/images/imported/87c3a17f2f7459fa59f6.png`
- `public/images/imported/c0d1c61d3d714cc63990.jpg`

## Final verification and delivery (2026-11-05)

- Completed approved merge: 159 products, 401 pages, 14 solutions, 27 covers; 56 verified source images, 47 new public files.
- Preserved all 150 previous snapshot products, 112 collection records, 10 unrelated solutions and 295 baseline files outside approved edits. No CSS/global layout/navigation/taxonomy changes. Existing mock children and 18 model mocks remain.
- Insert-only database transaction added nine IDs; 161 total / 159 published. Final read-only verification confirms all 152 original rows equal backup, including two non-public rows.
- Passed content validation, path audit, TypeScript, ESLint, scoped Prettier, diff whitespace, UAT27/27, Browser26/26 with responsive checks and unchanged layout metrics in ten baseline cases.
- Catalog65/65 passed in isolated current-code copy using canonical Git reference bytes. Root Windows worktree64/65: pre-existing CRLF checksum mismatch in the protected category document; no category document/test/manifest edits or skipped tests. Both logs retained.
- Production build passed under Node24.22.1, 431/431 static pages; ten HTTP smoke routes passed and API returned159 products. Local production preview remains on port3000; task-owned dev server stopped before build.
- Held one expired-TLS source image and conflicting PU/Nylon claim for SKU10838. Other historical missing source data remains documented; no invented substitute.
- Backup, source/asset manifests, DB backup/receipt, before/after screenshots and final preservation audit are in output/legacy-content-migration-20261105/. See delivery.md for exact logs, limitations and rollback.
- Final Next.js feedback reporting pass: no verified qualifying framework issue. No commit, push or deployment performed.

## Commit / push follow-up (2026-11-05)

User approved: “สองจุดนี้พักไว้ก่อนครับ และ commit/push”. Keep the two held items unchanged. Use existing current branch `safe` and its `origin/safe` upstream; no production release.

Files: commit only the migration application/data/importer/test files and verified image assets already listed above, plus this approval record in `spec.md` and `plan.md`. Exclude output backups, database receipts and environment files.

- [x] Inspect diff, current branch/upstream, existing verification evidence and remote state.
- [x] Stage the exact migration allowlist; inspect staged paths and whitespace.
- [x] Commit the verified migration and push normally to `origin/safe`.
- [x] Confirm remote commit matches local HEAD and working tree is clean.

Rollback: use a normal revert of this migration commit if later requested; no history rewrite or database deletion. Verification: prior application Build/Browser tests remain applicable because follow-up changes only approval documentation; inspect exact staged diff before commit and remote hash after push. Final Next.js feedback review: no qualifying framework issue in this Git-only follow-up.

Result: content commit `a00afc2` pushed to `origin/safe`; remote hash matched local HEAD and worktree was clean. Staged exactly66 approved files including47 verified images, excluding backups/environment/receipts. Two held items remain unchanged. This final documentation update records the verified push; it does not alter application content.

# Plan: Homepage direct YouTube video links (2026-11-05)

User discarded automaticAPI implementation. Verified cleanworktree and currentoriginalcomponents, inspectedsharedgallery/focus/CSS, captured12latestcanonicalwatchlinks from the user's openBrowser channel. Revised concrete Spec/Plan awaits approval; no application/data/media edits.

Exact proposed files: src/features/home/data/youtube-video-links.ts(new static12), src/features/home/components/source-showcase.tsx(homeonlywiring), src/features/content/components/video-gallery.tsx(optionalexternal-linkmode/default unchanged), tests/e2e/video-focus.spec.ts(homeexpectations), tests/e2e/youtube-video-links.spec.ts(new coverage), spec.md/plan.md and output/youtube-direct-links-20261105/. The12image destinations, source links, impact and rollback are enumerated in output/youtube-direct-links-20261105/plan.md. No globalUI/layout/styles/next.config/env changes.

- [x] Inspectdiscard and sourceBrowser; specifyhomepage-onlyexternalclick/staticdata/defaultmodepreservation.
- [x] ReceiveapprovalforthisrevisedSpec/Plan beforeapp edits underAGENTS.md.
- Approval received: “อนุมัติครับ ทำตามแผนได้เลย ใช้ 12 คลิปล่าสุด กดแล้วเปิด YouTube ในแท็บใหม่ โดยคงรูปแบบเดิมไว้ครับ”. Proceed within the revised allowlist only.
- [x] Baselineandverifiedsource/assetmanifest; addonly12approvedlocalimages.
- [x] Addstaticlinksandhomepageexternal-linkmode withoutrestoringdiscardedAPIcode.
- [x] VerifynewtabwatchURLs,images,absenceofhomepageiframe,drag/focus/keyboard/responsive320/390/768/1440 anddefaultmodalonotherpages.
- [x] Runscopedtypecheck/lint/format/build/e2e; recordactualresults/screenshots.

Rollback only scoped app/test/assetdiffs; do notresetotherwork orrestoreAPIimplementation. Snapshotdoesnotautomaticallyrefresh; updatinglinksismanual. NoAPIkey/DB/CMSwrites/commit/push/deploy. FinalNext.jsfeedbackreview:noqualifyingframeworkissue.

## Direct-link implementation results

Completed approved5app/testfiles+2docs+12images. SourceURLsending.jpgactuallyreturnedAVIF (includingJPEGAccept), so preserve12originalbinaries as.avif atthesameapprovedassetIDs; artifactplanlistsactualpaths. Noimageconversion/additionalassets.

PassedTypeScript/scopedlint/finaltestlint/Prettier/diff, Node24productionbuild431/431, Browser9/9 including320/390/768/1440,12sourceURLs/images,newtab/keyboard,drag/focus/blur and non-homepage defaultmodal. Fourstyle/overflowbaselinesmatch;308unrelatedbaselinefilesunchanged. ActualBrowser openedthematchingYouTubeclip/channel, preserveduseroriginaltabs andleftlocalhomepagepreviewopen. NoAPI/config/env/CSS/category/CMS/DBchanges orcommit/push/deploy. Exactevidenceandrollback: output/youtube-direct-links-20261105/delivery.md. FinalNextfeedbackpass:noqualifyingframeworkissue.
