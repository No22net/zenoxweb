import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { hostingPlans, orders, templates, users } from "@/db/schema";
import { ORDER_STATUS_LABELS, faDate, statusColor, toman } from "@/lib/format";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const { status } = await searchParams;

  const base = db
    .select({
      order: orders,
      template: templates.title,
      plan: hostingPlans.name,
      customer: users.name,
      phone: users.phone,
    })
    .from(orders)
    .innerJoin(templates, eq(orders.templateId, templates.id))
    .innerJoin(hostingPlans, eq(orders.hostingPlanId, hostingPlans.id))
    .innerJoin(users, eq(orders.customerId, users.id));

  const rows = status
    ? await base.where(eq(orders.status, status)).orderBy(desc(orders.createdAt))
    : await base.orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-4">
      <div className="glass card p-6">
        <h1 className="text-xl font-black text-slate-900">مدیریت سفارش‌ها</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/orders" className={`rounded-lg px-3 py-1 text-xs ${!status ? "brand-gradient text-white" : "bg-white/70 text-slate-600"}`}>
            همه
          </Link>
          {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
            <Link
              key={key}
              href={`/admin/orders?status=${key}`}
              className={`rounded-lg px-3 py-1 text-xs ${status === key ? "brand-gradient text-white" : "bg-white/70 text-slate-600"}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="glass card overflow-x-auto p-6">
        <table className="data w-full min-w-[760px]">
          <thead>
            <tr>
              <th>مشتری</th>
              <th>قالب</th>
              <th>پلن</th>
              <th>تاریخ</th>
              <th>وضعیت</th>
              <th>مبلغ کل</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.order.id}>
                <td>
                  <div className="font-bold text-slate-800">{r.customer}</div>
                  <div className="text-[11px] text-slate-500">{r.phone}</div>
                </td>
                <td>{r.template}</td>
                <td>{r.plan}</td>
                <td>{faDate(r.order.createdAt)}</td>
                <td>
                  <span className={`rounded-full border px-2 py-1 text-[11px] ${statusColor(r.order.status)}`}>
                    {ORDER_STATUS_LABELS[r.order.status]}
                  </span>
                </td>
                <td>{r.order.totalPrice ? toman(r.order.totalPrice) : "—"}</td>
                <td>
                  <Link href={`/admin/orders/${r.order.id}`} className="btn btn-ghost !py-1 !px-3 text-xs">
                    مدیریت
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-xs text-slate-500">
                  سفارشی با این فیلتر یافت نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
