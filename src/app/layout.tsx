import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getCategories } from "@/features/cms/server/categories";
import { CategoriesProvider } from "@/features/cms/components/categories-provider";

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
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();
  return (
    <html lang="th" className={sunfordFont.variable} data-scroll-behavior="smooth">
      <body>
        <CategoriesProvider categories={categories}>{children}</CategoriesProvider>
      </body>
    </html>
  );
}
