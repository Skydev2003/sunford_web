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

# Plan: Subcategory arrow navigation one item per click (2026-11-05)

User asks to remove the subcategory scrollbar and use arrows moving one submenu per click. Verified current80%-viewportscrollBy and overflow-x:auto. Concrete scope/behavior/acceptance/rollback: output/subcategory-arrow-navigation-20261105/plan.md. Approval pending; no app edits.

Files: src/features/catalog/components/product-category-mock.tsx(arrowtargetonly), src/features/catalog/components/product-category-mock.module.css(subcategoryoverflowonly), tests/e2e/product-category-mock.spec.ts(meaningfulstep/edge/gesture/keyboard/regressionchecks), spec.md/plan.md and output/subcategory-arrow-navigation-20261105/.

- [x] Inspectactualcomponent/CSS/tests and preserve existing uncommittedYouTubework.
- [x] ReceiveapprovalofthisSpec/Plan beforecode.
- [x] Backup/baseline and implement scoped one-item arrows without taxonomy/selection changes.
- [x] Verify320/390/768/844/1440,rapidclicks/edges/reset/keyboard/reducedmotion/manualgestureabsence and existingcataloginteractions.
- [x] Runtypecheck/scopedlint/format/e2e/buildasappropriate; saveactualscreenshots/results.

Impact limited tosubcategories/products. Rollback scoped3app/testfiles only; noresetworkingtree, noYouTubefileoverwrite, globalUI/layout/CSS/data/DBchanges orcommit/push/deploy. FinalNext.jsfeedbackreview:noqualifyingframeworkissue.

Additional user request: remove “เครื่องชั่ง” from scales submenu display labels. Same component/test allowlist now includes a scales-only prefix display transform and adjusted text assertions, with original manifest/IDs/memberships and parent category label preserved. Included in the combined arrow-navigation plan awaiting approval; no application changes yet.

Combined scope approved: user replied “อนุมัติ”. Begin implementation within the listed3app/testfiles only; preserve all current unrelated changes and the current Git state, without restoring discarded changes.

## Completed verification

Implemented only the3approvedapp/testfiles plus spec/plan. DOMbutton-boundary steps replace80%scroll; pending target handles rapid presses, edges clamp, and reducedmotion/keyboard/categoryreset remain. Only subcategories CSS changes to hidden horizontal overflow and pan-y. Scales children display prefix removed; manifest/IDs/memberships/selected filters and parent strip unchanged.

Passed TypeScript/scopedESLint/Prettier/diff, Node24productionbuild431/431 and fullBrowser13/13 (`browser-pass.log`), including320/390/768/844/1440, rapidsteps/edges/resize, keyboard/reducedmotion, horizontalwheel/touch blocking and verticaltouch scrolling, all prior catalog/Compare/redirect assertions. RealBrowserconfirmed one-button step with selection unchanged.273unrelatedbaselinefileshash-identical including committedYouTubework and category/CMS/productdata/config/env/sharedUI/styles.

Testdiagnostics: await categoryURLsyncreadiness before DOMscroll actions; verify positive gesture control and use native touchstart/move/end before wheel to avoid inert synthetic gestures in the harness. Earlier failure logs retained; final suite passed. Noappworkaroundfortestharness. Delivery/rollback/backup/screenshots: output/subcategory-arrow-navigation-20261105/delivery.md. NoDBwrites/Commit/Push/Deploy. Localproductionpreview3000 remains. FinalNextfeedbackpass:noqualifyingframeworkissue.

# Plan: POS platform subcategories (2026-11-05)

Owner confirmedafterclarification: “เพิ่ม ios ว่างไว้ก่อน และ android ใส่ p1/p4 ส่วนp1w เพิ่มส่วนย่อย windows”. Proceed with this explicit scope: All/iOS(empty)/Android(P1,P4)/Windows(P1W), replacing POS demochildren only. Exact files/acceptance/impact/rollback in output/pos-platform-subcategories-20261105/plan.md.

Files: src/features/catalog/data/pos-subcategories.ts(newmapping), src/app/(site)/products/page.tsx(POSbranchonly), tests/catalog/pos-subcategories.test.ts(newmeaningfulsource/noresurrectionchecks), tests/e2e/product-category-mock.spec.ts(POSexpectations/empty/filter/reset),spec.md/plan.md/output. Preserve existing uncommitted arrow/label changes and committed YouTube work; noCSS/globalUI/layout/schema/API/DB/CMS changes orcommit/push/deploy.

- [x] Inspectsourceplatformfacts and obtainexplicitownerinstruction for allthreeplatforms andmemberships.
- [x] Backup/hashcurrentstateandPOSbaseline.
- [x] ImplementpurePOSmappingandwireonlyPOSbranchwithcontractunchanged.
- [x] Rununit/typecheck/scopedlint/format/build/browserincludingplatformfilters/empty/all3 and currentresponsive/arrow/Compare regressions.
- [x] Verifynon-POSdata/styles/YouTube/currentarrowcodepreservation; deliveractualscreenshots/results.

Rollback scopedPOSdiffonly, notresetworkingtree oroverwritecurrentarrowwork. NoDBrollback needed.

POS results: iOSempty/AndroidP1+P4/WindowsP1W/All3; newunit3/3,TypeScript/scopedlint/format/diff,Node24build431/431 andcombinedBrowser17/17passed at5viewports,includingempty/filter/reset and existingarrow/Compare/regressions. RealBrowserconfirmedallthreeplatformfilters. Duringworkexternalplatformmaterialeditsappearedinsharedfiles;preservedthemandkeptPOSbranchalongside.273otherbaselinefiles,sourceproductdata,styles/YouTube/config/env andarrowfunctionunchanged. Exactevidence/knownconcurrentfiles/rollback: output/pos-platform-subcategories-20261105/delivery.md. NoDBwrites/commit/push/deploy. FinalNextfeedbackpass:noqualifyingframeworkissue.

# Plan: Platform material subcategories (2026-11-05)

Status: "Ready to Code"
Approval: "Approved — user replied อนุมัติ after the concrete Spec/Plan"

## Files

- `src/features/catalog/data/platform-subcategories.ts` — สร้างข้อมูล 4 หมวดย่อยและตัวผูก Source ID ของ 23 platform รุ่นเดิมที่ตรวจแล้ว; ใช้ entries/productIds รูปแบบปัจจุบันและ ABS Mock โดยไม่แต่งรหัสรุ่น
- `src/app/(site)/products/page.tsx` — เชื่อม platforms กับหมวดย่อยวัสดุ; คง parent productIds และหมวดอื่น; ปรับ subcategoriesAreMock เฉพาะ platforms
- `src/features/catalog/components/product-category-mock.tsx` — ให้ platforms > ทั้งหมดรวมรายการ Mock ที่ขาดอย่างที่ scales ทำอยู่ โดยไม่เปลี่ยน UI/interaction/งานลูกศรเดิม
- `tests/catalog/platform-subcategories.test.ts` — สร้าง regression ตรวจ 4 ชื่อ/ลำดับ/23 Source IDs/วัสดุโครงสร้างที่แยกจากจาน/ไม่มี cross-parent/unpublished fallback/ABS Mock และ input immutability
- `tests/e2e/product-category-mock.spec.ts` — ปรับเฉพาะ expectations ของ platforms และเพิ่มตรวจ 4 หมวดจริง/Mock/All/search/sort/Grid/List/Compare/responsive; รักษาการตรวจลูกศรและ scales เดิม
- `spec.md`, `plan.md` — เพิ่มงานนี้โดยรักษาประวัติ บันทึก approval จริงและผลตรวจ
- `output/scale-material-subcategories-20261105/` — inspection.json/inspection.md, backup/hash baseline, แผนสำเนา, logs, screenshots และ delivery.md เฉพาะงานนี้; ไม่ใช้ backup เป็น app imports

ไม่มีการแก้ CSS/global/shared UI/layout, manifest ของ scales, family resolver, products.json, CMS หรือ DB; ต้องขออนุมัติขอบเขตเพิ่มก่อนแก้ไฟล์นอกแผน

## Steps

- [x] อ่านแหล่งอ้างอิง/เส้นทางข้อมูล/สเปก/ความจำ ตรวจ 23 platform จาก snapshot และแยกวัสดุโครงสร้างจากจานชั่ง
- [x] รับคำยืนยันชุดสินค้า: เฉพาะโครงสร้างแท่นชั่งเดิมและ ABS Mock; ไม่ใช้รายชื่อเครื่องชั่งทั้งเครื่องในเอกสารแนบ
- [x] รับอนุมัติ Spec/Plan ฉบับนี้: ผู้ใช้ตอบ “อนุมัติ” หลังแสดงแผน; บันทึกก่อนแก้ app/test แล้ว
- [x] สำรอง current bytes ของ 3 app + test เดิม และบันทึก hashes นอก scope; อ่าน Next.js guide ที่เกี่ยวข้องจาก node_modules/next/dist/docs/ ก่อนเขียนโค้ด
- [x] สร้าง platform-subcategories.ts ใช้ Source ID รายวัสดุจาก inspection.json; resolve จาก published platforms input เท่านั้น ใส่ ABS Mock 1 โดยใช้ชื่อวัสดุ
- [x] เชื่อม page.tsx และเพิ่ม platforms missing-entry aggregation ใน component เท่าที่จำเป็น คง diff ลูกศร/label เดิม
- [x] ตรวจ runtime จำนวนและชื่อจริงด้วย public API แบบอ่านอย่างเดียว เทียบ resolver; เก็บ Mock สำหรับรุ่นที่ไม่อยู่ใน input ไม่ resurrect สินค้า
- [x] ตรวจ `bun run test:catalog`, `bun run typecheck`, scoped ESLint/Prettier และ production build ผ่าน Node24 ตาม scripts; แยก checksum CRLF ของ reference scales ถ้าพบ และไม่แก้ reference นอก scope
- [x] Browser: 4 วัสดุ/All, ป้ายและไม่มี action ของ Mock, published-only, parent membership เดิม, search/sort/Grid/List/Compare/links, ลูกศร/keyboard/reduced motion และ 320/390/768/1440px ไม่มี page overflow; ใช้ output แยกของงานและตรวจ screenshot จริง
- [x] ตรวจ diff กับ baseline ว่ารักษางานเดิม/นอก scope; อัปเดต spec/plan/delivery พร้อมผลจริงและข้อจำกัดก่อนส่งมอบ

## Impact / Rollback

- R2: เปลี่ยนข้อมูล submenu ของ platforms และจุดแสดง Mock ใน /products เท่านั้น; parent routing และ canonical product membership เดิม
- ความเสี่ยง: จัด Carbon Steel ผิดเป็น stainless เพราะอ่านวัสดุจาน, สินค้าไม่เผยแพร่กลับมา, Mock หลุดไป Compare หรือทำให้ All ซ้ำ/ตกหล่น; ตรวจแยกด้วย source-ID manifest และ Browser
- ย้อนเฉพาะ diff งานนี้หรือ backup ก่อนงานนี้ ไม่ reset/revert ทั้ง component/test เพราะมี diff ลูกศรและชื่อ scales ของงานก่อนอยู่แล้ว

## Verification Results

- Planning inspection passed: snapshot products 23, Carbon Steel12/SUS3049/SUS2012/ABS0; catalogProductGroup independently returns the same 23 platform models. Exact evidence: output/scale-material-subcategories-20261105/inspection.json และ inspection.md
- ตรวจ public runtime API แล้ว159สินค้ารวม/23platforms และ12/9/2ตรง Source IDs; ABS1Mock; runtime-verification.json เก็บผลอ่านอย่างเดียว ไม่มี DB/CMS writes
- Node24.22.1 production build431/431, TypeScript/scopedESLint/Prettier/diff ผ่าน; focused units5/5 และ Browser17/17 ผ่านครบ ไม่ skipped/flaky รวม4วัสดุ/All/Mock/search/sort/Grid/List/Compare/links/ลูกศร/keyboard/reducedmotion/touch และ responsive320/390/768/844/1440
- Fullcatalog root72/73: known CRLF checksum ใน reference scales เดิม; isolated code copy ใช้ canonical Git reference เท่านั้นแล้ว73/73ผ่าน ไม่แก้ workspace reference/test/manifest ไม่ข้ามทดสอบ
- ตรวจภาพ ABS320/390/768/1440 ด้วยตาแล้ว ไม่มี page overflow; 1675baselinefilesนอกขอบเขต SHA256เดิม รักษางาน POS พร้อมกันและ prior CSS/arrow/touch code/tests ครบตาม preservation-audit.json
- หยุด QAserver3028หลังตรวจ ไม่รบกวน preview เดิม และนำสำเนา environment ส่วนตัวออกจาก QAcopy; ไม่commit/push/deploy
- Final Next.js feedback reporting pass: no verified qualifying framework issue. Actual evidence and rollback: output/scale-material-subcategories-20261105/delivery.md

# Plan: Indicator display and waterproof subcategories (2026-11-05)

Status: "Ready to Code"
Approval: "Approved — owner confirmed this concrete plan"

Concrete mapping, overlap behavior, evidence, exact allowlist, verification and rollback: output/indicator-subcategories-20261105/plan.md. LCD5(AW31/SW31F/AC31P/AC31S/WP31C),LED2(SW31/WP31E),กันน้ำ2(WP31C/WP31E),All7 distinct parent products. Preserve current styles/arrows and all pending POS/platform/scales work.

