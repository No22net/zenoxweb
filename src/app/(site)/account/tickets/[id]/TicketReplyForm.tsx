"use client";

import { useActionState } from "react";
import { replyTicketAction, type SupportActionState } from "@/app/actions/support";

export default function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const [state, formAction, pending] = useActionState(replyTicketAction, { ok: false, message: "" });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="ticketId" value={ticketId} />
      <div>
        <textarea
          name="message"
          className="input min-h-24"
          placeholder="پیام خود را بنویسید..."
          required
        />
      </div>
      {state.message && (
        <p className={`rounded-xl px-3 py-2 text-xs ${state.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "در حال ارسال..." : "ارسال پاسخ"}
      </button>
    </form>
  );
}
