"use client";

import Link from "next/link";
import { ChevronDown, List } from "lucide-react";
import {
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { sunford } from "@/features/home/data/brand";
import { subscribeReturnOrigin, useReturnState } from "@/features/site/history/return-state";
import { afterSalesServices, type AfterSalesService } from "../data/after-sales";
import { contactPath, isContactSection } from "../data/contact-route";
import styles from "./after-sales-page.module.css";

const subscribeHydration = () => () => {};
const readHydration = () => true;
const serverHydration = () => false;
const contactIndex = afterSalesServices.length;
const sections = [...afterSalesServices, { id: "contact", name: "ติดต่อเรา" }];
const sidebarBreakpoint = "(min-width: 48rem)";

function subscribeMenuLayout(notify: () => void) {
  const query = window.matchMedia(sidebarBreakpoint);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}

const readVerticalMenu = () => window.matchMedia(sidebarBreakpoint).matches;

function readContactSection() {
  return isContactSection(window.location);
}

function initialServiceTab() {
  if (typeof window === "undefined") return 0;
  const index = afterSalesServices.findIndex(
    ({ id }) => window.location.hash === `#service-panel-${id}`,
  );
  return index < 0 ? 0 : index;
}

function ServiceInstructions({ service }: { service: AfterSalesService }) {
  return (
    <div className={`source-prose ${styles.instructions}`}>
      <ol className={styles.steps}>
        {service.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      {service.extra && (
        <section className={styles.details}>
          <h2>{service.extra.title}</h2>
          <ul>
            {service.extra.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </section>
      )}
      {service.notes && (
        <aside className={styles.notes} aria-label="ข้อควรทราบ">
          <h2>ข้อควรทราบ</h2>
          {service.notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </aside>
      )}
    </div>
  );
}

export function AfterSalesPage({
  contact,
  initialContact = false,
}: {
  contact: ReactNode;
  initialContact?: boolean;
}) {
  const [selectedService, setSelectedService] = useReturnState(
    "after-sales-page.selected",
    initialServiceTab,
  );
  const interactive = useSyncExternalStore(subscribeHydration, readHydration, serverHydration);
  const verticalMenu = useSyncExternalStore(subscribeMenuLayout, readVerticalMenu, serverHydration);
  const contactSelected = useSyncExternalStore(
    subscribeReturnOrigin,
    readContactSection,
    () => initialContact,
  );
  const selected = contactSelected ? contactIndex : selectedService;
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const needsAnchorHandoff = useRef(true);

  useLayoutEffect(() => {
    if (!interactive || !needsAnchorHandoff.current) return;
    const hash = window.location.hash;
    if (!hash) {
      needsAnchorHandoff.current = false;
      return;
    }
    const actionAnchor = hash === "#service-contact" || hash === "#service-policies";
    if (!actionAnchor && hash !== `#service-panel-${sections[selected]?.id}`) return;
    const target = document.getElementById(hash.slice(1));
    if (!target || target.hidden) return;

    // Cancel the native hash scroll to the original, uncollapsed panel position.
    const frame = requestAnimationFrame(() => {
      needsAnchorHandoff.current = false;
      target.scrollIntoView({ block: "start", behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [interactive, selected]);

  function selectSection(index: number) {
    if (index === selected) return;
    if (index === contactIndex) {
      window.history.pushState(null, "", contactPath);
    } else if (contactSelected) {
      window.history.pushState(null, "", `/service#service-panel-${afterSalesServices[index].id}`);
    } else {
      setSelectedService(index);
    }
  }

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (index + 1) % sections.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index - 1 + sections.length) % sections.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = sections.length - 1;
    else return;
    event.preventDefault();
    selectSection(next);
    tabs.current[next]?.focus();
  }

  const navigation = interactive ? (
    <div
      className={styles.menu}
      role="tablist"
      aria-orientation="vertical"
      aria-label="ประเภทบริการหลังการขาย"
    >
      {sections.map((service, index) => {
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
            onClick={() => selectSection(index)}
            onKeyDown={(event) => handleTabKey(event, index)}
          >
            {service.name}
          </button>
        );
      })}
    </div>
  ) : (
    <nav className={styles.menu} aria-label="ประเภทบริการหลังการขาย">
      {sections.map((service) => (
        <a
          key={service.id}
          href={`${initialContact && service.id !== "contact" ? "/service" : ""}#service-panel-${service.id}`}
        >
          {service.name}
        </a>
      ))}
    </nav>
  );

  return (
    <main id="main-content" className={`source-content-page ${styles.page}`}>
      <div className={`container ${styles.shell}`}>
        {(!interactive || verticalMenu) && (
          <aside className={styles.sidebar}>
            <p className={styles.navigationTitle}>บริการหลังการขาย</p>
            {navigation}
          </aside>
        )}
        {(!interactive || !verticalMenu) && (
          <details className={styles.mobileNavigation}>
            <summary>
              <List size={18} aria-hidden="true" />
              เมนูบริการหลังการขาย
              <ChevronDown className={styles.chevron} size={18} aria-hidden="true" />
            </summary>
            {navigation}
          </details>
        )}
        <div className={styles.reader}>
          {sections.map((service, index) => {
            const active = selected === index;
            const hidden = (interactive || initialContact) && !active;
            const Heading = active ? "h1" : "h2";
            const instruction = afterSalesServices[index];
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
                  <>
                    <header className={instruction ? styles.visuallyHidden : styles.heading}>
                      <Heading>{instruction?.title ?? service.name}</Heading>
                    </header>
                    {instruction ? <ServiceInstructions service={instruction} /> : contact}
                  </>
                )}
              </div>
            );
          })}
          {!contactSelected && (
            <div className={styles.actions}>
              <Link
                id="service-contact"
                className={`button button-red ${styles.contactButton}`}
                href={interactive ? contactPath : "#service-panel-contact"}
              >
                ติดต่อเรา
              </Link>
              <nav
                id="service-policies"
                className={styles.policies}
                aria-label="ข้อมูลที่เกี่ยวข้อง"
              >
                <Link href={sunford.warrantyPolicy}>นโยบายการรับประกัน</Link>
                <Link href="/service/cancel-and-return/policy">เงื่อนไขการเปลี่ยนและคืนสินค้า</Link>
              </nav>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
