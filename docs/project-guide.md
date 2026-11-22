# คู่มือหาไฟล์ SUNFORD ใน VS Code

ตรวจจากโค้ดที่ใช้งานอยู่วันที่ 17 พฤศจิกายน 2026 สำหรับเจ้าของโปรเจกต์ที่เริ่มดูแลเว็บด้วยตัวเอง

เริ่มจากส่วนที่เห็นบนหน้าเว็บ แล้วตามไปหาไฟล์หน้าจอ → CSS → ข้อมูล ไม่จำเป็นต้องอ่านทุกไฟล์ตามลำดับ

หากเริ่มจากหน้าแรก ให้อ่าน [พาดูไฟล์หน้าแรกทีละส่วน](homepage-tour.md) ซึ่งเรียงตามส่วนที่เห็นจริงบนเว็บ พร้อมเส้นทางการเรียกไฟล์และแหล่งค่ากลาง

ตั้งค่า Explorer และรวมตัวจัดรูปแบบราคาตามที่เจ้าของอนุมัติแล้ว ดูขอบเขตและผลตรวจใน [บันทึกงาน](archive/2026-11-17/vscode-organization-proposal-20261117.md)

## 1. รู้จักโฟลเดอร์หลัก

| ตำแหน่ง                      | หน้าที่                                                          | เปิดเมื่อ                                                |
| ---------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| `src/app/`                   | ประกอบหน้า กำหนด URL และ API                                     | ต้องรู้ว่าหน้าไหนเรียกส่วนประกอบอะไร                     |
| `src/features/home/`         | ส่วนประกอบ เนื้อหา และตัวอ่านข้อมูลของหน้าแรก                    | แก้ Hero วิดีโอ หรือส่วนต่าง ๆ บนหน้าแรก                 |
| `src/features/catalog/`      | สินค้า หมวดหมู่ ค้นหา เปรียบเทียบ และใบเสนอราคา                  | ทำงานเกี่ยวกับการเลือกหรือแสดงสินค้า                     |
| `src/features/content/`      | หน้าเนื้อหา เช่น ติดต่อ บริการ เกี่ยวกับเรา Solutions และจัดสเปค | ทำงานกับหน้าเหล่านี้                                     |
| `src/features/site/`         | เมนู ค่าตั้งเว็บ และตัวอ่านเนื้อหาในไฟล์                         | ตรวจข้อมูลที่หลายหน้าใช้ร่วมกัน                          |
| `src/features/services/`     | การเชื่อมต่อ Warehouse และ storage ฝั่งเซิร์ฟเวอร์               | ตรวจที่มาของสินค้าและรูป ไม่ใช่ส่วนออกแบบหน้าจอ          |
| `src/features/customer-map/` | แผนที่และข้อมูลการกระจายลูกค้า                                   | ดูส่วนแผนที่ลูกค้า                                       |
| `src/components/layout/`     | Header, Navbar, Footer และส่วนวางโครงร่วม                        | ต้องแก้สิ่งที่ปรากฏหลายหน้า                              |
| `src/components/ui/`         | ชิ้นส่วนพื้นฐาน เช่น Modal, Tooltip และรูปสินค้า                 | มีพฤติกรรมพื้นฐานที่ต้องใช้ซ้ำ                           |
| `src/components/contact/`    | ปุ่มติดต่อ มาสคอต และการแสดงแบนเนอร์                             | ทำงานกับช่องทางติดต่อที่ลอยอยู่บนหน้า                    |
| `src/styles/`                | สี ระยะ ชั้นซ้อน และ CSS ส่วนกลาง                                | ตรวจค่ากลางหรือ style ที่หลายส่วนใช้ร่วมกัน              |
| `src/stores/`                | สถานะ UI ที่หลายส่วนต้องเห็นตรงกัน                               | ตรวจตัวกรอง ค้นหา และรายการเปรียบเทียบ                   |
| `src/lib/`                   | ตัวช่วยตั้งค่าสภาพแวดล้อมและ Prisma ของโปรเจกต์                  | ตรวจโครงสร้างเชื่อมต่อระบบ ไม่ใช่เนื้อหาเว็บ             |
| `src/types/`                 | คำอธิบายชนิดข้อมูลสำหรับเครื่องมือพัฒนา                          | ตรวจข้อกำหนดของชนิดข้อมูลบางส่วน                         |
| `data/`                      | เนื้อหาเว็บและ metadata บางประเภท                                | ตรวจค่าตั้งและข้อมูลประกอบ ไม่ใช่ราคา Warehouse ฉบับใหม่ |
| `public/`                    | รูป วิดีโอ โมเดล และแผนที่ที่เก็บในโปรเจกต์                      | หาไฟล์สื่อจริง เช่น `/images/...`                        |
| `tests/`                     | การตรวจความถูกต้องอัตโนมัติ                                      | ตรวจว่างานที่แก้ไม่ทำให้ของเดิมเสีย                      |
| `scripts/`                   | คำสั่งพัฒนา ตรวจข้อมูล และ release                               | ตรวจว่าคำสั่งใน `package.json` ทำงานอย่างไร              |
| `prisma/`                    | schema และประวัติ migration ที่ต้องเก็บ                          | ทำงานกับทะเบียนใบเสนอราคาภายใต้แผนเฉพาะ                  |
| `docs/`                      | คู่มือ รายงาน และเอกสารอ้างอิง                                   | หาคำอธิบายก่อนอ่านโค้ด                                   |

