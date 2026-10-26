import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/features/admin/server/auth";
import { LoginForm } from "@/features/admin/components/login-form";
async function LoginContent() {
  if (await getAdminSession()) redirect("/admin/products");
  return <LoginForm />;
}
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-loading" role="status">
          กำลังโหลด…
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
