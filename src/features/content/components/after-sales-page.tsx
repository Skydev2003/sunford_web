"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MapPin,
  PackageCheck,
  PackageOpen,
  Phone,
  RotateCcw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useLayoutEffect, useRef, useSyncExternalStore, type KeyboardEvent } from "react";
import { sunford } from "@/features/home/data/brand";
import { useReturnState } from "@/features/site/history/return-state";
import { afterSalesContact, afterSalesServices, type AfterSalesService } from "../data/after-sales";
import styles from "./after-sales-page.module.css";

const serviceIcons = [Wrench, PackageOpen, ShieldCheck, RotateCcw, PackageCheck];

const subscribeHydration = () => () => {};
const readHydration = () => true;
const serverHydration = () => false;

function initialServiceTab() {
  if (typeof window === "undefined") return 0;
  const index = afterSalesServices.findIndex(
    ({ id }) => window.location.hash === `#service-panel-${id}`,
  );
  return index < 0 ? 0 : index;
}

function ServiceInstructions({ service }: { service: AfterSalesService }) {
  return (
    <article className={styles.instructions}>
      <h2>{service.title}</h2>
      <ol className={styles.steps} role="list">
        {service.steps.map((step, index) => (
          <li key={step}>
            <span className={styles.stepNumber} aria-hidden="true">
              {index + 1}
            </span>
            <p>{step}</p>
          </li>
        ))}
      </ol>
      {service.notes && (
        <aside className={styles.notes} aria-label="ข้อควรทราบ">
          {service.notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </aside>
      )}
      {service.extra && (
        <details className={styles.details}>
          <summary>
            {service.extra.title}
            <ChevronDown size={17} aria-hidden="true" />
          </summary>
          <ul>
            {service.extra.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}

function ServiceContact() {
  return (
    <aside
      id="service-contact"
      className={styles.contact}
      aria-labelledby="service-contact-heading"
    >
      <h2 id="service-contact-heading">{afterSalesContact.title}</h2>
      <p className={styles.hours}>{afterSalesContact.hours}</p>
      <a className={styles.lineButton} href={sunford.line} target="_blank" rel="noreferrer">
        <Image src="/images/brands/line-brand-icon.png" width={20} height={20} alt="" />
        LINE @sunford
        <ExternalLink size={16} aria-hidden="true" />
      </a>
      <div className={styles.phoneList}>
        {afterSalesContact.phones.map((phone) => (
          <a href={phone.href} key={phone.href}>
            <Phone size={15} aria-hidden="true" />
            {phone.label}
          </a>
        ))}
      </div>
      <div className={styles.location}>
        <h3>
          <MapPin size={16} aria-hidden="true" />
          ที่อยู่โรงงานซันฟอร์ด
        </h3>
        <address>
          {afterSalesContact.address.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </address>
      </div>
    </aside>
  );
}

export function AfterSalesPage() {
  const [selected, setSelected] = useReturnState("after-sales-page.selected", initialServiceTab);
  const interactive = useSyncExternalStore(subscribeHydration, readHydration, serverHydration);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const activePanel = useRef<HTMLDivElement>(null);
  const needsAnchorHandoff = useRef(!interactive);

  useLayoutEffect(() => {
    if (!interactive || !needsAnchorHandoff.current) return;
    needsAnchorHandoff.current = false;
    const panel = activePanel.current;
    if (!panel || window.location.hash !== `#${panel.id}`) return;

    // The anchor can move above the viewport when the other server-rendered panels collapse.
    const { top } = panel.getBoundingClientRect();
    if (top < 0 || top >= window.innerHeight)
      panel.scrollIntoView({ block: "start", behavior: "instant" });
  }, [interactive, selected]);

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
            <h1>บริการหลังการขาย</h1>
          </div>
          <div className={styles.quickLinks}>
            <a href="#service-contact">ติดต่อฝ่ายบริการ</a>
            <a href="#service-policies">เงื่อนไขบริการ</a>
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

        <div className={styles.workspace}>
          <div className={styles.panels}>
            {afterSalesServices.map((service, index) => {
              const hidden = interactive && selected !== index;
              return (
                <div
                  className={styles.panel}
                  ref={interactive && !hidden ? activePanel : undefined}
                  key={service.id}
                  id={`service-panel-${service.id}`}
                  role={interactive ? "tabpanel" : undefined}
                  aria-labelledby={interactive ? `service-tab-${service.id}` : undefined}
                  hidden={hidden}
                  tabIndex={interactive && !hidden ? 0 : undefined}
                >
                  {!hidden && <ServiceInstructions service={service} />}
                </div>
              );
            })}
          </div>
          <ServiceContact />
        </div>

        <nav id="service-policies" className={styles.policies} aria-label="ข้อมูลที่เกี่ยวข้อง">
          <Link href={sunford.warrantyPolicy}>นโยบายการรับประกัน</Link>
          <Link href="/cancel-and-return/policy">เงื่อนไขการเปลี่ยนและคืนสินค้า</Link>
        </nav>
      </div>
    </main>
  );
}