ไฟล์ `AGENTS.md` คือกติกาการทำงานของ AI, `spec.md` คือข้อกำหนดและสถานะงาน, `plan.md` คือแผนและผลตรวจ ส่วน `MEMORY.md` เก็บข้อตกลงกับบทเรียนที่ต้องจำ ประวัติในเอกสารอาจถูกคำสั่งใหม่แทนที่ ให้ตรวจสถานะล่าสุดของหัวข้องานด้วย

## 2. จำประเภทไฟล์ให้ออก

| รูปแบบ                           | ความหมายในโปรเจกต์นี้                                               |
| -------------------------------- | ------------------------------------------------------------------- |
| `page.tsx`                       | จุดเริ่มประกอบหน้าเว็บของ URL นั้น                                  |
| `layout.tsx`                     | โครงที่หุ้มหลายหน้า เช่น การโหลด CSS หรือ Header/Footer             |
| `route.ts`                       | จุดรับคำขอ API ไม่ใช่หน้าจอ                                         |
| ไฟล์ `.tsx` ทั่วไป               | ส่วนประกอบหน้าจอ รวมพฤติกรรมที่เกี่ยวข้อง                           |
| `.module.css`                    | CSS ที่ผูกกับ component ผ่าน `import styles`                        |
| `.css` ทั่วไป                    | CSS ที่อาจส่งผลหลายส่วน ต้องตามว่าโหลดจากที่ใด                      |
| `.ts`                            | กฎ ตัวช่วย ตัวอ่านข้อมูล หรือชนิดข้อมูล ให้ดูเนื้อหาและผู้เรียกด้วย |
| `.json`                          | ข้อมูลและค่าตั้ง ไม่ใช่ทุกไฟล์จะเป็นข้อมูลที่เว็บใช้ในปัจจุบัน      |
| `.test.ts` / `.spec.ts`          | ไฟล์ตรวจอัตโนมัติ ไม่ใช่หน้าจอลูกค้า                                |
| `package.json`                   | รายการเครื่องมือและคำสั่ง เช่น dev, build, lint และ deploy          |
| `bun.lock` / `package-lock.json` | บันทึกเวอร์ชัน dependency ไม่แก้ด้วยการพิมพ์เปลี่ยนเลขเอง           |
| `.env.local`                     | ค่าตั้งเฉพาะเครื่องและข้อมูลเชื่อมต่อ ไม่เผยแพร่เนื้อหา             |

