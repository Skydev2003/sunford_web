import { Building2, Headphones, MapPin, Warehouse } from "lucide-react";
import { contactLocations, type ContactLocationImages } from "../data/contact-locations";
import { ContactLocationImage } from "./contact-location-image";
import styles from "./contact-page.module.css";

const icons = { service: Headphones, office: Building2, warehouse: Warehouse };

export function ContactLocations({ images }: { images: ContactLocationImages }) {
  return (
    <section className={styles.locations} aria-labelledby="contact-locations-title">
      <div className="container">
        <div className={styles.sectionHeading}>
          <div>
            <p className={`eyebrow ${styles.eyebrow}`}>OUR LOCATIONS</p>
            <h2 id="contact-locations-title">พบกับซันฟอร์ด</h2>
            <p className={styles.locationsIntro}>
              เลือกสถานที่ที่คุณต้องการติดต่อ พร้อมข้อมูลที่อยู่และการเดินทาง
            </p>
          </div>
          <p className={styles.locationHint}>
            <MapPin size={25} strokeWidth={1.7} aria-hidden="true" />
            <span>
              เลือกดูเส้นทาง
              <br />
              เพื่อเดินทางมาหาเรา
            </span>
          </p>
        </div>
        <div className={styles.locationGrid}>
          {contactLocations.map(({ id, imageKey, title, label, company, address, map }) => {
            const Icon = icons[id];
            return (
              <article className={styles.location} key={id}>
                <a
                  href={map}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.locationLink}
                  aria-label={`ดูแผนที่ ${title}`}
                >
                  <div className={styles.locationVisual}>
                    <ContactLocationImage image={images[imageKey]} kind={id} title={title} />
                    <span className={styles.locationIcon}>
                      <Icon size={24} strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    <p className={styles.locationLabel}>{label}</p>
                  </div>
                  <div className={styles.locationBody}>
                    <h3>{title}</h3>
                    <p className={styles.company}>{company}</p>
                    <address>
                      <span className={styles.addressIcon}>
                        <MapPin size={18} strokeWidth={1.7} aria-hidden="true" />
                      </span>
                      <span>{address}</span>
                    </address>
                  </div>
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