Files: new src/features/catalog/data/indicator-subcategories.ts; indicators-only integration in src/app/(site)/products/page.tsx; new tests/catalog/indicator-subcategories.test.ts; indicator expectations in tests/e2e/product-category-mock.spec.ts; spec.md/plan.md/output/indicator-subcategories-20261105/. No shared UI/global styles/DB/product-copy changes.

- [x] Inspect seven source models and verify display/waterproof evidence; corroborate WP31C LCD despite conflicting detail copy.
- [x] Receive owner approval for this concrete Spec/Plan before application edits.
- [x] Backup current bytes/hashes and read relevant bundled Next.js guide.
- [x] Implement input-only pure membership mapping and indicators page branch.
- [x] Verify units/typecheck/lint/format/build/browser, overlap/All uniqueness, reset/search/Compare/keyboard/arrows and320/390/768/1440.
- [x] Inspect screenshots/preservation diff and update actual results.

Impact R2: indicator submenu membership only, parent products unchanged. Rollback exact task diff, preserving other pending work. Implementation and runtime verification completed as recorded below. No commit/push/deploy. Final Next.js feedback review: no qualifying issue.

Approval record: User explicitly said to proceed with LCD / LED / waterproof according to the plan, keep waterproof models in their display categories too, and preserve the design. All proposed memberships and file scope are approved; no missing information.

### Completed state / verification

Progress: "Done — approved indicator LCD/LED/waterproof filters verified"

Added a pure Source-ID resolver and indicators-only page branch using the existing contract. LCD5/LED2/waterproof2; WP31C is LCD+waterproof and WP31E is LED+waterproof. All retains seven distinct current parent records. No product-copy corrections, peripheral keyword classification, resurrected records, CSS/renderer changes or DB writes.

Passed indicator units3/3 and combined indicator/POS/platform units11/11; TypeScript, scoped ESLint/Prettier, diff check; Node24 production build431/431; complete catalog Browser21/21 including indicator320/390/768/1440, overlap/unique All/search/reset/Grid/List plus existing arrow/touch/keyboard/Compare/POS/platform/scales/redirect checks at five viewports. Inspected all four indicator screenshots.1637 baseline files outside the exact shared page/test scope remain hash-identical; prior pending work preserved.

Evidence and rollback: output/indicator-subcategories-20261105/delivery.md, logs, before-files.zip, page.diff and preservation-verification.json. Production preview localhost:3000 restarted with the current build (owned session22783). No commit/push/deploy requested or performed. Final Next.js feedback reporting pass: no verified qualifying framework issue; npm PowerShell argument parsing was corrected by running the installed Next CLI through Node24, not by application changes.

# Plan: Owner indicator model manifest (2026-11-05)

Status: "Ready to Code"
Approval: "Approved — owner answered ใช่ to replacing prior lists with the attached document and missing models as Mock, preserving design"

## Behavior and contract

Use the attached sunford-indicator-models.md as the authoritative child list and order: LCD=AW31/AC31P/SW31F/WP31C/LCDC1C5; LED=SW31/WP31E/WP31EUSB/LED-R1/LED-R3/LED-R5; waterproof=WP31C/WP31E/WP31EUSB. Preserve short LCD/LED/กันน้ำ labels, current UI and arrow behavior. Display known real rows; LCDC1C5 and WP31EUSB are Mock until published data exists. Waterproof overlap remains, including one WP31EUSB Mock per child and only one under indicator All.

Three real display models currently each have two published source records: prefer exact sourceId LED-R1/R3/R5, then corresponding numeric sourceId10725/10723/10724 if available. Resolve only current published input, select one per model and never append source snapshots. Exact Indicator-* model identifiers match their verified numeric source IDs. Do not confuse AC31S or the base WP31E with requested WP31EUSB. Preserve AC31S in indicator All, remove only its LCD child membership because it is absent from the owner's child lists.

Indicators page parent includes its seven existing indicator rows plus the three resolved displays, retaining the original accessories membership. This is a presentation-only overlapping category in /products, not a global family reassignment. Global All remains159 unique real products. Indicator All10real+2distinctMocks; children LCD4real+1Mock / LED5real+1Mock / waterproof2real+1Mock. No product data edits/deletions or fabricated specs/images.

## Files

- docs/sunford-indicator-models.md — byte-for-byte copy of supplied source for durable ownership reference.
- src/features/catalog/data/indicator-subcategories.ts — ordered model entries, explicit source IDs/aliases, current-input-only resolver.
- src/app/(site)/products/page.tsx — resolve indicator entries from published products, add only resolved displays to indicator page membership; preserve all other branches.
- src/features/catalog/components/product-category-mock.tsx — add indicators to existing distinct missing-entry aggregation under its All filter; preserve renderer/arrows/styles.
- tests/catalog/indicator-subcategories.test.ts — owner-document parity/order, explicit aliases/deduplication, no base-model substitution, missing/hidden boundary, immutability and overlap.
- tests/e2e/product-category-mock.spec.ts — update indicator count/order/Mock/link/Compare/search/reset/overlap expectations; verify original accessories remain and global All stays unique. Retain prior catalog/arrow/POS/platform regressions.
- spec.md/plan.md and output/indicator-model-manifest-20261105/ — approval, backup/baselines, logs, screenshots, delivery.

## Steps

- [x] Inspect owner document and actual published API records; verify missing models and duplicate display aliases.
- [x] Record explicit owner confirmation of replacement lists and Mock behavior, current Spec/Plan and precise file scope before app edits.
- [x] Read relevant bundled RSC guide and current renderer; preserve current pending work.
- [x] Capture scoped backups and non-scope hashes; copy owner document.
- [x] Implement mapping/page membership and indicator-All missing-model aggregation only.
- [x] Verify document/model/alias units, typecheck/scoped lint/format/build; Browser320/390/768/1440 including Mock no actions, All dedup, existing catalog controls and arrows.
- [x] Inspect screenshots and preservation diff, update actual results and delivery.

## Impact / rollback

R2: indicator presentation entries only. Additional display membership intentionally overlaps accessories; no global resolver, canonical route, CMS/DB/specs/styles/shared UI changes. Primary risks: duplicate alias cards, WP31EUSB incorrectly using WP31E, duplicate All Mock, lost AC31S or changed accessories. Tests explicitly cover each. Rollback exact task diff using scoped before-files.zip; do not reset the working tree containing prior approved tasks. No commit/push/deploy requested.

## Verification

Public API and implementation checks confirm published display aliases and Mock for LCDC1C5/WP31EUSB. Existing global input159 rows. Final Next.js feedback review: no verified qualifying framework issue.

## Completed state / verification

Progress: "Done — owner document supersedes prior inferred indicator child mapping"

The copied docs/sunford-indicator-models.md is byte-identical to the supplied file. Children preserve its model order: LCD4real+1Mock; LED5real+1Mock; waterproof2real+1Mock. LCDC1C5 and WP31EUSB are Mock; WP31EUSB appears in LED and waterproof but once under indicator All. WP31EUSB never uses the WP31E row. Three display aliases resolve to one current published record per model, with deterministic exact-source priority and published numeric alias fallback. No snapshot resurrection.

Indicator All retains AC31S and includes three resolved display products, giving10real+2distinctMocks. Original accessories membership remains; global All has159 unique real rows and no new product records. Other family resolver contracts/routes and product source data are unchanged. Only renderer change adds indicators to existing distinct missing-model aggregation; arrow function is byte-text identical and CSS untouched.

Verified indicator units5/5 and combined indicator/POS/platform units13/13, TypeScript/scoped ESLint/Prettier/diff, Node24/Next16.4.3 production build431/431 and Browser21/21. Browser covered document order, counts, Mock no links/images/actions/Compare, exact display URLs, AC31S retained, waterproof overlap, unique All, search/reset/Grid/List and existing arrow/touch/keyboard/Compare/POS/platform/scales/routes across320/390/768/844/1440. Inspected all four saved LED screenshots.1648 baseline files outside exact application/test scope remain hash-identical; source document copy and arrow preservation verified.

Evidence and precise rollback: output/indicator-model-manifest-20261105/delivery.md, plan.md, logs, before-files.zip, baseline-hashes.json, component.diff and preservation-verification.json. Current production preview localhost:3000 uses this build (owned session81054). No DB/CMS writes, global UI/style/config changes or commit/push/deploy. Final Next.js feedback reporting pass: no verified qualifying framework issue. Observer review: existing owner-manifest and exact-model matching lessons apply; no skill updates required.

# Plan: One catalog card per consumable size (2026-11-05)

Status: "Ready to Code"
Approval: "Authorized by owner's explicit request to reduce same-size items to one card"

## Goal / scope

In /products presentation only, reduce the20 known label/thermal-paper records to7 size cards (13 fewer). User screenshot includes same-size regular/waterproof labels and10/20-roll packs, so group by size across those variants. Preserve the first currently published row in input order for each known size, its real card/image/name/link, and all other input rows. No generic dimension matching and no fabricated group product.

Verified source groups:

- Label40×60mm: Sticker_6040,10750,10747,10742,10812,10811.
- Label20×60mm:10748,10740,10810.
- Label30×60mm:10749,10809.
- Paper57×50mm:Sticker_5750,10743,10746.
- Paper80×80mm:Sticker_8080,10744,10745,10824.
- Label30×53mm (Sticker_5330) and20×53mm (Sticker_5320) are already unique; leave intact.

Apply before page family/subcategory construction and before sending the page's visible products. This prevents duplicates split across accessory demo children and global All, search, sorting or Compare. Counts reflect146 visible real products instead of159. Original API/repository, DB/CMS, product detail URLs and159 published records remain; no deletion/unpublishing. All prior indicator/Mock/POS/platform/scales/arrow/YouTube behavior stays. This is a reversible page filter, not a category redesign.

## Files

- src/features/catalog/data/consumable-sizes.ts — pure known-source grouping and first-current-row filter.
- src/app/(site)/products/page.tsx — apply the scoped filter to published input before current page logic; no repository mutation.
- tests/catalog/consumable-sizes.test.ts — verified groups/counts, cm/mm source equivalence, current order/omitted record behavior, immutable original objects and unrelated dimensions/products untouched.
- tests/e2e/product-category-mock.spec.ts — adjust page expectations only and add known-size uniqueness across All/accessories/children/search/sort/Grid/List/Compare and responsive320/390/768/1440; verify original API/detail URLs still exist and prior catalog tasks remain.
- spec.md/plan.md and output/consumable-size-deduplication-20261105/ — plan/approval, source inspection, baseline/backup, logs/screenshots/delivery.

No card renderer/name mapper/CSS/shared/global UI/layout/category resolver/source product data/DB/CMS/schema/config/API changes or commit/push/deploy.

## Steps

- [x] Inspect screenshot, existing card names and20 published records; identify7 actual size groups and current input order.
- [x] Record concrete scope and explicit user authorization; read relevant bundled Next RSC guide and preserve current pending work.
- [x] Backup page/tests and hash all protected files.
- [x] Add pure consumable-size filter and page-only wiring.
- [x] Run meaningful units/typecheck/scoped lint/format/build and Browser320/390/768/1440 plus previous regressions.
- [x] Verify7 cards/146 visible products, no duplicate sizes, API159/old detail routes preserved, inspect screenshots and scoped diffs; update actual results.

## Impact / rollback

R2:13 extra same-size cards hidden on /products. Smaller counts are intentional; existing variants remain real records and keep their URLs. First-current-row selection is explicit to avoid guessing which variant is commercially preferred. If its row is absent, the next available input row represents that size, never a snapshot fallback. Rollback only new helper and exact page/test diff using scoped backup; preserve all previous uncommitted work.

## Verification results

Implementation and verification completed as recorded below. No qualifying verified Next.js issue during this pass.

## Completed state / verification

Progress: "Done — one visible catalog card per consumable size"

Added pure deduplicateConsumableSizes using only verified source-ID groups, retaining the first current published input row and original object per size. Applied only to /products page input before family/subcategory construction.20 label/paper rows now present7 size cards;13 redundant variants are absent from this page projection. Visible global count146 replaces159 for this page only; API/source records/detail URLs remain159. Original representative title/image/link/styles and all other products are unchanged. First-current selection covers materials and pack-count variants as requested, without guessing a new product specification.

Passed4 focused units and17 combined consumable/indicator/POS/platform units, TypeScript/scoped ESLint/Prettier/diff, Node24 production build431/431 and Browser25/25. Browser covered All/accessories/demo children, seven exact representative URLs, sourceAPI159, existing omitted-variant detail URL, search/sort/Grid/List/Compare, unique sizes and overflow at320/390/768/1440 plus all prior arrow/touch/keyboard/indicator/Mock/POS/platform/scales/redirect regressions at five viewports. All four saved screenshots inspected.1652 baseline files outside the exact existing page/test scope remain hash-identical, including renderer/CSS/model manifests/source product data/YouTube/global UI/config.

First build failed because the remote database connection terminated during an unrelated home-image query; the unchanged retry completed431/431. Preserved build-first-attempt.log; no application or database workaround. Final Next.js feedback reporting pass: no verified qualifying framework issue. Observer review: existing principles applied; no new recurring operational pattern or skill update needed.

Evidence/rollback: output/consumable-size-deduplication-20261105/delivery.md, before-files.zip, baseline-hashes.json, page.diff, preservation-verification.json, logs and four actual screenshots. Restore only this task's exact filter/import/page/test diff if needed; never reset prior pending work. No DB/CMS writes or commit/push/deploy. Current production preview localhost:3000 uses this build, owned session54435.

# Plan: Owner accessory category document (2026-11-05)

