import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import { getActivePlans, getTemplateBySlug } from "@/lib/queries";
import { toman } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template) return { title: "قالب یافت نشد" };
  return {
    title: template.title,
    description: template.description.slice(0, 160),
    keywords: [...template.techStack, "طراحی سایت حرفه ای", "سایت ساز"],
  };
}

function cover(value: string) {
  if (!value) return "linear-gradient(135deg,#c7d2fe,#a5f3fc)";
  if (value.startsWith("linear-gradient")) return value;
  return `url(${value}) center/cover`;
}

export default async function TemplatePage({ params }: { params: Params }) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template || !template.isActive) notFound();
  const plans = await getActivePlans();

  return (
    <div className="space-y-8">
      <div className="glass card overflow-hidden">
        <div className="h-56 w-full" style={{ background: cover(template.coverImage) }} />
        <div className="grid gap-8 p-8 md:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5">
            <h1 className="text-2xl font-black text-slate-900">{template.title}</h1>
            <p className="text-sm leading-8 text-slate-600">{template.description}</p>

            <div>
              <h2 className="mb-2 text-sm font-bold text-slate-800">امکانات قالب</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {template.features.map((f) => (
                  <li key={f} className="glass-soft rounded-xl px-3 py-2 text-xs text-slate-700">
                    ✓ {f}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-bold text-slate-800">تکنولوژی‌ها</h2>
              <div className="flex flex-wrap gap-2">
                {template.techStack.map((t) => (
                  <span key={t} className="rounded-lg bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <aside className="glass-soft card h-fit space-y-4 p-6">
            <div>
              <p className="text-xs text-slate-500">قیمت پایه طراحی</p>
              <p className="text-2xl font-black brand-text">{toman(template.basePrice)}</p>
              <p className="mt-1 text-[11px] leading-6 text-slate-500">
                قیمت نهایی پس از بررسی سفارشی‌سازی‌های شما به‌صورت پیش‌فاکتور اعلام می‌شود.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">پلن‌های سرور</p>
              {plans.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-xs">
                  <span className="text-slate-700">{p.name}</span>
                  <span className="font-bold text-slate-800">{toman(p.monthlyCost)} / ماه</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <AddToCartButton
                goToCart
                item={{
                  templateId: template.id,
                  slug: template.slug,
                  title: template.title,
                  basePrice: template.basePrice,
                  coverImage: template.coverImage,
                  notes: "",
                  hostingPlanId: plans[0]?.id ?? "",
                }}
              />
              {template.demoUrl && (
                <a href={template.demoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
                  مشاهده دمو
                </a>
              )}
              <Link href="/shop" className="text-center text-xs text-slate-500 hover:text-indigo-700">
                بازگشت به فروشگاه
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
