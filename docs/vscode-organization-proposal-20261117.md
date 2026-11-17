# บันทึกงาน: จัดแถบไฟล์ VS Code และใช้โค้ดกลางของ SUNFORD

วันที่ตรวจ: 17 พฤศจิกายน 2026

Status: "Implemented — Explorer, guide and price-format parity verified"
Approval: "Approved — เจ้าของตอบ อนุมัติครับ เริ่มทำทั้ง 3 ส่วนตามแผนได้เลยครับ"

คู่มืออธิบายส่วนประกอบอยู่ที่ [project-guide.md](project-guide.md) ตั้งค่าExplorerและรวมตัวจัดรูปแบบราคาตามรายการที่อนุมัติแล้ว ส่วนผลรอบวางแผนด้านล่างเก็บเป็นประวัติ ดูผลส่งมอบท้ายเอกสาร

## ผลที่เจ้าของจะได้

1. แถบ Explorer เน้นโค้ดและข้อมูลที่ใช้งาน โดยซ่อน dependency, build/generated และผลลัพธ์เฉพาะเครื่องที่ระบุไว้
2. Component กับ CSS ที่ชื่อคู่กันถูกจัดกลุ่ม เช่น `hero-scene.tsx` → `hero-scene.module.css`; โฟลเดอร์ชั้นเดียวไม่ถูกบีบแสดงเป็น path ยาวบรรทัดเดียว
3. คู่มือเปิดจาก README ได้ บอกหน้าที่แต่ละส่วนและจุดเริ่มต้นของงานจริง
4. โค้ดจัดรูปแบบราคาที่เหมือนกันใน 4 จุดเรียกฟังก์ชันกลาง แทนการสร้าง formatter ซ้ำ

## สิ่งที่ตรวจพบจริง

- ไม่มี `.vscode/settings.json` ใน checkout ณ เริ่มตรวจ; VS Code ที่ติดตั้งเป็น 1.146.0 จาก package metadata ของแอป
- พบ `.tsx` ที่มี `.module.css` ชื่อคู่กันในโฟลเดอร์เดียวกัน 26 คู่; CSS ส่วนกลางและไฟล์ชื่อไม่คู่ยังต้องตาม import ในคู่มือ
- มีค่ากลางสี/spacing/z-index ใน `src/styles/base.css` อยู่แล้ว โดย spacing มาจากงาน PAD ที่อนุมัติและยังไม่ commit การจัด Explorer ครั้งนี้ไม่เปลี่ยนค่าเหล่านั้น
- มี `sunford`, ตัวอ่าน settings, Primary Navigation, ProductImage, Modal, repository และ `quotationTotals` ให้ใช้ซ้ำอยู่แล้ว
- `product-card.tsx` และ `catalog-product-card.tsx` ต่างมี caller จริง; ไม่พบ import/caller ของ `ProductStorefront` นอกไฟล์นิยามในการค้น source รอบนี้ ไม่ถือว่าอนุมัติลบไฟล์นั้น
- `package.json` กับ `bun.lock` ระบุ Next16.4.6/React^19.3.1 ขณะที่ root metadata ของ `package-lock.json` ยังเป็น Next16.4.3/React19.3.0 บันทึกเป็นความต่างเดิม ไม่ปรับ lockfile ในงานนี้
- Node บน PATH เป็น22.14.0 ขณะที่โปรเจกต์กำหนด24; ก่อนตรวจ implementation ต้องเลือก Node24 ที่ตรวจเวอร์ชันแล้ว ไม่ติดตั้ง/อัปเกรด dependency เพื่อจัด Explorer
- มีงาน PAD และเอกสารก่อนหน้าใน working tree อยู่แล้ว ต้องรักษาทั้งหมด baseline SHA-256 เก็บนอก checkout

## Settings ที่เสนอให้ใช้เฉพาะโปรเจกต์

ติดตั้ง `.vscode/settings.json` ตามpreviewที่อนุมัติด้านล่าง เฉพาะworkspaceของโปรเจกต์

