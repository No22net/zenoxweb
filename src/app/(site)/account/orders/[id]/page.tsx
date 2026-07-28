import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { hostingPlans, orders, templates } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { approveQuoteAction, payOrderAction } from "@/app/actions/orders";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, faDate, statusColor, toman } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function OrderDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await db
    .select({ order: orders, template: templates, plan: hostingPlans })
    .from(orders)
    .innerJoin(templates, eq(orders.templateId, templates.id))
    .innerJoin(hostingPlans, eq(orders.hostingPlanId, hostingPlans.id))
    .where(and(eq(orders.id, id), eq(orders.customerId, user.id)))
    .limit(1);

  const row = rows[0];
  if (!row) notFound();
  const { order, template, plan } = row;
  const stepIndex = ORDER_STATUS_FLOW.indexOf(order.status);

  return (
    <div className="space-y-6">
      <header className="glass card space-y-3 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-slate-900">سفارش {template.title}</h1>
            <p className="mt-1 text-xs text-slate-500">
              کد سفارش: {order.id.slice(0, 8)} — ثبت: {faDate(order.createdAt)}
            </p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs ${statusColor(order.status)}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {ORDER_STATUS_FLOW.map((s, i) => (
            <span
              key={s}
              className={`rounded-full px-3 py-1 text-[11px] ${
                i <= stepIndex ? "brand-gradient text-white" : "bg-white/70 text-slate-500"
              }`}
            >
              {ORDER_STATUS_LABELS[s]}
            </span>
          ))}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="glass card space-y-4 p-6">
          <h2 className="text-sm font-bold text-slate-800">جزئیات درخواست</h2>
          <div className="space-y-2 text-xs text-slate-600">
            <p>
              <b>قالب:</b> {template.title}
            </p>
            <p>
              <b>پلن سرور:</b> {plan.name} ({toman(plan.monthlyCost)} ماهانه)
            </p>
            <p className="leading-7">
              <b>سفارشی‌سازی درخواستی:</b> {order.customizationNotes || "—"}
            </p>
            {order.domain && (
              <p>
                <b>دامنه:</b> {order.domain}
              </p>
            )}
            {order.serverInfo && (
              <p>
                <b>اطلاعات سرور:</b> {order.serverInfo}
              </p>
            )}
            {order.paymentRefId && (
              <p>
                <b>کد رهگیری پرداخت:</b> {order.paymentRefId}
              </p>
            )}
          </div>
        </section>

        <aside className="glass card h-fit space-y-4 p-6">
          <h2 className="text-sm font-bold text-slate-800">پیش‌فاکتور</h2>

          {order.status === "AWAITING_QUOTE" ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-800">
              درخواست شما در صف بررسی است. پس از قیمت‌گذاری توسط کارشناس، پیش‌فاکتور در همین صفحه
              نمایش داده می‌شود.
            </p>
          ) : (
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between rounded-xl bg-white/70 px-3 py-2">
                <span>هزینه طراحی (تعیین‌شده توسط کارشناس)</span>
                <span className="font-bold">{toman(order.quotedDesignPrice)}</span>
              </div>
              <div className="flex justify-between rounded-xl bg-white/70 px-3 py-2">
                <span>هزینه سرور ({plan.name})</span>
                <span className="font-bold">{toman(order.hostingPrice)}</span>
              </div>
              <div className="flex justify-between rounded-xl brand-gradient px-3 py-2 text-white">
                <span>مبلغ قابل پرداخت</span>
                <span className="font-bold">{toman(order.totalPrice)}</span>
              </div>
              {order.adminNote && (
                <p className="rounded-xl bg-slate-50 px-3 py-2 leading-6 text-slate-600">
                  یادداشت کارشناس: {order.adminNote}
                </p>
              )}
            </div>
          )}

          {order.status === "QUOTED" && (
            <form action={approveQuoteAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <button type="submit" className="btn btn-primary w-full">
                تایید پیش‌فاکتور
              </button>
            </form>
          )}

          {order.status === "APPROVED_BY_CUSTOMER" && (
            <form action={payOrderAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <button type="submit" className="btn btn-primary w-full">
                پرداخت آنلاین {toman(order.totalPrice)}
              </button>
            </form>
          )}

          {["PAID", "IN_PROGRESS", "DEPLOYED", "DELIVERED"].includes(order.status) && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs leading-6 text-emerald-700">
              پرداخت با موفقیت انجام شده است. تیم اجرا در حال آماده‌سازی سایت شماست.
            </p>
          )}

          <Link href="/account" className="btn btn-ghost w-full">
            بازگشت به پنل
          </Link>
        </aside>
      </div>
    </div>
  );
}
