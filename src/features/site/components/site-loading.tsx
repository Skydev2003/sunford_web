import styles from "./site-loading.module.css";

export function SiteLoading({ label = "กำลังโหลด…" }: { label?: string }) {
  return (
    <main id="main-content" className={styles.page}>
      <div role="status" className={styles.status}>
        {label}
      </div>
    </main>
  );
}
