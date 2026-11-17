# Padding ทั้งเว็บ — ผลตรวจและข้อเสนอสำหรับ SUNFORD

วันที่ตรวจ: 17 พฤศจิกายน 2026  
สถานะปัจจุบัน: **ปรับตามการอนุมัติแล้ว — ดูผลตรวจและข้อจำกัดท้ายรายงาน**

ตารางและผลตรวจของเดิมด้านล่างเป็น baseline ก่อนอนุมัติ ผล implementation และข้อจำกัดล่าสุดบันทึกท้ายรายงาน

อัปเดตตามคำสั่งล่าสุด: เพิ่ม **PAD-04 ภายในการ์ด** และใช้ **Apple HIG Layout เป็นแหล่งอ้างอิงด้านการออกแบบเพียงแหล่งเดียว** ดูรายละเอียดใน [รายงานการ์ด](C:/Users/cityc/Documents/Project/sunford_web/docs/card-padding-audit-20261117.md) ตัวเลขระยะเป็นข้อเสนอของ SUNFORD ไม่ใช่ค่าที่ Apple ระบุสำหรับเว็บ

## ข้อเสนอที่แนะนำ

ใช้ระยะตามหน้าที่ของพื้นที่ รักษาความกว้างเนื้อหาเดิม และให้แต่ละหน้าใช้ค่ากลางร่วมกัน โดยเริ่มจากขอบหน้าและ section ก่อน

| ประเภทระยะ                              | มือถือ <768px | แท็บเล็ต 768–1279px | จอกว้าง ≥1280px |
| --------------------------------------- | ------------: | ------------------: | --------------: |
| ขอบขั้นต่ำหน้าทั่วไป ต่อข้าง            |      **20px** |            **32px** |        **48px** |
| Padding section ทั่วไป บนและล่างต่อด้าน |      **32px** |            **48px** |        **64px** |
| กลุ่มงาน/หัวข้อแบบกระชับ ต่อด้าน        |          16px |                24px |            32px |
| CTA/banner แบบเน้นเนื้อหา ต่อด้าน       |          48px |                64px |            80px |

ตัวเลขเป็น CSS px ที่ root font 16px; เสนอใช้ rem ใน tokens โดยไม่แก้ root font-size และไม่ติดตั้ง Tailwind

