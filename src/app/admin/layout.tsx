import type { Metadata } from "next";
import "@/styles/admin.css";
export const metadata: Metadata = {
  title: "จัดการสินค้า",
  robots: { index: false, follow: false },
};
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-app">{children}</div>;
}
