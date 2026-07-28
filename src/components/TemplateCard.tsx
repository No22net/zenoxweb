import Link from "next/link";
import type { TemplateRow } from "@/lib/queries";
import { toman } from "@/lib/format";
import AddToCartButton from "./AddToCartButton";

function cover(value: string) {
  if (!value) return "linear-gradient(135deg,#c7d2fe,#a5f3fc)";
  if (value.startsWith("linear-gradient") || value.startsWith("radial-gradient")) return value;
  return `url(${value}) center/cover`;
}

export default function TemplateCard({ template }: { template: TemplateRow }) {
  return (
    <article className="glass card group overflow-hidden transition hover:-translate-y-1">
      <div
        className="relative h-36 w-full"
        style={{ background: cover(template.coverImage) }}
      >
        {template.isFeatured && (
          <span className="absolute top-3 right-3 rounded-full bg-white/85 px-2 py-1 text-[11px] font-bold text-indigo-700">
            پیشنهاد ویژه
          </span>
        )}
      </div>
      <div className="space-y-3 p-4">
        <h3 className="text-base font-bold text-slate-800">{template.title}</h3>
        <p className="line-clamp-2 text-xs leading-6 text-slate-600">{template.description}</p>
        <div className="flex flex-wrap gap-1">
          {template.techStack.slice(0, 3).map((t) => (
            <span key={t} className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700">
              {t}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-extrabold text-slate-800">{toman(template.basePrice)}</span>
          <div className="flex gap-2">
            <Link href={`/templates/${template.slug}`} className="btn btn-ghost !py-1.5 !px-3 text-xs">
              جزئیات
            </Link>
            <AddToCartButton
              item={{
                templateId: template.id,
                slug: template.slug,
                title: template.title,
                basePrice: template.basePrice,
                coverImage: template.coverImage,
                notes: "",
                hostingPlanId: "",
              }}
              compact
            />
          </div>
        </div>
      </div>
    </article>
  );
}
