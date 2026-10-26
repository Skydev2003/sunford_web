import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, LayoutGrid, LogOut, Package, ShieldCheck } from "lucide-react";
import { logoutAction } from "../server/auth-actions";
export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin/products" className="admin-logo">
          <Image src="/images/sunford-logo.png" alt="SUNFORD" width={140} height={29} />
          <span>ADMIN WORKSPACE</span>
        </Link>
        <div className="admin-nav-label">จัดการเว็บไซต์</div>
        <nav aria-label="เมนูแอดมิน">
          <Link href="/admin/products" className="active">
            <Package size={18} /> ผลิตภัณฑ์
            <ArrowUpRight size={13} />
          </Link>
          <Link href="/" target="_blank">
            <LayoutGrid size={18} /> ดูหน้าเว็บไซต์
            <ArrowUpRight size={13} />
          </Link>
        </nav>
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
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <span>
            Workspace <span>/</span> ผลิตภัณฑ์
          </span>
          <Link href="/" target="_blank">
            ดูเว็บไซต์ <ArrowUpRight size={14} />
          </Link>
        </header>
        <main id="main-content" className="admin-main">
          {children}
        </main>
        <footer className="admin-workspace-footer">
          SUNFORD WORKSPACE<span>Precision starts with the details.</span>
        </footer>
      </div>
    </div>
  );
}
