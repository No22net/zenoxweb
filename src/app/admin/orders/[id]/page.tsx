import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { hostingPlans, orders, templates, transactions, users } from "@/db/schema";
import { quoteOrderAction, updateOrderStatusAction } from "@/app/actions/admin";
import { ORDER_STATUS_LABELS, faDate, statusColor, toman } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function AdminOrderDetail({ params }: { params: Params }) {
  const { id } = await params;
  const rows = await db
    .select({ order: orders, template: templates, plan: hostingPlans, customer: users })
    .from(orders)
    .innerJoin(templates, eq(orders.templateId, templates.id))
    .innerJoin(hostingPlans, eq(orders.hostingPlanId, hostingPlans.id))
    .innerJoin(users, eq(orders.customerId, users.id))
    .where(eq(orders.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) notFound();
  const { order, template, plan, customer } = row;
  const txs = await db.select().from(transactions).where(eq(transactions.orderId, id));

  return (
    <div className="space-y-4">
      <div className="glass card flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">سفارش {template.title}</h1>
          <p className="mt-1 text-xs text-slate-500">
            کد: {order.id.slice(0, 8)} — ثبت: {faDate(order.createdAt)}
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs ${statusColor(order.status)}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass card space-y-3 p-6 text-xs text-slate-600">
          <h2 className="text-sm font-bold text-slate-800">اطلاعات مشتری و درخواست</h2>
          <p><b>مشتری:</b> {customer.name}</p>
          <p><b>موبایل:</b> {customer.phone} {customer.phoneVerified ? "✅" : "⚠️"}</p>
          <p><b>ایمیل:</b> {customer.email} {customer.emailVerified ? "✅" : "⚠️"}</p>
          <p><b>پلن سرور:</b> {plan.name} — {toman(order.hostingPrice)}</p>
          <p className="leading-7"><b>سفارشی‌سازی:</b> {order.customizationNotes || "—"}</p>
          {order.paymentRefId && <p><b>کد رهگیری:</b> {order.paymentRefId}</p>}
          <Link href={`/templates/${template.slug}`} className="text-indigo-700">
            مشاهده قالب در سایت
          </Link>
        </section>

        <section className="glass card space-y-3 p-6">
          <h2 className="text-sm font-bold text-slate-800">صدور / ویرایش پیش‌فاکتور</h2>
          <form action={quoteOrderAction} className="space-y-3">
            <input type="hidden" name="id" value={order.id} />
            <div>
              <label className="label">هزینه طراحی (تومان)</label>
              <input
                name="quotedDesignPrice"
                className="input"
                defaultValue={order.quotedDesignPrice ?? template.basePrice}
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="label">یادداشت برای مشتری</label>
              <textarea
                name="adminNote"
                className="input min-h-24"
                defaultValue={order.adminNote ?? ""}
                placeholder="مثلا: بابت افزودن پنل مدیریت محصول ۵۰۰,۰۰۰ تومان اضافه شده است."
              />
            </div>
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
              مبلغ نهایی = هزینه طراحی + هزینه سرور ({toman(order.hostingPrice)})
            </p>
            <button type="submit" className="btn btn-primary w-full">
              ثبت و ارسال پیش‌فاکتور
            </button>
          </form>
        </section>

        <section className="glass card space-y-3 p-6">
          <h2 className="text-sm font-bold text-slate-800">مدیریت وضعیت و دیپلوی</h2>
          <form action={updateOrderStatusAction} className="space-y-3">
            <input type="hidden" name="id" value={order.id} />
            <div>
              <label className="label">وضعیت سفارش</label>
              <select name="status" defaultValue={order.status} className="input">
                {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">دامنه</label>
              <input name="domain" className="input" defaultValue={order.domain ?? ""} placeholder="example.ir" />
            </div>
            <div>
              <label className="label">اطلاعات سرور / پورت</label>
              <input name="serverInfo" className="input" defaultValue={order.serverInfo ?? ""} placeholder="srv-01 :3002" />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              ذخیره تغییرات
            </button>
          </form>
        </section>

        <section className="glass card p-6">
          <h2 className="mb-3 text-sm font-bold text-slate-800">تراکنش‌ها</h2>
          <div className="space-y-2">
            {txs.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-xs">
                <span>{t.gateway}</span>
                <span>{toman(t.amount)}</span>
                <span className={t.status === "SUCCESS" ? "text-emerald-600" : "text-slate-500"}>
                  {t.status}
                </span>
                <span className="text-[11px] text-slate-400">{t.refId ?? "—"}</span>
              </div>
            ))}
            {txs.length === 0 && <p className="text-xs text-slate-500">تراکنشی ثبت نشده است.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
