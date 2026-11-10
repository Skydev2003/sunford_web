# Plan: ใบเสนอราคาที่ลูกค้าจัดทำและพิมพ์เอง

- [x] ตรวจใบตัวอย่าง ยืนยันขั้นตอนของลูกค้า และตรวจแหล่งราคาสินค้าเดิม
- [x] ยืนยันฐาน VAT ของราคาแค็ตตาล็อกและบันทึกการอนุมัติแผน
- [x] เพิ่มลิงก์ “ใบเสนอราคา” ในเมนูบริการผ่าน `src/features/cms/data/primary-navigation.ts` และสร้างหน้า `src/app/(site)/service/quotation/page.tsx` โดยอ่านแค็ตตาล็อกบนเซิร์ฟเวอร์
- [x] สร้าง `src/features/catalog/components/quotation-form.tsx`, `src/features/catalog/components/quotation-form.module.css` และ `src/features/catalog/data/quotation.ts` สำหรับข้อมูลผู้ขายคงที่ ฟอร์มผู้ซื้อ รายการสินค้า จำนวน การคำนวณเป็นสตางค์ และหน้า A4
- [x] ตรวจยอด ปัดเศษ ราคาที่หายไป และหลายรายการใน `tests/catalog/quotation.test.ts` ตรวจลิงก์บริการทั้งสอง Navbar ใน `tests/catalog/primary-navigation.test.ts` และตรวจกรอกฟอร์ม มือถือ และ PDF หลายหน้าใน `tests/e2e/quotation.spec.ts`
- [x] ตรวจ typecheck, lint, build และบันทึกผลใน spec.md และ plan.md

ผลตรวจ: production build 467 หน้า ผ่าน TypeScript และ scoped ESLint ชุดแค็ตตาล็อกผ่าน 127 ข้อ เมนูหน้าแรก หน้าภายใน และสถานะมือถือผ่านทั้ง 3 ข้อใน production build. ข้อมูลจริงมี 159 รายการที่ยังไม่มีราคายืนยัน จึงข้ามกรณีพิมพ์ที่ต้องอาศัยราคาบน production และรันทดแทนผ่านฟอร์มเดียวกันในสำเนา QA ตรวจไฟล์ A4 จริงทั้ง 1 หน้าและหลายหน้า ยอดรวมตัวอย่าง 1,973.75 = 1,844.63 + 129.12 บาท

ผลกระทบส่วนกลางคือปลายทางใหม่ในเมนูบริการทั้งสองแบบ ย้อนกลับด้วยการนำลิงก์และหน้าใบเสนอราคาของงานนี้ออก ข้อมูลลูกค้าอยู่ในหน้าเบราว์เซอร์

# Plan: Align the remaining Navbar flyouts with the logo

Browser trial on Home and /contact-us: at 834 and 1024px all six other Home flyouts began 62px to the right of the logo. At 1440px they already aligned. Internal flyouts had a 6px offset at each width. With temporary desktop CSS, all seven submenu headings aligned at all three widths on both routes (42 measurements, 0px difference).

- [x] Compare the Home flyout positioning and the internal menu padding with the approved products menu.
- [x] Record owner approval of the shared CSS scope.
- [x] In `src/styles/header.css`, give the desktop stage the full Header width. Position the other panels using the logo offset and remove their extra leading padding.
- [x] In `src/features/catalog/components/products-overview.module.css`, use the desktop Navbar's 16px horizontal inset for the common menu content.
- [x] In `tests/e2e/navigation.spec.ts`, measure the first visible heading and link in each flyout against the logo for both Headers. Verify 834, 1024 and 1440px, horizontal overflow, and mobile disclosure at 390px.
- [x] Record actual verification in `spec.md` and `plan.md`.

Verified with six browser cases in development and six against the production build. All passed, including 84 alignment checks per run and mobile interaction at 390px. Build: 466 pages. Scoped lint and formatting passed. Screenshots: `output/nav-logo-alignment/`.

Impact and rollback: shared desktop flyout geometry across the two Header variants. The CSS changes can be reverted independently of navigation data, event handlers and mobile styles.

# Plan: Logo-aligned all-products mega menu (2026-11-10)

## Current plan — owner-supplied Navbar screenshot

Approval: "Approved — อนุมัติครับ ใช้เมนู “ผลิตภัณฑ์ทั้งหมด” ตามภาพล่าสุดทั้งหน้าแรกและหน้าภายในได้เลยครับ"

- [x] Review the visual reference, identify six existing secondary destinations, render the proposal at 390/834/1440 and check logo alignment.
- [x] Record owner approval of the revised design in `spec.md`.
- [x] Update `src/features/cms/data/primary-navigation.ts` using existing links for the large column and two existing-format groups for the smaller columns.
- [x] Update `src/components/layout/header.tsx` and `src/components/layout/primary-navigation.tsx` for the /products trigger, mobile disclosure and the three groups.
- [x] Scope panel spacing, logo alignment, primary typography and mobile stacking in `src/styles/header.css` and `src/features/catalog/components/products-overview.module.css`.
- [x] Update `tests/catalog/primary-navigation.test.ts` and the affected browser suites in `tests/e2e/` (all-products-navbar, navigation, sitewide-navigation and navigation-hover-intent). Verify eleven destinations, desktop alignment, mobile groups, direct links, hover and keyboard.
- [x] Run the type, lint, build and affected browser checks. Record results in spec.md and plan.md.

Both shared Headers are affected. Isolate the new layout to the products panel and roll back its data, render and style edits together if required. Review artifact: `output/all-products-mega-menu-20261110/reference-1440.png`. Browser measurements on the standalone mock place the logo and first link at 16px on 390/834 and 224px on 1440.

Verified on the production build (466 generated pages): 45 browser tests passed for menu behavior, navigation, logo alignment and responsive controls. Eight additional category navigation checks passed. Development checks confirmed the logo edge on both Headers at 834, 930, 1023, 1024 and 1440px. Catalog tests passed 124/124, with TypeScript and scoped ESLint passing. Desktop and mobile screenshots are under `output/all-products-mega-menu-20261110/verified/`.

## Archived five-column plan (superseded)

Status: "Ready to Code"
Approval: "Pending — five equal columns, clickable category headings, shared Header behavior/styles"

## Files

- `src/features/cms/types.ts` — เพิ่มoptional `href` ให้NavigationGroup heading contract;existinggroupsยังcompatible
- `src/features/cms/data/primary-navigation.ts` — project all-productsเป็น5groupsจากcurrentcategory outputs: clickablecategory heading + existing23children;ไม่mutateCMS/defaultdata
- `src/components/layout/header.tsx` — renderoptionalgroupheadinglinksและให้/products mobileใช้directlink+disclosureแบบcategory;คง300mstimers/route cleanup
- `src/components/layout/primary-navigation.tsx` — classify/productsเป็นlink triggerทั้งdesktop/mobile,rendergroupheadinglinksและall-products panel class;คงhandlersเดิม
- `src/styles/header.css` — Home all-products5equalcolumns,logo-aligned start,gap24/16และscopedheading/child styles
- `src/features/catalog/components/products-overview.module.css` — Internal all-products5equalcolumnsในsame1024/16Navcontainer,logo alignmentและmobile stacked styles
- `tests/catalog/primary-navigation.test.ts` — assert5groupheadings/categoryhrefs/23children/order/dedup/nonmutationพร้อมรักษาexistingnavcontracts
- `tests/e2e/all-products-navbar.spec.ts` — replaceplain-link expectationsด้วยdesktop/mobile submenu/directlink/modifiedlink/same-route/geometry/equal-column/logo-alignment checksทั้ง2variants
- `tests/e2e/navigation.spec.ts` — update9menu/Home mobile summary/group expectationsและall real destination coverage
- `tests/e2e/sitewide-navigation.spec.ts` — verify five heading+child destinations/internal mobile/desktop panels without weakeningexistingcategory menu checks
- `tests/e2e/navigation-hover-intent.spec.ts` — add all-products300ms/cancel/rearm/keyboard/pointer/history coverage while preserving24existing cases
- `spec.md`, `plan.md`, `MEMORY.md` — approval,contracts,actual verification and any repeatable lesson;preserve other tasks
- `output/all-products-mega-menu-20261110/` — reviewedstandalonemock,owned snapshots,privateQA,logs,screenshots/delivery;noenvironment files

`/products` page content,category data/routes,Footer,motion hook,global base/layout and dependencies are read-only. Pending compatibility-guide work is separate;implementation must preserve any separately approved shared projection delta instead of overwriting it

## Steps

- [x] อ่านcurrentbuilder/types/Header renderers/styles/testsและpreviousNav contracts;ยืนยัน5categoryoutputs/23children
- [x] เลือกrecommendation:5clickablecategory headings+existingchildren,no duplicatedsolutions/support;mobile directlink+disclosure
- [x] สร้างstandalone834/1440mockและวัดlogo/firsttextleft,5equal widths/nooverflow
- [ ] รับownerapprovalของconcreteSpec/Planและvisualproposalก่อนapplication/test edits
- [ ] Snapshotownedfiles/coherentcurrentruntime;read relevantlocalNext16 guide and prepareprivateNode24QA without stopping user servers
- [ ] Extendoptionalgroupheading contractและproject5all-products groups without input mutation/destination change
- [ ] Extendonly/products trigger/render classification in both Headers;preserve300ms timers,click/keyboard/touch/route cleanup
- [ ] Add scoped5-column/logo-aligned styles at834/1024/1440 and stacked mobile sections;preserve9-item compact Navbar geometry
- [ ] Update listed unit/browser contracts;retainall existing navigation/functionality assertions
- [ ] Verify exact5headings/23children,heading/child hrefs,dedup,desktop equal widths/logo alignment and mobile directlink/disclosure at320–1920
- [ ] Verify originalhover/rearm/cache/history/search/compare/category/service/Home/Footer/motion and actualdevelopmenthydration/console behavior
- [ ] RunscopedPrettier/ESLint,fullTypeScript,catalogunits,Node24build,affectedbrowser suites/source audit/screenshots;updateactualresults and deliverpreview withoutcommit/push/deploy

## Impact / Rollback

R1 sharedNavbar. Main risk is converting `/products` fromplainlink to submenu trigger in both renderers without losing direct navigation or misaligning other menus. The plan reuses existing category link+disclosure interaction path and adds an all-products-only grid class. Optional group href is backward-compatible; no persistence. Rollback exactowned delta from snapshots;do not reset current all-products page,approvedgutter,otherNavbar behavior or unrelated pending work

## Verification Results

Planning only. Current source output verified asplain `/products` item plus5category items and23children. Mock geometry passes:834 logo/first16px,five widths147.59–147.61px;1440 logo/first224px,five widths179.19–179.20px;no body overflow. Screenshots visually reviewed. Application/testfiles unchanged;no candidate build/browser runtime claim. Awaiting owner approval

---

# Plan: Indicator and platform compatibility guide in Navbar (2026-11-10)

Status: "Ready to Code"
Approval: ดำเนินการตามคำขอเพิ่มหน้าและคำย้ำ “หน้าจัดสเปคผมละครับ” ใช้ชื่อเมนู “จัดสเปคเครื่องชั่ง” ในกลุ่มข้อมูลและความช่วยเหลือ

## Files

- `src/app/(site)/guides/indicator-platform-compatibility/page.tsx` — สร้าง explicit RSC route และ metadata; render guide component โดยไม่ fetch/mutate
- `src/features/content/data/indicator-platform-compatibility.ts` — สร้าง typed content จากเอกสารแนบ: 4 groups + accessories; exact codes เป็น text และไม่มี inferred URLs
- `src/features/content/components/indicator-platform-compatibility-page.tsx` — สร้าง semantic hero, 4 native disclosure cards, accessories disclosure และ contact CTA
- `src/features/content/components/indicator-platform-compatibility-page.module.css` — scoped mobile-first layout/tokens/focus/disclosure/model wrapping;ไม่แก้ global styles
- `src/features/cms/data/primary-navigation.ts` — inject link “คู่มือเลือกชุดชั่ง” เพียงครั้งเดียวใน Services › ข้อมูลและความช่วยเหลือสำหรับทั้ง2 Header variants โดยไม่ mutate CMS; build on the approved all-products delta without overwriting it
- `tests/catalog/primary-navigation.test.ts` — ตรวจตำแหน่ง/ปลายทาง/dedup/nonmutationของ guide link พร้อมรักษา category/23-child/current pending-nav contracts
- `tests/catalog/indicator-platform-compatibility.test.ts` — new exact data-contract checks: 4 groups, indicator/platform/accessory codes, no model URLs and required source facts
- `tests/e2e/indicator-platform-compatibility.spec.ts` — new Home/internal/mobile Navbar access, page hierarchy, native disclosure, keyboard/touch/no-JS/responsive/overflow/content/no-console checks
- `spec.md`, `plan.md` — record owner approval, actual implementation/verification and affected contracts without overwriting history
- `output/indicator-platform-compatibility-20261110/` — owned snapshots, source audit, logs, screenshots and delivery report; no environment files

Existing Header/PrimaryNavigation renderers, header CSS, global styles, motion hook, Footer, catalog data/routes and database are read-only for this Plan

## Steps

- [x] อ่านเอกสารแนบเต็มฉบับ, `spec.md`, `MEMORY.md`, existing Navbar/page patterns, tokens, package versions and relevant tests
- [x] แยก attached content ออกเป็น 4 primary decisions + 1 secondary accessories disclosure;กำหนด visible/expanded/omitted content และ no-inferred-link rule
- [x] ตรวจ Navbar capacity evidence: approved all-products task already requires compact 9-item layout at 834–1023px; choose Services submenu to avoid unapproved 10-item responsive change
- [x] ตรวจ model-code presence against repository; only `TIS-150-AW31` is absent and must remain unlinked plain text
- [ ] รับ owner approval ของ concrete Spec/Plan, route และ submenu placement ก่อน application/test edits
- [ ] ก่อนเขียนโค้ด อ่าน Next.js 16.4.3 guide ที่เกี่ยวข้องจาก `node_modules/next/dist/docs/`; snapshot owned files and establish coherent baseline without stopping user servers
- [ ] เพิ่ม typed data, static route/metadata and RSC semantic page; use native `<details>` only and exact supplied content
- [ ] Add deduplicated Services-submenu link in shared nav projection; preserve the approved all-products delta, CMS inputs, 300ms hover/rearm and mobile behavior
- [ ] Add/update listed unit and browser contracts; do not weaken existing navigation/catalog assertions
- [ ] Verify 320/390/600/768/834/1024/1440/1920 layout, all closed/expanded states, code wrapping, 44px targets, keyboard/touch/no-JS and body overflow
- [ ] Verify both Header variants, mobile accordion, direct/reload/history/modified-link navigation, Home motion exclusion, non-Home stagger/reduced fallback and Footer
- [ ] Run scoped Prettier/ESLint, full TypeScript, relevant catalog units, Node24 build, affected browser suites and actual-development hydration/console checks
- [ ] Audit source scope and screenshots at 390/834/1440; update actual results/checklists, review Next.js feedback candidates, and deliver verified preview without commit/push/deploy

## Impact / Rollback

R1 shared-navigation projection, R2 new route/data/component/CSS/tests. Blast radius if nav injection is wrong: both Home/internal desktop and mobile menus can duplicate or lose a support link; protect with exact order/dedup/nonmutation and browser coverage. The page itself has no persistence. Rollback the exact guide-link delta and remove only new guide-owned files/tests from the task snapshot; preserve the approved all-products work and all unrelated changes. No database rollback is required

## Verification Results

ส่งมอบพรีวิวพอร์ต 3023 จาก production build บน Node 24 (466/466 routes) ตรวจรหัสเอกสารครบ 53 รายการ, catalog tests 124/124, browser 12/12 รวม desktop/mobile navigation ทั้งสอง Header และจอ 320–1920px ภาพอยู่ใน output/indicator-platform-compatibility-20261110/browser

รายละเอียดเปิดด้วย native details แต่เมื่อปิด JavaScript ทั้งหมด site layout ที่ใช้ streaming ไม่แสดง summary ในการตรวจ Chrome. TypeScript ของ snapshot ที่ build ผ่าน ส่วน typecheck ใน workspace รอบหลังพบ TS2307 ใน products-index-content.tsx จาก import products-index-carousel ที่ยังไม่มีในขณะตรวจ

---

# Plan: All-products Navbar entry and nine mock card sections (2026-11-10)

Status: "Complete"
Approval: "Approved — base scope and revised 32/48/container-1180 left gutter"

## Files

- `src/features/cms/data/primary-navigation.ts` — เพิ่มplain/productslinkก่อนscalesผ่านsharedbuilderที่2Headerใช้;ไม่mutateCMSหรือเปลี่ยน23children
- `src/features/catalog/components/products-index-content.tsx` — แทน5categorydirectoryด้วยRSC9Mocksections/4cardsต่อsection;คงH1และexplicitfinderlink;ไม่สร้างfakeproductdata/CTA
- `src/features/catalog/components/products-index-content.module.css` — newscopedcardrailstylesตามapprovedprototype/responsive/keyboardfocus/scrollsnapgutteralignment
- `src/app/(site)/products/page.tsx` — ปรับProductsIndexContentcallsiteเลิกส่งpropsnavigation/categories/photosที่Mockไม่ใช้;คงroute/metadata/catalogdata/finder/shellcontracts
- `src/styles/header.css` — HomeNavbarcompactgap/fontเฉพาะ834–1023เพื่อให้เมนู9รายการfit;ไม่เปลี่ยนheight/breakpoint/interactions
- `src/features/catalog/components/products-overview.module.css` — matchinginternalNavbarcompactgap/fontเฉพาะ834–1023;ไม่แก้styleส่วนcontentอื่น
- `tests/catalog/primary-navigation.test.ts` — order/plainlink/dedup/nonmutation/CMSlabels assertionsและcategorysliceoffsetใหม่ โดยคง23children/companygroupchecks
- `tests/catalog/category-destinations.test.ts` — ปรับcategorysliceoffsetที่ได้รับผลโดยตรงจากplainlinkใหม่;คงlegacy/correctedprojectionและrelated-column assertionsเดิม (พบจากcatalog regressionหลังimplementation)
- `tests/e2e/all-products-navbar.spec.ts` — newdesktop/mobile/native-touch/keyboard/direct/modifiedlink/same-routeclose/order/no-submenu/no-overlapchecksของnewmenuทั้ง2Header
- `tests/e2e/products-full-overview.spec.ts` — migrate/productsdirectoryassertionsเป็น9Mocksections/36cards/rails/staticfallback/nativebounce;รักษาexplicitfinder/history/chromeและexistingcategoryherochecks
- `tests/e2e/scales-subcategory-pages.spec.ts` — migrateonlyretireddirectory-entryflowไปexistingNavbarchildlink;คงsearch/cache/membership/returnassertions
- `tests/e2e/indicator-subcategory-pages.spec.ts` — sameentry-onlymigration
- `tests/e2e/platform-subcategory-pages.spec.ts` — sameentry-onlymigration
- `tests/e2e/pos-subcategory-pages.spec.ts` — sameentry-onlymigration
- `tests/e2e/accessory-subcategory-pages.spec.ts` — sameentry-onlymigration
- `spec.md`, `plan.md`, `MEMORY.md` — actualapproval/contracts/resultsและnewmockpurpose โดยรักษางานก่อนหน้า
- `output/all-products-navbar-nine-sections-20261110/` — prototype/readonlymeasurements,beforehashes/privateQA/logs/screenshots/report;ไม่copyenvironmentfiles

ExistingHeader/PrimaryNavigationeventhandlers,ProductsOverview,motionhook,ProductsdirectorysharedstylesและFooterเป็นread-onlyในแผนนี้;ไม่deleteunusedfiles/cleanupนอกscope

## Steps

- [x] อ่านsource/spec/memory/AGENTSและuserclarification/reference;ยืนยันexisting/productsroute/sharedbuilderและ9Mockcontentsectionsแทน9categories
- [x] ตรวจreadonlyNavbargeometry:9linksหลุดviewport834;compactgap14/linkgap8/font11fitทั้ง2variantsโดยคง834breakpoint
- [x] เตรียมstandalone9sectionMockwith4cardsและcapture390/1440;ยืนยัน9sections/36cards/no-body-overflowและgutteralignment
- [x] รับownerapprovalของconcreteSpec/PlanและMockก่อนapplication/testedits — ผู้ใช้ตอบ “อนุมัติ” เมื่อ2026-11-10
- [x] รับownerfeedbackว่าcontentชิดขอบซ้ายเกินไป;หยุดCSSrevisionและกำหนดconcretecontainer-alignedgutter32/48/1180ก่อนแก้ต่อ
- [x] รับownerconfirmationของrevisedgutter:32pxที่≤600 และ `max(48px, calc((100vw - 1180px) / 2))` เมื่อกว้างกว่านั้น (130pxที่1440) — ผู้ใช้ตอบ “อนุมัติ” เมื่อ2026-11-10
- [x] Snapshotownedfiles/coherentruntimeและจัดprivateNode24QA/dev/build outputโดยไม่หยุดuserserversหรือcopyenvfiles
- [x] เพิ่มsharedNavplainlinkและ2CSScompactrangesตามmeasuredproposal;คง300ms/navigation/focus/mobilecleanup
- [x] ปรับ/productsRSCMockcontent+newCSSmodule/callsite;คงexplicitfinder/legacyqueries/Header/Footer/othercategoryroutes
- [x] ปรับlistedunit/browsercontractsที่retireddirectoryentryโดยรักษาfunctionalassertionsทั้งหมด;เพิ่มnewmenu/railcounts/keyboard/native-touchchecks
- [x] ตรวจ320/390/600/768/834/930/1024/1440/1920,noNav/bodyoverflow,cardrailkeyboard/touch/focus,Mock36cards/9sectionsและoneH1;assert leftedge32px@390,48px@834/1024,130px@1440และcardpeekคงอยู่
- [x] ตรวจoriginalNavhover/rearm/cache/search/compare/categorysubgroups/finder/returns/Homebypass/800msbounce/staticFooterและactualdevhydration
- [x] Runscopedformat/lint/fulltypecheck/catalogunits/productionbuildและaffectedbrowserregressions;source-preservationaudit/screenshots
- [x] อัปเดตactualresults/contracts/checklists/report,reviewNextfeedbackและส่งverifiedpreviewโดยไม่commit/push/deploy

## Impact / Rollback

R1: sharedNav1file+2sharedCSSfiles;live/productscontent1component/callsite. Newplainlinkไม่เปลี่ยนhandlers/menuURLsอื่น. CompactCSSเฉพาะ834–1023(font11,gap14/8)ยืนยันด้วยbrowserexperimentแล้ว;ทำresponsive/interactionregressionหลังintegration. Revisedcontentgutterเปลี่ยนเฉพาะlocalCSSModule variableและไม่แตะshared `--overview-gutter` นอกProductsIndexContent. Replacingdirectoryต้องmigrate5entryflowsอย่างตรงไปตรงมาไม่เก็บhiddenoldcontentเพื่อหลบtestfailure. Restoreเฉพาะowneddeltaจากsnapshot ไม่resetunrelatedwork

## Verification Results

Done. Sharedbuilderเพิ่มplain `/products` linkก่อน5หมวดเดิมและส่ง `groups: []` เพื่อไม่ให้Home fallbackสร้างsubmenu;ไม่แก้Header event handlers. `/products` เป็นRSC9sections×4Mockcards,newscopedCSS,explicitfinderเดิมและnativefocusable scroll-snap rails. CompactNavbarCSSทำงานเฉพาะ834–1023. Revisedgutter32/48/container1180ถูกใช้กับH1/intro/section/cardfirst edgeทั้งหมด

Verification: Node24build465/465และsource `src/` ทั้ง245ไฟล์ตรงisolatedbuild;catalog122/122;fullTypeScript,scopedESLint/Prettier/diff-checkผ่าน. Production33/33all-products/Navbar/page casesและ129/129existingNavbar+5subgroup suitesผ่าน. Isolateddevcoldrunผ่าน32/33;finderfocus assertionที่missครั้งเดียวผ่านimmediatererun1/1 และresponsive casesไม่มีpageerror. 9responsivepage casesยืนยัน9×4/H1เดียว/no fake facts/no bodyoverflow/rail scroll;10Header geometry casesยืนยันbothvariantsfit834/930/1023/1024/1440. Exactleftedges32@390,48@834/1024,130@1440และfinalscreenshotsตรวจแล้ว

Finder/search/focus/legacyquery,23categorychildren,all5subgroupreturns,300mshover/rearm/keyboard/touch/modified tabs,referencebounce/reduced,Home/Footer static pass. RawserverresponseมีcompleteMockmarkup/no leaf motion marker;browser JS-disabled CacheComponents streaming remains an inherited limitation and was not changed. Final6appfilesmatchprivateQA;4protectedsharedruntimefilesbyte-matchpriorverifiedsnapshot. Noenvcopy/DBwrite/dependency/commit/push/deploy/user-serverstop. Verifiedpreview3021;delivery `output/all-products-navbar-nine-sections-20261110/delivery.md`

---

# Plan: Keep the final category index and Footers static (2026-11-09)

Status: "Ready to Code"
Approval: "Approved owner-directed exception — สองส่วนสุดท้ายไม่ต้องใส่เอฟเฟกนี้"

## Files

- `src/components/ui/use-stagger-bounce.ts` — เพิ่ม3existingwrapperselectorsในexcluded;ไม่เปลี่ยนprofile/lifecycle/DOMbookkeeping
- `tests/e2e/sitewide-stagger-bounce.spec.ts` — ปรับpositive/negativecoverageตามfinalsectionexclusion;ย้ายoffscreen/late-callbacktargetไปmaincontent;ตรวจ5overviewindexes/Footersและcontrols
- `spec.md`, `plan.md`, `MEMORY.md` — บันทึกlatestexclusion/approval/resultsโดยรักษาประวัติเดิม
- `output/stagger-final-sections-exclusion-20261109/` — 2ownedfilesnapshot,sourcehashes,privateQA/logs/screenshots/report;ไม่copyenvfiles

## Steps

- [x] ใช้ข้อความแก้ไขล่าสุดแทนturnที่ยกเลิก;ตรวจภาพ/selector/source/memoryและapprovedhookscope
- [x] ระบุconcrete2-fileplanและบันทึกคำสั่งยกเว้นที่ผู้ใช้ให้ชัดเจนก่อนapplicationedits
- [x] Snapshotcoherent3016baselineและ2ownedfiles;privateNode24dev/prodQAโดยไม่หยุดuserpreviews
- [x] เพิ่มspecificexcludedwrappersในhook;ปรับsitewidesuiteโดยรักษาcontentpositiveassertionsและnativeprofile/triggerchecks
- [x] ตรวจ95template/widthcombinationsและ5categoryindexesที่390/1440ว่ามีnativecreations0ในstaticregions แต่contentอื่นยังanimate;ตรวจfinder/Footernativemobilecontrolsและcache/reentry
- [x] ตรวจexistingdevelopmenthydration5cases,profile/focus/dynamic/reduced/API/no-JS/Homeและsource/settledgeometryparity
- [x] Runformat/lint/typecheck/buildตามscope;บันทึกผลจริงและdelivery,reviewNextfeedback,คงpreviewโดยไม่commit/push/deploy

## Impact / Rollback

เปลี่ยนเฉพาะknownfinalwrapperselectionในsharedhookเดิม ไม่มีUI/props/routes/CSSchange. Snapshot2ownedfilesและrollbackเฉพาะdelta ไม่resetworkingtree. Preserve800msreferenceprofileและส่วนที่ยังรับmotionทั้งหมด

## Verification Results

Done. ใช้existing3specificwrapperselectorsในexcludedlistเท่านั้น;runtimeprofileและlifecycleส่วนที่เหลือbyte-identicalหลังตัดsuffixselectorออกเทียบbefore. Sitewidesuiteตรวจpositivecontentและnegativefinalregions,ใช้maincontentแทนFooterในoffscreen/late-callbackfixtures. ไม่ใช้blanketHTMLfooterexclusion

Singleproductionrun66/66pass(4.7m):95template/widthcombinations,all5categoryindex/Footersที่390/1440มีrecorded/active nativecreations0และbaseCSSreadable,realindexfinder+mobileFooterdetailsทำงาน,24Navbarcases,referencepaint/once/dynamic/focus/reduced/API/no-JS/Home/cachechecks. ActualdevCPU4x+1200msdelayedchunks5/5pass(3.2m),0hydration/pageerrors/leafmarkerwrites

Node24build465/465,fulltypes/scopedlint/format/whitespacepass. Responsive15/15baseline3016vs3018text/links/images/geometrymatchesat320/390/768/834/1440(Home/Scalesreduced,Aboutnormalsettled). Screenshotfinalindex390/1440ตรวจแล้ว;redfocusringเป็นexistingkeyboardfocusหลังfinderEscape ไม่ใช่designchange. Coherentbaseline0srcmismatches. Sourceaudit404paths402unchanged,only2approvedchanges,0added/unexpected;livehookตรงกับprivateQAทั้ง2

