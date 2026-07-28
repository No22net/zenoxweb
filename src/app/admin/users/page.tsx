import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { createStaffAction, deleteUserAction, toggleUserActiveAction } from "@/app/actions/admin";
import { faDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const me = await getCurrentUser();
  if (!me || me.role !== "OWNER") redirect("/admin");
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  const staff = rows.filter((u) => u.role !== "CUSTOMER");
  const customers = rows.filter((u) => u.role === "CUSTOMER");

  return (
    <div className="space-y-4">
      <div className="glass card p-6">
        <h1 className="text-xl font-black text-slate-900">کاربران و ادمین‌ها</h1>
        <p className="mt-1 text-xs text-slate-600">فقط مالک می‌تواند ادمین اضافه یا حذف کند.</p>
      </div>

      <section className="glass card p-6">
        <h2 className="mb-4 text-sm font-bold text-slate-800">افزودن ادمین جدید</h2>
        <form action={createStaffAction} className="grid gap-3 md:grid-cols-5">
          <div>
            <label className="label">نام</label>
            <input name="name" className="input" required />
          </div>
          <div>
            <label className="label">ایمیل</label>
            <input name="email" type="email" className="input" required />
          </div>
          <div>
            <label className="label">موبایل</label>
            <input name="phone" className="input" required />
          </div>
          <div>
            <label className="label">رمز عبور (۸+)</label>
            <input name="password" className="input" required />
          </div>
          <div className="flex items-end gap-2">
            <select name="role" className="input">
              <option value="ADMIN">ادمین</option>
              <option value="OWNER">مالک</option>
            </select>
            <button type="submit" className="btn btn-primary">
              افزودن
            </button>
          </div>
        </form>
      </section>

      <section className="glass card overflow-x-auto p-6">
        <h2 className="mb-3 text-sm font-bold text-slate-800">تیم مدیریت</h2>
        <table className="data w-full min-w-[620px]">
          <thead>
            <tr>
              <th>نام</th>
              <th>ایمیل</th>
              <th>نقش</th>
              <th>وضعیت</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((u) => (
              <tr key={u.id}>
                <td className="font-bold text-slate-800">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role === "OWNER" ? "مالک" : "ادمین"}</td>
                <td>{u.isActive ? "فعال" : "غیرفعال"}</td>
                <td className="flex gap-2">
                  <form action={toggleUserActiveAction}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="active" value={String(!u.isActive)} />
                    <button type="submit" className="text-xs font-bold text-indigo-700">
                      {u.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
                    </button>
                  </form>
                  {u.id !== me.id && (
                    <form action={deleteUserAction}>
                      <input type="hidden" name="id" value={u.id} />
                      <button type="submit" className="text-xs font-bold text-rose-600">
                        حذف
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="glass card overflow-x-auto p-6">
        <h2 className="mb-3 text-sm font-bold text-slate-800">مشتریان</h2>
        <table className="data w-full min-w-[620px]">
          <thead>
            <tr>
              <th>نام</th>
              <th>ایمیل</th>
              <th>موبایل</th>
              <th>احراز هویت</th>
              <th>تاریخ عضویت</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((u) => (
              <tr key={u.id}>
                <td className="font-bold text-slate-800">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>
                  <span className="text-[11px]">
                    موبایل {u.phoneVerified ? "✅" : "⚠️"} / ایمیل {u.emailVerified ? "✅" : "⚠️"}
                  </span>
                </td>
                <td>{faDate(u.createdAt)}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-xs text-slate-500">
                  مشتری‌ای ثبت نشده است.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
