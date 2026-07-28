"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";

export type NavUser = { name: string; role: string } | null;

export default function Navbar({ user, siteName }: { user: NavUser; siteName: string }) {
  const { items } = useCart();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "خانه" },
    { href: "/shop", label: "فروشگاه" },
    { href: "/blog", label: "وبلاگ" },
    { href: "/#how", label: "چطور کار می‌کنیم" },
  ];

  return (
    <header className="sticky top-0 z-50 px-3 pt-3">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="brand-gradient grid h-9 w-9 place-items-center rounded-xl text-sm font-black text-white">
              Z
            </span>
            <span className="text-lg font-extrabold brand-text">{siteName}</span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/70 hover:text-indigo-700"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/cart" className="btn btn-ghost relative !px-3">
            <span>🛒</span>
            <span className="hidden sm:inline">سبد خرید</span>
            {items.length > 0 && (
              <span className="absolute -top-2 -left-2 grid h-5 w-5 place-items-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                {items.length}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              {(user.role === "ADMIN" || user.role === "OWNER") && (
                <Link href="/admin" className="btn btn-ghost hidden sm:inline-flex">
                  پنل مدیریت
                </Link>
              )}
              <Link href="/account" className="btn btn-primary">
                {user.name.split(" ")[0]}
              </Link>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary">
              ورود / ثبت‌نام
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="btn btn-ghost md:hidden !px-3"
            aria-label="منو"
          >
            ☰
          </button>
        </div>
      </nav>
      {open && (
        <div className="glass mx-auto mt-2 max-w-6xl rounded-2xl p-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white/70"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
