import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getTicket, TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS } from "@/lib/support";
import { updateTicketStatusAction } from "@/app/actions/support";
import { faDate } from "@/lib/format";
import TicketReplyForm from "./TicketReplyForm";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function TicketDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getTicket(id, user.id);
  if (!data) notFound();

  const { ticket, customer, replies } = data;
  const isStaff = user.role !== "CUSTOMER";
  const isOwner = ticket.customerId === user.id;

  if (!isOwner && !isStaff) notFound();

  return (
    <div className="space-y-6">
      <header className="glass card flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">
            تیکت #{ticket.id.slice(0, 8)} - {ticket.subject}
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            توسط {customer?.name} — {faDate(ticket.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs ${
              ticket.status === "OPEN"
                ? "bg-amber-100 text-amber-700"
                : ticket.status === "ANSWERED"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-700"
            }`}
          >
            {TICKET_STATUS_LABELS[ticket.status as "OPEN" | "ANSWERED" | "CLOSED"]}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs ${
              ticket.priority === "URGENT"
                ? "bg-red-100 text-red-700"
                : ticket.priority === "HIGH"
                  ? "bg-orange-100 text-orange-700"
                  : ticket.priority === "NORMAL"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-700"
            }`}
          >
            {TICKET_PRIORITY_LABELS[ticket.priority as "LOW" | "NORMAL" | "HIGH" | "URGENT"]}
          </span>
        </div>
      </header>

      <section className="glass card space-y-3 p-6">
        <div className="rounded-xl bg-white/70 p-4 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
          {ticket.message}
        </div>
      </section>

      {replies.length > 0 && (
        <section className="glass card space-y-4 p-6">
          <h2 className="text-sm font-bold text-slate-800">پاسخ‌ها</h2>
          {replies.map((r) => (
            <div key={r.id} className={`rounded-xl p-4 ${r.isStaff ? "bg-indigo-50" : "bg-slate-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-700">{r.sender}</span>
                {r.isStaff && <span className="rounded-full bg-indigo-200 px-2 py-0.5 text-[10px] text-indigo-700">تیم پشتیبانی</span>}
                <span className="text-[11px] text-slate-500">{faDate(r.createdAt)}</span>
              </div>
              <p className="text-xs leading-6 text-slate-700 whitespace-pre-wrap">{r.message}</p>
            </div>
          ))}
        </section>
      )}

      <section className="glass card space-y-4 p-6">
        <h2 className="text-sm font-bold text-slate-800">پاسخ جدید</h2>
        <TicketReplyForm ticketId={ticket.id} />
      </section>

      {isStaff && (
        <StaffManageForm ticketId={ticket.id} currentStatus={ticket.status} />
      )}

      <Link href="/account/tickets" className="btn btn-ghost">
        بازگشت به تیکت‌ها
      </Link>
    </div>
  );
}

function StaffManageForm({ ticketId, currentStatus }: { ticketId: string; currentStatus: string }) {
  "use client";
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await updateTicketStatusAction(fd);
  };

  return (
    <section className="glass card space-y-3 p-6">
      <h2 className="text-sm font-bold text-slate-800">مدیریت تیکت (فقط برای تیم)</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input type="hidden" name="ticketId" value={ticketId} />
        <select name="status" defaultValue={currentStatus} className="input">
          <option value="OPEN">باز</option>
          <option value="ANSWERED">پاسخ داده شده</option>
          <option value="CLOSED">بسته شده</option>
        </select>
        <button type="submit" className="btn btn-primary">
          بروزرسانی
        </button>
      </form>
    </section>
  );
}
