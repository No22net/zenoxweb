import { asc } from "drizzle-orm";
import { db } from "@/db";
import { hostingPlans } from "@/db/schema";
import { deletePlanAction, savePlanAction } from "@/app/actions/admin";
import { num } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const rows = await db.select().from(hostingPlans).orderBy(asc(hostingPlans.sortOrder));

  return (
    <div className="space-y-4">
      <div className="glass card p-6">
        <h1 className="text-xl font-black text-slate-900">پلن‌های هاستینگ / سرور</h1>
        <p className="mt-1 text-xs text-slate-600">
          قیمت این پلن‌ها ثابت است و در پیش‌فاکتور به هزینه طراحی اضافه می‌شود.
        </p>
      </div>

      <section className="glass card p-6">
        <h2 className="mb-4 text-sm font-bold text-slate-800">افزودن پلن جدید</h2>
        <form action={savePlanAction} className="grid gap-3 md:grid-cols-4">
          <input type="hidden" name="id" value="" />
          <div>
            <label className="label">نام پلن</label>
            <input name="name" className="input" required />
          </div>
          <div>
            <label className="label">سطح (BASIC/PRO/DIAMOND)</label>
            <input name="tier" className="input" defaultValue="BASIC" />
          </div>
          <div>
            <label className="label">هزینه ماهانه (تومان)</label>
            <input name="monthlyCost" className="input" inputMode="numeric" defaultValue={0} />
          </div>
          <div>
            <label className="label">ظرفیت سرور (تعداد سایت)</label>
            <input name="capacity" className="input" inputMode="numeric" defaultValue={20} />
          </div>
          <div className="md:col-span-3">
            <label className="label">توضیحات</label>
            <input name="description" className="input" />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 pb-2 text-xs">
              <input type="checkbox" name="isActive" defaultChecked /> فعال
            </label>
            <button type="submit" className="btn btn-primary flex-1">
              افزودن
            </button>
          </div>
        </form>
      </section>

      <section className="glass card space-y-4 p-6">
        {rows.map((p) => (
          <form key={p.id} action={savePlanAction} className="grid items-end gap-3 md:grid-cols-6">
            <input type="hidden" name="id" value={p.id} />
            <div>
              <label className="label">نام</label>
              <input name="name" className="input" defaultValue={p.name} />
            </div>
            <div>
              <label className="label">سطح</label>
              <input name="tier" className="input" defaultValue={p.tier} />
            </div>
            <div>
              <label className="label">هزینه ماهانه</label>
              <input name="monthlyCost" className="input" defaultValue={p.monthlyCost} />
            </div>
            <div>
              <label className="label">ظرفیت / مصرف‌شده</label>
              <div className="flex gap-2">
                <input name="capacity" className="input" defaultValue={p.capacity} />
                <input name="usedCapacity" className="input" defaultValue={p.usedCapacity} />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                ظرفیت آزاد: {num(Math.max(0, p.capacity - p.usedCapacity))}
              </p>
            </div>
            <div>
              <label className="label">توضیح</label>
              <input name="description" className="input" defaultValue={p.description} />
              <input type="hidden" name="sortOrder" value={p.sortOrder} />
            </div>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 pb-2 text-xs">
                <input type="checkbox" name="isActive" defaultChecked={p.isActive} /> فعال
              </label>
              <button type="submit" className="btn btn-ghost">
                ذخیره
              </button>
              <button type="submit" formAction={deletePlanAction} className="btn btn-ghost text-rose-600">
                غیرفعال
              </button>
            </div>
          </form>
        ))}
      </section>
    </div>
  );
}