NoCSS/layout/widget/Navbar/data/dependencychange,environmentfilecopy,DBwrite,user-serverstopหรือcommit/push/deploy. FinalNextfeedbackreviewไม่มีqualifyingissue. Previewprod3018/dev3017คงไว้. Evidence/limitations: `output/stagger-final-sections-exclusion-20261109/delivery.md`

---

# Plan: Reference stagger bounce-pop on first viewport entry (2026-11-09)

Status: "Ready to Code"
Approval: "Approved — อนุมัติ"

## Files

- `src/components/ui/use-stagger-bounce.ts` — เปลี่ยน2framesเป็นopacity/translate/scaleตามreference,800ms/easingและ100+150ms stagger;รักษาobserver/grouping/focus/cleanup/Home bypassและhydration-safe state
- `tests/e2e/sitewide-stagger-bounce.spec.ts` — ปรับnativeprofile/paint checksและเพิ่มoffscreen→entry→scroll-reentry/long-listตรวจจริง;รักษาexistingcontent/Home/focus/dynamic/fallback assertions
- `tests/e2e/category-intro-motion.spec.ts` — ปรับopacity,scale,timing/delay assertionsเท่านั้น;รักษาribbon/finder/URL/reload/history/static checks
- `tests/e2e/solutions-intro-motion.spec.ts` — ปรับ3chapter timings/profileตาม100/250/400ms;รักษาribbon/reduced/no-JS checks
- `spec.md`, `plan.md`, `MEMORY.md` — ข้อกำหนด/approval/actualresultsและบทเรียนการใช้exact motion referenceโดยรักษาประวัติเดิม
- `output/stagger-bounce-reference-20261109/` — owned source snapshot,privateQA,logs/native paint samples/screenshots/verification report;ไม่copyenvironmentfiles

## Steps

- [x] อ่านreference,trigger clarification,currenthook,version/lockfile,design tokensและhydration/pointer-focus memory
- [x] บันทึกexactnumeric profile,scope,first-entry/once-per-visit contractและshared impact;ทำconcretefile plan
- [x] รับอนุมัติSpec/Planที่เปลี่ยนprofileนี้และบันทึกข้อความจริงก่อนruntime/test edits
- [x] Snapshotownedsourceและcoherentbaseline;ใช้privateNode24dev/build outputและportที่ว่างโดยไม่หยุดuser servers
- [x] ปรับเฉพาะhookและ3motion suitesตามprofile;ไม่แตะNavbar/CSS/layout/child DOM bookkeeping
- [x] ตรวจnativeframes/timingและactualpaintเทียบreference:3ชิ้นdelay100/250/400,overshoot/settle/scale;ตรวจรายการยาวที่ไม่มีcapเดิม
- [x] ตรวจoffscreen0→enter1→reenterยัง1,dynamic insertion,keyboard/pointer/reduced/API/no-JSและHomebypass
- [x] Runexistingdevelopmenthydrationregressionด้วยCPU4x/delayedchunksและactualchildreadiness;ห้ามใช้marker-strippingหรือwarningsuppression
- [x] ตรวจresponsive320/390/768/834/1440และNavbarregressions,settledgeometry/sourceparity;scopedformat/lint/fulltypecheck/relevantbuild
- [x] อัปเดตSpec/Plan/evidenceตามผลจริง,reviewNextfeedbackหนึ่งครั้ง,ส่งมอบpreviewโดยไม่commit/push/deploy

## Impact / Rollback

Sharedruntimefile1file ส่งผลเฉพาะexistingnon-homecontenttargets. Motionเปลี่ยนจาก650ms/80ms/no-scaleไปเป็นexact800ms/150ms/scaleprofile;กลุ่มยาวอาจรอมากขึ้นและopacity0อาจเปลี่ยนheadingpaint จึงตรวจจริงก่อนส่ง. ไม่มีAPI/route/DOM-interfacechange. เก็บownedsnapshotและrestoreเฉพาะdeltaงานนี้ ไม่resetworkingtreeหรือหยุดpreviewของผู้ใช้

## Verification Results

Done after explicit “อนุมัติ”.1runtimehookและ3scopedsuitesเปลี่ยนตามapprovedprofile;selection/grouping/lifecycle/Home/Navbar/hydrationbookkeepingคงเดิม. Native2keyframes800ms,easingตรงreference,100/250/400msstagger;3cards×10times×3computedpropertiesต่างจากCSSreference0. Overshoottranslate−3.73938px/scale1.0187แล้วsettle. Offscreen0→enter1→reenter1และdynamic/focus/reduced/static/API/Homechecksผ่าน. Long-listScales8chapterdelays100…1150ms;Explore6visiblecards1600…2350ms(รวมprecedingtargetsinexistinggroup)ตามnocapที่อนุมัติ

Production69distinctcasesมีpassingevidence:initial59/64pass;category+heading27/27และnative3/3rerunsresolveall5initialfailures.4mobilefixturesfrozeใหม่offscreenbuttonsตลอดจนค้างใต้gallery;ปรับtest-onlyfreezeให้ครอบคลุมprofilemeasurementแล้วปล่อยlaterrevealเล่นปกติ ยังคงrecording/realclick/finder/reload/onceassertions. อีก1fixtureอ่านexplicitoffsetที่ไม่ได้กำหนด แก้เป็นcomputedOffsetตามbrowserAPI. ไม่มีappchangesหลังcandidatebuildหรือwarning/functionalassertionsuppression

ActualNode24developmentCPU4x+1200msdelayedchunks5/5passรวมcold/reload/controls/gallery/clientnavigation/cachedhistory;0hydration/pageerrors/markerwrites. Node24build465/465,finaltypes/lint/format/whitespacepass. Responsive15/15baselineparityที่320/390/768/834/1440(Home/Scalesreduced,Aboutnormalsettled);normalizeเฉพาะQAimageorigins.4settledscreenshotsเก็บแล้วและmobileScales/desktopSolutionsตรวจด้วยสายตา พร้อมmid-bounce3chapterimage

Coherentbaseline3014sourcematchesbefore0mismatches. Finalaudit404paths400unchanged,4approvedchanges,0new/0unexpected;bothprivateQAhooksตรงกับlive. Ownprivate.next/generatedoutput,ไม่copyenvfiles/แก้Navbar/CSS/layout/data/dependencies/DB/หยุดuserpreviews/commit/push/deploy. FinalNextfeedbackreviewไม่มีqualifyingframeworkissue. รายละเอียดและlimits: `output/stagger-bounce-reference-20261109/delivery.md`. Previewprod3016/dev3015ยังพร้อมใช้งาน

---

# Plan: Hydration-safe stagger animation bookkeeping (2026-11-09)

Status: "Ready to Code"
Approval: "Approved — อนุมัติครับ แก้ hydration warning ตามแผนได้เลย โดยคงแอนิเมชันและ Navbar เดิมไว้ครับ"

## Files

- `src/components/ui/use-stagger-bounce.ts` — retire descendant DOM state attributes, use existing managed/seen/animations for bookkeeping and focus ancestor lookup; retainrootmarker/native animation/grouping/cleanup/home bypass
- `tests/e2e/helpers/stagger-motion.ts` — new test-only native animation recording/query helper so assertions read actual keyframes/timing/targets without adding production DOM markers
- `tests/e2e/stagger-hydration.spec.ts` — new cold development+delayed child hydration regression, console/pageerror capture, real motion and reload/navigation checks
- `tests/e2e/sitewide-stagger-bounce.spec.ts` — move marker-based section/dynamic/focus/late-callback checks to observable native animation behavior; preserve allwidth/Home/cleanup assertions
- `tests/e2e/category-intro-motion.spec.ts` — update title/chapter marker assertions only; retain timing/keyframe/ribbon/focus/reload/finder/history/static checks
- `tests/e2e/solutions-intro-motion.spec.ts` — update marker assertions; retain3chapters/native timing/ribbon/reduced/static coverage
- `tests/e2e/industrial-scales-page.spec.ts` — replaceheadingmarkercheck with actual native animation evidence; keepdata/controls/return checks
- `tests/e2e/scales-subcategory-pages.spec.ts` — same nativeheading verification for allknown groups, retainingallfunctional assertions
- `tests/e2e/indicator-subcategory-pages.spec.ts` — same nativeheading verification, retainingoverlapping memberships/returns
- `tests/e2e/platform-subcategory-pages.spec.ts` — same nativeheading verification, preserving4materials/ABS Mock behavior
- `tests/e2e/accessory-subcategory-pages.spec.ts` — same nativeheading verification, preserving5groups/Mock/consumable dedup/returns
- `spec.md`, `plan.md`, `MEMORY.md` — approval/contracts/results and verified development-hydration failure lesson; preserve all other tasks
- `output/stagger-hydration-mismatch-20261109/` — diagnostic recordings, before/after snapshots, own private dev/build, logs/parity/screenshots and delivery; no liveenvironment files copied

ไม่แก้ CatalogRouteFrame, ProductsOverviewหรือwidget/page components, Navbar/CSS/data/dependenciesในแผนนี้ หากหลักฐาน implementationแสดงว่าต้องเพิ่ม runtime filesให้เสนอ scope deltaก่อนแก้

## Steps

- [x] Read attachment and current source/memory; inspect existingmarker users and actualClient owner boundaries; review official React hydration contract and local Nextguide
- [x] Reproduce clean Chrome CPU4x+1200ms child chunk delay onscales and3current templates; record extra markerswhileowner readiness=false and hydrationwarnings1/1/1
- [x] Browser-only causal experiment removes onlydescendant markers: warning0/0/0 with native animation counts19/10/25unchanged; no application/test changes
- [x] Prepare concrete1runtime-file fix + test migration scope and explicitapprovalPending record
- [x] Receive ownerapproval of this Spec/Plan before application/test edits and record actualmessage
- [x] Freeze coherent latestsource and baseline dev/prod artifacts; record private QA workdirs/ports and preserve current dev3000 and all production previews
- [x] Remove descendant DOM state writes/cleanup and use managed ancestor lookup; retainroot-owned state marker, native animation ID/timing/grouping/preference/lifecycle behavior
- [x] Add test-only native recorder and new dev hydration regression; migrate8marker-based motion suites without weakening existing functional assertions
- [x] Verify unmodified clean browser oncandidate development with delayed chunks/CPU4x and explicitchild hydration completion; nowarning suppression/injected stripping/fixed delay asproof
- [x] Verify production465/currentcount build, types/lint/format/catalog units and relevantbrowser regressions: cold/reload/navigation/cache, dynamic content, keyboard/reduced/API/static fallback and wholehomepage bypass
- [x] Compare responsive text/links/images/settledgeometry and protectedsources; preserve Navbar300ms/mobile/click behavior and existing source work
- [x] Update actualresults/contracts/checklists/delivery, reviewNextfeedback once afterverification and preserve ownpreview/reversibility; no commit/push/deploy

## Impact / Rollback

R1 sharedmotion metadata lifecycle. Retire internal leaf markers rather than adding readiness fields across allwidgets or guessing a globalhydration timeout. Changes confined to1hook andlisted testfiles; visual/userflow contracts unchanged. Keep exactsource snapshots and own .next/generated output. Restore only owned deltas ifneeded, never reset global working tree or stop a user/other task server

## Verification Results

Done after explicitowner approval.1runtime hook drops childmetadata writes while preservingnative timing/lifecycle/Home exclusion;8existing suites migrated andnative recorder+development suite added. Baseline1/1/1hydrationwarnings become0/0/0 withsame19/10/25native creations onlive dev. Private Node24dev3013 CPU4x/delayed chunks passes3cold+reload cases and2gallery/clientcached-history cases. No warning suppression orattribute stripping in candidate checks.

Production Node24build465/465,catalog122/122 andfinal TypeScript/ESLint/Prettier/whitespace pass.161distinct browser cases havepassing evidence:153initial plus1platform and7targeted retries. Initialrun retains2worker-exit errors and8failed cases; retry evidence resolvesall8, includingtest-onlymulti-footer selector andcached active-animation assertion fixes. Earlierdevelopment fixture usedan unescapedqueryURLregex andcold readiness bound; corrected URL/realreadiness checks, keptallfunctional assertions. Transientdata-load/timeouts retained, no unrelatedappfixes.

Responsive15/15baseline/candidate text/links/images/settledgeometry matches at320/390/768/834/1440; image URLs normalizeonlydifferentQA origins.4settled screenshots saved, mobileScales/desktopSoftware inspected. Sourceaudit402existingpaths:393unchanged,9approvedchanges(1hook+8tests),2testfilesadded. Navbar/CSS/layout/data/dependencies andgeneratedclient unchanged. PrivateQA ownsits .next/client, noenvironmentfilescopied, nodatabasewrites/serverstops/commit/push/deploy. Nextfeedback reviewed once, noqualifyingframeworkcandidate.

Delivery/evidence/limitations: `output/stagger-hydration-mismatch-20261109/delivery.md`. Productionpreview `http://127.0.0.1:3014/`; development `http://127.0.0.1:3013/`.

---

# Plan: Navbar hover intent and post-click submenu rearming (2026-11-09)

Status: "Ready to Code"
Approval: "Approved — อนุมัติครับ ปรับ Navbar ทั้งหน้าแรกและหน้าภายในตามแผนได้เลยครับ"

## Files

- `src/components/layout/primary-navigation.tsx` — scoped desktop hover timer300ms, pointer/keyboard distinction, click-only toggle, post-click rearming, pending timer/route/resize cleanup; preserve mobile/link semantics
- `src/components/layout/header.tsx` — scoped Home desktop hover80→300ms and matching pointer-focus/post-click suppression; reuse existing timers, preserve current Header structure/measurement/mobile/opening/style contracts
- `tests/e2e/navigation-hover-intent.spec.ts` — new behavior-level timer/cancellation, fixed-pointer click/route transition, click-toggle, keyboard, panel hit targets/native touch/breakpoint checks for both Header variants
- `spec.md`, `plan.md` — scopedproposal, actualapproval, actualresultsและknownlimits โดยรักษาหัวข้องานอื่น
- `MEMORY.md` — บันทึกบทเรียนตาม AGENTS: native Ctrl+click new-tab ต้องรอ browser-context page event ไม่สมมติ opener popup
- `output/nav-hover-intent-20261109/` — task-owned baseline/source/geometry evidence, browser screenshots/traces/logsและdelivery; no liveenvironment files copied

ไม่มีapplication/test editก่อนอนุมัติ รายการนี้ไม่รวม CSS/global layout/new dependency/helper abstraction หรือ test rewritesอื่น หากต้องเพิ่มไฟล์implementationนอก2componentsนี้ ให้เสนอ scope deltaก่อนแก้

## Steps

- [x] อ่าน currentSpec/memory,2Navbar sources/styles/breakpoints และ existing navigation tests; review original UX research/W3C pointer+keyboard guidance
- [x] ตรวจcategory clicksบน2Header variantsโดยคงpointerเดิม (ทั้งสองsampleปิดปกติ) และทดสอบปุ่มโซลูชันhoverแล้วคลิกสองครั้งยังexpandedทั้งคู่ ตรงกับsourceที่ไม่มีtoggleclose; ไม่เหมารวมอาการทุกroute
- [x] จัด concrete300ms hover + post-click suppression/click-only toggle proposal พร้อม file scope/shared impact
- [x] รับอนุมัติข้อเสนอและ2shared-component scopeนี้ก่อนapplication/test edits; บันทึกข้อความจริง
- [x] Snapshot latest2componentsและreference runtimeที่sourceตรงกัน แยก concurrentaccessory/motion work; baseline realhover/click-only/differentroute/focus/geometry
- [x] แก้desktop interactionใน2componentsตามapprovedcriteria ยกเลิกpending timerเมื่อleave/click/Escape/route/resize/unmount; ไม่ให้pointer focus bypass delay
- [x] เพิ่ม newbrowser suite ตรวจ <300ms/no-open, >=300ms/open, oldtimercancel, clicknavigateทันที, repeatedbuttonclick, fixedpointerthroughroute/Headerchange และrearmเมื่อleave/reenter
- [x] ตรวจkeyboard ArrowDown/Enter/Tab/Escape, submenu travel/click/backdrop, modified/new-tab links, native mobiletouchและ320/390/768/834/1440 geometry; Headerหน้าแรก/openingและstaggerbypassยังเดิม
- [x] Run scopedPrettier/ESLint/TypeScript, relevantunit/buildและnavigation/cache/browser regressionsในisolatedsnapshot ไม่หยุดpreview/QAของงานอื่น
- [x] อัปเดตจริงในSpec/Plan+delivery/preservation audit; reviewNextfeedbackหนึ่งครั้งหลังตรวจ และส่งมอบverifiedpreview โดยไม่commit/push/deploy

## Impact / Rollback

R1 sharednavigation behavior acrossallroutes plushomepageHeader. เปลี่ยนเฉพาะ2event/timer lifecycles ไม่เปลี่ยนCSS/DOM/links แยกpointerfocusจากkeyboardและตรวจroutecache/keyboard/mobileอย่างเจาะจง เก็บexactbaseline2files+build rollbackเฉพาะown delta ไม่resetงานอื่น หากactual click-only behaviorต้องปรับต่างจากproposal ให้รับอนุมัติbehaviorที่เปลี่ยนก่อนcode

## Verification Results

Done. Two approved components implement300ms hover, post-click leave/reentry gating, pointer/keyboard focus distinction, click-only toggle and timer/route/breakpoint cleanup. Full workspace TypeScript and scoped ESLint/Prettier/whitespace pass. Node24.22.1 configured isolated build465/465; catalog122/122pass.

24new browser behavior cases have latest passing evidence. Combined new+existing navigation run42/44passed;2new-tab fixtures waited for opener-popup instead of native context-page events and targeted2/2pass after test-only correction. Home native summary selector was corrected without application markup changes. Existing12sitewide+8subcategory cases and14active Home/Hero/opening/bounce regressions pass:58distinct relevant cases have passing coverage, no claim of a full-repository browser run.

299msclosed/300msopen, early leave/switch/Escape/resize cancellation, click navigation/toggle, pointer-focus non-bypass, keyboard immediate focus/ArrowDown/Enter/Escape, stationary cursor across Header/route changes, cached Back/Forward, Ctrl-click new-tab URLs and native touch pass.15responsive Header/logo/control/label/href signatures match baseline3007 exactly at320/390/768/834/1440. Settled normal-motion Home/internal submenu screenshots inspected.

Source audit401paths:399unchanged,only2approved app changes+1new suite,0unexpected; own live files match builtQA. No CSS/global layout/data/dependency/route changes. MEMORY+observer record native modified-link test event lesson. Next feedback reviewed once: no new qualifying framework issue.

Delivery: `output/nav-hover-intent-20261109/delivery.md`. Preview `http://localhost:3012/` / `/contact-us` runs Node24production server; previous previews3000/3010/3007 and other QA preserved. No environment files copied, commit/push/deploy or database write.

---

# Plan: Accessory subcategory separate pages (2026-11-09)

Status: "Ready to Code"
Approval: "Direct owner request for5accessory groups using approved subgroup pattern"

## Files

- `src/features/catalog/data/product-subcategory-pages.ts` —5source accessory page/title/return records; preserve18existing records
- `src/app/(site)/products/category/accessories/[group]/page.tsx` —5bounded static params/metadata using unchanged shared template
- `src/features/catalog/data/category-destinations.ts` — exact consumables alias to own page; broader accessory aliases unchanged
- `src/features/content/data/buying-guides.ts` — one consumables href only
- `tests/catalog/product-subcategory-pages.test.ts`, `category-destinations.test.ts` — exact5paths/contexts/parent boundary/alias, retaining prior coverage
- `tests/e2e/accessory-subcategory-pages.spec.ts` —5groups membership/order/count/Mock/dedup, controls/return/overlap, entries/history/native touch/responsive/shared-motion
- `tests/e2e/accessories-overview.spec.ts`, `catalog-subcategory-navigation.spec.ts`, `sitewide-navigation.spec.ts` — update promoted accessory expectations and final23-page contract; preserve parent finder/search/category/reset/comparison coverage
- `spec.md`, `plan.md`; `output/accessory-subcategory-pages-20261109/` — approval/baseline/private QA/runtime evidence/delivery
- `MEMORY.md` — record regression-test cloning/import and complete typecheck lesson; no application behavior change

## Steps

- [x] Inspect instructions/spec/memory,5source groups/dedup and existing shared template/tokens/local Next routing docs; record direct authorization and isolated verification boundary
- [x] Snapshot live source and coherent reference3010 source/runtime,24older pages and5old accessory finder orders/photos
- [x] Add5records/route and exact consumables targets without editing template/style/motion/data
- [x] Run scoped formatting/lint/catalog units and configured isolated Node24build/TypeScript on private QA; preserve all other servers/output
- [x] Verify5groups/cables Mock/dedup, all23menus/guide/query/alias/returns/history/cache/native touch, responsive/shared-motion/performance and protected-source/runtime parity
- [x] Record actual results, update docs and deliver verified Preview3007 without release

## Impact / Rollback

R2 additive registry/route plus exact consumables links. Existing generic consumers handle the5new records. All known child queries now canonicalize to pages; parent finder remains intentional. Snapshot and restore only task deltas. Independent motion/Figma source and servers3000/3006/3010 are preserved. No dependency/database/global style edits.

## Verification Results

Done. Final configured QA3007 session40976 build465/465 and complete TypeScript pass. Initial build exposed a duplicated test import; fixed test-only and retained build-initial.log. Scoped final formatting/lint and122/122catalog units pass. Initial52/52pilot and47/48regression pass. One unchanged older directory CSS0.8s expectation also fails identically against reference3010; preserve it and the trace rather than edit unrelated coverage. Final accessory24/24 and affected motion/cache9/9pass:103distinct scoped browser cases have passing coverage across runs, alongside the documented baseline failure.

QA has private source/generated/.next and loads original workspace environment transiently without copying credential files. During testing the independent motion task completed a verified stale-observer cleanup guard without changing its motion profile. Synced its verified hook into this private QA only, rebuilt, and reran affected accessory/motion/cache behavior. All3motion app hashes match current verified root/motion QA. Root shared source and other servers remain untouched; only the owned initial3007listener was stopped/replaced.

Final strict parity passes24prior page text/image signatures and5old-finder-to-inline models/order/photos/detail paths, normalizing only added return context. Ten CPU4x cases at390/1440wait for heading completion/no running main animation: CLS0/no overflow. Three screenshots inspected; responsive320–1440/native touch and controls/returns/shared models/query/alias/guide/history/cache pass. Initial/final logs retained separately.

Preservation:352unchanged,8owned existing deltas,2concurrent motion deltas,no unexpected paths;2new owned files. All10owned QA/live paths match. Source data/dedup/manifests/template/global CSS/locks remain unchanged. MEMORY and sanitized observer79record the test-cloning/typecheck correction. Main3000/POS3006/motion3010 kept running unchanged. Existing no-JS limitation and one unrelated baseline test mismatch remain explicit. Final feedback review found no qualifying Next.js issue. No commit/push/deploy or database/dependency actions.

---

# Plan: POS platform subcategory separate pages (2026-11-09)

Status: "Ready to Code"
Approval: "Direct owner request for3POS groups using approved scales subgroup pattern"

## Files

- `src/features/catalog/data/product-subcategory-pages.ts` — add3POS records/titles/paths/return contexts using source labels; preserve existing15records
- `src/app/(site)/products/category/pos/[group]/page.tsx` —3known static parameters/metadata/unknown guard using current server template
- `src/features/catalog/components/products-index-content.tsx` — link existing iOS label/status to its actual empty page; preserve other directory markup/design
- `src/features/catalog/data/category-destinations.ts` — exact Android/Windows legacy destinations become canonical child pages
- `src/app/(site)/[...path]/page.tsx` — existing bounded subcategory-alias redirect guard accepts known POS children as well as scales; no other catch-all behavior change
- `src/features/content/data/buying-guides.ts` — two POS platform hrefs only; preserve guide copy/images/structure
- `tests/catalog/product-subcategory-pages.test.ts`, `category-destinations.test.ts` — POS route/context/parent guard/legacy expectations, retaining prior coverage
- `tests/e2e/pos-subcategory-pages.spec.ts` — exact3platform membership/order/count/empty behavior, controls/return/entry/history/native touch/responsive/motion
- `tests/e2e/pos-overview.spec.ts`, `catalog-subcategory-navigation.spec.ts`, `sitewide-navigation.spec.ts`, `products-full-overview.spec.ts` — only affected POS/active-directory/history expectations; retain accessory local filters and explicit all-model finder
- `spec.md`, `plan.md`; `output/pos-subcategory-pages-20261109/` — approval, snapshots, actual verification and delivery; MEMORY only for a new reusable lesson

## Steps

- [x] Inspect instructions/spec/memory,3source groups, current template/tokens/local Next page/static-params docs; record direct authorization and concurrent motion-planning boundary
- [x] Snapshot source/configured3POS finder orders and15existing subgroup/unaffected page signatures
- [x] Add3bounded pages and canonical/empty-directory/guide/legacy return wiring without changing motion/layout/styles/data
- [x] Run scoped format/lint/typecheck/catalog units and configured production build; preserve previous owned preview build and avoid concurrent build output conflicts
- [x] Verify all3POS groups, empty iOS, menu/guide/story/legacy/old query/return/history/cache/native touch, responsive/motion/performance and protected-source/page parity
- [x] Update docs/evidence/local preview and deliver without commit/push/deploy

## Impact / Rollback

R2. Shared registry/catch-all guard expands only to known POS groups; iOS directory affordance changes to a real link with existing empty annotation. No template/global layout/CSS/motion edits. Preserve prior uncommitted work and concurrent bounce/Figma notes. Snapshot and restore task-only deltas if needed; no database/dependency action.

## Verification Results

Verification isolation applied. The stagger-bounce task was approved concurrently and began shared frame/CSS edits. Preserve those files. Build/run a private QA source copy under output/pos-subcategory-pages-20261109/qa on port3006 with its own generated source/.next and protected pre-bounce frame/CSS. Load original workspace environment in process only, without copying environment files or emitting values, for the same configured read-only data provider. Protect main preview3000session9713 and the other task's build. New POS motion coverage compares the existing subgroup profile rather than hardcoding a future-incompatible timing. Delivery identifies this preview/isolation boundary.

Result: Done. Scoped format/lint and catalog120/120pass; configured isolated Node24build459/459 and TypeScript pass. An obsolete unit expected URL separator was corrected, without app changes; initial log retained. Browser47pilot pass; broad46pass/1initial existing desktop price-menu navigation failure, unchanged all23desktop targeted rerun1/1pass. No HTTP failures in initial trace; root cause unproven, logs retained. Latest passing94scoped cases, not the whole suite or a claim of a green first batch.

All3POSgroups,0iOS/2Android/1Windows, no invented Mock, source order/photos, search/reset/view/featured, available single/two-product comparison, same/fresh/default returns, directory/chapters/old queries/exact aliases/guide/story/native touch/history/cache and320–1440/shared-profile/reduced fallback pass.21original page text/images and3old-finder-to-inline signatures exact. Six CPU4x cases CLS0/no overflow/settled motion;3screenshots inspected.

Workspace audit:341unchanged,11owned existing deltas,7known concurrent motion deltas, no unexpected paths;1new route+1new browser test. Owned QA/live files match; current motion/global CSS/source generation was not overwritten. Frozen source uses pre-bounce frame/CSS only in the private copy. No environment files copied. Main preview3000 and other build output remain untouched; QA3006session82934 is the verified POS preview. Future combined build must include current3POSroutes as well as the independent bounce changes; that combined motion is not claimed verified here. No commit/push/deploy/database/dependency changes or new verified Next feedback candidate.

---

# Plan: Sitewide stagger bounce excluding the entire homepage (2026-11-09)

Status: "Ready to Code"
Approval: "Approved — อนุมัติครับ เริ่มทำตามแผนได้เลย เว้นหน้าแรกทั้งหน้าไว้เหมือนเดิมครับ"

## Files

