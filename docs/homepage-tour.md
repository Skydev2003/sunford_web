# พาดูไฟล์หน้าแรก SUNFORD ทีละส่วน

ตรวจจาก source และหน้าแรกที่รันจริงในเครื่องวันที่ 17 พฤศจิกายน 2026 คู่มือนี้อธิบายของที่ใช้งานอยู่ ไม่มีการแก้หน้าตาหรือพฤติกรรมเว็บ

ให้เปิดเว็บหน้าแรกกับ VS Code คู่กัน แล้วอ่านตามหมายเลขด้านล่าง ใช้ `Ctrl+P` พิมพ์ชื่อไฟล์ หรือกดลิงก์ในคู่มือนี้เพื่อเริ่มอ่าน

## เริ่มที่ไฟล์ประกอบหน้า

เปิด [src/app/(site)/page.tsx](<../src/app/(site)/page.tsx>) ไฟล์นี้กำหนดลำดับเนื้อหาหน้าแรก ส่วนใหญ่ใช้วิธีเรียกส่วนประกอบจากไฟล์อื่น

```text
Header                                      ← มาจาก layout
main ของหน้าแรก                             ← page.tsx
  1. Hero                                  → hero.tsx
  2. SectionTwoVideo                       → section-two-video.tsx
  3. ProductSpotlight                      → product-spotlight.tsx
  4. CategoryFeature                       → category-feature.tsx
  5. BrandStory                            → sections.tsx
  6. SunfordStories                        → source-showcase.tsx
  7. SunfordVideos                         → source-showcase.tsx
Footer และ Search/Compare overlays           ← มาจาก layout
```

**Component** คือชิ้นส่วนหน้าจอ เช่น Hero; **props** คือข้อมูลที่ไฟล์แม่ส่งให้ชิ้นส่วนนั้น เช่น `products` และ `images` ใน `CategoryFeature` ส่วน `import` ด้านบนไฟล์บอกว่าชิ้นส่วนนั้นอยู่ที่ไหน

ลำดับโครงทั้งหมด:

```text
src/app/layout.tsx
  โหลดฟอนต์ + globals.css + ข้อมูลหมวดหมู่ร่วม
    → src/app/(site)/layout.tsx
      เรียก CatalogRouteFrame เพื่อประกอบ Header / เนื้อหาหน้า / Footer / overlays
        → src/app/(site)/page.tsx
          เรียกเนื้อหาหน้าแรกตามลำดับข้างบน
```

`(site)` เป็นชื่อกลุ่มในโค้ด จึงไม่ปรากฏใน URL หน้าแรกยังเป็น `/` ตามเดิม

## 0. Header — โลโก้และเมนูด้านบน

- จุดประกอบ: [site layout](<../src/app/(site)/layout.tsx>) เรียก [SiteHeader](../src/features/site/components/site-header.tsx)
- ตัวเลือกหน้าตา: [site-navigation.tsx](../src/features/site/components/site-navigation.tsx) เลือก [header.tsx](../src/components/layout/header.tsx) เมื่อ URL เป็น `/`; หน้าอื่นใช้ PrimaryNavigation
- หน้าตา: [header.css](../src/styles/header.css) รวมการปรับ responsive ที่โหลดภายหลังผ่าน globals.css
- ข้อมูลร่วม: `getSettings("site", defaultSite)` และ `getSettings("navigation", ...)` สำหรับชื่อ/โลโก้/ค่าตั้งเมนู; โครงเมนูหลักอยู่ [primary-navigation.ts](../src/features/site/data/primary-navigation.ts) และตัวประกอบอยู่ [navigation.ts](../src/features/site/data/navigation.ts)
- ปุ่มค้นหาใช้สถานะร่วมจาก [catalog-store.ts](../src/stores/catalog-store.ts) เปิดหน้าจอค้นหาที่ [catalog-overlays.tsx](../src/features/catalog/components/catalog-overlays.tsx) ซึ่ง layout ใส่ไว้แล้ว

หากปรับ Header ให้ตรวจหน้าแรกและหน้าอื่นด้วย เพราะเป็นส่วนประกอบร่วม ไม่ได้อยู่ใน page.tsx ของหน้าแรกโดยตรง