```json
{
  "explorer.compactFolders": false,
  "explorer.sortOrder": "default",
  "explorer.excludeGitIgnore": false,
  "explorer.fileNesting.enabled": true,
  "explorer.fileNesting.expand": true,
  "explorer.fileNesting.patterns": {
    "*.tsx": "${capture}.module.css, ${capture}.css",
    "package.json": "bun.lock, package-lock.json"
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "src/generated": true,
    "next-env.d.ts": true,
    "**/*.tsbuildinfo": true,
    "test-results": true,
    "playwright-report": true,
    "output": true,
    "outputs": true,
    "work": true,
    ".playwright-cli": true
  }
}
```

Settings นี้ใช้กับโฟลเดอร์โปรเจกต์ ไม่แก้ user settings ไม่ย้าย/เปลี่ยนชื่อ/ลบไฟล์ ไม่ติดตั้ง extension และไม่เปลี่ยน build/import/Git ignore รายการที่ซ่อนอาจถูกตัดจาก Search/Quick Open และ workspace index ตามพฤติกรรมเครื่องมือด้วย แต่ TypeScript และ build ยังอ่านไฟล์จาก disk ตามปกติ ให้เปิด Workspace Settings แล้วตั้งเฉพาะ exclude เป็น `false` เมื่อต้องตรวจไฟล์เหล่านั้น

`public/`, `data/`, `tests/`, `scripts/`, `prisma/`, `.local/`, โฟลเดอร์คำสั่ง AI, `.env*` และเอกสารโปรเจกต์ไม่อยู่ใน hide list ของงานนี้ ตรวจ effective settings ด้วยเพราะ user settings เดิมอาจมี exclude อื่น

file nesting จับคู่ตามชื่อในโฟลเดอร์เดียวกัน ไม่ได้ย้ายไฟล์และไม่ยืนยันว่า CSS ถูก import กลุ่มตั้งให้ขยายเริ่มต้น; หากผู้ใช้พับแล้วสั่ง copy/move/delete จะทำกับทั้งกลุ่ม จึงมีคำอธิบายนี้ในคู่มือ