- `src/components/ui/use-stagger-bounce.ts` — สร้าง shared client hook สำหรับ active main/footer, semantic content groups, viewport stagger/bounce, streamed/new content, focus/reduced-motion/route cleanup และ hard bypass `/`; ใช้ native WAAPI ไม่เพิ่ม dependency/wrapper
- `src/features/catalog/components/catalog-route-frame.tsx` — ผูก ref/hook กับ div เดิม ใช้ pathname ที่มีอยู่แล้ว; รักษา Header/Footer ownership, className, overlay portal และ children structure เดิม
- `src/features/catalog/components/products-overview.module.css` — เปลี่ยนเฉพาะ title/chapter opacity entrance ที่ถูกแทนด้วย shared bounce; รักษา ribbon highlight/text color3s, component layout/tokens, carousel/hover/reduced-motion behavior อื่น
- `tests/e2e/sitewide-stagger-bounce.spec.ts` — สร้าง coverage ทุก route template/section, item ordering/overshoot/settle, first and late mounted content, Footer, whole-homepage exclusion, reduced/static/focus, navigation during reveal และ responsive geometry/content parity
- `tests/e2e/category-intro-motion.spec.ts` — ปรับ expectation จาก CSS opacity-only title/chapter เป็น shared bounce โดยคง ribbon/focus/reload/popup/static assertions
- `tests/e2e/solutions-intro-motion.spec.ts` — ปรับ shared entrance expectation ของ solutions โดยคงธุรกิจ/ลิงก์/เนื้อหาและ ribbon coverage
- `tests/e2e/industrial-scales-page.spec.ts` — ปรับเฉพาะ old0.8s CSS title assertion ให้ตรวจ native bounce/reduced motion; รักษา membership/controls/navigation checks
- `tests/e2e/scales-subcategory-pages.spec.ts` — ปรับเฉพาะ old title-motion assertions; คงทุกกลุ่ม/return/membership checks
- `tests/e2e/indicator-subcategory-pages.spec.ts` — ปรับเฉพาะ old title-motion assertions; คงทุกกลุ่ม/overlapping membership/return checks
- `tests/e2e/platform-subcategory-pages.spec.ts` — ปรับเฉพาะ old title-motion assertions; คง4materials/ABS Mock-only/search/return checks และรอไม่ให้ชนการแก้ของงาน platform ที่ยังเปิดอยู่
- `spec.md`, `plan.md` — บันทึกขอบเขต/approval จริง/contracts/checklists/results โดยเพิ่มหัวข้องานและรักษาประวัติ/งานอื่น
- `MEMORY.md` — บันทึกบทเรียนตาม AGENTS: อย่าจบ translation จาก pointer focus ก่อน click dispatch เพราะเปลี่ยน hit rectangle; keyboard focus ใช้ `:focus-visible` และทดสอบ trusted click ระหว่าง reveal
- `output/sitewide-stagger-bounce-20261109/` — task-owned baseline hashes, route/template/section inventory, screenshots, animation samples, parity/performance/build/test logs และ delivery report; ignored verification artifacts เท่านั้น

ไม่แก้ไฟล์อื่นโดยเงียบ ๆ หากพบว่าต้องเพิ่ม explicit marker ใน template นอก3application paths นี้ ให้เสนอ file/scope delta ก่อนแก้; การอ่านและทดสอบไฟล์เดิมอื่นทำได้ ไม่มีการแก้ `src/app/(site)/page.tsx`, Hero/HomeMotion, Header/Footer templates หรือ global stylesheet

## Steps

- [x] อ่าน applicable instructions, current spec/memory, design tokens, shared frame, active route templates และ existing motion/tests; อ่าน local Next Client Components/usePathname guidance
- [x] ยืนยันจากผู้ใช้ว่าเว้นหน้าแรก `/` ทั้งหน้า จัด Spec/Plan พร้อม file list และผลกระทบต่อส่วนกลาง
- [x] รับการอนุมัติ concrete Spec/Plan และบันทึกข้อความจริงก่อนแก้ application/test files
- [x] Snapshot latest source และ configured baseline หลังงาน platform ที่ทับซ้อนนิ่ง; map ทุก existing public route/template/visible section→target group; เก็บหน้าแรกทั้งหน้าเป็น protected baseline ใช้ data provider เดียวกัน
- [x] สร้าง hook และผูกกับ root div เดิมโดยไม่เปลี่ยน SSR markup/layout; target inner content/card/media/CTA groups ตาม DOM และไม่เลือก ancestor/descendant ซ้อนกัน; skip existing interactive effect owners/hidden subtrees
- [x] ใช้650ms/80ms stagger capped320ms/16→-3→1→0px finite bounce; เพิ่ม preference/focus/route visibility cleanup และการรับ streamed/new content โดยไม่ replay item เดิม; hard bypass ทั้ง main/footer เมื่อ pathname `/`
- [x] แทนเฉพาะ title/chapter CSS reveal เดิม รักษา ribbon และ motion อื่น; ปรับเจ็ด existing/new motion test files ตาม final behavior โดยไม่ลด functional assertions
- [x] Run scoped `bunx prettier --check`, `bunx eslint`, `bun run typecheck`, `bun run test:catalog`; ใช้ Node24 และ configured production build กับ isolated task-owned output/workdir ไม่แย่ง .next/dev/build หรือ QA process ของงานอื่น
- [x] ตรวจ browser ทุก template และ existing child route ที่รู้จัก; ตรวจ every visible section มี target, frame samples0/mid/overshoot/end และ final parity ที่320/390/768/834/1440; keyboard/native touch, after-sales tabs, product list/return/gallery/comparison, reload/cache/Back ระหว่าง reveal; unchanged legacy cases รายงานแยก
- [x] ตรวจหน้าแรก direct/Home→other→Back/other→Home ว่าไม่มี animation/style ใหม่ รวม shared Footer; run existing home-motion-cleanup/home-motion/hero-scene/brand-opening และ sitewide-navigation regressions ที่ตรง active scene
- [x] ตรวจ reduced motion ก่อน/ระหว่าง reveal, no-JS/API fallback เทียบ baseline, cleanup/error/console, overflow/section seam/target hit bounds,4xCPU CLS/LCP/long-task comparison ใน common observation window โดยไม่อ้างผล lab เป็น field metric
- [x] อัปเดต actual results/checklists/contracts ใน Spec/Plan และ evidence report; ตรวจ protected files/concurrent work, ทบทวน Next feedback candidates หนึ่งครั้ง และส่งมอบ local preview3010 หลัง build/test ผ่าน โดยรักษา shared3000 ไม่ commit/push/deploy

## Impact / Rollback

R1: เพิ่มพฤติกรรมใน shared frame และ shared category entrance CSS กระทบทุกหน้า public ที่ไม่ใช่ `/`; ส่วนกลางที่ขออนุมัติมี new UI hook + existing CatalogRouteFrame + feature CSS3pathsเท่านั้น ไม่มี wrapper/stacking context/route/data change และไม่แก้ homepage source

ความเสี่ยงหลัก: target inference ไม่ครบทุก template หรือเลือกทั้ง card และ copy ซ้อน, transform ของ carousel/gallery, fixed/sticky descendants, หน้าเก่าที่ cache ซ่อนอยู่, shared Footer ที่กลับเข้าหน้าแรก และ focus ระหว่าง reveal การตรวจต้องรวม intermediate frames และ navigation lifecycle จริง ไม่ใช้ settled screenshots อย่างเดียว

เก็บ source/build baseline แล้ว rollback เฉพาะ3application-file delta และ test expectation ของงานนี้ รักษางาน platform/indicator/scales/Figma และ uncommitted changes เดิมทุกส่วน ห้ามใช้ whole-tree reset ห้ามรีสตาร์ตหรือหยุด QA process ที่ไม่ได้เป็นเจ้าของ การ refresh preview ต้องใช้ build ที่ตรวจแล้วและไม่ชนการตรวจของงานอื่น

## Verification Results

- Delivered650ms/80ms capped320ms/16→-3→1→0px native bounce on existing main/footer inner content, excluding entire homepage; ribbon3s and existing effect owners retained. No dependency/wrapper/layout change
- Node24.22.1 configured isolated build459/459, catalog120/120, TypeScript/scoped ESLint/Prettier/whitespace pass; verified frozen candidate contains230app-source files outside generated client; its3motion files match delivered source, later accessory work excluded
- Core113distinct browser cases have latest passing verification: initial110passed/2old expectation failures; corrected current directory ribbon and closed-finder cached-history expectations, targeted7/7passed.19templates×5widths =95route-width audits including3concurrent POS children
- Additional12navigation+5current product-detail+3service+15active homepage/Hero/opening cases pass;148distinct relevant cases with passing coverage. Three unrelated legacy cases fail identically on matched baseline and candidate; assertions preserved and exact evidence retained in delivery report
- Foursoftware filters retain keyboard/hash/current state and exact8/3/4/1models versus baseline; not-found UI receives motion targets, with existing streamed HTTP200 status unchanged and documented
- Strict37page text/links/logical images/settled main-and-section geometry parity exact. Baseline POS QA3006/candidate3010 source SHA256 differ only in3approved motion paths. Normalize local image origin and existing carousel mirror copies symmetrically; no product data normalization
- Twelve4xCPU initial-viewport samples with equal minimum4s window: all CLS0/no overflow/no remaining bounce; candidate LCP212–692ms is a lab sample only. Inspected all four390/1440mid/settled screenshots
- 396baseline paths:377unchanged,8planned existing changes (2app+6tests),11concurrent POS-owned changes,0unexpected; new hook/new motion suite only for this implementation. Homepage/Hero/HomeMotion/Header/Footer/global styles/data/assets/manifests/locks/schema preserved
- Preserved original test assertions outside scope. Two old product-detail selector cases and direct `/#stories` viewport case fail on both builds. Static service-position check passes under reduced motion on both; normal interactive tabs pass. No claim to fix existing no-JavaScript streamed-hidden ancestors or to pass the whole repo suite
- Reviewed Next feedback once: no new qualifying framework issue; transient external DB build failure recovered. MEMORY/observer record pointer-focus hit-geometry lesson
- Preview: `http://localhost:3010/products/category/scales`, Node24production server; shared3000/.next and other QA unchanged. Evidence: `output/sitewide-stagger-bounce-20261109/delivery.md`; no commit/push/deploy/database change

---

Final cleanup audit: native observer callbacks ignore disposed effects and unmanaged targets. Final guard build459/459 and targeted17/17motion/history/HomeMotion checks pass, including replaying a queued Footer notification after returning Home. Scoped TypeScript10entry files with transitive imports and scoped ESLint pass. Full workspace typecheck was previously passing; the latest run is blocked by duplicate `accessorySubcategoryPages` imports at lines7/8 of the concurrent accessory catalog test. That file is outside this task and was preserved. Evidence: `build-delivery.log`, `delivery-tests.log`, `types-scope.log`, `types-delivery.log`, `delivery-source.json`.

# Plan: Platform material subcategory separate pages (2026-11-09)

Status: "Ready to Code"
Approval: "Direct owner request for4platform groups using approved scales subgroup pattern"

## Files

- `src/features/catalog/data/product-subcategory-pages.ts` — add4source material definitions, canonical routes/titles and safe return contexts; preserve existing11records
- `src/app/(site)/products/category/platforms/[group]/page.tsx` — new4known static parameters, metadata and unknown-group guard using current shared server template
- `tests/catalog/product-subcategory-pages.test.ts` — extend exact platform paths/parent-boundary/return checks without removing existing coverage
- `tests/e2e/platform-subcategory-pages.spec.ts` — new material membership/order/count/Mock, controls/returns, ABS-only behavior, entries/history/native touch/responsive/motion coverage
- `tests/e2e/platforms-overview.spec.ts`, `catalog-subcategory-navigation.spec.ts`, `sitewide-navigation.spec.ts` — update only promoted platform expectations; retain explicit finder and non-promoted filter regression
- `spec.md`, `plan.md`; `output/platform-subcategory-pages-20261109/` — approval/baseline/evidence/delivery; MEMORY only if a new reusable lesson arises

## Steps

- [x] Read current instructions/spec/memory,4source material groups and existing generic template/tokens; read local Next page/static-params guidance and record direct authorization
- [x] Capture configured memberships, source snapshots and11existing listings/unaffected-page signatures
- [x] Add4registry records and one bounded dynamic route; preserve shared template and existing integrations
- [x] Run scoped format/lint/typecheck/catalog units and configured production build; safely preserve previous preview build
- [x] Verify all4materials/ABS, old query/menu/chapter/detail/history/cache/native touch, responsive/motion/performance and protected-source/page parity
- [x] Record actual results, update local preview and deliver without commit/push/deploy

## Impact / Rollback

R2 registry extension. Existing generic consumers automatically resolve the4new groups, so cover their navigation/return behavior while leaving global/shared styles and component markup untouched. Keep snapshots/build archive; revert only task deltas. Preserve previous uncommitted source, data and concurrent unrelated Figma work. No dependency/database changes.

## Verification Results

Done. Configured Node24build455/455 and catalog118/118pass. Scoped format/lint/typecheck pass. Chromium47/47pilot and47/47navigation/overview cases pass first time, totaling94scoped cases. Pilot covers19new material cases plus existing17indicator/11industrial cases; other7scale listings are covered by page parity, registry units and all23submenu navigation. No claim to run the whole project suite.

Exact material entries/order/count remain12carbon,9SUS304,2SUS201 real products and one ABS Mock. Real-group controls/comparison/same/fresh-tab/default return, ABS search/featured/view/reset/no product link or selection, all4old queries/direct/reload/Back/cache/local-search isolation/native touch and responsive320/390/768/834/1440/latest/reduced motion pass. Non-promoted local-filter history now uses accessory groups because specific platform queries intentionally became listing pages. Explicit all-model finder and broader platform-parent aliases retain their behavior.

All17baseline page text/image signatures exact, including11scale/indicator listings and5category overviews/directory.351protected paths unchanged,5planned existing deltas+1new app route+1new browser test; no global/template/style/motion/data/dependency changes. Eight CPU4x checks report CLS0/no overflow/settled entrance;3desktop/mobile screenshots inspected. Existing whole-page no-JavaScript limitation unchanged. No new qualifying Next feedback issue or reusable observer lesson.

Final preview3000session9713 runs verified build; previous-indicator-build safely archived after verifying/stopping owned listener. Evidence/delivery: output/platform-subcategory-pages-20261109/delivery.md. Prior uncommitted implementation and concurrent Figma notes preserved. No commit/push/deploy/database change.

---

# Plan: Indicator subcategory separate pages (2026-11-09)

Status: "Ready to Code"
Approval: "Direct owner request for existing indicator groups using the approved scales subgroup pattern"

## Files

- `src/features/catalog/data/product-subcategory-pages.ts` — new known-page/return registry combining existing8scale pages and3source indicator groups
- `src/features/catalog/components/product-subcategory-page.tsx` — shared RSC markup extracted from current scale template; same classes/structure/motion
- `src/features/catalog/components/scale-subcategory-page.tsx` — retain existing public wrapper/default behavior through shared template
- `src/app/(site)/products/category/indicators/[group]/page.tsx` — new3known static parameters, metadata and unknown-group guard
- `src/features/catalog/data/category-destinations.ts`, `src/features/cms/data/primary-navigation.ts` — include canonical indicator child destinations without losing label/order/role or cross-family boundaries
- `src/features/catalog/components/products-overview.tsx` — generic known-group chapter/old-query routing with existing history cleanup; explicit finder unchanged
- `src/features/catalog/components/product-category-mock.tsx`, `catalog-product-card.tsx`, `product-return-link.tsx` — exact indicator detail-return context, preserving scale aliases/default details/local-search behavior
- `tests/catalog/product-subcategory-pages.test.ts` — new indicator route/context/parent-boundary checks; existing primary-navigation canonical projection tests retained
- `tests/e2e/indicator-subcategory-pages.spec.ts` — new3group exact membership/order/count/Mock, controls/return, entries/reload/history/native touch/responsive/motion coverage
- `tests/e2e/indicators-overview.spec.ts`, `catalog-subcategory-navigation.spec.ts`, `sitewide-navigation.spec.ts` — update only promoted indicator expectations; preserve explicit finder/non-promoted family coverage
- `spec.md`, `plan.md`; `output/indicator-subcategory-pages-20261109/` — approval, snapshots, actual verification and delivery; MEMORY only for a new reusable lesson

## Steps

- [x] Inspect current instructions/spec/memory,3authoritative groups, tokens/template and local Next page/static-params docs; record direct authorization
- [x] Snapshot current source/configured memberships/all8scale and unaffected page signatures
- [x] Share identical server template; implement3known routes and indicator-only entry/return extension
- [x] Run scoped static checks/catalog units/production build while preserving previous preview build
- [x] Verify3new groups and8scale regressions, navigation/history/cache/native touch/responsive/reduced-motion, data/style preservation and page parity
- [x] Update spec/plan/evidence, refresh local preview and deliver without release

## Impact / Rollback

R2. Shared catalog guards and template expand to3indicator children. No global components/layout/styles edited. Compare source hashes and all8scale page signatures; restore only task changes from snapshot if needed. Preserve previous uncommitted pilot/scales work, product membership and concurrent unrelated task notes. No dependency or database changes.

## Verification Results

Done. Node24 configured build450/450 and catalog116/116pass. Chromium56/56pilot and47/47navigation/overview cases pass in first runs;103scoped browser cases, not the entire project suite. Scope includes3new indicator groups and all8scale listings, same/fresh-tab/default/overlapping-WP31C detail returns, search/featured/view/comparison, exact memberships/order/count/Mock, old query/direct/reload/history/cache, native Home touch and responsive320–1440/latest motion/reduced-motion. Existing intentional all-model finder and unpromoted family controls remain tested; local child-filter history now exercises platform groups because indicator query destinations intentionally became listings.

Fourteen existing page text/image signatures exact;341protected paths byte-identical,10planned existing deltas+3new app files+2new tests. Global components/layout/styles/animation values, product data, manifests/locks and unrelated prior work unchanged. Six CPU4x checks show CLS0/no overflow/settled entrance; desktop/mobile screenshots inspected. Scoped format/lint/typecheck and configured whitespace results are recorded. Existing whole-page no-JavaScript limitation remains outside scope; no new qualifying Next feedback candidate or reusable observer lesson.

Final preview3000session41047 runs verified build; previous-scales-build archive retained. Evidence/delivery: output/indicator-subcategory-pages-20261109/delivery.md. No dependency/database changes, commit/push/deploy. Concurrent Figma task notes preserved.

---

# Plan: Remaining seven scales subcategory pages (2026-11-09)

Status: "Ready to Code"
Approval: "Direct owner request extends the existing industrial template to all remaining scales children; no design change"

## Files

- `src/features/catalog/data/scale-subcategory-pages.ts` — new whitelist mapping existing8scale IDs to paths and source labels/return context
- `src/features/catalog/components/scale-subcategory-page.tsx` — shared server markup extracted from current industrial page without changing its appearance
- `src/app/(site)/products/category/scales/industrial/page.tsx` — retain route/metadata, render shared template
- `src/app/(site)/products/category/scales/[group]/page.tsx` — seven statically enumerated known groups with metadata/unknown-group guard
- `src/features/catalog/data/category-destinations.ts` — canonicalize all known scale-child queries/recognized old thematic URLs while preserving unrelated query/hash
- `src/features/cms/data/primary-navigation.ts` — retain canonical scale-child links in legacy/already-projected CMS data; keep labels/order/role separation
- `src/features/catalog/components/products-overview.tsx` — all known scales chapters/old queries navigate to listings with current history cleanup; other families unchanged
- `src/features/catalog/components/product-category-mock.tsx`, `catalog-product-card.tsx`, `product-return-link.tsx` — correct whitelisted per-group detail context; preserve industrial alias and ordinary detail behavior
- `src/app/(site)/[...path]/page.tsx` — recognized legacy scale-child redirects only
- `tests/catalog/scale-subcategory-pages.test.ts` — new whitelist/destination coverage
- `tests/catalog/category-destinations.test.ts`, `primary-navigation.test.ts` — update affected canonical destination expectations and preserve role/label projection checks
- `tests/e2e/scales-subcategory-pages.spec.ts` — new exact membership/order/count, responsive, entry/reload/history, local controls/return/motion coverage for7new groups
- `tests/e2e/catalog-subcategory-navigation.spec.ts`, `scales-overview.spec.ts`, `products-full-overview.spec.ts`, `category-destinations.spec.ts`, `sitewide-navigation.spec.ts`, `industrial-scales-page.spec.ts` — adapt only affected scale-child expectations; retain other families and industrial regression assertions
- `spec.md`, `plan.md`; `output/scales-subcategory-pages-20261109/` — approval/baseline/evidence/delivery; MEMORY only if a new repeatable lesson arises

## Steps

- [x] Inspect instructions/spec/memory, authoritative8groups and delivered industrial template; read local Next page/static-params/notFound guidance; record direct authorization and concrete scope
- [x] Snapshot current source and configured preview memberships/unaffected signatures; preserve prior uncommitted pilot
- [x] Extract identical shared template; implement7known routes and extend only scale entry/return mapping
- [x] Run scoped formatting/lint/typecheck/catalog units and configured production build; archive live build only after stopping its owned server
- [x] Verify all8scale groups,7new group controls/returns, legacy/menu/guide/history/cache, responsive/native touch/reduced-motion and protected-source parity
- [x] Record actual results and refresh local preview; deliver without commit/push/deploy

## Impact / Rollback

R2. Shared catalog feature branches expand from one known scale group to8; non-scale families and explicit all-products finder stay intact. No global components/layout/styles edited. Snapshot and compare before/after; restore only this task delta, keeping prior pilot and unrelated notes. No new library or data migration.

## Verification Results

Done. Node24 configured build446/446 and catalog113/113pass. Final scoped Prettier/ESLint/TypeScript and whitespace checks pass. Chromium39/39pilot cases pass. Broad regression53passed/2stale guide-popup assertions failed; after canonical final-URL expectation updates, targeted guide rerun2/2passes. Latest passing coverage94distinct cases, not a claim that the entire project suite ran together. No application edit was needed after the successful build.

All7new groups have exact source membership/order/count, including38benchtop/26floor pagination and existing Mock cards. At320/390/768/834/1440, controls/search isolation/comparison/contextual detail returns, old queries/legacy paths, directory/Navbar/scales chapters/guide links, refresh/Back, latest motion/reduced-motion and all7Home native-touch detail/return paths pass. Existing industrial11cases remain intact. Screenshots inspected at390/1440. Fourteen CPU4x checks report CLS0/no overflow/settled animations.

Seven prior-page text/image signatures exact, including industrial, directory, scales parent and4other category overviews. Preservation:331baseline paths unchanged,15planned existing deltas+3new app files+2new tests; global layout/components/styles/animation/data/manifests/locks untouched. Prior uncommitted pilot and unrelated Figma notes preserved. Existing whole-page no-JavaScript limitation unchanged; no new qualifying Next feedback candidate. A whitespace-check attempt with a per-command core.autocrlf override produced CRLF-only diagnostics; the ordinary repository-configured check passes. Concrete correction recorded in MEMORY.md without rewriting unrelated sources.

Final preview3000session39590 runs verified build; previous-pilot-build archive retained. Evidence/delivery: output/scales-subcategory-pages-20261109/delivery.md. No commit/push/deploy, dependency or database changes.

---

# Plan: Products index and industrial-scales separate-page pilot (2026-11-09)

Status: "Ready to Code"
Approval: "Owner explicitly approved these two pages from the reviewed wireframe; preserve existing design and animation"

## Files

- `src/features/catalog/components/products-index-content.tsx`, `product-directory.module.css` — new server directory and scoped layout using existing overview tokens/motion,5CMS categories/current children/photos
- `src/app/(site)/products/page.tsx` — supply directory content to existing shell; retain existing shell data/explicit finder contracts
- `src/app/(site)/products/category/scales/industrial/page.tsx` — new metadata/server route, exact membership, breadcrumbs and fixed inline list
- `src/features/catalog/components/product-category-mock.tsx` — optional fixed subcategory and listing presentation only; preserve default finder/category behavior
- `src/features/catalog/components/catalog-product-card.tsx`, `product-return-link.tsx` — optional industrial detail context and Suspense-safe whitelisted back link
- `src/app/(site)/products/[slug]/page.tsx` — replace only ordinary back-link rendering with context-aware component/fallback; preserve detail content/data
- `src/features/catalog/data/category-destinations.ts` — existing specific industrial links/old queries resolve to the pilot route; unrelated destinations unchanged
- `src/features/cms/data/primary-navigation.ts` — retain the industrial child when CMS input already uses its canonical path, preserving all23menu children before/after normalization; preserve separate product-child and business/support label ownership when equivalent URLs collide
- `src/features/catalog/components/products-overview.tsx` — optional server directory slot, latest entrance opt-in, industrial chapter/old-query navigation and directory all-link; preserve remaining overview shell/interactions
- `src/features/content/data/buying-guides.ts` — add direct industrial entry with existing category label
- `src/app/(site)/[...path]/page.tsx` — industrial legacy path redirect only
- `tests/catalog/category-destinations.test.ts`, `tests/e2e/category-destinations.spec.ts`, `sitewide-navigation.spec.ts`, `home-category-navigation.spec.ts`, `products-full-overview.spec.ts`, `scales-overview.spec.ts`, `catalog-subcategory-navigation.spec.ts` — adapt affected destination/index contracts only where exercised; retain other category/filter assertions
- `tests/e2e/industrial-scales-page.spec.ts` — new exact membership/Mock/search/compare/detail-return/entry/reload/history/responsive/motion coverage
- `tests/catalog/primary-navigation.test.ts` — retain full projection equality with the intentionally promoted industrial destination
- `tests/e2e/indicators-overview.spec.ts`, `platforms-overview.spec.ts`, `pos-overview.spec.ts`, `accessories-overview.spec.ts` — update the all-products navigation step to enter the new directory first, then explicitly open the retained finder; preserve comparison/cache assertions
- `spec.md`, `plan.md`; `output/products-industrial-pages-20261109/` — approval, baseline snapshots, verification and delivery; MEMORY only for a new repeatable lesson

## Steps

- [x] Read current spec/memory/instructions, supplied wireframe and installed Next page/Link/search-param guidance; inspect real taxonomy, tokens and existing shell/filter contracts
- [x] Snapshot source/current browser; capture industrial ordered entries and unaffected categories/details before app edits
- [x] Implement additive directory and industrial pilot with optional default-preserving props and canonical entry/return links
- [x] Run scoped format/lint/typecheck, catalog units and configured production build; preserve previous preview while testing
- [x] Verify320/390/768/834/1440, native touch/keyboard, all pilot entries, detail return, direct/reload/history, finder/search/compare, reduced motion and protected data/UI parity
- [x] Update docs/evidence and preview; deliver without commit/push/deploy

## Impact / Rollback

R2. Changes to shared catalog feature components are limited optional props/industrial branches. Existing global Header/Footer/CSS/animation values remain read-only; no general refactor. Revert only approved task changes from snapshots. Keep old preview build available until candidate passes. Other23-child route rollout is outside scope.

## Verification Results

Done. Final configured Node24build438/438; catalog111/111; final Chromium43/43 pilot/destination/sitewide plus11/11 focused cache/history/native-mobile cases pass. Scoped Prettier/ESLint/TypeScript and git diff --check pass after the last source change. Earlier full regression attempts and their failures remain in logs; the final two runs are the current focused evidence, not a claim that every suite was rerun together.

All21industrial entries/order/count match the original15real+6Mock set. Responsive320–1440, entry/reload/Back, local search/featured/view/load/comparison, native mobile and contextual detail returns pass. Four4xCPU cases at390/1440 show CLS0/no overflow/settled entrance; new directory gutters match existing headings. Ten unaffected-page signatures match except approved href/guide changes; Home images/links/source match with offscreen streamed text explicitly excluded. Header390/1440 geometry exact;320protected baseline files unchanged,20planned existing deltas+4new app files+1new test; no unexpected paths. Existing shared motion/style/data sources unchanged.

Verification caught and fixed cached finder state on plain /products, stale closed-finder queries before industrial Back, and duplicate mobile labels caused by canonical URL collisions across semantic menu roles. Explicit finder query persistence remains intact. Shared Hero keyboard/native-swipe coverage moved to scales after the index content changed. New reusable navigation-role lesson recorded in MEMORY.md. No new qualifying Next feedback issue; pre-existing whole-page no-JavaScript visibility remains outside scope.

Final preview3000session19296 runs the verified build; earlier build archives retained safely. Delivery/evidence: output/products-industrial-pages-20261109/delivery.md. Independent UAT publication preserved; this pilot is not committed, pushed or deployed. No dependency/database changes.

---

# Plan: Group existing changes, commit and push UAT (2026-11-09)

Authorized directly by the owner's commit/push instruction. Existing application changes only; no application edits planned.

## Files / Groups

- Existing modified/new navigation, category-destination, Header, Footer, homepage navigation sources and their tests — navigation commit.
- Existing modified/new catalog components, category route, decision facts and catalog tests — catalog commit.
- `src/features/home/components/section-two-video.tsx`, `tests/e2e/section-two-video.spec.ts` — homepage video commit.
- Existing modified/new solutions overview components and solutions tests — solutions commit.
- `spec.md`, `plan.md`, `MEMORY.md` — accumulated project notes and current verification; normalize documentation formatting if needed.

## Steps

- [x] Inspect changes, instructions and remote branch; group related files with tests.
- [x] Run format, lint, typecheck and catalog unit checks; inspect staged groups.
- [x] Create grouped implementation commits and push `uat` to `origin/uat`.
- [x] Confirm implementation remote revision; only the3project documentation files remain for the final documentation commit.

## Impact / Rollback

Publishes existing changes to UAT. Production release remains a separate command. Use revert commits if rollback is required; preserve local source and artifacts.

## Verification Results

Full format check, ESLint, TypeScript and catalog unit tests110/110 pass; git diff --check passes after removing the extra EOF blank in spec.md. Four implementation commits77a5620,6a9679c,888dce2,dbf80ae are published; git ls-remote confirms dbf80ae4d803a10da221dd9b6a4ccf935b75b5ff. Final documentation commit and its remote/clean-tree confirmation follow, reported in chat. No build/browser rerun or production release in this Git-only task. Existing verification evidence and limitations retained; no new Next.js feedback candidate.

---

# Plan: Separate-page architecture proposal and review wireframe (2026-11-09)

Scope: owner directly requested advice/simple review wireframes; no application changes authorized by the prototype.

## Files