ชื่อ `components`, `data`, `server`, `hooks` ที่อยู่ภายใน feature มีหน้าที่ต่างกัน: หน้าจอ, ข้อมูล/กฎ, ตัวอ่านหรือเขียนฝั่งเซิร์ฟเวอร์, และพฤติกรรม React ที่นำกลับมาใช้ได้ ตามลำดับ

## 3. อยากแก้อะไร ให้เริ่มตรงนี้

ลิงก์ต่อไปนี้ชี้ไปยังไฟล์ที่มีอยู่จริงใน checkout ปัจจุบัน

| สิ่งที่สนใจ                | ไฟล์เริ่มต้น                                                                            | ตามไปดูอะไรต่อ                                                                                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ลำดับส่วนต่าง ๆ ของหน้าแรก | [หน้าแรก](<../src/app/(site)/page.tsx>)                                                 | imports ด้านบน เช่น Hero, CategoryFeature และส่วนเรื่องราว                                                                                                                        |
| Hero ตอนเปิดเว็บ           | [hero.tsx](../src/features/home/components/hero.tsx)                                    | [hero-scene.tsx](../src/features/home/components/hero-scene.tsx) และ [CSS ของฉาก](../src/features/home/components/hero-scene.module.css)                                          |
| เมนูด้านบน                 | [site-navigation.tsx](../src/features/site/components/site-navigation.tsx)              | หน้าแรกใช้ [header.tsx](../src/components/layout/header.tsx); หน้าอื่นใช้ [primary-navigation.tsx](../src/components/layout/primary-navigation.tsx)                               |
| รายการใน Navbar            | [primary-navigation.ts](../src/features/site/data/primary-navigation.ts)                | ตรวจ readiness, href และตัวอ่านค่าตั้งใน `features/site/`                                                                                                                         |
| Footer                     | [footer.tsx](../src/components/layout/footer.tsx)                                       | [footer.css](../src/styles/footer.css) และ [footer-navigation.ts](../src/features/site/data/footer-navigation.ts)                                                                 |
| หน้ารวมสินค้า `/products`  | [products/page.tsx](<../src/app/(site)/products/page.tsx>)                              | [products-overview.tsx](../src/features/catalog/components/products-overview.tsx) และ [products-index-content.tsx](../src/features/catalog/components/products-index-content.tsx) |
| การ์ดในรายการหมวดสินค้า    | [catalog-product-card.tsx](../src/features/catalog/components/catalog-product-card.tsx) | [product-browser.module.css](../src/features/catalog/components/product-browser.module.css)                                                                                       |
| รายละเอียดสินค้าหนึ่งรุ่น  | [products/[slug]/page.tsx](<../src/app/(site)/products/[slug]/page.tsx>)                | ตัวอ่านสินค้า สรุปสเปก และ CSS ที่หน้านี้ใช้                                                                                                                                      |
| ติดต่อเรา                  | [contact-page.tsx](../src/features/content/components/contact-page.tsx)                 | [contact-page.module.css](../src/features/content/components/contact-page.module.css)                                                                                             |
| บริการหลังการขาย           | [after-sales-page.tsx](../src/features/content/components/after-sales-page.tsx)         | [ข้อมูลบริการ](../src/features/content/data/after-sales.ts) และ CSS ชื่อเดียวกัน                                                                                                  |
| Solutions                  | [solutions-page.tsx](../src/features/content/components/solutions-page.tsx)             | [solutions-overview.tsx](../src/features/content/components/solutions-overview.tsx) สำหรับหน้ารวม                                                                                 |
| ใบเสนอราคา                 | [service/quotation/page.tsx](<../src/app/(site)/service/quotation/page.tsx>)            | [quotation-form.tsx](../src/features/catalog/components/quotation-form.tsx); กฎคำนวณอยู่ [quotation.ts](../src/features/catalog/data/quotation.ts)                                |
| จัดสเปคเครื่องชั่ง         | [หน้าจัดสเปค](<../src/app/(site)/guides/indicator-platform-compatibility/page.tsx>)     | [weighing-builder.tsx](../src/features/content/components/weighing-builder.tsx)                                                                                                   |
| สีและระยะห่างส่วนกลาง      | [base.css](../src/styles/base.css)                                                      | ดูตัวแปรที่ขึ้นต้น `--` และค้นหาว่าส่วนใดเรียกใช้                                                                                                                                 |
| แหล่งสินค้า/ราคา           | [product-repository.ts](../src/features/catalog/server/product-repository.ts)           | [warehouse-product.server.ts](../src/features/services/warehouse-product.server.ts)                                                                                               |

