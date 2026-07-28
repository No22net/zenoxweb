import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, templateCategories, templates } from "@/db/schema";
import { deleteTemplateAction, saveTemplateAction } from "@/app/actions/admin";
import { toman } from "@/lib/format";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ edit?: string }>;

export default async function AdminTemplatesPage({ searchParams }: { searchParams: SearchParams }) {
  const { edit } = await searchParams;
  const [rows, cats] = await Promise.all([
    db.select().from(templates).orderBy(desc(templates.createdAt)),
    db.select().from(categories).orderBy(categories.sortOrder),
  ]);

  const editing = edit ? rows.find((r) => r.id === edit) ?? null : null;
  const editingCats = editing
    ? (await db.select().from(templateCategories).where(eq(templateCategories.templateId, editing.id))).map(
        (r) => r.categoryId,
      )
    : [];

  return (
    <div className="space-y-4">
      <div className="glass card flex items-center justify-between p-6">
        <h1 className="text-xl font-black text-slate-900">مدیریت نمونه‌کارها</h1>
        {editing && (
          <Link href="/admin/templates" className="btn btn-ghost">
            + قالب جدید
          </Link>
        )}
      </div>

      <section className="glass card p-6">
        <h2 className="mb-4 text-sm font-bold text-slate-800">
          {editing ? `ویرایش: ${editing.title}` : "افزودن قالب جدید"}
        </h2>
        <form action={saveTemplateAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <div>
            <label className="label">عنوان</label>
            <input name="title" className="input" defaultValue={editing?.title ?? ""} required />
          </div>
          <div>
            <label className="label">اسلاگ (انگلیسی)</label>
            <input name="slug" className="input" defaultValue={editing?.slug ?? ""} placeholder="neon-shop" />
          </div>
          <div className="md:col-span-2">
            <label className="label">توضیحات</label>
            <textarea name="description" className="input min-h-24" defaultValue={editing?.description ?? ""} />
          </div>
          <div>
            <label className="label">قیمت پایه (تومان)</label>
            <input name="basePrice" className="input" inputMode="numeric" defaultValue={editing?.basePrice ?? 0} />
          </div>
          <div>
            <label className="label">لینک دمو</label>
            <input name="demoUrl" className="input" defaultValue={editing?.demoUrl ?? ""} />
          </div>
          <div>
            <label className="label">تصویر کاور (URL یا linear-gradient)</label>
            <input name="coverImage" className="input" defaultValue={editing?.coverImage ?? ""} />
          </div>
          <div>
            <label className="label">گالری تصاویر (هر خط یک URL)</label>
            <textarea name="images" className="input min-h-20" defaultValue={(editing?.images ?? []).join("\n")} />
          </div>
          <div>
            <label className="label">امکانات (هر خط یک مورد)</label>
            <textarea name="features" className="input min-h-24" defaultValue={(editing?.features ?? []).join("\n")} />
          </div>
          <div>
            <label className="label">تکنولوژی‌ها (هر خط یک مورد)</label>
            <textarea name="techStack" className="input min-h-24" defaultValue={(editing?.techStack ?? []).join("\n")} />
          </div>
          <div className="md:col-span-2">
            <label className="label">دسته‌بندی‌ها</label>
            <div className="flex flex-wrap gap-3">
              {cats.map((c) => (
                <label key={c.id} className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2 text-xs">
                  <input
                    type="checkbox"
                    name="categoryIds"
                    value={c.id}
                    defaultChecked={editingCats.includes(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" name="isActive" defaultChecked={editing ? editing.isActive : true} /> فعال
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" name="isFeatured" defaultChecked={editing?.isFeatured ?? false} /> نمایش در
              نمونه‌کارهای برتر
            </label>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn btn-primary">
              {editing ? "ذخیره تغییرات" : "افزودن قالب"}
            </button>
          </div>
        </form>
      </section>

      <section className="glass card overflow-x-auto p-6">
        <table className="data w-full min-w-[620px]">
          <thead>
            <tr>
              <th>عنوان</th>
              <th>اسلاگ</th>
              <th>قیمت پایه</th>
              <th>وضعیت</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td className="font-bold text-slate-800">{t.title}</td>
                <td className="text-slate-500">{t.slug}</td>
                <td>{toman(t.basePrice)}</td>
                <td>
                  <span className={`rounded-full px-2 py-1 text-[11px] ${t.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                    {t.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </td>
                <td className="flex gap-2">
                  <Link href={`/admin/templates?edit=${t.id}`} className="text-xs font-bold text-indigo-700">
                    ویرایش
                  </Link>
                  <form action={deleteTemplateAction}>
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" className="text-xs font-bold text-rose-600">
                      حذف
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
