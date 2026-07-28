import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/queries";
import { faDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "وبلاگ طراحی سایت و سایت ساز",
  description:
    "مقالات تخصصی درباره سایت ساز، طراحی سایت حرفه‌ای با Next.js، ساخت سایت فروشگاهی و سایت رزومه.",
  keywords: ["سایت ساز", "طراح سایت Next.js", "طراحی سایت حرفه ای", "ساخت سایت فروشگاهی"],
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="space-y-8">
      <header className="glass card p-8">
        <h1 className="text-2xl font-black text-slate-900">وبلاگ ZeNOxWeb</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          هرچه درباره ساخت سایت حرفه‌ای، سئو و انتخاب تکنولوژی باید بدانی.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {posts.map((post) => (
          <article key={post.id} className="glass card overflow-hidden p-6 transition hover:-translate-y-1">
            <p className="text-[11px] text-slate-500">{faDate(post.publishedAt ?? post.createdAt)}</p>
            <h2 className="mt-2 text-base font-bold text-slate-800">{post.title}</h2>
            <p className="mt-2 line-clamp-3 text-xs leading-6 text-slate-600">{post.excerpt}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {post.keywords.slice(0, 3).map((k) => (
                <span key={k} className="rounded-md bg-cyan-50 px-2 py-0.5 text-[11px] text-cyan-700">
                  #{k}
                </span>
              ))}
            </div>
            <Link href={`/blog/${post.slug}`} className="btn btn-ghost mt-4 w-full">
              مطالعه مقاله
            </Link>
          </article>
        ))}
        {posts.length === 0 && (
          <p className="glass card p-6 text-sm text-slate-600">هنوز مقاله‌ای منتشر نشده است.</p>
        )}
      </div>
    </div>
  );
}
