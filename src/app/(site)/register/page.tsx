"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type ActionState } from "@/app/actions/auth";

const initial: ActionState = { ok: false, message: "" };

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, initial);

  return (
    <div className="mx-auto max-w-md">
      <form action={action} className="glass card space-y-4 p-8">
        <h1 className="text-xl font-black text-slate-900">ساخت حساب کاربری</h1>
        <p className="text-xs leading-6 text-slate-600">
          پس از ثبت‌نام باید شماره موبایل و ایمیل خود را تایید کنید.
        </p>

        <div>
          <label className="label">نام و نام خانوادگی</label>
          <input name="name" className="input" required />
        </div>
        <div>
          <label className="label">شماره موبایل</label>
          <input name="phone" className="input" placeholder="09121234567" required />
        </div>
        <div>
          <label className="label">ایمیل</label>
          <input name="email" type="email" className="input" required />
        </div>
        <div>
          <label className="label">رمز عبور (حداقل ۸ کاراکتر)</label>
          <input name="password" type="password" className="input" required />
        </div>

        {state.message && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{state.message}</p>
        )}

        <button type="submit" disabled={pending} className="btn btn-primary w-full">
          {pending ? "در حال ثبت..." : "ثبت‌نام"}
        </button>

        <p className="text-center text-xs text-slate-600">
          حساب دارید؟{" "}
          <Link href="/login" className="font-bold text-indigo-700">
            وارد شوید
          </Link>
        </p>
      </form>
    </div>
  );
}