บางหน้า เช่น `/contact-us`, `/service`, `/about-us` และ `/solutions` เข้าเว็บผ่าน [เส้นทางรวม `[...path]/page.tsx`](<../src/app/(site)/[...path]/page.tsx>) จึงไม่มีโฟลเดอร์ URL แยกครบทุกหน้า

`(site)` เป็นกลุ่มจัดโค้ด ไม่แสดงคำนี้ใน URL; `[slug]` รับส่วนหนึ่งของ URL เช่นรหัสสินค้า; `[...path]` รับหลายส่วนของ URL ความหมายนี้ตรวจจากเอกสาร Next.js ที่ติดตั้งในโปรเจกต์แล้ว

## 4. ตัวอย่างการตามไฟล์หนึ่งชิ้น

```text
หน้าแรก: src/app/(site)/page.tsx
  → Hero: src/features/home/components/hero.tsx
    → ฉาก: src/features/home/components/hero-scene.tsx
      → หน้าตา: hero-scene.module.css ในโฟลเดอร์เดียวกัน
```

ส่วนที่แสดง `<Hero ... />` คือการนำ component มาใช้ ส่วน `import { Hero } from ...` บอกที่อยู่ของ component นั้น ค่าอย่าง `settings` ที่ส่งเข้ามาคือข้อมูลที่ชิ้นส่วนนั้นได้รับ เรียกว่า props

ถ้าเห็น `@/features/...` ให้เริ่มจาก `src/features/...` เพราะโปรเจกต์กำหนด `@/` ให้แทน `src/` ใน [tsconfig.json](../tsconfig.json)

CSS Modules ใช้ `className={styles.xxx}` ส่วน global CSS มักใช้ `className="xxx"` ไฟล์ global ถูกโหลดผ่าน [globals.css](../src/app/globals.css) ซึ่งรวม CSS หลายไฟล์ ลำดับและ selector จึงมีผลต่อหน้าตาจริง

## 5. ค่ากลางและชิ้นส่วนที่มีให้ใช้แล้ว

ค่ากลางแยกตามหน้าที่ เพื่อให้หาเจ้าของและผลกระทบได้ชัดเจน

| สิ่งที่ต้องใช้ร่วมกัน                        | แหล่งที่มีอยู่แล้ว                                                                                     | วิธีนำไปใช้                                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| สี ขอบหน้า ระยะ section/card และระดับชั้น UI | [base.css](../src/styles/base.css)                                                                     | CSS ใช้ `var(--red)`, `var(--page-gutter)`, `var(--card-padding-content)` ตามหน้าที่เดิม                                  |
| ลิงก์และข้อมูลบริษัทพื้นฐาน                  | [brand.ts](../src/features/home/data/brand.ts)                                                         | ใช้ `sunford.contact` หรือ `sunford.line`; ส่วนที่รับ `site` ให้ใช้ค่าตั้งที่ส่งมา                                        |
| ค่าตั้งและเมนูจากไฟล์                        | [documents.ts](../src/features/site/server/documents.ts) และ [content.json](../data/site/content.json) | รักษาการอ่านผ่านตัวอ่านเดิม; defaults ใน [settings.ts](../src/features/site/data/settings.ts) อาจถูกค่าที่บันทึกไว้แทนที่ |
| เมนูหลักและปลายทาง                           | [primary-navigation.ts](../src/features/site/data/primary-navigation.ts)                               | ใช้รายการและ readiness เดิม ไม่สร้างสำเนาเมนู                                                                             |
| แสดงรูปสินค้ารวมกรณีไม่มีรูป                 | [product-image.tsx](../src/components/ui/product-image.tsx)                                            | ใช้ `ProductImage` พร้อม props ตามตัวอย่าง caller ที่ใช้งานจริง                                                           |
| กล่องโต้ตอบ                                  | [modal.tsx](../src/components/ui/modal.tsx)                                                            | ใช้ `Modal` ตาม contract เดิมของ focus และการปิด                                                                          |
| สรุป VAT ใบเสนอราคา                          | [quotation.ts](../src/features/catalog/data/quotation.ts)                                              | ใช้ `quotationTotals`; หน่วยเป็นสตางค์จำนวนเต็ม                                                                           |
| สถานะค้นหา/เปรียบเทียบ                       | [catalog-store.ts](../src/stores/catalog-store.ts)                                                     | ใช้ store เดิมเพื่อให้ชิ้นส่วนเห็นรายการเดียวกัน                                                                          |
| ข้อมูลสินค้า Warehouse                       | [product-repository.ts](../src/features/catalog/server/product-repository.ts)                          | อ่านผ่าน repository เดิมฝั่งเซิร์ฟเวอร์                                                                                   |

