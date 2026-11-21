import Image, { getImageProps } from "next/image";
import { FeaturedCardMedia } from "./featured-card-media";
import { productRailCardSizes } from "./scale-showcase-card";
import styles from "./products-index-content.module.css";

export function EquipmentVideoCard() {
  const posterDimensions = { width: 1200, height: 1920, sizes: productRailCardSizes };
  const { props: opening } = getImageProps({
    src: "/images/products/aw31-lp50-opening.webp",
    alt: "",
    ...posterDimensions,
  });
  return (
    <li className={styles.card}>
      <div
        className={styles.featuredVideoCard}
        role="img"
        aria-label="เครื่องพิมพ์ LP50 พิมพ์สติกเกอร์คู่กับหัวอ่านน้ำหนัก AW31"
      >
        <FeaturedCardMedia
          src="/videos/aw31-lp50.mp4"
          openingPoster={{ srcSet: opening.srcSet ?? opening.src, sizes: opening.sizes }}
          restorePosterOnEnd
        >
          <Image src="/images/products/aw31-lp50-poster.webp" alt="" {...posterDimensions} />
        </FeaturedCardMedia>
      </div>
    </li>
  );
}