อ้างอิง Microsoft ตรวจ17พฤศจิกายน2026: [Workspace settings](https://code.visualstudio.com/docs/configure/settings), [File nesting](https://code.visualstudio.com/docs/editing/getting-started/userinterface#_file-nesting), [Glob patterns](https://code.visualstudio.com/docs/editor/glob-patterns) และ Context7 `/microsoft/vscode-docs` เอกสารเว็บไม่แสดงเวอร์ชันผูกกับ installed build โดยตรง

## ค่ากลางใหม่ที่เสนอ: จัดรูปแบบราคา

สร้าง `src/features/catalog/data/price-format.ts` แล้ว เป็น pure TypeScript ใช้ได้ทั้ง server/client ไม่มี React state, database, environment หรือ dependency เพิ่ม

| ฟังก์ชันที่เสนอ                      | Input/Output                                                                                  | จุดนำไปใช้                                                    |
| ------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `formatPrice(value: number): string` | รับจำนวน **บาท**; ตัวเลข locale `th-TH` มีทศนิยม2ตำแหน่ง ไม่เติมสัญลักษณ์เงิน                 | `products-index-content.tsx` และ `quotation-form.tsx`         |
| `formatBaht(value: number): string`  | รับจำนวน **บาท**; locale `th-TH`, `style: "currency"`, `currency: "THB"` ตาม options ปัจจุบัน | รายละเอียดสินค้า `[slug]/page.tsx` และ `weighing-builder.tsx` |

ตัวอย่างผลที่ต้องคง: `formatPrice(1234.5)` → `1,234.50`; `formatBaht(1234.5)` → `฿1,234.50` ตรวจอักขระจริงและกรณีปัดเศษใน runtime ที่รองรับก่อนย้าย

ย้ายเฉพาะการสร้าง/เรียก formatter: quotation ยังคงแปลงสตางค์เป็นบาทที่ `amount(satang)` เดิม, `quotationTotals` คำนวณเหมือนเดิม, เงื่อนไข null/zero/สอบถามราคาและข้อความต่อท้ายอยู่ที่ caller เดิม ตัวจัดรูปแบบไม่คำนวณ VAT ไม่เปลี่ยนหน่วย ไม่กรองค่า ไม่เติมข้อมูล และไม่สร้าง fallback ใหม่

ส่วนที่ต่างกันและคงไว้: `products-overview.tsx` ใช้ default decimal precision; `product-storefront.tsx` จำกัด currency เป็นจำนวนเต็มและไม่พบ active caller; PDF ใช้ `en-US` และมีข้อกำหนดเอกสารของตัวเอง; หน้า diagnostic Warehouse ไม่อยู่ในงานนี้

## รายการไฟล์

เอกสารที่จัดทำในรอบวิเคราะห์นี้:

- `docs/project-guide.md` — คู่มืออ่านโครงสร้าง/ตามไฟล์/ค่ากลางเดิม
- `docs/vscode-organization-proposal-20261117.md` — settings preview, audit และขอบเขตที่จะอนุมัติ
- `spec.md`, `plan.md` — เพิ่มหัวข้องานนี้โดยไม่แก้ประวัติงานอื่น

ไฟล์ที่จะสร้างหรือแก้หลังอนุมัติ:

- `.vscode/settings.json` — สร้าง workspace Explorer configuration ตาม preview
- `README.md` — เพิ่มลิงก์คู่มือและข้อเสนอในส่วนโครงสร้างเท่านั้น
- `src/features/catalog/data/price-format.ts` — สร้าง2formattersกลาง
- `src/features/catalog/components/products-index-content.tsx` — เรียก `formatPrice` แทน inline formatting
- `src/features/catalog/components/quotation-form.tsx` — เรียก `formatPrice` โดยคง satang conversion
- `src/app/(site)/products/[slug]/page.tsx` — เรียก `formatBaht` แทน inline formatter
- `src/features/content/components/weighing-builder.tsx` — เรียก `formatBaht` แทน formatter เดิม
- `tests/catalog/price-format.test.ts` — สร้างการตรวจ output ราคา/Unicode/เศษสตางค์แบบ explicit expected values
- `docs/project-guide.md`, `docs/vscode-organization-proposal-20261117.md`, `spec.md`, `plan.md` — อัปเดตสถานะและผลตรวจจริง

## ผลกระทบและทางย้อนกลับ

Explorer เป็น R2 ย้อนเฉพาะ key ที่เพิ่มได้ ไม่มีการลบไฟล์จริง ส่วน helper เป็น R1 เพราะใช้ร่วม4จุด หาก format/หน่วยผิดอาจแสดงราคาผิดแม้ยอดคำนวณเดิมถูก จึงต้องเทียบ output เดิมก่อน/หลังทั้ง server/client และย้อนเฉพาะ imports/calls ของ4ไฟล์พร้อม helper ใหม่ได้

ไม่แก้ global CSS/layout/shared UI, กฎ VAT/PDF/ทะเบียนใบเสนอราคา, ฐานข้อมูล, เมนู, routes, content, dependency, lockfiles หรือไฟล์อื่นเพื่อทำให้หน้าตาหรือ tests ผ่าน ไม่ commit/push/deploy การรวมส่วนอื่นที่พบเพิ่มต้องระบุหลักฐานและ manifest แล้วขออนุมัติส่วนเพิ่มก่อน

## การตรวจรับหลังอนุมัติ

- ตรวจ Explorer ของ VS Code จริง: โครงโฟลเดอร์ชัดเจน, CSS คู่Heroอยู่ใต้TSX, lockfilesอยู่ใต้package, ไฟล์หลักยังเห็น และแก้ exclude คืนได้ พร้อมภาพหลักฐานถ้าเข้าถึงหน้าต่างได้
- ตรวจsettingsเป็นJSONที่อ่านได้และkeyตรงเอกสาร; ตรวจทุกhidepatternไม่ตรง source/data/media/migration ที่ต้องเก็บ
- ตรวจลิงก์คู่มือไปยังไฟล์จริงและREADMEเปิดคู่มือได้
- ตรวจ explicit price outputs สำหรับ0,เศษสตางค์,จำนวนมากและจุดปัดเศษ พร้อมเทียบbaselineเดิมโดยไม่เปลี่ยนเงื่อนไขcaller
- ใช้Node24ตรวจ `typecheck`, scopedESLint/Prettier และ `bun run test:catalog`; บันทึกfailureเดิมแยก ไม่แก้นอกscope
- ตรวจbrowserก่อน/หลังที่320/768/1440สำหรับ4จุดจริง: Products index, รายละเอียดWarehouseที่มีราคา, Builder, Quotation โดยอ่านข้อมูลอย่างเดียว ไม่เรียกออกเลขใบเสนอราคาจริง เก็บตัวอักษรราคา/overflow/page errors
- รันproductionbuildหลังbrowserจบ ไม่ทำWarehouse-heavychecksพร้อมกัน หากฐานข้อมูลไม่พร้อมให้รายงานตรงไปตรงมา ไม่เปลี่ยนpool/config
- ตรวจhash/diff/source scopeและรักษางานเดิมที่ยังไม่commit

## ผลตรวจในรอบวางแผน

ตรวจsource/callers/options/เอกสารMicrosoftแล้ว ยังไม่มีการตั้งVSCodeหรือแก้app ไม่มีผลtypecheck/build/browserของimplementationที่จะอ้างในรอบนี้

- Prettierของเอกสาร4ไฟล์และ `git diff --check` ผ่าน
- ตรวจ48ลิงก์localในคู่มือ/ข้อเสนอ ปลายทางมีอยู่จริงครบ และsettingspreviewอ่านเป็นJSONได้
- ตรวจ17protectedpathsไม่เข้าhidepatternsใหม่ เป็นการตรวจรายการ/รูปแบบก่อนใช้ ไม่ใช่ผลExplorerUIจริง
- SHA-256เทียบ1962ไฟล์baseline:1960ไฟล์เดิมไม่เปลี่ยน อีก2ไฟล์คือSpec/Planที่appendงานนี้; เพิ่มเฉพาะคู่มือ/ข้อเสนอ2ไฟล์ เนื้อหาSpec/Planก่อนหัวข้องานนี้เหมือนเดิมทุกbyte
- ไม่มี .vscode/settings.json ถูกใช้ ไม่มีapp/test/config/README/source changesจากงานนี้ ไม่มีGitHEADเปลี่ยน
- ตัวตรวจลิงก์รอบแรกตีความURLที่Prettierครอบด้วย `<...>` ผิด ปรับตัวตรวจให้รองรับรูปแบบCommonMarkแล้วตรวจใหม่ครบ48ลิงก์ ไม่ใช่brokenlinkในเอกสาร
- หลักฐานplanningreceiptเก็บนอกcheckoutที่ `C:/Users/cityc/AppData/Local/Temp/sunford-vscode-map-20261117/planning-verification.json`

## ผลส่งมอบหลังอนุมัติ

- Explorerตั้งค่าตรงpreview ตรวจในVSCode1.146.0จริง: แยกfolderlevels, ขยาย `hero-scene.tsx` เห็นCSSซ้อนใต้ไฟล์ และขยาย `package.json` เห็น2lockfiles
- ตรวจการคืนvisibilityโดยตั้งnode_modulesเป็นfalseชั่วคราว เห็นโฟลเดอร์กลับมา แล้วคืนtrueตามpreviewและเห็นถูกซ่อนอีกครั้ง source/data/public/tests/scripts/prisma/.local/เอกสารยังเข้าถึงได้ ไม่มีไฟล์ย้าย/ลบ ไม่แก้user-levelsettings
- READMEมีทางเข้าคู่มือ คู่มือเปิดMarkdownPreviewในVSCodeแล้ว และอธิบายการใช้2formattersใหม่พร้อมหน่วยบาทและตัวอย่าง
- 4callerใช้ `formatPrice` / `formatBaht` แล้ว โค้ดที่เปลี่ยนตรงเฉพาะimports/formattercalls/removalตามcontractทุกจุด ตรวจเทียบต้นฉบับรวมPrettier; satangconversion/VAT/null/zero/สอบถามราคา/markup/styleเดิมคงอยู่
- เทสต์ใหม่2ข้อ/16explicitpricecasesผ่าน และfullcatalog204/204ผ่าน ไม่มีskip/retry Node24.22.3typecheck/scopedESLintผ่าน
- Productionbuild706/706ผ่าน (Next16.4.6, process-only CIRCLE_NODE_TOTAL=2/1workerตามแนวตรวจเดิม ไม่มีconfig/DBchange) รันแยกจากbrowser
- LocalproductionChromeก่อน/หลัง4จุด×320/768/1440=12กรณีต่อรอบ ราคา/label957stringsเท่ากันแบบexactรวมUnicode DatasetdigestราคาWarehouseตรงกัน ไม่มีdocumentoverflow/pageerror/consolewarning-error และไม่มีattemptPOST/ออกเลขใบเสนอราคา
- รูปแบบตัวอย่างคงเดิม: `3,542.06 บาท (ก่อน VAT)` / `฿3,542.06`; Quoteจำนวน2แสดงnet7,084.12/VAT495.89/gross7,580.01เหมือนbaseline
- ตรวจ51locallinksรวมทางเข้าREADMEครบ ไม่มีbrokenlink; docs/source/settings/testตามmanifestผ่านPrettierและgitdiffcheck
- SHA-256baseline1964ไฟล์:1955เดิมไม่เปลี่ยน แก้9เดิม+สร้าง3เฉพาะmanifestรวม12ไฟล์ ไม่มีunexpected/deletedfile Spec/Planหัวข้องานก่อนหน้านี้เหมือนเดิมทุกbyteและHEADคงเดิม
- ปิดเฉพาะpreview3124และheadlessbrowserของงานแล้ว serverเดิม3000ยังอยู่ ไม่มีstaging/commit/push/deploy/DBwrite

ข้อจำกัด: Builderมี13headcardsแต่ไม่มีคู่head-platformที่ยืนยันให้เลือกได้ในข้อมูลจริงรอบนี้ จึงตรวจcardprices/emptytotalและdisabledstateเหมือนเดิม ไม่อ้างว่าได้ตรวจselectedkitpriceผ่านUI ตัวช่วยทั้ง2ผ่านexplicitoutputsและsourcecallparity ไม่ได้เพิ่มข้อมูลสมมติหรือforceปุ่มdisabledเพื่อให้ผ่าน ไม่ตรวจPDFdownload/realissuance/เต็มระบบE2E/Safari/มือถือจริงหรือProductiondeployment

หลักฐานอยู่นอกcheckoutที่ `C:/Users/cityc/AppData/Local/Temp/sunford-vscode-implementation-20261117/`: verification-report.md, scope-verification.json, browser-before.json, browser-after.json, links-verification.json, catalog.log, build.log และภาพก่อน/หลัง24ภาพ ภาพnativeVSCodeตรวจผ่านเครื่องมือComputerUseในแชต ไม่ได้exportภาพฐานข้อมูลที่เปิดอยู่เดิม

รอบสำรวจbrowser2ครั้งแรกคาดว่าจะเลือกhead/accessoryได้ แต่ข้อมูลจริงคงปุ่มdisabledตามcontract ตรวจsourceแล้วปรับprobeให้วัดstateจริงก่อน/หลัง ไม่เปลี่ยนapplicationให้ผ่านprobe ไม่พบNextframeworkfeedbackcandidateที่ต้องส่งในงานนี้