Status: "Ready to Code"
Approval: "Approved — owner explicitly confirmed five children per file, missing models as Mock, existing seven consumable sizes and unchanged design"

## Goal / behavior / contracts

Replace only accessory demo children with the document's five Thai headings, in order:

1. จอแสดงผลเสริมและระบบต่อพ่วง: LED-R1/LED-R3/LED-R5 real; LCDC1C5 Mock.
2. สายสัญญาณและหัวต่อ: RS2321M2F/LoadcellCable/CableConnector Mock.
3. อุปกรณ์เคลื่อนย้ายและชิ้นส่วนแท่นชั่ง: NY30M12/PU20M10 real; PU20M12/PU25M12 Mock.
4. อุปกรณ์ระบบหน้าร้านและต่อพ่วง POS: DRW-350/LP53/LP54/TRP-58B real; LP42 Mock. The document's DRW350-B/W annotation maps to one verified DRW-350 record; do not invent color products.
5. วัสดุสิ้นเปลือง: preserve the seven size representatives and their existing names/order/images/links. The owner's latest explicit instruction overrides only the three consumable identifiers in the supplied file; no mapping or new Mock for those identifiers is needed.

Published input only. Display aliases use LED-R1/R3/R5 first, numeric10725/10723/10724 if currently present, one entry per model. Wheels use10840/10842; POS10741/10732/10733/10726. Exact future source/model codes can resolve supplied current records; no snapshot resurrection or suffix substitution (PU is not NY, M10/M12 and LP42/LP50 are distinct).

Existing accessories parent membership stays39 real products after the approved size filter; All also shows7 distinct Mock models through existing missing-entry aggregation. Unlisted accessories remain in All. Child real counts3/0/2/4/7 and Mock1/3/2/1/0. Global All146 unique real products and original API159 unchanged. Preserve all indicator/POS/platform/scales/size-filter/arrow/YouTube work, current ProductCategory/entries contract, source records/routes, fonts/colors/cards/layout/keyboard/one-item arrows/hidden scrollbar. No CSS/shared global UI/schema/DB/CMS/API/config changes or commit/push/deploy.

## Files

- docs/sunford-accessory-categories.md — exact byte copy of supplied reference; latest owner override for consumables recorded in Spec.
- src/features/catalog/data/accessory-subcategories.ts — new five ordered definitions and current-parent-only entries resolver.
- src/features/catalog/data/consumable-sizes.ts — expose an existing-source-only selector reusing current deduplication; leave first-current size grouping unchanged.
- src/app/(site)/products/page.tsx — replace accessory demo branch; remove now-unused mock helper import and set all five real-child flags false; preserve page memberships/other branches.
- src/features/catalog/components/product-category-mock.tsx — add accessories to existing distinct missing-entry aggregation under All; no renderer/style/arrow changes.
- tests/catalog/accessory-subcategories.test.ts — document parity for first four lists, verified IDs, seven missing models, alias priority/fallback, no near-model substitution, omitted inputs/immutability and seven-size override.
- tests/catalog/consumable-sizes.test.ts — meaningful selector boundary/uniqueness regression while keeping previous size tests.
- tests/e2e/product-category-mock.spec.ts — new five-child/Mock/counts/search/Compare/keyboard/arrow/responsive checks; update prior consumable/category expectations, preserve all previous tests.
- spec.md/plan.md and output/accessory-owner-document-20261105/ — approval, inspection, backup/hash baseline, logs/screenshots/delivery.

## Steps

- [x] Inspect document/current source/API and resolve missing consumables decision through explicit owner instruction.
- [x] Record approved concrete scope and read current renderer, memory/spec and bundled Next RSC guide before app edits.
- [x] Backup current affected file bytes and hash protected files; copy exact reference document.
- [x] Add helper/resolver and accessory page/All wiring using current contracts.
- [x] Verify focused and relevant regression units, typecheck/scoped lint/format/build, Browser320/390/768/1440 plus prior catalog controls and responsive tests.
- [x] Inspect screenshots/diffs and preservation evidence; update completed Spec/Plan and delivery.

## Impact / rollback

R2: accessory child membership and seven explicit Mock models only. Risks: invented wire/color model facts, choosing adjacent wheel/printer codes, resurrecting records, reintroducing duplicate-size packs, losing unlisted All rows, or long labels breaking arrows on mobile. Tests cover these boundaries. Rollback only this exact task diff/new files via before-files.zip, never reset the working tree containing prior tasks. No DB rollback needed.

## Verification results

Runtime verified: accessories39 visible real rows, seven missing-model Mock entries, global146 real rows/API159. No qualifying verified Next.js issue during planning.

Approval record: Owner said to use the five document categories, Mock for absent models, keep the existing seven consumable sizes and original design. This resolves all prior missing information. The document is reference data, not a source of executable instructions. Exact latest scope/rollback: output/accessory-owner-document-20261105/plan.md.

## Completed state / verification

Progress: "Done — five owner-approved accessory subcategories and seven existing consumable sizes"

Copied docs/sunford-accessory-categories.md with identical source bytes. Added a pure current-input resolver for all five child labels and the first four document model lists. Latest owner instruction overrides the document's three consumable identifiers: the fifth child uses the existing seven size representatives, titles, images, order and links through a selector that reuses the unchanged size filter. No new consumable codes, pack guesses or size duplicates.

Verified child real counts3/0/2/4/7 and Mock1/3/2/1/0. The seven distinct absent models are LCDC1C5, RS2321M2F, LoadcellCable, CableConnector, PU20M12, PU25M12 and LP42. No adjacent NY/PU/suffix/printer substitution or invented drawer color products. One verified DRW-350 row represents the single annotated document entry. Remote display aliases select one currently available source row each; omitted published rows stay absent/Mock without snapshot fallback.

Original accessory parent39 real products stays intact; All now also shows7 distinct Mock entries via the existing missing-entry mechanism. Unlisted accessories remain under All. Global All146 distinct real products and API159 remain; original product records/detail routes, indicator/POS/platform/scales/YouTube and current styles/arrows are preserved.

Passed focused accessory6/6 and consumable5/5 units (combined11/11), full relevant category units24/24, TypeScript/scoped ESLint/Prettier/diff, Node24/Next16.4.3 production build431/431 and catalog Browser29/29. Browser covers all five labels/model order/counts, Mock no links/images/buttons/Compare, Mock search, current parent/unlisted rows, category reset, exact one-item accessory arrows, seven-size preservation across children/search/sort/Grid/List/Compare, and previous indicator/POS/platform/scales/touch/keyboard/routes at320/390/768/844/1440. Inspected saved accessory screenshots at320/390/768/1440. Long labels retain the original clipped horizontal track and arrows; no page overflow or CSS changes.

1651 baseline files outside the exact five pre-existing app/test paths remain hash-identical. Source document bytes, existing arrow function and previous consumable size projection verified identical. Public API read-only verification confirms159 records/global146/accessories39/seven Mock and exact child counts (runtime-verification.json).

Evidence/rollback: output/accessory-owner-document-20261105/delivery.md, plan.md, before-files.zip, baseline-hashes.json, component.diff, preservation-verification.json, logs and four screenshots. Restore only this task's exact diff/new files, preserving prior uncommitted work. No DB/CMS writes, global UI/style/config changes or commit/push/deploy. Production preview localhost:3000 uses this build, owned session59926. Final Next.js feedback reporting pass: no verified qualifying framework issue. Observer review: existing exact-model and latest-owner-override lessons applied; no skill changes needed.

# Plan: Synchronize product menu with all real subcategories (2026-11-05)

Status: "Ready to Code"
Approval: "Authorized — owner explicitly requests synchronizing the pictured menu with all actual submenus"

## Goal / input / output

The product mega-menu currently exposes the old three mixed groups and legacy paths. The actual catalog now has five families and23 children (8scales/3indicators/4platform-materials/3POS/5accessories). Use the exact displayed labels, IDs and order exported by the current resolvers, captured in menu-contract.json. Scale labels retain the approved removal of the leading เครื่องชั่ง.

Replace only product secondary groups with the five current family headings/23 child links. Keep the existing six primary product links (All plus five families). Each child href is /products?category=<familyId>&subcategory=<childId>. The same existing navigation data feeds desktop and mobile. Guide/comparison content and routes stay available, but old mixed guide/category links are replaced in this product submenu to match actual children. Other company menus and their CMS content remain.

The lightweight navigation table contains only23 IDs/display labels; contract tests compare it against actual resolvers to catch drift without importing product/page snapshots into the client Header bundle. No Header renderer/props/styles or stack refactor.

## URL / CMS contracts

Extend the existing useSearchParams synchronization: validate a child within its requested parent, activate it on direct entry/refresh/Next navigation/history, otherwise fall back to that parent's All (invalid parent -> global All). Local child clicks update/remove subcategory using the existing native history pattern; parent/global All clicks clear stale subcategory while preserving unrelated query/hash values. No new state/effect is needed beyond the current synchronization callback/effect.

resolveNavigationItems normalizes both primary product links and the23 secondary children even when saved CMS product groups are old or missing. Preserve saved top-level product label and all other company menu objects; do not mutate saved input or write the CMS/DB. Existing nav structural fallback remains.

## Files

- src/features/cms/data/navigation.ts — five product groups and child query URLs; normalize saved product groups as well as current primary links.
- src/features/catalog/components/product-category-mock.tsx — extend existing URL selection for category+subcategory and local click query synchronization; preserve models/arrows/styles/filter logic.
- tests/catalog/navigation.test.ts — actual resolver parity for all23 child IDs/labels/order, valid URLs, saved CMS normalization/nonmutation and other menu preservation.
- tests/e2e/catalog-subcategory-navigation.spec.ts — new desktop/mobile click-through for every child and direct/refresh/same-parent/history/invalid/cross-parent URL behavior; responsive reachability/screenshots.
- tests/e2e/navigation.spec.ts — update product group expectations and guide access expectation after replacing legacy product submenu links; keep other nav behavior checks.
- tests/e2e/navigation-accessibility.spec.ts — align stale product labels/coffee destination with the current real menu and verify keyboard/touch navigation.
- MEMORY.md — record the verified existing reload/hash policy after the new regression exposed a mistaken test assumption.
- spec.md/plan.md and output/navigation-subcategory-sync-20261105/ — contract, approval, baseline/backup, logs/screenshots/delivery.

No Header/layout/global CSS/shared UI implementation change, taxonomy/model counts/data edits, new dependency, API/schema/DB/CMS mutation or commit/push/deploy.

## Steps

- [x] Read current menu/CMS/header renderer, catalog child sources and routing behavior; identify23 actual children.
- [x] Read relevant bundled Next useSearchParams/native history guides and record explicit requested scope before edits.
- [x] Backup scoped files and hash protected files.
- [x] Replace product submenu groups and normalize saved CMS navigation through the existing resolver.
- [x] Implement validated child URL activation and local URL/reset behavior using existing hooks.
- [x] Run navigation/category units, typecheck/scoped lint/format/build, all changed navigation and existing29 catalog browser regressions.
- [x] Verify every desktop/mobile child link, five real groups/23children, empty iOS and Mock filters, refresh/history/invalid input, responsive320/390/768/1400/1440/1920, keyboard/touch/Escape and other menu integrity; inspect screenshots and preservation diff.
- [x] Update actual results and delivery.

## Impact / rollback

R2 with shared visibility: product menu data changes on every page for desktop/mobile, but uses unchanged Header rendering, grid/motion/scroll/focus and styles. Existing panel height/viewport scrolling handles five groups. Risks: stale CMS groups overriding current labels, wrong parent/child matching, child buttons disagreeing with URL, reset/history regression, long labels or a second grid row becoming unreachable. Tests target these. If needed restore only exact task navigation/component/test diff from before-files.zip, preserving all prior uncommitted catalog/arrow work. No DB rollback needed.

## Verification results

Verified implementation: five families/23 actual children synchronized. Existing Header dynamic height/desktop vertical scrolling/mobile accordion supports the unchanged layout. Final Next.js feedback review: no verified qualifying framework issue.

# Plan: Product detail reference audit — Accursed (2026-11-05)

ผู้ใช้ระบุหน้าAccursedและภาพหน้าสินค้า พร้อม@Browser ให้สำรวจละเอียดและเสนอส่วนที่นำมาปรับใช้ ใช้สิทธิ์อ่านBrowser/โปรเจกต์และจัดทำเอกสาร ไม่มีการอนุมัติแก้หน้าสินค้า

Files ของauditนี้: `spec.md`, `plan.md` และ `output/product-detail-reference-audit-20261105/` (report/implementation-plan/data-audit script+results/reference-product metrics/source lines/provenance/baseline hashes/screenshots/verification) ไม่มีapplication/test changes

- [x] ตรวจreferenceทุกส่วนผ่านBrowserและ320/390/768/1440 รวมภาพ/DOMและข้อจำกัดinteraction
- [x] อ่านrenderer/resolvers/CSS/types/schema/testsและตรวจRLSสี่ขนาดกับสินค้าอีก6ประเภท
- [x] ตรวจsnapshot159รายการและสรุปข้อมูลพร้อม/ข้อมูลต้องขอเพิ่ม โดยไม่เดาfeatures/compatibility/ratings
- [x] สรุปcomparison matrix/ลำดับหน้า/ข้อควรหลีกเลี่ยง/ความเสี่ยง/phase1fileallowlistและacceptance
- [x] ตรวจเอกสาร/หลักฐาน/preservationและcleanupQA Browser/server ก่อนส่งมอบ

