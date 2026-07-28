import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { hostingPlans, orders, siteVisits, templates, users } from "@/db/schema";
import { ORDER_STATUS_LABELS, faDate, num, statusColor, toman } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [visitRow] = await db.select({ c: sql<number>`count(*)::int` }).from(siteVisits);
  const [userRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.role, "CUSTOMER"));

  const statusRows = await db
    .select({ status: orders.status, c: sql<number>`count(*)::int` })
    .from(orders)
    .groupBy(orders.status);

  const statusCount = (s: string) => statusRows.find((r) => r.status === s)?.c ?? 0;
  const totalOrders = statusRows.reduce((sum, r) => sum + r.c, 0);
  const paidStatuses = ["PAID", "IN_PROGRESS", "DEPLOYED", "DELIVERED"];
  const paidCount = statusRows
    .filter((r) => paidStatuses.includes(r.status))
    .reduce((sum, r) => sum + r.c, 0);
  const quotedTotal =
    statusCount("QUOTED") + statusCount("APPROVED_BY_CUSTOMER") + paidCount;
  const approvedTotal = statusCount("APPROVED_BY_CUSTOMER") + paidCount;

  const [revenueRow] = await db
    .select({ sum: sql<number>`coalesce(sum(${orders.totalPrice}),0)::int` })
    .from(orders)
    .where(sql`${orders.status} in ('PAID','IN_PROGRESS','DEPLOYED','DELIVERED')`);

  const revenueByPlan = await db
    .select({
      plan: hostingPlans.name,
      sum: sql<number>`coalesce(sum(${orders.totalPrice}),0)::int`,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .innerJoin(hostingPlans, eq(orders.hostingPlanId, hostingPlans.id))
    .where(sql`${orders.status} in ('PAID','IN_PROGRESS','DEPLOYED','DELIVERED')`)
    .groupBy(hostingPlans.name);

  const bestSellers = await db
    .select({
      title: templates.title,
      count: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(${orders.totalPrice}),0)::int`,
    })
    .from(orders)
    .innerJoin(templates, eq(orders.templateId, templates.id))
    .groupBy(templates.title)
    .orderBy(sql`count(*) desc`)
    .limit(5);

  const trend = await db
    .select({
      day: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(sql`${orders.createdAt} > now() - interval '30 days'`)
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);

  const latest = await db
    .select({ order: orders, template: templates.title })
    .from(orders)
    .innerJoin(templates, eq(orders.templateId, templates.id))
    .orderBy(desc(orders.createdAt))
    .limit(6);

  const conversion = totalOrders > 0 ? ((paidCount / totalOrders) * 100).toFixed(1) : "0.0";
  const approvalRate = quotedTotal > 0 ? ((approvedTotal / quotedTotal) * 100).toFixed(1) : "0.0";
  const maxTrend = Math.max(1, ...trend.map((t) => t.count));

  const cards = [
    { label: "بازدید سایت", value: num(visitRow?.c ?? 0), icon: "👁" },
    { label: "درخواست‌های ثبت‌شده", value: num(totalOrders), icon: "📥" },
    { label: "پرداخت موفق", value: num(paidCount), icon: "✅" },
    { label: "نرخ تبدیل", value: `${conversion}%`, icon: "📈" },
    { label: "نرخ تایید پیش‌فاکتور", value: `${approvalRate}%`, icon: "🤝" },
    { label: "درآمد کل", value: toman(revenueRow?.sum ?? 0), icon: "💰" },
    { label: "مشتریان", value: num(userRow?.c ?? 0), icon: "👤" },
    { label: "در انتظار قیمت", value: num(statusCount("AWAITING_QUOTE")), icon: "⏳" },
  ];

  return (
    <div className="space-y-4">
      <div className="glass card p-6">
        <h1 className="text-xl font-black text-slate-900">داشبورد مدیریت</h1>
        <p className="mt-1 text-xs text-slate-600">آمار عملکرد فروش و نرخ تبدیل ZeNOxWeb</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="glass card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{c.label}</span>
              <span className="text-lg">{c.icon}</span>
            </div>
            <div className="mt-2 text-lg font-black text-slate-800">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass card p-6">
          <h2 className="mb-4 text-sm font-bold text-slate-800">روند سفارش‌ها (۳۰ روز اخیر)</h2>
          {trend.length === 0 ? (
            <p className="text-xs text-slate-500">داده‌ای موجود نیست.</p>
          ) : (
            <div className="flex h-40 items-end gap-1">
              {trend.map((t) => (
                <div key={t.day} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md brand-gradient"
                    style={{ height: `${(t.count / maxTrend) * 100}%`, minHeight: 4 }}
                    title={`${t.day}: ${t.count}`}
                  />
                  <span className="text-[9px] text-slate-400">{t.day.slice(8)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="glass card p-6">
          <h2 className="mb-4 text-sm font-bold text-slate-800">درآمد بر اساس پلن سرور</h2>
          <div className="space-y-2">
            {revenueByPlan.length === 0 && <p className="text-xs text-slate-500">هنوز فروشی ثبت نشده.</p>}
            {revenueByPlan.map((r) => (
              <div key={r.plan} className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-xs">
                <span className="text-slate-700">{r.plan}</span>
                <span className="font-bold text-slate-800">
                  {toman(r.sum)} ({num(r.count)} سفارش)
                </span>
              </div>
            ))}
          </div>

          <h2 className="mb-3 mt-6 text-sm font-bold text-slate-800">پرفروش‌ترین قالب‌ها</h2>
          <div className="space-y-2">
            {bestSellers.map((b) => (
              <div key={b.title} className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-xs">
                <span className="text-slate-700">{b.title}</span>
                <span className="font-bold text-slate-800">{num(b.count)} سفارش</span>
              </div>
            ))}
            {bestSellers.length === 0 && <p className="text-xs text-slate-500">داده‌ای موجود نیست.</p>}
          </div>
        </section>
      </div>

      <section className="glass card overflow-x-auto p-6">
        <h2 className="mb-4 text-sm font-bold text-slate-800">آخرین سفارش‌ها</h2>
        <table className="data w-full min-w-[620px]">
          <thead>
            <tr>
              <th>قالب</th>
              <th>تاریخ</th>
              <th>وضعیت</th>
              <th>مبلغ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {latest.map((l) => (
              <tr key={l.order.id}>
                <td className="font-bold text-slate-800">{l.template}</td>
                <td>{faDate(l.order.createdAt)}</td>
                <td>
                  <span className={`rounded-full border px-2 py-1 text-[11px] ${statusColor(l.order.status)}`}>
                    {ORDER_STATUS_LABELS[l.order.status]}
                  </span>
                </td>
                <td>{l.order.totalPrice ? toman(l.order.totalPrice) : "—"}</td>
                <td>
                  <Link href={`/admin/orders/${l.order.id}`} className="text-xs font-bold text-indigo-700">
                    مدیریت
                  </Link>
                </td>
              </tr>
            ))}
            {latest.length === 0 && (
              <tr>
                <td colSpan={5} className="text-xs text-slate-500">
                  سفارشی ثبت نشده است.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
