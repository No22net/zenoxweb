import Link from "next/link";
import type { Settings } from "@/lib/settings";
import { parseSocials } from "@/lib/settings";

export default function Footer({ settings }: { settings: Settings }) {
  const socials = parseSocials(settings.socials);
  const whatsapp = settings.whatsappNumber?.replace(/\D/g, "");

  return (
    <footer className="mt-20 px-3 pb-6">
      <div className="glass mx-auto max-w-6xl rounded-3xl p-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="brand-gradient grid h-9 w-9 place-items-center rounded-xl text-sm font-black text-white">
                Z
              </span>
              <span className="text-lg font-extrabold brand-text">{settings.siteName}</span>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              طراحی و ساخت سایت‌های آماده و اختصاصی با Next.js؛ از رزومه شخصی تا فروشگاه‌های بزرگ.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold text-slate-800">دسترسی سریع</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/shop" className="hover:text-indigo-700">فروشگاه قالب‌ها</Link></li>
              <li><Link href="/blog" className="hover:text-indigo-700">وبلاگ</Link></li>
              <li><Link href="/account" className="hover:text-indigo-700">پنل کاربری</Link></li>
              <li><Link href="/cart" className="hover:text-indigo-700">سبد خرید</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold text-slate-800">پشتیبانی</h4>
            <div className="flex flex-col gap-2">
              {settings.telegramId && (
                <a
                  className="btn btn-ghost justify-start"
                  href={`https://t.me/${settings.telegramId.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  ✈️ تلگرام پشتیبانی
                </a>
              )}
              {whatsapp && (
                <a
                  className="btn btn-ghost justify-start"
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  🟢 واتساپ پشتیبانی
                </a>
              )}
              <p className="mt-1 text-xs text-slate-600">{settings.supportEmail}</p>
              <p className="text-xs text-slate-600">{settings.supportPhone}</p>
              <p className="text-xs text-slate-600">{settings.address}</p>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold text-slate-800">نماد اعتماد و شبکه‌ها</h4>
            <div className="glass-soft mb-3 grid h-28 w-28 place-items-center rounded-2xl p-2">
              {settings.enamadImage ? (
                <a href={settings.enamadLink || "#"} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.enamadImage} alt="نماد اعتماد الکترونیکی" className="max-h-24" />
                </a>
              ) : (
                <span className="text-center text-[11px] leading-5 text-slate-500">
                  محل نماد اعتماد الکترونیکی
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 hover:text-indigo-700"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/70 pt-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {settings.siteName} — تمامی حقوق محفوظ است. ZeNOxWeb.ir
        </div>
      </div>
    </footer>
  );
}