- Thread visualization directory `sunford-page-wireframes.html` — inline interactive proposal, local state only
- `output/site-section-wireframes-20261109/` — proposal, preview wrapper, browser evidence and protected hashes
- `spec.md`, `plan.md` — proposed contracts and actual validation, explicitly separated from implemented routes

## Steps / Results

- [x] Read applicable visualization/mockup workflow and current instructions/spec/memory; use current menu labels/known emptyiOS without inventing product details
- [x] Recommend page hierarchy, shared detail records, shortcuts and staged industrial pilot; create clickable gray wireframes with SUNFORD accents
- [x] Check22available children, core business/software/service/product-return paths and8theme/width combinations; inspect desktop/mobile screenshots
- [x] Confirm340protected app/test/config/lockfiles unchanged; record proposal and delivery. No source/build/server/DB/dependency/deployment change; no Next framework feedback candidate

## Impact / Rollback

R2 artifact-only work. Proposed URLs and layout templates are not live routes. Remove only this draft and task notes to undo. No implementation approval inferred.

---

# Plan: Correct category links from Home, Solutions and guides (2026-11-09)

Status: "Ready to Code"
Approval: "Owner's direct current link-repair instruction, following verified menu audit"

## Files

- `src/features/catalog/data/category-destinations.ts` — create small explicit legacy-to-current href map; leave unknown/external/product-detail/all-products hrefs unchanged
- `src/features/home/data/link-targets.ts` — normalize valid configured/default category destinations only; preserve disabled/deleted/product selection and security checks
- `src/features/content/components/solutions-overview.tsx` — normalize existing business-group hrefs without changing rendered structure/labels
- `src/features/cms/data/primary-navigation.ts` — normalize final existing link projections so related/Solutions columns share corrected destinations; no menu/UI changes
- `src/features/content/data/buying-guides.ts` — replace guide return/body category hrefs with existing current parent/exact-subcategory destinations; preserve content and IDs
- `src/components/layout/footer.tsx` — correct only3hardcoded category hrefs visible on Home/Solutions/guides (scales, accessories, POS). The owner's direct request covers these category links too; preserve shared Footer markup/styles/content. Impact: same destinations on other consumers of this Footer. Snapshot/revert only3href replacements.
- `tests/catalog/category-destinations.test.ts` — add focused normalization, CMS/default projection, Home safety/product targets and guide destination regression checks
- `tests/e2e/category-destinations.spec.ts` — add desktop/mobile source-to-destination click coverage and unchanged controls/structure
- `tests/e2e/solutions-overview.spec.ts`, `tests/e2e/sitewide-navigation.spec.ts`, `tests/e2e/pos-overview.spec.ts` — update expected hrefs only to corrected contract
- `tests/catalog/management.test.ts` — update the one expected Home default category destination; retain its product/deleted-target/security coverage
- `spec.md`, `plan.md` — current approval/contracts/results; `output/category-link-destinations-20261109/` — snapshots, parity/build/browser evidence and delivery
- `node_modules/@prisma/client/`, `node_modules/pg/`, `node_modules/sanitize-html/node_modules/postcss/` — environment recovery only if verified empty: restore exact locked7.10.1/8.23.1/8.5.31 archive contents with integrity checks; no package version/manifest changes

## Steps

- [x] Confirm direct authorization, existing routes/child definitions, source links and local Next Link documentation; inspect existing CSS/tokens read-only
- [x] Snapshot current source and configured preview at390/1440; preserve concurrent changes
- [x] Implement only href resolution and explicit guide target corrections in listed files
- [x] Run catalog unit suite, scoped static checks and production build without replacing a live build
- [x] Verify Home/Nav/Solutions/guide clicks at390/1440, exact child filtering and parent pages; compare content/structure/geometry and all protected styles/motion sources
- [x] Refresh main preview safely, record final checks and deliver without release

## Impact / Rollback

R2 link-only delta. Existing Navbar projections' hrefs change consistently, while their labels/order/columns and shared UI files remain unchanged. Do not change homepage preview buttons or source data used to select their product belts. No inferred material/function subgroup where the current Navbar has no exact equivalent. Rollback only task deltas from snapshots; preserve existing uncommitted work. Keep the old preview build until final verification. No software filter fix, new guide anchor behavior, legacy-route-wide redirect changes, dependency or database writes.

## Verification Results

Done. Owner's direct request covers this narrowly scoped href correction, including3Footer hrefs on the named surfaces; no additional permission needed. Final configured Node24build437/437, TypeScript/scoped ESLint/Prettier pass. Catalog110/110; Chromium37/37 (new6, POS7, sitewide12, Solutions12).24route/width content/image/geometry/static-structure signatures equal and link labels/order retained; one transient mobile chapter arrow differed due baseline hydration timing and was explicitly normalized, with raw evidence retained.328protected files unchanged;9planned existing deltas plus3new app/test files. Guide data href-only; Footer exact3href replacements. Main preview3000session40917 runs final build; old build archived safely. Three verified-empty dependency directories restored from exact locked/integrity-checked archives without version/manifest changes. Initial typecheck/archive race corrected by final sequential rerun. Scoped whitespace checks pass; full check flags only unrelated concurrent Figma spec EOF blank, preserved. No new qualifying Next feedback candidate; no release. Delivery and evidence: output/category-link-destinations-20261109/delivery.md.

---

# Plan: Replace homepage section-two video with showroom tour (2026-11-07)

Status: "Ready to Code"
Approval: "Approved — owner: อนุมัติ"

## Files

- `src/features/home/components/section-two-video.tsx` — replace embed/poster ID with UF7QJSq4Qw4 and the verified video series/title; preserve heading/layout/player behavior
- `tests/e2e/section-two-video.spec.ts` — update expected embed ID only, preserving responsive/keyboard/no-JS assertions
- `MEMORY.md` — required reusable diagnostic note: distinguish streamed hidden ancestors from a media-only regression in no-JavaScript checks
- `spec.md`, `plan.md` — approval, superseded clip contract and actual verification
- `output/home-section-two-showroom-video-20261107/` — ignored source/geometry snapshots, metadata receipt, browser screenshots/logs and delivery

## Steps

- [x] Identify exact section from screenshot; inspect component/CSS/existing tests and verify supplied YouTube metadata/thumbnail
- [x] Obtain approval for this concrete replacement Spec/Plan before application edits — owner: “อนุมัติ”
- [x] Snapshot component/test and geometry; read relevant installed Next.js guidance, then replace only clip IDs/title and test expectation
- [x] Run scoped Prettier/ESLint and Node24 project build including TypeScript; use isolated QA output without competing with concurrent preview/build work
- [x] Run existing section-two-video tests, check new thumbnail/accessible title and iframe source, click/Enter/fullscreen/no-JS preview and1440/768/390/320px geometry; inspect screenshots — normal-JS passes; original no-JS failure retained and diagnosed
- [x] Audit exact source delta and preserve unrelated Navbar/accessories work; update preview and actual results, without commit/push/deploy

## Impact / Rollback

R2. One homepage component and its focused existing regression test; no shared styles/layout/data changes. Preserve section id and heading so existing anchors remain valid. Snapshot and restore only this task's ID/title delta. YouTube availability is external; report actual player/network verification limits without changing the player design.

## Verification Results

Implemented after explicit approval. Exactly3component replacements (video ID twice and title) and1test expected-ID replacement verified. Scoped Prettier/ESLint pass; isolated Node24 bun run build437/437 including TypeScript. QA uses the existing configured data environment in process without copying environment files. QA3008 and final3000 each match all4baseline section/heading/poster rectangles, text/colors and overflow at1440/768/390/320; actual1280x720 poster loads, no iframe before interaction, Enter/click create correct new iframe/title/fullscreen/referrerPolicy, shop link retained. Screenshots inspected. Existing suite:1pass/1fail on stable unchanged baseline3009, candidate3008 and final3000. The no-JS test fails because its heading/poster exist under a hidden display:none ancestor; final diagnostic confirms HTTP200, heading1, poster1, iframe0. This pre-existing whole-page visibility issue was not fixed or suppressed in a video-only task. It is a verified recurring framework-feedback candidate; reporting instructions were read for one anonymized review draft before final delivery. All214current app-source files match the built QA snapshot before promotion, preserving completed accessories work. Guarded promotion archives previous build and retains0.0.0.0:3000; final preview session96526, QA3008 stopped. No commit/push/deploy. Evidence: output/home-section-two-showroom-video-20261107/delivery.md.

# Plan: Link homepage shopping bag to SUNFORD shop (2026-11-07)

Status: "Ready to Code"
Approval: "Authorized direct follow-up — owner supplies shop URL and requests linking this icon"

## Files

- `src/components/layout/header.tsx` — replace the bag button with a native shop link, update accessible label/Tooltip, remove that button's unused comparison subscriptions/state/count; retain SVG/CSS/layout
- `tests/e2e/home-category-navigation.spec.ts` — include the new shop anchor alongside buttons in the existing geometry regression; preserve every previous rectangle comparison
- `spec.md`, `plan.md` — follow-up authorization, superseded action contract and actual results
- `output/home-shopping-bag-shop-link-20261107/` — Header snapshot, before/after geometry/screenshots, browser/static receipts and previous preview build

## Steps

- [x] Read current contracts/styles/Tooltip, installed Next.js Link guidance and supplied URL; record explicit follow-up authorization
- [x] Snapshot Header and Home/scales geometry; change only approved Header markup/subscriptions
- [x] Run scoped Prettier/ESLint; use project build command on Node24 (includes TypeScript) and preserve previous local build for rollback
- [x] Refresh preview3000 and verify native href/label, click/Enter navigation, no comparison activation, Home390/768/834/1440 geometry/colors/overflow and unchanged scales comparison control; inspect screenshots
- [x] Run the existing8width Home Navbar geometry regressions with the semantic link included in their control selection
- [x] Update actual verification and deliver without commit/push/deploy

## Impact / Rollback

R2. Only Home's bag changes function; other-page comparison remains. Shared .icon-button styles already support anchors, so no CSS edit. The new direct owner instruction supersedes the earlier bag's retained compare action. Snapshot and restore only this delta; keep prior navigation/POS edits. Local preview can restart from its archived build if the build fails.

## Verification Results

Passed. Native same-tab shop anchor has the supplied href and correct accessible name/Tooltip, no compare state or badge. Exact Header transform preserves SVG and all unrelated markup. Prettier/ESLint pass for Header/test; Node24 bun run build437/437 including TypeScript. Final3000 Chrome8Home/scales route/width comparisons retain exact geometry/color/stroke/SVG with no overflow;3native clicks plus keyboard Enter navigate to the exact shop URL in the same tab. Destination document interception makes navigation deterministic; no checkout behavior was tested or changed. Other-page scales compare still opens its finder/bar. Existing8geometry regressions pass at390–1920; only their selector includes the new anchor. Screenshots inspected. Previous preview build retained, preview3000session85819 refreshed with original0.0.0.0 binding. No release or qualifying verified framework feedback issue. Evidence: output/home-shopping-bag-shop-link-20261107/delivery.md.

# Plan: Homepage shopping bag icon (2026-11-07)

Status: "Ready to Code"
Approval: "Approved — owner: อนุมัติ"

## Files

- `src/components/layout/header.tsx` — ลบ import GitCompareArrows และแทน SVG ของปุ่มเดิมด้วยกระเป๋า outline ตามภาพ; คงขนาด/handlers/labels/count และ pending edits เดิม. ใช้ inline SVG แทน ShoppingBag1.61.0 ที่มีทรงต่างจากภาพ โดยไม่ขยายขอบเขตไฟล์หรือพฤติกรรม
- `spec.md`, `plan.md` — เพิ่มเฉพาะหัวข้องานนี้ บันทึก approval จริงและผลตรวจ
- `output/home-shopping-bag-icon-20261107/` — ignored evidence: source snapshot, screenshots และผลตรวจ; ไม่สร้าง test file สำหรับการเปลี่ยนไอคอนสองจุด

## Steps

- [x] ตรวจภาพ, Header consumer, current CSS/tokens, package/lockfile และ ShoppingBag export ที่ติดตั้งอยู่
- [x] รับอนุมัติ Spec/Plan นี้ก่อนแก้ไฟล์แอปตาม AGENTS.md — ผู้ใช้: “อนุมัติ”
- [x] Snapshot header.tsx และข้อมูล geometry ที่ใช้เทียบ; อ่าน installed Next.js client-component guide ก่อนแก้
- [x] ลบ GitCompareArrows import และแทน SVG ด้วยกระเป๋าตามภาพเฉพาะ header.tsx
- [x] ตรวจ scoped Prettier/ESLint และ typecheck; ตรวจ diff ว่าคง pending edits และเปลี่ยนแอปเพียงสองจุด
- [x] ใช้ isolated preview ตรวจ Home390/768/834/1440: รูปกระเป๋า สี/ขนาด/ตำแหน่งเดิม จำนวนสินค้า และปุ่มเปิดเปรียบเทียบ; ตรวจหน้า scales ว่าไอคอนเดิมไม่เปลี่ยน; เก็บและดู screenshots จริง
- [x] อัปเดต local preview3000 ด้วยคำสั่ง build ของโปรเจกต์หลัง isolated checks ผ่าน; เก็บ build เดิมให้ย้อนกลับได้และตรวจ runtime ใหม่ก่อนหยุด QA3008
- [x] อัปเดตผลตรวจใน spec.md/plan.md และส่งมอบ โดยไม่ release

## Impact / Rollback

R2: header.tsx เป็นไฟล์ส่วนกลางที่มี pending navigation edits อยู่แล้ว แต่ SiteNavigation ใช้ Header เฉพาะหน้าแรก. ความเสี่ยงจำกัดที่รูป SVG/การ import; คง CSS, state, action, accessibility label, Tooltip และ layout เดิม. ย้อนเฉพาะสองจุดของงานนี้จาก snapshot โดยไม่คืนทั้งไฟล์ทับงานก่อนหน้า. PrimaryNavigation และหน้าอื่นไม่แก้.

## Verification Results

Done after explicit approval. Inline SVG matches the supplied top-handle reference; installed ShoppingBag1.61.0 has a different folded-bag shape, so the implementation stays within the approved one-file/two-location scope with no dependency change. Scoped Prettier/ESLint pass. Node24 isolated production build and actual bun run build both437/437 including TypeScript. QA3008 and final3000 Chrome checks each pass8route/width comparisons, exact geometry/color/stroke/other-page SVG parity,4Home compare start/cancel interactions and actual selected-product badge1/clear behavior. Desktop/mobile screenshots inspected. Initial evidence-only close selector assumed the generic Modal label; corrected to the actual finder label and reran successfully without application changes. Exact Header transform verified;350baseline hashes checked, only Header changes in src,3concurrent POS/navigation test changes retained. Original preview build archived before refreshing3000 with0.0.0.0 binding; QA3008 stopped. No release or qualifying verified framework feedback candidate. Receipts: output/home-shopping-bag-icon-20261107/delivery.md.

# Plan: Restore original homepage Navbar (2026-11-07)

Status: "Ready to Code"
Approval: "Approved direct restoration request"

## Files

- `src/features/cms/components/site-navigation.tsx` — create pathname-aware selection between the existing homepage Header and current PrimaryNavigation
- `src/features/cms/components/site-header.tsx` — pass existing CMS navigation/site/extras into the selector
- `src/components/layout/site-background.module.css` — restore original fixed-header offset only on the surface containing the restored Header; leave all other route surfaces unchanged
- `tests/e2e/sitewide-navigation.spec.ts` — assert the restored homepage header, retain five-category tests on other public routes
- `tests/e2e/products-full-overview.spec.ts` — preserve cached-navigation checks with the appropriate active header and owning surface for each route
- `tests/e2e/nonblocking-opening.spec.ts` — align the existing Hero background assertion with the unchanged black homepage theme from1e2243e; retain pre-hydration content/link/scroll checks
- `spec.md`, `plan.md` — approval, scope and verification; `MEMORY.md` — record the verified homepage Hero/header preservation lesson
- `output/restore-home-navbar-20261107/` — ignored initial hashes, screenshots, logs and delivery receipt

## Steps

- [x] Inspect current/previous header wiring, original Hero contracts, source tokens and user authorization
- [x] Reuse original homepage Header through route-aware CMS wiring; preserve other pages and pending catalog work
- [x] Align affected regression expectations without weakening interaction/history checks
- [x] Run scoped lint/formatting, production build, original homepage header/opening tests and relevant shared-navigation regressions
- [x] Refresh preview3000; verify mobile/desktop screenshots and protected source hashes; update project notes

## Impact / Rollback

Homepage-only component selection and conditional surface padding restore its original navigation/tone/geometry. Other routes retain PrimaryNavigation and their current spacing. Header/global CSS/Hero implementations stay untouched. The scoped surface rule is necessary because f0e9092 removed the original fixed-header offset; risk is homepage vertical positioning, verified at390/768/1280/1440 and through cached navigation. Roll back only this task's selector, server wiring and conditional padding, preserving prior pending work. No commit/push, deployment or DB write.

## Verification Results

Node24 build437/437, final TypeScript, scoped ESLint/Prettier and Git whitespace pass. Chromium22/22 pass in browser-verified.log: original header/scroll390/768/1280/1440, cold normal-motion logo, pre-hydration/native links, delayed fonts, non-home five-category menus and cached navigation/back/forward. Final390/1440 screenshots show original fixed dark glass,58px offset and Hero top0; other route surfaces retain current spacing. Original Header/Hero/global CSS and pending Hick–Hyman changes are preserved by hash audit.

Initial restored-header inspection exposed the previously removed fixed offset; the scoped surface rule fixes it. Two old pre-hydration tests expected Hero#111 despite the unchanged homepage theme from1e2243e overriding it to#000; only that literal is aligned, keeping visibility/link/scroll assertions. Initial failures and final passing evidence are retained. Project MEMORY records the route-specific integration lesson. Preview3000 remains available. No qualifying new Next.js feedback candidate or publication. Delivery: output/restore-home-navbar-20261107/delivery.md.

---

# Plan: Hick–Hyman catalog decision clarity (2026-11-07)

Status: "Ready to Code"
Approval: "Approved — owner goal: เริ่มและทำให้เสร็จตามที่แนะนำอนุมัติ"

## Files

- `src/features/catalog/data/catalog-decision-facts.ts` — create pure verified card-fact and comparison-row derivation
- `src/features/catalog/components/catalog-product-card.tsx` — optional decision facts for catalog consumers only
- `src/features/catalog/components/product-browser.module.css` — opt-in fact wrapping and catalog comparison hit area
- `src/features/catalog/components/product-category-mock.tsx` — use existing ClientProduct fields; visible search/browse labels, tool grouping and explicit comparison action
- `src/features/catalog/components/product-category-mock.module.css` — primary/secondary hierarchy and full-width narrow-screen search
- `src/features/catalog/components/catalog-overlays.tsx` — consistent comparison terminology, known differences, missing-value presentation and scoped nested-finder focus restoration after the original trigger is cleared
- `src/features/catalog/components/catalog-overlays.module.css` — create scoped comparison refinement without editing global styles
- `src/features/catalog/components/products-overview.tsx` — clarify existing product-detail and comparison actions
- `src/features/catalog/components/products-overview.module.css` — only if the longer approved product CTA requires wrapping/spacing to preserve responsive action rows
- `tests/catalog/catalog-decision-facts.test.ts` — meaningful derivation/missing-data/category tests
- `tests/e2e/hicks-law-catalog.spec.ts` — create focused responsive, decision-evidence and journey regressions
- `tests/e2e/product-category-mock.spec.ts`, `tests/e2e/scales-overview.spec.ts` — align affected comparison action names while preserving existing behavioral assertions
- `tests/e2e/product-category-pages.spec.ts` — align the category-history regression's existing comparison-button name with the approved action label; no behavioral assertion changes
- `tests/e2e/products-full-overview.spec.ts`, `tests/e2e/indicators-overview.spec.ts`, `tests/e2e/catalog.spec.ts` — only affected product-action/comparison copy assertions if required
- `spec.md`, `plan.md` — scope, actual approval, contract and evidence; `MEMORY.md` only for a verified repeatable operational lesson
- `output/hicks-law-20261107/` — ignored baseline/final signatures, scripted journey timings, screenshots and delivery report; isolated QA copies remain outside the source tree

## Steps

- [x] Read current source, project state, tokens and applicable skills; verify clean78bbd71 baseline and actual field availability
- [x] Record explicit approval and scoped Spec/Plan; independent layout assessment completed
- [x] Verify a complete credential-free isolated baseline with matching source and independent generated Prisma source; capture29state catalog signatures and three representative journeys
- [x] Implement all approved clarity refinements using incumbent components and verified data
- [x] Run focused derivation tests/static checks and isolated production build
- [x] Batch desktop/mobile/zoom/keyboard/touch inspection and journey/data parity checks; run the mechanical detector once after layout implementation
- [x] Correct observed defects and stale copy assertions; run final affected browser regressions
- [x] Refresh a verified working preview; update acceptance evidence and deliver

## Impact / Rollback

Five-category Navbar, data, route contracts and stack remain untouched. Shared card facts are optional and affect only opted-in catalog cards; the existing shared comparison overlay receives consistent copy/row treatment. Keep44px targets and the existing maximum of three selections. No added persistence, wizard, global style edits, migrations or release. Revert only this task's diff if required.

## Verification Results

Final Chromium118/118 across all nine affected browser files passes against the final isolated build (browser-verified.log). Rebuilt normal-environment preview3000 passes8/8 focused cases, native touch comparison scrolling182px and keyboard focus checks390/1440, with no page errors. Catalog102/102, UAT27/27, full ESLint/Prettier, schema validation, final TypeScript and credential-free/normal-environment production builds437/437 pass. Compare29states/537ordered entries exactly, including product links, image URLs, Mock membership and order; all23child destinations remain valid. Search input168→283px at390px; tested320/390/768/834/1440 and wider layouts,200%zoom, grid/list, missing/Mock/empty states, history/reload and nested overlays.

Independent source/rendered assessment preceded the changes; one layout detector run returned[]. Observed refinement batch adds verified material/type facts and a mobile table-scroll cue. Additional keyboard testing reproduced baseline focus loss when clear-on-close removes the comparison trigger; the scoped overlay now restores its owning finder search, leaving shared Modal and store behavior unchanged. Existing keyboard tooltips consume the first Escape, and the check now verifies each dismissal layer. One combined run failed only on a stale comparison-button name in product-category-pages.spec.ts; that assertion is aligned without weakening behavior. Initial evidence and final passing receipts are retained.

Application changes are confined to8scoped catalog files; original Navbar, routes, assets, dependencies, global styles and shared UI remain unchanged. Project MEMORY records the repeatable layered-dismissal/focus verification lesson. No human study has been performed, so scripted elapsed times and unchanged1/1/4action counts do not establish a human usability gain. Final scope audit, screenshots and delivery report are in output/hicks-law-20261107/. No qualifying new Next.js feedback candidate; no commit/push or production release performed.

Supplementary normal-environment parity also passes29states/537ordered entries against a rebuilt pre-change baseline, whose248source/config files matchHEAD after Git line-ending normalization. Fixture and database order differ in two parent states; compare within each environment rather than treating that data difference as a UI regression. Both before/after pairs now have separate JSON/screenshot receipts. Final scope is18files:8app,7tests,3project notes;372protected files remain byte-identical. Preview3000 stays available; temporary QA servers are stopped after verification.

---

# Plan: Review and prepare catalog commits (2026-11-07)

Status: "Ready to Code"
Approval: "Authorized — owner requests changes review, file selection, commit and push"

## Files

Source/test commit — review the existing approved changes; only correct stale test expectations if required:

- `src/app/(site)/layout.tsx`
- `src/app/(site)/products/page.tsx`
- `src/app/(site)/products/category/[category]/page.tsx`
- `src/components/layout/primary-navigation.tsx`
- `src/components/layout/site-background.module.css`
- `src/features/catalog/components/catalog-route-frame.tsx`
- `src/features/catalog/components/indicators-overview.tsx`
- `src/features/catalog/components/product-category-mock.module.css`
- `src/features/catalog/components/product-category-mock.tsx`
- `src/features/catalog/components/products-overview.module.css`
- `src/features/catalog/components/products-overview.tsx`
- `src/features/catalog/components/scales-overview.tsx`
- `src/features/catalog/server/product-categories.ts`
- `src/features/cms/components/site-header.tsx`
- `tests/e2e/catalog-subcategory-navigation.spec.ts`
- `tests/e2e/product-category-mock.spec.ts`
- `tests/e2e/category-intro-motion.spec.ts`
- `tests/e2e/indicators-overview.spec.ts`
- `tests/e2e/product-category-pages.spec.ts`
- `tests/e2e/products-full-overview.spec.ts`
- `tests/e2e/scales-overview.spec.ts`
- `tests/e2e/sitewide-navigation.spec.ts`

Documentation commit: `spec.md`, `plan.md`, `MEMORY.md` — preserve existing approved task history and record actual verification. Ignored evidence: `output/commit-push-20261107/`.

## Steps

- [x] Confirm current uat branch, owner authorization, approved task records and exact pending file inventory
- [x] Fetch origin and confirm uat/main start at the same revision
- [x] Run Node24 lint, formatting, schema validation, UAT27 and catalog94 tests
- [x] Build an isolated credential-free fixture copy with its own generated Prisma source; 437 pages and TypeScript pass
- [x] Correct stale test selectors/route expectations within the listed test files and run the relevant browser regressions
- [x] Complete final static, source-preservation and explicit staging checks
- [x] Prepare explicit source/test and documentation commit sets; track final Git publication in the ignored task receipt/work state

## Impact / Rollback

The shared route frame, overview and Navbar form one dependent source/test change. Keep them together; preserve all existing data and source behavior. No production deployment or force-push. Existing preview3000 stays running; QA uses3017 outside the workspace with no live environment files. Revert scoped commits if a rollback is needed.

## Verification Results

Node24.22.1 full ESLint/Prettier, Prisma schema, UAT27, catalog94 and final TypeScript pass. Credential-free isolated Turbopack build437/437 passes, followed by final combined Chromium110/110 across all8listed browser files. Desktop/mobile screenshots inspected. All14application files match the original pending bytes and tested QA copy exactly; review changes are limited to stale assertions in two listed tests and project notes. Git index contains exactly22source/test files; the remaining3project notes are the separate documentation set. Initial stale Navbar, heading-level and shared-header failures are retained with final passing logs in output/commit-push-20261107/. No new qualifying Next.js feedback candidate. Final commit IDs, normal origin/uat push and clean-tree verification are recorded in the ignored delivery receipt after documentation is finalized.

---

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

# Plan: Apple-inspired Products redesign proposal (2026-11-06)

Status: "Ready to Code"
Approval: "Approved — explicit user approval on 2026-11-06"

## Files

Current audit/documentation only:

- spec.md — append current requirements, proposal, approval boundary and findings; preserve history
- plan.md — append scoped audit and proposed implementation steps
- output/apple-products-reference-20261106/report.md — create Thai audit/proposal with responsive matrix, source mapping and verification limits
- output/apple-products-reference-20261106/verification.json — create documentation/source-preservation results

Approved implementation files (completed):

- src/app/(site)/products/page.tsx — render existing buying-guide summaries/links as server content using page-scoped module; preserve existing data retrieval and category membership
- src/features/catalog/components/product-category-mock.tsx — restructure heading/category rail/showcase/finder; use current featured/image/name/subtitle/slug and existing filters/store
- src/features/catalog/components/product-category-mock.module.css — responsive layout and catalog-only styling; no shared/global stylesheet change
- tests/e2e/product-category-mock.spec.ts — update existing expectations for changed structure; verify new showcase/guide destinations and responsive interaction

## Steps

- [x] Read task-observer/global/project instructions, current spec/memory, mounted component/styles, data projections, package and lockfiles.
- [x] Inspect original Apple tab on desktop/mobile, actual next-gallery control, and current SUNFORD build at1440/768/390. Distinguish old-build baseline from live production DB.
- [x] Prepare concrete Thai proposal, exact file scope, responsive/data contracts and risks without application edits.
- [x] Receive explicit user approval for this proposed application Spec/Plan before code changes: user approved on2026-11-06.
- [x] After approval, read relevant bundled Next guides; capture current source/data/URL baseline and implement only the4 named application/test files.
- [x] Verify meaningful before/after parity: products/order/images/URLs/Mock, all category/child queries/history/search/featured, Grid/List/Compare/pagination; run existing catalog/navigation suites plus updated catalog suite.
- [x] Inspect browser screenshots at320/390/768/1024/1440/1920 and mobile landscape; keyboard/Enter/focus/touch vertical scrolling, slow images and viewport changes without reload, reduced motion and no document overflow.
- [x] Run scoped formatter/ESLint, typecheck, catalog units and production build; update actual implementation results and preserve source outside approved scope.
- [x] Record audit current state and proposed checks; format/check documentation and verify protected application files before audit handoff.

## Impact / Rollback

Audit is R2: two root documentation additions and ignored local report/evidence only. Existing preview was started from its complete previous build for read-only inspection. No source/data/global changes or deployment. Proposed redesign affects /products presentation and may make model search less immediate; include a top shortcut to the finder. Product images may limit hero display quality; use original contain images. Avoid touch scroll trapping and shared-card regressions. Proposed rollback restores only the4 task diffs; no database migration. Expand scope only after updating Spec/Plan and receiving approval for that extension.

