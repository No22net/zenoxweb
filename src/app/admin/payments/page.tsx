import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { orders, transactions, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { saveGatewayAction } from "@/app/actions/admin";
import { getSettings } from "@/lib/settings";
import { faDate, toman } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const me = await getCurrentUser();
  if (!me || me.role !== "OWNER") redirect("/admin");

  const settings = await getSettings();
  const rows = await db
    .select({ tx: transactions, customer: users.name, orderId: orders.id })
    .from(transactions)
    .innerJoin(orders, eq(transactions.orderId, orders.id))
    .innerJoin(users, eq(orders.customerId, users.id))
    .orderBy(desc(transactions.createdAt))
    .limit(50);

  return (
    <div className="space-y-4">
      <div className="glass card p-6">
        <h1 className="text-xl font-black text-slate-900">تنظیمات مالی و درگاه پرداخت</h1>
        <p className="mt-1 text-xs text-slate-600">این بخش فقط برای مالک قابل دسترسی است.</p>
      </div>

      <form action={saveGatewayAction} className="glass card grid gap-4 p-6 md:grid-cols-3">
        <div>
          <label className="label">درگاه فعال</label>
          <select name="gatewayName" defaultValue={settings.gatewayName} className="input">
            <option value="ZARINPAL">زرین‌پال</option>
            <option value="MOCK">درگاه آزمایشی داخلی</option>
          </select>
        </div>
        <div>
          <label className="label">Merchant ID زرین‌پال</label>
          <input name="gatewayMerchantId" className="input" defaultValue={settings.gatewayMerchantId} />
        </div>
        <div className="flex items-end gap-3">
          <label className="flex items-center gap-2 pb-2 text-xs">
            <input type="checkbox" name="gatewayEnabled" defaultChecked={settings.gatewayEnabled} /> فعال
          </label>
          <button type="submit" className="btn btn-primary flex-1">
            ذخیره
          </button>
        </div>
      </form>

      <section className="glass card overflow-x-auto p-6">
        <h2 className="mb-3 text-sm font-bold text-slate-800">تراکنش‌ها</h2>
        <table className="data w-full min-w-[680px]">
          <thead>
            <tr>
              <th>مشتری</th>
              <th>درگاه</th>
              <th>مبلغ</th>
              <th>وضعیت</th>
              <th>کد رهگیری</th>
              <th>تاریخ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.tx.id}>
                <td className="font-bold text-slate-800">{r.customer}</td>
                <td>{r.tx.gateway}</td>
                <td>{toman(r.tx.amount)}</td>
                <td className={r.tx.status === "SUCCESS" ? "text-emerald-600" : "text-slate-500"}>
                  {r.tx.status}
                </td>
                <td>{r.tx.refId ?? "—"}</td>
                <td>{faDate(r.tx.createdAt)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-xs text-slate-500">
                  تراکنشی ثبت نشده است.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
