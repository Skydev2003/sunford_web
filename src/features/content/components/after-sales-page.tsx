"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  Info,
  Headset,
  PackageCheck,
  PackageOpen,
  Phone,
  Smartphone,
  RotateCcw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { sunford } from "@/features/home/data/brand";
import { afterSalesContact, afterSalesServices } from "../data/after-sales";
import styles from "./after-sales-page.module.css";

const serviceIcons = [Wrench, PackageOpen, ShieldCheck, RotateCcw, PackageCheck];
const serviceDescriptions = [
  "เตรียมเครื่องเข้ารับบริการ",
  "ขั้นตอนการเปลี่ยนรุ่น",
  "ขั้นตอนการส่งเคลม",
  "เตรียมสินค้าและเอกสาร",
  "นัดหมายก่อนเข้ารับสินค้า",
];
const stepHeadings: Record<string, string[]> = {
  repair: [
    "เตรียมตัวเครื่อง",
    "ทำความสะอาดก่อนส่ง",
    "ห่อหุ้มให้เรียบร้อย",
    "ระบุข้อมูลผู้ส่ง",
    "จัดส่งและแจ้งเจ้าหน้าที่",
    "รับบริการซ่อมบำรุง",
  ],
  exchange: [
    "ตรวจสอบสินค้าและเอกสาร",
    "ห่อกล่องสินค้าอีกชั้น",
    "ระบุรายการที่ต้องการ",
    "จัดส่งสินค้า",
    "รอเจ้าหน้าที่ติดต่อกลับ",
  ],
  claim: [
    "เตรียมสินค้าสำหรับเคลม",
    "ระบุข้อมูลให้ชัดเจน",
    "จัดส่งและแจ้งสลิปค่าส่ง",
    "รับบริการเคลมสินค้า",
  ],
  return: [
    "ตรวจสอบสินค้าและเอกสาร",
    "ห่อกล่องสินค้าอีกชั้น",
    "ระบุรายการที่ต้องการ",
    "จัดส่งสินค้า",
    "รอเจ้าหน้าที่ติดต่อกลับ",
  ],
  pickup: [
    "ทำคำสั่งซื้อให้เรียบร้อย",
    "นัดหมายกับแอดมิน",
    "แจ้งข้อมูลเมื่อมาถึง",
    "ชำระเงินและรับสินค้า",
  ],
};

