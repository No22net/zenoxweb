import Link from "next/link";
import TemplateCard from "@/components/TemplateCard";
import { getFeaturedTemplates } from "@/lib/queries";
import { getSettings, parseBlocks } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();
  const blocks = parseBlocks(settings.homepageBlocks).filter((b) => b.visible);
  const featured = await getFeaturedTemplates(3);

  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="glass card relative overflow-hidden p-8 md:p-14">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="relative grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <span className="glass-soft inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-indigo-700">
              ⚡ ساخته‌شده با Next.js و TypeScript
            </span>
            <h1 className="text-3xl font-black leading-[1.35] text-slate-900 md:text-5xl md:leading-[1.3]">
              {settings.heroTitle || "سایت حرفه‌ای کسب‌وکارت را آماده تحویل بگیر"}
            </h1>
            <p className="max-w-xl text-sm leading-8 text-slate-600 md:text-base">
              {settings.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={settings.heroCtaLink || "/shop"} className="btn btn-primary !px-7 !py-3 text-base">
                {settings.heroCtaText || "ساخت سایت شخصی خودتون"}
              </Link>
              <Link href="/blog" className="btn btn-ghost !px-6 !py-3">
                مطالعه وبلاگ
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-600">
              <span>✅ تحویل بین ۳ تا ۱۴ روز</span>
              <span>✅ پیش‌فاکتور شفاف قبل از پرداخت</span>
              <span>✅ میزبانی و پشتیبانی</span>
            </div>
          </div>

          <div className="glass-soft card space-y-4 p-6">
            <p className="text-sm font-bold text-slate-700">هزینه سایت شما = طراحی + سرور</p>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3">
                <span>قالب انتخابی</span>
                <span className="font-bold text-slate-800">دلخواه شما</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3">
                <span>سفارشی‌سازی</span>
                <span className="font-bold text-slate-800">قیمت‌گذاری توسط کارشناس</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3">
                <span>پلن سرور</span>
                <span className="font-bold text-slate-800">معمولی / پرو / الماس</span>
              </div>
            </div>
            <p className="text-[11px] leading-6 text-slate-500">
              ابتدا درخواست ثبت می‌کنید، سپس پیش‌فاکتور دریافت می‌کنید و فقط بعد از تایید شما پرداخت
              انجام می‌شود.
            </p>
          </div>
        </div>
      </section>

      {blocks.map((block) => {
        if (block.type === "featured") {
          return (
            <section key={block.id} className="space-y-6">
              <SectionHead title={block.title} subtitle={block.subtitle} />
              <div className="grid gap-5 md:grid-cols-3">
                {featured.map((t) => (
                  <TemplateCard key={t.id} template={t} />
                ))}
              </div>
              <div className="text-center">
                <Link href="/shop" className="btn btn-ghost">
                  مشاهده همه نمونه‌کارها
                </Link>
              </div>
            </section>
          );
        }

        if (block.type === "stats") {
          return (
            <section key={block.id} className="space-y-6">
              <SectionHead title={block.title} subtitle={block.subtitle} />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {block.items.map((item) => (
                  <div key={item.title} className="glass card p-6 text-center">
                    <div className="text-3xl">{item.icon}</div>
                    <div className="mt-2 text-2xl font-black brand-text">{item.title}</div>
                    <div className="mt-1 text-xs text-slate-600">{item.text}</div>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === "steps") {
          return (
            <section key={block.id} id="how" className="space-y-6">
              <SectionHead title={block.title} subtitle={block.subtitle} />
              <div className="grid gap-4 md:grid-cols-5">
                {block.items.map((item, index) => (
                  <div key={item.title} className="glass card relative p-5">
                    <span className="absolute -top-3 -right-3 grid h-8 w-8 place-items-center rounded-full brand-gradient text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="text-2xl">{item.icon}</div>
                    <h3 className="mt-2 text-sm font-bold text-slate-800">{item.title}</h3>
                    <p className="mt-1 text-xs leading-6 text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        return (
          <section key={block.id} className="space-y-6">
            <SectionHead title={block.title} subtitle={block.subtitle} />
            <div className="grid gap-4 md:grid-cols-3">
              {block.items.map((item) => (
                <div key={item.title} className="glass card p-6">
                  <div className="text-2xl">{item.icon}</div>
                  <h3 className="mt-2 text-sm font-bold text-slate-800">{item.title}</h3>
                  <p className="mt-1 text-xs leading-6 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <section className="glass card flex flex-col items-center gap-4 p-10 text-center">
        <h2 className="text-2xl font-black text-slate-900">آماده‌ای سایتت را بسازی؟</h2>
        <p className="max-w-xl text-sm leading-7 text-slate-600">
          قالب مورد علاقه‌ات را انتخاب کن، سفارشی‌سازی دلخواهت را بنویس و پیش‌فاکتور دقیق دریافت کن.
        </p>
        <Link href="/shop" className="btn btn-primary !px-8 !py-3 text-base">
          {settings.heroCtaText || "ساخت سایت شخصی خودتون"}
        </Link>
      </section>
    </div>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-black text-slate-900">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
    </div>
  );
}