## 1. Hero — “เครื่องชั่ง สำหรับธุรกิจของคุณ”

```text
page.tsx
  → hero.tsx
    → hero-scene.tsx                  ฉากวิดีโอ หัวเรื่อง คำอธิบาย และปุ่ม
    → brand-opening.tsx              โลโก้และการเคลื่อนไหวตอนเปิด
```

- ไฟล์เริ่ม: [hero.tsx](../src/features/home/components/hero.tsx) เป็นตัวประกอบ ใช้ [hero-scene.tsx](../src/features/home/components/hero-scene.tsx) แสดงเนื้อหาจริง และส่งโลโก้จาก [brand-opening.tsx](../src/features/home/components/brand-opening.tsx)
- หน้าตาหลัก: [hero-scene.module.css](../src/features/home/components/hero-scene.module.css) และ [brand-opening.module.css](../src/features/home/components/brand-opening.module.css) มี global rules ของ Hero จาก globals.css ร่วมด้วย
- หัวเรื่องและคำบนปุ่ม “ปรึกษาผู้เชี่ยวชาญ” เขียนอยู่ใน `hero-scene.tsx` โดยตรง ลิงก์ปุ่ม `/contact-us` ก็อยู่ตรงนี้
- ฉากที่ใช้อยู่เป็น [sunford-web.mp4](../public/videos/sunford-web.mp4) และภาพรอก่อนวิดีโอ [sunford-poster.jpg](../public/videos/sunford-poster.jpg) path ถูกระบุใน `hero-scene.tsx`
- โลโก้/ชื่อรับมาจาก `site.logo` / `site.name` ผ่าน props ส่วนคำอธิบายรับ `featured.descriptionOverride` ที่หน้าแรกเตรียมจาก `heroSlideData`; ถ้าไม่มีข้อความนี้ใช้ `companyIntro.description` จาก [brand.ts](../src/features/home/data/brand.ts) ซึ่งเป็นข้อความที่เห็นในการตรวจรอบนี้
- สีพื้นปุ่มใช้ `var(--red)` จาก [base.css](../src/styles/base.css) แต่สี hover, ขนาดและระยะบางค่ากำหนดเฉพาะใน CSS ของ Hero

**จุดที่อาจหาไฟล์ผิด:** ตอนนี้ไม่มี model-viewer ใน Hero ที่เรนเดอร์อยู่ แม้จะมี `hero-studio.tsx`, `hero-product-model.tsx`, `hero-product-ribbon.tsx` และข้อมูลโมเดลเก็บไว้ หัวเรื่องที่เห็นก็ไม่ได้อ่าน `defaultHero.tagline` การแก้ค่าที่ไม่ถูกส่งมาใช้จะไม่เปลี่ยนหัวเรื่องปัจจุบัน

หน้าแรกส่ง `showAnnouncement={false}` จึงไม่เห็นแถบประกาศ แม้มีโค้ด `HeroAnnouncement` อยู่ใน `hero.tsx`

## 2. วิดีโอ — “แข็งแรงทนทาน ใช้งานง่าย มีประสิทธิภาพ”

- หน้าจอและการกดเล่น: [section-two-video.tsx](../src/features/home/components/section-two-video.tsx)
- หน้าตา: [section-two-video.module.css](../src/features/home/components/section-two-video.module.css)
- หัวเรื่อง, YouTube ID `UF7QJSq4Qw4` และ URL รูปปกอยู่ใน component นี้โดยตรง ไม่ได้อ่านจากรายการวิดีโอท้ายหน้า
- ใช้ [ProductImage](../src/components/ui/product-image.tsx) แสดงรูปปก และใช้ [useReturnState](../src/features/site/history/return-state.ts) ช่วยคืนสถานะการเล่นเมื่อกลับมาหน้านี้ตามประวัติการนำทางในเอกสารปัจจุบัน ไม่ใช่การบันทึกถาวรข้ามการ reload
- สีเน้นใช้ `var(--red)` จาก base.css เมื่อกดเล่นจึงเปลี่ยนจากปุ่มรูปปกเป็น YouTube iframe

หากต้องการเปลี่ยนคลิปนี้ ให้เริ่มที่ไฟล์นี้ ส่วนวิดีโอแถวท้ายหน้ามีแหล่งรายการคนละที่ตามข้อ7

