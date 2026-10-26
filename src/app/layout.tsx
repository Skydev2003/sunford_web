import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CatalogOverlays } from "@/features/catalog/components/catalog-overlays";
import { getProducts } from "@/features/catalog/server/product-repository";
import { getPageSearchIndex } from "@/features/content/server/content-repository";
import "./globals.css";

const sunfordFont = localFont({
  src: [
    { path: "./fonts/inter-regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/inter-bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/noto-thai-regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/noto-thai-semibold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-sunford",
  display: "swap",
});
export const metadata: Metadata = {
  title: { default: "SUNFORD — ความแม่นยำ ที่พาคุณไปได้ไกลกว่า", template: "%s | SUNFORD" },
  description:
    "ค้นพบเครื่องชั่งดิจิทัล เครื่องชั่งอุตสาหกรรม และระบบ POS จาก Sunford เทคโนโลยีการชั่งและโซลูชันที่เติบโตไปพร้อมธุรกิจคุณ",
  icons: { icon: "/icon.svg" },
};
async function Overlays() {
  return <CatalogOverlays products={await getProducts()} pages={getPageSearchIndex()} />;
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={sunfordFont.variable} data-scroll-behavior="smooth">
      <body>
        <a href="#main-content" className="skip-link">
          ข้ามไปยังเนื้อหา
        </a>
        <Header />
        {children}
        <Footer />
        <Suspense fallback={null}>
          <Overlays />
        </Suspense>
      </body>
    </html>
  );
}
