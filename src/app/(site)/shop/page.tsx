import Link from "next/link";
import type { Metadata } from "next";
import TemplateCard from "@/components/TemplateCard";
import {
  getActiveCategories,
  getActiveTemplates,
  getTemplateCategoryMap,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "فروشگاه قالب‌های آماده سایت",
  description:
    "خرید قالب آماده سایت فروشگاهی، رزومه‌ای و شرکتی با امکان سفارشی‌سازی و میزبانی — ZeNOxWeb",
};

type SearchParams = Promise<{ cat?: string; q?: string; min?: string; max?: string; tech?: string }>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [cats, allTemplates] = await Promise.all([getActiveCategories(), getActiveTemplates()]);
  const map = await getTemplateCategoryMap(allTemplates.map((t) => t.id));

  const q = (params.q ?? "").trim();
  const min = params.min ? Number(params.min) : undefined;
  const max = params.max ? Number(params.max) : undefined;
  const tech = (params.tech ?? "").trim();

  const filtered = allTemplates.filter((t) => {
    if (q && !(t.title.includes(q) || t.description.includes(q))) return false;
    if (min !== undefined && !Number.isNaN(min) && t.basePrice < min) return false;
    if (max !== undefined && !Number.isNaN(max) && t.basePrice > max) return false;
    if (tech && !t.techStack.some((s) => s.toLowerCase().includes(tech.toLowerCase()))) return false;
    return true;
  });

  const activeCat = params.cat;
  const hasFilter = Boolean(q || min || max || tech || activeCat);

  const shown = activeCat
    ? filtered.filter((t) => {
        const cat = cats.find((c) => c.slug === activeCat);
        return cat ? (map[t.id] ?? []).includes(cat.id) : false;
      })
    : filtered;

  return (
    <div className="space-y-8">
      <header className="glass card p-8">
        <h1 className="text-2xl font-black text-slate-900">فروشگاه نمونه‌کارها</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          قالب مناسب کسب‌وکارت را انتخاب کن، دمو را ببین و درخواستت را ثبت کن. قیمت نهایی پس از بررسی
          سفارشی‌سازی‌ها به‌صورت پیش‌فاکتور به شما اعلام می‌شود.
        </p>
      </header>

      <form className="glass card grid gap-3 p-5 md:grid-cols-5" action="/shop">
        <div>
          <label className="label">جستجو</label>
          <input name="q" defaultValue={q} className="input" placeholder="نام قالب..." />
        </div>
        <div>
          <label className="label">دسته‌بندی</label>
          <select name="cat" defaultValue={activeCat ?? ""} className="input">
            <option value="">همه دسته‌ها</option>
            {cats.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">حداقل قیمت</label>
          <input name="min" defaultValue={params.min ?? ""} className="input" inputMode="numeric" />
        </div>
        <div>
          <label className="label">حداکثر قیمت</label>
          <input name="max" defaultValue={params.max ?? ""} className="input" inputMode="numeric" />
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn btn-primary flex-1">
            اعمال فیلتر
          </button>
          <Link href="/shop" className="btn btn-ghost">
            حذف
          </Link>
        </div>
      </form>

      {hasFilter ? (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">
            {shown.length} نتیجه یافت شد
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {shown.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {cats.map((cat) => {
            const items = allTemplates.filter((t) => (map[t.id] ?? []).includes(cat.id));
            if (items.length === 0) return null;
            return (
              <section key={cat.id} className="space-y-4">
                <div className="glass-soft card flex items-center justify-between p-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-800">{cat.name}</h2>
                    <p className="text-[11px] text-slate-500">{cat.description}</p>
                  </div>
                  <Link href={`/shop?cat=${cat.slug}`} className="text-xs font-bold text-indigo-700">
                    همه
                  </Link>
                </div>
                <div className="space-y-5">
                  {items.slice(0, 4).map((t) => (
                    <TemplateCard key={`${cat.id}-${t.id}`} template={t} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
