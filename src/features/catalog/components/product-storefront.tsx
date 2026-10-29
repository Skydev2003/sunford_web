"use client";
import { Tooltip } from "@/components/ui/tooltip";
import { useCategories } from "@/features/cms/components/categories-provider";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  GitCompareArrows,
  Headphones,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { ProductImage } from "@/components/ui/product-image";
import { useCatalogStore } from "@/stores/catalog-store";
import { categories as originalCategories, type CategoryId, type Product } from "../types";
import { ProductCatalog } from "./product-catalog";
import { StoreShelf } from "./store-shelf";

const cleanImages: Record<string, string> = {
  wps10ks: "/images/products/wps10ks.png",
  "acs30-jc21": "/images/products/acs30-jc21.jpg",
  rls1100: "/images/products/rls1100.png",
  feh5ks: "/images/products/feh5ks.png",
  tis150: "/images/products/tis150.jpg",
  pos1100: "/images/imported/cd0ca1b1030bad841351.png",
  "sunford-10664": "/images/imported/4ccdd4c586848b93070f.png",
  "sunford-10730": "/images/imported/994b2e6b5da587e1de73.png",
};

function StoreProductCard({
  product,
  compact = false,
  dark = false,
}: {
  product: Product;
  compact?: boolean;
  dark?: boolean;
}) {
  const categories = useCategories();
  const ids = useCatalogStore((state) => state.compareIds);
  const toggleCompare = useCatalogStore((state) => state.toggleCompare);
  const selected = ids.includes(product.id);
  const category = categories.find((item) => item.id === product.category);
  return (
    <article
      className={`store-product-card ${compact ? "is-compact" : ""} ${dark ? "is-dark" : ""}`}
    >
      <Link href={`/products/${product.slug}`} className="store-product-link">
        <div className="store-product-copy">
          <p className="store-card-eyebrow">{product.badge ?? category?.label}</p>
          <h3>{product.name}</h3>
          {!compact && <p className="store-product-subtitle">{product.subtitle}</p>}
          <p className="store-product-meta">
            {product.price
              ? new Intl.NumberFormat("th-TH", {
                  style: "currency",
                  currency: "THB",
                  maximumFractionDigits: 0,
                }).format(product.price)
              : product.capacity !== "—"
                ? `พิกัด ${product.capacity}`
                : "ดูรายละเอียดผลิตภัณฑ์"}
          </p>
        </div>
        <div className="store-product-image">
          <ProductImage
            src={product.image}
            alt={`SUNFORD ${product.name}`}
            fill
            sizes={compact ? "(max-width: 720px) 75vw, 280px" : "(max-width: 720px) 85vw, 400px"}
          />
        </div>
      </Link>
      <Tooltip>
        <button
          className={`store-compare ${selected ? "is-selected" : ""}`}
          aria-label={`${selected ? "นำออกจาก" : "เพิ่มเพื่อ"}เปรียบเทียบ ${product.name}`}
          aria-pressed={selected}
          disabled={!selected && ids.length >= 3}
          onClick={() => toggleCompare(product.id)}
        >
          {selected ? <Check size={17} /> : <Plus size={17} />}
        </button>
      </Tooltip>
    </article>
  );
}

