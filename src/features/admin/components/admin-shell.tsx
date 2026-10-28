import Link from "next/link";
import Image from "next/image";
import { LogOut, ShieldCheck } from "lucide-react";
import { logoutAction } from "../server/auth-actions";
import { AdminNavigation } from "./admin-navigation";
import { AdminSidebar } from "./admin-sidebar";
import { AdminDetailWorkspace } from "./admin-detail-workspace";
export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <AdminDetailWorkspace>
        <AdminSidebar>
          <Link href="/admin/products" className="admin-logo">
            <Image src="/images/sunford-logo.png" alt="SUNFORD" width={140} height={29} />
            <span>ADMIN WORKSPACE</span>
          </Link>
          <AdminNavigation />
          <div className="admin-sidebar-bottom">
            <span>
              <ShieldCheck size={15} /> สิทธิ์ผู้ดูแลระบบ
            </span>
            <p>{email}</p>
            <form action={logoutAction}>
              <button type="submit">
                <LogOut size={16} /> ออกจากระบบ
              </button>
            </form>
          </div>
        </AdminSidebar>
        <div className="admin-workspace">
          <header className="admin-topbar">
            <span>
              Workspace <span>/</span> จัดการเว็บไซต์
            </span>
            <Link href="/" target="_blank">
              ดูเว็บไซต์
            </Link>
          </header>
          <main id="main-content" className="admin-main">
            {children}
          </main>
          <footer className="admin-workspace-footer">
            SUNFORD WORKSPACE<span>Precision starts with the details.</span>
          </footer>
        </div>
      </AdminDetailWorkspace>
    </div>
  );
}