**ตัวเลขเหล่านี้เป็นข้อเสนอสำหรับ SUNFORD** ใช้หลักการจาก [Apple HIG Layout](https://developer.apple.com/design/human-interface-guidelines/layout) เรื่องการจัดแนว การแบ่งกลุ่ม การปรับตามพื้นที่ และความอ่านง่าย Apple ไม่ได้กำหนดชุดตัวเลขนี้เป็นมาตรฐานของเว็บไซต์

## สิ่งที่ตรวจ

- อ่าน CSS ใน src ครบ **54 ไฟล์** พบ padding ใน 47 ไฟล์ รวม **878 declarations / 353 รูปแบบค่า** รวมทั้งสถานะเฉพาะและ CSS เก่าที่อาจไม่ได้แสดงในหน้าปัจจุบัน ตัวเลขนี้ไม่ใช่จำนวนข้อผิดพลาด
- ตรวจ margin, gap, max-width และ scroll-padding ประกอบด้วย เพราะช่องว่างที่เห็นไม่ได้เกิดจาก padding อย่างเดียว
- ตรวจผ่านเบราว์เซอร์ **28 เส้นทาง × 4 ขนาด = 112 กรณี** ที่ 390/768/1440/1920px; ทุกเส้นทางในชุดตอบ HTTP200 และไม่พบ document horizontal overflow
- ตรวจ Search dialog เพิ่มที่ 320/390/768/1440px เพื่อแยก padding ภายใน panel ออกจากขอบหน้า
- เก็บ baseline source ทั้ง 287 ไฟล์ และภาพตัวอย่าง ก่อนจัดทำข้อเสนอ

เป็นการตรวจ source ทั้งเว็บและตัวแทนของแต่ละรูปแบบหน้า ไม่ใช่การเปิดทุก URL สินค้าหรือบทความบน Production

## ของเดิมที่พบ

| พื้นที่                          | ค่าปัจจุบันที่ตรวจได้                                          | สิ่งที่เสนอเก็บ                                                             |
| -------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Container ทั่วไป                 | ขอบขั้นต่ำ 20/32/48px; กว้างไม่เกิน1180px                      | เปลี่ยนค่าซ้ำเป็น semantic token โดยรักษาค่าเดิม                            |
| หมวดสินค้า/โซลูชัน               | gutter = max(20px,6.25vw); ที่390/768/1440pxเป็น24.38/48/90px  | รักษาเป็น profile สำหรับหน้ากว้าง ให้หัวข้อและแถวสินค้ายึดค่าเดียวกัน       |
| Section หมวดสินค้า               | padding ทั่วไป56/96/112pxต่อด้าน มี override ของบางส่วน        | เสนอ32/48/64pxสำหรับ section เนื้อหา; เก็บข้อยกเว้น carousel/control        |
| โซลูชันทั้งหมด                   | listing96pxต่อด้านแม้จอเล็ก และ page bottom100px               | ใช้ section token แทนค่าคงที่สองชุดนี้                                      |
| บริการ                           | แนวหัวข้อ16pxที่390 และ24pxที่768; frame1280pxเมื่อจอกว้าง     | ให้ขอบขั้นต่ำเป็น20/32/48px; คง tab/card/steps ภายใน                        |
| ใบเสนอราคา                       | outer16pxทุกจอ, block clamp32–80px, editor960px                | ใช้ default gutter และ section token; คง form padding/PDF/VAT               |
| หน้าจัดสเปค                      | outer32pxที่390 และ48pxที่768; center1180pxบนจอกว้าง           | ลด outer ให้ใช้ default gutter โดยไม่บวกซ้ำกับ builder ด้านใน               |
| ติดต่อ                           | hero/locationsใช้ max1180px; locations32/36 หรือ48/52pxบน/ล่าง | จัด section ให้ใช้32/48/64pxตามช่วงจอ และให้สองพื้นที่จัดแนวตรงกัน          |
| เกี่ยวกับเรา                     | max1100px; story35/35หรือ55/48px                               | ใช้ standard section; คงความกว้าง รูป และการ์ดภายใน                         |
| หน้ารายละเอียดสินค้า             | outer block30/50pxบนมือถือ และ40/80pxในจอกว้างจาก cascade      | map entry/bottom ตามหน้าที่; ไม่เปลี่ยน product gallery/viewport scene      |
| Explore/software/policies/guides | content heading42/30หรือ65/45px; บางหน้ามี bottom70/90px       | map outer section ให้มีจังหวะร่วมกัน; รักษา reading width                   |
| Home/Footer                      | ระยะหลายชุดตาม scene/เนื้อหา; footer มี max1280px              | ปรับเฉพาะส่วนเนื้อหาแบบ flow; รักษา Hero/showroom/spotlight และแถวภาพเลื่อน |
| Search dialog                    | panel padding21pxที่จอ320/390 และ28pxที่768/1440               | รอบแรกเก็บไว้เป็นข้อยกเว้นของ panel ไม่เปลี่ยนพร้อม page gutter             |

ค่าที่วัดเป็น computed values จากเบราว์เซอร์ จึงอาจไม่ตรงกับ declaration ตัวแรกในไฟล์ เช่น padding ของหน้าจัดสเปคถูก override ใน base cascade

## ข้อยกเว้นที่ควรเก็บไว้

1. **หน้ากว้างกับหน้าที่เน้นอ่านมีหน้าที่ต่างกัน** — รักษา overview gutter6.25vw และ max-width เดิมของ Contact/Service/About/บทความ/ฟอร์ม ไม่ทำให้ทุกหน้าเต็มจอเท่ากัน
2. **Padding ที่จัดฉากไม่ใช่ช่องว่างส่วนเกิน** — Hero/carousel/mobile rail และระยะเผื่อปุ่มควบคุมต้องรักษาไว้ หากจะเปลี่ยนต้องมีหลักฐานแยก
3. **ขอบหน้ามีเจ้าของชั้นเดียว** — container ลูกไม่เพิ่ม page gutter ซ้ำ; ระยะภายในการ์ดหรือ indent ของรายการยังมีได้ตามหน้าที่
4. **แยกการ์ดออกเป็น PAD-04** — เพิ่มมาตรฐานตามประเภทและ padding owner ของการ์ด; ปุ่ม ตาราง tooltip และ modal คงค่าเดิม ไม่เปลี่ยนพร้อมกันทั้งหมด
5. **Safe area และข้อความขยาย** — คง safe-area rules ที่มี และตรวจ zoom200%/อุปกรณ์จริงก่อนปรับ fixed controls เพิ่ม ไม่บวก safe inset ซ้ำทุก section

ตัวอย่าง: section ทั่วไปบนมือถือมี padding32pxต่อด้าน สอง section ที่อยู่ติดกันจึงอาจมีระยะเนื้อหาห่างกัน64px การตรวจต้องดูช่องว่างรวม ไม่บวก margin/gap คั่นเพิ่มโดยอัตโนมัติ

## แบ่งงานให้ทำแยกชิ้นได้

| งาน     | ผลส่งมอบ                                                       | ลำดับ                                     |
| ------- | -------------------------------------------------------------- | ----------------------------------------- |
| PAD-01  | tokens และขอบหน้า Service/Quote/Builder/Contact ที่สอดคล้องกัน | ทำก่อน หลังอนุมัติ                        |
| PAD-02a | section ของ content/software/policy/About/Home flow/Footer     | ตรวจภาพก่อนเดินต่อ                        |
| PAD-02b | section ของ category/subcategory/Solutions/product detail      | ตรวจ rail/anchor/motion/control clearance |
| PAD-03  | regression tests พร้อมภาพก่อน–หลังและรายงานผลจริง              | ก่อนส่งมอบให้เจ้าของ commit               |

เพิ่ม PAD-04 ตรวจและปรับระยะภายในการ์ดหลัง PAD-02 แล้วจึงตรวจรับรวมด้วย PAD-03; รายละเอียดและไฟล์เพิ่มอยู่ใน amendment ของ Spec/Plan

รายการไฟล์และ acceptance ฉบับเต็มอยู่หัวข้อ **Sitewide padding standards from Apple HIG (2026-11-17)** ใน spec.md / plan.md

ข้อเสนอหน้าโซลูชันก่อนหน้านี้พักไว้ งาน PAD ไม่รวมแก้หน้าเนื้อหาว่าง เปลี่ยนชื่อการ์ด เปลี่ยนรูป หรือปรับความสูง Hero ของงานนั้น

## เส้นทางที่ตรวจในเบราว์เซอร์

ทุกเส้นทางด้านล่างตรวจที่390/768/1440/1920px:

- Home: /
- สินค้า/สำรวจ: /products, /explore
- หมวดสินค้า: /products/category/scales, /products/category/indicators, /products/category/platforms, /products/category/pos, /products/category/accessories
- หมวดย่อยและสถานะว่าง: /products/category/scales/price, /products/category/pos/ios
- สินค้าจริงที่อ่านจาก API: /products/wps10ks
- โซลูชัน: /solutions, /solutions/rs232, /solution/mes, /solution/erp
- บริษัท/บริการ/ติดต่อ: /about-us, /service, /contact-us
- ซอฟต์แวร์/เอกสาร: /applications-and-softwares, /software/download, /technical-specification
- จัดสเปค/คู่มือ: /guides/indicator-platform-compatibility, /guides/scales
- ใบเสนอราคา: /service/quotation
- นโยบาย/รับประกัน: /privacy-policy-and-cookie-policy, /warranty/policy, /cancel-and-return/policy, /warranty/register

เส้นทางสินค้ารายตัวเป็นตัวแทนจาก Warehouse ณ รอบตรวจ ไม่ใช้เป็นการล็อก SKU สำหรับทุกการทดสอบในอนาคต

## หลักฐานและแหล่งอ้างอิง

- [Source inventory พร้อม selector/line/media context](C:/Users/cityc/AppData/Local/Temp/sunford-padding-audit-20261117/source-inventory.json)
- [Browser computed measurements](C:/Users/cityc/AppData/Local/Temp/sunford-padding-audit-20261117/browser-audit.json)
- [Source baseline hashes](C:/Users/cityc/AppData/Local/Temp/sunford-padding-audit-20261117/source-baseline.json)
- [บริการบนมือถือ](C:/Users/cityc/AppData/Local/Temp/sunford-padding-audit-20261117/_service-390.png)
- [ติดต่อบนเดสก์ท็อป](C:/Users/cityc/AppData/Local/Temp/sunford-padding-audit-20261117/_contact-us-1440.png)
- [หมวดเครื่องชั่งบนเดสก์ท็อป](C:/Users/cityc/AppData/Local/Temp/sunford-padding-audit-20261117/_products_category_scales-1440.png)
- Apple HIG อ่าน17พ.ย.2026: [Layout](https://developer.apple.com/design/human-interface-guidelines/layout), [ฉบับ Markdown](https://developer.apple.com/design/human-interface-guidelines/layout.md); ไม่มี version number แสดง; change logล่าสุด9ก.ย.2026
- ประวัติการตรวจเทคนิคก่อน owner amendment: Tailwind docs v4.3 อ่าน17พ.ย.2026: [Padding](https://tailwindcss.com/docs/padding), [Responsive](https://tailwindcss.com/docs/responsive-design), [Max-width](https://tailwindcss.com/docs/max-width) — **คำสั่ง Apple HIG100% ล่าสุดแทนที่บทบาทด้านการออกแบบของแหล่งนี้แล้ว** CSS/breakpointsที่มีอยู่เป็นข้อเท็จจริงของโปรเจกต์ ไม่ใช่ข้อกำหนดระยะจาก Apple

## ข้อจำกัดของรอบตรวจ

- เป็น local development บน Edge/Chromium และ reduced motion; ยังไม่ได้รับรอง Production/Safari/มือถือจริง/ทุก interactive state
- ยังไม่ตรวจ zoom200%, breakpoint edges, print/PDF และ normal-motion regressions ครบในรอบนี้ จัดไว้ในแผน implementation
- ปัญหาเนื้อหาโซลูชันว่างยังคงอยู่ และพื้นที่ว่างบางจุดเกิดจากโครง HTML/height ไม่ใช่ padding งานนี้ยังไม่แก้สาเหตุเหล่านั้น
- พบ development reload/context-destroyed ใน Turbopack ซ้ำ เก็บ failed attempts ไว้ และเปลี่ยนเฉพาะคำสั่งเปิด local preview เป็น Webpack แล้วจบ112กรณี ไม่มีการแก้ source/config ไม่อนุมาน root cause
- ไม่ใช้ตัวเลข pageErrors/console ใน batch เป็นผลผ่านทั้งเว็บ เพราะการผูก listener ไม่ครอบคลุมหน้าที่สร้างใหม่ทุกหน้า
- ไม่มีการ submit ฟอร์ม ออกเลขเอกสาร เขียน DB/Notion หรือ deploy

## ผลตรวจเอกสารก่อนส่งมอบ

- Spec, Plan และรายงานนี้ผ่าน Prettier และ git diff --check
- เทียบ SHA-256 source ทั้ง287ไฟล์กับ baseline: ไม่มีไฟล์เปลี่ยน ไม่มี staged changes
- เขียนเฉพาะ Spec/Plan/รายงานใหม่; รักษารายงานโซลูชันก่อนหน้านี้ไว้และบันทึกว่างานนั้นพักไว้
- ปิด local preview3116 และ browser ที่ใช้ตรวจแล้ว
- งานปรับโค้ดยังรออนุมัติ; ไม่มีผล after หรือการรับรองว่าผ่าน functional regression/build/Production ในรอบเอกสารนี้

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
