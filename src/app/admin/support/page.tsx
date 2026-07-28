import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { supportTickets, users } from "@/db/schema";
import { TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS } from "@/lib/support";
import { faDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

export default async function AdminSupportPage({ searchParams }: { searchParams: SearchParams }) {
  const { status } = await searchParams;

  const query = db
    .select({
      ticket: supportTickets,
      customerName: users.name,
      customerEmail: users.email,
    })
    .from(supportTickets)
    .innerJoin(users, eq(supportTickets.customerId, users.id));

  const rows = status ? await query.where(eq(supportTickets.status, status)).orderBy(desc(supportTickets.updatedAt)) : await query.orderBy(desc(supportTickets.updatedAt));

  return (
    <div className="space-y-4">
      <div className="glass card p-6">
        <h1 className="text-xl font-black text-slate-900">مدیریت تیکت‌های پشتیبانی</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/support" className={`rounded-lg px-3 py-1 text-xs ${!status ? "brand-gradient text-white" : "bg-white/70 text-slate-600"}`}>
            همه
          </Link>
          {Object.entries(TICKET_STATUS_LABELS).map(([key, label]) => (
            <Link
              key={key}
              href={`/admin/support?status=${key}`}
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
              <th>موضوع</th>
              <th>اولویت</th>
              <th>وضعیت</th>
              <th>تاریخ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.ticket.id}>
                <td>
                  <div className="font-bold text-slate-800">{r.customerName}</div>
                  <div className="text-[11px] text-slate-500">{r.customerEmail}</div>
                </td>
                <td className="font-bold text-slate-800">{r.ticket.subject}</td>
                <td>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] ${
                      r.ticket.priority === "URGENT"
                        ? "bg-red-100 text-red-700"
                        : r.ticket.priority === "HIGH"
                          ? "bg-orange-100 text-orange-700"
                          : r.ticket.priority === "NORMAL"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {TICKET_PRIORITY_LABELS[r.ticket.priority as "LOW" | "NORMAL" | "HIGH" | "URGENT"]}
                  </span>
                </td>
                <td>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] ${
                      r.ticket.status === "OPEN"
                        ? "bg-amber-100 text-amber-700"
                        : r.ticket.status === "ANSWERED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {TICKET_STATUS_LABELS[r.ticket.status as "OPEN" | "ANSWERED" | "CLOSED"]}
                  </span>
                </td>
                <td>{faDate(r.ticket.updatedAt)}</td>
                <td>
                  <Link href={`/account/tickets/${r.ticket.id}`} className="btn btn-ghost !py-1 !px-3 text-xs">
                    جواب دادن
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-xs text-slate-500">
                  تیکتی یافت نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
