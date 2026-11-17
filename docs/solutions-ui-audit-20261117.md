# ตรวจหน้าโซลูชันก่อนปรับ UI — 17 พฤศจิกายน 2026

สถานะ: ตรวจของเดิมและจัดทำข้อเสนอแล้ว รอเจ้าของอนุมัติก่อนแก้โค้ด

งานอ้างอิง: [วัน 9 — เก็บ UI ของหน้าเนื้อหาและติดต่อ](https://app.notion.com/p/41acb1b2c06081699816d34c2ced6884) ของเซฟ กำหนด18พฤศจิกายน2026

## ผลตรวจที่มีนัยสำคัญ

| จุดตรวจ           | ของเดิมที่พบ                                                                  | ข้อเสนอ                                                                         |
| ----------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| รายละเอียด14หน้า  | ไม่มีข้อความบทความ/H1ที่มีข้อความทั้ง14หน้า แต่ยังrenderกรอบเดิมสูง84–2717px  | ให้หน้าไม่มีข้อมูลมีชื่อหัวข้อ ข้อความสอบถาม ปุ่มติดต่อ และปุ่มกลับ แทนกรอบว่าง |
| ชื่อการ์ด14รายการ | ยกชื่อบทความยาวมาแสดง มีคำซ้ำ/คำสะกดเก่า เช่น คอมพิวตอร์/เบื่องต้น/เพร้อม     | ย่อเฉพาะชื่อแสดงบนการ์ดตามตารางในSpec คงข้อมูลอ้างอิงและURL                     |
| Heroบนแท็บเล็ต    | สูงประมาณ876pxที่768 และ1116pxที่1024 เพราะรูปสี่เหลี่ยมจัตุรัสอยู่ใต้ข้อความ | จำกัดช่องภาพแบบcontain; เป้าหมายHero≤640pxเมื่อfont100%ในtablet/desktop         |
| ช่องว่างหน้ารวม   | pว่าง2จุด, cardsmin-height340px, sectionpadding96–112pxบางส่วน                | เอาpว่างออก cards240/280px sectionpadding56/64/80pxเฉพาะหน้า                    |
| ภาพHero           | ใช้ภาพแรกที่มีจากWarehouse ไม่มีmappingธุรกิจเฉพาะ                            | รอบUIคงภาพเดิมไม่อ้างcompatibility; เปลี่ยนภาพเมื่อมีภาพ/SKUที่บริษัทรับรอง     |
| ข้อมูลบทความจริง  | ถูกเว้นตามWarehouse-only policy ไม่ใช่ข้อมูลหายจากJSON                        | แยกงานรอบริษัทรับรอง ห้ามเปิดlegacyกลับเพื่อให้หน้าเต็ม                         |

## ส่วนที่ผ่านแล้วและควรรักษา

- /solutionsที่320/390/768/1024/1440px ตอบ200 มี4sections/3businessgroups/14cardsครบ ไม่เกิดdocumenthorizontaloverflowและภาพHeroโหลดได้
- Tabจากการ์ดแรกถึงDriverการ์ดสุดท้ายได้ พร้อมfocusoutline; คลิกbusiness-3anchorแล้วtargetแสดงได้
- 18businesslinksยังมีอยู่ครบและหมวดสินค้า4ปลายทางตอบ200พร้อมH1
- /solution/mesและ/solution/erpตอบ200มีH1 แต่maintextเพียง153/134อักขระ ยังไม่รับรองเนื้อหาครบ
- ไม่พบpageerrorในการเดินชุดauditนี้; ไม่เท่ากับผ่านfullbrowserregressionหรือProduction

## รายละเอียด14หน้า — หลักฐานปัจจุบัน

ทุกแถวตอบHTTP200ทั้ง390/1440px, articleTextว่าง, H1ที่มีข้อความ0, contactlinkในmain0 และไม่พบdocumentoverflow

| Route                         | Article height 390px | Article height 1440px |
| ----------------------------- | -------------------: | --------------------: |
| /solutions/rs232              |                 2266 |                  2266 |
| /solutions/wireless           |                 2213 |                  2213 |
| /solutions/usb-drive          |                 2525 |                  2717 |
| /solutions/android            |                 2029 |                  2029 |
| /solutions/label-printing     |                 1474 |                  1474 |
| /solutions/pos-label-printing |                 1663 |                  1663 |
| /solutions/lot-serial         |                  235 |                   252 |
| /solutions/pos                |                   84 |                    84 |
| /solutions/checkweighing      |                 2264 |                  2264 |
| /solutions/external-display   |                 2001 |                  2001 |
| /solutions/plc                |                 2371 |                  2371 |
| /solutions/wet-environments   |                 1514 |                  1514 |
| /solutions/windows            |                  147 |                   149 |
| /solutions/driver             |                  207 |                   221 |

ความสูงวัดจากDOMหลังrenderในlocaldev อาจเปลี่ยนเล็กน้อยตามfont/viewport ไม่ใช้เป็นเกณฑ์pixel-identical

## สาเหตุที่ตรวจจากโค้ด

1. src/features/content/data/warehouse-content.ts ล้างข้อความ/รูปเก่าตามนโยบาย แต่คงโครงHTMLไว้
2. src/features/content/components/solutions-page.tsx เข้าarticleเมื่อ page.text.trim() หรือ page.warehouseOnly เป็นจริง จึงข้ามempty-stateในกรณีWarehouse-onlyว่าง
3. src/features/content/components/solutions-overview.tsx อ่าน14ชื่อจากsnapshotโดยตรง และrenderpว่างในHero/intro
4. src/features/content/components/solutions-overview.module.css ใช้HeroArtaspect-ratio:1ก่อน80rem และcardmin-height340px

ข้อเสนอแก้เฉพาะrenderer/CSSของfamilyโซลูชัน ไม่เปลี่ยนpolicyหรือsanitizerส่วนกลาง

## แยกงานสำหรับนำไปทำ

| ชิ้นงาน | ผลส่งมอบ                                               | เงื่อนไขเริ่ม                                                |
| ------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| SOL-01  | Empty stateอ่านรู้เรื่องและติดต่อได้ครบ14รายละเอียด    | อนุมัติSpec/PlanPhase A                                      |
| SOL-02  | ชื่อการ์ดย่อ14รายการโดยลิงก์/ลำดับเดิมครบ              | อนุมัติชื่อในตารางSpec                                       |
| SOL-03  | Hero/cards/spacingกระชับและยังResponsive               | อนุมัติค่าหน้าเฉพาะในSpec                                    |
| SOL-04  | รายงานตรวจbefore/after/keyboard/touch/historyและchecks | หลังSOL-01ถึง03                                              |
| Phase B | เนื้อหาและภาพจริงตามหัวข้อที่บริษัทเลือกเปิด           | Need Information: แหล่งข้อมูล/ผู้ตรวจรับ/รายการหัวข้อรอบเปิด |

ข้อกำหนด/ไฟล์ที่จะเปลี่ยน/ค่าขนาด/acceptance/rollbackฉบับเต็มอยู่หัวข้อ “Solutions UI audit and scoped cleanup proposal (2026-11-17)” ในspec.mdและplan.md

## หลักฐานและข้อจำกัด

- Baselineuatcb59a10 สะอาดก่อนเริ่ม; localpreviewhttp://127.0.0.1:3114, Node24.22.3/Next16.4.6/React19.3.1
- Chromiumผ่านMicrosoftEdgeheadless; reducedmotionสำหรับbatchaudit; ภาพdesktopเพิ่มจากDevToolsnormalmotion ตรวจ5overview+28detailcontextsและ6otherbusinessdestinations
- [Raw audit JSON](C:/Users/cityc/AppData/Local/Temp/sunford-solutions-audit-20261117/audit.json)
- [หน้ารวม desktop](C:/Users/cityc/AppData/Local/Temp/sunford-solutions-audit-20261117/overview-1440.png)
- [หน้ารวม tablet](C:/Users/cityc/AppData/Local/Temp/sunford-solutions-audit-20261117/overview-768.png)
- [หน้ารวม mobile](C:/Users/cityc/AppData/Local/Temp/sunford-solutions-audit-20261117/overview-390.png)
- [RS232 mobile ก่อนแก้](C:/Users/cityc/AppData/Local/Temp/sunford-solutions-audit-20261117/detail-rs232-390.png)
- [POS mobile ก่อนแก้](C:/Users/cityc/AppData/Local/Temp/sunford-solutions-audit-20261117/detail-pos-390.png)
- [Source hashes ก่อนแก้](C:/Users/cityc/AppData/Local/Temp/sunford-solutions-audit-20261117/source-baseline.json)
- ไม่ได้ตรวจSafari/มือถือจริง/Production/ทุกลิงก์ต้นฉบับภายนอก ไม่runfulltest/buildและไม่อ้างว่าแก้UIแล้ว
- ไม่เปลี่ยนapp/tests/Notion/DB ไม่stage/commit/push/deploy; browserartifactsอยู่tempนอกsource
- Technicalreferencesตรวจ17พ.ย.2026 v4.3: [Responsive](https://tailwindcss.com/docs/responsive-design), [Overflow](https://tailwindcss.com/docs/overflow), [Focus states](https://tailwindcss.com/docs/hover-focus-and-other-states); ใช้เป็นหลักCSS ไม่ติดตั้งTailwind

## ผลตรวจเอกสารและขอบเขตก่อนส่งมอบ

- SHA-256 ของ source ทั้ง 287 ไฟล์ตรงกับ baseline ไม่มีการแก้แอปหรือ tests; Git Changes มีเพียง Spec, Plan และรายงานนี้
- เอกสารทั้ง 3 ไฟล์ผ่าน Prettier และ git diff --check ไม่มี staged changes
- ปิด dev server 3114 และ browser tabs ที่เปิดเพื่อตรวจแล้ว
- ข้อจำกัดเพิ่มเติม: dev server มี hydration attribute mismatch, คำแนะนำ LCP image eager และ uncached-data/static-route diagnostics ระหว่างตรวจปลายทางหมวดสินค้า แม้ batch ไม่พบ pageerror จึงยังไม่รับรองว่า console/server ไม่มีปัญหา ยังไม่ได้วิเคราะห์สาเหตุหรือรวมการแก้ส่วนร่วมใน Phase A
- ไม่มีปัญหาที่พิสูจน์แล้วว่าเกิดจาก Next.js framework สำหรับส่ง feedback ในรอบนี้
