import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { deletePostAction, savePostAction } from "@/app/actions/admin";
import { faDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ edit?: string }>;

export default async function AdminBlogPage({ searchParams }: { searchParams: SearchParams }) {
  const { edit } = await searchParams;
  const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  const editing = edit ? rows.find((r) => r.id === edit) ?? null : null;

  return (
    <div className="space-y-4">
      <div className="glass card flex items-center justify-between p-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">مدیریت وبلاگ</h1>
          <p className="mt-1 text-xs text-slate-600">
            برای هر مقاله عنوان سئو، توضیحات متا و کلمات کلیدی را تنظیم کنید.
          </p>
        </div>
        {editing && (
          <Link href="/admin/blog" className="btn btn-ghost">
            + مقاله جدید
          </Link>
        )}
      </div>

      <section className="glass card p-6">
        <h2 className="mb-4 text-sm font-bold text-slate-800">
          {editing ? `ویرایش: ${editing.title}` : "افزودن مقاله"}
        </h2>
        <form action={savePostAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <div>
            <label className="label">عنوان</label>
            <input name="title" className="input" defaultValue={editing?.title ?? ""} required />
          </div>
          <div>
            <label className="label">اسلاگ</label>
            <input name="slug" className="input" defaultValue={editing?.slug ?? ""} />
          </div>
          <div className="md:col-span-2">
            <label className="label">خلاصه</label>
            <textarea name="excerpt" className="input min-h-20" defaultValue={editing?.excerpt ?? ""} />
          </div>
          <div className="md:col-span-2">
            <label className="label">محتوا (هر خط یک پاراگراف)</label>
            <textarea name="content" className="input min-h-64" defaultValue={editing?.content ?? ""} />
          </div>
          <div>
            <label className="label">تصویر شاخص (URL)</label>
            <input name="coverImage" className="input" defaultValue={editing?.coverImage ?? ""} />
          </div>
          <div>
            <label className="label">نویسنده</label>
            <input name="authorName" className="input" defaultValue={editing?.authorName ?? "مدیرعامل ZeNOxWeb"} />
          </div>
          <div>
            <label className="label">عنوان سئو</label>
            <input name="seoTitle" className="input" defaultValue={editing?.seoTitle ?? ""} />
          </div>
          <div>
            <label className="label">کلمات کلیدی (با , جدا کنید)</label>
            <input name="keywords" className="input" defaultValue={(editing?.keywords ?? []).join(", ")} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Meta Description</label>
            <textarea name="metaDescription" className="input min-h-20" defaultValue={editing?.metaDescription ?? ""} />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" name="isPublished" defaultChecked={editing?.isPublished ?? false} /> منتشر شود
          </label>
          <div>
            <button type="submit" className="btn btn-primary">
              {editing ? "ذخیره تغییرات" : "افزودن مقاله"}
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
              <th>وضعیت</th>
              <th>تاریخ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="font-bold text-slate-800">{p.title}</td>
                <td className="text-slate-500">{p.slug}</td>
                <td>{p.isPublished ? "منتشر شده" : "پیش‌نویس"}</td>
                <td>{faDate(p.publishedAt ?? p.createdAt)}</td>
                <td className="flex gap-2">
                  <Link href={`/admin/blog?edit=${p.id}`} className="text-xs font-bold text-indigo-700">
                    ویرایش
                  </Link>
                  <form action={deletePostAction}>
                    <input type="hidden" name="id" value={p.id} />
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
