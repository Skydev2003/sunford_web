import Link from "next/link";
import { formatCatalogCardPrice } from "../data/price-format";
import { ProductCardHighlight } from "./product-card-highlight";
import styles from "./product-card-caption.module.css";

export function ProductCardCaption({
  name,
  highlight,
  price,
  headingLevel = 3,
  headingId,
  href,
  className,
}: {
  name: string;
  highlight: string;
  price: number | null | undefined;
  headingLevel?: 2 | 3;
  headingId?: string;
  href?: string;
  className?: string;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const heading = (
    <Heading className={styles.name} id={headingId}>
      {name}
    </Heading>
  );

  return (
    <div
      className={className ? `${className} ${styles.caption}` : styles.caption}
      data-product-card-caption
    >
      {href ? <Link href={href}>{heading}</Link> : heading}
      <ProductCardHighlight text={highlight} />
      <p className={styles.price}>{formatCatalogCardPrice(price)}</p>
    </div>
  );
}
