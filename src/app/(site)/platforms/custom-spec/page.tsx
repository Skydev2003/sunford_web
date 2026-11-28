import type { Metadata } from "next";
import { IndicatorPlatformCompatibilityPage } from "@/features/content/components/indicator-platform-compatibility-page";
import { platformSpecBuilderPath } from "@/features/catalog/data/platform-spec-builder-path";

export const instant = false;

export function generateMetadata(): Metadata {
  const title = "จัดสเปคแท่นชั่ง";
  const description =
    "เลือกแท่นชั่ง SUNFORD ก่อนจับคู่อินดิเคเตอร์และอุปกรณ์เสริมที่รองรับ เพื่อเตรียมใบเสนอราคา";
  const canonical = `https://sunford-web.vercel.app${platformSpecBuilderPath}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default IndicatorPlatformCompatibilityPage;