## 3. สินค้าเด่น — “JC21” บนพื้นดำ

- ตัวเลือกสินค้า ข้อความ และลิงก์: [product-spotlight.tsx](../src/features/home/components/product-spotlight.tsx)
- การเล่นวิดีโอสินค้า: [spotlight-product-video.tsx](../src/features/home/components/spotlight-product-video.tsx) เล่นเมื่ออยู่ในหน้าจอและหยุดเมื่อไม่ควรเล่น พร้อมใช้ poster เมื่อมีปัญหา
- หน้าตาหลัก: [hero.css](../src/styles/hero.css) ให้ค้น `.product-spotlight`, `.spotlight-leading` และ `.spotlight-product-video` ไม่ได้มีไฟล์ product-spotlight.module.css คู่กัน
- คำจากค่าตั้ง: `getSettings("spotlight", spotlightDefaults)`; ค่าบันทึกอยู่ [content.json](../data/site/content.json) และค่าเริ่มต้นอยู่ [settings.ts](../src/features/site/data/settings.ts)
- ไฟล์สื่อ/ตัวตนสินค้าเริ่มต้น: [image-slots.ts](../src/features/home/data/image-slots.ts) ระบุ JC21 Warehouse SKU, วิดีโอและ poster ส่วนรูป/เป้าหมายที่บันทึกไว้ผ่าน [home-images.ts](../src/features/home/server/home-images.ts)
- การตัดสินปลายทาง: [link-targets.ts](../src/features/home/data/link-targets.ts) และสินค้าจาก `getHomeProducts()` ที่ page.tsx ส่งมา
- ตัวช่วยชื่อรุ่น: [catalog-card-names.ts](../src/features/catalog/data/catalog-card-names.ts) มี `catalogModelLabel` ปรับข้อความจาก `SUNFORD JC21` ให้แสดงรุ่น จึงเห็นหัวเรื่อง `JC21`

สื่อที่เรนเดอร์ระหว่างตรวจคือ [jc21-panel-aligned-1080p.mp4](../public/videos/jc21-panel-aligned-1080p.mp4) การแสดงวิดีโอขึ้นอยู่กับสินค้า/รูปที่เลือกตามเงื่อนไขใน component

## 4. “เลือก หมวดหมู่สินค้า” — ภาพใหญ่และตัวเลือก4หมวด

```text
page.tsx ส่ง products + images
  → category-feature.tsx             เตรียมข้อมูลของ4หมวด
    → category-feature-panels.tsx    รับข้อมูลแล้วเปลี่ยนหมวดเมื่อกด
      → category-feature-icons.tsx  ไอคอนแต่ละหมวด
      → ProductImage               แสดงภาพด้วยชิ้นส่วนร่วม
```

- เตรียมข้อมูล: [category-feature.tsx](../src/features/home/components/category-feature.tsx)
- หน้าจอ/การเลือกหมวด/แถบภาพสินค้า: [category-feature-panels.tsx](../src/features/home/components/category-feature-panels.tsx) และ [category-feature-icons.tsx](../src/features/home/components/category-feature-icons.tsx)
- หน้าตา: [category-feature.css](../src/styles/category-feature.css); สีพื้นบางส่วนถูกปรับสำหรับหน้าแรกใน [home-page.module.css](../src/features/home/components/home-page.module.css)
- คำอธิบายเครื่องชั่งและอุปกรณ์เสริมอ่าน `getSettings("showcase", defaults)` ส่วนชื่อหมวดและรายละเอียดบางหมวดเขียนอยู่ใน `category-feature.tsx` จึงไม่ได้ดึงทุกคำจาก settings
- รูปอ่านจาก `images` ที่ส่งมา ใช้ค่าเริ่มต้นจาก `image-slots.ts` ตามเงื่อนไข ส่วนรูปแท่นชั่ง/อินดิเคเตอร์ระบุ path ใน component
- สินค้าในแถบใช้ [getCatalogPage](../src/features/catalog/server/catalog-page.ts) และ [productFeatureEntries](../src/features/home/data/category-feature-items.ts) เตรียมจาก products ที่รับมา
- หมวดที่กำลังเลือกใช้ `useReturnState` และรูปใช้ `ProductImage` เหมือนส่วนอื่น

