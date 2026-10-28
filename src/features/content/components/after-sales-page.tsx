"use client";

import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Info,
  MapPin,
  MessageCircle,
  PackageCheck,
  PackageOpen,
  Phone,
  RotateCcw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { sunford } from "@/features/home/data/brand";
import { afterSalesContact, afterSalesServices } from "../data/after-sales";
import styles from "./after-sales-page.module.css";

const serviceIcons = [Wrench, PackageOpen, ShieldCheck, RotateCcw, PackageCheck];

export function AfterSalesPage() {
  const [selected, setSelected] = useState(0);
  const [copyStatus, setCopyStatus] = useState("");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const service = afterSalesServices[selected];
  const isPickup = service.id === "pickup";
  const Icon = serviceIcons[selected];

  function selectTab(index: number) {
    setSelected(index);
    setCopyStatus("");
  }

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % afterSalesServices.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + afterSalesServices.length) % afterSalesServices.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = afterSalesServices.length - 1;
    else return;
    event.preventDefault();
    selectTab(next);
    tabs.current[next]?.focus();
  }

  async function copyAddress() {
    const title = isPickup ? afterSalesContact.factoryTitle : afterSalesContact.title;
    try {
      await navigator.clipboard.writeText(`${title}\n${afterSalesContact.address.join("\n")}`);
      setCopyStatus("คัดลอกที่อยู่แล้ว");
    } catch {
      setCopyStatus("คัดลอกไม่สำเร็จ กรุณาเลือกข้อความที่อยู่เพื่อคัดลอก");
    }
  }

  return (
    <main id="main-content" className={styles.page}>
      <div className="container">
        <nav className={styles.breadcrumb} aria-label="เส้นทางนำทาง">
          <Link href="/">หน้าแรก</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page">บริการหลังการขาย</span>
        </nav>

        <header className={styles.hero}>
          <div>
            <p className={`eyebrow ${styles.eyebrow}`}>SUNFORD SERVICE & CARE</p>
            <h1>บริการหลังการขาย</h1>
            <p className={styles.subtitle}>ดูแลต่อเนื่อง เพื่อทุกการใช้งานของคุณ</p>
            <p className={styles.description}>
              รวมขั้นตอนการส่งซ่อม เปลี่ยน เคลม คืนสินค้า และรับสินค้าที่โรงงาน
              <br />
              เลือกบริการที่ต้องการ แล้วเตรียมสินค้าได้ตามขั้นตอนด้านล่าง
            </p>
          </div>
          <div className={styles.heroMark} aria-hidden="true">
            <span className={styles.heroRing} />
            <ShieldCheck size={58} strokeWidth={1.2} />
            <span className={styles.heroBadge}>
              <Check size={18} strokeWidth={2.5} />
            </span>
          </div>
        </header>
      </div>

      <section className={styles.workspace} aria-label="ขั้นตอนบริการหลังการขาย">
        <div className="container">
          <div className={styles.sectionLabel}>
            <h2>เลือกบริการที่คุณต้องการ</h2>
            <span>5 บริการจากทีมซันฟอร์ด</span>
          </div>
          <div className={styles.tabs} role="tablist" aria-label="ประเภทบริการหลังการขาย">
            {afterSalesServices.map((item, index) => {
              const TabIcon = serviceIcons[index];
              return (
                <button
                  key={item.id}
                  ref={(element) => {
                    tabs.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`service-tab-${item.id}`}
                  aria-controls={`service-panel-${item.id}`}
                  aria-selected={selected === index}
                  tabIndex={selected === index ? 0 : -1}
                  onClick={() => selectTab(index)}
                  onKeyDown={(event) => handleTabKey(event, index)}
                >
                  <TabIcon size={21} strokeWidth={1.6} aria-hidden="true" />
                  <span>
                    {index + 1}. {item.name}
                  </span>
                  <ArrowRight size={15} className={styles.tabArrow} aria-hidden="true" />
                </button>
              );
            })}
          </div>

          {afterSalesServices.map((item, index) => (
            <div
              key={item.id}
              id={`service-panel-${item.id}`}
              role="tabpanel"
              aria-labelledby={`service-tab-${item.id}`}
              hidden={selected !== index}
              tabIndex={0}
            >
              {selected === index && (
                <div className={styles.serviceLayout}>
                  <article className={styles.instructions}>
                    <header className={styles.panelHeading}>
                      <span className={styles.panelIcon}>
                        <Icon size={23} aria-hidden="true" />
                      </span>
                      <div>
                        <p className={styles.panelEyebrow}>เตรียมพร้อมก่อนรับบริการ</p>
                        <h2>{service.title}</h2>
                      </div>
                      <span className={styles.stepCount}>{service.steps.length} ขั้นตอน</span>
                    </header>
                    <ol className={styles.steps}>
                      {service.steps.map((step, stepIndex) => (
                        <li key={step}>
                          <span className={styles.stepNumber} aria-hidden="true">
                            {stepIndex + 1}
                          </span>
                          <p>{step}</p>
                        </li>
                      ))}
                    </ol>
                    {service.extra && (
                      <section className={styles.extra}>
                        <h3>
                          <PackageCheck size={19} aria-hidden="true" />
                          {service.extra.title}
                        </h3>
                        <ul>
                          {service.extra.steps.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ul>
                      </section>
                    )}
                    {service.notes && (
                      <aside className={styles.note} aria-label="หมายเหตุการรับบริการ">
                        <Info size={19} aria-hidden="true" />
                        <div>
                          <h3>ข้อควรทราบ</h3>
                          {service.notes.map((note) => (
                            <p key={note}>{note}</p>
                          ))}
                        </div>
                      </aside>
                    )}
                    <div className={styles.instructionsFooter}>
                      <MessageCircle size={17} aria-hidden="true" />
                      <p>ต้องการคำแนะนำเพิ่มเติม?</p>
                      <a href={sunford.line} target="_blank" rel="noreferrer">
                        คุยกับเจ้าหน้าที่ <ArrowUpRight size={14} aria-hidden="true" />
                      </a>
                    </div>
                  </article>

                  <aside className={styles.sidebar} aria-label="ที่อยู่และช่องทางติดต่อฝ่ายบริการ">
                    <div className={styles.contactCard}>
                      <p className={styles.cardEyebrow}>
                        {isPickup ? (
                          <MapPin size={16} aria-hidden="true" />
                        ) : (
                          <ArrowDownLeft size={16} aria-hidden="true" />
                        )}
                        {isPickup ? "สถานที่รับสินค้า" : "ที่อยู่สำหรับส่งสินค้า"}
                      </p>
                      <h2>{isPickup ? afterSalesContact.factoryTitle : afterSalesContact.title}</h2>
                      <address>
                        {afterSalesContact.address.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </address>
                      <button className={styles.copyButton} type="button" onClick={copyAddress}>
                        {copyStatus === "คัดลอกที่อยู่แล้ว" ? (
                          <Check size={15} aria-hidden="true" />
                        ) : (
                          <Copy size={15} aria-hidden="true" />
                        )}
                        {copyStatus === "คัดลอกที่อยู่แล้ว" ? copyStatus : "คัดลอกที่อยู่"}
                      </button>
                      <p className={styles.copyStatus} role="status">
                        {copyStatus}
                      </p>
                      <div className={styles.phoneList}>
                        <p>ติดต่อฝ่ายบริการ</p>
                        {afterSalesContact.phones.map((phone) => (
                          <a href={phone.href} key={phone.href}>
                            <Phone size={16} aria-hidden="true" />
                            {phone.label}
                            <ArrowUpRight size={14} aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                      <a
                        className={styles.lineButton}
                        href={sunford.line}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle size={19} aria-hidden="true" />
                        LINE @sunford
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </a>
                    </div>
                    <div className={styles.hours}>
                      <Clock3 size={19} aria-hidden="true" />
                      <div>
                        <h3>เวลาทำการ</h3>
                        <p>{afterSalesContact.hours}</p>
                        {isPickup && <p className={styles.breakTime}>{afterSalesContact.break}</p>}
                      </div>
                    </div>
                    {isPickup && (
                      <div className={styles.appointment}>
                        <CalendarClock size={19} aria-hidden="true" />
                        <p>กรุณานัดหมายกับแอดมินทาง LINE ก่อนเดินทางมารับสินค้า</p>
                      </div>
                    )}
                  </aside>
                </div>
              )}
            </div>
          ))}

          <div className={styles.policies}>
            <span>
              <ShieldCheck size={17} aria-hidden="true" />
              ข้อมูลที่เกี่ยวข้อง
            </span>
            <Link href={sunford.warrantyPolicy}>
              นโยบายการรับประกัน <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
            <Link href="/cancel-and-return/policy">
              เงื่อนไขการเปลี่ยนและคืนสินค้า <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
            <a href={afterSalesContact.sourceUrl} target="_blank" rel="noreferrer">
              ข้อมูลต้นฉบับจากซันฟอร์ด <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
