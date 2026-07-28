import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { hostingPlans, orders, templates } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { ORDER_STATUS_LABELS, faDate, statusColor, toman } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await db
    .select({
      order: orders,
      templateTitle: templates.title,
      planName: hostingPlans.name,
    })
    .from(orders)
    .innerJoin(templates, eq(orders.templateId, templates.id))
    .innerJoin(hostingPlans, eq(orders.hostingPlanId, hostingPlans.id))
    .where(eq(orders.customerId, user.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-6">
      <header className="glass card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">سلام {user.name} 👋</h1>
          <p className="mt-1 text-xs text-slate-600">
            {user.email} — {user.phone}
          </p>
          <div className="mt-2 flex gap-2 text-[11px]">
            <span className={`rounded-full px-2 py-1 ${user.phoneVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              موبایل {user.phoneVerified ? "تایید شده" : "تایید نشده"}
            </span>
            <span className={`rounded-full px-2 py-1 ${user.emailVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              ایمیل {user.emailVerified ? "تایید شده" : "تایید نشده"}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(!user.phoneVerified || !user.emailVerified) && (
            <Link href="/verify" className="btn btn-primary">
              تکمیل احراز هویت
            </Link>
          )}
          <Link href="/account/tickets" className="btn btn-ghost">
            🎧 پشتیبانی
          </Link>
          <Link href="/shop" className="btn btn-ghost">
            سفارش جدید
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost">
              خروج
            </button>
          </form>
        </div>
      </header>

      <section className="glass card overflow-x-auto p-6">
        <h2 className="mb-4 text-sm font-bold text-slate-800">سفارش‌های من</h2>
        {rows.length === 0 ? (
          <p className="text-xs text-slate-600">هنوز سفارشی ثبت نکرده‌اید.</p>
        ) : (
          <table className="data w-full min-w-[640px]">
            <thead>
              <tr>
                <th>قالب</th>
                <th>پلن سرور</th>
                <th>تاریخ</th>
                <th>وضعیت</th>
                <th>مبلغ کل</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ order, templateTitle, planName }) => (
                <tr key={order.id}>
                  <td className="font-bold text-slate-800">{templateTitle}</td>
                  <td>{planName}</td>
                  <td>{faDate(order.createdAt)}</td>
                  <td>
                    <span className={`rounded-full border px-2 py-1 text-[11px] ${statusColor(order.status)}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td>{order.totalPrice ? toman(order.totalPrice) : "—"}</td>
                  <td>
                    <Link href={`/account/orders/${order.id}`} className="text-xs font-bold text-indigo-700">
                      جزئیات
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