หมวดที่ตรวจเห็นจริง: เครื่องชั่ง, อุปกรณ์เสริม, โครงสร้างแท่นชั่ง และอินดิเคเตอร์แท่นชั่ง

ที่ `page.tsx` ตั้ง `showHomepageCatalog = false` อยู่ จึงเลือกแสดง CategoryFeature แทน ProductCatalog แม้เห็น import ProductCatalog อยู่ด้านบนไฟล์

## 5. เรื่องแบรนด์ — “เบื้องหลังทุกตัวเลข คือความตั้งใจของคุณ”

- จุดเรียก: `page.tsx` ใช้ `BrandStory` จาก [sections.tsx](../src/features/home/components/sections.tsx) ให้ค้น `BrandStoryTemplate` และ `BrandStory`
- โครงเรื่อง หัวข้อ เนื้อความ และคุณค่าของแบรนด์อยู่ใน `BrandStoryTemplate` ส่วน [customer-story-gallery.tsx](../src/features/home/components/customer-story-gallery.tsx) ดูแลการเปลี่ยนภาพและป้ายข้อความบนภาพ
- รูปและข้อมูลของแต่ละฉาก: [customer-story-photos.ts](../src/features/home/data/customer-story-photos.ts)
- หน้าตา: [brand-story.module.css](../src/features/home/components/brand-story.module.css) ใช้ `var(--section-space)` และตัวแปรระดับชั้น UI จาก base.css
- ลิงก์เกี่ยวกับบริษัทใช้ `sunford.about` จาก brand.ts
- `BrandStory` ยังอ่าน `getSettings("section:story", {})` แล้วส่งให้ [patchSection](../src/features/site/server/section-tree.tsx) เผื่อมีข้อความ/รูป/ลิงก์บันทึกทับ template รอบนี้ไม่พบ settings แถว section:story ที่ยังใช้งาน

`sections.tsx` ยังมี BusinessSolutions และ SupportSection แต่ page.tsx ปัจจุบันไม่ได้เรียกสองส่วนนี้ การมี function อยู่ในไฟล์ไม่ได้หมายความว่าปรากฏบนหน้าแรก

## 6. บทความ — “เรื่องราวของคนทำธุรกิจ.”

- ตัวประกอบ: `SunfordStories` ใน [source-showcase.tsx](../src/features/home/components/source-showcase.tsx)
- หน้าตา: [stories-section.module.css](../src/features/home/components/stories-section.module.css)
- หัวข้อ/คำอธิบาย/ปุ่มดูทั้งหมด: `getSettings("stories", storiesDefaults)` จาก settings และ content.json
- รายการบทความ: [getHomeContentPages](../src/features/content/server/content-repository.ts) รวมเนื้อหาที่บันทึกในไฟล์กับหน้าอ้างอิงที่นำเข้าไว้ แล้วเลือก article ที่ไม่อยู่ใต้ `/business/` สูงสุด8รายการ
- ข้อความย่อ หมวด และวันที่การ์ด: [story-cards.ts](../src/features/home/data/story-cards.ts)
- สองภาพแรก crop จากรูปอ้างอิงที่ระบุใน component ภาพถัดไปใช้ข้อมูลบทความผ่าน ProductImage
- การลาก/เลื่อนและเน้นการ์ดใช้ [FocusDragScroll](../src/components/ui/focus-drag-scroll.tsx) ร่วมกับ gallery อื่น ตัวนี้ทำสำเนาการ์ดเพื่อวนแถบได้ จำนวนลิงก์ใน DOM จึงอาจมากกว่าจำนวนบทความจริง

ส่วนนี้อาจไม่แสดงถ้าไม่มีบทความเข้าเงื่อนไขตาม source ไม่ได้มีการสร้างเนื้อหาใหม่ในงานคู่มือนี้

## 7. “วิดีโอจาก Sunford” — แถววิดีโอท้ายหน้า

