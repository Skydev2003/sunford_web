import type { ReactNode } from "react";
import styles from "./home-motion.module.css";

export function HomeMotion({ children }: { children: ReactNode }) {
  return (
    <div className={styles.reveal} data-home-motion="reveal">
      <div>{children}</div>
    </div>
  );
}