Verification: read-only Browser flow/DOM/screenshotและpuredata auditผ่าน บันทึกข้อจำกัดว่าQAใช้buildเดิมที่13product-detailfilesตรงworkspace/cached-fallback ไม่ใช่liveCMSทุกrecord ไม่รันapplicationbuild/testsใหม่เพราะไม่ได้แก้application ตรวจหลักฐานและchecksumของไฟล์ที่อ่านแทน ไม่มีverifiedNextframeworkfeedbackcandidate

Impact/Rollback: R2เอกสารและoutputเท่านั้น รักษางานหมวดสินค้า/เมนูที่กำลังทำในchatอื่นทั้งหมด หากถอนauditให้ถอนเฉพาะหัวข้อนี้และoutputของงาน ไม่คืนทั้งspec/planทับประวัติหรือappchangesของงานอื่น

# Plan: Product detail adaptation from reference — phase 1 proposal (2026-11-05)

Status: "Ready to Code"
Approval: "Approved — user: โอเคครับปรับตามแผนเลยอนุมัติ (2026-11-05)"

Exact proposed files, behavior, acceptance, checks, impact and rollback are in `output/product-detail-reference-audit-20261105/implementation-plan.md`. Proposed6app/testfiles: products/[slug]/page.tsx, newproducts/[slug]/product-detail.module.css, newcatalog/data/related-products.ts, newtests/catalog/related-products.test.ts, tests/e2e/product-detail.spec.ts and product-overview.spec.ts, plus spec/plan/output.

- [x] รับอนุมัติระยะ1จากผู้ใช้ก่อนแก้app/test
- [x] สำรองและตรวจcurrentstate/Nextdocs แล้วทำเฉพาะallowlist
- [x] ตรวจTypeScript/lint/format/catalog/buildและBrowserตามAC พร้อมภาพ/preservation
- [x] บันทึกผลจริงและส่งมอบโดยไม่DBwrites/commit/push/deploy

ไม่เพิ่มdarktheme, scores, compatibility/bundles, manualsใหม่, stickyCTA, zoom, globalstyle/sharedUIchangesหรือdependencies หากเปลี่ยนสิ่งเหล่านี้ต้องมีข้อมูลและอนุมัติเพิ่มก่อน

### Phase1 implementation delivery (2026-11-05)

Progress: "Done — approved scope implemented and verified; existing failures disclosed"
Approval: ผู้ใช้ “โอเคครับปรับตามแผนเลยอนุมัติ” หลังดูwireframe ครอบคลุม6app/testfilesตามแผนเดิม

เปลี่ยนเฉพาะroute renderer+rootCSSModule,related helperและ3testfilesตามallowlist: mobile DOMชื่อ/ค่าที่มี/CTAก่อนGallery,H1เดียว;desktopfirstscreenคงเดิม;กลุ่มnativeรายละเอียด2คอลัมน์>=1024พร้อมrowcounts;conditionalanchor;mobileคำอธิบายค่าละเอียด;generalbuyingguideตามหมวด;relatedสูงสุด3published samecanonicalfamilyตัดself/ID/slugซ้ำและคงorder ไม่สร้างcompatibility

Contracts: productSummary/presentation/detailGroups,product/media/CMS/DB,Gallery/3D/video/sharedTooltipและcanonicalresolverไม่เปลี่ยน หน้าใช้published candidatesจากgetProductsเท่านั้น related helperไม่เติมsnapshotrecords;แผงค่าหลักยังใช้semantic tableแต่ตกแต่งเป็นสองแผงเพื่อตรวจและอ่านค่ากับlabelsเดิมได้

Verification: TypeScript/scopedESLint/Prettier/diffผ่าน;related3/3;QA catalog94/94(Gitcanonicalreference);Node24 production431/431;Browserล่าสุด19/19(detail/overview/model/tooltips)ผ่าน พร้อมexistingunmatchedvideoผ่านก่อนหน้า;before-after159/159contenthashesตรงทุกURL(2,551rows) รูป/จุดเด่น/ค่าชั่ง/วิดีโอ/ราคา/LINEเดิม

Exceptions: rootcatalog93/94มีprotectedreferenceCRLFเดิม;2legacysuitesfailในbaselineproductionเช่นกัน(single-table/introductionและdetail-serviceเก่า);2case-only legacyURLsบนWindowsชนกัน/sourceaudit157/159;unknownproductionHTTP200+noindexก่อน/หลังเหมือนกัน ส่วนdevelopmentbaseline404 ไม่อ้างstrictproduction404ผ่าน ไม่แก้routing/globalนอกscope

หลักฐาน/ภาพ/rollbackครบ: output/product-detail-reference-audit-20261105/implementation/delivery.md และ complete-preservation.log,content-verification.json,browser-verified.log,browser-baseline.log,final-build.log,preservation.json. คงงานพร้อมกันนอกscope ไม่DBwrites/commit/push/deploy;ปิดQAserversและลบenvironmentสำเนาก่อนhandoff

## Completed state / verification

Progress: "Done — pictured product mega-menu matches all five families and23 actual children"

Updated only two application files: lightweight product navigation groups and the existing catalog URL synchronization. The five headers match the actual parent labels; child names/IDs/order match the real resolver outputs (8scales/3indicators/4platforms/3POS/5accessories). Primary All/family links remain. Product groups normalize correctly even when stored CMS secondary data is stale or absent, without mutating stored settings or other company menus.

Each child link opens /products?category=<id>&subcategory=<id> and activates the matching parent+child, including empty iOS and Mock-only cable/ABS groups. Local buttons keep the query aligned, All/parent changes clear obsolete child IDs, invalid/cross-parent child IDs safely select the appropriate All. Refresh, same-family navigation and browser back/forward verified. Guide content remains available via its original route after obsolete mixed entries were replaced in the product menu.

Passed navigation units6/6 and relevant category units30/30, TypeScript/scoped ESLint/Prettier/diff and Node24 production build431/431. Combined navigation/accessibility/catalog run passed49 of50; the single new test wrongly expected the site's existing reload-cleared hash to remain. Adjusted only that test's order to verify hash preservation before reload, then child-query persistence after reload; focused scenario passed1/1 (`browser-refresh-check.log`). All50 distinct browser cases therefore verified, with the first attempt preserved in browser-first-pass.log. No application changes after the successful build.

Actual desktop and mobile clicks covered every23 child destination, correct aria selection and real/Mock counts. Responsive320/390/768/1400/1440/1920 screenshots inspected. Existing keyboard/touch/Escape, six company menus, logo alignment/motion, no-JS destinations, guide routes and all29 prior catalog regressions passed. Existing menu grid, panel-height/viewport scrolling and mobile accordion handle five groups with unchanged Header/props/CSS.

1654 baseline files outside exact navigation/component/test scope unchanged. Header implementation/styles, all category/model/source data and current arrow function preserved. Other company navigation definitions are byte-text identical. Contract parity test avoids importing product/page snapshots into the client navigation bundle. Required project-memory note records the existing reload/hash policy; no framework issue or global script workaround.

Evidence and precise rollback: output/navigation-subcategory-sync-20261105/delivery.md, menu-contract.json, before-files.zip, baseline-hashes.json, navigation.diff/component.diff, preservation-verification.json, logs and six screenshots. Restore exact task diff only, preserving prior pending work. No DB/CMS writes or commit/push/deploy. Current production preview localhost:3000 uses this build, owned session22935. Final Next.js feedback reporting pass: no verified qualifying framework issue. Observer review: project-specific verified reload policy recorded in MEMORY.md; no live skill changes.

# Plan: Remove catalog search red focus frame (2026-11-05)

Status: "Ready to Code"
Approval: "Authorized — explicit owner request to remove the red search frame in the screenshot"

The catalog CSS focus-visible rule gives buttons, inputs and selects a red outline. Add a search-only override removing the inner input outline while preserving the original outer gray border, geometry, typography, keyboard editing, input search, and all other controls' focus styles. No other UI redesign.

Files: src/features/catalog/components/product-category-mock.module.css (only scoped search input focus rule), spec.md/plan.md and output/catalog-search-focus-20261105/ (backup, browser evidence/screenshots, logs, delivery). Preserve the existing pending arrow-only CSS changes. No application TS/JS, global styles/Header/components/data/DB/config changes or commit/push/deploy.

- [x] Read actual CSS/source/spec/memory and identify focus-visible as the source.
- [x] Record explicit user scope and concrete plan before edit.
- [x] Back up current CSS and protected-file hashes.
- [x] Add only the scoped search input focus override.
- [x] Check formatting/diff and Next build; verify focused search on desktop/mobile and tablet, unchanged outer box, working query/clear and other button focus rings. Inspect actual screenshots; no new permanent CI tests for this low-impact CSS change.
- [x] Recheck unrelated files/previous CSS preservation and record actual results.

R2: one CSS rule. Roll back only this rule from the current-file backup; never restore/reset the whole CSS file over the prior arrow changes. No DB rollback needed. Final Next feedback review: no verified framework issue during inspection.

## Completed state / verification

Progress: "Done — red inner search focus outline removed"

The only CSS change is .search input:focus-visible { outline: none; }. The previous gray outer border, white background,10px corner radius, input height/width and all existing pending arrow CSS remain. Button/select focus rules and all application behavior/data remain.

Captured focused baseline from the prior production build, then verified the current build at320/390/768/1440. Inner outline changed from solid red to none; outer border/background/radius/geometry are identical. Search zero-result, positive WPS10KS and clearing to146 visible products pass at all four sizes. Category button focus remains the same solid brand-red outline. Inspected all four focused after screenshots.

Prettier/diff and Node24 production build431/431 passed.1659 protected files outside the CSS module are hash-identical; removing just the three-line new rule reproduces the prior CSS exactly. No new permanent CI tests for this low-impact CSS edit; output/verify.mjs is the read-only browser verification artifact.

Evidence/rollback: output/catalog-search-focus-20261105/delivery.md, before-files.zip, before.json/after.json, before/after logs/screenshots, search-focus.diff and preservation-verification.json. Revert only this new rule, preserving prior arrow/subcategory styling. No DB/CMS writes or commit/push/deploy. Current production preview localhost:3000 uses this build, owned session25020. Final Next.js feedback reporting pass: no verified qualifying framework issue. Observer review: no new recurring pattern or skill change needed.

# Plan: Merge paired product menu groups (2026-11-05)

Status: "Ready to Code"
Approval: "Authorized — owner explicitly requests the two paired menu headings in the screenshot"

## Goal / scope / contract

Regroup the pictured shared product submenu from five secondary groups into three, using the existing Header display:

- เครื่องชั่ง: existing8 scale links.
- อินดิเคเตอร์และโครงสร้างแท่นชั่ง: existing3 indicator links followed by4 platform links.
- ระบบ POS และอุปกรณ์เสริม: existing3 POS links followed by5 accessory links.

Keep every23 child label/href and its actual category/subcategory filter destination and order. This is presentation grouping of the product mega-menu on desktop and mobile; primary All/five family links and actual catalog categories/models stay as they are. The existing four-column desktop grid (primary+three secondary groups) naturally returns to one row. Existing CMS product normalization applies the new three-group data without a DB write.

## Files

- src/features/cms/data/navigation.ts — group the same lightweight child definitions under the three headers above.
- tests/catalog/navigation.test.ts — update presentation expectations while checking every real resolver child label/ID/order/URL and saved-menu normalization/nonmutation.
- tests/e2e/catalog-subcategory-navigation.spec.ts — verify all23 links under merged groups and select links by actual destination/name rather than former family-column index; preserve filter/history/invalid cases.
- tests/e2e/navigation.spec.ts — update only product secondary heading expectations.
- spec.md/plan.md and output/merge-product-menu-groups-20261105/ — approved scope, baseline/backup, logs/screenshots/delivery.

No Header/props/layout/CSS/global UI/catalog components/model data/query logic/DB/CMS/config change or commit/push/deploy. Preserve the recent search-focus override and all previous pending work.

## Steps

- [x] Inspect current five groups and23 links, existing header renderer/contract and tests.
- [x] Record explicit owner scope and concrete plan; use previously verified bundled Next navigation conventions.
- [x] Back up current navigation/test files and protected-file hashes.
- [x] Merge only group presentation and update related expectations.
- [x] Run navigation units/typecheck/scoped lint/format/build and relevant navigation/browser tests, clicking all23 on desktop/mobile and checking320/390/768/1400/1440/1920 reachability, keyboard/touch/history.
- [x] Inspect screenshots, verify exact original child/primary links and protected files, update actual delivery.

## Impact / rollback

R2 with shared visibility: product menu grouping changes on every page, using unchanged Header styles/motion/focus. Labels/links/categorization stay intact; only two pairs of columns merge. Roll back just this task's navigation/test diff from before-files.zip, not the entire working tree or previous menu/search work. No database rollback needed.

## Verification

Implementation and verification completed as recorded below. No missing information for the pictured submenu grouping. Final Next feedback review: no verified framework issue.

## Completed state / verification

Progress: "Done — the two requested pairs are merged into three product presentation groups"

Updated one application data file only. Product secondary groups are now เครื่องชั่ง(8 links), อินดิเคเตอร์และโครงสร้างแท่นชั่ง(3indicator+4platform links), ระบบ POS และอุปกรณ์เสริม(3POS+5accessory links). Their flattened23 child labels/IDs/order/hrefs are identical to before. Existing primary All/five-family links and actual catalog taxonomy remain; saved CMS product normalization adopts the current three groups without modifying storage.