- จุดประกอบ: `SunfordVideos` อยู่ใน [source-showcase.tsx](../src/features/home/components/source-showcase.tsx) เช่นเดียวกับบทความ แต่เป็นคนละ function
- รายการ YouTube ID/ชื่อ/ภาพปก: [youtube-video-links.ts](../src/features/home/data/youtube-video-links.ts)
- ชิ้นส่วนแสดงผลร่วม: [video-gallery.tsx](../src/features/content/components/video-gallery.tsx)
- หน้าตาในโหมดนี้: [video-focus.module.css](../src/features/content/components/video-focus.module.css) และ global video-gallery rules จาก [content.css](../src/styles/content.css) พร้อม homepage color overrides
- หัวข้อใช้ `copy.videoTitle` จาก settings แถว `stories`; ส่ง `focusCarousel` ให้ใช้ FocusDragScroll และ `openInYoutube` ให้เปิดคลิปบน YouTube ในแท็บใหม่

ถ้าต้องการเปลี่ยนรายการคลิป ให้เริ่มที่ youtube-video-links.ts ถ้าเปลี่ยนวิธีแสดงการ์ดให้ดู VideoGallery ซึ่งมีผู้ใช้ในหน้าอื่นด้วย

## 8. Footer — โลโก้ ช่องทางติดต่อ และลิงก์ท้ายเว็บ

- Site layout เรียก [footer.tsx](../src/components/layout/footer.tsx) นอก main ของหน้าแรก
- หน้าตาทั่วไปอยู่ [footer.css](../src/styles/footer.css) แต่สีดำ/ข้อความสว่างของ Footer บนหน้าแรกมี override ใน [home-page.module.css](../src/features/home/components/home-page.module.css)
- โลโก้ เบอร์ อีเมล LINE ใช้ `getSettings("site", defaultSite)` เหมือนส่วนอื่น; กลุ่มลิงก์ใช้ [footer-navigation.ts](../src/features/site/data/footer-navigation.ts) และลิงก์บริษัทบางส่วนจาก brand.ts
- `patchSection` ใช้ settings แถว `section:footer` ได้ตาม contract เดิม
- [contact-banner-visibility.tsx](../src/components/contact/contact-banner-visibility.tsx) ซ่อน contact-banner บนหน้าแรก จึงไม่เห็นกล่องเชิญติดต่อขนาดใหญ่ แม้ FooterTemplate มีโค้ดกล่องนั้น

## ค่ากลางเดินทางมาถึงหน้าจออย่างไร

### ก. สี ระยะ และฟอนต์

```text
src/app/layout.tsx → src/app/globals.css → src/styles/base.css
                                              ↓
                     CSS แต่ละส่วนเรียก var(--red), var(--section-space), ...
```

root layout โหลดฟอนต์และกำหนด `--font-sunford` ส่วน base.css เก็บสี/ระยะ/ชั้นซ้อน CSS Modules และ global CSS เรียกใช้ตัวแปรเหล่านี้ได้ ค่าที่ขึ้นต้น `--` ไม่ได้เป็น global ทุกตัว: บางตัวประกาศเฉพาะ section เช่นความกว้างการ์ดบทความ

ค่าหน้าตาบางส่วนยังเขียนเฉพาะ component อยู่ เช่นขนาดปุ่ม Hero และสีพื้นดำเฉพาะหน้าแรก ให้ตาม selector ของส่วนที่ต้องการจริงก่อนตัดสินใจแก้ค่ากลาง เพราะการแก้ base.css กระทบหลายหน้า

### ข. ข้อความ/ค่าตั้งเว็บ

```text
settings.ts: defaultHero / defaultSite / spotlightDefaults / ...
                         +
data/site/content.json: settings แถวที่ id ตรงกันและไม่ถูกลบ
                         ↓
documents.ts: getSettings(id, defaults)
                         ↓
component อ่านค่าหรือรับผ่าน props
```

`getSettings` รวมข้อมูลแบบ `{ ...defaults, ...row.data }` จึงให้ค่าที่บันทึกใน content.json ทับค่าเริ่มต้นของ field นั้น การแก้ defaults เพียงอย่างเดียวอาจไม่เปลี่ยนข้อความที่เห็น ถ้ามีค่าบันทึกทับอยู่แล้ว และ field นั้นต้องถูก component อ่านใช้ด้วย

