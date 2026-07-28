import type { MetadataRoute } from "next";
import { getActiveTemplates, getPublishedPosts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zenoxweb.ir";
  try {
    const [templates, posts] = await Promise.all([getActiveTemplates(), getPublishedPosts()]);
    return [
      { url: base, priority: 1 },
      { url: `${base}/shop`, priority: 0.9 },
      { url: `${base}/blog`, priority: 0.8 },
      ...templates.map((t) => ({ url: `${base}/templates/${t.slug}`, priority: 0.7 })),
      ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, priority: 0.6 })),
    ];
  } catch {
    return [{ url: base, priority: 1 }];
  }
}
