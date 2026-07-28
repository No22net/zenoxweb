import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { VerifyCard } from "./VerifyForms";

export const dynamic = "force-dynamic";

export default async function VerifyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const done = user.phoneVerified && user.emailVerified;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="glass card p-6">
        <h1 className="text-xl font-black text-slate-900">احراز هویت حساب</h1>
        <p className="mt-2 text-xs leading-6 text-slate-600">
          برای ثبت سفارش باید هم شماره موبایل و هم ایمیل شما تایید شده باشد.
        </p>
      </div>

      <VerifyCard channel="PHONE" title="تایید شماره موبایل" target={user.phone} verified={user.phoneVerified} />
      <VerifyCard channel="EMAIL" title="تایید ایمیل" target={user.email} verified={user.emailVerified} />

      {done && (
        <div className="glass card space-y-3 p-6 text-center">
          <p className="text-sm font-bold text-emerald-700">احراز هویت شما کامل است ✅</p>
          <div className="flex justify-center gap-2">
            <Link href="/shop" className="btn btn-primary">
              انتخاب قالب
            </Link>
            <Link href="/account" className="btn btn-ghost">
              پنل کاربری
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