ตัวอย่าง `ProductSpotlight` อ่าน `spotlight.title` แต่ Hero h1 ปัจจุบันใช้ข้อความตรงใน hero-scene.tsx ให้แยกสองกรณีนี้เวลาแก้ข้อความ

### ค. รูป สินค้า และปลายทาง

- [home-products.ts](../src/features/home/server/home-products.ts) อ่านสินค้าทาง Warehouse แล้วประกอบข้อมูลสำหรับข้อยกเว้นหน้าแรก/Hero ผ่าน snapshot เดิม ไม่ใช่นโยบายให้เอาข้อมูลเก่าไปเติมหน้าสินค้าภายใน
- [home-images.ts](../src/features/home/server/home-images.ts) อ่านแถว `homepage-image` จาก content.json เพื่อเตรียมรูปและเป้าหมาย; [image-slots.ts](../src/features/home/data/image-slots.ts) ระบุช่องรูปและค่าเริ่มต้น
- [brand.ts](../src/features/home/data/brand.ts) เก็บ `sunford` สำหรับลิงก์/ข้อมูลบริษัท และ `companyIntro` สำหรับคำบรรยายที่มีผู้เรียกจริง
- `public/` เก็บไฟล์สื่อ เช่น `/videos/sunford-web.mp4` หมายถึง public/videos/sunford-web.mp4 รูปจาก YouTube หรือ Warehouse storage อาจไม่ได้อยู่ใน public ทั้งหมด

### ง. พฤติกรรมที่นำกลับมาใช้

| ชิ้นส่วนร่วม    | ใช้ทำอะไรบนหน้าแรก                                                   |
| --------------- | -------------------------------------------------------------------- |
| ProductImage    | รูปปกวิดีโอ รูปหมวดสินค้า และการ์ดบางประเภท                          |
| FocusDragScroll | แถบบทความและวิดีโอท้ายหน้า                                           |
| useReturnState  | คืนสถานะเลือกหมวด รูปเรื่องแบรนด์ และการเล่นวิดีโอตามประวัติการนำทาง |
| HomeMotion      | การเคลื่อนไหวข้อความในส่วน3–7ที่ถูกหุ้มไว้ใน page.tsx                |
| catalog-store   | สถานะค้นหา/เปรียบเทียบที่ Header กับ overlays ใช้ร่วมกัน             |

[home-motion.tsx](../src/features/home/components/home-motion.tsx) และ [home-motion.module.css](../src/features/home/components/home-motion.module.css) เป็นชุดเคลื่อนไหวของหน้าแรก โดย `motionTokens` ในไฟล์เป็นค่ารวมเฉพาะชุดนี้ Hero/วิดีโอช่วง2ยังมีพฤติกรรมของตัวเอง

[price-format.ts](../src/features/catalog/data/price-format.ts) ที่เพิ่งรวมไว้เป็นส่วนกลางของหน้าสินค้า/ใบเสนอราคา/จัดสเปค ยังไม่มีผู้เรียกในชุด component หน้าแรกปัจจุบัน

## ลองอ่านเองหนึ่งรอบ

1. เปิด page.tsx ค้น `<Hero` แล้วดูว่าข้อมูลอะไรส่งเข้าไป
2. ตาม import ไป hero.tsx แล้วหา `<HeroScene` จะเห็นว่ามันส่ง description, logo และ showAnnouncement ต่อ
3. เปิด hero-scene.tsx ค้น “สำหรับธุรกิจของคุณ” จะพบหัวเรื่องที่เห็นบนเว็บ
4. ดู `className={styles.cta}` ของปุ่ม แล้วเปิด hero-scene.module.css ค้น `.cta`
5. ที่ `.cta` จะเห็น `background: var(--red)` ตามไป base.css ค้น `--red` จะเจอต้นทางสี
6. กลับ page.tsx แล้วตาม component ถัดไปตามหมายเลข โดยใช้คำบนหน้าเว็บเป็นจุดสังเกต

รอบอ่านนี้ไม่ต้องแก้ไฟล์ ก็เห็นเส้นทางครบว่า **หน้าแม่เรียกชิ้นส่วน → ชิ้นส่วนอ่านข้อมูล/props → class เชื่อมกับ CSS → CSS บางค่าดึงจากตัวแปรกลาง**
