import Link from "next/link";
import { listAudit } from "@/features/admin/server/safety";
import { safetyLabels } from "@/features/admin/safety-types";
export const instant = false;
export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string; id?: string }>;
}) {
  const params = await searchParams;
  const page = /^\d{1,7}$/.test(params.page ?? "") ? Number(params.page) : 1;
  const types = ["product", "page", "category", "settings", "product-media", "home-image"];
  const type = types.includes(params.type ?? "") ? params.type : undefined;
  const id = typeof params.id === "string" ? params.id.slice(0, 150) : undefined;
  const data = await listAudit(page, type, id);
  const href = (page: number) =>
    `/admin/audit?${new URLSearchParams({ ...(type ? { type } : {}), ...(id ? { id } : {}), page: String(page) })}`;
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">AUDIT LOG</span>
          <h1>
            ประวัติการแก้ไข<span>.</span>
          </h1>
          <p>บันทึกจากบัญชีผู้ทำรายการจริง เริ่มเก็บตั้งแต่เปิดใช้ระบบประวัตินี้</p>
        </div>
        <Link href="/admin/trash" className="admin-button-secondary">
          ถังขยะ
        </Link>
      </div>
      <form className="admin-audit-filters" method="get">
        <label className="admin-field">
          ประเภทข้อมูล
          <select name="type" defaultValue={type ?? ""}>
            <option value="">ทุกประเภท</option>
            {types.map((item) => (
              <option key={item} value={item}>
                {safetyLabels[item]}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          รหัสข้อมูล
          <input name="id" defaultValue={id ?? ""} maxLength={150} />
        </label>
        <button className="admin-button-secondary">กรองประวัติ</button>
        {(type || id) && <Link href="/admin/audit">ดูประวัติทั้งหมด</Link>}
      </form>
      <ol className="admin-audit-list">
        {data.rows.map((row) => (
          <li key={row.id}>
            <div>
              <strong>
                {safetyLabels[row.action] ?? row.action} · {row.title}
              </strong>
              <p>
                {safetyLabels[row.entityType] ?? row.entityType} · {row.entityId}
              </p>
              <p>
                ผู้ทำรายการ: <strong>{row.actorEmail}</strong> ·{" "}
                {new Date(row.createdAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}
              </p>
              {row.fields.length > 0 && (
                <p>
                  ข้อมูลที่เกี่ยวข้อง:{" "}
                  {row.fields.map((field) => safetyLabels[field] ?? field).join(", ")}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      {!data.rows.length && (
        <p className="admin-empty">
          ยังไม่มีประวัติที่ตรงกับตัวกรอง ระบบไม่ได้สร้างประวัติย้อนหลังแทนผู้แก้ไขเดิม
        </p>
      )}
      <nav className="admin-pagination" aria-label="แบ่งหน้าประวัติ">
        {data.current > 1 && <Link href={href(data.current - 1)}>ก่อนหน้า</Link>}
        <span>
          หน้า {data.current} จาก {data.pages} · {data.count} รายการ
        </span>
        {data.current < data.pages && <Link href={href(data.current + 1)}>ถัดไป</Link>}
      </nav>
    </>
  );
}
