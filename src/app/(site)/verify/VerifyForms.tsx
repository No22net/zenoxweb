"use client";

import { useActionState } from "react";
import { sendOtpAction, verifyOtpAction, type ActionState } from "@/app/actions/auth";

const initial: ActionState = { ok: false, message: "" };

export function VerifyCard({
  channel,
  title,
  target,
  verified,
}: {
  channel: "PHONE" | "EMAIL";
  title: string;
  target: string;
  verified: boolean;
}) {
  const [sendState, sendAction, sending] = useActionState(sendOtpAction, initial);
  const [verifyState, verifyActionFn, verifying] = useActionState(verifyOtpAction, initial);

  return (
    <div className="glass card space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500">{target}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold ${
            verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {verified ? "تایید شده" : "تایید نشده"}
        </span>
      </div>

      {!verified && (
        <>
          <form action={sendAction}>
            <input type="hidden" name="channel" value={channel} />
            <button type="submit" disabled={sending} className="btn btn-ghost w-full">
              {sending ? "در حال ارسال..." : "ارسال کد تایید"}
            </button>
          </form>

          {sendState.message && (
            <p
              className={`rounded-xl px-3 py-2 text-xs ${
                sendState.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              }`}
            >
              {sendState.message}
              {sendState.devCode && (
                <span className="block font-bold">کد تست: {sendState.devCode}</span>
              )}
            </p>
          )}

          <form action={verifyActionFn} className="flex gap-2">
            <input type="hidden" name="channel" value={channel} />
            <input name="code" className="input" placeholder="کد ۶ رقمی" inputMode="numeric" required />
            <button type="submit" disabled={verifying} className="btn btn-primary">
              تایید
            </button>
          </form>

          {verifyState.message && (
            <p
              className={`rounded-xl px-3 py-2 text-xs ${
                verifyState.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              }`}
            >
              {verifyState.message}
            </p>
          )}
        </>
      )}
    </div>
  );
}
