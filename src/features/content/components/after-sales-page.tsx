"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  CalendarClock,
  ChevronRight,
  ExternalLink,
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
import { useRef, useSyncExternalStore, type KeyboardEvent } from "react";
import { sunford } from "@/features/home/data/brand";
import { useReturnState } from "@/features/site/history/return-state";
import { afterSalesContact, afterSalesServices, type AfterSalesService } from "../data/after-sales";
import styles from "./after-sales-page.module.css";

const serviceIcons = [Wrench, PackageOpen, ShieldCheck, RotateCcw, PackageCheck];

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

const subscribeHydration = () => () => {};
const readHydration = () => true;
const serverHydration = () => false;

function ServiceInstructions({ service, index }: { service: AfterSalesService; index: number }) {
  const Icon = serviceIcons[index];

  return (
    <article className={styles.instructions}>
      <header className={styles.panelHeading}>
        <span className={styles.panelIcon}>
          <Icon size={24} aria-hidden="true" />
        </span>
        <div>
          <h2>{service.title}</h2>
          <p>{service.steps.length} ขั้นตอน</p>
        </div>
      </header>

      <ol className={styles.steps} role="list">
        {service.steps.map((step, stepIndex) => (
          <li key={step}>
            <span className={styles.stepNumber} aria-hidden="true">
              {stepIndex + 1}
            </span>
            <div>
              <h3>{stepHeadings[service.id][stepIndex]}</h3>
              <p>{step}</p>
            </div>
          </li>
        ))}
      </ol>

      {(service.extra || service.notes) && (
        <div className={styles.details}>
          {service.extra && (
            <section className={styles.extra}>
              <h3>{service.extra.title}</h3>
              <ul>
                {service.extra.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </section>
          )}
          {service.notes && (
            <aside className={styles.note} aria-label="หมายเหตุการรับบริการ">
              <Info size={18} aria-hidden="true" />
              <div>
                <h3>ข้อควรทราบ</h3>
                {service.notes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </aside>
          )}
        </div>
      )}
    </article>
  );
}

function ServiceContact({ pickup = false }: { pickup?: boolean }) {
  return (
    <aside className={styles.sidebar} aria-label="ที่อยู่และช่องทางติดต่อฝ่ายบริการ">
      <div className={styles.contactCard}>
        <header className={styles.contactHeading}>
          <div>
            <h2>{afterSalesContact.title}</h2>
            <p>
              <CalendarClock size={15} aria-hidden="true" />
              {afterSalesContact.hours}
            </p>
          </div>
          <Image
            className={styles.contactPhoto}
            src="/images/contact/support-representative.webp"
            width={108}
            height={108}
            alt=""
          />
        </header>
        <div className={styles.phoneList}>
          {afterSalesContact.phones.map((phone) => (
            <a href={phone.href} key={phone.href}>
              <Phone size={17} aria-hidden="true" />
              {phone.label}
            </a>
          ))}
        </div>
        <a className={styles.lineButton} href={sunford.line} target="_blank" rel="noreferrer">
          <Image src="/images/brands/line-brand-icon.png" width={22} height={22} alt="" />
          LINE @sunford
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </div>
      <div className={styles.addressCard}>
        <h3>
          <MapPin size={18} aria-hidden="true" />
          {afterSalesContact.factoryTitle}
        </h3>
        <address>
          {afterSalesContact.address.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </address>
        {pickup && (
          <p className={styles.appointment}>
            กรุณานัดหมายกับแอดมินทาง LINE ก่อนเดินทางมารับสินค้า
            <span>{afterSalesContact.break}</span>
          </p>
        )}
      </div>
    </aside>
  );
}

export function AfterSalesPage() {
  const [selected, setSelected] = useReturnState("after-sales-page.selected", 0);
  const interactive = useSyncExternalStore(subscribeHydration, readHydration, serverHydration);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % afterSalesServices.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + afterSalesServices.length) % afterSalesServices.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = afterSalesServices.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }

  return (
    <main id="main-content" className={styles.page} data-page-surface="paper">
      <div className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <nav className={styles.breadcrumb} aria-label="เส้นทางนำทาง">
              <Link href="/">หน้าแรก</Link>
              <ChevronRight size={13} aria-hidden="true" />
              <span aria-current="page">บริการหลังการขาย</span>
            </nav>
            <h1>เลือกบริการที่คุณต้องการ</h1>
          </div>
          <div className={styles.quickLinks}>
            <a href={sunford.line} target="_blank" rel="noreferrer">
              <MessageCircle size={17} aria-hidden="true" />
              สอบถามทาง LINE
            </a>
            <a href="#service-policies">
              เงื่อนไขบริการ
              <ArrowDown size={15} aria-hidden="true" />
            </a>
          </div>
        </header>

        {interactive ? (
          <div className={styles.tabs} role="tablist" aria-label="ประเภทบริการหลังการขาย">
            {afterSalesServices.map((service, index) => {
              const Icon = serviceIcons[index];
              const active = selected === index;
              return (
                <button
                  key={service.id}
                  ref={(element) => {
                    tabs.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`service-tab-${service.id}`}
                  aria-controls={`service-panel-${service.id}`}
                  aria-selected={active}
                  aria-label={`${index + 1}. ${service.name}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setSelected(index)}
                  onKeyDown={(event) => handleTabKey(event, index)}
                >
                  <Icon size={19} aria-hidden="true" />
                  {service.name}
                </button>
              );
            })}
          </div>
        ) : (
          <nav className={styles.tabs} aria-label="ประเภทบริการหลังการขาย">
            {afterSalesServices.map((service, index) => {
              const Icon = serviceIcons[index];
              return (
                <a key={service.id} href={`#service-panel-${service.id}`}>
                  <Icon size={19} aria-hidden="true" />
                  {service.name}
                </a>
              );
            })}
          </nav>
        )}

        <div className={interactive ? styles.workspace : styles.staticWorkspace}>
          {afterSalesServices.map((service, index) => {
            const hidden = interactive && selected !== index;
            return (
              <div
                className={styles.panel}
                key={service.id}
                id={`service-panel-${service.id}`}
                role={interactive ? "tabpanel" : undefined}
                aria-labelledby={interactive ? `service-tab-${service.id}` : undefined}
                hidden={hidden}
                tabIndex={interactive && !hidden ? 0 : undefined}
              >
                {!hidden && (
                  <div className={interactive ? styles.serviceLayout : undefined}>
                    <ServiceInstructions service={service} index={index} />
                    {interactive && <ServiceContact pickup={service.id === "pickup"} />}
                  </div>
                )}
              </div>
            );
          })}
          {!interactive && <ServiceContact />}
        </div>

        <nav id="service-policies" className={styles.policies} aria-label="ข้อมูลที่เกี่ยวข้อง">
          <span>
            <ShieldCheck size={18} aria-hidden="true" />
            ข้อมูลที่เกี่ยวข้อง
          </span>
          <Link href={sunford.warrantyPolicy}>นโยบายการรับประกัน</Link>
          <Link href="/cancel-and-return/policy">เงื่อนไขการเปลี่ยนและคืนสินค้า</Link>
          <a href={afterSalesContact.sourceUrl} target="_blank" rel="noreferrer">
            ข้อมูลต้นฉบับจากซันฟอร์ด <ExternalLink size={14} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </main>
  );
}