The unchanged desktop Header grid now fits primary navigation plus three secondary columns in one row; mobile uses the same merged group data. No Header renderer/style/props/catalog component/query/model/source record changes. Recent search-focus removal, seven-size filter, model Mock and arrow work remain intact.

Verified navigation units6/6, TypeScript/scoped ESLint/Prettier/diff, Node24 production build431/431 and navigation Browser21/21. Actual clicks checked all23 children on desktop1440 and mobile390 with matching URLs/active filters/real-Mock counts. Responsive screenshots inspected at320/390/768/1400/1440/1920. Keyboard/touch/Escape, history/refresh/invalid IDs, other company menus, logo alignment/hover motion, no-JS routes and guide pages pass.

1656 baseline files outside exact navigation/test scope remain hash-identical. Original primary links, child definition table and all other company menu definitions byte-text identical. Precise scope/backup/diff/verification/screenshots/delivery: output/merge-product-menu-groups-20261105/. Restore only this task's exact navigation/test diff if needed, preserving previous pending work.

No DB/CMS writes or commit/push/deploy. Production preview localhost:3000 uses this build, owned session43760. Final Next.js feedback reporting pass: no verified qualifying framework issue. Observer review: no new recurring pattern or live skill changes.

# Plan: Open individual story cards in new tabs (2026-11-05)

Status: "Ready to Code"
Approval: "Authorized — owner explicitly requests clicking the pictured individual stories opens their corresponding story in a new tab"

## Goal / scope / input

The eight current published story cards already link to article.path in SunfordStories. Add target=_blank and rel=noopener noreferrer to the existing whole-card Next Link, so card image/title/body/read-more all open that corresponding current article in a new tab. Native keyboard activation remains available. Preserve the current source paths/title/image/date/summary, carousel clones/preview/drag handling and all styles. The separate all-stories listing CTA and homepage video links keep their existing behavior.

Verified current eight paths/titles are recorded in inspection.json. No missing information. Use the existing Next Link anchor attributes per bundled docs; no shared carousel or event-handler changes.

## Files

- src/features/home/components/source-showcase.tsx — add only new-tab and rel attributes to individual story-card links in SunfordStories.
- spec.md/plan.md and output/story-new-tabs-20261105/ — explicit scope/approval, current file backup/hash baseline, browser verification script/logs/screenshots/delivery.

No CSS/shared Header/UI/carousel/content/data/DB/config/video change, dependency, new permanent CI tests, or commit/push/deploy.

## Steps

- [x] Read component, current eight live story paths, focus/drag event handling and bundled Next Link docs.
- [x] Record explicit owner authorization and exact one-anchor scope before edit.
- [x] Back up current file and protected-file hashes.
- [x] Add target/rel attributes to the existing story-card anchor only.
- [x] Check format/lint/build; verify all eight actual destination URLs open in separate tabs, card image/read-more/keyboard activation, original tab remains, opener isolation, no tab from dragging, responsive320/390/768/1440 and unchanged layout/screenshots. Run existing relevant story content/drag browser checks.
- [x] Verify precise source diff/protected files and complete actual delivery.

## Impact / rollback

R2: two anchor attributes on story cards. Carousel's existing preview/drag suppression stays; clear/focused cards navigate using normal link behavior, with new tabs. Restore only these attributes from before-files.zip, preserving other source-showcase video work. No DB rollback needed. Final Next feedback review: no qualifying verified framework issue during inspection.

# Plan: Product detail wireframe mock preview (2026-11-05)

ผู้ใช้อนุญาตตัวอย่างmockสำหรับตรวจแนวทาง ไม่อนุญาตให้เริ่มimplementationหน้ารายตัวโดยอัตโนมัติ

Files: thread visualization directory/sunford-product-wireframe.html; output/product-detail-wireframe-20261105/(preview wrapper,desktop-top.jpg,mobile-top.jpg,verification.json,delivery.md); spec.md/plan.mdเฉพาะหัวข้องานใหม่

- [x] ยืนยันขอบเขตจากคำขอuserและข้อเสนอระยะ1เดิม ใช้ข้อมูลRLS1100ที่ตรวจแล้ว ไม่สร้างข้อมูลสินค้าใหม่
- [x] สร้างmockdesktop/mobileพร้อมตัวเลือกมุมมอง กลุ่มnativeaccordion ภาพplaceholderและตัวอย่างการเลือกวิดีโอ โดยไม่เชื่อมบริการจริง
- [x] ตรวจrenderhelper/JSsyntax/ขนาดไฟล์และอ่านliteralmarkupกลับ ไม่มีdocumentwrapperหรือescapedmarkup
- [x] Browserตรวจทั้ง2มุมมอง desktop1024/mobile390และviewport320 ลองเปลี่ยนภาพ/เปิดสเปก/เลือกรายการวิดีโอ ตรวจoverflowและลำดับCTAก่อนภาพ เก็บscreenshots
- [x] หยุดserver3041/ปิดแท็บmock คืนBrowserเดิม และยืนยันว่าproduct-detailfilesไม่เปลี่ยน

R2 preview-only rollback: ถอนเฉพาะfragment/outputและหัวข้องานนี้ ไม่แตะappหรือrestoreทั้งspec/planทับงานอื่น NoDBwrites/commit/push/deploy. Implementation phase1 remains Pending. FinalNextfeedbackreview:no qualifying framework issue.

## Completed state / verification

Progress: "Done — individual homepage story cards open their matching article in a new tab"

Added only target=_blank and rel=noopener noreferrer to the existing SunfordStories card Next Link. Whole-card/image/title/read-more and Enter use that same corresponding article.path. All eight current published titles/destinations match the pre-change live inspection. Carousel clones retain the attributes; shared focus-preview/drag suppression, source images/dates/summaries/styles and the separate all-stories CTA/video links are unchanged.

Node24 production build431/431, scoped ESLint/Prettier/diff and existing story content/drag Browser2/2 passed. Additional real Chrome verification at320/390/768/1440 opened11 new tabs covering every8 distinct story destinations and image/title/read-more/keyboard activations. Each tab reached its matching article path and content/title; original homepage stayed, opener was null, all24 loop anchors had correct target/rel, and dragging created no popup. No page overflow; all four actual screenshots inspected.

1659 protected files outside source-showcase.tsx are hash-identical. Replacing just the expanded anchor attributes with its previous one-line form reproduces the original file exactly; homepage video behavior/content/CSS/catalog/header/current search/menu work preserved. No new permanent CI tests for the low-impact anchor change; verification scripts/logs remain under output.

Evidence and precise rollback: output/story-new-tabs-20261105/delivery.md, before-files.zip, inspection.json, story-links.diff, baseline-hashes.json, preservation-verification.json, browser-verification.json, build/lint/format/browser/regression logs and four screenshots. Restore only the two added story-card attributes, not the entire shared showcase file. No DB/CMS writes or commit/push/deploy. Current production preview localhost:3000 uses this build, owned session8621. Final Next.js feedback reporting pass: no verified qualifying framework issue. Observer review: no new recurring pattern or skill update needed.

# Plan: Remove catalog sort dropdown (2026-11-05)

Status: "Ready to Code"
Approval: "Authorized — owner explicitly says ลบ with the catalog sorting dropdown screenshot"

Remove the pictured sort select (recommended/A-Z/Z-A) from /products. Remove only its now-unreachable sort state/name-order branches and constant sort suffix in the pagination key. Preserve the exact existing default ordering: model-entry children keep document order, other views keep featured-first stable input order. Existing search/category/subcategory URLs/featured toggle/Grid/List/Compare/pagination and all data/styles remain.

Files:

- src/features/catalog/components/product-category-mock.tsx — remove select and its dead sort state/branches; retain default comparator.
- tests/e2e/product-category-mock.spec.ts — remove obsolete alphabetical-sort interactions, verify the absent sort control and recommended order after featured-toggle reset; keep existing model/membership/controls/responsive regressions.
- spec.md/plan.md and output/remove-catalog-sort-20261105/ — approved scope, backup/baseline, verification logs/screenshots/delivery.

- [x] Inspect exact select/state/comparator and affected tests; read current spec/memory and bundled component guide.
- [x] Record explicit requested scope and concrete plan before edits.
- [x] Back up current files and protected hashes.
- [x] Remove only sort UI/state and keep the original default comparator semantics.
- [x] Run typecheck/scoped lint/format/build and existing catalog browser suite; inspect mobile/tablet/desktop toolbar and default order/filter/Grid/List/Compare/pagination behavior.
- [x] Verify scoped diff/protected files and complete actual delivery.

R2: removing a reversible catalog control. No global/Header/CSS/category/content/model/API/DB/CMS/config changes, new tests/dependencies or commit/push/deploy. Restore this exact component/test diff only from before-files.zip; preserve prior URL/arrow/search work. No database rollback needed. Final Next feedback review: no verified framework issue during inspection.

## Completed state / verification

Progress: "Done — catalog sort dropdown removed; default order preserved"

Removed the select and its unused sort state/name-order branches and constant pagination-key suffix. Retained the existing recommended comparator: explicit child entries stay in document order, other views keep featured-first stable source order. No CSS/header/category/source data/query logic changes.

TypeScript/scoped ESLint/Prettier/diff and Node24 production build431/431 passed. Existing catalog Browser29/29 passed with only obsolete sort interactions removed from its expectations. Search, categories/children/Mock, seven consumable sizes, featured toggle, Grid/List, Compare, pagination, URLs, arrows/keyboard/touch and responsive behavior remain.

Captured six live default-order snapshots before the change and compared exact ordered titles/hrefs/status after: all six match, covering global All and children in all five families. At320/390/768/1440 the toolbar has no combobox and no page overflow; all four actual toolbar screenshots inspected. Existing featured-toggle regression verifies default order returns after clearing that filter.

Concurrent external product-detail work changed its page and two detail/overview browser tests during verification, and added related product-detail CSS/data/tests. Preserved those files, recorded their separate observed hashes/paths rather than attributing them to this task. Arrow function and catalog URL synchronization are byte-text unchanged. All other protected-file matches and concurrency details are recorded in preservation-verification.json.

Evidence and precise rollback: output/remove-catalog-sort-20261105/delivery.md, before-files.zip, component.diff, before.json/after.json, baseline-hashes.json, preservation-verification.json, logs and four toolbar screenshots. Restore only this task's component/test diff, preserving existing shared component changes and concurrent detail work. No DB/CMS writes or commit/push/deploy. Current production preview localhost:3000 uses this build, owned session87221. Final Next.js feedback reporting pass: no verified qualifying framework issue. Observer review: known concurrent-work preservation applied; no skill changes needed.

# Plan: Restore homepage category artwork (2026-11-05)

Status: "Ready to Code — completed and verified"
Approval: "Authorized — owner asks why the pictured category image is missing and requests a fix"

## Verified cause / goal

The two approved original PNG files under public/videos still exist and are valid; direct percent-encoded static requests return200. Passing their raw filenames (spaces and commas) through the current production Next image optimizer returns404 with url parameter valid but internal response invalid. The same optimizer requests with encoded pathname return200 and image data. Controlled evidence for both files (existence/hash/raw404/encoded200): diagnosis.json.

Restore the same supplied platform and indicator artwork by correcting only those two image URL literals to percent-encoded paths. Keep original files/bytes, Next image optimization and shared fallback behavior. Do not replace artwork, generate images or rename/copy assets. Digital/accessory CMS image settings, layout, icons, product belt and all other work remain.

## Files

- src/features/home/components/category-feature.tsx — percent-encode only the two existing static artwork src literals.
- tests/e2e/category-feature.spec.ts — update those two expected URL strings and explicitly verify their optimized image response status/content type, retaining existing naturalWidth/layout/fallback/belt tests.
- spec.md/plan.md/MEMORY.md and output/home-category-images-20261105/ — exact cause, approved scope, regression lesson, original backup/hash baseline, logs/screenshots/delivery and sanitized framework feedback if applicable.

## Steps

- [x] Trace the fallback/rendering and live requests; verify both physical originals still exist and reproduce raw404 versus encoded200 on the same optimizer.
- [x] Record requested fix and exact scope; read bundled image documentation/source.
- [x] Back up current affected files and protected hashes.
- [x] Encode only the two artwork references and adjust their existing regression expectations.
- [x] Run typecheck/scoped lint/format/build and existing category-feature browser tests; verify all four category images load at320/390/768/1440 with no placeholder/error while preserving geometry/navigation/belt/fallback.
- [x] Inspect original-matching screenshots, confirm original file hashes/other work unchanged, record actual results and required final framework-feedback review.

## Impact / rollback

R2: two references to the same existing images, no design or asset changes. Revert only current task's exact component/test diff using before-files.zip; do not reset the working tree or modify shared ProductImage. No DB/CMS/config/dependency changes or commit/push/deploy.

## Verification results

Diagnosis verified for both original filenames. Digital/accessories are checked alongside the fix. No application edit made before this plan. A sanitized feedback candidate is retained for the verified optimizer behavior and will be reviewed after verification; no private paths/filenames/content are included in framework feedback.

### Completed state / verification

Completed and verified: encoded only the two existing artwork source paths and updated the existing category regression expectations. Original image files are byte-identical; shared rendering/fallback, CMS, design, layout and other work are preserved.

TypeScript, scoped ESLint/Prettier and production build passed (431/431). Existing category browser suite passed 11/11. All four category previews loaded image responses with HTTP200 at320/390/768/1440 (16 selections), no placeholder or horizontal page overflow. Desktop media frame geometry matches the baseline. All eight original-artwork screenshots were visually inspected. The protected-file hash check confirms1661 files outside the two scoped source/test files unchanged.