## Verification Results

Browser audit: Apple1440/390/original panel and real next-gallery movement; SUNFORD existing build1440/768/390, observed146items, grid4/3/2 and no document overflow. Mobile390 first product begins about700px. Reference viewport reset and original tab returned to top. No application tests/build were run for documentation-only work; old-build observations do not validate a new design. Documentation formatting/diff/protected-source results recorded in output/apple-products-reference-20261106/verification.json. No new qualifying Next framework feedback candidate and no automatic production release.

## Approved implementation evidence

Owner approval received2026-11-06 for the4 named application/test files. Backups/protected hashes, verification scripts, screenshots, logs and delivery report stay under output/apple-products-reference-20261106/implementation/. QA uses a separate temporary source/build directory with existing dependencies and public assets, fixture environment, no copied credentials and no DB writes. Existing preview3000 remains until the approved replacement build is verified.

Documentation follow-up required by the owner's global AGENTS project-memory rule: append the verified disk-space/shared-generated-client failure and concrete recovery instruction to MEMORY.md. This adds project documentation only; the approved4-file application/test scope remains unchanged.

## Final implementation results

- [x] Exact4 application/test paths implemented; no shared/global/data/dependency changes. MEMORY.md contains the required operational lesson, and prior document history is preserved.
- [x] Node24.22.1 final QA fixture build and normal workspace build both431/431. Prisma generation and final TypeScript recovered after the owner resolved ENOSPC.
- [x] Catalog94/94; final Browser44/44 with original data contracts and strict keyboard visibility retained. Initial failing logs preserved separately.
- [x] Before/after29states and537ordered entries are identical in both matched fixture and actual-preview captures.
- [x] Updated preview3000 screenshots at320/390/768/1024/1440/1920/844landscape inspected; no overflow, correct2/3/4 columns. Native Touch simulation vertical205px/horizontal258px, slow-image resizing and reduced motion verified.
- [x] Previous .next preview retained in the task output directory, replacement preview3000 running session90691; QA3046 stopped after checks. No commit/push/deploy.

Evidence: output/apple-products-reference-20261106/implementation/delivery.md, verification.json, preview-catalog-parity.json, catalog-parity-result.json, responsive-ui.json, build-focus-final.log, preview-build-final.log, e2e-final.log and21 actual-preview screenshots. Final formatting/preservation checks are recorded in verification.json. No new qualifying Next framework feedback candidate.

# Plan: Full Apple Products page parity (2026-11-06)

Status: "Ready to Code"
Approval: "Approved — explicit owner approval of expanded plan on 2026-11-06"

## Files

Documentation and local audit deliverables, prepared before approval:

- `spec.md` — append full-page requirement, source mapping, route/data contracts, acceptance and approval boundary; retain prior work
- `plan.md` — this exact expanded file scope, sequence, impact and rollback
- `output/apple-products-full-parity-20261106/report.md` — complete reference→SUNFORD mapping and measured responsive/interaction inventory
- `output/apple-products-full-parity-20261106/verification.json` — audit/source-preservation receipt; append implementation evidence after approval

Proposed application/test scope; no other application files:

- `src/app/(site)/layout.tsx` — replace only the outer frame composition with route-aware frame, passing existing Header/Footer/Overlays as server slots
- `src/features/catalog/components/catalog-route-frame.tsx` — new small client wrapper using exact usePathname `/products`; use overview frame only there and preserve prior frame/skip link/Header/Footer/Overlays elsewhere
- `src/app/(site)/products/page.tsx` — keep product/category fetch/resolvers; assemble verified SUNFORD overview content, CMS navigation/site settings and server-rendered guide/paragraph slots
- `src/features/catalog/components/products-overview.tsx` — new route-local overview with reference Header/Footer, all galleries, hero tabs/Play-Pause, modal/finder launcher, image accordion, menus and mobile footer disclosures
- `src/features/catalog/components/products-overview.module.css` — new scoped reference geometry/colors/type scale/responsive/chrome/modal styling, including products frame; no global stylesheet edits
- `src/features/catalog/components/product-category-mock.tsx` — add explicit finder-only presentation for use in overview popup; retain existing standalone mode and all catalog data/query/filter behavior
- `src/features/catalog/components/product-category-mock.module.css` — finder-only embedding/heading/scroll sizing; preserve standalone styles for existing consumers
- `tests/e2e/product-category-mock.spec.ts` — open finder where appropriate, preserve strict catalog/query/visibility assertions; replace superseded selective-design assertions with full overview checks
- `tests/e2e/catalog-subcategory-navigation.spec.ts` — adapt navigation helper for route-specific products chrome while retaining all23 destination/member assertions and original chrome assertions elsewhere
- `tests/e2e/products-full-overview.spec.ts` — new full-section/menu/gallery/modal/accordion/route-cache regression tests

Read-only sources include current product/category/server projections, CMS navigation/settings, brand/home-benefits/business-solutions, buying-guides/product-topics, images/video already in public, existing shared Header/Footer/styles and bundled Next.js docs. No shared component implementation/global token/public asset/data files are in the mutation scope.

## Steps

- [x] Inspect current Apple desktop/mobile/tablet structure, galleries, service/feature popups, menu and available footer/accordion controls.
- [x] Map every section to existing SUNFORD facts/assets/routes; prepare complete expanded Spec/Plan and identify the shared-layout boundary.
- [x] Receive explicit approval for this exact expanded plan, including route-specific chrome and finder popup. Actual owner response recorded in spec.md.
- [x] Read relevant installed Next.js16.4.3 layout/navigation/cache/image guides before code; snapshot all10 app/test paths (including absence of new paths), current docs and protected hashes. Keep current verified preview/build as rollback baseline.
- [x] Implement route frame and server page projection first. Preserve original frame DOM/class/slots outside exact `/products`; keep other routes'1400px header behavior.
- [x] Build complete overview in reference order using the report mapping. Match blue CTA/paper/type scale/gutters/radii/arrow treatments and responsive rules; replace all brand/content with SUNFORD records. Reuse existing dependencies only.
- [x] Add real hero tabs/autoplay/Play-Pause (pause when reduced-motion/offscreen or on manual input), service+feature popups, gallery arrows/swipe, menu and footer disclosures, image accordion. Use accessible focus/scroll handling; content that does not need interaction remains server-rendered slots.
- [x] Embed existing finder in the large reference popup. Plain `/products` starts overview; category/subcategory queries open it automatically. Preserve filters while closing/reopening and history behavior; compare opens existing store overlay and search uses existing search behavior. No fake cart/checkout.
- [x] Verify all gallery/modal/accordion states, keyboard/focus return/Escape/touch/vertical page scrolling and reduced motion. Inspect browser snapshots against Apple at matching sizes and record exact visual exceptions from own assets/text/font.
- [x] Compare matched-data29-state catalog baseline, run catalog units, updated catalog/child-navigation/full-overview suites and existing header/navigation/detail-related regressions as applicable. Keep strict data assertions; do not weaken them to match UI changes.
- [x] Check cold load and client navigation products↔home/contact/guide/detail plus back/forward/cache reuse; assert exactly one Header/Footer and correct styles/frame on each route.
- [x] Check320/390/734/768/834/1024/1068/1440/1920 and844x390, resize/slow images/long names, no document overflow. Save all section and key modal/menu screenshots, inspect actual rendered images.
- [x] Run formatter/scoped ESLint/typecheck/catalog and production build with Node24; use isolated writable generated source if QA copy is needed. Replace preview3000 only after successful build and smoke checks.
- [x] Update actual results/checklists/current contracts and delivery/verification files. Review Next.js feedback candidates once before final. No commit/push/deploy without a separate request.

## Impact / Rollback

R2 page redesign with a shared-layout composition boundary. Main risk: pathname-based chrome switch could omit/duplicate Header/Footer, alter top offset or leak state during client navigation/cache reuse. Exact pathname check, unchanged original RSC slots and route-navigation regression are required. Do not hide shared chrome with body/:has or cached-DOM detection.

The overview places the full finder one interaction deeper; persistent “ดูสินค้าทั้งหมด”, top search and direct query opening preserve discoverability. Autoplay/popups can affect motion/focus/scroll; provide pause, reduced-motion defaults and focus restoration. Media aspect ratios and text lengths differ by brand; preserve whole real products without distortion and report these data-dependent differences.

Before changes, archive the current successful implementation and10 proposed paths, preserve the running preview/build and hash all protected paths. Roll back only this task's added files/diffs and the small shared-layout composition change to those snapshots, retaining previous uncommitted work. No DB rollback/migration. Current7 modified paths from the earlier approved work must not be discarded.

## Verification Results

Full reference audit and content/source mapping complete; details in output/apple-products-full-parity-20261106/report.md. No new application files changed and no implementation checks claimed yet. Earlier44/44 Browser,94/94 catalog and431-page build belong to the preserved previous design. No new qualifying framework-feedback issue in this read-only audit.

## Implementation contract notes

The approved10 application/test paths are implemented. The route frame moves the existing server Overlays slot into the open native finder dialog through a portal host, keeping the existing comparison bar/search/compare dialogs interactive within native focus isolation. Zustand remains the shared comparison/search state. Other routes retain their original frame/classes/Header/Footer/Overlays.

The pathname-dependent frame uses a null Suspense fallback. Rendering the entire page again in that fallback created transient duplicate page/chrome trees while streaming, so the page is rendered once inside the frame. Unknown dynamic pathnames stream the frame when resolved, as required by the installed usePathname guide; known static paths prerender normally.

Embedded finder omits the standalone data-page-surface marker so a cached inactive products DOM cannot trigger the original shared :has paper-background selector on another route. Fresh-vs-cached frame background/top-padding checks accompany the Header/Footer visibility assertions.

Client-only overview controls are disabled in server markup until hydration; a cold-click trace showed a required client chunk arriving after an otherwise enabled launcher was clicked. Keyboard checks wait for enabled state before focusing. Copyright year is supplied from a cached server function to follow the installed Next.js current-time rule. Existing JC21 cutout/video and all other local/current product media are reused; no assets generated or edited.

Required documentation follow-up: append the verified cold-interaction lesson to MEMORY.md under the standing project-memory instruction. This does not expand the10-file application/test scope. Final automated checks, responsive images and preservation receipt will be recorded in output/apple-products-full-parity-20261106/verification.json and delivery.md.

A QA dev command was briefly launched from the workspace instead of the QA workdir. It was stopped; Next.js had intentionally removed the feedback-guidance block because that process had telemetry disabled. AGENTS.md was restored only after its exact candidate bytes matched the original protected hash. No framework report is warranted for that documented opt-out behavior. The concrete dev-server directory guard is appended to MEMORY.md, and final protected-file verification must include AGENTS.md.

## Final verification and delivery

All implementation steps and acceptance checks are complete. Node24 fixture/actual builds431/431; task Browser57/57; actual-preview Browser15/15; existing detail/related2/2 and touch/software navigation2/2. Catalog94/94; original data assembly/filter/query/subcategory/pagination logic and29-state/537-entry parity retained. Nine actual widths plus fixture landscape, native touch, keyboard, popup focus, reduced motion/manual pause, image accordion, menus/footer and cache navigation/background checks pass. Final source hashes/QA equality/protected-file receipts are in verification.json; final formatter/lint/typecheck/diff results are appended after these document updates.

Real screenshots for each section, compact/long popup, menu and touch state are preserved in final-preview-results/ and final-browser-results/. Delivery.md includes source/behavior details, exact data-normalization limits, rollback and the unrelated stale desktop navigation URL assertion. The original failed logs, external DB-timeout build log and corrected test-harness results remain available. No assertions were weakened for data/membership/focus/overflow. The previous preview build and source snapshots remain intact. Only preview3000 is left running after QA cleanup; no Git/release/data/stack mutations.

# Plan: Products SUNFORD company theme (2026-11-06)

## Files

- src/features/catalog/components/products-overview.module.css — แก้เฉพาะ accent/link/primary/hover/focus/product badge ตามสีบริษัท และลิงก์ hero พื้นดำใช้ขาวให้อ่านชัด
- spec.md, plan.md — เพิ่มข้อกำหนด การอนุมัติ แผน และผลตรวจสีครั้งนี้ โดยรักษาประวัติเดิม
- output/products-company-theme-20261106/ — เก็บ snapshot CSS/source hashes ก่อนแก้ หลักฐาน build/browser/screenshots และ delivery.md

## Steps

- [x] ยืนยันสีบริษัทและคำสั่งเจ้าของที่อนุญาตให้แก้สีภายใน module เดิม; อ่าน CSS Modules guide ของ Next ที่ติดตั้ง
- [x] เก็บ snapshot CSS และ source hashes ก่อนแก้
- [x] เปลี่ยน overview accent/primary/focus/badge เป็น --red และ primary hover #b51c24; hero พื้นดำใช้ลิงก์ขาว
- [x] ตรวจ diff/source scope และ format; build ด้วย Node24 แล้วอัปเดต preview3000 เมื่อ build สำเร็จ
- [x] ตรวจ Browser390/768/1440 สีจริง ปุ่ม/ลิงก์/focus/popup/hover และ nooverflow พร้อมภาพ; ใช้ existing overview regressions ที่ตรงขอบเขต
- [x] อัปเดตผลตรวจและสถานะใน spec.md/plan.md พร้อมส่งมอบ preview

## Impact / Rollback

ผลกระทบจำกัดสีใน Products และ dialog ลูก ไม่แก้ global tokens/shared chrome หรือข้อมูล การเปลี่ยนนี้ย้อนกลับได้ด้วย before-products-overview.module.css ใน output งานนี้ คง diff ที่มีอยู่ก่อนหน้าและเก็บ production build เดิมก่อน rebuild

## Verification Results

Node24 production build ผ่าน431/431รวม TypeScript; final existing overview Browser7/7บน Chrome (390/768/1440ครบทุกsection/finder searchและstate retention, compact/long popup, gallery/menu/footer/keyboard/motion). Browserจริงยืนยันสี primary/link/badge/focus #d7192d, CSS hover #b51c24 และ hero พื้นดำลิงก์ขาว; ไม่มีdocument overflow. Source hash ตรวจว่ามีเพียงCSS1ไฟล์กับspec/planเปลี่ยนจากก่อนงาน. Full format:check และ git diff --check ตรวจหลังอัปเดตเอกสาร. Preview3000ใช้session19808. หลักฐาน output/products-company-theme-20261106/delivery.md และ scope-verification.json; buildเก่าเก็บในprevious-preview-build. ครั้งแรก Browserไม่เริ่มเพราะheadless executableไม่มี ใช้Chromeที่ติดตั้งอยู่ผ่านPLAYWRIGHT_CHANNELเดิมโดยไม่ติดตั้งหรือเปลี่ยนโค้ดทดสอบ แล้วรอบfinal7/7ผ่าน.

# Plan: Products navbar service consolidation

Files: src/features/catalog/components/products-overview.tsx; spec.md; plan.md; output/products-navbar-service/ evidence.

- [ ] Combine About/Contact into Services groups for header only.
- [ ] Build and verify navigation, record results.

Impact/Rollback: Local navigation projection only; remove projection to restore, retain existing uncommitted work.

Verified: Done. Production build431/431 including TypeScript passed. Browser1440/390 confirms four top-level menus and Services retains About child links and Contact; Footer projection unchanged. Preview3000 session60578. No release.

Lint limitation: React Compiler preserve-manual-memoization flags existing openFinder useCallback dependency list after this projection; build and runtime pass. Scoped formatter corrected. No framework feedback report: diagnostic not verified as framework defect.

## Task: Products five primary category menus

Status: "Ready to Code"
Approval: Direct owner request to promote five pictured categories with their own children.

Scope/Plan: products-overview.tsx projects existing Products navigation into five primary category dropdowns with existing category/subcategory hrefs; preserve solutions/software/consolidated Services and Footer. products-overview.module.css adjusts header breakpoint only if needed for width. Preserve data/routes/global chrome. Fix local openFinder dependency diagnostic while verifying this component. Verify build/lint/mobile and desktop category ownership. Rollback only this projection.

Completed: Build431/431 and TypeScript/scoped ESLint passed. Browser834px header fits; each five dropdown contains correct category only (9/4/5/4/6 links including category entry,23 child links total). Mobile390px category dropdown verified. Footer unchanged. No CSS change needed. Preview3000 session12602. openFinder dependency diagnostic resolved using stable setter dependency. No qualifying Next.js feedback candidate.

## Task: Sitewide approved navbar

Status: "Ready to Code"
Approval: Owner explicitly requested applying the new navbar to every page.

Files/Plan: create src/components/layout/primary-navigation.tsx by extracting approved Products header and projection; update products-overview.tsx to consume it; site-header.tsx to consume same component with CMS navigation/site; catalog-route-frame.tsx keeps exactly one header; site-background.module.css removes old fixed-header spacer because new header is in flow. spec.md/plan.md and output/sitewide-navbar evidence. Preserve Footer/data/routes/overlays. Mobile focus trap/body lock and inert content, search/compare and product-query navigation must remain. Check lint/type/build and Browser home/products/contact/detail at desktop/mobile. Rollback snapshot output/sitewide-navbar/before.zip; remove new component. No release.

Verification file: tests/e2e/sitewide-navigation.spec.ts — regression for one shared navbar on home/contact/product detail/Products, five category-owned submenu destinations and mobile inert/Escape cleanup. Screenshots saved to task output.

Sitewide navbar completed: one PrimaryNavigation shared by CMS SiteHeader and Products. Existing CatalogRouteFrame composition unchanged; remove old fixed-header padding only. All23 child destinations and consolidated Services preserved. New desktop mouse click keeps hovered dropdown open. Mobile focus trap/inert/body lock and Escape cleanup preserved; cross-route category link opens correct finder. Build431/431 including TypeScript; scoped ESLint; existing popup/hero2/2 and new sitewide regression2/2 passed. New tests cover home/contact/detail/products at390/1440, category ownership and mobile cleanup. Browser also verified actual home→category URL→finder and detail route. Final full formatter/typecheck/diff receipts follow in output/sitewide-navbar/. Preview3000 session34363. No commit/push/deploy. No qualifying Next.js feedback issue.

# Plan: Official-site product mega menus (2026-11-06)

## Files

- `src/components/layout/primary-navigation.tsx` — ปรับ projection ของ 5 product menus ให้มีชื่อสำรวจ/ดูทั้งหมดและกลุ่มรองจากลิงก์ navigation เดิม; คง props และเมนูอื่น
- `src/features/catalog/components/products-overview.module.css` — เฉพาะ product-menu layout เพื่อให้ 3 คอลัมน์อ่านง่ายและเรียงกลุ่มบนมือถือ โดยคงสีและสไตล์อื่น
- `tests/e2e/sitewide-navigation.spec.ts` — ปรับ assertions เดิมให้แยก primary category links ออกจาก related/support links; ตรวจ 5 หมวด, responsive, destination และ keyboard/menu cleanup
- `spec.md`, `plan.md` — บันทึกคำอนุมัติ ขอบเขต สัญญาข้อมูลและผลตรวจจริง
- `MEMORY.md` — บันทึกบทเรียนที่พิสูจน์แล้วเรื่องการตรวจ Header ที่ active แยกจาก DOM ของ route ที่แคชไว้ ตาม Project Memory instruction
- `output/official-product-megamenu/` — snapshot ก่อนแก้, logs, browser screenshots/receipts และ delivery.md

## Steps

- [x] ยืนยัน Ready to Code และคำอนุมัติ “ปรับตามที่แนะนำเลยครับ”; ตรวจ navigation ปัจจุบัน, brand tokens, Next.js CSS Modules/Link docs และเวอร์ชันจริง
- [x] เก็บ snapshot ของ 3 source/test paths และ protected source hashes ก่อนแก้
- [x] ปรับ 5 product projections และ CSS เฉพาะ product menus ตาม Spec; ไม่เปลี่ยน CMS/default data/Footer
- [x] ปรับ existing sitewide regression เพื่อพิสูจน์ category ownership เดิมและ related/support groups ใหม่
- [x] ตรวจ scoped formatter/ESLint/typecheck และ production build ด้วย Node24; อัปเดต preview3000 หลัง build สำเร็จ
- [x] ตรวจ Browser 5 หมวดที่ 390/1440 และ responsive320/768/834/1024/1920/844x390; ตรวจ route/finder navigation, keyboard, menu scrolling, exactly-one active visible header และ pageerrors
- [x] อัปเดต Acceptance/ผลตรวจใน spec.md/plan.md และ delivery.md พร้อมหลักฐานภาพ

## Impact / Rollback

R2 เปลี่ยน shared header ที่ใช้ทุกหน้าสาธารณะ จึงเสี่ยงคอลัมน์แคบ/เมนูยาวบน tablet/mobile และลิงก์ category ปะปนกับกลุ่มรอง ต้องตรวจ ownership ใน primary column เท่านั้นและพิสูจน์ลิงก์รองแยกกัน ย้อนกลับเฉพาะ3ไฟล์จาก output/official-product-megamenu/before.zip โดยรักษางานเดิมที่ยังไม่ commit ไม่มี DB/route rollback

## Verification Results

Node24 production build431/431รวมTypeScriptผ่าน; navigation6/6; Browser sitewide10/10และexisting popup/hero2/2ผ่าน ตรวจ5หมวดและ23child hrefsที่390/1440 พร้อม3-column/stacked geometry, support/related destinations, finderที่ถูกหมวดย่อย และsoftware/warranty navigation ตรวจเพิ่ม320/768/834/844/1024/1920 รวมlandscape และnative touch390x844: menu scroll0→327px หน้าไม่เลื่อนตาม ลิงก์ท้าย/กลับ/ปิด/inert cleanupผ่าน ภาพ1440/834/390ตรวจจริงแล้ว

Initial Browser2failuresเป็นtestที่นับinactive cached Products headerด้วย Runtimeยืนยันcached header0x0และมีactive visible headerเดียว จึงปรับเฉพาะtest selectorsแล้วรันใหม่10/10ผ่าน ไม่แก้Appเพื่อขัดขวางrouter cache หลักฐานinitial/final logsและcache-inspection.jsonเก็บครบ Final formatter/ESLint/typecheck/diffและprotected-source hashesอยู่final-checks.log/source-preservation.json/delivery.md ไม่มีrelease/data/dependency mutation ตรวจNext.js feedbackแล้วไม่มีqualifying candidate ไม่ได้ตรวจphysical device/Safari

# Plan: Product category main pages — first step (2026-11-06)

Status: "Ready to Code"
Approval: "Approved — owner: อนุมัติ (2026-11-06)"

## Files

- `src/features/catalog/server/product-categories.ts` — สร้างserver helperโดยย้ายเฉพาะการประกอบcategories/clientProducts/cardNamesจากProductsPageเดิม เพื่อให้overviewและหน้าหมวดใช้data contractเดียวกัน
- `src/app/(site)/products/page.tsx` — ใช้helperดังกล่าวแทนblockเดิม คงoverview content/propsที่เหลือทั้งหมด
- `src/app/(site)/products/category/[category]/page.tsx` — สร้างRSC routeสำหรับ5category IDs, generateStaticParams/metadataจากชื่อจริง, invalid404 และrenderรายการเฉพาะหมวดภายใต้shared layoutเดิม
- `src/features/catalog/components/product-category-mock.tsx` — เพิ่มcategory presentationและcategoryIdสำหรับล็อกparentตามroute แสดงH1/ปุ่มสินค้าทั้งหมด ซ่อนparent switcher/showcaseในmodeนี้เท่านั้น; รักษาfinder/overview modesและfilter engineเดิม
- `src/features/catalog/components/product-category-mock.module.css` — เฉพาะcategory presentation heading/button/search/layout ใช้design tokensและgridเดิม หลีกเลี่ยงglobal DOM-presence selectorsที่อาจmatchinactive route cache
- `src/features/catalog/components/products-overview.tsx` — ให้FinderQuerySyncรองรับ `catalog=all` เพิ่มจากlegacy queryเดิมเท่านั้น
- `src/components/layout/primary-navigation.tsx` — เปลี่ยนhref projectionเฉพาะ5category main links/23childrenไปrouteใหม่ และปรับproduct-menu detectionให้รองรับเส้นทางใหม่; ไม่แก้CMS navigationต้นฉบับ/กลุ่มรอง/handlersอื่น
- `tests/e2e/sitewide-navigation.spec.ts` — ปรับexpected categoryhrefsและพฤติกรรมจากPopupเป็นหน้าหมวด โดยรักษาการตรวจ5เมนู/กลุ่มรอง/บริการ/responsive
- `tests/e2e/product-category-pages.spec.ts` — สร้างregressionสำหรับ5หน้า/23child selection/data parityกับcatalogเดิม/ปุ่มรวม/refresh/history/invalid route/desktop/mobile
- `spec.md`, `plan.md` — บันทึกข้อเสนอ คำอนุมัติจริง และผลตรวจหลังดำเนินการ
- `MEMORY.md` — บันทึกบทเรียนที่ตรวจจริงเรื่องfinite category routes/Cache Componentsและสถานะ404 ตามProject Memory instruction; ไม่เพิ่มApp scope
- `output/product-category-main-pages/` — เก็บsnapshot/manifestก่อนแก้ logs Browser screenshots/data-parity receipts และdelivery.md; ขณะนี้มีเพียงproposal.md

## Steps

- [x] ตรวจข้อกำหนด ภาพล่าสุด โครงสร้างNavbar/ProductsPage/Finder/route frame และcategory data assemblyเดิม
- [x] เตรียมSpec/Planที่ระบุ5routes ตำแหน่งปุ่ม พฤติกรรมlegacy และขอบเขตเฉพาะขั้นแรกให้ตรวจ
- [x] ได้รับคำอนุมัติSpec/Planนี้จากผู้ใช้ และบันทึกข้อความจริงในspec.md
- [x] อ่านNext.js installed docsสำหรับdynamic routes/params/metadata/Link และCSS Modules ตรวจversions แล้วsnapshotทุกproposed pathรวมabsenceของnew files พร้อมprotected-source hashes
- [x] เก็บbaselineทุก5category/23child ordered entries/real+Mock countsจากcatalogเดิมก่อนเปลี่ยน พร้อมสถานะค้นหา/compareที่เกี่ยวข้อง
- [x] แยกserver assemblyตามเดิมโดยไม่เปลี่ยนข้อมูล และเพิ่ม5category RSC pages
- [x] เพิ่มcategory presentationในcatalogengineเดิมพร้อมปุ่มรวม; ปรับNavbar hrefsและFinderQuerySyncตามcontract
- [x] ปรับexisting sitewide testsและเพิ่มcategory-page regressions โดยตรวจparity/links/route cache/focus/history/invalid routesตามAcceptance
- [x] รันformatter/scoped ESLint/typecheck/navigation+catalog unitsที่เกี่ยวข้อง และproduction buildด้วยNode24
- [x] อัปเดตpreview3000หลังbuildผ่าน ตรวจBrowser320/390/768/834/1440/1920และkeyboard/touch flow เก็บภาพ5หน้าหมวดและPopupรวม
- [x] ตรวจprotected source/contracts/Next.js feedback candidates แล้วอัปเดตSpec/Plan/ผลตรวจและส่งมอบเฉพาะขั้นนี้

## Impact / Rollback

R2 แต่มีshared navigationและserver data assemblyเป็นขอบเขตข้ามcomponent ความเสี่ยงหลักคือหมวดอื่นปะปน, Mockหาย, URLเก่าพัง, cached routeค้างselection, Header/Footerซ้ำ หรือoverlay/focusขัดกัน ใช้membershipและordered-entry parityจากengineเดิม ตรวจactive visible headerแยกจากcached DOM และรักษาlegacy query pathไว้

ใช้nested `/products/category/[category]` เพื่อไม่ชนexisting product-detail `/products/[slug]` ไม่แก้schema/CMS data/legacy routes การย้อนกลับคืนเฉพาะ7application pathsและ2test pathsจากsnapshot ลบเฉพาะnew filesที่บันทึกว่าไม่มีก่อนงาน และคืนpreview buildเดิม โดยไม่ทับงานก่อนหน้าที่ยังไม่commit

## Verification Results

Implementedครบ7App/2Test pathsตามแผนและอัปเดตMEMORYตามstanding instruction Final Node24build437/437รวมTypeScriptผ่าน; catalog94/94; category+sitewide Browser19/19; existing overview popup/hero2/2; original-baseline parity29states/537ordered entriesผ่าน โดยstatus/model/detail href/original asset/Mock/orderตรงกัน Native touch390x844และglobal search/compare popup/detail200/invalid404ผ่าน ภาพ5หน้าที่390/1440และ320/834ตรวจจริง; responsive320/390/768/834/1440/1920รวมNavbar844/1024ผ่าน

Initial18/19มีunknown categoryHTTP200จากfallback streaming จึงแก้เฉพาะnew routeเป็นensureStatic="navigation"ตามinstalled docs เพื่อให้unknown paramsresolveก่อนส่งfallback ไม่แก้Proxy/global layoutและไม่ลดstrict404assertion จากนั้นBuild437/437ใหม่/focused4041/1/final19/19ผ่าน เก็บinitial/final logsครบ Final format/ESLint/typecheck/diff/source integrityอยู่final-checks.log/source-preservation.json; outside-scope source/config306ไฟล์ตรงbaseline ไม่มีunexpected files Preview3000session18291; no release/data writes/dependencies ไม่มีqualifying framework feedback candidate ไม่ได้ตรวจphysical devices/Safari