export function AfterSalesPage() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const service = afterSalesServices[selected];
  const isPickup = service.id === "pickup";
  const Icon = serviceIcons[selected];

  function selectTab(index: number) {
    setSelected(index);
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

  return (
    <main id="main-content" className={styles.page} data-page-surface="paper">
      <div className="container">
        <nav className={styles.breadcrumb} aria-label="เส้นทางนำทาง">
          <Link href="/">หน้าแรก</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page">บริการหลังการขาย</span>
        </nav>

        <header className={styles.hero}>
          <div>
            <h1>เลือกบริการที่คุณต้องการ</h1>
            <p className={styles.description}>
              ขั้นตอนการรับบริการ เพื่อให้เราดูแลคุณได้ตลอดการใช้งาน
            </p>
          </div>
          <a className={styles.helpLink} href={sunford.line} target="_blank" rel="noreferrer">
            <CircleHelp size={17} aria-hidden="true" />
            มีคำถาม? ดูคำแนะนำการใช้งาน
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </header>
      </div>

      <section className={styles.workspace} aria-label="ขั้นตอนบริการหลังการขาย">
        <div className="container">
          <div className={styles.tabs} role="tablist" aria-label="ประเภทบริการหลังการขาย">
            {afterSalesServices.map((item, index) => {
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
                  aria-label={`${index + 1}. ${item.name}`}
                  tabIndex={selected === index ? 0 : -1}
                  onClick={() => selectTab(index)}
                  onKeyDown={(event) => handleTabKey(event, index)}
                >
                  <span className={styles.tabCopy} aria-hidden="true">
                    <strong>
                      {index + 1}. {item.name}
                    </strong>
                    <span>{serviceDescriptions[index]}</span>
                  </span>
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
                        <Icon size={31} strokeWidth={1.6} aria-hidden="true" />
                      </span>
                      <div>
                        <p className={styles.panelEyebrow}>
                          {service.name} · {service.steps.length} ขั้นตอน
                        </p>
                        <h2>{service.title}</h2>
                        <p className={styles.panelDescription}>
                          ตรวจสอบรายละเอียดให้พร้อมก่อน{isPickup ? "เข้ารับสินค้า" : "จัดส่งสินค้า"}
                        </p>
                      </div>
                    </header>
                    <ol className={styles.steps}>
                      {service.steps.map((step, stepIndex) => (
                        <li key={step}>
                          <div className={styles.stepCopy}>
                            <span className={styles.stepNumber} aria-hidden="true">
                              {stepIndex + 1}
                            </span>
                            <h3>{stepHeadings[service.id][stepIndex]}</h3>
                            <p>{step}</p>
                          </div>
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
                      <CircleHelp size={16} aria-hidden="true" />
                      <p>ไม่แน่ใจว่าต้องเตรียมอะไรบ้าง?</p>
                      <a href={sunford.line} target="_blank" rel="noreferrer">
                        ปรึกษาเจ้าหน้าที่ <ChevronRight size={15} aria-hidden="true" />
                      </a>
                    </div>
                  </article>

                  <aside className={styles.sidebar} aria-label="ที่อยู่และช่องทางติดต่อฝ่ายบริการ">
                    <div className={styles.contactCard}>
                      <header className={styles.contactHeading}>
                        <span className={styles.contactIcon}>
                          <Headset size={25} strokeWidth={2.3} aria-hidden="true" />
                        </span>
                        <div>
                          <p className={styles.cardEyebrow}>CONTACT US</p>
                          <h2>{afterSalesContact.title}</h2>
                        </div>
                      </header>
                      <p className={styles.contactDescription}>
                        เราพร้อมดูแล ให้คำแนะนำ
                        <br />
                        และช่วยเหลือคุณทุกวัน
                      </p>
                      <div className={styles.phoneList}>
                        {afterSalesContact.phones.map((phone, phoneIndex) => (
                          <a href={phone.href} key={phone.href} aria-label={phone.label}>
                            <span className={styles.phoneIcon}>
                              {phoneIndex === 0 ? (
                                <Phone
                                  size={20}
                                  fill="currentColor"
                                  strokeWidth={1.5}
                                  aria-hidden="true"
                                />
                              ) : (
                                <Smartphone size={22} strokeWidth={1.7} aria-hidden="true" />
                              )}
                            </span>
                            <span className={styles.phoneCopy}>
                              <strong>{phone.label}</strong>
                              <span>{afterSalesContact.hours}</span>
                            </span>
                            <ChevronRight size={17} aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                      <a
                        className={styles.lineButton}
                        href={sunford.line}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Image
                          src="/images/brands/line-brand-icon.png"
                          width={24}
                          height={24}
                          alt=""
                        />
                        LINE @sunford
                        <ExternalLink size={17} aria-hidden="true" />
                      </a>
                    </div>
                    <div className={styles.addressCard}>
                      <h3>{afterSalesContact.factoryTitle}</h3>
                      <address>
                        {afterSalesContact.address.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </address>
                      <p className={styles.addressPhones}>
                        โทร{" "}
                        {afterSalesContact.phones.map((phone, phoneIndex) => (
                          <span key={phone.href}>
                            {phoneIndex > 0 && " , "}
                            <a href={phone.href}>{phone.label}</a>
                          </span>
                        ))}
                      </p>
                    </div>
                    {isPickup && (
                      <div className={styles.appointment}>
                        <CalendarClock size={19} aria-hidden="true" />
                        <p>
                          กรุณานัดหมายกับแอดมินทาง LINE ก่อนเดินทางมารับสินค้า
                          <span className={styles.breakTime}>{afterSalesContact.break}</span>
                        </p>
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
