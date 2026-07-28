"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type ActionState } from "@/app/actions/auth";

const initial: ActionState = { ok: false, message: "" };

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <div className="mx-auto max-w-md">
      <form action={action} className="glass card space-y-4 p-8">
        <h1 className="text-xl font-black text-slate-900">ورود به حساب کاربری</h1>
        <p className="text-xs leading-6 text-slate-600">
          برای ثبت سفارش و پیگیری پیش‌فاکتور وارد شوید.
        </p>

        <div>
          <label className="label">ایمیل یا شماره موبایل</label>
          <input name="identifier" className="input" placeholder="owner@zenoxweb.ir" required />
        </div>
        <div>
          <label className="label">رمز عبور</label>
          <input name="password" type="password" className="input" required />
        </div>

        {state.message && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{state.message}</p>
        )}

        <button type="submit" disabled={pending} className="btn btn-primary w-full">
          {pending ? "در حال ورود..." : "ورود"}
        </button>

        <p className="text-center text-xs text-slate-600">
          حساب ندارید؟{" "}
          <Link href="/register" className="font-bold text-indigo-700">
            ثبت‌نام کنید
          </Link>
        </p>
      </form>
    </div>
  );
}
