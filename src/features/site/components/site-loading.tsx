import styles from "./site-loading.module.css";

export function LoadingClouds({ size = 96 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="#e8e8e8"
      aria-hidden="true"
      focusable="false"
      className={styles.clouds}
    >
      <path
        className={styles.far}
        transform="translate(149 53)"
        opacity=".5"
        d="M56.11 57H20.09C9 57 0 48.03 0 36.97S9 16.95 20.09 16.95C23.44 16.95 26.6 17.76 29.38 19.21C33.24 8.03 43.89 0 56.41 0C72.21 0 85.01 12.76 85.01 28.5C85.01 28.82 85 29.14 84.99 29.46C89.6 31.93 92.74 36.78 92.74 42.36C92.74 50.45 86.16 57 78.05 57Z"
      />
      <path
        className={styles.near}
        transform="translate(15 63)"
        d="M123.61 125.56H44.26C19.82 125.56 0 105.81 0 81.44S19.82 37.33 44.26 37.33C51.64 37.33 58.59 39.13 64.71 42.31C73.22 17.69 96.67 0 124.27 0C159.05 0 187.25 28.11 187.25 62.78C187.25 63.49 187.24 64.2 187.21 64.9C197.37 70.34 204.27 81.03 204.27 93.32C204.27 111.12 189.79 125.56 171.93 125.56Z"
      />
    </svg>
  );
}

export function SiteLoading({ label = "กำลังโหลด…" }: { label?: string }) {
  return (
    <main id="main-content" className={styles.page}>
      <div role="status" className={styles.status}>
        <LoadingClouds />
        <span>{label}</span>
      </div>
    </main>
  );
}
