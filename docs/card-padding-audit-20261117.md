# PAD-04 — ระยะภายในการ์ด อ้างอิง Apple HIG Layout

วันที่ตรวจ: 17 พฤศจิกายน 2026  
สถานะปัจจุบัน: **ปรับ PAD-04 ตามการอนุมัติแล้ว — ดูผลตรวจและข้อยกเว้นท้ายรายงาน**

ตารางของเดิมด้านล่างเก็บเป็น baseline ก่อนอนุมัติ ผล implementation และข้อยกเว้นล่าสุดบันทึกท้ายรายงาน

## แหล่งอ้างอิงการออกแบบ

ใช้ [Apple HIG Layout](https://developer.apple.com/design/human-interface-guidelines/layout) เป็นแหล่งอ้างอิงด้านการออกแบบเพียงแหล่งเดียว ตามคำสั่งล่าสุด ครอบคลุม PAD-01 ถึง PAD-04

HIG ให้หลักการจัดแนว แบ่งกลุ่ม และปรับตามพื้นที่/ขนาดข้อความ หน้า Layout **ไม่ได้กำหนดตัวเลข padding สำหรับการ์ดบนเว็บไซต์** ตัวเลขที่เสนอจึงเป็นค่าประยุกต์ของ SUNFORD และยังรอ review ไม่อ้างว่าเป็นข้อบังคับของ Apple

## ค่าที่เสนอ

| Role    |   Padding เริ่มต้น | พื้นที่ที่เหมาะสม                                                          |
| ------- | -----------------: | -------------------------------------------------------------------------- |
| Compact |    **16px / 1rem** | การ์ดสินค้าเล็ก เช่น catalog grid และ Builder                              |
| Content |  **24px / 1.5rem** | การ์ดข้อความ ธุรกิจ ซอฟต์แวร์ ช่องทางติดต่อ และข้อมูลบริการ                |
| Feature |    **32px / 2rem** | panel เน้นเนื้อหาที่กว้างจริง; แบบกระชับใช้24px                            |
| Form    | **16 / 24 / 32px** | ตามพื้นที่ฟอร์มและ layout เดิม โดยเหลือพื้นที่ให้ช่องกรอก/ข้อความแจ้งเตือน |

การ์ดเล็กบน desktop ยังใช้ Compact ได้ ไม่เพิ่มเป็น32pxเพียงเพราะจอกว้าง ใช้ค่าเดียวกันเมื่อ role และ layout เหมือนกัน

## ของเดิมที่ตรวจพบ

ตรวจ source/active renderers และเบราว์เซอร์12เส้นทางที่390/768/1440px รวม **36กรณี** ทุกเส้นทางตอบ200 ไม่พบ pageerror หรือ console warning/error ในชุดนี้ เก็บ48 class combinations ซึ่งรวม wrapper/text/control จึงไม่เรียกว่ามี48ประเภทการ์ด

| ส่วนประกอบ              | Padding ปัจจุบัน                          | ข้อเสนอ                                                          |
| ----------------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| Catalog product card    | 11px12px15pxบนมือถือ; 14px16px17pxจอกว้าง | Compact16px; คงช่องปุ่มเปรียบเทียบ                               |
| Products index          | outer0; copy22px หรือ24px28px30px         | outer0; Content24pxที่ข้อความ                                    |
| Solutions / business    | 32px28px                                  | Content24px; ชื่อ/ภาพ/ความสูงเดิมยังไม่เปลี่ยน                   |
| Software copy           | 26px                                      | Content24px                                                      |
| Explore directory copy  | 24px18px หรือ28px                         | Content24px                                                      |
| Contact channel         | 20px18px หรือ22px18px                     | Content24px พร้อมตรวจอีเมล/ลูกศร                                 |
| Location body           | บน0 ด้านข้าง/ล่าง22px                     | คงบน0ใต้รูป; ข้าง/ล่าง24px                                       |
| Service instructions    | outer0; header/body/footerแยกกัน          | จัดแนวพื้นที่ย่อย โดยไม่ pad root ซ้ำ                            |
| Service contact/address | contact25/20px; address10px14px           | Content24px / Compact16px; คง short-height16px                   |
| Quote seller/form       | seller24px; form16/30.72/40px             | sellerคง24px; form16/24/32pxตามพื้นที่                           |
| Builder product         | article16px                               | คง16pxและใช้tokenร่วมกัน                                         |
| About next-step         | source24px21px /25px /30px34px            | Content24pxหรือFeature32pxตามlayout; ต้องตรวจpanelนี้เพิ่มโดยตรง |

## ข้อยกเว้นที่ต้องรักษา

- **รูปชิดขอบ:** outer padding0ยังถูกต้อง ให้เว้นพื้นที่ที่ copy แทน รูปมีสัดส่วนเดิม
- **พื้นที่ controls:** overview service card มี bottom80pxสำหรับปุ่ม; compare/accordionมีช่องด้านข้าง ห้ามลบเพื่อให้ค่าดูเท่ากัน
- **การ์ดแบ่งพื้นที่:** Service มีheader/steps/footerหลายชั้น ไม่เพิ่มpaddingทั้งrootและลูกซ้ำ
- **ภาพตกแต่ง Home:** collage/photo cardsมีค่า0หรือ10–14pxตามองค์ประกอบ เก็บเป็นข้อยกเว้น
- **ข้อความ/ฟอร์ม:** ไม่ลดfontหรือตัดข้อความเพื่อให้ตรงเลข หากไม่พอดีต้องทบทวนค่าหรือเสนอlayoutdeltaก่อน
- **Overflow:** pseudo-elementของContact/Serviceทำให้scrollWidthกว้างขึ้นได้ ต้องตรวจข้อความและปุ่มจริง ไม่ใช้scrollWidthเพียงตัวเดียว

## ความเชื่อมโยงกับ HIG

| หลักจาก Layout             | เกณฑ์ตรวจของเรา                                   |
| -------------------------- | ------------------------------------------------- |
| การจัดแนวและลำดับเนื้อหา   | หัวข้อ ข้อความ และ CTA จัดแนวสัมพันธ์กัน          |
| การรวมเนื้อหาที่เกี่ยวข้อง | padding owner ชัดเจน และไม่เพิ่มระยะซ้ำหลายชั้น   |
| การปรับตามพื้นที่          | เลือกroleตามพื้นที่การ์ด ไม่ตามชื่ออุปกรณ์        |
| ขนาดข้อความที่เปลี่ยน      | ข้อความยาว/ขยายแล้วเนื้อหาและปุ่มยังเข้าถึงได้    |
| พื้นที่ปลอดภัย             | controlsไม่ทับภาพ/ขอบ/แถบระบบ ไม่บวกsafe insetซ้ำ |

อ่าน [ฉบับ Markdown](https://developer.apple.com/design/human-interface-guidelines/layout.md) วันที่17พ.ย.2026 ไม่แสดงเลขเวอร์ชัน HIG; change log ล่าสุด9ก.ย.2026 ไม่ใช้ Tailwind หรือค่าของtvOS/visionOSมากำหนดpaddingของwebcard

## แผนหลังอนุมัติ

1. PAD-01 ขอบหน้าและtokens
2. PAD-02 ระยะsection
3. **PAD-04a** การ์ดสินค้า/โซลูชัน/เนื้อหา และ **PAD-04b** บริการ/ติดต่อ/Builder/ฟอร์ม
4. PAD-03 ตรวจรับรวม ก่อนส่งให้เจ้าของcommit

รายการไฟล์/acceptance/rollbackเพิ่มใน amendment ของ spec.md / plan.md แล้ว เจ้าของอนุมัติให้เริ่มตรวจและเพิ่มแผนก่อนแก้โค้ด ส่วนapplication implementationยังรออนุมัติ

## หลักฐานและข้อจำกัด

- [Browser measurements](C:/Users/cityc/AppData/Local/Temp/sunford-card-padding-audit-20261117/cards-audit.json)
- [สรุปตัวอย่างและส่วนประกอบ](C:/Users/cityc/AppData/Local/Temp/sunford-card-padding-audit-20261117/cards-summary.json)
- [การ์ดสินค้าบนมือถือ](C:/Users/cityc/AppData/Local/Temp/sunford-card-padding-audit-20261117/_products_category_scales_price-390.png)
- [Source hashes ก่อนตรวจ](C:/Users/cityc/AppData/Local/Temp/sunford-card-padding-audit-20261117/source-baseline.json)
- LocalWebpack/Node24.22.3/Next16.4.6/Edge ไม่ใช่Production/Safari/มือถือจริง
- ภาพบางรายการlazy-loadอยู่นอกviewport screenshotจึงใช้ประกอบlayout ไม่ใช้รับรองความครบของรูปสินค้า
- ยังไม่ทดลองค่าที่เสนอในแอป หรือทดสอบ200%/short-height/ทุกaccordion/list mode/validation stateครบ จัดไว้ในacceptanceหลังอนุมัติ
- ไม่เปลี่ยนชื่อ/รูป/ข้อมูล/ราคา/compatibility ไม่submitฟอร์มหรือออกเลขเอกสาร และไม่แก้โค้ดแอป

## ตรวจขอบเขตก่อนส่งมอบ

- เอกสาร4ไฟล์ผ่าน Prettier และ git diff --check
- SHA-256 sourceทั้ง287ไฟล์ตรงกับก่อนตรวจ ไม่มีการแก้แอป/tests/config และไม่มี staged changes
- ปิด local preview3118 และ browser แล้ว; ยังไม่commit/push/deploy
- ข้อเสนอค่าและimplementationทั้งหมดรอเจ้าของreviewก่อน ไม่มีการอ้างว่าค่าที่เสนอผ่านการทดสอบหลังแก้แล้ว

### Implementation results — approved PAD-01/02/04 and PAD-03 verification (2026-11-17)

- เจ้าของอนุมัติด้วยข้อความ “อนุมัติ”; ปรับ CSS19ไฟล์/146declaration changes ตาม manifest รวม7semantic tokens: page20/32/48px, standard32/48/64px, compact16/24/32px, feature48/64/80px และcard16/24/32px ใช้rem/thresholdเดิม ไม่มีrootfontหรือdependencyใหม่
- Apple HIG Layout เป็นแหล่งอ้างอิงการออกแบบเพียงแหล่งเดียว; ตัวเลขเป็นค่าประยุกต์ของ SUNFORD ที่เจ้าของอนุมัติ ไม่ใช่ตัวเลขที่AppleบังคับหรือการรับรองHIG100%
- คงmax-width/overview6.25vw, Hero/ภาพ/height/control/PDF geometry และsceneexceptions; Serviceจอเตี้ยใช้compositionเดิมทั้งชุดตามรายละเอียดข้างบน Contactเพียง2จุดอนุญาตwrapเพื่ออ่านข้อความที่ขยาย200%
- Dedicated padding/card20/20ผ่านบนproduction; final acceptance38/39ผ่าน (3.3นาที) รวมServiceทุกแท็บ/short-screen normal+reduced motion/solutions anchors+14ปลายทาง+history/keyboard/native touch/tooltip/delayed hydration/mockเลขPDF ข้อที่ไม่ผ่านคือsolutions-overview.spec.ts:152ยังเรียกปุ่มHeader Compareเก่า “เลือกสินค้าเพื่อเปรียบเทียบ” ไม่แก้เทสต์นอกmanifestหรือพฤติกรรมแอปเพื่อให้ผ่าน
- Current Search/Compare26/26ผ่านแยกชุดบนproduction; browser28routefamilies×7widths=196กรณีตอบ200ทั้งหมด ไม่มีdocumentoverflow/pageerror มี3consolewarnings (CSSpreload2,WindowsGPU1) จึงไม่อ้างว่าconsoleสะอาด
- ตรวจroot tokens/gutter/4sides/rolepadding/hero bottom32ด้วยtestและcomputedmeasurements; 200%textresizeผ่านContact/Service และQuote/Builderที่390/1440px ไม่ใช่การรับรองnative browserzoomทุกหน้า
- FinalService1280×720ทั้ง5แท็บ main bottom706px/policy top665.75pxเท่ากัน; Footerมือถือ3accordionsใช้keyboardเปิด/ปิดได้ ภาพหลังแก้ตรวจด้วยตาแล้ว
- Catalog202/202, UAT28/28, Node24typecheck/scopedESLintผ่าน; finalproductionbuild706/706ผ่านโดยCIRCLE_NODE_TOTAL=2 (1worker, process-only) ไม่มีการแก้config/DB
- PDF/VAT/35selectedSKU/A4หลายหน้าผ่านในrelatedrun; issuance mockเท่านั้น ไม่มีการออกเลขจริงหรือเขียนWarehouse
- Broader dev117-case runหยุดเมื่อWarehousestatementtimeoutทำให้แสดงerrorboundary: completed66pass/18fail/33notcompleted มีทั้งobsoleteNav/contentfixtures, data/timeouts และService-spacingregressionที่แก้แล้ว เก็บfailedattemptsไว้ ไม่อ้างว่าfullE2Eผ่าน
- Sourceguardไม่มีunexpected/forbiddenchange: applicationเปลี่ยนเฉพาะ19CSS; TSX/data/routes/API/lock/config/PDF/businesslogicเดิม มี2newE2Eและแก้guide-entryexpectedpaddingเพียงจุดเดียวในexistingfixture MEMORY.mdเพิ่มoperationalnoteตามAGENTS.md
- ข้อจำกัด: ไม่รับรองSafari/มือถือจริง/nativebrowserzoom/no-JSทั้งเว็บ; Solutionsเนื้อหาว่างเดิมและงานSOLยังพักไว้ ไม่เพิ่มscopeไปแก้Nav/data/Comparefixture
- หลักฐาน: [Verification report](C:/Users/cityc/AppData/Local/Temp/sunford-padding-implementation-20261117/verification-report.md), [Receipt](C:/Users/cityc/AppData/Local/Temp/sunford-padding-implementation-20261117/verification.json), [Production measurements](C:/Users/cityc/AppData/Local/Temp/sunford-padding-implementation-20261117/after-sweep.json)