# Plan: Scales category in the existing Apple-inspired Products layout (2026-11-06)

Status: "Ready to Code"
Approval: "Approved — owner: อนิมัติ (2026-11-06)"

## Files

- `src/features/catalog/components/scales-overview.tsx` — สร้างServer Componentประกอบข้อมูลเฉพาะscales/CMS/siteและเนื้อหาจากคู่มือเครื่องชั่งเดิม ส่งเข้าProductsOverview; ไม่คัดลอกUIทั้งหน้าและไม่แก้getProductCategories data assembly
- `src/app/(site)/products/category/[category]/page.tsx` — exact category=scales renderScalesOverview ส่วนอีก4categoryคงProductCategoryMockเดิม รักษาgenerateStaticParams/ensureStatic/metadata/HTTP404
- `src/features/catalog/components/products-overview.tsx` — เพิ่มoptional category scopeโดยค่าdefaultยังเหมือนเดิม; scales title/8-child rail/local finder/heading/index/footnotes, เฉพาะscalesซ่อนEssentialsที่เกี่ยวกับหมวดอื่น ใช้stories/services/accordion propsตามข้อมูลที่ป้อน
- `src/features/catalog/components/products-overview.module.css` — เฉพาะheading/ปุ่มรวมและscales-scoped layoutที่จำเป็น ใช้styles/tokensเดิมไม่เปลี่ยนกฎNavbar/สี/geometryของหน้าproductsเดิม
- `src/features/catalog/components/catalog-route-frame.tsx` — extend exact overview routeจาก `/products` ไปยัง `/products/category/scales` เท่านั้น ให้ownHeader/Footerและoverlay hostทำงานโดยไม่ซ้ำchrome; routeอื่นคงเดิม
- `tests/e2e/scales-overview.spec.ts` — สร้างcoverageสำหรับscales layout/ข้อมูล/8child rail+finder/catalogรวม/keyboard/touch/route cacheและMain-content isolation
- `tests/e2e/product-category-pages.spec.ts` — ปรับเฉพาะexpectations/helperของscalesให้local finderตามSpecใหม่ คงstrictdata parity/4หน้าหมวดเดิม/refresh/history/filter/search/compare/404 assertions
- `tests/e2e/sitewide-navigation.spec.ts` — ปรับเฉพาะscales child behaviorและvisible footer assertionที่ได้รับผลจากtemplate โดยรักษาลิงก์Navbarและอีก4หมวด
- `spec.md`, `plan.md` — บันทึกคำอนุมัติจริงและcontract/ผลตรวจเฉพาะงานนี้
- `output/scales-apple-overview/` — proposal, before snapshot+absence manifest/protected hashes, baseline data/rendered page, browser/build/static logs/screenshots/delivery.md

## Steps

- [x] ตรวจProductsOverview/data props/fixed cross-category sections, scales guide/member recordsและroute-frame composition
- [x] เตรียมSpec/Planระบุplain scales overview,8child local finder, catalogรวม, shared-frame impactและไม่เปลี่ยนอีก4หมวด
- [x] รับคำอนุมัติแผนนี้และบันทึกข้อความจริงในspec.md
- [x] อ่านinstalled Next.js guidesที่เกี่ยวข้อง ตรวจversions/tokensและsnapshot8App/Test pathsพร้อมnew-file absenceและprotected source
- [x] บันทึกscales9states+all-products baselineและอีก4category presentation/data เพื่อเทียบก่อน/หลัง
- [x] ประกอบscales-onlyServer propsและเพิ่มoptional scopeในProductsOverview โดยไม่เปลี่ยนdefault `/products` rendering
- [x] เชื่อมscales branch/route frameและlocal finder scope; รักษาall-products destination/8child URL/existing data engine
- [x] ตรวจmain-contentไม่มีcross-category promotions และตรวจmembershipsด้วยIDs ไม่ใช้คำในชื่อสินค้า
- [x] รันscales/category/sitewide Browserและexisting overview regressions: 8children/data parity, popup focus/Escape/search/compare, exact1activeHeader/Footer, cached routes/Back/Forward
- [x] ตรวจresponsive7ขนาด/mobile landscape/keyboard/native touch/reduced motion/first cold interaction พร้อมภาพHero/lineup/cards/accordion/Popup
- [x] formatter/scoped ESLint/typecheck/catalog units/production buildNode24; อัปเดตpreview3000เมื่อbuildผ่านและตรวจfinal previewจริง
- [x] ตรวจoutside-scope sourceและNext.js feedback candidates อัปเดตSpec/Plan/deliveryผลจริงและส่งมอบเฉพาะscales

## Impact / Rollback

R2 แต่แตะProductsOverviewที่หน้า `/products` ใช้ร่วมกันและroute-frameซึ่งกำหนดchrome/portal เสี่ยงdefaultหน้าเดิมเปลี่ยน, Header/Footerซ้ำ, overlayอยู่ในinactive cacheหรือdataหมวดอื่นหลุดเข้าmain ใช้optional scopeที่defaultคงเดิมและexact pathname checksเท่านั้น ทดสอบทั้งtemplateเดิม/scalesและ4category pagesพร้อมcache navigation ตรวจvisible UIแยกจากcached DOM ห้ามใช้global :has/body presenceเพื่อซ่อนHeader

8scales subcategory URLsคงเดิม แต่เปลี่ยนจากinline category gridเป็นlocal finderตามหน้าProductเดิม ต้องตรวจdirect load/reload/selection/close/return focusและquery-historyที่เกี่ยวข้อง ปุ่ม “สินค้าทั้งหมด” ยังคงไปfull catalog5หมวดต่างจากlocal “ดูเครื่องชั่งทั้งหมด”

ย้อนกลับเฉพาะ5App/3Test pathsจากsnapshot ลบเฉพาะ2new pathsที่manifestระบุว่าไม่มีเดิม และคืนpreviewbuildก่อนงาน ไม่ทับงานเดิมที่ยังไม่commit ไม่มีDB/migration rollback

## Verification Results

Implementedครบ5App/3Test pathsตามapproved manifest; no other source paths changed Final Node24build437/437รวมTypeScriptผ่าน Catalog94/94, full functional Browser32/32 หลังแก้เฉพาะheading CSSได้buildใหม่/final-preview13/13พร้อมcenter alignment assertionsและoriginal popup/hero2/2ผ่าน Data parity29states/537ordered entriesตรงก่อนงาน Original Productsและ4หมวดมีsection/headings/links/status/footer signaturesตรงbaselineบนfinal preview

Native touch390x844 (chapter/Hero/lineup/positive vertical scroll/full catalog/Back) และcold blocked-JS gate/first enabled action/keyboard/reduced motion/Play/offscreen pauseผ่าน Responsive7ขนาด+844x390, local/full popup, nested compare2สินค้า/search,8children/23overall destinations/history/invalid category404และactive chrome/cache hostผ่าน ภาพHero/lineup/services/features/Accordion/Popupอยู่final-preview-results/ ตรวจภาพ390/1440จริงแล้ว

Initial harnessใช้ชื่อNavbarย่อแทนชื่อเต็มmanifest แก้เฉพาะtestและเก็บinitial log Actual header regressionวัดbutton offset21pxก่อนfix; scoped CSS overrideแก้แล้วcenter<=1pxทุกtested same-row width รักษาoriginalProducts spacing Final formatter/ESLint/typecheck/diffในfinal-checks.log และprotected310files/no unexpected changesในsource-preservation.json Preview3000session16022; ไม่มีrelease/data/stack changes ไม่ได้ทดสอบphysical devices/Safari ไม่มีqualifying Next.js feedback candidate

# Plan: Stop scales popup reopening on refresh (2026-11-06)

## Files

- `src/features/catalog/components/products-overview.tsx` — แยกinitial document reloadของscalesออกจากintentional query navigation; ล้างเฉพาะpopup queryโดยคงparameterอื่นและhash policyเดิม ค่าdefault/productsไม่เปลี่ยน
- `tests/e2e/scales-overview.spec.ts` — regression390/1440สำหรับrefresh-open/refresh-after-close/intentional controls/refresh-other-routeแล้วเลือกscales และcatalogรวม
- `tests/e2e/product-category-pages.spec.ts` — ปรับassertionreloadscalesให้Overviewclosedตามcorrectionใหม่ แล้วทดสอบreopenเลือกchildเดิมเพื่อคงfilter coverage
- `spec.md`, `plan.md` — บันทึกคำสั่งแก้โดยตรง contract amendmentและผลตรวจ
- `output/scales-popup-refresh/` — snapshot/protected hashes/before proof/logs/screenshots/delivery

## Steps

- [x] ยืนยันคำสั่งแก้scopeเดียวกันและอ่านsource/contractเดิม; ระบุpopup URL queryเป็นสาเหตุ
- [x] เก็บsnapshotและreproduce refreshตามURLในภาพก่อนแก้
- [x] ปรับscales-only reload handlingและtests โดยใช้navigation entryทั้งtypeและinitialURLเพื่อไม่กันNavbarที่คลิกหลังreloadหน้าอื่น
- [x] formatter/ESLint/typecheck/buildNode24และBrowser desktop/mobile: reload, click, legacy/full catalog, history/filter/close
- [x] อัปเดตผลตรวจ/protected scopeและPreview3000; ตรวจNext.js feedbackแล้วส่งมอบ

## Impact / Rollback

R2 เฉพาะquery-driven openingในcomponentเดิม เสี่ยงข้ามintentional navigationหลังdocument reload จึงต้องเทียบinitial navigation URLและทำresetเฉพาะmountแรกที่ตรงscales ไม่ใช้navigation.typeอย่างเดียว ย้อนกลับ3source/test pathsจากbefore.zip โดยรักษางานเดิม ไม่แก้DBหรือrelease

## Verification Results

BuildNode24จำนวน437/437รวมTypeScriptผ่าน Final refresh2/2ที่390/1440ผ่าน Related5casesในbrowser.logผ่านและOriginal2/2ผ่าน ข้อrefresh2ข้อในinitial related runติดhash expectationที่ขัดnavigation-start policyเดิม หลังตรวจsourceและแก้เฉพาะtestรัน2ข้อใหม่ผ่าน เก็บbefore/intermediate/final logsครบ ไม่ลดpopup/query/navigation assertions Initial protection314ไฟล์ตรงbaseline; final auditพบconcurrent lineup-card CSS editที่งานนี้ไม่ได้แก้ คงไว้แยกจากtask.patchและไม่รวมในpreview buildรอบนี้ Final protection313ไฟล์ตรงbaseline +1external CSS change Final static receiptอยู่final-checks.log ภาพrefresh-resultsแสดงOverviewโดยไม่มีPopup Preview58092 ไม่มีrelease/data/stack change ไม่มีframework feedback candidate Physical device/Safariไม่ได้ทดสอบ

# Plan: Align product lineup action rows (2026-11-06)

## Files

- `src/features/catalog/components/products-overview.module.css` — ปรับ productTile และ lineupCopy เป็น flex column ที่ยืดเต็มความสูง และใช้ auto margin ดัน tileActions เฉพาะ lineup ลงท้ายการ์ด
- `spec.md`, `plan.md` — บันทึกขอบเขต การอนุมัติ และผลตรวจ
- `output/lineup-action-alignment/` — เก็บ CSS ก่อนแก้ ภาพหลังแก้ และผล geometry/browser/build

## Steps

- [x] ได้รับอนุมัติ Spec/Plan นี้ก่อนแก้ application
- [x] เก็บ baseline CSS และ geometry ของ Products/เครื่องชั่ง
- [x] ปรับเฉพาะ CSS selectors ของ lineup โดยไม่เปลี่ยน JSX หรือ shared styles
- [x] ตรวจ Browser 390/768/1440px ทุกการ์ด รวม carousel/ลิงก์/ข้อความและ overflow พร้อมภาพ
- [x] ตรวจ formatter/typecheck/build และ diff; อัปเดตผลจริงใน Spec/Plan

## Impact / Rollback

R2 เปลี่ยนเฉพาะ lineup ใน Products และเครื่องชั่งซึ่งใช้ CSS เดียวกัน ความสูงพื้นที่ว่างในการ์ดอาจเพิ่มตามการ์ดที่มีเนื้อหามากที่สุด คืนเฉพาะ CSS delta จาก baseline เพื่อย้อนกลับโดยรักษางานเดิม

## Verification Results

Done. Beforeทุก6casesมีspread24px; หลังCSSแก้ทุกcase0px รวม36การ์ด/72action link instancesตรงเดิม ไม่มีoverlap/document overflow/pageerrors. Chrome390/768/1440ทั้งProducts/scalesพร้อมภาพผ่าน. Exact CSS deltaผ่านโดยverify.cjs; Node24production build437/437, tsc --noEmit, scoped Prettierและgit diff --checkผ่าน. Preview3000session40777ใช้buildใหม่. Next.js feedback passไม่มีqualifying candidate; ไม่มีrelease

# Plan: Direct category Navbar links (2026-11-06)

Files: `src/components/layout/primary-navigation.tsx` — category anchors/remove duplicate all link/split mobile controls; `src/features/catalog/components/products-overview.module.css` — scoped mobile row/anchor alignment only, preserve concurrent card CSS; `tests/e2e/sitewide-navigation.spec.ts` — adapt category opening/counts and verify direct label navigation; `tests/e2e/scales-overview.spec.ts`, `tests/e2e/product-category-pages.spec.ts` — adapt old button/all-link locators to new controls; `spec.md`, `plan.md`; evidence `output/navbar-direct-category/`.

- [x] ยืนยันคำสั่งแก้interactionในscopeNavbarเดิมและอ่านsource/docs/brand styles
- [x] snapshot5paths/protected hashes และรักษาCSSการ์ดจากงานอื่น
- [x] แก้5category controlsและtests โดยไม่แก้CMS/source data/other menus
- [x] formatter/lint/typecheck/buildNode24 และBrowser390/834/1440 direct/child/keyboard/mobile/route checks
- [x] อัปเดตผลตรวจและPreview ไม่มีrelease

Impact/Rollback: shared headerทุกpublicpage แต่เปลี่ยนเฉพาะproduct category controls; เสี่ยงmobiletapเปิดsubmenuแทนnavigateจึงแยกปุ่มลูกศรจากlink เก็บsnapshot5pathsเพื่อคืนเฉพาะงานนี้ ไม่ทับconcurrent edits ไม่commit/push/deploy

Verification: Node24 build437/437 with TypeScript, scoped ESLint/Prettier pass. Final Chrome16/16 on3009 and native mobile touch pass; screenshot inspection confirms no all-products submenu entry,23children retained and separate mobile controls44px. Initial desktop assertion adjusted to move pointer off header because new header can correctly reopen hovered submenu after route; passing final test retains hover behavior. An interrupted3000 run overlapped another task rebuilding/restarting that preview; final verification uses stable3009. Concurrent source changes preserved. No qualifying Next.js feedback candidate; no release.

# Plan: Compact aligned lineup actions (2026-11-06)

## Files

- `src/features/catalog/components/products-overview.module.css` — remove productTile minimum heights567/680/731px and description minimum heights63/78px; reduce lineup action padding24→16px. Preserve existing equal-height flex alignment and concurrent Navbar CSS
- `spec.md`, `plan.md` — record direct owner follow-up amendment and actual verification
- `output/lineup-action-spacing/` — pre-change CSS, measurement/screenshot harness, before/after results, build/check logs and delivery

## Steps

- [x] Record owner's explicit spacing correction within approved lineup CSS scope; inspect current selectors
- [x] Snapshot current CSS and measure both pages before edits
- [x] Apply scoped content-driven card height and16px minimum action gap
- [x] Verify390/768/1440 both pages: aligned buttons, reduced gaps, unchanged links/images/content, carousel/overflow and screenshots
- [x] Run formatter/typecheck/build, verify exact CSS delta preserving concurrent changes, update results and preview

## Impact / Rollback

R2: Only lineup height/spacing changes on Products and scales. Rows follow tallest natural content; shorter descriptions keep extra space needed for alignment. Restore this CSS delta from before.css without reverting concurrent Navbar edits

## Verification Results

Done. Baseline before.json from completed prior production build3049; after.json from finalbuild3000.6cases/36cards all spread0px; real text-to-button gap125–212px→17.5–67.5px, all gaps decrease107–145px.36card text/image and72action links match; normalize only localhost preview origin. Actual carousel scrolling positive, no overlap/overflow/pageerrors. Cards567/680/731px→459.59/558.19/586.19px. Exact CSS delta verified including preserved concurrent Navbar styles. Node24build437/437 including TypeScript, scoped Prettier and final diff check pass. Preview3000session47868; temp3049 stopped. No release or qualifying Next.js feedback candidate

# Plan: Indicators category in the existing scales Products layout (2026-11-06)

## Files

- `src/features/catalog/components/indicators-overview.tsx` — create server wrapper, scoped indicators products/guide/service content passed to existing ProductsOverview
- `src/app/(site)/products/category/[category]/page.tsx` — select IndicatorsOverview only for indicators, preserving static params/404/other categories
- `src/features/catalog/components/catalog-route-frame.tsx` — add exact indicators route to existing overview chrome/overlay-host switch
- `src/features/catalog/components/products-overview.tsx` — replace active-category accordion's hardcoded scales heading with category label; retain existing behavior/layout and identical scales output
- `tests/e2e/indicators-overview.spec.ts` — create focused category ownership/chapter/popup/reload/responsive/cache regression coverage
- `tests/e2e/product-category-pages.spec.ts`, `tests/e2e/sitewide-navigation.spec.ts` — adapt indicators catalog locators/heading levels to local finder, retain original membership assertions
- `tests/e2e/scales-overview.spec.ts` — adapt only the existing indicators cached-navigation Footer expectation to its approved overview chrome; necessary regression assertion update, no application scope expansion
- `spec.md`, `plan.md` — record approval, contract and actual verification
- `output/indicators-apple-overview/` — snapshots/protected hashes/catalog baseline/browser screenshots/static logs/delivery

## Steps

- [x] Inspect current scales template, indicators sources, brand tokens and installed Next.js page guide; record concrete Spec/Plan
- [x] Receive owner approval for this new category scope before editing application files
- [x] Snapshot planned sources and protected hashes; capture current indicators/all-three-child catalog states and unchanged route signatures
- [x] Add indicators wrapper and exact route/frame selection; remove scales-only wording from shared category heading without changing scales output
- [x] Adapt existing browser specs and add focused indicators runtime verification
- [x] Run formatter/scoped ESLint/typecheck/catalog units/Node24 production build
- [x] Verify Chrome390/768/834/1440 and touch: actual route rendering,3chapters/direct nav/popup/search/compare/reload/history, body/focus cleanup and cached cross-route navigation; compare catalog baseline, inspect screenshots
- [x] Verify protected-source preservation; update docs and delivery with actual results, preview and limitations

## Impact / Rollback

R2: Same ProductsOverview UI; affects only indicators presentation and its three child links. Shared CatalogRouteFrame changes route ownership for this exact path, so regression risk is duplicated chrome or cached overlay host on route transitions. Shared accordion label changes output only for newly adopted indicators; scales output must stay identical. Snapshot each touched file; revert only task delta, preserving existing and concurrent edits. No changes to Navbar, global layout/styles or data. No commit/push/deploy.

## Verification Results

Completed after explicit owner approval. Node24build437/437, catalog94/94, final TypeScript/scoped ESLint/formatter pass. Indicators7/7 again onfinal3000; related35/36 initially plus corrected old Footer assertion rerun2/2 (including strengthened indicators compare/search/cache coverage) completes all36related cases. Native touchLCD/finder/close/swipe passes.9catalog-state comparisons +5unchanged route signatures exact; initial inline child snapshot read before query sync, so use original combined selected-child references for those3states and assert aria-pressed before all final reads.297protected files unchanged,6planned existing files modified and2planned new files; no unexpected changes. Pictures inspected desktop/mobile. Finalpreview3000session31624; no release. No qualifying framework feedback candidate.

# Plan: Reference page entrance motion for scales and indicators (2026-11-06)

## Files

- `src/features/catalog/components/products-overview.tsx` — explicit scales/indicators entrance class and CSSProperties chapter index, preserving DOM/content/controls
- `src/features/catalog/components/products-overview.module.css` — one scoped named-keyframe/timing block for title, chapters and ribbon; media no-preference gate and keyboard visibility
- `tests/e2e/category-intro-motion.spec.ts` — deterministic animation timing/properties/scope/reduced-motion/no-replay/keyboard/reload regressions
- `MEMORY.md` — required reusable debugging notes: disabled scripting with opacity animations and initial title opacity affecting measured mobile LCP; documentation only
- `spec.md`, `plan.md` — approved follow-up contract and actual results
- `output/category-intro-motion/` — source/protected snapshots, before/after geometry/content/performance observations, screenshots and delivery

## Steps

- [x] Review supplied clip and existing CSS/SSR/reduced-motion contracts; record owner's explicit implementation authorization
- [x] Snapshot two sources and protected files; measure before390/1440 both routes at4xCPU and capture content/layout signatures
- [x] Implement only scoped finite CSS motion and CSS chapter ordering; preserve existing controls and no-motion fallback
- [x] Add focused browser coverage; run scoped formatter/ESLint/typecheck/production build onNode24
- [x] Verify normal/reduced/no-JS, keyboard/touch/reload/popup/cache; inspect intermediate/final screenshots and before/after metrics; run related category regressions
- [x] Update actual results/protection audit; refresh preview3000 and deliver without release

## Impact / Rollback

R2 affects only two overview entrances. Delay is finite and short; no image or layout animation, no JS animation work. Ribbon text color can cause bounded text painting during its1800ms entrance; verify on4xCPU rather than claiming zero paint. Apply entrance rules only under no-preference and scripting:enabled, so disabled JavaScript and unsupported media features retain static readable content. Restore task source delta from before.zip, preserving unrelated work. No global component edits, dependency changes, commit, push or deployment.

## Verification Results

Done. Node24 build437/437, TypeScript/scoped ESLint/formatter pass. Final32/32 Chrome cases on3000 plus native touch2routes pass. Four4xCPU captures preserve content/geometry exactly, CLS0, final intro count0; single-run LCP before880/688/828/636ms→after716/608/568/568ms. Title experiment identifies opacity0→LCP1068ms vs15%→556ms on same mobile route/CPU. Disabled scripting left the initial fade state applied; media scripting:enabled fixes this with static fallback. Measurement now waits for native animation completion after the minimum2400ms window rather than assuming DOM insertion was at navigation time0.302protected paths unchanged, two app sources +new spec +required MEMORY note only. Preview3000session8742 uses final build; temporary3007 stopped. No release; no qualifying framework feedback candidate. Full receipts and lab limitations in delivery.md.

# Plan: Slower, smoother category entrance (2026-11-06)

Files: `src/features/catalog/components/products-overview.module.css` — timing/easing variables only; `tests/e2e/category-intro-motion.spec.ts` — updated phase/timing assertions and verify easing; `spec.md`, `plan.md`; evidence `output/category-intro-slower/`.

- [x] Record direct owner correction within approved two-page motion scope
- [x] Snapshot CSS/test and protected hashes; reuse preceding verified after.json as the approved-profile baseline
- [x] Apply800ms reveal/140ms stagger/3000ms ribbon and shared soft-start/end easing without changing keyframes or interaction logic
- [x] BuildNode24, scoped formatter/lint/typecheck, ten motion browser cases and four4xCPU content/geometry/CLS observations; inspect intermediate screenshots
- [x] Refresh preview3000, update actual results and deliver; no release

R2: only timing/easing within existing media/route scope. Restore this delta from snapshot without overwriting other work. No layout/data/library/JS changes. Verified Node24build437/437 inclTypeScript, scoped lint/formatter, Chrome10/10 and four4xCPU comparisons. Content/geometry exact, CLS0, remaining intro0; final LCP816/688/604/596ms. Timing/easing CSS delta verified;304protected files unchanged. Desktop intermediate screenshot inspected. Preview3000session99404; no release or qualifying framework feedback candidate.

# Plan: Platforms category overview with latest entrance motion (2026-11-07)

## Files

- `src/features/catalog/components/platforms-overview.tsx` — create server wrapper for platforms-only products and existing platforms guide/service content
- `src/app/(site)/products/category/[category]/page.tsx` — select wrapper only for platforms; preserve static params/metadata/404 and other routes
- `src/features/catalog/components/catalog-route-frame.tsx` — add exact platforms overview route for existing chrome/overlay-host ownership
- `src/features/catalog/components/products-overview.tsx` — add platforms to existing categoryEntrance opt-in only; no new animation mechanism
- `tests/e2e/platforms-overview.spec.ts` — new category ownership/4chapters/guide/local finder/reload/cache/responsive coverage using current catalogue labels
- `tests/e2e/product-category-pages.spec.ts`, `tests/e2e/sitewide-navigation.spec.ts`, `tests/e2e/catalog-subcategory-navigation.spec.ts` — adapt platforms local-finder heading/locator expectations while keeping all catalogue/23child assertions
- `tests/e2e/hicks-law-catalog.spec.ts` — open the approved new platforms local finder before existing narrow-search/zoom geometry assertions; retain the search/facts assertions themselves. Required test-only adaptation, no application scope expansion
- `tests/e2e/category-intro-motion.spec.ts` — include platforms with4chapters in existing latest-timing/reduced/no-JS motion cases
- `spec.md`, `plan.md` — approval, contracts, checklist and actual verification
- `output/platforms-apple-overview-20261107/` — source/hash snapshots, selected-filter catalogue baseline, final browser/performance screenshots/logs/delivery

## Steps

- [x] Read current project instructions/memory, live source contracts, brand tokens, platform models/guide and installed Next.js page guidance
- [x] Obtain approval for this concrete new-category Spec/Plan before editing application files
- [x] Snapshot scoped/protected files; capture platforms all/4selected-child states and unaffected route signatures on the current verified preview, waiting for actual filter selection
- [x] Add scoped wrapper/route/frame/entrance opt-in, retaining existing page/data/control/CSS contracts
- [x] Adapt affected browser expectations and add platform-specific coverage without dropping catalogue membership, focus or history checks
- [x] Run scoped formatter/ESLint/typecheck/catalog units/Node24 production build
- [x] Browser:390/768/834/1440, touch, keyboard, popup/search/compare/reload/history/cache, latest motion/reduced/no-JS; inspect screenshots and control bounds
- [x] Verify baseline catalogue parity, original Products/scales/indicators/POS/accessories and homepage Header preservation; record4xCPU motion observations and protected-source audit
- [x] Update docs/evidence/preview3000; deliver actual results/limitations without release

## Impact / Rollback

R2. CatalogRouteFrame and ProductsOverview are shared feature components; add exact platforms selection/opt-in only. Main regression risk is duplicate active chrome or wrong overlay host during cached navigation; verify actual active Header/Footer and nested compare/search/focus. Preserve all current Hick’s law catalogue work and homepage Header, global files, wrappers and motion CSS byte-for-byte. Restore only task deltas from source snapshots; no database/dependency/global styling changes or release.

## Verification Results

Completed after explicit approval. Node24build437/437, catalog102/102, final TypeScript/scoped ESLint/formatter/whitespace pass.58distinct cases have latest passing results (browser-summary.json); final platform/Hicks15/15 pass on3000. Initial regression failures were old inline-catalog assumptions and a new Header test using1280px while asserting the1440px58px breakpoint; assertions corrected using current source, without changing application Header/CSS.11catalogue states and5unaffected main signatures exact. Native touch357px and4xCPU fourcase CLS0/geometry/content/child bounds/animation cleanup pass; snapshots inspected.303protected paths unchanged;8existing planned source/test files changed and2planned files created, including the documented Hicks test-only addition. Preview3000session49155 preserves existing0.0.0.0 binding; its initial conservative restart guard was updated only after verifying the actual project executable/hostname arguments. Temporary3006 stopped. No release or qualifying framework feedback candidate.

# Plan: Restore five category menus on the dark homepage Header (2026-11-07)

## Files

- `src/features/cms/data/primary-navigation.ts` — create pure helper by moving existing PrimaryNavigation projection/constants unchanged
- `src/components/layout/primary-navigation.tsx` — consume helper; all current behavior/data preserved
- `src/components/layout/header.tsx` — consume helper, correct category column caption, expose native category links and separate mobile disclosure, preserve surface/Hero/header behavior
- `src/styles/header.css` — scoped expanded desktop menu spacing and separate mobile category row/link/disclosure dimensions; preserve color/height/blur/animation rules
- `tests/catalog/primary-navigation.test.ts` — approved order/23children/Services/CMS preservation tests
- `tests/e2e/home-category-navigation.spec.ts` — desktop/mobile5parents/23children/Services/theme/bounds/native-link verification
- `tests/e2e/navigation.spec.ts`, `tests/e2e/navigation-accessibility.spec.ts` — adapt affected legacy Header assertions to approved category structure while retaining catalog/software/history/keyboard checks
- `tests/e2e/nonblocking-opening.spec.ts` — retain consultation-during-opening coverage and assert the current contact-page PrimaryNavigation ownership instead of the obsolete legacy Header selector
- `spec.md`, `plan.md`, `MEMORY.md` — record correction, verification and reusable theme-versus-menu integration safeguard
- `output/home-category-navbar-fix-20261107/` — snapshots/hashes/old-projection equality/actual browser images/static logs/delivery