ตัวจัดรูปแบบราคากลางอยู่ที่ [price-format.ts](../src/features/catalog/data/price-format.ts) ใช้ร่วมในรายการสินค้า ใบเสนอราคา รายละเอียดสินค้า และหน้าจัดสเปค ทั้ง2ฟังก์ชันรับจำนวน **บาท**:

```ts
import { formatBaht, formatPrice } from "@/features/catalog/data/price-format";

formatPrice(1234.5); // "1,234.50" สำหรับข้อความที่เติมหน่วยเอง
formatBaht(1234.5); // "฿1,234.50" สำหรับข้อความพร้อมสัญลักษณ์บาท
```

ถ้าข้อมูลเป็นสตางค์ ให้แปลงที่จุดใช้งานตามกฎเดิม เช่น `formatPrice(satang / 100)` ตัวจัดรูปแบบไม่คำนวณVATและไม่ตัดสินใจว่าจะขึ้น “สอบถามราคา” เมื่อใด ดู contract ของแต่ละหน้าที่ [บันทึกงาน](archive/2026-11-17/vscode-organization-proposal-20261117.md)

ข้อควรแยกให้ออก:

- เบอร์หรืออีเมลบริษัททั่วไป ข้อมูลผู้ขายในเอกสาร และช่องทางฝ่ายบริการมีคนละบทบาท อย่าเปลี่ยนให้เป็นข้อมูลเดียวกันเพียงเพราะคล้ายกัน
- ราคาที่เห็นกับตัวเลขที่คำนวณเป็นคนละขั้นตอน การจัดรูปแบบไม่ควรคำนวณ VAT หรือเปลี่ยนหน่วยเงินให้เอง
- `product-card.tsx` และ `catalog-product-card.tsx` มีผู้เรียกและรูปแบบต่างกัน ส่วน `product-storefront.tsx` ไม่พบผู้เรียกจากการตรวจ source รอบนี้ จึงยังไม่รวม ลบ หรือดึงกลับมาใช้
- การมีไฟล์ไม่ได้แปลว่าเว็บใช้ไฟล์นั้นอยู่ ค้นหา import/ผู้เรียกก่อนแก้เสมอ
- ข้อมูลสินค้าเก่าที่เก็บไว้เป็นอ้างอิงไม่ใช่แหล่งเติมชื่อ ราคา รูป หรือสเปกที่ Warehouse ไม่มี หน้าภายในใช้ Warehouse ส่วนหน้าแรก/Hero มีข้อยกเว้นเดิมที่อนุมัติไว้

## 6. ใช้ VS Code ให้หาไฟล์เร็วขึ้น

