"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useCart } from "@/components/CartProvider";
import { submitCartAction, type OrderActionState } from "@/app/actions/orders";
import { toman } from "@/lib/format";

type Plan = { id: string; name: string; monthlyCost: number; description: string };

const initial: OrderActionState = { ok: false, message: "" };

export default function CartView({
  plans,
  authState,
}: {
  plans: Plan[];
  authState: "GUEST" | "UNVERIFIED" | "READY";
}) {
  const { items, remove, update, clear, ready } = useCart();
  const [state, action, pending] = useActionState(submitCartAction, initial);

  useEffect(() => {
    if (state.ok) clear();
  }, [state.ok, clear]);

  if (!ready) return <p className="glass card p-6 text-sm text-slate-600">در حال بارگذاری...</p>;

  if (state.ok) {
    return (
      <div className="glass card space-y-4 p-8 text-center">
        <p className="text-lg font-bold text-emerald-700">{state.message}</p>
        <Link href="/account" className="btn btn-primary">
          پیگیری سفارش در پنل کاربری
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass card space-y-4 p-10 text-center">
        <p className="text-sm text-slate-600">سبد خرید شما خالی است.</p>
        <Link href="/shop" className="btn btn-primary">
          مشاهده قالب‌ها
        </Link>
      </div>
    );
  }

  const designTotal = items.reduce((sum, i) => sum + i.basePrice, 0);
  const hostingTotal = items.reduce(
    (sum, i) => sum + (plans.find((p) => p.id === i.hostingPlanId)?.monthlyCost ?? 0),
    0,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.templateId} className="glass card space-y-4 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                <p className="text-xs text-slate-500">قیمت پایه: {toman(item.basePrice)}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(item.templateId)}
                className="text-xs font-bold text-rose-600"
              >
                حذف
              </button>
            </div>

            <div>
              <label className="label">پلن سرور</label>
              <select
                className="input"
                value={item.hostingPlanId}
                onChange={(e) => update(item.templateId, { hostingPlanId: e.target.value })}
              >
                <option value="">انتخاب کنید</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {toman(p.monthlyCost)} ماهانه
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">توضیحات و سفارشی‌سازی مورد نظر</label>
              <textarea
                className="input min-h-24"
                value={item.notes}
                onChange={(e) => update(item.templateId, { notes: e.target.value })}
                placeholder="مثلا: افزودن پنل مدیریت محصول، اتصال درگاه پرداخت، تغییر رنگ برند..."
              />
            </div>
          </div>
        ))}
      </div>

      <aside className="glass card h-fit space-y-4 p-6">
        <h2 className="text-sm font-bold text-slate-800">خلاصه درخواست</h2>
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>جمع قیمت پایه طراحی</span>
            <span className="font-bold text-slate-800">{toman(designTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>جمع سرور (ماهانه)</span>
            <span className="font-bold text-slate-800">{toman(hostingTotal)}</span>
          </div>
        </div>
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-6 text-amber-800">
          این مبلغ تخمینی است. قیمت نهایی طراحی پس از بررسی سفارشی‌سازی‌ها توسط کارشناس در پیش‌فاکتور
          اعلام می‌شود و پرداخت فقط پس از تایید شما انجام خواهد شد.
        </p>

        {authState === "GUEST" && (
          <Link href="/login" className="btn btn-primary w-full">
            ورود برای ثبت درخواست
          </Link>
        )}
        {authState === "UNVERIFIED" && (
          <Link href="/verify" className="btn btn-primary w-full">
            تکمیل احراز هویت (موبایل و ایمیل)
          </Link>
        )}
        {authState === "READY" && (
          <form action={action}>
            <input type="hidden" name="items" value={JSON.stringify(items)} />
            <button type="submit" disabled={pending} className="btn btn-primary w-full">
              {pending ? "در حال ثبت..." : "ثبت درخواست و دریافت پیش‌فاکتور"}
            </button>
          </form>
        )}

        {state.message && !state.ok && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{state.message}</p>
        )}
      </aside>
    </div>
  );
}