## Steps

- [x] Read current menu consumers, restoration record, approved contracts and source; identify raw-versus-projected data as cause
- [x] Snapshot scoped/protected files and capture existing dark Header geometry; save prior projection output for independent equality checks
- [x] Share exact existing projection, restore category content on Home and preserve native mobile parent navigation
- [x] Adapt affected Header checks and add direct regression for actual Home menu contents
- [x] Run formatter/ESLint/typecheck/catalog units/Node24 production build
- [x] Verify Home390–1920, short native touch, all5parents/23children, hover/keyboard/Escape/search/compare, normal opening/delayed fonts, Header tone/height/child bounds and other-page navigation; record separate software failure
- [x] Audit source preservation, update records and preview3000; deliver without release

## Impact / Rollback

R2 scoped correction inside the approved sitewide Navbar work. Header/styles are shared but currently used for Home; PrimaryNavigation projection extraction touches all other routes, so verify equality to snapshot before runtime tests. Preserve Header heights and global surface padding; allow bounded horizontal expansion for8menus. Snapshot every edited path; restore only task delta without reverting pending work. No CMS/default-source rewrite, package changes or release.

## Verification Results

Completed scoped correction. Node24build437/437, catalog105/105, TypeScript/scoped ESLint/Prettier/whitespace pass. Home8/8, sitewide12/12, nonblocking opening6/6, legacy navigation10/10, accessibility2/3:38latest passing cases of39distinct. One remaining software same-page hash/filter test fails on unchanged other-page navigation behavior; retained as a visible failure, no software scope expansion. Projection equals archived implementation for3CMS cases; PrimaryNavigation state/events/render exact after extraction. Header geometry/glass/logo/Hero exact at4widths; screenshots inspected.308protected hashes unchanged,7planned existing files changed and3planned files created. Raw no-JS server HTML verified separately from native prehydration links because fully disabled scripting can leave streamed root content hidden. Preview3000 serves final built app; temporary3005 stopped. No release or qualifying verified Next.js feedback issue. Full receipts/limitations: output/home-category-navbar-fix-20261107/delivery.md.

# Plan: Match homepage Navbar spacing to other pages (2026-11-07)

## Files

- `src/styles/header.css` — scoped current category Header row/logo/menu/tool geometry and834px breakpoint to match PrimaryNavigation; preserve tone/flyout behavior
- `src/components/layout/header.tsx` — change existing resize listener's breakpoint from1400px to834px alongside CSS, with no other interaction change
- `src/components/layout/site-background.module.css` — match fixed-header compensation48/44px so Hero retains top0
- `src/features/home/components/hero-scene.module.css` — remove obsolete56px medium-width Header fallback and use the owning surface height at every width, including before hydration
- `tests/e2e/home-category-navigation.spec.ts` — update explicit Home height expectations and add direct route-to-route geometry comparison
- `tests/e2e/navigation.spec.ts` — update Home mode-switch breakpoint to834px; preserve current interaction tests
- `tests/e2e/sitewide-navigation.spec.ts`, `tests/e2e/platforms-overview.spec.ts` — update Home responsive-height expectations only where needed
- `spec.md`, `plan.md`, `MEMORY.md` — correction, results and geometry safeguard
- `output/home-navbar-spacing-20261107/` — baseline hashes/snapshots,21geometry measurements, browser/static evidence and delivery

## Steps

- [x] Confirm user's spacing-only correction, inspect actual CSS and measure both components before editing
- [x] Snapshot allowed and protected sources; align only Home geometry and surface compensation
- [x] Update related geometry assertions; compare actual rectangles and responsive bounds
- [x] Run scoped formatting/typecheck/build and browser geometry/navigation/opening/cache checks; inspect screenshots
- [x] Record verified results/source protection; refresh preview3000 and deliver without release

## Impact / Rollback

R2. Application scope is three CSS files and the existing Header resize-listener breakpoint only. Keep normal Home opening, surface tracking and dark glass. Hero reads Header row height dynamically; its prehydration fallback and owning surface padding must track the same height. Restore only current task deltas from snapshot, preserving all pending work.

## Verification Results

Completed. Before measurements confirmed Home's108/118px logo, centered menu group,58/56px height and1400px breakpoint differed from other pages. After:16paired comparisons across390/768/833/834/1024/1400/1440/1920 match all Header/row/logo/parent/tool rectangles within1px;14other-page signatures unchanged; Hero top0, including prehydration833/834. Node24build437/437, TypeScript/scoped lint/format/whitespace pass. Chrome39/39 on QA3005; final24measurements and prehydration checks on refreshed3000. Desktop screenshots inspected; touch, keyboard, opening/delayed fonts and cached platform navigation pass.310protected paths unchanged, only8planned existing paths changed. No sitewide-navigation test edit was necessary. Temporary3005 stopped; preview3000session17492 retained. No release or qualifying verified framework feedback issue. Prior software hash/filter issue untouched. Evidence: output/home-navbar-spacing-20261107/delivery.md.

# Plan: POS category overview with latest entrance motion (2026-11-07)

Status: "Ready to Code"
Approval: "Approved — owner: อนุมัติ after concrete POS Spec/Plan"

## Files

- `src/features/catalog/components/pos-overview.tsx` — create POS-only server wrapper using existing3products/3guide sections and incumbent services pattern
- `src/app/(site)/products/category/[category]/page.tsx` — select POS wrapper only; preserve metadata/static params/404 and other category branches
- `src/features/catalog/components/catalog-route-frame.tsx` — add exact POS overview ownership for Header/Footer/overlay host
- `src/features/catalog/components/products-overview.tsx` — add pos to existing entrance opt-in only; no new motion system
- `tests/e2e/pos-overview.spec.ts` — new POS content/membership/3chapters/iOS-empty/guide/local finder/reload/cache/responsive checks
- `tests/e2e/product-category-pages.spec.ts`, `tests/e2e/catalog-subcategory-navigation.spec.ts`, `tests/e2e/sitewide-navigation.spec.ts`, `tests/e2e/navigation.spec.ts` — adapt POS inline-catalog expectations to the local finder while retaining all catalogue/child-link/history assertions
- `tests/e2e/category-intro-motion.spec.ts` — add pos with3chapters to existing latest-timing/reduced/static-fallback checks
- `spec.md`, `plan.md` — approval/current contracts/checklist/actual verification; `MEMORY.md` only if a new repeatable failure pattern is discovered
- `output/pos-apple-overview-20261107/` — snapshots/hashes, POS all/3selected-child signatures, unaffected route baseline, browser/performance screenshots/logs/delivery

## Steps

- [x] Read current spec/memory, actual wrappers/route frame/entrance CSS and POS product/guide data; verify runtime3products and iOS-empty data
- [x] Obtain owner approval for this concrete POS Spec/Plan before editing application files
- [x] Read applicable installed Next.js page guidance; snapshot allowed/protected sources and capture4POS states plus unaffected route/Navbar signatures
- [x] Implement scoped POS wrapper/route/frame/entrance opt-in using existing data, controls and CSS
- [x] Adapt affected browser expectations and add POS checks without dropping catalogue membership, focus or history coverage
- [x] Run scoped formatter/ESLint/typecheck/catalog units/Node24 production build
- [x] Verify390/768/834/1440, native touch/keyboard, search/filter/empty/compare/focus/reload/history/cache, latest motion/reduced/static fallback; inspect screenshots and4xCPU geometry/CLS/remaining motion
- [x] Audit source/data preservation, update actual results and final preview3000; deliver without release

## Impact / Rollback

R2. Shared CatalogRouteFrame/ProductsOverview changes are exact POS route selection and entrance opt-in only. Preserve current Navbar spacing, all category wrappers, catalog/Hick's law work and motion CSS. Snapshot scoped files and compare protected hashes; restore only task deltas if needed. No dependency/database/global CSS or release work.

## Verification Results

Completed after explicit approval. Node24build437/437, catalog105/105 and final TypeScript/scoped lint/format/whitespace pass.64distinct browser cases have latest passing results, including corrected3legacy assertions; final POS7/7 on3000.9catalogue states/5unaffected signatures exact. Four4xCPU cases: geometry/content exact, CLS0, no remaining entrance, lab LCP704/700/596/656ms; touch357px swipe/no overflow. Images inspected.308protected files unchanged,9planned existing paths changed,2created; independent Header shopping-bag SVG/import delta preserved separately. Shared-output replacement from a concurrent build invalidated QA's old manifest; stale chunk response and disabled prehydration controls resolved after QA restart, without application workarounds. Final preview3000 already serves current build and was verified; QA3006 stopped. No release or qualifying verified framework feedback candidate. Full receipts: output/pos-apple-overview-20261107/delivery.md.

---

# Plan: Accessories category overview with latest entrance motion (2026-11-07)

Status: "Ready to Code"
Approval: "Approved — owner: อนุมัติ after concrete accessories Spec/Plan"

## Files

- `src/features/catalog/components/accessories-overview.tsx` — create server wrapper using accessories-only products, existing3guide sections and services pattern
- `src/app/(site)/products/category/[category]/page.tsx` — add accessories wrapper selection only; preserve metadata/static params/404 and other branches
- `src/features/catalog/components/catalog-route-frame.tsx` — add exact accessories route to existing Header/Footer/overlay ownership
- `src/features/catalog/components/products-overview.tsx` — add accessories to entrance opt-in only; preserve CSS/state/other behavior
- `tests/e2e/accessories-overview.spec.ts` — new content/membership/5chapters/Mock/finder/guide/reload/cache/keyboard/responsive coverage
- `tests/e2e/product-category-pages.spec.ts`, `tests/e2e/catalog-subcategory-navigation.spec.ts`, `tests/e2e/sitewide-navigation.spec.ts`, `tests/e2e/navigation.spec.ts` — adapt accessories inline-catalog expectations to the overview/finder, keeping all destination/history/membership/document checks
- `tests/e2e/category-intro-motion.spec.ts` — add accessories with5chapters to latest timing/reduced/static-fallback checks
- `spec.md`, `plan.md` — approval/contracts/checklist/results; `MEMORY.md` only if a new repeatable failure pattern is found
- `output/accessories-apple-overview-20261107/` — source/hash snapshots,13catalogue signatures (6accessories states in category+combined and full catalogue),5unaffected route signatures, isolated QA/build/browser/performance evidence and delivery

## Steps

- [x] Inspect current spec/memory/wrappers, accessories data/guide and runtime39real/7Mock/5child states
- [x] Obtain approval for this concrete accessories Spec/Plan before application edits
- [x] Read applicable installed Next.js page guidance; snapshot scoped/protected sources and capture category/combined/unaffected baselines
- [x] Implement scoped accessories wrapper/route/frame/entrance opt-in using existing data/controls/CSS
- [x] Adapt affected assertions and add focused accessories coverage, retaining Mock/documents/consumables/compare/focus/history contracts
- [x] Run scoped formatter/ESLint/typecheck/catalog units and Node24 production build with separate QA output; preserve live preview artifacts until refreshed
- [x] Verify390/768/834/1440, native touch/keyboard, finder/search/filter/empty/compare/focus/reload/history/cache and latest motion/reduced/static fallback; inspect screenshots and4xCPU geometry/CLS/animation cleanup
- [x] Audit source/data preservation, refresh final preview3000 after verification, update actual results and deliver without release

## Impact / Rollback

R2. Application scope is one new server wrapper and exact selection/ownership/entrance additions in3existing feature files. Do not refactor all-category branches or global Navbar, rewrite catalogue data, or generate absent Mock photos. Snapshot and restore only this task delta. Isolate QA output/server from any concurrent build to avoid mismatched manifests; verify cold hydration after final preview refresh.

## Verification Results

Done after explicit approval. Isolated/configured Node24builds437/437, units105/105, final TypeScript/scoped lint/format/whitespace pass.69current browser cases have latest passing results; final10/10on3000. Mock-test assumptions were corrected after source inspection (existing Mock cards have no comparison controls); family-navigation final all-products locator now uses the overview. Original failed attempts retained; browser-summary.json maps the corrected Mock case to its current contract rather than counting the obsolete name as another case.13catalogue signatures/5unaffected main signatures exact on configured preview. QA fallback data causes unrelated Products/scales ordering differences;12accessories states exact in QA and final full configured comparison passes without data/sorting edits. Four4xCPU CLS0/geometry+content exact/no remaining entrance, lab LCP672/716/640/688ms; native touch357px/no overflow; screenshots inspected.309protected files unchanged,9planned existing paths changed and2new files; independent homepage video source/test delta preserved separately. Preview3000session41347 refreshed after archiving previous .next; QA3009 stopped. No release or qualifying verified framework feedback candidate. Evidence: output/accessories-apple-overview-20261107/delivery.md.

---

# Plan: Business solutions index in the approved overview style (2026-11-09)

Status: "Ready to Code"
Approval: "Approved — owner: อนุมัติครับ ปรับหน้าโซลูชันตามธุรกิจตามแผนได้เลย"

## Files

- `src/features/content/components/solutions-overview.tsx` — create server overview using existing14solutions/CMS business groups/copy/assets; native anchors and scrollable cards; read-only reuse of overview layout/motion classes
- `src/features/content/components/solutions-overview.module.css` — create scoped business-card/group/long-title responsive rules only; reuse existing design tokens and imported entrance class, no new keyframe profile
- `src/features/content/components/solutions-page.tsx` — route index rendering to new overview while preserving all detail-page output and existing source CSS
- `tests/e2e/solutions-overview.spec.ts` — new14destination/3group/all existing links/long-title bounds/keyboard/touch/anchor/reload/history/Header+Footer/detail-parity coverage
- `tests/e2e/solutions-intro-motion.spec.ts` — new scoped latest-timing/stagger/reduced/static-fallback checks for3business chapters, without changing product-category tests
- `tests/e2e/sitewide-navigation.spec.ts`, `tests/e2e/catalog-category-audit.spec.ts` — adapt index heading expectations only if required; preserve all navigation and noncatalog assertions
- `spec.md`, `plan.md` — approval/contracts/checklist/actual results; `MEMORY.md` only if a new repeatable failure pattern is discovered
- `output/solutions-apple-overview-20261109/` — source/hash snapshots,14detail/current-index/link baselines, isolated QA/build/browser/performance/screenshot evidence and delivery
- `node_modules/@prisma/client/`, `node_modules/pg/` — restore files into verified empty installation directories from the exact existing lockfile versions/integrities (7.10.1/8.23.1); environment repair required by the configured build, with no manifest/lockfile/version changes
- `node_modules/postcss/`, `node_modules/sanitize-html/node_modules/postcss/` — same verified-empty-directory recovery for the exact locked 8.5.23/8.5.31 archives; no dependency version or configuration changes

## Steps

- [x] Read instructions/current spec/memory, trace `/solutions` route and14records, inspect3CMS navigation groups, verify available business assets and latest motion values
- [x] Obtain owner approval for this concrete solutions-index Spec/Plan before application edits
- [x] Read applicable installed Next.js guidance; snapshot protected/scoped sources, all14detail signatures and current resolved group/destination list
- [x] Implement only new index overview/scoped CSS and its index branch, preserving details/shared Navbar/Footer/product sources
- [x] Add focused destination/group/long-title/responsive/keyboard/native-touch checks and latest-motion/reduced/static checks
- [x] Run scoped formatter/ESLint/typecheck and Node24 project build in isolated QA; retain configured-data parity boundary and existing preview artifacts
- [x] Verify320/390/768/834/1440, anchors/history/reload/focus, oneactive Header/Footer,14detail equality and unchanged selected pages; inspect screenshots and4xCPU CLS/geometry/animation cleanup
- [x] Audit source protection, refresh configured preview only after verification, update results/docs and deliver without release

## Impact / Rollback

R2. New page-specific files plus existing SolutionsPage index branch only. Preserve14detail source records/rendering,18default business-menu links and all product/Nav/global source. No invented FAQ, compatibility claims, new library or shared-component refactor. Restore only this task delta from snapshot. QA output must be separate from the live build and data-provider differences documented.

## Verification Results

Done after explicit approval. Final12/12 scoped browser cases pass; existing sitewide navigation12/12 passes in isolated QA. Both Node24 production builds437/437 pass. Final TypeScript/scoped ESLint/Prettier/git diff --check pass. Strict configured comparison: all14detail outputs and5unaffected pages identical. Final4xCPU scenarios CLS0, settled entrance0, reduced/normal content and geometry identical; lab LCP464/764/276/540ms. Screenshots inspected at desktop/mobile, with320–1440bounds verified.320protected baseline files unchanged,2existing changes (SolutionsPage/MEMORY) and4new source/test files. Package/lockfiles unchanged after exact-version/integrity-verified recovery of four empty installed-package directories. Preview3000session88754 runs current configured build; previous build archived. QA3009 stopped at delivery. No release.

Limits retained: noncatalog audit's5valid-page checks pass, but unknown-route expected404 receives200 in candidate environments (old preview404); streamed not-found200 is documented. No route change or weakened assertion. No-JS raw server content/static motion fallback passes, while full-page visibility remains blocked by a streamed hidden ancestor on baseline/candidate. Prior feedback draft already covers this issue; protocol reviewed once without duplicate form/submission. Reload resets hash/scroll via unchanged global navigation policy. QA fallback Products/scales ordering differed from configured data; final configured full parity passes. Delivery/evidence: output/solutions-apple-overview-20261109/delivery.md.

---

# Plan: Current primary-menu and page-section map (2026-11-09)

Authorized directly as a read-only inventory; no application edits or approved fix scope.

## Files

- `output/navigation-section-map-20261109/` — audit helpers, current DOM/menu/section snapshots, controlled click results and Thai report
- `spec.md`, `plan.md` — record actual findings and completed audit only

## Steps / Results

- [x] Read current instructions/spec/memory and trace resolved navigation, product overviews, solutions, software, services, guides and homepage composition.
- [x] Inspect27pages/8desktop menus/9actions on configured preview and retain raw results.
- [x] Confirm four misdirected business-menu clicks, same-page software filter vs working in-page control, and guide destination;7additional actions retained.
- [x] Produce all8menu maps, shared7section anatomy, current child labels/paths and distinct routing vs grouping findings.
- [x] Record evidence/limits; desktop1440audit, no independent mobile interaction retest. No app build/release/source changes. Source readback and final git diff --check pass. No qualifying new Next.js feedback issue.

## Impact / Rollback

Read-only application analysis. Only audit artifacts and project notes written; remove this task's report/notes if unwanted. Existing application work and preview retained.

---

# Plan: Balanced 18-working-day launch plan (2026-11-09)

Authorized directly for a planning deliverable; future application work and production release require their own concrete scope/approval. Overall implementation is Need Information; the relative-day document does not require a guessed start date or extra user confirmation.

## Files

- `docs/launch-plan-18-working-days.md` — create the daily schedule, checklists, launch gates, deferrable work, dependencies and release notes
- `spec.md` — append planning-only scope, actual user request, assumptions and implementation information gaps; preserve existing history
- `plan.md` — append this documentation task and actual verification evidence; preserve existing plans

## Steps

- [x] Read current project state and original weekly plan; retain confirmed catalog + contact-sales scope
- [x] Inspect existing catalog/release/UAT evidence and distinguish source presence from live integration verification
- [x] Draft18daily goals/checklists, reviews6/12/15, target release16 and reserve17–18; balance work/testing/contingency
- [x] Separate required launch checks from deferrable enhancements and record company dependencies/unknown capacity
- [x] Verify structure, internal schedule consistency, formatting and own scoped diff
- [x] Record final results and attach the Markdown deliverable to work state

## Impact / Rollback

R2 documentation only. No application/shared UI/schema/dependency/environment/DNS changes and no deployment commands. Remove only the new plan file and this task's appended notes to undo; preserve pre-existing modified content in `spec.md` and `plan.md`.

## Verification Results

Structural inspection passes:18sequential overview rows and18daily sections across3weeks, each with4unchecked tasks (72total), evidence perday, company reviews6/12/15, targetrelease16 andreserve17–18. Relative dates/capacity assumptions and conditional launch gates are explicit. Markdown formatting is verified for the new deliverable and this task's appended notes, preserving pre-existing document content. Scoped git diff --check passes. No application tests/build/browser run required for this planning-only task; future checklists remain unchecked and are not acceptance evidence for the live website. No new Next.js feedback candidate.

## วงสินค้าในส่วนที่ 01 ของ /products (2026-11-10)

- [x] ตรวจหน้าใช้งานจริงและต้นแบบรุ่นแก้ภาพค้าง เปรียบเทียบไฟล์รูป 36 รายการตาม SHA256 พบรูปใน public เดิมตรงกัน 23 รายการ อีก 13 รายการใช้ภาพหน้าตรงจากต้นแบบ ดูชื่อปลายทางทุกรูปใน output/products-carousel-section-01-review/images.json
- [x] ตรวจภาพประกอบการตัดสินใจบน desktop 1440px และ mobile 390px ด้วย output/products-carousel-section-01-review/review.mjs ในการทดสอบเฉพาะเบราว์เซอร์
- [x] รับการอนุมัติ Spec/Plan สำหรับการเปลี่ยนหน้าเว็บ
- [x] แก้ src/features/catalog/components/products-index-content.tsx ให้หัวข้อ ผลิตภัณฑ์ทั้งหมด และตัวค้นหารุ่นนำเข้าสู่วงสินค้าแทนการ์ดส่วน 01 ตามด้วยส่วน 02–09
- [x] สร้าง src/features/catalog/components/products-index-carousel.tsx และ products-index-carousel.module.css สำหรับวงสินค้าและ dialog โหมดเต็มหน้า ใช้ React client component เฉพาะส่วนโต้ตอบ ตัดแถบเมนูที่ซ้ำกับเว็บ ให้ใช้ scroll บนวงและมีทางไปส่วนถัดไปได้ด้วยเมาส์ ทัช และคีย์บอร์ด
- [x] สร้าง src/features/catalog/data/products-index-carousel.json จากต้นแบบที่ตรวจแล้ว ใช้รูปเดิมตามรายการและเพิ่มไฟล์ที่ขาดใน public/images/products-index-carousel/ ตาม images.json ตรวจปลายทางรายละเอียดกับข้อมูลสินค้าจริง
- [x] ปรับ tests/e2e/products-full-overview.spec.ts ให้ตรวจวงสินค้า 1 ส่วนและส่วนการ์ดอีก 8 ส่วน เพิ่ม tests/e2e/products-index-carousel.spec.ts ตรวจภาพตรงรุ่น การเปลี่ยนหมวด วนหัวท้าย เปิด/กลับรายละเอียด focus ลด motion และเลื่อนออกจากวงไปส่วนถัดไป
- [x] ตรวจ lint/typecheck และ browser tests ที่เกี่ยวข้อง ตรวจผลบน desktop/tablet/mobile และอัปเดต spec.md / plan.md

ผลกระทบจำกัดที่เนื้อหาส่วนแรกของ /products ย้อนกลับโดยคืน markup และ assertion ส่วน 01 และถอด component/ข้อมูล/รูปใหม่ที่ระบุไว้

# Plan: ย้ายจัดสเปคขึ้น Navbar

- [x] ปรับ `src/features/cms/data/primary-navigation.ts` และระยะช่องไฟที่ 834–1023px ใน `src/styles/header.css` และ `src/features/catalog/components/products-overview.module.css`
- [x] ปรับสัญญาเมนูใน `tests/catalog/primary-navigation.test.ts`, `tests/e2e/navigation.spec.ts`, `tests/e2e/indicator-platform-compatibility.spec.ts` และตรวจการกดจริงทั้งสอง Header รวมถึงมือถือ
- [x] Production build ผ่าน 466 routes, catalog ผ่าน 124 tests, browser ผ่าน 22 cases รวมการกดลิงก์ตรง 4 กรณีและการวัดขอบเขตปุ่มทั้งสอง Header 10 กรณี พรีวิวที่พอร์ต 3024

# Plan: จัดชุดเครื่องชั่งและย่อเมนูบริการ

ตรวจผ่าน production build, catalog 124/124 และ browser 19/19 ตรวจหน้าจริงช่วง 320–1920px รวมการเลือกรุ่น เปลี่ยนชุด ลบอุปกรณ์ ลิงก์คู่มือ การใช้คีย์บอร์ด และทางเข้าหน้าหลักทั้งสองจากบริการ หลักฐานภาพอยู่ใน output/weighing-builder-preview/browser

ปรับหน้า guide และ CSS Module ใน src/features/content/components เพิ่มส่วนเลือกชุดและสรุปผล รับภาพจาก product repository ฝั่ง server ใช้ข้อมูล compatibility เดิม ปรับ src/features/cms/data/primary-navigation.ts และชุดทดสอบเมนูและหน้าจัดสเปค ตรวจการเลือก เปลี่ยน ลบ ค้นหา กรอง และทั้งสองหน้าหลักจาก Navbar บนมือถือและเดสก์ท็อป

ผลตรวจ 10 พ.ย. 2026: Chromium ผ่าน 20/20 บน http://localhost:3000/products ทดสอบครบ 36 รุ่นที่ 390/834/1440px และตรวจหน้าโดยรวม 9 ขนาดจอ ลิงก์รายละเอียดเปิด /products/acs30-jc21 ได้จริง ESLint และ TypeScript ผ่าน ภาพหน้าจอ implemented-1440.png และ implemented-390.png อยู่ใน output/products-carousel-section-01-review/

## /products section 01 wheel area and title strip

- [x] Update products-index-carousel.tsx wheel targeting and hint, remove visible title strip in products-index-content.tsx and replace obsolete header rules in products-index-content.module.css.
- [x] Update products-index-carousel.spec.ts and products-full-overview.spec.ts to cover blank space, page structure and direct finder entry. Verify the running route, lint and types. Rollback is limited to these scoped changes.

Verified 12 Chromium cases at localhost, including real reverse/forward wheel on a hit-tested background point with stable page scroll. Nine responsive layout widths, direct finder entry, mobile detail return, scoped ESLint and TypeScript passed.

## Mobile background swipes on /products section 01

- [x] Add passive directional touch handling and touch-specific hint in src/features/catalog/components/products-index-carousel.tsx and products-index-carousel.module.css.
- [x] Exercise native touch input in tests/e2e/products-index-carousel.spec.ts, including reverse swipes, vertical page scrolling and the existing detail tap. Check scoped lint and types. Rollback consists of removing this gesture, hint and its regression case.

# Plan: จัดสเปคทีละส่วน

ปรับปุ่มบนการ์ดใน weighing-builder.tsx และสีสถานะใน weighing-builder.module.css ตรวจการแสดงทั้ง 9 รุ่น ปุ่มปิด 3 รุ่น และการเลือกเปลี่ยนชุดที่ยืนยันแล้วใน indicator-platform-compatibility.spec.ts

ผลตรวจพรีวิวพอร์ต 3028 ผ่านทั้ง 390px และ 1440px เห็นปุ่มปิดทั้งสามรุ่น ค้นหา WP31EUSB ได้โดยชุดเดิมยังอยู่ และเลือก AW31 เพื่อเปิดรายการแท่นได้ ผ่าน build, scoped lint และการทดสอบข้อมูลคู่รุ่นทั้งสองกรณี

ผลตรวจพรีวิวพอร์ต 3027 ผ่าน build, TypeScript, scoped ESLint, catalog 125/125 และ browser 17/17 รวมการเลือกครบสามขั้นและเปลี่ยนตัวเลือกต้นทางบน 390px และ 1440px ภาพขั้นเลือกแท่นอยู่ใน output/weighing-head-first/browser

เพิ่มตารางคู่รุ่นใน indicator-platform-compatibility.ts ปรับการเตรียมตัวเลือกใน indicator-platform-compatibility-page.tsx และขั้นตอนใน weighing-builder.tsx กับ CSS Module ของหน้านี้ ตรวจการกรองรายรุ่น การล็อกขั้น การย้อนกลับและล้างชุดด้วย indicator-platform-compatibility tests และตรวจบนมือถือ/เดสก์ท็อป

Verified with Chromium mobile touch emulation on localhost. Horizontal left/right, slight jitter, native up/down page scroll, and tap-to-detail passed. The four existing carousel cases, scoped lint and typecheck passed.

## Product photo touch input in section 01

- [x] Extend the existing gesture in src/features/catalog/components/products-index-carousel.tsx to photo buttons and update its mobile hint. Suppress the compatibility click only upon a recognized horizontal swipe.
- [x] Extend tests/e2e/products-index-carousel.spec.ts to hit-test photo touches in both directions, native page scrolling and an ordinary tap. Check existing carousel cases, lint and types. Rollback scope is the carousel gesture and its regression.

Photo swipe verification: six carousel browser cases passed on localhost including emulated mobile photo and background gestures, vertical page scrolling, and tap to open. Scoped ESLint and TypeScript exited 0.

# Plan: ลิงก์ดูหัวอ่านรายรุ่น

