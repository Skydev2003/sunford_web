"use client";

import Image from "next/image";
import { Building2, Headphones, Warehouse } from "lucide-react";
import { useState } from "react";
import type { ContactLocationKind } from "../data/contact-locations";
import styles from "./contact-page.module.css";

const icons = { service: Headphones, office: Building2, warehouse: Warehouse };

export function ContactLocationImage({
  image,
  kind,
  title,
}: {
  image: string;
  kind: ContactLocationKind;
  title: string;
}) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const Icon = icons[kind];
  const showImage = Boolean(image) && failedImage !== image;

  return (
    <div className={`${styles.locationArtwork} ${styles[kind] ?? ""}`}>
      {showImage ? (
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 600px) 65vw, (max-width: 900px) 55vw, 280px"
          className={styles.locationPhoto}
          onError={() => setFailedImage(image)}
        />
      ) : (
        <div className={styles.locationIllustration} aria-hidden="true">
          <span className={styles.illustrationOrbit} />
          <span className={styles.illustrationTile}>
            <Icon strokeWidth={1.15} />
          </span>
          <span className={styles.illustrationDot} />
        </div>
      )}
    </div>
  );
}
