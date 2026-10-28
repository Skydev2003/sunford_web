"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { loginAction } from "../server/auth-actions";
export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  const [show, setShow] = useState(false);
  return (
    <main className="admin-login" id="main-content">
      <section className="admin-login-story">
        <Link href="/">
          <Image src="/images/sunford-logo.png" alt="SUNFORD" width={158} height={32} priority />
        </Link>
        <div>
          <span className="admin-eyebrow">SUNFORD WORKSPACE</span>
          <h1>
            ทุกความเป็นไปได้
            <br />
            เริ่มต้นที่<span>การจัดการที่ดี</span>
          </h1>
          <p>
            พื้นที่ดูแลผลิตภัณฑ์และเรื่องราวของ Sunford
            <br />
            ให้ทุกข้อมูลพร้อมสำหรับโอกาสครั้งต่อไป
          </p>
        </div>
        <span className="admin-login-trust">
          <ShieldCheck size={17} /> สำหรับผู้ดูแลระบบที่ได้รับอนุญาตเท่านั้น
        </span>
      </section>
      <section className="admin-login-panel">
        <Link className="admin-back" href="/">
          กลับสู่เว็บไซต์
        </Link>
        <form action={action} className="admin-login-form">
          <div className="admin-lock">
            <LockKeyhole size={24} strokeWidth={1.4} />
          </div>
          <span className="admin-eyebrow">WELCOME BACK</span>
          <h2>เข้าสู่พื้นที่แอดมิน</h2>
          <p>จัดการสินค้า ให้พร้อมสำหรับทุกการเติบโต</p>
          <label htmlFor="email">อีเมลผู้ดูแล</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="you@sunford.com"
            required
            maxLength={254}
            disabled={pending}
          />
          <label htmlFor="password">รหัสผ่าน</label>
          <div className="admin-password">
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              required
              maxLength={256}
              disabled={pending}
            />
            <button
              type="button"
              aria-label={show ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              onClick={() => setShow(!show)}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {state.error && (
            <p className="admin-alert error" role="alert">
              {state.error}
            </p>
          )}
          <button className="button button-red" type="submit" disabled={pending}>
            {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
          </button>
          <span className="admin-login-help">
            บัญชีที่ได้รับสิทธิ์จาก Sunford เท่านั้นที่เข้าถึงได้
          </span>
        </form>
        <small className="admin-login-copyright">SUNFORD · Precision you can trust.</small>
      </section>
    </main>
  );
}