ปรับ indicator-platform-compatibility-page.tsx เพื่อส่งปลายทางจากสินค้าและสร้างการ์ดในคู่มือสำหรับรุ่นที่ไม่มีหน้าสินค้า ปรับ weighing-builder.tsx และ CSS Module ให้คลิกรูป ชื่อ และลิงก์ดูรุ่นได้ ทดสอบปลายทางตรงรุ่นและการเลือกชุดแยกจากกันใน indicator-platform-compatibility.spec.ts

ตรวจพรีวิวพอร์ต 3029 ผ่าน browser 18/18 และตรวจคลิกชื่อและรูป AC31P บนมือถือแยกกัน ทั้งสองตำแหน่งเปิดหัวข้อ Indicator AC31P และปุ่มเลือกยังปิดอยู่ Build, TypeScript, scoped ESLint และข้อมูลคู่รุ่นผ่าน

# Plan: เปิดรุ่นแท่นชั่งและอุปกรณ์เสริม

ผ่าน production build, catalog 127/127, browser 20/20 รวมคลิกตำแหน่งรูปและชื่อของ TMS-60-AW31 กับ NY30M12 บน 390px/1440px และตรวจปลายทางเมื่อไม่มีหน้าสินค้า

ใช้ตัวจับคู่รหัสเดิมใน scale-subcategories และ accessory-subcategories เตรียม URL ใน indicator-platform-compatibility-page ขยายลิงก์การ์ดใน weighing-builder และ CSS Module ตรวจรูป ชื่อ ปุ่มเลือก และการดูหัวอ่านแยกจากลิงก์แท่นใน browser tests

# Plan: เลือกหัวอ่านหรือแท่นก่อน

ตรวจผ่าน production build, TypeScript, scoped ESLint, unit tests ตารางคู่รุ่น และ browser 22/22 ตรวจเพิ่มโดยคลิกแท่นทุกตัวเลือก 26 รหัสบนพรีวิวพอร์ต 3031

ปรับ weighing-builder.tsx และข้อความใน indicator-platform-compatibility-page.tsx ให้เลือกสองฝั่งสลับลำดับได้ ตรวจทั้งสองเส้นทาง การเปลี่ยนและถอดรุ่น การปิดขั้นอุปกรณ์เสริม และลิงก์รุ่นเดิมใน tests/e2e/indicator-platform-compatibility.spec.ts

# Plan: ตัดแถบหัวเรื่องหน้าจัดสเปค

ตรวจพรีวิวพอร์ต 3032 ผ่านครบ 8 ขนาดตั้งแต่ 320 ถึง 1920px ส่วนจัดชุดเริ่มใต้ Navbar 24px ทุกขนาด ภาพมือถือยืนยันว่าเห็นกล่องชุดที่เลือกเป็นส่วนแรก

แก้ indicator-platform-compatibility-page.tsx และ CSS Module เฉพาะส่วนหัวและระยะบน ตรวจระยะจาก Navbar ถึงตัวเลือกใน indicator-platform-compatibility.spec.ts บนมือถือจนถึงจอกว้าง

# Plan: ลบข้อความดูรายละเอียดรุ่น

ย้ายลิงก์ใน weighing-builder.tsx ไปที่ชื่อรุ่น ใช้พื้นที่คลิกรูปเดิม ตรวจว่าข้อความตามภาพหายและรูปกับชื่อยังเปิดปลายทางในเบราว์เซอร์

# Plan: ส่งชุดที่เลือกเข้าใบเสนอราคา

ปรับเงื่อนไขและสถานะปุ่มใน weighing-builder.tsx และ CSS Module ตรวจ quotation.spec.ts ทั้งสองลำดับ ตั้งแต่ชุดว่างจนถึงการส่งคู่หลักโดยไม่มีอุปกรณ์เสริมและการนำชิ้นหลักออก

ตรวจพรีวิว 3035 ผ่าน browser 3/3 เริ่มจากหัวอ่านที่ 1440px และจากแท่นที่ 390px เปิดใบเสนอราคาด้วยสองรายการได้ รวมอุปกรณ์เมื่อเลือก และปิดปุ่มอีกครั้งเมื่อถอดชิ้นหลัก

ผลตรวจบนพอร์ต 3034 ผ่าน build, TypeScript, scoped lint, catalog 128/128 และ browser 8 กรณี อีก 1 กรณีพิมพ์เอกสารมีราคาข้ามเนื่องจากแคตตาล็อกพรีวิวยังไม่มีราคาขายยืนยัน

เพิ่มลิงก์ใน weighing-builder และ CSS ส่งเฉพาะรหัสที่เลือก ใช้รายการตัวเลือกจากข้อมูลกลางร่วมกับ indicator-platform-compatibility-page และหน้า /service/quotation เติมรายการใน quotation-form และตรวจปลายทางทั้งรายการมีราคาและรอยืนยัน

ผลการลบป้าย “ดูรายละเอียดรุ่น ↗” รอบก่อน ผ่าน browser 5/5 บน production preview ทั้งมือถือและเดสก์ท็อป

# Plan: Warehouse quotation-item read RPC

## Files

- `docs/warehouse/search-quotation-item.sql` — create the reviewed read-only RPC definition, examples, privilege lockdown and rollback statement.
- `spec.md` — record the verified data contract, scope, risks and approval.
- `plan.md` — record the implementation checklist and actual validation results.

## Steps

- [x] Confirm the Warehouse quotation-item RPC Spec/Plan is approved.
- [x] Write `ecommerce.search_quotation_item` using only the verified master, saleable-warehouse stock and active-reservation sources.
- [x] Add bounded parameters, raw-price output, explicit `PUBLIC` revoke, usage examples and exact rollback SQL.
- [x] Validate create/calls/privileges inside one database transaction and roll it back; compare results with the verified reference query.
- [x] Check SQL/document formatting and update actual results in `spec.md` / `plan.md`.

## Impact / Rollback

Preparing the local SQL file is R2. Installing it in Warehouse would be R1 because it creates a PostgREST-visible database contract; installation is excluded until separately approved with an execution role. Transaction validation must end with `ROLLBACK`. A later authorized installation can be reversed with the exact `DROP FUNCTION` signature included in the deliverable. Existing `master_data.search_master_item` and all Warehouse data remain unchanged.

## Verification Results

Approved local SQL delivery is complete. PostgreSQL 16.13 transaction validation successfully ran `CREATE OR REPLACE` twice, queried default, exact item, text search, saleable/non-saleable warehouse scopes and both limit bounds, inspected function metadata/ACL, then rolled back. Default result IDs are 796/801/799; formulas, positive price/availability and uniqueness pass. Service search, inactive item 109 and non-saleable warehouse 24 return zero; saleable warehouse 88 returns three. Limits clamp to 1/100. Metadata confirms `STABLE`, `SECURITY INVOKER` and no `PUBLIC` execute grant. The function did not exist before validation and does not exist after rollback.

The exploratory all-warehouse reference had five positive-stock items. The final approved saleable-location scope correctly excludes TGS1000M because its positive stock is only in non-saleable warehouse 24, and VR5000 because its positive stock is in that same non-saleable warehouse while saleable warehouse 88 is -139. The initial strict test used empty saleable warehouse 21 as a positive fixture and failed; switching the fixture to verified warehouse 88 made the unchanged SQL pass. No database object or data mutation remains. Final scoped whitespace/document checks are recorded at delivery.

# Plan: Warehouse product API for configurator quotations

Approval: Approved by the user with “อนุมัติ Spec/Plan” on 2026-11-10. The first checklist gate remains open until the required VAT, mapping and website-database inputs are resolved.
Status: Superseded by the sitewide plan below after the owner's expanded request. Preserve this historical approval; do not use it as approval of the expanded file list.

## Files

- `src/features/services/warehouse-product.server.ts` — validate and fetch the server-only official-product API contract without stock assumptions or raw upstream error leakage.
- `src/features/catalog/data/quotation.ts` — convert validated Warehouse items into quotation rows and implement the approved deterministic configurator-code mapping.
- `src/app/(site)/service/quotation/page.tsx` — use Warehouse items/prices for the quotation product list while retaining the current Prisma-backed catalog only for existing site/content relationships.
- `src/features/catalog/components/quotation-form.tsx` — preserve the form/print layout while presenting the Warehouse unit where needed and keeping unresolved selections non-printable.
- `tests/catalog/quotation.test.ts` — cover Warehouse price conversion, uniqueness, invalid data rejection, mapping and VAT arithmetic.
- `tests/e2e/quotation.spec.ts` — cover manual Warehouse selection, configurator handoff, pending safeguards, printing and responsive behavior.
- `.env.example` — document `WAREHOUSE_API_URL` separately from the website `DATABASE_URL`, without credentials.
- `spec.md` — record the approved data contract, scope and actual outcome.
- `plan.md` — record the approved checklist and verification evidence.

## Steps

- [ ] Resolve the three items in `Missing Information`, set the Spec to `Ready to Code`, and record explicit approval of this concrete plan.
- [ ] Read the relevant local Next.js 16 data-fetching/caching guide before implementation.
- [ ] Harden the server-only API reader and validate the response without adding dependencies.
- [ ] Map Warehouse products to quotation rows and map configurator codes only by the approved contract.
- [ ] Replace quotation prices with Warehouse prices; preserve pending/print safeguards and show the returned unit without redesigning the page.
- [ ] Document the split database/API environment variables without editing or committing `.env.local`.
- [ ] Run scoped catalog tests, TypeScript, ESLint, a production build and mobile/desktop quotation browser regressions.
- [ ] Update verification results and task state in `spec.md` / `plan.md`.

## Impact / Rollback

The website code/config-documentation change is R2 and is limited to quotation reads. It makes no Warehouse writes and can be reverted by restoring the four application files and related tests/docs. The primary risks are quoting the wrong SKU, interpreting VAT incorrectly, or breaking the site while `DATABASE_URL` still points at Warehouse. The plan therefore blocks implementation until mapping/VAT are approved and the website Prisma connection is restored. No secret value will be written to tracked files.

## Verification Results

Pre-implementation audit only: the configured endpoint returns HTTP 200 with 380 unique products and positive prices, but no stock fields (now intentionally unnecessary). The current configurator has 49 unique codes; 2 are literal SKU matches and 11 match after case/hyphen normalization. Name-based candidates are ambiguous. Application code, `.env.local`, Warehouse objects and data have not been changed under this task.

# Plan: Sitewide Warehouse products in existing website categories

Approval: Approved by the user on 2026-11-10. The whole-site file plan and the mapping/setup-guide work are authorized; unresolved product/variant associations remain a data dependency.
Approval update: User explicitly approved the whole-site plan and requested SKU mapping plus step-by-step `.env.local` instructions on 2026-11-10. Approval is resolved; required live-source configuration and unproven product associations remain separate data dependencies.

## Files

- `docs/warehouse/sitewide-product-integration.md` — created source/consumer audit, verified taxonomy, price basis, proposed data flow and unresolved inputs.
- `docs/warehouse/sku-category-mapping.csv` — export every currently queried SKU with draft category/model associations and explicit unresolved status for spreadsheet review.
- `docs/warehouse/sku-category-mapping.md` — explain the source scope, evidence rules, coverage and limitations with concrete mapped examples.
- `docs/warehouse/runtime-product-status.csv` — record the actual enabled/parked SKU set and reasons at verification time.
- `docs/warehouse/runtime-integration-delivery.md` — record the implemented catalog contract, verified routes, test/build evidence, known parked records and rollback.
- `docs/warehouse/local-env-setup.md` — provide sequential local configuration, safe read-only checks and expected outcomes without secrets or migrations.
- `src/features/services/warehouse-product.server.ts` — validate the live API contract, complete result coverage, timeout and safe upstream failure handling.
- `src/app/warehouse-products-test/page.tsx` — keep the diagnostic page on the same published catalog, SKU/unit and gross-price contract as the site, rather than publicly listing raw service/calibration/shipping rows from the complete upstream API.
- `src/app/api/products/[sku]/image/route.ts` — read-only image forwarding for approved SKUs whose verified API image is on the Warehouse origin and observed `/api/store/products/image` endpoint. This avoids exposing localhost image URLs to LAN clients; do not allow arbitrary URLs or hosts. Verify status/content type and bound response size.
- `src/features/catalog/data/warehouse-product-mapping.json` — create reviewed SKU associations for categories, subcategories, legacy/model identities and public eligibility; do not populate with guessed matches.
- `src/features/catalog/data/warehouse-products.ts` — create the pure mapping/validation adapter joining current Warehouse items to proven website metadata and deriving display/net price fields.
- `src/features/catalog/data/warehouse-categories.ts` — small public-data-only helper projecting explicit subgroup memberships; do not bundle the full SKU review manifest into Client Components.
- `src/features/catalog/types.ts` — extend public product contracts with Warehouse identity, unit, net price and explicit taxonomy membership while retaining existing fields.
- `src/features/catalog/server/product-repository.ts` — switch the shared catalog to validated Warehouse membership/prices; preserve verified CMS/editorial associations and current hidden/deleted-content rules.
- `src/features/catalog/server/client-products.ts` — retain the request-shared projection if the new data contract requires adjustment.
- `src/features/catalog/data/client-products.ts` — project public Warehouse identity/unit/net-price fields only where consumers need them.
- `src/features/catalog/components/product-category-mock.tsx`, `src/features/catalog/components/product-catalog.tsx`, `src/features/catalog/components/catalog-overlays.tsx` — include the new public Warehouse SKU in the existing search text for category/finder/catalog/navbar searches; preserve search and comparison UI.
- `src/features/catalog/data/catalog-supplements.ts` — prefer explicit reviewed website family memberships over legacy heuristics.
- `src/features/catalog/server/catalog-page.ts` — use the reviewed family/subgroup memberships for legacy collection routes and counters.
- `src/features/catalog/server/product-categories.ts` — calculate existing category/subgroup products from the common catalog.
- `src/features/catalog/data/scale-subcategories.ts` — associate the eight scale groups through explicit mappings while retaining existing model metadata.
- `src/features/catalog/data/indicator-subcategories.ts` — associate the three indicator groups through explicit mappings.
- `src/features/catalog/data/platform-subcategories.ts` — associate the four platform groups through explicit mappings.
- `src/features/catalog/data/pos-subcategories.ts` — associate the three POS groups through explicit mappings.
- `src/features/catalog/data/accessory-subcategories.ts` — associate the five accessory groups through explicit mappings.
- `src/features/catalog/data/product-lookup.ts` — preserve approved legacy slugs/aliases when resolving Warehouse-backed products.
- `src/app/(site)/products/[slug]/page.tsx` — resolve correct same-product editorial content and display the derived public gross price consistently.
- `src/app/(site)/products/page.tsx` — pass shared actual products/categories into the index content.
- `src/features/catalog/components/products-index-content.tsx` — replace eight mock rails with the proposed five category rails using real cards, images and existing category links.
- `src/features/catalog/components/products-index-content.module.css` — preserve the approved card geometry while fitting real linked product images within the existing media area.
- `src/features/catalog/components/products-index-carousel.tsx` — receive server-resolved products as props, retain the approved interactions and handle zero/one product safely.
- `src/features/content/data/weighing-options.ts` — bind configurator model options to reviewed SKU associations without inferring compatibility.
- `src/features/content/components/weighing-builder.tsx` — use a complete kit total once when its verified included head is selected; retain existing compatibility and selection behavior.
- `src/features/content/components/indicator-platform-compatibility-page.tsx` — keep the builder tied to actual mapped options; retain the supplied guide as reference content.
- `src/app/(site)/guides/indicator-platform-compatibility/page.tsx` — allow this Warehouse-backed route to wait for its cached source data, matching the existing quotation/detail route policy and preventing development instant-navigation validation loops.
- `src/features/catalog/data/catalog-card-names.ts` — display explicit mapped model codes in compact cards without matching raw API names heuristically.
- `src/app/(site)/service/quotation/page.tsx` — use the common Warehouse-backed catalog and source net prices for presets and manual selections.
- `src/features/catalog/data/quotation.ts` — use integer net prices, document VAT and total calculation; retain unresolved selection safeguards.
- `src/features/catalog/components/quotation-form.tsx` — show source units, VAT-exclusive unit-price labels and correct net/VAT/gross totals in editor and print output.
- `tests/catalog/warehouse-products.test.ts` — create boundary tests for identity, taxonomy, variant collisions, metadata joins, coverage, net/gross conversion and invalid source data.
- `tests/catalog/quotation.test.ts` — verify confirmed net-price arithmetic, rounding and unresolved kit/component selections.
- `tests/e2e/warehouse-catalog.spec.ts` — create cross-consumer checks covering Home, all five families, search, comparison, detail/legacy links, prices, source updates and API failure.
- `tests/e2e/products-full-overview.spec.ts` — update approved real-rail expectations and verify responsive category links.
- `tests/e2e/products-index-carousel.spec.ts` — verify dynamic source membership, zero/one/multiple results and existing wheel/touch/detail behavior.
- `tests/e2e/quotation.spec.ts` — verify Warehouse selection, builder handoff, units, net-price totals and actual print/PDF output.
- `.env.example` — document the separate server-only product API and website CMS database settings without credentials.
- `spec.md`, `plan.md` — record the contract, approval, coverage and actual verification.
- `MEMORY.md` — append the operational lesson about preserving CSV BOMs and chunking large generated-file reads; preserve all prior notes.

Existing Home, layout, Header, search and comparison consumers already use the repository/projection entry point. Their public data changes through that boundary; shared layout/Header/style edits are not proposed. Root styles, navigation destinations, Prisma schema and deployment scripts remain outside this file plan. Any additional required application file must be explained and added to the reviewable plan before editing it.

## Steps

- [x] Trace the central repository, public consumers and static product-list bypasses; enumerate existing category IDs and subgroup definitions.
- [x] Record owner confirmation that source prices exclude VAT 7% and that stock is irrelevant.
- [x] Create the source/consumer audit and expanded file plan; mark the quotation-only plan superseded.
- [x] Record whole-site plan approval and the owner's choice to create the website SKU mapping.
- [x] Produce the draft mapping JSON/CSV/report from the actual configured product API and existing taxonomy after the independent env update; keep ambiguous variants/bundles unresolved. Verification evidence follows below.
- [x] Deliver the setup guide and `.env.example` documentation; do not edit `.env.local` or run migrations. The guide's SELECT checks were executed successfully after the env update.
- [x] Verify independently updated local configuration: complete live API response (HTTP 200, 380/380) and minimum CMS schema-presence checks pass without printing secrets. Full application verification remains a later gate.
- [x] Resolve the authoritative category/model association source through the approved explicit mapping and parking policy; account for every actual API SKU, including ambiguous bundles/variants and unsupported public categories.
- [x] Set Spec `Ready to Code` and record the owner's expanded approval, including five real category rails.
- [x] Set Spec `Ready to Code` using the owner's explicit instruction to park unclear mappings and proceed with the approved whole-site implementation. Include only unambiguous preferred-group rows; quote a verified complete kit once with its included head.
- [x] Read the relevant local Next.js cache/data-fetching guide, snapshot only owned application files and preserve the dirty worktree.
- [x] Implement and verify the pure adapter/mapping and API boundary before changing the shared repository.
- [x] Switch the repository and category associations together, retaining legacy public IDs/URLs, CMS relationships and shared client object projections.
- [x] Connect the carousel, real category rails, configurator and net-price quotation workflow to that common catalog.
- [x] Verify API list completeness/uniqueness, category membership, source price updates, failed/invalid API reads and exact same-product metadata enrichment.
- [x] Run catalog tests, TypeScript, scoped ESLint and a production build against the compatible CMS database. Do not substitute a snapshot-only pass for live-source integration verification.
- [x] Run cross-consumer browser checks and existing carousel/quotation regressions on mobile/tablet/desktop; inspect screenshots, URLs, HTTP statuses and PDF totals.
- [x] Update the coverage report, acceptance checklist, work state and actual verification; prepare the required anonymous Next.js feedback review draft for user review without submitting it, and hand off without deployment.

## Impact / Rollback

R1: the shared catalog switch affects all public product identities, links, prices and category counts. The principal risks are an incorrect SKU/variant join, loss of existing content/URLs, a bundle charged as a component and inconsistent VAT arithmetic. Reuse existing public IDs for proven mappings, preserve raw net prices, validate complete mapping coverage and test the adapter before changing the repository. Roll back only the owned repository/adapter/mapping and consumer delta from the task snapshot; preserve unrelated user changes. No Warehouse mutation or database migration is proposed.

## Verification Results

Audit-only verification succeeded for consumer tracing, the five-category/23-subcategory enumeration and read-only Warehouse schema/group inspection. The website snapshot has 159 rows. The earlier configured product API returned 380 unique SKUs and 75 image fields. The later environment read found `WAREHOUSE_API_URL` absent and the API recheck failed with `ERR_INVALID_URL`; this has not been presented as an upstream outage. No application tests/build/browser verification has been run for an unimplemented sitewide change, and no application/environment/database files were changed by this audit.

Mapping/setup milestone update: the user approved the whole plan and chose the website mapping. Initial preparation read 355 active/saleable/non-service Warehouse rows. When env values changed independently, the configured API returned 380/380 unique rows; the deliverables were reconciled to that API list, not to the earlier database subset. Of the API rows, 267 also had identical SKU/name in the earlier read-only query. API-based results are 161 family/subgroup matches, 93 family-only and 126 unresolved; 23 service/customization/calibration/shipping lines are explicitly flagged. `products.slug` and `cms_documents` checks both returned true. Agent did not modify `.env.local`, run migrations or switch runtime consumers. Final formatting, mapping/CSV structural verification and scoped whitespace results are recorded at delivery; application build/browser checks are not applicable to an unimplemented runtime switch.

Final milestone verification: JSON and CSV each contain 380 distinct SKUs matching the captured live API set exactly; CSV rows/names/units/category memberships agree with JSON. All memberships use the existing five families/23 subgroups. Status counts are 161 mapped, 93 category-only, 126 unresolved. The user confirmed G-prefix sales codes as the preferred group (233 rows); other codes are review alternatives (147), without automatically publishing unsupported preferred rows. Both guide JavaScript commands parse, local document links resolve, scoped Prettier and `git diff --check` pass. No runtime import of the new mapping exists yet. Next.js feedback review found no qualifying framework issue during this mapping/documentation work.

# Final sitewide runtime delivery

## Current sitewide runtime verification (2026-11-10)

The audit/mapping-only statements above are historical and superseded by the approved runtime integration. All 380 upstream SKUs are accounted for: 89 enabled and 291 deliberately parked. Enabled category counts are scales 41, indicators 6, platforms 21, POS 3 and accessories 18. `docs/warehouse/runtime-product-status.csv` contains actual publication paths/reasons; `runtime-integration-delivery.md` records the current contract and maintenance procedure.

Verification passed: catalog tests 134/134; scoped ESLint zero warnings; Node 24 / Next 16.4.3 build/typecheck 398/398 pages; 35 production browser regressions across Home/search/comparison, five categories/detail/images, carousel gestures/responsive checks, builder, quotation and real PDF output. Source-failure simulation gave API 503 and a safe non-printable quotation error state. Production parked URLs return 404. After the final guide-route-only setting, another build completed 398/398 pages and the targeted two production cases passed. Root TypeScript and the added route's ESLint pass.

Development qualification: isolated Node 24 Webpack builder-to-quotation/PDF passed twice. The existing user dev server failed HMR handshake/hydration and was not stopped. Development emits a streamed not-found response with HTTP 200; production 404 remains the release check. Private Turbopack QA dev under a widened symlink dependency root repeatedly refreshed, so it is not reported as passing. See delivery notes for the verified Webpack startup command. The guide route now explicitly allows blocking navigation according to the installed Next documentation.

No Warehouse writes, migration, `.env.local` edit, commit, push or deployment. All unrelated dirty files are retained. Owned development servers are stopped; the verified production preview is left available for review at `http://127.0.0.1:3061`.

# Historical Warehouse quotation delivery

Production verification: 468 routes built with two prerender workers after the first CMS connection timed out at higher concurrency. All seven quotation browser tests passed against this build, including mobile and multipage PDF checks.

Implement the authorized quotation reader, SKU adapter, VAT calculation, form/PDF and regression checks in the files listed under “Warehouse product API for configurator quotations”. Verify the live endpoint, browser selections and generated PDF. Sitewide category mapping remains a separate task.
Verified: all 380 selector values matched live Warehouse SKUs. SKU 11 at THB 1,990 × 2 produced THB 3,980 net, 278.60 VAT and 4,258.60 gross in the print view. One-line and multipage A4 PDFs generated. All seven quotation browser cases passed across the development run and navigation rerun. Scoped lint, TypeScript and 128 catalog tests passed. Sample: `output/warehouse-quote-live/sample.pdf`.

# Plan: Repair localhost development HMR

## Files

- `next.config.ts` — add exact `127.0.0.1` development-origin allowance while preserving LAN/UAT configuration.
- `tests/e2e/localhost-hmr.spec.ts` — add a dev-only regression for local/loopback HMR, actual products and hydrated builder; skip on production.
- `src/features/content/components/weighing-builder.tsx` — temporary marker-only source probe to verify actual hot update and state retention; restore exact bytes immediately after the probe. No retained application edit.
- `docs/warehouse/localhost-hmr-delivery.md` — record cause, restart command/runtime, actual browser/HMR evidence and remaining limitations.
- `docs/warehouse/runtime-integration-delivery.md` — supersede the earlier unresolved-dev/Webpack workaround with the verified local HMR repair.
- `spec.md`, `plan.md`, `MEMORY.md` — maintain approved scope, actual verification and repeatable operational lesson.

## Steps

- [x] Reproduce the loopback-origin rejection and inspect the existing process/runtime and local Next.js guide.
- [x] Record the concrete scope under the user's explicit HMR repair/restart authorization.
- [x] Capture baseline and task-owned file snapshots; add the exact hostname and regression.
- [x] Stop only the verified port-3000 project dev CLI/child, restart with Node 24; no cache isolation was necessary.
- [x] Validate both local HMR origins and unrelated-origin rejection; perform an actual temporary-source HMR/state-retention probe with exact restoration.
- [x] Test real products/categories/detail/images and builder → quotation/PDF on localhost:3000 at mobile/desktop sizes; check browser errors and request failures.
- [x] Run scoped checks, update documentation/results and leave the verified dev server running.

## Impact / Rollback

No shared layout/style/UI changes. Only the exact development allowlist entry persists. Preserve unrelated dirty source and other running servers. Restore the one config delta to undo it; do not delete caches recursively or restart any process without confirming its project/port identity.

## Verification Results

Before fix: loopback WebSocket regression failed 1/1 with `connected=false`; localhost handshake and initial builder worked. After exact allowlist change and the authorized Node24 restart: HMR tests 3/3, Warehouse browsers 5/5 and carousel browsers 6/6 pass on localhost:3000 (14 total). The HMR mutation probe restored every byte and retained head selection through both hot updates. External-origin control remains blocked. Actual API returns 89 SKUs; proxy image 200 WebP; quotation PDF created. Responsive 390/834/1440px tests passed, and dedicated products/builder captures at 390/1440 had no console/page errors and were visually inspected.

Root TypeScript, scoped ESLint, 134 catalog tests, scoped Prettier and diff whitespace checks pass. Only config/test/docs persist; no production rebuild was needed for this development-origin-only change. Server listener 11892 uses Node24.22.1 and remains running with CLI24412. No dependency/runtime upgrade, environment/data edits, cache deletion, deployment or other-server stop. Next.js feedback review found expected origin rejection documented by the installed guide, not a new qualifying framework issue; no report was submitted. Observer lesson85 records comparing real origins before changing bundlers.
# Plan: Carousel model-row overflow bug

## Files

- `src/features/catalog/components/products-index-carousel.module.css` — bound the existing model row, allow horizontal scrolling and prevent label compression/wrapping.
- `src/features/catalog/components/products-index-carousel.tsx` — identify the row accessibly, keep active labels visible through horizontal-only scrolling and exclude native row gestures from scene navigation.
- `tests/e2e/products-index-carousel.spec.ts` — add row geometry/reachability/active visibility and native touch/wheel regressions, preserving existing scene gesture/detail tests.
- `docs/warehouse/carousel-model-row-delivery.md` — record the reproduction, scoped fix and browser evidence.
- `spec.md`, `plan.md`, `MEMORY.md` — record authorization, verification and the catalog-size overflow lesson.

## Steps

- [x] Reproduce the supplied screenshot with actual Warehouse rows and record the owner's bug-fix authorization.
- [x] Read current tokens/styles/client-component guide; snapshot owned carousel files and test native row scrolling in a reversible browser experiment.
- [ ] Add and run failing geometry/reachability regressions before the fix.
- [ ] Apply the scoped row layout/active-follow/gesture-isolation fix.
- [ ] Run row and full existing carousel tests on localhost:3000 at mobile/tablet/desktop widths; inspect screenshots and source restoration safety.
- [ ] Run TypeScript/lint/format checks, document actual results and leave dev running.

## Impact / Rollback

Only the existing carousel model-selector row changes. Images, source identities, timing and detail transitions remain as before. Restore just the task-owned carousel delta from its snapshot to undo it; keep unrelated dirty files and dev/Warehouse processes intact. No shared style, dependency, data, environment or deployment change.
