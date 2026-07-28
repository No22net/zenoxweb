import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { ensureSeed } from "@/lib/seed";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "داشبورد", icon: "📊" },
  { href: "/admin/orders", label: "سفارش‌ها", icon: "🧾" },
  { href: "/admin/support", label: "پشتیبانی", icon: "🎧" },
  { href: "/admin/templates", label: "نمونه‌کارها", icon: "🎨" },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: "🗂" },
  { href: "/admin/plans", label: "پلن‌های سرور", icon: "🖥" },
  { href: "/admin/blog", label: "وبلاگ", icon: "✍️" },
  { href: "/admin/homepage", label: "صفحه اصلی", icon: "🏠" },
  { href: "/admin/settings", label: "تنظیمات سایت", icon: "⚙️" },
  { href: "/admin/users", label: "کاربران و ادمین‌ها", icon: "👥", ownerOnly: true },
  { href: "/admin/payments", label: "مالی و درگاه", icon: "💳", ownerOnly: true },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await ensureSeed();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.role !== "OWNER") redirect("/account");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-4 p-4">
      <aside className="glass card sticky top-4 hidden h-fit w-60 shrink-0 space-y-1 p-4 lg:block">
        <Link href="/" className="mb-4 flex items-center gap-2">
          <span className="brand-gradient grid h-9 w-9 place-items-center rounded-xl text-sm font-black text-white">
            Z
          </span>
          <span className="text-base font-extrabold brand-text">پنل ZeNOxWeb</span>
        </Link>
        {nav
          .filter((n) => !n.ownerOnly || user.role === "OWNER")
          .map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-white/80 hover:text-indigo-700"
            >
              <span>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        <div className="mt-4 border-t border-white/70 pt-3 text-xs text-slate-500">
          {user.name} — {user.role === "OWNER" ? "مالک" : "ادمین"}
        </div>
        <form action={logoutAction}>
          <button type="submit" className="btn btn-ghost mt-2 w-full">
            خروج
          </button>
        </form>
      </aside>

      <div className="min-w-0 flex-1 space-y-4">
        <div className="glass card flex flex-wrap items-center gap-2 p-3 lg:hidden">
          {nav
            .filter((n) => !n.ownerOnly || user.role === "OWNER")
            .map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg bg-white/70 px-3 py-1 text-xs">
                {n.label}
              </Link>
            ))}
        </div>
        {children}
      </div>
    </div>
  );
}