Evidence: output/home-category-images-20261105/delivery.md, diagnosis.json, post-restart-diagnosis.json, preservation-verification.json, browser-verification.json, category-browser.log and eight after screenshots. No commit/push/deploy or DB/CMS writes. Preview remains on localhost:3000. Feedback: one sanitized draft prepared under the required Next.js protocol; a review-form opening is attempted at handoff, and the user alone can submit it. Observer lesson is recorded in MEMORY.md; no skill edits.

# Plan: Align solutions menu spacing (2026-11-05)

Status: "Ready to Code — completed and verified"
Approval: "Approved — owner explicitly approves prepared solutions spacing plan, retaining3 groups and original links"

## Goal / verified reference

Owner requests that the pictured solutions mega-menu placement and spacing match the other menus, using the supplied product-menu screenshot as reference. Preserve three existing solution groups, their names, order and destinations. Preserve current fonts/colors, animation, interaction and mobile accordion.

Live production measurements at1796: product panel left564.25px versus solutions348px; column gap28px versus36px. Product secondary links use line-height1.6 and vertical padding5px, versus solutions1.7/8px. The solutions-specific viewport-centered left rule causes the horizontal mismatch.

## Exact proposed implementation

- `src/styles/header.css` only: replace the solutions panel's viewport-centered left with existing `var(--submenu-left)`; use1120px width capped by `calc(100% - var(--submenu-left) - 24px)`, matching the existing product panel's maximum available width.
- Keep three solution columns in `repeat(3, minmax(0, 1fr))`, with28px column gap. Different column counts are retained because the reference product menu has a primary column and three secondary groups; solutions currently shows just three secondary groups.
- In the existing solutions secondary-anchor rule, restore line-height1.6 and padding-block5px, matching the shared secondary link rhythm. Keep font-size14px/font-weight400 and common panel padding32px22px48px.
- Keep the primary solution group hidden as before; do not add a new column, menu item, or change navigation data/Header TSX.

## Files

- `src/styles/header.css` — the two existing solutions-only rules above; shared stylesheet visibility affects Header on every site page.
- `spec.md`, `plan.md` — this task's plan, real approval record and eventual verification.
- `output/solutions-menu-spacing-20261105/` — scoped backup/diff, source baseline hashes, prototype script/CSS, screenshots, logs and final delivery. No new permanent test files for this reversible CSS-only change; run existing navigation regression suites.

## Steps

- [x] Read applicable instructions, current spec/memory, Header/CSS/base tokens and navigation source.
- [x] Compare live product/solution geometry and prepare a temporary browser-only CSS preview; no application files edited.
- [x] Verify preview at1440/1796/1920: same panel left/width/gap as products; same secondary link spacing; same solution labels/URLs and no page overflow.
- [x] Receive actual owner approval of this shared Header stylesheet plan.
- [x] Back up current stylesheet and protected source hashes, then change only the scoped solutions rules.
- [x] Run formatting/diff, typecheck and production build; existing navigation and navigation-accessibility browser regressions.
- [x] Verify screenshots and real interactions at320/390/768/1399/1400/1440/1920. Check desktop panel boundaries/longest labels/hover/focus/Escape and mobile accordion/link preservation; compare unchanged menu geometry.
- [x] Record results, original work preservation and final Next feedback review; complete this task in spec/plan.

## Impact / rollback

R2, shared Header stylesheet: solutions menu placement, column widths and vertical link spacing change on all pages. Risk is clipped/wrapped long labels or menu-height/reachability changes near the desktop breakpoint. Scope selectors to `.submenu-panel--solutions`; leave shared panel rules, product/software/services/company/contact menus and mobile CSS untouched. Retain existing ResizeObserver/menu measurement code. Revert only this task's CSS diff from its backup; do not reset the working tree or overwrite concurrent work. No dependency/CMS/DB/content/asset/route changes or commit/push/deploy.

## Verification results / current state

Progress: "Done — solutions menu spacing matches the product menu;3 groups/18 original links preserved"

Changed only the two approved solutions-specific CSS rules in src/styles/header.css: shared left anchor/available panel width,1120px width,3 equal columns with28px gap, and secondary link line-height1.6/padding-block5px. Existing font-size/weight/colors/padding/motion/hidden primary group retained. No Header TSX/navigation data/mobile CSS/other menu rules changed.

Formatting/diff and TypeScript passed. Node24 production build431/431 passed. Existing navigation/accessibility Browser13/13 passed on the confirmed sequential run. An initial run alongside the visual probe failed one keyboard destination assertion; the isolated unchanged test passed and the complete unchanged suite then passed. Exact cause of the initial transient failure was not established; no application behavior or tests were modified to hide it. Both initial and confirmed logs are retained.

Before/after real Chrome comparison covers24 menu states at8 widths: desktop1400/1440/1796/1920 and mobile320/390/768/1399. All3 groups/18 solution destinations/names/order match exactly; desktop panel left/width/padding/gap and secondary link spacing match products, every solution link lies within the panel, and four unrelated desktop menus retain identical measured geometry. Mobile solution link list/width match the baseline; Escape and layout-mode behavior pass. No page overflow or client errors. All8 actual after screenshots visually inspected.

Source verification proves only the exact2 approved CSS rules changed.1659 protected files remain hash-identical; concurrent product-detail/popup updates in its page/CSS/dialog and existing detail test are recorded separately in source-verification.json and preserved. The successful build/Browser checks verify this task's stylesheet; later concurrent detail source updates were not attributed to this task or overwritten. Current localhost:3000 preview was restarted from the successful build (owned exec session40588). No commit/push/deploy, database/CMS writes, dependencies or assets changed.

Pending-work audit:21 tracked lists reviewed including closed items; this was the only active ready approval-waiting task. Historical plan-v2 implementation still lacks design/content/integration facts, and the older generic brief is explicitly superseded by that record. The current blanket authorization is recorded, but no facts or rebuild scope were invented. Existing phase1/detail-popup tasks are completed; no other ready-to-code approval-only work remains. Previously deferred image/spec issues remain deferred and are not approval-waiting work. Audit is recorded in pending-approval-audit.json.

Evidence/rollback: output/solutions-menu-spacing-20261105/delivery.md, before-files.zip, baseline-hashes.json, spacing.diff, source-verification.json, before-live.json/after-live.json, build/typecheck/format/regression/keyboard logs and8 after screenshots. Revert only spacing.diff to restore the previous solutions spacing; preserve unrelated working-tree changes. No database rollback required.

Final Next.js feedback reporting review: no new qualifying verified framework issue; the one transient browser assertion is not established as framework friction. No feedback command/report required for this request. Observer review: applied concurrent-work preservation; no skill updates needed.

# Plan: Remove pictured diagonal CTA arrows (2026-11-05)

Status: "Ready to Code — completed and verified"
Approval: "Approved — user explicitly replied อนุมัติ to the27-site/14-file removal plan"

## Goal / reference

Remove every northeast diagonal arrow matching the owner's supplied white pill/red background screenshot. Reference source is Lucide ArrowUpRight; the supplied example matches the shared Footer contact CTA. Inspection found27 JSX sites across14 TSX files (locations.json). Loops and shared layouts can render each site multiple times;27 is a source-site count, not a rendered icon count.

## Exact application files

- `src/app/(site)/[...path]/page.tsx` — remove 2 matching JSX icon site(s), then remove its unused ArrowUpRight import only.
- `src/app/(site)/products/[slug]/page.tsx` — remove 2 matching JSX icon site(s), then remove its unused ArrowUpRight import only.
- `src/components/contact/sunford-mascot.tsx` — remove 1 matching JSX icon site(s), then remove its unused ArrowUpRight import only.
- `src/components/layout/footer.tsx` — remove 3 matching JSX icon site(s), then remove its unused ArrowUpRight import only.
- `src/components/layout/header.tsx` — remove 2 matching JSX icon site(s), then remove its unused ArrowUpRight import only.
- `src/features/catalog/components/product-card.tsx` — remove 1 matching JSX icon site(s), then remove its unused ArrowUpRight import only.
- `src/features/catalog/components/product-storefront.tsx` — remove 3 matching JSX icon site(s), then remove its unused ArrowUpRight import only.
- `src/features/catalog/components/product-usage-videos.tsx` — remove 3 matching JSX icon site(s), then remove its unused ArrowUpRight import only.
- `src/features/content/components/after-sales-page.tsx` — remove 4 matching JSX icon site(s), then remove its unused ArrowUpRight import only.
- `src/features/content/components/content-directory.tsx` — remove 1 matching JSX icon site(s), then remove its unused ArrowUpRight import only.
- `src/features/content/components/software-catalog.tsx` — remove 1 matching JSX icon site(s), then remove its unused ArrowUpRight import only.
- `src/features/content/components/solutions-page.tsx` — remove 2 matching JSX icon site(s), then remove its unused ArrowUpRight import only.
- `src/features/customer-map/components/customer-map-dialog.tsx` — remove 1 matching JSX icon site(s), then remove its unused ArrowUpRight import only.
- `src/features/home/components/home-benefits.tsx` — remove 1 matching JSX icon site(s), then remove its unused ArrowUpRight import only.

## Documentation / evidence files

- `spec.md`, `plan.md` — scoped approval record and real verification results, appended without rewriting existing tasks.
- `output/remove-diagonal-arrows-20261105/` — source manifest, before-file backups and hashes, preview/screenshot, actual diff, verification logs and eventual delivery.

## Scope / brand / contracts

Remove only matching ArrowUpRight JSX icons and unused imports. Keep link/button text, href, target, rel, accessible names, click handlers and card wrappers. Keep existing typography, colors, borders and padding; text can naturally center within an existing button when its icon is removed. No replacement icons or hidden spacer elements. Leave unrelated icons, data and navigation interactions intact. No CSS changes or removal of unused styling rules in this task, and no dependency/refactor/global icon hiding. Preserve all existing uncommitted user work, including the concurrent product-detail adaptation. The solutions-spacing plan remains separate and Pending; this request does not silently approve it.

## Steps

- [x] Inspect source sites and verify matching icon identity against the supplied screenshot.
- [x] Prepare/check a disposable browser-only visual preview without application edits. Desktop1440/mobile390 screenshots inspected; CTA text/href/target/rel unchanged, matching icon absent. Preview-only; application CSS/TSX not changed.
- [x] Obtain actual owner approval for the listed14 application files, including shared Header/Footer/contact mascot.
- [x] Back up current files/hashes and remove only JSX icon instances/unused imports.
- [x] Confirm no ArrowUpRight usage remains in source, all preexisting link/target/rel/text/handlers are unchanged, and unrelated arrows remain.
- [x] Run scoped formatting/lint/typecheck and production build; run existing relevant navigation/accessibility/product detail/contact/solution/content browser checks selected from the actual test inventory. No implementation-mirroring tests for this visual removal.
- [x] Browser/screenshot verification at320/390/768/1440/1920 covering the shared contact CTA, mobile navigation, contact mascot/shop, product links, solutions and content cards. Verify readable labels, no empty icon-only controls, working original destinations, focus and no page overflow. Validate dialog credit link when its existing popup is open.
- [x] Record preservation/verification and complete spec/plan, then perform required final Next feedback review if a qualifying candidate exists.

## Impact / rollback

R2 with sitewide visibility: the shared Header/Footer/contact mascot affect multiple pages, and cards repeat across records. Removing an icon can reduce content-sized button widths; keep original padding/alignment and verify responsive labels. Existing source sites all retain text, and card wrappers remain. Roll back only the task's exact JSX/import diff from backups, preserving prior product-detail/catalog/header work. No CMS/DB/assets/routes/API/schema/dependencies or global CSS changes. No commit/push/deploy.

## Current state

Progress: "Done — removed27 diagonal ArrowUpRight JSX sites across14 approved application files"

Only matching JSX icons and now-unused imports were removed. Source verification reconstructs and formats the exact approved transformation from before-files.zip and matches all14 current files byte-for-byte after line-ending normalization. This proves remaining text, href/target/rel/aria, click handlers, wrappers and unrelated arrow/control code are unchanged. All1650 protected source/test/asset/data/script/document files outside the14 scoped files match their baseline hashes. No CSS, content, taxonomy, API, CMS/DB, assets or dependencies changed. Concurrent product-detail/popup work is preserved.

TypeScript, scoped ESLint/Prettier/diff and Node24 production build431/431 passed. Existing navigation, navigation-accessibility, after-sales and software Browser19/19 passed; targeted detail guide/related/section links, video behavior and responsive long-name Browser3/3 passed (22 total). Additional real Chrome verification passed25 route/viewport checks at320/390/768/1440/1920 with zero matching diagonal SVGs, no page overflow or client errors. Existing solution links navigate, source form retains its original URL, software/content cards render, mobile chevrons remain and the contact CTA retains text/destination/new-tab attributes. Five CTA screenshots, two solution screenshots and one mobile-navigation screenshot were visually inspected.

Runtime limits recorded honestly: current site layout does not mount the mascot and the current Footer renders a non-interactive coverage div because its map setting is disabled. Their diagonal icons were removed from source and the exact remaining code/credit/shop text and link attributes are verified unchanged. No runtime mascot/map popup assertion is claimed, and neither feature was enabled or mounted just for this task. Preview scripts initially assumed these dormant features were active; checks were corrected against the existing layout and rendered footer rather than changing application behavior.

