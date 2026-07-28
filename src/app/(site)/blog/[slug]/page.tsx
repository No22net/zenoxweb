import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/queries";
import { faDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "مقاله یافت نشد" };
  return {
    title: post.seoTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.isPublished) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords.join(", "),
    author: { "@type": "Person", name: post.authorName },
    datePublished: (post.publishedAt ?? post.createdAt).toISOString(),
  };

  return (
    <article className="glass card mx-auto max-w-3xl space-y-6 p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-2">
        <p className="text-xs text-slate-500">
          {faDate(post.publishedAt ?? post.createdAt)} — نویسنده: {post.authorName}
        </p>
        <h1 className="text-2xl font-black leading-10 text-slate-900">{post.title}</h1>
        <p className="text-sm leading-7 text-slate-600">{post.excerpt}</p>
      </div>

      <div className="space-y-4 text-sm leading-9 text-slate-700">
        {post.content.split("\n").map((line, i) =>
          line.trim() ? <p key={i}>{line}</p> : <br key={i} />,
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-white/70 pt-4">
        {post.keywords.map((k) => (
          <span key={k} className="rounded-md bg-cyan-50 px-2 py-1 text-[11px] text-cyan-700">
            #{k}
          </span>
        ))}
      </div>

      <Link href="/blog" className="btn btn-ghost">
        بازگشت به وبلاگ
      </Link>
    </article>
  );
}
