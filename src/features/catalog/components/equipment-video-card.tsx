import Image from "next/image";
import { FeaturedCardMedia } from "./featured-card-media";
import styles from "./products-index-content.module.css";

export function EquipmentVideoCard() {
  return (
    <li className={styles.card}>
      <div
        className={styles.featuredVideoCard}
        role="img"
        aria-label="เครื่องพิมพ์ LP50 พิมพ์สติกเกอร์คู่กับหัวอ่านน้ำหนัก AW31"
      >
        <FeaturedCardMedia
          src="/videos/aw31-lp50.mp4"
          openingPoster="/images/products/aw31-lp50-opening.webp"
          restorePosterOnEnd
        >
          <Image
            src="/images/products/aw31-lp50-poster.webp"
            alt=""
            width={1200}
            height={1920}
            loading="lazy"
            unoptimized
          />
        </FeaturedCardMedia>
      </div>
    </li>
  );
}