1. กด `Ctrl+P` แล้วพิมพ์ชื่อ เช่น `hero-scene` หรือ `quotation-form` เพื่อเปิดไฟล์
2. กด `Ctrl+Shift+F` เพื่อค้นทั้งโปรเจกต์ เช่น `--page-gutter` หรือ `CatalogProductCard` ตรวจด้วยว่า Search ใช้ exclude อยู่หรือไม่
3. กด `Ctrl` ค้างแล้วคลิกชื่อที่ import หรือใช้ `F12` บนชื่อ symbol เพื่อไปยังต้นทาง
4. เปิดคู่มือนี้แล้วใช้ Markdown Preview ด้วย `Ctrl+Shift+V` เพื่ออ่านตารางและกดลิงก์ไฟล์
5. หากมีแท็บชื่อ `page.tsx` หลายอัน ให้ดู path ใน breadcrumbs ด้านบน editor ประกอบ

มุมมอง Explorer ที่ตั้งไว้ซ่อนไฟล์ติดตั้ง/build/generated และผลลัพธ์เฉพาะเครื่อง พร้อมจัด `.module.css` ใต้ `.tsx` ที่ชื่อคู่กันในโฟลเดอร์เดียวกัน เช่น `hero-scene.tsx` กับ `hero-scene.module.css` เป็นการจัดกลุ่มด้วยชื่อ ไม่ใช่แผนผัง import อัตโนมัติ

ให้ขยายกลุ่มก่อนเลือกย้ายหรือลบไฟล์รายตัว เพราะการดำเนินการกับกลุ่มที่พับอยู่มีผลต่อทั้งกลุ่มตาม [คู่มือ VS Code](https://code.visualstudio.com/docs/editing/getting-started/userinterface#_file-nesting) ตั้งค่าให้ขยายกลุ่มโดยเริ่มต้นไว้แล้ว แต่ VS Code อาจจำกลุ่มที่เคยพับไว้ ให้กดลูกศรหน้าไฟล์เพื่อขยายได้

หากต้องการคืนไฟล์ที่ซ่อน หลังมีการตั้งค่าแล้ว ให้เปิด Command Palette (`Ctrl+Shift+P`) → `Preferences: Open Workspace Settings (JSON)` แล้วเปลี่ยนรายการนั้นใน `files.exclude` เป็น `false` หรือเอาเฉพาะรายการนั้นออก ไม่ต้องย้ายไฟล์หรือแก้ `.gitignore`

## 7. ไฟล์ที่เครื่องมือสร้าง และไฟล์ที่ต้องเก็บ

- `node_modules/` เป็น dependency ที่ติดตั้ง; `.next/` เป็นผลจาก Next.js; `src/generated/` เป็นโค้ดสร้างจากเครื่องมือ ให้แก้ต้นทางแทนการแก้ไฟล์ generated
- `test-results/`, `playwright-report/`, `output/`, `outputs/`, `work/` และ `.playwright-cli/` เป็นผลตรวจ/ผลลัพธ์หรือเครื่องมือเฉพาะเครื่องตามการใช้งานปัจจุบัน การซ่อนจาก Explorer ไม่ใช่การลบ
- `public/`, `data/`, `tests/`, `scripts/`, `prisma/`, `.env.example`, `.env.local` และเอกสารกติกายังคงต้องเข้าถึงได้
- `.local/` อาจมีทะเบียนเลขใบเสนอราคา SQLite สำหรับเครื่องพัฒนา และ `prisma/migrations/` มีประวัติฐานข้อมูล จึงไม่จัดเป็นไฟล์ขยะหรือลบในการจัดแถบไฟล์

## 8. เวลาสั่ง AI ทำงานครั้งต่อไป

ใช้รูปแบบนี้ได้: “ปรับ [ส่วนที่เห็นบนเว็บ] ที่ [หน้า/URL] ให้ [ผลที่ต้องการ] ตรวจค่ากลางและ component ที่มีอยู่ก่อน ระบุไฟล์ที่จะกระทบ แล้วทำตาม Spec/Plan ของโปรเจกต์”

ก่อนส่งงาน ให้ตรวจว่าตรงหน้า/พฤติกรรมที่ต้องการจริง มีหลักฐานตรวจ และไม่มีไฟล์ส่วนอื่นเปลี่ยนเกินขอบเขต
