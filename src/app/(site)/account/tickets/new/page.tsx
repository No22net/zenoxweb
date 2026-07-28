"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createTicketAction, type SupportActionState } from "@/app/actions/support";

const initial: SupportActionState = { ok: false, message: "" };

export default function NewTicketPage() {
  const [state, action, pending] = useActionState(createTicketAction, initial);

  if (state.ok) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="glass card space-y-4 p-10 text-center">
          <p className="text-lg font-bold text-emerald-700">تیکت شما با موفقیت ثبت شد ✅</p>
          <p className="text-sm text-slate-600">
            تیکت <strong>#{state.ticketId?.slice(0, 8)}</strong> ثبت شده است. تیم پشتیبانی در اسرع وقت
            به شما پاسخ خواهد داد.
          </p>
          <div className="flex gap-2 justify-center">
            <Link href={`/account/tickets/${state.ticketId}`} className="btn btn-primary">
              مشاهده تیکت
            </Link>
            <Link href="/account/tickets" className="btn btn-ghost">
              بازگشت به تیکت‌ها
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="glass card p-6">
        <h1 className="text-xl font-black text-slate-900">ثبت تیکت جدید</h1>
        <p className="mt-1 text-xs text-slate-600">
          برای پاسخ سریع‌تر، موضوع و پیام خود را به‌طور شفاف و کامل بنویسید.
        </p>
      </header>

      <form action={action} className="glass card space-y-4 p-6">
        <div>
          <label className="label">موضوع</label>
          <input
            name="subject"
            className="input"
            placeholder="مثلا: سوال درباره افزودن قابلیت..."
            required
          />
        </div>

        <div>
          <label className="label">اولویت</label>
          <select name="priority" defaultValue="NORMAL" className="input">
            <option value="LOW">کم</option>
            <option value="NORMAL">عادی</option>
            <option value="HIGH">بالا</option>
            <option value="URGENT">فوری</option>
          </select>
        </div>

        <div>
          <label className="label">پیام</label>
          <textarea
            name="message"
            className="input min-h-32"
            placeholder="جزئیات مسئله یا سوال خود را بنویسید..."
            required
          />
        </div>

        {state.message && (
          <p className={`rounded-xl px-3 py-2 text-xs ${state.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {state.message}
          </p>
        )}

        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="btn btn-primary flex-1">
            {pending ? "در حال ثبت..." : "ثبت تیکت"}
          </button>
          <Link href="/account/tickets" className="btn btn-ghost">
            بازگشت
          </Link>
        </div>
      </form>
    </div>
  );
}
