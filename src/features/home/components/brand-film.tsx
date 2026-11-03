import styles from "./brand-film.module.css";

export function BrandFilm() {
  return (
    <section id="brand-film" className={styles.section} aria-label="วิดีโอ Sunford">
      <video
        className={styles.video}
        width={1920}
        height={856}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/sunford-poster.jpg"
        aria-label="ชมวิดีโอ Sunford"
      >
        <source src="/videos/sunford-web.mp4" type="video/mp4" />
        เบราว์เซอร์ของคุณไม่รองรับวิดีโอ <a href="/videos/sunford-web.mp4">เปิดคลิป Sunford</a>
      </video>
    </section>
  );
}