export function ProductStorefront({
  products,
  contactImage,
  softwareImage,
}: {
  products: Product[];
  contactImage?: string;
  softwareImage?: string;
}) {
  const categories = useCategories();
  const [showAll, setShowAll] = useState(false);
  const category = useCatalogStore((state) => state.category);
  const query = useCatalogStore((state) => state.query);
  const setCategory = useCatalogStore((state) => state.setCategory);
  const setQuery = useCatalogStore((state) => state.setQuery);
  const storeProducts = products.map((product) => ({
    ...product,
    image: product.imageOverridden ? product.image : (cleanImages[product.id] ?? product.image),
  }));
  const browse = showAll || category !== "all" || Boolean(query.trim());
  const featured = ["rls1100", "wps10ks", "feh5ks", "tis150", "pos1100", "acs30-jc21"].flatMap(
    (id) => storeProducts.filter((product) => product.id === id),
  );
  const accessories = storeProducts
    .filter((product) => product.category === "accessories")
    .slice(0, 10);
  const representatives: Record<string, string> = {
    commercial: "acs30-jc21",
    industrial: "tis150",
    food: "wps10ks",
    smart: "rls1100",
    pos: "pos1100",
    laboratory: "sunford-10664",
    accessories: "sunford-10730",
    lifestyle: "sunford-10624",
  };
  const labels: Record<string, string> = {
    commercial: "เครื่องชั่งพาณิชย์",
    industrial: "อุตสาหกรรม",
    food: "อาหารและเบเกอรี่",
    smart: "เครื่องชั่งอัจฉริยะ",
    pos: "ระบบ POS",
    laboratory: "ห้องปฏิบัติการ",
    accessories: "อุปกรณ์เสริม",
    lifestyle: "ไลฟ์สไตล์",
  };
  const openCatalogue = (selected: CategoryId = "all") => {
    setCategory(selected);
    setQuery("");
    setShowAll(true);
    requestAnimationFrame(() =>
      document.getElementById("products")?.scrollIntoView({ block: "start" }),
    );
  };
  const reset = () => {
    setCategory("all");
    setQuery("");
    setShowAll(false);
  };
  return (
    <main id="main-content" className="storefront">
      <header className="store-hero">
        <h1>ผลิตภัณฑ์ของเรา</h1>
        <div className="store-hero-help">
          <p>
            เครื่องชั่งที่ใช่
            <br />
            สำหรับทุกธุรกิจของคุณ
          </p>
          <a href="https://line.me/R/ti/p/@sunford" target="_blank" rel="noreferrer">
            ให้ผู้เชี่ยวชาญช่วยเลือก <ArrowUpRight size={14} />
          </a>
          <Link href="/contact-us">
            ติดต่อศูนย์บริการ Sunford <ArrowUpRight size={14} />
          </Link>
        </div>
      </header>
      <StoreShelf id="store-categories" className="store-category-shelf">
        {categories.slice(1).map((item) => {
          const product =
            storeProducts.find((product) => product.id === representatives[item.id]) ??
            storeProducts.find((product) => product.category === item.id);
          return (
            <button
              key={item.id}
              className={`store-category ${category === item.id ? "is-active" : ""}`}
              aria-label={`เลือกหมวด ${item.label}`}
              aria-pressed={category === item.id}
              onClick={() => openCatalogue(item.id)}
            >
              <div className="store-category-image">
                <ProductImage src={product?.image} alt={item.label} fill sizes="120px" />
              </div>
              <span>
                {originalCategories.find((original) => original.id === item.id)?.label ===
                item.label
                  ? (labels[item.id] ?? item.label)
                  : item.label}
              </span>
            </button>
          );
        })}
      </StoreShelf>
      {browse ? (
        <div className="store-browse">
          <div className="store-browse-heading">
            <button className="text-link" onClick={reset}>
              กลับไปหน้าแนะนำผลิตภัณฑ์ <ChevronRight size={16} />
            </button>
          </div>
          <ProductCatalog products={storeProducts} full headingLevel="h2" />
        </div>
      ) : (
        <>
          <StoreShelf
            id="store-featured"
            title="สินค้าแนะนำของเรา."
            subtitle="ค้นพบความแม่นยำที่เหมาะกับคุณ"
          >
            {featured.map((product) => (
              <StoreProductCard
                product={product}
                key={product.id}
                dark={product.id === "wps10ks"}
              />
            ))}
          </StoreShelf>
          <StoreShelf
            id="store-accessories"
            title="อุปกรณ์เสริม."
            subtitle="เติมเต็มทุกการใช้งานให้ลงตัว"
          >
            <Link
              href="/product/scale-accessories"
              className="store-editorial-card store-accessory-intro"
            >
              <p className="store-card-eyebrow">SUNFORD ACCESSORIES</p>
              <h3>
                เชื่อมต่องานชั่ง
                <br />
                ให้ไปได้ไกลกว่าเดิม.
              </h3>
              <div className="store-editorial-image">
                <ProductImage
                  src={accessories[0]?.image}
                  alt="อุปกรณ์ประกอบเครื่องชั่ง Sunford"
                  fill
                  sizes="320px"
                />
              </div>
              <span className="store-card-link">
                สำรวจอุปกรณ์เสริม <ChevronRight size={16} />
              </span>
            </Link>
            {accessories.map((product) => (
              <StoreProductCard product={product} compact key={product.id} />
            ))}
          </StoreShelf>
          <StoreShelf
            id="store-assistance"
            title="ความช่วยเหลืออยู่ที่นี่."
            subtitle="ให้เราช่วยคุณเลือกสิ่งที่ใช่"
          >
            <Link href="/contact-us" className="store-editorial-card store-support-photo">
              <ProductImage
                src={contactImage}
                alt="บริการและคำปรึกษาจาก Sunford"
                fill
                sizes="(max-width: 720px) 85vw, 480px"
              />
              <div>
                <p className="store-card-eyebrow">SUNFORD SPECIALIST</p>
                <h3>
                  คุยกับผู้เชี่ยวชาญ
                  <br />
                  เลือกเครื่องชั่งให้ตรงกับงาน.
                </h3>
                <span className="store-card-link">
                  ติดต่อเรา <ArrowUpRight size={16} />
                </span>
              </div>
            </Link>
            <Link href="/warranty/register" className="store-editorial-card">
              <p className="store-card-eyebrow">การรับประกันสินค้า</p>
              <h3>
                มั่นใจได้มากกว่า
                <br />
                ด้วยการดูแลจาก Sunford.
              </h3>
              <div className="store-editorial-image">
                <ProductImage alt="การลงทะเบียนรับประกัน Sunford" fill sizes="400px" />
              </div>
              <span className="store-card-link">
                ลงทะเบียนรับประกัน <ChevronRight size={16} />
              </span>
            </Link>
            <Link href="/technical-specification" className="store-editorial-card">
              <p className="store-card-eyebrow">บริการและการสนับสนุน</p>
              <h3>
                รู้จักเครื่องชั่งของคุณ
                <br />
                ในทุกรายละเอียด.
              </h3>
              <div className="store-editorial-image">
                <ProductImage alt="คู่มือและข้อมูลทางเทคนิค" fill sizes="400px" />
              </div>
              <span className="store-card-link">
                ข้อมูลทางเทคนิค <ChevronRight size={16} />
              </span>
            </Link>
          </StoreShelf>
          <StoreShelf
            id="store-benefits"
            title="เลือก Sunford."
            subtitle="พร้อมเคียงข้างทุกธุรกิจ"
            className="store-benefits-shelf"
          >
            <Link href="/contact-us" className="store-benefit">
              <Truck size={36} strokeWidth={1.5} />
              <h3>
                <span>จัดส่งถึงคุณ.</span>
                <br />
                ครอบคลุมทั่วประเทศไทย
              </h3>
            </Link>
            <Link href="/contact-us" className="store-benefit">
              <Headphones size={36} strokeWidth={1.5} />
              <h3>
                <span>ปรึกษาผู้เชี่ยวชาญ.</span>
                <br />
                เลือกให้ตรงกับงานของคุณ
              </h3>
            </Link>
            <Link href="/warranty/policy" className="store-benefit">
              <ShieldCheck size={36} strokeWidth={1.5} />
              <h3>
                <span>ดูแลหลังการขาย.</span>
                <br />
                พร้อมข้อมูลการรับประกัน
              </h3>
            </Link>
            <button className="store-benefit" onClick={() => openCatalogue()}>
              <GitCompareArrows size={36} strokeWidth={1.5} />
              <h3>
                <span>เปรียบเทียบก่อนเลือก.</span>
                <br />
                ดูรายละเอียดได้สูงสุด 3 รุ่น
              </h3>
            </button>
          </StoreShelf>
          <StoreShelf
            id="store-solutions"
            title="ประสบการณ์แบบ Sunford."
            subtitle="มากกว่าการชั่งน้ำหนัก"
          >
            <Link
              href="/applications-and-softwares"
              className="store-editorial-card store-solution-card"
            >
              <p className="store-card-eyebrow">แอปพลิเคชันและซอฟต์แวร์</p>
              <h3>
                เชื่อมต่อข้อมูล.
                <br />
                ให้ทุกขั้นตอนทำงานด้วยกัน.
              </h3>
              <div className="store-editorial-image">
                <ProductImage
                  src={softwareImage}
                  alt="แอปพลิเคชันและซอฟต์แวร์ Sunford"
                  fill
                  sizes="480px"
                />
              </div>
            </Link>
            <Link href="/Product/POS" className="store-editorial-card store-solution-card">
              <p className="store-card-eyebrow">SUNFORD POS</p>
              <h3>
                จากงานชั่ง
                <br />
                สู่การขายที่เป็นระบบ.
              </h3>
              <div className="store-editorial-image">
                <ProductImage
                  src={cleanImages.pos1100}
                  alt="เครื่องชั่งระบบ POS Sunford"
                  fill
                  sizes="480px"
                />
              </div>
            </Link>
            <Link href="/news-and-activities" className="store-editorial-card store-solution-card">
              <p className="store-card-eyebrow">SUNFORD STORIES</p>
              <h3>
                เรื่องราวของผู้ประกอบการ.
                <br />
                แรงบันดาลใจที่เติบโตไปด้วยกัน.
              </h3>
              <div className="store-editorial-image store-story-photo">
                <ProductImage
                  src="/images/business-story.png"
                  alt="เรื่องราวผู้ประกอบการกับ Sunford"
                  fill
                  sizes="480px"
                />
              </div>
            </Link>
          </StoreShelf>
          <section className="store-quick-links">
            <h2>ลิงก์ด่วน</h2>
            <div>
              <button onClick={() => openCatalogue()}>ผลิตภัณฑ์ทั้งหมด</button>
              <Link href="/contact-us">ติดต่อเรา</Link>
              <Link href="/software/download">ดาวน์โหลดซอฟต์แวร์</Link>
              <Link href="/warranty/register">ลงทะเบียนรับประกัน</Link>
              <Link href="/cancel-and-return/policy">การคืนสินค้า</Link>
              <Link href="/explore">สำรวจ Sunford</Link>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