The prior owned preview process was restarted using this successful production build atlocalhost:3000 (owned exec session72076); smoke200 confirms the actual preview contains the contact label and zero diagonal SVGs. The temporary3016 verification server was stopped. No commit/push/deploy. Separate solutions-spacing plan remains Pending.

Evidence and rollback: output/remove-diagonal-arrows-20261105/delivery.md, locations.json, before-files.zip, removal.diff, baseline-hashes.json, source-verification.json, browser-verification.json, preview-smoke.json, build/typecheck/lint/format/regression/detail-regression/browser logs and eight actual after screenshots. Roll back only this task's exact JSX/import diff, preserving all prior user changes; no database rollback.

Final Next.js feedback reporting pass: no new qualifying verified framework issue during this request; no report draft/CLI pass needed. Observer review: no new skill update. The temporary preview harness mistakes were corrected without application changes.

# Plan: Popup รายละเอียดสินค้าแต่ละกลุ่ม (2026-11-05)

Status: "Complete"
Approval: "Approved — user: ปรับให้เป็นการกดแล้ว popup detail"

## Files

- `src/app/(site)/products/[slug]/page.tsx` — ใช้ component การ์ด/popup แทน inline details
- `src/app/(site)/products/[slug]/product-specification-dialogs.tsx` — สร้าง Client Component สำหรับ native modal interactions
- `src/app/(site)/products/[slug]/product-detail.module.css` — ปรับเฉพาะ card/dialog responsive style
- `spec.md`, `plan.md` — เพิ่ม approval/scope และผลตรวจเฉพาะงานนี้
- `output/product-detail-reference-audit-20261105/implementation/` — ภาพ/บันทึกผลปฏิสัมพันธ์

## Steps

- [x] ยืนยัน Spec/Plan และขอบเขตจากข้อความผู้ใช้
- [x] เปลี่ยน card เป็นปุ่มเปิด native dialog และรักษาตารางต้นฉบับ
- [x] ตรวจ modal ปุ่มปิด/Escape และ responsive ใน browser ที่ 320/390/768/1440px (320×800, 390×844, 768×900, 1440×1000)
- [x] อัปเดตผลตรวจและสถานะใน spec.md/plan.md

## Impact / Rollback

- จำกัด renderer/component/style ที่หน้าสินค้ารายตัว; ไม่มี global/shared/database changes
- คืน page/CSS เดิม และลบ component ใหม่ หากต้องย้อนกลับ

## Verification Results

- Browser ตรวจการเปิด dialog, ปุ่มปิด และ Escape; responsive 320/390/768/1440. TypeScript, Prettier, scoped ESLint TSX และ diff check ผ่าน; test suites ไม่ได้รันตามข้อกำหนดของ turn นี้.

# Plan: ลบแถบนำทางภายในหน้าสินค้า (2026-11-05)

Status: "Complete"
Approval: "Approved — user: ภาพรวม / รายละเอียดสินค้า / วิดีโอการใช้งาน อนุมิตลบ"

## Files

- `src/app/(site)/products/[slug]/page.tsx` — ลบเฉพาะ nav “ภาพรวม / รายละเอียดสินค้า / วิดีโอการใช้งาน”
- `src/app/(site)/products/[slug]/product-detail.module.css` — ลบเฉพาะ style และ responsive override ของ `.sectionNav`
- `tests/e2e/product-detail.spec.ts` — ปรับ assertion เดิมที่อ้างแถบ/การคลิกลิงก์ ให้ตรวจการไม่มีแถบ โดยคง assertion เนื้อหาสินค้าที่ไม่เกี่ยวข้อง
- `spec.md`, `plan.md` — เก็บขอบเขต การอนุมัติ และผลตรวจของงานนี้

## Steps

- [x] ยืนยัน Spec Ready to Code และรับการอนุมัติแผนนี้ก่อนแก้ application files
- [x] ลบ nav และ style เฉพาะแถบ โดยคง sections/IDs และเนื้อหาทั้งหมด
- [x] ปรับเฉพาะ browser-spec assertions ที่อ้าง section nav เดิม
- [x] ตรวจหน้า 320/390/768/1440px; รัน scoped formatting/typecheck และ diff check โดยไม่รัน test suites
- [x] บันทึกผลตรวจและสถานะจริงใน spec.md / plan.md

## Impact / Rollback

- ผลกระทบอยู่ที่หน้าสินค้ารายตัว: ผู้ใช้จะไม่เห็นทางลัดในหน้านี้ แต่เนื้อหา section และ fragment IDs ยังอยู่
- งานย้อนกลับง่าย: คืน `<nav>` และ `.sectionNav` rules ตาม diff; คืน assertion เดิมที่เกี่ยวข้องโดยไม่ reset ไฟล์อื่น
- ไม่มีการเปลี่ยน shared/global styles, routes, data, CMS หรือ database

## Verification Results

- เสร็จและตรวจแล้ว ดูผลส่งมอบท้ายหัวข้อและ output/product-cards-three-columns/delivery.md

# Plan: การ์ดรายละเอียด 3 คอลัมน์และไม่มีจำนวนรายการ (2026-11-05)

Approval: direct user request จัดกลุ่มใหม่เป็น 3 columm และเอาส่วนของรายการออก

## Files

- `src/app/(site)/products/[slug]/product-specification-dialogs.tsx` — ลบ small จำนวนรายการ
- `src/app/(site)/products/[slug]/product-detail.module.css` — desktop3columns และลบ small rule
- `spec.md`, `plan.md` — บันทึกขอบเขตและผลตรวจ

## Steps

- [x] ตรวจ component/CSS และบันทึกคำสั่งผู้ใช้
- [x] ปรับ grid และลบจำนวนรายการพร้อม style
- [x] ตรวจ source/format/typecheck และภาพ desktop/mobile
- [x] บันทึกผลจริง

Impact/Rollback: R2 เฉพาะ route; คืน grid2และ small markup/style ตาม diff. ข้อมูลและ native dialog ไม่เปลี่ยน

ผลส่งมอบงานแถบนำทางและการ์ด3คอลัมน์: Complete — ผู้ใช้อนุมัติลบแถบแล้ว. Browser1440/768/390/320ผ่าน: desktop3columns/narrow1column, ไม่มีจำนวนรายการ/แถบนำทาง/overflow, popupเปิดและEscapeปิดได้. TypeScript/scoped ESLint/Prettier/diffผ่าน. หลักฐาน output/product-cards-three-columns/delivery.md และ verification.json. QA3044ปิด; preview3000ยังเป็นproduction buildก่อนแก้. ไม่commit/push/deploy.

## Task: Build และรีสตาร์ต preview3000 (2026-11-05)

Status: "Ready to Code"
Approval: ผู้ใช้สั่ง Build ใหม่แล้วรีสตาร์ต preview พอร์ต3000 ให้แสดงหน้าล่าสุด
Scope/Plan: ใช้ Node24 และ bun run build ของโปรเจกต์; หยุดเฉพาะ process preview3000 ที่ตรวจ identity แล้วก่อน build; รัน bun run start ที่127.0.0.1:3000; ตรวจHTTPและBrowserว่าการ์ด3columns ไม่มีจำนวน/แถบนำทาง และpopupทำงาน
Files: spec.md/plan.md และ output/product-cards-three-columns/ สำหรับผลตรวจ; ไม่แก้ application source
Impact/Rollback: local previewหยุดชั่วคราวระหว่างbuild; ใช้ sourceเดิมหากbuildล้มเหลวและแก้เฉพาะสาเหตุที่ขวางงาน ไม่deploy/commit/push

### ผล Build และ restart preview3000 — Complete

Node24.22.1 + bun run build ผ่าน: compilation/TypeScript/static pages431/431. รีสตาร์ตด้วย bun run start --hostname127.0.0.1 --port3000 (owned exec41815). HTTP200. Browserจริงบนพอร์ต3000ผ่าน1440/768/390/320: desktop3columns, narrow1column,6cards, no counts/no section nav/no page overflow, popupเปิดและEscapeปิดได้. ภาพproduction1440/390ตรวจแล้ว. หลักฐาน output/product-cards-three-columns/production-verification.json, preview-restart.json และ production-cards-*.png. บันทึกนี้แทนข้อจำกัดก่อนหน้าที่preview3000ยังเป็นbuildเก่า. ไม่มีcommit/push/deployและไม่มีapplication source changesในขั้นตอนrestartนี้. ไม่พบปัญหาNext.jsใหม่ที่ต้องส่งfeedback

## Task: วิดีโอหน้าสินค้าเปิด YouTube แท็บใหม่ (2026-11-05)

Status: "Complete"
Approval: คำสั่งตรงของผู้ใช้ วิดิโอแนะนำกดแล้วเปิดแท็บใหม่เป็นหน้ายูทูปตามลิงก์เลย
Goal/Contract: คลิกภาพวิดีโอหรือกดEnterเปิด video.url เดิมด้วยtarget=_blank/rel=noopener noreferrer; เอา inline iframe/state/ปิดวิดีโอออก. คงรูป/ชื่อ/จำนวน/URL/drag-scroll/layout/ช่องYouTubeเดิม
Files/Plan: src/features/catalog/components/product-usage-videos.tsx เปลี่ยน posterเป็นa; product-usage-videos.module.css ลบเฉพาะiframe/close-button selectorsที่ไม่ใช้; tests/e2e/product-usage-videos.spec.ts และ product-detail.spec.ts ปรับexisting playback assertionsเป็นnew-tab; spec.md/plan.md/output/product-video-new-tabs บันทึกผล. ไม่แก้shared DragScroll หรือdata
Acceptance: คลิก/Enterเปิดแท็บที่ตรงvideo.url;ไม่มีiframe/close;dragไม่เปิดtab;responsive320/390/768/1440;unmatchedยังลิงก์channelเดิม
Verification: scoped lint/format/typecheck; existing focused browser specและproduction previewจริง. Buildและrestart3000หลังแก้ตามการอนุมัติpreviewก่อนหน้า
Impact/Rollback: R2 เฉพาะproduct videos;คืนcomponent/CSS/testdiff. ไม่มีdata/DBwrites/commit/push/deploy

### ส่งมอบวิดีโอเปิดYouTubeแท็บใหม่ — Complete

ปรับภาพวิดีโอเป็นanchorไปvideo.urlเดิมด้วย_blank/noopener noreferrer;ลบstate/iframe/ปุ่มปิดและCSSเฉพาะของมัน. drag-scrollเดิมยังทำงาน. BuildNode24ผ่าน431/431รวมTypeScript;scopedESLint/Prettier/diffผ่าน. Existing focused Browser3/3ผ่านบนproduction3000:สองคลิปตรงURL,click/Enter/newtab/opener-null,dragไม่เปิดtab,similar-model/unmatchedเดิม. การทดสอบปลายทางใช้stubYouTubeเพื่อยืนยันURLและแท็บ ไม่อ้างเนื้อหาภายนอก. รูปRLSตรวจ1440/768/390/320ไม่มีoverflow/iframeและ7posterURLsตรง;ภาพ1440/390ตรวจด้วยตาแล้ว

รีสตาร์ตpreview3000ล่าสุดด้วยbun run start (owned exec51243). หลักฐาน output/product-video-new-tabs/build.log, browser.log, responsive.json และ videos-*.png. ไม่มีcommit/push/deploy. ไม่พบframework issueใหม่ที่ต้องส่งfeedback;observerไม่มีบทเรียนใหม่

# Plan: Reuse new catalog cards for related products (2026-11-05)

Status: "Ready to Code — completed and verified"
Approval: "Authorized — current direct request to use the existing /products card plus standing authorization to proceed with prepared pending changes"

## Goal / exact implementation

The pictured related-products section already uses CatalogProductCard, but omits modelOnly and the centered model styling used in /products. Use the existing compact image/model variant and existing catalogCardName helper; retain original3 selected products/order/URLs, original section heading/category CTA, compare behavior and original3-column desktop/2-column mobile grid. No new card component.

## Files

- `src/app/(site)/products/[slug]/page.tsx` — add existing catalogCardName import; pass modelOnly and the existing catalog card display name; add a route-local relatedGrid class to the existing product-grid wrapper.
- `src/app/(site)/products/[slug]/product-detail.module.css` — two relatedGrid-scoped selectors matching the existing /products model-only copy/title alignment: no right padding, centered copy, no artificial title minimum height/clipping. Keep existing card shell/image/font/border/padding/compare styles from CatalogProductCard. Do not change shared catalog styles.
- `spec.md`, `plan.md`, `output/related-product-card-sync-20261105/` — approval/scope, before-file backups/hashes, browser baseline/screenshots, actual verification/delivery.

## Steps

- [x] Inspect actual related renderer, /products modelOnly usage, existing model-name helper, CSS and current spec/memory; read bundled component guide.
- [x] Record exact scope under the user's direct request and standing authorization without asking again.
- [x] Capture baseline products/destinations/layout and current source backups/hashes.
- [x] Change the two route-local files only; preserve concurrent popup/video work in the same page.
- [x] Scoped format/diff/lint/typecheck/build; existing targeted product-detail related/guide test and catalog-card responsive regression chosen from inventory.
- [x] Verify real preview at320/390/768/1440: same products/order/URLs/CTA and3/2 grid columns; modelOnly image/title match /products, images load, no subtitle/brand/tag duplication, no overflow, image/title links and keyboard behavior work.
- [x] Record source-preservation check/results, final screenshots and task completion.

## Impact / rollback

