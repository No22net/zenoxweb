import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { deleteCategoryAction, saveCategoryAction } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder));

  return (
    <div className="space-y-4">
      <div className="glass card p-6">
        <h1 className="text-xl font-black text-slate-900">دسته‌بندی محصولات</h1>
        <p className="mt-1 text-xs text-slate-600">
          هر دسته‌بندی به‌صورت یک ستون در صفحه فروشگاه نمایش داده می‌شود.
        </p>
      </div>

      <section className="glass card p-6">
        <h2 className="mb-4 text-sm font-bold text-slate-800">افزودن دسته‌بندی</h2>
        <form action={saveCategoryAction} className="grid gap-3 md:grid-cols-5">
          <input type="hidden" name="id" value="" />
          <div>
            <label className="label">نام</label>
            <input name="name" className="input" required />
          </div>
          <div>
            <label className="label">اسلاگ</label>
            <input name="slug" className="input" placeholder="popular" />
          </div>
          <div>
            <label className="label">توضیح کوتاه</label>
            <input name="description" className="input" />
          </div>
          <div>
            <label className="label">ترتیب نمایش</label>
            <input name="sortOrder" className="input" inputMode="numeric" defaultValue={rows.length + 1} />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" name="isActive" defaultChecked /> فعال
            </label>
            <button type="submit" className="btn btn-primary flex-1">
              افزودن
            </button>
          </div>
        </form>
      </section>

      <section className="glass card space-y-3 p-6">
        {rows.map((c) => (
          <form key={c.id} action={saveCategoryAction} className="grid items-end gap-3 md:grid-cols-6">
            <input type="hidden" name="id" value={c.id} />
            <div>
              <label className="label">نام</label>
              <input name="name" className="input" defaultValue={c.name} />
            </div>
            <div>
              <label className="label">اسلاگ</label>
              <input name="slug" className="input" defaultValue={c.slug} />
            </div>
            <div>
              <label className="label">توضیح</label>
              <input name="description" className="input" defaultValue={c.description} />
            </div>
            <div>
              <label className="label">ترتیب</label>
              <input name="sortOrder" className="input" defaultValue={c.sortOrder} />
            </div>
            <label className="flex items-center gap-2 pb-2 text-xs">
              <input type="checkbox" name="isActive" defaultChecked={c.isActive} /> فعال
            </label>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-ghost flex-1">
                ذخیره
              </button>
              <button
                type="submit"
                formAction={deleteCategoryAction}
                className="btn btn-ghost text-rose-600"
              >
                حذف
              </button>
            </div>
          </form>
        ))}
      </section>
    </div>
  );
}
