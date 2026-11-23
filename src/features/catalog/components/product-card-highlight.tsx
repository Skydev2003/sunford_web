import styles from "./product-card-highlight.module.css";

export function ProductCardHighlight({ text }: { text: string }) {
  return (
    <p className={styles.highlight} data-product-highlight>
      {text || "ยังไม่มีข้อมูลจุดเด่น"}
    </p>
  );
}
