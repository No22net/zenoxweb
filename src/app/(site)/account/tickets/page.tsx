import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCustomerTickets } from "@/lib/support";
import { TICKET_PRIORITY_LABELS, TICKET_STATUS_LABELS } from "@/lib/support";
import { faDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CustomerTicketsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tickets = await getCustomerTickets(user.id);

  return (
    <div className="space-y-6">
      <header className="glass card flex items-center justify-between p-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">تیکت‌های پشتیبانی</h1>
          <p className="mt-1 text-xs text-slate-600">تمام درخواست‌های پشتیبانی و مکاتبه‌های شما</p>
        </div>
        <Link href="/account/tickets/new" className="btn btn-primary">
          + تیکت جدید
        </Link>
      </header>

      <div className="glass card overflow-x-auto p-6">
        {tickets.length === 0 ? (
          <p className="text-xs text-slate-600">تیکتی ثبت نکرده‌اید.</p>
        ) : (
          <table className="data w-full min-w-[640px]">
            <thead>
              <tr>
                <th>موضوع</th>
                <th>اولویت</th>
                <th>وضعیت</th>
                <th>تاریخ ایجاد</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td className="font-bold text-slate-800">{t.subject}</td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] ${
                        t.priority === "URGENT"
                          ? "bg-red-100 text-red-700"
                          : t.priority === "HIGH"
                            ? "bg-orange-100 text-orange-700"
                            : t.priority === "NORMAL"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {TICKET_PRIORITY_LABELS[t.priority as "LOW" | "NORMAL" | "HIGH" | "URGENT"]}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] ${
                        t.status === "OPEN"
                          ? "bg-amber-100 text-amber-700"
                          : t.status === "ANSWERED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {TICKET_STATUS_LABELS[t.status as "OPEN" | "ANSWERED" | "CLOSED"]}
                    </span>
                  </td>
                  <td>{faDate(t.createdAt)}</td>
                  <td>
                    <Link href={`/account/tickets/${t.id}`} className="text-xs font-bold text-indigo-700">
                      باز
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
