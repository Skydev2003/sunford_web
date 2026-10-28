import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/admin.css";
import "@/styles/cms-admin.css";
import "@/styles/admin-workspace.css";

const adminFont = localFont({
  src: [
    { path: "../fonts/noto-thai-regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/noto-thai-semibold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-admin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "จัดการสินค้า",
  robots: { index: false, follow: false },
};
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={`admin-app ${adminFont.variable}`}>{children}</div>;
}