R2, product detail route only: related cards become compact, their names use the same existing label normalization as /products. Catalog selection logic/data/source records and card shared implementation remain unchanged. Existing responsive grid retained. Restore only this task's exact route/CSS diff; preserve popup and new video-tab work. No DB/CMS writes, dependencies, global styles, unrelated UI refactor or commit/push/deploy. Preview restart follows existing local preview authorization; only identified owned processes are stopped.

## Verification state

Progress: "Done — related products use the current /products compact image/model card"

The existing CatalogProductCard is reused with modelOnly and the existing catalogCardName label helper. Two route-local CSS rules mirror the catalog's centered copy/title behavior. The shared card implementation, catalog CSS and card-name helper remain unchanged. Original3 related records/order/image sources/destinations/category CTA and original3-column desktop/2-column narrow grid remain. No product content, selection algorithm, popup/detail/video behavior or compare control logic was altered.

Scoped Prettier/ESLint/diff and TypeScript passed; Node24 production build431/431 passed. Existing focused Browser4/4 passed: catalog default order/featured/List; global comparison; actual related products/guide across product families; responsive product/long names. No new permanent CI tests for this low-impact visual reuse.

Real Chrome before/after at320/390/768/1440 verifies the same3 products/order/URLs/CTA and retained column counts, loaded images, no duplicated brand/subtitle/tags and no page overflow or client errors. Card padding/radius/background/copy alignment/title typography/minimum height/display/overflow/image height exactly match the existing /products modelOnly card at the same viewport. Image clicks and title Enter activation navigate to the same existing product URL in all4 widths (8 activations). All4 final screenshots visually inspected.

Source verification reconstructs only the exact approved two-file transformation from before-files.zip, preserving the rest of the route and CSS. All1662 protected source/test/asset/data files outside those2 route files match baseline hashes. Existing popup and YouTube new-tab work are preserved. First baseline browser harness needed to scroll the lazy-loaded section into view and use the actual existing900px grid breakpoint; corrected verification setup without changing application behavior. No new framework feedback candidate.

The identified prior local preview process was checked against this workspace's Next start command/port3000 before stopping. Current preview restarted from the successful build (owned session79851); actual3000 HTTP200 includes all3 compact related cards. Temporary3016 QA server stopped. No commit/push/deploy or DB/CMS writes, dependencies, shared/global style changes.

Evidence and rollback: output/related-product-card-sync-20261105/delivery.md, plan.md, before-files.zip, baseline-hashes.json, card.diff, source-verification.json, before-browser.json/after-browser.json, preview-smoke.json, logs and four after-related screenshots. Revert only this task's exact route import/props/wrapper-class diff and two relatedGrid CSS rules; preserve other pending user work. No database rollback needed.

Final Next.js feedback review: no qualifying verified framework issue in this request; no feedback command/report needed. Observer review: no new skill updates.

# Plan: Separate completed changes and push safe (2026-11-05)

Status: "Ready to Code"
Approval: "Approved — direct user request แยกไฟล์และคอมมิต/พุท"

## Goal / exact file scope

Separate50 currently changed/new files into8 coherent commits using groups.json, then push normally toorigin/safe and verify remote SHA. Current branchsafe tracksorigin/safe and already contains an unpushed approved YouTube commit60c023b; include it in the same ordinary push. Do not change main/uat or deploy.

1. feat(catalog): synchronize subcategories and catalog filters (17 files)
2. feat(navigation): match product menus to catalog subcategories (4 files)
3. feat(products): update detail dialogs cards and YouTube links (10 files)
4. style(ui): remove remaining diagonal link arrows (12 files)
5. fix(home): encode local category artwork URLs (2 files)
6. feat(home): open individual stories in new tabs (1 files)
7. style(navigation): align solutions menu spacing with products (1 files)
8. docs: record approved catalog and interface updates (3 files)

The complete exact50-path manifest is output/commit-push-separated-20261105/groups.json. Source changes already approved and verified by their feature tasks; this Git task does not add or refactor features. Shared detail/video files are grouped together because their implementation and tests overlap. Diagonal-arrow removals already included in those route/video changes stay with that dependent group; remaining12 UI files form their own visual commit.

## Steps

- [x] Inspect branch/upstream/current remote heads, all tracked/untracked paths, prior approval/verification records and representative diffs.
- [x] Record explicit scope/approval; save binary working patch, untracked ZIP and source hashes; confirm initially empty index.
- [x] Review exact diffs and safe file scope; check changed code formatting/lint/typecheck, catalog unit verification and prior unchanged-source production/browser evidence. Preserve source bytes and local artifacts.
- [x] Stage only manifest paths group-by-group; verify index matches each group and diff checks pass; commit7 source groups in dependency order.
- [ ] Record actual source IDs/checks in spec/plan, then commit the3 documentation files as group8.
- [ ] Ordinary pushorigin safe and verify remote SHA==localHEAD; record complete receipt/status in ignored output delivery; ensure no remaining tracked/untracked requested work.

## Impact / rollback

R2 local commits and ordinary remote branch push, but commits become shared history. No force push/reset/rebase, production release, DB/CMS writes or artifact/env/secret staging. Keep ignored output/media/node_modules/.env untouched. Before each stage verify current source hashes and empty index; if unexpected concurrent changes appear, inspect and preserve them. Use follow-up revert commits for a published rollback; binary patch/ZIP also preserve the initial local work. Do not undo prior commits.

## Verification / provenance

Latest feature production build431/431 and targeted Browser checks are recorded in related-product-card-sync-20261105 and preceding task deliveries. Current source matches those final source verification records; rerun appropriate Git delivery code/unit checks, without repeating unchanged UI checks unnecessarily. Known Windows CRLF-vs-reference Markdown hash should be distinguished from actual candidate Git bytes; use isolated Git-byte unit verification if necessary. No new Next framework feedback candidate at inspection.

## Verified source commits / delivery state

All47 non-root-document paths committed in7 coherent groups, and every Git blob matches the isolated tested candidate tree. Three root project-document files form the final8th commit. Source implementation is unchanged during this Git task. Current branchsafe; ordinary push targetorigin/safe includes the existing previously unpushed YouTube commit60c023b. No main/uat/production mutation.

- f469df7 — feat(catalog): synchronize subcategories and catalog filters (17 paths)
- 0a8d256 — feat(navigation): match product menus to catalog subcategories (4 paths)
- fe1aa7d — feat(products): update detail dialogs cards and YouTube links (10 paths)
- 1991ec4 — style(ui): remove remaining diagonal link arrows (12 paths)
- 0d572b7 — fix(home): encode local category artwork URLs (2 paths)
- 91ce38e — feat(home): open individual stories in new tabs (1 paths)
- 1773f7b — style(navigation): align solutions menu spacing with products (1 paths)

Changed TS/TSX/CSS formatting, changed TS/TSX ESLint, TypeScript and Git diff checks passed. All94 catalog unit cases passed against the exact candidate Git bytes in an isolated export using existing dependencies, with no env/credentials copied. Default Windows archive conversion initially produced a reference-file hash mismatch; Git blob bytes were correct, and exporting with core.autocrlf=false made the exact Git-byte suite pass94/94. No application/test/reference source was altered to hide the mismatch. Candidate tree/export settings and both logs are retained.

The latest unchanged-source production build431/431 and scoped Browser evidence are retained in related-product-card-sync-20261105 (4/4), solutions-menu-spacing-20261105 (13/13) and prior approved feature deliveries. Source hashes were frozen before Git delivery and checked before each source commit; no extra feature code or redundant Browser/build changes were introduced. All50 paths are explicitly assigned, no ignored output/media/env files staged. Binary working patch, untracked ZIP, exact source hashes, tested candidate index/tree and source commit receipts are local under output/commit-push-separated-20261105/.

Final Git operations: commit the3 root documents, then ordinary git pushorigin safe. The post-commit/post-push receipt at output/commit-push-separated-20261105/delivery.md and push-receipt.json records the final documentation commit ID, final local/remote SHA, complete commit manifest, command results and clean working-tree verification. Those values are deliberately recorded after the operations rather than claiming a remote result inside a commit that precedes its push. If push fails, preserve local commits and report the actual reason without force push.

Rollback: existing work preserved in7 source commits and8th documentation group; use follow-up revert commits for shared history. No reset/rebase/force push, delete or DB rollback. Original ignored output/local media remain. Final Next.js feedback review has no new qualifying framework issue; the known Windows Git export conversion is not a Next.js issue. A concrete archive instruction is appended to MEMORY.md; no skill edits.

# Plan: Fix full deployment formatting gate (2026-11-05)

Status: "Ready to Code"
Approval: "Authorized — user supplied failed deploy output; standing instruction permits handling prepared pending changes and committing/pushing fixes"

## Scope / cause

Previous Git delivery checked changed code only; the release runs prettier --check . and reports6 files. Format onlydocs/sunford-accessory-categories.md, docs/sunford-indicator-models.md, MEMORY.md, plan.md, spec.md, src/features/content/data/solutions-import-report.json. Preserve JSON data and reference-document meaning. Add task/results/lesson within the3 existing project docs; keep all application source/UI/DB content untouched.

## Steps / files

- [x] Inspect the actual clean uat branch, release script and six failures; capture6-file backup and protected hashes.
- [ ] Append current scoped spec/plan and the concrete full-repository formatter lesson to the existing root docs; preserve previous task history.
- [ ] Run Prettier write only for the6 named files and verify JSON deep equality plus exact formatter output from the pre-format backup.
- [ ] Run the actual release check list manually with the same fixture environment: lint, format:check, db:validate, test:uat, test:catalog, build, typecheck. Do not run the production-pushing entrypoint to perform checks.
- [ ] If the known hash-sensitive Markdown checkout conversion blocks catalog tests, verify the exact failure and apply only an explicit LF policy for docs/sunford-scale-categories.md in .gitattributes, restoring canonical Git bytes without changing reference content/hash/tests. Record this minimal necessary scope before editing.
- [ ] Record actual results, rerun full formatter after docs updates, commit the reversible formatting/line-ending fix onuat; run bun run deploy --check from a clean committed tree (this command checks readiness only, not the check list), ordinary pushorigin/uat, confirm remoteSHA and clean tree.

## Impact / rollback

R2 formatting and, only if needed, a path-specific Git text policy. No app behavior/CMS/DB/stack/dependency changes, tests weakened or hash edits. No main push/production deploy/rebase/force push. Roll back via a follow-up formatting commit;6 original files are backed up underoutput/deploy-format-gate-fix-20261105/. Fixture checks use DATABASE_URL/DIRECT_URL/SUPABASE_URL empty, APP_ENV=ci, no secrets copied. Preserve local preview and ignored artifacts.

## Current state

Actual release --check only asserts cleanuat and prints the sequence; it does not execute lint/tests/build. Full manual checks must be evidenced separately. No qualifying Next framework feedback candidate.

## Confirmed downstream check blockers / exact follow-up scope

Full lint/format/db validation and UAT27/27 pass. Catalog92/94: accessory reference parsing assumes onlyasterisk list markers, while the required canonical Prettier output usesdash; the strict expected model arrays become empty. Also the scale reference file checkout isCRLF while its committed LF Git blob matches the existing manifest SHA.

Authorized necessary fix scope: `tests/catalog/accessory-subcategories.test.ts` — accept standard Markdown dash or asterisk markers in the existing reference parser; keep strict full model-list equality and all other assertions. `.gitattributes` — new single-path text eol=lf rule for `docs/sunford-scale-categories.md`; restore that working file from the unchanged canonical Git blob. No manifest SHA changes, document text changes or test bypass. This extends the previous6-file formatting plan only to these2 minimal release-check fixes under standing authorization. Preserve app/source/data/UI. Re-run the two affected unit gates and remaining release checks; full formatter again after final docs updates.

## Completed validation / final Git receipt

Full repository Formatting now passes after canonical formatting of the6 reported files. Solutions import report JSON values compare exactly equal to the original backup; reference documents preserve their model lists. Existing accessory test parser now recognizes both standard Markdown dash/asterisk markers while retaining strict full model/order assertions. New .gitattributes applies text eol=lf only to docs/sunford-scale-categories.md; the actual document bytes equal its unchanged original Git blob and manifest SHA. No expected hash or test data was changed.

Actual release checks were executed manually in the same fixture environment as scripts/lib/release.mjs: full ESLint, full format:check, Prisma schema validation, UAT27/27, Catalog94/94, production build431/431, TypeScript — all pass. New test regex also passed scoped ESLint/Prettier. The initial full run exposed exactly2 catalog failures after the formatter passed; both are fixed and the remaining gates passed. Initial failed log and final passing logs are preserved. All333 unrelated protected files remain byte-identical; no UI/runtime behavior, business data, dependency, DB/CMS write or production main push.

Finalization: format the updated project notes, rerun full format:check, then commit exactly8 paths onuat (6 named formatting files plus .gitattributes and the1 existing test). The LF reference refresh creates no content/blob change. Clean-tree bun run deploy --check is readiness-only; it will be logged separately from the actual7 checks above. Ordinary origin/uat push and final local/remote SHA/clean-tree verification are recorded after those operations in output/deploy-format-gate-fix-20261105/delivery.md and push-receipt.json. Production deployment is left to the owner's bun run deploy command.

Rollback uses a follow-up commit; original6 files and follow-up reference/test snapshots are retained in before-files.zip and before-followup.zip. Final Next.js feedback review: no qualifying framework issue, no feedback command needed. Concrete full-formatter/Markdown/Git LF lessons recorded in MEMORY.md; no skill updates.
